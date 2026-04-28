import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Factory, Shirt, Pill, ShoppingCart, Cpu, Scissors } from 'lucide-react';

export const IndustryPacksUI = () => {

    const packs = [
        { id: 1, name: 'Textile Trading (Core)', icon: <Shirt />, status: 'ACTIVE', users: '12.4K', modules: ['GST Billing', 'Challan Dispatch'] },
        { id: 2, name: 'Garment Manufacturing', icon: <Scissors />, status: 'ACTIVE', users: '3.1K', modules: ['BOMs', 'Job Work', 'Production Orders'] },
        { id: 3, name: 'FMCG Distribution', icon: <ShoppingCart />, status: 'BETA', users: '450', modules: ['Batch Tracking', 'Expiry Dates', 'FSSAI'] },
        { id: 4, name: 'Pharma Wholesale', icon: <Pill />, status: 'DEVELOPMENT', users: '0', modules: ['Cold Chain', 'Strict FDA Compliance'] },
        { id: 5, name: 'Electronics & Hardware', icon: <Cpu />, status: 'PLANNING', users: '0', modules: ['Serial Number Tracking', 'Warranty Vault'] },
    ];

    return (
        <div className="p-6 bg-slate-50 min-h-screen text-slate-900">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Factory className="w-8 h-8 text-rose-600" />
                        Industry Packs
                    </h1>
                    <p className="text-slate-500 mt-2">Deploy distinct feature sets to pivot TextilePro for new horizontal markets.</p>
                </div>
                <button className="bg-rose-600 text-white px-4 py-2 font-bold rounded-md shadow-md hover:bg-rose-700">Deploy New Pack</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packs.map(pack => (
                    <Card key={pack.id} className={`border-slate-200 shadow-sm ${pack.status === 'ACTIVE' ? 'bg-white' : 'bg-slate-100 opacity-80'}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                                {pack.icon}
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${pack.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                    pack.status === 'BETA' ? 'bg-orange-100 text-orange-700' :
                                        'bg-slate-200 text-slate-600'
                                }`}>
                                {pack.status}
                            </span>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <CardTitle className="text-xl mb-1">{pack.name}</CardTitle>
                            <p className="text-sm text-slate-500 mb-4 font-mono">{pack.users} Businesses</p>

                            <div className="space-y-2">
                                <p className="text-xs uppercase font-bold text-slate-400">Included Modules</p>
                                <div className="flex gap-2 flex-wrap">
                                    {pack.modules.map(m => (
                                        <span key={m} className="bg-slate-100 border border-slate-200 text-slate-600 text-xs px-2 py-1 rounded-md">
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
