

const express = require("express");
const router = express.Router();
const axios = require("axios");
const Country = require("../../model/country");

// Route to save countries
router.post("/", async (req, res) => {
  try {
    let page = 1;
    let totalPages = Infinity;

    while (page <= totalPages) {
      // Fetch data from the API for the current page
      const response = await axios.get(
        `https://restcountries.com/v3.1/all?page=${page}`
      );
      const countriesData = response.data;

      // Update totalPages based on the API response
      totalPages = response.headers["total-pages"];

      // Process and save data to the database
      for (const countryData of countriesData) {
        const country = new Country({
          name: countryData.name.common,
          code: countryData.cca3,
          dialingCode: countryData.dialingCodes
            ? countryData.dialingCodes[0]
            : "",
          currencies: countryData.currencies
            ? Object.entries(countryData.currencies).map(
                ([code, currency]) => ({
                  code,
                  name: currency.name,
                  symbol: currency.symbol,
                  minorUnit: currency.minorUnit || "",
                })
              )
            : [],
          locale: countryData.locale ? countryData.locale : "en-US",
          flagUrl: countryData.flags ? countryData.flags.svg : "",
          // Add other relevant fields as needed
        });
        await country.save();
      }

      // Move to the next page
      page++;
    }

    res.status(200).json({ message: "Countries saved successfully" });
  } catch (error) {
    console.error("Error saving countries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get all countries
router.get("/", async (req, res) => {
  try {
    const countries = await Country.find();
    res.status(200).json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get details of a specific country by ID
router.get("/:countryId", async (req, res) => {
  const countryId = req.params.countryId;
  try {
    const country = await Country.findById(countryId);
    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }
    res.status(200).json(country);
  } catch (error) {
    console.error("Error fetching country details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;