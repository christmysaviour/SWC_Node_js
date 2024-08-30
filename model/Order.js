const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String, default: uuidv4 }, // Add default value
    items: [
        { 
            image: String,
            name: String,
            price: Number,
            quantity: Number,
            totalPrice: Number
        }
    ],
    date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
