import { Worker } from 'bullmq';
import { getRedis } from '../lib/redis.js';
import { PdfService } from '../services/pdf.service.js';
import { WhatsappService } from '../services/whatsapp.service.js';
import { logger } from '../lib/logger.js';

export function startWorkers() {
  const connection = getRedis();

  // PDF Generation Worker
  const pdfWorker = new Worker('pdf-generation', async job => {
    logger.info(`Processing PDF job ${job.id} for Challan ${job.data.challanId}`);
    try {
      const url = await PdfService.generateChallanPdf(job.data.challanId);
      logger.info(`PDF generated successfully: ${url}`);
      return url;
    } catch (error) {
      logger.error(`PDF generation failed for ${job.data.challanId}`, error);
      throw error; // Will retry based on queue settings
    }
  }, { connection });

  // WhatsApp Messaging Worker
  const whatsappWorker = new Worker('whatsapp-messaging', async job => {
    logger.info(`Processing WhatsApp job ${job.id} for Challan ${job.data.challanId}`);
    try {
      await WhatsappService.sendChallanNotification(job.data.challanId);
    } catch (error) {
      logger.error(`WhatsApp push failed for ${job.data.challanId}`, error);
      throw error;
    }
  }, { connection });

  // Stock Sync Worker
  const stockWorker = new Worker('stock-sync', async job => {
    logger.info(`Processing Stock Sync job ${job.id} for Challan ${job.data.challanId}`);
    try {
      const { Challan } = await import('../models/Challan.js');
      const { InventoryService } = await import('../services/inventory.service.js');
      const mongoose = await import('mongoose');

      const challan: any = await Challan.findById(job.data.challanId);
      if (!challan) throw new Error('Challan not found');

      const isCancel = job.data.type === 'IN';
      const movementType = isCancel ? 'CHALLAN_CANCEL_IN' : 'CHALLAN_OUT';
      const direction = isCancel ? 'IN' : 'OUT';

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Group items in case challan has same quality twice
        const map = new Map<string, number>();
        challan.items.forEach((item: any) => {
          const k = item.itemId.toString();
          map.set(k, (map.get(k) || 0) + item.totalMeters);
        });

        for (const [fabricId, meters] of map) {
          await InventoryService._applyMovement(
            challan.businessId,
            fabricId,
            challan.date,
            movementType,
            meters,
            direction,
            challan.createdBy,
            { referenceId: challan._id.toString(), referenceNumber: challan.challanNumber },
            session
          );
        }

        await session.commitTransaction();
        logger.info(`Stock synced for Challan ${challan.challanNumber}`);
      } catch (e: any) {
        await session.abortTransaction();
        throw e;
      } finally {
        session.endSession();
      }

    } catch (error: any) {
      logger.error(`Stock Sync failed for ${job.data.challanId}`, error);
      throw error;
    }
  }, { connection });

  // Stock Cron Worker
  const stockCronWorker = new Worker('stock-cron', async job => {
    if (job.name === 'check-low-stock') {
      logger.info('⏰ Running Cron: Low Stock Check...');
      // Stub: fetch low-stock items and dispatch WhatsApp reminders
      logger.info('Cron: Low Stock Check complete.');
    }
  }, { connection });

  // Overdue Reminder Cron Worker
  const overdueCronWorker = new Worker('overdue-cron', async job => {
    if (job.name === 'daily-reminders') {
      logger.info('⏰ Running Cron: Overdue Daily Reminders...');
      const { Invoice } = await import('../models/Invoice.js');
      const { automationQueue } = await import('../lib/queue.js');

      const overdueInvoices = await Invoice.find({
        paymentStatus: { $ne: 'PAID' },
        dueDate: { $lt: new Date() }
      });

      for (const inv of overdueInvoices) {
        // Dispatch automation to create tasks for overdue invoices daily
        await automationQueue.add('crm-automation', {
          businessId: inv.businessId,
          eventType: 'INVOICE_OVERDUE',
          referenceId: inv._id.toString(),
          userId: inv.createdBy
        });
      }

      logger.info('Cron: Overdue Daily Reminders complete.');
    }
  }, { connection });

  // Reports & MIS Cron Worker
  const misCronWorker = new Worker('mis-cron', async job => {
    if (job.name === 'monthly-mis' || job.name === 'daily-owner-reports') {
      logger.info(`⏰ Running Cron: ${job.name}...`);
      const { TenantSettings } = await import('../models/TenantSettings.js');

      const isMonthly = job.name === 'monthly-mis';
      const targetFlag = isMonthly ? 'reports.autoMonthlyMis' : 'reports.ownerEmailReports';

      const tenants = await TenantSettings.find({ [targetFlag]: true }).lean();

      for (const tenant of tenants) {
        logger.info(`[REPORTS] Generating ${isMonthly ? 'Monthly MIS' : 'Daily Owner Report'} for Business: ${tenant.businessId}`);
        // Production Stub: Compile gross aggregates -> render PDF/Excel -> SendGrid dispatch 
      }
      logger.info(`Cron: ${job.name} complete. Processed ${tenants.length} tenants.`);
    }
  }, { connection });

  // Automation Engine Worker for CRM Rules
  const automationWorker = new Worker('crm-automation', async job => {
    logger.info(`Processing CRM Automation Event: ${job.name} for Business ${job.data.businessId}`);
    try {
      const { FollowUpTask } = await import('../models/FollowUpTask.js');
      const { Lead } = await import('../models/Lead.js');
      const { Invoice } = await import('../models/Invoice.js');

      const { businessId, eventType, referenceId, userId } = job.data;

      if (eventType === 'LEAD_CREATED') {
        // Auto create first followup in 24 hours
        await FollowUpTask.create({
          businessId,
          relatedType: 'LEAD',
          relatedId: referenceId,
          title: 'First Contact Follow-up',
          description: 'Automated 24-hour follow up for new lead',
          assignedToUserId: userId,
          priority: 'HIGH',
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          status: 'PENDING',
          createdBy: 'SYSTEM'
        });
      } else if (eventType === 'QUOTATION_SENT') {
        // Auto followup after 2 days
        await FollowUpTask.create({
          businessId,
          relatedType: 'LEAD',
          relatedId: referenceId,
          title: 'Quotation Follow-up',
          description: 'Follow up on the sent quotation',
          assignedToUserId: userId,
          priority: 'MEDIUM',
          dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
          createdBy: 'SYSTEM'
        });
      } else if (eventType === 'LEAD_HOT') {
        const lead: any = await Lead.findById(referenceId);
        if (lead && lead.pipelineStage !== 'WON' && lead.pipelineStage !== 'LOST') {
          await FollowUpTask.create({
            businessId,
            relatedType: 'LEAD',
            relatedId: referenceId,
            title: 'Hot Lead Touchpoint',
            description: 'This lead is marked HOT. Ensure constant contact.',
            assignedToUserId: lead.assignedToUserId || userId,
            priority: 'URGENT',
            dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
            status: 'PENDING',
            createdBy: 'SYSTEM'
          });
        }
      } else if (eventType === 'INVOICE_OVERDUE') {
        const invoice: any = await Invoice.findById(referenceId);
        if (invoice && invoice.paymentStatus !== 'PAID') {
          await FollowUpTask.create({
            businessId,
            relatedType: 'INVOICE',
            relatedId: referenceId,
            title: 'Overdue Payment Collection',
            description: `Invoice ${invoice.invoiceNumber} is overdue! Connect immediately.`,
            assignedToUserId: userId, // ideally passed as accountant or owner
            priority: 'URGENT',
            dueAt: new Date(), // Immediate
            status: 'PENDING',
            createdBy: 'SYSTEM'
          });
        }
      }

      logger.info(`CRM Automation successfully processed ${eventType}`);
    } catch (error) {
      logger.error(`CRM Automation Failed`, error);
      throw error;
    }
  }, { connection });

  logger.info('⚙️  Background workers started (PDF, WhatsApp, Stock, Crons, MIS, Automation)');

  return { pdfWorker, whatsappWorker, stockWorker, stockCronWorker, overdueCronWorker, misCronWorker, automationWorker };
}
