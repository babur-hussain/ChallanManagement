import { useState } from 'react';
import { ArrowLeft, Check, X, RotateCcw, Save, Search, AlertTriangle } from 'lucide-react';

export function ReviewPage() {
    const [data, setData] = useState<any>({
        challanNumber: 'DC-00247',
        date: '2023-10-25',
        partyName: 'Shree Ram Textiles',
        partyPhone: '9876543210',
        vehicleNumber: 'GJ-05-AB-1234',
        totalAmount: 45600,
        items: [
            { quality: 'Cotton Silk', rollCount: 15, meter: 1500, rate: 25, amount: 37500 },
            { quality: 'Linen Blend', rollCount: 5, meter: 540, rate: 15, amount: 8100 },
        ]
    });

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-4">
                    <button className="p-2 border rounded-md hover:bg-muted"><ArrowLeft className="w-5 h-5" /></button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-3">
                            Review: challan_24.jpg
                            <span className="text-xs px-2 py-1 bg-warning/10 text-warning rounded-full border border-warning/20">Needs Review</span>
                        </h1>
                        <p className="text-sm text-muted-foreground">Type: DELIVERY CHALLAN • Confidence: <span className="text-warning">65%</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 flex items-center gap-2 border rounded-md text-sm hover:bg-muted text-muted-foreground">
                        <RotateCcw className="w-4 h-4" /> Reprocess
                    </button>
                    <button className="px-4 py-2 flex items-center gap-2 border border-destructive text-destructive rounded-md text-sm hover:bg-destructive/5">
                        <X className="w-4 h-4" /> Reject
                    </button>
                    <button className="px-4 py-2 flex items-center gap-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                        <Check className="w-4 h-4" /> Approve & Create Record
                    </button>
                </div>
            </div>

            {/* Split Pane */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
                {/* Left: Original Image Viewer */}
                <div className="bg-muted/30 border rounded-xl flex flex-col overflow-hidden">
                    <div className="p-3 border-b bg-muted/50 flex justify-between items-center text-sm font-medium">
                        <span>Original Document</span>
                        <div className="flex gap-2">
                            <button className="px-2 py-1 bg-background border rounded shadow-sm text-xs">Zoom In</button>
                            <button className="px-2 py-1 bg-background border rounded shadow-sm text-xs">Zoom Out</button>
                        </div>
                    </div>
                    <div className="flex-1 relative bg-neutral-100 dark:bg-neutral-900 p-4 overflow-auto flex items-center justify-center">
                        {/* Mock Document Render */}
                        <div className="bg-white text-black p-8 shadow-sm w-full max-w-lg aspect-[1/1.4] relative shadow-lg">
                            <div className="text-center font-bold text-xl border-b pb-4 mb-4">DELIVERY CHALLAN</div>
                            <div className="flex justify-between mb-8 text-sm">
                                <div>
                                    <div>To: Shree Ram Textiles</div>
                                    <div>Phone: 9876543210</div>
                                </div>
                                <div className="text-right">
                                    <div>No. DC-00247</div>
                                    <div>Date: 25-10-2023</div>
                                    <div className="mt-2 bg-yellow-200/50 p-1 ring-2 ring-yellow-400">Veh: GJ-05 AB-1234</div>
                                </div>
                            </div>
                            <table className="w-full text-sm border-collapse mb-8">
                                <tr className="border-b"><th className="text-left py-2">Quality</th><th>Rolls</th><th>Meters</th><th>Rate</th><th>Amount</th></tr>
                                <tr className="border-b"><td className="py-2">Cotton Silk</td><td className="text-center">15</td><td className="text-center">1500</td><td className="text-center">25</td><td className="text-right">37500</td></tr>
                                <tr className="border-b"><td className="bg-red-200/50 ring-2 ring-red-400">Linen Blnd</td><td className="text-center">5</td><td className="text-center bg-yellow-200/50 ring-2 ring-yellow-400">?540</td><td className="text-center">15</td><td className="text-right">8100</td></tr>
                            </table>
                            <div className="text-right font-bold">Total: Rs 45,600</div>
                        </div>
                    </div>
                </div>

                {/* Right: Extracted Fields (Editable) */}
                <div className="flex flex-col bg-card border rounded-xl shadow-sm">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-lg">Extracted Data</h3>
                        <p className="text-xs text-muted-foreground mt-1">Review and correct fields below before approval.</p>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto space-y-6">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground flex justify-between">Challan Number <span className="text-[10px] text-success">Good</span></label>
                                <input type="text" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1" value={data.challanNumber} onChange={e => setData({ ...data, challanNumber: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground flex justify-between">Date <span className="text-[10px] text-success">Good</span></label>
                                <input type="date" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground flex justify-between">Party Name <span className="text-[10px] text-success">Good</span></label>
                                <div className="relative">
                                    <input type="text" className="w-full border rounded-md pl-3 pr-8 py-2 text-sm focus:ring-1" value={data.partyName} onChange={e => setData({ ...data, partyName: e.target.value })} />
                                    <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground flex justify-between">Vehicle Number <span className="text-[10px] text-warning flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Low</span></label>
                                <input type="text" className="w-full border border-warning rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-warning" value={data.vehicleNumber} onChange={e => setData({ ...data, vehicleNumber: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm mb-3">Line Items</h4>
                            <div className="space-y-2">
                                {data.items.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <input className={item.quality.includes('Linen') ? "w-[40%] text-sm px-2 py-1.5 border border-destructive focus:ring-destructive rounded" : "w-[40%] text-sm px-2 py-1.5 border rounded"} value={item.quality} />
                                        <input type="number" className="w-[15%] text-sm px-2 py-1.5 border rounded" value={item.rollCount} />
                                        <input type="number" className={item.meter === 540 ? "w-[15%] text-sm px-2 py-1.5 border border-warning focus:ring-warning rounded" : "w-[15%] text-sm px-2 py-1.5 border rounded"} value={item.meter} />
                                        <input type="number" className="w-[15%] text-sm px-2 py-1.5 border rounded" value={item.rate} />
                                        <input type="number" className="w-[15%] text-sm px-2 py-1.5 border rounded" value={item.amount} />
                                    </div>
                                ))}
                                <button className="text-sm text-primary font-medium hover:underline mt-2">+ Add Row</button>
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-4 border-t">
                            <label className="text-sm font-medium text-foreground flex justify-between">Total Amount <span className="text-[10px] text-success">Good</span></label>
                            <input type="number" className="w-1/3 border rounded-md px-3 py-2 text-sm font-bold focus:ring-1" value={data.totalAmount} onChange={e => setData({ ...data, totalAmount: parseInt(e.target.value) })} />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
