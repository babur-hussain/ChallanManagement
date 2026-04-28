import { Router, Request, Response } from 'express';
import { InvoiceService } from '../services/invoice.service.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { createInvoiceSchema } from '@textilepro/shared';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { InvoiceTemplate } from '@textilepro/shared/templates';
import { Business } from '../models/Business.js';
import { TenantSettings } from '../models/TenantSettings.js';
import { Invoice } from '../models/Invoice.js';
import puppeteer from 'puppeteer';

const router = Router();
router.use(authenticate, tenantIsolation);

router.get('/next-number', async (req: Request, res: Response) => {
  try {
    const nextStr = await InvoiceService.getNextInvoiceNumber(req.businessId!);
    res.json({ success: true, data: { nextStr } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.get('/:id/html', async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.auth!.businessId }).lean();
    if (!invoice) throw new Error('Invoice not found');

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

    const component = React.createElement(InvoiceTemplate as any, {
      invoice,
      businessProfile: businessProfile as any,
      invoiceSettings: (tSettings as any)?.invoices || {}
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

router.get('/:id/pdf-buffer', async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.auth!.businessId }).lean();
    if (!invoice) throw new Error('Invoice not found');

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

    const component = React.createElement(InvoiceTemplate as any, {
      invoice,
      businessProfile: businessProfile as any,
      invoiceSettings: (tSettings as any)?.invoices || {}
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

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBytes = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
      });
      const base64 = Buffer.from(pdfBytes).toString('base64');
      res.json({ success: true, data: { base64 } });
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.post('/preview', async (req: Request, res: Response) => {
  try {
    const invoiceData = req.body;

    const business = await Business.findById(req.auth!.businessId).lean();
    const tSettings = await TenantSettings.findOne({ businessId: req.auth!.businessId }).lean();

    const profileFromSettings = (tSettings as any)?.profile || {};
    const businessProfile = {
      businessName: profileFromSettings.businessName || (business as any)?.name || '—',
      logo: profileFromSettings.logo || (business as any)?.logo || null,
      gstin: profileFromSettings.gstin || (business as any)?.gstin || '',
      pan: profileFromSettings.pan || (business as any)?.pan || '',
      phoneNumbers: profileFromSettings.phoneNumbers ||
        ((business as any)?.phone ? [(business as any).phone] : []),
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

    const component = React.createElement(InvoiceTemplate as any, {
      invoice: invoiceData as any,
      businessProfile: businessProfile as any,
      invoiceSettings: (tSettings as any)?.invoices || {}
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

    res.json({ success: true, data: html });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validated = createInvoiceSchema.parse(req.body);
    const invoice = await InvoiceService.create(
      req.businessId!,
      req.user!.userId,
      validated
    );
    res.status(201).json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validated = createInvoiceSchema.parse(req.body);
    const invoice = await InvoiceService.update(
      req.businessId!,
      req.params.id,
      req.user!.userId,
      validated
    );
    res.json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, partyId, overdue, search } = req.query;
    const result = await InvoiceService.list(
      req.businessId!,
      { status, paymentStatus, partyId, overdue, search },
      { page: Number(page), limit: Number(limit) }
    );
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.post('/:id/record-payment', async (req: Request, res: Response) => {
  try {
    const { recordPaymentSchema } = await import('@textilepro/shared');
    const validated = recordPaymentSchema.parse(req.body);
    const invoice = await InvoiceService.recordPayment(req.businessId!, req.params.id as string, req.user!.userId, validated);
    res.json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { Invoice } = await import('../models/Invoice.js');
    const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId! }).lean();
    if (!invoice) throw new Error('Not found');

    // Normalize businessSnapshot.address: old docs may have stored an address object
    const addr = invoice.businessSnapshot?.address;
    if (addr && typeof addr === 'object') {
      (invoice as any).businessSnapshot.address = [
        (addr as any).line1,
        (addr as any).line2,
        (addr as any).city,
        (addr as any).state,
        (addr as any).pincode,
      ].filter(Boolean).join(', ');
    }

    res.json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(404).json({ success: false, error: { message: error.message } });
  }
});

export default router;
