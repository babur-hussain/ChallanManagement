import mongoose, { Schema, Document } from 'mongoose';
import { ITenantSettings } from '@textilepro/shared';

export interface ITenantSettingsDocument extends Omit<ITenantSettings, '_id'>, Document { }

const tenantSettingsSchema = new Schema<ITenantSettingsDocument>(
    {
        businessId: { type: String, required: true, unique: true, index: true },
        version: { type: Number, default: 1 },

        profile: {
            type: Schema.Types.Mixed,
            default: { businessName: '' }
        },
        challans: {
            type: Schema.Types.Mixed,
            default: {
                numberingFormat: 'YY-MM-SEQ',
                prefix: 'CH',
                suffix: '',
                financialYearReset: true,
                defaultTerms: '',
                defaultRemarks: '',
                showRates: true,
                showAmount: true,
                requireVehicleNo: false,
                requireBroker: false,
                autoPdfGenerate: true,
                autoWhatsappSend: false,
                templateId: 'classic'
            }
        },
        invoices: { type: Schema.Types.Mixed, default: {} },
        inventory: { type: Schema.Types.Mixed, default: {} },
        finance: { type: Schema.Types.Mixed, default: {} },
        crm: { type: Schema.Types.Mixed, default: {} },
        whatsapp: { type: Schema.Types.Mixed, default: {} },
        ai: { type: Schema.Types.Mixed, default: {} },
        marketplace: { type: Schema.Types.Mixed, default: {} },
        hrms: { type: Schema.Types.Mixed, default: {} },
        security: { type: Schema.Types.Mixed, default: {} },
        reports: { type: Schema.Types.Mixed, default: {} },
        appearance: { type: Schema.Types.Mixed, default: { theme: 'system', compactMode: false } },
        quotations: { type: Schema.Types.Mixed, default: { prefix: 'QT', validityDays: 15 } },
        mobile: { type: Schema.Types.Mixed, default: { pushNotifications: true, offlineMode: true, quickActionsOnHome: true, biometricAppLock: false } },
        developer: { type: Schema.Types.Mixed, default: { sandboxMode: false } },
        automations: [{ type: Schema.Types.Mixed }],

        updatedBy: { type: String, required: true }
    },
    { timestamps: true }
);

// Pre-save hook to increment version
tenantSettingsSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.version = (this.version || 1) + 1;
    }
    next();
});

export const TenantSettings = mongoose.model<ITenantSettingsDocument>('TenantSettings', tenantSettingsSchema);
