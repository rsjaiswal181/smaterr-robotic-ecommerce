/* eslint-disable no-console */
import mongoose from 'mongoose';
import slugify from 'slugify';
import { env } from '../config/env';
import User from '../models/User.model';
import Category from '../models/Category.model';
import Brand from '../models/Brand.model';
import Product from '../models/Product.model';
import Coupon from '../models/Coupon.model';

const run = async () => {
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB for seeding...');

  // --- Admin user ---
  let admin = await User.findOne({ email: env.adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: env.adminEmail,
      password: env.adminPassword,
      role: 'admin',
      isEmailVerified: true,
    });
    console.log(`Admin created: ${env.adminEmail} / ${env.adminPassword}`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  // Remove the original generic demo catalog so the storefront stays focused on electronics.
  const legacyProductSlugs = [
    'wireless-bluetooth-headphones',
    'smart-fitness-watch',
    'mens-cotton-t-shirt',
    'non-stick-cookware-set',
    'yoga-mat-premium',
    'the-art-of-programming',
  ];
  await Product.deleteMany({ slug: { $in: legacyProductSlugs } });
  await Category.deleteMany({ slug: { $in: ['fashion', 'home-and-kitchen', 'sports-and-fitness', 'books'] } });
  await Brand.deleteMany({ slug: { $in: ['acmeco', 'nova', 'zenith'] } });

  // --- Categories ---
  const categoryNames = ['Electronics', 'Robotics', 'Sensors', 'Modules', 'Tools', 'Components'];
  const categories: Record<string, mongoose.Types.ObjectId> = {};
  for (const name of categoryNames) {
    const slug = slugify(name, { lower: true, strict: true });
    let cat = await Category.findOne({ slug });
    if (!cat) cat = await Category.create({ name, slug });
    categories[name] = cat._id as mongoose.Types.ObjectId;
  }
  console.log(`Categories ready: ${categoryNames.join(', ')}`);

  // --- Brands ---
  const brandNames = [
    'Generic',
    'Arduino',
    'Raspberry Pi',
    'Espressif',
    'DFRobot',
    'Pololu',
    'Waveshare',
    'Smaterr Roboticz',
  ];
  const brands: Record<string, mongoose.Types.ObjectId> = {};
  for (const name of brandNames) {
    const slug = slugify(name, { lower: true, strict: true });
    let brand = await Brand.findOne({ slug });
    if (!brand) brand = await Brand.create({ name, slug });
    brands[name] = brand._id as mongoose.Types.ObjectId;
  }
  console.log(`Brands ready: ${brandNames.join(', ')}`);

  const categoryColors: Record<string, string> = {
    Electronics: '3b82f6',
    Robotics: 'ef4444',
    Sensors: '10b981',
    Modules: '8b5cf6',
    Components: 'f59e0b',
    Tools: '6b7280',
  };
  const placeholderImg = (name: string, category: string) => {
    const bg = categoryColors[category] || '64748b';
    const short = name.length > 25 ? name.slice(0, 25) + '…' : name;
    return `https://placehold.co/400x400/${bg}/ffffff?text=${encodeURIComponent(short)}`;
  };
  const pexelsBase = 'https://images.pexels.com/photos';
  const pexelsImages: Record<string, string> = {
    arduino: `${pexelsBase}/1474993/pexels-photo-1474993.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    raspberry: `${pexelsBase}/28767589/pexels-photo-28767589.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    sensor: `${pexelsBase}/35652464/pexels-photo-35652464.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    servo: `${pexelsBase}/35652464/pexels-photo-35652464.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    motor: `${pexelsBase}/35652464/pexels-photo-35652464.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    breadboard: `${pexelsBase}/1474993/pexels-photo-1474993.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    jumper: `${pexelsBase}/1474993/pexels-photo-1474993.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    oled: `${pexelsBase}/28767589/pexels-photo-28767589.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    display: `${pexelsBase}/28767589/pexels-photo-28767589.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    led: `${pexelsBase}/35673112/pexels-photo-35673112.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    switch: `${pexelsBase}/35673112/pexels-photo-35673112.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    capacitor: `${pexelsBase}/35673112/pexels-photo-35673112.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    battery: `${pexelsBase}/35673112/pexels-photo-35673112.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    usb: `${pexelsBase}/1474993/pexels-photo-1474993.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    cable: `${pexelsBase}/1474993/pexels-photo-1474993.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    module: `${pexelsBase}/35673112/pexels-photo-35673112.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    drone: `${pexelsBase}/1474993/pexels-photo-1474993.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    tire: `${pexelsBase}/35652464/pexels-photo-35652464.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
    antenna: `${pexelsBase}/7663138/pexels-photo-7663138.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1`,
  };
  const getImage = (name: string, category: string) => {
    const lower = name.toLowerCase();
    for (const [key, url] of Object.entries(pexelsImages)) {
      if (lower.includes(key)) return url;
    }
    return placeholderImg(name, category);
  };

  // --- Sample products ---
  const sampleProducts = [
    {
      name: 'Arduino Uno R3 Original Made in Italy',
      category: 'Electronics',
      brand: 'Arduino',
      price: 999,
      salePrice: 799,
      stock: 120,
      isFeatured: true,
      isBestSeller: true,
      specifications: [
        { key: 'Microcontroller', value: 'ATmega328P' },
        { key: 'Input Voltage', value: '7-12V' },
      ],
    },
    {
      name: 'Raspberry Pi Pico',
      category: 'Electronics',
      brand: 'Raspberry Pi',
      price: 6999,
      salePrice: 6499,
      stock: 25,
      isTrending: true,
      isNewArrival: true,
      specifications: [
        { key: 'Processor', value: 'RP2040' },
        { key: 'Connectivity', value: 'USB, GPIO' },
      ],
    },
    {
      name: 'BTS7960 43A H-Bridge Motor Driver Module',
      category: 'Modules',
      brand: 'Generic',
      price: 799,
      salePrice: 649,
      stock: 95,
      isFeatured: true,
      isTrending: true,
      specifications: [
        { key: 'Current', value: '43A' },
        { key: 'Control', value: 'H-Bridge' },
      ],
    },
    {
      name: 'Ultrasonic Sensor HC-SR04',
      category: 'Sensors',
      brand: 'Generic',
      price: 399,
      salePrice: 329,
      stock: 140,
      isBestSeller: true,
      specifications: [{ key: 'Range', value: '2cm-400cm' }],
    },
    {
      name: 'SG90 Servo Motor 180 Degree',
      category: 'Robotics',
      brand: 'Generic',
      price: 199,
      stock: 210,
      isBestSeller: true,
      specifications: [{ key: 'Rotation', value: '180 degree' }],
    },
    {
      name: '0.96 inch OLED Display I2C',
      category: 'Components',
      brand: 'Generic',
      price: 129,
      stock: 180,
      isNewArrival: true,
      specifications: [{ key: 'Interface', value: 'I2C' }],
    },
    {
      name: 'Breadboard MB102 830 Tie Points',
      category: 'Components',
      brand: 'Generic',
      price: 349,
      stock: 85,
      isTrending: true,
      specifications: [{ key: 'Tie Points', value: '830' }],
    },
    {
      name: 'Male To Female Jumper Wires 20cm',
      category: 'Components',
      brand: 'Generic',
      price: 299,
      salePrice: 249,
      stock: 130,
      isBestSeller: true,
      specifications: [{ key: 'Type', value: 'Male to Female' }],
    },
    {
      name: 'Male to Male Jumper Wires 20cm',
      category: 'Components',
      brand: 'Generic',
      price: 199,
      stock: 175,
      isFeatured: true,
      specifications: [{ key: 'Type', value: 'Male to Male' }],
    },
    {
      name: 'GY-906 MLX90614ESF Non-Contact IR Temperature Sensor',
      category: 'Sensors',
      brand: 'Generic',
      price: 1199,
      salePrice: 999,
      stock: 55,
      specifications: [{ key: 'Type', value: 'Non-Contact IR' }],
    },
    {
      name: 'XH W1209 Digital Temperature Controller Module',
      category: 'Modules',
      brand: 'Generic',
      price: 229,
      stock: 160,
      specifications: [{ key: 'Display', value: 'LED' }],
    },
    {
      name: '5mm LED Red',
      category: 'Components',
      brand: 'Generic',
      price: 99,
      stock: 500,
      specifications: [{ key: 'Size', value: '5mm' }],
    },
    {
      name: 'Slide Switch Small',
      category: 'Components',
      brand: 'Generic',
      price: 249,
      stock: 110,
      isTrending: true,
      specifications: [{ key: 'Type', value: 'SPDT' }],
    },
    {
      name: 'NFC Reader 13.56MHz Module',
      category: 'Modules',
      brand: 'Generic',
      price: 119,
      stock: 220,
      specifications: [{ key: 'Frequency', value: '13.56MHz' }],
    },
    {
      name: 'Arduino Uno USB Cable',
      category: 'Components',
      brand: 'Generic',
      price: 249,
      salePrice: 199,
      stock: 150,
      isBestSeller: true,
      specifications: [{ key: 'Type', value: 'USB A to B' }],
    },
    {
      name: 'Mini Type-C Power Bank Charging Module 3A',
      category: 'Modules',
      brand: 'Generic',
      price: 399,
      stock: 95,
      isNewArrival: true,
      specifications: [{ key: 'Charging', value: 'Type-C 3A' }],
    },
    {
      name: '2A Lithium Battery Charging Buck Converter Board',
      category: 'Modules',
      brand: 'Generic',
      price: 199,
      stock: 260,
      specifications: [{ key: 'Output', value: '2A' }],
    },
    {
      name: 'Capacitor Solid State 100uF 35V',
      category: 'Components',
      brand: 'Generic',
      price: 99,
      stock: 350,
      specifications: [{ key: 'Capacitance', value: '100uF' }],
    },
    {
      name: 'LED Controller 220V',
      category: 'Components',
      brand: 'Generic',
      price: 109,
      stock: 340,
      specifications: [{ key: 'Voltage', value: '220V' }],
    },
    {
      name: '0.33uF 275VAC X2 Film Capacitors Pack',
      category: 'Components',
      brand: 'Generic',
      price: 179,
      stock: 125,
      specifications: [{ key: 'Capacitance', value: '0.33uF' }],
    },
    {
      name: '3000mAh Sony VTC6 Lithium Ion Rechargeable Battery',
      category: 'Components',
      brand: 'Generic',
      price: 89,
      stock: 300,
      specifications: [{ key: 'Capacity', value: '3000mAh' }],
    },
    {
      name: '100K NTC Thermistor for 3D Printer',
      category: 'Components',
      brand: 'Generic',
      price: 499,
      salePrice: 399,
      stock: 90,
      specifications: [{ key: 'Resistance', value: '100K Ohm' }],
    },
    {
      name: 'Drone Brushless Motor + ESC + Propeller Kit',
      category: 'Robotics',
      brand: 'Generic',
      price: 599,
      stock: 70,
      isFeatured: true,
      specifications: [{ key: 'Motor', value: '2212 920KV' }],
    },
    {
      name: '1/10 RC Climbing Car Tire SCX10',
      category: 'Robotics',
      brand: 'Generic',
      price: 349,
      stock: 100,
      specifications: [{ key: 'Scale', value: '1/10' }],
    },
    {
      name: 'Capacitor Metalized Polypropylene Film Safety',
      category: 'Components',
      brand: 'Generic',
      price: 2499,
      salePrice: 2199,
      stock: 35,
      isNewArrival: true,
      specifications: [{ key: 'Type', value: 'X2 Safety' }],
    },
    {
      name: 'Antenna Wireless Module',
      category: 'Modules',
      brand: 'Generic',
      price: 1899,
      stock: 45,
      isTrending: true,
      specifications: [{ key: 'Type', value: 'Wireless Antenna' }],
    },
    {
      name: 'LED Controller 220V 3A',
      category: 'Components',
      brand: 'Generic',
      price: 3499,
      salePrice: 2999,
      stock: 40,
      isFeatured: true,
      isNewArrival: true,
      specifications: [{ key: 'Current', value: '3A' }],
    },
  ];

  for (const p of sampleProducts) {
    const slug = slugify(p.name, { lower: true, strict: true });
    const exists = await Product.findOne({ slug });
    if (exists) continue;
    await Product.create({
      name: p.name,
      slug,
      sku: `SKU-${slug.toUpperCase().slice(0, 10)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      category: categories[p.category],
      brand: brands[p.brand],
      images: [getImage(p.name, p.category)],
      description: `${p.name} for electronics, robotics, and DIY prototyping projects. Tested quality, practical pricing, and fast dispatch.`,
      specifications: p.specifications || [],
      price: p.price,
      salePrice: p.salePrice,
      stock: p.stock,
      minOrderQty: 1,
      tags: [p.category.toLowerCase(), 'electronics', 'robotics', 'diy'],
      isFeatured: !!p.isFeatured,
      isTrending: !!p.isTrending,
      isNewArrival: !!p.isNewArrival,
      isBestSeller: !!p.isBestSeller,
      status: 'active',
    });
  }
  console.log(`Seeded ${sampleProducts.length} sample products (skipping any that already exist).`);

  // --- Sample coupon ---
  const couponExists = await Coupon.findOne({ code: 'WELCOME10' });
  if (!couponExists) {
    await Coupon.create({
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minPurchase: 500,
      maxDiscount: 300,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      usageLimit: 0,
    });
    console.log('Sample coupon created: WELCOME10 (10% off, min ₹500)');
  }

  console.log('\nSeeding complete.');
  console.log(`Admin login: ${env.adminEmail} / ${env.adminPassword}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
