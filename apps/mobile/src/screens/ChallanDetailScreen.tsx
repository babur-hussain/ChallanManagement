import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, RefreshControl, Share
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useChallan, useChallanHtml, useCancelChallan, useMarkDelivered, useSendWhatsapp } from '../hooks/api/useChallans';
import { apiGet } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

const statusColors: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: '#f3f4f6', text: '#6b7280' },
    SENT: { bg: '#dbeafe', text: '#2563eb' },
    DELIVERED: { bg: '#dcfce7', text: '#16a34a' },
    BILLED: { bg: '#fef3c7', text: '#d97706' },
    CANCELLED: { bg: '#fef2f2', text: '#dc2626' },
};

export function ChallanDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { data: challan, isLoading, refetch, isRefetching } = useChallan(id);
    const { data: htmlContent, isLoading: isLoadingHtml } = useChallanHtml(id);
    const cancelMutation = useCancelChallan();
    const deliverMutation = useMarkDelivered();
    const whatsappMutation = useSendWhatsapp();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    if (isLoading || !challan) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const status = statusColors[challan.status] || statusColors.DRAFT;
    const canCancel = ['DRAFT', 'SENT'].includes(challan.status);
    const canDeliver = ['SENT', 'DRAFT'].includes(challan.status);

    const handleCancel = () => {
        Alert.prompt(
            'Cancel Challan',
            'Enter cancellation reason:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    style: 'destructive',
                    onPress: (reason?: string) => {
                        if (!reason?.trim()) return;
                        cancelMutation.mutate({ id, reason: reason.trim() }, {
                            onSuccess: () => {
                                Alert.alert('Success', 'Challan cancelled');
                                refetch();
                            },
                        });
                    },
                },
            ],
            'plain-text',
        );
    };

    const handleDeliver = () => {
        Alert.alert('Mark Delivered', 'Confirm this challan has been delivered?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Confirm',
                onPress: () => {
                    deliverMutation.mutate({ id }, {
                        onSuccess: () => {
                            Alert.alert('Success', 'Challan marked as delivered');
                            refetch();
                        },
                    });
                },
            },
        ]);
    };

    const handleShare = async () => {
        try {
            setIsGeneratingPdf(true);
            const { base64 } = await apiGet<{ base64: string }>(`/challans/${id}/pdf-buffer`);
            await Share.share({
                url: `data:application/pdf;base64,${base64}`,
                title: `Challan_${challan?.challanNumber}.pdf`
            });
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to generate PDF');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
            {/* Header Card */}
            <View style={styles.headerCard}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 10 }}>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.challanNumber}>{challan.challanNumber}</Text>
                    <View style={[{ flex: 1 }]} />
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.text }]}>{challan.status}</Text>
                    </View>
                </View>
                <Text style={styles.dateText}>
                    {new Date(challan.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
            </View>

            {/* Live Preview / WebView */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Live Preview</Text>
                <View style={[styles.card, { padding: 0, height: 450, overflow: 'hidden' }]}>
                    {isLoadingHtml ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : htmlContent ? (
                        <WebView
                            source={{ html: htmlContent }}
                            style={{ flex: 1, backgroundColor: 'transparent' }}
                            scalesPageToFit={true}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                            <Text style={styles.noteText}>Preview not available</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Party Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Party</Text>
                <View style={styles.card}>
                    <Text style={styles.partyName}>{challan.partySnapshot?.name}</Text>
                    {challan.partySnapshot?.address && (
                        <Text style={styles.partyAddr}>
                            {[challan.partySnapshot.address.line1, challan.partySnapshot.address.city, challan.partySnapshot.address.state]
                                .filter(Boolean)
                                .join(', ')}
                        </Text>
                    )}
                    {challan.partySnapshot?.phone && <Text style={styles.partyPhone}>📞 {challan.partySnapshot.phone}</Text>}
                    {challan.partySnapshot?.gstin && <Text style={styles.partyGstin}>GSTIN: {challan.partySnapshot.gstin}</Text>}
                </View>
            </View>

            {/* Broker */}
            {challan.brokerSnapshot && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Broker</Text>
                    <View style={styles.card}>
                        <Text style={styles.brokerName}>{challan.brokerSnapshot.name}</Text>
                        <Text style={styles.brokerComm}>
                            Commission: {challan.brokerSnapshot.commissionRate}{challan.brokerSnapshot.commissionType === 'PERCENTAGE' ? '%' : ' fixed'}
                        </Text>
                    </View>
                </View>
            )}

            {/* Line Items */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items ({challan.items?.length || 0})</Text>
                {(challan.items || []).map((item: any, i: number) => (
                    <View key={i} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemName}>{item.itemName}</Text>
                            <Text style={styles.itemAmount}>₹{item.amount?.toLocaleString('en-IN')}</Text>
                        </View>
                        {item.hsnCode && <Text style={styles.itemHsn}>HSN: {item.hsnCode}</Text>}
                        <View style={styles.itemMeta}>
                            <Text style={styles.itemMetaText}>Rolls: {item.meters?.length || 0}</Text>
                            <Text style={styles.itemMetaText}>Meters: {item.totalMeters?.toFixed(1)}</Text>
                            <Text style={styles.itemMetaText}>@₹{item.ratePerMeter}/m</Text>
                        </View>
                        {item.meters && item.meters.length > 0 && (
                            <Text style={styles.rollDetail}>
                                Roll values: {item.meters.map((m: number) => m.toFixed(1)).join(', ')}
                            </Text>
                        )}
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={styles.section}>
                <View style={styles.totalsCard}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Items</Text>
                        <Text style={styles.totalValue}>{challan.totalItems}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Rolls</Text>
                        <Text style={styles.totalValue}>{challan.totalRolls}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Meters</Text>
                        <Text style={styles.totalValue}>{challan.totalMeters?.toFixed(1)} m</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.grandTotalLabel}>Total Amount</Text>
                        <Text style={styles.grandTotalValue}>₹{challan.totalAmount?.toLocaleString('en-IN')}</Text>
                    </View>
                </View>
            </View>

            {/* Notes */}
            {(challan.remarks || challan.internalNotes) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <View style={styles.card}>
                        {challan.remarks && <Text style={styles.noteText}>📝 {challan.remarks}</Text>}
                        {challan.internalNotes && <Text style={[styles.noteText, { color: colors.textMuted }]}>🔒 {challan.internalNotes}</Text>}
                    </View>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actionsSection}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.btnPdf]}
                    onPress={handleShare}
                    disabled={isGeneratingPdf}
                >
                    <Text style={styles.actionBtnText}>{isGeneratingPdf ? 'Generating PDF...' : '🔗 Share PDF'}</Text>
                </TouchableOpacity>



                {canCancel && (
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.btnCancel]}
                        onPress={handleCancel}
                        disabled={cancelMutation.isPending}
                    >
                        <Text style={[styles.actionBtnText, { color: colors.error }]}>{cancelMutation.isPending ? '...' : '❌ Cancel Challan'}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },

    headerCard: { backgroundColor: colors.primary, padding: spacing.xl, paddingTop: 60, paddingBottom: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    challanNumber: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    statusBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full },
    statusText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    dateText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },

    section: { paddingHorizontal: spacing.md, marginTop: spacing.md },
    sectionTitle: { ...typography.label, marginBottom: spacing.sm },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadows.sm },
    partyName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    partyAddr: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    partyPhone: { fontSize: 13, color: colors.info, marginTop: 4 },
    partyGstin: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    brokerName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    brokerComm: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },

    itemCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, flex: 1 },
    itemAmount: { fontSize: 15, fontWeight: 'bold', color: colors.success },
    itemHsn: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    itemMeta: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
    itemMetaText: { fontSize: 13, color: colors.textSecondary },
    rollDetail: { fontSize: 11, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },

    totalsCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadows.md },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    totalLabel: { fontSize: 14, color: colors.textSecondary },
    totalValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
    grandTotalLabel: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    grandTotalValue: { fontSize: 18, fontWeight: 'bold', color: colors.primary },

    noteText: { fontSize: 14, color: colors.textPrimary, lineHeight: 22 },

    actionsSection: { padding: spacing.md, gap: spacing.sm },
    actionBtn: { height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    actionBtnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    btnPdf: { backgroundColor: colors.info },
    btnWhatsapp: { backgroundColor: '#25D366' },
    btnDeliver: { backgroundColor: colors.success },
    btnCancel: { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: '#fecaca' },
});
