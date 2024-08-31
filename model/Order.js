const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String, default: uuidv4 }, // Use uuidv4 to generate a default sessionId
    items: [
        { 
            image: String,
            name: String,
            price: Number,
            quantity: Number,
            totalPrice: Number
        }
    ],
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' } 
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
