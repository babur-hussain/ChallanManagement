import { TenantSettings } from '../models/TenantSettings.js';
import { Business } from '../models/Business.js';
import { getRedis } from '../lib/redis.js';
import { Errors } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';
import type { UpdateSettingsPayload } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Settings Service
// O(1) Redis caching for global configs across microservices
// ═══════════════════════════════════════════════════════════════

export class SettingsService {
    private getCacheKey(businessId: string) {
        return `tenant_settings:${businessId}`;
    }

    async getSettings(businessId: string) {
        const redis = getRedis();
        const cached = await redis.get(this.getCacheKey(businessId));

        if (cached) {
            return JSON.parse(cached);
        }

        let settings = await TenantSettings.findOne({ businessId });
        if (!settings) {
            // Auto-initialize if completely empty (helps smoothly migrate legacy code)
            settings = await TenantSettings.create({
                businessId,
                updatedBy: 'SYSTEM'
            });
        }

        const payload = settings.toJSON();
        await redis.set(this.getCacheKey(businessId), JSON.stringify(payload), 'EX', 3600 * 24); // 24hr cache
        return payload;
    }

    async updateSettings(businessId: string, updates: UpdateSettingsPayload, updatedBy: string) {
        const settings = await TenantSettings.findOne({ businessId });
        if (!settings) {
            throw Errors.notFound('Settings Profile');
        }

        // Deep merge dynamic sections
        if (updates.profile) {
            Object.assign(settings.profile, updates.profile);
            if (updates.profile.ownerState) {
                await Business.updateOne({ _id: businessId }, { $set: { 'address.state': updates.profile.ownerState } });
            }
        }
        if (updates.challans) Object.assign(settings.challans, updates.challans);
        if (updates.invoices) Object.assign(settings.invoices, updates.invoices);
        if (updates.inventory) Object.assign(settings.inventory, updates.inventory);
        if (updates.finance) Object.assign(settings.finance, updates.finance);
        if (updates.crm) Object.assign(settings.crm, updates.crm);
        if (updates.whatsapp) Object.assign(settings.whatsapp, updates.whatsapp);
        if (updates.ai) Object.assign(settings.ai, updates.ai);
        if (updates.marketplace) {
            Object.assign(settings.marketplace, updates.marketplace);

            // Sync PublicBusinessProfile when marketplace settings update
            try {
                const { MarketplaceService } = await import('./marketplace.service.js');

                if (updates.marketplace.enablePublicListing !== undefined) {
                    await MarketplaceService.toggleVisibility(businessId, updates.marketplace.enablePublicListing);
                }

                if (updates.marketplace.showPhone !== undefined) {
                    const { PublicBusinessProfile } = await import('../models/PublicBusinessProfile.js');
                    if (updates.marketplace.showPhone === false) {
                        await PublicBusinessProfile.updateOne({ businessId }, { $unset: { publicPhone: 1, whatsapp: 1 } });
                    } else {
                        const { Business } = await import('../models/Business.js');
                        const business = await Business.findById(businessId);
                        if (business?.phone) {
                            await MarketplaceService.updateProfile(businessId, {
                                publicPhone: business.phone,
                                whatsapp: business.phone
                            });
                        }
                    }
                }

                if (updates.marketplace.businessVisibility || updates.marketplace.catalogVisibility) {
                    await MarketplaceService.updateProfile(businessId, {
                        ...(updates.marketplace.businessVisibility && { businessVisibility: updates.marketplace.businessVisibility }),
                        ...(updates.marketplace.catalogVisibility && { catalogVisibility: updates.marketplace.catalogVisibility })
                    });
                }
            } catch (err: any) {
                logger.error(`Failed to sync marketplace visibility for ${businessId}: ${err.message}`);
            }
        }
        if (updates.hrms) Object.assign(settings.hrms, updates.hrms);
        if (updates.security) Object.assign(settings.security, updates.security);
        if (updates.reports) Object.assign(settings.reports, updates.reports);
        if (updates.appearance) Object.assign(settings.appearance, updates.appearance);
        if (updates.quotations) Object.assign(settings.quotations, updates.quotations);
        if (updates.mobile) Object.assign(settings.mobile, updates.mobile);
        if (updates.developer) Object.assign(settings.developer, updates.developer);

        if (updates.automations) {
            settings.automations = updates.automations;
        }

        settings.updatedBy = updatedBy;
        settings.markModified('profile');
        settings.markModified('challans');
        settings.markModified('invoices');
        settings.markModified('inventory');
        settings.markModified('finance');
        settings.markModified('crm');
        settings.markModified('whatsapp');
        settings.markModified('ai');
        settings.markModified('marketplace');
        settings.markModified('hrms');
        settings.markModified('security');
        settings.markModified('reports');
        settings.markModified('appearance');
        settings.markModified('quotations');
        settings.markModified('mobile');
        settings.markModified('developer');
        settings.markModified('automations');

        await settings.save();

        // Instant cache invalidation
        const redis = getRedis();
        await redis.set(this.getCacheKey(businessId), JSON.stringify(settings.toJSON()), 'EX', 3600 * 24);

        // Write Audit Log intentionally to tracking microservice (omitted for brevity here, but logger intercepts it)
        logger.info(`Settings updated by ${updatedBy}`, { businessId, version: settings.version });

        return settings.toJSON();
    }
}

export const settingsService = new SettingsService();
