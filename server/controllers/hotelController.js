import Hotel from '../models/Hotel.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
export async function getHotels(req, res) {
  try {
    const { search, city, country, minPrice, maxPrice, starRating, amenities, sort, page = 1, limit = 12 } = req.query;

    let query = { active: true };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by city
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    // Filter by country
    if (country) {
      query['address.country'] = new RegExp(country, 'i');
    }

    // Filter by star rating
    if (starRating) {
      query.starRating = Number(starRating);
    }

    // Filter by amenities
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }

    // Filter by price range (minimum room price)
    if (minPrice || maxPrice) {
      query['rooms.price'] = {};
      if (minPrice) query['rooms.price'].$gte = Number(minPrice);
      if (maxPrice) query['rooms.price'].$lte = Number(maxPrice);
    }

    // Sort
    let sortOption = {};
    if (sort === 'price-asc') sortOption['rooms.price'] = 1;
    else if (sort === 'price-desc') sortOption['rooms.price'] = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else sortOption.createdAt = -1;

    const skip = (page - 1) * limit;

    const hotels = await Hotel.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Hotel.countDocuments(query);

    res.status(200).json({
      success: true,
      count: hotels.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      hotels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
export async function getHotel(req, res) {
  try {
    const hotel = await Hotel.findById(req.params.id).populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name avatar'
      }
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Create hotel
// @route   POST /api/hotels
// @access  Private/Admin
export async function createHotel(req, res) {
  try {
    // Upload cover image
    if (req.files && req.files.coverImage) {
      const result = await uploadToCloudinary(req.files.coverImage[0].path, 'hotels');
      req.body.coverImage = {
        url: result.url,
        publicId: result.publicId
      };
    }

    // Upload multiple images
    if (req.files && req.files.images) {
      const imagePromises = req.files.images.map(file =>
        uploadToCloudinary(file.path, 'hotels')
      );
      const images = await Promise.all(imagePromises);
      req.body.images = images.map(img => ({
        url: img.url,
        publicId: img.publicId
      }));
    }

    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      success: true,
      hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private/Admin
export async function updateHotel(req, res) {
  try {
    let hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Update cover image if provided
    if (req.files && req.files.coverImage) {
      if (hotel.coverImage.publicId) {
        await deleteFromCloudinary(hotel.coverImage.publicId);
      }
      const result = await uploadToCloudinary(req.files.coverImage[0].path, 'hotels');
      req.body.coverImage = {
        url: result.url,
        publicId: result.publicId
      };
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
export async function deleteHotel(req, res) {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Delete images
    if (hotel.coverImage.publicId) {
      await deleteFromCloudinary(hotel.coverImage.publicId);
    }
    if (hotel.images && hotel.images.length > 0) {
      for (const img of hotel.images) {
        if (img.publicId) {
          await deleteFromCloudinary(img.publicId);
        }
      }
    }

    await hotel.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Get featured hotels
// @route   GET /api/hotels/featured
// @access  Public
export async function getFeaturedHotels(req, res) {
  try {
    const hotels = await Hotel.find({ featured: true, active: true })
      .limit(6)
      .sort('-rating');

    res.status(200).json({
      success: true,
      count: hotels.length,
      hotels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}