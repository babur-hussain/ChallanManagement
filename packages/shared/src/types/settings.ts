import { z } from 'zod';

export const updateSettingsSchema = z.object({
    profile: z.object({
        logo: z.string().optional(),
        businessName: z.string().optional(),
        legalName: z.string().optional(),
        gstin: z.string().optional(),
        pan: z.string().optional(),
        address: z.object({
            line1: z.string().optional(),
            line2: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            pincode: z.string().optional(),
            country: z.string().optional()
        }).optional(),
        phoneNumbers: z.array(z.string()).optional(),
        email: z.string().email().optional(),
        website: z.string().url().optional(),
        ownerName: z.string().optional(),
        ownerState: z.string().optional(),
        defaultLanguage: z.string().optional(),
        timezone: z.string().optional(),
        currency: z.string().optional(),
    }).optional(),

    challans: z.object({
        numberingFormat: z.string().optional(),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
        financialYearReset: z.boolean().optional(),
        defaultTerms: z.string().optional(),
        defaultRemarks: z.string().optional(),
        showRates: z.boolean().optional(),
        showAmount: z.boolean().optional(),
        requireVehicleNo: z.boolean().optional(),
        requireBroker: z.boolean().optional(),
        autoPdfGenerate: z.boolean().optional(),
        autoWhatsappSend: z.boolean().optional(),
        signatureUrl: z.string().optional(),
        templateId: z.string().optional(),
        paperSize: z.enum(['A4', 'A5']).optional(),
    }).optional(),

    invoices: z.object({
        numberingFormat: z.string().optional(),
        gstMode: z.string().optional(),
        defaultHsn: z.string().optional(),
        defaultTaxRate: z.number().optional(),
        placeOfSupplyRules: z.boolean().optional(),
        eInvoiceProvider: z.string().optional(),
        eWayBillProvider: z.string().optional(),
        paymentTerms: z.string().optional(),
        dueDaysDefault: z.number().optional(),
    }).optional(),

    inventory: z.object({
        lowStockThresholdDefault: z.number().optional(),
        allowNegativeStock: z.boolean().optional(),
        reserveStockOnDraftChallans: z.boolean().optional(),
        branchStockTransfersEnabled: z.boolean().optional(),
        rollWiseTracking: z.boolean().optional(),
        barcodeMode: z.boolean().optional(),
        itemCategories: z.array(z.object({
            value: z.string(),
            label: z.string(),
            labelHi: z.string().optional()
        })).optional(),
    }).optional(),

    finance: z.object({
        financialYearStart: z.string().optional(),
        chartOfAccountsDefaults: z.boolean().optional(),
        bankAccounts: z.array(z.any()).optional(),
        expenseApprovalsThreshold: z.number().optional(),
        autoJournalPosting: z.boolean().optional(),
        tdsFutureToggle: z.boolean().optional(),
    }).optional(),

    crm: z.object({
        autoAssignLeads: z.boolean().optional(),
        defaultSalesperson: z.string().optional(),
        reminderDefaults: z.number().optional(),
        duplicateDetectionStrictness: z.string().optional(),
    }).optional(),

    whatsapp: z.object({
        provider: z.string().optional(),
        apiKey: z.string().optional(),
        webhookUrl: z.string().optional(),
        senderNumber: z.string().optional(),
        paymentAlerts: z.boolean().optional(),
        challanSent: z.boolean().optional(),
        lowStock: z.boolean().optional(),
        overdueInvoices: z.boolean().optional(),
        newLeads: z.boolean().optional(),
    }).optional(),

    ai: z.object({
        provider: z.string().optional(),
        apiKey: z.string().optional(),
        defaultModel: z.string().optional(),
        tokenBudget: z.number().optional(),
        tone: z.string().optional(),
        multilingualMode: z.boolean().optional(),
        memoryEnabled: z.boolean().optional(),
        founderCopilotEnabled: z.boolean().optional(),
        supportBotEnabled: z.boolean().optional(),
    }).optional(),

    marketplace: z.object({
        enablePublicListing: z.boolean().optional(),
        businessVisibility: z.string().optional(),
        showPhone: z.boolean().optional(),
        inquiryNotifications: z.boolean().optional(),
        catalogVisibility: z.string().optional(),
    }).optional(),

    hrms: z.object({
        attendanceMode: z.string().optional(),
        gpsRequired: z.boolean().optional(),
        selfieRequired: z.boolean().optional(),
        payrollDate: z.number().optional(),
    }).optional(),

    security: z.object({
        twoFactorAuth: z.boolean().optional(),
        biometricMobileLogin: z.boolean().optional(),
        sessionTimeoutMins: z.number().optional(),
        allowedIps: z.array(z.string()).optional(),
        exportRestrictions: z.boolean().optional(),
        screenshotProtectionMobile: z.boolean().optional(),
        auditStrictMode: z.boolean().optional(),
        customRoles: z.array(z.object({
            id: z.string(),
            name: z.string(),
            permissions: z.array(z.string())
        })).optional(),
    }).optional(),

    reports: z.object({
        defaultExportFormat: z.string().optional(),
        ownerEmailReports: z.boolean().optional(),
        autoMonthlyMis: z.boolean().optional(),
        watermarkOnPdfs: z.boolean().optional(),
        logoInReports: z.boolean().optional(),
    }).optional(),

    appearance: z.object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        accentColor: z.string().optional(),
        compactMode: z.boolean().optional(),
        fontSize: z.string().optional(),
        tableDensity: z.string().optional(),
    }).optional(),

    quotations: z.object({
        prefix: z.string().optional(),
        validityDays: z.number().optional(),
    }).optional(),

    mobile: z.object({
        pushNotifications: z.boolean().optional(),
        offlineMode: z.boolean().optional(),
        quickActionsOnHome: z.boolean().optional(),
        biometricAppLock: z.boolean().optional(),
    }).optional(),

    developer: z.object({
        sandboxMode: z.boolean().optional(),
    }).optional(),

    eInvoiceCredentials: z.object({
        isEnabled: z.boolean().optional(),
        environment: z.enum(['SANDBOX', 'PRODUCTION']).optional(),
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        gstin: z.string().optional(),
    }).optional(),

    automations: z.array(z.object({
        id: z.string(),
        trigger: z.string(),
        action: z.string(),
        enabled: z.boolean()
    })).optional()
});

