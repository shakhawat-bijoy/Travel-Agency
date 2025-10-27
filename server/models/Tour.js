const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a tour title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  destination: {
    type: String,
    required: [true, 'Please add a destination']
  },
  duration: {
    days: {
      type: Number,
      required: true
    },
    nights: {
      type: Number,
      required: true
    }
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  discountPrice: {
    type: Number
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Please add max group size']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'difficult'],
    default: 'moderate'
  },
  images: [{
    url: String,
    publicId: String
  }],
  coverImage: {
    url: {
      type: String,
      required: true
    },
    publicId: String
  },
  included: [String],
  excluded: [String],
  itinerary: [{
    day: Number,
    title: String,
    description: String
  }],
  startDates: [{
    type: Date
  }],
  category: {
    type: String,
    enum: ['adventure', 'cultural', 'beach', 'city', 'nature', 'religious'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number],
    address: String,
    city: String,
    country: String
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for search
tourSchema.index({ title: 'text', destination: 'text', description: 'text' });

// Virtual populate reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour'
});

module.exports = mongoose.model('Tour', tourSchema);