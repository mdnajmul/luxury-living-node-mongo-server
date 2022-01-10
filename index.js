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
    const servicesCollection = database.collection("services");

    /* ========================= Service Collection START ======================= */

    // GET - Get all services
    app.get("/services", async (req, res) => {
      const cursor = servicesCollection.find({});
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
      const result = await servicesCollection.insertOne(service);
      res.json(result);
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
