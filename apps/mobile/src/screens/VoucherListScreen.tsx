import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../lib/api';
import { colors, spacing, radius, shadows } from '../lib/theme';
import dayjs from 'dayjs';

export function VoucherListScreen() {
    const navigation = useNavigation<any>();
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState('ALL');

    const fetchVouchers = async () => {
        try {
            const response = await api.get('/journal', { params: { limit: 100 } });
            const respData = response.data?.data || response.data;
            const fetched = respData?.entries || respData || [];
            setVouchers(Array.isArray(fetched) ? fetched : []);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchVouchers);
        fetchVouchers();
        return unsubscribe;
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchVouchers();
    }, []);

    const filteredVouchers = useMemo(() => {
        if (filter === 'ALL') return vouchers;
        return vouchers.filter(v => v.voucherType === filter);
    }, [vouchers, filter]);

    const totals = useMemo(() => {
        let cashIn = 0;
        let cashOut = 0;
        (vouchers || []).forEach(v => {
            const sum = v.entries?.reduce((s: number, l: any) => s + (l.debit || 0), 0) || 0;
            if (v.voucherType === 'RECEIPT') cashIn += sum;
            if (v.voucherType === 'PAYMENT') cashOut += sum;
        });
        return { cashIn, cashOut };
    }, [vouchers]);

    const renderHeader = () => (
        <View style={styles.dashboardContainer}>
            <View style={styles.dashboardCard}>
                <Text style={styles.dashboardTitle}>Metrics Overview</Text>
                <View style={styles.metricsRow}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Total In (Receipts)</Text>
                        <Text style={[styles.metricValue, { color: '#4ade80' }]}>₹{totals.cashIn.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Total Out (Payments)</Text>
                        <Text style={[styles.metricValue, { color: '#f87171' }]}>₹{totals.cashOut.toLocaleString('en-IN')}</Text>
                    </View>
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
                {['ALL', 'RECEIPT', 'PAYMENT', 'CONTRA', 'JOURNAL'].map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, filter === f && styles.filterChipActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f === 'ALL' ? 'All Transactions' : f.charAt(0) + f.slice(1).toLowerCase() + 's'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const getVoucherConfig = (type: string) => {
        switch (type) {
            case 'RECEIPT': return { color: '#16a34a', icon: '↓', bg: '#f0fdf4' };
            case 'PAYMENT': return { color: '#dc2626', icon: '↑', bg: '#fef2f2' };
            case 'CONTRA': return { color: '#0284c7', icon: '⇄', bg: '#e0f2fe' };
            default: return { color: '#d97706', icon: '📝', bg: '#fffbeb' };
        }
    };

    const renderVoucher = ({ item }: { item: any }) => {
        const totalAmount = item.entries?.reduce((sum: number, line: any) => sum + (line.debit || 0), 0) || 0;
        const config = getVoucherConfig(item.voucherType);

        let partyName = item.narration || `${item.voucherType} Entry`;

        // Find an explicit linked entity (like Party)
        const partyEntry = item.entries?.find((e: any) => e.linkedEntityId?.name);
        if (partyEntry) {
            partyName = partyEntry.linkedEntityId.name;
        } else {
            // Find an account that isn't CASH/BANK/SALES
            const mainEntry = item.entries?.find((e: any) =>
                e.accountId &&
                !e.accountId.includes('CASH') &&
                !e.accountId.includes('BANK') &&
                !e.accountId.includes('GST') &&
                e.accountId !== 'SALES' &&
                e.accountId !== 'PURCHASE'
            );
            if (mainEntry && typeof mainEntry.accountId === 'string' && mainEntry.accountId.length > 2) {
                partyName = mainEntry.accountId;
            }
        }

        // Apply title case to unmapped ALL_CAPS account names or narrations
        if (typeof partyName === 'string' && partyName === partyName.toUpperCase()) {
            partyName = partyName.replace(/_/g, ' ');
            partyName = partyName.charAt(0) + partyName.slice(1).toLowerCase();
        }

        return (
            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
                    <Text style={[styles.iconText, { color: config.color }]}>{config.icon}</Text>
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.partyName} numberOfLines={2}>{partyName}</Text>
                        <Text style={[styles.amount, { color: config.color }]}>₹{totalAmount.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.cardSubHeader}>
                        <Text style={styles.voucherTypeBadge}>{item.voucherType}  •  {item.voucherNumber}</Text>
                    </View>
                    <View style={styles.cardFooter}>
                        <Text style={styles.dateText}>{dayjs(item.date).format('DD MMM YYYY, hh:mm A')}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {isLoading && !isRefreshing ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
            ) : (
                <FlatList
                    data={filteredVouchers}
                    keyExtractor={item => item._id}
                    renderItem={renderVoucher}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    contentInsetAdjustmentBehavior="automatic"
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>No {filter !== 'ALL' ? filter.toLowerCase() : ''} vouchers found.</Text>}
                />
            )}

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateVoucher')} activeOpacity={0.8}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    listContent: { paddingBottom: 100, paddingTop: 16 }, // Padding top for large header spacing

    // Header Dashboard
    dashboardContainer: { paddingHorizontal: spacing.md, marginBottom: 8 },
    dashboardCard: {
        backgroundColor: '#0f172a',
        borderRadius: radius.xl, padding: spacing.xl,
        ...shadows.md, marginBottom: 8
    },
    dashboardTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginBottom: 18, textTransform: 'uppercase', letterSpacing: 1 },
    metricsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    metricCard: { flex: 1 },
    metricDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: spacing.lg },
    metricLabel: { fontSize: 13, color: '#e2e8f0', marginBottom: 6, fontWeight: '500' },
    metricValue: { fontSize: 24, fontWeight: '800', letterSpacing: -1 },

    // Filters
    filterScroll: { marginBottom: 8 },
    filterContainer: { gap: 8, paddingHorizontal: 4, paddingVertical: 4 },
    filterChip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0',
        ...shadows.sm
    },
    filterChipActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
    filterText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    filterTextActive: { color: '#fff' },

    // Lists
    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', marginHorizontal: spacing.md, marginBottom: 12,
        padding: spacing.lg, borderRadius: radius.xl,
        borderWidth: 1, borderColor: '#f1f5f9',
        ...shadows.sm
    },
    iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    iconText: { fontSize: 24, fontWeight: 'bold' },
    cardContent: { flex: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
    partyName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, flex: 1, marginRight: 8, lineHeight: 20 },
    amount: { fontSize: 16, fontWeight: '800' },
    cardSubHeader: { marginBottom: 6 },
    voucherTypeBadge: { fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 0.5 },
    cardFooter: { flexDirection: 'row', alignItems: 'center' },
    dateText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
    emptyText: { textAlign: 'center', marginTop: 80, color: colors.textMuted, fontSize: 15 },

    // FAB
    fab: {
        position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 20, right: 20,
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center',
        ...shadows.lg, zIndex: 100
    },
    fabIcon: { color: '#fff', fontSize: 36, fontWeight: '300', marginTop: -4 }
});
