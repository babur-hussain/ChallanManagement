import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useCreateExpense } from '../hooks/api/useFinance';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function CreateExpenseScreen({ navigation }: any) {
    const { mutate: createExpense, isPending } = useCreateExpense();

    const [form, setForm] = useState({
        amount: '',
        category: '',
        notes: '',
        vendor: '',
        vendorGstIn: '',
        invoiceNumber: '',
        paymentMode: 'BANK',
        cgstAmount: '',
        sgstAmount: '',
        igstAmount: '',
        cessAmount: '',
        itcEligibility: true,
        reverseCharge: false,
    });

    const categories = ['RENT', 'UTILITIES', 'TRAVEL', 'OFFICE_SUPPLIES', 'MARKETING', 'SALARY', 'OTHER'];
    const paymentModes = ['BANK', 'CASH', 'CREDIT'];

    const handleSave = () => {
        if (!form.amount || !form.category) {
            Alert.alert('Error', 'Amount and Category are required');
            return;
        }

        const amt = parseFloat(form.amount) || 0;
        const cgst = parseFloat(form.cgstAmount) || 0;
        const sgst = parseFloat(form.sgstAmount) || 0;
        const igst = parseFloat(form.igstAmount) || 0;
        const cess = parseFloat(form.cessAmount) || 0;
        const gstTotal = cgst + sgst + igst + cess;

        createExpense({
            amount: amt,
            gstAmount: gstTotal,
            totalAmount: amt + gstTotal,
            cgstAmount: cgst,
            sgstAmount: sgst,
            igstAmount: igst,
            cessAmount: cess,
            category: form.category,
            notes: form.notes,
            vendor: form.vendor,
            vendorGstIn: form.vendorGstIn,
            invoiceNumber: form.invoiceNumber,
            paymentMode: form.paymentMode,
            itcEligibility: form.itcEligibility,
            reverseCharge: form.reverseCharge,
        }, {
            onSuccess: () => {
                navigation.goBack();
            },
            onError: (err: any) => {
                Alert.alert('Error', err.message || 'Failed to record expense');
            }
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Details</Text>

                <Text style={styles.label}>Amount (excluding Tax) *</Text>
                <TextInput placeholderTextColor={colors.textMuted}
                    style={styles.input}
                    placeholder="e.g. 5000"
                    keyboardType="numeric"
                    value={form.amount}
                    onChangeText={t => setForm({ ...form, amount: t })}
                />

                <Text style={styles.label}>Category *</Text>
                <View style={styles.chipsRow}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.chip, form.category === cat && styles.chipActive]}
                            onPress={() => setForm({ ...form, category: cat })}
                        >
                            <Text style={[styles.chipText, form.category === cat && styles.chipTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Payment Mode *</Text>
                <View style={[styles.chipsRow, { marginBottom: 0 }]}>
                    {paymentModes.map(mode => (
                        <TouchableOpacity
                            key={mode}
                            style={[styles.chip, form.paymentMode === mode && styles.chipActive]}
                            onPress={() => setForm({ ...form, paymentMode: mode })}
                        >
                            <Text style={[styles.chipText, form.paymentMode === mode && styles.chipTextActive]}>{mode}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vendor & Invoice (Optional)</Text>

                <Text style={styles.label}>Vendor Name</Text>
                <TextInput placeholderTextColor={colors.textMuted} style={styles.input} placeholder="Vendor legal name" value={form.vendor} onChangeText={t => setForm({ ...form, vendor: t })} />

                <Text style={styles.label}>Vendor GSTIN</Text>
                <TextInput placeholderTextColor={colors.textMuted} style={styles.input} placeholder="15-digit GSTIN" autoCapitalize="characters" value={form.vendorGstIn} onChangeText={t => setForm({ ...form, vendorGstIn: t })} />

                <Text style={styles.label}>Invoice Number</Text>
                <TextInput placeholderTextColor={colors.textMuted} style={styles.input} placeholder="Bill/Invoice #" value={form.invoiceNumber} onChangeText={t => setForm({ ...form, invoiceNumber: t })} />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>GST Tax Breakdown</Text>

                <View style={styles.row}>
                    <View style={styles.flexHalf}>
                        <Text style={styles.label}>CGST Amount</Text>
                        <TextInput placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="numeric" placeholder="0" value={form.cgstAmount} onChangeText={t => setForm({ ...form, cgstAmount: t })} />
                    </View>
                    <View style={styles.flexHalf}>
                        <Text style={styles.label}>SGST Amount</Text>
                        <TextInput placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="numeric" placeholder="0" value={form.sgstAmount} onChangeText={t => setForm({ ...form, sgstAmount: t })} />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.flexHalf}>
                        <Text style={styles.label}>IGST Amount</Text>
                        <TextInput placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="numeric" placeholder="0" value={form.igstAmount} onChangeText={t => setForm({ ...form, igstAmount: t })} />
                    </View>
                    <View style={styles.flexHalf}>
                        <Text style={styles.label}>CESS Amount</Text>
                        <TextInput placeholderTextColor={colors.textMuted} style={styles.input} keyboardType="numeric" placeholder="0" value={form.cessAmount} onChangeText={t => setForm({ ...form, cessAmount: t })} />
                    </View>
                </View>

                <View style={styles.switchRow}>
                    <View>
                        <Text style={styles.switchLabel}>Eligible for ITC</Text>
                        <Text style={styles.switchSub}>Claim Input Tax Credit for this bill</Text>
                    </View>
                    <Switch
                        value={form.itcEligibility}
                        onValueChange={v => setForm({ ...form, itcEligibility: v })}
                        trackColor={{ true: colors.primary }}
                    />
                </View>

                <View style={styles.switchRow}>
                    <View>
                        <Text style={styles.switchLabel}>Reverse Charge (RCM)</Text>
                        <Text style={styles.switchSub}>Tax paid on reverse charge basis</Text>
                    </View>
                    <Switch
                        value={form.reverseCharge}
                        onValueChange={v => setForm({ ...form, reverseCharge: v })}
                        trackColor={{ true: colors.primary }}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <Text style={styles.label}>Notes</Text>
                <TextInput placeholderTextColor={colors.textMuted}
                    style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                    placeholder="Description or business intent..."
                    multiline
                    value={form.notes}
                    onChangeText={t => setForm({ ...form, notes: t })}
                />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isPending}>
                {isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Record Expense</Text>}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    section: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, ...shadows.sm },
    sectionTitle: { ...typography.h4, marginBottom: spacing.sm, color: colors.primary },
    label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 10 },
    input: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.sm, padding: spacing.sm, fontSize: 16, backgroundColor: colors.background, color: colors.textPrimary },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.borderLight, borderWidth: 1, borderColor: 'transparent' },
    chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
    chipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
    chipTextActive: { color: colors.primary },
    row: { flexDirection: 'row', gap: spacing.md },
    flexHalf: { flex: 1 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
    switchLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    switchSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    saveBtn: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.md },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
