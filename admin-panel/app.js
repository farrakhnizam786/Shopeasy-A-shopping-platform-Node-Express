require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Models
const User = require('./models/User');
const Product = require('./models/Product');

const app = express();

// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

// --- Content Security Policy ---
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https: blob:; connect-src 'self';"
    );
    next();
});

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to ShopEasy Database"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ─────────────────────────────────────────────
//  AUTH MIDDLEWARE
// ─────────────────────────────────────────────

// Generic: any logged-in user
const auth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/auth-choice');
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.clearCookie('token').redirect('/auth-choice');
    }
};

// Admin only (role = 'admin')
const adminAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/admin');
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (verified.role !== 'admin') return res.redirect('/admin');
        req.user = verified;
        next();
    } catch (err) {
        res.clearCookie('token').redirect('/admin');
    }
};

// Super Admin only (role = 'superadmin')
const superAdminAuth = (req, res, next) => {
    const token = req.cookies.satoken;
    if (!token) return res.redirect('/superadmin/admin');
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (verified.role !== 'superadmin') return res.redirect('/superadmin/admin');
        req.user = verified;
        next();
    } catch (err) {
        res.clearCookie('satoken').redirect('/superadmin/admin');
    }
};

// ─────────────────────────────────────────────
//  PUBLIC ROUTES
// ─────────────────────────────────────────────

// Home Page (Shop) – customers only, no admin portal links
app.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        let user = null;
        const token = req.cookies.token;
        if (token) {
            try {
                const verified = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(verified.id).select('-password');
            } catch (e) { /* token invalid */ }
        }
        res.render('shop', { products, user });
    } catch (err) {
        res.status(500).send("Error loading shop");
    }
});

// Auth choice page – customers only (admin links removed from UI)
app.get('/auth-choice', (req, res) => {
    res.render('index');
});

// Customer login page
app.get('/login/customer', (req, res) => {
    res.render('customer-login', { error: null });
});

// ─── ADMIN login via URL only: localhost/admin ───
app.get('/admin', (req, res) => {
    // If already logged in as admin, go to dashboard
    const token = req.cookies.token;
    if (token) {
        try {
            const v = jwt.verify(token, process.env.JWT_SECRET);
            if (v.role === 'admin') return res.redirect('/dashboard');
        } catch (e) {}
    }
    res.render('admin-login', { error: null });
});

// ─── SUPER ADMIN login via URL only: localhost/superadmin/admin ───
app.get('/superadmin/admin', (req, res) => {
    const token = req.cookies.satoken;
    if (token) {
        try {
            const v = jwt.verify(token, process.env.JWT_SECRET);
            if (v.role === 'superadmin') return res.redirect('/superadmin/dashboard');
        } catch (e) {}
    }
    res.render('superadmin-login', { error: null });
});

// Registration (customers only)
app.get('/register', (req, res) => res.render('register'));

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashedPassword, role: 'customer' });
        res.redirect('/login/customer');
    } catch (err) {
        res.status(500).send("Registration failed. The email may already be in use.");
    }
});

// ─────────────────────────────────────────────
//  LOGIN POST ROUTES
// ─────────────────────────────────────────────

// Customer login
app.post('/login/customer', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, role: 'customer' });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true });
            return res.redirect('/my-account');
        }
        res.render('customer-login', { error: 'Invalid email or password.' });
    } catch (err) {
        res.status(500).send("Login error");
    }
});

// Admin login (POST from /admin page)
app.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, role: 'admin' });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '4h' });
            res.cookie('token', token, { httpOnly: true });
            return res.redirect('/dashboard');
        }
        res.render('admin-login', { error: 'Invalid admin credentials.' });
    } catch (err) {
        res.status(500).send("Login error");
    }
});

// Guard: GET on login action URL → redirect to login page
app.get('/superadmin/admin/login', (req, res) => res.redirect('/superadmin/admin'));

// Super Admin login (POST from /superadmin/admin page)
app.post('/superadmin/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, role: 'superadmin' });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '4h' });
            res.cookie('satoken', token, { httpOnly: true });
            return res.redirect('/superadmin/dashboard');
        }
        res.render('superadmin-login', { error: 'Invalid Super Admin credentials.' });
    } catch (err) {
        res.status(500).send("Login error");
    }
});

