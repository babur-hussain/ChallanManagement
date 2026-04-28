import React from 'react';
import { formatCurrency, formatDate } from '../utils';

/**
 * InvoiceTemplate — Multi-page tax invoice with repeating header/footer
 *
 * Uses ONLY inline styles for print fidelity. No Tailwind.
 */

interface InvoiceItem {
    srNo: number;
    description: string;
    hsnCode: string;
    qty: number;
    meters: number[];
    unit: string;
    pricePerItem: number;
    taxableValue: number;
    cgstRate: number;
    cgstAmt: number;
    sgstRate: number;
    sgstAmt: number;
    igstRate: number;
    igstAmt: number;
}

interface InvoiceTemplateProps {
    invoice: any;
    businessProfile?: any;
    invoiceSettings?: any;
}

// ——— Helpers ———
function fmtCurrency(n: number): string {
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string | Date | undefined): string {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function numberToWords(num: number): string {
    if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) return 'Zero';
    num = Math.abs(num);
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convert(n: number): string {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    }

    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);
    let result = convert(intPart) + ' Rupees';
    if (decPart > 0) result += ' and ' + convert(decPart) + ' Paise';
    return result + ' Only';
}

// ——— Pagination ———
const ITEMS_FIRST_PAGE_A4 = 12;
const ITEMS_CONT_PAGE_A4 = 18;
const ITEMS_FIRST_PAGE_A5 = 6;
const ITEMS_CONT_PAGE_A5 = 10;

function paginateItems(items: InvoiceItem[], paperSize: string): InvoiceItem[][] {
    if (items.length === 0) return [[]];
    const firstPageLimit = paperSize === 'A5' ? ITEMS_FIRST_PAGE_A5 : ITEMS_FIRST_PAGE_A4;
    const contPageLimit = paperSize === 'A5' ? ITEMS_CONT_PAGE_A5 : ITEMS_CONT_PAGE_A4;

    const pages: InvoiceItem[][] = [];
    const firstPage = items.slice(0, firstPageLimit);
    pages.push(firstPage);

    let remaining = items.slice(firstPageLimit);
    while (remaining.length > 0) {
        pages.push(remaining.slice(0, contPageLimit));
        remaining = remaining.slice(contPageLimit);
    }
    return pages;
}

// ——— Styles ———
const S = {
    page: {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: '#222',
        padding: '4px 20px 4px 20px',
        maxWidth: '900px',
        margin: '0 auto',
        background: '#fff',
        position: 'relative' as const,
        boxSizing: 'border-box' as const,
    } as React.CSSProperties,

    headerTitle: {
        fontFamily: 'Arial, sans-serif',
        fontSize: '26px',
        fontWeight: 700,
        textAlign: 'right' as const,
        color: '#222',
        margin: 0,
        lineHeight: 1.2,
    } as React.CSSProperties,

    headerSubtitle: {
        fontSize: '12px',
        textAlign: 'right' as const,
        color: '#555',
        margin: '4px 0 0 0',
    } as React.CSSProperties,

    companyName: {
        fontSize: '12px',
        fontWeight: 600,
        margin: '0 0 2px 0',
    } as React.CSSProperties,

    meta: {
        fontSize: '10px',
        color: '#333',
        margin: '2px 0',
    } as React.CSSProperties,

    metaLabel: {
        fontWeight: 700,
        fontSize: '10px',
    } as React.CSSProperties,

    separator: {
        border: 'none',
        borderTop: '1px solid #ccc',
        margin: '6px 0',
    } as React.CSSProperties,

    tableHeader: {
        backgroundColor: '#0c9c5e',
        color: '#fff',
        fontWeight: 600,
        fontSize: '9px',
        textTransform: 'uppercase' as const,
        textAlign: 'center' as const,
        padding: '6px 4px',
        border: '1px solid #09814d',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
    } as React.CSSProperties,

    tableCell: {
        padding: '5px 4px',
        borderBottom: '1px solid #ddd',
        borderRight: '1px solid #eee',
        fontSize: '10px',
        verticalAlign: 'middle' as const,
    } as React.CSSProperties,

    totalRow: {
        fontSize: '10px',
        padding: '4px 8px',
    } as React.CSSProperties,

    grandTotal: {
        fontSize: '12px',
        fontWeight: 700,
        padding: '6px 8px',
        background: '#eefcf5',
    } as React.CSSProperties,

    carriedForwardRow: {
        fontSize: '10px',
        fontWeight: 600,
        padding: '5px 8px',
        background: '#eefcf5',
        color: '#0c9c5e',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
    } as React.CSSProperties,
};

