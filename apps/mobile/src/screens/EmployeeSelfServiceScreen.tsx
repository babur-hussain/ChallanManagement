import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, FileText, CalendarRange, Navigation } from 'lucide-react-native';

export const EmployeeSelfServiceScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Good Morning, Rajesh.</Text>
                <Text style={styles.subtitle}>Emp-012 • Surat HO</Text>
            </View>

            <View style={styles.content}>
                {/* GPS Attendance Hub */}
                <View style={styles.workCard}>
                    <View style={styles.statusRow}>
                        <View style={styles.statusDotActive} />
                        <Text style={styles.statusText}>On Shift (Checked in at 08:55 AM)</Text>
                    </View>

                    <View style={styles.mapPreview}>
                        <MapPin color="#2563eb" size={24} style={styles.mapIcon} />
                        <Text style={styles.mapText}>Current Location: Ring Road, Surat</Text>
                    </View>

                    <TouchableOpacity style={styles.checkoutBtn}>
                        <Text style={styles.btnText}>Checkout (GPS Sync)</Text>
                    </TouchableOpacity>
                </View>

                {/* HR Features */}
                <View style={styles.hrGrid}>
                    <TouchableOpacity style={styles.hrBox}>
                        <CalendarRange size={28} color="#0f172a" />
                        <Text style={styles.boxText}>Request Leaves</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.hrBox}>
                        <FileText size={28} color="#0f172a" />
                        <Text style={styles.boxText}>Payslips</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.hrBox}>
                        <Navigation size={28} color="#0f172a" />
                        <Text style={styles.boxText}>Field Leads</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: { padding: 20, paddingTop: 60, backgroundColor: '#0f172a' },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
    content: { padding: 15 },
    workCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    statusDotActive: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#16a34a', marginRight: 8 },
    statusText: { fontSize: 14, fontWeight: '600' },
    mapPreview: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    mapIcon: { marginRight: 10 },
    mapText: { color: '#64748b', fontSize: 13, flex: 1 },
    checkoutBtn: { backgroundColor: '#dc2626', borderRadius: 8, padding: 15, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' },
    hrGrid: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
    hrBox: { backgroundColor: '#fff', borderRadius: 12, padding: 20, flex: 1, alignItems: 'center', justifyContent: 'center' },
    boxText: { fontSize: 12, fontWeight: '600', marginTop: 10, textAlign: 'center' },
});
