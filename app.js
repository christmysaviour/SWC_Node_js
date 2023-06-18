const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const User = require('./model/User')
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const bodyParser = require('body-parser');
app.use(express.static('public'))
const jwt = require('jsonwebtoken');
const Order = require('./model/Order')
const dbURI ="mongodb+srv://abc123:test123@nodeswc.ofrjsdh.mongodb.net/?retryWrites=true&w=majority"
const foodItems  = require('./data')
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  app.listen(3000, () => {
    console.log('Server started on port 3000');
  });
})
.catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let cartItems = [];
app.get('/',(req,res)=>{
    res.redirect('/home');
})
app.post('/add-to-cart', (req, res) => {
    const { name, price ,image } = req.body;
    const token = req.query.token
    const existingItem = cartItems.find((item) => item.name === name);
  
    if (existingItem) {
      existingItem.quantity++;
      existingItem.totalPrice = existingItem.quantity * parseFloat(existingItem.price)
    } else {
      cartItems.push({
        image,
        name,
        price: parseFloat(price.substring(1)),
        quantity: 1,
        totalPrice: parseFloat(price.substring(1))
      });
    }

    res.status(201).redirect('/main?token='+token);
  });

app.get('/login',(req,res)=>{
    res.render('login');
})
app.get('/signup',(req,res)=>{
    res.render('sign-up');
})

app.get('/main',(req,res)=>{
  const token = req.query.token;
  console.log(token)
  res.set('Authorization', `Bearer ${token}`);
  res.status(201).render('main', { foodItems, cartItems ,token});
});
app.get('/home',(req,res)=>{
    res.status(201).render('home');
})


app.get('/thankyou',(req,res)=>{
  res.status(201).render('thankyou')
})



app.post('/summary', (req, res) => {
  const { cartItems } = req.body;
  
  
  const token = req.query.token; 
  console.log(token)

    const decoded = jwt.verify(token, 'abc123');
    const userId = decoded.userId;
    console.log(decoded,userId)
    console.log(typeof(cartItems))
  
    parsedCartItems = JSON.parse(cartItems);
    const copiedCartItems = JSON.parse(JSON.stringify(parsedCartItems));
    const newOrder = new Order({
      userId,
      items: copiedCartItems
    });
    console.log(newOrder)
    newOrder.save()
      .then((saved) => {
        const orderId = saved._id;
        cartItems.length = 0;
        res.status(201).redirect('/summary?orderId=' + orderId);
      })
      .catch((error) => {
        res.status(500).json({ message: 'Failed to save the order' });
      });
 
});

app.get('/summary',(req,res)=>{
     const token_id = req.query.orderId
     Order.findById({_id:token_id}).then((data)=>res.status(201).render('summary',{token_id,data}))
     .catch(err=>console.log(err))
})



app.post('/signup', (req, res) => {
  const { username, password, email } = req.body;
  const newUser = new User({ username, password, email });
  newUser
    .save()
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
        res.status(401).render('incorrect')
      } else {
       
        if (password === user.password) {
        
        const token = jwt.sign({ userId: user._id }, 'abc123');
         res.header('Authorization', `Bearer ${token}`);
        
          res.redirect('/main?token=' + token)
        } else {
          res.status(401).render('incorrect')
        }
      }
    })
    .catch((error) => {
      res.status(500).json({ message: 'Internal Server Error' });
    });
});

app.get('/order-history',async(req,res)=>{
   let history = []
   const token = req.query.token
   const decoded = jwt.verify(token, 'abc123');
   const userId = decoded.userId;
   console.log(userId)
  await Order.find(
    {
      userId : userId
    }
   ).then(data=>{
    data.forEach((doc)=>{
       doc.items.map((a)=>history.push(a))
    })
   }).catch(err=>console.log(err))
   console.log(history)
   res.render('history',{history})
})


app.get('/profile',(req,res)=>{
  const token = req.query.token
  const decoded = jwt.verify(token, 'abc123');
  const userId = decoded.userId;
  User.findOne({_id:userId}).then(data=>res.render('Profile',{data,userId}))
})

app.post('/profile',(req,res)=>{

  const userId = req.query.userId;
  const {password,new_password} = req.body;
  const token = jwt.sign({ userId }, 'abc123')
  console.log(token)
  if(password===new_password){
   User.findOneAndUpdate(
    {_id:userId},
    { $set: { 'password': password } },
    { new: true })
   .then(data=>res.redirect('/main?token='+token)).catch(err=>console.log(err));
  }
})

app.post('/update-quantity/:itemId', (req, res) => {
  const orderId = req.query.orderId;
  const {itemId} = req.params; 
  const { quantity } = req.body;
  Order.findOneAndUpdate(
    { 'items._id': itemId },
    { $set: { 'items.$.quantity': quantity } },
    { new: true }
  )
    .then(order => {
      res.redirect('/summary?orderId='+orderId);
    })
    .catch(err => {
      console.error('Error updating quantity', err);
      res.status(500).send('Error updating quantity');
    });
});

app.post('/delete-item/:itemId', (req, res) => {
  const { itemId } = req.params;
  const orderId = req.query.orderId;
  Order.findOneAndUpdate(
    { 'items._id': itemId },
    { $pull: { items: { _id: itemId } } },
    { new: true }
  )
    .then(order => {
      res.redirect('/summary?orderId='+orderId); 
    })
    .catch(err => {
      console.error('Error deleting item', err);
      res.status(500).send('Error deleting item');
    });
});


app.get('/logout', (req, res) => {
  res.removeHeader('Authorization'); 
  res.status(200).redirect('/home')
});

