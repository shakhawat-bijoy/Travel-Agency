import express from 'express';
import { getJson } from 'serpapi';

const router = express.Router();

// @route   GET /api/flights/search
// @desc    Search flights using SERPAPI
// @access  Public
router.get('/search', async (req, res) => {
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
            travel_class = 'economy',
            type = 'round_trip'
        } = req.query;

        // Validate required parameters
        if (!departure_id || !arrival_id || !outbound_date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: departure_id, arrival_id, outbound_date'
            });
        }

        // Build SERPAPI request parameters
        const params = {
            engine: 'google_flights',
            departure_id,
            arrival_id,
            outbound_date,
            currency,
            adults: parseInt(adults),
            children: parseInt(children),
            infants: parseInt(infants),
            travel_class,
            type,
            api_key: process.env.SERPA_API_KEY
        };

        // Add return date for round trip
        if (type === 'round_trip' && return_date) {
            params.return_date = return_date;
        }

        console.log('SERPAPI Request params:', params);

        // Make request to SERPAPI using the serpapi package
        const searchPromise = new Promise((resolve, reject) => {
            getJson(params, (json) => {
                if (json.error) {
                    reject(new Error(json.error));
                } else {
                    resolve(json);
                }
            });
        });

        const response = await searchPromise;

        // Extract flight data
        const flights = response.best_flights || response.other_flights || [];
        const airports = response.airports || [];
        const search_metadata = response.search_metadata || {};

        res.json({
            success: true,
            data: {
                flights,
                airports,
                search_metadata,
                search_parameters: response.search_parameters
            }
        });

    } catch (error) {
        console.error('Flight search error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Error searching flights',
            error: error.response?.data || error.message
        });
    }
});

// @route   GET /api/flights/airports
// @desc    Search airports using SERPAPI
// @access  Public
router.get('/airports', async (req, res) => {
    try {
        const { query, limit = 15 } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query parameter is required'
            });
        }

        console.log(`Searching airports with SerpAPI for: "${query}"`);

        // Use SerpAPI for real-time airport search
        const serpApiPromise = new Promise((resolve, reject) => {
            getJson({
                engine: 'google_flights',
                q: query,
                api_key: process.env.SERPA_API_KEY
            }, (json) => {
                if (json.error) {
                    reject(new Error(json.error));
                } else {
                    resolve(json);
                }
            });
        });

        const serpResponse = await serpApiPromise;
        const serpAirports = serpResponse.airports || [];

        // Transform SerpAPI airport data to our format
        const transformedAirports = serpAirports.map(airport => ({
            id: airport.id,
            name: airport.name,
            city: airport.city,
            country: airport.country || airport.region
        })).slice(0, parseInt(limit));

        res.json({
            success: true,
            data: transformedAirports,
            total: transformedAirports.length,
            source: 'serpapi'
        });

    } catch (error) {
        console.error('SerpAPI airport search error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error searching airports',
            error: error.message
        });
    }
});

// @route   GET /api/flights/test
// @desc    Test SerpAPI connection
// @access  Public
router.get('/test', async (req, res) => {
    try {
        console.log('Testing SerpAPI connection...');

        const testPromise = new Promise((resolve, reject) => {
            getJson({
                engine: 'google_flights',
                departure_id: 'LHE',
                arrival_id: 'KHI',
                outbound_date: '2025-01-15',
                currency: 'USD',
                api_key: process.env.SERPA_API_KEY
            }, (json) => {
                if (json.error) {
                    reject(new Error(json.error));
                } else {
                    resolve(json);
                }
            });
        });

        const response = await testPromise;

        res.json({
            success: true,
            message: 'SerpAPI connection successful',
            data: {
                search_metadata: response.search_metadata,
                airports: response.airports,
                flights_count: (response.best_flights || []).length + (response.other_flights || []).length
            }
        });

    } catch (error) {
        console.error('SerpAPI test error:', error.message);
        res.status(500).json({
            success: false,
            message: 'SerpAPI connection failed',
            error: error.message
        });
    }
});

export default router;