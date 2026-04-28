import React from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions
} from 'react-native';
import { useInventoryStats } from '../hooks/api/useInventory';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const GRID_GAP = spacing.md;
const CARD_WIDTH = (width - spacing.md * 2 - GRID_GAP) / COLUMN_COUNT;

const MODULES = [
    { id: 'ItemList', label: 'Products', description: 'Universal item catalog', icon: '📦', color: '#8b5cf6', bg: '#f5f3ff' },
    { id: 'StockSummary', label: 'Summary', description: 'Real-time stock & value', icon: '📊', color: '#3b82f6', bg: '#eff6ff' },
    { id: 'Purchases', label: 'Purchases', description: 'Inbound bulk stock', icon: '🛒', color: '#10b981', bg: '#ecfdf5' },
    { id: 'Dispatches', label: 'Dispatches', description: 'Outbound challan usage', icon: '🚚', color: '#f59e0b', bg: '#fffbeb' },
    { id: 'Transfers', label: 'Transfers', description: 'Move between warehouses', icon: '🔄', color: '#06b6d4', bg: '#ecfeff' },
    { id: 'Adjustments', label: 'Adjustments', description: 'Manual stock audits', icon: '⚖️', color: '#f43f5e', bg: '#fff1f2' },
];

export function InventoryScreen({ navigation }: any) {
    const { data: stats, isLoading, refetch, isRefetching } = useInventoryStats();

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
            {/* KPI Summary Grid */}
            <View style={styles.kpiGrid}>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Total Products</Text>
                    <Text style={styles.kpiValue}>{stats?.totalItems || 0}</Text>
                </View>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Total Stock</Text>
                    <Text style={styles.kpiValue}>{stats?.totalStock?.toFixed(0) ?? 0} {(stats?.totalStock ?? 0) > 0 ? 'm' : ''}</Text>
                </View>
                <View style={[styles.kpiCard, { backgroundColor: stats?.lowStockItems ? colors.errorBg : colors.surface }]}>
                    <Text style={[styles.kpiLabel, stats?.lowStockItems ? { color: colors.error } : null]}>Low Stock</Text>
                    <Text style={[styles.kpiValue, stats?.lowStockItems ? { color: colors.error } : null]}>{stats?.lowStockItems || 0}</Text>
                </View>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Stock Value</Text>
                    <Text style={styles.kpiValue}>₹{((stats?.totalStockValue || 0) / 100000).toFixed(1)}L</Text>
                </View>
            </View>

            {/* Modules 2x3 Grid */}
            <Text style={styles.sectionTitle}>Inventory Modules</Text>
            <View style={styles.modulesGrid}>
                {MODULES.map((mod) => {
                    let countInfo = '';
                    if (stats) {
                        if (mod.id === 'ItemList') countInfo = stats.totalItems > 0 ? `${stats.totalItems} items` : '';
                        if (mod.id === 'StockSummary') countInfo = stats.totalItems > 0 ? `${stats.totalItems} items` : '';
                        if (mod.id === 'Purchases') countInfo = stats.totalPurchases > 0 ? `${stats.totalPurchases} records` : '';
                        if (mod.id === 'Dispatches') countInfo = stats.totalDispatches > 0 ? `${stats.totalDispatches} records` : '';
                        if (mod.id === 'Transfers') countInfo = stats.totalTransfers > 0 ? `${stats.totalTransfers} records` : '';
                        if (mod.id === 'Adjustments') countInfo = stats.recentAdjustments > 0 ? `${stats.recentAdjustments} records` : '';
                    }

                    return (
                        <TouchableOpacity
                            key={mod.id}
                            style={[styles.moduleCard, { width: CARD_WIDTH }]}
                            onPress={() => navigation.navigate(mod.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconWrapper, { backgroundColor: mod.bg }]}>
                                <Text style={styles.moduleIcon}>{mod.icon}</Text>
                            </View>
                            <Text style={styles.moduleTitle}>{mod.label}</Text>
                            <Text style={styles.moduleDesc} numberOfLines={2}>{mod.description}</Text>
                            <View style={{ flex: 1 }} />
                            {!!countInfo && <Text style={styles.moduleCount}>{countInfo}</Text>}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: spacing.sm, justifyContent: 'space-between' },
    kpiCard: { width: '48%', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.xl, ...shadows.sm },
    kpiLabel: { ...typography.caption, textTransform: 'uppercase', color: colors.textSecondary },
    kpiValue: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
    sectionTitle: { ...typography.h3, paddingHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.md },
    modulesGrid: {
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: GRID_GAP
    },
    moduleCard: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: radius.xl,
        marginBottom: spacing.xs,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
        minHeight: 160
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md
    },
    moduleIcon: { fontSize: 24 },
    moduleTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 4 },
    moduleDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 16 },
    moduleCount: {
        fontSize: 10,
        color: colors.primary,
        marginTop: spacing.md,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        backgroundColor: colors.surfaceAlt,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        overflow: 'hidden'
    },
});
