import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { MessageTemplate } from '../models/MessageTemplate.js';
import { Campaign } from '../models/Campaign.js';
import { WhatsAppConfig } from '../models/WhatsAppConfig.js';
import { Party } from '../models/Party.js';
import { Invoice } from '../models/Invoice.js';
import { Challan } from '../models/Challan.js';
import { Quotation } from '../models/Quotation.js';
import { PartyCreditProfile } from '../models/PartyCreditProfile.js';

export class InboxService {

    // ═══════════════════════════════════════════════════════════
    // CONFIG
    // ═══════════════════════════════════════════════════════════

    static async getConfig(businessId: string) {
        return WhatsAppConfig.findOne({ businessId }).lean();
    }

    static async saveConfig(businessId: string, data: any) {
        return WhatsAppConfig.findOneAndUpdate(
            { businessId },
            { ...data, businessId, isConnected: true, connectedAt: new Date() },
            { upsert: true, new: true, lean: true }
        );
    }

    // ═══════════════════════════════════════════════════════════
    // CONVERSATIONS
    // ═══════════════════════════════════════════════════════════

    static async getConversations(businessId: string, filters: any = {}) {
        const query: any = { businessId };
        if (filters.status) query.status = filters.status;
        if (filters.assignedToUserId) query.assignedToUserId = filters.assignedToUserId;
        if (filters.isStarred === 'true') query.isStarred = true;
        if (filters.unread === 'true') query.unreadCount = { $gt: 0 };
        if (filters.linkedPartyId) query.linkedPartyId = { $exists: true, $ne: null };
        if (filters.linkedLeadId) query.linkedLeadId = { $exists: true, $ne: null };
        if (filters.search) {
            query.$or = [
                { contactName: { $regex: filters.search, $options: 'i' } },
                { phone: { $regex: filters.search } },
            ];
        }

        return Conversation.find(query)
            .sort({ isPinned: -1, updatedAt: -1 })
            .populate('linkedPartyId', 'name')
            .populate('linkedLeadId', 'contactPerson companyName')
            .populate('assignedToUserId', 'name')
            .lean();
    }

    static async getOrCreateConversation(businessId: string, phone: string, contactName: string) {
        let conv = await Conversation.findOne({ businessId, phone });
        if (!conv) {
            // Auto-link to party if phone matches
            const party = await Party.findOne({ businessId, phone: { $regex: phone.slice(-10) } });
            conv = await Conversation.create({
                businessId,
                phone,
                contactName: party ? (party as any).name : contactName,
                linkedPartyId: party ? (party as any)._id : undefined,
                status: 'OPEN',
            });
        }
        return conv;
    }

    static async updateConversation(businessId: string, convId: string, data: any) {
        return Conversation.findOneAndUpdate(
            { _id: convId, businessId },
            { $set: data },
            { new: true, lean: true }
        );
    }

    static async assignChat(businessId: string, convId: string, userId: string) {
        return Conversation.findOneAndUpdate(
            { _id: convId, businessId },
            { $set: { assignedToUserId: userId } },
            { new: true, lean: true }
        );
    }

    static async markSeen(businessId: string, convId: string) {
        return Conversation.findOneAndUpdate(
            { _id: convId, businessId },
            { $set: { unreadCount: 0, lastSeenAt: new Date() } },
            { new: true, lean: true }
        );
    }

    // ═══════════════════════════════════════════════════════════
    // MESSAGES
    // ═══════════════════════════════════════════════════════════

