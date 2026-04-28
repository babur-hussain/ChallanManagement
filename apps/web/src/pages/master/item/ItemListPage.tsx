import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Plus, Download, Upload, Pencil, Trash2 } from 'lucide-react';
import { useItems, useDeleteItem } from '@/hooks/api/useItems';
import { ItemModal } from './components/ItemModal';
import { IItem, formatCurrency } from '@textilepro/shared';
import { useCategories } from '@/hooks/api/useCategories';

// For brevity, we mock a bit of the import modal handling or skip it internally and focus on the list
// A separate `FabricImportModal` typically handles the exact Excel file parsing

export function ItemListPage({ hideHeader = false }: { hideHeader?: boolean }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuality, setEditingQuality] = useState<IItem | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useItems({
    page,
    limit: 20,
    search,
    category: selectedCategory,
  });

  const { data: categoriesData } = useCategories({ limit: 100, isActive: true });
  const categories = categoriesData?.data || [];

  const deleteMutation = useDeleteItem();

  const handleEdit = (item: IItem) => {
    setEditingQuality(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingQuality(null);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const columns: Column<any>[] = [
    { key: 'name', header: 'Item Name', cell: (item) => <span className="font-medium text-foreground">{item.name}</span> },
    { key: 'shortCode', header: 'Code', cell: (item) => <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{item.shortCode}</span> },
    { key: 'category', header: 'Category', cell: (item) => <span className="capitalize">{item.category.toLowerCase()}</span> },
    { key: 'hsnCode', header: 'HSN', cell: (item) => <span className="font-mono text-muted-foreground">{item.hsnCode}</span> },
    {
      key: 'defaultRate',
      header: 'Rate',
      align: 'right',
      cell: (item) => (
        <div className="text-right">
          <span className="font-medium">{formatCurrency(item.defaultRate)}</span>
          <span className="text-xs text-muted-foreground block">/{item.unit.toLowerCase()}</span>
        </div>
      )
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
      width: '100px',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary no-row-click" onClick={() => handleEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive no-row-click" onClick={() => setDeleteId(item._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className={hideHeader ? "w-full animate-in fade-in-50" : "container py-4 max-w-7xl"}>
      {!hideHeader && (
        <PageHeader
          title="Item Master"
          description="Manage your items, products, rates, and HSN codes."
          actions={
            <>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button variant="secondary" size="sm">
                <Upload className="mr-2 h-4 w-4" /> Import Excel
              </Button>
              <Button onClick={handleAddNew} size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </>
          }
        />
      )}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search name, code, or HSN..."
          globalShortcut
          className="w-full sm:max-w-xs"
        />
        {hideHeader && (
          <Button onClick={handleAddNew} size="sm" className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        )}
        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(undefined)}
            className="rounded-full shadow-none"
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat._id}
              variant={selectedCategory === cat.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.name)}
              className="rounded-full shadow-none whitespace-nowrap"
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        onRowClick={handleEdit}
        pagination={{
          page,
          limit: data?.pagination?.limit || 20,
          total: data?.pagination?.total || 0,
          totalPages: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyTitle="No items found"
        emptyDescription={search ? "Try adjusting your search or filters." : "Add your first item to get started billing."}
        emptyAction={
          <Button onClick={handleAddNew} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        }
      />

      {/* Modals */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        qualityToEdit={editingQuality}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Deactivate Item"
        description="Are you sure you want to deactivate this item? It will be hidden from new challans but preserved in historical records."
        variant="destructive"
        confirmLabel="Deactivate"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
