import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Plus, Eye, FileText, Users, AlertCircle, IndianRupee, Calendar, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useInvoices } from '@/hooks/api/useInvoices';
import { formatCurrency, formatDate, IInvoice } from '@textilepro/shared';

export function InvoiceListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>();
  const [overdue, setOverdue] = useState<boolean>(false);

  const { data, isLoading, refetch } = useInvoices({ page, limit: 20, search, paymentStatus, overdue: overdue ? 'true' : undefined });

  const invoices: IInvoice[] = (data as any)?.data || [];
  const stats = (data as any)?.stats;
  const pagination = (data as any)?.pagination;

  const getPaymentStatusBadge = (invoice: IInvoice) => {
    const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.paymentStatus !== 'PAID';
    switch (invoice.paymentStatus) {
      case 'PAID': return <StatusBadge status="active" label="PAID" />;
      case 'PARTIAL': return <StatusBadge status="pending" label="PARTIALLY PAID" />;
      case 'UNPAID':
        if (isOverdue) return <StatusBadge status="cancelled" label="OVERDUE" />;
        return <StatusBadge status="pending" label="UNPAID" />;
      default: return <StatusBadge status="pending" label={invoice.paymentStatus} />;
    }
  };

  const columns: Column<IInvoice>[] = [
    {
      key: 'invoiceDate',
      header: 'DATE',
      width: '100px',
      cell: (item) => (
        <span className="text-sm text-muted-foreground">{formatDate(item.invoiceDate)}</span>
      )
    },
    {
      key: 'invoiceNumber',
      header: 'INVOICE#',
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-primary hover:underline cursor-pointer">{item.invoiceNumber}</span>
          {item.pdfUrl && <FileText className="w-3 h-3 text-muted-foreground" />}
        </div>
      )
    },
    {
      key: 'challanNumbers',
      header: 'CHALLANS',
      cell: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.challanNumbers?.slice(0, 2).map(n => (
            <span key={n} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{n}</span>
          ))}
          {(item.challanNumbers?.length || 0) > 2 && (
            <span className="text-[10px] text-muted-foreground">+{item.challanNumbers.length - 2}</span>
          )}
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'CUSTOMER NAME',
      cell: (item) => (
        <div>
          <div className="font-medium">{item.partySnapshot.name}</div>
          <div className="text-[10px] text-muted-foreground">{item.partySnapshot.address?.city}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'STATUS',
      cell: (item) => getPaymentStatusBadge(item),
    },
    {
      key: 'dueDate',
      header: 'DUE DATE',
      cell: (item) => {
        const isOverdue = new Date(item.dueDate) < new Date() && item.paymentStatus !== 'PAID';
        return (
          <span className={`text-sm ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
            {formatDate(item.dueDate)}
          </span>
        );
      }
    },
    {
      key: 'amount',
      header: 'AMOUNT',
      align: 'right',
      cell: (item) => (
        <span className="font-semibold">{formatCurrency(item.finalAmount)}</span>
      )
    },
    {
      key: 'balanceDue',
      header: 'BALANCE DUE',
      align: 'right',
      cell: (item) => (
        <span className={`font-semibold ${item.balanceDue > 0 ? 'text-orange-600' : 'text-green-600'}`}>
          {formatCurrency(item.balanceDue)}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '60px',
      cell: (item) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary no-row-click" onClick={() => navigate(`/app/invoices/${item._id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="container py-4 max-w-7xl animate-in fade-in-50">
      <PageHeader
        title="All Invoices"
        description="Manage GST tax invoices, track payments, and monitor receivables."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button onClick={() => navigate('/app/invoices/create')} size="sm">
              <Plus className="mr-2 h-4 w-4" /> New Invoice
            </Button>
          </div>
        }
      />

      {/* ═══════ PAYMENT SUMMARY — Zoho Style ═══════ */}
      <div className="bg-card border rounded-xl mb-6 overflow-hidden">
        <div className="p-3 border-b bg-muted/30">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0">
          <div className="p-4 hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => { setPaymentStatus(undefined); setOverdue(false); }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-green-100 text-green-700">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Total Outstanding Receivables</span>
            </div>
            <p className="text-xl font-bold tracking-tight">{formatCurrency(stats?.totalBalanceDue || 0)}</p>
            <button className="text-[10px] text-green-600 flex items-center gap-1 mt-1 hover:underline" onClick={(e) => { e.stopPropagation(); refetch(); }}>
              <RefreshCw className="w-2.5 h-2.5" /> Refresh
            </button>
          </div>

          <div className="p-4 hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-red-100 text-red-700">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Due Today</span>
            </div>
            <p className="text-xl font-bold text-red-600">{formatCurrency(stats?.dueToday || 0)}</p>
          </div>

          <div className="p-4 hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-blue-100 text-blue-700">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Due Within 30 Days</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(stats?.dueWithin30Days || 0)}</p>
          </div>

          <div className="p-4 hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => { setOverdue(true); setPaymentStatus(undefined); }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-orange-100 text-orange-700">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Overdue Invoice</span>
            </div>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(stats?.overdueAmount || 0)}</p>
          </div>

          <div className="p-4 hover:bg-muted/10 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-full bg-purple-100 text-purple-700">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Avg. No. of Days for Getting Paid</span>
            </div>
            <p className="text-xl font-bold">0 Days</p>
          </div>
        </div>
      </div>

      {/* ═══════ FILTERS ═══════ */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search invoice # or party..."
          className="w-full sm:max-w-md"
        />
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { value: '', label: 'All' },
            { value: 'UNPAID', label: 'Draft' },
            { value: 'PARTIAL', label: 'Partially Paid' },
            { value: 'PAID', label: 'Paid' },
          ].map((s) => (
            <Button
              key={s.value}
              variant={!overdue && (paymentStatus === s.value || (!paymentStatus && !s.value)) ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setPaymentStatus(s.value || undefined); setOverdue(false); setPage(1); }}
              className="rounded-full h-8 text-xs"
            >
              {s.label}
            </Button>
          ))}

          <Button
            variant={overdue ? 'destructive' : 'outline'}
            size="sm"
            className="rounded-full h-8 text-xs border-destructive/50"
            onClick={() => { setOverdue(true); setPaymentStatus(undefined); setPage(1); }}
          >
            <AlertCircle className="mr-1 h-3 w-3" /> Overdue
          </Button>
        </div>
      </div>

      {/* ═══════ DATA TABLE ═══════ */}
      <DataTable
        data={invoices}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        onRowClick={(item) => navigate(`/app/invoices/${item._id}`)}
        pagination={pagination ? {
          page,
          limit: pagination.limit || 20,
          total: pagination.total || 0,
          totalPages: pagination.totalPages || 1,
          onPageChange: setPage,
        } : undefined}
        emptyTitle="No invoices found."
        emptyDescription="Create your first invoice by generating one from delivery challans."
        emptyAction={
          <Button onClick={() => navigate('/app/invoices/create')} variant="outline" className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Create an Invoice
          </Button>
        }
      />
    </div>
  );
}
