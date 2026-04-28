import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useItems } from '../hooks/api/useItems';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function ItemListScreen({ navigation }: any) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading, refetch, isRefetching } = useItems({ search: search.length >= 2 ? search : undefined, page, limit: 30 } as any);

    const items = (data as any)?.data || [];

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search items / qualities..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={(t) => { setSearch(t); setPage(1); }}
                />
            </View>

            {isLoading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item: any) => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                    renderItem={({ item }: any) => (
                        <View style={styles.card}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.meta}>{item.code || ''} {item.hsnCode ? `• HSN: ${item.hsnCode}` : ''}</Text>
                                {item.category && <Text style={styles.category}>📁 {item.category?.name || item.category}</Text>}
                            </View>
                            <View style={styles.priceCol}>
                                {item.sellingPrice != null && (
                                    <Text style={styles.price}>₹{item.sellingPrice}/m</Text>
                                )}
                                {item.currentStock != null && (
                                    <Text style={[styles.stock, item.currentStock <= (item.reorderLevel || 0) ? { color: colors.error } : {}]}>
                                        {item.currentStock} in stock
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>📦</Text>
                            <Text style={styles.emptyTitle}>No Items Found</Text>
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
    card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, ...shadows.sm },
    name: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    category: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    priceCol: { alignItems: 'flex-end', justifyContent: 'center' },
    price: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
    stock: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    empty: { padding: spacing['4xl'], alignItems: 'center' },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary },
});
