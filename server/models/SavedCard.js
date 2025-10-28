import mongoose from 'mongoose';

const savedCardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cardholderName: {
        type: String,
        required: true,
        trim: true
    },
    cardNumber: {
        type: String,
        required: true,
        // Store only last 4 digits for security
        validate: {
            validator: function (v) {
                return /^\*{12}\d{4}$/.test(v) || /^\d{16}$/.test(v.replace(/\s/g, ''));
            },
            message: 'Invalid card number format'
        }
    },
    expiryDate: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v);
            },
            message: 'Invalid expiry date format (MM/YY)'
        }
    },
    cardType: {
        type: String,
        enum: ['visa', 'mastercard', 'amex', 'discover', 'other'],
        default: 'other'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    nickname: {
        type: String,
        trim: true,
        maxlength: 50
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
savedCardSchema.index({ userId: 1, createdAt: -1 });

// Pre-save middleware to mask card number and detect card type
savedCardSchema.pre('save', function (next) {
    if (this.isModified('cardNumber')) {
        // If it's a full card number, mask it
        const cleanCardNumber = this.cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length === 16 && /^\d{16}$/.test(cleanCardNumber)) {
            // Detect card type
            const firstDigit = cleanCardNumber[0];
            const firstTwoDigits = cleanCardNumber.substring(0, 2);
            const firstFourDigits = cleanCardNumber.substring(0, 4);

            if (firstDigit === '4') {
                this.cardType = 'visa';
            } else if (['51', '52', '53', '54', '55'].includes(firstTwoDigits) ||
                (parseInt(firstFourDigits) >= 2221 && parseInt(firstFourDigits) <= 2720)) {
                this.cardType = 'mastercard';
            } else if (['34', '37'].includes(firstTwoDigits)) {
                this.cardType = 'amex';
            } else if (['6011', '6500'].includes(firstFourDigits) || firstDigit === '6') {
                this.cardType = 'discover';
            }

            // Mask the card number (keep only last 4 digits)
            this.cardNumber = '**** **** **** ' + cleanCardNumber.slice(-4);
        }
    }

    // Ensure only one default card per user
    if (this.isDefault && this.isModified('isDefault')) {
        this.constructor.updateMany(
            { userId: this.userId, _id: { $ne: this._id } },
            { isDefault: false }
        ).exec();
    }

    next();
});

// Method to get display name for the card
savedCardSchema.methods.getDisplayName = function () {
    if (this.nickname) {
        return `${this.nickname} (${this.cardNumber})`;
    }
    return `${this.cardType.toUpperCase()} ${this.cardNumber}`;
};

// Method to check if card is expired
savedCardSchema.methods.isExpired = function () {
    const [month, year] = this.expiryDate.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    return expiryDate < new Date();
};

const SavedCard = mongoose.model('SavedCard', savedCardSchema);

export default SavedCard;