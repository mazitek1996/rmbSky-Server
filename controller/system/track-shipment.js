

// module.exports = router;


const express = require("express");
const router = express.Router();
const Shipment = require("../../model/shipment");

// Route to track a shipment by tracking number
router.get("/:trackingNumber", async (req, res) => {
  try {
    const trackingNumber = req.params.trackingNumber;
    const shipment = await Shipment.findOne({ trackingNumber })
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
      }); // Populate tracking history with nested population for country

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found with provided tracking number." });
    }

    // Respond with the entire populated shipment object including tracking history
    res.status(200).json(shipment);
  } catch (error) {
    console.error("Error tracking shipment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
