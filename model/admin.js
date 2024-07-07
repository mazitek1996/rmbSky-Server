const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require("uuid");

const QuickCart = "RS";

const adminSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => `${QuickCart}${uuidv4().replace(/-/g, "").substring(2, 12)}`,
    },

    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 15,
    },
  
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
    },
    passwordResetToken: {
      type: String,
      trim: true,
    },
    passwordResetTokenExpiry : {
      type: Date,
    },
    emailVerificationCode: {
      // Field to store the email verification code
      type: String,
      trim: true,
    },
    isEmailVerified: {
      // Indicator for email verification status
      type: Boolean,
      default: false,
    },
    emailOTPCreatedAt: {
      type: Date,
    },
    emailOTPExpiryTime:  {
      type: Date,
    },

    lastLogin: {
      type: Date,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Add more fields as needed
  },
  { timestamps: true }
);

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
