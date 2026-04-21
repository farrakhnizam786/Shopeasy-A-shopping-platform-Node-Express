const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, default: 'customer', enum: ['customer', 'admin', 'superadmin'] },
    createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);