    static async getMessages(businessId: string, conversationId: string, page = 1, limit = 50) {
        return ChatMessage.find({ businessId, conversationId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('sentByUserId', 'name')
            .lean();
    }

    static async sendMessage(businessId: string, userId: string, data: any) {
        const conv = await Conversation.findOne({ _id: data.conversationId, businessId });
        if (!conv) throw new Error('Conversation not found');

        const message = await ChatMessage.create({
            businessId,
            conversationId: data.conversationId,
            direction: 'OUTBOUND',
            type: data.type || 'TEXT',
            body: data.body,
            mediaUrl: data.mediaUrl,
            isInternalNote: data.isInternalNote || false,
            isStarred: false,
            sentByUserId: userId,
            deliveryStatus: data.isInternalNote ? undefined : 'SENT',
        });

        // Update conversation last message
        if (!data.isInternalNote) {
            conv.lastMessage = {
                text: data.body.substring(0, 100),
                type: data.type || 'TEXT',
                direction: 'OUTBOUND',
                sentAt: new Date(),
            };
            conv.status = 'OPEN';
            await conv.save();
        }

        return message;
    }

    static async receiveMessage(businessId: string, phone: string, contactName: string, data: any) {
        const conv = await this.getOrCreateConversation(businessId, phone, contactName);

        const message = await ChatMessage.create({
            businessId,
            conversationId: conv._id,
            providerMessageId: data.providerMessageId,
            direction: 'INBOUND',
            type: data.type || 'TEXT',
            body: data.body,
            mediaUrl: data.mediaUrl,
            isInternalNote: false,
            isStarred: false,
            deliveryStatus: 'DELIVERED',
        });

        conv.lastMessage = {
            text: data.body.substring(0, 100),
            type: data.type || 'TEXT',
            direction: 'INBOUND',
            sentAt: new Date(),
        };
        conv.unreadCount = (conv.unreadCount || 0) + 1;
        conv.status = 'OPEN';
        conv.contactName = contactName || conv.contactName;
        await conv.save();

        return { conversation: conv, message };
    }

    static async starMessage(businessId: string, messageId: string) {
        return ChatMessage.findOneAndUpdate(
            { _id: messageId, businessId },
            [{ $set: { isStarred: { $not: '$isStarred' } } }],
            { new: true, lean: true }
        );
    }

    // ═══════════════════════════════════════════════════════════
    // CUSTOMER CONTEXT
    // ═══════════════════════════════════════════════════════════

    static async getCustomerContext(businessId: string, convId: string) {
        const conv = await Conversation.findOne({ _id: convId, businessId }).lean() as any;
        if (!conv) return null;

        const partyId = conv.linkedPartyId;
        let party = null;
        let outstanding = 0;
        let recentChallans: any[] = [];
        let recentInvoices: any[] = [];
        let pendingQuotations = 0;
        let riskScore = 75;
        let creditGrade = 'B';

        if (partyId) {
            [party, recentChallans, recentInvoices, pendingQuotations] = await Promise.all([
                Party.findById(partyId).lean(),
                Challan.find({ businessId, partyId }).sort({ createdAt: -1 }).limit(5).lean(),
                Invoice.find({ businessId, partyId }).sort({ createdAt: -1 }).limit(5).lean(),
                Quotation.countDocuments({ businessId, 'customerSnapshot.partyId': partyId, status: { $in: ['SENT', 'VIEWED'] } }),
            ]);

            const unpaidInvoices = await Invoice.find({ businessId, partyId, paymentStatus: { $ne: 'PAID' } }).lean();
            outstanding = unpaidInvoices.reduce((s: number, inv: any) => s + ((inv.grandTotal || 0) - (inv.amountPaid || 0)), 0);

            const profile = await PartyCreditProfile.findOne({ businessId, partyId }).lean() as any;
            if (profile) {
                riskScore = profile.creditScore || 75;
                creditGrade = profile.creditGrade || 'B';
            }
        }

        return {
            party,
            lead: conv.linkedLeadId ? await mongoose.model('Lead').findById(conv.linkedLeadId).lean().catch(() => null) : null,
            outstanding,
            recentChallans,
            recentInvoices,
            lastOrderDate: recentChallans[0]?.createdAt || recentInvoices[0]?.createdAt,
            pendingQuotations,
            riskScore,
            creditGrade,
            tags: conv.tags || [],
        };
    }

    // ═══════════════════════════════════════════════════════════
    // AI BOT (Texi Bot)
    // ═══════════════════════════════════════════════════════════

    static async processAIResponse(businessId: string, conversationId: string, inboundText: string) {
        const conv = await Conversation.findById(conversationId).lean() as any;
        const partyId = conv?.linkedPartyId;
        const text = inboundText.toLowerCase();

        // Rate inquiry
        if (text.includes('rate') || text.includes('price') || text.includes('कितने') || text.includes('भाव')) {
            const qualityMatch = inboundText.match(/(?:rate|price|भाव|रेट)\s+(?:of\s+)?(.+)/i);
            if (qualityMatch) {
                const itemName = qualityMatch[1]?.trim();
                const Item = mongoose.model('Item');
                const fabric = await Item.findOne({
                    businessId,
                    $or: [
                        { name: { $regex: itemName, $options: 'i' } },
                        { code: { $regex: itemName, $options: 'i' } },
                    ]
                }).lean() as any;

                if (fabric) {
                    return {
                        reply: `${fabric.name} current rate: ₹${fabric.sellingPrice || fabric.basePrice}/mtr. How many meters do you need? 🧵`,
                        confidence: 0.9,
                        action: 'RATE_INQUIRY',
                        assignToHuman: false,
                    };
                }
            }
            return {
                reply: 'Which quality are you looking for? Please share the name or code. 🧵',
                confidence: 0.7,
                assignToHuman: false,
            };
        }

        // Payment inquiry
        if (text.includes('payment') || text.includes('pending') || text.includes('बकाया') || text.includes('kitna')) {
            if (partyId) {
                const unpaid = await Invoice.find({ businessId, partyId, paymentStatus: { $ne: 'PAID' } }).lean();
                const outstanding = unpaid.reduce((s: number, i: any) => s + ((i.grandTotal || 0) - (i.amountPaid || 0)), 0);
                return {
                    reply: `Your outstanding is ₹${outstanding.toLocaleString('en-IN')} across ${unpaid.length} invoice${unpaid.length !== 1 ? 's' : ''}. 📋`,
                    confidence: 0.95,
                    action: 'PAYMENT_INQUIRY',
                    assignToHuman: false,
                };
            }
            return { reply: 'Let me check your account. One moment please... 🔍', confidence: 0.5, assignToHuman: true };
        }

        // Last challan
        if (text.includes('challan') || text.includes('last order') || text.includes('चालान')) {
            if (partyId) {
                const lastChallan = await Challan.findOne({ businessId, partyId }).sort({ createdAt: -1 }).lean() as any;
                if (lastChallan) {
                    return {
                        reply: `Your last challan ${lastChallan.challanNumber} (₹${(lastChallan.totalAmount || 0).toLocaleString('en-IN')}) was on ${new Date(lastChallan.createdAt).toLocaleDateString('en-IN')}. Shall I send the PDF? 📄`,
                        confidence: 0.9,
                        action: 'CHALLAN_INQUIRY',
                        actionData: { challanId: lastChallan._id },
                        assignToHuman: false,
                    };
                }
            }
            return { reply: 'Let me find your latest challan... 🔍', confidence: 0.5, assignToHuman: true };
        }

        // Stock inquiry
        if (text.includes('stock') || text.includes('available') || text.includes('स्टॉक')) {
            return {
                reply: 'Let me check the stock for you. Which quality and color? 🎨',
                confidence: 0.6,
                assignToHuman: false,
            };
        }

        // Greeting
        if (text.match(/^(hi|hello|namaste|नमस्ते|good morning|good evening)/i)) {
            return {
                reply: `🙏 Namaste! Welcome to TextilePro. How can I help you today?\n\nYou can ask about:\n• Fabric rates\n• Stock availability\n• Pending payments\n• Your last challan\n\nOr type your question! 😊`,
                confidence: 0.95,
                assignToHuman: false,
            };
        }

        // Default: assign to human
        return {
            reply: 'Thank you for your message! Our team will get back to you shortly. 🙏',
            confidence: 0.3,
            assignToHuman: true,
        };
    }

    // ═══════════════════════════════════════════════════════════
    // TEMPLATES
    // ═══════════════════════════════════════════════════════════

    static async getTemplates(businessId: string, category?: string) {
        const query: any = { businessId };
        if (category) query.category = category;
        return MessageTemplate.find(query).sort({ usageCount: -1 }).lean();
    }

    static async createTemplate(businessId: string, data: any) {
        return MessageTemplate.create({ ...data, businessId });
    }

    static async updateTemplate(businessId: string, id: string, data: any) {
        return MessageTemplate.findOneAndUpdate({ _id: id, businessId }, { $set: data }, { new: true, lean: true });
    }

    static async deleteTemplate(businessId: string, id: string) {
        return MessageTemplate.deleteOne({ _id: id, businessId });
    }

    static async useTemplate(businessId: string, templateId: string, variables: Record<string, string>) {
        const template = await MessageTemplate.findOne({ _id: templateId, businessId });
        if (!template) throw new Error('Template not found');

        let body = template.bodyEn;
        for (const [key, val] of Object.entries(variables)) {
            body = body.replace(new RegExp(`{{${key}}}`, 'g'), val);
        }

        template.usageCount += 1;
        template.lastUsedAt = new Date();
        await template.save();

        return { body, bodyHi: template.bodyHi };
    }

    // ═══════════════════════════════════════════════════════════
    // CAMPAIGNS
    // ═══════════════════════════════════════════════════════════

    static async getCampaigns(businessId: string) {
        return Campaign.find({ businessId }).sort({ createdAt: -1 }).populate('templateId', 'name category').lean();
    }

    static async createCampaign(businessId: string, userId: string, data: any) {
        // Estimate audience
        const query: any = { businessId };
        if (data.audienceFilters?.tags?.length) query.tags = { $in: data.audienceFilters.tags };
        if (data.audienceFilters?.cities?.length) query['address.city'] = { $in: data.audienceFilters.cities };

        const recipientCount = await Party.countDocuments(query);

        return Campaign.create({
            ...data,
            businessId,
            recipientCount,
            status: data.scheduledAt ? 'SCHEDULED' : 'DRAFT',
            createdBy: userId,
        });
    }

    static async updateCampaignStatus(businessId: string, campaignId: string, status: string) {
        return Campaign.findOneAndUpdate(
            { _id: campaignId, businessId },
            { $set: { status } },
            { new: true, lean: true }
        );
    }

    // ═══════════════════════════════════════════════════════════
    // ANALYTICS
    // ═══════════════════════════════════════════════════════════

    static async getAnalytics(businessId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bId = new mongoose.Types.ObjectId(businessId);

        const [totalConversations, unreadChats, sentToday, receivedToday, chatsByUser] = await Promise.all([
            Conversation.countDocuments({ businessId }),
            Conversation.countDocuments({ businessId, unreadCount: { $gt: 0 } }),
            ChatMessage.countDocuments({ businessId, direction: 'OUTBOUND', createdAt: { $gte: today } }),
            ChatMessage.countDocuments({ businessId, direction: 'INBOUND', createdAt: { $gte: today } }),
            ChatMessage.aggregate([
                { $match: { businessId: bId, direction: 'OUTBOUND', createdAt: { $gte: today } } },
                { $group: { _id: '$sentByUserId', count: { $sum: 1 } } },
                { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                { $project: { userId: '$_id', userName: { $ifNull: ['$user.name', 'Unknown'] }, count: 1 } },
                { $sort: { count: -1 } },
            ]),
        ]);

        return {
            avgResponseTimeMinutes: 12,
            totalConversations,
            unreadChats,
            messagesSentToday: sentToday,
            messagesReceivedToday: receivedToday,
            conversionsFromWA: 0,
            collectionsViaWA: 0,
            busiestHour: 11,
            chatsBySalesman: chatsByUser,
            topInquiryQualities: [],
        };
    }

    // ═══════════════════════════════════════════════════════════
    // SEARCH
    // ═══════════════════════════════════════════════════════════

    static async searchMessages(businessId: string, query: string) {
        return ChatMessage.find({
            businessId,
            body: { $regex: query, $options: 'i' },
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('conversationId', 'contactName phone')
            .lean();
    }

    // ═══════════════════════════════════════════════════════════
    // SEED DEFAULT TEMPLATES
    // ═══════════════════════════════════════════════════════════

    static async seedDefaultTemplates(businessId: string) {
        const existing = await MessageTemplate.countDocuments({ businessId });
        if (existing > 0) return;

        const defaults = [
            { name: 'Welcome', category: 'SALES', bodyEn: '🙏 Welcome {{name}}! Thank you for connecting with us. How can we help you today?', bodyHi: '🙏 {{name}} ji, हमसे जुड़ने के लिए धन्यवाद! आज हम आपकी कैसे मदद कर सकते हैं?', placeholders: ['name'] },
            { name: 'Quotation Follow-up', category: 'SALES', bodyEn: 'Hi {{name}}, following up on quotation we shared. Shall we proceed with the order?', bodyHi: 'नमस्ते {{name}} ji, कोटेशन के बारे में follow up कर रहे हैं। ऑर्डर proceed करें?', placeholders: ['name'] },
            { name: 'New Arrivals', category: 'SALES', bodyEn: '🌟 New stock arrived! {{quality}} in beautiful colors. Rate: ₹{{rate}}/mtr. Limited stock! Order now.', bodyHi: '🌟 नया माल आया है! {{quality}} सुंदर रंगों में। रेट: ₹{{rate}}/mtr ऑर्डर करें!', placeholders: ['quality', 'rate'] },
            { name: 'Challan Sent', category: 'OPERATIONS', bodyEn: '📦 Challan {{challanNumber}} dispatched. Amount: {{amount}}. Expected delivery: {{date}}. Track with TextilePro.', bodyHi: '📦 चालान {{challanNumber}} भेज दिया है। रकम: {{amount}}। {{date}} तक पहुंच जाएगा।', placeholders: ['challanNumber', 'amount', 'date'] },
            { name: 'Invoice Sent', category: 'OPERATIONS', bodyEn: '🧾 Invoice {{invoiceNumber}} generated. Total: {{amount}}. Payment due by {{date}}.', bodyHi: '🧾 बिल {{invoiceNumber}} बन गया है। कुल: {{amount}}। {{date}} तक payment करें।', placeholders: ['invoiceNumber', 'amount', 'date'] },
            { name: 'Due Reminder', category: 'COLLECTIONS', bodyEn: '🔔 Dear {{name}}, invoice {{invoiceNumber}} ({{amount}}) is due today. Kindly arrange payment.', bodyHi: '🔔 {{name}} ji, बिल {{invoiceNumber}} ({{amount}}) आज due है। कृपया payment करें।', placeholders: ['name', 'invoiceNumber', 'amount'] },
            { name: 'Overdue Reminder', category: 'COLLECTIONS', bodyEn: '⚠️ {{name}}, invoice {{invoiceNumber}} ({{amount}}) is overdue. Please clear immediately.', bodyHi: '⚠️ {{name}} ji, बिल {{invoiceNumber}} ({{amount}}) overdue है। कृपया तुरंत payment करें।', placeholders: ['name', 'invoiceNumber', 'amount'] },
        ];

        await MessageTemplate.insertMany(defaults.map(t => ({ ...t, businessId })));
    }
}
