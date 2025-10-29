import express from "express";
import { searchFlights, searchAirports } from "../utils/amadeusClient.js";

const router = express.Router();

// POST /api/flights/search
router.post("/search", async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      travelClass,
      max = 10,
      currency = "USD",
      nonStop,
    } = req.body;

    console.log("Flight search request:", req.body);

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        error: "origin, destination and departureDate are required",
      });
    }

    const params = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults: parseInt(adults),
      max: parseInt(max),
      currencyCode: currency,
    };

    if (returnDate) params.returnDate = returnDate;
    if (travelClass) params.travelClass = travelClass;
    if (typeof nonStop !== "undefined") params.nonStop = nonStop;

    console.log("Calling Amadeus with params:", params);

    const data = await searchFlights(params);
    console.log(
      "Amadeus response received:",
      data?.data?.length || 0,
      "flights"
    );

    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    console.error(
      "Flight search error:",
      err?.response?.data || err.message || err
    );
    const status = err?.response?.status || 500;
    const errorMessage =
      err?.response?.data?.errors?.[0]?.detail ||
      err?.response?.data ||
      err.message;
    res.status(status).json({
      success: false,
      error: errorMessage,
    });
  }
});

// GET /api/flights/airports?keyword=london
router.get("/airports", async (req, res) => {
  try {
    const { keyword } = req.query;

    console.log("Airport search request for:", keyword);

    if (!keyword || keyword.length < 2) {
      return res.status(400).json({
        success: false,
        error: "keyword must be at least 2 characters",
      });
    }

    const data = await searchAirports(keyword);
    console.log("Airport search response:", data?.data?.length || 0, "results");

    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    console.error(
      "Airport search error:",
      err?.response?.data || err.message || err
    );
    const status = err?.response?.status || 500;
    const errorMessage =
      err?.response?.data?.errors?.[0]?.detail ||
      err?.response?.data ||
      err.message;
    res.status(status).json({
      success: false,
      error: errorMessage,
    });
  }
});

export default router;
