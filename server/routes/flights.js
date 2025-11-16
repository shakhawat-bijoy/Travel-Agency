import express from "express";
import { searchFlights, searchAirports, getBangladeshAirports } from "../utils/amadeusClient.js";
import Booking from '../models/Booking.js';

const router = express.Router();

// Simple in-memory cache for airport searches (expires after 1 hour)
const airportSearchCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Calculate relevance score for sorting results
function calculateRelevance(location, query) {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    const name = location.name.toLowerCase();
    const city = (location.address?.cityName || '').toLowerCase();
    const iataCode = location.iataCode.toLowerCase();
    
    // Exact IATA code match gets highest priority
    if (iataCode === lowerQuery) score += 100;
    else if (iataCode.startsWith(lowerQuery)) score += 50;
    
    // City name matches
    if (city === lowerQuery) score += 80;
    else if (city.startsWith(lowerQuery)) score += 40;
    else if (city.includes(lowerQuery)) score += 20;
    
    // Airport name matches
    if (name.startsWith(lowerQuery)) score += 30;
    else if (name.includes(lowerQuery)) score += 10;
    
    // Boost major international airports
    const majorAirports = ['jfk', 'lhr', 'cdg', 'dxb', 'sin', 'hnd', 'dac', 'cgp', 'bom', 'del'];
    if (majorAirports.includes(iataCode)) score += 15;
    
    return score;
}

