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
