// // --- server.js ---
// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const multer = require("multer");
// const { BlobServiceClient } = require("@azure/storage-blob");
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());


// // ---------------- MongoDB Connection ----------------


// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch(err => console.error("❌ MongoDB Error:", err));


// // ---------------- Schemas ----------------
// const userSchema = new mongoose.Schema({
//   username: String,
//   password: String,
//   loggedIn: { type: Boolean, default: false }
// });


// const formSchema = new mongoose.Schema({
//   username: String,
//   ngoName: String,
//   description: String,
//   location: String,
//   plantationType: String,
//   saplingsPlanted: Number,
//   walletAddress: String,
//   imageUrl: String, // Azure Blob URL
//   status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
//   createdAt: { type: Date, default: Date.now }
// });


// const User = mongoose.model("User", userSchema, "users_db");
// const Admin = mongoose.model("Admin", userSchema, "admin_db");
// const Form = mongoose.model("Form", formSchema, "forms_db");


// // ---------------- Azure Blob Setup ----------------
// const blobServiceClient = BlobServiceClient.fromConnectionString(
//   process.env.AZURE_STORAGE_CONNECTION_STRING
// );
// const containerName = "useruploads"; // make sure this container exists
// const containerClient = blobServiceClient.getContainerClient(containerName);


// // ---------------- Login Route ----------------
// app.post("/login", async (req, res) => {
//   const { username, password, role } = req.body;


//   if (!username || !password || !role) {
//     return res.status(400).json({ error: "Username, password, and role are required" });
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
// // ---------------- Form Submission Route ----------------
// app.post("/form", async (req, res) => {
//   try {
//     const { username, ngoName, description, location, plantationType, saplingsPlanted, walletAddress } = req.body;


//     const newForm = new Form({
//       username,
//       ngoName,
//       description,
//       location,
//       plantationType,
//       saplingsPlanted,
//       walletAddress
//     });


//     await newForm.save();
//     res.json({
//       error: false,
//       message: "Form data saved successfully",
//       formId: newForm._id
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       error: true,
//       message: "Failed to save form data"
//     });
//   }
// });




// // ---------------- Image Upload Route ----------------
// const upload = multer({ storage: multer.memoryStorage() });


// app.post("/upload/:formId", upload.single("image"), async (req, res) => {
//   try {
//     const formId = req.params.formId;
//     const file = req.file;


//     if (!file) return res.status(400).json({ error: "No file uploaded" });


//     const blobName = `${Date.now()}-${file.originalname}`;
//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);


//     await blockBlobClient.uploadData(file.buffer, {
//       blobHTTPHeaders: { blobContentType: file.mimetype }
//     });


//     const imageUrl = blockBlobClient.url;


//     await Form.findByIdAndUpdate(formId, { imageUrl });


//     res.json({ message: "Image uploaded successfully", imageUrl });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Image upload failed" });
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



// // ---------------- Update Form Status (DAO) ----------------
// app.patch("/forms/:id/status", async (req, res) => {
//   try {
//     const { status } = req.body;


//     if (!["Pending", "Approved", "Rejected"].includes(status)) {
//       return res.status(400).json({ error: "Invalid status value" });
//     }


//     const updatedForm = await Form.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );


//     if (!updatedForm) {
//       return res.status(404).json({ error: "Form not found" });
//     }


//     res.json({
//       message: "✅ Form status updated",
//       form: updatedForm,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to update form status" });
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
const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---------------- MongoDB Connection ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ---------------- Schemas ----------------
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  loggedIn: { type: Boolean, default: false }
});

const formSchema = new mongoose.Schema({
  ngoId: String,                // ✅ Added NGO ID
  projectName: String,          // ✅ Replaced username with projectName
  description: String,
  location: String,
  plantationType: String,
  saplingsPlanted: Number,
  walletAddress: String,
  imageUrl: String, // Azure Blob URL
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema, "users_db");
const Admin = mongoose.model("Admin", userSchema, "admin_db");
const Form = mongoose.model("Form", formSchema, "forms_db");

// ---------------- Azure Blob Setup ----------------
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = "useruploads"; // make sure this container exists
const containerClient = blobServiceClient.getContainerClient(containerName);

// ---------------- Login Route ----------------
app.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Username, password, and role are required" });
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
    const { ngoId, projectName, description, location, plantationType, saplingsPlanted, walletAddress } = req.body;

    const newForm = new Form({
      ngoId,
      projectName,
      description,
      location,
      plantationType,
      saplingsPlanted,
      walletAddress
    });

    await newForm.save();
    res.json({
      error: false,
      message: "Project added successfully",   // ✅ Updated message
      projectId: newForm._id                   // ✅ Return projectId instead of formId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: "Failed to save form data"
    });
  }
});

// ---------------- Image Upload Route ----------------
const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload/:projectId", upload.single("image"), async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype }
    });

    const imageUrl = blockBlobClient.url;

    await Form.findByIdAndUpdate(projectId, { imageUrl });

    res.json({
      message: "Image uploaded successfully",
      projectId,
      imageUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image upload failed" });
  }
});

// ---------------- Get All Forms ----------------
app.get("/forms", async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
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

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
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
