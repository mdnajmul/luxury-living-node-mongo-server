const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const fileUpload = require("express-fileupload");

const app = express();
//PORT
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Database Info
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3u7yr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    console.log("database connected successfully");

    //database name
    const database = client.db("luxury_living");

    // Collections
    const serviceCollection = database.collection("services");
    const userCollection = database.collection("users");
    const orderCollection = database.collection("orders");

    /* ========================= Service Collection START ======================= */

    // GET - Get all services
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find({});
      if ((await cursor.count()) > 0) {
        const services = await cursor.toArray();
        res.json(services);
      } else {
        res.json({ message: "Service Not Found!" });
      }
    });

    // POST - Add a service by - Admin
    app.post("/services", async (req, res) => {
      // Extract image data and convert it to binary base 64
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      // Extract other information and make our service object including image for saveing into MongoDB
      const { title, description, price } = req.body;
      const service = {
        title,
        description: description.split("\n"),
        image: imageBuffer,
        price,
      };
      const result = await serviceCollection.insertOne(service);
      res.json(result);
    });

    // Delete - Delete a service by admin
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.json({ _id: id, deletedCount: result.deletedCount });
    });

    /* ========================= Service Collection END ======================= */

    /* ========================= User Collection START ======================= */

    // GET - All users
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.json(users);
    });

    // POST - Save user info to user collection
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.json(result);
    });

    // PUT - Update user data to database for third party login system
    app.put("/users", async (req, res) => {
      const userData = req.body;
      const filter = { email: userData.email };
      const options = { upsert: true };
      const updateDoc = { $set: userData };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // Delete - Delete an user from DB
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.json({ _id: id, deletedCount: result.deletedCount });
    });

    // GET - Admin Status.
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      let isAdmin = false;
      if (result?.role === "admin") {
        isAdmin = true;
        res.json({ admin: isAdmin });
      } else {
        res.json({ admin: isAdmin });
      }
    });

    // PUT - Set an user role as admin
    app.put("/make-admin/:id", async (req, res) => {
      const filter = req.params.id;
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(
        { email: filter },
        updateDoc
      );
      res.json(result);
      console.log(result);
    });

    //GET - fetch/get all admins
    app.get("/admins", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.json(users);
    });

    /* ========================= User Collection END ======================= */

    /* ========================= Order Collection START ======================= */

    // GET - All Orders (for Admin)
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const cursor = orderCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // GET - Services books for specific user
    app.get("/my-books", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = orderCollection.find(query);
      if ((await cursor.count()) > 0) {
        const orders = await cursor.toArray();
        res.json(orders);
      } else {
        res.json({ message: "Booked Services Not Found!" });
      }
    });
  } finally {
    //await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("luxury living node mongo server");
});

app.listen(port, () => {
  console.log("Server running at port ", port);
});
