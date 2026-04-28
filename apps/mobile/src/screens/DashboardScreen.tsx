import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar, Image } from 'react-native';
import { SvgXml } from 'react-native-svg';

const RECEIPT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="#000000" d="M142 66.2C150.5 62.3 160.5 63.7 167.6 69.8L208 104.4L248.4 69.8C257.4 62.1 270.7 62.1 279.6 69.8L320 104.4L360.4 69.8C369.4 62.1 382.6 62.1 391.6 69.8L432 104.4L472.4 69.8C479.5 63.7 489.5 62.3 498 66.2C506.5 70.1 512 78.6 512 88L512 552C512 561.4 506.5 569.9 498 573.8C489.5 577.7 479.5 576.3 472.4 570.2L432 535.6L391.6 570.2C382.6 577.9 369.4 577.9 360.4 570.2L320 535.6L279.6 570.2C270.6 577.9 257.3 577.9 248.4 570.2L208 535.6L167.6 570.2C160.5 576.3 150.5 577.7 142 573.8C133.5 569.9 128 561.4 128 552L128 88C128 78.6 133.5 70.1 142 66.2zM232 200C218.7 200 208 210.7 208 224C208 237.3 218.7 248 232 248L408 248C421.3 248 432 237.3 432 224C432 210.7 421.3 200 408 200L232 200zM208 416C208 429.3 218.7 440 232 440L408 440C421.3 440 432 429.3 432 416C432 402.7 421.3 392 408 392L232 392C218.7 392 208 402.7 208 416zM232 296C218.7 296 208 306.7 208 320C208 333.3 218.7 344 232 344L408 344C421.3 344 432 333.3 432 320C432 306.7 421.3 296 408 296L232 296z"/></svg>`;
const PURCHASE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free 7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="#000000" d="M256 144C256 108.7 284.7 80 320 80C355.3 80 384 108.7 384 144L384 192L256 192L256 144zM208 192L144 192C117.5 192 96 213.5 96 240L96 448C96 501 139 544 192 544L448 544C501 544 544 501 544 448L544 240C544 213.5 522.5 192 496 192L432 192L432 144C432 82.1 381.9 32 320 32C258.1 32 208 82.1 208 144L208 192zM232 240C245.3 240 256 250.7 256 264C256 277.3 245.3 288 232 288C218.7 288 208 277.3 208 264C208 250.7 218.7 240 232 240zM384 264C384 250.7 394.7 240 408 240C421.3 240 432 250.7 432 264C432 277.3 421.3 288 408 288C394.7 288 384 277.3 384 264z"/></svg>`;
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
                { name: 'Challan', image: require('../../assets/challan.png'), removedBackground: true, route: 'ChallanCreate' },
                { name: 'Invoice', image: require('../../assets/bill.png'), removedBackground: true, route: 'InvoiceCreate' },
                { name: 'Receipt', svgXml: RECEIPT_SVG, removedBackground: true, route: 'AdvancedReceipt' },
                { name: 'Purchase', svgXml: PURCHASE_SVG, removedBackground: true, route: 'PurchaseCreate' },
                { name: 'Sales Return', image: require('../../assets/return.png'), removedBackground: true, route: 'InvoiceList' },
                { name: 'Order', image: require('../../assets/checklist.png'), removedBackground: true, route: 'ChallanList' },
                { name: 'Quotation', image: require('../../assets/quotation.png'), removedBackground: true, route: 'QuotationList' },
                { name: 'Payment', image: require('../../assets/atm-card.png'), removedBackground: true, route: 'CreateVoucher' },
                { name: 'Party', image: require('../../assets/user.png'), removedBackground: true, route: 'PartyList' },
                { name: 'Item', image: require('../../assets/product.png'), removedBackground: true, route: 'ItemList' },
                { name: 'Purchase Return', image: require('../../assets/purchase return.png'), removedBackground: true, route: 'Purchases' },
                { name: 'DummyPlaceholder', invisible: true }
              ].map((action: any, index: number) => {
                if (action.invisible) {
                  return <View key={`dummy-${index}`} style={[styles.createCard, { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }]} />;
                }
                return (
                  <TouchableOpacity
                    key={action.name}
                    style={[
                      styles.createCard,
                      { backgroundColor: action.removedBackground ? 'transparent' : action.color },
                      action.removedBackground && { elevation: 0, shadowOpacity: 0 }
                    ]}
                    onPress={() => navigation?.navigate?.(action.route)}
                  >
                    {action.svgXml ? (
                      <View style={{ marginBottom: 4 }}><SvgXml xml={action.svgXml} width={30} height={30} /></View>
                    ) : action.image ? (
                      <Image source={action.image} style={{ width: 30, height: 30, marginBottom: 4 }} resizeMode="contain" />
                    ) : (
                      <Text style={{ fontSize: 24, marginBottom: 4 }}>{action.icon}</Text>
                    )}
                    <Text style={[styles.createText, action.removedBackground && { color: '#000000' }]} numberOfLines={2}>{action.name}</Text>
                  </TouchableOpacity>
                );
              })}
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
