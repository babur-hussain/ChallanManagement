import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { morganStream } from './lib/logger.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { globalLimiter } from './middleware/rateLimiter.js';

// Routes
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import itemRoutes from './routes/items.js';
import partyRoutes from './routes/parties.js';
import brokerRoutes from './routes/brokers.js';
import brandRoutes from './routes/brands.js';
import unitRoutes from './routes/units.js';
import taxCodeRoutes from './routes/tax-codes.js';
import attributeRoutes from './routes/attributes.js';
import warehouseRoutes from './routes/warehouses.js';
import challanRoutes from './routes/challans.js';
import invoiceRoutes from './routes/invoices.js';
import inventoryRoutes from './routes/inventory.js';
import analyticsRoutes from './routes/analytics.js';
import reportRoutes from './routes/reports.js';
import leadRoutes from './routes/leads.js';
import { taskRouter } from './routes/tasks.js';
import { visitRouter } from './routes/visits.js';
import { salesRouter } from './routes/sales.js';
import quotationRoutes from './routes/quotations.js';
import collectionRoutes from './routes/collections.js';
import whatsappRoutes from './routes/whatsapp.js';
import documentRoutes from './routes/documents.js';
import marketplaceRoutes from './routes/marketplace.js';
import { financeRouter } from './routes/finance.js';
import { journalRouter } from './routes/journal.js';
import { enterpriseRouter } from './routes/enterprise.js';
import { adminRouter } from './routes/saas-admin.js';
import { partnerRouter } from './routes/partners.js';
import { webhooksRouter } from './routes/webhooks.js';
import { opsRouter } from './routes/ops.js';
import { growthRouter } from './routes/growth.js';
import { publicV1Router } from './routes/public-v1.js';
import { integrationsRouter } from './routes/integrations.js';
import { manufacturingRouter } from './routes/manufacturing.js';
import settingsRouter from './routes/settings.js';
import { systemRouter } from './routes/system.js';
import uploadRouter from './routes/upload.js';
import userRoutes from './routes/users.js';

// ═══════════════════════════════════════════════════════════════
// Express App Factory
// ═══════════════════════════════════════════════════════════════

export function createApp(): express.Application {
  const app = express();

  // ─── Security ──────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    })
  );

  // ─── Parsers ───────────────────────────────────────────────
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ─── Request ID ────────────────────────────────────────────
  app.use(requestIdMiddleware);

  // ─── Logging ───────────────────────────────────────────────
  const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
  app.use(morgan(morganFormat, { stream: morganStream }));

  // ─── Rate Limiting ─────────────────────────────────────────
  app.use(globalLimiter);

  // ─── Routes ────────────────────────────────────────────────
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);

  // Master Data
  app.use('/api/categories', categoryRoutes);
  app.use('/api/items', itemRoutes);
  app.use('/api/parties', partyRoutes);
  app.use('/api/brokers', brokerRoutes);
  app.use('/api/brands', brandRoutes);
  app.use('/api/units', unitRoutes);
  app.use('/api/tax-codes', taxCodeRoutes);
  app.use('/api/attributes', attributeRoutes);
  app.use('/api/warehouses', warehouseRoutes);

  // CRM
  app.use('/api/leads', leadRoutes);
  app.use('/api/tasks', taskRouter);
  app.use('/api/visits', visitRouter);
  app.use('/api/sales', salesRouter);

  // Transactions
  app.use('/api/challans', challanRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/quotations', quotationRoutes);
  app.use('/api/collections', collectionRoutes);
  app.use('/api/whatsapp', whatsappRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/reports', reportRoutes);

  // Marketplace & Network Mode
  app.use('/api/marketplace', marketplaceRoutes);
  app.use('/api/finance', financeRouter);
  app.use('/api/journal', journalRouter);
  app.use('/api/enterprise', enterpriseRouter);

  // SaaS Monetization & Reseller OS
  app.use('/api/admin', adminRouter);
  app.use('/api/partners', partnerRouter);
  app.use('/api/webhooks', webhooksRouter);

  // Platform DevOps & Data Warehouse
  app.use('/api/ops', opsRouter);

  // GTM Hypergrowth & Pipeline
  app.use('/api/growth', growthRouter);

  // External API Ecosystem & Identifiers
  app.use('/api/public/v1', publicV1Router);
  app.use('/api/integrations', integrationsRouter);

  // Vertical SaaS Moduels (e.g., Garment Mfg)
  app.use('/api/manufacturing', manufacturingRouter);

  // Settings & System
  app.use('/api/settings', settingsRouter);
  app.use('/api/system', systemRouter);
  app.use('/api/users', userRoutes);
  app.use('/api/upload', uploadRouter);

  // ─── 404 Handler ───────────────────────────────────────────
  app.use(notFoundHandler);

  // ─── Global Error Handler (must be last) ───────────────────
  app.use(globalErrorHandler);

  return app;
}
