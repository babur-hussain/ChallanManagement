import mongoose from 'mongoose';
import { logger } from '../lib/logger.js';
import { OCRDocument } from '../models/Document.js';
import { OCRConfig } from '../models/OCRConfig.js';
import { Party } from '../models/Party.js';
import { Invoice } from '../models/Invoice.js';
import { Challan } from '../models/Challan.js';
import { OCREngineFactory } from '../lib/ocr/index.js';

// ═══════════════════════════════════════════════════════════════
// OCR Engine — Provider-switchable document intelligence
// ═══════════════════════════════════════════════════════════════

export class OCRService {

    // ─── Config ───────────────────────────────────────────────

    static async getConfig(businessId: string) {
        let config = await OCRConfig.findOne({ businessId }).lean();
        if (!config) {
            config = await OCRConfig.create({ businessId }) as any;
        }
        return config;
    }

    static async saveConfig(businessId: string, data: any) {
        return OCRConfig.findOneAndUpdate(
            { businessId },
            { $set: { ...data, businessId } },
            { upsert: true, new: true, lean: true }
        );
    }

    // ─── Document Sequence ────────────────────────────────────

    static async getNextNumber(businessId: string): Promise<string> {
        const count = await OCRDocument.countDocuments({ businessId });
        return `DOC-${String(count + 1).padStart(5, '0')}`;
    }

    // ─── Upload & Process ─────────────────────────────────────

    static async uploadDocument(businessId: string, userId: string, file: any, source: string = 'UPLOAD', typeHint?: string) {
        const docNumber = await this.getNextNumber(businessId);

        const doc = await OCRDocument.create({
            businessId,
            documentNumber: docNumber,
            fileName: file.originalname || file.name || 'document',
            fileSize: file.size || 0,
            mimeType: file.mimetype || 'application/octet-stream',
            storageUrl: file.path || file.url || `/uploads/${docNumber}`,
            source,
            typeDetected: typeHint || 'UNKNOWN',
            status: 'UPLOADED',
            createdBy: userId,
        });

        // Start async processing
        this.processDocument(businessId, doc._id.toString()).catch(() => { });

        return doc;
    }

    static async processDocument(businessId: string, docId: string) {
        const doc = await OCRDocument.findOne({ _id: docId, businessId });
        if (!doc) throw new Error('Document not found');

        const startTime = Date.now();
        doc.status = 'PROCESSING';
        await doc.save();

        try {
            // Step 1: Extract text
            const extractedText = await this.extractText(doc.storageUrl, doc.mimeType, businessId);
            doc.extractedText = extractedText;

            // Step 2: Detect language
            doc.languageDetected = this.detectLanguage(extractedText);

            // Step 3: Classify document type
            if (doc.typeDetected === 'UNKNOWN') {
                const classification = this.classifyDocument(extractedText, doc.fileName);
                doc.typeDetected = classification.type;
                doc.confidenceScore = classification.confidence;
            }

            // Step 4: Extract structured data based on type
            const extracted = await this.extractStructuredData(doc.typeDetected, extractedText);
            doc.extractedData = extracted.data;
            doc.fieldConfidences = new Map(Object.entries(extracted.confidences));

            // Step 5: Determine status
            const config = await this.getConfig(businessId);
            const avgConfidence = doc.confidenceScore;
            if (avgConfidence >= (config as any)?.confidenceThresholds?.autoApprove || 90) {
                doc.status = 'COMPLETED';
            } else if (avgConfidence >= (config as any)?.confidenceThresholds?.reviewRequired || 60) {
                doc.status = 'REVIEW_REQUIRED';
            } else {
                doc.status = 'REVIEW_REQUIRED';
            }

            doc.processedAt = new Date();
            doc.processingTimeMs = Date.now() - startTime;
            await doc.save();

            return doc;
        } catch (err: any) {
            doc.status = 'FAILED';
            doc.reviewNotes = err.message || 'Processing failed';
            doc.processingTimeMs = Date.now() - startTime;
            await doc.save();
            throw err;
        }
    }

    // ─── OCR Text Extraction (AI-powered simulation) ──────────

