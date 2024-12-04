const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// middleware
app.use(cors());
app.use(express.json());
// mongo
// const uri = `mongodb://localhost:27017`;
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@portfoliocluster.mhkoe.mongodb.net/?retryWrites=true&w=majority&appName=portfolioCluster`;
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
    const projectsCollection = client.db("portfolio").collection("projects");
    const experienceCollection = client
      .db("portfolio")
      .collection("experiences");
    const testimonialsCollection = client
      .db("portfolio")
      .collection("testimonials");
    const heroCollection = client
      .db("portfolio")
      .collection("herp");
    app.get("/", (req, res) => {
      res.send("Hello World!");
    });
    // projects
    app.get("/projects", async (req, res) => {
      const projects = await projectsCollection.find({}).toArray();
      res.send(projects);
    });

    app.get("/projects/:id", async (req, res) => {
      try {
        if (!ObjectId.isValid(req.params.id)) {
          return res.status(400).send({ error: "Invalid ID format" });
        }
        const project = await projectsCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        res.send(project);
      } catch (error) {
        return res.status(404).send({ error: "project not found" });
      }
      // experience
      app.get("/experiences", async (req, res) => {
        const experiences = await experienceCollection.find({}).toArray();
        res.send(experiences);
      });
      // testimonials
      app.get("/testimonials", async (req, res) => {
        const experiences = await testimonialsCollection.find({}).toArray();
        res.send(experiences);
      });
      // hero section
      app.get("/hero", async (req, res) => {
        const hero = await heroCollection.find({}).toArray();
        res.send(hero);
      });
      // 
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
