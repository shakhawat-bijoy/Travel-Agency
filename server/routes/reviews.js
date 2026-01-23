import { Router } from 'express';
import { 
  getReviews, 
  getMyReviews, 
  createReview, 
  deleteReview 
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.route('/')
  .get(getReviews)
  .post(protect, createReview);

router.route('/my')
  .get(protect, getMyReviews);

router.route('/:id')
  .delete(protect, deleteReview);

export default router;
