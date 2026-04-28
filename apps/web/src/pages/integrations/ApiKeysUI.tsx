import React from 'react';
import { KeyRound, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const ApiKeysUI = () => {

    // Mock Data
    const keys = [
        { id: 1, name: 'Tally Auto-Sync Bot', prefix: 'txt_live_4a9b2c11', scopes: ['read:invoices', 'read:challans'], lastUsed: '5 mins ago', active: true },
        { id: 2, name: 'BI Tool Connector', prefix: 'txt_live_8f0e5722', scopes: ['read:invoices'], lastUsed: '2 days ago', active: true },
        { id: 3, name: 'Old Zapier Hook', prefix: 'txt_live_a1b2c3d4', scopes: ['read:inventory'], lastUsed: 'Never', active: false },
    ];

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <KeyRound className="w-8 h-8 text-primary" />
                        Developer API Keys
                    </h1>
                    <p className="text-slate-500 mt-2">Generate REST API keys to programmatically read and write to your TextilePro workspace.</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-bold shadow-md hover:bg-primary/90">
                    <Plus className="w-4 h-4" /> Create Key
                </button>
            </div>

            <Card className="bg-blue-50 border-blue-200 mb-8 shadow-sm">
                <div className="p-4 flex gap-4">
                    <ShieldAlert className="w-8 h-8 text-blue-500 shrink-0" />
                    <div>
                        <h4 className="font-bold text-blue-900">Protect your API Keys</h4>
                        <p className="text-sm text-blue-800 mt-1">API keys grant deep access to your TextilePro domain. Never expose them in frontend code (like React/Angular). Always use them in a trusted server environment.</p>
                    </div>
                </div>
            </Card>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs">
                        <tr>
                            <th className="p-4">Key Name</th>
                            <th className="p-4">Prefix</th>
                            <th className="p-4">Scopes</th>
                            <th className="p-4">Last Used</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {keys.map(key => (
                            <tr key={key.id} className="bg-white hover:bg-slate-50">
                                <td className="p-4 font-bold text-slate-800">{key.name}</td>
                                <td className="p-4 font-mono text-slate-500">{key.prefix}••••••••</td>
                                <td className="p-4">
                                    <div className="flex gap-1 flex-wrap">
                                        {key.scopes.map(s => (
                                            <span key={s} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono border border-slate-200">{s}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 text-slate-500">{key.lastUsed}</td>
                                <td className="p-4 text-right">
                                    <button className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-md transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
