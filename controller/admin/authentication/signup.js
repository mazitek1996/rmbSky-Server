const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../../../model/admin");
const nodemailer = require("nodemailer");
const uuid = require("uuid");
const crypto = require("crypto");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } =
      req.body;

    // Validate input
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (!/^\d{11}$/.test(phoneNumber)) {
      return res
        .status(400)
        .json({ error: "phoneNumber number must be 11 digits" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    // Check if email or phoneNumber is already in use
    const existingAdmin = await Admin.findOne({
      $or: [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }],
    });
    if (existingAdmin) {
      return res.status(400).json({
        error: "Email or phoneNumber is already in use, sign in instead",
      });
    }

    // Generate OTP
    // const emailVerificationCode = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
    const emailVerificationCode = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

    // Set OTP expiry to 5 minutes from now
    const emailVerificationCodeExpiry = new Date();
    emailVerificationCodeExpiry.setMinutes(
      emailVerificationCodeExpiry.getMinutes() + 60
    );

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin object
    const id = uuid.v4();
    const newAdmin = new Admin({
      id,
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      emailVerificationCode,
    });

    // Send OTP to new admin's email
    await sendOTPEmail(newAdmin);

    // Save the new admin to the database
    await newAdmin.save();

    res.status(200).json({ success: "signup successful" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
});

async function sendOTPEmail(admin) {
  try {
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
      subject: "ValleyBank OTP",
      html: `
        <div style="background-color: #f5f5f5; padding: 20px;">
          <div style="text-align: center;">
            <img src="https://ValleyBanks.com/assets/snaplogo-53a2cf90.png" alt="ValleyBank Logo" style="max-width: 200px;">
          </div>
          <div style="background-color: #ffffff; border-radius: 4px; padding: 20px; margin-top: 20px;">
            <h2 style="color: #333333; margin-bottom: 20px;">ValleyBank OTP</h2>
            <p style="margin-bottom: 10px;">Hello ${admin.firstName},</p>
            <p style="margin-bottom: 10px;">Your OTP for ValleyBank is <strong>${admin.emailVerificationCode}</strong>.</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <p style="font-size: 12px; color: #777777;">This email is automatically generated. Please do not reply.</p>
            <p style="font-size: 12px; color: #777777;">© 2023 ValleyBank. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to send OTP email: " + err.message);
  }
}

module.exports = router;
