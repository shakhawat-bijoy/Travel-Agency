import { find, countDocuments, findById, create, findByIdAndUpdate } from '../models/Tour';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';

// @desc    Get all tours
// @route   GET /api/tours
// @access  Public
export async function getTours(req, res) {
  try {
    const { search, category, minPrice, maxPrice, difficulty, sort, page = 1, limit = 12 } = req.query;

    // Build query
    let query = { active: true };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sort
    let sortOption = {};
    if (sort === 'price-asc') sortOption.price = 1;
    else if (sort === 'price-desc') sortOption.price = -1;
    else if (sort === 'rating') sortOption.rating = -1;
    else if (sort === 'popular') sortOption.totalReviews = -1;
    else sortOption.createdAt = -1;

    // Pagination
    const skip = (page - 1) * limit;

    const tours = await find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('reviews');

    const total = await countDocuments(query);

    res.status(200).json({
      success: true,
      count: tours.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      tours
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Get single tour
// @route   GET /api/tours/:id
// @access  Public
export async function getTour(req, res) {
  try {
    const tour = await findById(req.params.id).populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name avatar'
      }
    });

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    res.status(200).json({
      success: true,
      tour
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Create tour
// @route   POST /api/tours
// @access  Private/Admin
export async function createTour(req, res) {
  try {
    // Upload cover image
    if (req.files && req.files.coverImage) {
      const result = await uploadToCloudinary(req.files.coverImage[0].path, 'tours');
      req.body.coverImage = {
        url: result.url,
        publicId: result.publicId
      };
    }

    // Upload multiple images
    if (req.files && req.files.images) {
      const imagePromises = req.files.images.map(file =>
        uploadToCloudinary(file.path, 'tours')
      );
      const images = await Promise.all(imagePromises);
      req.body.images = images.map(img => ({
        url: img.url,
        publicId: img.publicId
      }));
    }

    const tour = await create(req.body);

    res.status(201).json({
      success: true,
      tour
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Update tour
// @route   PUT /api/tours/:id
// @access  Private/Admin
export async function updateTour(req, res) {
  try {
    let tour = await findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Update cover image if provided
    if (req.files && req.files.coverImage) {
      // Delete old image
      if (tour.coverImage.publicId) {
        await deleteFromCloudinary(tour.coverImage.publicId);
      }
      const result = await uploadToCloudinary(req.files.coverImage[0].path, 'tours');
      req.body.coverImage = {
        url: result.url,
        publicId: result.publicId
      };
    }

    // Update images if provided
    if (req.files && req.files.images) {
      // Delete old images
      if (tour.images && tour.images.length > 0) {
        for (const img of tour.images) {
          if (img.publicId) {
            await deleteFromCloudinary(img.publicId);
          }
        }
      }
      const imagePromises = req.files.images.map(file =>
        uploadToCloudinary(file.path, 'tours')
      );
      const images = await Promise.all(imagePromises);
      req.body.images = images.map(img => ({
        url: img.url,
        publicId: img.publicId
      }));
    }

    tour = await findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      tour
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Delete tour
// @route   DELETE /api/tours/:id
// @access  Private/Admin
export async function deleteTour(req, res) {
  try {
    const tour = await findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Delete images from cloudinary
    if (tour.coverImage.publicId) {
      await deleteFromCloudinary(tour.coverImage.publicId);
    }
    if (tour.images && tour.images.length > 0) {
      for (const img of tour.images) {
        if (img.publicId) {
          await deleteFromCloudinary(img.publicId);
        }
      }
    }

    await tour.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Tour deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// @desc    Get featured tours
// @route   GET /api/tours/featured
// @access  Public
export async function getFeaturedTours(req, res) {
  try {
    const tours = await find({ featured: true, active: true })
      .limit(6)
      .sort('-rating');

    res.status(200).json({
      success: true,
      count: tours.length,
      tours
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}