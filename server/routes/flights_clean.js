import express from "express";
import { searchFlights, searchAirports, getBangladeshAirports } from "../utils/amadeusClient.js";
import Booking from '../models/Booking.js';

const router = express.Router();

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

        // Transform Amadeus response to our enhanced format
        const flights = amadeusResponse.data.map(offer => {
            const firstItinerary = offer.itineraries[0];
            const firstSegment = firstItinerary.segments[0];
            const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];

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
                    segments: itinerary.segments.map(segment => ({
                        departure: {
                            iataCode: segment.departure.iataCode,
                            terminal: segment.departure.terminal,
                            at: segment.departure.at
                        },
                        arrival: {
                            iataCode: segment.arrival.iataCode,
                            terminal: segment.arrival.terminal,
                            at: segment.arrival.at
                        },
                        carrierCode: segment.carrierCode,
                        number: segment.number,
                        aircraft: {
                            code: segment.aircraft?.code || 'N/A'
                        },
                        operating: segment.operating || {},
                        duration: segment.duration,
                        id: segment.id,
                        numberOfStops: segment.numberOfStops || 0,
                        blacklistedInEU: segment.blacklistedInEU || false
                    }))
                })),

                // Enhanced flight details for display
                flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
                aircraftModel: firstSegment.aircraft?.code || 'N/A',
                departureAirport: firstSegment.departure.iataCode,
                arrivalAirport: lastSegment.arrival.iataCode,
                departureTime: firstSegment.departure.at,
                arrivalTime: lastSegment.arrival.at,
                duration: firstItinerary.duration,
                stops: firstItinerary.segments.length - 1,
                airline: firstSegment.carrierCode,

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

// POST /api/flights/book
router.post("/book", async (req, res) => {
    try {
        const { flight, passengers, searchParams } = req.body;

        console.log("Flight booking request:", { flight: flight?.flightNumber, passenger: passengers?.passenger?.email });

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
        const taxesAndFees = 4950.00; // Fixed for demo (45 USD * 110 BDT rate)
        const totalAmount = flightPrice + taxesAndFees;

        // Create booking record
        const booking = new Booking({
            userId: req.user?.id || null, // If user is authenticated
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
                flightNumber: flight.flightNumber,
                airline: flight.airline,
                aircraftModel: flight.aircraftModel,
                departureAirport: flight.departureAirport,
                arrivalAirport: flight.arrivalAirport,
                departureTime: new Date(flight.departureTime),
                arrivalTime: new Date(flight.arrivalTime),
                duration: flight.duration,
                stops: flight.stops,
                price: flight.price,
                itineraries: flight.itineraries
            },
            payment: {
                cardNumber: maskCardNumber(payment.cardNumber),
                cardholderName: payment.cardholderName,
                expiryDate: payment.expiryDate,
                transactionId: paymentProcessed.transactionId
            },
            searchParams: searchParams || {},
            totalAmount,
            currency: flight.price.currency || 'BDT',
            status: 'confirmed'
        });

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
        res.status(500).json({
            success: false,
            message: 'Error processing flight booking',
            error: error.message
        });
    }
});

// GET /api/flights/bookings/:userId
router.get("/bookings/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find({ userId })
            .sort({ bookingDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments({ userId });

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

// POST /api/flights/bookings/by-ids - Get multiple bookings by their IDs
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

export default router;