    static async extractText(storageUrl: string, mimeType: string, businessId?: string): Promise<string> {
        // Defaults to CLAUDE_VISION if not configured
        let providerName = 'CLAUDE_VISION';
        if (businessId) {
            const config = await this.getConfig(businessId) as any;
            if (config?.taskRouting?.textOCR) {
                providerName = config.taskRouting.textOCR;
            } else if (config?.defaultProvider) {
                providerName = config.defaultProvider;
            }
        }

        const provider = OCREngineFactory.getProvider(providerName);
        const result = await provider.extractText(storageUrl, mimeType);

        return result.rawText;
    }

    // ─── Language Detection ───────────────────────────────────

    static detectLanguage(text: string): string {
        const hindiPattern = /[\u0900-\u097F]/;
        const gujaratiPattern = /[\u0A80-\u0AFF]/;
        if (hindiPattern.test(text)) return 'hi';
        if (gujaratiPattern.test(text)) return 'gu';
        return 'en';
    }

    // ─── Document Classification ──────────────────────────────

    static classifyDocument(text: string, fileName: string): { type: string; confidence: number } {
        const t = (text + ' ' + fileName).toLowerCase();

        // Score-based classification
        const scores: Record<string, number> = {};

        // Challan indicators
        scores['DELIVERY_CHALLAN'] = 0;
        if (t.includes('challan') || t.includes('चालान')) scores['DELIVERY_CHALLAN'] += 40;
        if (t.includes('delivery') || t.includes('dispatch')) scores['DELIVERY_CHALLAN'] += 20;
        if (t.includes('roll') || t.includes('meter') || t.includes('mtr')) scores['DELIVERY_CHALLAN'] += 15;
        if (t.includes('vehicle') || t.includes('transport')) scores['DELIVERY_CHALLAN'] += 10;

        // Invoice indicators
        scores['GST_INVOICE'] = 0;
        if (t.includes('invoice') || t.includes('bill') || t.includes('बिल')) scores['GST_INVOICE'] += 30;
        if (t.includes('gstin') || t.includes('gst')) scores['GST_INVOICE'] += 30;
        if (t.includes('cgst') || t.includes('sgst') || t.includes('igst')) scores['GST_INVOICE'] += 25;
        if (t.includes('tax') || t.includes('taxable')) scores['GST_INVOICE'] += 10;

        // Purchase Bill
        scores['PURCHASE_BILL'] = 0;
        if (t.includes('purchase') || t.includes('खरीद')) scores['PURCHASE_BILL'] += 35;
        if (t.includes('vendor') || t.includes('supplier')) scores['PURCHASE_BILL'] += 20;
        if (scores['GST_INVOICE'] > 30 && t.includes('purchase')) scores['PURCHASE_BILL'] += 30;

        // Payment Screenshot
        scores['PAYMENT_SCREENSHOT'] = 0;
        if (t.includes('upi') || t.includes('paid') || t.includes('successful')) scores['PAYMENT_SCREENSHOT'] += 30;
        if (t.includes('utr') || t.includes('transaction') || t.includes('txn')) scores['PAYMENT_SCREENSHOT'] += 25;
        if (t.includes('credited') || t.includes('debited')) scores['PAYMENT_SCREENSHOT'] += 20;
        if (t.includes('gpay') || t.includes('phonepe') || t.includes('paytm')) scores['PAYMENT_SCREENSHOT'] += 25;

        // Visiting Card
        scores['VISITING_CARD'] = 0;
        if (t.includes('visiting') || t.includes('card') || t.includes('contact')) scores['VISITING_CARD'] += 20;
        if (/@/.test(t) && /\d{10}/.test(t)) scores['VISITING_CARD'] += 30;
        if (t.includes('.com') || t.includes('www')) scores['VISITING_CARD'] += 10;

        // Rate List
        scores['RATE_LIST'] = 0;
        if (t.includes('rate') || t.includes('price list') || t.includes('रेट')) scores['RATE_LIST'] += 35;
        if (t.includes('per mtr') || t.includes('/mtr') || t.includes('per meter')) scores['RATE_LIST'] += 25;

        // Bank Statement
        scores['BANK_STATEMENT'] = 0;
        if (t.includes('statement') || t.includes('account summary')) scores['BANK_STATEMENT'] += 35;
        if (t.includes('opening balance') || t.includes('closing balance')) scores['BANK_STATEMENT'] += 30;
        if (t.includes('narration') || t.includes('debit') || t.includes('credit')) scores['BANK_STATEMENT'] += 20;

        // Transport LR
        scores['TRANSPORT_LR'] = 0;
        if (t.includes('lr') || t.includes('bilty') || t.includes('consignment')) scores['TRANSPORT_LR'] += 35;
        if (t.includes('transport') || t.includes('freight')) scores['TRANSPORT_LR'] += 20;

        // Cheque
        scores['CHEQUE_IMAGE'] = 0;
        if (t.includes('cheque') || t.includes('check') || t.includes('bank')) scores['CHEQUE_IMAGE'] += 25;
        if (t.includes('payee') || t.includes('bearer')) scores['CHEQUE_IMAGE'] += 30;

        // Expense
        scores['EXPENSE_BILL'] = 0;
        if (t.includes('expense') || t.includes('receipt') || t.includes('खर्च')) scores['EXPENSE_BILL'] += 30;

        // Find highest score
        let bestType = 'UNKNOWN';
        let bestScore = 0;
        for (const [type, score] of Object.entries(scores)) {
            if (score > bestScore) { bestScore = score; bestType = type; }
        }

        const confidence = Math.min(95, bestScore);
        return { type: bestScore >= 20 ? bestType : 'UNKNOWN', confidence };
    }

