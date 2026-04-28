import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useExpenses } from '../hooks/api/useFinance';
import { colors, spacing, radius, shadows, typography } from '../lib/theme';

export function ExpensesScreen() {
    const navigation = useNavigation<any>();
    const { data, isLoading, refetch, isRefetching } = useExpenses();
    const expenses = data || [];

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={expenses}
                    keyExtractor={item => item._id || item.id}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <Text style={styles.category}>{item.category || 'General'}</Text>
                                <Text style={styles.amount}>₹{(item.totalAmount ?? item.amount ?? 0).toLocaleString('en-IN')}</Text>
                            </View>
                            <View style={styles.midRow}>
                                <Text style={styles.vendorName}>{item.vendor || 'No vendor linked'}</Text>
                                <Text style={styles.date}>{new Date(item.date || item.createdAt).toLocaleDateString()}</Text>
                            </View>
                            {!!item.vendorGstIn && (
                                <Text style={styles.gstText}>GSTIN: {item.vendorGstIn}</Text>
                            )}

                            {(item.gstAmount > 0) && (
                                <View style={styles.taxBadgeContainer}>
                                    <View style={styles.taxBadge}>
                                        <Text style={styles.taxBadgeText}>Tax: ₹{(item.gstAmount || 0).toLocaleString('en-IN')}</Text>
                                    </View>
                                    {item.itcEligibility && (
                                        <View style={[styles.taxBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                                            <Text style={[styles.taxBadgeText, { color: colors.primary }]}>ITC Claimable</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {!!item.notes && <Text style={styles.description} numberOfLines={2}>{item.notes || item.description || ''}</Text>}
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ fontSize: 40, marginBottom: 10 }}>💸</Text>
                            <Text style={{ fontSize: 16, color: colors.textSecondary, fontWeight: 'bold' }}>No Expenses Found</Text>
                        </View>
                    }
                />
            )}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ExpenseCreate')}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.md },
    card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.borderLight, ...shadows.sm },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
    midRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
    category: { ...typography.h4, color: colors.textPrimary },
    amount: { fontSize: 18, fontWeight: '800', color: colors.error },
    vendorName: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    gstText: { fontSize: 12, color: colors.primary, fontWeight: 'bold', marginBottom: spacing.xs },
    taxBadgeContainer: { flexDirection: 'row', gap: 6, marginVertical: spacing.sm },
    taxBadge: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight },
    taxBadgeText: { fontSize: 10, color: colors.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' },
    description: { fontSize: 13, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },
    date: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.lg },
    fabText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: -2 },
});
