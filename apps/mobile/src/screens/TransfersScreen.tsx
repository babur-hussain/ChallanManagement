import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useTransfers } from '../hooks/api/useInventory';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function TransfersScreen({ navigation }: any) {
    const { data, isLoading, refetch, isRefetching } = useTransfers();

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.title}>Ref: {item.reference}</Text>
                <Text style={styles.status}>{item.status}</Text>
            </View>
            <Text style={styles.subtext}>From: {item.fromWarehouseName} ➔ To: {item.toWarehouseName}</Text>
            <Text style={styles.subtext}>Date: {new Date(item.date).toLocaleDateString()}</Text>
            <Text style={styles.subtext}>{item.items?.length || 0} items transferred</Text>
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
                ListEmptyComponent={<Text style={styles.emptyText}>No transfers found.</Text>}
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
    status: { ...typography.caption, color: colors.primary, fontWeight: 'bold', textTransform: 'uppercase' },
    subtext: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
    emptyText: { textAlign: 'center', marginTop: spacing.xl, color: colors.textMuted },
});