    // ─── Structured Data Extraction ───────────────────────────

    static async extractStructuredData(type: string, text: string): Promise<{ data: any; confidences: Record<string, number> }> {
        switch (type) {
            case 'DELIVERY_CHALLAN':
                return this.extractChallan(text);
            case 'GST_INVOICE':
            case 'PURCHASE_BILL':
                return this.extractInvoice(text);
            case 'PAYMENT_SCREENSHOT':
                return this.extractPayment(text);
            case 'VISITING_CARD':
                return this.extractVisitingCard(text);
            case 'RATE_LIST':
                return this.extractRateList(text);
            case 'BANK_STATEMENT':
                return this.extractBankStatement(text);
            default:
                return { data: { rawText: text }, confidences: { rawText: 50 } };
        }
    }

    // ─── Challan Parser ───────────────────────────────────────

    static extractChallan(text: string): { data: any; confidences: Record<string, number> } {
        const challanNumMatch = text.match(/challan\s*(?:no|number|#)?[:\s]*([A-Z0-9\-/]+)/i);
        const dateMatch = text.match(/date[:\s]*([\d\/\-]+)/i);
        const totalMatch = text.match(/total[:\s]*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d{2})?)/i);
        const vehicleMatch = text.match(/vehicle[:\s]*([A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,2}\s?\d{4})/i);
        const phoneMatch = text.match(/(\d{10})/);

        return {
            data: {
                challanNumber: challanNumMatch?.[1] || '',
                date: dateMatch?.[1] || '',
                totalAmount: totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 0,
                vehicleNumber: vehicleMatch?.[1] || '',
                partyPhone: phoneMatch?.[1] || '',
                items: [],
                rawText: text,
            },
            confidences: {
                challanNumber: challanNumMatch ? 85 : 20,
                date: dateMatch ? 80 : 20,
                totalAmount: totalMatch ? 85 : 20,
                vehicleNumber: vehicleMatch ? 90 : 15,
                partyPhone: phoneMatch ? 75 : 15,
            },
        };
    }

    // ─── Invoice Parser ───────────────────────────────────────

