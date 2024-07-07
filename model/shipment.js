// const mongoose = require("mongoose");
// const { Schema } = mongoose;
// const { v4: uuidv4 } = require("uuid");

// const trackingPrefix = "rms";
// const carrierPrefix = "CRN";

// const shipmentSchema = new Schema({
//   _id: {
//     type: String,
//     default: () => `RS${uuidv4().replace(/-/g, "").substring(2, 12)}`,
//   },

//   trackingNumber: {
//     type: String,
//     required: true,
//     unique: true,
//     default: () => `${trackingPrefix}${Math.floor(1000000000 + Math.random() * 9000000000)}`, // Generates a random 10-digit number prefixed by "rms"
//   },
//   carrierReferenceNo: {
//     type: String,
//     required: true,
//     default: () => `${carrierPrefix}${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`, // Generates a number prefixed by "CRN" and the current year
//   },
//   sender: {
//     name: String,
//     phone: String,
//     address: String,
//     email: String
//   },
//   receiver: {
//     name: String,
//     phone: String,
//     address: String,
//     streetAddress: String,
//     city: String,
//     state: String,
//     country: String
//   },
//   shipmentDetails: {
//     type: {
//       type: String,
//       enum: ['Air', 'Freight', 'Ship', 'Van'],
//       required: true
//     },
//     weight: Number,
//     courier: String,
//     packages: Number,
//     mode: {
//       type: String,
//       enum: ['Air', 'Ship', 'Land'],
//       required: true
//     },
//     product: String,
//     quantity: Number,
//     paymentMode: {
//       type: String,
//       enum: ['Bank deposit', 'Transfer', 'Cheque'],
//       required: true
//     },
//     totalFreight: Number,
//     carrier: {
//       type: String,
//       enum: ['RMBSky', 'DHL', 'FedEx'],
//       required: true
//     },
//     departureTime: Date,
//     origin: String,
//     destination: String,
//     pickupDate: Date,
//     expectedDeliveryDate: Date,
//     status: {
//       type: String,
//       enum: ['Pending', 'In Transit', 'Delivered', 'Cancelled'],
//       default: 'Pending'
//     },
//     comments: String
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date
//   }
// });

// module.exports = mongoose.model("Shipment", shipmentSchema);



const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require("uuid");

const trackingPrefix = "rms";
const carrierPrefix = "CRN";

const shipmentSchema = new Schema({
  _id: {
    type: String,
    default: () => `RS${uuidv4().replace(/-/g, "").substring(2, 12)}`,
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `${trackingPrefix}${Math.floor(1000000000 + Math.random() * 9000000000)}`, // Generates a random 10-digit number prefixed by "rms"
  },
  carrierReferenceNo: {
    type: String,
    required: true,
    default: () => `${carrierPrefix}${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`, // Generates a number prefixed by "CRN" and the current year
  },
  sender: {
    name: String,
    phone: String,
    address: String,
    email: String,
    country: {
        type: String,
        ref: 'Country'  // Referencing Country model
      }
  },
  receiver: {
    name: String,
    phone: String,
    address: String,
    streetAddress: String,
    city: String,
    state: String,
    country: {
      type: String,
      ref: 'Country'  // Referencing Country model
    }
  },
  shipmentDetails: {
    type: {
      type: String,
      enum: ['Air', 'Freight', 'Ship', 'Van'],
      required: true
    },
    weight: Number,
    courier: String,
    packages: Number,
    mode: {
      type: String,
      enum: ['Air', 'Ship', 'Land'],
      required: true
    },
    product: String,
    quantity: Number,
    paymentMode: {
      type: String,
      enum: ['Bank deposit', 'Transfer', 'Cheque'],
      required: true
    },
    totalFreight: Number,
    carrier: {
      type: String,
      enum: ['RMBSky', 'DHL', 'FedEx'],
      required: true
    },
    departureTime: Date,
    origin: {
      type: String,
      ref: 'Country'  // Referencing Country model
    },
    destination: {
      type: String,
      ref: 'Country'  // Referencing Country model
    },
    pickupDate: Date,
    expectedDeliveryDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'In Transit', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    comments: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

module.exports = mongoose.model("Shipment", shipmentSchema);
