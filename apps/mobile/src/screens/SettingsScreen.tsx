import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useBusinessSettings, useUserProfile } from '../hooks/api/useEnterprise';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function SettingsScreen({ navigation }: any) {
    const { logout, user, business } = useAuthStore();

    const sections = [
        {
            title: 'ACCOUNT',
            items: [
                { label: '👤 Profile', subtitle: user?.name || 'User', onPress: () => { } },
                { label: '🔔 Notifications', subtitle: 'Push, Email, WhatsApp', onPress: () => { } },
                { label: '🔐 Change Password', onPress: () => { } },
            ],
        },
        {
            title: 'BUSINESS',
            items: [
                { label: '🏢 Business Info', subtitle: business?.name || 'Setup', onPress: () => { } },
                { label: '📄 Invoice/Challan Settings', subtitle: 'Number format, terms', onPress: () => { } },
                { label: '🌐 Localization', subtitle: 'Language, currency, date format', onPress: () => { } },
                { label: '🖨️ Print Settings', subtitle: 'Paper size, template', onPress: () => { } },
            ],
        },
        {
            title: 'DATA',
            items: [
                { label: '📤 Export Data', subtitle: 'Excel/CSV', onPress: () => { } },
                { label: '📊 Audit Logs', onPress: () => { } },
            ],
        },
        {
            title: 'ABOUT',
            items: [
                { label: 'ℹ️ About TextilePro', subtitle: 'v1.0.0' },
                { label: '📋 Terms & Privacy', onPress: () => { } },
                { label: '💬 Support', onPress: () => { } },
            ],
        },
    ];

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
            {/* User Card */}
            <View style={styles.userCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || ''}</Text>
                    <Text style={styles.userRole}>{user?.role || 'OWNER'}</Text>
                </View>
            </View>

            {sections.map((section) => (
                <View key={section.title} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    {section.items.map((item) => (
                        <TouchableOpacity
                            key={item.label}
                            style={styles.menuItem}
                            onPress={item.onPress}
                            disabled={!item.onPress}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                {item.subtitle && <Text style={styles.menuSub}>{item.subtitle}</Text>}
                            </View>
                            {item.onPress && <Text style={styles.chevron}>›</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            ))}

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    userCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.primary, padding: spacing.xl, paddingTop: 16,
    },
    avatar: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: spacing.lg,
    },
    avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    userName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    userEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
    userRole: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2, textTransform: 'uppercase' },
    section: { marginTop: spacing.lg },
    sectionTitle: { ...typography.label, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface,
        paddingVertical: spacing.lg, paddingHorizontal: spacing.lg,
        borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    },
    menuLabel: { fontSize: 15, color: colors.textPrimary },
    menuSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    chevron: { fontSize: 22, color: colors.textMuted },
    logoutBtn: {
        margin: spacing.lg, backgroundColor: colors.errorBg,
        padding: spacing.lg, borderRadius: radius.md,
        alignItems: 'center', borderWidth: 1, borderColor: '#fecaca',
    },
    logoutText: { color: colors.error, fontWeight: 'bold', fontSize: 16 },
});
