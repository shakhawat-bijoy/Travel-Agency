import mongoose from 'mongoose'

const customPackageRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reference: {
      type: String,
      unique: true,
      sparse: true
    },
    destination: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    travelers: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    budget: {
      type: String,
      enum: ['budget', 'moderate', 'luxury'],
      default: 'moderate'
    },
    accommodation: {
      type: String,
      enum: ['standard', 'deluxe', 'luxury'],
      default: 'standard'
    },
    activities: {
      type: [String],
      default: []
    },
    meals: {
      type: String,
      enum: ['breakfast', 'half-board', 'full-board', 'all-inclusive'],
      default: 'breakfast'
    },
    transportation: {
      type: String,
      enum: ['flight', 'train', 'bus', 'rental-car'],
      default: 'flight'
    },
    specialRequests: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['submitted', 'in_review', 'quoted', 'scheduled', 'completed', 'cancelled'],
      default: 'submitted'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

// Generate a human-friendly reference before saving
customPackageRequestSchema.pre('save', function (next) {
  if (!this.reference) {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    this.reference = `CPK${timestamp}${random}`
  }
  next()
})

customPackageRequestSchema.index({ userId: 1, createdAt: -1 })
// Note: reference already has an index from unique: true

export default mongoose.model('CustomPackageRequest', customPackageRequestSchema)
