import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Roboto',
    fonts: [
        { src: '/fonts/Roboto-Regular.ttf' },
        { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' }
    ]
});

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

interface InvoiceItemData {
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

function paginateItems(items: InvoiceItemData[], paperSize: string): InvoiceItemData[][] {
    if (items.length === 0) return [[]];
    const firstPageLimit = paperSize === 'A5' ? ITEMS_FIRST_PAGE_A5 : ITEMS_FIRST_PAGE_A4;
    const contPageLimit = paperSize === 'A5' ? ITEMS_CONT_PAGE_A5 : ITEMS_CONT_PAGE_A4;

    const pages: InvoiceItemData[][] = [];
    pages.push(items.slice(0, firstPageLimit));

    let remaining = items.slice(firstPageLimit);
    while (remaining.length > 0) {
        pages.push(remaining.slice(0, contPageLimit));
        remaining = remaining.slice(contPageLimit);
    }
    return pages;
}

// ——— Colors ———
const GREEN = '#0c9c5e';
const GREEN_BORDER = '#09814d';
const GREEN_LIGHT = '#eefcf5';
const GREY = '#555';
const LIGHT_GREY = '#888';
const BORDER = '#ddd';

// ——— Styles ———
const s = StyleSheet.create({
    // Page
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#222',
        padding: '5mm 15mm 12mm 15mm',
        backgroundColor: '#fff',
        position: 'relative',
    },
    pageA5: {
        fontFamily: 'Helvetica',
        fontSize: 8.5,
        color: '#222',
        padding: '3mm 10mm 8mm 10mm',
        backgroundColor: '#fff',
        position: 'relative',
    },

    // ─── HEADER ───
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    logoImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginBottom: 6,
    },
    logoFallback: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: GREEN,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    logoText: { color: '#fff', fontSize: 22, fontFamily: 'Helvetica-Bold' },
    headerTitle: { fontFamily: 'Helvetica-Bold', fontSize: 24, textAlign: 'right', color: '#222' },
    headerSubtitle: { fontSize: 11, textAlign: 'right', color: GREY, marginTop: 3 },
    pageNumber: { fontSize: 9, textAlign: 'right', color: GREEN, fontFamily: 'Helvetica-Bold', marginTop: 3 },

    // ─── COMPANY INFO ───
    companyName: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
    meta: { fontSize: 9, color: '#333', marginBottom: 1.5 },
    metaLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9 },

    // ─── SEPARATOR ───
    separator: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginVertical: 6 },

    // ─── BILL-TO ───
    billToRow: { flexDirection: 'row', marginBottom: 10 },
    billToLeft: { width: '50%', paddingRight: 15 },
    billToRight: { width: '50%' },
    billToMetaRow: { flexDirection: 'row', marginBottom: 2 },
    billToMetaLabel: { width: '40%', fontSize: 9, color: '#333' },
    billToMetaValue: { width: '60%', fontSize: 9, color: '#333' },

    // ─── TABLE ───
    table: { width: '100%', marginBottom: 0 },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: GREEN,
        alignItems: 'stretch',
    },
    tableHeaderCell: {
        color: '#fff',
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        paddingVertical: 6,
        paddingHorizontal: 3,
        borderWidth: 0.5,
        borderColor: GREEN_BORDER,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nestedGstBlock: {
        flexDirection: 'column',
        borderWidth: 0.5,
        borderColor: GREEN_BORDER,
    },
    nestedGstTop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: GREEN_BORDER,
    },
    nestedGstBottomList: {
        flex: 1,
        flexDirection: 'row',
    },
    nestedGstBottomCell: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 0.5,
        borderRightColor: GREEN_BORDER,
    },
    tableRow: { flexDirection: 'row', minHeight: 22 },
    tableCell: {
        fontSize: 9,
        paddingVertical: 5,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: BORDER,
        borderRightWidth: 0.5,
        borderRightColor: '#eee',
        justifyContent: 'center',
    },
    emptyRow: { flexDirection: 'row', minHeight: 20 },

    meterBadge: {
        backgroundColor: GREEN_LIGHT,
        color: GREEN,
        fontSize: 7,
        paddingVertical: 1,
        paddingHorizontal: 3,
        borderRadius: 3,
        borderWidth: 0.5,
        borderColor: '#c2f0d9',
        marginRight: 2,
        marginBottom: 1,
    },

    // ─── CARRIED/BROUGHT FORWARD ───
    carriedForwardRow: {
        flexDirection: 'row',
        backgroundColor: GREEN_LIGHT,
        minHeight: 22,
    },
    carriedForwardCell: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: GREEN,
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#b2f0cd',
    },

    // ─── TOTALS ───
    totalsRow: { flexDirection: 'row', marginTop: 0 },
    totalsLeft: { width: '60%', paddingRight: 15 },
    totalsRight: { width: '40%' },
    totalLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    grandTotalLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderTopWidth: 2,
        borderTopColor: GREEN,
        backgroundColor: GREEN_LIGHT,
    },

    // ─── NOTES / SIGNATURE / FOOTER ───
    notesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    notesLeft: { width: '55%' },
    notesRight: { width: '35%', alignItems: 'center' },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        width: '100%',
        marginBottom: 6,
        paddingBottom: 35,
    },
    signatureImage: { height: 50, marginBottom: 6 },
    footer: {
        marginTop: 6,
        textAlign: 'center',
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    footerText: { fontSize: 7, color: '#999', textAlign: 'center' },
    continuedFooter: {
        marginTop: 10,
        textAlign: 'center',
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    continuedText: {
        fontSize: 9,
        color: GREEN,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },
});

