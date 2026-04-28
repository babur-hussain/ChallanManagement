import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChallan } from '@/hooks/api/useChallans';
import { useSettingsData } from '@/hooks/api/useSettings';
import { DeliveryChallanTemplate } from '@textilepro/shared/templates';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, ArrowLeft, Download } from 'lucide-react';
import { useChallanPdfDownload } from '@/hooks/useChallanPdfDownload';

/**
 * ChallanPrintPage — Full-page print view at /app/challans/:id/print
 * Auto-detects A4/A5 from challan record and sets print page size accordingly.
 */
export function ChallanPrintPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: challan, isLoading: challanLoading } = useChallan(id!);
    const { data: settings, isLoading: settingsLoading } = useSettingsData();

    const { downloadPdf, isDownloading } = useChallanPdfDownload({
        challan,
        businessProfile: settings?.profile,
        challanSettings: settings?.challans,
    });

    const isLoading = challanLoading || settingsLoading;
    const paperSize = challan?.paperSize || 'A4';

    // Add print class to body on mount, remove on unmount
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
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', flexDirection: 'column', gap: '12px',
                fontFamily: 'Arial, sans-serif',
            }}>
                <Loader2 style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#888', fontSize: '14px' }}>Loading challan...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!challan) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', fontFamily: 'Arial, sans-serif',
            }}>
                <p style={{ color: '#888', fontSize: '16px' }}>Challan not found.</p>
            </div>
        );
    }

    return (
        <div>
            {/* ─── Action Bar (hidden during print) ─── */}
            <div className="no-print" style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: '#fff', borderBottom: '1px solid #e5e7eb',
                padding: '12px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontFamily: 'Arial, sans-serif',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                        Back
                    </Button>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
                        {challan.challanNumber} — Print Preview ({paperSize})
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Button variant="outline" size="sm" onClick={handlePrint} disabled={isDownloading}>
                        <Printer style={{ width: '16px', height: '16px', marginRight: '6px' }} />
                        Print
                    </Button>
                    <Button size="sm" onClick={downloadPdf} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {isDownloading ? 'Generating...' : 'Save as PDF'}
                    </Button>
                </div>
            </div>

            {/* ─── Print Content ─── */}
            <div className="print-area" style={{
                background: '#f5f5f5',
                minHeight: 'calc(100vh - 56px)',
                padding: '24px',
            }}>
                <div style={{
                    margin: '0 auto',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'center',
                    background: '#fff',
                    maxWidth: '800px', // constrain bounds for pdf rendering
                }}>
                    <DeliveryChallanTemplate
                        challan={{ ...challan, paperSize }}
                        businessProfile={settings?.profile}
                        challanSettings={settings?.challans}
                    />
                </div>
            </div>

            {/* ─── Dynamic Print CSS: auto-select page size from challan ─── */}
            <style>{`
        @media print {
          /* Dynamically set page size based on challan's paperSize */
          @page {
            size: ${paperSize === 'A5' ? 'A5' : 'A4'} portrait;
            margin: 8mm;
          }

          /* Hide everything by default */
          body * {
            visibility: hidden;
          }

          /* Show only the print area and its children */
          .print-area, .print-area * {
            visibility: visible !important;
          }

          /* Position print area at top-left of page */
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #fff !important;
            padding: 0 !important;
            min-height: auto !important;
          }

          /* Hide action bar, sidebar, header, nav */
          .no-print,
          nav,
          aside,
          header,
          [data-sidebar],
          [class*="sidebar"],
          [class*="Sidebar"] {
            display: none !important;
          }

          /* Remove shadows and backgrounds */
          div[style*="box-shadow"] { box-shadow: none !important; }
          body { background: #fff !important; margin: 0; padding: 0; overflow: visible !important; }
          html { overflow: visible !important; }
        }
      `}</style>
        </div>
    );
}
