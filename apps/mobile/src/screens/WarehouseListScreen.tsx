import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useWarehouses } from '../hooks/api/useWarehouses';
import { colors, spacing, radius, shadows } from '../lib/theme';

export function WarehouseListScreen() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading, refetch, isRefetching } = useWarehouses({ search: search.length >= 2 ? search : undefined, page, limit: 30 });

    const warehouses = (data as any)?.data || [];

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search warehouses..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={(t) => { setSearch(t); setPage(1); }}
                />
            </View>

            {isLoading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : (
                <FlatList
                    data={warehouses}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <Text style={styles.name}>{item.name}</Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
                                </View>
                            </View>
                            {item.address?.city && <Text style={styles.info}>📍 {item.address.city}</Text>}
                            <Text style={styles.info}>📦 Manager: {item.managerName || 'Unassigned'}</Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>🏭</Text>
                            <Text style={styles.emptyTitle}>No Warehouses Found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    searchBar: { padding: spacing.md },
    searchInput: { height: 44, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: spacing.md },
    card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, ...shadows.sm },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    name: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    info: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
    badge: { backgroundColor: colors.successBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
    badgeText: { color: colors.success, fontSize: 12, fontWeight: 'bold' },
    empty: { padding: spacing['4xl'], alignItems: 'center' },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary },
});
