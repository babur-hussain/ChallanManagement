import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    RefreshControl, ActivityIndicator, FlatList,
} from 'react-native';
import { useCollectionsDashboard, useOutstandingParties } from '../hooks/api/useCollectionsInventoryWhatsApp';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function CollectionsScreen({ navigation }: any) {
    const { data: dashboard, isLoading: dashLoading, refetch, isRefetching } = useCollectionsDashboard();
    const { data: outstanding, isLoading: outLoading } = useOutstandingParties({ limit: 20 });

    const parties = (outstanding as any)?.data || [];
    const isLoading = dashLoading || outLoading;

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
            {/* KPI Cards */}
            <View style={styles.kpiGrid}>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Total Outstanding</Text>
                    <Text style={[styles.kpiValue, { color: colors.error }]}>₹{((dashboard?.totalOutstanding || 0) / 1000).toFixed(0)}K</Text>
                </View>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Collected (Month)</Text>
                    <Text style={[styles.kpiValue, { color: colors.success }]}>₹{((dashboard?.collectedThisMonth || 0) / 1000).toFixed(0)}K</Text>
                </View>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Overdue</Text>
                    <Text style={[styles.kpiValue, { color: colors.error }]}>{dashboard?.overdueParties || 0} parties</Text>
                </View>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Collection Rate</Text>
                    <Text style={styles.kpiValue}>{(dashboard?.collectionRate || 0).toFixed(0)}%</Text>
                </View>
            </View>

            {/* Outstanding Parties */}
            <Text style={styles.sectionTitle}>Outstanding Parties</Text>
            {parties.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>✅</Text>
                    <Text style={styles.emptyTitle}>All Clear!</Text>
                    <Text style={styles.emptyDesc}>No outstanding balances.</Text>
                </View>
            ) : (
                parties.map((p: any) => (
                    <View key={p._id || p.partyId} style={styles.partyCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.partyName}>{p.partyName || p.name}</Text>
                            <Text style={styles.partySub}>
                                {p.lastTransactionDays != null ? `Last txn ${p.lastTransactionDays} days ago` : ''}
                            </Text>
                        </View>
                        <View style={styles.balanceCol}>
                            <Text style={styles.balance}>₹{(p.outstandingAmount || p.balance || 0).toLocaleString('en-IN')}</Text>
                            {p.overdueDays > 0 && <Text style={styles.overdue}>{p.overdueDays}d overdue</Text>}
                        </View>
                    </View>
                ))
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: spacing.sm },
    kpiCard: { width: '48%', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...shadows.sm },
    kpiLabel: { ...typography.caption, textTransform: 'uppercase' },
    kpiValue: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginTop: 4 },
    sectionTitle: { ...typography.h4, paddingHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm },
    partyCard: { flexDirection: 'row', backgroundColor: colors.surface, marginHorizontal: spacing.md, padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.sm, ...shadows.sm },
    partyName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    partySub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    balanceCol: { alignItems: 'flex-end' },
    balance: { fontSize: 16, fontWeight: 'bold', color: colors.error },
    overdue: { fontSize: 11, color: colors.error, marginTop: 2 },
    empty: { padding: spacing['4xl'], alignItems: 'center' },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary },
    emptyDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
