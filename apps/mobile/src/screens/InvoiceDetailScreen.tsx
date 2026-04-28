import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, RefreshControl, Share
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useInvoice, useInvoiceHtml, useCancelInvoice } from '../hooks/api/useInvoices';
import { apiGet } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

const statusColors: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: '#f3f4f6', text: '#6b7280' },
    SENT: { bg: '#dbeafe', text: '#2563eb' },
    DELIVERED: { bg: '#dcfce7', text: '#16a34a' },
    BILLED: { bg: '#fef3c7', text: '#d97706' },
    CANCELLED: { bg: '#fef2f2', text: '#dc2626' },
};

export function InvoiceDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { data: invoice, isLoading, refetch, isRefetching } = useInvoice(id);
    const { data: htmlContent, isLoading: isLoadingHtml } = useInvoiceHtml(id);
    const cancelMutation = useCancelInvoice();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    if (isLoading || !invoice) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const status = statusColors[invoice.status] || statusColors.DRAFT;
    const canCancel = ['DRAFT', 'ACTIVE'].includes(invoice.status);

    const handleCancel = () => {
        Alert.prompt(
            'Cancel Invoice',
            'Enter cancellation reason:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    style: 'destructive',
                    onPress: (reason?: string) => {
                        if (!reason?.trim()) return;
                        cancelMutation.mutate({ invoiceId: id, reason: reason.trim() }, {
                            onSuccess: () => {
                                Alert.alert('Success', 'Invoice cancelled');
                                refetch();
                            },
                        });
                    },
                },
            ],
            'plain-text',
        );
    };

    const handleShare = async () => {
        try {
            setIsGeneratingPdf(true);
            const { base64 } = await apiGet<{ base64: string }>(`/invoices/${id}/pdf-buffer`);
            await Share.share({
                url: `data:application/pdf;base64,${base64}`,
                title: `Invoice_${invoice?.invoiceNumber}.pdf`
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
                    <Text style={styles.challanNumber}>{invoice.invoiceNumber}</Text>
                    <View style={[{ flex: 1 }]} />
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.text }]}>{invoice.status}</Text>
                    </View>
                </View>
                <Text style={styles.dateText}>
                    {new Date(invoice.invoiceDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
                    <Text style={styles.partyName}>{invoice.partySnapshot?.name}</Text>
                    {invoice.partySnapshot?.address && (
                        <Text style={styles.partyAddr}>
                            {[invoice.partySnapshot.address.line1, invoice.partySnapshot.address.city, invoice.partySnapshot.address.state]
                                .filter(Boolean)
                                .join(', ')}
                        </Text>
                    )}
                    {invoice.partySnapshot?.phone && <Text style={styles.partyPhone}>📞 {invoice.partySnapshot.phone}</Text>}
                    {invoice.partySnapshot?.gstin && <Text style={styles.partyGstin}>GSTIN: {invoice.partySnapshot.gstin}</Text>}
                </View>
            </View>

            {/* Line Items */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items ({invoice.items?.length || 0})</Text>
                {(invoice.items || []).map((item: any, i: number) => (
                    <View key={i} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemName}>{item.itemName}</Text>
                            <Text style={styles.itemAmount}>₹{item.amount?.toLocaleString('en-IN')}</Text>
                        </View>
                        {item.hsnCode && <Text style={styles.itemHsn}>HSN: {item.hsnCode}</Text>}
                        <View style={styles.itemMeta}>
                            <Text style={styles.itemMetaText}>Quant: {item.quantity?.toFixed(1)}</Text>
                            <Text style={styles.itemMetaText}>@₹{item.ratePerUnit}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Totals */}
            <View style={styles.section}>
                <View style={styles.totalsCard}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Items</Text>
                        <Text style={styles.totalValue}>{invoice.items?.length || 0}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.grandTotalLabel}>Total Amount</Text>
                        <Text style={styles.grandTotalValue}>₹{invoice.finalAmount?.toLocaleString('en-IN')}</Text>
                    </View>
                </View>
            </View>

            {/* Notes */}
            {(invoice.notes || invoice.termsAndConditions) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <View style={styles.card}>
                        {invoice.notes && <Text style={styles.noteText}>📝 {invoice.notes}</Text>}
                        {invoice.termsAndConditions && <Text style={[styles.noteText, { color: colors.textMuted }]}>🔒 {invoice.termsAndConditions}</Text>}
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
                        style={[styles.actionBtn, { backgroundColor: '#dbeafe', borderWidth: 1, borderColor: '#93c5fd' }]}
                        onPress={() => navigation.navigate('InvoiceEdit', { id })}
                    >
                        <Text style={[styles.actionBtnText, { color: '#2563eb' }]}>✏️ Edit Invoice</Text>
                    </TouchableOpacity>
                )}

                {canCancel && (
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.btnCancel]}
                        onPress={handleCancel}
                        disabled={cancelMutation.isPending}
                    >
                        <Text style={[styles.actionBtnText, { color: colors.error }]}>{cancelMutation.isPending ? '...' : '❌ Cancel Invoice'}</Text>
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
