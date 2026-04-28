import { Request, Response, NextFunction } from 'express';
import { Errors } from './errorHandler.js';

// ═══════════════════════════════════════════════════════════════
// Tenant Isolation Middleware
// Ensures all operations are scoped to the authenticated user's business
// ═══════════════════════════════════════════════════════════════

/**
 * Middleware that ensures a businessId is present in the auth payload
 * and makes it easily accessible for downstream query scoping.
 */
export function tenantIsolation(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth?.businessId) {
    return next(Errors.unauthorized('Business context is required'));
  }

  // The businessId is already on req.auth — controllers should always
  // use req.auth.businessId when constructing database queries.
  // This middleware serves as a safety net.
  next();
}

/**
 * Verify that a specific document belongs to the current tenant.
 * Use in route handlers when loading individual documents by ID.
 *
 * @example
 * const challan = await Challan.findById(req.params.id);
 * assertTenantOwnership(challan?.businessId, req.auth!.businessId);
 */
export function assertTenantOwnership(
  documentBusinessId: string | undefined,
  requestBusinessId: string
): void {
  if (!documentBusinessId || documentBusinessId.toString() !== requestBusinessId.toString()) {
    throw Errors.notFound('Resource');
    // We return 404 instead of 403 to prevent enumeration attacks
  }
}
