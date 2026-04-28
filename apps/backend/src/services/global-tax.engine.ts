export interface TaxCalculationResult {
    totalTaxableValue: number;
    totalTaxAmount: number;
    taxBreakup: { name: string; amount: number; rate: number }[];
    totalInclusive: number;
}

export interface ITaxCalculator {
    calculate(lineItems: { price: number, qty: number, defaultRate?: number }[], isInterState: boolean): TaxCalculationResult;
}

class GSTCalculator implements ITaxCalculator {
    calculate(lineItems: any[], isInterState: boolean): TaxCalculationResult {
        let taxable = 0;
        let totalTax = 0;
        const breakup: any[] = [];

        lineItems.forEach(item => {
            const lineTotal = item.price * item.qty;
            const rate = item.defaultRate || 5;
            const taxAmt = (lineTotal * rate) / 100;

            taxable += lineTotal;
            totalTax += taxAmt;

            if (isInterState) {
                breakup.push({ name: 'IGST', amount: taxAmt, rate });
            } else {
                breakup.push({ name: 'CGST', amount: taxAmt / 2, rate: rate / 2 });
                breakup.push({ name: 'SGST', amount: taxAmt / 2, rate: rate / 2 });
            }
        });

        return {
            totalTaxableValue: taxable,
            totalTaxAmount: totalTax,
            taxBreakup: breakup,
            totalInclusive: taxable + totalTax
        };
    }
}

class VATCalculator implements ITaxCalculator {
    calculate(lineItems: any[], isInterState: boolean): TaxCalculationResult {
        let taxable = 0;
        let totalTax = 0;
        const breakup: any[] = [];

        lineItems.forEach(item => {
            const lineTotal = item.price * item.qty;
            const rate = item.defaultRate || 5; // e.g. UAE 5% VAT
            const taxAmt = (lineTotal * rate) / 100;

            taxable += lineTotal;
            totalTax += taxAmt;

            breakup.push({ name: 'VAT', amount: taxAmt, rate });
        });

        return {
            totalTaxableValue: taxable,
            totalTaxAmount: totalTax,
            taxBreakup: breakup,
            totalInclusive: taxable + totalTax
        };
    }
}

class NoTaxCalculator implements ITaxCalculator {
    calculate(lineItems: any[], isInterState: boolean): TaxCalculationResult {
        let taxable = 0;
        lineItems.forEach(item => { taxable += (item.price * item.qty) });
        return { totalTaxableValue: taxable, totalTaxAmount: 0, taxBreakup: [], totalInclusive: taxable };
    }
}

/**
 * The Factory Engine returning the correct calculator strategy.
 */
export class GlobalTaxEngine {
    static getCalculator(taxSystem: string): ITaxCalculator {
        switch (taxSystem) {
            case 'GST': return new GSTCalculator();
            case 'VAT': return new VATCalculator();
            case 'NONE': return new NoTaxCalculator();
            case 'SALES_TAX': return new VATCalculator(); // Usually single-line similar to VAT
            default:
                throw new Error(`Unsupported Tax System: ${taxSystem}`);
        }
    }
}
