import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useSalesLeaderboard } from '../hooks/api/useCRM';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function LeaderboardScreen() {
    const { data, isLoading } = useSalesLeaderboard();
    const leaders = (data as any)?.data || [];

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={leaders}
                keyExtractor={(item: any, index) => item.userId || index.toString()}
                contentContainerStyle={styles.list}
                renderItem={({ item, index }: any) => (
                    <View style={styles.card}>
                        <View style={styles.rankBadge}>
                            <Text style={styles.rankText}>#{index + 1}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                            <Text style={styles.userName}>{item.userName || 'Sales Rep'}</Text>
                            <Text style={styles.statsText}>{item.dealsClosed || 0} Deals Closed</Text>
                        </View>
                        <Text style={styles.revenueText}>₹{(item.revenue || 0).toLocaleString('en-IN')}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>🏆</Text>
                        <Text style={styles.emptyTitle}>Leaderboard Empty</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: spacing.md },
    card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: 'center', ...shadows.sm },
    rankBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    rankText: { color: colors.primaryDark, fontWeight: 'bold' },
    userName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
    statsText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    revenueText: { fontSize: 16, fontWeight: 'bold', color: colors.success },
    empty: { alignItems: 'center', marginTop: spacing['4xl'] },
    emptyIcon: { fontSize: 40, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, color: colors.textMuted },
});