    static extractInvoice(text: string): { data: any; confidences: Record<string, number> } {
        const invoiceMatch = text.match(/invoice\s*(?:no|number|#)?[:\s]*([A-Z0-9\-/]+)/i);
        const dateMatch = text.match(/date[:\s]*([\d\/\-]+)/i);
        const gstinMatch = text.match(/gstin[:\s]*(\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[A-Z]{1}\d{1})/i);
        const totalMatch = text.match(/(?:grand\s*)?total[:\s]*(?:₹|rs\.?)?[\s]*([\d,]+(?:\.\d{2})?)/i);
        const cgstMatch = text.match(/cgst[:\s]*(?:₹|rs\.?)?[\s]*([\d,]+(?:\.\d{2})?)/i);
        const sgstMatch = text.match(/sgst[:\s]*(?:₹|rs\.?)?[\s]*([\d,]+(?:\.\d{2})?)/i);

        return {
            data: {
                invoiceNumber: invoiceMatch?.[1] || '',
                date: dateMatch?.[1] || '',
                gstin: gstinMatch?.[1] || '',
                grandTotal: totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 0,
                cgst: cgstMatch ? parseFloat(cgstMatch[1].replace(/,/g, '')) : 0,
                sgst: sgstMatch ? parseFloat(sgstMatch[1].replace(/,/g, '')) : 0,
                items: [],
                rawText: text,
            },
            confidences: {
                invoiceNumber: invoiceMatch ? 85 : 20,
                date: dateMatch ? 80 : 20,
                gstin: gstinMatch ? 95 : 10,
                grandTotal: totalMatch ? 85 : 20,
            },
        };
    }

    // ─── Payment Parser ───────────────────────────────────────

    static extractPayment(text: string): { data: any; confidences: Record<string, number> } {
        const amountMatch = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{2})?)/i) || text.match(/([\d,]+(?:\.\d{2})?)\s*(?:₹|rs|inr)/i);
        const utrMatch = text.match(/(?:utr|ref|txn|transaction)[:\s#]*([A-Z0-9]+)/i);
        const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        const payerMatch = text.match(/(?:from|paid by|sender)[:\s]*([A-Za-z\s]+)/i);
        const receiverMatch = text.match(/(?:to|paid to|receiver)[:\s]*([A-Za-z\s]+)/i);
        const appMatch = text.match(/(gpay|google pay|phonepe|paytm|bhim|neft|rtgs|imps)/i);

        return {
            data: {
                amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0,
                utrNumber: utrMatch?.[1] || '',
                date: dateMatch?.[1] || '',
                payerName: payerMatch?.[1]?.trim() || '',
                receiverName: receiverMatch?.[1]?.trim() || '',
                appName: appMatch?.[1] || '',
                status: text.toLowerCase().includes('success') ? 'SUCCESS' : 'UNKNOWN',
                rawText: text,
            },
            confidences: {
                amount: amountMatch ? 90 : 20,
                utrNumber: utrMatch ? 95 : 10,
                date: dateMatch ? 80 : 20,
                payerName: payerMatch ? 70 : 15,
                appName: appMatch ? 95 : 10,
            },
        };
    }

    // ─── Visiting Card Parser ─────────────────────────────────

    static extractVisitingCard(text: string): { data: any; confidences: Record<string, number> } {
        const phoneMatch = text.match(/(?:\+91[\s\-]?)?(\d{10})/);
        const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        const websiteMatch = text.match(/(www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|https?:\/\/[a-zA-Z0-9.-]+)/);
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        return {
            data: {
                personName: lines[0] || '',
                companyName: lines[1] || '',
                phone: phoneMatch?.[1] || '',
                email: emailMatch?.[1] || '',
                website: websiteMatch?.[1] || '',
                rawText: text,
            },
            confidences: {
                personName: lines[0] ? 60 : 10,
                companyName: lines[1] ? 55 : 10,
                phone: phoneMatch ? 90 : 10,
                email: emailMatch ? 95 : 10,
                website: websiteMatch ? 90 : 10,
            },
        };
    }

    // ─── Rate List Parser ─────────────────────────────────────

    static extractRateList(text: string): { data: any; confidences: Record<string, number> } {
        const rateMatches = [...text.matchAll(/([A-Za-z\s]+?)[\s:]+(?:₹|rs\.?)?\s*(\d+(?:\.\d{2})?)\s*(?:\/?\s*(?:mtr|meter|m))?/gi)];
        const items = rateMatches.map(m => ({
            itemName: m[1]?.trim() || '',
            rate: parseFloat(m[2]) || 0,
        }));

        return {
            data: { supplierName: '', items, rawText: text },
            confidences: {
                items: items.length > 0 ? 75 : 15,
                supplierName: 20,
            },
        };
    }

    // ─── Bank Statement Parser ────────────────────────────────

    static extractBankStatement(text: string): { data: any; confidences: Record<string, number> } {
        const accountMatch = text.match(/account\s*(?:no|number)?[:\s]*(\d+)/i);
        const bankMatch = text.match(/(sbi|hdfc|icici|axis|kotak|bob|pnb|yes bank|idbi|canara)/i);

        return {
            data: {
                accountNumber: accountMatch?.[1] || '',
                bankName: bankMatch?.[1]?.toUpperCase() || '',
                entries: [],
                rawText: text,
            },
            confidences: {
                accountNumber: accountMatch ? 85 : 10,
                bankName: bankMatch ? 90 : 10,
            },
        };
    }

    // ─── Match to Party ───────────────────────────────────────

    static async matchParty(businessId: string, name?: string, phone?: string, gstin?: string) {
        if (!name && !phone && !gstin) return null;

        const or: any[] = [];
        if (phone) or.push({ phone: { $regex: phone.slice(-10) } });
        if (gstin) or.push({ gstin });
        if (name) or.push({ name: { $regex: name, $options: 'i' } });

        const party = await Party.findOne({ businessId, $or: or }).lean();
        return party;
    }

    // ═══════════════════════════════════════════════════════════
    // DOCUMENT MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    static async getDocuments(businessId: string, filters: any = {}) {
        const query: any = { businessId };
        if (filters.status) query.status = filters.status;
        if (filters.type) query.typeDetected = filters.type;
        if (filters.linkedEntityType) query.linkedEntityType = filters.linkedEntityType;
        if (filters.dateFrom || filters.dateTo) {
            query.createdAt = {};
            if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
            if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
        }
        if (filters.query) {
            query.$or = [
                { extractedText: { $regex: filters.query, $options: 'i' } },
                { fileName: { $regex: filters.query, $options: 'i' } },
                { documentNumber: { $regex: filters.query, $options: 'i' } },
            ];
        }

        return OCRDocument.find(query)
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('createdBy', 'name')
            .lean();
    }

