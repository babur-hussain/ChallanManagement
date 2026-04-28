import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createChallanSchema, CreateChallanInput, formatCurrency } from '@textilepro/shared';
import { useUpdateChallan, useChallan } from '@/hooks/api/useChallans';
import { useParties, useQuickSearchParties } from '@/hooks/api/useParties';
import { useBrokers } from '@/hooks/api/useBrokers';
import { useItems } from '@/hooks/api/useItems';
import { useSettingsData } from '@/hooks/api/useSettings';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Save, FileText, Send, Trash2, Plus, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DeliveryChallanTemplate } from '@textilepro/shared/templates';
import { ItemModal } from '@/pages/master/item/components/ItemModal';
import { PartyModal } from '@/pages/master/party/components/PartyModal';
import { BrokerModal } from '@/pages/master/broker/components/BrokerModal';

export function ChallanEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateMutation = useUpdateChallan();
  const { data: challanToEdit, isLoading } = useChallan(id!);
  const [showPreview, setShowPreview] = useState(true);
  const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);

  // Data sources for dropdowns
  const { data: partiesData } = useParties({ limit: 100 });
  const { data: brokersData } = useBrokers({ limit: 50 });
  const { data: fabricsData } = useItems({ limit: 200 }, { refetchInterval: 10_000, staleTime: 0 });

  const parties: any[] = (partiesData as any)?.data?.data || (partiesData as any)?.data || [];
  const brokers: any[] = (brokersData as any)?.data?.data || (brokersData as any)?.data || [];
  const fabrics: any[] = (fabricsData as any)?.data?.data || (fabricsData as any)?.data || [];

  // ─── Tenant Settings ───
  const { data: tenantSettings } = useSettingsData();
  const challanCfg = tenantSettings?.challans || {} as any;
  const showRates = challanCfg.showRates ?? true;
  const showAmount = challanCfg.showAmount ?? true;
  const requireVehicle = challanCfg.requireVehicleNo ?? false;
  const requireBroker = challanCfg.requireBroker ?? false;

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors }
  } = useForm<CreateChallanInput>({
    resolver: zodResolver(createChallanSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      partyId: '',
      brokerId: '',
      vehicleNumber: '',
      items: [{ itemId: '', itemName: '', hsnCode: '', rollsText: '', rollNumbers: [], meters: [], totalMeters: 0, ratePerMeter: 0, amount: 0, discount: 0, discountType: 'PERCENTAGE' as const, taxRate: 0, taxAmount: 0 }],
      remarks: challanCfg.defaultRemarks || '',
      internalNotes: '',
      paperSize: 'A4'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  useEffect(() => {
    if (challanToEdit) {
      setValue('date', new Date(challanToEdit.date).toISOString().split('T')[0]);
      setValue('partyId', String(challanToEdit.partyId || ''));
      setValue('brokerId', String(challanToEdit.brokerId || ''));
      setValue('vehicleNumber', challanToEdit.vehicleNumber || '');
      setValue('remarks', challanToEdit.remarks || '');
      setValue('internalNotes', challanToEdit.internalNotes || '');
      setValue('paperSize', challanToEdit.paperSize || 'A4');

      setValue('items', challanToEdit.items.map((i: any) => ({
        itemId: String(i.itemId || ''),
        itemName: i.itemName,
        itemCode: i.itemCode,
        hsnCode: i.hsnCode,
        rollsText: i.meters.join(' '),
        rollNumbers: i.rollNumbers || [],
        meters: i.meters || [],
        totalMeters: i.totalMeters,
        ratePerMeter: i.ratePerMeter,
        amount: i.amount,
        discount: i.discount || 0,
        discountType: i.discountType || 'PERCENTAGE',
        taxRate: i.taxRate || 0,
        taxAmount: i.taxAmount || 0,
      })));
    }
  }, [challanToEdit, setValue]);

  const watchItems = watch('items');
  const watchPartyId = watch('partyId');
  const paperSize = watch('paperSize');

  useEffect(() => {
    if (fields.length > 5 && paperSize === 'A5') {
      setValue('paperSize', 'A4');
      toast.warning("Switched to A4 as items exceed A5 capacity", { duration: 4000 });
    }
  }, [fields.length, paperSize, setValue]);
  const selectedParty = parties.find(p => p._id === watchPartyId);

  // Keyboard Navigation & Speed Entry Logic
  const rowRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleMetersKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submit
    }
  };

  const handleFabricSelect = (val: string, index: number) => {
    const fabric = fabrics.find(f => f._id === val);
    if (fabric) {
      setValue(`items.${index}.itemId`, fabric._id);
      setValue(`items.${index}.itemName`, fabric.name);
      setValue(`items.${index}.itemCode`, fabric.shortCode);
      setValue(`items.${index}.hsnCode`, fabric.hsnCode);
      setValue(`items.${index}.ratePerMeter`, fabric.defaultRate);
      setValue(`items.${index}.unit`, fabric.unit || 'METERS');
    }
  };

  // Convert raw "rollsText" to array of numbers
  const processRollsText = (text: string, index: number) => {
    // If text is "44.5 45.2 46.1", split by spaces or commas
    const meterStrings = text.split(/[\s,]+/).filter(Boolean);
    const meters = meterStrings.map(m => parseFloat(m)).filter(m => !isNaN(m));

    setValue(`items.${index}.meters`, meters, { shouldValidate: true });

    // Compute total & amount
    const totalMeters = meters.reduce((a, b) => a + b, 0);
    setValue(`items.${index}.totalMeters`, totalMeters);

    const rate = watchItems[index].ratePerMeter;
    setValue(`items.${index}.amount`, totalMeters * rate);
  };

  const watchRollsTextValues = watchItems.map(item => item.rollsText);

  useEffect(() => {
    // Whenever rates change, recompute amounts
    watchItems.forEach((item, index) => {
      const amt = item.totalMeters * item.ratePerMeter;
      if (item.amount !== amt) {
        setValue(`items.${index}.amount`, amt);
      }
    });
  }, [watchItems.map(i => i.ratePerMeter).join(','), watchItems.map(i => i.totalMeters).join(',')]);

  const handleCreateAndRenderPDF = async () => {
    const data = getValues();
    const validItems = data.items.filter((i: any) => i.itemId && i.meters && i.meters.length > 0);

    // Clean up empty rows so Zod validation passes
    if (validItems.length !== data.items.length) {
      if (validItems.length === 0) {
        toast.error('Please add at least one valid item with quantity.');
        return;
      }
      setValue('items', validItems);
    }

    // Explicitly validate form
    const isValid = await trigger();
    if (!isValid) {
      toast.error('Please fix validation errors before creating the challan.');
      return;
    }

    const finalData = getValues();
    try {
      await updateMutation.mutateAsync({ id: id!, data: finalData as CreateChallanInput });
      navigate(`/app/challans/${id}`);
    } catch (e) {
      // toast handled in hook
    }
  };
  const handleSaveDraft = async () => {
    const data = watch();
    if (!data.partyId) {
      toast.error('Please select a party before saving as draft.');
      return;
    }

    // Filter out completely empty rows so backend validation doesn't fail
    const validItems = data.items.filter((i: any) => i.itemId && i.meters && i.meters.length > 0);

    if (validItems.length === 0) {
      toast.error('Please add at least one valid item with quantity before saving.');
      return;
    }

    try {
      const payload = { ...data, items: validItems };
      await updateMutation.mutateAsync({ id: id!, data: payload as CreateChallanInput });
      navigate(`/app/challans`); // Redirect back to list
    } catch (e) {
      // toast handled in hook
    }
  };

  // Aggregates
  const totalChallanEntries = watchItems.reduce((sum, item) => sum + (item.meters?.length || 0), 0);
  const totalChallanQty = watchItems.reduce((sum, item) => sum + (item.totalMeters || 0), 0);
  const totalChallanAmount = watchItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="container py-4 max-w-6xl pb-24">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/challans')} className="mb-2 text-muted-foreground hover:text-foreground -ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <PageHeader
        title={`Edit Challan ${challanToEdit?.challanNumber || ''}`}
        description="Update your delivery challan records."
        actions={
          <div className="text-right">
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Challan Number</div>
            <div className="text-2xl font-bold font-mono tracking-tight text-primary">
              {challanToEdit?.challanNumber || 'CHN-XXXX-XXXXX'}
            </div>
          </div>
        }
      />

      <form id="challan-form" onSubmit={(e) => e.preventDefault()} className="space-y-6">

        {/* Section 1: Header Info */}
        <Card className="border-t-4 border-t-primary">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="partyId">Select Party <span className="text-destructive">*</span></Label>
              <Controller
                name="partyId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      if (val === '__NEW__') {
                        setIsPartyModalOpen(true);
                        return;
                      }
                      field.onChange(val);
                    }}
                  >
                    <SelectTrigger className={errors.partyId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Search or select party..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__NEW__" className="text-primary font-medium focus:bg-primary/10">
                        <div className="flex items-center"><Plus className="w-3 h-3 mr-2 font-bold" /> Add New Party</div>
                      </SelectItem>
                      {parties.map(p => (
                        <SelectItem key={p._id} value={p._id}>{p.name} ({p.shortCode})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.partyId && <p className="text-xs text-destructive">{errors.partyId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brokerId">Broker {requireBroker && <span className="text-destructive">*</span>}</Label>
              <Controller
                name="brokerId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(val) => {
                      if (val === '__NEW__') {
                        setIsBrokerModalOpen(true);
                        return;
                      }
                      field.onChange(val === "none" ? "" : val);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__NEW__" className="text-primary font-medium focus:bg-primary/10">
                        <div className="flex items-center"><Plus className="w-3 h-3 mr-2 font-bold" /> Add New Broker</div>
                      </SelectItem>
                      <SelectItem value="none">None</SelectItem>
                      {brokers.map(b => (
                        <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paperSize">Format Size</Label>
              <Controller
                name="paperSize"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4 (Standard)</SelectItem>
                      <SelectItem value="A5">A5 (Half Size)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {selectedParty && (
              <div className="md:col-span-4 bg-muted/30 p-3 rounded-md text-sm flex gap-6">
                <div>
                  <span className="text-muted-foreground mr-2">City:</span>
                  <span className="font-medium">{selectedParty.address.city}</span>
                </div>
                <div>
                  <span className="text-muted-foreground mr-2">Outstanding:</span>
                  <span className={`font-medium ${selectedParty.outstandingBalance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(selectedParty.outstandingBalance))} {selectedParty.outstandingBalance > 0 ? 'DR' : 'CR'}
                  </span>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Section 2: Items Table */}
        <Card>
          <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
            <h3 className="font-semibold text-lg">Items</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              <strong>Tip:</strong> Enter quantities separated by spaces (e.g. <code>42.5 44 43.8</code>). Press <strong>Shift+Enter</strong> to add a new row.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground sticky top-0">
                <tr>
                  <th className="font-medium p-3 w-[250px] whitespace-nowrap">Item / Product *</th>
                  <th className="font-medium p-3">Quantity Details (space-separated) *</th>
                  <th className="font-medium p-3 w-[80px] text-right">Total Qty</th>
                  {showRates && <th className="font-medium p-3 w-[100px] text-right">Rate *</th>}
                  {showAmount && <th className="font-medium p-3 w-[120px] text-right">Amount</th>}
                  <th className="font-medium p-3 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {fields.map((field, index) => {
                  const error = errors.items?.[index];

                  return (
                    <tr
                      key={field.id}
                      className="hover:bg-muted/10 transition-colors"
                      onKeyDownCapture={(e) => {
                        if (e.key === 'Enter' && e.shiftKey) {
                          e.preventDefault();
                          e.stopPropagation();
                          append({ itemId: '', itemName: '', hsnCode: '', rollsText: '', rollNumbers: [], meters: [], totalMeters: 0, ratePerMeter: 0, amount: 0, discount: 0, discountType: 'PERCENTAGE', taxRate: 0, taxAmount: 0 } as any);
                          setTimeout(() => {
                            const el = document.getElementById(`item-select-${fields.length}`);
                            if (el) {
                              el.focus();
                              el.click();
                            }
                          }, 50);
                        }
                      }}
                    >
                      <td className="p-2 align-top">
                        <Controller
                          name={`items.${index}.itemId`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={(val) => {
                                if (val === '__NEW__') {
                                  setIsFabricModalOpen(true);
                                  return;
                                }
                                field.onChange(val);
                                handleFabricSelect(val, index);
                              }}
                            >
                              <SelectTrigger id={`item-select-${index}`} className={`h-9 ${error?.itemId ? 'border-destructive' : ''}`}>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__NEW__" className="text-primary font-medium focus:bg-primary/10">
                                  <div className="flex items-center"><Plus className="w-3 h-3 mr-2 font-bold" /> Add New Item</div>
                                </SelectItem>
                                {fabrics.map(f => (
                                  <SelectItem key={f._id} value={f._id}>{f.name} ({f.shortCode})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {error?.itemId && <div className="text-[10px] text-destructive mt-1">{error.itemId.message}</div>}
                      </td>

                      <td className="p-2 align-top">
                        <Input
                          {...register(`items.${index}.rollsText` as any)}
                          placeholder="e.g. 45 44.5 46 or single qty"
                          className={`h-9 font-mono text-xs ${error?.meters ? 'border-destructive' : ''}`}
                          onKeyDown={(e) => handleMetersKeyDown(e, index)}
                          onBlur={(e) => processRollsText(e.target.value, index)}
                          onChange={(e) => {
                            // Instant process so totals update live
                            processRollsText(e.target.value, index);
                          }}
                          autoComplete="off"
                        />
                        <div className="mt-1 flex gap-1 flex-wrap">
                          {watchItems[index]?.meters?.map((m: number, idx: number) => (
                            <span key={idx} className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded">
                              {m}
                            </span>
                          ))}
                        </div>
                        {error?.meters && <div className="text-[10px] text-destructive mt-1">{error.meters.message}</div>}
                      </td>

                      <td className="p-2 align-top text-right pt-4 font-semibold text-primary">
                        {(watchItems[index]?.totalMeters || 0).toFixed(2)}
                      </td>

                      {showRates && (
                        <td className="p-2 align-top">
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.ratePerMeter`, { valueAsNumber: true })}
                            className={`h-9 text-right ${error?.ratePerMeter ? 'border-destructive' : ''}`}
                          />
                          {error?.ratePerMeter && <div className="text-[10px] text-destructive mt-1">{error.ratePerMeter.message}</div>}
                        </td>
                      )}

                      {showAmount && (
                        <td className="p-2 align-top text-right pt-4 font-bold">
                          {formatCurrency(watchItems[index]?.amount || 0)}
                        </td>
                      )}

                      <td className="p-2 align-top text-center pt-2">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t bg-card flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full max-w-sm border-dashed"
              onClick={() => append({ itemId: '', itemName: '', hsnCode: '', rollsText: '', rollNumbers: [], meters: [], totalMeters: 0, ratePerMeter: 0, amount: 0, discount: 0, discountType: 'PERCENTAGE' as const, taxRate: 0, taxAmount: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item (Shift+Enter)
            </Button>
          </div>
        </Card>

        {/* Section 3: Summary & Submit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Remarks (Prints on PDF)</Label>
              <Input {...register('remarks')} placeholder="Terms, notes, special instructions..." />
            </div>
            <div className="space-y-1.5">
              <Label>Internal Notes</Label>
              <Input {...register('internalNotes')} placeholder="Private note..." />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle Number {requireVehicle && <span className="text-destructive">*</span>}</Label>
              <Input {...register('vehicleNumber')} placeholder="GJ-05-XXXX" className="uppercase" />
              {requireVehicle && !watch('vehicleNumber') && <p className="text-[10px] text-amber-500">Vehicle number is required by your settings.</p>}
            </div>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 border-b border-primary/10 pb-2">Challan Summary</h3>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-semibold">{fields.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Entries</span>
                  <span className="font-semibold">{totalChallanEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Quantity</span>
                  <span className="font-semibold">{totalChallanQty.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                <span className="text-xl font-bold">Grand Total</span>
                <span className="text-3xl font-black text-primary tracking-tight">
                  {showAmount ? formatCurrency(totalChallanAmount) : '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="sticky bottom-4 p-5 mt-8 bg-card border border-border shadow-[0_0_30px_rgba(0,0,0,0.15)] dark:shadow-[0_0_30px_rgba(0,0,0,0.4)] rounded-xl flex justify-end gap-3 z-40">
          <Button type="button" variant="outline" onClick={() => navigate('/app/challans')}>Cancel</Button>

          <Button
            type="button"
            variant="secondary"
            className="hidden sm:flex"
            disabled={updateMutation.isPending}
            onClick={handleSaveDraft}
          >
            <Save className="mr-2 h-4 w-4" /> Update Draft
          </Button>

          <Button
            type="button"
            className="bg-primary shadow-lg shadow-primary/30"
            disabled={updateMutation.isPending}
            onClick={handleCreateAndRenderPDF}
          >
            {updateMutation.isPending ? 'Updating PDF...' : (
              <><FileText className="mr-2 h-4 w-4" /> Update & Render PDF</>
            )}
          </Button>
        </div>
      </form>

      {/* ═══════ LIVE PREVIEW SECTION ═══════ */}
      <div className="mt-8 mb-24">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-lg font-bold">Live Preview</h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium animate-pulse">LIVE</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </div>

        {showPreview && (
          <div className="border rounded-lg shadow-lg overflow-hidden bg-muted/10">
            <div className="bg-muted/30 border-b px-4 py-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">This is how your challan will look when printed or saved as PDF.</p>
            </div>
            <div className="p-4 md:p-8 bg-zinc-200/60 dark:bg-zinc-800/60 flex justify-center overflow-x-auto">
              <DeliveryChallanTemplate
                challan={{
                  challanNumber: challanToEdit?.challanNumber || 'CHN-XXXX-XXXXX',
                  date: watch('date'),
                  paperSize: watch('paperSize'),
                  partySnapshot: selectedParty ? {
                    name: selectedParty.name,
                    shortCode: selectedParty.shortCode || '',
                    phone: selectedParty.phone || '',
                    gstin: selectedParty.gstin || '',
                    address: selectedParty.address || {},
                  } : { name: '—', address: {} },
                  brokerSnapshot: watch('brokerId') ? {
                    name: brokers.find((b: any) => b._id === watch('brokerId'))?.name || '',
                  } : undefined,
                  vehicleNumber: watch('vehicleNumber'),
                  remarks: watch('remarks'),
                  items: watchItems.filter((i: any) => i.itemName).map((item: any) => ({
                    itemName: item.itemName || '',
                    itemCode: item.itemCode || '',
                    hsnCode: item.hsnCode || '',
                    totalMeters: item.totalMeters || 0,
                    ratePerMeter: item.ratePerMeter || 0,
                    meters: item.meters || [],
                    unit: item.unit || 'METERS',
                    taxRate: item.taxRate || 0,
                    discount: item.discount || 0,
                    discountType: item.discountType || 'PERCENTAGE',
                  })),
                  totalRolls: totalChallanEntries,
                  totalMeters: totalChallanQty,
                }}
                businessProfile={tenantSettings?.profile}
                challanSettings={challanCfg}
              />
            </div>
          </div>
        )}
      </div>

      <ItemModal
        isOpen={isFabricModalOpen}
        onClose={() => setIsFabricModalOpen(false)}
      />
      <PartyModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
      />
      <BrokerModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
      />
    </div>
  );
}
