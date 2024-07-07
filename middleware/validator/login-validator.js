



const { body, validationResult } = require("express-validator");

const validateLoginInput = [
    body("email").optional().isEmail().withMessage("Invalid email format"),
    body("phoneNumber")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid phone number"),
    body("password").notEmpty().withMessage("Password is required"),
  ];

  
  module.exports = {validationResult,validateLoginInput }