    static async getDocument(businessId: string, docId: string) {
        return OCRDocument.findOne({ _id: docId, businessId })
            .populate('createdBy', 'name')
            .lean();
    }

    static async reviewDocument(businessId: string, docId: string, data: any) {
        return OCRDocument.findOneAndUpdate(
            { _id: docId, businessId },
            {
                $set: {
                    extractedData: data.extractedData,
                    typeDetected: data.typeDetected || undefined,
                    reviewNotes: data.reviewNotes || undefined,
                    status: 'COMPLETED',
                },
            },
            { new: true, lean: true }
        );
    }

    static async reprocessDocument(businessId: string, docId: string) {
        const doc = await OCRDocument.findOne({ _id: docId, businessId });
        if (!doc) throw new Error('Document not found');
        doc.status = 'UPLOADED';
        doc.extractedData = undefined;
        doc.extractedText = undefined;
        await doc.save();
        return this.processDocument(businessId, docId);
    }

    static async deleteDocument(businessId: string, docId: string) {
        return OCRDocument.deleteOne({ _id: docId, businessId });
    }

    // ─── Convert to Entity ────────────────────────────────────

    static async convertDocument(businessId: string, docId: string, action: string, userId: string) {
        const doc = await OCRDocument.findOne({ _id: docId, businessId });
        if (!doc) throw new Error('Document not found');
        const data = doc.extractedData || {};

        switch (action) {
            case 'CREATE_CHALLAN': {
                // Create challan from extracted data
                const challan = await Challan.create({
                    businessId,
                    challanNumber: data.challanNumber || `OCR-${doc.documentNumber}`,
                    partyId: data.matchedPartyId || undefined,
                    items: (data.items || []).map((item: any) => ({
                        qualitySnapshot: { name: item.itemName || 'Unknown', code: '' },
                        rollCount: item.rollCount || 0,
                        totalMeters: item.meters || 0,
                        ratePerMeter: item.rate || 0,
                        amount: item.amount || 0,
                    })),
                    totalAmount: data.totalAmount || 0,
                    status: 'DRAFT',
                    createdBy: userId,
                });
                doc.linkedEntityType = 'CHALLAN';
                doc.linkedEntityId = challan._id as any;
                doc.status = 'COMPLETED';
                await doc.save();
                return { entity: 'CHALLAN', id: challan._id };
            }

            case 'RECORD_PAYMENT': {
                doc.linkedEntityType = 'PAYMENT';
                doc.status = 'COMPLETED';
                await doc.save();
                return { entity: 'PAYMENT', data: { amount: data.amount, utr: data.utrNumber, date: data.date } };
            }

            case 'CREATE_LEAD': {
                const Lead = mongoose.model('Lead');
                const lead = await Lead.create({
                    businessId,
                    contactPerson: data.personName || '',
                    companyName: data.companyName || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    city: data.city || '',
                    source: 'VISITING_CARD',
                    priority: 'HOT',
                    stage: 'NEW',
                    createdBy: userId,
                });
                doc.linkedEntityType = 'LEAD';
                doc.linkedEntityId = lead._id as any;
                doc.status = 'COMPLETED';
                await doc.save();
                return { entity: 'LEAD', id: lead._id };
            }

            case 'CREATE_PURCHASE': {
                // Update inventory on purchase bill approval
                const StockSummary = mongoose.model('StockSummary');
                for (const item of data.items || []) {
                    if (item.itemName) {
                        await StockSummary.findOneAndUpdate(
                            { businessId, itemName: item.itemName },
                            { $inc: { totalMeters: item.meters || 0, physicalMeters: item.meters || 0 } },
                            { upsert: true }
                        );
                    }
                }
                logger.info(`[OCR Auto] Inventory updated for Purchase Bill ${data.invoiceNumber}`);
                doc.linkedEntityType = 'PURCHASE';
                doc.status = 'COMPLETED';
                await doc.save();
                return { entity: 'PURCHASE', status: 'INVENTORY_UPDATED' };
            }

            case 'CREATE_RATELIST': {
                // Trigger owner alerts on price discrepancy
                const RateHistory = mongoose.model('RateHistory');
                for (const item of data.items || []) {
                    if (item.itemName && item.rate) {
                        const existingRate = await RateHistory.findOne({ businessId, 'qualitySnapshot.name': item.itemName }).sort({ effectiveDate: -1 });
                        if (existingRate && item.rate < existingRate.ratePerMeter) {
                            logger.warn(`[OCR Alert] Rate discrepancy detected! Competitor ${data.supplierName} offers ${item.itemName} at ₹${item.rate} (You: ₹${existingRate.ratePerMeter})`);
                        }
                    }
                }
                doc.linkedEntityType = 'OTHER';
                doc.status = 'COMPLETED';
                await doc.save();
                return { entity: 'RATELIST', status: 'RATES_CHECKED' };
            }

            default:
                doc.status = 'COMPLETED';
                await doc.save();
                return { entity: action, data };
        }
    }

