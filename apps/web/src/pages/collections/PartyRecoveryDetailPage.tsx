import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft, RefreshCw, Ban, ShieldCheck, Send, Handshake,
    AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
    IndianRupee, Phone, MessageSquare, FileText,
} from 'lucide-react';
import {
    usePartyCollectionHistory,
    useRecalculateScore,
    useBlockParty,
    useUnblockParty,
    useSendReminder,
    useCreatePromise,
} from '@/hooks/api/useCollections';
import { formatCurrency, formatDate } from '@textilepro/shared';

const gradeColors: Record<string, string> = {
    'A+': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'A': 'bg-green-100 text-green-700 border-green-300',
    'B': 'bg-blue-100 text-blue-700 border-blue-300',
    'C': 'bg-amber-100 text-amber-700 border-amber-300',
    'D': 'bg-orange-100 text-orange-700 border-orange-300',
    'HIGH_RISK': 'bg-red-100 text-red-700 border-red-300',
};

export function PartyRecoveryDetailPage() {
    const { partyId } = useParams<{ partyId: string }>();
    const navigate = useNavigate();
    const { data: historyRaw, isLoading } = usePartyCollectionHistory(partyId!);
    const history = historyRaw as any;
    const recalcMutation = useRecalculateScore();
    const blockMutation = useBlockParty();
    const unblockMutation = useUnblockParty();
    const reminderMutation = useSendReminder();
    const promiseMutation = useCreatePromise();

    const [promiseAmount, setPromiseAmount] = useState(0);
    const [promiseDate, setPromiseDate] = useState('');
    const [promiseBy, setPromiseBy] = useState('');

    if (isLoading) {
        return (
            <div className="container py-8 max-w-5xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-64" />
                    <div className="h-64 bg-muted rounded-xl" />
                </div>
            </div>
        );
    }

    if (!history) {
        return (
            <div className="container py-8 max-w-5xl text-center">
                <p className="text-muted-foreground">Party not found</p>
                <Button variant="outline" onClick={() => navigate('/app/collections/outstanding')} className="mt-4">Back</Button>
            </div>
        );
    }

    const cp = history.creditProfile || {};
    const suggestions = cp.aiSuggestions || [];

    const handlePromise = () => {
        if (!promiseAmount || !promiseDate) return;
        promiseMutation.mutate({
            partyId: partyId!,
            promisedAmount: promiseAmount,
            promisedDate: promiseDate,
            promisedByName: promiseBy || 'Customer',
            communicationMode: 'CALL',
        });
        setPromiseAmount(0);
        setPromiseDate('');
        setPromiseBy('');
    };

    return (
        <div className="container py-4 max-w-5xl animate-in fade-in-50">
            <PageHeader
                title="Party Recovery Detail"
                description="Full collection history, risk analysis, and recovery actions."
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/app/collections/outstanding')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => recalcMutation.mutate(partyId!)}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Recalculate
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ─── Main ─────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Credit Score Card */}
                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Credit Profile</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${gradeColors[cp.creditGrade] || 'bg-muted'}`}>
                                        {cp.creditGrade}
                                    </span>
                                    <span className="text-2xl font-extrabold">{cp.creditScore}/100</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Outstanding</p>
                                <p className="text-2xl font-extrabold text-red-600">{formatCurrency(cp.currentOutstanding)}</p>
                                <p className="text-xs text-muted-foreground mt-1">Limit: {formatCurrency(cp.creditLimitAmount)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-[10px] uppercase text-muted-foreground">Avg Delay</p>
                                <p className={`text-lg font-bold ${cp.avgDelayDays > 15 ? 'text-red-600' : ''}`}>{cp.avgDelayDays}d</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-[10px] uppercase text-muted-foreground">On-Time %</p>
                                <p className={`text-lg font-bold ${cp.onTimePaymentPercent >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{cp.onTimePaymentPercent}%</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-[10px] uppercase text-muted-foreground">Lifetime Sales</p>
                                <p className="text-lg font-bold">{formatCurrency(cp.totalLifetimeSales)}</p>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-[10px] uppercase text-muted-foreground">Broken Promises</p>
                                <p className={`text-lg font-bold ${cp.bouncedPaymentsCount > 0 ? 'text-red-600' : ''}`}>{cp.bouncedPaymentsCount}</p>
                            </div>
                        </div>

                        {/* Risk Flags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {cp.chronicLatePayer && <Badge variant="destructive" className="text-xs">Chronic Late Payer</Badge>}
                            {cp.chequeBounceRisk && <Badge variant="destructive" className="text-xs">Promise Bounce Risk</Badge>}
                            {cp.overLimitNow && <Badge variant="destructive" className="text-xs">Over Limit</Badge>}
                            {cp.overdueNow && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                            {cp.inactiveButOutstanding && <Badge variant="secondary" className="text-xs">Inactive + Outstanding</Badge>}
                            {cp.isBlocked && <Badge variant="destructive" className="text-xs">🚫 BLOCKED</Badge>}
                        </div>

                        {/* AI Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="mt-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3">
                                <p className="text-xs font-bold text-amber-700 mb-1">🤖 AI Recommendations</p>
                                <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                                    {suggestions.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Unpaid Invoices */}
                    <div className="bg-card border rounded-xl overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase">Unpaid Invoices ({history.unpaidInvoices?.length || 0})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Invoice #</th>
                                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Amount</th>
                                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Paid</th>
                                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Due</th>
                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Due Date</th>
                                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(history.unpaidInvoices || []).map((inv: any) => {
                                        const due = (inv.grandTotal || 0) - (inv.amountPaid || 0);
                                        const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date();
                                        return (
                                            <tr key={inv._id} className="border-t hover:bg-muted/30">
                                                <td className="px-4 py-2.5 font-medium">{inv.invoiceNumber}</td>
                                                <td className="px-4 py-2.5 text-right">{formatCurrency(inv.grandTotal)}</td>
                                                <td className="px-4 py-2.5 text-right text-emerald-600">{formatCurrency(inv.amountPaid || 0)}</td>
                                                <td className="px-4 py-2.5 text-right font-bold text-red-600">{formatCurrency(due)}</td>
                                                <td className={`px-4 py-2.5 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                                                    {inv.dueDate ? formatDate(inv.dueDate) : '—'}
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600"
                                                        onClick={() => reminderMutation.mutate(inv._id)}>
                                                        <Send className="mr-1 h-3 w-3" /> Remind
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Promises */}
                    <div className="bg-card border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                            <Handshake className="h-4 w-4" /> Promises ({history.promises?.length || 0})
                        </h3>
                        {(history.promises || []).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No promises recorded</p>
                        ) : (
                            <div className="space-y-2">
                                {history.promises.map((p: any) => (
                                    <div key={p._id} className={`border rounded-lg p-3 ${p.status === 'BROKEN' ? 'bg-red-50 dark:bg-red-500/5 border-red-200' :
                                            p.status === 'FULFILLED' ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200' :
                                                'bg-muted/30'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-bold">{formatCurrency(p.promisedAmount)}</span>
                                                <span className="text-muted-foreground text-xs ml-2">by {formatDate(p.promisedDate)}</span>
                                            </div>
                                            <Badge variant={p.status === 'BROKEN' ? 'destructive' : p.status === 'FULFILLED' ? 'default' : 'secondary'}
                                                className="text-xs">{p.status}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {p.promisedByName} via {p.communicationMode} {p.notes ? `— ${p.notes}` : ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reminders Sent */}
                    <div className="bg-card border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                            <Send className="h-4 w-4" /> Reminders Sent ({history.remindersSent?.length || 0})
                        </h3>
                        {(history.remindersSent || []).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No reminders sent</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {history.remindersSent.map((r: any) => (
                                    <div key={r._id} className="border rounded-lg p-3 bg-muted/30">
                                        <div className="flex items-center justify-between mb-1">
                                            <Badge variant="outline" className="text-[10px]">{r.stage}</Badge>
                                            <span className="text-[10px] text-muted-foreground">{r.sentAt ? formatDate(r.sentAt) : '—'}</span>
                                        </div>
                                        <p className="text-xs">{r.messageEn}</p>
                                        <div className="flex gap-2 mt-1">
                                            {r.delivered && <span className="text-[9px] text-blue-600">✓ Delivered</span>}
                                            {r.read && <span className="text-[9px] text-emerald-600">✓ Read</span>}
                                            {r.replied && <span className="text-[9px] text-purple-600">✓ Replied</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Sidebar ──────────────────────────────────── */}
                <div className="space-y-6">

                    {/* Actions */}
                    <div className="bg-card border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Actions</h3>
                        <div className="space-y-2">
                            {!cp.isBlocked ? (
                                <Button variant="destructive" className="w-full justify-start" size="sm"
                                    onClick={() => blockMutation.mutate({ partyId: partyId!, reason: 'Overdue' })}>
                                    <Ban className="mr-2 h-4 w-4" /> Block Party
                                </Button>
                            ) : (
                                <Button className="w-full justify-start bg-emerald-600" size="sm"
                                    onClick={() => unblockMutation.mutate(partyId!)}>
                                    <ShieldCheck className="mr-2 h-4 w-4" /> Unblock Party
                                </Button>
                            )}
                            <Button variant="outline" className="w-full justify-start" size="sm"
                                onClick={() => recalcMutation.mutate(partyId!)}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Score
                            </Button>
                        </div>
                    </div>

                    {/* Quick Promise */}
                    <div className="bg-card border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">New Promise</h3>
                        <div className="space-y-2">
                            <Input type="number" value={promiseAmount || ''} onChange={e => setPromiseAmount(Number(e.target.value))} placeholder="Amount ₹" />
                            <Input type="date" value={promiseDate} onChange={e => setPromiseDate(e.target.value)} />
                            <Input value={promiseBy} onChange={e => setPromiseBy(e.target.value)} placeholder="Promised by" />
                            <Button className="w-full" size="sm" onClick={handlePromise} disabled={!promiseAmount || !promiseDate}>
                                <Handshake className="mr-2 h-4 w-4" /> Record Promise
                            </Button>
                        </div>
                    </div>

                    {/* Collection Tasks */}
                    <div className="bg-card border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Tasks ({history.tasks?.length || 0})</h3>
                        {(history.tasks || []).length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-3">No tasks</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {history.tasks.slice(0, 10).map((t: any) => (
                                    <div key={t._id} className="border rounded-lg p-2.5 bg-muted/30">
                                        <div className="flex items-center justify-between">
                                            <Badge variant={t.status === 'DONE' ? 'default' : t.status === 'MISSED' ? 'destructive' : 'secondary'}
                                                className="text-[10px]">{t.status}</Badge>
                                            <span className="text-[10px] text-muted-foreground">{formatDate(t.dueAt)}</span>
                                        </div>
                                        <p className="text-xs mt-1">{t.reason} · {t.priority}</p>
                                        {t.actionTaken && <p className="text-[10px] text-muted-foreground mt-1">{t.actionTaken}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