// ——— Sub-components ———

function PageHeader({ profile, invoice, party, partyAddr, addr, cfg, pageNum, totalPages }: any) {
    const prefix = cfg.prefix || 'INV';
    return (
        <>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div style={{ flex: 1 }}>
                    {profile.logo ? (
                        <img
                            src={profile.logo}
                            alt="Company Logo"
                            style={{
                                maxWidth: '120px',
                                maxHeight: '60px',
                                objectFit: 'contain',
                                marginBottom: '8px'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #0c9c5e, #14b873)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '24px', fontWeight: 700,
                            marginBottom: '8px',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact',
                        }}>
                            {(profile.businessName || 'T')[0]}
                        </div>
                    )}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h1 style={S.headerTitle}>{cfg.title || 'TAX INVOICE'}</h1>
                    <p style={S.headerSubtitle}>Invoice# - {invoice?.invoiceNumber || `${prefix}-001`}</p>
                    {totalPages > 1 && (
                        <p style={{ fontSize: '9px', color: '#0c9c5e', fontWeight: 600, margin: '4px 0 0 0' }}>
                            Page {pageNum} of {totalPages}
                        </p>
                    )}
                </div>
            </div>

            {/* COMPANY INFO */}
            <div style={{ marginBottom: '4px' }}>
                <p style={S.companyName}>Company Name: {profile.businessName || '—'}</p>
                <p style={S.meta}>Address: {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ') || '—'}</p>
                {(profile.gstin || addr.country === 'India') && <p style={S.meta}>GSTIN: {profile.gstin || '—'}</p>}
                <p style={S.meta}>Phone: {(profile.phoneNumbers || [])[0] || '—'}</p>
            </div>

            <hr style={S.separator} />

            {/* BILL TO + RIGHT META */}
            <table style={{ width: '100%', marginBottom: '8px', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '20px' }}>
                            <p style={{ ...S.meta, fontWeight: 700 }}>Bill To:</p>
                            <p style={{ ...S.meta, fontWeight: 600, fontSize: '11px' }}>{party.name || '—'}</p>
                            <p style={S.meta}>
                                {[partyAddr.line1, partyAddr.line2, partyAddr.city, partyAddr.state, partyAddr.pincode].filter(Boolean).join(', ') || '—'}
                            </p>
                            <p style={S.meta}>Phone: {party.phone || '—'}</p>
                            <p style={S.meta}>Place of Supply: {partyAddr.state || '—'}</p>
                        </td>
                        <td style={{ width: '50%', verticalAlign: 'top' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ ...S.meta, width: '40%' }}>Invoice Date:</td>
                                        <td style={S.meta}>{fmtDate(invoice?.invoiceDate)}</td>
                                    </tr>
                                    <tr>
                                        <td style={S.meta}>Order Number:</td>
                                        <td style={S.meta}>{invoice?.orderNumber || '—'}</td>
                                    </tr>
                                    {invoice?.dueDate && (
                                        <tr>
                                            <td style={S.meta}>Due Date:</td>
                                            <td style={S.meta}>{fmtDate(invoice?.dueDate)}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td style={S.meta}>GSTIN:</td>
                                        <td style={S.meta}>{party.gstin || '—'}</td>
                                    </tr>
                                    {invoice?.brokerSnapshot && (
                                        <tr>
                                            <td style={S.meta}>Broker:</td>
                                            <td style={S.meta}>{invoice.brokerSnapshot.name}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
}

function ItemsTableHeader({ showRates, showAmount, isInterState }: { showRates: boolean; showAmount: boolean; isInterState: boolean }) {
    return (
        <thead>
            <tr>
                <th style={{ ...S.tableHeader, width: '5%' }} rowSpan={2}>SR No.</th>
                <th style={{ ...S.tableHeader, width: showRates ? '20%' : '35%' }} rowSpan={2}>ITEM DESCRIPTION</th>
                <th style={{ ...S.tableHeader, width: '8%' }} rowSpan={2}>HSN/SAC</th>
                <th style={{ ...S.tableHeader, width: '6%' }} rowSpan={2}>QTY<br /><span style={{ fontSize: '7px', fontWeight: 400 }}>(Unit)</span></th>
                {showRates && <th style={{ ...S.tableHeader, width: '8%' }} rowSpan={2}>RATE</th>}
                {showAmount && <th style={{ ...S.tableHeader, width: '10%' }} rowSpan={2}>TAXABLE<br />VALUE</th>}
                {showAmount && !isInterState && <th style={{ ...S.tableHeader, width: '14%', borderRight: '1px solid #09814d' }} colSpan={2}>CGST</th>}
                {showAmount && !isInterState && <th style={{ ...S.tableHeader, width: '14%', borderRight: '1px solid #09814d' }} colSpan={2}>SGST</th>}
                {showAmount && isInterState && <th style={{ ...S.tableHeader, width: '14%' }} colSpan={2}>IGST</th>}
            </tr>
            {showAmount && (
                <tr>
                    {!isInterState && (
                        <>
                            <th style={{ ...S.tableHeader, fontSize: '8px' }}>RATE</th>
                            <th style={{ ...S.tableHeader, fontSize: '8px' }}>AMT.</th>
                            <th style={{ ...S.tableHeader, fontSize: '8px' }}>RATE</th>
                            <th style={{ ...S.tableHeader, fontSize: '8px' }}>AMT.</th>
                        </>
                    )}
                    {isInterState && (
                        <>
                            <th style={{ ...S.tableHeader, fontSize: '8px' }}>RATE</th>
                            <th style={{ ...S.tableHeader, fontSize: '8px' }}>AMT.</th>
                        </>
                    )}
                </tr>
            )}
        </thead>
    );
}

function ItemRow({ item, showRates, showAmount, isInterState }: { item: InvoiceItem; showRates: boolean; showAmount: boolean; isInterState: boolean }) {
    return (
        <tr>
            <td style={{ ...S.tableCell, textAlign: 'center', verticalAlign: 'top' }}>{item.srNo}</td>
            <td style={{ ...S.tableCell, textAlign: 'left', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 600 }}>{item.description}</div>
                {item.meters?.length > 1 && (
                    <div style={{ marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                        {item.meters.map((m, i) => (
                            <span key={i} style={{
                                display: 'inline-block',
                                background: '#eefcf5',
                                color: '#0c9c5e',
                                fontSize: '8px',
                                padding: '1px 4px',
                                borderRadius: '3px',
                                border: '1px solid #c2f0d9',
                                fontFamily: 'monospace',
                            }}>{m}</span>
                        ))}
                    </div>
                )}
            </td>
            <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top' }}>{item.hsnCode}</td>
            <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top' }}>
                {item.meters?.length > 1 ? (
                    <div>
                        {item.meters.map((m, i) => (
                            <div key={i} style={{ fontSize: '9px', color: '#555', lineHeight: '1.5' }}>{m.toFixed(2)}</div>
                        ))}
                        <div style={{ borderTop: '1px solid #ccc', marginTop: '2px', paddingTop: '2px', fontWeight: 700, fontSize: '10px' }}>
                            {item.qty.toFixed(2)} <span style={{ fontSize: '8px', fontWeight: 400, color: '#888' }}>{item.unit === 'KILOGRAMS' ? 'Kg' : 'Mtr'}</span>
                        </div>
                    </div>
                ) : (
                    <span>{item.qty.toFixed(2)} <span style={{ fontSize: '8px', color: '#888' }}>{item.unit === 'KILOGRAMS' ? 'Kg' : 'Mtr'}</span></span>
                )}
            </td>
            {showRates && <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top' }}>{fmtCurrency(item.pricePerItem)}</td>}
            {showAmount && <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top' }}>{fmtCurrency(item.taxableValue)}</td>}

            {showAmount && !isInterState && (
                <>
                    <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top', color: item.cgstRate ? '#333' : '#bbb' }}>{item.cgstRate}%</td>
                    <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top', color: item.cgstAmt ? '#333' : '#bbb' }}>{fmtCurrency(item.cgstAmt)}</td>
                    <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top', color: item.sgstRate ? '#333' : '#bbb' }}>{item.sgstRate}%</td>
                    <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top', color: item.sgstAmt ? '#333' : '#bbb' }}>{fmtCurrency(item.sgstAmt)}</td>
                </>
            )}
            {showAmount && isInterState && (
                <>
                    <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top', color: item.igstRate ? '#333' : '#bbb' }}>{item.igstRate}%</td>
                    <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top', color: item.igstAmt ? '#333' : '#bbb' }}>{fmtCurrency(item.igstAmt)}</td>
                </>
            )}
        </tr>
    );
}



// ——— Main Component ———
export function InvoiceTemplate({ invoice, businessProfile, invoiceSettings }: InvoiceTemplateProps) {
    const profile = businessProfile || {};
    const party = invoice?.partySnapshot || {};
    const addr = profile.address || {};
    const partyAddr = party.address || {};
    const cfg = invoiceSettings || {};
    const showRates = cfg.showRates ?? true;
    const showAmount = cfg.showAmount ?? true;
    const defaultTerms = cfg.defaultTerms || '';
    const paperSize = invoice?.paperSize || 'A4';
    const isInterState = (partyAddr.state || '').toLowerCase() !== (addr.state || '').toLowerCase() && (partyAddr.state);

    // Build line items
    const items: InvoiceItem[] = (invoice?.items || []).map((item: any, idx: number) => {
        const amt = (item.totalMeters || item.quantity || 0) * (item.ratePerUnit || item.rate || 0);
        const discountValue = item.discountType === 'PERCENTAGE' ? amt * ((item.discount || 0) / 100) : (item.discount || 0);
        const taxableValue = Math.max(0, amt - discountValue);
        const gstRate = Number(item.taxRate ?? item.gstRate ?? 0);

        return {
            srNo: idx + 1,
            description: item.itemName || item.name || item.description || '',
            hsnCode: item.hsnCode || '',
            qty: Number(item.totalMeters ?? item.quantity ?? 0),
            meters: Array.isArray(item.meters) ? item.meters : [],
            unit: item.unit || 'MTR',
            pricePerItem: Number(item.ratePerUnit ?? item.rate ?? 0),
            taxableValue,
            cgstRate: !isInterState ? gstRate / 2 : 0,
            cgstAmt: !isInterState ? (taxableValue * gstRate / 2) / 100 : 0,
            sgstRate: !isInterState ? gstRate / 2 : 0,
            sgstAmt: !isInterState ? (taxableValue * gstRate / 2) / 100 : 0,
            igstRate: isInterState ? gstRate : 0,
            igstAmt: isInterState ? (taxableValue * gstRate) / 100 : 0,
        };
    });

    // Grand totals across all items
    const subTotal = items.reduce((s, i) => s + i.taxableValue, 0);
    const totalCgst = items.reduce((s, i) => s + i.cgstAmt, 0);
    const totalSgst = items.reduce((s, i) => s + i.sgstAmt, 0);
    const totalIgst = items.reduce((s, i) => s + i.igstAmt, 0);
    const totalTax = totalCgst + totalSgst + totalIgst;

    const shipping = Number(invoice?.shippingCharges) || 0;

    let adjustment = 0;
    if (typeof invoice?.adjustment === 'object' && invoice?.adjustment !== null) {
        adjustment = Number(invoice.adjustment.amount) || 0;
    } else {
        adjustment = Number(invoice?.adjustment) || 0;
    }

    const grandTotalRaw = subTotal + totalTax + shipping + adjustment;
    let roundedOff = Number(invoice?.roundOff);
    if (isNaN(roundedOff) || invoice?.roundOff == null) {
        roundedOff = Math.round(grandTotalRaw) - grandTotalRaw;
    }
    const grandTotal = grandTotalRaw + roundedOff;

    // Paginate
    const pages = paginateItems(items, paperSize);
    const totalPages = pages.length;

    // No longer need getMinRows — spacer row fills remaining space

    // Running subtotals for carried-forward logic
    const cumulativeSubtotals: number[] = [];
    const cumulativeTax: number[] = [];
    let runningSubtotal = 0;
    let runningTax = 0;
    for (let p = 0; p < pages.length; p++) {
        const pageSubtotal = pages[p].reduce((s, i) => s + i.taxableValue, 0);
        const pageTax = pages[p].reduce((s, i) => s + i.cgstAmt + i.sgstAmt + i.igstAmt, 0);
        runningSubtotal += pageSubtotal;
        runningTax += pageTax;
        cumulativeSubtotals.push(runningSubtotal);
        cumulativeTax.push(runningTax);
    }

    return (
        <div id="invoice-print-area">
            <style>{`
        @media print {
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: ${paperSize === 'A5' ? 'A5' : 'A4'}; margin: ${paperSize === 'A5' ? '10mm' : '15mm'}; }
          .invoice-page { max-width: 100% !important; min-height: auto !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }

        .invoice-page {
            width: ${paperSize === 'A5' ? '148mm' : '210mm'} !important;
            max-width: ${paperSize === 'A5' ? '148mm' : '210mm'} !important;
            min-height: ${paperSize === 'A5' ? '210mm' : '297mm'} !important;
            padding: ${paperSize === 'A5' ? '5mm 10mm 4mm 10mm' : '5mm 15mm 4mm 15mm'} !important;
            box-sizing: border-box;
            background: #fff;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
        }

        ${paperSize === 'A5' ? `
        .invoice-page h1 { font-size: 18px !important; }
        .invoice-page p, .invoice-page span, .invoice-page td, .invoice-page th { font-size: 8.5px !important; line-height: 1.25; }
        .invoice-page th { padding: 4px 2px !important; }
        ` : ''}

        .invoice-page-break {
            page-break-after: always;
            break-after: page;
        }
      `}</style>

            {pages.map((pageItems, pageIdx) => {
                const isLastPage = pageIdx === pages.length - 1;
                const pageNum = pageIdx + 1;

                // Page-specific subtotals
                const pageSubtotal = pageItems.reduce((s, i) => s + i.taxableValue, 0);
                const pageCgst = pageItems.reduce((s, i) => s + i.cgstAmt, 0);
                const pageSgst = pageItems.reduce((s, i) => s + i.sgstAmt, 0);
                const pageIgst = pageItems.reduce((s, i) => s + i.igstAmt, 0);
                const pageTax = pageCgst + pageSgst + pageIgst;

                const bfSubtotal = pageIdx > 0 ? cumulativeSubtotals[pageIdx - 1] : 0;
                const bfTax = pageIdx > 0 ? cumulativeTax[pageIdx - 1] : 0;

                const pageEntries = pageItems.reduce((s, i) => s + Math.max(1, i.meters.length), 0);
                const pageQty = pageItems.reduce((s, i) => s + i.qty, 0);

                return (
                    <div
                        key={pageIdx}
                        className={`invoice-page ${!isLastPage ? 'invoice-page-break' : ''}`}
                        style={{
                            ...S.page,
                            marginBottom: !isLastPage ? '20px' : '0',
                            boxShadow: !isLastPage ? '0 2px 8px rgba(0,0,0,0.08)' : undefined,
                        }}
                    >
                        <PageHeader
                            profile={profile}
                            invoice={invoice}
                            party={party}
                            partyAddr={partyAddr}
                            addr={addr}
                            cfg={cfg}
                            pageNum={pageIdx + 1}
                            totalPages={totalPages}
                        />

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0', flex: 1 }}>
                                <ItemsTableHeader showRates={showRates} showAmount={showAmount} isInterState={!!isInterState} />
                                <tbody>
                                    {pageIdx > 0 && showAmount && (
                                        <tr>
                                            <td colSpan={showRates ? 6 : 5} style={{ ...S.carriedForwardRow, textAlign: 'right', borderBottom: '1px solid #b2f0cd' }}>
                                                Brought Forward from Page {pageIdx}:
                                            </td>
                                            <td colSpan={isInterState ? 3 : 5} style={{ ...S.carriedForwardRow, textAlign: 'right', borderBottom: '1px solid #b2f0cd' }}>
                                                ₹ {fmtCurrency(bfSubtotal + bfTax)}
                                            </td>
                                        </tr>
                                    )}
                                    {pageItems.map((item) => (
                                        <ItemRow key={item.srNo} item={item} showRates={showRates} showAmount={showAmount} isInterState={!!isInterState} />
                                    ))}
                                </tbody>
                            </table>
                        </div>



                        {/* ═══════ PAGE FOOTER / TOTALS ═══════ */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0' }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: '60%', verticalAlign: 'top', paddingRight: '20px' }}>
                                        {isLastPage ? (
                                            <>
                                                <p style={{ ...S.meta, marginTop: '8px' }}>
                                                    <span style={S.metaLabel}>Total Entries: </span>{items.length}
                                                </p>
                                                <p style={S.meta}>
                                                    <span style={S.metaLabel}>Total Quantity: </span>{items.reduce((s, i) => s + i.qty, 0).toFixed(2)}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p style={{ ...S.meta, marginTop: '8px' }}>
                                                    <span style={S.metaLabel}>Page {pageIdx + 1} Entries: </span>{pageEntries}
                                                </p>
                                                <p style={S.meta}>
                                                    <span style={S.metaLabel}>Page {pageIdx + 1} Quantity: </span>{pageQty.toFixed(2)}
                                                </p>
                                            </>
                                        )}
                                    </td>
                                    <td style={{ width: showAmount ? '40%' : '100%' }}>
                                        {showAmount ? (
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                    {!isLastPage && (
                                                        <>
                                                            <tr>
                                                                <td style={S.totalRow}>Page {pageIdx + 1} Sub Total:</td>
                                                                <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(pageSubtotal)}</td>
                                                            </tr>
                                                            {pageTax > 0 && (
                                                                <tr>
                                                                    <td style={S.totalRow}>Page {pageIdx + 1} Tax:</td>
                                                                    <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(pageTax)}</td>
                                                                </tr>
                                                            )}
                                                            <tr style={{ borderTop: '2px solid #0c9c5e' }}>
                                                                <td style={S.carriedForwardRow}>Carried Forward:</td>
                                                                <td style={{ ...S.carriedForwardRow, textAlign: 'right' }}>₹ {fmtCurrency(cumulativeSubtotals[pageIdx] + cumulativeTax[pageIdx])}</td>
                                                            </tr>
                                                        </>
                                                    )}

                                                    {isLastPage && (
                                                        <>
                                                            {totalPages > 1 && (
                                                                <tr>
                                                                    <td style={S.carriedForwardRow}>Brought Forward (Page 1{pageIdx > 1 ? `-${pageIdx}` : ''}):</td>
                                                                    <td style={{ ...S.carriedForwardRow, textAlign: 'right' }}>₹ {fmtCurrency(bfSubtotal + bfTax)}</td>
                                                                </tr>
                                                            )}
                                                            <tr>
                                                                <td style={S.totalRow}>Sub Total:</td>
                                                                <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(subTotal)}</td>
                                                            </tr>
                                                            {/* GST breakdown grouped by rate */}
                                                            {(() => {
                                                                // Group taxes by rate for clear percentage display
                                                                const cgstByRate: Record<number, number> = {};
                                                                const sgstByRate: Record<number, number> = {};
                                                                const igstByRate: Record<number, number> = {};
                                                                items.forEach(i => {
                                                                    if (i.cgstRate > 0) cgstByRate[i.cgstRate] = (cgstByRate[i.cgstRate] || 0) + i.cgstAmt;
                                                                    if (i.sgstRate > 0) sgstByRate[i.sgstRate] = (sgstByRate[i.sgstRate] || 0) + i.sgstAmt;
                                                                    if (i.igstRate > 0) igstByRate[i.igstRate] = (igstByRate[i.igstRate] || 0) + i.igstAmt;
                                                                });
                                                                return (
                                                                    <>
                                                                        {Object.entries(cgstByRate).map(([rate, amt]) => (
                                                                            <tr key={`cgst-${rate}`}>
                                                                                <td style={S.totalRow}>CGST @{rate}%:</td>
                                                                                <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(amt)}</td>
                                                                            </tr>
                                                                        ))}
                                                                        {Object.entries(sgstByRate).map(([rate, amt]) => (
                                                                            <tr key={`sgst-${rate}`}>
                                                                                <td style={S.totalRow}>SGST @{rate}%:</td>
                                                                                <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(amt)}</td>
                                                                            </tr>
                                                                        ))}
                                                                        {Object.entries(igstByRate).map(([rate, amt]) => (
                                                                            <tr key={`igst-${rate}`}>
                                                                                <td style={S.totalRow}>IGST @{rate}%:</td>
                                                                                <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(amt)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </>
                                                                );
                                                            })()}
                                                            {shipping > 0 && (
                                                                <tr>
                                                                    <td style={S.totalRow}>Shipping Charges:</td>
                                                                    <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(shipping)}</td>
                                                                </tr>
                                                            )}
                                                            {adjustment !== 0 && (
                                                                <tr>
                                                                    <td style={S.totalRow}>{typeof invoice?.adjustment === 'object' ? invoice.adjustment.label : 'Adjustment'}:</td>
                                                                    <td style={{ ...S.totalRow, textAlign: 'right' }}>{adjustment >= 0 ? '+' : ''}{fmtCurrency(adjustment)}</td>
                                                                </tr>
                                                            )}
                                                            {roundedOff !== 0 && (
                                                                <tr>
                                                                    <td style={S.totalRow}>Rounded Off:</td>
                                                                    <td style={{ ...S.totalRow, textAlign: 'right' }}>{roundedOff >= 0 ? '+' : ''}{roundedOff.toFixed(2)}</td>
                                                                </tr>
                                                            )}
                                                            <tr style={{ borderTop: '2px solid #0c9c5e' }}>
                                                                <td style={S.grandTotal}>Grand Total:</td>
                                                                <td style={{ ...S.grandTotal, textAlign: 'right' }}>₹ {fmtCurrency(grandTotal)}</td>
                                                            </tr>
                                                        </>
                                                    )}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p style={{ ...S.meta, textAlign: 'right', fontStyle: 'italic', color: '#888' }}>Amount details hidden per settings</p>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* ═══════ AMOUNT IN WORDS (last page only) ═══════ */}
                        {isLastPage && showAmount && (
                            <div style={{ marginTop: '8px', padding: '6px 0', borderTop: '1px solid #eee' }}>
                                <p style={{ ...S.meta, fontStyle: 'italic', color: '#555' }}>
                                    <span style={S.metaLabel}>Amount in Words: </span>
                                    {numberToWords(grandTotal)}
                                </p>
                            </div>
                        )}

                        {/* ═══════ NOTES + SIGNATURE (last page only) ═══════ */}
                        {isLastPage && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '6px', borderTop: '1px solid #ccc' }}>
                                <div style={{ width: '55%' }}>
                                    <p style={S.metaLabel}>Customer Notes:</p>
                                    <p style={{ ...S.meta, color: '#666', marginTop: '4px' }}>{invoice?.notes || 'Thank you for your business!'}</p>
                                    {invoice?.termsAndConditions && (
                                        <p style={{ ...S.meta, color: '#888', marginTop: '6px', fontSize: '9px' }}><strong>Terms:</strong> {invoice.termsAndConditions}</p>
                                    )}
                                </div>
                                <div style={{ width: '35%', textAlign: 'center' }}>
                                    {cfg.signatureUrl ? (
                                        <img src={cfg.signatureUrl} alt="Signature" style={{ maxHeight: '50px', margin: '0 auto 6px' }} />
                                    ) : (
                                        <div style={{ borderBottom: '1px solid #333', marginBottom: '6px', paddingBottom: '40px' }}></div>
                                    )}
                                    <p style={{ ...S.meta, fontWeight: 600 }}>Authorised Signatory</p>
                                    <p style={{ ...S.meta, color: '#888' }}>For {profile.businessName || '—'}</p>
                                </div>
                            </div>
                        )}

                        {/* ═══════ CONTINUED / FOOTER ═══════ */}
                        {!isLastPage && (
                            <div style={{ marginTop: '12px', textAlign: 'center', paddingTop: '6px', borderTop: '1px solid #eee' }}>
                                <p style={{ fontSize: '9px', color: '#0c9c5e', fontWeight: 600 }}>
                                    — Continued on next page —
                                </p>
                            </div>
                        )}

                        {isLastPage && (
                            <div style={{ marginTop: '4px', textAlign: 'center', paddingTop: '4px', borderTop: '1px solid #eee' }}>
                                <p style={{ fontSize: '8px', color: '#999', margin: 0 }}>
                                    This is a computer generated invoice and does not require physical signature. • Generated by TextilePro
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
