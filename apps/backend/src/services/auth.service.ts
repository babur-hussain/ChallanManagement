import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getFirebaseAuth } from '../lib/firebase.js';
import { getRedis } from '../lib/redis.js';
import { Business } from '../models/Business.js';
import { User } from '../models/User.js';
import { AppError, Errors } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';
import { SESSION_CONFIG, getPermissions } from '@textilepro/shared';
import type { ILoginResponse, IRegisterInput, IAuthPayload } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Auth Service
// Registration, login, JWT generation, session management
// ═══════════════════════════════════════════════════════════════

export class AuthService {
  /**
   * Register a new business + owner user
   */
  async register(input: IRegisterInput): Promise<{
    loginResponse: ILoginResponse;
    accessToken: string;
    refreshToken: string;
  }> {
    const firebaseAuth = getFirebaseAuth();

    // 1. Check if email already exists in our DB
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw Errors.conflict('An account with this email already exists');
    }

    // 2. Create Firebase Auth user
    let firebaseUser;
    try {
      firebaseUser = await firebaseAuth.createUser({
        email: input.email,
        password: input.password,
        displayName: input.ownerName,
        phoneNumber: `+91${input.mobile}`,
      });
    } catch (error: unknown) {
      const fbError = error as { code?: string; message?: string };
      if (
        fbError.code === 'auth/email-already-exists' ||
        fbError.code === 'auth/phone-number-already-exists'
      ) {
        // Account exists in Firebase but not in MongoDB (orphaned from previous crash)
        try {
          try {
            firebaseUser = await firebaseAuth.getUserByEmail(input.email);
          } catch {
            firebaseUser = await firebaseAuth.getUserByPhoneNumber(`+91${input.mobile}`);
          }
          await firebaseAuth.updateUser(firebaseUser.uid, {
            email: input.email,
            password: input.password,
            displayName: input.ownerName,
            phoneNumber: `+91${input.mobile}`,
          });
        } catch (updateErr) {
          throw Errors.conflict('An account with this email or phone number already exists');
        }
      } else {
        logger.error('Firebase user creation failed', { error: fbError.message });
        throw Errors.internal('Failed to create account');
      }
    }

    // 3. Create Business document
    const business = await Business.create({
      name: input.businessName,
      gstin: input.gstin || undefined,
      phone: input.mobile,
      email: input.email,
      plan: 'BASIC',
      address: {
        line1: '',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '',
      },
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
    });

    // 4. Create User document (OWNER)
    const user = await User.create({
      firebaseUid: firebaseUser.uid,
      businessId: business._id.toString(),
      name: input.ownerName,
      email: input.email,
      mobile: input.mobile,
      role: 'OWNER',
      lastLoginAt: new Date(),
    });