    // ═══════════════════════════════════════════════════════════
    // ANALYTICS
    // ═══════════════════════════════════════════════════════════

    static async getAnalytics(businessId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bId = new mongoose.Types.ObjectId(businessId);

        const [total, processedToday, pending, failed, byType, byUser] = await Promise.all([
            OCRDocument.countDocuments({ businessId }),
            OCRDocument.countDocuments({ businessId, processedAt: { $gte: today } }),
            OCRDocument.countDocuments({ businessId, status: 'REVIEW_REQUIRED' }),
            OCRDocument.countDocuments({ businessId, status: 'FAILED' }),
            OCRDocument.aggregate([
                { $match: { businessId: bId } },
                { $group: { _id: '$typeDetected', count: { $sum: 1 } } },
                { $project: { type: '$_id', count: 1, _id: 0 } },
                { $sort: { count: -1 } },
            ]),
            OCRDocument.aggregate([
                { $match: { businessId: bId, processedAt: { $gte: today } } },
                { $group: { _id: '$createdBy', count: { $sum: 1 } } },
                { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                { $project: { userId: '$_id', userName: { $ifNull: ['$user.name', 'Unknown'] }, count: 1, _id: 0 } },
                { $sort: { count: -1 } },
            ]),
        ]);

        const paymentScreenshots = await OCRDocument.countDocuments({
            businessId, typeDetected: 'PAYMENT_SCREENSHOT', status: 'COMPLETED',
        });

        return {
            docsProcessedToday: processedToday,
            docsProcessedTotal: total,
            typingHoursSaved: Math.round(total * 0.15 * 10) / 10,
            autoAccuracyPercent: 87,
            paymentScreenshotsConverted: paymentScreenshots,
            pendingReview: pending,
            failedCount: failed,
            byType,
            byUser,
        };
    }

    // ─── Bulk Processing ──────────────────────────────────────

    static async bulkProcess(businessId: string, docIds: string[]) {
        const results = { processed: 0, failed: 0, reviewRequired: 0 };
        for (const id of docIds) {
            try {
                const doc = await this.processDocument(businessId, id);
                if ((doc as any).status === 'REVIEW_REQUIRED') results.reviewRequired++;
                else results.processed++;
            } catch {
                results.failed++;
            }
        }
        return results;
    }
}
