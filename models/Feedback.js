const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerEmail: { type: String, required: true },
    customerName:  { type: String, required: true },
    rating:        { type: Number, required: true, min: 1, max: 5 },
    message:       { type: String, required: true, maxlength: 500 }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
