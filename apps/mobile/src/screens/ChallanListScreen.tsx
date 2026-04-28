import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useChallans } from '../hooks/api/useChallans';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';
import type { IChallan, ChallanStatus } from '@textilepro/shared';

const STATUS_FILTERS: { label: string; value: string }[] = [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Sent', value: 'SENT' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Billed', value: 'BILLED' },
    { label: 'Cancelled', value: 'CANCELLED' },
];

const statusColors: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: '#f3f4f6', text: '#6b7280' },
    SENT: { bg: '#dbeafe', text: '#2563eb' },
    DELIVERED: { bg: '#dcfce7', text: '#16a34a' },
    BILLED: { bg: '#fef3c7', text: '#d97706' },
    CANCELLED: { bg: '#fef2f2', text: '#dc2626' },
};

export function ChallanListScreen({ navigation, route }: any) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const partyId = route?.params?.partyId;

    const filters = {
        page,
        limit: 20,
        ...(search.length >= 2 ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(partyId ? { partyId } : {}),
    };

    const { data, isLoading, refetch, isRefetching } = useChallans(filters);

    const challans = (data as any)?.data || [];
    const pagination = (data as any)?.pagination;
    const stats = (data as any)?.stats;

    const renderChallan = useCallback(({ item }: { item: IChallan }) => {
        const status = statusColors[item.status] || statusColors.DRAFT;
        const lineItems: any[] = (item as any).items || [];
        const displayItems = lineItems.slice(0, 5);
        const remaining = lineItems.length - 5;

        return (
            <TouchableOpacity
                style={styles.challanCard}
                onPress={() => navigation.navigate('ChallanDetail', { id: item._id })}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.challanNumber}>{item.challanNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.text }]}>{item.status}</Text>
                    </View>
                </View>

                <Text style={styles.partyName}>{item.partySnapshot?.name || 'Unknown Party'}</Text>
                {item.partySnapshot?.address?.city && (
                    <Text style={styles.partyCity}>{item.partySnapshot.address.city}</Text>
                )}

                {/* Items Brief */}
                {displayItems.length > 0 && (
                    <View style={styles.itemsBrief}>
                        {displayItems.map((li: any, idx: number) => (
                            <View key={idx} style={styles.itemRow}>
                                <View style={styles.itemDot} />
                                <Text style={styles.itemName} numberOfLines={1}>{li.itemName || li.name || 'Item'}</Text>
                                <Text style={styles.itemQty}>{(li.totalMeters ?? li.quantity ?? 0).toFixed(1)} m</Text>
                                <Text style={styles.itemAmt}>₹{((li.amount ?? (li.totalMeters ?? li.quantity ?? 0) * (li.ratePerMeter ?? li.ratePerUnit ?? 0)) || 0).toLocaleString('en-IN')}</Text>
                            </View>
                        ))}
                        {remaining > 0 && (
                            <Text style={styles.moreItems}>+{remaining} more item{remaining > 1 ? 's' : ''}</Text>
                        )}
                    </View>
                )}

                <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Items</Text>
                        <Text style={styles.metaValue}>{item.totalItems}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Meters</Text>
                        <Text style={styles.metaValue}>{item.totalMeters?.toFixed(1)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Amount</Text>
                        <Text style={[styles.metaValue, { color: colors.success }]}>₹{item.totalAmount?.toLocaleString('en-IN')}</Text>
                    </View>
                </View>

                <Text style={styles.dateText}>
                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
            </TouchableOpacity>
        );
    }, [navigation]);

    return (
        <View style={styles.container}>
            {/* Search */}
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search challans, parties..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={(t) => { setSearch(t); setPage(1); }}
                />
            </View>

            {/* Status filter tabs */}
            <View style={styles.filterSection}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={STATUS_FILTERS}
                    keyExtractor={(item) => item.value}
                    contentContainerStyle={styles.filterRow}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.filterChip, statusFilter === item.value && styles.filterChipActive]}
                            onPress={() => { setStatusFilter(item.value); setPage(1); }}
                        >
                            <Text style={[styles.filterChipText, statusFilter === item.value && styles.filterChipTextActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Summary */}
            {stats && (
                <View style={styles.summaryBar}>
                    <Text style={styles.summaryText}>{stats.totalChallans} challans • {stats.totalMeters?.toFixed(0)} m • ₹{stats.totalAmount?.toLocaleString('en-IN') || 0}</Text>
                </View>
            )}

            {/* List */}
            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={challans}
                    renderItem={renderChallan}
                    keyExtractor={(item: IChallan) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                    contentInsetAdjustmentBehavior="automatic"
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📋</Text>
                            <Text style={styles.emptyTitle}>No Challans Found</Text>
                            <Text style={styles.emptyDesc}>
                                {search ? `No results for "${search}"` : 'Create your first challan to get started.'}
                            </Text>
                        </View>
                    }
                    onEndReached={() => {
                        if (pagination && page < pagination.totalPages) setPage((p) => p + 1);
                    }}
                    onEndReachedThreshold={0.3}
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('ChallanCreate')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    searchBar: { padding: spacing.md },
    searchInput: {
        height: 44, backgroundColor: colors.surface, borderRadius: radius.md,
        paddingHorizontal: spacing.lg, fontSize: 15, color: colors.textPrimary,
        borderWidth: 1, borderColor: colors.border,
    },
    filterSection: { height: 50 },
    filterRow: { paddingHorizontal: spacing.md, alignItems: 'center', gap: spacing.sm },
    filterChip: {
        paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
        borderRadius: radius.full, backgroundColor: colors.surface,
        borderWidth: 1, borderColor: colors.border,
        justifyContent: 'center', alignItems: 'center', height: 36,
    },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 5 },
    filterChipText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
    filterChipTextActive: { color: '#fff', fontWeight: 'bold' },
    summaryBar: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
    summaryText: { ...typography.caption },
    listContent: { padding: spacing.md, paddingBottom: 100 },
    challanCard: {
        backgroundColor: colors.surface, borderRadius: radius.lg,
        padding: spacing.lg, marginBottom: spacing.md, ...shadows.md,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    challanNumber: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
    statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    partyName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    partyCity: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    cardMeta: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.xl },
    metaItem: {},
    metaLabel: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' },
    metaValue: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary, marginTop: 2 },
    dateText: { fontSize: 11, color: colors.textMuted, marginTop: spacing.sm },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { padding: spacing['4xl'], alignItems: 'center' },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textSecondary },
    emptyDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },

    // Items brief
    itemsBrief: {
        marginTop: spacing.sm, backgroundColor: '#f8fafc',
        borderRadius: radius.sm, padding: spacing.sm,
        borderWidth: 1, borderColor: '#e2e8f0',
    },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
    itemDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginRight: 6 },
    itemName: { flex: 1, fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
    itemQty: { fontSize: 11, color: colors.textMuted, marginHorizontal: 6, fontWeight: '600' },
    itemAmt: { fontSize: 12, fontWeight: 'bold', color: colors.textPrimary, minWidth: 60, textAlign: 'right' },
    moreItems: { fontSize: 11, color: colors.primary, fontWeight: '600', marginTop: 2, paddingLeft: 11 },

    fab: {
        position: 'absolute', bottom: 24, right: 24,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center', justifyContent: 'center',
        ...shadows.lg,
    },
    fabText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: -2 },
});
