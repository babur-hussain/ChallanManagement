import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { ChallanPdfDocument } from '@textilepro/shared/templates';

interface UseChallanPdfDownloadProps {
    challan: any;
    businessProfile?: any;
    challanSettings?: any;
}

/**
 * Hook that generates a vector PDF using @react-pdf/renderer and triggers
 * a silent browser download without any dialog.
 */
export function useChallanPdfDownload({ challan, businessProfile, challanSettings }: UseChallanPdfDownloadProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadPdf = useCallback(async () => {
        if (!challan) return;

        setIsDownloading(true);
        try {
            const doc = ChallanPdfDocument({ challan, businessProfile, challanSettings });
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${challan.challanNumber || 'challan'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        } finally {
            setIsDownloading(false);
        }
    }, [challan, businessProfile, challanSettings]);

    return { downloadPdf, isDownloading };
}
