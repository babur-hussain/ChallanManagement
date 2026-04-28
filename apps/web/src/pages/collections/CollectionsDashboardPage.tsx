import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    IndianRupee, AlertTriangle, Clock, CheckCircle, XCircle,
    TrendingUp, ShieldAlert, Handshake, BarChart3, Users,
} from 'lucide-react';
import { useCollectionDashboard, useAgingReport, useHighRiskParties, useCollectorPerformance } from '@/hooks/api/useCollections';
import { formatCurrency } from '@textilepro/shared';

export function CollectionsDashboardPage() {
    const navigate = useNavigate();
    const { data: dashboardRaw } = useCollectionDashboard();
    const dashboard = dashboardRaw as any;
    const { data: agingRaw } = useAgingReport();
    const aging = (agingRaw as any) || [];
    const { data: highRiskRaw } = useHighRiskParties();
    const highRisk = (highRiskRaw as any) || [];
    const { data: perfRaw } = useCollectorPerformance();
    const performers = (perfRaw as any) || [];

    const maxBucket = Math.max(...(aging.map?.((b: any) => b.amount) || [1]));

    return (
        <div className="container py-4 max-w-7xl animate-in fade-in-50">
            <PageHeader
                title="Collections & Recovery"
                description="Track outstanding, manage promises, recover payments faster."
                actions={
                    <Button onClick={() => navigate('/app/collections/outstanding')} size="sm" className="shadow-md">
                        <Users className="mr-2 h-4 w-4" /> Outstanding Table
                    </Button>
                }
            />

            {/* KPI Dashboard */}
            {dashboard && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-red-500/10"><IndianRupee className="h-3.5 w-3.5 text-red-500" /></div>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">Outstanding</span>
                        </div>
                        <p className="text-xl font-bold">{formatCurrency(dashboard.totalOutstanding)}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-amber-500/10"><Clock className="h-3.5 w-3.5 text-amber-500" /></div>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">Due Today</span>
                        </div>
                        <p className="text-xl font-bold">{formatCurrency(dashboard.dueToday)}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-red-600/10"><AlertTriangle className="h-3.5 w-3.5 text-red-600" /></div>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">Overdue</span>
                        </div>
                        <p className="text-xl font-bold text-red-600">{formatCurrency(dashboard.overdueTotal)}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /></div>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">Collected ₹</span>
                        </div>
                        <p className="text-xl font-bold text-emerald-600">{formatCurrency(dashboard.collectedToday)}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-orange-500/10"><ShieldAlert className="h-3.5 w-3.5 text-orange-500" /></div>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">High Risk</span>
                        </div>
                        <p className="text-xl font-bold">{dashboard.highRiskAccounts}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-blue-500/10"><Handshake className="h-3.5 w-3.5 text-blue-500" /></div>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">Promises</span>
                        </div>
                        <p className="text-xl font-bold">{dashboard.promisesPending}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-rose-500/10"><XCircle className="h-3.5 w-3.5 text-rose-500" /></div>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">Broken</span>
                        </div>
                        <p className="text-xl font-bold text-rose-600">{dashboard.brokenPromises}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Aging Bucket Chart */}
                <div className="bg-card border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Aging Report
                    </h3>
                    <div className="space-y-3">
                        {aging.map?.((bucket: any, idx: number) => {
                            const pct = maxBucket > 0 ? (bucket.amount / maxBucket) * 100 : 0;
                            const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500', 'bg-rose-600'];
                            return (
                                <div key={idx}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-muted-foreground font-medium">{bucket.label}</span>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-xs">{bucket.count} inv</Badge>
                                            <span className="font-bold">{formatCurrency(bucket.amount)}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${colors[idx] || 'bg-primary'} transition-all duration-500`}
                                            style={{ width: `${Math.max(2, pct)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Defaulters */}
                <div className="bg-card border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" /> High Risk Parties ({highRisk.length})
                    </h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {highRisk.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No high-risk parties 🎉</p>
                        ) : (
                            highRisk.slice(0, 10).map((p: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/app/collections/party/${p.partyId?._id || p.partyId}`)}>
                                    <div>
                                        <p className="font-medium text-sm">{p.partyId?.name || 'Unknown'}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant={p.riskLevel === 'CRITICAL' ? 'destructive' : 'secondary'} className="text-[10px]">
                                                {p.creditGrade}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground">Score: {p.creditScore}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-600 text-sm">{formatCurrency(p.currentOutstanding)}</p>
                                        <p className="text-[10px] text-muted-foreground">Avg delay: {p.avgDelayDays}d</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Collector Performance */}
                <div className="bg-card border rounded-xl p-5 lg:col-span-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Collector Performance (This Month)
                    </h3>
                    {performers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No collection data this month</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">#</th>
                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Collector</th>
                                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Tasks</th>
                                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Completed</th>
                                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Recovered</th>
                                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Rate %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {performers.map((p: any, idx: number) => (
                                        <tr key={idx} className="border-t hover:bg-muted/30">
                                            <td className="px-4 py-2.5">
                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                            </td>
                                            <td className="px-4 py-2.5 font-medium">{p.userName}</td>
                                            <td className="px-4 py-2.5 text-right">{p.totalTasks}</td>
                                            <td className="px-4 py-2.5 text-right">{p.completedTasks}</td>
                                            <td className="px-4 py-2.5 text-right font-semibold text-emerald-600">{formatCurrency(p.amountRecovered)}</td>
                                            <td className="px-4 py-2.5 text-right">
                                                <Badge variant={p.recoveryPercent >= 80 ? 'default' : p.recoveryPercent >= 50 ? 'secondary' : 'destructive'}
                                                    className="text-xs">
                                                    {Math.round(p.recoveryPercent)}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
