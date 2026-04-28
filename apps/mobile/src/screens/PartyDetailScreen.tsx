import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useParty, usePartyLedger } from '../hooks/api/useParties';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

const GRID_ITEMS = [
    { key: 'ledger', icon: '📒', label: 'Ledger\nStatement', color: '#0d9488', bg: '#ccfbf1' },
    { key: 'invoices', icon: '🧾', label: 'Invoices', color: '#7c3aed', bg: '#ede9fe' },
    { key: 'challans', icon: '📦', label: 'Challans', color: '#ea580c', bg: '#fff7ed' },
    { key: 'payments', icon: '💰', label: 'Payments\n& Collections', color: '#0284c7', bg: '#e0f2fe' },
    { key: 'outstanding', icon: '⏳', label: 'Outstanding\nReport', color: '#dc2626', bg: '#fef2f2' },
    { key: 'whatsapp', icon: '💬', label: 'WhatsApp\nMessages', color: '#16a34a', bg: '#f0fdf4' },
];

export function PartyDetailScreen({ route }: any) {
    const { id } = route.params || {};
    const navigation = useNavigation<any>();
    const { data: party, isLoading: isLoadingParty } = useParty(id);
    const { data: ledgerResp, isLoading: isLoadingLedger } = usePartyLedger(id);

    const handleGridTap = (key: string) => {
        switch (key) {
            case 'ledger':
                navigation.navigate('LedgerManagement', { partyId: id });
                break;
            case 'invoices':
                navigation.navigate('InvoiceList', { partyId: id });
                break;
            case 'challans':
                navigation.navigate('ChallanList', { partyId: id });
                break;
            case 'payments':
                navigation.navigate('Collections');
                break;
            case 'outstanding':
                navigation.navigate('OutstandingTable', { partyId: id });
                break;
            case 'whatsapp':
                navigation.navigate('WhatsAppInbox');
                break;
        }
    };

    if (isLoadingParty) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    if (!party) {
        return <View style={styles.centered}><Text>Party not found</Text></View>;
    }

    const balance = ledgerResp?.closingBalance ?? (party as any).outstandingBalance ?? 0;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Party Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(party.name || '?').charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.name}>{party.name}</Text>
                <Text style={styles.code}>{party.shortCode}</Text>
            </View>

            {/* Info Card */}
            <View style={styles.section}>
                <View style={styles.card}>
                    {party.phone && <Text style={styles.infoRow}>📞  {party.phone}</Text>}
                    {party.email && <Text style={styles.infoRow}>✉️  {party.email}</Text>}
                    {party.address && <Text style={styles.infoRow}>📍  {party.address.line1}, {party.address.city}, {party.address.state}</Text>}
                    {party.gstin && <Text style={[styles.infoRow, { marginTop: spacing.xs }]}>🏢 GSTIN: {party.gstin}</Text>}
                </View>
            </View>

            {/* Balance Card */}
            <View style={styles.section}>
                <View style={styles.card}>
                    <View style={styles.financeRow}>
                        <Text style={styles.financeLabel}>Current Balance:</Text>
                        {isLoadingLedger ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Text style={[styles.financeValue, balance > 0 ? { color: colors.error } : { color: colors.success }]}>
                                ₹{Math.abs(balance).toLocaleString('en-IN')} {balance > 0 ? 'Dr' : 'Cr'}
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Quick Actions Grid */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.gridContainer}>
                    {GRID_ITEMS.map(item => (
                        <TouchableOpacity
                            key={item.key}
                            style={[styles.gridTile, { backgroundColor: item.bg, borderColor: item.color + '30' }]}
                            onPress={() => handleGridTap(item.key)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.gridIcon}>{item.icon}</Text>
                            <Text style={[styles.gridLabel, { color: item.color }]}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Recent Activity Preview */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.card}>
                    {isLoadingLedger ? (
                        <ActivityIndicator style={{ marginVertical: spacing.lg }} />
                    ) : (ledgerResp?.ledger || []).length === 0 ? (
                        <Text style={styles.emptyText}>No recent activity for this party.</Text>
                    ) : (
                        (ledgerResp?.ledger || []).slice(0, 5).map((entry: any, idx: number) => {
                            const isDebit = entry.debit > 0;
                            const amt = isDebit ? entry.debit : entry.credit;
                            return (
                                <View key={entry.sourceId || idx} style={[styles.activityRow, idx < Math.min(4, (ledgerResp?.ledger || []).length - 1) && styles.activityBorder]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.activityDate}>{new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</Text>
                                        <Text style={styles.activityRef} numberOfLines={1}>{entry.reference !== '-' ? entry.reference : entry.description}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: isDebit ? colors.error : colors.success }}>
                                            {isDebit ? 'Dr ' : 'Cr '}₹{amt.toLocaleString('en-IN')}
                                        </Text>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' }}>{entry.type}</Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
                    {(ledgerResp?.ledger || []).length > 5 && (
                        <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('LedgerManagement')}>
                            <Text style={styles.viewAllText}>View Full Ledger →</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: colors.primaryDark },
    name: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
    code: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
    section: { marginTop: spacing.md },
    sectionTitle: { ...typography.h4, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
    card: { backgroundColor: colors.surface, marginHorizontal: spacing.md, padding: spacing.md, borderRadius: radius.md, ...shadows.sm },
    infoRow: { fontSize: 14, color: colors.textPrimary, marginBottom: spacing.xs },
    financeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xs },
    financeLabel: { fontSize: 15, color: colors.textSecondary },
    financeValue: { fontSize: 18, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', color: colors.textMuted, marginVertical: spacing.md },

    // Grid styles
    gridContainer: {
        flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.sm,
        justifyContent: 'space-between',
    },
    gridTile: {
        width: '31%', aspectRatio: 1, borderRadius: radius.lg, alignItems: 'center',
        justifyContent: 'center', marginBottom: spacing.sm, borderWidth: 1.5,
        ...shadows.sm,
    },
    gridIcon: { fontSize: 32, marginBottom: 6 },
    gridLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 16 },

    // Activity styles
    activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
    activityBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    activityDate: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
    activityRef: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    viewAllBtn: { alignItems: 'center', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight, marginTop: spacing.sm },
    viewAllText: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
});
