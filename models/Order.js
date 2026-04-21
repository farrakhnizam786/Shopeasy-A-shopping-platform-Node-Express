const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    name:  { type: String, required: true },
    price: { type: Number, required: true },
    qty:   { type: Number, required: true, default: 1 },
    img:   { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId:       { type: String, required: true, unique: true },
    invoiceNum:    { type: String, required: true },
    customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerEmail: { type: String, required: true },
    items:         { type: [orderItemSchema], required: true },
    address: {
        name:     String,
        phone:    String,
        email:    String,
        street:   String,
        city:     String,
        state:    String,
        pin:      String,
        landmark: String
    },
    payment:  { type: String, enum: ['upi','card','wallet','cod'], default: 'upi' },
    subtotal: { type: Number, required: true },
    gst:      { type: Number, required: true },
    total:    { type: Number, required: true },
    status: {
        type: String,
        enum: ['Pending', 'In Process', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
