import express from 'express';
import { body, validationResult } from 'express-validator';
import Payment from '../models/Payment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper function to detect card type
const detectCardType = (number) => {
    const cleanNumber = number.replace(/\D/g, '');

    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6/.test(cleanNumber)) return 'discover';

    return null;
};

// @route   POST /api/payment/add
// @desc    Add payment method
// @access  Private
router.post('/add', protect, [
    body('cardNumber')
        .trim()
        .notEmpty().withMessage('Card number is required')
        .customSanitizer(value => value.replace(/\D/g, '')) // Remove non-digits
        .isLength({ min: 13, max: 19 }).withMessage('Card number must be between 13-19 digits'),
    body('expiryDate')
        .trim()
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/).withMessage('Expiry date must be in MM/YY format'),
    body('cvc')
        .trim()
        .notEmpty().withMessage('CVC is required')
        .isLength({ min: 3, max: 4 }).withMessage('CVC must be 3-4 digits')
        .isNumeric().withMessage('CVC must contain only numbers'),
    body('nameOnCard')
        .trim()
        .notEmpty().withMessage('Name on card is required')
        .isLength({ min: 2 }).withMessage('Name on card must be at least 2 characters'),
    body('country')
        .trim()
        .notEmpty().withMessage('Country is required')
        .isLength({ min: 2 }).withMessage('Country must be at least 2 characters'),
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { cardNumber, expiryDate, cvc, nameOnCard, country, secureInfo } = req.body;

        // Detect card type
        const cardType = detectCardType(cardNumber);
        if (!cardType) {
            return res.status(400).json({
                success: false,
                message: 'Unsupported card type. Please use Visa, Mastercard, American Express, or Discover.'
            });
        }

        // Check if user already has a payment method
        const existingPayment = await Payment.findOne({ userId: req.user._id, isActive: true });

        // If this is the first payment method, make it default
        const isDefault = !existingPayment;

        // Create payment method (card number will be automatically truncated to last 4 digits by the setter)
        const payment = await Payment.create({
            userId: req.user._id,
            cardNumber: cardNumber.replace(/\D/g, ''), // Remove non-digits
            cardType,
            expiryDate,
            nameOnCard,
            country,
            isDefault
        });

        // Return payment info (without sensitive data)
        const paymentResponse = {
            _id: payment._id,
            cardNumber: `****${payment.cardNumber}`, // Last 4 digits
            cardType: payment.cardType,
            expiryDate: payment.expiryDate,
            nameOnCard: payment.nameOnCard,
            country: payment.country,
            isDefault: payment.isDefault,
            createdAt: payment.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'Payment method added successfully',
            payment: paymentResponse
        });

    } catch (error) {
        console.error('Add payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding payment method'
        });
    }
});

// @route   GET /api/payment/methods
// @desc    Get user's payment methods
// @access  Private
router.get('/methods', protect, async (req, res) => {
    try {
        const payments = await Payment.find({
            userId: req.user._id,
            isActive: true
        }).sort({ isDefault: -1, createdAt: -1 });

        const paymentMethods = payments.map(payment => ({
            _id: payment._id,
            cardNumber: `****${payment.cardNumber}`,
            cardType: payment.cardType,
            expiryDate: payment.expiryDate,
            nameOnCard: payment.nameOnCard,
            country: payment.country,
            isDefault: payment.isDefault,
            createdAt: payment.createdAt
        }));

        res.json({
            success: true,
            payments: paymentMethods
        });

    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching payment methods'
        });
    }
});

// @route   PUT /api/payment/:id/default
// @desc    Set payment method as default
// @access  Private
router.put('/:id/default', protect, async (req, res) => {
    try {
        const paymentId = req.params.id;

        // Check if payment method exists and belongs to user
        const payment = await Payment.findOne({
            _id: paymentId,
            userId: req.user._id,
            isActive: true
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        // Remove default from all other payment methods
        await Payment.updateMany(
            { userId: req.user._id, isActive: true },
            { isDefault: false }
        );

        // Set this payment method as default
        payment.isDefault = true;
        await payment.save();

        res.json({
            success: true,
            message: 'Default payment method updated successfully'
        });

    } catch (error) {
        console.error('Set default payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating default payment method'
        });
    }
});

// @route   DELETE /api/payment/:id
// @desc    Delete payment method
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const paymentId = req.params.id;

        // Check if payment method exists and belongs to user
        const payment = await Payment.findOne({
            _id: paymentId,
            userId: req.user._id,
            isActive: true
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        // Soft delete - mark as inactive
        payment.isActive = false;
        await payment.save();

        // If this was the default payment method, set another one as default
        if (payment.isDefault) {
            const nextPayment = await Payment.findOne({
                userId: req.user._id,
                isActive: true
            });

            if (nextPayment) {
                nextPayment.isDefault = true;
                await nextPayment.save();
            }
        }

        res.json({
            success: true,
            message: 'Payment method deleted successfully'
        });

    } catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting payment method'
        });
    }
});

export default router;