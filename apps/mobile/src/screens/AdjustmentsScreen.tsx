import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useAdjustments } from '../hooks/api/useInventory';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function AdjustmentsScreen({ navigation }: any) {
    const { data, isLoading, refetch, isRefetching } = useAdjustments();

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.title}>Item ID: {item.itemId || item._id}</Text>
                <Text style={styles.qty}>Qty Diff: {item.quantityDifference > 0 ? `+${item.quantityDifference}` : item.quantityDifference}</Text>
            </View>
            <Text style={styles.subtext}>Reason: {item.reason}</Text>
            <Text style={styles.subtext}>Date: {new Date(item.date).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={data?.data || []}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onRefresh={refetch}
                refreshing={isRefetching}
                ListEmptyComponent={<Text style={styles.emptyText}>No adjustments found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    list: { padding: spacing.md },
    card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.sm, ...shadows.sm },
    title: { ...typography.h4, color: colors.textPrimary },
    qty: { ...typography.caption, color: colors.error, fontWeight: 'bold' },
    subtext: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
    emptyText: { textAlign: 'center', marginTop: spacing.xl, color: colors.textMuted },
});
