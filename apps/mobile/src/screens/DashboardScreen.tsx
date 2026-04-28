import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar } from 'react-native';
import { useDashboard } from '../hooks/api/useAnalytics';
import { useAuthStore } from '../stores/authStore';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function DashboardScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const business = useAuthStore((s) => s.business);
  const userRole = (user?.role as string) || 'OWNER';
  const { data: dashboard, isLoading, refetch, isRefetching } = useDashboard();

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
  };

  const formatMeters = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K m`;
    return `${val.toFixed(1)} m`;
  };

  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.masterContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 40) }]}>
        <View>
          <Text style={styles.greeting}>Good {getGreeting()},</Text>
          <Text style={styles.name}>{user?.name || 'Owner'}</Text>
        </View>
        <View style={styles.businessBadge}>
          <Text style={styles.businessName}>{business?.name || 'TextilePro'}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Today Challans</Text>
            <Text style={styles.kpiValue}>{dashboard?.todayChallansCount ?? 0}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Today Meters</Text>
            <Text style={styles.kpiValue}>{formatMeters(dashboard?.todayChallansMeters ?? 0)}</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardDanger]}>
            <Text style={[styles.kpiLabel, { color: colors.error }]}>Outstanding</Text>
            <Text style={[styles.kpiValue, { color: colors.error }]}>{formatCurrency(dashboard?.totalOutstanding ?? 0)}</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardWarning]}>
            <Text style={[styles.kpiLabel, { color: colors.warning }]}>Low Stock</Text>
            <Text style={[styles.kpiValue, { color: colors.warning }]}>{dashboard?.lowStockItemsCount ?? 0} Items</Text>
          </View>
        </View>

        {/* Revenue Snapshot */}
        <View style={styles.revenueCard}>
          <Text style={styles.sectionTitle}>Revenue</Text>
          <View style={styles.revenueRow}>
            <View style={styles.revenueItem}>
              <Text style={styles.revLabel}>This Month</Text>
              <Text style={styles.revValue}>{formatCurrency(dashboard?.thisMonthRevenue ?? 0)}</Text>
            </View>
            <View style={styles.revDivider} />
            <View style={styles.revenueItem}>
              <Text style={styles.revLabel}>Last Month</Text>
              <Text style={styles.revValueMuted}>{formatCurrency(dashboard?.lastMonthRevenue ?? 0)}</Text>
            </View>
            <View style={styles.revDivider} />
            <View style={styles.revenueItem}>
              <Text style={styles.revLabel}>Collection %</Text>
              <Text style={[styles.revValue, { color: colors.success }]}>{(dashboard?.collectionRate ?? 0).toFixed(0)}%</Text>
            </View>
          </View>
        </View>

        {/* Create Hub */}
        {userRole !== 'DELIVERY_BOY' && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Create</Text>
            <View style={styles.createGrid}>
              {[
                { name: 'Challan', icon: '📋', color: '#3b82f6', route: 'ChallanCreate' },
                { name: 'Invoice', icon: '🧾', color: '#10b981', route: 'InvoiceCreate' },
                { name: 'Receipt', icon: '💵', color: '#8b5cf6', route: 'AdvancedReceipt' },
                { name: 'Ledger', icon: '📒', color: '#f59e0b', route: 'LedgerManagement' },
                { name: 'Purchase', icon: '🛒', color: '#ec4899', route: 'PurchaseCreate' },
                { name: 'Return', icon: '↩️', color: '#f43f5e', route: 'InvoiceList' },
                { name: 'Order', icon: '📦', color: '#f97316', route: 'ChallanList' },
                { name: 'Quote', icon: '📝', color: '#0ea5e9', route: 'QuotationList' },
                { name: 'Payment', icon: '💳', color: '#6366f1', route: 'CreateVoucher' },
                { name: 'Party', icon: '👥', color: '#14b8a6', route: 'PartyList' },
                { name: 'Item', icon: '🧵', color: '#64748b', route: 'ItemList' },
                { name: 'Pur. Ret', icon: '🔙', color: '#e11d48', route: 'Purchases' },
              ].map(action => (
                <TouchableOpacity
                  key={action.name}
                  style={[styles.createCard, { backgroundColor: action.color }]}
                  onPress={() => navigation?.navigate?.(action.route as any)}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{action.icon}</Text>
                  <Text style={styles.createText} numberOfLines={1}>{action.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recent Activity Feed */}
        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {(dashboard?.recentFeed ?? []).length === 0 ? (
            <View style={styles.emptyFeed}>
              <Text style={styles.emptyTitle}>No Activity Yet</Text>
              <Text style={styles.emptyDesc}>Create your first challan to see activity here.</Text>
            </View>
          ) : (
            (dashboard?.recentFeed ?? []).slice(0, 5).map((item: any, i: number) => {
              const handlePress = () => {
                if (!item.id) return;
                if (item.type?.startsWith('CHALLAN')) {
                  navigation?.navigate('ChallanDetail', { id: item.id });
                } else if (item.type === 'INVOICE') {
                  navigation?.navigate('InvoiceDetail', { id: item.id });
                }
              };

              return (
                <TouchableOpacity key={item.id || i} style={styles.feedItem} onPress={handlePress}>
                  <View style={styles.feedDot} />
                  <View style={styles.feedContent}>
                    <Text style={styles.feedDesc}>{item.description}</Text>
                    {item.partyName && <Text style={styles.feedParty}>{item.partyName}</Text>}
                    <Text style={styles.feedTime}>{formatTimestamp(item.timestamp)}</Text>
                  </View>
                  {item.amountInfo && <Text style={styles.feedAmount}>{item.amountInfo}</Text>}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function formatTimestamp(ts: string): string {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  masterContainer: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  loadingText: { ...typography.bodySmall, marginTop: spacing.md },

  header: {
    padding: spacing.xl,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  greeting: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { color: colors.textPrimary, fontSize: 28, fontWeight: '900', marginTop: 4 },
  businessBadge: { backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  businessName: { color: colors.textPrimary, fontSize: 12, fontWeight: '700' },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: spacing.sm },
  kpiCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  kpiCardDanger: { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: '#fee2e2' },
  kpiCardWarning: { backgroundColor: colors.warningBg, borderWidth: 1, borderColor: '#fde68a' },
  kpiLabel: { ...typography.caption, textTransform: 'uppercase' },
  kpiValue: { fontSize: 22, fontWeight: 'bold', marginTop: 4, color: colors.textPrimary },

  revenueCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  sectionTitle: { ...typography.h4, marginBottom: spacing.md },
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between' },
  revenueItem: { flex: 1, alignItems: 'center' },
  revDivider: { width: 1, backgroundColor: colors.border },
  revLabel: { ...typography.caption },
  revValue: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginTop: 4 },
  revValueMuted: { fontSize: 18, fontWeight: '600', color: colors.textSecondary, marginTop: 4 },

  actionsSection: { padding: spacing.md, paddingBottom: 0 },
  createGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 },
  createCard: {
    width: '23%',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3,
  },
  createText: { fontSize: 10, fontWeight: '800', color: '#ffffff', textAlign: 'center' },

  feedSection: { padding: spacing.md },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  feedDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6, marginRight: spacing.md,
  },
  feedContent: { flex: 1 },
  feedDesc: { fontSize: 14, color: colors.textPrimary },
  feedParty: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  feedTime: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  feedAmount: { fontSize: 14, fontWeight: 'bold', color: colors.success },

  emptyFeed: { padding: spacing['2xl'], alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary },
  emptyDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
});
