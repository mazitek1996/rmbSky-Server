



const copyCountryRouter = require("../controller/system/country-scrapper")

const shipmentCRUDRouter = require("../controller/system/shipment-CRUD")

const shipmentTrackingRouter = require("../controller/system/track-shipment")

function systemRouter(app) {

app.use("/api/country/scraper", copyCountryRouter)

app.use("/api/shipment/crud", shipmentCRUDRouter)

app.use("/api/shipment/tracking", shipmentTrackingRouter)



}

module.exports = systemRouter