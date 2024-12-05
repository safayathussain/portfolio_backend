const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const API_KEY = process.env.API_KEY;
// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@portfoliocluster.mhkoe.mongodb.net/portfolio?retryWrites=true&w=majority`;

// Connect to MongoDB using Mongoose
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  });

// Define Mongoose schemas and models
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  duration: { type: String, required: true },
  teamSize: { type: String, required: true },
  description: { type: String, required: true },
  complexity: { type: String, required: true },
  technologies: { type: String, required: true },
  images: { type: [String], required: true },
  coverImage: { type: String, required: true },
});

const experienceSchema = new mongoose.Schema({
  duration: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
});

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  review: { type: String, required: true },
  company: { type: String, required: true },
  clientImage: { type: String, required: true },
});

const heroSchema = new mongoose.Schema({
  age: { type: String, required: true },
  subtitle: { type: String, required: true },
  experience: { type: String, required: true },
  project: { type: String, required: true },
  happyClient: { type: String, required: true },
  heroImage: { type: String, required: false }, // Optional image field
});

const Project = mongoose.model("Project", projectSchema);
const Experience = mongoose.model("Experience", experienceSchema);
const Testimonial = mongoose.model("Testimonial", testimonialSchema);
const Hero = mongoose.model("Hero", heroSchema);
// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});
const upload = multer({ storage });
// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Projects API
app.get("/projects", async (req, res) => {
  const projects = await Project.find({});
  res.send(projects);
});

app.post(
  "/create-project",
  upload.fields([
    { name: "images", maxCount: 10 }, // Allow multiple project images
    { name: "coverImage", maxCount: 1 }, // Single cover image
  ]),
  async (req, res) => {
    try {
      const apiKey = req.headers["x-api-key"];
      if (!apiKey || apiKey !== API_KEY) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const projectData = {
        ...req.body,
        images:
          req.files["images"]?.map((file) => file.path.replace(/\\/g, "/")) ||
          [], // Replace backslashes
        coverImage:
          req.files["coverImage"]?.[0]?.path.replace(/\\/g, "/") || null, // Replace backslashes
      };

      const newProject = new Project(projectData);
      await newProject.save();
      res
        .status(201)
        .json({ message: "Project created successfully", project: newProject });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating project", error: error.message });
    }
  }
);

// Experience API
app.post(
  "/create-experience",
  upload.single("clientImage"),
  async (req, res) => {
    try {
      const apiKey = req.headers["x-api-key"];
      if (!apiKey || apiKey !== API_KEY) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { duration, role, company, location } = req.body;
      const newExperience = new Experience({
        duration,
        role,
        company,
        location,
      });

      await newExperience.save();

      res.status(201).json({
        message: "Experience created successfully",
        experience: newExperience,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating experience", error: error.message });
    }
  }
);

// Testimonial API
app.post(
  "/create-testimonial",
  upload.single("clientImage"),
  async (req, res) => {
    try {
      const apiKey = req.headers["x-api-key"];
      if (!apiKey || apiKey !== API_KEY) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const testimonialData = {
        ...req.body,
        clientImage: req.file ? `/uploads/${req.file.filename}` : null,
      };

      const newTestimonial = new Testimonial(testimonialData);
      await newTestimonial.save();
      res.status(201).json({
        message: "Testimonial created successfully",
        testimonial: newTestimonial,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating testimonial", error: error.message });
    }
  }
);

// Hero API
app.post("/create-hero", upload.single("heroImage"), async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== API_KEY) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { age, subtitle, experience, project, happyClient } = req.body;

    // Handle file path correctly
    const newHero = new Hero({
      age,
      subtitle,
      experience,
      project,
      happyClient,
      heroImage: req.file ? req.file.path.replace(/\\/g, "/") : null, // Save the file path if an image is uploaded
    });

    await newHero.save();
    res.status(201).json({
      message: "Hero created successfully",
      hero: newHero,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating hero", error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
