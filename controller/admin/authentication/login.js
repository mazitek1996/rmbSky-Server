const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../../../model/admin");
const {
  authenticateAdmin,
} = require("../../../middleware/authentication/admin-auth");

router.post("/", authenticateAdmin, async (req, res, next) => {
  try {
    let admin;
    // Check if the request has an email
    if (req.body.email) {
      // Find the admin by email
      admin = await Admin.findOne({ email: req.body.email });
    }
    // Check if the request has a phone number
    else if (req.body.phoneNumber) {
      // Find the admin by phone number
      admin = await Admin.findOne({ phoneNumber: req.body.phoneNumber });
    }

    if (!admin) {
      return res.status(401).json({ error: "Invalid email or phone number" });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(req.body.password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid  password" });
    }

    // Create a JWT token for the admin
    const token = jwt.sign(
      { userId: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Attach the JWT token to the cookie
    res.cookie("access_token", token, { httpOnly: true });

    // Send a success message and the admin data
    res.json({
      message: "Logged in successfully",
      admin,
      access_token: token,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
