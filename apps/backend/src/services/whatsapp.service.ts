import { logger } from '../lib/logger.js';
import { Challan } from '../models/Challan.js';
import { OCRService } from './ocr.service.js';
import crypto from 'crypto';

export class WhatsappService {
  /**
   * Stub for sending WhatsApp message via WATI/Twilio
   */
  static async sendChallanNotification(challanId: string): Promise<boolean> {
    const challan: any = await Challan.findById(challanId).populate('businessId');
    if (!challan) throw new Error('Challan not found');

    const sendTo = challan.partySnapshot.phone || challan.whatsappSentTo;
    if (!sendTo) {
      logger.error(`No phone number available for Challan ${challan.challanNumber}`, { challanId });
      return false;
    }

    // ─────────────────────────────────────────────────────────────────
    // 🚧 WATI / TWILIO API INTEGRATION GOES HERE
    // In production, make the HTTP request to the provider's API.
    // Example:
    // await axios.post('https://live-wati.app/api/v1/sendTemplateMessage', {
    //   whatsappNumber: sendTo,
    //   template_name: 'delivery_challan',
    //   broadcast_name: 'Challan System',
    //   parameters: [ { name: 'partyName', value: challan.partySnapshot.name }, ... ]
    // }, { headers: { Authorization: `Bearer ${watiToken}` }});
    // ─────────────────────────────────────────────────────────────────

    logger.info(`[MOCK] WhatsApp sent to ${sendTo} for Challan ${challan.challanNumber}`);

    challan.whatsappSentAt = new Date();
    challan.whatsappSentTo = sendTo;
    challan.whatsappMessageId = `mock-msg-id-${Date.now()}`;

    // Automatically move status to SENT if it was DRAFT
    if (challan.status === 'DRAFT') {
      challan.status = 'SENT';
    }

    await challan.save();

    return true;
  }

  /**
   * Handle incoming WhatsApp Webhook 
   * specifically for auto-importing images (screenshot, bills) to OCR Center.
   */
  static async handleIncomingWebhook(businessId: string, payload: any): Promise<boolean> {
    try {
      // Example WATI/Meta webhook parsing for images
      if (payload.type === 'image' && payload.data) {
        const fileUrl = payload.data; // provider's temporary media url
        const senderPhone = payload.sender;

        logger.info(`[WhatsApp Inbound] Received image from ${senderPhone}. Forwarding to OCR Center...`);

        // Mocking file buffer download in production
        const mockFile = {
          originalname: `wa_image_${crypto.randomUUID().slice(0, 5)}.jpg`,
          size: 450000,
          mimetype: 'image/jpeg',
          path: fileUrl,
        };

        // Attempt to match the sender to a User to assign the document.
        // For now, we use a generic or system 'BOT' user ID assigned via ENV.
        const botUserId = new mongoose.Types.ObjectId().toString(); // stub

        await OCRService.uploadDocument(businessId, botUserId, mockFile, 'WHATSAPP');
        return true;
      }
      return false;
    } catch (e) {
      logger.error(`Error processing WhatsApp webhook: ${e}`);
      return false;
    }
  }
}
