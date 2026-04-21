const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    price:       { type: Number, required: true },
    image:       { type: String, default: '' },
    description: { type: String, default: '' },
    category:    {
        type: String,
        default: 'Uncategorized',
        enum: ['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty', 'Books', 'Food & Drinks', 'Toys', 'Uncategorized']
    }
});

module.exports = mongoose.model('Product', productSchema);