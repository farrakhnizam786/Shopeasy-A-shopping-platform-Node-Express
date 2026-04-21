require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Models
const User      = require('./models/User');
const Product   = require('./models/Product');
const Order     = require('./models/Order');
const Feedback  = require('./models/Feedback');
const Complaint = require('./models/Complaint');

const app = express();

// --- Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

// --- CSP ---
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https: blob:; connect-src 'self';"
    );
    next();
});

// --- MongoDB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to ShopEasy Database"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ─── HELPERS ───────────────────────────────────
function genOrderId()   { return 'SE' + Date.now().toString().slice(-8).toUpperCase(); }
function genInvoiceNum(){ return 'INV-' + new Date().getFullYear() + '-' + Math.floor(Math.random()*90000+10000); }

// ─── AUTH MIDDLEWARE ────────────────────────────

const auth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/auth-choice');
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
    catch (err) { res.clearCookie('token').redirect('/auth-choice'); }
};

const adminAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/admin');
    try {
        const v = jwt.verify(token, process.env.JWT_SECRET);
        if (v.role !== 'admin') return res.redirect('/admin');
        req.user = v; next();
    } catch (err) { res.clearCookie('token').redirect('/admin'); }
};

const superAdminAuth = (req, res, next) => {
    const token = req.cookies.satoken;
    if (!token) return res.redirect('/superadmin/admin');
    try {
        const v = jwt.verify(token, process.env.JWT_SECRET);
        if (v.role !== 'superadmin') return res.redirect('/superadmin/admin');
        req.user = v; next();
    } catch (err) { res.clearCookie('satoken').redirect('/superadmin/admin'); }
};

// ─── PUBLIC ROUTES ──────────────────────────────

// Shop – paginated, with feedbacks
app.get('/', async (req, res) => {
    try {
        const page     = parseInt(req.query.page) || 1;
        const perPage  = 20;
        const total    = await Product.countDocuments();
        const products = await Product.find().skip((page-1)*perPage).limit(perPage);
        const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(6);

        let user = null;
        const token = req.cookies.token;
        if (token) {
            try {
                const v = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(v.id).select('-password');
            } catch (e) {}
        }
        res.render('shop', { products, user, feedbacks, page, totalPages: Math.ceil(total/perPage), total });
    } catch (err) {
        res.status(500).send("Error loading shop: " + err.message);
    }
});

app.get('/auth-choice', (req, res) => res.render('index'));
app.get('/login/customer', (req, res) => res.render('customer-login', { error: null }));

app.get('/admin', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const v = jwt.verify(token, process.env.JWT_SECRET);
            if (v.role === 'admin') return res.redirect('/dashboard');
        } catch (e) {}
    }
    res.render('admin-login', { error: null });
});

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

app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashed, role: 'customer' });
        res.redirect('/login/customer');
    } catch (err) {
        res.status(500).send("Registration failed. Email may already be in use.");
    }
});

// ─── LOGIN POST ROUTES ──────────────────────────

app.post('/login/customer', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, role: 'customer' });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true });
            return res.redirect('/'); // Go to shop — user can navigate to profile themselves
        }
        res.render('customer-login', { error: 'Invalid email or password.' });
    } catch (err) {
        res.status(500).send("Login error");
    }
});

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

app.get('/superadmin/admin/login', (req, res) => res.redirect('/superadmin/admin'));
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

// ─── CUSTOMER ROUTES ────────────────────────────

// My Account (profile + orders)
app.get('/my-account', auth, async (req, res) => {
    if (req.user.role !== 'customer') return res.redirect('/auth-choice');
    const user   = await User.findById(req.user.id);
    const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 });
    const complaints = await Complaint.find({ customer: req.user.id });
    res.render('customer-dashboard', { user, orders, complaints, query: req.query });
});

// Checkout page (client-side reads sessionStorage cart)
app.get('/checkout', auth, (req, res) => {
    if (req.user.role !== 'customer') return res.redirect('/auth-choice');
    res.render('checkout');
});

// Place order (POST from checkout)
app.post('/place-order', auth, async (req, res) => {
    try {
        if (req.user.role !== 'customer') return res.status(403).json({ error: 'Not a customer' });

        const { items, address, payment, subtotal, gst, total } = req.body;
        const parsedItems   = JSON.parse(items);
        const parsedAddress = JSON.parse(address);

        // Fetch actual email from DB (JWT only carries id + role)
        const dbUser = await User.findById(req.user.id).select('email');

        const orderId    = genOrderId();
        const invoiceNum = genInvoiceNum();

        const order = await Order.create({
            orderId, invoiceNum,
            customer:      req.user.id,
            customerEmail: dbUser ? dbUser.email : parsedAddress.email,
            items:     parsedItems,
            address:   parsedAddress,
            payment,
            subtotal: Number(subtotal),
            gst:      Number(gst),
            total:    Number(total),
            status:   'Pending'
        });

        res.json({ success: true, orderId: order._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Order success / bill
app.get('/order-success/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.customer.toString() !== req.user.id) return res.redirect('/my-account');
        res.render('order-success', { order });
    } catch (err) {
        res.redirect('/my-account');
    }
});

// Invoice view (same as order-success, different route for old orders)
app.get('/my-orders/:id/invoice', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.customer.toString() !== req.user.id) return res.redirect('/my-account');
        res.render('order-success', { order });
    } catch (err) {
        res.redirect('/my-account');
    }
});

