import mongoose from 'mongoose';

const packageBookingSchema = new mongoose.Schema(
    {
        // User Information
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // Package Information
        packageData: {
            id: String,
            title: String,
            location: String,
            duration: String,
            price: Number,
            originalPrice: Number,
            rating: Number,
            reviews: Number,
            badge: String,
            discount: String,
            description: String,
            highlights: [String],
            included: [String],
            notIncluded: [String],
            itinerary: [
                {
                    day: Number,
                    title: String,
                    description: String
                }
            ],
            images: [String]
        },

        // Booking Details
        selectedDate: {
            type: Date,
            required: true
        },
        numberOfTravelers: {
            type: Number,
            required: true,
            min: 1
        },
        totalPrice: {
            type: Number,
            required: true
        },

        // Traveler Information
        travelers: [
            {
                firstName: {
                    type: String,
                    required: true
                },
                lastName: {
                    type: String,
                    required: true
                },
                email: {
                    type: String,
                    required: true
                },
                phone: {
                    type: String,
                    required: true
                },
                dateOfBirth: {
                    type: Date,
                    required: true
                },
                passportNumber: String,
                nationality: String
            }
        ],

        // Payment Information
        payment: {
            cardNumber: {
                type: String,
                required: true
            },
            expiryDate: {
                type: String,
                required: true
            },
            cardholderName: {
                type: String,
                required: true
            },
            cvv: String,
            savedCardId: mongoose.Schema.Types.ObjectId,
            paymentMethod: {
                type: String,
                enum: ['saved_card', 'new_card'],
                default: 'new_card'
            }
        },

        // Booking Status
        bookingReference: {
            type: String,
            unique: true,
            sparse: true
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: 'confirmed'
        },

        // Timestamps
        bookingDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Generate booking reference before saving
packageBookingSchema.pre('save', async function (next) {
    if (!this.bookingReference) {
        // Generate unique booking reference: PKG + timestamp + random
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.bookingReference = `PKG${timestamp}${random}`;
    }
    next();
});

// Index for faster queries
packageBookingSchema.index({ userId: 1, createdAt: -1 });
packageBookingSchema.index({ 'travelers.email': 1 });

export default mongoose.model('PackageBooking', packageBookingSchema);
