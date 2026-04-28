import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import {
    Plus, Eye, Send, Copy, CheckCircle, XCircle, ArrowRightLeft,
    TrendingUp, Clock, Target, IndianRupee, Percent,
} from 'lucide-react';
import {
    useQuotations,
    useQuotationDashboard,
    useSendQuotationWhatsapp,
    useAcceptQuotation,
    useRejectQuotation,
    useDuplicateQuotation,
    useConvertToChallan,
} from '@/hooks/api/useQuotations';
import { formatCurrency, formatDate } from '@textilepro/shared';

export function QuotationListPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string | undefined>();

    const { data: rawData, isLoading } = useQuotations({ page, limit: 20, search, status });
    const listData = rawData as any;
    const { data: dashboardRaw } = useQuotationDashboard();
    const dashboard = dashboardRaw as any;
    const sendWhatsapp = useSendQuotationWhatsapp();
    const acceptMutation = useAcceptQuotation();
    const rejectMutation = useRejectQuotation();
    const duplicateMutation = useDuplicateQuotation();
    const convertMutation = useConvertToChallan();

    const handleCreate = () => navigate('/app/quotations/create');

    const statusBadgeMap: Record<string, 'active' | 'pending' | 'cancelled'> = {
        DRAFT: 'pending',
        SENT: 'pending',
        VIEWED: 'pending',
        NEGOTIATION: 'pending',
        ACCEPTED: 'active',
        CONVERTED: 'active',
        REJECTED: 'cancelled',
        EXPIRED: 'cancelled',
    };

    const columns: Column<any>[] = [
        {
            key: 'quotationNumber',
            header: 'Quotation #',
            cell: (item) => (
                <div>
                    <div className="font-medium text-foreground">{item.quotationNumber}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(item.date)}</div>
                </div>
            ),
        },
        {
            key: 'customer',
            header: 'Customer',
            cell: (item) => (
                <div>
                    <div className="font-medium">{item.customerSnapshot?.companyName}</div>
                    <div className="text-xs text-muted-foreground">
                        {item.customerSnapshot?.city}{item.customerSnapshot?.contactPerson ? ` • ${item.customerSnapshot.contactPerson}` : ''}
                    </div>
                </div>
            ),
        },
        {
            key: 'items',
            header: 'Items',
            cell: (item) => (
                <div className="text-sm">
                    <Badge variant="outline" className="text-xs">{item.items?.length || 0} items</Badge>
                    <div className="text-xs text-muted-foreground mt-1 truncate w-32" title={item.items?.map((i: any) => i.itemName).join(', ')}>
                        {item.items?.map((i: any) => i.itemName).join(', ')}
                    </div>
                </div>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            align: 'right',
            cell: (item) => <div className="font-semibold text-foreground">{formatCurrency(item.grandTotal)}</div>,
        },
        {
            key: 'validTill',
            header: 'Valid Till',
            cell: (item) => {
                const isExpired = new Date(item.validTillDate) < new Date();
                return (
                    <div className={`text-sm ${isExpired ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                        {formatDate(item.validTillDate)}
                        {isExpired && item.status !== 'EXPIRED' && item.status !== 'ACCEPTED' && item.status !== 'CONVERTED' && (
                            <div className="text-[10px] text-red-400">Expired</div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'status',
            header: 'Status',
            cell: (item) => (
                <StatusBadge
                    status={statusBadgeMap[item.status] || 'pending'}
                    label={item.status}
                />
            ),
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            width: '200px',
            cell: (item) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary no-row-click"
                        onClick={() => navigate(`/app/quotations/${item._id}`)} title="View">
                        <Eye className="h-4 w-4" />
                    </Button>

                    {['DRAFT', 'VIEWED', 'NEGOTIATION'].includes(item.status) && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 no-row-click"
                            onClick={() => sendWhatsapp.mutate(item._id)} title="Send WhatsApp">
                            <Send className="h-4 w-4" />
                        </Button>
                    )}

                    {['SENT', 'VIEWED', 'NEGOTIATION'].includes(item.status) && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 no-row-click"
                            onClick={() => acceptMutation.mutate(item._id)} title="Accept">
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                    )}

                    {item.status === 'ACCEPTED' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 no-row-click"
                            onClick={() => convertMutation.mutate(item._id)} title="Convert to Challan">
                            <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                    )}

                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground no-row-click"
                        onClick={() => duplicateMutation.mutate(item._id)} title="Duplicate">
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="container py-4 max-w-7xl animate-in fade-in-50">
            <PageHeader
                title="Quotations"
                description="Create lightning-fast quotations, track negotiations, and convert to challans."
                actions={
                    <Button onClick={handleCreate} size="sm" className="shadow-md">
                        <Plus className="mr-2 h-4 w-4" /> New Quotation
                    </Button>
                }
            />

            {/* KPI Dashboard Cards */}
            {dashboard && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-blue-500/10"><Send className="h-3.5 w-3.5 text-blue-500" /></div>
                            <span className="text-[11px] text-muted-foreground uppercase font-medium">Sent Today</span>
                        </div>
                        <p className="text-2xl font-bold">{dashboard.sentToday}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-amber-500/10"><Clock className="h-3.5 w-3.5 text-amber-500" /></div>
                            <span className="text-[11px] text-muted-foreground uppercase font-medium">Pending</span>
                        </div>
                        <p className="text-2xl font-bold">{dashboard.pendingFollowups}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /></div>
                            <span className="text-[11px] text-muted-foreground uppercase font-medium">Accepted</span>
                        </div>
                        <p className="text-2xl font-bold">{dashboard.acceptedThisMonth}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-purple-500/10"><Target className="h-3.5 w-3.5 text-purple-500" /></div>
                            <span className="text-[11px] text-muted-foreground uppercase font-medium">Win Rate</span>
                        </div>
                        <p className="text-2xl font-bold">{dashboard.winRate}%</p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-red-500/10"><XCircle className="h-3.5 w-3.5 text-red-500" /></div>
                            <span className="text-[11px] text-muted-foreground uppercase font-medium">Expired</span>
                        </div>
                        <p className="text-2xl font-bold">{dashboard.expired}</p>
                    </div>
                    <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-indigo-500/10"><IndianRupee className="h-3.5 w-3.5 text-indigo-500" /></div>
                            <span className="text-[11px] text-muted-foreground uppercase font-medium">Pipeline</span>
                        </div>
                        <p className="text-xl font-bold">{formatCurrency(dashboard.pipelineValue)}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search quotation #, customer..."
                    globalShortcut
                    className="w-full sm:max-w-md"
                />
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {['', 'DRAFT', 'SENT', 'VIEWED', 'NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED'].map((s) => (
                        <Button
                            key={s}
                            variant={status === s || (!status && !s) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatus(s || undefined)}
                            className="rounded-full shadow-none cursor-pointer whitespace-nowrap"
                        >
                            {s || 'All'}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <DataTable
                data={listData?.data || []}
                columns={columns}
                keyExtractor={(item) => item._id}
                isLoading={isLoading}
                onRowClick={(item) => navigate(`/app/quotations/${item._id}`)}
                pagination={{
                    page,
                    limit: listData?.pagination?.limit || 20,
                    total: listData?.pagination?.total || 0,
                    totalPages: listData?.pagination?.totalPages || 1,
                    onPageChange: setPage,
                }}
                enableSelection
                emptyTitle="No quotations found"
                emptyDescription="Create your first quotation to start winning deals."
                emptyAction={
                    <Button onClick={handleCreate} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Create Quotation
                    </Button>
                }
            />
        </div>
    );
}
