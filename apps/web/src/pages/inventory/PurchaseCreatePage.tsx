import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPurchaseSchema, CreatePurchaseInput, formatCurrency } from '@textilepro/shared';
import { useItems } from '@/hooks/api/useItems';
import { useRecordPurchase } from '@/hooks/api/useInventory';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function PurchaseCreatePage() {
  const navigate = useNavigate();
  const { data: fabricsData } = useItems({ limit: 200 });
  const fabrics = fabricsData?.data || [];
  
  const mutation = useRecordPurchase();

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreatePurchaseInput>({
    resolver: zodResolver(createPurchaseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      supplierName: '',
      items: [{ itemId: '', meters: 0, rollCount: 0, ratePerMeter: 0, amount: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchItems = watch('items');

  const onFabricSelected = (val: string, index: number) => {
    const f = fabrics.find(fx => fx._id === val);
    if (f) {
      setValue(`items.${index}.itemId`, f._id);
      setValue(`items.${index}.itemName`, f.name);
      setValue(`items.${index}.ratePerMeter`, f.defaultRate);
    }
  };

  const calculateAmount = (index: number) => {
    const m = watchItems[index].meters || 0;
    const r = watchItems[index].ratePerMeter || 0;
    setValue(`items.${index}.amount`, m * r, { shouldValidate: true });
  };

  const onSubmit = async (data: CreatePurchaseInput) => {
    await mutation.mutateAsync(data);
    navigate('/app/inventory');
  };

  const totalAmount = watchItems.reduce((acc, val) => acc + (val.amount || 0), 0);
  const totalMeters = watchItems.reduce((acc, val) => acc + (val.meters || 0), 0);

  return (
    <div className="container py-4 max-w-5xl animate-in fade-in-50 pb-24">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/inventory')} className="mb-2 text-muted-foreground hover:text-foreground -ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <PageHeader
        title="Record Purchase (Inward Stock)"
        description="Log new fabric arriving from suppliers to boost warehouse inventory."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Supplier Name *</Label>
              <Input {...register('supplierName')} placeholder="Select or type..." />
              {errors.supplierName && <p className="text-xs text-destructive">{errors.supplierName.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...register('date')} />
            </div>

            <div className="space-y-2">
              <Label>Bill / Reference No</Label>
              <Input {...register('billNumber')} placeholder="Supplier bill #" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <div className="p-4 bg-muted/30 border-b">
             <h3 className="font-semibold text-lg">Inward Items</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-3 w-1/3">Fabric Quality *</th>
                <th className="p-3">Rolls</th>
                <th className="p-3">Total Meters *</th>
                <th className="p-3">Rate/Mtr *</th>
                <th className="p-3 text-right">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {fields.map((field, idx) => (
                <tr key={field.id}>
                  <td className="p-3">
                    <Controller
                      name={`items.${idx}.itemId`}
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={(val) => { field.onChange(val); onFabricSelected(val, idx); }}>
                          <SelectTrigger className={errors.items?.[idx]?.itemId ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select quality..." />
                          </SelectTrigger>
                          <SelectContent>
                             {fabrics.map(f => (<SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </td>
                  <td className="p-3"><Input type="number" {...register(`items.${idx}.rollCount`, { valueAsNumber: true })} /></td>
                  <td className="p-3">
                    <Input type="number" step="0.01" {...register(`items.${idx}.meters`, { valueAsNumber: true })} onBlur={() => calculateAmount(idx)} />
                  </td>
                  <td className="p-3">
                     <Input type="number" step="0.01" {...register(`items.${idx}.ratePerMeter`, { valueAsNumber: true })} onBlur={() => calculateAmount(idx)} />
                  </td>
                  <td className="p-3 text-right font-medium text-primary">
                    {formatCurrency(watchItems[idx]?.amount || 0)}
                  </td>
                  <td className="p-3 text-center">
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="text-muted-foreground" onClick={() => remove(idx)}>
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 border-t bg-card text-center">
             <Button type="button" variant="outline" size="sm" onClick={() => append({ itemId: '', meters: 0, rollCount: 0, ratePerMeter: 0, amount: 0 })}>
               <Plus className="mr-2 h-4 w-4"/> Add Item
             </Button>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <div className="w-[300px] border rounded-lg p-4 bg-muted/10 shadow-sm">
            <div className="flex justify-between text-muted-foreground mb-1">
              <span>Total Meters</span>
              <span>{totalMeters.toFixed(2)} m</span>
            </div>
             <div className="flex justify-between items-end border-t pt-2 mt-2">
              <span className="font-semibold text-lg">Subtotal</span>
              <span className="text-2xl font-black text-primary">{formatCurrency(totalAmount)}</span>
            </div>
            
            <Button className="w-full mt-6" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Syncing Stock...' : <><Save className="mr-2 h-4 w-4" /> Save Purchase Record</>}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
