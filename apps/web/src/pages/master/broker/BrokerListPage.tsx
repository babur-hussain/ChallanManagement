import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Plus, Download, Pencil, Trash2, IndianRupee } from 'lucide-react';
import { useBrokers, useDeleteBroker, usePayBrokerCommission } from '@/hooks/api/useBrokers';
import { BrokerModal } from './components/BrokerModal';
import { formatCurrency } from '@textilepro/shared';

export function BrokerListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useBrokers({ page, limit: 20, search });
  const deleteMutation = useDeleteBroker();
  const payMutation = usePayBrokerCommission();

  const handleEdit = (item: any) => {
    setEditingBroker(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingBroker(null);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const columns: Column<any>[] = [
    { key: 'name', header: 'Broker Name', cell: (item) => <span className="font-medium text-foreground">{item.name}</span> },
    { key: 'phone', header: 'Phone', cell: (item) => item.phone },
    { 
      key: 'commission', 
      header: 'Comm. Rate', 
      cell: (item) => (
        <span>
          {item.commissionType === 'PERCENTAGE' 
            ? `${item.commissionRate}%` 
            : `${formatCurrency(item.commissionRate)} / ${item.commissionType === 'FIXED_PER_METER' ? 'mtr' : 'challan'}`
          }
        </span>
      ) 
    },
    { key: 'paymentCycle', header: 'Cycle', cell: (item) => <span className="capitalize">{item.paymentCycle.toLowerCase()}</span> },
    { 
      key: 'totalEarned', 
      header: 'Pending Due', 
      align: 'right',
      cell: (item) => <span className={`font-medium ${item.totalEarned > 0 ? 'text-destructive' : ''}`}>{formatCurrency(item.totalEarned)}</span> 
    },
    { 
      key: 'isActive', 
      header: 'Status', 
      cell: (item) => <StatusBadge status={item.isActive ? 'active' : 'inactive'} /> 
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '120px',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          {item.totalEarned > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 shadow-none bg-green-50 text-green-700 border-green-200 hover:bg-green-100 no-row-click"
              onClick={() => payMutation.mutate({ id: item._id, amount: item.totalEarned })}
              title="Mark as paid"
            >
              <IndianRupee className="h-3 w-3 mr-1" /> Pay
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary no-row-click" onClick={() => handleEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="container py-4 max-w-7xl animate-in fade-in-50">
      <PageHeader
        title="Broker Master"
        description="Manage Dalals, configure commission rates, and track pending payments."
        actions={
          <>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={handleAddNew} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Broker
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search brokers by name or phone..."
          globalShortcut
          className="w-full sm:max-w-sm"
        />
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        pagination={{
          page,
          limit: data?.pagination?.limit || 20,
          total: data?.pagination?.total || 0,
          totalPages: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyTitle="No brokers found"
        emptyDescription="Add your first dalal/broker to calculate commissions automatically."
        emptyAction={
          <Button onClick={handleAddNew} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Add Broker
          </Button>
        }
      />

      <BrokerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brokerToEdit={editingBroker}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Deactivate Broker"
        description="Are you sure you want to deactivate this broker? Existing commission records will not be affected."
        variant="destructive"
        confirmLabel="Deactivate"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