// ——— Interfaces ———
interface InvoicePdfProps {
    invoice: any;
    businessProfile?: any;
    invoiceSettings?: any;
}

// ——— Component ———
export function InvoicePdfDocument({ invoice, businessProfile, invoiceSettings }: InvoicePdfProps) {
    const profile = businessProfile || {};
    const party = invoice?.partySnapshot || {};
    const addr = profile.address || {};
    const partyAddr = party.address || {};
    const cfg = invoiceSettings || {};
    const showRates = cfg.showRates ?? true;
    const showAmount = cfg.showAmount ?? true;
    const paperSize = invoice?.paperSize === 'A5' ? 'A5' : 'A4';
    const isA5 = paperSize === 'A5';
    const isInterState = (partyAddr.state || '').toLowerCase() !== (addr.state || '').toLowerCase() && (partyAddr.state);

    // ─── Dynamic Column Widths ───
    let descW = 22;
    if (!showRates) descW += 10;
    if (!showAmount) descW += 30;
    if (showAmount && isInterState) descW += 16;

    const cw = {
        sr: '5%',
        desc: `${descW}%`,
        hsn: '8%',
        qty: '7%',
        rate: showRates ? '9%' : '0%',
        taxable: showAmount ? '11%' : '0%',
        cgstR: showAmount && !isInterState ? '7%' : '0%',
        cgstA: showAmount && !isInterState ? '8%' : '0%',
        sgstR: showAmount && !isInterState ? '7%' : '0%',
        sgstA: showAmount && !isInterState ? '8%' : '0%',
        igstR: showAmount && isInterState ? '8%' : '0%',
        igstA: showAmount && isInterState ? '8%' : '0%',
    };

    // ─── Build Items (ratePerUnit, not ratePerMeter) ───
    const items: InvoiceItemData[] = (invoice?.items || []).map((item: any, idx: number) => {
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

    // ─── Pagination ───
    const pages = paginateItems(items, paperSize);
    const totalPages = pages.length;
    const MIN_ROWS = 8;

    // ─── Grand Totals ───
    const subTotal = items.reduce((a, i) => a + i.taxableValue, 0);
    const totalCgst = items.reduce((a, i) => a + i.cgstAmt, 0);
    const totalSgst = items.reduce((a, i) => a + i.sgstAmt, 0);
    const totalIgst = items.reduce((a, i) => a + i.igstAmt, 0);

    const shipping = Number(invoice?.shippingCharges) || 0;
    let adjustment = 0;
    if (typeof invoice?.adjustment === 'object' && invoice?.adjustment !== null) {
        adjustment = Number(invoice.adjustment.amount) || 0;
    } else {
        adjustment = Number(invoice?.adjustment) || 0;
    }

    const grandTotalRaw = subTotal + totalCgst + totalSgst + totalIgst + shipping + adjustment;
    let roundedOff = Number(invoice?.roundOff);
    if (isNaN(roundedOff) || invoice?.roundOff == null) {
        roundedOff = Math.round(grandTotalRaw) - grandTotalRaw;
    }
    const grandTotal = grandTotalRaw + roundedOff;

    // ─── Running Subtotals for Carried-Forward ───
    const cumulativeSubtotals: number[] = [];
    const cumulativeTax: number[] = [];
    let runSub = 0, runTax = 0;
    for (const pg of pages) {
        runSub += pg.reduce((a, i) => a + i.taxableValue, 0);
        runTax += pg.reduce((a, i) => a + i.cgstAmt + i.sgstAmt + i.igstAmt, 0);
        cumulativeSubtotals.push(runSub);
        cumulativeTax.push(runTax);
    }

    // ─── GST Grouped by Rate ───
    const cgstByRate: Record<number, number> = {};
    const sgstByRate: Record<number, number> = {};
    const igstByRate: Record<number, number> = {};
    items.forEach(i => {
        if (i.cgstRate > 0) cgstByRate[i.cgstRate] = (cgstByRate[i.cgstRate] || 0) + i.cgstAmt;
        if (i.sgstRate > 0) sgstByRate[i.sgstRate] = (sgstByRate[i.sgstRate] || 0) + i.sgstAmt;
        if (i.igstRate > 0) igstByRate[i.igstRate] = (igstByRate[i.igstRate] || 0) + i.igstAmt;
    });

    // ═══════════════════════════════════════════════════
    //  RENDER HELPERS
    // ═══════════════════════════════════════════════════

    const renderTableHeader = () => (
        <View style={s.tableHeaderRow}>
            <View style={{ ...s.tableHeaderCell, width: cw.sr }}><Text>SR{'\n'}No.</Text></View>
            <View style={{ ...s.tableHeaderCell, width: cw.desc, textAlign: 'left', alignItems: 'flex-start' }}><Text>ITEM DESCRIPTION</Text></View>
            <View style={{ ...s.tableHeaderCell, width: cw.hsn }}><Text>HSN/SAC</Text></View>
            <View style={{ ...s.tableHeaderCell, width: cw.qty }}>
                <Text>QTY</Text>
                <Text style={{ fontSize: 6, fontFamily: 'Helvetica' }}>(Unit)</Text>
            </View>
            {showRates && <View style={{ ...s.tableHeaderCell, width: cw.rate }}><Text>RATE</Text></View>}
            {showAmount && <View style={{ ...s.tableHeaderCell, width: cw.taxable }}><Text>TAXABLE{'\n'}VALUE</Text></View>}

            {showAmount && !isInterState && (
                <View style={{ ...s.nestedGstBlock, width: `${parseFloat(cw.cgstR) + parseFloat(cw.cgstA)}%` }}>
                    <View style={s.nestedGstTop}><Text style={{ color: '#fff', fontSize: 9, fontFamily: 'Helvetica-Bold' }}>CGST</Text></View>
                    <View style={s.nestedGstBottomList}>
                        <View style={s.nestedGstBottomCell}><Text style={{ color: '#fff', fontSize: 7, fontFamily: 'Helvetica-Bold' }}>RATE</Text></View>
                        <View style={{ ...s.nestedGstBottomCell, borderRightWidth: 0 }}><Text style={{ color: '#fff', fontSize: 7, fontFamily: 'Helvetica-Bold' }}>AMT.</Text></View>
                    </View>
                </View>
            )}
            {showAmount && !isInterState && (
                <View style={{ ...s.nestedGstBlock, width: `${parseFloat(cw.sgstR) + parseFloat(cw.sgstA)}%` }}>
                    <View style={s.nestedGstTop}><Text style={{ color: '#fff', fontSize: 9, fontFamily: 'Helvetica-Bold' }}>SGST</Text></View>
                    <View style={s.nestedGstBottomList}>
                        <View style={s.nestedGstBottomCell}><Text style={{ color: '#fff', fontSize: 7, fontFamily: 'Helvetica-Bold' }}>RATE</Text></View>
                        <View style={{ ...s.nestedGstBottomCell, borderRightWidth: 0 }}><Text style={{ color: '#fff', fontSize: 7, fontFamily: 'Helvetica-Bold' }}>AMT.</Text></View>
                    </View>
                </View>
            )}
            {showAmount && isInterState && (
                <View style={{ ...s.nestedGstBlock, width: `${parseFloat(cw.igstR) + parseFloat(cw.igstA)}%` }}>
                    <View style={s.nestedGstTop}><Text style={{ color: '#fff', fontSize: 9, fontFamily: 'Helvetica-Bold' }}>IGST</Text></View>
                    <View style={s.nestedGstBottomList}>
                        <View style={s.nestedGstBottomCell}><Text style={{ color: '#fff', fontSize: 7, fontFamily: 'Helvetica-Bold' }}>RATE</Text></View>
                        <View style={{ ...s.nestedGstBottomCell, borderRightWidth: 0 }}><Text style={{ color: '#fff', fontSize: 7, fontFamily: 'Helvetica-Bold' }}>AMT.</Text></View>
                    </View>
                </View>
            )}
        </View>
    );

    const renderItemRow = (item: InvoiceItemData) => (
        <View key={item.srNo} style={s.tableRow} wrap={false}>
            <View style={{ ...s.tableCell, width: cw.sr, textAlign: 'center' }}><Text>{item.srNo}</Text></View>
            <View style={{ ...s.tableCell, width: cw.desc, textAlign: 'left' }}>
                <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>{item.description}</Text>
                {item.meters.length > 1 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 }}>
                        {item.meters.map((m, i) => (
                            <Text key={i} style={s.meterBadge}>{m}</Text>
                        ))}
                    </View>
                )}
            </View>
            <View style={{ ...s.tableCell, width: cw.hsn, textAlign: 'right' }}><Text>{item.hsnCode}</Text></View>
            <View style={{ ...s.tableCell, width: cw.qty, textAlign: 'right' }}>
                {item.meters.length > 1 ? (
                    <View>
                        {item.meters.map((m, i) => (
                            <Text key={i} style={{ fontSize: 8, color: GREY }}>{m.toFixed(2)}</Text>
                        ))}
                        <View style={{ borderTopWidth: 0.5, borderTopColor: '#ccc', marginTop: 1, paddingTop: 1 }}>
                            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>
                                {item.qty.toFixed(2)}
                            </Text>
                            <Text style={{ fontSize: 7, color: LIGHT_GREY }}>{item.unit === 'KILOGRAMS' ? 'Kg' : 'Mtr'}</Text>
                        </View>
                    </View>
                ) : (
                    <View>
                        <Text>{item.qty.toFixed(2)}</Text>
                        <Text style={{ fontSize: 7, color: LIGHT_GREY }}>{item.unit === 'KILOGRAMS' ? 'Kg' : 'Mtr'}</Text>
                    </View>
                )}
            </View>
            {showRates && <View style={{ ...s.tableCell, width: cw.rate, textAlign: 'right' }}><Text>{fmtCurrency(item.pricePerItem)}</Text></View>}
            {showAmount && <View style={{ ...s.tableCell, width: cw.taxable, textAlign: 'right' }}><Text>{fmtCurrency(item.taxableValue)}</Text></View>}
            {showAmount && !isInterState && <View style={{ ...s.tableCell, width: cw.cgstR, textAlign: 'right' }}><Text style={{ color: item.cgstRate ? '#333' : '#bbb' }}>{item.cgstRate}%</Text></View>}
            {showAmount && !isInterState && <View style={{ ...s.tableCell, width: cw.cgstA, textAlign: 'right' }}><Text style={{ color: item.cgstAmt ? '#333' : '#bbb' }}>{fmtCurrency(item.cgstAmt)}</Text></View>}
            {showAmount && !isInterState && <View style={{ ...s.tableCell, width: cw.sgstR, textAlign: 'right' }}><Text style={{ color: item.sgstRate ? '#333' : '#bbb' }}>{item.sgstRate}%</Text></View>}
            {showAmount && !isInterState && <View style={{ ...s.tableCell, width: cw.sgstA, textAlign: 'right' }}><Text style={{ color: item.sgstAmt ? '#333' : '#bbb' }}>{fmtCurrency(item.sgstAmt)}</Text></View>}
            {showAmount && isInterState && <View style={{ ...s.tableCell, width: cw.igstR, textAlign: 'right' }}><Text style={{ color: item.igstRate ? '#333' : '#bbb' }}>{item.igstRate}%</Text></View>}
            {showAmount && isInterState && <View style={{ ...s.tableCell, width: cw.igstA, textAlign: 'right' }}><Text style={{ color: item.igstAmt ? '#333' : '#bbb' }}>{fmtCurrency(item.igstAmt)}</Text></View>}
        </View>
    );

    const renderEmptyRow = (key: string) => (
        <View key={key} style={s.emptyRow}>
            <View style={{ ...s.tableCell, width: cw.sr }}><Text> </Text></View>
            <View style={{ ...s.tableCell, width: cw.desc }}><Text> </Text></View>
            <View style={{ ...s.tableCell, width: cw.hsn }}><Text> </Text></View>
            <View style={{ ...s.tableCell, width: cw.qty }}><Text> </Text></View>
            {showRates && <View style={{ ...s.tableCell, width: cw.rate }}><Text> </Text></View>}
            {showAmount && <View style={{ ...s.tableCell, width: cw.taxable }}><Text> </Text></View>}
            {showAmount && !isInterState && <View style={{ ...s.tableCell, width: cw.cgstR }}><Text> </Text></View>}
            {showAmount && !isInterState && <View style={{ ...s.tableCell, width: cw.cgstA }}><Text> </Text></View>}
            {showAmount && !isInterState && <View style={{ ...s.tableCell, width: cw.sgstR }}><Text> </Text></View>}
            {showAmount && !isInterState && <View style={{ ...s.tableCell, width: cw.sgstA }}><Text> </Text></View>}
            {showAmount && isInterState && <View style={{ ...s.tableCell, width: cw.igstR }}><Text> </Text></View>}
            {showAmount && isInterState && <View style={{ ...s.tableCell, width: cw.igstA }}><Text> </Text></View>}
        </View>
    );

    // ─── Logo: use base64-prefetched image when available, else initial square ───
    const renderLogo = () => {
        if (profile.logo) {
            return (
                <Image
                    src={profile.logo}
                    style={s.logoImage}
                />
            );
        }
        return (
            <View style={s.logoFallback}>
                <Text style={s.logoText}>{(profile.businessName || 'T')[0]}</Text>
            </View>
        );
    };

    const renderPageHeader = (pageNum: number) => (
        <View>
            {/* ─── HEADER ─── */}
            <View style={s.headerRow}>
                {renderLogo()}
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.headerTitle}>{cfg.title || 'TAX INVOICE'}</Text>
                    <Text style={s.headerSubtitle}>Invoice# - {invoice?.invoiceNumber || 'INV-001'}</Text>
                    {totalPages > 1 && (
                        <Text style={s.pageNumber}>Page {pageNum} of {totalPages}</Text>
                    )}
                </View>
            </View>

            {/* ─── COMPANY INFO ─── */}
            <Text style={s.companyName}>Company Name: {profile.businessName || '—'}</Text>
            <Text style={s.meta}>Address: {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ') || '—'}</Text>
            {(profile.gstin || addr.country === 'India') && <Text style={s.meta}>GSTIN: {profile.gstin || '—'}</Text>}
            <Text style={s.meta}>Phone: {(profile.phoneNumbers || [])[0] || '—'}</Text>

            <View style={s.separator} />

            {/* ─── BILL TO + META ─── */}
            <View style={s.billToRow}>
                <View style={s.billToLeft}>
                    <Text style={{ ...s.meta, fontFamily: 'Helvetica-Bold' }}>Bill To:</Text>
                    <Text style={{ ...s.meta, fontFamily: 'Helvetica-Bold', fontSize: 11 }}>{party.name || '—'}</Text>
                    <Text style={s.meta}>
                        {[partyAddr.line1, partyAddr.line2, partyAddr.city, partyAddr.state, partyAddr.pincode].filter(Boolean).join(', ') || '—'}
                    </Text>
                    <Text style={s.meta}>Phone: {party.phone || '—'}</Text>
                    <Text style={s.meta}>Place of Supply: {partyAddr.state || '—'}</Text>
                </View>
                <View style={s.billToRight}>
                    {[
                        ['Invoice Date:', fmtDate(invoice?.invoiceDate)],
                        ['Order Number:', invoice?.orderNumber || '—'],
                        ...(invoice?.dueDate ? [['Due Date:', fmtDate(invoice?.dueDate)]] : []),
                        ['GSTIN:', party.gstin || '—'],
                        ...(invoice?.brokerSnapshot ? [['Broker:', invoice.brokerSnapshot.name]] : []),
                    ].map(([label, value], idx) => (
                        <View key={idx} style={s.billToMetaRow}>
                            <Text style={s.billToMetaLabel}>{label}</Text>
                            <Text style={s.billToMetaValue}>{value}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

    // ═══════════════════════════════════════════════════
    //  MAIN RENDER
    // ═══════════════════════════════════════════════════
    return (
        <Document>
            {pages.map((pageItems, pageIdx) => {
                const isLastPage = pageIdx === pages.length - 1;
                const pageNum = pageIdx + 1;

                const pageSubtotal = pageItems.reduce((a, i) => a + i.taxableValue, 0);
                const pageTax = pageItems.reduce((a, i) => a + i.cgstAmt + i.sgstAmt + i.igstAmt, 0);

                const bfSubtotal = pageIdx > 0 ? cumulativeSubtotals[pageIdx - 1] : 0;
                const bfTax = pageIdx > 0 ? cumulativeTax[pageIdx - 1] : 0;

                const pageEntries = pageItems.reduce((a, i) => a + Math.max(1, i.meters.length), 0);
                const pageQty = pageItems.reduce((a, i) => a + i.qty, 0);

                const emptyRowCount = isLastPage ? Math.max(0, MIN_ROWS - pageItems.length) : 0;

                return (
                    <Page key={pageIdx} size={paperSize} style={isA5 ? s.pageA5 : s.page}>
                        {renderPageHeader(pageNum)}

                        {/* ─── ITEMS TABLE ─── */}
                        <View style={s.table}>
                            {renderTableHeader()}

                            {/* Brought Forward (pages 2+) */}
                            {pageIdx > 0 && showAmount && (
                                <View style={s.carriedForwardRow}>
                                    <View style={{ ...s.carriedForwardCell, width: '70%', textAlign: 'right' }}>
                                        <Text>Brought Forward from Page {pageIdx}:</Text>
                                    </View>
                                    <View style={{ ...s.carriedForwardCell, width: '30%', textAlign: 'right' }}>
                                        <Text><Text style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>₹</Text> {fmtCurrency(bfSubtotal + bfTax)}</Text>
                                    </View>
                                </View>
                            )}

                            {pageItems.map(renderItemRow)}

                            {Array.from({ length: emptyRowCount }).map((_, i) => renderEmptyRow(`e-${pageIdx}-${i}`))}
                        </View>

                        {/* ─── TOTALS ─── */}
                        <View style={s.totalsRow}>
                            <View style={s.totalsLeft}>
                                {isLastPage ? (
                                    <View>
                                        <Text style={{ ...s.meta, marginTop: 8 }}>
                                            <Text style={s.metaLabel}>Total Entries: </Text>{items.length}
                                        </Text>
                                        <Text style={s.meta}>
                                            <Text style={s.metaLabel}>Total Quantity: </Text>{items.reduce((a, i) => a + i.qty, 0).toFixed(2)}
                                        </Text>
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={{ ...s.meta, marginTop: 8 }}>
                                            <Text style={s.metaLabel}>Page {pageNum} Entries: </Text>{pageEntries}
                                        </Text>
                                        <Text style={s.meta}>
                                            <Text style={s.metaLabel}>Page {pageNum} Quantity: </Text>{pageQty.toFixed(2)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View style={s.totalsRight}>
                                {showAmount ? (
                                    <View>
                                        {/* ── Non-last page totals ── */}
                                        {!isLastPage && (
                                            <View>
                                                <View style={s.totalLine}>
                                                    <Text style={{ fontSize: 9 }}>Page {pageNum} Sub Total:</Text>
                                                    <Text style={{ fontSize: 9 }}>{fmtCurrency(pageSubtotal)}</Text>
                                                </View>
                                                {pageTax > 0 && (
                                                    <View style={s.totalLine}>
                                                        <Text style={{ fontSize: 9 }}>Page {pageNum} Tax:</Text>
                                                        <Text style={{ fontSize: 9 }}>{fmtCurrency(pageTax)}</Text>
                                                    </View>
                                                )}
                                                <View style={s.grandTotalLine}>
                                                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>Carried Forward:</Text>
                                                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>
                                                        <Text style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>₹</Text> {fmtCurrency(cumulativeSubtotals[pageIdx] + cumulativeTax[pageIdx])}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        {/* ── Last page: full totals ── */}
                                        {isLastPage && (
                                            <View>
                                                {totalPages > 1 && (
                                                    <View style={{ ...s.totalLine, backgroundColor: GREEN_LIGHT }}>
                                                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: GREEN }}>
                                                            Brought Forward (Page 1{pageIdx > 1 ? `-${pageIdx}` : ''}):
                                                        </Text>
                                                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: GREEN }}>
                                                            <Text style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>₹</Text> {fmtCurrency(bfSubtotal + bfTax)}
                                                        </Text>
                                                    </View>
                                                )}
                                                <View style={s.totalLine}>
                                                    <Text style={{ fontSize: 9 }}>Sub Total:</Text>
                                                    <Text style={{ fontSize: 9 }}>{fmtCurrency(subTotal)}</Text>
                                                </View>
                                                {/* GST grouped by rate */}
                                                {Object.entries(cgstByRate).map(([rate, amt]) => (
                                                    <View key={`cgst-${rate}`} style={s.totalLine}>
                                                        <Text style={{ fontSize: 9 }}>CGST @{rate}%:</Text>
                                                        <Text style={{ fontSize: 9 }}>{fmtCurrency(amt)}</Text>
                                                    </View>
                                                ))}
                                                {Object.entries(sgstByRate).map(([rate, amt]) => (
                                                    <View key={`sgst-${rate}`} style={s.totalLine}>
                                                        <Text style={{ fontSize: 9 }}>SGST @{rate}%:</Text>
                                                        <Text style={{ fontSize: 9 }}>{fmtCurrency(amt)}</Text>
                                                    </View>
                                                ))}
                                                {Object.entries(igstByRate).map(([rate, amt]) => (
                                                    <View key={`igst-${rate}`} style={s.totalLine}>
                                                        <Text style={{ fontSize: 9 }}>IGST @{rate}%:</Text>
                                                        <Text style={{ fontSize: 9 }}>{fmtCurrency(amt)}</Text>
                                                    </View>
                                                ))}
                                                {shipping > 0 && (
                                                    <View style={s.totalLine}>
                                                        <Text style={{ fontSize: 9 }}>Shipping Charges:</Text>
                                                        <Text style={{ fontSize: 9 }}>{fmtCurrency(shipping)}</Text>
                                                    </View>
                                                )}
                                                {adjustment !== 0 && (
                                                    <View style={s.totalLine}>
                                                        <Text style={{ fontSize: 9 }}>
                                                            {typeof invoice?.adjustment === 'object' ? invoice.adjustment.label : 'Adjustment'}:
                                                        </Text>
                                                        <Text style={{ fontSize: 9 }}>{adjustment >= 0 ? '+' : ''}{fmtCurrency(adjustment)}</Text>
                                                    </View>
                                                )}
                                                {roundedOff !== 0 && (
                                                    <View style={s.totalLine}>
                                                        <Text style={{ fontSize: 9 }}>Rounded Off:</Text>
                                                        <Text style={{ fontSize: 9 }}>{roundedOff >= 0 ? '+' : ''}{roundedOff.toFixed(2)}</Text>
                                                    </View>
                                                )}
                                                <View style={s.grandTotalLine}>
                                                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 12 }}>Grand Total:</Text>
                                                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 12 }}>
                                                        <Text style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>₹</Text> {fmtCurrency(grandTotal)}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <Text style={{ ...s.meta, textAlign: 'right', color: LIGHT_GREY }}>Amount details hidden per settings</Text>
                                )}
                            </View>
                        </View>

                        {/* ─── AMOUNT IN WORDS (last page) ─── */}
                        {isLastPage && showAmount && (
                            <View style={{ flexDirection: 'row', marginTop: 8, paddingVertical: 5, borderTopWidth: 0.5, borderTopColor: '#eee' }}>
                                <Text style={{ ...s.meta, fontFamily: 'Helvetica-Bold', color: GREY }}>Amount in Words: </Text>
                                <Text style={{ ...s.meta, color: GREY }}>{numberToWords(grandTotal)}</Text>
                            </View>
                        )}

                        {/* ─── NOTES + SIGNATURE (last page) ─── */}
                        {isLastPage && (
                            <View style={s.notesRow}>
                                <View style={s.notesLeft}>
                                    <Text style={s.metaLabel}>Customer Notes:</Text>
                                    <Text style={{ ...s.meta, color: '#666', marginTop: 4 }}>{invoice?.notes || 'Thank you for your business!'}</Text>
                                    {(invoice?.termsAndConditions || cfg.defaultTerms) && (
                                        <Text style={{ ...s.meta, color: LIGHT_GREY, marginTop: 6, fontSize: 8 }}>
                                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Terms:</Text> {invoice?.termsAndConditions || cfg.defaultTerms}
                                        </Text>
                                    )}
                                </View>
                                <View style={s.notesRight}>
                                    {cfg.signatureUrl ? (
                                        <Image src={cfg.signatureUrl} style={s.signatureImage} />
                                    ) : (
                                        <View style={s.signatureLine} />
                                    )}
                                    <Text style={{ ...s.meta, fontFamily: 'Helvetica-Bold' }}>Authorised Signatory</Text>
                                    <Text style={{ ...s.meta, color: LIGHT_GREY }}>For {profile.businessName || '—'}</Text>
                                </View>
                            </View>
                        )}

                        {/* ─── CONTINUED (non-last pages) ─── */}
                        {!isLastPage && (
                            <View style={s.continuedFooter}>
                                <Text style={s.continuedText}>— Continued on next page —</Text>
                            </View>
                        )}

                        {/* ─── FOOTER (last page) ─── */}
                        {isLastPage && (
                            <View style={s.footer}>
                                <Text style={s.footerText}>
                                    This is a computer generated invoice and does not require physical signature. • Generated by TextilePro
                                </Text>
                            </View>
                        )}
                    </Page>
                );
            })}
        </Document>
    );
}
