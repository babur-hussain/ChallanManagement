import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';

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

// ——— Colors ———
const ORANGE = '#E69138';
const ORANGE_BORDER = '#c47a2c';
const GREY = '#555';
const LIGHT_GREY = '#888';
const BORDER = '#ddd';

// ——— Styles ———
const s = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#222',
        padding: '15mm',
        backgroundColor: '#fff',
    },
    pageA5: {
        fontFamily: 'Helvetica',
        fontSize: 8.5,
        color: '#222',
        padding: '10mm',
        backgroundColor: '#fff',
    },

    // HEADER
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    logo: {
        width: 50, height: 50, borderRadius: 6,
        backgroundColor: ORANGE,
        justifyContent: 'center', alignItems: 'center',
    },
    logoText: { color: '#fff', fontSize: 22, fontFamily: 'Helvetica-Bold' },
    headerTitle: { fontFamily: 'Helvetica-Bold', fontSize: 22, textAlign: 'right', color: '#222' },
    headerSubtitle: { fontSize: 11, textAlign: 'right', color: GREY, marginTop: 3 },

    // Company info
    companyName: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
    meta: { fontSize: 9, color: '#333', marginBottom: 2 },
    metaLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9 },

    // Separator
    separator: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginVertical: 8 },

    // Meta row
    metaRow: { flexDirection: 'row', marginBottom: 6 },
    metaCol: { width: '33%' },

    // Bill-to section
    billToRow: { flexDirection: 'row', marginBottom: 12 },
    billToLeft: { width: '50%', paddingRight: 15 },
    billToRight: { width: '50%' },
    billToMetaRow: { flexDirection: 'row', marginBottom: 2 },
    billToMetaLabel: { width: '40%', fontSize: 9, color: '#333' },
    billToMetaValue: { width: '60%', fontSize: 9, color: '#333' },

    // Items table
    table: { width: '100%', marginBottom: 0 },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: ORANGE,
    },
    tableHeaderCell: {
        color: '#fff',
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        textTransform: 'uppercase',
        textAlign: 'center',
        paddingVertical: 5,
        paddingHorizontal: 2,
        borderWidth: 0.5,
        borderColor: ORANGE_BORDER,
    },
    tableRow: { flexDirection: 'row', minHeight: 20 },
    tableCell: {
        fontSize: 9,
        paddingVertical: 4,
        paddingHorizontal: 3,
        borderBottomWidth: 0.5,
        borderBottomColor: BORDER,
        borderRightWidth: 0.5,
        borderRightColor: '#eee',
        justifyContent: 'center',
    },
    emptyRow: { flexDirection: 'row', minHeight: 18 },

    // Meter badge
    meterBadge: {
        backgroundColor: '#FFF3E0',
        color: '#E65100',
        fontSize: 7,
        paddingVertical: 1,
        paddingHorizontal: 3,
        borderRadius: 2,
        borderWidth: 0.5,
        borderColor: '#FFE0B2',
        marginRight: 2,
        marginBottom: 1,
    },

    // Totals
    totalsRow: { flexDirection: 'row', marginTop: 0 },
    totalsLeft: { width: '60%', paddingRight: 15 },
    totalsRight: { width: '40%' },
    totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, paddingHorizontal: 6 },
    grandTotalLine: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 5, paddingHorizontal: 6,
        borderTopWidth: 2, borderTopColor: ORANGE,
        backgroundColor: '#f5f5f5',
    },

    // Footer
    notesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#ccc' },
    notesLeft: { width: '55%' },
    notesRight: { width: '35%', alignItems: 'center' },
    signatureLine: { borderBottomWidth: 1, borderBottomColor: '#333', width: '100%', marginBottom: 6, paddingBottom: 35 },
    footer: { marginTop: 14, textAlign: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: '#eee' },
    footerText: { fontSize: 7, color: '#999', textAlign: 'center' },
});

// ——— Column widths (percentages) ———
const COL_W = {
    sr: '5%', desc: '20%', hsn: '8%', qty: '6%', rate: '8%', taxable: '10%',
    cgstR: '7%', cgstA: '7%', sgstR: '7%', sgstA: '7%', igstR: '7%', igstA: '7%',
};
const COL_W_NO_RATE = { ...COL_W, desc: '28%' };

// ——— Interfaces ———
interface ChallanPdfProps {
    challan: any;
    businessProfile?: any;
    challanSettings?: any;
}

