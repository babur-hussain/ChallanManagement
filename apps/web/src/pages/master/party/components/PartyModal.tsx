import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormModal } from '@/components/shared/FormModal';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { PhoneInput } from '@/components/shared/PhoneInput';
import { GSTINInput } from '@/components/shared/GSTINInput';
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
  useCreateParty,
  useUpdateParty,
} from '@/hooks/api/useParties';
import { createPartyMasterSchema, CreatePartyMasterInput, MAJOR_INDIAN_CITIES, INDIAN_STATES_MAP, generateShortCode } from '@textilepro/shared';

interface PartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyToEdit?: any | null; // using any for speed
}

export function PartyModal({ isOpen, onClose, partyToEdit }: PartyModalProps) {
  const isEditing = !!partyToEdit;
  
  const createMutation = useCreateParty();
  const updateMutation = useUpdateParty();
  
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePartyMasterInput>({
    resolver: zodResolver(createPartyMasterSchema),
    defaultValues: {
      name: '', shortCode: '', partyType: 'BUYER',
      phone: '', whatsapp: '', altPhone: '', email: '',
      address: { line1: '', line2: '', city: 'Surat', state: 'Gujarat', pincode: '' },
      gstin: '', panNumber: '',
      creditLimit: 0, creditDays: 30, openingBalance: 0, balanceType: 'DR',
      transporterName: '', remarks: '', tags: [], isActive: true,
    },
  });

  const [sameAsPhone, setSameAsPhone] = React.useState(true);
  
  const nameValue = watch('name');
  const phoneValue = watch('phone');

  useEffect(() => {
    if (!isEditing && nameValue && nameValue.trim().length > 1) {
      if (!watch('shortCode')) {
        setValue('shortCode', generateShortCode(nameValue, 6), { shouldValidate: true });
      }
    }
  }, [nameValue, isEditing, setValue]);

  useEffect(() => {
    if (sameAsPhone && phoneValue) {
      setValue('whatsapp', phoneValue, { shouldValidate: true });
    }
  }, [phoneValue, sameAsPhone, setValue]);

  useEffect(() => {
    if (isOpen) {
      if (partyToEdit) {
        reset({ ...partyToEdit });
        setSameAsPhone(partyToEdit.phone === partyToEdit.whatsapp);
      } else {
        reset();
        setSameAsPhone(true);
      }
    }
  }, [isOpen, partyToEdit, reset]);

  const onSubmit = async (data: CreatePartyMasterInput) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: partyToEdit._id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (e) {
      // handled
    }
  };

  const handleValidGSTIN = (stateName: string) => {
    setValue('address.state', stateName, { shouldValidate: true });
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Party' : 'Add New Party'}
      description="Create a client profile for billing and accounts."
      isLoading={isLoading}
      className="sm:max-w-[800px]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-4">
        
        {/* Basic Info */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Basic Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5 min-w-0 lg:col-span-2">
              <Label htmlFor="name">Business/Party Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...register('name')} placeholder="e.g. Shree Krishna Textiles" error={!!errors.name} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="shortCode">Short Code</Label>
              <Input id="shortCode" {...register('shortCode')} className="uppercase" placeholder="e.g. SKT" error={!!errors.shortCode} />
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="partyType">Type <span className="text-destructive">*</span></Label>
              <Controller name="partyType" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="partyType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUYER">Buyer (Customer)</SelectItem>
                    <SelectItem value="BROKER">Broker</SelectItem>
                    <SelectItem value="BOTH">Both</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
              <Controller name="phone" control={control} render={({ field }) => (
                <PhoneInput {...field} error={!!errors.phone} />
              )} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <div className="flex items-center gap-1">
                  <Checkbox id="same" checked={sameAsPhone} onCheckedChange={(c) => setSameAsPhone(!!c)} className="h-3 w-3" />
                  <label htmlFor="same" className="text-[10px] text-muted-foreground">Same as phone</label>
                </div>
              </div>
              <Controller name="whatsapp" control={control} render={({ field }) => (
                <PhoneInput {...field} disabled={sameAsPhone} error={!!errors.whatsapp} />
              )} />
            </div>
          </div>
        </div>

        <Separator />

        {/* GST & Address */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Tax & Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="gstin">GSTIN</Label>
              <Controller name="gstin" control={control} render={({ field }) => (
                <GSTINInput {...field} onValidGSTIN={handleValidGSTIN} error={!!errors.gstin} />
              )} />
              {errors.gstin && <p className="text-xs text-destructive">{errors.gstin.message}</p>}
            </div>
            
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input id="panNumber" {...register('panNumber')} className="uppercase" placeholder="ABCDE1234F" error={!!errors.panNumber} />
            </div>
            
            <div className="space-y-1.5 min-w-0 lg:col-span-3">
              <Label htmlFor="address.line1">Address <span className="text-destructive">*</span></Label>
              <Input id="address.line1" {...register('address.line1')} placeholder="Shop No, Building Name, Street" error={!!errors.address?.line1} />
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="address.city">City <span className="text-destructive">*</span></Label>
              {/* simplified to text input for rapid dev, native datalist for autocomplete */}
              <Input id="address.city" list="cities" {...register('address.city')} placeholder="City" error={!!errors.address?.city} />
              <datalist id="cities">
                {MAJOR_INDIAN_CITIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="address.state">State <span className="text-destructive">*</span></Label>
              <Controller name="address.state" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="address.state" className={errors.address?.state ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(INDIAN_STATES_MAP).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="address.pincode">Pincode <span className="text-destructive">*</span></Label>
              <Input id="address.pincode" {...register('address.pincode')} placeholder="395002" error={!!errors.address?.pincode} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Financials */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Financial Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="space-y-1.5 min-w-0 col-span-1 md:col-span-2">
              <Label>Opening Balance</Label>
              <div className="flex gap-2">
                <Controller name="openingBalance" control={control} render={({ field: { value, onChange } }) => (
                  <CurrencyInput className="w-full" value={value} onChange={onChange} />
                )} />
                <Controller name="balanceType" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DR">DR (They owe us)</SelectItem>
                      <SelectItem value="CR">CR (We owe them)</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="creditDays">Credit Days</Label>
              <Input id="creditDays" type="number" {...register('creditDays', { valueAsNumber: true })} />
            </div>
            
            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="creditLimit">Credit Limit</Label>
              <Controller name="creditLimit" control={control} render={({ field: { value, onChange } }) => (
                <CurrencyInput value={value} onChange={onChange} placeholder="0 (No limit)" />
              )} />
            </div>

          </div>
        </div>

        <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-md">
          <Controller name="isActive" control={control} render={({ field: { value, onChange, ref } }) => (
            <Checkbox id="isActive" checked={value} onCheckedChange={onChange} ref={ref} />
          )} />
          <Label htmlFor="isActive" className="cursor-pointer">
            This party is active
          </Label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background/95 backdrop-blur z-10 py-4 -mx-6 px-6 shadow-[0_-10px_10px_-10px_rgba(0,0,0,0.05)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {isEditing ? 'Save Changes' : 'Add Party'}
          </Button>
        </div>
      </form>
    </FormModal>
  );
}
