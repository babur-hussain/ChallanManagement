import { useState } from 'react';
import { Settings, Save, Server, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function SettingsPage() {
    const [config, setConfig] = useState({
        defaultProvider: 'AWS_TEXTRACT',
        thresholds: { autoApprove: 90, reviewRequired: 60 },
        routing: {
            textOCR: 'TESSERACT',
            handwriting: 'GEMINI_VISION',
            tableExtraction: 'AWS_TEXTRACT',
            invoices: 'GOOGLE_VISION',
        }
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Settings className="w-6 h-6" /> AI OCR Settings</h1>
                <p className="text-muted-foreground mt-1">Configure extraction providers, routing rules, and auto-approval thresholds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Server className="w-5 h-5" /> Provider Routing</CardTitle>
                            <CardDescription>Select which AI engine handles specific document tasks.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 items-center gap-4 py-3 border-b">
                                <div>
                                    <div className="font-medium text-sm">General Text OCR</div>
                                    <div className="text-xs text-muted-foreground">Standard printed text extraction</div>
                                </div>
                                <select className="border rounded-md px-3 py-2 text-sm bg-background" value={config.routing.textOCR}>
                                    <option value="TESSERACT">Tesseract (Free, Fast)</option>
                                    <option value="AWS_TEXTRACT">AWS Textract (Accurate)</option>
                                    <option value="GOOGLE_VISION">Google Vision (All-rounder)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 items-center gap-4 py-3 border-b">
                                <div>
                                    <div className="font-medium text-sm">Handwriting Recognition</div>
                                    <div className="text-xs text-muted-foreground">Handwritten notes and signatures</div>
                                </div>
                                <select className="border rounded-md px-3 py-2 text-sm bg-background" value={config.routing.handwriting}>
                                    <option value="GEMINI_VISION">Gemini Pro Vision (Best)</option>
                                    <option value="CLAUDE_VISION">Claude 3.5 Sonnet</option>
                                    <option value="GOOGLE_VISION">Google Vision</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 items-center gap-4 py-3 border-b">
                                <div>
                                    <div className="font-medium text-sm">Table & Invoice Layout</div>
                                    <div className="text-xs text-muted-foreground">Complex columns and line items</div>
                                </div>
                                <select className="border rounded-md px-3 py-2 text-sm bg-background" value={config.routing.tableExtraction}>
                                    <option value="AWS_TEXTRACT">AWS Textract</option>
                                    <option value="AZURE_OCR">Azure Document Intelligence</option>
                                    <option value="GEMINI_VISION">Gemini Pro Vision</option>
                                </select>
                            </div>

                            <div className="text-right pt-2">
                                <button className="px-4 py-2 bg-muted text-foreground text-sm font-medium rounded hover:bg-muted/80">Test Routing Logic</button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Confidence & Validation</CardTitle>
                            <CardDescription>Determine when a human needs to review the AI data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium">Auto-Approve Threshold ({config.thresholds.autoApprove}%)</label>
                                    <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">High Confidence</span>
                                </div>
                                <input type="range" min="50" max="100" value={config.thresholds.autoApprove}
                                    onChange={e => setConfig({ ...config, thresholds: { ...config.thresholds, autoApprove: parseInt(e.target.value) } })}
                                    className="w-full accent-success" />
                                <p className="text-xs text-muted-foreground">Documents with confidence score above {config.thresholds.autoApprove}% will skip the universal inbox and create entries immediately.</p>
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <div className="flex justify-between">
                                    <label className="text-sm font-medium">Needs Review Threshold ({config.thresholds.reviewRequired}%)</label>
                                    <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded">Medium Confidence</span>
                                </div>
                                <input type="range" min="0" max="90" value={config.thresholds.reviewRequired}
                                    onChange={e => setConfig({ ...config, thresholds: { ...config.thresholds, reviewRequired: parseInt(e.target.value) } })}
                                    className="w-full accent-warning" />
                                <p className="text-xs text-muted-foreground">Scores below {config.thresholds.reviewRequired}% will be marked as FAILED and require manual typing.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Sidebar settings */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-6 space-y-4">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg">Save Configuration</h3>
                            <p className="text-sm text-muted-foreground">Update global provider engine settings for the entire workspace.</p>
                            <button className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 text-sm font-semibold">API Integrations</CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center bg-muted/50 p-2 rounded border text-sm">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success"></div> WhatsApp Webhook</span>
                                <span className="text-xs font-medium text-primary cursor-pointer hover:underline">Configure</span>
                            </div>
                            <div className="flex justify-between items-center bg-muted/50 p-2 rounded border text-sm">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success"></div> Email Forwarding</span>
                                <span className="text-xs font-medium text-primary cursor-pointer hover:underline">Configure</span>
                            </div>
                            <div className="flex justify-between items-center bg-muted/50 p-2 rounded border text-sm">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warning"></div> Tally Sync API</span>
                                <span className="text-xs font-medium text-primary cursor-pointer hover:underline">Configure</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
