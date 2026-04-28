import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Landmark, TrendingUp, AlertCircle, Banknote, CreditCard, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkingCapital, useFraudAlerts } from '../hooks/api/useFinance';
import { colors } from '../lib/theme';

export const FinanceScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const { data: wc, isLoading: wcLoading, refetch: refetchWc, isRefetching: isRefetchingWc } = useWorkingCapital();
    const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts, isRefetching: isRefetchingAlerts } = useFraudAlerts();

    const isLoading = wcLoading || alertsLoading;
    const isRefetching = isRefetchingWc || isRefetchingAlerts;
    const refetch = () => { refetchWc(); refetchAlerts(); };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + (Platform.OS === 'android' ? 20 : 0) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 15 }}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Finance Engine</Text>
                <Text style={styles.subtitle}>Real-time Profit & Ledgers</Text>
            </View>

            {isLoading ? (
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView
                    style={styles.container}
                    refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
                >
                    <View style={styles.content}>
                        {/* Working Capital Snapshot */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Working Capital</Text>

                            <View style={styles.row}>
                                <View style={styles.iconBox}><Landmark size={20} color="#2563eb" /></View>
                                <View style={styles.flex1}>
                                    <Text style={styles.meta}>Bank Balances</Text>
                                    <Text style={styles.amountText}>₹{(wc?.bankBalances || 0).toLocaleString('en-IN')}</Text>
                                </View>
                            </View>

                            <View style={[styles.row, { marginTop: 15 }]}>
                                <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}><TrendingUp size={20} color="#16a34a" /></View>
                                <View style={styles.flex1}>
                                    <Text style={styles.meta}>Receivables (Market)</Text>
                                    <Text style={[styles.amountText, { color: '#16a34a' }]}>₹{(wc?.receivables || 0).toLocaleString('en-IN')}</Text>
                                </View>
                            </View>

                            <View style={[styles.row, { marginTop: 15 }]}>
                                <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}><CreditCard size={20} color="#dc2626" /></View>
                                <View style={styles.flex1}>
                                    <Text style={styles.meta}>Payables & Dues</Text>
                                    <Text style={[styles.amountText, { color: '#dc2626' }]}>₹{(wc?.payables || 0).toLocaleString('en-IN')}</Text>
                                </View>
                            </View>
                        </View>

                        {/* AI Alerts */}
                        {(alerts || []).map((alert: any, index: number) => (
                            <TouchableOpacity key={index} style={styles.alertCard}>
                                <AlertCircle size={24} color="#dc2626" />
                                <View style={styles.alertTextWrapper}>
                                    <Text style={styles.alertTitle}>{alert.title || 'Fraud AI Warning'}</Text>
                                    <Text style={styles.alertText}>{alert.description || alert.message}</Text>
                                    <Text style={styles.alertAction}>Review Now <ChevronRight size={14} /></Text>
                                </View>
                            </TouchableOpacity>
                        ))}

                        {/* Quick Actions */}
                        <View style={styles.actionGrid}>
                            <TouchableOpacity style={styles.actionBtn}>
                                <Banknote size={24} color="#fff" />
                                <Text style={styles.actionBtnText}>Approve Expenses</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#475569' }]}>
                                <TrendingUp size={24} color="#fff" />
                                <Text style={styles.actionBtnText}>P&L View</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: { padding: 20, backgroundColor: '#2563eb' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
    content: { padding: 15 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 15 },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    flex1: { flex: 1 },
    meta: { fontSize: 12, color: '#64748b' },
    amountText: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    alertCard: { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
    alertTextWrapper: { marginLeft: 12, flex: 1 },
    alertTitle: { color: '#dc2626', fontWeight: 'bold', fontSize: 14 },
    alertText: { color: '#b91c1c', fontSize: 13, marginTop: 4 },
    alertAction: { color: '#dc2626', fontWeight: '600', fontSize: 13, marginTop: 8, flexDirection: 'row', alignItems: 'center' },
    actionGrid: { flexDirection: 'row', gap: 10 },
    actionBtn: { flex: 1, backgroundColor: '#2563eb', borderRadius: 12, padding: 20, alignItems: 'center', justifyContent: 'center' },
    actionBtnText: { color: '#fff', fontWeight: 'bold', marginTop: 10, fontSize: 13, textAlign: 'center' }
});
