import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Plus, Download, Eye, FileText, CheckCircle, Ban, Send } from 'lucide-react';
import { useChallans, useGeneratePdf, useSendWhatsapp, useMarkDeliveredChallan } from '@/hooks/api/useChallans';
import { formatCurrency, formatDate } from '@textilepro/shared';

export function ChallanListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  
  const { data, isLoading } = useChallans({ page, limit: 20, search, status });
  const pdfMutation = useGeneratePdf();
  const whatsappMutation = useSendWhatsapp();
  const deliverMutation = useMarkDeliveredChallan();

  const handleCreate = () => navigate('/app/challans/create');

  const columns: Column<any>[] = [
    { 
      key: 'challanNumber', 
      header: 'Challan #', 
      cell: (item) => (
        <div>
          <div className="font-medium text-foreground">{item.challanNumber}</div>
          <div className="text-xs text-muted-foreground">{formatDate(item.date)}</div>
        </div>
      ) 
    },
    { 
      key: 'party', 
      header: 'Party', 
      cell: (item) => (
        <div>
          <div className="font-medium">{item.partySnapshot.name}</div>
          <div className="text-xs text-muted-foreground">{item.partySnapshot.address.city}</div>
        </div>
      ) 
    },
    { 
      key: 'details', 
      header: 'Details', 
      cell: (item) => (
        <div className="text-sm">
          <div>{item.totalRolls} Rolls | {item.totalMeters.toFixed(2)}m</div>
          <div className="text-xs text-muted-foreground truncate w-40" title={item.items.map((i:any) => i.itemName).join(', ')}>
            {item.items.map((i:any) => i.itemName).join(', ')}
          </div>
        </div>
      ) 
    },
    { 
      key: 'amount', 
      header: 'Amount', 
      align: 'right',
      cell: (item) => <div className="font-medium">{formatCurrency(item.totalAmount)}</div> 
    },
    { 
      key: 'status', 
      header: 'Status', 
      cell: (item) => {
        let variant: any = 'default';
        if (item.status === 'DELIVERED') variant = 'success';
        if (item.status === 'DRAFT') variant = 'secondary';
        if (item.status === 'CANCELLED') variant = 'destructive';
        if (item.status === 'SENT') variant = 'warning'; // Blueish ideally, warning is orangeish in shadcn normally, we can custom style
        
        return <StatusBadge status={item.status === 'DELIVERED' ? 'active' : item.status === 'CANCELLED' ? 'cancelled' : 'pending'} label={item.status} />;
      } 
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '180px',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          {item.pdfUrl ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 no-row-click" onClick={() => window.open(item.pdfUrl, '_blank')}>
              <FileText className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground no-row-click" onClick={() => pdfMutation.mutate(item._id)} title="Generate PDF" disabled={pdfMutation.isPending}>
              <FileText className="h-4 w-4 opacity-50" />
            </Button>
          )}

          {item.status !== 'CANCELLED' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 no-row-click" onClick={() => whatsappMutation.mutate(item._id)} title="Send WhatsApp">
              <Send className="h-4 w-4" />
            </Button>
          )}

          {(item.status === 'DRAFT' || item.status === 'SENT') && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-green-600 no-row-click" onClick={() => deliverMutation.mutate({ id: item._id })} title="Mark Delivered">
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}

          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary no-row-click" onClick={() => navigate(`/app/challans/${item._id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="container py-4 max-w-7xl animate-in fade-in-50">
      <PageHeader
        title="Delivery Challans"
        description="Create and manage your delivery challans, send WhatsApp updates, and track dispatch status."
        actions={
          <>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={handleCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Create Challan
            </Button>
          </>
        }
      />

      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase font-medium">Filtered Challans</p>
            <p className="text-2xl font-bold mt-1">{data.stats.totalChallans}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase font-medium">Total Meters</p>
            <p className="text-2xl font-bold mt-1">{data.stats.totalMeters.toFixed(2)} m</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase font-medium">Total Value</p>
            <p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(data.stats.totalAmount)}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by challan #, party, or vehicle..."
          globalShortcut
          className="w-full sm:max-w-md"
        />
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['', 'DRAFT', 'SENT', 'DELIVERED', 'CANCELLED'].map((s) => (
            <Button
              key={s}
              variant={status === s || (!status && !s) ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatus(s || undefined)}
              className="rounded-full shadow-none cursor-pointer"
            >
              {s ? s : 'All'}
            </Button>
          ))}
        </div>
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        onRowClick={(item) => navigate(`/app/challans/${item._id}`)}
        pagination={{
          page,
          limit: data?.pagination?.limit || 20,
          total: data?.pagination?.total || 0,
          totalPages: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
        enableSelection
        emptyTitle="No challans found"
        emptyDescription="Create your first delivery challan to dispatch goods."
        emptyAction={
          <Button onClick={handleCreate} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Create Challan
          </Button>
        }
      />
    </div>
  );
}
