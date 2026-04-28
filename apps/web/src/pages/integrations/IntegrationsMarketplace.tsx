import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, Server, Link as LinkIcon, BadgeCheck, AlertCircle } from 'lucide-react';

export const IntegrationsMarketplace = () => {
    const apps = [
        { id: 'tally', name: 'Tally ERP 9 / Prime', category: 'Accounting', icon: 'server', status: 'DISCONNECTED', syncMode: 'ONE_WAY' },
        { id: 'shopify', name: 'Shopify', category: 'Ecommerce', icon: 'link', status: 'CONNECTED', syncMode: 'TWO_WAY' },
        { id: 'shiprocket', name: 'Shiprocket', category: 'Logistics', icon: 'truck', status: 'NEEDS_REAUTH', syncMode: 'MANUAL' },
        { id: 'razorpay', name: 'Razorpay', category: 'Payments', icon: 'credit-card', status: 'CONNECTED', syncMode: 'ONE_WAY' },
        { id: 'cleartax', name: 'ClearTax', category: 'Compliance', icon: 'file-text', status: 'DISCONNECTED', syncMode: 'MANUAL' },
        { id: 'eway_bill', name: 'eWay Bill / NIC', category: 'Compliance', icon: 'truck', status: 'CONNECTED', syncMode: 'ONE_WAY' },
    ];

    const [filter, setFilter] = useState('All');
    const categories = ['All', 'Accounting', 'Ecommerce', 'Logistics', 'Payments', 'Compliance'];

    const filteredApps = filter === 'All' ? apps : apps.filter(a => a.category === filter);

    return (
        <div className="p-6 bg-slate-50 min-h-screen text-slate-900">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">App Marketplace</h1>
                    <p className="text-slate-500 mt-1">Connect your favorite tools to TextilePro to automate data sync.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {categories.map(c => (
                    <button
                        key={c}
                        onClick={() => setFilter(c)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === c ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.map(app => (
                    <Card key={app.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shadow-inner">
                                {app.status === 'CONNECTED' ? <BadgeCheck className="text-emerald-500 w-6 h-6" /> : <Server className="text-slate-400 w-6 h-6" />}
                            </div>
                            {app.status === 'CONNECTED' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                </span>
                            )}
                            {app.status === 'NEEDS_REAUTH' && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200">
                                    <AlertCircle className="w-3 h-3" /> Fix Issue
                                </span>
                            )}
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="text-lg font-bold mb-1">{app.name}</CardTitle>
                            <p className="text-sm text-slate-500 mb-6">{app.category} • {app.syncMode} Sync</p>

                            <button className={`w-full py-2 rounded-md font-bold transition-all ${app.status === 'CONNECTED'
                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                                    : 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                                }`}>
                                {app.status === 'CONNECTED' ? 'Manage Settings' : 'Connect App'}
                            </button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
