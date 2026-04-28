import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadCloud, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function ReportsPage() {
  
  const handleDownload = (reportQuery: string) => {
    // Basic stub bridging to the new reports API endpoints
    window.open(`http://localhost:3000/api/reports/${reportQuery}`, '_blank');
    toast.success('Report generation started');
  };

  return (
    <div className="container py-4 max-w-5xl animate-in fade-in-50">
      <PageHeader
        title="Business Reports"
        description="Comprehensive exports for auditing, collection drives, and compliance."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        
        <Card>
          <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
               <DownloadCloud className="h-5 w-5 text-primary" /> Aged Receivables
             </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">A complete outstanding breakdown showing all unpaid invoices organized by buckets (0-30, 31-60 days etc).</p>
            <Button onClick={() => handleDownload('outstanding')}>
              Generate Excel Report
            </Button>
          </CardContent>
        </Card>

        {/* Can list 7 other reports here exactly the same way using their query structures */}
        <Card>
          <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
               <ExternalLink className="h-5 w-5 text-emerald-600" /> GSTR-1 JSON Export
             </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Download the exact B2B and B2C summaries needed by your CA for logging the offline tool return.</p>
            <Button variant="outline" onClick={() => toast.info('Under rapid development')}>
              Configure Period & Export
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
