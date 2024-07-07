const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Admin = require("../../../models/admin");

router.post("/", async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    //Find the admin by the reset token
    const admin = await Admin.findOne({ passwordResetToken: token });

    if (!admin) {
      return res.status(404).json({ error: "Invalid token" });
    }
    //Check if the token has expired
    const passwordResetTokenExpiry = new Date(admin.passwordResetTokenExpiry);
    if (passwordResetTokenExpiry < new Date()) {
      return res.status(401).json({ error: "Token has expired" });
    }

    //Check if the password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    //Hash the new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    // Update the admin's password and remove the reset token and expiry
    admin.password = hashedPassword;
    admin.passwordResetToken = undefined;
    admin.passwordResetTokenExpiry = undefined;
    await admin.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ error: "Error resetting password" });
  }
});

module.exports = router;