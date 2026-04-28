import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useTasks } from '../hooks/api/useCRM';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function TasksScreen() {
    const { data, isLoading } = useTasks();
    const tasks = (data as any)?.data || [];

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={tasks}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={styles.list}
                renderItem={({ item }: any) => (
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{item.title}</Text>
                            <View style={[styles.statusBadge, item.status === 'COMPLETED' ? styles.statusCompleted : styles.statusPending]}>
                                <Text style={[styles.statusText, item.status === 'COMPLETED' ? styles.statusCompletedText : styles.statusPendingText]}>{item.status || 'PENDING'}</Text>
                            </View>
                        </View>
                        {item.description && <Text style={styles.description}>{item.description}</Text>}
                        <Text style={styles.dueDate}>Due: {new Date(item.dueDate || Date.now()).toLocaleDateString()}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyTitle}>No Tasks Found</Text>
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
    card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    title: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, flex: 1 },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
    statusCompleted: { backgroundColor: colors.successBg },
    statusPending: { backgroundColor: colors.warningBg },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    statusCompletedText: { color: colors.success },
    statusPendingText: { color: colors.warning },
    description: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.sm },
    dueDate: { fontSize: 12, color: colors.error, fontWeight: '600' },
    empty: { alignItems: 'center', marginTop: spacing['4xl'] },
    emptyIcon: { fontSize: 40, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, color: colors.textMuted },
});
