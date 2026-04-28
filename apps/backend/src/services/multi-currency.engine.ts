export class MultiCurrencyEngine {

    // In production, this would be fetched from an FX API (OpenExchangeRates/Fixer)
    // and cached securely.
    private static exchangeRates: Record<string, number> = {
        'USD': 1.0,
        'INR': 83.50,
        'AED': 3.67,
        'GBP': 0.79,
        'EUR': 0.92,
        'BDT': 109.50,
        'PKR': 278.50
    };

    /**
     * Converts an amount from one currency to another using the latest cached rates.
     */
    static convert(amount: number, fromCurrency: string, toCurrency: string): number {
        if (fromCurrency === toCurrency) return amount;

        const fromRate = this.exchangeRates[fromCurrency];
        const toRate = this.exchangeRates[toCurrency];

        if (!fromRate || !toRate) {
            throw new Error(`Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`);
        }

        // Convert to base USD first, then out to target
        const standardUSD = amount / fromRate;
        const finalAmount = standardUSD * toRate;

        return Number(finalAmount.toFixed(4));
    }

    /**
     * Used for the Global SaaS dashboard to normalize ARR across countries
     * (e.g. converting Dubai MRR in AED back to USD for investor reporting)
     */
    static normalizeToUSD(amount: number, fromCurrency: string): number {
        return this.convert(amount, fromCurrency, 'USD');
    }
}
