import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../lib/api';
import { colors, spacing, radius, shadows } from '../lib/theme';
import dayjs from 'dayjs';

export function AdvancedReceiptScreen() {
    const navigation = useNavigation<any>();
    const [parties, setParties] = useState<any[]>([]);
    const [selectedParty, setSelectedParty] = useState<string>('');
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    // Receive Configuration
    const [amountText, setAmountText] = useState('');
    const [paymentMode, setPaymentMode] = useState('BANK_TRANSFER');
    const [accountId, setAccountId] = useState('HDFC_BANK');
    const [referenceId, setReferenceId] = useState('');
    const [narration, setNarration] = useState('');

    // Allocation State mapping invoice IDs to amounts
    const [allocations, setAllocations] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        api.get('/parties', { params: { limit: 100 } })
            .then(res => {
                const p = res.data?.data || res.data || [];
                setParties(Array.isArray(p) ? p : []);
            }).catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedParty) {
            setInvoices([]);
            setAllocations({});
            return;
        }
        setLoadingInvoices(true);
        api.get('/invoices', { params: { partyId: selectedParty, limit: 100, sort: 'asc' } })
            .then(res => {
                let invs = res.data?.data?.invoices || res.data?.data || res.data || [];
                if (Array.isArray(invs)) {
                    // Keep open invoices
                    invs = invs.filter(i => i.paymentStatus !== 'PAID' && i.status !== 'CANCELLED');
                    setInvoices(invs);
                }
            })
            .catch(console.error)
            .finally(() => setLoadingInvoices(false));
    }, [selectedParty]);

    const totalAmount = Number(amountText) || 0;
    const totalAllocated = useMemo(() => {
        return Object.values(allocations).reduce((a, b) => a + (b || 0), 0);
    }, [allocations]);

    const unallocatedAmount = Math.max(0, totalAmount - totalAllocated);

    const handleAutoAllocate = () => {
        if (totalAmount <= 0) return Alert.alert('Notice', 'Enter a received amount first.');
        let remaining = totalAmount;
        const newAllocations: Record<string, number> = {};

        // FIFO allocation
        for (const inv of invoices) {
            if (remaining <= 0) break;
            const due = (inv.finalAmount || 0) - (inv.totalPaid || 0);
            const toAllocate = Math.min(due, remaining);
            if (toAllocate > 0) {
                newAllocations[inv._id] = toAllocate;
                remaining -= toAllocate;
            }
        }
        setAllocations(newAllocations);
    };

    const submitReceipt = async () => {
        if (!selectedParty) return Alert.alert('Error', 'Select a Party.');
        if (totalAmount <= 0) return Alert.alert('Error', 'Enter a valid amount.');
        if (totalAllocated > totalAmount) return Alert.alert('Error', 'Allocations exceed totally received amount.');

        setIsSubmitting(true);
        try {
            const allocsPayload = Object.entries(allocations)
                .filter(([_, amt]) => amt > 0)
                .map(([id, amt]) => ({ invoiceId: id, amountAllocated: amt }));

            await api.post('/journal/receipt', {
                partyId: selectedParty,
                accountId,
                amount: totalAmount,
                paymentMode,
                referenceId,
                narration: narration || `Payment received via ${paymentMode.replace('_', ' ')}`,
                allocations: allocsPayload
            });

            Alert.alert('Success', 'Receipt & allocations posted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to post receipt');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backText}>✕ Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Receive Payment</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

                    {/* Core Details */}
                    <View style={styles.card}>
                        <Text style={styles.label}>1. Select Customer (Party)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                            {parties.map(p => (
                                <TouchableOpacity
                                    key={p._id}
                                    style={[styles.chip, selectedParty === p._id && styles.chipActive]}
                                    onPress={() => setSelectedParty(p._id)}
                                >
                                    <Text style={[styles.chipText, selectedParty === p._id && styles.chipTextActive]}>
                                        {p.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.label}>2. Amount Received</Text>
                        <View style={styles.amountContainer}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <TextInput
                                style={styles.amountInput}
                                keyboardType="decimal-pad"
                                value={amountText}
                                onChangeText={setAmountText}
                                placeholder="0.00"
                                placeholderTextColor="#cbd5e1"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.label}>Deposit To Account</Text>
                                <TextInput style={styles.input} value={accountId} onChangeText={setAccountId} placeholder="e.g. CASH" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Mode</Text>
                                <TextInput style={styles.input} value={paymentMode} onChangeText={setPaymentMode} placeholder="BANK_TRANSFER" />
                            </View>
                        </View>

                        <View style={{ marginTop: 12 }}>
                            <Text style={styles.label}>Ref No / UTR / Cheque Number</Text>
                            <TextInput style={styles.input} value={referenceId} onChangeText={setReferenceId} placeholder="Reference No." />
                        </View>
                    </View>

                    {/* Bill By Bill Allocation */}
                    <View style={styles.card}>
                        <View style={[styles.row, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }]}>
                            <Text style={styles.sectionTitle}>Bill-By-Bill Allocation</Text>
                            <TouchableOpacity style={styles.autoActionBtn} onPress={handleAutoAllocate}>
                                <Text style={styles.autoActionText}>⚡ Auto-Fill FIFO</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.allocationSummary}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total Received</Text>
                                <Text style={styles.summaryVal}>₹{totalAmount.toLocaleString('en-IN')}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Allocated</Text>
                                <Text style={[styles.summaryVal, { color: '#0ea5e9' }]}>₹{totalAllocated.toLocaleString('en-IN')}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>On Account (Advance)</Text>
                                <Text style={[styles.summaryVal, { color: '#10b981' }]}>₹{unallocatedAmount.toLocaleString('en-IN')}</Text>
                            </View>
                        </View>

                        {!selectedParty ? (
                            <Text style={styles.hintText}>Select a party to view outstanding invoices.</Text>
                        ) : loadingInvoices ? (
                            <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
                        ) : invoices.length === 0 ? (
                            <Text style={styles.hintText}>No pending invoices found for this party.</Text>
                        ) : (
                            invoices.map(inv => {
                                const due = (inv.finalAmount || 0) - (inv.totalPaid || 0);
                                return (
                                    <View key={inv._id} style={styles.invoiceRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.invNumber}>{inv.invoiceNumber}</Text>
                                            <Text style={styles.invSub}>{dayjs(inv.invoiceDate).format('DD MMM YYYY')} • Due: ₹{due.toLocaleString('en-IN')}</Text>
                                        </View>
                                        <View style={styles.invInputWrapper}>
                                            <Text style={styles.invInputSymbol}>₹</Text>
                                            <TextInput
                                                style={styles.invInput}
                                                keyboardType="decimal-pad"
                                                placeholder="0"
                                                value={allocations[inv._id] ? String(allocations[inv._id]) : ''}
                                                onChangeText={(val) => setAllocations(prev => ({ ...prev, [inv._id]: Number(val) || 0 }))}
                                            />
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                        onPress={submitReceipt}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitBtnText}>{isSubmitting ? 'Processing...' : 'Settle & Post Receipt'}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
    backBtn: { paddingVertical: spacing.sm },
    backText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
    scroll: { padding: spacing.lg, paddingBottom: 60 },

    card: { backgroundColor: '#fff', padding: spacing.lg, borderRadius: radius.xl, marginBottom: spacing.lg, ...shadows.sm },
    label: { fontSize: 12, fontWeight: '800', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    row: { flexDirection: 'row' },

    // Chips
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    chipActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    chipTextActive: { color: '#fff' },

    // Amount Input
    amountContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: radius.lg, paddingHorizontal: spacing.lg, marginBottom: 16 },
    currencySymbol: { fontSize: 36, fontWeight: '800', color: '#86efac', marginRight: 10 },
    amountInput: { flex: 1, fontSize: 44, fontWeight: '800', color: '#16a34a', paddingVertical: 12 },

    input: { backgroundColor: '#f1f5f9', borderRadius: radius.md, padding: 12, fontSize: 15, color: colors.textPrimary, fontWeight: '500' },

    // Allocation
    sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
    autoActionBtn: { backgroundColor: '#fef08a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.md },
    autoActionText: { fontSize: 12, fontWeight: '800', color: '#854d0e' },

    allocationSummary: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: radius.lg, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    summaryItem: { flex: 1 },
    summaryLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
    summaryVal: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },

    hintText: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: 12 },

    // Invoice Rows
    invoiceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    invNumber: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 },
    invSub: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
    invInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: radius.md, paddingHorizontal: 10, width: 120 },
    invInputSymbol: { fontSize: 14, color: '#94a3b8', fontWeight: '800', marginRight: 4 },
    invInput: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.textPrimary, paddingVertical: 10, textAlign: 'right' },

    footer: { padding: spacing.lg, paddingBottom: Platform.OS === 'ios' ? 30 : spacing.lg, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    submitBtn: { backgroundColor: '#16a34a', paddingVertical: 18, borderRadius: radius.xl, alignItems: 'center', ...shadows.md },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }
});