// Raise complaint (POST)
app.post('/orders/:id/raise-issue', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.customer.toString() !== req.user.id) return res.redirect('/my-account');
        const { subject, message } = req.body;
        await Complaint.create({
            customer:      req.user.id,
            customerEmail: order.customerEmail,
            order:         order._id,
            orderId:       order.orderId,
            subject, message
        });
        res.redirect('/my-account?complaint=raised');
    } catch (err) {
        res.redirect('/my-account?complaint=error');
    }
});

// Submit feedback
app.post('/feedback', auth, async (req, res) => {
    try {
        if (req.user.role !== 'customer') return res.redirect('/');
        const user = await User.findById(req.user.id);
        const { rating, message } = req.body;
        if (!rating || !message) return res.redirect('/?feedback=missing');
        await Feedback.create({
            customer:      user._id,
            customerEmail: user.email,
            customerName:  user.email.split('@')[0],
            rating:        Number(rating),
            message
        });
        res.redirect('/?feedback=thanks');
    } catch (err) {
        res.redirect('/?feedback=error');
    }
});

// ─── ADMIN ROUTES ───────────────────────────────

app.get('/dashboard', adminAuth, async (req, res) => {
    const products = await Product.find();

    // Today's orders
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayOrders = await Order.find({ createdAt: { $gte: todayStart } });
    const todayIncome = todayOrders.reduce((s, o) => s + o.total, 0);

    // All orders for admin
    const allOrders = await Order.find().sort({ createdAt: -1 }).limit(50);
    // All complaints
    const complaints = await Complaint.find().sort({ createdAt: -1 });

    res.render('dashboard', { products, todayOrders: todayOrders.length, todayIncome, allOrders, complaints });
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

// Admin: update order status
app.post('/admin/orders/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        await Order.findByIdAndUpdate(req.params.id, { status });
        res.redirect('/dashboard#orders');
    } catch (err) {
        res.redirect('/dashboard');
    }
});

// Admin: reply to complaint
app.post('/admin/complaints/:id/reply', adminAuth, async (req, res) => {
    try {
        const { reply, status } = req.body;
        await Complaint.findByIdAndUpdate(req.params.id, { adminReply: reply, status: status || 'In Review' });
        res.redirect('/dashboard#complaints');
    } catch (err) {
        res.redirect('/dashboard');
    }
});

// ─── SUPER ADMIN ROUTES ─────────────────────────

app.get('/superadmin/dashboard', superAdminAuth, async (req, res) => {
    try {
        const adminUsers   = await User.find({ role: 'admin' }).select('-password');
        const products     = await Product.find();
        const customers    = await User.countDocuments({ role: 'customer' });
        const totalValue   = products.reduce((s, p) => s + (Number(p.price) || 0), 0);

        // Order stats
        const todayStart   = new Date(); todayStart.setHours(0,0,0,0);
        const todayOrders  = await Order.find({ createdAt: { $gte: todayStart } });
        const todayIncome  = todayOrders.reduce((s, o) => s + o.total, 0);
        const totalOrders  = await Order.countDocuments();
        const totalRevenue = (await Order.aggregate([{ $group: { _id: null, sum: { $sum: '$total' } } }]))[0]?.sum || 0;

        res.render('superadmin-dashboard', {
            adminUsers,
            productCount: products.length,
            customerCount: customers,
            totalValue,
            categories: [...new Set(products.map(p => p.category).filter(Boolean))].length,
            todayOrders: todayOrders.length,
            todayIncome,
            totalOrders,
            totalRevenue
        });
    } catch (err) {
        res.status(500).send("Super Admin Dashboard Error: " + err.message);
    }
});

app.post('/superadmin/create-admin', superAdminAuth, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.redirect('/superadmin/dashboard?error=missing');
        const exists = await User.findOne({ email });
        if (exists) return res.redirect('/superadmin/dashboard?error=exists');
        const hashed = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashed, role: 'admin' });
        res.redirect('/superadmin/dashboard?success=created');
    } catch (err) {
        res.redirect('/superadmin/dashboard?error=failed');
    }
});

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

// ─── LOGOUT ─────────────────────────────────────

app.get('/logout',            (req, res) => res.clearCookie('token').redirect('/auth-choice'));
app.get('/superadmin/logout', (req, res) => res.clearCookie('satoken').redirect('/superadmin/admin'));

// ─── UTILITY ────────────────────────────────────

app.get('/setup-superadmin', async (req, res) => {
    try {
        const hashed = await bcrypt.hash('123@@123', 10);
        await User.findOneAndUpdate(
            { email: 'Nizam1@gmail.com' },
            { $set: { password: hashed, role: 'superadmin' } },
            { upsert: true, new: true }
        );
        res.send('<h2>✅ Super Admin ready!</h2><p>Email: <b>Nizam1@gmail.com</b></p><p>Password: <b>123@@123</b></p><a href="/superadmin/admin">→ Login</a>');
    } catch (e) {
        res.send("❌ Error: " + e.message);
    }
});

// API
app.get('/api/feedbacks', async (req, res) => {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(10);
    res.json(feedbacks);
});

// ─── START SERVER ───────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ShopEasy live on http://localhost:${PORT}`));