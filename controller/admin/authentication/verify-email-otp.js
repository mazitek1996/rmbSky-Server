//Email OTP Verification Route

const express = require("express");
const router = express.Router();
const Admin = require("../../../models/admin");

router.post("/", async (req, res) => {
  try {
    const { email, emailVerificationCode } = req.body;

    if (!email || !emailVerificationCode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const admin = await Admin.findOne({ email });

    if (admin.emailVerified) {
      return res.status(200).json({ message: `${email} is already verified` });
    }

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const now = new Date();

    if (
      !admin.emailVerificationCode ||
      admin.emailVerificationCode !== emailVerificationCode ||
      now > admin.emailVerificationCodeExpiry
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    admin.emailVerificationCode = undefined;
    admin.emailVerificationCodeExpiry = undefined;
    admin.emailVerified = true;
    await admin.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error verifying OTP" });
  }
});

module.exports = router;
