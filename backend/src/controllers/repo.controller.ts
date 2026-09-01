import { Request, Response, NextFunction } from 'express';
import { mlService } from '../services/ml.service';

export class RepoController {
  /**
   * GET /api/dashboard
   * GET /api/dashboard?repo=:owner/:repoName
   * Returns complete dashboard metrics, onboarding score, AI analysis, and recent predictions.
   */
  public async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const repoQuery = (req.query.repo as string) || (req.params.repo as string) || 'expressjs/express';
      
      const dashboardData = await mlService.getDashboardData(repoQuery);

      res.status(200).json(dashboardData);
    } catch (error) {
      next(error);
    }
  }
}

export const repoController = new RepoController();
