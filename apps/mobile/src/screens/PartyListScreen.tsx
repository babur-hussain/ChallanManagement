import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useParties } from '../hooks/api/useParties';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function PartyListScreen({ navigation }: any) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading, refetch, isRefetching } = useParties({ search: search.length >= 2 ? search : undefined, page, limit: 30 });

    const parties = (data as any)?.data || [];
    const pagination = (data as any)?.pagination;

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search parties..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={(t) => { setSearch(t); setPage(1); }}
                />
            </View>

            {isLoading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : (
                <FlatList
                    data={parties}
                    keyExtractor={(item: any) => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                    renderItem={({ item }: any) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate('PartyDetail', { id: item._id })}
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{(item.name || '?').charAt(0).toUpperCase()}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.meta}>{item.shortCode} • {item.city || item.address?.city || ''}</Text>
                                {item.phone && <Text style={styles.phone}>📞 {item.phone}</Text>}
                            </View>
                            <View style={styles.balanceCol}>
                                {item.currentBalance != null && (
                                    <Text style={[styles.balance, item.currentBalance > 0 ? { color: colors.error } : { color: colors.success }]}>
                                        ₹{Math.abs(item.currentBalance).toLocaleString('en-IN')}
                                    </Text>
                                )}
                                <Text style={styles.chevron}>›</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>👥</Text>
                            <Text style={styles.emptyTitle}>No Parties Found</Text>
                        </View>
                    }
                    onEndReached={() => { if (pagination && page < pagination.totalPages) setPage(p => p + 1); }}
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
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
    avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: colors.primaryDark },
    name: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    phone: { fontSize: 12, color: colors.info, marginTop: 2 },
    balanceCol: { alignItems: 'flex-end' },
    balance: { fontSize: 14, fontWeight: 'bold' },
    chevron: { fontSize: 22, color: colors.textMuted, marginTop: 2 },
    empty: { padding: spacing['4xl'], alignItems: 'center' },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary },
});
