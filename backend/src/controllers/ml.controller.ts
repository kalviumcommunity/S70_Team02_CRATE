import { Request, Response, NextFunction } from 'express';
import { mlService } from '../services/ml.service';

export class MlController {
  /**
   * POST /api/ml/predict
   * Triggers model execution and returns contributor retention prediction.
   */
  public async predict(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mergeTimeHours, author, repo } = req.body;

      if (mergeTimeHours === undefined || mergeTimeHours === null || typeof Number(mergeTimeHours) !== 'number' || isNaN(Number(mergeTimeHours))) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Parameter "mergeTimeHours" must be a valid number.',
        });
        return;
      }

      const mergeHoursNum = Number(mergeTimeHours);

      if (mergeHoursNum < 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Parameter "mergeTimeHours" must be greater than or equal to 0.',
        });
        return;
      }

      const prediction = await mlService.predict(
        mergeHoursNum,
        author || 'devUser_predict',
        repo || 'expressjs/express'
      );

      res.status(200).json({
        success: true,
        mergeTimeHours: prediction.mergeTimeHours,
        willReturn: prediction.willReturn,
        probability: prediction.probability,
        riskLevel: prediction.riskLevel,
        message: 'Prediction generated successfully using Random Forest model.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const mlController = new MlController();
