import puppeteer from 'puppeteer';
import { getS3Client } from '../lib/s3.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { Challan } from '../models/Challan.js';
import { Business } from '../models/Business.js';
import { logger } from '../lib/logger.js';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DeliveryChallanTemplate } from '@textilepro/shared/templates';
import { PartyLedgerService } from './partyLedger.service.js';

export class PdfService {
  private static renderModernChallanHtml(challan: any, business: any, settings: any): string {
    const profileFromSettings = settings?.profile || {};
    const businessProfile = {
      businessName: profileFromSettings.businessName || business?.name || '—',
      logo: profileFromSettings.logo || business?.logo || null,
      gstin: profileFromSettings.gstin || business?.gstin || '',
      pan: profileFromSettings.pan || business?.pan || '',
      phoneNumbers: profileFromSettings.phoneNumbers || (business?.phone ? [business.phone] : []),
      email: profileFromSettings.email || business?.email || '',
      address: {
        line1: profileFromSettings.address?.line1 || business?.address?.line1 || '',
        line2: profileFromSettings.address?.line2 || business?.address?.line2 || '',
        city: profileFromSettings.address?.city || business?.address?.city || '',
        state: profileFromSettings.address?.state || business?.address?.state || '',
        pincode: profileFromSettings.address?.pincode || business?.address?.pincode || '',
        country: profileFromSettings.address?.country || 'India',
      },
      website: profileFromSettings.website || '',
      bankDetails: profileFromSettings.bankDetails || {},
    };

    const component = React.createElement(DeliveryChallanTemplate as any, {
      challan,
      businessProfile: businessProfile as any,
      challanSettings: settings?.challans || {},
    });

    const componentHtml = renderToString(component);
    return `
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
  }

  /**
   * Generates a PDF for a challan and uploads it directly to S3
   * @param challanId ID of the challan
   * @returns S3 URL of the generated PDF
   */
  static async generateChallanPdf(challanId: string): Promise<string> {
    const challan: any = await Challan.findById(challanId);
    if (!challan) throw new Error('Challan not found');

    const business = await Business.findById(challan.businessId);
    if (!business) throw new Error('Business not found');

    const { TenantSettings } = await import('../models/TenantSettings.js');
    const settings = await TenantSettings.findOne({ businessId: business._id }).lean();

    // 1. Generate HTML
    const html = this.renderModernChallanHtml(challan, business, settings);

    // In dev mode, skip Puppeteer and S3 so we don't freeze the app without Docker running
    if (env.NODE_ENV === 'development') {
      const devUrl = `/app/challans/${challanId}/print`; // Fake URL just links to print view
      challan.pdfUrl = devUrl;
      challan.pdfGeneratedAt = new Date();
      await challan.save();
      logger.info(`Dev Mode: Skipped PDF generation for Challan ${challan.challanNumber}`, { challanId });
      return devUrl;
    }

    // 2. Render PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let pdfBuffer: Buffer;
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBytes = await page.pdf({
        format: challan.paperSize || 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        }
      });
      pdfBuffer = Buffer.from(pdfBytes);
    } finally {
      await browser.close();
    }

    // 3. Upload to AWS S3
    const s3Key = `challans/${business._id.toString()}/${challan.challanNumber.replace(/\//g, '_')}.pdf`;

    await getS3Client().send(new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
      ContentDisposition: 'inline'
    }));

    // Generate the public/presigned URL pattern matching logic 
    // In our case since it's a SaaS, files might be private, but for now we'll 
    // construct a direct URL if the bucket is public, or a generic path that our own proxy endpoint resolves
    const pdfUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${s3Key}`;

    // Update challan record
    challan.pdfUrl = pdfUrl;
    challan.pdfGeneratedAt = new Date();
    await challan.save();

    logger.info(`PDF generated for Challan ${challan.challanNumber}`, { challanId });

    return pdfUrl;
  }

  /**
   * Generates a PDF synchronously and returns it as a base64 string (skips S3).
   * Useful for mobile apps requiring immediate share-sheet rendering.
   */
  static async generateChallanPdfBase64(challanId: string): Promise<string> {
    const challan: any = await Challan.findById(challanId);
    if (!challan) throw new Error('Challan not found');

    const business = await Business.findById(challan.businessId);
    if (!business) throw new Error('Business not found');

    const { TenantSettings } = await import('../models/TenantSettings.js');
    const settings = await TenantSettings.findOne({ businessId: business._id }).lean();

    const html = this.renderModernChallanHtml(challan, business, settings);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBytes = await page.pdf({
        format: challan.paperSize || 'A4',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
      });
      return Buffer.from(pdfBytes).toString('base64');
    } finally {
      await browser.close();
    }
  }

  /**
   * Generates a PDF for a Party Ledger Statement
   */
  static async generatePartyLedgerPdf(businessId: string, partyId: string, fromDate?: Date, toDate?: Date): Promise<string> {
    const statement = await PartyLedgerService.getStatement(businessId, partyId, fromDate, toDate);
    const business = await Business.findById(businessId);

    // Quick and elegant HTML string builder for the Ledger
    const htmlRows = statement.ledger.map((row: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px;">${new Date(row.date).toLocaleDateString('en-IN')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px;">${row.type}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px; font-weight: bold;">${row.reference}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px;">${row.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px; text-align: right; color: #d32f2f;">${row.debit > 0 ? '₹' + row.debit.toLocaleString('en-IN') : '-'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px; text-align: right; color: #2e7d32;">${row.credit > 0 ? '₹' + row.credit.toLocaleString('en-IN') : '-'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 11px; text-align: right; font-weight: bold;">₹${Math.abs(row.runningBalance).toLocaleString('en-IN')} ${row.runningBalance > 0 ? 'Dr' : 'Cr'}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
             body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
             .header { text-align: center; margin-bottom: 30px; }
             .business-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
             .report-title { font-size: 18px; color: #666; margin-bottom: 20px; }
             .info-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 30px; background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
             th { background: #f5f5f5; padding: 12px 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #ddd; }
             .totals { margin-top: 30px; float: right; width: 40%; background: #f9f9f9; padding: 20px; border-radius: 8px; }
             .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business-name">${business?.name || 'Company Ledger'}</div>
            <div class="report-title">Account Statement</div>
          </div>
          <div class="info-grid">
            <div>
              <strong>Party:</strong> ${statement.party.name}<br/>
              <strong>GSTIN:</strong> ${statement.party.gstin || 'N/A'}<br/>
              <strong>Contact:</strong> ${statement.party.phone || 'N/A'}
            </div>
            <div style="text-align: right;">
              <strong>Period:</strong> ${statement.periodStart.toLocaleDateString('en-IN')} to ${statement.periodEnd.toLocaleDateString('en-IN')}<br/>
              <strong>Opening Balance:</strong> ₹${Math.abs(statement.openingBalance).toLocaleString('en-IN')} ${statement.openingBalance > 0 ? 'Dr' : 'Cr'}<br/>
              <strong>Closing Balance:</strong> ₹${Math.abs(statement.closingBalance).toLocaleString('en-IN')} ${statement.closingBalance > 0 ? 'Dr' : 'Cr'}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Voucher #</th>
                <th>Particulars</th>
                <th style="text-align: right;">Debit (₹)</th>
                <th style="text-align: right;">Credit (₹)</th>
                <th style="text-align: right;">Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows}
            </tbody>
          </table>

          <div class="totals">
             <div class="total-row"><span>Total Debit:</span> <strong>₹${statement.totalDebit.toLocaleString('en-IN')}</strong></div>
             <div class="total-row"><span>Total Credit:</span> <strong>₹${statement.totalCredit.toLocaleString('en-IN')}</strong></div>
             <div class="total-row" style="border-top: 1px solid #ddd; padding-top: 10px; font-size: 16px;">
                <span>Net Closing Balance:</span> 
                <strong>₹${Math.abs(statement.closingBalance).toLocaleString('en-IN')} ${statement.closingBalance > 0 ? 'Dr' : 'Cr'}</strong>
             </div>
          </div>
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
      return Buffer.from(pdfBytes).toString('base64');
    } finally {
      await browser.close();
    }
  }
}
