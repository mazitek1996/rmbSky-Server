const express = require("express");
const router = express.Router();
const twilio = require("twilio");
const jwt = require("jsonwebtoken");
const Admin = require("../../../models/admin");

// Configure Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Define route to send SMS OTP
router.post("/", async (req, res) => {
  try {
    // Get the JWT token from the request headers
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }

    // Verify the JWT token and extract the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find the admin in the database by user ID
    const admin = await Admin.findById(userId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Get the admin's phone number from the database
    const phoneNumber = admin.phoneNumber;

    if (admin.phoneVerified) {
      return res
        .status(400)
        .json({ message: `${phoneNumber} number is already verified` });
    }

    // Clear any existing reset codes
    admin.phoneVerificationCode = undefined;
    admin.phoneVerificationCodeExpiry = undefined;
    await admin.save();

    // Generate OTP code (you can use any OTP generation library)
    const otp = generateOtp();

    // Set the reset code and expiry on the admin
    admin.phoneVerificationCode = otp;
    admin.phoneVerificationCodeExpiry = Date.now() + 3600000; // 1 hour
    await admin.save();

    // Send SMS message using Twilio
    await client.messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: `Your SnapFuel OTP code is: ${otp}`,
    });

    // Return success message
    res.status(200).json({ message: "SMS OTP sent successfully" });
  } catch (err) {
    console.error(err);
    // Return error message with details
    res.status(500).json({ message: `Failed to send SMS OTP: ${err.message}` });
  }
});

// Helper function to generate OTP code
function generateOtp() {
  // Generate 6-digit random number
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
}

// Export router
module.exports = router;
