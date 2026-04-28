import React, { useState, useMemo, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, SafeAreaView, Dimensions
} from 'react-native';
import { useInvoice, useUpdateInvoice, useInvoicePreview } from '../hooks/api/useInvoices';
import { useParties, useQuickSearchParties } from '../hooks/api/useParties';
import { useItems } from '../hooks/api/useItems';
import { useBrokers } from '../hooks/api/useBrokers';
import { useSettingsData } from '../hooks/api/useSettings';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';
import { SearchablePicker, PickerItem } from '../components/SearchablePicker';
import WebView from 'react-native-webview';

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    React.useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const PREVIEW_WIDTH = SCREEN_WIDTH - (spacing.lg * 2);
const PREVIEW_HEIGHT = PREVIEW_WIDTH * 1.414;

export function EditInvoiceScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { data: invoice, isLoading: isLoadingInvoice } = useInvoice(id);
    const updateMutation = useUpdateInvoice();
    const previewMutation = useInvoicePreview();

    const [selectedParty, setSelectedParty] = useState<any>(null);
    const [lineItems, setLineItems] = useState<any[]>([]);
    const [invoiceDate, setInvoiceDate] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');
    const [termsAndConditions, setTermsAndConditions] = useState('');
    const [adjustmentAmount, setAdjustmentAmount] = useState('0');
    const [roundOff, setRoundOff] = useState('0');
    const [showPreview, setShowPreview] = useState(false);
    const [htmlContent, setHtmlContent] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [showPartyPicker, setShowPartyPicker] = useState(false);
    const [activeItemPickerIndex, setActiveItemPickerIndex] = useState<number | null>(null);

    const { data: itemsData } = useItems({ limit: 200 });
    const { data: partiesData } = useParties({ limit: 100 });
    const { data: settingsData } = useSettingsData();

    const allItems = (itemsData as any)?.data || [];
    const allParties: any[] = (partiesData as any)?.data?.data || (partiesData as any)?.data || [];

    const showRates = (settingsData as any)?.invoices?.showRates ?? true;
    const showAmount = (settingsData as any)?.invoices?.showAmount ?? true;

    // Pre-fill from existing invoice
    useEffect(() => {
        if (invoice && !loaded) {
            setSelectedParty(invoice.partySnapshot ? { _id: (invoice as any).partyId, ...invoice.partySnapshot } : null);
            setInvoiceDate(invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : '');
            setReferenceNumber((invoice as any).orderNumber || '');
            setCustomerNotes(invoice.notes || '');
            setTermsAndConditions(invoice.termsAndConditions || '');
            setAdjustmentAmount(String((invoice as any).adjustment || 0));
            setRoundOff(String((invoice as any).roundOff || 0));

            if (invoice.items && invoice.items.length > 0) {
                setLineItems(invoice.items.map((item: any) => ({
                    itemId: item.itemId || '',
                    itemName: item.itemName || '',
                    rollsText: String(item.quantity || 0),
                    meters: [item.quantity || 0],
                    totalMeters: item.quantity || 0,
                    ratePerMeter: item.ratePerUnit || 0,
                    amount: (item.quantity || 0) * (item.ratePerUnit || 0),
                    discount: item.discount || 0,
                    discountType: item.discountType || 'PERCENTAGE',
                    taxRate: item.gstRate || item.cgstRate ? (item.cgstRate || 0) * 2 : 5,
                    hsnCode: item.hsnCode || '',
                    itemCode: item.itemCode || '',
                    unit: item.unit || 'METERS',
                })));
            }
            setLoaded(true);
        }
    }, [invoice, loaded]);

    const partyPickerItems: PickerItem[] = useMemo(() =>
        allParties.map((p: any) => ({ id: p._id || p.id, label: p.name, sublabel: `${p.shortCode || ''} • ${p.address?.city || p.city || ''}` })),
        [allParties]);

    const itemPickerItems: PickerItem[] = useMemo(() =>
        allItems.map((i: any) => ({ id: i._id || i.id, label: i.name, sublabel: `${i.shortCode || ''} • ₹${i.defaultRate || 0}` })),
        [allItems]);

    const addEmptyLineItem = () => {
        setLineItems(prev => [...prev, {
            itemId: '', itemName: '', rollsText: '', meters: [], totalMeters: 0,
            ratePerMeter: 0, amount: 0, discount: 0, discountType: 'PERCENTAGE',
            taxRate: 0, hsnCode: '', itemCode: '', unit: 'METERS',
        }]);
    };

    const removeLineItem = (index: number) => setLineItems(prev => prev.filter((_, i) => i !== index));

    const updateLineItem = (index: number, key: string, value: any) => {
        setLineItems(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], [key]: value };
            if (key === 'rollsText') {
                const meterStrings = String(value).split(/[\s,]+/).filter(Boolean);
                const meters = meterStrings.map(m => parseFloat(m)).filter(m => !isNaN(m));
                newItems[index].meters = meters;
                newItems[index].totalMeters = meters.reduce((a, b) => a + b, 0);
                newItems[index].amount = newItems[index].totalMeters * (newItems[index].ratePerMeter || 0);
            }
            if (key === 'ratePerMeter') {
                newItems[index].amount = (newItems[index].totalMeters || 0) * (parseFloat(value) || 0);
            }
            return newItems;
        });
    };

    const handleSelectItem = (pickerItem: PickerItem, index: number) => {
        const catalogItem = allItems.find((it: any) => (it._id || it.id) === pickerItem.id);
        if (catalogItem) {
            setLineItems(prev => {
                const newItems = [...prev];
                newItems[index] = {
                    ...newItems[index],
                    itemId: catalogItem._id || catalogItem.id,
                    itemName: catalogItem.name,
                    itemCode: catalogItem.shortCode || catalogItem.code,
                    hsnCode: catalogItem.hsnCode || '',
                    ratePerMeter: catalogItem.defaultRate || newItems[index].ratePerMeter || 0,
                    taxRate: catalogItem.gstRate ?? 5,
                    unit: catalogItem.unit || 'METERS',
                    amount: (newItems[index].totalMeters || 0) * (catalogItem.defaultRate || newItems[index].ratePerMeter || 0),
                };
                return newItems;
            });
        }
    };

    const totalEntries = lineItems.reduce((s, i) => s + (i.meters?.length || 0), 0);
    const totalMeters = lineItems.reduce((s, i) => s + (i.totalMeters || 0), 0);
    const subTotal = lineItems.reduce((s, i) => s + (i.amount || 0), 0);
    const totalDiscount = lineItems.reduce((s, i) => {
        const amt = (i.totalMeters || 0) * (i.ratePerMeter || 0);
        return s + (i.discountType === 'PERCENTAGE' ? amt * ((i.discount || 0) / 100) : (i.discount || 0));
    }, 0);
    const totalTax = lineItems.reduce((s, i) => {
        const amt = (i.totalMeters || 0) * (i.ratePerMeter || 0);
        const disc = i.discountType === 'PERCENTAGE' ? amt * ((i.discount || 0) / 100) : (i.discount || 0);
        return s + ((amt - disc) * ((i.taxRate || 0) / 100));
    }, 0);
    const grandTotal = subTotal - totalDiscount + totalTax + (parseFloat(adjustmentAmount) || 0) + (parseFloat(roundOff) || 0);

    const buildPayload = () => {
        const validItems = lineItems.filter(li => li.itemName && li.totalMeters > 0);
        return {
            partyId: selectedParty?._id || selectedParty?.id,
            invoiceDate,
            dueDate: invoiceDate,
            orderNumber: referenceNumber.trim() || undefined,
            items: validItems.map(li => ({
                itemId: li.itemId || undefined,
                itemName: li.itemName,
                itemCode: li.itemCode || undefined,
                hsnCode: li.hsnCode || '0000',
                quantity: li.totalMeters,
                unit: li.unit || 'METERS',
                ratePerUnit: li.ratePerMeter,
                discount: li.discount || 0,
                discountType: li.discountType || 'PERCENTAGE',
                gstRate: li.taxRate || 5,
            })),
            adjustment: parseFloat(adjustmentAmount) || 0,
            notes: customerNotes.trim() || undefined,
            termsAndConditions: termsAndConditions.trim() || undefined,
            isDraft: false,
            shippingCharges: 0,
        };
    };

    const handleUpdate = () => {
        if (!selectedParty) { Alert.alert('Error', 'Please select a party'); return; }
        const validItems = lineItems.filter(li => li.itemName && li.totalMeters > 0);
        if (validItems.length === 0) { Alert.alert('Error', 'Please add at least one valid item'); return; }

        const payload = buildPayload();
        updateMutation.mutate({ id, data: payload }, {
            onSuccess: (updatedInvoice: any) => {
                Alert.alert('✅ Updated', `Invoice ${updatedInvoice?.invoiceNumber || ''} updated!\nLedger history has been recorded.`, [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            },
        });
    };

    if (isLoadingInvoice || !loaded) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading Invoice…</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.customHeader}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>← </Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Invoice</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.numberBar}>
                <Text style={styles.numberLabel}>Invoice # </Text>
                <Text style={styles.numberValue}>{(invoice as any)?.invoiceNumber || '—'}</Text>
                <View style={{ flex: 1 }} />
                <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#d97706' }}>EDITING</Text>
                </View>
            </View>

            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                {/* Party */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Name *</Text>
                    {selectedParty ? (
                        <View style={styles.selectedParty}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.partyName}>{selectedParty.name}</Text>
                                <Text style={styles.partyCode}>{selectedParty.gstin || ''}</Text>
                            </View>
                            <TouchableOpacity onPress={() => { setSelectedParty(null); }}>
                                <Text style={styles.changeBtn}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={[styles.input, { justifyContent: 'center' }]} onPress={() => setShowPartyPicker(true)}>
                            <Text style={{ fontSize: 15, color: colors.textMuted }}>Tap to select party...</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Date */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Invoice Details</Text>
                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>Date</Text>
                            <TextInput style={styles.input} value={invoiceDate} onChangeText={setInvoiceDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2 }}>Reference #</Text>
                            <TextInput style={styles.input} value={referenceNumber} onChangeText={setReferenceNumber} placeholder="Optional" placeholderTextColor={colors.textMuted} />
                        </View>
                    </View>
                </View>

                {/* Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items *</Text>
                    {lineItems.map((li, idx) => (
                        <View key={idx} style={styles.lineItemEditor}>
                            <View style={styles.itemRow}>
                                <TouchableOpacity style={[styles.input, { flex: 2, justifyContent: 'center' }]} onPress={() => setActiveItemPickerIndex(idx)}>
                                    <Text style={{ fontSize: 14, color: li.itemName ? colors.textPrimary : colors.textMuted }}>{li.itemName || 'Tap to select item...'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.removeBtn} onPress={() => removeLineItem(idx)}>
                                    <Text style={styles.removeBtnText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            {li.itemName ? <Text style={{ fontSize: 10, color: colors.textMuted, paddingHorizontal: 4 }}>{li.itemCode || ''} {li.hsnCode ? `• HSN: ${li.hsnCode}` : ''}</Text> : null}
                            <View style={styles.itemRow}>
                                <TextInput style={[styles.input, styles.halfInput]} placeholder="Qty" value={li.rollsText} onChangeText={(v) => updateLineItem(idx, 'rollsText', v)} keyboardType="numeric" placeholderTextColor={colors.textMuted} />
                                {showRates && <TextInput style={[styles.input, styles.halfInput]} placeholder="Rate (₹)" value={li.ratePerMeter === 0 ? '' : String(li.ratePerMeter)} onChangeText={(v) => updateLineItem(idx, 'ratePerMeter', v)} keyboardType="numeric" placeholderTextColor={colors.textMuted} />}
                            </View>
                            <View style={styles.itemRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>Discount</Text>
                                    <View style={{ flexDirection: 'row', gap: 4 }}>
                                        <TextInput style={[styles.input, { flex: 1, height: 36, fontSize: 13 }]} placeholder="0" value={li.discount === 0 ? '' : String(li.discount)} onChangeText={v => updateLineItem(idx, 'discount', parseFloat(v) || 0)} keyboardType="numeric" placeholderTextColor={colors.textMuted} />
                                        <TouchableOpacity style={[styles.segBtn, { paddingHorizontal: 8, height: 36 }]} onPress={() => updateLineItem(idx, 'discountType', li.discountType === 'PERCENTAGE' ? 'FLAT' : 'PERCENTAGE')}>
                                            <Text style={styles.segBtnText}>{li.discountType === 'PERCENTAGE' ? '%' : '₹'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 2 }}>GST</Text>
                                    <View style={{ height: 36, justifyContent: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingHorizontal: 8 }}>
                                        <Text style={{ fontSize: 13, color: colors.textPrimary, fontWeight: '600' }}>{li.taxRate}%</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.itemRow, { marginTop: 4 }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, color: '#dc2626', fontWeight: '700' }}>Amount (per unit)</Text>
                                    <TextInput
                                        style={[styles.input, { borderColor: '#fca5a5', color: '#dc2626', fontWeight: 'bold', fontSize: 16 }]}
                                        value={li.ratePerMeter === 0 ? '' : String(li.ratePerMeter)}
                                        onChangeText={(v) => updateLineItem(idx, 'ratePerMeter', v)}
                                        keyboardType="numeric"
                                        placeholder="₹ 0"
                                        placeholderTextColor="#fca5a5"
                                    />
                                </View>
                                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', paddingBottom: spacing.sm }}>
                                    <Text style={{ fontSize: 10, color: colors.textSecondary }}>{(li.totalMeters || 0).toFixed(2)} × ₹{li.ratePerMeter || 0}</Text>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#dc2626' }}>₹{(li.amount || 0).toLocaleString('en-IN')}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addBtn} onPress={addEmptyLineItem}>
                        <Text style={styles.addBtnText}>+ Add Items</Text>
                    </TouchableOpacity>
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes & Terms</Text>
                    <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} placeholder="Customer notes" placeholderTextColor={colors.textMuted} value={customerNotes} onChangeText={setCustomerNotes} multiline />
                    <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} placeholder="Terms and conditions" placeholderTextColor={colors.textMuted} value={termsAndConditions} onChangeText={setTermsAndConditions} multiline />
                </View>

                {/* Summary */}
                {lineItems.length > 0 && (
                    <View style={styles.summaryCard}>
                        <View style={styles.summRow}><Text style={styles.summLabel}>Total Qty</Text><Text style={styles.summValue}>{totalEntries} / {totalMeters.toFixed(2)}</Text></View>
                        {showAmount && <View style={styles.summRow}><Text style={styles.summLabel}>Sub Total</Text><Text style={styles.summValue}>₹{subTotal.toLocaleString('en-IN')}</Text></View>}
                        {totalDiscount > 0 && <View style={styles.summRow}><Text style={styles.summLabel}>Discount</Text><Text style={[styles.summValue, { color: colors.success }]}>-₹{totalDiscount.toFixed(2)}</Text></View>}
                        {totalTax > 0 && <View style={styles.summRow}><Text style={styles.summLabel}>Tax (GST)</Text><Text style={styles.summValue}>+₹{totalTax.toFixed(2)}</Text></View>}
                        <View style={styles.summRow}>
                            <Text style={styles.summLabel}>Adjustment</Text>
                            <TextInput style={{ fontSize: 13, color: colors.textPrimary, width: 80, textAlign: 'right' }} value={adjustmentAmount} onChangeText={setAdjustmentAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summRow}><Text style={styles.grandLabel}>Grand Total (₹)</Text><Text style={styles.grandValue}>₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text></View>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: spacing.sm, margin: spacing.lg }}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.submitBtn, { flex: 2 }, (updateMutation.isPending || !selectedParty || lineItems.length === 0) && styles.disabledBtn]}
                        onPress={handleUpdate}
                        disabled={updateMutation.isPending || !selectedParty || lineItems.length === 0}
                    >
                        {updateMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Save & Update Ledger</Text>}
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Pickers */}
            <SearchablePicker visible={showPartyPicker} onClose={() => setShowPartyPicker(false)} title="Select Party" items={partyPickerItems} searchPlaceholder="Search parties..." onSelect={(p) => { const party = allParties.find((x: any) => (x._id || x.id) === p.id); if (party) setSelectedParty(party); setShowPartyPicker(false); }} />
            <SearchablePicker visible={activeItemPickerIndex !== null} onClose={() => setActiveItemPickerIndex(null)} title="Select Item" items={itemPickerItems} searchPlaceholder="Search items..." onSelect={(item) => { if (activeItemPickerIndex !== null) handleSelectItem(item, activeItemPickerIndex); setActiveItemPickerIndex(null); }} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    customHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface,
        borderBottomWidth: 1, borderBottomColor: colors.borderLight, zIndex: 10
    },
    backButton: { padding: spacing.xs, width: 40 },
    backButtonText: { fontSize: 24, color: colors.primary, fontWeight: 'bold' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    numberBar: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, padding: spacing.md, paddingHorizontal: spacing.lg, alignItems: 'center' },
    numberLabel: { ...typography.caption, marginTop: 2 },
    numberValue: { fontSize: 15, fontWeight: 'bold', color: colors.primary },
    section: { padding: spacing.lg, paddingBottom: spacing.sm },
    sectionTitle: { ...typography.label, marginBottom: spacing.sm },
    input: {
        height: 48, backgroundColor: colors.surface, borderRadius: radius.md,
        paddingHorizontal: spacing.md, fontSize: 15, color: colors.textPrimary,
        borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
    },
    selectedParty: {
        flexDirection: 'row', backgroundColor: colors.surface, padding: spacing.lg,
        borderRadius: radius.md, alignItems: 'flex-start', ...shadows.sm, borderWidth: 1, borderColor: colors.borderLight,
    },
    partyName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    partyCode: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    changeBtn: { color: colors.primary, fontWeight: 'bold', fontSize: 14 },
    segBtn: {
        flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
        borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    },
    segBtnText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    lineItemEditor: {
        backgroundColor: colors.surface, padding: spacing.md,
        borderRadius: radius.md, marginBottom: spacing.md,
        ...shadows.sm, borderWidth: 1, borderColor: colors.borderLight
    },
    itemRow: { flexDirection: 'row', gap: spacing.sm },
    halfInput: { flex: 1 },
    addBtn: { backgroundColor: colors.surfaceAlt, padding: spacing.md, borderRadius: radius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
    addBtnText: { color: colors.primary, fontWeight: 'bold', fontSize: 15 },
    removeBtn: { height: 48, width: 44, justifyContent: 'center', alignItems: 'center' },
    removeBtnText: { color: colors.error, fontSize: 18, fontWeight: 'bold' },
    itemTotalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 4 },
    liMeta: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
    liAmount: { fontSize: 14, color: colors.primary, fontWeight: 'bold' },
    summaryCard: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...shadows.md, marginTop: spacing.md },
    summRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, alignItems: 'center' },
    summLabel: { fontSize: 14, color: colors.textSecondary },
    summValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
    grandLabel: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    grandValue: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
    cancelBtn: {
        flex: 1, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: colors.error, backgroundColor: colors.surface,
    },
    cancelBtnText: { color: colors.error, fontSize: 15, fontWeight: 'bold' },
    submitBtn: {
        backgroundColor: colors.primary, height: 56,
        borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
        ...shadows.md
    },
    disabledBtn: { opacity: 0.5 },
    submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
