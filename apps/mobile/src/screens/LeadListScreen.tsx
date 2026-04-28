import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useLeads } from '../hooks/api/useCRM';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

const stageColors: Record<string, { bg: string; text: string }> = {
    NEW: { bg: '#dbeafe', text: '#2563eb' },
    CONTACTED: { bg: '#e0e7ff', text: '#4f46e5' },
    QUALIFIED: { bg: '#fef3c7', text: '#d97706' },
    PROPOSAL: { bg: '#fed7aa', text: '#ea580c' },
    NEGOTIATION: { bg: '#fecaca', text: '#dc2626' },
    WON: { bg: '#dcfce7', text: '#16a34a' },
    LOST: { bg: '#f3f4f6', text: '#6b7280' },
};

export function LeadListScreen({ navigation }: any) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading, refetch, isRefetching } = useLeads({ search: search.length >= 2 ? search : undefined, page, limit: 20 });

    const leads = (data as any)?.data || [];

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search leads..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={(t) => { setSearch(t); setPage(1); }}
                />
            </View>

            {isLoading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
            ) : (
                <FlatList
                    data={leads}
                    keyExtractor={(item: any) => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                    renderItem={({ item }: any) => {
                        const stage = stageColors[item.stage] || stageColors.NEW;
                        return (
                            <TouchableOpacity style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.leadName}>{item.companyName || item.contactName || 'Unknown'}</Text>
                                    <View style={[styles.stageBadge, { backgroundColor: stage.bg }]}>
                                        <Text style={[styles.stageText, { color: stage.text }]}>{item.stage}</Text>
                                    </View>
                                </View>
                                {item.contactName && <Text style={styles.contact}>{item.contactName}</Text>}
                                {item.phone && <Text style={styles.phone}>📞 {item.phone}</Text>}
                                <View style={styles.metaRow}>
                                    {item.estimatedValue && <Text style={styles.value}>₹{item.estimatedValue.toLocaleString('en-IN')}</Text>}
                                    {item.source && <Text style={styles.source}>via {item.source}</Text>}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyIcon}>🎯</Text>
                            <Text style={styles.emptyTitle}>No Leads Yet</Text>
                            <Text style={styles.emptyDesc}>Add leads to track your sales pipeline.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => { }}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    searchBar: { padding: spacing.md },
    searchInput: { height: 44, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: spacing.md },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, ...shadows.sm },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
    leadName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, flex: 1 },
    stageBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, marginLeft: spacing.sm },
    stageText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    contact: { fontSize: 13, color: colors.textSecondary },
    phone: { fontSize: 12, color: colors.info, marginTop: 2 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
    value: { fontSize: 14, fontWeight: 'bold', color: colors.success },
    source: { fontSize: 12, color: colors.textMuted },
    empty: { padding: spacing['4xl'], alignItems: 'center' },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textSecondary },
    emptyDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center', ...shadows.lg },
    fabText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: -2 },
});
