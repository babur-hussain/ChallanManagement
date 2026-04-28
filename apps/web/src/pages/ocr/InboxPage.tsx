import { useState, useEffect } from 'react';
import {
    FileText, Upload, Filter, Clock, CheckCircle, AlertTriangle, XCircle, Search, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatIndianDate } from '@textilepro/shared';

const statusConfig: any = {
    UPLOADED: { color: 'bg-muted text-muted-foreground', icon: Clock },
    PROCESSING: { color: 'bg-primary/10 text-primary', icon: Clock },
    REVIEW_REQUIRED: { color: 'bg-warning/10 text-warning', icon: AlertTriangle },
    COMPLETED: { color: 'bg-success/10 text-success', icon: CheckCircle },
    FAILED: { color: 'bg-destructive/10 text-destructive', icon: XCircle }
};

export function InboxPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch
        setTimeout(() => {
            setDocuments([
                { _id: '1', documentNumber: 'DOC-00010', fileName: 'challan_24.jpg', typeDetected: 'DELIVERY_CHALLAN', status: 'REVIEW_REQUIRED', confidenceScore: 65, createdAt: new Date() },
                { _id: '2', documentNumber: 'DOC-00009', fileName: 'payment.png', typeDetected: 'PAYMENT_SCREENSHOT', status: 'COMPLETED', confidenceScore: 92, createdAt: new Date(Date.now() - 3600000) },
                { _id: '3', documentNumber: 'DOC-00008', fileName: 'purchase_bill.pdf', typeDetected: 'PURCHASE_BILL', status: 'PROCESSING', confidenceScore: 0, createdAt: new Date(Date.now() - 7200000) },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Universal Document Inbox</h1>
                    <p className="text-muted-foreground mt-1">Review OCR extracted documents and accept them into TextilePro</p>
                </div>
                <div className="flex gap-2">
                    <a href="/app/ocr-center/upload" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload File
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {['All', 'Needs Review', 'Processing', 'Completed'].map((tab, i) => (
                    <Card key={tab} className={cn("cursor-pointer hover:shadow-md transition-shadow", i === 1 && "border-warning/50 bg-warning/5")}>
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-bold">{i === 0 ? '124' : i === 1 ? '12' : i === 2 ? '3' : '109'}</span>
                            <span className="text-sm text-muted-foreground">{tab}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">Document Queue</CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                            <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 text-sm border rounded-md" />
                        </div>
                        <button className="p-2 border rounded-md hover:bg-muted"><Filter className="w-4 h-4" /></button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Loading queue...</div>
                        ) : documents.map((doc) => {
                            const statusCfg = statusConfig[doc.status] || statusConfig.UPLOADED;
                            const StatusIcon = statusCfg.icon;
                            return (
                                <div key={doc._id} className="flex items-center justify-between py-4 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex gap-2 items-center">
                                                <span className="font-medium text-sm text-foreground">{doc.fileName}</span>
                                                <Badge variant="outline" className={cn("text-[10px]", statusCfg.color)}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {doc.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span>{doc.documentNumber}</span>
                                                <span>•</span>
                                                <span>{doc.typeDetected.replace('_', ' ')}</span>
                                                <span>•</span>
                                                <span>{formatIndianDate(doc.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {doc.status === 'REVIEW_REQUIRED' && (
                                            <div className="hidden sm:flex text-xs items-center gap-2">
                                                <span>Confidence:</span>
                                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-warning" style={{ width: `${doc.confidenceScore}%` }} />
                                                </div>
                                                <span className="text-warning font-medium">{doc.confidenceScore}%</span>
                                            </div>
                                        )}
                                        <a href={`/app/ocr-center/review/${doc._id}`} className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-md">
                                            <Eye className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
