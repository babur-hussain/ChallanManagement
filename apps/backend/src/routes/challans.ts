import { Router, Request, Response } from 'express';
import { ChallanService } from '../services/challan.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { PdfService } from '../services/pdf.service.js';
import {
  createChallanSchema,
  cancelChallanSchema,
  markDeliveredSchema
} from '@textilepro/shared';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DeliveryChallanTemplate } from '@textilepro/shared/templates';
import { Business } from '../models/Business.js';
import { TenantSettings } from '../models/TenantSettings.js';

const router = Router();

router.use(authenticate, tenantIsolation);

router.get('/:id/html', async (req: Request, res: Response) => {
  try {
    const challan = await ChallanService.getById(req.auth!.businessId, req.params.id as string);
    const business = await Business.findById(req.auth!.businessId).lean();
    const tSettings = await TenantSettings.findOne({ businessId: req.auth!.businessId }).lean();

    const profileFromSettings = (tSettings as any)?.profile || {};
    const businessProfile = {
      businessName: profileFromSettings.businessName || (business as any)?.name || '—',
      logo: profileFromSettings.logo || (business as any)?.logo || null,
      gstin: profileFromSettings.gstin || (business as any)?.gstin || '',
      pan: profileFromSettings.pan || (business as any)?.pan || '',
      phoneNumbers: profileFromSettings.phoneNumbers || ((business as any)?.phone ? [(business as any).phone] : []),
      email: profileFromSettings.email || (business as any)?.email || '',
      address: {
        line1: profileFromSettings.address?.line1 || (business as any)?.address?.line1 || '',
        line2: profileFromSettings.address?.line2 || (business as any)?.address?.line2 || '',
        city: profileFromSettings.address?.city || (business as any)?.address?.city || '',
        state: profileFromSettings.address?.state || (business as any)?.address?.state || '',
        pincode: profileFromSettings.address?.pincode || (business as any)?.address?.pincode || '',
        country: profileFromSettings.address?.country || 'India',
      },
      website: profileFromSettings.website || '',
      bankDetails: profileFromSettings.bankDetails || {},
    };

    const component = React.createElement(DeliveryChallanTemplate as any, {
      challan,
      businessProfile: businessProfile as any,
      challanSettings: (tSettings as any)?.challans || {},
    });

    const componentHtml = renderToString(component);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=800, user-scalable=yes" />
          <style>
            html, body { margin: 0; padding: 0; background: #fff; }
            * { box-sizing: border-box; }
            ::-webkit-scrollbar { width: 0; height: 0; }
          </style>
        </head>
        <body>
          ${componentHtml}
        </body>
      </html>
    `;
    res.send(html);
  } catch (error: any) {
    res.status(400).send(`Error: ${error.message}`);
  }
});

router.post('/preview', async (req: Request, res: Response) => {
  try {
    const challanData = req.body;

    // Fetch business profile & settings for this tenant
    const business = await Business.findById(req.auth!.businessId).lean();
    const tSettings = await TenantSettings.findOne({ businessId: req.auth!.businessId }).lean();

    // Map Business model fields to what DeliveryChallanTemplate expects
    const profileFromSettings = (tSettings as any)?.profile || {};
    const businessProfile = {
      // Prefer the display name from TenantSettings.profile if set, else fall back to Business.name
      businessName: profileFromSettings.businessName || (business as any)?.name || '—',
      // Logo can come from TenantSettings.profile or Business.logo
      logo: profileFromSettings.logo || (business as any)?.logo || null,
      gstin: profileFromSettings.gstin || (business as any)?.gstin || '',
      pan: profileFromSettings.pan || (business as any)?.pan || '',
      // Template expects phoneNumbers as array
      phoneNumbers: profileFromSettings.phoneNumbers ||
        ((business as any)?.phone ? [(business as any).phone] : []),
      email: profileFromSettings.email || (business as any)?.email || '',
      // Address
      address: {
        line1: profileFromSettings.address?.line1 || (business as any)?.address?.line1 || '',
        line2: profileFromSettings.address?.line2 || (business as any)?.address?.line2 || '',
        city: profileFromSettings.address?.city || (business as any)?.address?.city || '',
        state: profileFromSettings.address?.state || (business as any)?.address?.state || '',
        pincode: profileFromSettings.address?.pincode || (business as any)?.address?.pincode || '',
        country: profileFromSettings.address?.country || 'India',
      },
      website: profileFromSettings.website || '',
      bankDetails: profileFromSettings.bankDetails || {},
    };

    // Create the exact same template component used in the Web App
    const component = React.createElement(DeliveryChallanTemplate, {
      challan: challanData as any,
      businessProfile: businessProfile as any,
      challanSettings: (tSettings as any)?.challans || {}
    });

    const componentHtml = renderToString(component);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=800, user-scalable=yes" />
          <style>
            html, body { margin: 0; padding: 0; background: #fff; }
            * { box-sizing: border-box; }
            .preview-wrapper {
              width: 100%;
              display: flex;
              justify-content: center;
            }
            .challan-page {
              width: 800px !important;
              max-width: 800px !important;
              box-shadow: none !important;
              margin: 0 !important;
            }
          </style>
        </head>
        <body>
          <div class="preview-wrapper">
            ${componentHtml}
          </div>
        </body>
      </html>
    `;

    // Send standard API envelope wrapping the HTML string
    res.json({ success: true, data: html });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get next sequence prediction
router.get('/next-number', async (req: Request, res: Response) => {
  try {
    const nextText = await ChallanService.getNextChallanNumber(req.auth!.businessId);
    res.json({ success: true, data: { nextStr: nextText } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = createChallanSchema.parse(req.body);
    const challan = await ChallanService.create(req.auth!.businessId, req.auth!.userId, validated);
    res.status(201).json({ success: true, data: challan });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      page = 1, limit = 20, search, status, partyId, brokerId, dateFrom, dateTo
    } = req.query;

    const result = await ChallanService.list(
      req.auth!.businessId,
      { search, status, partyId, brokerId, dateFrom, dateTo },
      { page: Number(page), limit: Number(limit) }
    );

    res.json({
      success: true,
      data: result.data,
      stats: result.stats,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const challan = await ChallanService.getById(req.auth!.businessId, req.params.id as string);
    res.json({ success: true, data: challan });
  } catch (error: any) {
    res.status(404).json({ success: false, error: { message: error.message } });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validated = createChallanSchema.parse(req.body);
    const challan = await ChallanService.update(req.auth!.businessId, req.params.id as string, req.auth!.userId, validated);
    res.json({ success: true, data: challan });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { cancellationReason } = cancelChallanSchema.parse(req.body);
    const challan = await ChallanService.cancel(req.auth!.businessId, req.params.id as string, cancellationReason, req.auth!.userId);
    res.json({ success: true, data: challan });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.post('/:id/mark-delivered', async (req: Request, res: Response) => {
  try {
    const parsed = markDeliveredSchema.safeParse(req.body);
    const latLng = parsed.success ? parsed.data.deliveryLatLng : undefined;
    const challan = await ChallanService.markDelivered(req.auth!.businessId, req.params.id as string, latLng, req.auth!.userId);
    res.json({ success: true, data: challan });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.post('/:id/generate-pdf', async (req: Request, res: Response) => {
  try {
    const result = await ChallanService.requestPdf(req.auth!.businessId, req.params.id as string);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.get('/:id/pdf-buffer', async (req: Request, res: Response) => {
  try {
    const base64 = await PdfService.generateChallanPdfBase64(req.params.id as string);
    res.json({ success: true, data: { base64 } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.post('/:id/send-whatsapp', async (req: Request, res: Response) => {
  try {
    const result = await ChallanService.requestWhatsapp(req.auth!.businessId, req.params.id as string);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

export default router;
