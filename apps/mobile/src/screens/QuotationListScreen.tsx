import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ActivityIndicator,
} from 'react-native';
import { useQuotations } from '../hooks/api/useQuotations';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

const statusColors: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: '#f3f4f6', text: '#6b7280' },
    SENT: { bg: '#dbeafe', text: '#2563eb' },
    ACCEPTED: { bg: '#dcfce7', text: '#16a34a' },
    REJECTED: { bg: '#fef2f2', text: '#dc2626' },
    EXPIRED: { bg: '#fef3c7', text: '#d97706' },
    CONVERTED: { bg: '#e0e7ff', text: '#4f46e5' },
};

export function QuotationListScreen({ navigation }: any) {
    const [page, setPage] = useState(1);
    const { data, isLoading, refetch, isRefetching } = useQuotations({ page, limit: 20 });

    const quotations = (data as any)?.data || [];
    const stats = (data as any)?.stats;

    return (
        <View style={styles.container}>
            {stats && (
                <View style={styles.summaryBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total</Text>
                        <Text style={styles.statValue}>{stats.totalQuotations}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Pipeline</Text>
                        <Text style={[styles.statValue, { color: colors.primary }]}>₹{(stats.totalAmount / 1000).toFixed(0)}K</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Avg</Text>
                        <Text style={styles.statValue}>₹{(stats.avgAmount / 1000).toFixed(0)}K</Text>
                    </View>
                </View>
            )}

            {isLoading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : (
                <FlatList
                    data={quotations}
                    keyExtractor={(item: any) => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                    renderItem={({ item }: any) => {
                        const sc = statusColors[item.status] || statusColors.DRAFT;
                        return (
                            <TouchableOpacity style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.quotNumber}>{item.quotationNumber}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                                        <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
                                    </View>
                                </View>
                                <Text style={styles.partyName}>{item.partySnapshot?.name || 'Unknown'}</Text>
                                <View style={styles.metaRow}>
                                    <Text style={styles.amount}>₹{item.totalAmount?.toLocaleString('en-IN')}</Text>
                                    <Text style={styles.items}>{item.items?.length || 0} items</Text>
                                </View>
                                <Text style={styles.dateText}>
                                    {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    {item.validUntil && ` • Valid until ${new Date(item.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>📝</Text>
                            <Text style={styles.emptyTitle}>No Quotations</Text>
                            <Text style={styles.emptyDesc}>Create quotations to send pricing to your parties.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    summaryBar: { flexDirection: 'row', backgroundColor: colors.surface, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    statItem: { flex: 1, alignItems: 'center' },
    statLabel: { ...typography.caption },
    statValue: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginTop: 2 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: spacing.md },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, ...shadows.sm },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    quotNumber: { fontSize: 15, fontWeight: 'bold', color: colors.indigo },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
    statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    partyName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
    amount: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    items: { fontSize: 13, color: colors.textSecondary },
    dateText: { fontSize: 11, color: colors.textMuted, marginTop: spacing.xs },
    empty: { padding: spacing['4xl'], alignItems: 'center' },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary },
    emptyDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
});
