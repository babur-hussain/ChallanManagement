import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react-native';
import { usePendingApprovals, useApproveItem } from '../hooks/api/useEnterprise';
import { colors } from '../lib/theme';

export const OwnerApprovalsScreen = () => {
    const { data, isLoading, isRefetching, refetch } = usePendingApprovals();
    const { mutate } = useApproveItem();
    const approvals = data || [];

    if (isLoading) {
        return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Director Inbox</Text>
                <Text style={styles.subtitle}>{approvals.length} Pending Action Requests</Text>
            </View>

            <View style={styles.content}>
                {approvals.map((req: any) => (
                    <View key={req._id || req.id} style={styles.card}>
                        <View style={styles.badgeRow}>
                            <View style={req.type === 'DISCOUNT' ? styles.badgeWarning : styles.badgeDanger}>
                                <Text style={req.type === 'DISCOUNT' ? styles.badgeTextWarning : styles.badgeTextDanger}>
                                    {req.type}
                                </Text>
                            </View>
                            <Text style={styles.timeText}>{new Date(req.createdAt).toLocaleDateString()} • {req.requester?.name || 'System'}</Text>
                        </View>
                        <Text style={styles.reqTitle}>{req.title}</Text>
                        <Text style={styles.reqDesc}>{req.description}</Text>

                        <View style={styles.actionGrid}>
                            <TouchableOpacity style={styles.btnReject} onPress={() => mutate({ id: req._id || req.id, action: 'REJECTED' })}>
                                <XCircle color="#dc2626" size={18} />
                                <Text style={styles.btnTextReject}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnApprove} onPress={() => mutate({ id: req._id || req.id, action: 'APPROVED' })}>
                                <CheckCircle2 color="#fff" size={18} />
                                <Text style={styles.btnTextApprove}>Approve</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {approvals.length === 0 && (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Text style={{ fontSize: 40, marginBottom: 10 }}>✅</Text>
                        <Text style={{ fontSize: 16, color: '#64748b', fontWeight: 'bold' }}>All clear! No pending approvals.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: { padding: 20, paddingTop: 60, backgroundColor: '#1e293b' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    subtitle: { color: '#fbbf24', fontSize: 14, marginTop: 4, fontWeight: '600' },
    content: { padding: 15 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    badgeWarning: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    badgeTextWarning: { color: '#d97706', fontSize: 10, fontWeight: 'bold' },
    badgeDanger: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    badgeTextDanger: { color: '#dc2626', fontSize: 10, fontWeight: 'bold' },
    timeText: { fontSize: 12, color: '#64748b' },
    reqTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 5 },
    reqDesc: { fontSize: 14, color: '#475569', marginBottom: 15 },
    actionGrid: { flexDirection: 'row', gap: 10 },
    btnReject: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 12, borderRadius: 8, backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1 },
    btnApprove: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 12, borderRadius: 8, backgroundColor: '#16a34a' },
    btnTextReject: { color: '#dc2626', fontWeight: 'bold' },
    btnTextApprove: { color: '#fff', fontWeight: 'bold' },
});
