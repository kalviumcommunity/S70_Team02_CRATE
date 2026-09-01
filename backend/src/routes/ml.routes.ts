import { Router } from 'express';
import { mlController } from '../controllers/ml.controller';

const router = Router();

// POST /api/ml/predict
router.post('/predict', (req, res, next) => mlController.predict(req, res, next));

export default router;
