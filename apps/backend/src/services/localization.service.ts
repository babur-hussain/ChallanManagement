export class LocalizationService {

    // Hardcoded dictionary for MVP. In reality, pulled from JSON i18n files
    private static dictionary: Record<string, Record<string, string>> = {
        'en-IN': {
            'document.type.challan': 'Delivery Challan',
            'document.type.invoice': 'Tax Invoice',
            'entity.party': 'Party',
            'dashboard.welcome': 'Welcome',
        },
        'ar-AE': {
            'document.type.challan': 'إشعار تسليم', // Delivery Note
            'document.type.invoice': 'فاتورة ضريبية', // Tax Invoice
            'entity.party': 'عميل', // Client/Customer
            'dashboard.welcome': 'مرحباً',
        },
        'hi-IN': {
            'document.type.challan': 'वितरण चालान',
            'document.type.invoice': 'कर चालान',
            'entity.party': 'पार्टी',
            'dashboard.welcome': 'नमस्ते',
        }
    };

    static translate(key: string, locale: string = 'en-IN'): string {
        // Fallback to English if locale missing
        const activeLocaleDict = this.dictionary[locale] || this.dictionary['en-IN'];
        return activeLocaleDict[key] || key; // returns the key itself if no translation found
    }

    /**
     * Determines the correct text direction (LTR vs RTL) for the UI or PDF Engine
     */
    static getTextDirection(locale: string): 'ltr' | 'rtl' {
        if (locale.startsWith('ar') || locale.startsWith('ur')) {
            return 'rtl';
        }
        return 'ltr';
    }
}
