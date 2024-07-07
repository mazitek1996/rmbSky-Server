


const express = require("express");
const router = express.Router();
const Shipment = require("../../model/shipment"); // Ensure the path is correctly pointed to your Shipment model

// Route to track a shipment by tracking number
router.get("/:trackingNumber", async (req, res) => {
    try {
        const trackingNumber = req.params.trackingNumber;
        const shipment = await Shipment.findOne({ trackingNumber: trackingNumber })
            .populate('sender.country') // Assuming 'sender.country' is the field in your sender subdocument
            .populate('receiver.country') // Assuming 'receiver.country' is the field in your receiver subdocument
            .populate('shipmentDetails.origin') // Assuming you have an origin field under shipmentDetails
            .populate('shipmentDetails.destination'); // Assuming you have a destination field under shipmentDetails

        if (!shipment) {
            return res.status(404).json({ message: "Shipment not found with provided tracking number." });
        }

        // Respond with the entire populated shipment object
        res.status(200).json(shipment);
    } catch (error) {
        console.error("Error tracking shipment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
