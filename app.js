const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./model/User');
const Order = require('./model/Order');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session'); 
const foodItems = require('./data');
require('dotenv').config();
const stripe = require('stripe')(process.env.YOUR_SECRET_STRIPE_KEY);

const app = express();
const dbURI = process.env.DB_URI;
const port = process.env.PORT || 4000;
const sessionSecret = process.env.SESSION_SECRET;
const jwtSecret = process.env.JWT_SECRET;
const baseURL = process.env.BASE_URL;

app.use(cookieParser());

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.redirect('/home');
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
                return res.status(401).json({ message: 'Invalid token' });
            } else {
                return res.redirect('/login');
            }
        }
        req.userId = decoded.userId;
        next();
    });
};

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
    });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.status(201).redirect('/home');
});



const { v4: uuidv4 } = require('uuid'); 


app.post('/create-checkout-session', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const sessionId = uuidv4(); // Generate unique session ID
        const cartItems = req.body.cartItems;

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).send('Invalid cart items');
        }

        const newOrder = new Order({
            userId,
            sessionId,
            items: cartItems.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                totalPrice: item.quantity * item.price
            })),
            status: 'pending'
        });

        await newOrder.save();
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: cartItems.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        images: [item.image],
                    },
                    unit_amount: item.price * 100, 
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${baseURL}/thankyou?orderId=${newOrder._id}`,
            cancel_url: `${baseURL}/cancel`,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send('Internal Server Error');
    }
});

  

app.post('/add-to-cart', verifyToken, (req, res) => {
    const { name, price, image } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    const existingItem = req.session.cart.find((item) => item.name === name);

    if (existingItem) {
        existingItem.quantity++;
        existingItem.totalPrice = existingItem.quantity * parseFloat(existingItem.price);
    } else {
        req.session.cart.push({
            image,
            name,
            price: parseFloat(price.substring(1)),
            quantity: 1,
            totalPrice: parseFloat(price.substring(1))
        });
    }

    res.json({ success: true, cartItems: req.session.cart });
});

app.get('/login', (req, res) => {
    res.status(201).render('login');
});

app.get('/signup', (req, res) => {
    res.status(201).render('sign-up');
});

app.get('/main', verifyToken, (req, res) => {
    const token = req.cookies.token;
    res.render('main', {
        foodItems: foodItems,
        cartItems: req.session.cart || [],
        token: token
    });
});

app.get('/home', (req, res) => {
    res.status(201).render('home');
});


app.get('/profile', verifyToken, (req, res) => {
    const userId = req.userId;
    User.findOne({ _id: userId }).then(data => res.render('Profile', { data, userId }));
});

app.post('/profile', verifyToken, (req, res) => {
    const userId = req.userId;
    const { password, new_password } = req.body;

    if (password === new_password) {
        User.findOneAndUpdate(
            { _id: userId },
            { $set: { 'password': password } },
            { new: true }
        ).then(() => res.redirect('/main')).catch(err => console.log(err));
    }
});



app.get('/thankyou', async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).send('Order not found');
        }

        order.status = 'completed';
        await order.save();
        req.session.cart = [];
        res.render('thankyou', { order });
    } catch (error) {
        console.error('Error completing order:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/order-history', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const completedOrders = await Order.find({ userId, status: 'completed' }).sort({ date: -1 });
        res.render('history', { history: completedOrders });
    } catch (error) {
        console.error('Error retrieving order history:', error);
        res.status(500).send('Error retrieving order history');
    }
});



app.post('/summary', verifyToken, async (req, res) => {
    const userId = req.userId;
    const copiedCartItems = req.session.cart || [];
    const sessionId = req.sessionID;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        await Order.deleteMany({ userId, sessionId }).session(session);

        const newOrder = new Order({
            userId,
            items: copiedCartItems,
            sessionId,
            date: new Date(),
            status: 'pending'
        });

        await newOrder.save({ session });
        await session.commitTransaction();
        session.endSession();

        req.session.cart = [];
        res.redirect(`/summary?orderId=${newOrder._id}`);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error saving order:', error);
        res.status(500).send('Error processing order');
    }
});

app.get('/summary', verifyToken, async (req, res) => {
    const token_id = req.query.orderId;
    try {
        const order = await Order.findById(token_id);
        res.render('summary', { token_id, data: order });
    } catch (err) {
        console.error('Error retrieving order:', err);
        res.status(500).send('Error retrieving order');
    }
});


app.post('/signup', (req, res) => {
    const { username, password, email } = req.body;
    const newUser = new User({ username, password, email });
    newUser.save()
        .then(() => {
            res.status(200).redirect('home');
        })
        .catch((error) => {
            res.status(500).json({ message: 'Failed to create user' });
        });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username })
        .then((user) => {
            if (!user) {
                res.status(401).render('incorrect');
            } else {
                if (password === user.password) {
                    const token = jwt.sign({ userId: user._id }, jwtSecret);
                    res.cookie('token', token, { httpOnly: true });
                    res.redirect('/main');
                } else {
                    res.status(401).render('incorrect');
                }
            }
        })
        .catch((error) => {
            res.status(500).json({ message: 'Internal Server Error' });
        });
});

app.post('/update-quantity/:itemId', verifyToken, async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    try {
        const order = await Order.findOneAndUpdate(
            { 'items._id': itemId },
            { $set: { 'items.$.quantity': quantity } },
            { new: true }
        );

        if (order) {
            req.session.cart = order.items;
            res.redirect('/summary?orderId=' + order._id);
        } else {
            res.status(404).send('Item not found');
        }
    } catch (err) {
        console.error('Error updating quantity', err);
        res.status(500).send('Error updating quantity');
    }
});

app.post('/delete-item/:itemId', verifyToken, (req, res) => {
    const { itemId } = req.params;
    const orderId = req.query.orderId;

    Order.findOneAndUpdate(
        { 'items._id': itemId },
        { $pull: { items: { _id: itemId } } },
        { new: true }
    )
    .then(order => {
        req.session.cart = order.items;
        res.redirect('/summary?orderId=' + orderId);
    })
    .catch(err => {
        console.error('Error deleting item', err);
        res.status(500).send('Error deleting item');
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    req.session.cart = [];
    res.status(200).redirect('/home');
});






