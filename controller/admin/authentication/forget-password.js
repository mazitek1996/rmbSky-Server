const express = require("express");
const router = express.Router();
const Admin = require("../../../models/admin");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing required field: email" });
    }

    // Find the admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ error: "Email not registered with us" });
    }

    // Clear any existing reset codes
    admin.passwordResetToken = undefined;
    admin.passwordResetTokenExpiry = undefined;
    await admin.save();

    // Generate a random six-digit code or character
    const passwordResetToken = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

    // Set the reset code and expiry on the admin
    admin.passwordResetToken = passwordResetToken;
    admin.passwordResetTokenExpiry = Date.now() + 3600000; // 1 hour
    await admin.save();

    // Send the reset email to the admin
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: admin.email,
      subject: `SnapFuel password reset code for ${admin.firstName}`,
      text:
        `You are receiving this email because you (or someone else) have requested a password reset for your account.\n\n` +
        `Here is your password reset code: ${passwordResetToken}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };
    const response = await transporter.sendMail(mailOptions);

    if (!response || !response.accepted || response.accepted.length === 0) {
      return res
        .status(500)
        .json({ error: "Failed to send reset email. Please try again later." });
    }

    res.json({
      message: `Email has been sent to ${admin.email}. Follow the instructions in the email to reset your password.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

module.exports = router;
