import { Schema, model } from 'mongoose';

const reviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewType: {
    type: String,
    enum: ['tour', 'hotel', 'site'],
    required: true
  },
  tour: {
    type: Schema.Types.ObjectId,
    ref: 'Tour'
  },
  hotel: {
    type: Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  // For external providers (e.g., Amadeus) where we only have a string id
  externalHotelId: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Please add a review title'],
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: 1000
  },
  images: [{
    url: String,
    publicId: String
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  helpful: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per tour/hotel
reviewSchema.index({ user: 1, tour: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, hotel: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, externalHotelId: 1 }, { unique: true, sparse: true });

// Static method to get average rating
reviewSchema.statics.getAverageRating = async function(modelName, modelId) {
  const obj = await this.aggregate([
    {
      $match: { [modelName]: modelId }
    },
    {
      $group: {
        _id: `$${modelName}`,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    const Model = model(modelName === 'tour' ? 'Tour' : 'Hotel');
    await Model.findByIdAndUpdate(modelId, {
      rating: obj[0]?.averageRating || 0,
      totalReviews: obj[0]?.totalReviews || 0
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function() {
  if (this.tour) {
    this.constructor.getAverageRating('tour', this.tour);
  }
  if (this.hotel) {
    this.constructor.getAverageRating('hotel', this.hotel);
  }
});

// Call getAverageRating before remove
reviewSchema.pre('remove', function() {
  if (this.tour) {
    this.constructor.getAverageRating('tour', this.tour);
  }
  if (this.hotel) {
    this.constructor.getAverageRating('hotel', this.hotel);
  }
});

export default model('Review', reviewSchema);