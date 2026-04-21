const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerEmail: { type: String, required: true },
    order:         { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    orderId:       { type: String, required: true },
    subject:       { type: String, required: true },
    message:       { type: String, required: true },
    status: {
        type: String,
        enum: ['Open', 'In Review', 'Resolved'],
        default: 'Open'
    },
    adminReply: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