export type UpdateSettingsPayload = z.infer<typeof updateSettingsSchema>;

export interface ITenantSettings {
    _id: string;
    businessId: string;
    version: number;

    profile: {
        logo?: string;
        businessName: string;
        legalName?: string;
        gstin?: string;
        pan?: string;
        address?: {
            line1: string;
            line2?: string;
            city: string;
            state: string;
            pincode: string;
            country: string;
        };
        phoneNumbers?: string[];
        email?: string;
        website?: string;
        ownerName?: string;
        ownerState?: string;
        defaultLanguage?: string;
        timezone?: string;
        currency?: string;
    };

    challans: {
        numberingFormat: string;
        prefix: string;
        suffix: string;
        financialYearReset: boolean;
        defaultTerms: string;
        defaultRemarks: string;
        showRates: boolean;
        showAmount: boolean;
        requireVehicleNo: boolean;
        requireBroker: boolean;
        autoPdfGenerate: boolean;
        autoWhatsappSend: boolean;
        signatureUrl?: string;
        templateId: string;
        paperSize: 'A4' | 'A5';
    };

    invoices: any;
    inventory: {
        itemCategories?: Array<{ value: string; label: string; labelHi?: string }>;
        [key: string]: any;
    };
    finance: any;
    crm: any;
    whatsapp: any;
    ai: any;
    marketplace: any;
    hrms: any;
    security: any;
    reports: any;
    appearance: any;
    quotations: any;
    developer: any;
    eInvoiceCredentials?: {
        isEnabled?: boolean;
        environment?: 'SANDBOX' | 'PRODUCTION';
        clientId?: string;
        clientSecret?: string;
        username?: string;
        password?: string;
        gstin?: string;
    };
    automations: any[];

    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}
