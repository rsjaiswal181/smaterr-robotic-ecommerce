const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use('/api', apiLimiter);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

// Schemas
const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, default: 'customer' }, isEmailVerified: { type: Boolean, default: false },
  phone: String, avatar: String, wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, image: String }, { timestamps: true });
const BrandSchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, logo: String }, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, sku: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  images: [String], description: String,
  specifications: [{ key: String, value: String }],
  price: Number, salePrice: Number, stock: { type: Number, default: 0 },
  minOrderQty: { type: Number, default: 1 }, tags: [String],
  isFeatured: { type: Boolean, default: false }, isTrending: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false }, isBestSeller: { type: Boolean, default: false },
  status: { type: String, default: 'active' }, averageRating: { type: Number, default: 0 },
}, { timestamps: true });

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number, price: Number }],
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, name: String, quantity: Number, price: Number, image: String }],
  shippingAddress: { name: String, phone: String, address: String, city: String, state: String, zip: String, country: String },
  paymentMethod: String, subtotal: Number, tax: Number, shippingCost: Number, total: Number,
  status: { type: String, default: 'pending' }, paymentStatus: { type: String, default: 'pending' },
  trackingNumber: String,
}, { timestamps: true });

const CouponSchema = new mongoose.Schema({
  code: { type: String, unique: true }, discountType: String, discountValue: Number,
  minPurchase: Number, maxDiscount: Number, expiresAt: Date, usageLimit: Number,
  usedCount: { type: Number, default: 0 }, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  rating: Number, comment: String,
}, { timestamps: true });

const InquirySchema = new mongoose.Schema({
  name: String, email: String, phone: String, subject: String, message: String,
  status: { type: String, default: 'pending' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);

function signToken(id) { return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || 'secret', { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }); }
function signRefreshToken(id) { return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'secret', { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }); }
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
  try { req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret'); next(); } catch { return res.status(401).json({ success: false, message: 'Token expired' }); }
}

// Health
app.get('/health', (_req, res) => res.json({ success: true, message: 'API is healthy' }));

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = signToken(user._id);
    res.status(201).json({ success: true, data: { accessToken: token, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, data: { accessToken: token, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    await connectDB();
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    const newAccessToken = signToken(user._id);
    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch { res.status(401).json({ success: false, message: 'Invalid refresh token' }); }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    await connectDB();
    const { page = 1, limit = 12, category, brand, search, sort, minPrice, maxPrice, featured, trending, newArrival, bestSeller } = req.query;
    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
    if (featured === 'true') filter.isFeatured = true;
    if (trending === 'true') filter.isTrending = true;
    if (newArrival === 'true') filter.isNewArrival = true;
    if (bestSeller === 'true') filter.isBestSeller = true;
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'name') sortObj = { name: 1 };
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).populate('category', 'name slug').populate('brand', 'name slug').sort(sortObj).skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    res.json({ success: true, data: products, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/products/:idOrSlug', async (req, res) => {
  try {
    await connectDB();
    const product = await Product.findOne({ $or: [{ slug: req.params.idOrSlug }, { _id: mongoose.Types.ObjectId.isValid(req.params.idOrSlug) ? req.params.idOrSlug : undefined }] }).populate('category', 'name slug').populate('brand', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Categories
app.get('/api/categories', async (req, res) => {
  try { await connectDB(); const cats = await Category.find().sort({ name: 1 }); res.json({ success: true, data: cats }); } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Brands
app.get('/api/brands', async (req, res) => {
  try { await connectDB(); const brands = await Brand.find().sort({ name: 1 }); res.json({ success: true, data: brands }); } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Cart
app.get('/api/cart', authMiddleware, async (req, res) => {
  try { await connectDB(); let cart = await Cart.findOne({ user: req.user.id }).populate('items.product'); if (!cart) cart = await Cart.create({ user: req.user.id, items: [] }); res.json({ success: true, data: cart }); } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/cart', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) cart.items[idx].quantity += quantity;
    else cart.items.push({ product: productId, quantity, price: product.salePrice || product.price });
    await cart.save();
    cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.json({ success: true, data: cart });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Orders
app.get('/api/orders', authMiddleware, async (req, res) => {
  try { await connectDB(); const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }); res.json({ success: true, data: orders }); } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });
    const items = cart.items.map(i => ({ product: i.product._id, name: i.product.name, quantity: i.quantity, price: i.price, image: i.product.images?.[0] || '' }));
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = await Order.create({ user: req.user.id, items, shippingAddress: req.body.shippingAddress, paymentMethod: req.body.paymentMethod || 'cod', subtotal, tax: 0, shippingCost: 0, total: subtotal, ...req.body });
    cart.items = [];
    await cart.save();
    res.status(201).json({ success: true, data: order });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Coupons
app.get('/api/coupons/validate/:code', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon' });
    res.json({ success: true, data: coupon });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Reviews
app.get('/api/reviews/:productId', async (req, res) => {
  try { await connectDB(); const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name avatar').sort({ createdAt: -1 }); res.json({ success: true, data: reviews }); } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Inquiries
app.post('/api/inquiries', async (req, res) => {
  try { await connectDB(); const inquiry = await Inquiry.create(req.body); res.status(201).json({ success: true, data: inquiry }); } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Users
app.get('/api/users', authMiddleware, async (req, res) => {
  try { await connectDB(); const users = await User.find().select('-password').sort({ createdAt: -1 }); res.json({ success: true, data: users }); } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Dashboard
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]);
    res.json({ success: true, data: { totalProducts, totalOrders, totalUsers, totalRevenue: totalRevenue[0]?.total || 0 } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Catch-all
app.use('*', (_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

module.exports = async (req, res) => {
  return serverless(app)(req, res);
};
