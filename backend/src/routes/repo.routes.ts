import { Router } from 'express';
import { repoController } from '../controllers/repo.controller';

const router = Router();

// GET /api/dashboard
router.get('/dashboard', (req, res, next) => repoController.getDashboard(req, res, next));

// GET /api/dashboard/:owner/:repoName
router.get('/dashboard/:owner/:repoName', (req, res, next) => {
  req.query.repo = `${req.params.owner}/${req.params.repoName}`;
  return repoController.getDashboard(req, res, next);
});

export default router;
