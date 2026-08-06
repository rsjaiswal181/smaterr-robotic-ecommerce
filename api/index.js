const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is healthy', env: { mongo: !!process.env.MONGO_URI, jwt: !!process.env.JWT_ACCESS_SECRET } });
});

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set');
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

// ---- Product Schemas ----
const CategorySchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true } }, { timestamps: true });
const BrandSchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true } }, { timestamps: true });
const ProductSchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, sku: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  images: [String], description: String,
  specifications: [{ key: String, value: String }],
  price: Number, salePrice: Number, stock: Number, minOrderQty: { type: Number, default: 1 },
  tags: [String], isFeatured: Boolean, isTrending: Boolean, isNewArrival: Boolean,
  isBestSeller: Boolean, status: { type: String, default: 'active' }, averageRating: { type: Number, default: 0 },
}, { timestamps: true });
const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, default: 'customer' }, isEmailVerified: { type: Boolean, default: false },
  phone: String, avatar: String, wishlist: [mongoose.Schema.Types.ObjectId],
}, { timestamps: true });
const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number, price: Number }],
}, { timestamps: true });
const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ product: mongoose.Schema.Types.ObjectId, name: String, quantity: Number, price: Number, image: String }],
  shippingAddress: { name: String, phone: String, address: String, city: String, state: String, zip: String, country: String },
  paymentMethod: String, subtotal: Number, tax: Number, shippingCost: Number, total: Number,
  status: { type: String, default: 'pending' }, paymentStatus: { type: String, default: 'pending' },
  trackingNumber: String,
}, { timestamps: true });
const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  rating: Number, comment: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function auth(req, res, next) {
  const t = req.headers.authorization?.split(' ')[1];
  if (!t) return res.status(401).json({ success: false, message: 'No token' });
  try { req.user = jwt.verify(t, process.env.JWT_ACCESS_SECRET || 's'); next(); } catch { return res.status(401).json({ success: false, message: 'Invalid token' }); }
}

// ---- Auth Routes ----
app.post('/api/auth/register', async (req, res) => {
  try { await connectDB();
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Email exists' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    const token = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET || 's', { expiresIn: '15m' });
    res.status(201).json({ success: true, data: { accessToken: token, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try { await connectDB();
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET || 's', { expiresIn: '15m' });
    const rt = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 's', { expiresIn: '7d' });
    res.cookie('refreshToken', rt, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 604800000 });
    res.json({ success: true, data: { accessToken: token, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/auth/refresh', async (req, res) => {
  try { await connectDB();
    const t = req.cookies?.refreshToken;
    if (!t) return res.status(401).json({ success: false, message: 'No refresh token' });
    const d = jwt.verify(t, process.env.JWT_REFRESH_SECRET || 's');
    const user = await User.findById(d.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { accessToken: jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET || 's', { expiresIn: '15m' }) } });
  } catch { res.status(401).json({ success: false, message: 'Invalid refresh token' }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try { await connectDB(); const u = await User.findById(req.user.id).select('-password'); res.json({ success: true, data: u }); } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ---- Product Routes ----
app.get('/api/products', async (req, res) => {
  try { await connectDB();
    const { page = 1, limit = 12, category, brand, search, sort, featured, trending, newArrival, bestSeller } = req.query;
    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (featured === 'true') filter.isFeatured = true;
    if (trending === 'true') filter.isTrending = true;
    if (newArrival === 'true') filter.isNewArrival = true;
    if (bestSeller === 'true') filter.isBestSeller = true;
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).populate('category', 'name slug').populate('brand', 'name slug').sort(sortObj).skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    res.json({ success: true, data: products, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/products/:idOrSlug', async (req, res) => {
  try { await connectDB();
    const q = mongoose.Types.ObjectId.isValid(req.params.idOrSlug) ? { _id: req.params.idOrSlug } : { slug: req.params.idOrSlug };
    const p = await Product.findOne(q).populate('category', 'name slug').populate('brand', 'name slug');
    if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: p });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ---- Categories & Brands ----
app.get('/api/categories', async (_req, res) => { try { await connectDB(); res.json({ success: true, data: await Category.find().sort({ name: 1 }) }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } });
app.get('/api/brands', async (_req, res) => { try { await connectDB(); res.json({ success: true, data: await Brand.find().sort({ name: 1 }) }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } });

// ---- Cart ----
app.get('/api/cart', auth, async (req, res) => {
  try { await connectDB(); let c = await Cart.findOne({ user: req.user.id }).populate('items.product'); if (!c) c = await Cart.create({ user: req.user.id, items: [] }); res.json({ success: true, data: c }); } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
app.post('/api/cart', auth, async (req, res) => {
  try { await connectDB();
    const { productId, quantity } = req.body;
    const p = await Product.findById(productId); if (!p) return res.status(404).json({ success: false, message: 'Not found' });
    let c = await Cart.findOne({ user: req.user.id }); if (!c) c = await Cart.create({ user: req.user.id, items: [] });
    const i = c.items.findIndex(x => x.product.toString() === productId);
    if (i > -1) c.items[i].quantity += quantity; else c.items.push({ product: productId, quantity, price: p.salePrice || p.price });
    await c.save();
    res.json({ success: true, data: await Cart.findOne({ user: req.user.id }).populate('items.product') });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ---- Orders ----
app.get('/api/orders', auth, async (req, res) => { try { await connectDB(); res.json({ success: true, data: await Order.find({ user: req.user.id }).sort({ createdAt: -1 }) }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } });
app.post('/api/orders', auth, async (req, res) => {
  try { await connectDB();
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart?.items?.length) return res.status(400).json({ success: false, message: 'Cart empty' });
    const items = cart.items.map(i => ({ product: i.product._id, name: i.product.name, quantity: i.quantity, price: i.price, image: i.product.images?.[0] || '' }));
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = await Order.create({ user: req.user.id, items, shippingAddress: req.body.shippingAddress, paymentMethod: req.body.paymentMethod || 'cod', subtotal, tax: 0, shippingCost: 0, total: subtotal });
    cart.items = []; await cart.save();
    res.status(201).json({ success: true, data: order });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ---- Reviews ----
app.get('/api/reviews/:productId', async (req, res) => { try { await connectDB(); res.json({ success: true, data: await Review.find({ product: req.params.productId }).populate('user', 'name avatar').sort({ createdAt: -1 }) }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } });

// ---- Users (admin) ----
app.get('/api/users', auth, async (_req, res) => { try { await connectDB(); res.json({ success: true, data: await User.find().select('-password').sort({ createdAt: -1 }) }); } catch (e) { res.status(500).json({ success: false, message: e.message }); } });

// ---- Dashboard (admin) ----
app.get('/api/dashboard', auth, async (_req, res) => {
  try { await connectDB();
    const [tp, to, tu, rev] = await Promise.all([
      Product.countDocuments(), Order.countDocuments(), User.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }])
    ]);
    res.json({ success: true, data: { totalProducts: tp, totalOrders: to, totalUsers: tu, totalRevenue: rev[0]?.total || 0 } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = async (req, res) => serverless(app)(req, res);
