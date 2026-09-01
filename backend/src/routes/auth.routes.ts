import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

// GET /api/auth/github - Redirect to GitHub Login
router.get('/github', (req, res) => authController.githubLogin(req, res));

// GET /api/auth/github/callback - OAuth Callback Handler
router.get('/github/callback', (req, res, next) => authController.githubCallback(req, res, next));

// GET /api/auth/status - Check OAuth configuration status
router.get('/status', (req, res) => authController.getAuthStatus(req, res));

export default router;