interface ChallanItemData {
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

// ——— Component ———
export function ChallanPdfDocument({ challan, businessProfile, challanSettings }: ChallanPdfProps) {
    const profile = businessProfile || {};
    const party = challan?.partySnapshot || {};
    const addr = profile.address || {};
    const partyAddr = party.address || {};
    const cfg = challanSettings || {};
    const showRates = cfg.showRates ?? true;
    const showAmount = cfg.showAmount ?? true;
    const defaultTerms = cfg.defaultTerms || '';
    const defaultRemarks = cfg.defaultRemarks || 'Thank you for your business!';
    const paperSize = challan?.paperSize === 'A5' ? 'A5' : 'A4';
    const isA5 = paperSize === 'A5';

    const cw = showRates ? COL_W : COL_W_NO_RATE;

    // Build items
    const items: ChallanItemData[] = (challan?.items || []).map((item: any, idx: number) => {
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

    const MIN_ROWS = 8;
    const emptyRows = Math.max(0, MIN_ROWS - items.length);

    const subTotal = items.reduce((acc, i) => acc + i.taxableValue, 0);
    const totalCgst = items.reduce((acc, i) => acc + i.cgstAmt, 0);
    const totalSgst = items.reduce((acc, i) => acc + i.sgstAmt, 0);
    const totalIgst = items.reduce((acc, i) => acc + i.igstAmt, 0);
    const totalTax = totalCgst + totalSgst + totalIgst;
    const grandTotalRaw = subTotal + totalTax;
    const grandTotal = Math.round(grandTotalRaw);
    const roundedOff = grandTotal - grandTotalRaw;

    return (
        <Document>
            <Page size={paperSize} style={isA5 ? s.pageA5 : s.page}>

                {/* ═══════ 1. HEADER ═══════ */}
                <View style={s.headerRow}>
                    <View style={s.logo}>
                        <Text style={s.logoText}>{(profile.businessName || 'T')[0]}</Text>
                    </View>
                    <View>
                        <Text style={s.headerTitle}>DELIVERY CHALLAN</Text>
                        <Text style={s.headerSubtitle}>Delivery Challan# - {challan?.challanNumber || 'DC-001'}</Text>
                    </View>
                </View>

                {/* ═══════ 2. COMPANY INFO ═══════ */}
                <Text style={s.companyName}>Company Name: {profile.businessName || '—'}</Text>
                <Text style={s.meta}>Address: {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ') || '—'}</Text>
                {(profile.gstin || addr.country === 'India') && <Text style={s.meta}>GSTIN: {profile.gstin || '—'}</Text>}
                <Text style={s.meta}>Phone: {(profile.phoneNumbers || [])[0] || '—'}</Text>

                <View style={s.separator} />

                {/* ═══════ 3. META ROW ═══════ */}
                <View style={s.metaRow}>
                    <View style={s.metaCol}>
                        <Text style={s.metaLabel}>Delivery Challan #</Text>
                        <Text style={s.meta}>{challan?.challanNumber || '—'}</Text>
                    </View>
                    <View style={s.metaCol}>
                        <Text style={s.metaLabel}>Order Date</Text>
                        <Text style={s.meta}>{fmtDate(challan?.date)}</Text>
                    </View>
                    <View style={s.metaCol}>
                        <Text style={s.metaLabel}>Dispatch Date</Text>
                        <Text style={s.meta}>{fmtDate(challan?.date)}</Text>
                    </View>
                </View>

                <View style={s.separator} />

                {/* ═══════ 4. BILL-TO + RIGHT META ═══════ */}
                <View style={s.billToRow}>
                    <View style={s.billToLeft}>
                        <Text style={{ ...s.meta, fontFamily: 'Helvetica-Bold' }}>Bill To:</Text>
                        <Text style={{ ...s.meta, fontFamily: 'Helvetica-Bold', fontSize: 10 }}>{party.name || '—'}</Text>
                        <Text style={s.meta}>
                            {[partyAddr.line1, partyAddr.line2, partyAddr.city, partyAddr.state, partyAddr.pincode].filter(Boolean).join(', ') || '—'}
                        </Text>
                        <Text style={s.meta}>Phone: {party.phone || '—'}</Text>
                        <Text style={s.meta}>Place of Supply: {partyAddr.state || '—'}</Text>
                    </View>
                    <View style={s.billToRight}>
                        {/* Right meta table */}
                        {[
                            ['Challan Date:', fmtDate(challan?.date)],
                            ['Ref #:', challan?.challanNumber || '—'],
                            ['Challan Type:', 'Supply'],
                            ['GSTIN:', party.gstin || '—'],
                            ...(challan?.vehicleNumber ? [['Vehicle No:', challan.vehicleNumber]] : []),
                            ...(challan?.brokerSnapshot ? [['Broker:', challan.brokerSnapshot.name]] : []),
                        ].map(([label, value], idx) => (
                            <View key={idx} style={s.billToMetaRow}>
                                <Text style={s.billToMetaLabel}>{label}</Text>
                                <Text style={s.billToMetaValue}>{value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ═══════ 5. ITEMS TABLE ═══════ */}
                <View style={s.table}>
                    {/* Header row */}
                    <View style={s.tableHeaderRow}>
                        <View style={{ ...s.tableHeaderCell, width: cw.sr }}><Text>SR No.</Text></View>
                        <View style={{ ...s.tableHeaderCell, width: cw.desc }}><Text>ITEM DESCRIPTION</Text></View>
                        <View style={{ ...s.tableHeaderCell, width: cw.hsn }}><Text>HSN/SAC</Text></View>
                        <View style={{ ...s.tableHeaderCell, width: cw.qty }}><Text>QTY{'\n'}(Unit)</Text></View>
                        {showRates && <View style={{ ...s.tableHeaderCell, width: cw.rate }}><Text>RATE</Text></View>}
                        {showAmount && <View style={{ ...s.tableHeaderCell, width: cw.taxable }}><Text>TAXABLE{'\n'}VALUE</Text></View>}
                        {showAmount && <View style={{ ...s.tableHeaderCell, width: cw.cgstR }}><Text>CGST{'\n'}RATE</Text></View>}
                        {showAmount && <View style={{ ...s.tableHeaderCell, width: cw.cgstA }}><Text>CGST{'\n'}AMT.</Text></View>}
                        {showAmount && <View style={{ ...s.tableHeaderCell, width: cw.sgstR }}><Text>SGST{'\n'}RATE</Text></View>}
                        {showAmount && <View style={{ ...s.tableHeaderCell, width: cw.sgstA }}><Text>SGST{'\n'}AMT.</Text></View>}
                        {showAmount && <View style={{ ...s.tableHeaderCell, width: cw.igstR }}><Text>IGST{'\n'}RATE</Text></View>}
                        {showAmount && <View style={{ ...s.tableHeaderCell, width: cw.igstA }}><Text>IGST{'\n'}AMT.</Text></View>}
                    </View>

                    {/* Data rows */}
                    {items.map((item) => (
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
                                                {item.qty.toFixed(2)} <Text style={{ fontSize: 7, color: LIGHT_GREY }}>{item.unit === 'KILOGRAMS' ? 'Kg' : 'Mtr'}</Text>
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <Text>{item.qty.toFixed(2)} <Text style={{ fontSize: 7, color: LIGHT_GREY }}>{item.unit === 'KILOGRAMS' ? 'Kg' : 'Mtr'}</Text></Text>
                                )}
                            </View>
                            {showRates && <View style={{ ...s.tableCell, width: cw.rate, textAlign: 'right' }}><Text>{fmtCurrency(item.pricePerItem)}</Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.taxable, textAlign: 'right' }}><Text>{fmtCurrency(item.taxableValue)}</Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.cgstR, textAlign: 'right' }}><Text style={{ color: item.cgstRate ? '#333' : '#bbb' }}>{item.cgstRate}%</Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.cgstA, textAlign: 'right' }}><Text style={{ color: item.cgstAmt ? '#333' : '#bbb' }}>{fmtCurrency(item.cgstAmt)}</Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.sgstR, textAlign: 'right' }}><Text style={{ color: item.sgstRate ? '#333' : '#bbb' }}>{item.sgstRate}%</Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.sgstA, textAlign: 'right' }}><Text style={{ color: item.sgstAmt ? '#333' : '#bbb' }}>{fmtCurrency(item.sgstAmt)}</Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.igstR, textAlign: 'right' }}><Text style={{ color: item.igstRate ? '#333' : '#bbb' }}>{item.igstRate}%</Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.igstA, textAlign: 'right' }}><Text style={{ color: item.igstAmt ? '#333' : '#bbb' }}>{fmtCurrency(item.igstAmt)}</Text></View>}
                        </View>
                    ))}

                    {/* Empty rows */}
                    {Array.from({ length: emptyRows }).map((_, i) => (
                        <View key={`e-${i}`} style={s.emptyRow}>
                            <View style={{ ...s.tableCell, width: cw.sr }}><Text> </Text></View>
                            <View style={{ ...s.tableCell, width: cw.desc }}><Text> </Text></View>
                            <View style={{ ...s.tableCell, width: cw.hsn }}><Text> </Text></View>
                            <View style={{ ...s.tableCell, width: cw.qty }}><Text> </Text></View>
                            {showRates && <View style={{ ...s.tableCell, width: cw.rate }}><Text> </Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.taxable }}><Text> </Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.cgstR }}><Text> </Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.cgstA }}><Text> </Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.sgstR }}><Text> </Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.sgstA }}><Text> </Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.igstR }}><Text> </Text></View>}
                            {showAmount && <View style={{ ...s.tableCell, width: cw.igstA }}><Text> </Text></View>}
                        </View>
                    ))}
                </View>

                {/* ═══════ 6. TOTALS ═══════ */}
                <View style={s.totalsRow}>
                    <View style={s.totalsLeft}>
                        <Text style={{ ...s.meta, marginTop: 6 }}>
                            <Text style={s.metaLabel}>Total Entries: </Text>{challan?.totalRolls || 0}
                        </Text>
                        <Text style={s.meta}>
                            <Text style={s.metaLabel}>Total Quantity: </Text>{challan?.totalMeters?.toFixed(2) || '0.00'}
                        </Text>
                    </View>
                    <View style={s.totalsRight}>
                        {showAmount ? (
                            <View>
                                <View style={s.totalLine}>
                                    <Text style={{ fontSize: 9 }}>Sub Total:</Text>
                                    <Text style={{ fontSize: 9 }}>{fmtCurrency(subTotal)}</Text>
                                </View>
                                {totalCgst > 0 && (
                                    <View style={s.totalLine}>
                                        <Text style={{ fontSize: 9 }}>CGST ({items.find(i => i.cgstRate > 0)?.cgstRate || 0}%):</Text>
                                        <Text style={{ fontSize: 9 }}>{fmtCurrency(totalCgst)}</Text>
                                    </View>
                                )}
                                {totalSgst > 0 && (
                                    <View style={s.totalLine}>
                                        <Text style={{ fontSize: 9 }}>SGST ({items.find(i => i.sgstRate > 0)?.sgstRate || 0}%):</Text>
                                        <Text style={{ fontSize: 9 }}>{fmtCurrency(totalSgst)}</Text>
                                    </View>
                                )}
                                {totalIgst > 0 && (
                                    <View style={s.totalLine}>
                                        <Text style={{ fontSize: 9 }}>IGST ({items.find(i => i.igstRate > 0)?.igstRate || 0}%):</Text>
                                        <Text style={{ fontSize: 9 }}>{fmtCurrency(totalIgst)}</Text>
                                    </View>
                                )}
                                <View style={s.totalLine}>
                                    <Text style={{ fontSize: 9 }}>Total Tax:</Text>
                                    <Text style={{ fontSize: 9 }}>{fmtCurrency(totalTax)}</Text>
                                </View>
                                <View style={s.totalLine}>
                                    <Text style={{ fontSize: 9 }}>Rounded Off:</Text>
                                    <Text style={{ fontSize: 9 }}>{roundedOff >= 0 ? '+' : ''}{roundedOff.toFixed(2)}</Text>
                                </View>
                                <View style={s.grandTotalLine}>
                                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11 }}>Grand Total:</Text>
                                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11 }}>
                                        <Text style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>₹</Text> {fmtCurrency(grandTotal)}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={{ ...s.meta, textAlign: 'right', color: LIGHT_GREY }}>Amount details hidden per settings</Text>
                        )}
                    </View>
                </View>

                {/* ═══════ 7. AMOUNT IN WORDS ═══════ */}
                {showAmount && (
                    <View style={{ flexDirection: 'row', marginTop: 6, paddingVertical: 4, borderTopWidth: 0.5, borderTopColor: '#eee' }}>
                        <Text style={{ ...s.meta, ...s.metaLabel, color: GREY }}>Amount in Words: </Text>
                        <Text style={{ ...s.meta, color: GREY }}>{numberToWords(grandTotal)}</Text>
                    </View>
                )}

                {/* ═══════ 8. NOTES + SIGNATURE ═══════ */}
                <View style={s.notesRow}>
                    <View style={s.notesLeft}>
                        <Text style={s.metaLabel}>Notes:</Text>
                        <Text style={{ ...s.meta, color: '#666', marginTop: 3 }}>{challan?.remarks || defaultRemarks}</Text>
                        {defaultTerms ? <Text style={{ ...s.meta, color: LIGHT_GREY, marginTop: 4, fontSize: 8 }}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Terms:</Text> {defaultTerms}</Text> : null}
                    </View>
                    <View style={s.notesRight}>
                        <View style={s.signatureLine} />
                        <Text style={{ ...s.meta, fontFamily: 'Helvetica-Bold' }}>Authorised Signatory</Text>
                        <Text style={{ ...s.meta, color: LIGHT_GREY }}>For {profile.businessName || '—'}</Text>
                    </View>
                </View>

                {/* ═══════ 9. FOOTER ═══════ */}
                <View style={s.footer}>
                    <Text style={s.footerText}>
                        This is a computer generated challan and does not require physical signature. • Generated by TextilePro
                    </Text>
                </View>

            </Page>
        </Document>
    );
}
