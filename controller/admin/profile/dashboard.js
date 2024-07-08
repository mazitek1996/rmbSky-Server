

const express = require("express");
const router = express.Router();
const User = require("../../../model/admin");
const multer = require("multer");
const path = require("path");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid"); // For generating unique filenames
const { authenticateAdmin, authorizeAdmin } = require("../../../middleware/authentication/admin-auth");

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single("profilePicture");

const checkFileType = (file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extnameMatches = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  console.log('File extension:', path.extname(file.originalname).toLowerCase());
console.log('File mimetype:', file.mimetype);

  const mimetypeMatches = allowedFileTypes.test(file.mimetype);

  if (mimetypeMatches && extnameMatches) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images are allowed."));
  }
};
// Route for uploading and updating the profile image
router.post("/profilePicture",  authenticateAdmin, authorizeAdmin, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    upload(req, res, async (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res.status(400).send({ message: err.message });
      }
      if (req.file) {
        // Check if profilePicture field exists
        if (user.profilePicture) {
          // Extract the filename from the profilePicture URL
          if (typeof user.profilePicture === 'string') {
            const previousprofilePicturePath = user.profilePicture.split("/");
            const folder = previousprofilePicturePath[0]; // Assuming the folder structure "userImage/filename"
            const filename = previousprofilePicturePath[1];
  
            // Delete previous profile profilePicture if it exists
            const deleteParams = {
              Bucket: process.env.BUCKET_NAME,
              Key: `${folder}/${filename}`,
            };
            await s3.deleteObject(deleteParams).promise();
          }
        }
  
        // Upload the new profilePicture to AWS S3
        const newFolder = "adminImage"; // Change this to your desired folder structure
        const uniqueFilename = `${uuidv4()}${path.extname(req.file.originalname)}`;
        const uploadParams = {
          Bucket: process.env.BUCKET_NAME,
          Key: `${newFolder}/${uniqueFilename}`,
          Body: req.file.buffer,
        };
        await s3.upload(uploadParams).promise();
  
        // Update the user's profilePicture URL
        const profilePictureUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${newFolder}/${uniqueFilename}`;
        user.profilePicture = profilePictureUrl;
        await user.save();
  
        console.log("profilePicture uploaded successfully.");
        return res.send({ message: "User successfully updated", profilePictureUrl });
      }
      return res.send({ message: "No file selected." });
    });
  } catch (err) {
    console.error("Internal server error:", err);
    return res.status(500).send({ message: "Internal server error" });
  }
});


// GET request to get admin by ID
router.get("/", authenticateAdmin, authorizeAdmin, async (req, res) => {
  try {
    const userId = req.userId; // Retrieve the userId from the req object

    if (!userId) {
      return res.status(401).json({ message: "Admin ID not found in token" });
    }

    // Find the admin in the database by ID
    const admin = await User.findById(userId);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Return admin data
    return res.status(200).json({ admin });
  } catch (err) {
    console.error(err);
    // If the token is invalid or the admin is not found, return an error message
    return res.status(401).json({ message: err.message });
  }
});

// Patch request to update admin by ID
router.patch("/", authenticateAdmin, async (req, res) => {
  try {
    const userId = req.userId; // Retrieve the userId from the req object

    // Find the admin in the database by ID
    const admin = await User.findById(userId);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Update the admin with the new data from the request body
    Object.assign(admin, req.body);
    await admin.save();

    // Return success message
    return res.status(200).json({ message: "Admin updated" });
  } catch (err) {
    console.error(err);
    // If the token is invalid or the admin is not found, return error message
    return res.status(401).json({ message: "Invalid token" });
  }
});

// DELETE request to delete admin by ID
router.delete("/", authenticateAdmin, async (req, res) => {
  try {
    // Get the JWT token from the request headers
    const userId = req.userId;

    // Find the admin by ID
    const admin = await User.findById(userId);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Extract the filename from the profilePicture URL
    if (admin.profilePicture) {
      const profilePicturePath = admin.profilePicture.split("/");
      const folder = profilePicturePath[0];
      const filename = profilePicturePath[1];

      // Delete the profile picture from S3
      const deleteParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${folder}/${filename}`,
      };
      await s3.deleteObject(deleteParams).promise();
    }

    // Delete the admin from the database
    await User.findByIdAndDelete(userId);

    // Return success message
    return res.status(200).json({ success: "Admin successfully deleted" });
  } catch (err) {
    console.error(err);
    // If the token is invalid or the admin is not found, return error message
    return res.status(401).json({ message: "Invalid token" });
  }
});


// Route for changing the password
router.post("/password", authenticateAdmin, async (req, res) => {
  try {
    // Get the JWT token from the request headers
    const userId = req.userId;

    // Find the admin in the database by ID
    const admin = await User.findById(userId);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Compare the current password with the hashed password in the database
    const isMatch = await bcrypt.compare(
      req.body.currentPassword,
      admin.password
    );

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Check if the new password and the confirmation password match
    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).json({
        message: "New password and confirmation password do not match",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    // Update the admin's password in the database
    admin.password = hashedPassword;
    await admin.save();

    // Return success message
    return res.status(200).json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    // If the token is invalid or the admin is not found, return error message
    return res.status(401).json({ message: "Invalid token" });
  }
});


module.exports = router;
