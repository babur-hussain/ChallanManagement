import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLead } from '../hooks/api/useCRM';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

export function LeadDetailScreen({ route }: any) {
    const { id } = route.params || {};
    const { data: lead, isLoading } = useLead(id);

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    if (!lead) {
        return <View style={styles.centered}><Text>Lead not found</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.name}>{lead.companyName || lead.contactName || 'Lead'}</Text>
                <View style={styles.stageBadge}>
                    <Text style={styles.stageText}>{lead.stage || 'NEW'}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Details</Text>
                <View style={styles.card}>
                    {lead.contactName && <Text style={styles.infoRow}>👤  {lead.contactName}</Text>}
                    {lead.phone && <Text style={styles.infoRow}>📞  {lead.phone}</Text>}
                    {lead.email && <Text style={styles.infoRow}>✉️  {lead.email}</Text>}
                    {lead.source && <Text style={styles.infoRow}>🧭  Source: {lead.source}</Text>}
                    {lead.estimatedValue != null && <Text style={styles.infoRow}>💰  Value: ₹{lead.estimatedValue.toLocaleString('en-IN')}</Text>}
                </View>
            </View>

            {lead.notes && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <View style={styles.card}>
                        <Text style={styles.notesText}>{lead.notes}</Text>
                    </View>
                </View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: spacing.xl, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
    name: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: spacing.sm },
    stageBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full },
    stageText: { color: colors.primaryDark, fontWeight: 'bold', fontSize: 12 },
    section: { marginTop: spacing.md },
    sectionTitle: { ...typography.h4, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
    card: { backgroundColor: colors.surface, marginHorizontal: spacing.md, padding: spacing.md, borderRadius: radius.md, ...shadows.sm },
    infoRow: { fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
    notesText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
});
