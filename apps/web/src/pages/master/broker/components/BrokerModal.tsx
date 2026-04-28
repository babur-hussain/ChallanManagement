import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormModal } from '@/components/shared/FormModal';
import { PhoneInput } from '@/components/shared/PhoneInput';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  useCreateBroker,
  useUpdateBroker,
} from '@/hooks/api/useBrokers';
import { useQuickSearchParties } from '@/hooks/api/useParties';
import { createBrokerSchema, CreateBrokerInput } from '@textilepro/shared';
// Combobox for Party selection (using standard select for now for simplicity, but in real app use search-autocomplete)

interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokerToEdit?: any | null; 
}

export function BrokerModal({ isOpen, onClose, brokerToEdit }: BrokerModalProps) {
  const isEditing = !!brokerToEdit;
  
  const createMutation = useCreateBroker();
  const updateMutation = useUpdateBroker();
  
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateBrokerInput>({
    resolver: zodResolver(createBrokerSchema),
    defaultValues: {
      name: '', phone: '', partyId: '',
      commissionType: 'PERCENTAGE', commissionRate: 0, paymentCycle: 'MONTHLY',
      bankDetails: { accountName: '', accountNumber: '', ifsc: '', bankName: '' },
      remarks: '', isActive: true,
    },
  });

  const commissionType = watch('commissionType');

  useEffect(() => {
    if (isOpen) {
      if (brokerToEdit) {
        reset({ ...brokerToEdit });
      } else {
        reset({
          name: '', phone: '', partyId: '',
          commissionType: 'PERCENTAGE', commissionRate: 0, paymentCycle: 'MONTHLY',
          bankDetails: { accountName: '', accountNumber: '', ifsc: '', bankName: '' },
          remarks: '', isActive: true,
        });
      }
    }
  }, [isOpen, brokerToEdit, reset]);

  const onSubmit = async (data: CreateBrokerInput) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: brokerToEdit._id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (e) {
      // handled
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Broker' : 'Add New Broker'}
      description="Register a Dalal (Broker) to track commissions."
      isLoading={isLoading}
      className="sm:max-w-[700px]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="name">Broker Name <span className="text-destructive">*</span></Label>
            <Input id="name" {...register('name')} placeholder="e.g. Ramesh Bhai Dalal" error={!!errors.name} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
            <Controller name="phone" control={control} render={({ field }) => (
              <PhoneInput {...field} error={!!errors.phone} />
            )} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="paymentCycle">Payment Cycle <span className="text-destructive">*</span></Label>
            <Controller name="paymentCycle" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="paymentCycle"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="ON_DEMAND">On Demand</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-1.5 min-w-0 md:col-span-2">
            <Label>Commission Structure <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Controller name="commissionRate" control={control} render={({ field: { value, onChange } }) => (
                <CurrencyInput className="flex-1" value={value} onChange={onChange} error={!!errors.commissionRate} />
              )} />
              <Controller name="commissionType" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">% per Invoice</SelectItem>
                    <SelectItem value="FIXED_PER_METER">₹ per Meter</SelectItem>
                    <SelectItem value="FIXED_PER_CHALLAN">₹ per Challan</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Bank Details (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="bankDetails.accountName">Account Name</Label>
              <Input id="bankDetails.accountName" {...register('bankDetails.accountName')} />
            </div>
            
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="bankDetails.accountNumber">Account Number</Label>
              <Input id="bankDetails.accountNumber" {...register('bankDetails.accountNumber')} />
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="bankDetails.ifsc">IFSC Code</Label>
              <Input id="bankDetails.ifsc" {...register('bankDetails.ifsc')} className="uppercase" placeholder="SBIN0001234" error={!!errors.bankDetails?.ifsc} />
              {errors.bankDetails?.ifsc && <p className="text-xs text-destructive">{errors.bankDetails.ifsc.message}</p>}
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="bankDetails.bankName">Bank Name</Label>
              <Input id="bankDetails.bankName" {...register('bankDetails.bankName')} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isEditing ? 'Save Changes' : 'Add Broker'}
          </Button>
        </div>
      </form>
    </FormModal>
  );
}
