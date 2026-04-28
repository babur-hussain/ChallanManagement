import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/shared/SearchInput';
import {
    Phone, MessageSquare, Handshake, Ban, IndianRupee,
    ShieldAlert, Eye, ArrowLeft, Send,
} from 'lucide-react';
import { useOutstandingParties, useBlockParty, useUnblockParty, useCreatePromise, useSendReminder } from '@/hooks/api/useCollections';
import { formatCurrency, formatDate } from '@textilepro/shared';

const gradeColors: Record<string, string> = {
    'A+': 'bg-emerald-100 text-emerald-700',
    'A': 'bg-green-100 text-green-700',
    'B': 'bg-blue-100 text-blue-700',
    'C': 'bg-amber-100 text-amber-700',
    'D': 'bg-orange-100 text-orange-700',
    'HIGH_RISK': 'bg-red-100 text-red-700',
};

const riskColors: Record<string, string> = {
    LOW: 'text-emerald-600',
    MEDIUM: 'text-amber-600',
    HIGH: 'text-orange-600',
    CRITICAL: 'text-red-600',
};

export function OutstandingTablePage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [riskFilter, setRiskFilter] = useState<string>('');
    const { data: partiesRaw, isLoading } = useOutstandingParties({ riskLevel: riskFilter || undefined });
    const parties = (partiesRaw as any) || [];
    const blockMutation = useBlockParty();
    const unblockMutation = useUnblockParty();
    const promiseMutation = useCreatePromise();

    // Promise form state
    const [promisePartyId, setPromisePartyId] = useState<string | null>(null);
    const [promiseAmount, setPromiseAmount] = useState(0);
    const [promiseDate, setPromiseDate] = useState('');
    const [promiseBy, setPromiseBy] = useState('');

    const filtered = search
        ? parties.filter((p: any) =>
            (p.partyId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.partyId?.address?.city || '').toLowerCase().includes(search.toLowerCase())
        )
        : parties;

    const handleCreatePromise = async () => {
        if (!promisePartyId || !promiseAmount || !promiseDate) return;
        await promiseMutation.mutateAsync({
            partyId: promisePartyId,
            promisedAmount: promiseAmount,
            promisedDate: promiseDate,
            promisedByName: promiseBy || 'Customer',
            communicationMode: 'CALL',
        });
        setPromisePartyId(null);
        setPromiseAmount(0);
        setPromiseDate('');
        setPromiseBy('');
    };

    return (
        <div className="container py-4 max-w-7xl animate-in fade-in-50">
            <PageHeader
                title="Outstanding Parties"
                description="Track receivables, manage credit, and recover payments."
                actions={
                    <Button variant="outline" size="sm" onClick={() => navigate('/app/collections')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
                    </Button>
                }
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <SearchInput value={search} onChange={setSearch} placeholder="Search party name, city..." className="w-full sm:max-w-md" />
                <div className="flex gap-2">
                    {['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(r => (
                        <Button key={r} size="sm" variant={riskFilter === r ? 'default' : 'outline'} className="rounded-full"
                            onClick={() => setRiskFilter(r)}>
                            {r || 'All'}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Party</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">City</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Outstanding</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Limit</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Avg Delay</th>
                                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Grade</th>
                                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Risk</th>
                                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Score</th>
                                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">No outstanding parties found</td></tr>
                            ) : (
                                filtered.map((p: any) => {
                                    const party = p.partyId || {};
                                    const overLimit = p.currentOutstanding > p.creditLimitAmount;
                                    return (
                                        <tr key={p._id} className="border-t hover:bg-muted/30 cursor-pointer"
                                            onClick={() => navigate(`/app/collections/party/${party._id || p.partyId}`)}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{party.name || 'Unknown'}</div>
                                                {p.isBlocked && <Badge variant="destructive" className="text-[10px] mt-0.5">BLOCKED</Badge>}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{party.address?.city || '—'}</td>
                                            <td className={`px-4 py-3 text-right font-bold ${overLimit ? 'text-red-600' : ''}`}>
                                                {formatCurrency(p.currentOutstanding)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(p.creditLimitAmount)}</td>
                                            <td className={`px-4 py-3 text-right ${p.avgDelayDays > 15 ? 'text-red-600 font-bold' : ''}`}>{p.avgDelayDays}d</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${gradeColors[p.creditGrade] || 'bg-muted'}`}>
                                                    {p.creditGrade}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3 text-center font-semibold text-xs ${riskColors[p.riskLevel] || ''}`}>{p.riskLevel}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="inline-flex items-center gap-1">
                                                    <div className={`w-8 h-2 rounded-full ${p.creditScore >= 75 ? 'bg-emerald-500' :
                                                            p.creditScore >= 50 ? 'bg-amber-500' :
                                                                p.creditScore >= 25 ? 'bg-orange-500' : 'bg-red-500'
                                                        }`} style={{ width: `${p.creditScore * 0.4}px` }} />
                                                    <span className="text-xs font-medium">{p.creditScore}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {p.overdueNow ? <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
                                                    : <Badge variant="secondary" className="text-[10px]">OK</Badge>}
                                            </td>
                                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" title="View"
                                                        onClick={() => navigate(`/app/collections/party/${party._id || p.partyId}`)}>
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" title="WhatsApp"
                                                        onClick={() => window.open(`https://wa.me/${party.phone}`, '_blank')}>
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" title="Promise"
                                                        onClick={() => { setPromisePartyId(party._id || p.partyId); setPromiseAmount(p.currentOutstanding); }}>
                                                        <Handshake className="h-3.5 w-3.5" />
                                                    </Button>
                                                    {!p.isBlocked ? (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" title="Block"
                                                            onClick={() => blockMutation.mutate({ partyId: party._id || p.partyId, reason: 'Overdue payment' })}>
                                                            <Ban className="h-3.5 w-3.5" />
                                                        </Button>
                                                    ) : (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" title="Unblock"
                                                            onClick={() => unblockMutation.mutate(party._id || p.partyId)}>
                                                            <ShieldAlert className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Promise Modal Inline */}
            {promisePartyId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPromisePartyId(null)}>
                    <div className="bg-card rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Record Payment Promise</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Amount ₹</label>
                                <Input type="number" value={promiseAmount} onChange={e => setPromiseAmount(Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Promise Date</label>
                                <Input type="date" value={promiseDate} onChange={e => setPromiseDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Promised By</label>
                                <Input value={promiseBy} onChange={e => setPromiseBy(e.target.value)} placeholder="Contact person name" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setPromisePartyId(null)}>Cancel</Button>
                                <Button className="flex-1 bg-blue-600" onClick={handleCreatePromise} disabled={promiseMutation.isPending}>
                                    <Handshake className="mr-2 h-4 w-4" /> Save Promise
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