    // 5. Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens({
      userId: user._id.toString(),
      businessId: business._id.toString(),
      role: 'OWNER',
      plan: business.plan,
    });

    // 6. Build response
    const loginResponse: ILoginResponse = {
      user: user.toJSON(),
      business: business.toJSON(),
      permissions: getPermissions('OWNER'),
    };

    logger.info('New business registered', {
      businessId: business._id.toString(),
      userId: user._id.toString(),
      email: input.email,
    });

    return { loginResponse, accessToken, refreshToken };
  }

  /**
   * Login with Firebase ID token
   */
  async login(firebaseIdToken: string): Promise<{
    loginResponse: ILoginResponse;
    accessToken: string;
    refreshToken: string;
  }> {
    const firebaseAuth = getFirebaseAuth();

    // 1. Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(firebaseIdToken);
    } catch {
      throw Errors.unauthorized('Invalid or expired Firebase token');
    }

    // 2. Look up user by firebaseUid
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      throw new AppError(
        'User account not found. Please register first.',
        401,
        'USER_NOT_FOUND'
      );
    }

    if (!user.isActive) {
      throw Errors.forbidden('Your account has been deactivated. Contact your business owner.');
    }

    // 3. Get business
    const business = await Business.findById(user.businessId);
    if (!business || !business.isActive) {
      throw Errors.forbidden('Your business account is inactive.');
    }

    // 4. Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // 5. Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens({
      userId: user._id.toString(),
      businessId: business._id.toString(),
      role: user.role,
      plan: business.plan,
    });

    // 6. Build response
    const loginResponse: ILoginResponse = {
      user: user.toJSON(),
      business: business.toJSON(),
      permissions: getPermissions(user.role),
    };

    logger.info('User logged in', {
      userId: user._id.toString(),
      businessId: business._id.toString(),
      role: user.role,
    });

    return { loginResponse, accessToken, refreshToken };
  }

  /**
   * Generate JWT access token + refresh token (stored in Redis)
   */
  async generateTokens(payload: IAuthPayload): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const redis = getRedis();

    // Access token (JWT)
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRY,
    });

    // Refresh token (random, stored in Redis)
    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY }
    );

    // Store refresh token in Redis
    const key = `${SESSION_CONFIG.REFRESH_TOKEN_PREFIX}${payload.userId}:${refreshToken.slice(-16)}`;
    const ttl = 30 * 24 * 60 * 60; // 30 days in seconds
    await redis.set(key, JSON.stringify(payload), 'EX', ttl);

    // Enforce max concurrent sessions
    await this.enforceMaxSessions(payload.userId);

    return { accessToken, refreshToken };
  }

  /**
   * Refresh an access token using a refresh token
   */
  async refreshToken(refreshTokenValue: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const decoded = jwt.verify(refreshTokenValue, env.JWT_SECRET) as IAuthPayload & { type: string };

      if (decoded.type !== 'refresh') {
        throw Errors.unauthorized('Invalid token type');
      }

      // Check if refresh token exists in Redis
      const redis = getRedis();
      const key = `${SESSION_CONFIG.REFRESH_TOKEN_PREFIX}${decoded.userId}:${refreshTokenValue.slice(-16)}`;
      const stored = await redis.get(key);

      if (!stored) {
        throw Errors.unauthorized('Refresh token expired or revoked');
      }

      // Delete old refresh token
      await redis.del(key);

      // Get fresh user + business data
      const user = await User.findById(decoded.userId);
      const business = user ? await Business.findById(user.businessId) : null;

      if (!user || !business) {
        throw Errors.unauthorized('Account not found');
      }

      // Generate new tokens
      return this.generateTokens({
        userId: user._id.toString(),
        businessId: business._id.toString(),
        role: user.role,
        plan: business.plan,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw Errors.unauthorized('Invalid refresh token');
    }
  }

  /**
   * Revoke all sessions for a user (force logout)
   */
  async revokeAllSessions(userId: string): Promise<void> {
    const redis = getRedis();
    const pattern = `${SESSION_CONFIG.REFRESH_TOKEN_PREFIX}${userId}:*`;
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
    }

    logger.info('All sessions revoked', { userId, sessionsRevoked: keys.length });
  }

  /**
   * Enforce max concurrent sessions (FIFO eviction of oldest)
   */
  private async enforceMaxSessions(userId: string): Promise<void> {
    const redis = getRedis();
    const pattern = `${SESSION_CONFIG.REFRESH_TOKEN_PREFIX}${userId}:*`;
    const keys = await redis.keys(pattern);

    if (keys.length > SESSION_CONFIG.MAX_CONCURRENT_SESSIONS) {
      // Sort by TTL (ascending) and remove oldest
      const keysWithTtl = await Promise.all(
        keys.map(async (key) => ({
          key,
          ttl: await redis.ttl(key),
        }))
      );

      keysWithTtl.sort((a, b) => a.ttl - b.ttl);

      const toRemove = keysWithTtl.slice(
        0,
        keysWithTtl.length - SESSION_CONFIG.MAX_CONCURRENT_SESSIONS
      );

      if (toRemove.length > 0) {
        await redis.del(...toRemove.map((k) => k.key));
        logger.info('Evicted oldest sessions', {
          userId,
          evicted: toRemove.length,
        });
      }
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string): Promise<ILoginResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw Errors.notFound('User');
    }

    const business = await Business.findById(user.businessId);
    if (!business) {
      throw Errors.notFound('Business');
    }

    return {
      user: user.toJSON(),
      business: business.toJSON(),
      permissions: getPermissions(user.role),
    };
  }
}

export const authService = new AuthService();
