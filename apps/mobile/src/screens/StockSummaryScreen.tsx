import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useStockSummary } from '../hooks/api/useInventory';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function StockSummaryScreen({ navigation }: any) {
    const { data: stockItems, isLoading, refetch, isRefetching } = useStockSummary();

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    const renderItem = ({ item }: any) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCode}>{item.code}</Text>
                <Text style={styles.itemCode}>{item.category || 'No Category'} • {item.subCategory || ''}</Text>
            </View>
            <View style={styles.stockCol}>
                <Text style={[styles.stockVal, item.currentStock <= (item.reorderLevel || 0) && { color: colors.error }]}>
                    {item.currentStock} {item.unit || 'm'}
                </Text>
                <Text style={styles.reorderText}>Min: {item.reorderLevel || 0}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={stockItems || []}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                onRefresh={refetch}
                refreshing={isRefetching}
                ListEmptyComponent={<Text style={styles.emptyText}>No stock items found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    list: { padding: spacing.md },
    card: { flexDirection: 'row', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.md, marginBottom: spacing.sm, ...shadows.sm },
    itemName: { ...typography.h4, color: colors.textPrimary },
    itemCode: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    stockCol: { alignItems: 'flex-end', justifyContent: 'center' },
    stockVal: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    reorderText: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    emptyText: { textAlign: 'center', marginTop: spacing.xl, color: colors.textMuted },
});
