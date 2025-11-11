const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");

//middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://utility-bills-server:4JKLEoU7WdwkXQUB@simple-crud-sever.mcwoj3p.mongodb.net/?appName=simple-crud-sever";

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

    //bills collections
    const db = client.db("utility_db");
    const billsCollections = db.collection("bills");
    const recentData = db.collection("recent-data");


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



    app.get("/bills", async (req, res) => {
      try {
        const bills = await billsCollections.find().toArray();
        res.send(bills);
      } catch {
        res.status(500).send({ error: Bad_Request });
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

    await client.db("admin").command({ ping: 1 });
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
