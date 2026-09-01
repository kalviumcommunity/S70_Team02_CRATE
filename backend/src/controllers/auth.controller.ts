import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { githubService } from '../services/github.service';

export class AuthController {
  /**
   * GET /api/auth/github
   * Initiates GitHub OAuth authentication by redirecting to GitHub authorize page.
   */
  public githubLogin(_req: Request, res: Response): void {
    if (!env.GITHUB_CLIENT_ID) {
      res.status(400).json({
        error: 'Configuration Error',
        message: 'GITHUB_CLIENT_ID is not configured in backend/.env file.',
      });
      return;
    }

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.GITHUB_CALLBACK_URL)}&scope=user:email%20read:user`;
    res.redirect(githubAuthUrl);
  }

  /**
   * GET /api/auth/github/callback
   * Handles GitHub OAuth redirect callback, exchanges code for user session, and redirects to frontend.
   */
  public async githubCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = req.query.code as string;

      if (!code) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Authorization code missing in callback parameters.',
        });
        return;
      }

      const accessToken = await githubService.exchangeOAuthCode(code);

      if (!accessToken) {
        res.status(401).json({
          error: 'Authentication Failed',
          message: 'Failed to obtain access token from GitHub.',
        });
        return;
      }

      const userProfile = await githubService.getAuthenticatedUserProfile(accessToken);

      if (!userProfile) {
        res.status(401).json({
          error: 'Authentication Failed',
          message: 'Failed to fetch user profile from GitHub API.',
        });
        return;
      }

      // Redirect back to frontend dashboard with encoded user profile state
      const redirectUrl = `${env.FRONTEND_URL}/?auth=success&user=${encodeURIComponent(JSON.stringify(userProfile))}`;
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/status
   * Returns current backend OAuth configuration status.
   */
  public getAuthStatus(_req: Request, res: Response): void {
    res.status(200).json({
      oauthConfigured: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
      tokenConfigured: Boolean(env.GITHUB_TOKEN),
      callbackUrl: env.GITHUB_CALLBACK_URL,
    });
  }
}

export const authController = new AuthController();
