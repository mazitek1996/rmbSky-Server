



const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require("uuid");
const RMBSky = "RS";

const countrySchema = new Schema({
  _id: {
    type: String,
    default: () => {
      const uuid = uuidv4().replace(/-/g, "");
      const customId = `${RMBSky}${uuid.substring(2, 12)}`;
      return customId;
    },
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  flagUrl: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 3,
    uppercase: true,
  },
  dialingCode: {
    type: String,
    trim: true,
  },
  
  currencies: [{
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },
    name: String,
    symbol: String,
    minorUnit: String,
  }],
  
  locale: {
    type: String,
    default: "en-US",
    trim: true,
  },
}, {
  timestamps: true
});

const Country = mongoose.model("Country", countrySchema);

module.exports = Country;