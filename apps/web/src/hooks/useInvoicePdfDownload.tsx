import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { InvoicePdfDocument } from '@/pages/invoice/InvoicePdfDocument';

interface UseInvoicePdfDownloadProps {
    invoice: any;
    businessProfile?: any;
    invoiceSettings?: any;
}

/**
 * Convert an image URL to a base64 data URI.
 * Handles both same-origin and cross-origin images.
 */
async function imageUrlToBase64(url: string): Promise<string | null> {
    try {
        // If it's already a data URI, return as-is
        if (url.startsWith('data:')) return url;

        // Make URL absolute if relative
        const isRelative = url.startsWith('/');
        const fullUrl = isRelative ? `${window.location.origin}${url}` : url;

        // Omit credentials for cross-origin URLs (like S3) to avoid CORS strict origin issues
        const response = await fetch(fullUrl, { credentials: isRelative ? 'include' : 'omit' });
        if (!response.ok) return null;

        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

/**
 * Hook that generates a vector PDF using @react-pdf/renderer and triggers
 * a silent browser download without any dialog.
 */
export function useInvoicePdfDownload({ invoice, businessProfile, invoiceSettings }: UseInvoicePdfDownloadProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadPdf = useCallback(async () => {
        if (!invoice) return;

        setIsDownloading(true);
        try {
            // Pre-fetch logo and signature as base64 so @react-pdf/renderer can render them
            const profile = { ...businessProfile };
            const settings = { ...invoiceSettings };

            if (profile?.logo) {
                const base64Logo = await imageUrlToBase64(profile.logo);
                if (base64Logo) profile.logo = base64Logo;
            }

            if (settings?.signatureUrl) {
                const base64Sig = await imageUrlToBase64(settings.signatureUrl);
                if (base64Sig) settings.signatureUrl = base64Sig;
            }

            const doc = InvoicePdfDocument({ invoice, businessProfile: profile, invoiceSettings: settings });
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${invoice.invoiceNumber || 'invoice'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        } finally {
            setIsDownloading(false);
        }
    }, [invoice, businessProfile, invoiceSettings]);

    return { downloadPdf, isDownloading };
}
