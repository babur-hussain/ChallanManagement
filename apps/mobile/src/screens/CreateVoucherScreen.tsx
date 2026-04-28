import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function CreateVoucherScreen() {
    const navigation = useNavigation<any>();
    const [voucherType, setVoucherType] = useState('RECEIPT');
    const [narration, setNarration] = useState('');
    const [amount, setAmount] = useState('');

    const [debitAccount, setDebitAccount] = useState('CASH');
    const [creditAccount, setCreditAccount] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTypeChange = (type: string) => {
        setVoucherType(type);
        if (type === 'RECEIPT') {
            setDebitAccount('CASH');
            setCreditAccount('');
        } else if (type === 'PAYMENT') {
            setDebitAccount('');
            setCreditAccount('CASH');
        } else if (type === 'CONTRA') {
            setDebitAccount('CASH');
            setCreditAccount('HDFC_BANK');
        } else {
            setDebitAccount('');
            setCreditAccount('');
        }
    };

    const submitVoucher = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid positive amount.');
            return;
        }
        if (!narration.trim()) {
            Alert.alert('Validation Error', 'Narration is required to provide an audit trail.');
            return;
        }
        if (!debitAccount.trim() || !creditAccount.trim()) {
            Alert.alert('Validation Error', 'Both Debit and Credit accounts must be specified.');
            return;
        }

        setIsSubmitting(true);
        try {
            const numAmount = Number(amount);
            const entries = [
                { accountId: debitAccount.toUpperCase().trim(), debit: numAmount, credit: 0 },
                { accountId: creditAccount.toUpperCase().trim(), debit: 0, credit: numAmount }
            ];

            await api.post('/journal', { voucherType, narration, entries });
            navigation.goBack();
        } catch (error: any) {
            console.error('Submit Error:', error);
            Alert.alert('Transaction Failed', error?.response?.data?.message || 'Failed to post voucher.');
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
                    <Text style={styles.headerTitle}>New Voucher</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    <View style={styles.typeSelector}>
                        {['RECEIPT', 'PAYMENT', 'CONTRA', 'JOURNAL'].map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.typeBtn, voucherType === type && styles.typeBtnActive]}
                                onPress={() => handleTypeChange(type)}
                            >
                                <Text style={[styles.typeBtnText, voucherType === type && styles.typeBtnTextActive]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={[styles.card, { borderColor: '#16a34a', borderWidth: voucherType === 'RECEIPT' ? 1 : 0 }]}>
                        <View style={styles.cardHeader}>
                            <View style={styles.drCrBadge}><Text style={styles.drText}>DR</Text></View>
                            <Text style={styles.cardLabel}>Debit Account (Receiving)</Text>
                        </View>
                        <TextInput
                            style={styles.inputLarge}
                            value={debitAccount}
                            onChangeText={setDebitAccount}
                            placeholder="e.g. CASH / HDFC BANK"
                            autoCapitalize="characters"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View style={[styles.card, { borderColor: '#dc2626', borderWidth: voucherType === 'PAYMENT' ? 1 : 0 }]}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.drCrBadge, { backgroundColor: '#fef2f2' }]}><Text style={styles.crText}>CR</Text></View>
                            <Text style={styles.cardLabel}>Credit Account (Giving)</Text>
                        </View>
                        <TextInput
                            style={styles.inputLarge}
                            value={creditAccount}
                            onChangeText={setCreditAccount}
                            placeholder="e.g. SALES / VENDOR NAME"
                            autoCapitalize="characters"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>Transaction Details</Text>

                        <View style={styles.amountContainer}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <TextInput
                                style={styles.amountInput}
                                keyboardType="decimal-pad"
                                value={amount}
                                onChangeText={setAmount}
                                placeholder="0.00"
                                placeholderTextColor="#cbd5e1"
                            />
                        </View>

                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            multiline
                            value={narration}
                            onChangeText={setNarration}
                            placeholder="Enter detailed narration for audit..."
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                        onPress={submitVoucher}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitBtnText}>{isSubmitting ? 'Posting Ledger...' : 'Post Transaction'}</Text>
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
    scroll: { padding: spacing.lg },

    // Selector
    typeSelector: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: radius.lg, padding: 4, marginBottom: spacing.xl },
    typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.md },
    typeBtnActive: { backgroundColor: '#0f172a', ...shadows.sm },
    typeBtnText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
    typeBtnTextActive: { color: '#fff' },

    // Cards
    card: { backgroundColor: '#fff', padding: spacing.lg, borderRadius: radius.xl, marginBottom: spacing.lg, ...shadows.sm },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    drCrBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10 },
    drText: { fontSize: 12, fontWeight: '800', color: '#16a34a', letterSpacing: 0.5 },
    crText: { fontSize: 12, fontWeight: '800', color: '#dc2626', letterSpacing: 0.5 },
    cardLabel: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
    label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

    inputLarge: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12 },
    input: { backgroundColor: '#f1f5f9', borderRadius: radius.md, padding: 14, fontSize: 15, color: colors.textPrimary },

    amountContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: radius.lg, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    currencySymbol: { fontSize: 36, fontWeight: '800', color: '#94a3b8', marginRight: 10 },
    amountInput: { flex: 1, fontSize: 44, fontWeight: '800', color: '#0f172a', paddingVertical: 16 },

    footer: { padding: spacing.lg, paddingBottom: Platform.OS === 'ios' ? 30 : spacing.lg, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    submitBtn: { backgroundColor: '#0f172a', paddingVertical: 18, borderRadius: radius.xl, alignItems: 'center', ...shadows.md },
    submitBtnDisabled: { opacity: 0.7 },
    submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 }
});
