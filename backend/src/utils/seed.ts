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

  // --- Sample products ---
  const sampleProducts = [
    {
      name: 'Arduino Uno R3 Compatible Board',
      category: 'Electronics',
      brand: 'Arduino',
      price: 999,
      salePrice: 799,
      stock: 120,
      image: 'https://placehold.co/900x900/dbeafe/1e3a8a.png?text=Arduino+Uno+R3',
      isFeatured: true,
      isBestSeller: true,
      specifications: [
        { key: 'Microcontroller', value: 'ATmega328P' },
        { key: 'Input Voltage', value: '7-12V' },
      ],
    },
    {
      name: 'Raspberry Pi 4 Model B 4GB',
      category: 'Electronics',
      brand: 'Raspberry Pi',
      price: 6999,
      salePrice: 6499,
      stock: 25,
      image: 'https://placehold.co/900x900/e0f2fe/075985.png?text=Raspberry+Pi+4',
      isTrending: true,
      isNewArrival: true,
      specifications: [
        { key: 'RAM', value: '4GB' },
        { key: 'Connectivity', value: 'WiFi, Bluetooth, Ethernet' },
      ],
    },
    {
      name: 'ESP32 WiFi Bluetooth Development Board',
      category: 'Modules',
      brand: 'Espressif',
      price: 799,
      salePrice: 649,
      stock: 95,
      image: 'https://placehold.co/900x900/dcfce7/166534.png?text=ESP32+Dev+Board',
      isFeatured: true,
      isTrending: true,
      specifications: [
        { key: 'Wireless', value: 'WiFi + Bluetooth' },
        { key: 'USB', value: 'Micro USB' },
      ],
    },
    {
      name: 'ESP8266 NodeMCU Development Board',
      category: 'Modules',
      brand: 'Espressif',
      price: 399,
      salePrice: 329,
      stock: 140,
      image: 'https://placehold.co/900x900/fef9c3/854d0e.png?text=NodeMCU+ESP8266',
      isBestSeller: true,
      specifications: [{ key: 'Wireless', value: 'WiFi 802.11 b/g/n' }],
    },
    {
      name: 'HC-SR04 Ultrasonic Distance Sensor',
      category: 'Sensors',
      brand: 'Generic',
      price: 149,
      stock: 210,
      image: 'https://placehold.co/900x900/ede9fe/5b21b6.png?text=HC-SR04+Sensor',
      isBestSeller: true,
      specifications: [{ key: 'Range', value: '2cm-400cm' }],
    },
    {
      name: 'DHT11 Temperature Humidity Sensor',
      category: 'Sensors',
      brand: 'Generic',
      price: 129,
      stock: 180,
      image: 'https://placehold.co/900x900/ffedd5/9a3412.png?text=DHT11+Sensor',
      isNewArrival: true,
      specifications: [{ key: 'Output', value: 'Digital signal' }],
    },
    {
      name: 'DHT22 Temperature Humidity Sensor',
      category: 'Sensors',
      brand: 'Generic',
      price: 349,
      stock: 85,
      image: 'https://placehold.co/900x900/fce7f3/9d174d.png?text=DHT22+Sensor',
      isTrending: true,
      specifications: [{ key: 'Accuracy', value: 'Higher precision than DHT11' }],
    },
    {
      name: 'L298N Dual Motor Driver Module',
      category: 'Robotics',
      brand: 'Generic',
      price: 299,
      salePrice: 249,
      stock: 130,
      image: 'https://placehold.co/900x900/fee2e2/991b1b.png?text=L298N+Motor+Driver',
      isBestSeller: true,
      specifications: [{ key: 'Motor Channels', value: '2 DC motors' }],
    },
    {
      name: 'SG90 Micro Servo Motor',
      category: 'Robotics',
      brand: 'Generic',
      price: 199,
      stock: 175,
      image: 'https://placehold.co/900x900/ecfccb/3f6212.png?text=SG90+Servo',
      isFeatured: true,
      specifications: [{ key: 'Rotation', value: '180 degree' }],
    },
    {
      name: 'NEMA 17 Stepper Motor',
      category: 'Robotics',
      brand: 'Pololu',
      price: 1199,
      salePrice: 999,
      stock: 55,
      image: 'https://placehold.co/900x900/e2e8f0/334155.png?text=NEMA+17+Stepper',
      specifications: [{ key: 'Step Angle', value: '1.8 degree' }],
    },
    {
      name: 'A4988 Stepper Motor Driver',
      category: 'Modules',
      brand: 'Pololu',
      price: 229,
      stock: 160,
      image: 'https://placehold.co/900x900/f5f3ff/6d28d9.png?text=A4988+Driver',
      specifications: [{ key: 'Microstepping', value: 'Up to 1/16 step' }],
    },
    {
      name: 'IR Infrared Obstacle Avoidance Sensor',
      category: 'Sensors',
      brand: 'Generic',
      price: 99,
      stock: 240,
      image: 'https://placehold.co/900x900/e0e7ff/3730a3.png?text=IR+Obstacle+Sensor',
      specifications: [{ key: 'Detection', value: 'Adjustable range' }],
    },
    {
      name: 'MQ-2 Gas Smoke Sensor Module',
      category: 'Sensors',
      brand: 'Generic',
      price: 249,
      stock: 110,
      image: 'https://placehold.co/900x900/ccfbf1/115e59.png?text=MQ-2+Gas+Sensor',
      isTrending: true,
      specifications: [{ key: 'Detects', value: 'LPG, smoke, methane' }],
    },
    {
      name: '5V Single Channel Relay Module',
      category: 'Modules',
      brand: 'Generic',
      price: 119,
      stock: 220,
      image: 'https://placehold.co/900x900/fef3c7/92400e.png?text=5V+Relay+Module',
      specifications: [{ key: 'Control Voltage', value: '5V DC' }],
    },
    {
      name: '16x2 LCD Display Module',
      category: 'Components',
      brand: 'Generic',
      price: 249,
      salePrice: 199,
      stock: 150,
      image: 'https://placehold.co/900x900/d1fae5/065f46.png?text=16x2+LCD+Display',
      isBestSeller: true,
      specifications: [{ key: 'Display', value: '16 columns x 2 rows' }],
    },
    {
      name: '0.96 inch OLED I2C Display',
      category: 'Components',
      brand: 'Waveshare',
      price: 399,
      stock: 95,
      image: 'https://placehold.co/900x900/dbeafe/1d4ed8.png?text=0.96+OLED+Display',
      isNewArrival: true,
      specifications: [{ key: 'Interface', value: 'I2C' }],
    },
    {
      name: 'Breadboard 830 Tie Points',
      category: 'Components',
      brand: 'Generic',
      price: 199,
      stock: 260,
      image: 'https://placehold.co/900x900/f8fafc/0f172a.png?text=830+Point+Breadboard',
      specifications: [{ key: 'Tie Points', value: '830' }],
    },
    {
      name: 'Male to Male Jumper Wires 40pcs',
      category: 'Components',
      brand: 'Generic',
      price: 99,
      stock: 350,
      image: 'https://placehold.co/900x900/fef2f2/7f1d1d.png?text=Jumper+Wires+M-M',
      specifications: [{ key: 'Pack', value: '40 pieces' }],
    },
    {
      name: 'Female to Female Jumper Wires 40pcs',
      category: 'Components',
      brand: 'Generic',
      price: 109,
      stock: 340,
      image: 'https://placehold.co/900x900/f0fdf4/14532d.png?text=Jumper+Wires+F-F',
      specifications: [{ key: 'Pack', value: '40 pieces' }],
    },
    {
      name: 'MB102 Breadboard Power Supply Module',
      category: 'Modules',
      brand: 'Generic',
      price: 179,
      stock: 125,
      image: 'https://placehold.co/900x900/eff6ff/1e40af.png?text=MB102+Power+Supply',
      specifications: [{ key: 'Output', value: '3.3V / 5V' }],
    },
    {
      name: 'TP4056 Lithium Battery Charging Module',
      category: 'Modules',
      brand: 'Generic',
      price: 89,
      stock: 300,
      image: 'https://placehold.co/900x900/fdf4ff/86198f.png?text=TP4056+Charger',
      specifications: [{ key: 'Battery Type', value: 'Single-cell Li-ion' }],
    },
    {
      name: '12V 2A DC Power Adapter',
      category: 'Components',
      brand: 'Smaterr Roboticz',
      price: 499,
      salePrice: 399,
      stock: 90,
      image: 'https://placehold.co/900x900/e7e5e4/44403c.png?text=12V+2A+Adapter',
      specifications: [{ key: 'Output', value: '12V 2A' }],
    },
    {
      name: 'Multimeter Digital DT830D',
      category: 'Tools',
      brand: 'Generic',
      price: 599,
      stock: 70,
      image: 'https://placehold.co/900x900/fefce8/713f12.png?text=Digital+Multimeter',
      isFeatured: true,
      specifications: [{ key: 'Measurements', value: 'Voltage, current, resistance' }],
    },
    {
      name: 'Soldering Iron 25W',
      category: 'Tools',
      brand: 'Smaterr Roboticz',
      price: 349,
      stock: 100,
      image: 'https://placehold.co/900x900/fae8ff/701a75.png?text=25W+Soldering+Iron',
      specifications: [{ key: 'Power', value: '25W' }],
    },
    {
      name: '60W Adjustable Soldering Station',
      category: 'Tools',
      brand: 'Smaterr Roboticz',
      price: 2499,
      salePrice: 2199,
      stock: 35,
      image: 'https://placehold.co/900x900/e0f2fe/0c4a6e.png?text=Soldering+Station',
      isNewArrival: true,
      specifications: [{ key: 'Temperature', value: 'Adjustable control' }],
    },
    {
      name: 'Raspberry Pi Camera Module',
      category: 'Modules',
      brand: 'Raspberry Pi',
      price: 1899,
      stock: 45,
      image: 'https://placehold.co/900x900/f1f5f9/475569.png?text=Pi+Camera+Module',
      isTrending: true,
      specifications: [{ key: 'Compatibility', value: 'Raspberry Pi boards' }],
    },
    {
      name: 'Arduino Starter Kit with Sensors',
      category: 'Electronics',
      brand: 'Smaterr Roboticz',
      price: 3499,
      salePrice: 2999,
      stock: 40,
      image: 'https://placehold.co/900x900/ecfeff/155e75.png?text=Arduino+Starter+Kit',
      isFeatured: true,
      isNewArrival: true,
      specifications: [{ key: 'Includes', value: 'Board, sensors, wires, breadboard' }],
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
      images: [p.image],
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
