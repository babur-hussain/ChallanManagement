import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Errors } from './errorHandler.js';
import { hasPermission, type UserRole, type Plan } from '@textilepro/shared';
import type { IAuthPayload } from '@textilepro/shared';

declare global {
  namespace Express {
    interface Request {
      auth?: IAuthPayload;
      businessId?: string;
      user?: {
        userId: string;
        _id: string;
        role: UserRole;
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Auth Middleware
// JWT verification + RBAC + Plan-based feature gating
// ═══════════════════════════════════════════════════════════════

/**
 * Verify JWT from httpOnly cookie and attach auth payload to request
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = req.cookies?.token;

    if (!token) {
      throw Errors.unauthorized('Authentication required. Please log in.');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as IAuthPayload;

    req.auth = {
      userId: decoded.userId,
      businessId: decoded.businessId,
      role: decoded.role,
      plan: decoded.plan,
    };

    // Populate legacy bindings to prevent crashing across all existing routes
    req.businessId = decoded.businessId;
    req.user = {
      userId: decoded.userId,
      _id: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(Errors.unauthorized('Invalid or expired token. Please log in again.'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(Errors.unauthorized('Session expired. Please log in again.'));
    } else {
      next(error);
    }
  }
}

/**
 * Require specific roles — usage: requireRole(['OWNER', 'ACCOUNTANT'])
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      return next(Errors.unauthorized());
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return next(
        Errors.forbidden(
          `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.auth.role}.`
        )
      );
    }

    next();
  };
}

export const restrictToRole = requireRole;

/**
 * Require specific permission — usage: requirePermission('challans:write')
 */
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      return next(Errors.unauthorized());
    }

    if (!hasPermission(req.auth.role, permission)) {
      return next(
        Errors.forbidden(
          `Access denied. You don't have the "${permission}" permission.`
        )
      );
    }

    next();
  };
}

/**
 * Require business plan to support a feature
 * Usage: requirePlan('reports') or requirePlan(['reports', 'brokers'])
 */
export function requirePlan(features: string | string[]) {
  const requiredFeatures = Array.isArray(features) ? features : [features];

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      return next(Errors.unauthorized());
    }

    // Parse plan features from env
    let planFeatures: Record<string, { maxUsers: number; features: string[] }> = {};
    try {
      planFeatures = JSON.parse(env.PLAN_FEATURES || '{}');
    } catch {
      return next(Errors.internal('Plan configuration error'));
    }

    const currentPlan = planFeatures[req.auth.plan];
    if (!currentPlan) {
      return next(Errors.internal('Plan not found'));
    }

    // Enterprise has access to everything
    if (currentPlan.features.includes('*')) {
      return next();
    }

    const missingFeatures = requiredFeatures.filter(
      (f) => !currentPlan.features.includes(f)
    );

    if (missingFeatures.length > 0) {
      return next(
        new (Errors.forbidden as unknown as new (msg: string) => Error)(
          `Your ${req.auth.plan} plan doesn't include: ${missingFeatures.join(', ')}. Please upgrade your plan.`
        )
      );
    }

    next();
  };
}
