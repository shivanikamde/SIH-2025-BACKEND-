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
//   ngoId: String,                // ✅ Added NGO ID
//   projectName: String,          // ✅ Replaced username with projectName
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
// app.post("/form", async (req, res) => {
//   try {
//     const { ngoId, projectName, description, location, plantationType, saplingsPlanted, walletAddress } = req.body;

//     const newForm = new Form({
//       ngoId,
//       projectName,
//       description,
//       location,
//       plantationType,
//       saplingsPlanted,
//       walletAddress
//     });

//     await newForm.save();
//     res.json({
//       error: false,
//       message: "Project added successfully",   // ✅ Updated message
//       projectId: newForm._id                   // ✅ Return projectId instead of formId
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

// app.post("/upload/:projectId", upload.single("image"), async (req, res) => {
//   try {
//     const projectId = req.params.projectId;
//     const file = req.file;

//     if (!file) return res.status(400).json({ error: "No file uploaded" });

//     const blobName = `${Date.now()}-${file.originalname}`;
//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//     await blockBlobClient.uploadData(file.buffer, {
//       blobHTTPHeaders: { blobContentType: file.mimetype }
//     });

//     const imageUrl = blockBlobClient.url;

//     await Form.findByIdAndUpdate(projectId, { imageUrl });

//     res.json({
//       message: "Image uploaded successfully",
//       projectId,
//       imageUrl
//     });
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

// Project (form) schema — optional price added for marketplace usage
const formSchema = new mongoose.Schema({
  ngoId: String,                // Added NGO ID
  projectName: String,          // Replaced username with projectName
  description: String,
  location: String,
  plantationType: String,
  saplingsPlanted: Number,
  walletAddress: String,
  price: Number,                // optional, for marketplace
  imageUrl: String,             // Azure Blob URL
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

// Company schema for credits & marketplace buyers
const companySchema = new mongoose.Schema({
  companyName: String,
  email: String,
  credits: { type: Number, default: 0 }, // credits balance
  createdAt: { type: Date, default: Date.now }
});

// DAO schema (organisations who can register/approve projects)
const daoSchema = new mongoose.Schema({
  daoName: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

// Project registration storage for DAOs
const projectRegistrationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Form" },
  daoId: { type: mongoose.Schema.Types.ObjectId, ref: "DAO" },
  ngoId: String, // optional quick reference
  registeredAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["Registered", "Accepted", "Rejected"], default: "Registered" }
});

// Marketplace cart schema for companies/buyers
const cartSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  items: [
    {
      projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Form" },
      addedAt: { type: Date, default: Date.now }
      // quantity omitted because projects are unique items; add if needed
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema, "users_db");
const Admin = mongoose.model("Admin", userSchema, "admin_db");
const Form = mongoose.model("Form", formSchema, "forms_db");
const Company = mongoose.model("Company", companySchema, "companies_db");
const DAO = mongoose.model("DAO", daoSchema, "daos_db");
const ProjectRegistration = mongoose.model("ProjectRegistration", projectRegistrationSchema, "project_registrations_db");
const Cart = mongoose.model("Cart", cartSchema, "carts_db");

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
    const { ngoId, projectName, description, location, plantationType, saplingsPlanted, walletAddress, price } = req.body;

    const newForm = new Form({
      ngoId,
      projectName,
      description,
      location,
      plantationType,
      saplingsPlanted,
      walletAddress,
      price
    });

    await newForm.save();

    // Note: We DON'T auto-register the project to DAOs here.
    // The app (NGO) / client should call /register-project-to-dao if they want DAOs to be notified/stored.

    res.json({
      error: false,
      message: "Project added successfully",
      projectId: newForm._id
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
// ---------------- Get All Forms (projects) ----------------
// If ngoId is provided, return only projects belonging to that NGO
app.get("/forms", async (req, res) => {
  try {
    const { ngoId } = req.query; // expecting query like /forms?ngoId=NGOID123
    let query = {};
    if (ngoId) {
      query.ngoId = ngoId;
    }

    const forms = await Form.find(query).sort({ createdAt: -1 });
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

// ----------------- NEW FEATURES START -----------------

// ---------------- Company (credits) APIs ----------------

// Create company (simple create - no required fields enforced)
app.post("/company", async (req, res) => {
  try {
    const { companyName, email, credits } = req.body;
    const newCompany = new Company({ companyName, email, credits });
    await newCompany.save();
    res.json({ message: "Company created", company: newCompany });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create company" });
  }
});

// Get company details (including credits)
app.get("/company/:companyId", async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch company" });
  }
});

// Add credits to company (increment)
app.post("/company/:companyId/credits", async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== "number") {
      return res.status(400).json({ error: "Amount must be a number" });
    }
    const company = await Company.findByIdAndUpdate(
      req.params.companyId,
      { $inc: { credits: amount } },
      { new: true }
    );
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json({ message: "Credits updated", company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update credits" });
  }
});

// Debit credits (internal use - e.g., during checkout)
async function debitCompanyCredits(companyId, amount) {
  if (amount <= 0) return { success: false, message: "Invalid amount" };
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const company = await Company.findById(companyId).session(session);
    if (!company) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, message: "Company not found" };
    }
    if (company.credits < amount) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, message: "Insufficient credits" };
    }
    company.credits -= amount;
    await company.save({ session });
    await session.commitTransaction();
    session.endSession();
    return { success: true, company };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("debitCompanyCredits error:", err);
    return { success: false, message: "Failed to debit credits" };
  }
}

