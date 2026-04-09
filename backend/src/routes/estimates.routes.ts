import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { createEstimate, getEstimate, getCustomerEstimates } from '../controllers/estimates.controller';

const router = Router();

router.post('/', authenticate, upload.array('photos', 5), createEstimate);
router.get('/my-estimates', authenticate, getCustomerEstimates);
router.get('/:id', authenticate, getEstimate);

export default router;
