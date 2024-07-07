

const express = require("express");
const router = express.Router();
const Shipment = require("../../model/shipment");
const { body, validationResult } = require('express-validator');
const { authenticateAdmin } = require("../../middleware/authentication/admin-auth");

// Enhanced route to create a new shipment with comprehensive validation
router.post("/", [
    body('receiver.name').notEmpty().withMessage('Receiver name is required'),
    body('shipmentDetails.type').isIn(['Air', 'Freight', 'Ship', 'Van']).withMessage('Invalid type specified')
], authenticateAdmin, async (req, res) => {
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
        res.status(201).json({ data: newShipment });
    } catch (error) {
        console.error("Error creating shipment:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
});

module.exports = router;

// Route to get all shipments
router.get("/", async (req, res) => {
    try {
        const shipments = await Shipment.find();
        res.status(200).json(shipments);
    } catch (error) {
        console.error("Error fetching shipments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to get a specific shipment by ID
router.get("/:shipmentId", async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.shipmentId);
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

router.patch("/:shipmentId/status", authenticateAdmin, async (req, res) => {
    const { status } = req.body; // Assuming only status is sent in the request body
    try {
        const updatedShipment = await Shipment.findByIdAndUpdate(req.params.shipmentId, { 'shipmentDetails.status': status }, { new: true });

        if (!updatedShipment) {
            return res.status(404).json({ error: "Shipment not found" });
        }
        
        // Optionally add logic to handle notifications or other business logic triggered by a status change
        // e.g., send email notifications, update logs, etc.

        res.status(200).json({ message: "Shipment status updated successfully", data: updatedShipment });
    } catch (error) {
        console.error("Error updating shipment status:", error);
        res.status(500).json({ error: "Internal server error", message: error.message });
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
