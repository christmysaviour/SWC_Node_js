const express = require('express');
const app = express();

const path = require('path');
const mongoose = require('mongoose');
const User = require('./model/User');
const Order = require('./model/Order');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const foodItems = require('./data');
app.use(cookieParser());
const dbURI = "mongodb+srv://abc123:test123@cluster0.p6j9x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
            return res.redirect('/home');
    }

    jwt.verify(token, 'abc123', (err, decoded) => {
        if (err) {
            if (req.headers['x-requested-with'] === 'XMLHttpRequest') {
                // For AJAX requests, send a JSON response
                return res.status(401).json({ message: 'Invalid token' });
            } else {
                // For regular requests, redirect to login page
                return res.redirect('/login');
            }
        }
        req.userId = decoded.userId;
        next();
    });
};





mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(3000, () => {
            console.log('Server started on port 3000');
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

let cartItems = [];

app.get('/', (req, res) => {
    res.status(201).redirect('/home');
});

app.post('/add-to-cart', verifyToken, (req, res) => {
    const { name, price, image } = req.body;
    const existingItem = cartItems.find((item) => item.name === name);

    if (existingItem) {
        existingItem.quantity++;
        existingItem.totalPrice = existingItem.quantity * parseFloat(existingItem.price);
    } else {
        cartItems.push({
            image,
            name,
            price: parseFloat(price.substring(1)),
            quantity: 1,
            totalPrice: parseFloat(price.substring(1))
        });
    }

    // Return JSON response with updated cart items
    res.json({ success: true, cartItems: cartItems });
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
        cartItems: cartItems,
        token: token
    });
});

app.get('/home', (req, res) => {
    res.status(201).render('home');
});

app.get('/thankyou', (req, res) => {
    cartItems.length = 0;
    res.status(201).render('thankyou');
});

const { v4: uuidv4 } = require('uuid'); // Import UUID

app.post('/summary', verifyToken, async (req, res) => {
    const userId = req.userId;
    const copiedCartItems = JSON.parse(req.body.cartItems);

    // Create a new order with a unique sessionId
    const newOrder = new Order({
        userId,
        items: copiedCartItems,
        sessionId: uuidv4(), // Generate a new sessionId
        date: new Date()
    });

    await newOrder.save();
    res.redirect(`/summary?orderId=${newOrder._id}`);
});



app.get('/summary', verifyToken, (req, res) => {
    const token_id = req.query.orderId;
    Order.findById({ _id: token_id }).then((data) =>
    res.status(201).render('summary', { token_id, data })
    )
        .catch(err => console.log(err));
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
                  const token = jwt.sign({ userId: user._id }, 'abc123');
                  // Set the token as a cookie
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


app.get('/order-history', verifyToken, async (req, res) => {
    const orders = await Order.find({ userId: req.userId }).sort({ date: -1 });

    const groupedOrders = orders.reduce((acc, order) => {
        if (!acc[order.sessionId]) {
            acc[order.sessionId] = {
                date: order.date,
                items: []
            };
        }
        acc[order.sessionId].items = acc[order.sessionId].items.concat(order.items);
        return acc;
    }, {});

    // Convert to array for rendering
    const history = Object.keys(groupedOrders).map(sessionId => ({
        sessionId,
        ...groupedOrders[sessionId]
    }));

    console.log(history);
    res.render('history', { history });
});


app.get('/profile', verifyToken, (req, res) => {
    const userId = req.userId;
    User.findOne({ _id: userId }).then(data => res.render('Profile', { data, userId }));
});

app.post('/profile', verifyToken, (req, res) => {
    const userId = req.userId;
    const { password, new_password } = req.body;
    const token = jwt.sign({ userId }, 'abc123');
    console.log(token);

    if (password === new_password) {
        User.findOneAndUpdate(
            { _id: userId },
            { $set: { 'password': password } },
            { new: true }
        ).then(data => res.redirect('/main')).catch(err => console.log(err));
    }
});

app.post('/update-quantity/:itemId', verifyToken, (req, res) => {
    const orderId = req.query.orderId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    Order.findOneAndUpdate(
        { 'items._id': itemId },
        { $set: { 'items.$.quantity': quantity } },
        { new: true }
    )
        .then(order => {
            res.redirect('/summary?orderId=' + orderId);
        })
        .catch(err => {
            console.error('Error updating quantity', err);
            res.status(500).send('Error updating quantity');
        });
});

app.get('/check-auth', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Authenticated' });
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
            res.redirect('/summary?orderId=' + orderId);
        })
        .catch(err => {
            console.error('Error deleting item', err);
            res.status(500).send('Error deleting item');
        });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).redirect('/home');
});
