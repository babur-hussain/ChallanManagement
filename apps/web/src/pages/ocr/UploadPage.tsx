import { useState } from 'react';
import { UploadCloud, File, X, CheckCircle, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function UploadPage() {
    const [files, setFiles] = useState<any[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Simulated drag-and-drop handler
    const handleDrop = (e: any) => {
        e.preventDefault();
        setIsDragging(false);
        const newFiles = Array.from(e.dataTransfer.files).map((f: any) => ({
            file: f,
            status: 'queued',
            progress: 0
        }));
        setFiles((prev) => [...prev, ...newFiles]);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Upload to AI OCR Center</h1>
                <p className="text-muted-foreground mt-1">Upload challans, bills, GST invoices or screenshots for instant extraction.</p>
            </div>

            <Card>
                <CardContent className="p-8">
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Click or drag files here</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Supports PDF, JPG, PNG, WEBP, XLSX, CSV up to 10MB
                        </p>
                        <button className="px-6 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors">
                            Browse Files
                        </button>
                    </div>
                </CardContent>
            </Card>

            {files.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Upload Queue ({files.length})</h3>
                    <div className="grid gap-3">
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-card border rounded-lg">
                                <div className="flex flex-row items-center gap-4">
                                    <File className="w-8 h-8 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">{f.file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(f.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                {f.status === 'queued' ? (
                                    <div className="w-1/3 flex items-center gap-3">
                                        <div className="grow h-2 bg-muted rounded-full">
                                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: '45%' }} />
                                        </div>
                                        <X className="w-4 h-4 text-muted-foreground cursor-pointer" />
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2 text-sm text-success">
                                        <CheckCircle className="w-4 h-4" /> Uploaded
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t gap-3">
                        <button className="px-4 py-2 border rounded-md text-sm hover:bg-muted transition-colors">Cancel All</button>
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            Process All Items
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
