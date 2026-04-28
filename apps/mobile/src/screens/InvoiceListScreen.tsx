import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ActivityIndicator,
} from 'react-native';
import { useInvoices } from '../hooks/api/useInvoices';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

const statusColors: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: '#f3f4f6', text: '#6b7280' },
    SENT: { bg: '#dbeafe', text: '#2563eb' },
    ACTIVE: { bg: '#dbeafe', text: '#2563eb' },
    PAID: { bg: '#dcfce7', text: '#16a34a' },
    PARTIALLY_PAID: { bg: '#fef3c7', text: '#d97706' },
    OVERDUE: { bg: '#fef2f2', text: '#dc2626' },
    CANCELLED: { bg: '#fef2f2', text: '#dc2626' },
};

export function InvoiceListScreen({ navigation, route }: any) {
    const [page, setPage] = useState(1);
    const partyId = route?.params?.partyId;
    const { data, isLoading, refetch, isRefetching } = useInvoices({ page, limit: 50, ...(partyId ? { partyId } : {}) });

    const invoices = (data as any)?.data || [];

    // Compute stats from the actual data to be reliable
    const computedStats = useMemo(() => {
        const total = invoices.length;
        const totalAmount = invoices.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);
        const totalDue = invoices.reduce((s: number, i: any) => s + (i.balanceDue || 0), 0);
        const totalPaid = totalAmount - totalDue;
        const overdueCount = invoices.filter((i: any) => i.status === 'OVERDUE').length;
        return { total, totalAmount, totalDue, totalPaid, overdueCount };
    }, [invoices]);

    const renderInvoiceCard = ({ item }: any) => {
        const sc = statusColors[item.status] || statusColors.DRAFT;
        const itemsList = item.items || [];
        const displayItems = itemsList.slice(0, 5);
        const remaining = itemsList.length - 5;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('InvoiceDetail', { id: item._id })}
                activeOpacity={0.7}
            >
                {/* Header */}
                <View style={styles.cardHeader}>
                    <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                        <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
                    </View>
                </View>

                <Text style={styles.partyName}>{item.partySnapshot?.name || 'Unknown'}</Text>

                {/* Items Brief */}
                {displayItems.length > 0 && (
                    <View style={styles.itemsBrief}>
                        {displayItems.map((li: any, idx: number) => (
                            <View key={idx} style={styles.itemRow}>
                                <View style={styles.itemDot} />
                                <Text style={styles.itemName} numberOfLines={1}>{li.itemName || 'Item'}</Text>
                                <Text style={styles.itemQty}>{li.quantity || 0} {li.unit === 'METERS' ? 'm' : li.unit || ''}</Text>
                                <Text style={styles.itemAmt}>₹{(li.amount || ((li.quantity || 0) * (li.ratePerUnit || 0))).toLocaleString('en-IN')}</Text>
                            </View>
                        ))}
                        {remaining > 0 && (
                            <Text style={styles.moreItems}>+{remaining} more item{remaining > 1 ? 's' : ''}</Text>
                        )}
                    </View>
                )}

                {/* Amount */}
                <View style={styles.amountRow}>
                    <Text style={styles.amount}>₹{(item.totalAmount || 0).toLocaleString('en-IN')}</Text>
                    {(item.balanceDue || 0) > 0 && (
                        <Text style={styles.due}>Due: ₹{item.balanceDue?.toLocaleString('en-IN')}</Text>
                    )}
                </View>

                <Text style={styles.dateText}>
                    {new Date(item.invoiceDate || item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Summary Bar */}
            <View style={styles.summaryBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total</Text>
                    <Text style={styles.statValue}>{computedStats.total}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Amount</Text>
                    <Text style={[styles.statValue, { color: colors.textPrimary }]}>₹{(computedStats.totalAmount / 1000).toFixed(1)}K</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Due</Text>
                    <Text style={[styles.statValue, { color: colors.error }]}>₹{(computedStats.totalDue / 1000).toFixed(1)}K</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Paid</Text>
                    <Text style={[styles.statValue, { color: colors.success }]}>₹{(computedStats.totalPaid / 1000).toFixed(1)}K</Text>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : (
                <FlatList
                    data={invoices}
                    keyExtractor={(item: any) => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                    renderItem={renderInvoiceCard}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>🧾</Text>
                            <Text style={styles.emptyTitle}>No Invoices Yet</Text>
                            <Text style={styles.emptyDesc}>Invoices will appear here when you bill challans.</Text>
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
    list: { padding: spacing.md, paddingBottom: 40 },
    card: {
        backgroundColor: colors.surface, borderRadius: radius.lg,
        padding: spacing.lg, marginBottom: spacing.md,
        ...shadows.sm, borderWidth: 1, borderColor: colors.borderLight,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
    invoiceNumber: { fontSize: 15, fontWeight: 'bold', color: colors.primary },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
    statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    partyName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },

    // Items brief
    itemsBrief: {
        marginTop: spacing.sm, backgroundColor: '#f8fafc',
        borderRadius: radius.sm, padding: spacing.sm,
        borderWidth: 1, borderColor: '#e2e8f0',
    },
    itemRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 3,
    },
    itemDot: {
        width: 5, height: 5, borderRadius: 3,
        backgroundColor: colors.primary, marginRight: 6,
    },
    itemName: { flex: 1, fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
    itemQty: { fontSize: 11, color: colors.textMuted, marginHorizontal: 6, fontWeight: '600' },
    itemAmt: { fontSize: 12, fontWeight: 'bold', color: colors.textPrimary, minWidth: 60, textAlign: 'right' },
    moreItems: { fontSize: 11, color: colors.primary, fontWeight: '600', marginTop: 2, paddingLeft: 11 },

    amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm, alignItems: 'center' },
    amount: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    due: { fontSize: 14, fontWeight: '600', color: colors.error },
    dateText: { fontSize: 11, color: colors.textMuted, marginTop: spacing.xs },
    empty: { padding: spacing['4xl'], alignItems: 'center' },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary },
    emptyDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
});
