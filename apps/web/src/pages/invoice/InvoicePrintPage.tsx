import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvoice } from '@/hooks/api/useInvoices';
import { useSettingsData } from '@/hooks/api/useSettings';
import { InvoiceTemplate } from './InvoiceTemplate';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, ArrowLeft, Download } from 'lucide-react';
import { useInvoicePdfDownload } from '@/hooks/useInvoicePdfDownload';

export function InvoicePrintPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: invoice, isLoading: invoiceLoading } = useInvoice(id!);
    const { data: settings, isLoading: settingsLoading } = useSettingsData();

    const { downloadPdf, isDownloading } = useInvoicePdfDownload({
        invoice,
        businessProfile: settings?.profile,
        invoiceSettings: settings?.invoices,
    });

    const isLoading = invoiceLoading || settingsLoading;
    const paperSize = invoice?.paperSize || 'A4';

    useEffect(() => {
        document.body.classList.add('print-challan-mode');
        return () => {
            document.body.classList.remove('print-challan-mode');
        };
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column'
            }}>
                <Loader2 style={{ width: 32, height: 32, animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>Loading invoice...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Invoice not found.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="no-print" style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: '#fff', borderBottom: '1px solid #e5e7eb',
                padding: '12px 24px', display: 'flex', justifyContent: 'space-between',
                fontFamily: 'system-ui, sans-serif'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <span className="font-semibold text-gray-800">{invoice.invoiceNumber} — Print Preview</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Button variant="outline" size="sm" onClick={handlePrint} disabled={isDownloading}>
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                    <Button size="sm" onClick={downloadPdf} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {isDownloading ? 'Generating...' : 'Save as PDF'}
                    </Button>
                </div>
            </div>

            <div className="print-area" style={{ background: '#f5f5f5', minHeight: '100vh', padding: '24px' }}>
                <div style={{ margin: '0 auto', background: '#fff', maxWidth: '800px', display: 'flex', justifyContent: 'center' }}>
                    <InvoiceTemplate
                        invoice={invoice}
                        businessProfile={settings?.profile}
                        invoiceSettings={settings?.invoices}
                    />
                </div>
            </div>

            <style>{`
        @media print {
          @page { size: A4 portrait; margin: 4mm; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; background: #fff !important; padding: 0 !important; }
          .no-print { display: none !important; }
          body, html { background: #fff !important; overflow: visible !important; margin:0; padding:0; }
        }
            `}</style>
        </div>
    );
}