// GET /api/flights/airports?query=london
router.get("/airports", async (req, res) => {
  try {
    const { query, limit = 20, country } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter must be at least 2 characters'
      });
    }

    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `${normalizedQuery}-${country || 'all'}-${limit}`;

    // Check cache first
    const cached = airportSearchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✓ Airport search cache hit for: ${query}`);
      return res.json({
        ...cached.data,
        cached: true
      });
    }

    console.log(`\n🔍 Airport search request for: "${query}"`);

    // Search airports using Amadeus API
    const amadeusResponse = await searchAirports(query, limit);
    console.log(`📊 Airport search response: ${amadeusResponse?.data?.length || 0} results`);
    
    if (amadeusResponse?.data) {
      console.log(`📋 Raw results:`, amadeusResponse.data.map(a => `${a.name} (${a.iataCode})`).join(', '));
    }

    if (!amadeusResponse.data || amadeusResponse.data.length === 0) {
      return res.json({
        success: true,
        data: [],
        total: 0,
        source: 'amadeus',
        query: query,
        message: 'No airports found'
      });
    }

    // Transform Amadeus airport data to our format
    // Note: searchAirports() already filters and returns only airports
    let transformedAirports = amadeusResponse.data.map(location => {
      const cityName = location.address?.cityName || location.name;
      const countryName = location.address?.countryName || location.address?.countryCode || '';
      
      return {
        id: location.iataCode,
        name: location.name,
        city: cityName,
        country: countryName,
        iataCode: location.iataCode,
        type: location.subType,
        timeZone: location.timeZoneOffset,
        geoCode: location.geoCode,
        detailedName: `${location.name} (${location.iataCode})`,
        cityCountry: `${cityName}, ${countryName}`,
        coordinates: location.geoCode ? {
          latitude: location.geoCode.latitude,
          longitude: location.geoCode.longitude
        } : null,
        // Add relevance score for better sorting
        relevance: calculateRelevance(location, normalizedQuery)
      };
    })
    .sort((a, b) => b.relevance - a.relevance); // Sort by relevance

    // Filter by country if specified
    if (country) {
      transformedAirports = transformedAirports.filter(airport =>
        airport.country?.toLowerCase().includes(country.toLowerCase()) ||
        airport.country?.toLowerCase() === country.toLowerCase()
      );
    }

    // Limit results
    transformedAirports = transformedAirports.slice(0, parseInt(limit));

    const responseData = {
      success: true,
      data: transformedAirports,
      total: transformedAirports.length,
      source: 'amadeus',
      query: query,
      country: country || null,
      cached: false
    };

    // Cache the result
    airportSearchCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    // Clean old cache entries (keep cache size manageable)
    if (airportSearchCache.size > 1000) {
      const oldestKeys = Array.from(airportSearchCache.keys()).slice(0, 100);
      oldestKeys.forEach(key => airportSearchCache.delete(key));
    }

    res.json(responseData);

  } catch (error) {
    console.error('Amadeus airport search error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error searching airports',
      error: error.response?.data?.errors?.[0]?.detail || error.message
    });
  }
});

// GET /api/flights/airports/bangladesh - Get all Bangladesh airports
router.get("/airports/bangladesh", async (req, res) => {
  try {
    console.log("Fetching Bangladesh airports...");

    // Get Bangladesh airports using Amadeus API
    const bangladeshAirports = await getBangladeshAirports();

    res.json({
      success: true,
      data: bangladeshAirports,
      total: bangladeshAirports.length,
      country: 'Bangladesh',
      source: 'amadeus'
    });

  } catch (error) {
    console.error('Bangladesh airports fetch error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching Bangladesh airports',
      error: error.response?.data || error.message
    });
  }
});

// GET /api/flights/popular-routes/bangladesh - Get popular flight routes from Bangladesh
router.get("/popular-routes/bangladesh", async (req, res) => {
  try {
    console.log("Fetching popular routes from Bangladesh...");

    // Popular international destinations from Bangladesh
    const popularRoutes = [
      {
        from: { code: 'DAC', name: 'Dhaka', airport: 'Hazrat Shahjalal International Airport' },
        to: { code: 'DXB', name: 'Dubai', airport: 'Dubai International Airport' },
        popularity: 95,
        averagePrice: { min: 420, max: 680, currency: 'USD' },
        airlines: ['EK', 'FZ', 'BG'],
        flightTime: 'PT7H30M'
      },
      {
        from: { code: 'DAC', name: 'Dhaka', airport: 'Hazrat Shahjalal International Airport' },
        to: { code: 'DOH', name: 'Doha', airport: 'Hamad International Airport' },
        popularity: 90,
        averagePrice: { min: 450, max: 720, currency: 'USD' },
        airlines: ['QR', 'BG'],
        flightTime: 'PT8H15M'
      },
      {
        from: { code: 'DAC', name: 'Dhaka', airport: 'Hazrat Shahjalal International Airport' },
        to: { code: 'KUL', name: 'Kuala Lumpur', airport: 'Kuala Lumpur International Airport' },
        popularity: 85,
        averagePrice: { min: 380, max: 580, currency: 'USD' },
        airlines: ['MH', 'AK', 'BG'],
        flightTime: 'PT3H45M'
      },
      {
        from: { code: 'DAC', name: 'Dhaka', airport: 'Hazrat Shahjalal International Airport' },
        to: { code: 'SIN', name: 'Singapore', airport: 'Singapore Changi Airport' },
        popularity: 80,
        averagePrice: { min: 420, max: 650, currency: 'USD' },
        airlines: ['SQ', 'BG', '3K'],
        flightTime: 'PT4H20M'
      },
      {
        from: { code: 'DAC', name: 'Dhaka', airport: 'Hazrat Shahjalal International Airport' },
        to: { code: 'BKK', name: 'Bangkok', airport: 'Suvarnabhumi Airport' },
        popularity: 75,
        averagePrice: { min: 350, max: 520, currency: 'USD' },
        airlines: ['TG', 'BG', 'FD'],
        flightTime: 'PT2H45M'
      },
      {
        from: { code: 'DAC', name: 'Dhaka', airport: 'Hazrat Shahjalal International Airport' },
        to: { code: 'LHR', name: 'London', airport: 'Heathrow Airport' },
        popularity: 70,
        averagePrice: { min: 680, max: 1200, currency: 'USD' },
        airlines: ['BA', 'VS', 'BG'],
        flightTime: 'PT11H30M'
      },
      {
        from: { code: 'CGP', name: 'Chittagong', airport: 'Shah Amanat International Airport' },
        to: { code: 'DXB', name: 'Dubai', airport: 'Dubai International Airport' },
        popularity: 65,
        averagePrice: { min: 480, max: 750, currency: 'USD' },
        airlines: ['EK', 'FZ'],
        flightTime: 'PT7H45M'
      },
      {
        from: { code: 'DAC', name: 'Dhaka', airport: 'Hazrat Shahjalal International Airport' },
        to: { code: 'JFK', name: 'New York', airport: 'John F. Kennedy International Airport' },
        popularity: 60,
        averagePrice: { min: 850, max: 1400, currency: 'USD' },
        airlines: ['EK', 'QR', 'TK'],
        flightTime: 'PT18H30M'
      },
      {
        from: { code: 'DAC', name: 'Dhaka', airport: 'Hazrat Shahjalal International Airport' },
        to: { code: 'IST', name: 'Istanbul', airport: 'Istanbul Airport' },
        popularity: 55,
        averagePrice: { min: 520, max: 820, currency: 'USD' },
        airlines: ['TK', 'BG'],
        flightTime: 'PT9H15M'
      },
      {
        from: { code: 'SYL', name: 'Sylhet', airport: 'Sylhet Osmani International Airport' },
        to: { code: 'LHR', name: 'London', airport: 'Heathrow Airport' },
        popularity: 50,
        averagePrice: { min: 720, max: 1300, currency: 'USD' },
        airlines: ['BG', 'BA'],
        flightTime: 'PT12H00M'
      }
    ];

    // Add domestic routes
    const domesticRoutes = [
      {
        from: { code: 'DAC', name: 'Dhaka', airport: 'Hazrat Shahjalal International Airport' },
        to: { code: 'CGP', name: 'Chittagong', airport: 'Shah Amanat International Airport' },
        popularity: 95,
        averagePrice: { min: 80, max: 150, currency: 'USD' },
        airlines: ['BG', 'US'],
        flightTime: 'PT1H15M',
        domestic: true
      },
      {
        from: { code: 'DAC', name: 'Dhaka', airport: 'Hazrat Shahjalal International Airport' },
        to: { code: 'CXB', name: "Cox's Bazar", airport: "Cox's Bazar Airport" },
        popularity: 85,
        averagePrice: { min: 90, max: 160, currency: 'USD' },
        airlines: ['BG', 'US'],
        flightTime: 'PT1H30M',
        domestic: true
      },
      {
        from: { code: 'DAC', name: 'Dhaka', airport: 'Hazrat Shahjalal International Airport' },
        to: { code: 'SYL', name: 'Sylhet', airport: 'Sylhet Osmani International Airport' },
        popularity: 75,
        averagePrice: { min: 70, max: 130, currency: 'USD' },
        airlines: ['BG', 'US'],
        flightTime: 'PT1H00M',
        domestic: true
      }
    ];

    const allRoutes = [...popularRoutes, ...domesticRoutes];

    res.json({
      success: true,
      data: {
        international: popularRoutes,
        domestic: domesticRoutes,
        all: allRoutes
      },
      total: allRoutes.length,
      country: 'Bangladesh',
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Popular routes fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular routes from Bangladesh',
      error: error.message
    });
  }
});

// GET /api/flights/airports/country/:countryCode - Get airports by country code
router.get("/airports/country/:countryCode", async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { limit = 50 } = req.query;

    console.log(`Fetching airports for country: ${countryCode}`);

    // Get airports by country code using Amadeus API
    const airports = await searchAirportsByCountry(countryCode.toUpperCase(), parseInt(limit));

    res.json({
      success: true,
      data: airports,
      total: airports.length,
      countryCode: countryCode.toUpperCase(),
      source: 'amadeus'
    });

  } catch (error) {
    console.error(`Country airports fetch error for ${countryCode}:`, error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: `Error fetching airports for country ${countryCode}`,
      error: error.response?.data || error.message
    });
  }
});

// GET /api/flights/airport/:iataCode - Get detailed airport information
router.get("/airport/:iataCode", async (req, res) => {
  try {
    const { iataCode } = req.params;

    console.log(`Fetching airport details for: ${iataCode}`);

    // Get detailed airport information using Amadeus API
    const airportDetails = await getAirportDetails(iataCode.toUpperCase());

    if (!airportDetails) {
      return res.status(404).json({
        success: false,
        message: `Airport with IATA code ${iataCode} not found`
      });
    }

    res.json({
      success: true,
      data: airportDetails,
      iataCode: iataCode.toUpperCase(),
      source: 'amadeus'
    });

  } catch (error) {
    console.error(`Airport details fetch error for ${iataCode}:`, error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: `Error fetching airport details for ${iataCode}`,
      error: error.response?.data || error.message
    });
  }
});





// GET /api/flights/results/:searchId - Fetch flight results from database
router.get("/results/:searchId", async (req, res) => {
  try {
    const { searchId } = req.params;

    console.log("Fetching flight results for search ID:", searchId);

    // Find the flight results in database
    const flightResult = await FlightResult.findOne({ searchId }).populate('searchId');

    if (!flightResult) {
      return res.status(404).json({
        success: false,
        message: 'Flight results not found'
      });
    }

    // Check if cache is still valid
    if (!flightResult.isValidCache()) {
      return res.status(410).json({
        success: false,
        message: 'Flight results have expired. Please search again.',
        expired: true
      });
    }

    res.json({
      success: true,
      data: {
        flights: flightResult.flights,
        meta: flightResult.meta,
        dictionaries: flightResult.dictionaries,
        searchId: searchId,
        searchParams: flightResult.searchId?.searchParams,
        cacheExpiry: flightResult.cacheExpiry,
        fromDatabase: true
      }
    });

  } catch (error) {
    console.error('Get flight results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flight results',
      error: error.message
    });
  }
});

// POST /api/flights/book
router.post("/book", async (req, res) => {
  try {
    const { flight, passengers, searchParams } = req.body;

    console.log("Flight booking request:", {
      flight: flight?.flightNumber,
      passenger: passengers?.passenger?.email,
      searchParams: searchParams
    });

    // Validate required data
    if (!flight || !passengers || !passengers.passenger || !passengers.payment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking data: flight, passenger, and payment information'
      });
    }

    // Validate passenger data
    const { passenger, payment } = passengers;
    if (!passenger.firstName || !passenger.lastName || !passenger.email || !passenger.phone || !passenger.dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Missing required passenger information'
      });
    }

    // Validate payment data
    if (!payment.cardNumber || !payment.expiryDate || !payment.cvv || !payment.cardholderName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    // Simulate payment processing (in real app, integrate with Stripe/PayPal)
    const paymentProcessed = await processPayment(payment, flight.price);

    if (!paymentProcessed.success) {
      return res.status(400).json({
        success: false,
        message: paymentProcessed.message || 'Payment processing failed'
      });
    }

    // Calculate total amount (flight price + taxes/fees)
    const flightPrice = parseFloat(flight.price.total);
    const taxesAndFees = 45.00; // Fixed for demo
    const totalAmount = flightPrice + taxesAndFees;

    // Log searchParams before processing
    console.log("SearchParams received:", searchParams);
    console.log("SearchParams type:", typeof searchParams);
    console.log("SearchParams stringified:", JSON.stringify(searchParams));

    // Get userId from authentication or request body
    let userId = req.user?.id || null;

    // If no userId from auth, try to get it from the request body
    if (!userId && req.body.userId) {
      userId = req.body.userId;
    }

    console.log('Creating booking with userId:', userId);

    // Create booking record
    const booking = new Booking({
      userId: userId,
      passenger: {
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        email: passenger.email,
        phone: passenger.phone,
        dateOfBirth: new Date(passenger.dateOfBirth),
        passportNumber: passenger.passportNumber || '',
        nationality: passenger.nationality || ''
      },
      flight: {
        // Basic flight information
        id: flight.id,
        flightNumber: flight.flightNumber,
        airline: flight.airline,
        airlineName: flight.airlineName,
        aircraftModel: flight.aircraftModel,
        aircraftCode: flight.aircraftCode,

        // Route information
        departureAirport: flight.departureAirport,
        arrivalAirport: flight.arrivalAirport,
        departureTime: new Date(flight.departureTime),
        arrivalTime: new Date(flight.arrivalTime),
        duration: flight.duration,
        stops: flight.stops,
        oneWay: flight.oneWay,

        // Location details
        departureLocation: flight.departureLocation,
        arrivalLocation: flight.arrivalLocation,
        stopLocations: flight.stopLocations || [],

        // Complete price information
        price: flight.price,

        // Complete itinerary information
        itineraries: flight.itineraries || [],

        // Additional flight metadata
        travelerPricings: flight.travelerPricings || [],
        validatingAirlineCodes: flight.validatingAirlineCodes || [],
        lastTicketingDate: flight.lastTicketingDate ? new Date(flight.lastTicketingDate) : null,
        numberOfBookableSeats: flight.numberOfBookableSeats,
        instantTicketingRequired: flight.instantTicketingRequired,
        nonHomogeneous: flight.nonHomogeneous,
        paymentCardRequired: flight.paymentCardRequired,
        fareDetailsBySegment: flight.fareDetailsBySegment || []
      },
      payment: {
        cardNumber: maskCardNumber(payment.cardNumber),
        cardholderName: payment.cardholderName,
        expiryDate: payment.expiryDate,
        transactionId: paymentProcessed.transactionId
      },
      searchParams: searchParams ? JSON.stringify(searchParams) : '{}',
      totalAmount,
      currency: flight.price.currency || 'USD',
      status: 'confirmed'
    });

    console.log("=== ATTEMPTING TO SAVE BOOKING ===");
    console.log("Booking Reference:", booking.bookingReference);
    console.log("Passenger Email:", booking.passenger.email);
    console.log("Flight Number:", booking.flight.flightNumber);
    console.log("Flight ID:", booking.flight.id);
    console.log("Flight Price:", booking.flight.price);
    console.log("Flight Itineraries Count:", booking.flight.itineraries?.length);
    console.log("Flight Stop Locations Count:", booking.flight.stopLocations?.length);
    console.log("SearchParams:", booking.searchParams);
    console.log("SearchParams Type:", typeof booking.searchParams);
    console.log("Total Amount:", booking.totalAmount);
    console.log("Currency:", booking.currency);
    console.log("=== END BOOKING DATA ===");

    await booking.save();

    // Send confirmation email (simulate)
    await sendBookingConfirmation(booking);

    console.log("Booking created successfully:", booking.bookingReference);

    res.json({
      success: true,
      data: {
        bookingReference: booking.bookingReference,
        status: booking.status,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        passenger: booking.passenger,
        flight: booking.flight,
        bookingDate: booking.bookingDate
      },
      message: 'Flight booked successfully'
    });

  } catch (error) {
    console.error('Flight booking error:', error);

    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));

      return res.status(400).json({
        success: false,
        message: 'Booking validation failed',
        errors: validationErrors,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error processing flight booking',
      error: error.message
    });
  }
});

// PUT /api/flights/bookings/link-user - Link bookings with null userId to a user by email
router.put("/bookings/link-user", async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({
        success: false,
        message: 'userId and email are required'
      });
    }

    console.log(`Linking bookings with email ${email} to userId ${userId}`);

    // Update bookings that have null userId but match the email
    const result = await Booking.updateMany(
      {
        userId: null,
        'passenger.email': email
      },
      {
        $set: { userId: userId }
      }
    );

    console.log(`Updated ${result.modifiedCount} bookings for user ${userId}`);

    res.json({
      success: true,
      message: `Successfully linked ${result.modifiedCount} bookings to user`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Link user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error linking bookings to user',
      error: error.message
    });
  }
});

// GET /api/flights/bookings/all - Get all bookings (for debugging)
router.get("/bookings/all", async (req, res) => {
  try {
    const bookings = await Booking.find({}).limit(10).sort({ bookingDate: -1 });

    console.log('All bookings in database:', bookings.map(b => ({
      id: b._id,
      userId: b.userId,
      email: b.passenger?.email,
      bookingReference: b.bookingReference,
      bookingDate: b.bookingDate
    })));

    res.json({
      success: true,
      data: bookings.map(b => ({
        id: b._id,
        userId: b.userId,
        email: b.passenger?.email,
        bookingReference: b.bookingReference,
        bookingDate: b.bookingDate,
        flight: {
          flightNumber: b.flight?.flightNumber,
          departureAirport: b.flight?.departureAirport,
          arrivalAirport: b.flight?.arrivalAirport
        }
      }))
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all bookings',
      error: error.message
    });
  }
});

// GET /api/flights/bookings/email/:email - Get bookings by email (fallback)
router.get("/bookings/email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 20 } = req.query;

    console.log('Fetching bookings for email:', email);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find({ 'passenger.email': email })
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments({ 'passenger.email': email });

    console.log(`Found ${bookings.length} bookings for email ${email}, total: ${total}`);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get bookings by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings by email',
      error: error.message
    });
  }
});

// GET /api/flights/bookings/:userId
router.get("/bookings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    console.log('Fetching bookings for userId:', userId);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // First try to find bookings by userId
    let bookings = await Booking.find({ userId })
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    let total = await Booking.countDocuments({ userId });

    // If no bookings found by userId, try to find by email (for bookings made without userId)
    if (bookings.length === 0) {
      console.log('No bookings found by userId, checking all bookings...');

      // Get all bookings to debug
      const allBookings = await Booking.find({}).limit(10);
      console.log('Sample bookings in database:', allBookings.map(b => ({
        id: b._id,
        userId: b.userId,
        email: b.passenger?.email,
        bookingReference: b.bookingReference
      })));
    }

    console.log(`Found ${bookings.length} bookings for user ${userId}, total: ${total}`);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user bookings',
      error: error.message
    });
  }
});

// GET /api/flights/bookings/all - Get all bookings (for debugging)
router.get("/bookings/all", async (req, res) => {
  try {
    const bookings = await Booking.find({}).limit(10).sort({ bookingDate: -1 });

    console.log('All bookings in database:', bookings.map(b => ({
      id: b._id,
      userId: b.userId,
      email: b.passenger?.email,
      bookingReference: b.bookingReference,
      bookingDate: b.bookingDate
    })));

    res.json({
      success: true,
      data: bookings.map(b => ({
        id: b._id,
        userId: b.userId,
        email: b.passenger?.email,
        bookingReference: b.bookingReference,
        bookingDate: b.bookingDate,
        flight: {
          flightNumber: b.flight?.flightNumber,
          departureAirport: b.flight?.departureAirport,
          arrivalAirport: b.flight?.arrivalAirport
        }
      }))
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all bookings',
      error: error.message
    });
  }
});

// GET /api/flights/bookings/email/:email - Get bookings by email (fallback)
router.get("/bookings/email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 20 } = req.query;

    console.log('Fetching bookings for email:', email);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find({ 'passenger.email': email })
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments({ 'passenger.email': email });

    console.log(`Found ${bookings.length} bookings for email ${email}, total: ${total}`);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get bookings by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings by email',
      error: error.message
    });
  }
});

// GET /api/flights/bookings/by-ids - Get multiple bookings by their IDs
router.post("/bookings/by-ids", async (req, res) => {
  try {
    const { bookingIds } = req.body;

    if (!bookingIds || !Array.isArray(bookingIds)) {
      return res.status(400).json({
        success: false,
        message: 'bookingIds array is required'
      });
    }

    console.log('Fetching bookings by IDs:', bookingIds);

    // Convert string IDs to ObjectIds and fetch bookings
    const bookings = await Booking.find({
      _id: { $in: bookingIds }
    }).sort({ bookingDate: -1 });

    console.log(`Found ${bookings.length} bookings for provided IDs`);

    res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Get bookings by IDs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings by IDs',
      error: error.message
    });
  }
});

// GET /api/flights/booking/:bookingId
router.get("/booking/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking details',
      error: error.message
    });
  }
});

// PUT /api/flights/booking/:bookingId/cancel
router.put("/booking/:bookingId/cancel", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Check if cancellation is allowed (e.g., not within 24 hours of departure)
    const departureTime = new Date(booking.flight.departureTime);
    const now = new Date();
    const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

    if (hoursUntilDeparture < 24) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation not allowed within 24 hours of departure'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationDate = new Date();
    booking.cancellationReason = reason || 'Cancelled by user';

    await booking.save();

    // Process refund (simulate)
    await processRefund(booking);

    res.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

// Helper functions

// Simulate payment processing
async function processPayment(paymentData, price) {
  // In a real application, integrate with payment processors like Stripe, PayPal, etc.
  console.log("Processing payment for amount:", price.total, price.currency);

  // Simulate payment validation
  if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
    return { success: false, message: 'Invalid card number' };
  }

  if (!paymentData.cvv || paymentData.cvv.length < 3) {
    return { success: false, message: 'Invalid CVV' };
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate random payment failures (5% chance)
  if (Math.random() < 0.05) {
    return { success: false, message: 'Payment declined by bank' };
  }

  return {
    success: true,
    transactionId: 'TXN' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase()
  };
}

// Mask card number for security
function maskCardNumber(cardNumber) {
  const cleaned = cardNumber.replace(/\s/g, '');
  return '**** **** **** ' + cleaned.slice(-4);
}

// Simulate sending booking confirmation email
async function sendBookingConfirmation(booking) {
  console.log(`Sending booking confirmation email to ${booking.passenger.email}`);
  console.log(`Booking Reference: ${booking.bookingReference}`);
  // In a real application, integrate with email service like SendGrid, AWS SES, etc.
  return true;
}

// Simulate refund processing
async function processRefund(booking) {
  console.log(`Processing refund for booking ${booking.bookingReference}`);
  console.log(`Refund amount: ${booking.totalAmount} ${booking.currency}`);
  // In a real application, process refund through payment processor
  return true;
}

// GET /api/flights/price-analysis/:searchId - Get price analysis and deals
router.get("/price-analysis/:searchId", async (req, res) => {
  try {
    const { searchId } = req.params;

    console.log("Fetching price analysis for search ID:", searchId);

    // Find the flight results in database
    const flightResult = await FlightResult.findOne({ searchId }).populate('searchId');

    if (!flightResult) {
      return res.status(404).json({
        success: false,
        message: 'Flight results not found'
      });
    }

    const flights = flightResult.flights;

    if (!flights || flights.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No flights found for analysis'
      });
    }

    // Analyze prices
    const prices = flights.map(f => parseFloat(f.price.total));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Find best deals
    const cheapestFlight = flights.find(f => parseFloat(f.price.total) === minPrice);
    const bestValueFlights = flights
      .filter(f => f.price.discount?.hasDiscount)
      .sort((a, b) => b.price.discount.percentage - a.price.discount.percentage)
      .slice(0, 3);

    // Categorize flights by price range
    const priceRanges = {
      budget: flights.filter(f => parseFloat(f.price.total) <= minPrice * 1.2),
      mid: flights.filter(f => {
        const price = parseFloat(f.price.total);
        return price > minPrice * 1.2 && price <= avgPrice * 1.2;
      }),
      premium: flights.filter(f => parseFloat(f.price.total) > avgPrice * 1.2)
    };

    // Calculate savings opportunities
    const flightsWithDiscounts = flights.filter(f => f.price.discount?.hasDiscount);
    const totalPossibleSavings = flightsWithDiscounts.reduce(
      (sum, f) => sum + f.price.discount.savings, 0
    );

    const analysis = {
      priceStatistics: {
        minimum: minPrice,
        maximum: maxPrice,
        average: Math.round(avgPrice * 100) / 100,
        currency: flights[0]?.price?.currency || 'USD',
        totalFlights: flights.length
      },
      bestDeals: {
        cheapest: cheapestFlight ? {
          id: cheapestFlight.id,
          price: cheapestFlight.price,
          flightNumber: cheapestFlight.flightNumber,
          airline: cheapestFlight.airline,
          duration: cheapestFlight.duration,
          stops: cheapestFlight.stops
        } : null,
        bestValue: bestValueFlights.map(f => ({
          id: f.id,
          price: f.price,
          flightNumber: f.flightNumber,
          airline: f.airline,
          duration: f.duration,
          stops: f.stops,
          discountPercentage: f.price.discount.percentage
        }))
      },
      priceRanges: {
        budget: {
          count: priceRanges.budget.length,
          priceRange: `${minPrice} - ${Math.round(minPrice * 1.2)}`,
          flights: priceRanges.budget.slice(0, 3).map(f => ({
            id: f.id,
            price: f.price.total,
            flightNumber: f.flightNumber,
            airline: f.airline
          }))
        },
        mid: {
          count: priceRanges.mid.length,
          priceRange: `${Math.round(minPrice * 1.2)} - ${Math.round(avgPrice * 1.2)}`,
          flights: priceRanges.mid.slice(0, 3).map(f => ({
            id: f.id,
            price: f.price.total,
            flightNumber: f.flightNumber,
            airline: f.airline
          }))
        },
        premium: {
          count: priceRanges.premium.length,
          priceRange: `${Math.round(avgPrice * 1.2)}+`,
          flights: priceRanges.premium.slice(0, 3).map(f => ({
            id: f.id,
            price: f.price.total,
            flightNumber: f.flightNumber,
            airline: f.airline
          }))
        }
      },
      discountAnalysis: {
        flightsWithDiscounts: flightsWithDiscounts.length,
        totalPossibleSavings: Math.round(totalPossibleSavings * 100) / 100,
        averageDiscountPercentage: flightsWithDiscounts.length > 0
          ? Math.round((flightsWithDiscounts.reduce((sum, f) => sum + f.price.discount.percentage, 0) / flightsWithDiscounts.length) * 100) / 100
          : 0,
        topDiscounts: flightsWithDiscounts
          .sort((a, b) => b.price.discount.percentage - a.price.discount.percentage)
          .slice(0, 5)
          .map(f => ({
            id: f.id,
            flightNumber: f.flightNumber,
            originalPrice: f.price.discount.originalPrice,
            discountedPrice: f.price.total,
            savings: f.price.discount.savings,
            percentage: f.price.discount.percentage
          }))
      },
      recommendations: {
        bestOverall: cheapestFlight?.id,
        bestValue: bestValueFlights[0]?.id || null,
        quickest: flights.reduce((fastest, current) => {
          const currentDuration = parseDuration(current.duration);
          const fastestDuration = parseDuration(fastest.duration);
          return currentDuration < fastestDuration ? current : fastest;
        }).id,
        mostConvenient: flights.filter(f => f.stops === 0)[0]?.id || flights[0]?.id
      }
    };

    res.json({
      success: true,
      data: analysis,
      searchId: searchId,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Price analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating price analysis',
      error: error.message
    });
  }
});

// Helper function to parse duration string (PT4H30M -> minutes)
function parseDuration(duration) {
  if (!duration) return 0;
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!matches) return 0;
  const hours = parseInt(matches[1] || 0);
  const minutes = parseInt(matches[2] || 0);
  return hours * 60 + minutes;
}

// GET /api/flights/cleanup - Clean up expired flight results
router.get("/cleanup", async (req, res) => {
  try {
    console.log("Cleaning up expired flight results...");

    const result = await FlightResult.cleanupExpiredCache();

    res.json({
      success: true,
      message: 'Cache cleanup completed',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Cache cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during cache cleanup',
      error: error.message
    });
  }
});

// Scheduled cleanup function (call this periodically)
export const scheduleCleanup = () => {
  // Clean up expired cache every hour
  setInterval(async () => {
    try {
      console.log("Running scheduled cache cleanup...");
      const result = await FlightResult.cleanupExpiredCache();
      console.log(`Cleaned up ${result.modifiedCount} expired flight results`);
    } catch (error) {
      console.error('Scheduled cleanup error:', error);
    }
  }, 60 * 60 * 1000); // 1 hour
};

// GET /api/flights/search-direct - Direct search without database storage
router.get("/search-direct", async (req, res) => {
  try {
    const {
      departure_id,
      arrival_id,
      outbound_date,
      return_date,
      currency = 'USD',
      adults = 1,
      children = 0,
      infants = 0,
      travel_class = 'ECONOMY',
      type = 'round_trip'
    } = req.query;

    console.log("Direct flight search request:", req.query);

    // Validate required parameters
    if (!departure_id || !arrival_id || !outbound_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: departure_id, arrival_id, outbound_date'
      });
    }

    // Build Amadeus search parameters
    const params = {
      originLocationCode: departure_id,
      destinationLocationCode: arrival_id,
      departureDate: outbound_date,
      adults: parseInt(adults),
      currencyCode: currency,
      travelClass: travel_class.toUpperCase(),
      max: 50
    };

    // Add optional parameters
    if (children > 0) params.children = parseInt(children);
    if (infants > 0) params.infants = parseInt(infants);
    if (return_date && type === 'round_trip') {
      params.returnDate = return_date;
    }

    console.log("Calling Amadeus with params:", params);

    // Search for flight offers using Amadeus directly
    const amadeusResponse = await searchFlights(params);
    console.log("Amadeus response received:", amadeusResponse?.data?.length || 0, "flights");

    // Helper function to get airline name from dictionaries
    const getAirlineName = (carrierCode) => {
      return amadeusResponse.dictionaries?.carriers?.[carrierCode] || carrierCode;
    };

    // Helper function to get aircraft name from dictionaries
    const getAircraftName = (aircraftCode) => {
      return amadeusResponse.dictionaries?.aircraft?.[aircraftCode] || aircraftCode;
    };

    // Helper function to get location details from dictionaries
    const getLocationDetails = (iataCode) => {
      const location = amadeusResponse.dictionaries?.locations?.[iataCode];
      return {
        iataCode,
        name: location?.detailedName || location?.name || iataCode,
        city: location?.cityCode || location?.address?.cityName || '',
        country: location?.countryCode || location?.address?.countryName || '',
        fullName: location ? `${location.name || iataCode} (${iataCode})` : iataCode,
        cityCountry: location ? `${location.address?.cityName || location.cityCode || ''}, ${location.address?.countryName || location.countryCode || ''}` : ''
      };
    };

    // Transform Amadeus response to our enhanced format
    const flights = amadeusResponse.data.map(offer => {
      const firstItinerary = offer.itineraries[0];
      const firstSegment = firstItinerary.segments[0];
      const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];

      // Get enhanced location details
      const departureLocation = getLocationDetails(firstSegment.departure.iataCode);
      const arrivalLocation = getLocationDetails(lastSegment.arrival.iataCode);

      // Calculate discount information
      const basePrice = parseFloat(offer.price.base || offer.price.total);
      const totalPrice = parseFloat(offer.price.total);
      const fees = Array.isArray(offer.price.fees) ? offer.price.fees : [];
      const totalFees = fees.reduce((sum, fee) => sum + parseFloat(fee.amount || 0), 0);

      // Check for discounts (if total is less than base + fees)
      const expectedTotal = basePrice + totalFees;
      const hasDiscount = totalPrice < expectedTotal;
      const discountAmount = hasDiscount ? expectedTotal - totalPrice : 0;
      const discountPercentage = hasDiscount ? Math.round((discountAmount / expectedTotal) * 100) : 0;

      return {
        id: offer.id,
        price: {
          total: offer.price.total,
          currency: offer.price.currency,
          base: offer.price.base,
          fees: Array.isArray(offer.price.fees) ? offer.price.fees : [],
          grandTotal: offer.price.grandTotal || offer.price.total,
          // Enhanced pricing information
          breakdown: {
            basePrice: basePrice,
            totalFees: totalFees,
            taxes: fees.filter(fee => fee.type === 'TAXES').reduce((sum, fee) => sum + parseFloat(fee.amount || 0), 0),
            supplierFees: fees.filter(fee => fee.type === 'SUPPLIER').reduce((sum, fee) => sum + parseFloat(fee.amount || 0), 0),
            otherFees: fees.filter(fee => !['TAXES', 'SUPPLIER'].includes(fee.type)).reduce((sum, fee) => sum + parseFloat(fee.amount || 0), 0)
          },
          discount: {
            hasDiscount: hasDiscount,
            amount: discountAmount,
            percentage: discountPercentage,
            originalPrice: hasDiscount ? expectedTotal : null,
            savings: hasDiscount ? discountAmount : 0
          },
          // Price per traveler breakdown
          perTraveler: offer.travelerPricings ? offer.travelerPricings.map(tp => ({
            travelerId: tp.travelerId,
            travelerType: tp.travelerType,
            price: {
              total: tp.price.total,
              base: tp.price.base,
              currency: tp.price.currency,
              fees: Array.isArray(tp.price.fees) ? tp.price.fees : []
            }
          })) : []
        },
        itineraries: offer.itineraries.map(itinerary => ({
          duration: itinerary.duration,
          segments: itinerary.segments.map(segment => {
            const segmentDeparture = getLocationDetails(segment.departure.iataCode);
            const segmentArrival = getLocationDetails(segment.arrival.iataCode);

            return {
              departure: {
                iataCode: segment.departure.iataCode,
                terminal: segment.departure.terminal,
                at: segment.departure.at,
                ...segmentDeparture
              },
              arrival: {
                iataCode: segment.arrival.iataCode,
                terminal: segment.arrival.terminal,
                at: segment.arrival.at,
                ...segmentArrival
              },
              carrierCode: segment.carrierCode,
              carrierName: getAirlineName(segment.carrierCode),
              number: segment.number,
              aircraft: {
                code: segment.aircraft?.code || 'N/A',
                name: getAircraftName(segment.aircraft?.code)
              },
              operating: segment.operating || {},
              duration: segment.duration,
              id: segment.id,
              numberOfStops: segment.numberOfStops || 0,
              blacklistedInEU: segment.blacklistedInEU || false
            };
          })
        })),

        // Enhanced flight details for display
        flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
        aircraftModel: getAircraftName(firstSegment.aircraft?.code) || firstSegment.aircraft?.code || 'N/A',
        aircraftCode: firstSegment.aircraft?.code || 'N/A',
        departureAirport: firstSegment.departure.iataCode,
        arrivalAirport: lastSegment.arrival.iataCode,
        departureLocation: departureLocation,
        arrivalLocation: arrivalLocation,
        departureTime: firstSegment.departure.at,
        arrivalTime: lastSegment.arrival.at,
        duration: firstItinerary.duration,
        stops: firstItinerary.segments.length - 1,
        stopLocations: firstItinerary.segments.length > 1 ?
          firstItinerary.segments.slice(0, -1).map(segment => getLocationDetails(segment.arrival.iataCode)) : [],
        airline: firstSegment.carrierCode,
        airlineName: getAirlineName(firstSegment.carrierCode),

        // Additional metadata
        travelerPricings: offer.travelerPricings || [],
        validatingAirlineCodes: offer.validatingAirlineCodes || [],
        lastTicketingDate: offer.lastTicketingDate,
        numberOfBookableSeats: offer.numberOfBookableSeats,
        oneWay: offer.oneWay || false
      };
    });

    // Return response directly without database storage
    res.json({
      success: true,
      data: {
        flights: flights,
        meta: amadeusResponse.meta || {},
        dictionaries: amadeusResponse.dictionaries || {},
        searchTime: new Date().toISOString(),
        fromCache: false
      }
    });

  } catch (error) {
    console.error('Direct flight search error:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Error searching flights with Amadeus',
      error: error.response?.data || error.message
    });
  }
});

export default router;
