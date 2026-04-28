import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft, Send, CheckCircle, XCircle, ArrowRightLeft,
    Copy, MessageSquare, Clock, Eye, FileText, Pencil,
    TrendingUp, TrendingDown, Minus, AlertTriangle,
} from 'lucide-react';
import {
    useQuotation,
    useSendQuotationWhatsapp,
    useAcceptQuotation,
    useRejectQuotation,
    useConvertToChallan,
    useDuplicateQuotation,
    useAddNegotiationNote,
} from '@/hooks/api/useQuotations';
import { formatCurrency, formatDate } from '@textilepro/shared';

const timelineConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    created: { icon: <FileText className="h-4 w-4" />, color: 'bg-gray-400' },
    sent: { icon: <Send className="h-4 w-4" />, color: 'bg-blue-500' },
    viewed: { icon: <Eye className="h-4 w-4" />, color: 'bg-amber-500' },
    negotiation: { icon: <MessageSquare className="h-4 w-4" />, color: 'bg-purple-500' },
    accepted: { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-emerald-500' },
    rejected: { icon: <XCircle className="h-4 w-4" />, color: 'bg-red-500' },
    converted: { icon: <ArrowRightLeft className="h-4 w-4" />, color: 'bg-indigo-500' },
};

export function QuotationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: quotation, isLoading } = useQuotation(id!);

    const sendWhatsapp = useSendQuotationWhatsapp();
    const acceptMutation = useAcceptQuotation();
    const rejectMutation = useRejectQuotation();
    const convertMutation = useConvertToChallan();
    const duplicateMutation = useDuplicateQuotation();
    const addNoteMutation = useAddNegotiationNote();

    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [noteText, setNoteText] = useState('');

    if (isLoading) {
        return (
            <div className="container py-8 max-w-5xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-64" />
                    <div className="h-4 bg-muted rounded w-96" />
                    <div className="h-64 bg-muted rounded-xl" />
                </div>
            </div>
        );
    }

    if (!quotation) {
        return (
            <div className="container py-8 max-w-5xl text-center">
                <p className="text-muted-foreground">Quotation not found</p>
                <Button variant="outline" onClick={() => navigate('/app/quotations')} className="mt-4">Back</Button>
            </div>
        );
    }

    const q: any = quotation;

    const statusBadgeMap: Record<string, 'active' | 'pending' | 'cancelled'> = {
        DRAFT: 'pending', SENT: 'pending', VIEWED: 'pending', NEGOTIATION: 'pending',
        ACCEPTED: 'active', CONVERTED: 'active', REJECTED: 'cancelled', EXPIRED: 'cancelled',
    };

    // Build timeline events
    const timeline: Array<{ key: string; label: string; time?: Date; description?: string }> = [
        { key: 'created', label: 'Created', time: q.createdAt },
    ];
    if (q.sentAt) timeline.push({ key: 'sent', label: 'Sent', time: q.sentAt });
    if (q.viewedAt) timeline.push({ key: 'viewed', label: 'Viewed by Customer', time: q.viewedAt });
    if (q.negotiationNotes?.length > 0) timeline.push({ key: 'negotiation', label: 'Negotiation', description: `${q.negotiationNotes.length} notes` });
    if (q.acceptedAt) timeline.push({ key: 'accepted', label: 'Accepted', time: q.acceptedAt });
    if (q.rejectedAt) timeline.push({ key: 'rejected', label: 'Rejected', time: q.rejectedAt, description: q.rejectionReason });
    if (q.convertedToChallanId) timeline.push({ key: 'converted', label: 'Converted to Challan', description: q.convertedToChallanId });

    const handleReject = () => {
        if (!rejectReason) return;
        rejectMutation.mutate({ id: q._id, rejectionReason: rejectReason });
        setShowRejectForm(false);
    };

    const handleAddNote = () => {
        if (!noteText.trim()) return;
        addNoteMutation.mutate({ id: q._id, text: noteText });
        setNoteText('');
    };

    return (
        <div className="container py-4 max-w-5xl animate-in fade-in-50">
            <PageHeader
                title={q.quotationNumber}
                description={`${q.customerSnapshot?.companyName} · ${q.customerSnapshot?.city || ''}`}
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/app/quotations')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <StatusBadge status={statusBadgeMap[q.status] || 'pending'} label={q.status} />
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ─── Main Content ──────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Customer Info */}
                    <div className="bg-card border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Customer</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-muted-foreground">Company:</span> <span className="font-medium">{q.customerSnapshot?.companyName}</span></div>
                            <div><span className="text-muted-foreground">Contact:</span> <span className="font-medium">{q.customerSnapshot?.contactPerson || '—'}</span></div>
                            <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{q.customerSnapshot?.phone || '—'}</span></div>
                            <div><span className="text-muted-foreground">City:</span> <span className="font-medium">{q.customerSnapshot?.city || '—'}</span></div>
                            <div><span className="text-muted-foreground">GSTIN:</span> <span className="font-medium">{q.customerSnapshot?.gstin || '—'}</span></div>
                            <div><span className="text-muted-foreground">Valid Till:</span> <span className={`font-medium ${new Date(q.validTillDate) < new Date() ? 'text-red-500' : ''}`}>{formatDate(q.validTillDate)}</span></div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-card border rounded-xl overflow-hidden">
                        <div className="p-4 border-b">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase">Items</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sr</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quality</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Qty</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Rate</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Discount</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Final Rate</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {q.items?.map((item: any, idx: number) => (
                                        <tr key={idx} className="border-t hover:bg-muted/30">
                                            <td className="px-4 py-3">{idx + 1}</td>
                                            <td className="px-4 py-3 font-medium">{item.itemName}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{item.itemCode}</td>
                                            <td className="px-4 py-3 text-right">{item.quantityMeters}m</td>
                                            <td className="px-4 py-3 text-right">₹{item.ratePerMeter?.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right">
                                                {item.discountType !== 'NONE' ? (
                                                    <span className="text-orange-500">
                                                        {item.discountType === 'PERCENT' ? `${item.discountValue}%` : `₹${item.discountValue}`}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-emerald-600">₹{item.finalRate?.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-semibold">₹{item.lineAmount?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t p-4 bg-muted/30">
                            <div className="flex justify-end gap-8 text-sm">
                                <div><span className="text-muted-foreground">Subtotal:</span> <span className="font-medium ml-2">₹{q.subtotal?.toFixed(2)}</span></div>
                                <div><span className="text-muted-foreground">GST:</span> <span className="font-medium ml-2">₹{q.estimatedGst?.toFixed(2)}</span></div>
                                <div className="text-lg"><span className="font-medium">Total:</span> <span className="font-extrabold text-primary ml-2">{formatCurrency(q.grandTotal)}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Negotiation Notes */}
                    <div className="bg-card border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Negotiation Notes
                        </h3>

                        {q.negotiationNotes?.length > 0 ? (
                            <div className="space-y-3 mb-4">
                                {q.negotiationNotes.map((note: any, idx: number) => (
                                    <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                                        <p className="text-sm">{note.text}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {note.createdByName || 'User'} · {formatDate(note.createdAt)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground mb-4">No negotiation notes yet.</p>
                        )}

                        <div className="flex gap-2">
                            <Input
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add negotiation note... e.g., Buyer asked ₹78, offered ₹80"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                            />
                            <Button onClick={handleAddNote} disabled={!noteText.trim() || addNoteMutation.isPending} size="sm">
                                Add
                            </Button>
                        </div>
                    </div>

                    {/* Terms */}
                    {(q.paymentTerms || q.freightTerms || q.dispatchTime || q.remarks) && (
                        <div className="bg-card border rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Terms</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {q.paymentTerms && <div><span className="text-muted-foreground">Payment:</span> {q.paymentTerms}</div>}
                                {q.freightTerms && <div><span className="text-muted-foreground">Freight:</span> {q.freightTerms}</div>}
                                {q.dispatchTime && <div><span className="text-muted-foreground">Dispatch:</span> {q.dispatchTime}</div>}
                                {q.packingTerms && <div><span className="text-muted-foreground">Packing:</span> {q.packingTerms}</div>}
                                {q.gstMode && <div><span className="text-muted-foreground">GST:</span> {q.gstMode}</div>}
                                {q.remarks && <div className="col-span-2"><span className="text-muted-foreground">Remarks:</span> {q.remarks}</div>}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Sidebar ───────────────────────────────────── */}
                <div className="space-y-6">

                    {/* Actions */}
                    <div className="bg-card border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Actions</h3>
                        <div className="space-y-2">
                            {['DRAFT', 'VIEWED', 'NEGOTIATION'].includes(q.status) && (
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white justify-start" size="sm"
                                    onClick={() => sendWhatsapp.mutate(q._id)}>
                                    <Send className="mr-2 h-4 w-4" /> Send WhatsApp
                                </Button>
                            )}

                            {['SENT', 'VIEWED', 'NEGOTIATION'].includes(q.status) && (
                                <>
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white justify-start" size="sm"
                                        onClick={() => acceptMutation.mutate(q._id)}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Accept
                                    </Button>
                                    <Button variant="destructive" className="w-full justify-start" size="sm"
                                        onClick={() => setShowRejectForm(!showRejectForm)}>
                                        <XCircle className="mr-2 h-4 w-4" /> Reject
                                    </Button>
                                </>
                            )}

                            {showRejectForm && (
                                <div className="space-y-2 mt-2">
                                    <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Rejection reason..." />
                                    <Button size="sm" variant="destructive" className="w-full" onClick={handleReject}
                                        disabled={!rejectReason}>Confirm Reject</Button>
                                </div>
                            )}

                            {q.status === 'ACCEPTED' && (
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start" size="sm"
                                    onClick={() => convertMutation.mutate(q._id)}>
                                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Convert to Challan
                                </Button>
                            )}

                            <Button variant="outline" className="w-full justify-start" size="sm"
                                onClick={() => duplicateMutation.mutate(q._id)}>
                                <Copy className="mr-2 h-4 w-4" /> Duplicate
                            </Button>

                            {!['ACCEPTED', 'CONVERTED'].includes(q.status) && (
                                <Button variant="outline" className="w-full justify-start" size="sm"
                                    onClick={() => navigate(`/app/quotations/create`)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Margin Summary */}
                    {(q.expectedMarginAmount != null || q.expectedMarginPercent != null) && (
                        <div className="bg-card border rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Margin</h3>
                            <div className="flex items-center gap-4">
                                {q.expectedMarginAmount != null && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Amount</p>
                                        <p className="text-lg font-bold text-emerald-600">₹{q.expectedMarginAmount.toFixed(2)}</p>
                                    </div>
                                )}
                                {q.expectedMarginPercent != null && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Percent</p>
                                        <p className="text-lg font-bold text-emerald-600">{q.expectedMarginPercent.toFixed(1)}%</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="bg-card border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Timeline
                        </h3>
                        <div className="relative">
                            {timeline.map((event, idx) => {
                                const config = timelineConfig[event.key] || timelineConfig.created;
                                return (
                                    <div key={idx} className="flex gap-3 pb-4 last:pb-0 relative">
                                        {idx < timeline.length - 1 && (
                                            <div className="absolute left-[11px] top-7 w-0.5 h-[calc(100%-16px)] bg-border" />
                                        )}
                                        <div className={`w-6 h-6 rounded-full ${config.color} flex items-center justify-center text-white shrink-0 z-10`}>
                                            {config.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{event.label}</p>
                                            {event.time && <p className="text-xs text-muted-foreground">{formatDate(event.time)}</p>}
                                            {event.description && <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
