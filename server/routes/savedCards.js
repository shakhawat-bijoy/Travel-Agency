import express from 'express';
import SavedCard from '../models/SavedCard.js';

const router = express.Router();

// GET /api/saved-cards/:userId - Get user's saved cards
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const savedCards = await SavedCard.find({ userId })
            .sort({ isDefault: -1, lastUsed: -1, createdAt: -1 })
            .select('-__v');

        // Filter out expired cards
        const validCards = savedCards.filter(card => !card.isExpired());

        res.json({
            success: true,
            data: validCards,
            total: validCards.length
        });

    } catch (error) {
        console.error('Get saved cards error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching saved cards',
            error: error.message
        });
    }
});

// POST /api/saved-cards - Save a new card
router.post('/', async (req, res) => {
    try {
        const {
            userId,
            cardholderName,
            cardNumber,
            expiryDate,
            nickname,
            isDefault = false
        } = req.body;

        // Validate required fields
        if (!userId || !cardholderName || !cardNumber || !expiryDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, cardholderName, cardNumber, expiryDate'
            });
        }

        // Check if card already exists (by last 4 digits)
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        const last4Digits = cleanCardNumber.slice(-4);

        const existingCard = await SavedCard.findOne({
            userId,
            cardNumber: { $regex: last4Digits + '$' }
        });

        if (existingCard) {
            return res.status(400).json({
                success: false,
                message: 'A card with these last 4 digits is already saved'
            });
        }

        // Create new saved card
        const savedCard = new SavedCard({
            userId,
            cardholderName,
            cardNumber: cleanCardNumber, // Will be masked in pre-save middleware
            expiryDate,
            nickname,
            isDefault
        });

        await savedCard.save();

        res.json({
            success: true,
            data: savedCard,
            message: 'Card saved successfully'
        });

    } catch (error) {
        console.error('Save card error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving card',
            error: error.message
        });
    }
});

// PUT /api/saved-cards/:cardId - Update saved card
router.put('/:cardId', async (req, res) => {
    try {
        const { cardId } = req.params;
        const { cardholderName, expiryDate, nickname, isDefault } = req.body;

        const savedCard = await SavedCard.findById(cardId);

        if (!savedCard) {
            return res.status(404).json({
                success: false,
                message: 'Saved card not found'
            });
        }

        // Update allowed fields
        if (cardholderName) savedCard.cardholderName = cardholderName;
        if (expiryDate) savedCard.expiryDate = expiryDate;
        if (nickname !== undefined) savedCard.nickname = nickname;
        if (isDefault !== undefined) savedCard.isDefault = isDefault;

        await savedCard.save();

        res.json({
            success: true,
            data: savedCard,
            message: 'Card updated successfully'
        });

    } catch (error) {
        console.error('Update saved card error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating card',
            error: error.message
        });
    }
});

// DELETE /api/saved-cards/:cardId - Delete saved card
router.delete('/:cardId', async (req, res) => {
    try {
        const { cardId } = req.params;

        const savedCard = await SavedCard.findByIdAndDelete(cardId);

        if (!savedCard) {
            return res.status(404).json({
                success: false,
                message: 'Saved card not found'
            });
        }

        res.json({
            success: true,
            message: 'Card deleted successfully'
        });

    } catch (error) {
        console.error('Delete saved card error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting card',
            error: error.message
        });
    }
});

// PUT /api/saved-cards/:cardId/set-default - Set card as default
router.put('/:cardId/set-default', async (req, res) => {
    try {
        const { cardId } = req.params;

        const savedCard = await SavedCard.findById(cardId);

        if (!savedCard) {
            return res.status(404).json({
                success: false,
                message: 'Saved card not found'
            });
        }

        // Remove default from other cards
        await SavedCard.updateMany(
            { userId: savedCard.userId, _id: { $ne: cardId } },
            { isDefault: false }
        );

        // Set this card as default
        savedCard.isDefault = true;
        await savedCard.save();

        res.json({
            success: true,
            data: savedCard,
            message: 'Card set as default successfully'
        });

    } catch (error) {
        console.error('Set default card error:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting default card',
            error: error.message
        });
    }
});

// PUT /api/saved-cards/:cardId/update-last-used - Update last used timestamp
router.put('/:cardId/update-last-used', async (req, res) => {
    try {
        const { cardId } = req.params;

        const savedCard = await SavedCard.findByIdAndUpdate(
            cardId,
            { lastUsed: new Date() },
            { new: true }
        );

        if (!savedCard) {
            return res.status(404).json({
                success: false,
                message: 'Saved card not found'
            });
        }

        res.json({
            success: true,
            data: savedCard,
            message: 'Last used timestamp updated'
        });

    } catch (error) {
        console.error('Update last used error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating last used timestamp',
            error: error.message
        });
    }
});

export default router;