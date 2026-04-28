import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChallan, useGeneratePdf, useSendWhatsapp, useMarkDeliveredChallan, useCancelChallan } from '@/hooks/api/useChallans';
import { useSettingsData } from '@/hooks/api/useSettings';
import { DeliveryChallanTemplate } from '@textilepro/shared/templates';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@textilepro/shared';
import { ArrowLeft, User, MapPin, Download, CheckCircle, Ban, MessageSquare, Briefcase, Printer, FileText, Edit, Loader2 } from 'lucide-react';
import { useChallanPdfDownload } from '@/hooks/useChallanPdfDownload';

export function ChallanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { data: challan, isLoading } = useChallan(id!);
  const pdfMutation = useGeneratePdf();
  const whatsappMutation = useSendWhatsapp();
  const deliverMutation = useMarkDeliveredChallan();
  const cancelMutation = useCancelChallan();

  const { data: settings } = useSettingsData();
  const { downloadPdf, isDownloading } = useChallanPdfDownload({
    challan,
    businessProfile: settings?.profile,
    challanSettings: settings?.challans,
  });

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-40 w-full mb-6" /><Skeleton className="h-80 w-full" /></div>;
  }

  if (!challan) {
    return <div className="p-8">Challan not found</div>;
  }

  const handleCancel = async () => {
    await cancelMutation.mutateAsync({ id: challan._id, reason: 'Cancelled by user' });
    setIsCancelModalOpen(false);
  };

  const isRealPdf = challan?.pdfUrl && challan.pdfUrl.startsWith('http');

  const onDownloadClick = () => {
    if (isRealPdf) {
      window.open(challan.pdfUrl, '_blank');
    } else {
      downloadPdf();
    }
  };

  return (
    <div className="container py-4 max-w-7xl animate-in fade-in-50 flex flex-col h-[calc(100vh-4rem)]">

      {/* Top Header Row */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex gap-4 items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/challans')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{challan.challanNumber}</h1>
              <StatusBadge status={challan.status === 'DELIVERED' ? 'active' : challan.status === 'CANCELLED' ? 'cancelled' : 'pending'} label={challan.status} />
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(challan.date, 'MMMM do, yyyy')}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {challan.status !== 'CANCELLED' && challan.status !== 'BILLED' && (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate(`/app/challans/${challan._id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive border-red-200 hover:bg-red-50" onClick={() => setIsCancelModalOpen(true)}>
                <Ban className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </>
          )}

          {challan.status !== 'DELIVERED' && challan.status !== 'CANCELLED' && (
            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => deliverMutation.mutate({ id: challan._id })}>
              <CheckCircle className="mr-2 h-4 w-4" /> Mark Delivered
            </Button>
          )}

          <Button variant="secondary" size="sm" onClick={() => window.open(`/app/challans/${challan._id}/print`, '_blank')}>
            <Printer className="mr-2 h-4 w-4" /> Print Challan
          </Button>

          <Button variant="secondary" size="sm" onClick={onDownloadClick} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </Button>

          {challan.status !== 'CANCELLED' && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-none" onClick={() => whatsappMutation.mutate(challan._id)}>
              <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">

        {/* Left Col - PDF Viewer (Takes most space) */}
        <div className="md:col-span-3 bg-white rounded-lg overflow-hidden flex flex-col relative">
          {isRealPdf ? (
            <iframe src={`${challan.pdfUrl}#toolbar=0`} className="w-full h-full border-0 bg-white" title="Challan PDF" />
          ) : (
            <div className="flex-1 overflow-y-auto bg-white flex justify-center items-start">
              <div className="w-full max-w-3xl" style={{ minHeight: '800px' }}>
                <DeliveryChallanTemplate
                  challan={challan}
                  businessProfile={settings?.profile}
                  challanSettings={settings?.challans}
                />
              </div>
            </div>
          )}

          {/* Watermark overlay if cancelled */}
          {challan.status === 'CANCELLED' && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <div className="border-4 border-destructive text-destructive font-bold text-6xl py-4 px-12 rounded-lg rotate-12 opacity-80 uppercase tracking-widest bg-white/80">
                CANCELLED
              </div>
            </div>
          )}
        </div>

        {/* Right Col - Meta info */}
        <div className="overflow-y-auto space-y-4 pb-4">

          {/* Party Card */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Billed To</h3>
              <div className="font-medium text-base mb-1">{challan.partySnapshot.name}</div>
              <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{challan.partySnapshot.address.line1}<br />{challan.partySnapshot.address.city}, {challan.partySnapshot.address.state}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" /> {challan.partySnapshot.phone}
              </div>
              {challan.partySnapshot.gstin && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" /> {challan.partySnapshot.gstin}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Rolls</span>
                <span className="font-medium">{challan.totalRolls}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Meters</span>
                <span className="font-medium">{challan.totalMeters.toFixed(2)} m</span>
              </div>
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold text-lg text-primary">{formatCurrency(challan.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline / Activity */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Activity Timeline</h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Challan Created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(challan.createdAt, 'MMM d, h:mm a')}</p>
                  </div>
                </div>

                {challan.pdfGeneratedAt && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">PDF Rendered</p>
                      <p className="text-xs text-muted-foreground">{formatDate(challan.pdfGeneratedAt, 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                )}

                {challan.whatsappSentAt && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">WhatsApp Sent</p>
                      <p className="text-xs text-muted-foreground">To {challan.whatsappSentTo}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(challan.whatsappSentAt, 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                )}

                {challan.deliveredAt && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Delivered successfully</p>
                      <p className="text-xs text-muted-foreground">{formatDate(challan.deliveredAt, 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                )}

                {challan.cancelledAt && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Cancelled</p>
                      <p className="text-xs text-muted-foreground">Reason: {challan.cancellationReason}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(challan.cancelledAt, 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <ConfirmDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Challan"
        description="Are you absolutely sure you want to cancel this challan? This will reverse the stock deduction immediately. This action cannot be undone."
        variant="destructive"
        confirmLabel="Yes, Cancel Challan"
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}
