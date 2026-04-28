import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { AlertCircle, ArrowUpCircle, ShieldAlert, Zap } from 'lucide-react-native';

export const SuperAdminScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>SaaS Director Root</Text>
                <Text style={styles.subtitle}>Current MRR: ₹12.4 Lakhs</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionHeader}>LIVE ALERTS</Text>

                <View style={[styles.alertCard, styles.alertSuccess]}>
                    <View style={styles.iconBox}><ArrowUpCircle color="#16a34a" size={24} /></View>
                    <View style={styles.alertMeta}>
                        <Text style={styles.alertTitle}>New Enterprise Upgrade (+ ₹24K)</Text>
                        <Text style={styles.alertDesc}>Reliance Weavers Hub upgraded to ENTERPRISE via Webhook.</Text>
                    </View>
                </View>

                <Text style={styles.sectionHeader}>SALES PIPELINE ESCALATIONS</Text>

                <View style={[styles.alertCard, { borderLeftColor: '#f97316' }]}>
                    <View style={styles.iconBox}><Zap color="#f97316" size={24} /></View>
                    <View style={styles.alertMeta}>
                        <Text style={styles.alertTitle}>Approve 20% Discount (Pro)</Text>
                        <Text style={styles.alertDesc}>Rep Amit is at Vinayak Textiles. Trying to close Annual Pro Plan. Needs discount approval to edge out Tally.</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            <TouchableOpacity
                                style={{ backgroundColor: '#16a34a', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 5 }}
                                onPress={() => Alert.alert("Success", "Discount Approved. Webhook sent to rep.")}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ backgroundColor: '#e2e8f0', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 5 }}>
                                <Text style={{ color: '#475569', fontWeight: 'bold' }}>Reject</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionHeader}>SECURITY OPS & VIP ESCALATIONS</Text>

                <View style={[styles.alertCard, styles.alertDanger]}>
                    <View style={styles.iconBox}><ShieldAlert color="#dc2626" size={24} /></View>
                    <View style={styles.alertMeta}>
                        <Text style={styles.alertTitle}>BRUTE FORCE DETECTED (bus_094411)</Text>
                        <Text style={styles.alertDesc}>14 failed login setups from IP 185.0.0.1. SOC locked account automatically.</Text>
                    </View>
                </View>

                <View style={[styles.alertCard, styles.alertWarning]}>
                    <View style={styles.iconBox}><AlertCircle color="#d97706" size={24} /></View>
                    <View style={styles.alertMeta}>
                        <Text style={styles.alertTitle}>VIP Escalation: Missing Ledger Bal</Text>
                        <Text style={styles.alertDesc}>Mahavir Synthetics (ENTERPRISE) reported missing reconciliation match. SLA Breached by 3hr.</Text>
                    </View>
                </View>

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: { padding: 20, paddingTop: 60, backgroundColor: '#0f172a' },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    subtitle: { color: '#22c55e', fontSize: 16, marginTop: 4, fontWeight: '700' },
    content: { padding: 15 },
    sectionHeader: { fontSize: 12, fontWeight: 'bold', color: '#64748b', letterSpacing: 1, marginBottom: 10, marginTop: 15 },
    alertCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, borderLeftWidth: 4 },
    alertSuccess: { borderLeftColor: '#16a34a' },
    alertWarning: { borderLeftColor: '#d97706' },
    alertDanger: { borderLeftColor: '#dc2626' },
    iconBox: { marginRight: 15, justifyContent: 'center' },
    alertMeta: { flex: 1 },
    alertTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
    alertDesc: { fontSize: 13, color: '#475569', marginTop: 4, lineHeight: 18 }
});
