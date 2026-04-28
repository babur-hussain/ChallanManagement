import { Linking, Platform } from 'react-native';

/**
 * Deep linking configuration for the mobile app.
 * Maps URLs to screen routes for both universal links and custom schemes.
 *
 * URL patterns:
 *   textilepro://challan/ABC123   → ChallanDetail
 *   textilepro://invoice/ABC123   → InvoiceDetail
 *   textilepro://dashboard        → Dashboard
 *   https://app.textilepro.in/challan/ABC123 → ChallanDetail
 */
export const deepLinkConfig = {
    prefixes: ['textilepro://', 'https://app.textilepro.in'],
    config: {
        screens: {
            App: {
                screens: {
                    Home: {
                        screens: {
                            Dashboard: 'dashboard',
                        },
                    },
                    Transactions: {
                        screens: {
                            ChallanList: 'challans',
                            ChallanDetail: 'challan/:id',
                            ChallanCreate: 'challan/new',
                            InvoiceList: 'invoices',
                            QuotationList: 'quotations',
                        },
                    },
                    CRM: {
                        screens: {
                            LeadList: 'leads',
                        },
                    },
                    More: {
                        screens: {
                            PartyList: 'parties',
                            ItemList: 'items',
                            Collections: 'collections',
                            Inventory: 'inventory',
                            FinanceDashboard: 'finance',
                            SettingsPage: 'settings',
                        },
                    },
                },
            },
            Auth: {
                screens: {
                    Login: 'login',
                    Register: 'register',
                    ForgotPassword: 'forgot-password',
                },
            },
        },
    },
};

/**
 * Parse deep link URL and return navigation params.
 */
export function parseDeepLink(url: string): { screen: string; params?: any } | null {
    if (!url) return null;

    // Remove scheme prefix
    const path = url
        .replace('textilepro://', '')
        .replace('https://app.textilepro.in/', '');

    const parts = path.split('/').filter(Boolean);

    if (parts.length === 0) return { screen: 'Dashboard' };

    switch (parts[0]) {
        case 'challan':
            if (parts[1] === 'new') return { screen: 'ChallanCreate' };
            if (parts[1]) return { screen: 'ChallanDetail', params: { id: parts[1] } };
            return { screen: 'ChallanList' };
        case 'invoice':
            if (parts[1]) return { screen: 'InvoiceDetail', params: { id: parts[1] } };
            return { screen: 'InvoiceList' };
        case 'party':
            if (parts[1]) return { screen: 'PartyDetail', params: { id: parts[1] } };
            return { screen: 'PartyList' };
        default:
            return { screen: 'Dashboard' };
    }
}
