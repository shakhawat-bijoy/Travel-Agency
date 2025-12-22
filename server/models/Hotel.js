import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomType: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  available: {
    type: Number,
    required: true
  },
  amenities: [String],
  images: [{
    url: String,
    publicId: String
  }]
});

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a hotel name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true
    },
    state: String,
    country: {
      type: String,
      required: true
    },
    zipCode: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number]
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
  starRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  amenities: [String],
  rooms: [roomSchema],
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
  checkInTime: {
    type: String,
    default: '14:00'
  },
  checkOutTime: {
    type: String,
    default: '11:00'
  },
  policies: {
    cancellation: String,
    petPolicy: String,
    childPolicy: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
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
hotelSchema.index({ name: 'text', 'address.city': 'text', description: 'text' });

// Virtual populate reviews
hotelSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'hotel'
});

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;