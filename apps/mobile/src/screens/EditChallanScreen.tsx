import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, ActivityIndicator, Switch
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useChallan, useUpdateChallan, useChallanPreview } from '../hooks/api/useChallans';
import { useQuickSearchParties } from '../hooks/api/useParties';
import { useItems } from '../hooks/api/useItems';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export function EditChallanScreen({ route, navigation }: any) {
    const { id } = route.params || {};

    const { data: challanWrapper, isLoading } = useChallan(id);
    const updateMutation = useUpdateChallan();
    const previewMutation = useChallanPreview();
    const challan = (challanWrapper as any)?.data || challanWrapper;

    const [partySearch, setPartySearch] = useState('');
    const debouncedPartySearch = useDebounce(partySearch, 300);
    const [selectedParty, setSelectedParty] = useState<any>(null);
    const [showPartySearch, setShowPartySearch] = useState(true);

    const [lineItems, setLineItems] = useState<any[]>([]);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [remarks, setRemarks] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const { data: searchResults } = useQuickSearchParties(debouncedPartySearch);
    const { data: itemsData } = useItems({ limit: 100 });
    const allItems = (itemsData as any)?.data || [];

    useEffect(() => {
        if (challan) {
            setSelectedParty(challan.partySnapshot ? { ...challan.partySnapshot, _id: challan.partyId } : null);
            if (challan.partySnapshot) setShowPartySearch(false);
            setVehicleNumber(challan.vehicleNumber || '');
            setRemarks(challan.remarks || '');

            setLineItems((challan.items || []).map((it: any) => ({
                itemId: it.itemId || '',
                itemName: it.itemName || '',
                itemCode: it.itemCode || '',
                hsnCode: it.hsnCode || '',
                rollsText: it.meters ? it.meters.join(' ') : '',
                meters: it.meters || [],
                totalMeters: it.totalMeters || 0,
                ratePerMeter: it.ratePerMeter || 0,
                amount: it.amount || 0,
            })));
        }
    }, [challan]);

    const addEmptyLineItem = () => {
        setLineItems((prev) => [
            ...prev,
            {
                itemId: '',
                itemName: '',
                rollsText: '',
                meters: [],
                totalMeters: 0,
                ratePerMeter: 0,
                amount: 0,
            },
        ]);
    };

    const removeLineItem = (index: number) => {
        setLineItems((prev) => prev.filter((_, i) => i !== index));
    };

    const updateLineItem = (index: number, key: string, value: any) => {
        setLineItems((prev) => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], [key]: value };

            if (key === 'rollsText') {
                const meterStrings = String(value).split(/[\s,]+/).filter(Boolean);
                const meters = meterStrings.map(m => parseFloat(m)).filter(m => !isNaN(m));
                newItems[index].meters = meters;

                const total = meters.reduce((a, b) => a + b, 0);
                newItems[index].totalMeters = total;
                newItems[index].amount = total * (newItems[index].ratePerMeter || 0);
            }

            if (key === 'ratePerMeter') {
                const rate = parseFloat(value) || 0;
                newItems[index].amount = (newItems[index].totalMeters || 0) * rate;
            }

            if (key === 'itemName') {
                const catalogItem = allItems.find((it: any) =>
                    it.name?.toLowerCase() === String(value).toLowerCase() || it.code?.toLowerCase() === String(value).toLowerCase()
                );
                if (catalogItem) {
                    newItems[index].itemId = catalogItem._id || catalogItem.id;
                    newItems[index].itemName = catalogItem.name;
                    newItems[index].itemCode = catalogItem.code;
                    newItems[index].hsnCode = catalogItem.hsnCode;
                    if (!newItems[index].ratePerMeter && catalogItem.defaultRate) {
                        newItems[index].ratePerMeter = catalogItem.defaultRate;
                        newItems[index].amount = (newItems[index].totalMeters || 0) * catalogItem.defaultRate;
                    }
                }
            }

            return newItems;
        });
    };

    const totalEntries = lineItems.reduce((s, i) => s + (i.meters?.length || 0), 0);
    const totalMeters = lineItems.reduce((s, i) => s + (i.totalMeters || 0), 0);
    const totalAmount = lineItems.reduce((s, i) => s + (i.amount || 0), 0);

    const handleSubmit = () => {
        if (!selectedParty) {
            Alert.alert('Error', 'Please select a party');
            return;
        }

        const validItems = lineItems.filter(li => li.itemName && li.meters && li.meters.length > 0);

        if (validItems.length === 0) {
            Alert.alert('Error', 'Please add at least one valid item with quantities');
            return;
        }

        const payload = {
            partyId: selectedParty._id || selectedParty.id,
            items: validItems.map((li) => ({
                itemId: li.itemId || undefined,
                itemName: li.itemName,
                meters: li.meters,
                ratePerMeter: li.ratePerMeter,
            })),
            vehicleNumber: vehicleNumber.trim() || undefined,
            remarks: remarks.trim() || undefined,
        };

        updateMutation.mutate({ id, data: payload as any }, {
            onSuccess: () => {
                Alert.alert('✅ Success', `Challan updated!`, [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            },
            onError: (err: any) => {
                Alert.alert('Error', err?.response?.data?.message || err.message || 'Failed to update challan');
            }
        });
    };

    const [htmlContent, setHtmlContent] = useState('');

    const previewPayload = useMemo(() => {
        if (!showPreview || !challan) return null;

        const validItems = lineItems.filter(i => i.itemName);

        return {
            challanNumber: challan.challanNumber || 'CHN-PREVIEW',
            date: challan.date || new Date().toISOString(),
            partySnapshot: selectedParty ? {
                name: selectedParty.name,
                shortCode: selectedParty.shortCode || '',
                phone: selectedParty.phone || '',
                gstin: selectedParty.gstin || '',
                address: selectedParty.address || { city: selectedParty.city },
            } : { name: '—', address: {} },
            vehicleNumber: vehicleNumber,
            remarks: remarks,
            items: validItems.map((item: any) => ({
                itemName: item.itemName || '',
                itemCode: item.itemCode || '',
                hsnCode: item.hsnCode || '',
                totalMeters: item.totalMeters || 0,
                ratePerMeter: item.ratePerMeter || 0,
                meters: item.meters || [],
                unit: item.unit || 'METERS',
            })),
            totalRolls: totalEntries,
            totalMeters: totalMeters,
            totalAmount: totalAmount
        };
    }, [showPreview, challan, lineItems, selectedParty, vehicleNumber, remarks, totalEntries, totalMeters, totalAmount]);

    const debouncedPreviewPayload = useDebounce(previewPayload, 700);

    useEffect(() => {
        if (showPreview && debouncedPreviewPayload) {
            previewMutation.mutate(debouncedPreviewPayload, {
                onSuccess: (htmlString) => {
                    if (htmlString) {
                        setHtmlContent(htmlString);
                    } else {
                        setHtmlContent('<div style="padding:20px;color:red;font-family:sans-serif;">Error: Empty response.</div>');
                    }
                },
                onError: (err: any) => {
                    setHtmlContent(`<div style="padding:20px;color:red;font-family:sans-serif;">Error fetching preview: ${err.message}</div>`);
                }
            });
        } else if (!showPreview) {
            setHtmlContent('');
        }
    }, [debouncedPreviewPayload, showPreview]);

    if (isLoading) {
        return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>;
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Party *</Text>
                    {selectedParty ? (
                        <View style={styles.selectedParty}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.partyName}>{selectedParty.name}</Text>
                                <Text style={styles.partyCode}>{selectedParty.shortCode || selectedParty.city || ''}</Text>
                            </View>
                            <TouchableOpacity onPress={() => { setSelectedParty(null); setShowPartySearch(true); }}>
                                <Text style={styles.changeBtn}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Search party by name or code..."
                                placeholderTextColor={colors.textMuted}
                                value={partySearch}
                                onChangeText={setPartySearch}
                            />
                            {searchResults && (searchResults as any[]).length > 0 && (
                                <View style={styles.searchResults}>
                                    {(searchResults as any[]).map((p: any) => (
                                        <TouchableOpacity
                                            key={p._id || p.id}
                                            style={styles.searchItem}
                                            onPress={() => { setSelectedParty(p); setShowPartySearch(false); setPartySearch(''); }}
                                        >
                                            <Text style={styles.searchItemName}>{p.name}</Text>
                                            <Text style={styles.searchItemCode}>{p.shortCode} • {p.city}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </>
                    )}
                </View>

                <View style={[styles.section, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.sectionTitle}>Live Preview</Text>
                        {previewMutation.isPending && <ActivityIndicator style={{ marginLeft: 10 }} size="small" color={colors.primary} />}
                    </View>
                    <Switch value={showPreview} onValueChange={setShowPreview} trackColor={{ true: colors.primary }} />
                </View>

                {showPreview && (
                    <View style={styles.webviewContainer}>
                        {htmlContent ? (
                            <WebView
                                source={{ html: htmlContent }}
                                style={styles.webview}
                                scalesPageToFit={false}
                                originWhitelist={['*']}
                            />
                        ) : (
                            <ActivityIndicator style={{ padding: 40 }} color={colors.primary} />
                        )}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items *</Text>

                    {lineItems.map((li, idx) => (
                        <View key={idx} style={styles.lineItemEditor}>
                            <View style={styles.itemRow}>
                                <TextInput
                                    style={[styles.input, { flex: 2 }]}
                                    placeholder="Item Name"
                                    value={li.itemName}
                                    onChangeText={(val) => updateLineItem(idx, 'itemName', val)}
                                />
                                <TouchableOpacity style={styles.removeBtn} onPress={() => removeLineItem(idx)}>
                                    <Text style={styles.removeBtnText}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.itemRow}>
                                <TextInput
                                    style={[styles.input, styles.halfInput]}
                                    placeholder="Meters (e.g. 45.2 44.5)"
                                    value={li.rollsText}
                                    onChangeText={(val) => updateLineItem(idx, 'rollsText', val)}
                                />
                                <TextInput
                                    style={[styles.input, styles.halfInput]}
                                    placeholder="Rate (₹)"
                                    value={li.ratePerMeter === 0 ? '' : li.ratePerMeter.toString()}
                                    onChangeText={(val) => updateLineItem(idx, 'ratePerMeter', val)}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.itemTotalsRow}>
                                <Text style={styles.liMeta}>{li.meters.length} Rolls • {li.totalMeters.toFixed(2)} m</Text>
                                <Text style={styles.liAmount}>₹{(li.amount || 0).toLocaleString('en-IN')}</Text>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addBtn} onPress={addEmptyLineItem}>
                        <Text style={styles.addBtnText}>+ Add Row</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Transport</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Vehicle Number (optional)"
                        placeholderTextColor={colors.textMuted}
                        value={vehicleNumber}
                        onChangeText={setVehicleNumber}
                        autoCapitalize="characters"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Remarks</Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        placeholder="Notes (optional)"
                        placeholderTextColor={colors.textMuted}
                        value={remarks}
                        onChangeText={setRemarks}
                        multiline
                    />
                </View>

                {lineItems.length > 0 && (
                    <View style={styles.summaryCard}>
                        <View style={styles.summRow}>
                            <Text style={styles.summLabel}>Total Rolls (Entries)</Text>
                            <Text style={styles.summValue}>{totalEntries}</Text>
                        </View>
                        <View style={styles.summRow}>
                            <Text style={styles.summLabel}>Total Meters</Text>
                            <Text style={styles.summValue}>{totalMeters.toFixed(1)} m</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.summRow}>
                            <Text style={styles.grandLabel}>Total Amount</Text>
                            <Text style={styles.grandValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.submitBtn, (updateMutation.isPending || !selectedParty || lineItems.length === 0) && styles.disabledBtn]}
                    onPress={handleSubmit}
                    disabled={updateMutation.isPending || !selectedParty || lineItems.length === 0}
                >
                    {updateMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitBtnText}>Update Challan</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    numberBar: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, padding: spacing.md, paddingHorizontal: spacing.lg },
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
        borderRadius: radius.md, alignItems: 'center', ...shadows.sm,
    },
    partyName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    partyCode: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    changeBtn: { color: colors.primary, fontWeight: 'bold', fontSize: 14 },
    searchResults: { backgroundColor: colors.surface, borderRadius: radius.md, ...shadows.md },
    searchItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    searchItemName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    searchItemCode: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

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
    itemTotalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, paddingHorizontal: 4 },
    liMeta: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
    liAmount: { fontSize: 14, color: colors.primary, fontWeight: 'bold' },

    webviewContainer: {
        height: 400, marginHorizontal: spacing.lg, marginBottom: spacing.md,
        borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
        backgroundColor: '#f0f0f0',
    },
    webview: { flex: 1, backgroundColor: 'transparent' },

    summaryCard: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...shadows.md, marginTop: spacing.md },
    summRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
    summLabel: { fontSize: 14, color: colors.textSecondary },
    summValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
    grandLabel: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    grandValue: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
    submitBtn: {
        margin: spacing.lg, backgroundColor: colors.primary, height: 56,
        borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
        ...shadows.md
    },
    disabledBtn: { opacity: 0.5 },
    submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
