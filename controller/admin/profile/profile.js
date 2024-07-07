

const express = require("express");
const router = express.Router();
const User = require("../../../models/admin");
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
router.post("/profilePicture", authenticateAdmin, authorizeAdmin, async (req, res) => {
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
        // Extract the filename from the profilePicture URL
        const previousprofilePicturePath = user.profilePicture.split("/");
        const folder = previousprofilePicturePath[0]; // Assuming the folder structure "userImage/filename"
        const filename = previousprofilePicturePath[1];

        // Delete previous profile profilePicture if it exists
        if (user.profilePicture) {
          const deleteParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${folder}/${filename}`,
          };
          await s3.deleteObject(deleteParams).promise();
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

module.exports = router;