import express from 'express';
import {
  getHotels,
  getHotel,
  getFeaturedHotels
} from '../controllers/hotelController.js';
import { searchCities, searchHotelOffers, getHotelOfferById, getHotelsByIds } from '../utils/amadeusClient.js';
import Review from '../models/Review.js';

const router = express.Router();

// Database-backed hotels
router.get('/', getHotels);
router.get('/featured', getFeaturedHotels);

// Amadeus-backed hotel search helpers
// GET /api/hotels/cities/search?keyword=paris&limit=10
router.get('/cities/search', async (req, res) => {
  try {
    const { keyword, limit = 10 } = req.query;

    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'keyword must be at least 2 characters'
      });
    }

    const results = await searchCities(keyword.trim(), Number(limit));

    return res.json({
      success: true,
      data: results,
      total: results.length,
      source: 'amadeus'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error searching cities',
      error: error.message
    });
  }
});

// GET /api/hotels/search?cityCode=PAR&checkInDate=2025-01-10&checkOutDate=2025-01-12&adults=2&roomQuantity=1
router.get('/search', async (req, res) => {
  try {
    const {
      cityCode,
      checkInDate,
      checkOutDate,
      adults = 2,
      roomQuantity = 1,
      currency = 'USD',
      limit = 60,
      radiusKm = 5,
      includeOffers = '0',
      maxOffers = 1
    } = req.query;

    if (!cityCode || String(cityCode).trim().length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'cityCode is required and must be a 3-letter IATA city code (e.g., PAR)'
      });
    }

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'checkInDate and checkOutDate are required (YYYY-MM-DD)'
      });
    }

    const data = await searchHotelOffers({
      cityCode: String(cityCode).trim().toUpperCase(),
      checkInDate,
      checkOutDate,
      adults: Number(adults),
      roomQuantity: Number(roomQuantity),
      currency,
      limit: Number(limit),
      radiusKm: Number(radiusKm),
      includeOffers: String(includeOffers) === '1' || String(includeOffers).toLowerCase() === 'true',
      maxOffers: Number(maxOffers)
    });

    return res.json({
      success: true,
      ...data,
      source: 'amadeus'
    });
  } catch (error) {
    const detail = error.response?.data?.errors?.[0]?.detail;
    return res.status(500).json({
      success: false,
      message: detail || 'Error searching hotel offers',
      error: detail || error.message
    });
  }
});

// GET /api/hotels/offers/:offerId
router.get('/offers/:offerId', async (req, res) => {
  try {
    const { offerId } = req.params;
    if (!offerId) {
      return res.status(400).json({
        success: false,
        message: 'offerId is required'
      });
    }

    const data = await getHotelOfferById(offerId);
    return res.json({
      success: true,
      data,
      source: 'amadeus'
    });
  } catch (error) {
    const detail = error.response?.data?.errors?.[0]?.detail;
    return res.status(error.response?.status || 500).json({
      success: false,
      message: detail || 'Error fetching hotel offer details',
      error: detail || error.message
    });
  }
});

// GET /api/hotels/amadeus/:hotelId
router.get('/amadeus/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: 'hotelId is required'
      });
    }

    const data = await getHotelsByIds([hotelId]);
    const first = data?.data?.[0] || null;

    return res.json({
      success: true,
      data: first,
      source: 'amadeus'
    });
  } catch (error) {
    const detail = error.response?.data?.errors?.[0]?.detail;
    return res.status(error.response?.status || 500).json({
      success: false,
      message: detail || 'Error fetching hotel details',
      error: detail || error.message
    });
  }
});

// GET /api/hotels/reviews/:externalHotelId
router.get('/reviews/:externalHotelId', async (req, res) => {
  try {
    const { externalHotelId } = req.params;
    if (!externalHotelId) {
      return res.status(400).json({
        success: false,
        message: 'externalHotelId is required'
      });
    }

    const reviews = await Review.find({
      reviewType: 'hotel',
      externalHotelId: String(externalHotelId).trim()
    })
      .sort({ createdAt: -1 })
      .select('rating title comment images verified createdAt')
      .lean();

    const avg = reviews.length
      ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length
      : 0;

    return res.json({
      success: true,
      data: {
        averageRating: Number(avg.toFixed(2)),
        total: reviews.length,
        reviews
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// Database-backed hotels (by id) - keep last so it doesn't shadow more specific routes
router.get('/:id', getHotel);

export default router;
