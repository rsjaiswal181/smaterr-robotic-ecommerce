"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const mongoose_1 = __importDefault(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const env_1 = require("../config/env");
const User_model_1 = __importDefault(require("../models/User.model"));
const Category_model_1 = __importDefault(require("../models/Category.model"));
const Brand_model_1 = __importDefault(require("../models/Brand.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const Coupon_model_1 = __importDefault(require("../models/Coupon.model"));
const run = async () => {
    await mongoose_1.default.connect(env_1.env.mongoUri);
    console.log('Connected to MongoDB for seeding...');
    // --- Admin user ---
    let admin = await User_model_1.default.findOne({ email: env_1.env.adminEmail });
    if (!admin) {
        admin = await User_model_1.default.create({
            name: 'Admin',
            email: env_1.env.adminEmail,
            password: env_1.env.adminPassword,
            role: 'admin',
            isEmailVerified: true,
        });
        console.log(`Admin created: ${env_1.env.adminEmail} / ${env_1.env.adminPassword}`);
    }
    else {
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
    await Product_model_1.default.deleteMany({ slug: { $in: legacyProductSlugs } });
    await Category_model_1.default.deleteMany({ slug: { $in: ['fashion', 'home-and-kitchen', 'sports-and-fitness', 'books'] } });
    await Brand_model_1.default.deleteMany({ slug: { $in: ['acmeco', 'nova', 'zenith'] } });
    // --- Categories ---
    const categoryNames = ['Electronics', 'Robotics', 'Sensors', 'Modules', 'Tools', 'Components'];
    const categories = {};
    for (const name of categoryNames) {
        const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
        let cat = await Category_model_1.default.findOne({ slug });
        if (!cat)
            cat = await Category_model_1.default.create({ name, slug });
        categories[name] = cat._id;
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
    const brands = {};
    for (const name of brandNames) {
        const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
        let brand = await Brand_model_1.default.findOne({ slug });
        if (!brand)
            brand = await Brand_model_1.default.create({ name, slug });
        brands[name] = brand._id;
    }
    console.log(`Brands ready: ${brandNames.join(', ')}`);
    // --- Sample products ---
    const sampleProducts = [
        {
            name: 'Arduino Uno R3 Original Made in Italy',
            category: 'Electronics',
            brand: 'Arduino',
            price: 999,
            salePrice: 799,
            stock: 120,
            image: 'https://himalayansolution.com/img-cache/188-400.webp',
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
            image: 'https://himalayansolution.com/img-cache/2844-400.webp',
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
            image: 'https://himalayansolution.com/img-cache/2881-400.webp',
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
            image: 'https://himalayansolution.com/img-cache/290-400.webp',
            isBestSeller: true,
            specifications: [{ key: 'Range', value: '2cm-400cm' }],
        },
        {
            name: 'SG90 Servo Motor 180 Degree',
            category: 'Robotics',
            brand: 'Generic',
            price: 199,
            stock: 210,
            image: 'https://himalayansolution.com/img-cache/328-400.webp',
            isBestSeller: true,
            specifications: [{ key: 'Rotation', value: '180 degree' }],
        },
        {
            name: '0.96 inch OLED Display I2C',
            category: 'Components',
            brand: 'Generic',
            price: 129,
            stock: 180,
            image: 'https://himalayansolution.com/img-cache/3484-400.webp',
            isNewArrival: true,
            specifications: [{ key: 'Interface', value: 'I2C' }],
        },
        {
            name: 'Breadboard MB102 830 Tie Points',
            category: 'Components',
            brand: 'Generic',
            price: 349,
            stock: 85,
            image: 'https://himalayansolution.com/img-cache/901-400.webp',
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
            image: 'https://himalayansolution.com/img-cache/319-400.webp',
            isBestSeller: true,
            specifications: [{ key: 'Type', value: 'Male to Female' }],
        },
        {
            name: 'Male to Male Jumper Wires 20cm',
            category: 'Components',
            brand: 'Generic',
            price: 199,
            stock: 175,
            image: 'https://himalayansolution.com/img-cache/1939-400.webp',
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
            image: 'https://himalayansolution.com/img-cache/4054-400.webp',
            specifications: [{ key: 'Type', value: 'Non-Contact IR' }],
        },
        {
            name: 'XH W1209 Digital Temperature Controller Module',
            category: 'Modules',
            brand: 'Generic',
            price: 229,
            stock: 160,
            image: 'https://himalayansolution.com/img-cache/4053-400.webp',
            specifications: [{ key: 'Display', value: 'LED' }],
        },
        {
            name: '5mm LED Red',
            category: 'Components',
            brand: 'Generic',
            price: 99,
            stock: 500,
            image: 'https://himalayansolution.com/img-cache/1972-400.webp',
            specifications: [{ key: 'Size', value: '5mm' }],
        },
        {
            name: 'Slide Switch Small',
            category: 'Components',
            brand: 'Generic',
            price: 249,
            stock: 110,
            image: 'https://himalayansolution.com/img-cache/4187-400.webp',
            isTrending: true,
            specifications: [{ key: 'Type', value: 'SPDT' }],
        },
        {
            name: 'NFC Reader 13.56MHz Module',
            category: 'Modules',
            brand: 'Generic',
            price: 119,
            stock: 220,
            image: 'https://himalayansolution.com/img-cache/2841-400.webp',
            specifications: [{ key: 'Frequency', value: '13.56MHz' }],
        },
        {
            name: 'Arduino Uno USB Cable',
            category: 'Components',
            brand: 'Generic',
            price: 249,
            salePrice: 199,
            stock: 150,
            image: 'https://himalayansolution.com/img-cache/2551-400.webp',
            isBestSeller: true,
            specifications: [{ key: 'Type', value: 'USB A to B' }],
        },
        {
            name: 'Mini Type-C Power Bank Charging Module 3A',
            category: 'Modules',
            brand: 'Generic',
            price: 399,
            stock: 95,
            image: 'https://himalayansolution.com/img-cache/2927-400.webp',
            isNewArrival: true,
            specifications: [{ key: 'Charging', value: 'Type-C 3A' }],
        },
        {
            name: '2A Lithium Battery Charging Buck Converter Board',
            category: 'Modules',
            brand: 'Generic',
            price: 199,
            stock: 260,
            image: 'https://himalayansolution.com/img-cache/4062-400.webp',
            specifications: [{ key: 'Output', value: '2A' }],
        },
        {
            name: 'Capacitor Solid State 100uF 35V',
            category: 'Components',
            brand: 'Generic',
            price: 99,
            stock: 350,
            image: 'https://himalayansolution.com/img-cache/4193-400.webp',
            specifications: [{ key: 'Capacitance', value: '100uF' }],
        },
        {
            name: 'LED Controller 220V',
            category: 'Components',
            brand: 'Generic',
            price: 109,
            stock: 340,
            image: 'https://himalayansolution.com/img-cache/4192-400.webp',
            specifications: [{ key: 'Voltage', value: '220V' }],
        },
        {
            name: '0.33uF 275VAC X2 Film Capacitors Pack',
            category: 'Components',
            brand: 'Generic',
            price: 179,
            stock: 125,
            image: 'https://himalayansolution.com/img-cache/4189-400.webp',
            specifications: [{ key: 'Capacitance', value: '0.33uF' }],
        },
        {
            name: '3000mAh Sony VTC6 Lithium Ion Rechargeable Battery',
            category: 'Components',
            brand: 'Generic',
            price: 89,
            stock: 300,
            image: 'https://himalayansolution.com/img-cache/2496-400.webp',
            specifications: [{ key: 'Capacity', value: '3000mAh' }],
        },
        {
            name: '100K NTC Thermistor for 3D Printer',
            category: 'Components',
            brand: 'Generic',
            price: 499,
            salePrice: 399,
            stock: 90,
            image: 'https://himalayansolution.com/img-cache/2897-400.webp',
            specifications: [{ key: 'Resistance', value: '100K Ohm' }],
        },
        {
            name: 'Drone Brushless Motor + ESC + Propeller Kit',
            category: 'Robotics',
            brand: 'Generic',
            price: 599,
            stock: 70,
            image: 'https://himalayansolution.com/img-cache/2846-400.webp',
            isFeatured: true,
            specifications: [{ key: 'Motor', value: '2212 920KV' }],
        },
        {
            name: '1/10 RC Climbing Car Tire SCX10',
            category: 'Robotics',
            brand: 'Generic',
            price: 349,
            stock: 100,
            image: 'https://himalayansolution.com/img-cache/2843-400.webp',
            specifications: [{ key: 'Scale', value: '1/10' }],
        },
        {
            name: 'Capacitor Metalized Polypropylene Film Safety',
            category: 'Components',
            brand: 'Generic',
            price: 2499,
            salePrice: 2199,
            stock: 35,
            image: 'https://himalayansolution.com/img-cache/4190-400.webp',
            isNewArrival: true,
            specifications: [{ key: 'Type', value: 'X2 Safety' }],
        },
        {
            name: 'Antenna Wireless Module',
            category: 'Modules',
            brand: 'Generic',
            price: 1899,
            stock: 45,
            image: 'https://himalayansolution.com/img-cache/4194-400.webp',
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
            image: 'https://himalayansolution.com/img-cache/4191-400.webp',
            isFeatured: true,
            isNewArrival: true,
            specifications: [{ key: 'Current', value: '3A' }],
        },
    ];
    for (const p of sampleProducts) {
        const slug = (0, slugify_1.default)(p.name, { lower: true, strict: true });
        const exists = await Product_model_1.default.findOne({ slug });
        if (exists)
            continue;
        await Product_model_1.default.create({
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
    const couponExists = await Coupon_model_1.default.findOne({ code: 'WELCOME10' });
    if (!couponExists) {
        await Coupon_model_1.default.create({
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
    console.log(`Admin login: ${env_1.env.adminEmail} / ${env_1.env.adminPassword}`);
    await mongoose_1.default.disconnect();
    process.exit(0);
};
run().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
