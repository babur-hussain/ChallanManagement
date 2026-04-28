import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useBankAccounts } from '../hooks/api/useFinance';
import { colors, spacing, radius, shadows } from '../lib/theme';

export function BankAccountsScreen() {
    const { data, isLoading, refetch, isRefetching } = useBankAccounts();
    const accounts = data || [];

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={accounts}
                    keyExtractor={item => item._id || item.id}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <Text style={styles.bankName}>{item.bankName || item.name}</Text>
                                <View style={styles.typeBadge}><Text style={styles.typeText}>{item.accountType || item.type}</Text></View>
                            </View>
                            <Text style={styles.accountNo}>{item.accountNumber || item.accountNo}</Text>
                            <Text style={styles.balance}>₹{(item.currentBalance ?? item.balance ?? 0).toLocaleString('en-IN')}</Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ fontSize: 40, marginBottom: 10 }}>🏦</Text>
                            <Text style={{ fontSize: 16, color: colors.textSecondary, fontWeight: 'bold' }}>No Bank Accounts</Text>
                        </View>
                    }
                />
            )}
            <TouchableOpacity style={styles.fab}><Text style={styles.fabText}>+</Text></TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.md },
    card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, ...shadows.sm },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    bankName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    typeBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
    typeText: { color: colors.primaryDark, fontSize: 12, fontWeight: 'bold' },
    accountNo: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },
    balance: { fontSize: 20, fontWeight: 'bold', color: colors.success },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.lg },
    fabText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: -2 },
});
