import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormModal } from '@/components/shared/FormModal';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { useCategories, useCreateCategory } from '@/hooks/api/useCategories';
import {
  useCreateItem,
  useUpdateItem,
} from '@/hooks/api/useItems';
import { createItemSchema, CreateItemInput, generateShortCode, TEXTILE_HSN_CODES } from '@textilepro/shared';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  qualityToEdit?: any | null; // using any for speed, it's IItem
}

export function ItemModal({ isOpen, onClose, qualityToEdit }: ItemModalProps) {
  const isEditing = !!qualityToEdit;

  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();

  const { data: categoriesData } = useCategories({ isActive: true, limit: 100 });
  const categories = categoriesData?.data || [];

  const createCategoryMutation = useCreateCategory();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSaveNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const sanitized = newCategoryName.trim();
      const newCategory = await createCategoryMutation.mutateAsync({ name: sanitized, isActive: true });
      setValue('category', newCategory.name, { shouldValidate: true });
      setIsAddingCategory(false);
      setNewCategoryName('');
    } catch (e) {
      console.error(e);
    }
  };

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: '',
      shortCode: '',
      hsnCode: '',
      category: 'OTHER',
      defaultRate: 0,
      gstRate: 5,
      unit: 'METERS',
      composition: '',
      width: undefined,
      description: '',
      isActive: true,
      lowStockThreshold: undefined,
      sortOrder: 0,
    },
  });

  const nameValue = watch('name');
  const hsnCodeValue = watch('hsnCode');

  // Auto-generate short code when creating
  useEffect(() => {
    if (!isEditing && nameValue && nameValue.trim().length > 1) {
      if (!watch('shortCode')) { // only auto-suggest if user hasn't explicitly typed one
        setValue('shortCode', generateShortCode(nameValue, 6), { shouldValidate: true });
      }
    }
  }, [nameValue, isEditing, setValue]);

  useEffect(() => {
    if (isOpen) {
      if (qualityToEdit) {
        reset({
          name: qualityToEdit.name,
          shortCode: qualityToEdit.shortCode,
          hsnCode: qualityToEdit.hsnCode,
          category: qualityToEdit.category,
          defaultRate: qualityToEdit.defaultRate,
          gstRate: qualityToEdit.gstRate ?? 5,
          unit: qualityToEdit.unit,
          composition: qualityToEdit.composition || '',
          width: qualityToEdit.width,
          description: qualityToEdit.description || '',
          isActive: qualityToEdit.isActive,
          lowStockThreshold: qualityToEdit.lowStockThreshold,
          sortOrder: qualityToEdit.sortOrder,
        });
      } else {
        reset({
          name: '', shortCode: '', hsnCode: '', category: 'OTHER',
          defaultRate: 0, gstRate: 5, unit: 'METERS', composition: '',
          description: '', isActive: true, lowStockThreshold: undefined, sortOrder: 0,
        });
      }
    }
  }, [isOpen, qualityToEdit, reset]);

  const onSubmit = async (data: CreateItemInput) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: qualityToEdit._id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (e) {
      // errors handled by mutation hook via toast
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const hsnDescription = hsnCodeValue ? TEXTILE_HSN_CODES[hsnCodeValue] : null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Item' : 'Add New Item'}
      description="Define a new item that you sell or purchase."
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="name">Item Name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g. TinTin Georgette or Mens T-Shirt"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="shortCode">Short Code</Label>
            <Input
              id="shortCode"
              {...register('shortCode')}
              className={`uppercase ${errors.shortCode ? 'border-destructive' : ''}`}
              placeholder="e.g. TTG"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">Auto-generated. Keep short.</p>
            {errors.shortCode && <p className="text-xs text-destructive -mt-1">{errors.shortCode.message}</p>}
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
            {isAddingCategory ? (
              <div className="flex gap-2">
                <Input
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="Custom category name"
                  autoFocus
                  className="h-10"
                />
                <Button
                  type="button"
                  className="h-10 shrink-0"
                  onClick={handleSaveNewCategory}
                  disabled={!newCategoryName || createCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 shrink-0"
                  onClick={() => setIsAddingCategory(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (val === '__NEW__') {
                        setIsAddingCategory(true);
                      } else {
                        field.onChange(val);
                      }
                    }}
                  >
                    <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__NEW__" className="text-primary font-medium focus:bg-primary/10">
                        <div className="flex items-center"><Plus className="w-3 h-3 mr-2 font-bold" /> Add Custom Category</div>
                      </SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat._id} value={cat.name}>
                          {cat.name} {cat.description ? `(${cat.description})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.category && !isAddingCategory && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="hsnCode">HSN Code <span className="text-destructive">*</span></Label>
            <Input
              id="hsnCode"
              {...register('hsnCode')}
              placeholder="e.g. 500710"
              className={errors.hsnCode ? 'border-destructive' : ''}
            />
            {hsnDescription ? (
              <p className="text-[10px] text-green-600 truncate">{hsnDescription}</p>
            ) : (
              <p className="text-[10px] text-muted-foreground">Standard 6-digit text code</p>
            )}
            {errors.hsnCode && <p className="text-xs text-destructive">{errors.hsnCode.message}</p>}
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="defaultRate">Default Rate <span className="text-destructive">*</span></Label>
            <Controller
              name="defaultRate"
              control={control}
              render={({ field: { value, onChange } }) => (
                <CurrencyInput
                  id="defaultRate"
                  value={value}
                  onChange={onChange}
                  error={!!errors.defaultRate}
                  placeholder="0.00"
                />
              )}
            />
            {errors.defaultRate && <p className="text-xs text-destructive">{errors.defaultRate.message}</p>}
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="gstRate">GST Rate (%) <span className="text-destructive">*</span></Label>
            <Controller
              name="gstRate"
              control={control}
              render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))}>
                  <SelectTrigger id="gstRate" className={errors.gstRate ? 'border-destructive' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                    <SelectItem value="28">28%</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gstRate && <p className="text-xs text-destructive">{errors.gstRate.message}</p>}
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="unit">Unit</Label>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="unit" className={errors.unit ? 'border-destructive' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="METERS">Meters</SelectItem>
                    <SelectItem value="KILOGRAMS">Kilograms (Kg)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="width">Width (Inches)</Label>
            <Input
              id="width"
              type="number"
              {...register('width', { valueAsNumber: true })}
              placeholder="e.g. 44"
              className={errors.width ? 'border-destructive' : ''}
            />
            {errors.width && <p className="text-xs text-destructive">{errors.width.message}</p>}
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="lowStockThreshold">Low Stock Alert (Optional)</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              {...register('lowStockThreshold', { valueAsNumber: true, setValueAs: v => (v === "" || isNaN(v)) ? undefined : v })}
              placeholder="Tenant Default"
              className={errors.lowStockThreshold ? 'border-destructive' : ''}
            />
            {errors.lowStockThreshold && <p className="text-xs text-destructive">{errors.lowStockThreshold.message}</p>}
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="composition">Composition</Label>
            <Input
              id="composition"
              {...register('composition')}
              placeholder="e.g. 100% Polyester"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Internal Notes</Label>
          <Input
            id="description"
            {...register('description')}
            placeholder="Optional remarks"
          />
        </div>

        <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-md">
          <Controller
            name="isActive"
            control={control}
            render={({ field: { value, onChange, ref } }) => (
              <Checkbox
                id="isActive"
                checked={value}
                onCheckedChange={onChange}
                ref={ref}
              />
            )}
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            This item is active and available for billing
          </Label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </FormModal>
  );
}
