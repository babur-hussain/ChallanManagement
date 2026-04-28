import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, shadows } from '../lib/theme';

export function WhatsAppCampaignsScreen() {
    const campaigns = [
        { id: '1', title: 'Diwali Offer 2026', sent: 450, read: 320, date: '2026-10-15' },
        { id: '2', title: 'Payment Reminders Q3', sent: 120, read: 110, date: '2026-09-30' }
    ];

    return (
        <View style={styles.container}>
            <FlatList
                data={campaigns}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <View style={styles.statsRow}>
                            <Text style={styles.stat}>📤 Sent: {item.sent}</Text>
                            <Text style={styles.stat}>👀 Read: {item.read}</Text>
                        </View>
                        <Text style={styles.date}>Date: {item.date}</Text>
                    </View>
                )}
            />
            <TouchableOpacity style={styles.fab}><Text style={styles.fabText}>+</Text></TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.md },
    card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, ...shadows.sm },
    title: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: spacing.sm },
    statsRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.sm },
    stat: { fontSize: 14, color: colors.textSecondary },
    date: { fontSize: 12, color: colors.textMuted },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', ...shadows.lg },
    fabText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: -2 },
});
