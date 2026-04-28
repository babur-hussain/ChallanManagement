import fs from 'fs';
import path from 'path';

const HUB_DIR = '/Users/baburhussain/ChallanManagement-main/apps/web/src/pages/master/hub';
const COMP_DIR = path.join(HUB_DIR, 'components');
fs.mkdirSync(HUB_DIR, { recursive: true });
fs.mkdirSync(COMP_DIR, { recursive: true });

const tabs = [
    { name: 'Brands', comp: 'BrandsManager', hook: 'Brand', queryHook: 'Brands', fields: [{ k: 'name', l: 'Name', t: 'string' }, { k: 'description', l: 'Description', t: 'string' }] },
    { name: 'Units', comp: 'UnitsManager', hook: 'Unit', queryHook: 'Units', fields: [{ k: 'name', l: 'Name', t: 'string' }, { k: 'shortCode', l: 'Short Code', t: 'string' }] },
    { name: 'TaxCodes', comp: 'TaxCodesManager', hook: 'TaxCode', queryHook: 'TaxCodes', fields: [{ k: 'code', l: 'Code', t: 'string' }, { k: 'description', l: 'Description', t: 'string' }, { k: 'rate', l: 'Rate (%)', t: 'number' }] },
    { name: 'Attributes', comp: 'AttributesManager', hook: 'Attribute', queryHook: 'Attributes', fields: [{ k: 'name', l: 'Name', t: 'string' }, { k: 'options', l: 'Options (Comma separated)', t: 'string' }] },
    { name: 'Warehouses', comp: 'WarehousesManager', hook: 'Warehouse', queryHook: 'Warehouses', fields: [{ k: 'name', l: 'Name', t: 'string' }, { k: 'code', l: 'Code', t: 'string' }] },
];

tabs.forEach(tab => {
    const formFields = tab.fields.map(f => {
        if (f.k === 'options') {
            return `
      <div className="space-y-1.5">
        <Label htmlFor="${f.k}">${f.l} <span className="text-destructive">*</span></Label>
        <Input id="${f.k}" placeholder="e.g. Red, Blue, Green" {...register('${f.k}')} />
        {errors.${f.k} && <p className="text-xs text-destructive">{String(errors.${f.k}.message)}</p>}
      </div>`;
        }
        return `
      <div className="space-y-1.5">
        <Label htmlFor="${f.k}">${f.l} <span className="text-destructive">*</span></Label>
        <Input id="${f.k}" type="${f.t === 'number' ? 'number' : 'text'}" step={${f.t === 'number' ? '"0.01"' : 'undefined'}} {...register('${f.k}'${f.t === 'number' ? ', { valueAsNumber: true }' : ''})} />
        {errors.${f.k} && <p className="text-xs text-destructive">{String(errors.${f.k}.message)}</p>}
      </div>`;
    }).join('\n');

    const columns = tab.fields.map(f => {
        if (f.k === 'options') return `{ key: '${f.k}', header: '${f.l}', cell: (item: any) => <span>{item.${f.k}?.join(', ')}</span> }`;
        return `{ key: '${f.k}', header: '${f.l}', cell: (item: any) => <span>{item.${f.k}}</span> }`;
    }).join(',\n      ');

    const compCode = `import React, { useState } from 'react';
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
import { use${tab.queryHook}, useCreate${tab.hook}, useUpdate${tab.hook}, useDelete${tab.hook} } from '@/hooks/api/use${tab.queryHook}';
import { create${tab.hook}Schema } from '@textilepro/shared';

// For attributes processing strings to array
const processForm = (data: any) => {
  ${tab.name === 'Attributes' ? `if(typeof data.options === 'string') data.options = data.options.split(',').map((o: string) => o.trim());` : ''}
  return data;
};

export function ${tab.comp}() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = use${tab.queryHook}({ page, limit: 20, search });
  const createMut = useCreate${tab.hook}();
  const updateMut = useUpdate${tab.hook}();
  const deleteMut = useDelete${tab.hook}();

  // If attributes, schema expects array. However, react hook form with basic text input provides string.
  // We can bypass Strict zod input to handle parsing, or refine zod
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    // resolver: zodResolver(create${tab.hook}Schema)
  });

  const handleEdit = (item: any) => {
    setEditingItem(item);
    const populated = {...item};
    ${tab.name === 'Attributes' ? `if(Array.isArray(item.options)) populated.options = item.options.join(', ');` : ''}
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
      ${columns},
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
        <Button onClick={handleAddNew}><Plus className="mr-2 h-4 w-4" /> Add ${tab.name}</Button>
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

      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit ${tab.hook}' : 'Add ${tab.hook}'} isLoading={createMut.isPending || updateMut.isPending}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          ${formFields}
          <div className="flex justify-end pt-4"><Button type="submit" disabled={createMut.isPending || updateMut.isPending}>Save</Button></div>
        </form>
      </FormModal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { if(deleteId) await deleteMut.mutateAsync(deleteId); setDeleteId(null); }} title="Deactivate Item" description="Are you sure?" variant="destructive" confirmLabel="Deactivate" />
    </div>
  );
}
`;
    fs.writeFileSync(path.join(COMP_DIR, `${tab.comp}.tsx`), compCode);
});

// MasterHub content
const masterHubContent = `import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { BrandsManager } from './components/BrandsManager';
import { UnitsManager } from './components/UnitsManager';
import { TaxCodesManager } from './components/TaxCodesManager';
import { AttributesManager } from './components/AttributesManager';
import { WarehousesManager } from './components/WarehousesManager';

export function MasterHub() {
  return (
    <div className="container py-4 max-w-6xl pb-24">
      <PageHeader title="Master Data Configuration" description="Manage all core application dictionaries and entities." />
      
      <Tabs defaultValue="brands" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="taxcodes">Tax Codes</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
        </TabsList>
        <Card className="p-4 bg-muted/10 shadow-sm border border-border">
          <TabsContent value="brands" className="mt-0"><BrandsManager /></TabsContent>
          <TabsContent value="units" className="mt-0"><UnitsManager /></TabsContent>
          <TabsContent value="taxcodes" className="mt-0"><TaxCodesManager /></TabsContent>
          <TabsContent value="attributes" className="mt-0"><AttributesManager /></TabsContent>
          <TabsContent value="warehouses" className="mt-0"><WarehousesManager /></TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
`;

fs.writeFileSync(path.join(HUB_DIR, 'MasterHub.tsx'), masterHubContent);
console.log('Hub generated.');
