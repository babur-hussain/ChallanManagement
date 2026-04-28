import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Plus, Download, Eye, MapPin, Phone } from 'lucide-react';
import { useParties, usePartyStats } from '@/hooks/api/useParties';
import { PartyModal } from './components/PartyModal';
import { PartyType, formatCurrency } from '@textilepro/shared';

export function PartyListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [partyType, setPartyType] = useState<PartyType | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useParties({
    page,
    limit: 20,
    search,
    partyType,
  });

  const { data: stats } = usePartyStats();

  const columns: Column<any>[] = [
    { 
      key: 'name', 
      header: 'Party Name', 
      cell: (item) => (
        <div>
          <div className="font-medium text-foreground">{item.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{item.shortCode}</div>
        </div>
      ) 
    },
    { 
      key: 'contact', 
      header: 'Contact', 
      cell: (item) => (
        <div className="flex flex-col text-sm">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {item.phone}</span>
          <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> {item.address.city}</span>
        </div>
      ) 
    },
    { 
      key: 'partyType', 
      header: 'Type', 
      cell: (item) => <span className="text-xs bg-muted px-2 py-1 rounded capitalize">{item.partyType.toLowerCase()}</span> 
    },
    { 
      key: 'outstandingBalance', 
      header: 'Outstanding', 
      align: 'right',
      cell: (item) => {
        const amt = item.outstandingBalance || 0;
        const color = amt > 0 ? 'text-destructive' : amt < 0 ? 'text-green-600' : 'text-muted-foreground';
        return (
          <div className={`font-medium ${color}`}>
            {formatCurrency(Math.abs(amt))} {amt > 0 ? 'DR' : amt < 0 ? 'CR' : ''}
          </div>
        );
      } 
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
      width: '80px',
      cell: (item) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary no-row-click" onClick={(e) => {
          e.stopPropagation();
          navigate(`/app/parties/${item._id}`);
        }}>
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="container py-4 max-w-7xl">
      <PageHeader
        title="Parties & Clients"
        description="Manage your buyers, brokers, outstanding balances and statements."
        actions={
          <>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={() => setIsModalOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Party
            </Button>
          </>
        }
      />

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase font-medium">Total Parties</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase font-medium">Total Buyers</p>
            <p className="text-2xl font-bold mt-1">{stats.byType?.BUYER || 0}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase font-medium">Market Outstanding</p>
            <p className="text-2xl font-bold mt-1 text-destructive">{formatCurrency(stats.totalOutstanding)}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, code, phone, city..."
          globalShortcut
          className="w-full sm:max-w-md"
        />
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button variant={!partyType ? 'default' : 'outline'} size="sm" onClick={() => setPartyType(undefined)} className="rounded-full shadow-none cursor-pointer">
            All
          </Button>
          <Button variant={partyType === 'BUYER' ? 'default' : 'outline'} size="sm" onClick={() => setPartyType('BUYER')} className="rounded-full shadow-none cursor-pointer">
            Buyers
          </Button>
          <Button variant={partyType === 'BROKER' ? 'default' : 'outline'} size="sm" onClick={() => setPartyType('BROKER')} className="rounded-full shadow-none cursor-pointer">
            Brokers
          </Button>
        </div>
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        onRowClick={(item) => navigate(`/app/parties/${item._id}`)}
        pagination={{
          page,
          limit: data?.pagination?.limit || 20,
          total: data?.pagination?.total || 0,
          totalPages: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyTitle="No parties found"
        emptyDescription="Add your first client to start creating challans."
        emptyAction={
          <Button onClick={() => setIsModalOpen(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Add Party
          </Button>
        }
      />

      <PartyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
