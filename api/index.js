const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
let client;
let db;

async function connectDB() {
  if (db) return db;
  client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  });
  await client.connect();
  db = client.db("smaterr");
  return db;
}

app.get("/health", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ success: true, message: "Server is running" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ success: true, message: "Server is running" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const database = await connectDB();
    const products = await database.collection("products").find({}).toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
