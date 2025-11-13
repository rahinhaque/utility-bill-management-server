const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");

// console.log(process.env);

//middleware
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
    // await client.connect();

    //bills collections
    const db = client.db("utility_db");
    const billsCollections = db.collection("bills");
    const recentData = db.collection("recent-data");
    const paymentsCollection = db.collection("paymentsCollection");

    app.post("/bills", async (req, res) => {
      try {
        const newBill = req.body;
        const result = await billsCollections.insertOne(newBill);
        res.send(result);
      } catch (error) {
        console.error("Error adding bill:", error);
        res.status(500).send({ message: "Failed to add bill" });
      }
    });

    app.get("/bills", async (req, res) => {
      try {
        const category = req.query.category;  
        let query = {};

        
        if (category && category !== "All") {
          query.category = category;
        }

         
        const bills = await billsCollections.find(query).toArray();

       
        console.log("Bills fetched:", category || "All categories");

        res.status(200).json(bills);
      } catch (error) {
        console.error("Error fetching bills:", error);
        res.status(500).json({ message: "Failed to fetch bills" });
      }
    });


    app.get("/bills/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const bill = await billsCollections.findOne(query);

        if (!bill) {
          return res.status(404).send({ message: "Bill not found" });
        }

        res.send(bill);
      } catch (error) {
        console.error("Error fetching bill:", error);
        res.status(500).send({ message: "Server error fetching bill" });
      }
    });

    

    app.get("/recent-data", async (req, res) => {
      try {
        const data = await recentData.find().toArray();
        res.send(data);
      } catch (error) {
        res.status(500).send({ error: "Server error" });
      }
    });

    app.get("/recent-data/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await recentData.findOne(query);
      res.send(result);
    });

    
    app.post("/payments", async (req, res) => {
      try {
        const payment = req.body;
        if (!payment.userEmail) {
          return res
            .status(400)
            .json({ success: false, message: "Email required" });
        }
        const result = await paymentsCollection.insertOne(payment);
        res.json({ success: !!result.insertedId });
      } catch (err) {
        console.error("Error saving payment:", err);
        res.status(500).json({ success: false });
      }
    });

   
    app.get("/payments", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email)
          return res.status(400).json({ message: "Email is required" });

        const payments = await paymentsCollection
          .find({ userEmail: email })
          .toArray();
        res.json(payments);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to load payments" });
      }
    });

    // UPDATE
    app.put("/payments/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedBill = req.body;

        const result = await paymentsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedBill }
        );

        res.json({ success: result.modifiedCount > 0 });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
      }
    });

    // DELETE payment by ID
    app.delete("/payments/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await paymentsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.json({ success: result.deletedCount > 0 });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
      }
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Utility-Server is runnig");
});

app.listen(port, () => {
  console.log(`Utility app listening on port ${port}`);
});
