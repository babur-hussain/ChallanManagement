import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLeadSchema, LeadType, LeadSource, PipelineStage, LeadTemperature, CreateLeadInput } from '@textilepro/shared';
import { useCreateLead, useUpdateLead } from '@/hooks/api/useLeads';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead?: any | null; // using any for now since we are sharing types
}

export function LeadModal({ isOpen, onClose, lead }: LeadModalProps) {
    const isEdit = !!lead;
    const createLead = useCreateLead();
    const updateLead = useUpdateLead();

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CreateLeadInput>({
        resolver: zodResolver(createLeadSchema),
        defaultValues: {
            companyName: '',
            contactPerson: '',
            phone: '',
            whatsapp: '',
            city: '',
            state: '',
            leadType: LeadType.BUYER,
            source: LeadSource.DIRECT,
            pipelineStage: PipelineStage.NEW,
            temperature: LeadTemperature.WARM,
        }
    });

    useEffect(() => {
        if (isOpen && lead) {
            reset({
                companyName: lead.companyName,
                contactPerson: lead.contactPerson || '',
                phone: lead.phone || '',
                whatsapp: lead.whatsapp || '',
                city: lead.city || '',
                state: lead.state || '',
                leadType: lead.leadType,
                source: lead.source,
                pipelineStage: lead.pipelineStage,
                temperature: lead.temperature,
                gstin: lead.gstin || '',
                monthlyRequirementMeters: lead.monthlyRequirementMeters,
                notes: lead.notes || '',
            });
        } else if (isOpen) {
            reset();
        }
    }, [isOpen, lead, reset]);

    const onSubmit = (data: CreateLeadInput) => {
        if (isEdit) {
            updateLead.mutate({ id: lead._id, data }, {
                onSuccess: () => onClose()
            });
        } else {
            createLead.mutate(data, {
                onSuccess: () => onClose()
            });
        }
    };

    const isLoading = createLead.isPending || updateLead.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
                </DialogHeader>

                <form id="lead-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input id="companyName" {...register('companyName')} placeholder="Company or Shop Name" />
                            {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactPerson">Contact Person</Label>
                            <Input id="contactPerson" {...register('contactPerson')} placeholder="Name of owner/manager" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input id="phone" {...register('phone')} placeholder="+91..." />
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp Number</Label>
                            <Input id="whatsapp" {...register('whatsapp')} placeholder="Optional" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input id="city" {...register('city')} />
                            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" {...register('state')} />
                        </div>

                        <div className="space-y-2">
                            <Label>Lead Type</Label>
                            <Select value={watch('leadType')} onValueChange={(val) => setValue('leadType', val as LeadType)}>
                                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BUYER">Buyer</SelectItem>
                                    <SelectItem value="SUPPLIER">Supplier</SelectItem>
                                    <SelectItem value="BROKER">Broker</SelectItem>
                                    <SelectItem value="JOB_WORKER">Job Worker</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Source</Label>
                            <Select value={watch('source')} onValueChange={(val) => setValue('source', val as LeadSource)}>
                                <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DIRECT">Direct</SelectItem>
                                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                                    <SelectItem value="REFERENCE">Reference</SelectItem>
                                    <SelectItem value="WEBSITE">Website</SelectItem>
                                    <SelectItem value="MARKET_VISIT">Market Visit</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Initial Pipeline Stage</Label>
                            <Select value={watch('pipelineStage')} onValueChange={(val) => setValue('pipelineStage', val as PipelineStage)}>
                                <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NEW">New</SelectItem>
                                    <SelectItem value="CONTACTED">Contacted</SelectItem>
                                    <SelectItem value="FOLLOWUP">Follow Up</SelectItem>
                                    <SelectItem value="SAMPLE_SENT">Sample Sent</SelectItem>
                                    <SelectItem value="RATE_SHARED">Rate Shared</SelectItem>
                                    <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Temperature</Label>
                            <Select value={watch('temperature')} onValueChange={(val) => setValue('temperature', val as LeadTemperature)}>
                                <SelectTrigger><SelectValue placeholder="Select temp" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COLD">Cold</SelectItem>
                                    <SelectItem value="WARM">Warm</SelectItem>
                                    <SelectItem value="HOT">Hot</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gstin">GSTIN (Optional)</Label>
                            <Input id="gstin" {...register('gstin')} placeholder="24..." />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="monthlyRequirementMeters">Monthly Req (Meters)</Label>
                            <Input id="monthlyRequirementMeters" type="number" {...register('monthlyRequirementMeters', { valueAsNumber: true })} />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="notes">Initial Notes</Label>
                            <Textarea id="notes" {...register('notes')} placeholder="Any initial observations or requests..." />
                        </div>
                    </div>
                </form>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button type="submit" form="lead-form" disabled={isLoading}>
                        {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Lead'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
