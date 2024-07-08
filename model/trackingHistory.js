
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require("uuid");
const RMBSky = "RS";

const trackingHistorySchema = new Schema({

    _id: {
        type: String,
        default: () => {
          const uuid = uuidv4().replace(/-/g, "");
          const customId = `${RMBSky}${uuid.substring(2, 12)}`;
          return customId;
        },
      },
      status: {
        type: String,
        enum: [
          'Picked Up',"Pending", 'Arrived Facility', 'Booked', 'Processed At Facility', 'Dispatched', 'On Hold', 
          'Customs Checking', 'Customs Checking Completed', 'Scanning', 'Departed', 'Arrived Airport', 
          'Security Evaluation', 'Processing Parcel Release', 'Awaiting Departure', 'Awaiting Exit', 
          'Out For Delivery', 'In Transit', 'Arrived at facility', 'Out for delivery', 'Delivered', 
          'Cancelled'
        ],
        required: true
      },
  timestamp: {
    type: Date,
    default: Date.now
  },
  location: {
    city: String,
    country: String // You can also reference the Country model if needed
  },
  comments: String,
  handledBy: String
}, { _id: false });

module.exports = mongoose.model("TrackingHistory", trackingHistorySchema);
