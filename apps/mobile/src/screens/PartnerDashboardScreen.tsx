import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Users, IndianRupee, Link2 } from 'lucide-react-native';

export const PartnerDashboardScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Affiliate Partner Network</Text>
                <Text style={styles.subtitle}>Referral ID: SHARMA99</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.cardPrimary}>
                    <Text style={styles.cardTitle}>Earnings generated (Due 1st Nov)</Text>
                    <Text style={styles.cardBigMetric}>₹45,200</Text>
                </View>

                <View style={styles.grid}>
                    <View style={styles.box}>
                        <Users size={24} color="#2563eb" />
                        <Text style={styles.boxTitle}>35</Text>
                        <Text style={styles.boxSubtitle}>Active Clients</Text>
                    </View>
                    <View style={styles.box}>
                        <IndianRupee size={24} color="#16a34a" />
                        <Text style={styles.boxTitle}>₹2.2L</Text>
                        <Text style={styles.boxSubtitle}>Total MRR</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.inviteButton}>
                    <Link2 color="#fff" size={20} />
                    <Text style={styles.inviteText}>Copy Invite Link (15% Cashkick)</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: { padding: 20, paddingTop: 60, backgroundColor: '#1e3a8a' },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, fontWeight: '600' },
    content: { padding: 15 },
    cardPrimary: { backgroundColor: '#16a34a', borderRadius: 12, padding: 25, marginBottom: 15, alignItems: 'center' },
    cardTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '500' },
    cardBigMetric: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginTop: 5 },
    grid: { flexDirection: 'row', gap: 12, marginBottom: 15 },
    box: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center' },
    boxTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
    boxSubtitle: { fontSize: 12, color: '#64748b' },
    inviteButton: { backgroundColor: '#0f172a', padding: 16, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    inviteText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