// ─────────────────────────────────────────────
//  CUSTOMER ROUTES
// ─────────────────────────────────────────────

app.get('/my-account', auth, async (req, res) => {
    if (req.user.role !== 'customer') return res.redirect('/auth-choice');
    const user = await User.findById(req.user.id);
    res.render('customer-dashboard', { user });
});

// ─────────────────────────────────────────────
//  ADMIN ROUTES  (accessible via /admin URL)
// ─────────────────────────────────────────────

app.get('/dashboard', adminAuth, async (req, res) => {
    const products = await Product.find();
    res.render('dashboard', { products });
});

app.post('/add-product', adminAuth, async (req, res) => {
    const { name, price, description, image, category } = req.body;
    await Product.create({ name, price, description, image, category });
    res.redirect('/dashboard');
});

app.post('/edit-product/:id', adminAuth, async (req, res) => {
    const { name, price, description, image, category } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { name, price, description, image, category });
    res.redirect('/dashboard');
});

app.post('/delete-product/:id', adminAuth, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
});

// ─────────────────────────────────────────────
//  SUPER ADMIN ROUTES
// ─────────────────────────────────────────────

// Super Admin Dashboard
app.get('/superadmin/dashboard', superAdminAuth, async (req, res) => {
    try {
        const adminUsers  = await User.find({ role: 'admin' }).select('-password');
        const products    = await Product.find();
        const customers   = await User.countDocuments({ role: 'customer' });
        const totalValue  = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

        res.render('superadmin-dashboard', {
            adminUsers,
            productCount: products.length,
            customerCount: customers,
            totalValue,
            categories: [...new Set(products.map(p => p.category).filter(Boolean))].length
        });
    } catch (err) {
        res.status(500).send("Super Admin Dashboard Error");
    }
});

// Create a new admin
app.post('/superadmin/create-admin', superAdminAuth, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.redirect('/superadmin/dashboard?error=missing');
        const exists = await User.findOne({ email });
        if (exists) return res.redirect('/superadmin/dashboard?error=exists');
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashedPassword, role: 'admin' });
        res.redirect('/superadmin/dashboard?success=created');
    } catch (err) {
        res.redirect('/superadmin/dashboard?error=failed');
    }
});

// Delete an admin
app.post('/superadmin/delete-admin/:id', superAdminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'admin') return res.redirect('/superadmin/dashboard?error=notfound');
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/superadmin/dashboard?success=deleted');
    } catch (err) {
        res.redirect('/superadmin/dashboard?error=failed');
    }
});

// ─────────────────────────────────────────────
//  LOGOUT ROUTES
// ─────────────────────────────────────────────

// Customer / Admin logout
app.get('/logout', (req, res) => {
    res.clearCookie('token').redirect('/auth-choice');
});

// Super Admin logout
app.get('/superadmin/logout', (req, res) => {
    res.clearCookie('satoken').redirect('/superadmin/admin');
});

// ─────────────────────────────────────────────
//  UTILITY / SETUP
// ─────────────────────────────────────────────

// One-time setup: force-create OR update the Super Admin account
app.get('/setup-superadmin', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash('123@@123', 10);
        await User.findOneAndUpdate(
            { email: 'Nizam1@gmail.com' },
            { $set: { password: hashedPassword, role: 'superadmin' } },
            { upsert: true, new: true }
        );
        res.send(`
            <h2>✅ Super Admin account is ready!</h2>
            <p>Email: <b>Nizam1@gmail.com</b></p>
            <p>Password: <b>123@@123</b></p>
            <br>
            <a href="/superadmin/admin" style="font-size:1.1rem;">→ Login to Super Admin Panel</a>
        `);
    } catch (e) {
        res.send("❌ Error: " + e.message);
    }
});

// Cart API
app.post('/api/cart/add', auth, async (req, res) => {
    try {
        res.json({ success: true, message: "Item added to cart!" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ShopEasy live on http://localhost:${PORT}`));