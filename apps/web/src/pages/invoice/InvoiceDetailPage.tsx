import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoice, useRecordPayment, useCancelInvoice } from '@/hooks/api/useInvoices';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@textilepro/shared';
import { ArrowLeft, Download, IndianRupee, Printer, FileText, Calendar, MapPin, Clock, XCircle, CheckCircle, Eye, CreditCard, Wallet, Building, Landmark, Share2, Mail } from 'lucide-react';

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id!);
  const recordPaymentMutation = useRecordPayment();
  const cancelMutation = useCancelInvoice();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<string>('CASH');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentBank, setPaymentBank] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  if (isLoading) {
    return (
      <div className="container py-16 text-center animate-pulse">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full mb-4" />
        <p className="text-muted-foreground">Loading invoice...</p>
      </div>
    );
  }
  if (!invoice) return <div className="container py-16 text-center"><p>Invoice not found.</p></div>;

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.paymentStatus !== 'PAID';

  const handleRecordPayment = async () => {
    await recordPaymentMutation.mutateAsync({
      invoiceId: invoice._id,
      data: {
        amount: Number(paymentAmount),
        date: paymentDate,
        mode: paymentMode,
        reference: paymentRef || undefined,
        bank: paymentBank || undefined,
        notes: paymentNotes || undefined,
      }
    });
    setPaymentModalOpen(false);
    setPaymentAmount('');
    setPaymentRef('');
    setPaymentBank('');
    setPaymentNotes('');
  };

  const handleCancel = async () => {
    await cancelMutation.mutateAsync({ invoiceId: invoice._id, reason: cancelReason });
    setCancelModalOpen(false);
  };

  const paymentModes = [
    { value: 'CASH', label: 'Cash', icon: Wallet },
    { value: 'UPI', label: 'UPI', icon: CreditCard },
    { value: 'CHEQUE', label: 'Cheque', icon: FileText },
    { value: 'NEFT', label: 'NEFT', icon: Building },
    { value: 'RTGS', label: 'RTGS', icon: Landmark },
    { value: 'OTHER', label: 'Other', icon: Share2 },
  ];

  return (
    <div className="container py-4 max-w-7xl animate-in fade-in-50 h-[calc(100vh-4rem)] flex flex-col">
      {/* ═══════ TOP BAR ═══════ */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex gap-4 items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/invoices')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Tax Invoice: {invoice.invoiceNumber}</h1>
              {invoice.paymentStatus === 'PAID' && <StatusBadge status="active" label="PAID" />}
              {invoice.paymentStatus === 'PARTIAL' && <StatusBadge status="pending" label="PARTIALLY PAID" />}
              {invoice.paymentStatus === 'UNPAID' && <StatusBadge status={isOverdue ? 'cancelled' : 'pending'} label={isOverdue ? 'OVERDUE' : 'UNPAID'} />}
              {invoice.status === 'CANCELLED' && <StatusBadge status="cancelled" label="CANCELLED" />}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
              <Calendar className="w-3.5 h-3.5" /> Invoice Date: {formatDate(invoice.invoiceDate)}
              <span className="mx-1">•</span>
              <Clock className="w-3.5 h-3.5" /> Due: {formatDate(invoice.dueDate)}
              {isOverdue && <span className="text-destructive ml-1 font-semibold">(Overdue)</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {invoice.paymentStatus !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30"
              onClick={() => { setPaymentAmount(String(invoice.balanceDue)); setPaymentModalOpen(true); }}
            >
              <IndianRupee className="h-4 w-4 mr-2" /> Record Payment
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate(`/app/invoices/${invoice._id}/print`)}>
            <Printer className="mr-2 h-4 w-4" /> Print / PDF
          </Button>
          {invoice.status !== 'CANCELLED' && (
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setCancelModalOpen(true)}>
              <XCircle className="mr-2 h-4 w-4" /> Cancel
            </Button>
          )}
        </div>
      </div>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">

        {/* LEFT: Invoice Details */}
        <div className="md:col-span-3 overflow-y-auto pb-4 space-y-6">
          {/* Party & Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Bill To
                </p>
                <p className="font-semibold text-lg">{invoice.partySnapshot.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {[invoice.partySnapshot.address?.line1, invoice.partySnapshot.address?.line2, invoice.partySnapshot.address?.city, invoice.partySnapshot.address?.state, invoice.partySnapshot.address?.pincode].filter(Boolean).join(', ')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Phone: {invoice.partySnapshot.phone}</p>
                {invoice.partySnapshot.gstin && <p className="text-sm mt-1">GSTIN: <span className="font-mono font-medium">{invoice.partySnapshot.gstin}</span></p>}
                <p className="text-xs mt-2 px-2 py-0.5 bg-muted rounded inline-block">
                  {invoice.supplyType === 'INTRA_STATE' ? '🏠 Intra-State (CGST+SGST)' : '🚚 Inter-State (IGST)'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Building className="w-3 h-3" /> From
                </p>
                <p className="font-semibold text-lg">{invoice.businessSnapshot.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {typeof invoice.businessSnapshot.address === 'object' && invoice.businessSnapshot.address !== null
                    ? [
                      (invoice.businessSnapshot.address as any).line1,
                      (invoice.businessSnapshot.address as any).line2,
                      (invoice.businessSnapshot.address as any).city,
                      (invoice.businessSnapshot.address as any).state,
                      (invoice.businessSnapshot.address as any).pincode,
                    ].filter(Boolean).join(', ')
                    : invoice.businessSnapshot.address}
                </p>
                {invoice.businessSnapshot.gstin && <p className="text-sm mt-1">GSTIN: <span className="font-mono font-medium">{invoice.businessSnapshot.gstin}</span></p>}
              </CardContent>
            </Card>
          </div>

          {/* Items Table */}
          <Card>
            <div className="px-5 py-3 border-b bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Line Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left">
                  <tr>
                    <th className="p-3 w-12">#</th>
                    <th className="p-3">Item</th>
                    <th className="p-3">HSN</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Taxable</th>
                    {invoice.supplyType === 'INTRA_STATE' ? (
                      <>
                        <th className="p-3 text-right">CGST</th>
                        <th className="p-3 text-right">SGST</th>
                      </>
                    ) : (
                      <th className="p-3 text-right">IGST</th>
                    )}
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/10">
                      <td className="p-3 text-muted-foreground">{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-medium">{item.itemName}</div>
                        {item.itemCode && <div className="text-[10px] text-muted-foreground">{item.itemCode}</div>}
                      </td>
                      <td className="p-3 font-mono text-muted-foreground">{item.hsnCode}</td>
                      <td className="p-3 text-right">{item.quantity} {item.unit}</td>
                      <td className="p-3 text-right">{formatCurrency(item.ratePerUnit)}</td>
                      <td className="p-3 text-right">{formatCurrency(item.taxableAmount)}</td>
                      {invoice.supplyType === 'INTRA_STATE' ? (
                        <>
                          <td className="p-3 text-right">
                            <div>{formatCurrency(item.cgstAmount)}</div>
                            <div className="text-[10px] text-muted-foreground">@{item.cgstRate}%</div>
                          </td>
                          <td className="p-3 text-right">
                            <div>{formatCurrency(item.sgstAmount)}</div>
                            <div className="text-[10px] text-muted-foreground">@{item.sgstRate}%</div>
                          </td>
                        </>
                      ) : (
                        <td className="p-3 text-right">
                          <div>{formatCurrency(item.igstAmount)}</div>
                          <div className="text-[10px] text-muted-foreground">@{item.igstRate}%</div>
                        </td>
                      )}
                      <td className="p-3 text-right font-semibold">{formatCurrency(item.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-md ml-auto text-sm">
                <span className="text-muted-foreground text-right">Sub Total:</span>
                <span className="text-right font-medium">{formatCurrency(invoice.subtotal)}</span>

                {invoice.totalCgst > 0 && (
                  <>
                    <span className="text-muted-foreground text-right">Total CGST:</span>
                    <span className="text-right">{formatCurrency(invoice.totalCgst)}</span>
                  </>
                )}
                {invoice.totalSgst > 0 && (
                  <>
                    <span className="text-muted-foreground text-right">Total SGST:</span>
                    <span className="text-right">{formatCurrency(invoice.totalSgst)}</span>
                  </>
                )}
                {invoice.totalIgst > 0 && (
                  <>
                    <span className="text-muted-foreground text-right">Total IGST:</span>
                    <span className="text-right">{formatCurrency(invoice.totalIgst)}</span>
                  </>
                )}

                <span className="text-muted-foreground text-right">Total GST:</span>
                <span className="text-right">{formatCurrency(invoice.totalGst)}</span>

                {invoice.roundOff !== 0 && (
                  <>
                    <span className="text-muted-foreground text-right">Round Off:</span>
                    <span className="text-right">{invoice.roundOff >= 0 ? '+' : ''}{invoice.roundOff.toFixed(2)}</span>
                  </>
                )}

                <div className="col-span-2 border-t my-1" />
                <span className="text-right font-bold text-lg">Grand Total (₹):</span>
                <span className="text-right font-black text-lg text-primary">{formatCurrency(invoice.finalAmount)}</span>
              </div>

              {invoice.amountInWords && (
                <p className="text-sm text-muted-foreground italic mt-4 text-right">
                  Amount in Words: <span className="text-foreground">{invoice.amountInWords}</span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(invoice.notes || invoice.termsAndConditions) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invoice.notes && (
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Customer Notes</p>
                    <p className="text-sm">{invoice.notes}</p>
                  </CardContent>
                </Card>
              )}
              {invoice.termsAndConditions && (
                <Card>
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Terms & Conditions</p>
                    <p className="text-sm">{invoice.termsAndConditions}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="overflow-y-auto space-y-4 pb-4">
          {/* Balance Due Card */}
          <Card className={invoice.balanceDue > 0 ? 'border-orange-200' : 'border-green-200'}>
            <CardContent className="p-4 bg-gradient-to-b from-primary/5 to-transparent">
              <p className="text-xs font-semibold text-muted-foreground uppercase opacity-80 mb-2">Balance Due</p>
              <div className={`text-3xl font-black tracking-tight ${invoice.balanceDue > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {formatCurrency(invoice.balanceDue)}
              </div>
              <div className="flex justify-between mt-3 text-sm border-t pt-2 border-border">
                <span>Total Billed</span>
                <span className="font-medium">{formatCurrency(invoice.finalAmount)}</span>
              </div>
              <div className="flex justify-between mt-1 text-sm">
                <span>Amount Paid</span>
                <span className="font-medium text-green-600">{formatCurrency(invoice.totalPaid)}</span>
              </div>
              {invoice.paymentStatus !== 'PAID' && invoice.status !== 'CANCELLED' && (
                <Button
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                  onClick={() => { setPaymentAmount(String(invoice.balanceDue)); setPaymentModalOpen(true); }}
                >
                  <IndianRupee className="h-4 w-4 mr-2" /> Record Payment
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Source Challans */}
          <Card>
            <div className="px-4 py-3 border-b bg-muted/40 font-semibold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" /> Source Challans
            </div>
            <div className="p-4 space-y-2 max-h-40 overflow-y-auto text-sm">
              {invoice.challanNumbers.map(n => (
                <div key={n} className="flex items-center gap-2 text-primary hover:underline cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" /> {n}
                </div>
              ))}
            </div>
          </Card>

          {/* E-Invoice Status */}
          <Card>
            <div className="px-4 py-3 border-b bg-muted/40 font-semibold text-sm">E-Invoice Status</div>
            <CardContent className="p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${invoice.eInvoiceStatus === 'GENERATED' ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {invoice.eInvoiceStatus || 'NOT_GENERATED'}
                </span>
              </div>
              {invoice.irnNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IRN</span>
                  <span className="font-mono text-xs break-all">{invoice.irnNumber}</span>
                </div>
              )}
              {invoice.ackNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ack No</span>
                  <span>{invoice.ackNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <Card>
              <div className="px-4 py-3 border-b bg-muted/40 font-semibold text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" /> Payment History
              </div>
              <div className="p-4 space-y-3">
                {invoice.payments.map((p: any, idx: number) => (
                  <div key={idx} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex justify-between font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${p.mode === 'CASH' ? 'bg-green-500' : p.mode === 'UPI' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                        {p.mode}
                      </span>
                      <span className="text-green-600">+{formatCurrency(p.amount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatDate(p.date)}</span>
                      <span>{p.reference || ''}</span>
                    </div>
                    {p.notes && <p className="text-xs text-muted-foreground mt-1 italic">{p.notes}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Activity */}
          <Card>
            <div className="px-4 py-3 border-b bg-muted/40 font-semibold text-sm">Activity</div>
            <CardContent className="p-4 text-xs text-muted-foreground space-y-2">
              <p>Created: {formatDate(invoice.createdAt)}</p>
              <p>Last updated: {formatDate(invoice.updatedAt)}</p>
              {invoice.emailSentAt && <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> Emailed: {formatDate(invoice.emailSentAt)}</p>}
              {invoice.pdfGeneratedAt && <p className="flex items-center gap-1"><Download className="w-3 h-3" /> PDF: {formatDate(invoice.pdfGeneratedAt)}</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══════ RECORD PAYMENT MODAL ═══════ */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-100">
                <IndianRupee className="w-5 h-5 text-green-700" />
              </div>
              Record Payment
            </DialogTitle>
            <DialogDescription>
              Invoice: {invoice.invoiceNumber} • Balance Due: <span className="font-bold text-foreground">{formatCurrency(invoice.balanceDue)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Amount (₹) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                placeholder={String(invoice.balanceDue)}
                step={0.01}
                min={0.01}
                max={invoice.balanceDue}
              />
              {Number(paymentAmount) > invoice.balanceDue && (
                <p className="text-xs text-destructive">Amount exceeds balance due</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Payment Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Payment Mode <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-3 gap-2">
                {paymentModes.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-all ${paymentMode === m.value ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setPaymentMode(m.value)}
                  >
                    <m.icon className="w-4 h-4" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Reference / Txn ID</Label>
                <Input value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="CHQ-12345" />
              </div>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input value={paymentBank} onChange={e => setPaymentBank(e.target.value)} placeholder="SBI / HDFC" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} placeholder="Payment received in office..." rows={2} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleRecordPayment}
              disabled={recordPaymentMutation.isPending || !paymentAmount || Number(paymentAmount) <= 0}
            >
              {recordPaymentMutation.isPending ? 'Recording...' : (
                <><CheckCircle className="mr-2 h-4 w-4" /> Record ₹{Number(paymentAmount || 0).toLocaleString('en-IN')}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════ CANCEL INVOICE MODAL ═══════ */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" /> Cancel Invoice
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Invoice <span className="font-bold text-foreground">{invoice.invoiceNumber}</span> will be permanently cancelled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Reason for cancellation <span className="text-destructive">*</span></Label>
            <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Enter reason..." rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>Keep Invoice</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending || cancelReason.length < 5}>
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
