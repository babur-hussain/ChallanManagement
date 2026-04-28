import React from 'react';

/**
 * DeliveryChallanTemplate — Multi-page delivery challan with repeating header/footer
 *
 * Uses ONLY inline styles for print fidelity. No Tailwind.
 * Items are paginated. Each page has header + items + footer.
 * Non-last pages show page subtotal + carried forward.
 * Last page shows brought forward + page subtotal + grand total + notes + signature.
 */

interface ChallanItem {
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

interface ChallanTemplateProps {
    challan: any;
    businessProfile?: any;
    challanSettings?: any;
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
const ITEMS_FIRST_PAGE_A4 = 6;
const ITEMS_CONT_PAGE_A4 = 10;
const ITEMS_FIRST_PAGE_A5 = 4;
const ITEMS_CONT_PAGE_A5 = 7;

function paginateItems(items: ChallanItem[], paperSize: string): ChallanItem[][] {
    if (items.length === 0) return [[]];
    const firstPageLimit = paperSize === 'A5' ? ITEMS_FIRST_PAGE_A5 : ITEMS_FIRST_PAGE_A4;
    const contPageLimit = paperSize === 'A5' ? ITEMS_CONT_PAGE_A5 : ITEMS_CONT_PAGE_A4;

    const pages: ChallanItem[][] = [];
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
        padding: '20px 30px',
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
        margin: '10px 0',
    } as React.CSSProperties,

    tableHeader: {
        backgroundColor: '#E69138',
        color: '#fff',
        fontWeight: 600,
        fontSize: '9px',
        textTransform: 'uppercase' as const,
        textAlign: 'center' as const,
        padding: '6px 4px',
        border: '1px solid #c47a2c',
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
        background: '#f5f5f5',
    } as React.CSSProperties,

    carriedForwardRow: {
        fontSize: '10px',
        fontWeight: 600,
        padding: '5px 8px',
        background: '#FFF8E1',
        color: '#E65100',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
    } as React.CSSProperties,

