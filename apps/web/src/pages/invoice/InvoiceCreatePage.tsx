import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInvoiceSchema, CreateInvoiceInput, IChallan, formatCurrency, formatDate } from '@textilepro/shared';
import { useCreateInvoice } from '@/hooks/api/useInvoices';
import { useParties } from '@/hooks/api/useParties';
import { useSettingsData } from '@/hooks/api/useSettings';
import { apiGet } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X, Percent, IndianRupee, Settings, ChevronDown, CheckCircle, Package } from 'lucide-react';
import { PartyModal } from '@/pages/master/party/components/PartyModal';
import { ItemModal } from '@/pages/master/item/components/ItemModal';
import { useItems } from '@/hooks/api/useItems';
import { InvoiceTemplate } from './InvoiceTemplate';
import { Eye, EyeOff } from 'lucide-react';

export function InvoiceCreatePage() {
  const navigate = useNavigate();
  const [partyId, setPartyId] = useState<string>('');
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [showUnbilledDrawer, setShowUnbilledDrawer] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [savingMode, setSavingMode] = useState<'draft' | 'send' | null>(null);

  const { data: fabricsData } = useItems({ limit: 200 });
  const fabrics: any[] = (fabricsData as any)?.data?.data || (fabricsData as any)?.data || [];

  const { data: partiesData } = useParties({ limit: 100 });
  const parties: any[] = (partiesData as any)?.data?.data || (partiesData as any)?.data || [];
  const selectedParty = parties.find(p => p._id === partyId);

  const { data: tenantSettings } = useSettingsData();
  const profile = tenantSettings?.profile || {};

  // Determine supply type
  const isSameState = selectedParty && (profile as any)?.address?.state
    ? ((selectedParty as any).address?.state || '').toLowerCase() === ((profile as any).address.state || '').toLowerCase()
    : true;

  // Fetch unbilled challans for selected party
  const { data: unbilledChallans, isLoading: challansLoading } = useQuery({
    queryKey: ['challans', 'unbilled', partyId],
    queryFn: async () => {
      const response = await apiGet<any>(`/challans?partyId=${partyId}&limit=100`);
      return (response.data || []).filter((c: IChallan) => c.status === 'DELIVERED' || c.status === 'SENT');
    },
    enabled: !!partyId
  });

  const { control, handleSubmit, setValue, watch, register, formState: { errors } } = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      partyId: '',
      challanIds: [],
      items: [{ itemName: '', itemCode: '', hsnCode: '', quantity: 1, unit: 'MTR', ratePerUnit: 0, discount: 0, discountType: 'PERCENTAGE', gstRate: 5 }],
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      orderNumber: '',
      shippingCharges: 0,
      adjustment: 0,
      notes: 'Thanks for your business.',
      termsAndConditions: '',
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const watchItems = watch('items') || [];
  const watchChallanIds = watch('challanIds') || [];
  const wShipping = Number(watch('shippingCharges')) || 0;
  const wAdjustment = Number(watch('adjustment')) || 0;

  // Recalculate Live Totals
  const calculateTotals = () => {
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalQuantity = 0;

    watchItems.forEach(item => {
      const qty = Number(item.quantity) || 0;
      totalQuantity += qty;
      const rawAmt = qty * (Number(item.ratePerUnit) || 0);
      let taxAmt = rawAmt;
      if (item.discount > 0) {
        taxAmt = item.discountType === 'PERCENTAGE'
          ? rawAmt - (rawAmt * Number(item.discount) / 100)
          : rawAmt - Number(item.discount);
      }

      const gstRate = Number(item.gstRate || 5);
      if (isSameState) {
        totalCgst += (taxAmt * (gstRate / 2)) / 100;
        totalSgst += (taxAmt * (gstRate / 2)) / 100;
      } else {
        totalIgst += (taxAmt * gstRate) / 100;
      }
      subtotal += taxAmt;
    });

    const totalGst = totalCgst + totalSgst + totalIgst;
    const grandTotalRaw = subtotal + totalGst + wShipping + wAdjustment;
    const finalAmount = Math.round(grandTotalRaw);
    const roundOff = finalAmount - grandTotalRaw;

    return { subtotal, totalCgst, totalSgst, totalIgst, totalGst, roundOff, finalAmount, totalQuantity };
  };

  const totals = calculateTotals();
  const createMutation = useCreateInvoice();

  const handleItemSelect = (val: string, index: number) => {
    const item = fabrics.find(f => f._id === val);
    if (item) {
      setValue(`items.${index}.itemId`, item._id);
      setValue(`items.${index}.itemName`, item.name);
      setValue(`items.${index}.itemCode`, item.shortCode);
      setValue(`items.${index}.hsnCode`, item.hsnCode || '');
      setValue(`items.${index}.ratePerUnit`, item.defaultRate || 0);
      setValue(`items.${index}.gstRate`, item.gstRate ?? 5);
      setValue(`items.${index}.unit`, item.unit || 'MTR');
    }
  };

  const handleAddChallanItems = (challan: IChallan) => {
    if (!watchChallanIds.includes(challan._id)) {
      setValue('challanIds', [...watchChallanIds, challan._id]);
      if (fields.length === 1 && !fields[0].itemName && !fields[0].quantity) {
        remove(0);
      }
      const newItems = challan.items.map((item: any) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        itemCode: item.itemCode,
        hsnCode: item.hsnCode || '',
        quantity: item.totalMeters || item.quantity,
        unit: 'MTR',
        ratePerUnit: item.ratePerMeter || item.rate,
        discount: item.discount || 0,
        discountType: item.discountType || 'PERCENTAGE',
        gstRate: item.taxRate || item.gstRate || 5
      }));
      append(newItems as any);
    }
  };

  const onSubmit = async (data: CreateInvoiceInput) => {
    const isDraft = savingMode === 'draft';
    const res = await createMutation.mutateAsync({ ...data, isDraft });
    if (isDraft) {
      navigate('/app/invoices');
    } else {
      navigate(`/app/invoices/${res._id}`);
    }
    setSavingMode(null);
  };

  const handleSaveDraft = () => {
    setSavingMode('draft');
    handleSubmit(onSubmit)();
  };

  const handleSaveAndSend = () => {
    setSavingMode('send');
    handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pb-32">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container py-3 max-w-[1400px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/app/invoices')} className="text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold flex items-center gap-3">
              <span className="bg-muted p-1 rounded-sm"><Settings className="w-5 h-5 text-muted-foreground" /></span>
              New Invoice
            </h1>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-[1200px] animate-in fade-in-50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

          {/* TOP FORM GRID */}
          <div className="max-w-4xl space-y-6">
            <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
              <Label className="text-sm font-medium text-destructive">Customer Name*</Label>
              <div>
                <Select value={partyId} onValueChange={(val) => {
                  if (val === '__NEW__') { setIsPartyModalOpen(true); return; }
                  setPartyId(val);
                  setValue('partyId', val);
                  setValue('challanIds', []);
                }}>
                  <SelectTrigger className="w-full max-w-sm bg-white">
                    <SelectValue placeholder="Select or add a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__NEW__" className="text-primary font-medium focus:bg-primary/10">
                      <div className="flex items-center"><Plus className="w-3 h-3 mr-2" /> Add New Party</div>
                    </SelectItem>
                    {parties.map(p => (
                      <SelectItem key={p._id} value={p._id}>{p.name} {p.shortCode ? `(${p.shortCode})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.partyId && <p className="text-xs text-destructive mt-1">{errors.partyId.message}</p>}

                {selectedParty && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold">{selectedParty.name}</span><br />
                    {selectedParty.address?.city}, {selectedParty.address?.state}<br />
                    <span className="text-xs px-1.5 py-0.5 mt-1 bg-muted rounded font-medium inline-block">
                      {isSameState ? 'Intra-State (CGST+SGST)' : 'Inter-State (IGST)'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
              <Label className="text-sm font-medium text-destructive">Invoice#*</Label>
              <div className="flex items-center gap-2 max-w-sm">
                <Input value="Auto-Generated" disabled className="bg-muted/30 font-medium text-foreground w-1/2" />
                <Settings className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
              <Label className="text-sm font-medium">Order Number</Label>
              <Input {...register('orderNumber')} className="max-w-sm bg-white" />
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-4 flex-wrap">
              <Label className="text-sm font-medium text-destructive pt-2">Invoice Date*</Label>
              <div className="flex items-center flex-wrap gap-4">
                <Controller
                  name="invoiceDate"
                  control={control}
                  render={({ field }) => <Input type="date" className="w-[200px] bg-white" {...field} value={String(field.value)} />}
                />

                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium ml-2">Terms</Label>
                  <Select defaultValue="due_receipt">
                    <SelectTrigger className="w-[160px] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="due_receipt">Due on Receipt</SelectItem>
                      <SelectItem value="net15">Net 15</SelectItem>
                      <SelectItem value="net30">Net 30</SelectItem>
                      <SelectItem value="net60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium ml-2 text-destructive">Due Date*</Label>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => <Input type="date" className="w-[200px] bg-white" {...field} value={String(field.value)} />}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="py-2"><h3 className="font-semibold border-b pb-2">Item Table</h3></div>

          {/* TABLE SECTION */}
          <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f8f9fc] border-b text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  <tr>
                    <th className="p-3 w-10 text-center"></th>
                    <th className="p-3 min-w-[240px]">ITEM DETAILS</th>
                    <th className="p-3 w-24 text-center">HSN/SAC</th>
                    <th className="p-3 w-32 text-right">QUANTITY</th>
                    <th className="p-3 w-32 text-right">RATE</th>
                    <th className="p-3 w-40">DISCOUNT</th>
                    <th className="p-3 w-32">TAX</th>
                    <th className="p-3 w-36 text-right">AMOUNT</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fields.map((field, index) => {
                    const qty = Number(watchItems[index]?.quantity) || 0;
                    const rate = Number(watchItems[index]?.ratePerUnit) || 0;
                    const discount = Number(watchItems[index]?.discount) || 0;
                    const dType = watchItems[index]?.discountType || 'PERCENTAGE';
                    let amt = qty * rate;
                    if (discount > 0) amt = dType === 'PERCENTAGE' ? amt - (amt * discount / 100) : amt - discount;

                    return (
                      <tr
                        key={field.id}
                        className="group hover:bg-muted/10 align-top"
                        onKeyDownCapture={(e) => {
                          if (e.key === 'Enter' && e.shiftKey) {
                            e.preventDefault();
                            e.stopPropagation();

                            // Prevent Radix select from modifying the current row
                            append({ itemName: '', itemCode: '', hsnCode: '', quantity: 1, unit: 'MTR', ratePerUnit: 0, discount: 0, discountType: 'PERCENTAGE', gstRate: 5 } as any);

                            // Focus and open the newly created Select box
                            setTimeout(() => {
                              const el = document.getElementById(`item-select-${fields.length}`);
                              if (el) {
                                el.focus();
                                // Simulate click to pop up the dropdown automatically
                                el.click();
                              }
                            }, 50);
                          }
                        }}
                      >
                        <td className="p-3 pt-5 text-center text-muted-foreground"><div className="cursor-move">⋮⋮</div></td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            <Controller
                              name={`items.${index}.itemId`}
                              control={control}
                              render={({ field }) => (
                                <Select
                                  value={field.value || watchItems[index]?.itemName || ''}
                                  onValueChange={(val) => {
                                    if (val === '__NEW__') {
                                      setIsItemModalOpen(true);
                                      return;
                                    }
                                    field.onChange(val);
                                    handleItemSelect(val, index);
                                  }}
                                >
                                  <SelectTrigger id={`item-select-${index}`} className="border-transparent focus-visible:border-primary focus-visible:bg-white shadow-none bg-transparent h-8 font-medium w-full">
                                    <SelectValue placeholder="Select or type item" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__NEW__" className="text-primary font-medium focus:bg-primary/10">
                                      <div className="flex items-center"><Plus className="w-3 h-3 mr-2 font-bold" /> Add New Item</div>
                                    </SelectItem>
                                    {watchItems[index]?.itemName && !fabrics.find((f: any) => f._id === field.value) && (
                                      <SelectItem value={watchItems[index].itemName}>{watchItems[index].itemName}</SelectItem>
                                    )}
                                    {fabrics.map((f: any) => (
                                      <SelectItem key={f._id} value={f._id}>{f.name} ({f.shortCode})</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.items?.[index]?.itemName && <p className="text-[10px] text-destructive px-3">{errors.items[index]?.itemName?.message}</p>}
                          </div>
                        </td>
                        <td className="p-3 pt-4">
                          <Input
                            placeholder="HSN"
                            title="HSN Code"
                            className="border-transparent focus-visible:border-primary focus-visible:bg-white shadow-none bg-transparent h-8 text-xs text-center w-full px-1"
                            {...register(`items.${index}.hsnCode` as const)}
                          />
                        </td>
                        <td className="p-3 pt-4">
                          <Input
                            type="number" step="any"
                            className="border-transparent focus-visible:border-primary focus-visible:bg-white shadow-none bg-transparent h-8 text-right w-full"
                            {...register(`items.${index}.quantity` as const)}
                          />
                        </td>
                        <td className="p-3 pt-4">
                          <Input
                            type="number" step="any"
                            className="border-transparent focus-visible:border-primary focus-visible:bg-white shadow-none bg-transparent h-8 text-right w-full"
                            {...register(`items.${index}.ratePerUnit` as const)}
                          />
                        </td>
                        <td className="p-3 pt-4">
                          <div className="flex items-center border rounded overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary bg-white">
                            <Input
                              type="number" step="any"
                              className="border-0 shadow-none h-8 px-2 text-right w-full focus-visible:ring-0"
                              {...register(`items.${index}.discount` as const)}
                            />
                            <Select
                              value={watchItems[index]?.discountType || 'PERCENTAGE'}
                              onValueChange={(val) => setValue(`items.${index}.discountType` as const, val as any)}
                            >
                              <SelectTrigger className="border-0 border-l border-border shadow-none h-8 w-14 px-1.5 focus:ring-0 bg-muted/20 text-muted-foreground rounded-none">
                                {watchItems[index]?.discountType === 'PERCENTAGE' ? <Percent className="w-3 h-3 mx-auto" /> : <IndianRupee className="w-3 h-3 mx-auto" />}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PERCENTAGE">%</SelectItem>
                                <SelectItem value="AMOUNT">₹</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="p-3 pt-4">
                          <Controller
                            name={`items.${index}.gstRate`}
                            control={control}
                            render={({ field }) => (
                              <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                <SelectTrigger className="h-8 shadow-none focus:ring-primary w-full bg-white text-muted-foreground">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Select a Tax</SelectItem>
                                  <SelectItem value="5">GST 5%</SelectItem>
                                  <SelectItem value="12">GST 12%</SelectItem>
                                  <SelectItem value="18">GST 18%</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </td>
                        <td className="p-3 pt-5 text-right font-semibold text-foreground">
                          {formatCurrency(amt)}
                        </td>
                        <td className="p-3 pt-4 text-center">
                          <Button
                            type="button" variant="ghost" size="icon"
                            className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100"
                            onClick={() => remove(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {errors.items?.root && <p className="text-sm text-destructive p-3 bg-destructive/5">{errors.items.root.message}</p>}
            </div>

            {/* ROW ACTIONS */}
            <div className="p-4 border-t border-border flex flex-col gap-4 bg-[#f8f9fc]/50">
              <div className="flex items-center gap-3">
                <Button
                  type="button" variant="ghost" size="sm"
                  className="text-blue-600 font-medium hover:bg-blue-50"
                  onClick={() => append({ itemName: '', itemCode: '', hsnCode: '', quantity: 1, unit: 'MTR', ratePerUnit: 0, discount: 0, discountType: 'PERCENTAGE', gstRate: 5 })}
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add New Row <ChevronDown className="w-3 h-3 ml-1" />
                </Button>

                {partyId && (
                  <Button
                    type="button" variant="outline" size="sm"
                    className="font-medium bg-white text-muted-foreground border-border"
                    onClick={() => setShowUnbilledDrawer(!showUnbilledDrawer)}
                  >
                    <Plus className="w-4 h-4 mr-1.5 text-blue-600" /> Add Items in Bulk
                  </Button>
                )}
              </div>

              {partyId && (
                <div className="bg-[#fff9f2] border border-[#f5e3d3] rounded w-full max-w-[280px] p-4 text-sm relative">
                  <h4 className="font-semibold text-foreground mb-1">Include Unbilled Items</h4>
                  <p className="text-blue-600 hover:underline cursor-pointer flex items-center" onClick={() => setShowUnbilledDrawer(!showUnbilledDrawer)}>
                    {unbilledChallans?.length || 0} unbilled bills
                  </p>

                  {/* UNBILLED PANEL (POPOVER) */}
                  {showUnbilledDrawer && unbilledChallans && unbilledChallans.length > 0 && (
                    <div className="absolute top-16 left-0 bg-white border shadow-xl rounded-lg w-[320px] max-h-[300px] overflow-y-auto z-50">
                      <div className="p-3 border-b bg-muted/30 font-semibold text-sm flex justify-between items-center">
                        Select Bills
                        <X className="w-4 h-4 cursor-pointer text-muted-foreground" onClick={() => setShowUnbilledDrawer(false)} />
                      </div>
                      <div className="p-2 space-y-1">
                        {unbilledChallans.map((challan: IChallan) => {
                          const isAdded = watchChallanIds.includes(challan._id);
                          return (
                            <div key={challan._id} className={`flex items-center justify-between text-sm p-2 rounded ${isAdded ? 'bg-blue-50' : 'hover:bg-muted/50 cursor-pointer'}`}>
                              <div>
                                <span className="font-medium block">{challan.challanNumber}</span>
                                <span className="text-xs text-muted-foreground block">{formatDate(challan.date)}</span>
                              </div>
                              <Button
                                type="button" variant={isAdded ? "secondary" : "outline"} size="sm" className="h-6 px-3 text-xs"
                                onClick={() => isAdded ? null : handleAddChallanItems(challan)} disabled={isAdded}
                              >
                                {isAdded ? 'Added' : 'Add'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM SECTION */}
          <div className="flex flex-col lg:flex-row justify-between gap-12 pt-4">
            {/* Left: Notes */}
            <div className="w-full max-w-sm space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Customer Notes</Label>
                <Textarea {...register('notes')} placeholder="Thanks for your business." rows={4} className="bg-white resize-none shadow-sm" />
                <p className="text-xs text-muted-foreground mt-1.5">Will be displayed on the invoice</p>
              </div>
            </div>

            {/* Right: Totals Panel */}
            <div className="w-full max-w-md bg-transparent border-t lg:border-none pt-6 lg:pt-0">
              <div className="space-y-4 text-sm bg-muted/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-muted-foreground">Sub Total</span>
                  <span className="font-bold text-foreground text-base pr-2">{totals.subtotal.toFixed(3)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    Shipping Charges
                  </span>
                  <div className="flex items-center gap-1">
                    <Input type="number" step="0.01" className="h-8 w-32 bg-white text-right" {...register('shippingCharges')} />
                  </div>
                </div>

                {isSameState ? (
                  <>
                    <div className="flex justify-between items-center text-muted-foreground pl-4 border-l-2 border-l-border">
                      <span>CGST</span>
                      <span className="pr-2">{totals.totalCgst.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground pl-4 border-l-2 border-l-border">
                      <span>SGST</span>
                      <span className="pr-2">{totals.totalSgst.toFixed(3)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center text-muted-foreground pl-4 border-l-2 border-l-border">
                    <span>IGST</span>
                    <span className="pr-2">{totals.totalIgst.toFixed(3)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    Adjustment
                  </span>
                  <div className="flex items-center gap-1">
                    <Input type="number" step="0.01" className="h-8 w-32 bg-white text-right" {...register('adjustment')} />
                  </div>
                </div>

                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Round Off</span>
                  <span className="pr-2">{totals.roundOff.toFixed(3)}</span>
                </div>

                <div className="border-t border-border/50 pt-4 flex justify-between items-end mt-2">
                  <span className="text-lg font-bold">Total ( ₹ )</span>
                  <span className="text-2xl font-black text-foreground">
                    {totals.finalAmount.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ACTION BAR */}
          <div className="sticky bottom-4 z-40 bg-white border border-border mt-8 p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.15)] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" className="font-semibold bg-[#f8f9fc]" disabled={createMutation.isPending} onClick={handleSaveDraft}>
                {savingMode === 'draft' && createMutation.isPending ? 'Saving Draft...' : 'Save as Draft'}
              </Button>
              <Button type="button" disabled={createMutation.isPending || fields.length === 0} className="font-semibold bg-[#0c9c5e] hover:bg-[#0c9c5e]/90 text-white min-w-[140px] shadow-lg shadow-[#0c9c5e]/20" onClick={handleSaveAndSend}>
                {savingMode === 'send' && createMutation.isPending ? 'Saving...' : 'Save and Send'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/app/invoices')} className="font-medium text-muted-foreground hover:text-foreground">
                Cancel
              </Button>
            </div>

            <div className="hidden md:flex flex-col text-right text-sm">
              <span className="font-bold">Total Amount: <span className="font-black text-lg text-primary tracking-tight pr-2">₹ {totals.finalAmount.toFixed(2)}</span></span>
              <span className="text-muted-foreground text-xs font-medium pr-2">Total Quantity: {totals.totalQuantity.toFixed(2)}</span>
            </div>
          </div>

        </form>
      </div>

      {/* ═══════ LIVE PREVIEW SECTION ═══════ */}
      <div className="mt-8 mb-24 max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-lg font-bold">Live Preview</h2>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium animate-pulse">LIVE</span>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </div>

        {showPreview && (
          <div className="border rounded-lg shadow-lg overflow-hidden bg-muted/10">
            <div className="bg-muted/30 border-b px-4 py-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">This is how your invoice will look when printed or saved as PDF.</p>
            </div>
            <div className="p-4 md:p-8 bg-zinc-200/60 dark:bg-zinc-800/60 flex justify-center overflow-x-auto">
              <InvoiceTemplate
                invoice={{
                  invoiceNumber: 'INV-XXXX-XXXXX',
                  invoiceDate: watch('invoiceDate') || new Date().toISOString().split('T')[0],
                  dueDate: watch('dueDate'),
                  paperSize: 'A4',
                  shippingCharges: watch('shippingCharges') || 0,
                  adjustment: watch('adjustment') || 0,
                  roundOff: totals.roundOff,
                  notes: watch('notes'),
                  termsAndConditions: watch('termsAndConditions'),
                  partySnapshot: selectedParty ? {
                    name: selectedParty.name,
                    shortCode: selectedParty.shortCode || '',
                    phone: selectedParty.phone || '',
                    gstin: selectedParty.gstin || '',
                    address: selectedParty.address || {},
                  } : { name: '—', address: {} },
                  items: watchItems.filter((i: any) => i.itemName).map((item: any) => ({
                    itemName: item.itemName || '',
                    itemCode: item.itemCode || '',
                    hsnCode: item.hsnCode || '',
                    totalMeters: item.quantity || 0,
                    ratePerUnit: item.ratePerUnit || item.rate || 0,
                    meters: item.meters || [],
                    unit: item.unit || 'MTR',
                    gstRate: item.gstRate || 0,
                    discount: item.discount || 0,
                    discountType: item.discountType || 'PERCENTAGE',
                  })),
                  totalRolls: fields.length,
                  totalMeters: totals.totalQuantity,
                }}
                businessProfile={tenantSettings?.profile}
                invoiceSettings={tenantSettings?.invoices || {}}
              />
            </div>
          </div>
        )}
      </div>

      <PartyModal isOpen={isPartyModalOpen} onClose={() => setIsPartyModalOpen(false)} />
      <ItemModal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} />
    </div>
  );
}
