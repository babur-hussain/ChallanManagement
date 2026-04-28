import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, shadows } from '../lib/theme';

export function WhatsAppTemplatesScreen() {
    const templates = [
        { id: '1', name: 'Invoice Reminder', status: 'Approved', category: 'FINANCE' },
        { id: '2', name: 'New Product Catalog', status: 'Pending', category: 'MARKETING' },
        { id: '3', name: 'Challan PDF Link', status: 'Approved', category: 'UTILITY' }
    ];

    return (
        <View style={styles.container}>
            <FlatList
                data={templates}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <Text style={styles.name}>{item.name}</Text>
                            <View style={[styles.badge, item.status === 'Approved' ? styles.badgeSuccess : styles.badgeWarning]}>
                                <Text style={[styles.badgeText, item.status === 'Approved' ? styles.textSuccess : styles.textWarning]}>{item.status}</Text>
                            </View>
                        </View>
                        <Text style={styles.category}>Category: {item.category}</Text>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    name: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    category: { fontSize: 14, color: colors.textSecondary },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
    badgeSuccess: { backgroundColor: colors.successBg },
    badgeWarning: { backgroundColor: colors.warningBg },
    badgeText: { fontSize: 12, fontWeight: 'bold' },
    textSuccess: { color: colors.success },
    textWarning: { color: colors.warning },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center', ...shadows.lg },
    fabText: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: -2 },
});
