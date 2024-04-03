const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const session = require("express-session");
const sharp = require("sharp");
const fs = require("fs/promises");
const engine = require("ejs-locals");

const app = express();
//using ejs for ease
app.set("view engine", "ejs");
app.engine("ejs", engine);
//taking input from HTML, setting paths to files to app.js
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const PORT = 3000;
const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://127.0.0.1:27017/petsdb";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/petsdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  typeofpet: { type: String, required: true },
  name: { type: String, required: true },
  breed: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  description: { type: String },
  password: { type: String, required: true },
  gender: { type: String },
  type: { type: String },
  avatar: { type: String },
});

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String, required: true },
});

const commentSchema = new mongoose.Schema({

  content: String,
  author: String,
  photo_id: String,
});

const photosSchema = new mongoose.Schema({
  ObjectId: { type: String },
  description: { type: String },
});

const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("admins", adminSchema);
const Comment = mongoose.model("comments", commentSchema);
const Photo = mongoose.model("photos", commentSchema);

const db = client.db();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use("/public", express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/photos", express.static("photos"));
//using ejs for ease
app.set("view engine", "ejs");
app.engine("ejs", engine);
//taking input from HTML, setting paths to files to app.js
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/signup", async (req, res) => {
  try {
    const { typeofpet, name, breed, email, password, repeatPassword, avatar } =
      req.body;

    if (
      !typeofpet ||
      !name ||
      !breed ||
      !email ||
      !password ||
      !repeatPassword
    ) {
      return res
        .status(400)
        .json({ status: 405, message: "All fields are required" });
    }

    if (password !== repeatPassword) {
      return res
        .status(400)
        .json({ status: 405, message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: 405, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId: new mongoose.Types.ObjectId().toString(),
      typeofpet,
      name,
      breed,
      email,
      password: hashedPassword,
      avatar,
    });

    await newUser.save();

    req.session.userId = newUser.userId;

    res.status(200).json({ status: 200, message: "Sign-up successful" });
  } catch (error) {
    console.error("Error occurred while saving user:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid email or password" });
    }

    // user ID sessin
    req.session.userId = user.userId;

    res.status(200).json({ status: 200, message: "Login successful" });
  } catch (error) {
    console.error("Error occurred while signing in:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

app.post("/signinadmin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid username or password" });
    }

    // Compare passwords without bcrypt
    if (password !== admin.password) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid username or password" });
    }

    req.session.adminId = admin.adminId;

    res.status(200).json({ status: 200, message: "Login successful" });
  } catch (error) {
    console.error("Error occurred while signing in:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

app.get("/profile", async (req, res) => {
  try {
    const { userId } = req.session;

    const userData = await User.findOne({ userId });
    if (!userData) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    res.json(userData);
  } catch (error) {
    console.error("Error occurred while retrieving user data:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

app.post("/profile", async (req, res) => {
  try {
    const { name, breed, description } = req.body;
    const { userId } = req.session;

    await User.findOneAndUpdate({ userId }, { name, breed, description });
    res
      .status(200)
      .json({ status: 200, message: "User data saved successfully" });
  } catch (error) {
    console.error("Error occurred while saving user data:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

app.get("/avatars/filename", async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const avatarFileName = user.avatar;
    res.json({ avatar: avatarFileName });
  } catch (error) {
    console.error("Error occurred while retrieving user data:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});

app.use(express.static("uploads"));

app.post("/avatars", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const avatarFilePath = req.file.path;
    const buffer = await sharp(avatarFilePath).resize(50, 50).toBuffer();

    const resizedAvatarFilePath = `./uploads/resized_${req.file.filename}`;
    await fs.writeFile(resizedAvatarFilePath, buffer);

    const avatarFileName = `resized_${req.file.filename}`;
    const userId = req.session.userId;

    const updatedUser = await User.findOneAndUpdate(
      { userId: userId },
      { avatar: avatarFileName },
      { new: true }
    );

    await fs.unlink(avatarFilePath);

    res.status(200).send("Avatar saved successfully.");
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    res.status(500).send("Failed to upload avatar.");
  }
});

app.post("/gallery", upload.single("image"), (req, res) => {
  const { description } = req.body;
  const imagePaths = req.file.path;
  const imageUrl = "/uploads/" + req.file.filename;

  const collection = db.collection("photos");

  collection
    .insertOne({ imageUrl, description })
    .then(() => {
      res.json({ success: true, imageUrl, description });
    })
    .catch((error) => {
      console.error("Error uploading image:", error);
      res.json({ success: false, error: "Failed to upload image" });
    });
});

app.get("/gallery", (req, res) => {
  const collection = db.collection("photos");

  collection
    .find()
    .toArray()
    .then((galleryData) => {
      res.json(galleryData);
    })
    .catch((error) => {
      console.error("Error loading gallery:", error);
      res.status(500).json({ error: "Failed to load gallery" });
    });
});

const { ObjectId } = require("mongodb");

app.delete("/gallery/:id", (req, res) => {
  const photoId = Photo.findOne({ ObjectId });

  console.log("Received DELETE request for photoId:", photoId);

  let objectId;
  try {
    objectId = new ObjectId(photoId);
    console.log("ObjectId:", objectId);
  } catch (error) {
    console.error("Invalid photoId:", error);
    res.json({ success: false, error: "Invalid photoId" });
    return;
  }

  const collection = db.collection("photos");

  collection
    .deleteOne({ _id: objectId })
    .then((result) => {
      if (result.deletedCount === 1) {
        console.log("Photo deleted successfully");
        res.json({ success: true, message: "Photo deleted successfully" });
      } else {
        console.log("Photo not found");
        res.json({ success: false, error: "Photo not found" });
      }
    })
    .catch((error) => {
      console.error("Error deleting photo:", error);
      res.json({ success: false, error: "Failed to delete photo" });
    });
});

app.post('/comments', (req, res) => {
  const { author, photo_id, content } = req.body;

  const newComment = new Comment({
    author,
    photo_id,
    content

  });

  newComment
    .save()
    .then((comment) => {
      console.log("Comment saved:", comment);
      res.status(200).json({ success: true, comment });
    })
    .catch((error) => {
      console.error("Error saving comment:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    });
});

app.get("/comments", (req, res) => {
  Comment.find()
    .then((comments) => {
      res.status(200).json({ success: true, comments });
    })
    .catch((error) => {
      console.error("Error loading comments:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    });
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/signin", function (req, res) {
  res.render("signin");
});
app.get("/signinasadmin", function (req, res) {
  res.render("signinasadmin");
});
app.get("/settings", function (req, res) {
  res.render("settings");
});
app.get("/profilepage", function (req, res) {
  res.render("profile");
});
app.get("/newpost", function (req, res) {
  res.render("newpost");
});
app.get("/signup", function (req, res) {
  res.render("signup");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
