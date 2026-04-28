import React from 'react';
import { Columns, User, Phone, CalendarClock } from 'lucide-react';

export const SalesPipeline = () => {

    // Mock leads
    const pipeline = [
        { id: 1, name: 'Vinayak Fab', stage: 'DEMO_BOOKED', rep: 'Rahul', score: 'HOT' },
        { id: 2, name: 'Siddhi Textiles', stage: 'NEGOTIATION', rep: 'Amit', score: 'HOT' },
        { id: 3, name: 'Global Weaves', stage: 'LEAD', rep: 'Unassigned', score: 'COLD' },
    ];

    const stages = [
        { label: 'LEADS IN', key: 'LEAD', color: 'border-blue-500/50' },
        { label: 'DEMO BOOKED', key: 'DEMO_BOOKED', color: 'border-purple-500/50' },
        { label: 'NEGOTIATION', key: 'NEGOTIATION', color: 'border-orange-500/50' },
        { label: 'WON (PAID)', key: 'WON', color: 'border-emerald-500/50' }
    ];

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-slate-100 flex flex-col h-screen">
            <div className="flex items-center gap-3 mb-6 shrink-0">
                <Columns className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline <span className="opacity-50">/ Live Deals</span></h1>
            </div>

            <div className="flex-1 flex gap-4 overflow-x-auto">
                {stages.map(stage => (
                    <div key={stage.key} className={`w-80 shrink-0 bg-slate-900 rounded-xl border-t-4 ${stage.color} p-4 flex flex-col`}>
                        <h3 className="font-bold text-slate-400 text-sm mb-4">{stage.label}</h3>

                        <div className="space-y-3">
                            {pipeline.filter(l => l.stage === stage.key).map(lead => (
                                <div key={lead.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md cursor-grab active:cursor-grabbing hover:border-slate-500 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white">{lead.name}</h4>
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${lead.score === 'HOT' ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-400'}`}>
                                            {lead.score}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 text-xs font-mono text-slate-400">
                                        <div className="flex items-center gap-1"><User className="w-3 h-3" /> {lead.rep}</div>
                                        <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> Caller</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                ))}
            </div>
        </div>
    )
}
