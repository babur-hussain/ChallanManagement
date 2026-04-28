import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, SafeAreaView, RefreshControl, Animated,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../lib/api';
import { colors, spacing, radius, typography, shadows } from '../lib/theme';

function useOutstandingReport(partyId?: string) {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const params: any = {};
            if (partyId) params.partyId = partyId;
            const response = await api.get('/reports/outstanding-json', { params });
            setData(response.data?.data || response.data);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [partyId]);

    return { data, isLoading, error, refetch: fetchData };
}

function useAiInsights() {
    const [insights, setInsights] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFired, setHasFired] = useState(false);

    const fetchInsights = async (summary: any, topParties: any[]) => {
        if (!summary || hasFired) return;
        try {
            setIsLoading(true);
            setHasFired(true);
            const response = await api.post('/reports/outstanding-ai-insights', {
                summary,
                topParties: topParties.slice(0, 8).map(p => ({
                    partyName: p.partyName,
                    city: p.city,
                    totalOutstanding: p.totalOutstanding,
                    invoiceCount: p.invoiceCount,
                    daysOverdue: Math.max(...(p.invoices || []).map((i: any) => i.daysOverdue || 0), 0),
                })),
            });
            setInsights(response.data?.data?.insights || []);
        } catch {
            setInsights([{ icon: '⚠️', title: 'AI Unavailable', body: 'Could not generate insights.', severity: 'low' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const refetch = (summary: any, topParties: any[]) => {
        setHasFired(false);
        setInsights([]);
        fetchInsights(summary, topParties);
    };

    return { insights, isLoading, fetchInsights, refetch };
}

// ─── Visual Bar Component ────────────────────
function AgingBar({ label, amount, total, color }: { label: string; amount: number; total: number; color: string }) {
    const pct = total > 0 ? (amount / total) * 100 : 0;
    return (
        <View style={agingStyles.row}>
            <Text style={agingStyles.label}>{label}</Text>
            <View style={agingStyles.barTrack}>
                <View style={[agingStyles.barFill, { width: `${Math.max(pct, 2)}%`, backgroundColor: color }]} />
            </View>
            <Text style={[agingStyles.amt, { color }]}>₹{(amount / 1000).toFixed(1)}K</Text>
        </View>
    );
}

const agingStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    label: { width: 70, fontSize: 11, fontWeight: '600', color: colors.textSecondary },
    barTrack: { flex: 1, height: 18, backgroundColor: '#f1f5f9', borderRadius: 9, overflow: 'hidden', marginHorizontal: 8 },
    barFill: { height: '100%', borderRadius: 9 },
    amt: { width: 65, fontSize: 12, fontWeight: 'bold', textAlign: 'right' },
});

// ─── Donut Ring ──────────────────────────────
function DonutRing({ segments, size = 120, strokeWidth = 20 }: { segments: { pct: number; color: string }[]; size?: number; strokeWidth?: number }) {
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    return (
        <View style={{ width: size, height: size }}>
            <View style={{ position: 'absolute', width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                {/* SVG-like donut using nested Views */}
                {segments.map((seg, i) => {
                    const rotation = offset * 3.6;
                    offset += seg.pct;
                    return (
                        <View
                            key={i}
                            style={{
                                position: 'absolute', width: size, height: size,
                                borderRadius: size / 2, borderWidth: strokeWidth,
                                borderColor: 'transparent',
                                borderTopColor: seg.color,
                                borderRightColor: seg.pct > 25 ? seg.color : 'transparent',
                                borderBottomColor: seg.pct > 50 ? seg.color : 'transparent',
                                borderLeftColor: seg.pct > 75 ? seg.color : 'transparent',
                                transform: [{ rotate: `${rotation}deg` }],
                            }}
                        />
                    );
                })}
            </View>
        </View>
    );
}

// ─── Severity Badge ──────────────────────────
const severityConfig: Record<string, { bg: string; text: string; border: string }> = {
    high: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    medium: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    low: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
};

export function OutstandingReportScreen({ route }: any) {
    const navigation = useNavigation<any>();
    const partyId = route?.params?.partyId;
    const { data, isLoading, refetch } = useOutstandingReport(partyId);
    const summary = data?.summary;
    const parties = data?.parties || [];

    const aiHook = useAiInsights();

    // Fire AI immediately as soon as outstanding data loads
    useEffect(() => {
        if (data && !aiHook.isLoading) {
            aiHook.fetchInsights(data.summary, data.parties || []);
        }
    }, [data]);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /><Text style={{ marginTop: 12, color: colors.textMuted }}>Loading Report…</Text></View>
            </SafeAreaView>
        );
    }

    const total = summary?.totalOutstanding || 0;

    // Pie segments
    const segments = [
        { pct: total > 0 ? ((summary?.current || 0) / total) * 100 : 0, color: '#22c55e' },
        { pct: total > 0 ? ((summary?.days30_60 || 0) / total) * 100 : 0, color: '#f59e0b' },
        { pct: total > 0 ? ((summary?.days60_90 || 0) / total) * 100 : 0, color: '#f97316' },
        { pct: total > 0 ? ((summary?.days90Plus || 0) / total) * 100 : 0, color: '#ef4444' },
    ].filter(s => s.pct > 0);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
            >
                {/* Header */}
                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>Outstanding Report</Text>
                    <Text style={styles.heroSubtitle}>{summary?.totalParties || 0} parties • {summary?.totalInvoices || 0} invoices</Text>
                    <View style={styles.heroBigNumber}>
                        <Text style={styles.heroCurrency}>₹</Text>
                        <Text style={styles.heroAmount}>{total.toLocaleString('en-IN')}</Text>
                    </View>
                    <Text style={styles.heroLabel}>Total Outstanding</Text>
                </View>

                {/* Aging Distribution */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>📊 Aging Distribution</Text>

                    <View style={styles.agingVisual}>
                        {/* Donut */}
                        <View style={{ alignItems: 'center' }}>
                            <DonutRing segments={segments} />
                        </View>

                        {/* Legend */}
                        <View style={styles.legendContainer}>
                            {[
                                { label: 'Current', color: '#22c55e', pct: segments[0]?.pct || 0 },
                                { label: '31-60d', color: '#f59e0b', pct: segments[1]?.pct || 0 },
                                { label: '61-90d', color: '#f97316', pct: segments[2]?.pct || 0 },
                                { label: '90+d', color: '#ef4444', pct: segments[3]?.pct || 0 },
                            ].map(l => (
                                <View key={l.label} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                                    <Text style={styles.legendLabel}>{l.label}</Text>
                                    <Text style={[styles.legendPct, { color: l.color }]}>{l.pct.toFixed(0)}%</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Bars */}
                    <View style={{ marginTop: spacing.md }}>
                        <AgingBar label="Current" amount={summary?.current || 0} total={total} color="#22c55e" />
                        <AgingBar label="31-60 days" amount={summary?.days30_60 || 0} total={total} color="#f59e0b" />
                        <AgingBar label="61-90 days" amount={summary?.days60_90 || 0} total={total} color="#f97316" />
                        <AgingBar label="90+ days" amount={summary?.days90Plus || 0} total={total} color="#ef4444" />
                    </View>
                </View>

                {/* AI Insights */}
                <View style={styles.sectionCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.sectionTitle}>🤖 AI Insights</Text>
                        <View style={styles.aiBadge}><Text style={styles.aiLabel}>Gemma 4</Text></View>
                    </View>

                    {aiHook.isLoading ? (
                        <View style={styles.aiLoading}>
                            <LottieView
                                source={require('../../assets/ai_loading.lottie')}
                                autoPlay
                                loop
                                style={{ width: 160, height: 160 }}
                            />
                            <Text style={styles.aiLoadingText}>Analyzing your outstanding data with Gemma 4...</Text>
                        </View>
                    ) : aiHook.insights.length > 0 ? (
                        <View style={{ gap: spacing.sm }}>
                            {aiHook.insights.map((insight: any, idx: number) => {
                                const sev = severityConfig[insight.severity] || severityConfig.medium;
                                return (
                                    <View key={idx} style={[styles.insightCard, { backgroundColor: sev.bg, borderColor: sev.border }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                            <Text style={{ fontSize: 20, marginRight: 8 }}>{insight.icon}</Text>
                                            <Text style={[styles.insightTitle, { color: sev.text }]}>{insight.title}</Text>
                                        </View>
                                        <Text style={styles.insightBody}>{insight.body}</Text>
                                    </View>
                                );
                            })}
                            <TouchableOpacity style={styles.refreshAiButton} onPress={() => aiHook.refetch(summary, parties)}>
                                <Text style={styles.refreshAiText}>🔄 Regenerate Insights</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Text style={{ textAlign: 'center', color: colors.textMuted, paddingVertical: spacing.md }}>Waiting for data to generate insights...</Text>
                    )}
                </View>

                {/* Party Breakdown */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>👥 Party Breakdown</Text>
                    {parties.length === 0 ? (
                        <Text style={styles.emptyText}>No outstanding balances found.</Text>
                    ) : (
                        parties.map((party: any, idx: number) => {
                            const rank = idx + 1;
                            const riskColor = party.days90Plus > 0 ? '#ef4444' : party.days60_90 > 0 ? '#f97316' : party.days30_60 > 0 ? '#f59e0b' : '#22c55e';
                            const pct = total > 0 ? ((party.totalOutstanding / total) * 100).toFixed(1) : '0';

                            return (
                                <TouchableOpacity
                                    key={party.partyId}
                                    style={styles.partyCard}
                                    onPress={() => navigation.navigate('PartyDetail', { id: party.partyId })}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.partyHeader}>
                                        <View style={[styles.rankBadge, { backgroundColor: riskColor + '20', borderColor: riskColor }]}>
                                            <Text style={[styles.rankText, { color: riskColor }]}>#{rank}</Text>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: spacing.sm }}>
                                            <Text style={styles.partyName} numberOfLines={1}>{party.partyName}</Text>
                                            <Text style={styles.partyMeta}>{party.city} • {party.invoiceCount} invoice{party.invoiceCount !== 1 ? 's' : ''}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={[styles.partyAmount, { color: riskColor }]}>₹{party.totalOutstanding.toLocaleString('en-IN')}</Text>
                                            <Text style={styles.partyPct}>{pct}%</Text>
                                        </View>
                                    </View>

                                    {/* Mini aging bar */}
                                    <View style={styles.miniAgingContainer}>
                                        <View style={[styles.miniAgingBar, { flex: party.current || 0.01, backgroundColor: '#22c55e' }]} />
                                        <View style={[styles.miniAgingBar, { flex: party.days30_60 || 0.01, backgroundColor: '#f59e0b' }]} />
                                        <View style={[styles.miniAgingBar, { flex: party.days60_90 || 0.01, backgroundColor: '#f97316' }]} />
                                        <View style={[styles.miniAgingBar, { flex: party.days90Plus || 0.01, backgroundColor: '#ef4444' }]} />
                                    </View>

                                    {/* Top invoices */}
                                    {(party.invoices || []).slice(0, 2).map((inv: any) => (
                                        <View key={inv.invoiceId} style={styles.miniInvoice}>
                                            <Text style={styles.miniInvNumber}>{inv.invoiceNumber}</Text>
                                            <Text style={styles.miniInvDue}>₹{inv.balanceDue?.toLocaleString('en-IN')}</Text>
                                            {inv.daysOverdue > 0 && <Text style={styles.miniInvDays}>{inv.daysOverdue}d</Text>}
                                        </View>
                                    ))}
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Hero
    heroCard: {
        margin: spacing.md, padding: spacing.xl,
        borderRadius: radius.xl, alignItems: 'center',
        backgroundColor: '#0f172a',
        ...shadows.lg,
    },
    heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
    heroSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
    heroBigNumber: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.lg },
    heroCurrency: { fontSize: 22, fontWeight: '700', color: '#f59e0b', marginTop: 6 },
    heroAmount: { fontSize: 40, fontWeight: '800', color: '#ffffff', letterSpacing: -1 },
    heroLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },

    // Sections
    sectionCard: {
        marginHorizontal: spacing.md, marginBottom: spacing.md,
        backgroundColor: '#ffffff', borderRadius: radius.lg,
        padding: spacing.lg, ...shadows.sm,
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: spacing.md },

    // Aging Visual
    agingVisual: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    legendContainer: { gap: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendLabel: { fontSize: 12, color: colors.textSecondary, width: 50 },
    legendPct: { fontSize: 13, fontWeight: 'bold' },

    // AI
    aiBadge: { backgroundColor: '#ede9fe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    aiLabel: { fontSize: 10, fontWeight: 'bold', color: '#7c3aed' },
    aiButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#7c3aed', borderRadius: radius.md,
        paddingVertical: spacing.md, gap: 8,
        ...shadows.sm,
    },
    aiButtonIcon: { fontSize: 20 },
    aiButtonText: { fontSize: 15, fontWeight: 'bold', color: '#ffffff' },
    aiLoading: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
    aiLoadingText: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
    insightCard: {
        padding: spacing.md, borderRadius: radius.md,
        borderWidth: 1,
    },
    insightTitle: { fontSize: 14, fontWeight: 'bold' },
    insightBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
    refreshAiButton: { alignItems: 'center', paddingTop: spacing.sm },
    refreshAiText: { fontSize: 13, color: '#7c3aed', fontWeight: '600' },

    // Party cards
    emptyText: { textAlign: 'center', color: colors.textMuted, paddingVertical: spacing.xl },
    partyCard: {
        backgroundColor: '#fafbfc', borderRadius: radius.md,
        padding: spacing.md, marginBottom: spacing.sm,
        borderWidth: 1, borderColor: '#e2e8f0',
    },
    partyHeader: { flexDirection: 'row', alignItems: 'center' },
    rankBadge: {
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5,
    },
    rankText: { fontSize: 12, fontWeight: 'bold' },
    partyName: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary },
    partyMeta: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
    partyAmount: { fontSize: 16, fontWeight: 'bold' },
    partyPct: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
    miniAgingContainer: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: spacing.sm, gap: 2 },
    miniAgingBar: { borderRadius: 3, minWidth: 4 },
    miniInvoice: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingTop: 6, marginTop: 4,
        borderTopWidth: 1, borderTopColor: '#f1f5f9',
    },
    miniInvNumber: { fontSize: 11, color: colors.primary, fontWeight: '600', flex: 1 },
    miniInvDue: { fontSize: 12, fontWeight: 'bold', color: colors.textPrimary },
    miniInvDays: { fontSize: 10, fontWeight: '700', color: '#ef4444', backgroundColor: '#fef2f2', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 },
});