// ---------------- DAO & Project Registration APIs ----------------

// Create DAO
app.post("/dao", async (req, res) => {
  try {
    const { daoName, email } = req.body;
    const newDao = new DAO({ daoName, email });
    await newDao.save();
    res.json({ message: "DAO created", dao: newDao });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create DAO" });
  }
});

// Get DAO details
app.get("/dao/:daoId", async (req, res) => {
  try {
    const dao = await DAO.findById(req.params.daoId);
    if (!dao) return res.status(404).json({ error: "DAO not found" });
    res.json(dao);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch DAO" });
  }
});

// Register a project for a DAO (store registration)
app.post("/register-project-to-dao", async (req, res) => {
  try {
    const { projectId, daoId, ngoId } = req.body;
    // No field compulsory per your instruction — but check existence to be helpful
    if (!projectId || !daoId) {
      return res.status(400).json({ error: "projectId and daoId recommended" });
    }

    const registration = new ProjectRegistration({ projectId, daoId, ngoId });
    await registration.save();

    res.json({ message: "Project registered to DAO", registration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register project" });
  }
});

// DAO: get all projects registered to them (with project details populated)
app.get("/dao/:daoId/projects", async (req, res) => {
  try {
    const daoId = req.params.daoId;
    const regs = await ProjectRegistration.find({ daoId }).sort({ registeredAt: -1 }).populate("projectId");
    res.json(regs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch DAO projects" });
  }
});

// Get registrations for a specific project (which DAOs it was registered to)
app.get("/project/:projectId/registrations", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const regs = await ProjectRegistration.find({ projectId }).sort({ registeredAt: -1 }).populate("daoId");
    res.json(regs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch project registrations" });
  }
});

// Update registration status (e.g., DAO accepts/rejects)
app.patch("/registration/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Registered", "Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const updated = await ProjectRegistration.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: "Registration not found" });
    res.json({ message: "Registration updated", registration: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update registration" });
  }
});

// ---------------- Marketplace Cart APIs ----------------

// Ensure a cart exists for company
async function ensureCart(companyId) {
  let cart = await Cart.findOne({ companyId });
  if (!cart) {
    cart = new Cart({ companyId, items: [] });
    await cart.save();
  }
  return cart;
}

// Add project to cart
app.post("/cart/:companyId/add", async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: "projectId is required" });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const project = await Form.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const cart = await ensureCart(companyId);

    // prevent duplicates
    const exists = cart.items.some(i => i.projectId.toString() === projectId.toString());
    if (exists) {
      return res.json({ message: "Project already in cart", cart });
    }

    cart.items.push({ projectId });
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Project added to cart", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// Get company cart (populated)
app.get("/cart/:companyId", async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const cart = await Cart.findOne({ companyId }).populate("items.projectId");
    if (!cart) return res.json({ message: "Cart empty", cart: { companyId, items: [] } });
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Remove an item from cart
app.delete("/cart/:companyId/item/:projectId", async (req, res) => {
  try {
    const { companyId, projectId } = req.params;
    const cart = await Cart.findOne({ companyId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const before = cart.items.length;
    cart.items = cart.items.filter(i => i.projectId.toString() !== projectId.toString());
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Item removed", removed: before - cart.items.length, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove item" });
  }
});

// Clear cart
app.post("/cart/:companyId/clear", async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const cart = await Cart.findOne({ companyId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    res.json({ message: "Cart cleared", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// Checkout cart: debit company credits based on project.price
app.post("/cart/:companyId/checkout", async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const cart = await Cart.findOne({ companyId }).populate("items.projectId");
    if (!cart || cart.items.length === 0) return res.status(400).json({ error: "Cart is empty" });

    // sum prices (projects without price assumed 0)
    let total = 0;
    for (const item of cart.items) {
      const p = item.projectId;
      total += (p && typeof p.price === "number") ? p.price : 0;
    }

    // Attempt to debit company credits (transactionally)
    const debitResult = await debitCompanyCredits(companyId, total);
    if (!debitResult.success) {
      return res.status(400).json({ error: debitResult.message || "Failed to debit credits" });
    }

    // After successful debit: create simple purchase records (optional)
    // For now we clear the cart and return info; you can extend to save purchase history.
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.json({
      message: "Checkout successful",
      totalDebited: total,
      company: debitResult.company
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// ----------------- NEW FEATURES END -----------------

// ---------------- Start Server ----------------
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
