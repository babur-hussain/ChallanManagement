import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Plus, Download, Eye, MapPin, Phone, Kanban } from 'lucide-react';
import { useLeads, useLeadDashboardSummary } from '@/hooks/api/useLeads';
import { LeadModal } from './components/LeadModal';
import { LeadType, PipelineStage } from '@textilepro/shared';

export function LeadsListPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [stage, setStage] = useState<PipelineStage | undefined>();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading } = useLeads({
        page,
        limit: 20,
        search,
        stage,
    });

    const { data: summary } = useLeadDashboardSummary();

    const columns: Column<any>[] = [
        {
            key: 'company',
            header: 'Lead Name & Contact',
            cell: (item) => (
                <div>
                    <div className="font-medium text-foreground">{item.companyName}</div>
                    {item.contactPerson && <div className="text-xs text-muted-foreground">{item.contactPerson}</div>}
                </div>
            )
        },
        {
            key: 'contact',
            header: 'Phone / Location',
            cell: (item) => (
                <div className="flex flex-col text-sm">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {item.phone}</span>
                    <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> {item.city}{item.state ? `, ${item.state}` : ''}</span>
                </div>
            )
        },
        {
            key: 'leadType',
            header: 'Type',
            cell: (item) => <span className="text-xs bg-muted px-2 py-1 rounded capitalize">{item.leadType.toLowerCase()}</span>
        },
        {
            key: 'pipelineStage',
            header: 'Stage',
            cell: (item) => {
                let color = 'bg-gray-100 text-gray-800 border-gray-200';
                if (item.pipelineStage === 'WON') color = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                if (item.pipelineStage === 'LOST') color = 'bg-red-100 text-red-800 border-red-200';
                if (item.pipelineStage === 'NEGOTIATION') color = 'bg-blue-100 text-blue-800 border-blue-200';
                return <span className={`text-[10px] font-semibold border px-2 py-1 rounded-full ${color}`}>{item.pipelineStage}</span>;
            }
        },
        {
            key: 'temperature',
            header: 'Temperature',
            cell: (item) => {
                const colors = {
                    HOT: 'text-red-600',
                    WARM: 'text-orange-500',
                    COLD: 'text-blue-500',
                };
                return <span className={`text-xs font-semibold uppercase ${colors[item.temperature as keyof typeof colors]}`}>{item.temperature}</span>;
            }
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            width: '80px',
            cell: (item) => (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary no-row-click" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/app/crm/leads/${item._id}`);
                }}>
                    <Eye className="h-4 w-4" />
                </Button>
            )
        }
    ];

    return (
        <div className="container py-4 max-w-7xl">
            <PageHeader
                title="Leads Management"
                description="Manage your prospective buyers, track pipeline, and convert them to parites."
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={() => navigate('/app/crm/leads/kanban')} className="hidden sm:flex">
                            <Kanban className="mr-2 h-4 w-4" /> Kanban View
                        </Button>
                        <Button onClick={() => setIsModalOpen(true)} size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Lead
                        </Button>
                    </>
                }
            />

            {/* KPI Stats */}
            {summary?.data && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-card border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Total Active Leads</p>
                        <p className="text-2xl font-bold mt-1 text-primary">{summary.data.totalLeads}</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Hot Leads</p>
                        <p className="text-2xl font-bold mt-1 text-red-500">{summary.data.hotLeads}</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Pipeline Target</p>
                        <p className="text-2xl font-bold mt-1 text-blue-500">₹{summary.data.pipelineValue.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Won This Month</p>
                        <p className="text-2xl font-bold mt-1 text-emerald-500">{summary.data.wonThisMonth}</p>
                    </div>
                    <div className="bg-card border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground uppercase font-medium">Overdue Follow-ups</p>
                        <p className="text-2xl font-bold mt-1 text-amber-500">{summary.data.overdueFollowups}</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by company, name, phone, city..."
                    globalShortcut
                    className="w-full sm:max-w-md"
                />
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <Button variant={!stage ? 'default' : 'outline'} size="sm" onClick={() => setStage(undefined)} className="rounded-full shadow-none cursor-pointer">
                        All
                    </Button>
                    <Button variant={stage === PipelineStage.NEW ? 'default' : 'outline'} size="sm" onClick={() => setStage(PipelineStage.NEW)} className="rounded-full shadow-none cursor-pointer">
                        New
                    </Button>
                    <Button variant={stage === PipelineStage.CONTACTED ? 'default' : 'outline'} size="sm" onClick={() => setStage(PipelineStage.CONTACTED)} className="rounded-full shadow-none cursor-pointer">
                        Contacted
                    </Button>
                    <Button variant={stage === PipelineStage.NEGOTIATION ? 'default' : 'outline'} size="sm" onClick={() => setStage(PipelineStage.NEGOTIATION)} className="rounded-full shadow-none cursor-pointer">
                        Negotiation
                    </Button>
                </div>
            </div>

            <DataTable
                data={data?.data || []}
                columns={columns}
                keyExtractor={(item) => item._id}
                isLoading={isLoading}
                onRowClick={(item) => navigate(`/app/crm/leads/${item._id}`)}
                pagination={{
                    page,
                    limit: data?.pagination?.limit || 20,
                    total: data?.pagination?.total || 0,
                    totalPages: data?.pagination?.totalPages || 1,
                    onPageChange: setPage,
                }}
                emptyTitle="No leads in pipeline"
                emptyDescription="Your pipeline is empty! Click 'Add Lead' to get started."
                emptyAction={
                    <Button onClick={() => setIsModalOpen(true)} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Add Lead
                    </Button>
                }
            />

            <LeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
