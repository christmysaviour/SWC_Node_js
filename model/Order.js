// Import the necessary modules
const { timeStamp } = require('console');
const mongoose = require('mongoose');

// Define the schema for the user's order history
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    { 
      image:String,
      name: String,
      price: Number,
      quantity: Number,
      totalPrice: Number
    }
  ]
},timeStamp);

// Create the Order model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

