

const express = require("express");
const router = express.Router();
const Shipment = require("../../model/shipment");
const { body, validationResult } = require('express-validator');
const { authenticateAdmin } = require("../../middleware/authentication/admin-auth");
const TrackingHistory = require("../../model/trackingHistory"); // Ensure the path is correctly pointed to your TrackingHistory model





// Enhanced route to create a new shipment with comprehensive validation
router.post("/", [
    // Validation rules
    body('sender.name').notEmpty().withMessage('Sender name is required'),
    body('sender.phone').notEmpty().withMessage('Sender phone is required'),
    body('sender.address').notEmpty().withMessage('Sender address is required'),
    body('sender.country').notEmpty().withMessage('Sender country is required'),
    body('sender.email').isEmail().withMessage('Sender email is invalid'),
    body('receiver.name').notEmpty().withMessage('Receiver name is required'),
    body('receiver.phone').notEmpty().withMessage('Receiver phone is required'),
    body('receiver.address').notEmpty().withMessage('Receiver address is required'),
    body('receiver.streetAddress').notEmpty().withMessage('Receiver street address is required'),
    body('receiver.city').notEmpty().withMessage('Receiver city is required'),
    body('receiver.state').notEmpty().withMessage('Receiver state is required'),
    body('receiver.country').notEmpty().withMessage('Receiver country is required'),
    body('shipmentDetails.type').notEmpty().withMessage('Shipment type is required'),
    body('shipmentDetails.weight').isNumeric().withMessage('Weight must be a number'),
    body('shipmentDetails.courier').notEmpty().withMessage('Courier is required'),
    body('shipmentDetails.packages').isNumeric().withMessage('Packages must be a number'),
    body('shipmentDetails.mode').notEmpty().withMessage('Mode is required'),
    body('shipmentDetails.product').notEmpty().withMessage('Product is required'),
    body('shipmentDetails.quantity').isNumeric().withMessage('Quantity must be a number'),
    body('shipmentDetails.paymentMode').notEmpty().withMessage('Payment mode is required'),
    body('shipmentDetails.totalFreight').isNumeric().withMessage('Total freight must be a number'),
    body('shipmentDetails.carrier').notEmpty().withMessage('Carrier is required'),
    body('shipmentDetails.departureTime').isISO8601().withMessage('Departure time is invalid'),
    body('shipmentDetails.origin').notEmpty().withMessage('Origin is required'),
    body('shipmentDetails.destination').notEmpty().withMessage('Destination is required'),
    body('shipmentDetails.pickupDate').isISO8601().withMessage('Pickup date is invalid'),
    body('shipmentDetails.expectedDeliveryDate').isISO8601().withMessage('Expected delivery date is invalid'),
    body('shipmentDetails.status').notEmpty().withMessage('Status is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check for existing tracking number
        const existingShipment = await Shipment.findOne({ trackingNumber: req.body.trackingNumber });
        if (existingShipment) {
            return res.status(409).json({ error: "A shipment with this tracking number already exists" });
        }

        const newShipment = new Shipment(req.body);
        await newShipment.save();
        res.status(201).json({ message: "Shipment created successfully", data: newShipment });
    } catch (error) {
        console.error("Error creating shipment:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
});

module.exports = router;








// Enhanced route to create a new shipment with comprehensive validation
// router.post("/", [
   
// ],  async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     try {
//         // Check for existing tracking number
//         const existingShipment = await Shipment.findOne({ trackingNumber: req.body.trackingNumber });
//         if (existingShipment) {
//             return res.status(409).json({ error: "A shipment with this tracking number already exists" });
//         }

//         const newShipment = new Shipment(req.body);
//         await newShipment.save();
//         res.status(201).json({ data: newShipment });
//     } catch (error) {
//         console.error("Error creating shipment:", error);
//         res.status(500).json({ error: "Internal server error", message: error.message });
//     }
// });


// // Route to get all shipments
// router.get("/", async (req, res) => {
//     try {
//         const shipments = await Shipment.find();
//         res.status(200).json(shipments);
//     } catch (error) {
//         console.error("Error fetching shipments:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // Route to get a specific shipment by ID
// router.get("/:shipmentId", async (req, res) => {
//     try {
//         const shipment = await Shipment.findById(req.params.shipmentId);
//         if (!shipment) {
//             return res.status(404).json({ error: "Shipment not found" });
//         }
//         res.status(200).json(shipment);
//     } catch (error) {
//         console.error("Error fetching shipment:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });


// // Route to get all shipments
// router.get("/", async (req, res) => {
//   try {
//       const shipments = await Shipment.find()
//           .populate('sender.country')
//           .populate('receiver.country')
//           .populate('shipmentDetails.origin')
//           .populate('shipmentDetails.destination')
//           .populate({
//               path: 'trackingHistory',
//               populate: {
//                   path: 'location.country',
//                   model: 'Country'
//               }
//           });
          
//       res.status(200).json(shipments);
//   } catch (error) {
//       console.error("Error fetching shipments:", error);
//       res.status(500).json({ error: "Internal server error" });
//   }
// });


// Route to get all shipments
router.get("/", async (req, res) => {
  try {
      const shipments = await Shipment.find()
          .populate('sender.country')
          .populate('receiver.country')
          .populate('shipmentDetails.origin')
          .populate('shipmentDetails.destination')
          .populate({
              path: 'trackingHistory',
              populate: {
                  path: 'location.country',
                  model: 'Country'
              }
          });

      console.log(shipments); // Add this line to log shipments

      res.status(200).json(shipments);
  } catch (error) {
      console.error("Error fetching shipments:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});


// Route to get a specific shipment by ID
router.get("/:shipmentId", async (req, res) => {
  try {
      const shipment = await Shipment.findById(req.params.shipmentId)
          .populate('sender.country')
          .populate('receiver.country')
          .populate('shipmentDetails.origin')
          .populate('shipmentDetails.destination')
          .populate({
              path: 'trackingHistory',
              populate: {
                  path: 'location.country',
                  model: 'Country'
              }
          });
      if (!shipment) {
          return res.status(404).json({ error: "Shipment not found" });
      }
      res.status(200).json(shipment);
  } catch (error) {
      console.error("Error fetching shipment:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});


// Route to update a shipment
router.put("/:shipmentId", async (req, res) => {
    try {
        const updatedShipment = await Shipment.findByIdAndUpdate(req.params.shipmentId, req.body, { new: true });
        if (!updatedShipment) {
            return res.status(404).json({ error: "Shipment not found" });
        }
        res.status(200).json(updatedShipment);
    } catch (error) {
        console.error("Error updating shipment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// router.patch("/:shipmentId/status", authenticateAdmin, async (req, res) => {
//     const { status } = req.body; // Assuming only status is sent in the request body
//     try {
//         const updatedShipment = await Shipment.findByIdAndUpdate(req.params.shipmentId, { 'shipmentDetails.status': status }, { new: true });

//         if (!updatedShipment) {
//             return res.status(404).json({ error: "Shipment not found" });
//         }
        
//         // Optionally add logic to handle notifications or other business logic triggered by a status change
//         // e.g., send email notifications, update logs, etc.

//         res.status(200).json({ message: "Shipment status updated successfully", data: updatedShipment });
//     } catch (error) {
//         console.error("Error updating shipment status:", error);
//         res.status(500).json({ error: "Internal server error", message: error.message });
//     }
// });

router.patch("/:shipmentId/status", authenticateAdmin, async (req, res) => {
    const { status, location, comments, handledBy } = req.body;
  
    try {
      // Find the shipment first
      const shipment = await Shipment.findById(req.params.shipmentId);
      if (!shipment) {
        return res.status(404).json({ error: "Shipment not found" });
      }
  
      // Update shipment status
      shipment.shipmentDetails.status = status;
  
      // Create a new tracking history entry
      const trackingHistory = new TrackingHistory({
        status,
        location,
        comments,
        handledBy,
        timestamp: new Date() // Automatically add the current timestamp
      });
  
      const savedTrackingHistory = await trackingHistory.save();
  
      // Update the shipment with the new tracking history entry
      shipment.trackingHistory.push(savedTrackingHistory._id);
      const updatedShipment = await shipment.save();
  
      res.status(200).json({ message: "Shipment status and tracking history updated successfully", data: updatedShipment });
    } catch (error) {
      console.error("Error updating shipment status and tracking history:", error);
      res.status(500).json({ error: "Internal server error", message: error.message });
    }
  });
// Route to update tracking history
router.post("/:trackingNumber/history", async (req, res) => {
    try {
      const { status, location, comments, handledBy } = req.body;
      const trackingNumber = req.params.trackingNumber;
  
      const trackingHistory = new TrackingHistory({
        status,
        location,
        comments,
        handledBy
      });
  
      const savedTrackingHistory = await trackingHistory.save();
  
      const shipment = await Shipment.findOneAndUpdate(
        { trackingNumber },
        { $push: { trackingHistory: savedTrackingHistory._id } },
        { new: true, useFindAndModify: false }
      ).populate('trackingHistory');
  
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found with provided tracking number." });
      }
  
      res.status(200).json(shipment);
    } catch (error) {
      console.error("Error updating tracking history:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


// Route to delete a shipment
router.delete("/:shipmentId", async (req, res) => {
    try {
        const deletedShipment = await Shipment.findByIdAndDelete(req.params.shipmentId);
        if (!deletedShipment) {
            return res.status(404).json({ error: "Shipment not found" });
        }
        res.status(200).json({ message: "Shipment deleted successfully" });
    } catch (error) {
        console.error("Error deleting shipment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