    pageIndicator: {
        fontSize: '8px',
        color: '#999',
        textAlign: 'center' as const,
        padding: '4px 0',
        borderTop: '1px solid #eee',
        marginTop: '8px',
    } as React.CSSProperties,
};

// ——— Sub-components ———

function PageHeader({ profile, challan, party, partyAddr, addr, cfg, pageNum, totalPages }: any) {
    const prefix = cfg.prefix || 'DC';
    return (
        <>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
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
                            background: 'linear-gradient(135deg, #E69138, #f0a050)',
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
                    <h1 style={S.headerTitle}>DELIVERY CHALLAN</h1>
                    <p style={S.headerSubtitle}>Delivery Challan# - {challan?.challanNumber || `${prefix}-001`}</p>
                    {totalPages > 1 && (
                        <p style={{ fontSize: '9px', color: '#E69138', fontWeight: 600, margin: '4px 0 0 0' }}>
                            Page {pageNum} of {totalPages}
                        </p>
                    )}
                </div>
            </div>

            {/* COMPANY INFO */}
            <div style={{ marginBottom: '6px' }}>
                <p style={S.companyName}>Company Name: {profile.businessName || '—'}</p>
                <p style={S.meta}>Address: {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ') || '—'}</p>
                {(profile.gstin || addr.country === 'India') && <p style={S.meta}>GSTIN: {profile.gstin || '—'}</p>}
                <p style={S.meta}>Phone: {(profile.phoneNumbers || [])[0] || '—'}</p>
            </div>

            <hr style={S.separator} />

            {/* META ROW */}
            {pageNum === 1 ? (
                <>
                    <table style={{ width: '100%', marginBottom: '6px', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '33%' }}>
                                    <span style={S.metaLabel}>Delivery Challan #</span><br />
                                    <span>{challan?.challanNumber || '—'}</span>
                                </td>
                                <td style={{ width: '33%' }}>
                                    <span style={S.metaLabel}>Order Date</span><br />
                                    <span>{fmtDate(challan?.date)}</span>
                                </td>
                                <td style={{ width: '34%' }}>
                                    <span style={S.metaLabel}>Dispatch Date</span><br />
                                    <span>{fmtDate(challan?.date)}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <hr style={S.separator} />

                    {/* BILL TO + RIGHT META */}
                    <table style={{ width: '100%', marginBottom: '14px', borderCollapse: 'collapse' }}>
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
                                                <td style={{ ...S.meta, width: '40%' }}>Challan Date:</td>
                                                <td style={S.meta}>{fmtDate(challan?.date)}</td>
                                            </tr>
                                            <tr>
                                                <td style={S.meta}>Ref #:</td>
                                                <td style={S.meta}>{challan?.challanNumber || '—'}</td>
                                            </tr>
                                            <tr>
                                                <td style={S.meta}>Challan Type:</td>
                                                <td style={S.meta}>Supply</td>
                                            </tr>
                                            <tr>
                                                <td style={S.meta}>GSTIN:</td>
                                                <td style={S.meta}>{party.gstin || '—'}</td>
                                            </tr>
                                            {challan?.vehicleNumber && (
                                                <tr>
                                                    <td style={S.meta}>Vehicle No:</td>
                                                    <td style={S.meta}>{challan.vehicleNumber}</td>
                                                </tr>
                                            )}
                                            {challan?.brokerSnapshot && (
                                                <tr>
                                                    <td style={S.meta}>Broker:</td>
                                                    <td style={S.meta}>{challan.brokerSnapshot.name}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>
            ) : (
                /* Continuation pages: compact header */
                <div style={{ marginBottom: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '50%' }}>
                                    <span style={S.metaLabel}>Bill To: </span>
                                    <span style={{ fontWeight: 600 }}>{party.name || '—'}</span>
                                    <span style={{ color: '#888', marginLeft: '6px', fontSize: '9px' }}>
                                        {party.gstin ? `(GSTIN: ${party.gstin})` : ''}
                                    </span>
                                </td>
                                <td style={{ width: '50%', textAlign: 'right' }}>
                                    <span style={S.metaLabel}>Challan: </span>
                                    <span>{challan?.challanNumber || '—'}</span>
                                    <span style={{ color: '#888', marginLeft: '10px' }}>Date: {fmtDate(challan?.date)}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

function ItemsTableHeader({ showRates, showAmount }: { showRates: boolean; showAmount: boolean }) {
    return (
        <thead>
            <tr>
                <th style={{ ...S.tableHeader, width: '5%' }} rowSpan={2}>SR No.</th>
                <th style={{ ...S.tableHeader, width: showRates ? '20%' : '35%' }} rowSpan={2}>ITEM DESCRIPTION</th>
                <th style={{ ...S.tableHeader, width: '8%' }} rowSpan={2}>HSN/SAC</th>
                <th style={{ ...S.tableHeader, width: '6%' }} rowSpan={2}>QTY<br /><span style={{ fontSize: '7px', fontWeight: 400 }}>(Unit)</span></th>
                {showRates && <th style={{ ...S.tableHeader, width: '8%' }} rowSpan={2}>RATE</th>}
                {showAmount && <th style={{ ...S.tableHeader, width: '10%' }} rowSpan={2}>TAXABLE<br />VALUE</th>}
                {showAmount && <th style={{ ...S.tableHeader, width: '14%', borderRight: '1px solid #c47a2c' }} colSpan={2}>CGST</th>}
                {showAmount && <th style={{ ...S.tableHeader, width: '14%', borderRight: '1px solid #c47a2c' }} colSpan={2}>SGST</th>}
                {showAmount && <th style={{ ...S.tableHeader, width: '14%' }} colSpan={2}>IGST</th>}
            </tr>
            {showAmount && (
                <tr>
                    <th style={{ ...S.tableHeader, fontSize: '8px' }}>RATE</th>
                    <th style={{ ...S.tableHeader, fontSize: '8px' }}>AMT.</th>
                    <th style={{ ...S.tableHeader, fontSize: '8px' }}>RATE</th>
                    <th style={{ ...S.tableHeader, fontSize: '8px' }}>AMT.</th>
                    <th style={{ ...S.tableHeader, fontSize: '8px' }}>RATE</th>
                    <th style={{ ...S.tableHeader, fontSize: '8px' }}>AMT.</th>
                </tr>
            )}
        </thead>
    );
}

function ItemRow({ item, showRates, showAmount }: { item: ChallanItem; showRates: boolean; showAmount: boolean }) {
    return (
        <tr>
            <td style={{ ...S.tableCell, textAlign: 'center', verticalAlign: 'top' }}>{item.srNo}</td>
            <td style={{ ...S.tableCell, textAlign: 'left', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 600 }}>{item.description}</div>
                {item.meters.length > 1 && (
                    <div style={{ marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                        {item.meters.map((m, i) => (
                            <span key={i} style={{
                                display: 'inline-block',
                                background: '#FFF3E0',
                                color: '#E65100',
                                fontSize: '8px',
                                padding: '1px 4px',
                                borderRadius: '3px',
                                border: '1px solid #FFE0B2',
                                fontFamily: 'monospace',
                            }}>{m}</span>
                        ))}
                    </div>
                )}
            </td>
            <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top' }}>{item.hsnCode}</td>
            <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top' }}>
                {item.meters.length > 1 ? (
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
            {showAmount && <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top', color: item.cgstRate ? '#333' : '#bbb' }}>{item.cgstRate}%</td>}
            {showAmount && <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top', color: item.cgstAmt ? '#333' : '#bbb' }}>{fmtCurrency(item.cgstAmt)}</td>}
            {showAmount && <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top', color: item.sgstRate ? '#333' : '#bbb' }}>{item.sgstRate}%</td>}
            {showAmount && <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top', color: item.sgstAmt ? '#333' : '#bbb' }}>{fmtCurrency(item.sgstAmt)}</td>}
            {showAmount && <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top', color: item.igstRate ? '#333' : '#bbb' }}>{item.igstRate}%</td>}
            {showAmount && <td style={{ ...S.tableCell, textAlign: 'right', verticalAlign: 'top', color: item.igstAmt ? '#333' : '#bbb' }}>{fmtCurrency(item.igstAmt)}</td>}
        </tr>
    );
}

function EmptyRow({ showRates, showAmount }: { showRates: boolean; showAmount: boolean }) {
    return (
        <tr>
            <td style={{ ...S.tableCell, height: '22px' }}>&nbsp;</td>
            <td style={{ ...S.tableCell, height: '22px' }}>&nbsp;</td>
            <td style={{ ...S.tableCell, height: '22px' }}>&nbsp;</td>
            <td style={{ ...S.tableCell, height: '22px' }}>&nbsp;</td>
            {showRates && <td style={{ ...S.tableCell, height: '22px' }}>&nbsp;</td>}
            {showAmount && <>
                <td style={{ ...S.tableCell, height: '22px' }}>&nbsp;</td>
                <td style={{ ...S.tableCell, height: '22px' }}>&nbsp;</td>
                <td style={{ ...S.tableCell, height: '22px' }}>&nbsp;</td>
                <td style={{ ...S.tableCell, height: '22px' }}>&nbsp;</td>
                <td style={{ ...S.tableCell, height: '22px' }}>&nbsp;</td>
                <td style={{ ...S.tableCell, height: '22px' }}>&nbsp;</td>
                <td style={{ ...S.tableCell, height: '22px' }}>&nbsp;</td>
            </>}
        </tr>
    );
}

// ——— Main Component ———
export function DeliveryChallanTemplate({ challan, businessProfile, challanSettings }: ChallanTemplateProps) {
    const profile = businessProfile || {};
    const party = challan?.partySnapshot || {};
    const addr = profile.address || {};
    const partyAddr = party.address || {};
    const cfg = challanSettings || {};
    const showRates = cfg.showRates ?? true;
    const showAmount = cfg.showAmount ?? true;
    const defaultTerms = cfg.defaultTerms || '';
    const defaultRemarks = cfg.defaultRemarks || 'Thank you for your business!';
    const paperSize = challan?.paperSize || 'A4';

    // Build line items
    const items: ChallanItem[] = (challan?.items || []).map((item: any, idx: number) => {
        const amt = (item.totalMeters || item.quantity || 0) * (item.ratePerMeter || item.rate || 0);
        const discountValue = item.discountType === 'PERCENTAGE' ? amt * ((item.discount || 0) / 100) : (item.discount || 0);
        const taxableValue = Math.max(0, amt - discountValue);
        const isSameState = (partyAddr.state || '').toLowerCase() === (addr.state || '').toLowerCase();
        const gstRate = Number(item.taxRate ?? item.gstRate ?? 0);

        return {
            srNo: idx + 1,
            description: item.itemName || item.name || item.description || '',
            hsnCode: item.hsnCode || '',
            qty: item.totalMeters || item.quantity || 0,
            meters: Array.isArray(item.meters) ? item.meters : [],
            unit: item.unit || 'METERS',
            pricePerItem: item.ratePerMeter || item.rate || 0,
            taxableValue,
            cgstRate: isSameState ? gstRate / 2 : 0,
            cgstAmt: isSameState ? (taxableValue * gstRate / 2) / 100 : 0,
            sgstRate: isSameState ? gstRate / 2 : 0,
            sgstAmt: isSameState ? (taxableValue * gstRate / 2) / 100 : 0,
            igstRate: !isSameState ? gstRate : 0,
            igstAmt: !isSameState ? (taxableValue * gstRate) / 100 : 0,
        };
    });

    // Grand totals across all items
    const subTotal = items.reduce((s, i) => s + i.taxableValue, 0);
    const totalCgst = items.reduce((s, i) => s + i.cgstAmt, 0);
    const totalSgst = items.reduce((s, i) => s + i.sgstAmt, 0);
    const totalIgst = items.reduce((s, i) => s + i.igstAmt, 0);
    const totalTax = totalCgst + totalSgst + totalIgst;
    const grandTotalRaw = subTotal + totalTax;
    const grandTotal = Math.round(grandTotalRaw);
    const roundedOff = grandTotal - grandTotalRaw;

    // Paginate
    const pages = paginateItems(items, paperSize);
    const totalPages = pages.length;

    // Compute min empty rows per page
    const getMinRows = (pageIdx: number) => {
        if (totalPages === 1) return Math.max(0, 8 - pages[0].length);
        if (pageIdx === 0) {
            const limit = paperSize === 'A5' ? ITEMS_FIRST_PAGE_A5 : ITEMS_FIRST_PAGE_A4;
            return Math.max(0, limit - pages[0].length);
        }
        const limit = paperSize === 'A5' ? ITEMS_CONT_PAGE_A5 : ITEMS_CONT_PAGE_A4;
        return Math.max(0, limit - pages[pageIdx].length);
    };

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
        <div id="challan-print-area">
            {/* ═══════ Print-only CSS ═══════ */}
            <style>{`
        @media print {
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { size: ${paperSize === 'A5' ? 'A5' : 'A4'}; margin: ${paperSize === 'A5' ? '10mm' : '15mm'}; }
          .challan-page { max-width: 100% !important; min-height: auto !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }

        .challan-page {
            width: ${paperSize === 'A5' ? '148mm' : '210mm'} !important;
            max-width: ${paperSize === 'A5' ? '148mm' : '210mm'} !important;
            min-height: ${paperSize === 'A5' ? '210mm' : '297mm'} !important;
            padding: ${paperSize === 'A5' ? '10mm' : '15mm'} !important;
            box-sizing: border-box;
            background: #fff;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
        }

        ${paperSize === 'A5' ? `
        .challan-page h1 { font-size: 18px !important; }
        .challan-page p, .challan-page span, .challan-page td, .challan-page th { font-size: 8.5px !important; line-height: 1.25; }
        .challan-page th { padding: 4px 2px !important; }
        ` : ''}

        .challan-page-break {
            page-break-after: always;
            break-after: page;
        }
      `}</style>

            {pages.map((pageItems, pageIdx) => {
                const isLastPage = pageIdx === pages.length - 1;
                const isFirstPage = pageIdx === 0;
                const emptyRowCount = getMinRows(pageIdx);

                // Page-specific subtotals
                const pageSubtotal = pageItems.reduce((s, i) => s + i.taxableValue, 0);
                const pageCgst = pageItems.reduce((s, i) => s + i.cgstAmt, 0);
                const pageSgst = pageItems.reduce((s, i) => s + i.sgstAmt, 0);
                const pageIgst = pageItems.reduce((s, i) => s + i.igstAmt, 0);
                const pageTax = pageCgst + pageSgst + pageIgst;

                // Brought forward (sum of all previous pages)
                const bfSubtotal = pageIdx > 0 ? cumulativeSubtotals[pageIdx - 1] : 0;
                const bfTax = pageIdx > 0 ? cumulativeTax[pageIdx - 1] : 0;

                // Page entries and qty
                const pageEntries = pageItems.reduce((s, i) => s + Math.max(1, i.meters.length), 0);
                const pageQty = pageItems.reduce((s, i) => s + i.qty, 0);

                return (
                    <div
                        key={pageIdx}
                        className={`challan-page ${!isLastPage ? 'challan-page-break' : ''}`}
                        style={{
                            ...S.page,
                            marginBottom: !isLastPage ? '20px' : '0',
                            boxShadow: !isLastPage ? '0 2px 8px rgba(0,0,0,0.08)' : undefined,
                        }}
                    >
                        {/* ═══════ PAGE HEADER ═══════ */}
                        <PageHeader
                            profile={profile}
                            challan={challan}
                            party={party}
                            partyAddr={partyAddr}
                            addr={addr}
                            cfg={cfg}
                            pageNum={pageIdx + 1}
                            totalPages={totalPages}
                        />

                        {/* ═══════ ITEMS TABLE ═══════ */}
                        <div style={{ flex: 1 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0' }}>
                                <ItemsTableHeader showRates={showRates} showAmount={showAmount} />
                                <tbody>
                                    {/* Brought Forward row for continuation pages */}
                                    {pageIdx > 0 && showAmount && (
                                        <tr>
                                            <td colSpan={showRates ? 6 : 5} style={{ ...S.carriedForwardRow, textAlign: 'right', borderBottom: '1px solid #FFE0B2' }}>
                                                Brought Forward from Page {pageIdx}:
                                            </td>
                                            <td colSpan={6} style={{ ...S.carriedForwardRow, textAlign: 'right', borderBottom: '1px solid #FFE0B2' }}>
                                                ₹ {fmtCurrency(bfSubtotal + bfTax)}
                                            </td>
                                        </tr>
                                    )}
                                    {pageItems.map((item) => (
                                        <ItemRow key={item.srNo} item={item} showRates={showRates} showAmount={showAmount} />
                                    ))}
                                    {Array.from({ length: emptyRowCount }).map((_, i) => (
                                        <EmptyRow key={`empty-${i}`} showRates={showRates} showAmount={showAmount} />
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
                                                    <span style={S.metaLabel}>Total Entries: </span>{challan?.totalRolls || 0}
                                                </p>
                                                <p style={S.meta}>
                                                    <span style={S.metaLabel}>Total Quantity: </span>{challan?.totalMeters?.toFixed(2) || '0.00'}
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
                                                    {/* Non-last page: show page subtotal + carried forward */}
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
                                                            <tr style={{ borderTop: '2px solid #E69138' }}>
                                                                <td style={S.carriedForwardRow}>Carried Forward:</td>
                                                                <td style={{ ...S.carriedForwardRow, textAlign: 'right' }}>₹ {fmtCurrency(cumulativeSubtotals[pageIdx] + cumulativeTax[pageIdx])}</td>
                                                            </tr>
                                                        </>
                                                    )}

                                                    {/* Last page: full breakdown */}
                                                    {isLastPage && (
                                                        <>
                                                            {/* Show brought forward if multi-page */}
                                                            {totalPages > 1 && (
                                                                <tr>
                                                                    <td style={S.carriedForwardRow}>Brought Forward (Page 1{pageIdx > 1 ? `-${pageIdx}` : ''}):</td>
                                                                    <td style={{ ...S.carriedForwardRow, textAlign: 'right' }}>₹ {fmtCurrency(bfSubtotal + bfTax)}</td>
                                                                </tr>
                                                            )}
                                                            {totalPages > 1 && (
                                                                <tr>
                                                                    <td style={S.totalRow}>Page {pageIdx + 1} Sub Total:</td>
                                                                    <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(pageSubtotal + pageTax)}</td>
                                                                </tr>
                                                            )}
                                                            <tr>
                                                                <td style={S.totalRow}>Sub Total:</td>
                                                                <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(subTotal)}</td>
                                                            </tr>
                                                            {totalCgst > 0 && (
                                                                <tr>
                                                                    <td style={S.totalRow}>CGST ({items.find(i => i.cgstRate > 0)?.cgstRate || 0}%):</td>
                                                                    <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(totalCgst)}</td>
                                                                </tr>
                                                            )}
                                                            {totalSgst > 0 && (
                                                                <tr>
                                                                    <td style={S.totalRow}>SGST ({items.find(i => i.sgstRate > 0)?.sgstRate || 0}%):</td>
                                                                    <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(totalSgst)}</td>
                                                                </tr>
                                                            )}
                                                            {totalIgst > 0 && (
                                                                <tr>
                                                                    <td style={S.totalRow}>IGST ({items.find(i => i.igstRate > 0)?.igstRate || 0}%):</td>
                                                                    <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(totalIgst)}</td>
                                                                </tr>
                                                            )}
                                                            <tr>
                                                                <td style={S.totalRow}>Total Tax:</td>
                                                                <td style={{ ...S.totalRow, textAlign: 'right' }}>{fmtCurrency(totalTax)}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style={S.totalRow}>Rounded Off:</td>
                                                                <td style={{ ...S.totalRow, textAlign: 'right' }}>{roundedOff >= 0 ? '+' : ''}{roundedOff.toFixed(2)}</td>
                                                            </tr>
                                                            <tr style={{ borderTop: '2px solid #E69138' }}>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc' }}>
                                <div style={{ width: '55%' }}>
                                    <p style={S.metaLabel}>Notes:</p>
                                    <p style={{ ...S.meta, color: '#666', marginTop: '4px' }}>{challan?.remarks || defaultRemarks}</p>
                                    {defaultTerms && (
                                        <p style={{ ...S.meta, color: '#888', marginTop: '6px', fontSize: '9px' }}><strong>Terms:</strong> {defaultTerms}</p>
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
                                <p style={{ fontSize: '9px', color: '#E69138', fontWeight: 600 }}>
                                    — Continued on next page —
                                </p>
                            </div>
                        )}

                        {/* ═══════ FINAL FOOTER (last page) ═══════ */}
                        {isLastPage && (
                            <div style={{ marginTop: '16px', textAlign: 'center', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                                <p style={{ fontSize: '8px', color: '#999' }}>
                                    This is a computer generated challan and does not require physical signature. • Generated by TextilePro
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
