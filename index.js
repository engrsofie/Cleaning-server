const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const fileUpload = require("express-fileupload");
const ObjectID = require("mongodb").ObjectId;
const port = process.env.PORT || 7000;
const fs = require("fs-extra");
const MongoClient = require("mongodb").MongoClient;

console.log(process.env.DB_USER);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yx4ql.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.send("Hello from underWorld!");
});

client.connect((err) => {
  const productCollection = client.db("cleaner").collection("events");
  const adminCollection = client.db("cleaner").collection("admins");
  const orderCollection = client.db("cleaner").collection("orders");
  const reviewCollection = client.db("cleaner").collection("reviews");
  // Add service to databaseName
  app.post("/addService", (req, res) => {
    const file = req.files.image;
    const name = req.body.name;
    const price = req.body.price;
    const filePath = `${__dirname}/services/${file.name}`;
    const newImage = file.data;
    const convertImg = newImage.toString("base64");

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(convertImg, "base64"),
    };

    productCollection.insertOne({ name, price, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });

  });

  // Add review
  app.post("/addReview", (req, res) => {
    const file = req.files.image;
    const name = req.body.name;
    const review = req.body.review;
    const filePath = `${__dirname}/services/${file.name}`;

     const newImage = file.data;
     const convertImg = newImage.toString("base64");

     const image = {
       contentType: file.mimetype,
       size: file.size,
       img: Buffer.from(convertImg, "base64"),
     };

      reviewCollection.insertOne({ name, review, image }).then((result) => {
        res.send(result.insertedCount > 0);
        
      });
    
  });

  // Send data to ui

  app.get("/services", (req, res) => {
    productCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // Send data to ui

  app.get("/reviews", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  // Add admin
  app.post("/addAdmin", (req, res) => {
    const data = req.body;
    console.log(data);
    adminCollection.insertOne(data).then((result) => {
      res.send(result);
    });
  });

  // Load single data
  app.get("/serviceBook/:id", (req, res) => {
    productCollection
      .find({ _id: ObjectID(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  // Book order

  app.post("/bookOrder", (req, res) => {
    const data = req.body;
    console.log(data);
    orderCollection.insertOne({ data }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // order list

  app.post("/orderList", (req, res) => {
    const email = req.body.email;
    console.log(email);
    adminCollection.find({ admin: email }).toArray((err, admins) => {
      //   res.send(admins);

      if (admins.length > 0) {
        orderCollection.find().toArray((error, docs) => {
          res.send(docs);
        });
      } else {
        orderCollection.find({ "data.email": email }).toArray((error, docs) => {
          res.send(docs);
        });
      }
    });
  });

  // Is admin

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ admin: email }).toArray((err, admins) => {
      res.send(admins.length > 0);
    });
  });
  // Delete books method
  app.delete("/service/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    productCollection.findOneAndDelete({ _id: id }).then((documents) => {
      res.send(!!documents.value);
      console.log("Service deleted successfully");
    });
  });

  console.log({ err });
  console.log("Db connected");
  // perform actions on the collection object
  // client.close();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
