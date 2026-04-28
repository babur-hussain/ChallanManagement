import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { FormModal } from '@/components/shared/FormModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from '@/hooks/api/useUnits';
import { createUnitSchema } from '@textilepro/shared';

// For attributes processing strings to array
const processForm = (data: any) => {
  
  return data;
};

export function UnitsManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useUnits({ page, limit: 20, search });
  const createMut = useCreateUnit();
  const updateMut = useUpdateUnit();
  const deleteMut = useDeleteUnit();

  // If attributes, schema expects array. However, react hook form with basic text input provides string.
  // We can bypass Strict zod input to handle parsing, or refine zod
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    // resolver: zodResolver(createUnitSchema)
  });

  const handleEdit = (item: any) => {
    setEditingItem(item);
    const populated = {...item};
    
    reset(populated);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    reset({});
    setIsModalOpen(true);
  };

  const onSubmit = async (formData: any) => {
    const finalData = processForm(formData);
    try {
      if (editingItem) {
        await updateMut.mutateAsync({ id: editingItem._id, data: finalData });
      } else {
        await createMut.mutateAsync(finalData);
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const columns: Column<any>[] = [
      { key: 'name', header: 'Name', cell: (item: any) => <span>{item.name}</span> },
      { key: 'shortCode', header: 'Short Code', cell: (item: any) => <span>{item.shortCode}</span> },
    { key: 'isActive', header: 'Status', cell: (item) => <StatusBadge status={item.isActive ? 'active' : 'inactive'} /> },
    {
      key: 'actions', header: '', align: 'right', width: '100px', cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item._id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-card p-4 rounded-md border">
        <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-[300px]" />
        <Button onClick={handleAddNew}><Plus className="mr-2 h-4 w-4" /> Add Units</Button>
      </div>

      <DataTable 
        data={data?.data || []} 
        columns={columns} 
        keyExtractor={item => item._id} 
        isLoading={isLoading} 
        pagination={{
          page,
          limit: 20,
          total: data?.pagination?.total || 0,
          totalPages: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
        }}
      />

      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Unit' : 'Add Unit'} isLoading={createMut.isPending || updateMut.isPending}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
      <div className="space-y-1.5">
        <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
        <Input id="name" type="text" step={undefined} {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{String(errors.name.message)}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="shortCode">Short Code <span className="text-destructive">*</span></Label>
        <Input id="shortCode" type="text" step={undefined} {...register('shortCode')} />
        {errors.shortCode && <p className="text-xs text-destructive">{String(errors.shortCode.message)}</p>}
      </div>
          <div className="flex justify-end pt-4"><Button type="submit" disabled={createMut.isPending || updateMut.isPending}>Save</Button></div>
        </form>
      </FormModal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if(deleteId) await deleteMut.mutateAsync(deleteId); setDeleteId(null); }} title="Deactivate Item" description="Are you sure?" variant="destructive" confirmLabel="Deactivate" />
    </div>
  );
}
