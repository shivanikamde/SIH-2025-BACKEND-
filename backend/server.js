// // --- server.js ---
// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const multer = require("multer");
// const streamifier = require("streamifier");
// const cloudinary = require("cloudinary").v2;

// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // ---------------- MongoDB Connection ----------------
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err));

// // ---------------- Cloudinary Config ----------------
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ---------------- Schemas ----------------
// const userSchema = new mongoose.Schema({
//   username: String,
//   password: String,
//   loggedIn: { type: Boolean, default: false },
// });

// const formSchema = new mongoose.Schema({
//   username: String,
//   ngoName: String,
//   description: String,
//   location: String,
//   plantationType: String,
//   saplingsPlanted: Number,
//   walletAddress: String,
//   imageUrl: String, // Cloudinary URL
//   status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
//   createdAt: { type: Date, default: Date.now },
// });

// const User = mongoose.model("User", userSchema, "users_db");
// const Admin = mongoose.model("Admin", userSchema, "admin_db");
// const Form = mongoose.model("Form", formSchema, "forms_db");

// // ---------------- Login Route ----------------
// app.post("/login", async (req, res) => {
//   const { username, password, role } = req.body;

//   if (!username || !password || !role) {
//     return res
//       .status(400)
//       .json({ error: "Username, password, and role are required" });
//   }

//   try {
//     let accountModel = role === "admin" ? Admin : User;
//     const account = await accountModel.findOne({ username, password });

//     if (!account) return res.status(401).json({ error: "Invalid credentials" });

//     if (account.loggedIn) {
//       return res.json({ message: `${role} already logged in` });
//     }

//     account.loggedIn = true;
//     await account.save();

//     return res.json({ message: `${role} login successful` });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ---------------- Logout Route ----------------
// app.post("/logout", async (req, res) => {
//   const { username, role } = req.body;

//   try {
//     let accountModel = role === "admin" ? Admin : User;
//     const account = await accountModel.findOne({ username });

//     if (!account) return res.status(404).json({ error: "Account not found" });

//     account.loggedIn = false;
//     await account.save();

//     res.json({ message: `${role} logged out` });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ---------------- Form Submission Route ----------------
// app.post("/form", async (req, res) => {
//   try {
//     const {
//       username,
//       ngoName,
//       description,
//       location,
//       plantationType,
//       saplingsPlanted,
//       walletAddress,
//     } = req.body;

//     const newForm = new Form({
//       username,
//       ngoName,
//       description,
//       location,
//       plantationType,
//       saplingsPlanted,
//       walletAddress,
//     });

//     await newForm.save();
//     res.json({
//       error: false,
//       message: "Form data saved successfully",
//       formId: newForm._id,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       error: true,
//       message: "Failed to save form data",
//     });
//   }
// });

// // ---------------- Image Upload Route (Cloudinary) ----------------
// const upload = multer({ storage: multer.memoryStorage() });

// app.post("/upload/:formId", upload.single("image"), async (req, res) => {
//   try {
//     const formId = req.params.formId;
//     const file = req.file;

//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     // Upload to Cloudinary
//     let imageUrl = null;
//     try {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         { folder: "ngo_uploads" },
//         async (error, result) => {
//           if (error) {
//             console.error("❌ Cloudinary Upload Error:", error);
//             // Update form without image
//             await Form.findByIdAndUpdate(formId, { imageUrl: null });
//             return res.json({
//               message: "Form saved but image upload failed",
//               imageUrl: null
//             });
//           }

//           imageUrl = result.secure_url;

//           await Form.findByIdAndUpdate(formId, { imageUrl });

//           return res.json({
//             message: "✅ Image uploaded successfully",
//             imageUrl
//           });
//         }
//       );

//       // Convert buffer to stream
//       streamifier.createReadStream(file.buffer).pipe(uploadStream);
//     } catch (err) {
//       console.error("❌ Cloudinary Fatal Error:", err);
//       await Form.findByIdAndUpdate(formId, { imageUrl: null });
//       return res.json({
//         message: "Form saved but image upload failed",
//         imageUrl: null
//       });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error while uploading" });
//   }
// });

// // ---------------- Get All Forms ----------------
// app.get("/forms", async (req, res) => {
//   try {
//     const forms = await Form.find().sort({ createdAt: -1 });
//     res.json(forms);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch forms" });
//   }
// });

// // ---------------- Start Server ----------------
// const PORT = 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// --- server.js ---
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const ImageModel = require("./Image");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---------------- MongoDB Connection ----------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ---------------- Schemas ----------------
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  loggedIn: { type: Boolean, default: false },
});

const formSchema = new mongoose.Schema({
  username: String,
  ngoName: String,
  description: String,
  location: String,
  plantationType: String,
  saplingsPlanted: Number,
  walletAddress: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema, "users_db");
const Admin = mongoose.model("Admin", userSchema, "admin_db");
const Form = mongoose.model("Form", formSchema, "forms_db");

// ---------------- Login Route ----------------
app.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ error: "Username, password, and role are required" });
  }

  try {
    let accountModel = role === "admin" ? Admin : User;
    const account = await accountModel.findOne({ username, password });

    if (!account) return res.status(401).json({ error: "Invalid credentials" });

    if (account.loggedIn) {
      return res.json({ message: `${role} already logged in` });
    }

    account.loggedIn = true;
    await account.save();

    return res.json({ message: `${role} login successful` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- Logout Route ----------------
app.post("/logout", async (req, res) => {
  const { username, role } = req.body;

  try {
    let accountModel = role === "admin" ? Admin : User;
    const account = await accountModel.findOne({ username });

    if (!account) return res.status(404).json({ error: "Account not found" });

    account.loggedIn = false;
    await account.save();

    res.json({ message: `${role} logged out` });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- Form Submission Route ----------------
app.post("/form", async (req, res) => {
  try {
    const {
      username,
      ngoName,
      description,
      location,
      plantationType,
      saplingsPlanted,
      walletAddress,
    } = req.body;

    const newForm = new Form({
      username,
      ngoName,
      description,
      location,
      plantationType,
      saplingsPlanted,
      walletAddress,
    });

    await newForm.save();
    res.json({
      error: false,
      message: "Form data saved successfully",
      formId: newForm._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: "Failed to save form data",
    });
  }
});

// // ---------------- Image Upload Route (MongoDB Binary Storage) ----------------
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// app.post("/upload/:formId", upload.array("images", 10), async (req, res) => {
//   try {
//     const formId = req.params.formId;

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: "No files uploaded" });
//     }

//     const savedImages = await Promise.all(
//       req.files.map((file) => {
//         const newImage = new ImageModel({
//           form_id: formId,
//           img: {
//             data: file.buffer,
//             contentType: file.mimetype,
//           },
//         });
//         return newImage.save();
//       })
//     );

//     res.status(200).json({
//       message: "✅ Images uploaded to MongoDB",
//       formId,
//       uploaded: savedImages.length,
//     });
//   } catch (error) {
//     console.error("❌ Upload Error:", error);
//     res.status(500).json({ error: "Failed to upload images" });
//   }
// });

// ---------------- Get All Forms ----------------
app.get("/forms", async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const forms = await Form.find(filter).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
});

// ---------------- Update Form Status (DAO) ----------------
app.patch("/forms/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedForm = await Form.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ error: "Form not found" });
    }

    res.json({
      message: "✅ Form status updated",
      form: updatedForm,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update form status" });
  }
});

// ---------------- Start Server ----------------
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

