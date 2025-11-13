const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@simple-crud-sever.mcwoj3p.mongodb.net/?appName=simple-crud-sever`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("utility_db");
    const billsCollections = db.collection("bills");
    const recentData = db.collection("recent-data");
    const paymentsCollection = db.collection("paymentsCollection");

    // ======= ROUTES =======

    app.post("/api/bills", async (req, res) => {
      try {
        const newBill = req.body;
        const result = await billsCollections.insertOne(newBill);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to add bill" });
      }
    });

    app.get("/api/bills", async (req, res) => {
      try {
        const category = req.query.category;
        const query = category && category !== "All" ? { category } : {};
        const bills = await billsCollections.find(query).toArray();
        res.status(200).json(bills);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch bills" });
      }
    });

    app.get("/api/bills/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const bill = await billsCollections.findOne({ _id: new ObjectId(id) });
        if (!bill) return res.status(404).send({ message: "Bill not found" });
        res.send(bill);
      } catch (error) {
        res.status(500).send({ message: "Server error fetching bill" });
      }
    });

    app.get("/api/recent-data", async (req, res) => {
      const data = await recentData.find().toArray();
      res.send(data);
    });

    app.post("/api/payments", async (req, res) => {
      const payment = req.body;
      if (!payment.userEmail)
        return res
          .status(400)
          .json({ success: false, message: "Email required" });
      const result = await paymentsCollection.insertOne(payment);
      res.json({ success: !!result.insertedId });
    });

    app.get("/api/payments", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(400).json({ message: "Email is required" });
      const payments = await paymentsCollection
        .find({ userEmail: email })
        .toArray();
      res.json(payments);
    });

    app.put("/api/payments/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBill = req.body;
      const result = await paymentsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedBill }
      );
      res.json({ success: result.modifiedCount > 0 });
    });

    app.delete("/api/payments/:id", async (req, res) => {
      const id = req.params.id;
      const result = await paymentsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json({ success: result.deletedCount > 0 });
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } finally {
   
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Utility Server is running");
});


module.exports = app;
