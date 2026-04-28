import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useWhatsAppInbox } from '../hooks/api/useCollectionsInventoryWhatsApp';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function WhatsAppInboxScreen() {
    const [search, setSearch] = useState('');
    const { data, isLoading } = useWhatsAppInbox({ search });
    const messages = (data as any)?.data || [];

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search messages..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>
            <FlatList
                data={messages}
                keyExtractor={(item: any) => item._id}
                contentContainerStyle={styles.list}
                renderItem={({ item }: any) => (
                    <TouchableOpacity style={styles.card}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{(item.contactName || '?').charAt(0)}</Text>
                        </View>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <Text style={styles.contactName}>{item.contactName || item.phone}</Text>
                                <Text style={styles.timeText}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            </View>
                            <Text style={styles.messageText} numberOfLines={1}>{item.lastMessage}</Text>
                        </View>
                        {item.unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{item.unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>💬</Text>
                        <Text style={styles.emptyTitle}>No Messages</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchBar: { padding: spacing.md },
    searchInput: { height: 44, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.lg, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
    list: { padding: spacing.md },
    card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.xs, alignItems: 'center', ...shadows.sm },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: colors.success },
    content: { flex: 1, marginLeft: spacing.md },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    contactName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
    timeText: { fontSize: 12, color: colors.textMuted },
    messageText: { fontSize: 14, color: colors.textSecondary },
    unreadBadge: { backgroundColor: colors.success, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginLeft: spacing.sm },
    unreadText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    empty: { alignItems: 'center', marginTop: spacing['4xl'] },
    emptyIcon: { fontSize: 40, marginBottom: spacing.md },
    emptyTitle: { fontSize: 16, color: colors.textMuted },
});
