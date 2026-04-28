import React from 'react';
import { Card } from '@/components/ui/card';
import { ShieldAlert, Check, X } from 'lucide-react';

export const AiInbox = () => {

    const escalations = [
        { id: 1, agent: 'Sales Rep', action: 'ISSUE 25% DISCOUNT', reason: 'Customer is churning but willing to stay for $400/yr.', confidence: '82%', target: 'Global Textiles Ltd' },
        { id: 2, agent: 'Finance Analyst', action: 'BATCH WRITE-OFF', reason: 'These 12 invoices are past 360 days due with no contact.', confidence: '99%', target: 'Multiple (12)' },
        { id: 3, agent: 'Collections', action: 'SEND LEGAL NOTICE', reason: 'Party ignored 5 WhatsApp messages regarding ₹2.4L due.', confidence: '74%', target: 'Raj Fabrics' },
    ];

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-rose-600" />
                    Human-in-the-Loop Inbox
                </h1>
                <p className="text-slate-500 mt-2">Critical actions triggered by AI that require manual Executive approval before execution.</p>
            </div>

            <div className="space-y-4 max-w-4xl">
                {escalations.map(esc => (
                    <Card key={esc.id} className="p-6 border-slate-200 shadow-sm flex items-start gap-6 bg-white hover:border-slate-300 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2 py-0.5 rounded uppercase border border-rose-100">{esc.action}</span>
                                <span className="text-slate-400 text-sm font-medium">Requested by: <span className="text-slate-700 font-bold">{esc.agent}</span></span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Target: {esc.target}</h3>
                            <p className="text-slate-600 text-sm">{esc.reason}</p>
                            <p className="text-xs text-slate-400 mt-3">AI Confidence Score: <span className={`font-mono font-bold ${parseInt(esc.confidence) < 80 ? 'text-orange-500' : 'text-emerald-500'}`}>{esc.confidence}</span></p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button className="flex items-center justify-center gap-2 bg-emerald-500 text-white w-32 py-2 rounded-md font-bold shadow-md hover:bg-emerald-600 transition-colors">
                                <Check className="w-4 h-4" /> Approve
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 w-32 py-2 rounded-md font-bold hover:bg-slate-50 transition-colors">
                                <X className="w-4 h-4" /> Reject
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
