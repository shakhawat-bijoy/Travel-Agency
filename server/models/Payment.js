import { Schema, model } from 'mongoose';

const paymentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cardNumber: {
        type: String,
        required: true,
        // Store only last 4 digits for security
        set: function (value) {
            return value.slice(-4);
        }
    },
    cardType: {
        type: String,
        enum: ['visa', 'mastercard', 'amex', 'discover'],
        required: true
    },
    expiryDate: {
        type: String,
        required: true
    },
    nameOnCard: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
paymentSchema.index({ userId: 1 });

export default model('Payment', paymentSchema);