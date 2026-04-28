import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useVisits } from '../hooks/api/useCRM';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function VisitsScreen() {
    const { data, isLoading } = useVisits();
    const visits = (data as any)?.data || [];

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={visits}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={styles.list}
                renderItem={({ item }: any) => (
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <Text style={styles.partyName}>{item.partyName || 'Unknown Party'}</Text>
                            <View style={[styles.statusBadge, item.checkOutTime ? styles.statusCompleted : styles.statusPending]}>
                                <Text style={[styles.statusText, item.checkOutTime ? styles.statusCompletedText : styles.statusPendingText]}>
                                    {item.checkOutTime ? 'COMPLETED' : 'IN PROGRESS'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.timeText}>Check In: {new Date(item.checkInTime).toLocaleString()}</Text>
                        {item.checkOutTime && <Text style={styles.timeText}>Check Out: {new Date(item.checkOutTime).toLocaleString()}</Text>}
                        {item.notes && <Text style={styles.notesText}>{item.notes}</Text>}
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>📍</Text>
                        <Text style={styles.emptyTitle}>No Visits Logged</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => { }}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: spacing.md },
    card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    partyName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, flex: 1 },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
    statusCompleted: { backgroundColor: colors.successBg },
    statusPending: { backgroundColor: colors.infoBg },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    statusCompletedText: { color: colors.success },
    statusPendingText: { color: colors.info },
    timeText: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
    notesText: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm, fontStyle: 'italic' },
    empty: { alignItems: 'center', marginTop: spacing['4xl'] },
    emptyIcon: { fontSize: 40, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, color: colors.textMuted },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center', ...shadows.lg },
    fabText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: -2 },
});
