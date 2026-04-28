import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '@textilepro/shared';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { Errors } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import type { ApiResponse } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Auth Routes
// POST /api/auth/register, /login, /logout, /refresh, GET /me
// ═══════════════════════════════════════════════════════════════

const router = Router();

// Apply auth rate limiter to all auth routes
router.use(authLimiter);

/**
 * POST /api/auth/register
 * Create new business + owner account
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      throw Errors.badRequest('Validation failed', result.error.flatten().fieldErrors);
    }

    const { loginResponse, accessToken, refreshToken } = await authService.register(result.data);

    // Set JWT as httpOnly cookie
    setCookies(res, accessToken, refreshToken);

    const response: ApiResponse = {
      success: true,
      data: loginResponse,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Verify Firebase ID token and issue JWT
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      throw Errors.badRequest('Validation failed', result.error.flatten().fieldErrors);
    }

    const { loginResponse, accessToken, refreshToken } = await authService.login(
      result.data.firebaseIdToken
    );

    setCookies(res, accessToken, refreshToken);

    const response: ApiResponse = {
      success: true,
      data: loginResponse,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Clear cookies and revoke current session
 */
router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear cookies
    res.clearCookie('token', cookieOptions());
    res.clearCookie('refreshToken', cookieOptions());

    const response: ApiResponse = {
      success: true,
      data: { message: 'Logged out successfully' },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token cookie
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshTokenValue = req.cookies?.refreshToken;
    if (!refreshTokenValue) {
      throw Errors.unauthorized('No refresh token provided');
    }

    const { accessToken, refreshToken } = await authService.refreshToken(refreshTokenValue);

    setCookies(res, accessToken, refreshToken);

    const response: ApiResponse = {
      success: true,
      data: { message: 'Token refreshed' },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await authService.getProfile(req.auth!.userId);

    const response: ApiResponse = {
      success: true,
      data: profile,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/revoke-sessions
 * Owner can revoke all sessions for a user
 */
router.post(
  '/revoke-sessions',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.auth!.role !== 'OWNER') {
        throw Errors.forbidden('Only business owners can revoke sessions');
      }

      const { userId } = req.body;
      if (!userId) {
        throw Errors.badRequest('userId is required');
      }

      await authService.revokeAllSessions(userId);

      const response: ApiResponse = {
        success: true,
        data: { message: 'All sessions revoked' },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// ─── Helpers ────────────────────────────────────────────────

function cookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
} {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
  };
}

function setCookies(res: Response, accessToken: string, refreshToken: string): void {
  const opts = cookieOptions();

  res.cookie('token', accessToken, {
    ...opts,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie('refreshToken', refreshToken, {
    ...opts,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

export default router;
