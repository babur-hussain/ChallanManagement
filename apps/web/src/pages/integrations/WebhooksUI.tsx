import React from 'react';
import { Webhook, Plus, Activity, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const WebhooksUI = () => {

    const hooks = [
        { id: 1, url: 'https://hooks.zapier.com/hooks/catch/123/abc', events: ['invoice.created', 'payment.received'], fails: 0, status: 'Active' },
        { id: 2, url: 'https://my-internal-erp.com/webhook', events: ['challan.created'], fails: 5, status: 'Failing' },
    ];

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Webhook className="w-8 h-8 text-primary" />
                        Outbound Webhooks
                    </h1>
                    <p className="text-slate-500 mt-2">Subscribe to real-time events. TextilePro will POST JSON payloads to your endpoints when actions occur.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md font-bold shadow-md hover:bg-slate-800 transition-colors">
                    <Plus className="w-4 h-4" /> Add Endpoint
                </button>
            </div>

            <div className="grid gap-4">
                {hooks.map(hook => (
                    <Card key={hook.id} className="p-6 border-slate-200 shadow-sm flex items-start justify-between bg-white hover:border-slate-300 transition-colors">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-slate-800 text-lg">{hook.url}</h3>
                                {hook.status === 'Active' ? (
                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        <Activity className="w-3 h-3" /> Active
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                        <AlertTriangle className="w-3 h-3" /> Disconnected
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {hook.events.map(e => (
                                    <span key={e} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded font-mono border border-indigo-100">
                                        {e}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase text-slate-400 font-bold mb-1">Failed Deliveries</p>
                            <p className={`text-xl font-mono ${hook.fails > 0 ? 'text-rose-500' : 'text-slate-400'}`}>{hook.fails}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="mt-8 text-center text-sm text-slate-500 border-t border-slate-200 pt-8">
                Delivery guarantees: Webhooks are retried up to 5 times using exponential backoff.
            </div>
        </div>
    );
};
