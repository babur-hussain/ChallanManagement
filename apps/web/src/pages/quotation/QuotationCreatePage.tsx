import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Plus, Trash2, Save, Send, Mail, ArrowLeft, ArrowRight,
    AlertTriangle, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import { useCreateQuotation, useRateIntelligence } from '@/hooks/api/useQuotations';
import { useItems } from '@/hooks/api/useItems';
import { useParties } from '@/hooks/api/useParties';
import { toast } from 'sonner';

interface QuotationItem {
    itemId: string;
    itemName: string;
    itemCode: string;
    hsnCode: string;
    quantityMeters: number;
    minimumOrderQty: number;
    ratePerMeter: number;
    discountType: 'NONE' | 'PERCENT' | 'FIXED';
    discountValue: number;
    finalRate: number;
    lineAmount: number;
}

export function QuotationCreatePage() {
    const navigate = useNavigate();
    const createMutation = useCreateQuotation();
    const { data: partiesData } = useParties({ limit: 200 });
    const { data: fabricsData } = useItems({ limit: 200 });

    const parties = (partiesData as any)?.data || [];
    const fabrics = (fabricsData as any)?.data || [];

    const [step, setStep] = useState(1);

    // Step 1: Customer
    const [partyId, setPartyId] = useState('');
    const [customerSnapshot, setCustomerSnapshot] = useState({
        companyName: '',
        contactPerson: '',
        phone: '',
        whatsapp: '',
        city: '',
        state: '',
        gstin: '',
    });

    // Step 2: Items
    const [items, setItems] = useState<QuotationItem[]>([]);
    const [selectedFabricId, setSelectedFabricId] = useState('');

    // Step 3: Terms
    const [freightTerms, setFreightTerms] = useState('');
    const [packingTerms, setPackingTerms] = useState('');
    const [gstMode, setGstMode] = useState<'EXTRA' | 'INCLUDED'>('EXTRA');
    const [paymentTerms, setPaymentTerms] = useState('');
    const [dispatchTime, setDispatchTime] = useState('');
    const [remarks, setRemarks] = useState('');
    const [validDays, setValidDays] = useState(7);

    // Select party
    const handlePartySelect = (id: string) => {
        setPartyId(id);
        const party = parties.find((p: any) => p._id === id);
        if (party) {
            setCustomerSnapshot({
                companyName: party.name,
                contactPerson: '',
                phone: party.phone,
                whatsapp: party.phone,
                city: party.address?.city || '',
                state: party.address?.state || '',
                gstin: party.gstin || '',
            });
        }
    };

    // Add fabric item
    const addItem = () => {
        if (!selectedFabricId) return;
        const fabric = fabrics.find((f: any) => f._id === selectedFabricId);
        if (!fabric) return;
        if (items.some((i) => i.itemId === selectedFabricId)) {
            toast.error('This quality is already added');
            return;
        }

        setItems([
            ...items,
            {
                itemId: fabric._id,
                itemName: fabric.name,
                itemCode: fabric.shortCode || fabric.code || '',
                hsnCode: fabric.hsnCode || '',
                quantityMeters: 100,
                minimumOrderQty: 0,
                ratePerMeter: fabric.defaultPrice || 0,
                discountType: 'NONE',
                discountValue: 0,
                finalRate: fabric.defaultPrice || 0,
                lineAmount: 100 * (fabric.defaultPrice || 0),
            },
        ]);
        setSelectedFabricId('');
    };

    // Update item
    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index] };
        (item as any)[field] = value;

        // Recalculate
        if (['ratePerMeter', 'discountType', 'discountValue', 'quantityMeters'].includes(field)) {
            let finalRate = item.ratePerMeter;
            if (item.discountType === 'PERCENT') {
                finalRate = item.ratePerMeter * (1 - item.discountValue / 100);
            } else if (item.discountType === 'FIXED') {
                finalRate = item.ratePerMeter - item.discountValue;
            }
            item.finalRate = Math.max(0, Math.round(finalRate * 100) / 100);
            item.lineAmount = Math.round(item.finalRate * item.quantityMeters * 100) / 100;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    // Totals
    const totals = useMemo(() => {
        const subtotal = items.reduce((s, i) => s + i.lineAmount, 0);
        const totalDiscount = items.reduce((s, i) => s + (i.ratePerMeter - i.finalRate) * i.quantityMeters, 0);
        const taxableAmount = subtotal;
        const estimatedGst = gstMode === 'EXTRA' ? taxableAmount * 0.05 : 0;
        const grandTotal = subtotal + estimatedGst;
        return { subtotal, totalDiscount, taxableAmount, estimatedGst, grandTotal };
    }, [items, gstMode]);

    // Submit
    const handleSubmit = async (submitStatus: 'DRAFT' | 'SENT') => {
        if (!customerSnapshot.companyName) {
            toast.error('Select a party or enter customer name');
            return;
        }
        if (items.length === 0) {
            toast.error('Add at least one item');
            return;
        }

        const payload = {
            date: new Date().toISOString(),
            validTillDate: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString(),
            partyId: partyId || undefined,
            customerSnapshot,
            items,
            freightTerms,
            packingTerms,
            gstMode,
            paymentTerms,
            dispatchTime,
            remarks,
            ...totals,
            status: submitStatus,
        };

        try {
            await createMutation.mutateAsync(payload as any);
            navigate('/app/quotations');
        } catch (err) {
            // Error handled by hook
        }
    };

    return (
        <div className="container py-4 max-w-5xl animate-in fade-in-50">
            <PageHeader
                title="Create Quotation"
                description="Build a winning quotation in seconds."
                actions={
                    <Button variant="outline" size="sm" onClick={() => navigate('/app/quotations')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                }
            />

            {/* Step Indicator */}
            <div className="flex items-center gap-0 mb-8">
                {[
                    { num: 1, label: 'Customer' },
                    { num: 2, label: 'Items & Rates' },
                    { num: 3, label: 'Terms & Send' },
                ].map((s, i) => (
                    <React.Fragment key={s.num}>
                        <button
                            onClick={() => setStep(s.num)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${step === s.num
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : step > s.num
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s.num ? 'bg-white/20' : step > s.num ? 'bg-emerald-500/20' : 'bg-muted-foreground/20'
                                }`}>
                                {step > s.num ? '✓' : s.num}
                            </div>
                            {s.label}
                        </button>
                        {i < 2 && <div className="flex-1 h-px bg-border mx-2" />}
                    </React.Fragment>
                ))}
            </div>

            {/* ─── Step 1: Customer ──────────────────────────────── */}
            {step === 1 && (
                <div className="bg-card border rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        Select Party / Customer
                    </h3>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Existing Party</label>
                        <select
                            value={partyId}
                            onChange={(e) => handlePartySelect(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2.5 bg-background text-foreground text-sm"
                        >
                            <option value="">-- Select Party --</option>
                            {parties.map((p: any) => (
                                <option key={p._id} value={p._id}>{p.name} — {p.address?.city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-3">Or enter customer details manually:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Company Name *</label>
                                <Input value={customerSnapshot.companyName}
                                    onChange={(e) => setCustomerSnapshot({ ...customerSnapshot, companyName: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Contact Person</label>
                                <Input value={customerSnapshot.contactPerson}
                                    onChange={(e) => setCustomerSnapshot({ ...customerSnapshot, contactPerson: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                                <Input value={customerSnapshot.phone}
                                    onChange={(e) => setCustomerSnapshot({ ...customerSnapshot, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">WhatsApp</label>
                                <Input value={customerSnapshot.whatsapp}
                                    onChange={(e) => setCustomerSnapshot({ ...customerSnapshot, whatsapp: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">City</label>
                                <Input value={customerSnapshot.city}
                                    onChange={(e) => setCustomerSnapshot({ ...customerSnapshot, city: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">GSTIN</label>
                                <Input value={customerSnapshot.gstin}
                                    onChange={(e) => setCustomerSnapshot({ ...customerSnapshot, gstin: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={() => setStep(2)} disabled={!customerSnapshot.companyName}>
                            Next: Add Items <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* ─── Step 2: Items ─────────────────────────────────── */}
            {step === 2 && (
                <div className="space-y-4">
                    <div className="bg-card border rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Add Fabric Qualities</h3>

                        <div className="flex gap-3 mb-6">
                            <select
                                value={selectedFabricId}
                                onChange={(e) => setSelectedFabricId(e.target.value)}
                                className="flex-1 border rounded-lg px-3 py-2.5 bg-background text-foreground text-sm"
                            >
                                <option value="">-- Select Fabric Quality --</option>
                                {fabrics.map((f: any) => (
                                    <option key={f._id} value={f._id}>
                                        {f.name} ({f.shortCode || f.code}) — ₹{f.defaultPrice || 0}/m
                                    </option>
                                ))}
                            </select>
                            <Button onClick={addItem} disabled={!selectedFabricId}>
                                <Plus className="mr-1 h-4 w-4" /> Add
                            </Button>
                        </div>

                        {items.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="text-lg font-medium">No items added yet</p>
                                <p className="text-sm mt-1">Select a fabric quality above to start building your quotation.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, idx) => (
                                    <div key={idx} className="border rounded-xl p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-semibold text-foreground">{item.itemName}</p>
                                                <p className="text-xs text-muted-foreground">Code: {item.itemCode} | HSN: {item.hsnCode}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeItem(idx)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                            <div>
                                                <label className="text-[10px] uppercase text-muted-foreground font-medium">Qty (meters)</label>
                                                <Input
                                                    type="number"
                                                    value={item.quantityMeters}
                                                    onChange={(e) => updateItem(idx, 'quantityMeters', Number(e.target.value))}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-muted-foreground font-medium">Rate ₹/m</label>
                                                <Input
                                                    type="number"
                                                    value={item.ratePerMeter}
                                                    onChange={(e) => updateItem(idx, 'ratePerMeter', Number(e.target.value))}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-muted-foreground font-medium">Discount</label>
                                                <div className="flex gap-1 mt-1">
                                                    <select
                                                        value={item.discountType}
                                                        onChange={(e) => updateItem(idx, 'discountType', e.target.value)}
                                                        className="w-20 border rounded px-1 py-2 text-xs bg-background"
                                                    >
                                                        <option value="NONE">None</option>
                                                        <option value="PERCENT">%</option>
                                                        <option value="FIXED">₹</option>
                                                    </select>
                                                    {item.discountType !== 'NONE' && (
                                                        <Input
                                                            type="number"
                                                            value={item.discountValue}
                                                            onChange={(e) => updateItem(idx, 'discountValue', Number(e.target.value))}
                                                            className="flex-1"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-muted-foreground font-medium">Final Rate</label>
                                                <div className="mt-1 px-3 py-2 bg-emerald-500/10 text-emerald-700 font-bold rounded-lg text-sm">
                                                    ₹{item.finalRate.toFixed(2)}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-muted-foreground font-medium">Amount</label>
                                                <div className="mt-1 px-3 py-2 bg-primary/10 text-primary font-bold rounded-lg text-sm">
                                                    ₹{item.lineAmount.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Totals Card */}
                    {items.length > 0 && (
                        <div className="bg-card border rounded-xl p-6">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Subtotal</p>
                                    <p className="text-xl font-bold">₹{totals.subtotal.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Discount</p>
                                    <p className="text-xl font-bold text-orange-500">₹{totals.totalDiscount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Taxable</p>
                                    <p className="text-xl font-bold">₹{totals.taxableAmount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">GST (5%)</p>
                                    <p className="text-xl font-bold">₹{totals.estimatedGst.toFixed(2)}</p>
                                </div>
                                <div className="bg-primary/5 rounded-lg p-2">
                                    <p className="text-xs text-muted-foreground uppercase">Grand Total</p>
                                    <p className="text-2xl font-extrabold text-primary">₹{totals.grandTotal.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep(1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={() => setStep(3)} disabled={items.length === 0}>
                            Next: Terms <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* ─── Step 3: Terms & Submit ────────────────────────── */}
            {step === 3 && (
                <div className="bg-card border rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-semibold">Terms & Conditions</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">GST Mode</label>
                            <select
                                value={gstMode}
                                onChange={(e) => setGstMode(e.target.value as any)}
                                className="w-full border rounded-lg px-3 py-2.5 bg-background text-sm mt-1"
                            >
                                <option value="EXTRA">GST Extra</option>
                                <option value="INCLUDED">GST Included</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Valid for (days)</label>
                            <Input type="number" value={validDays} onChange={(e) => setValidDays(Number(e.target.value))} className="mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Payment Terms</label>
                            <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}
                                placeholder="e.g., 30 days credit" className="mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Dispatch Time</label>
                            <Input value={dispatchTime} onChange={(e) => setDispatchTime(e.target.value)}
                                placeholder="e.g., 7-10 working days" className="mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Freight Terms</label>
                            <Input value={freightTerms} onChange={(e) => setFreightTerms(e.target.value)}
                                placeholder="e.g., Ex-Factory / Door Delivery" className="mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">Packing Terms</label>
                            <Input value={packingTerms} onChange={(e) => setPackingTerms(e.target.value)}
                                placeholder="e.g., Standard Bale" className="mt-1" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Remarks</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2 bg-background text-sm mt-1 resize-none"
                            placeholder="Any additional notes..."
                        />
                    </div>

                    {/* Summary */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-muted-foreground text-sm">Customer:</span>
                            <span className="font-medium">{customerSnapshot.companyName}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-muted-foreground text-sm">Items:</span>
                            <span className="font-medium">{items.length} qualities</span>
                        </div>
                        <div className="flex items-center justify-between text-lg">
                            <span className="font-medium">Grand Total:</span>
                            <span className="font-extrabold text-primary">₹{totals.grandTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setStep(2)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => handleSubmit('DRAFT')}
                                disabled={createMutation.isPending}
                            >
                                <Save className="mr-2 h-4 w-4" /> Save Draft
                            </Button>
                            <Button
                                onClick={() => handleSubmit('SENT')}
                                disabled={createMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Send className="mr-2 h-4 w-4" /> Save & Send WhatsApp
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
