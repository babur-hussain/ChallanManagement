import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Globe2, TrendingUp, Users, Target } from 'lucide-react';

export const GlobalExpansionDashboard = () => {

    const regions = [
        { name: 'India', mrr: '$95K', growth: '+12%', color: 'from-orange-500 to-rose-500', dominantPack: 'Textile Trading' },
        { name: 'UAE (Dubai)', mrr: '$28K', growth: '+45%', color: 'from-emerald-400 to-teal-500', dominantPack: 'Wholesale Dist.' },
        { name: 'Bangladesh', mrr: '$12K', growth: '+8%', color: 'from-blue-500 to-indigo-500', dominantPack: 'Garment Mfg.' },
        { name: 'United Kingdom', mrr: '$7K', growth: '+120%', color: 'from-purple-500 to-fuchsia-500', dominantPack: 'Retail Boutiques' }
    ];

    return (
        <div className="p-6 bg-slate-50 min-h-screen text-slate-900">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Globe2 className="w-8 h-8 text-indigo-600" />
                        Global Expansion Ops
                    </h1>
                    <p className="text-slate-500 mt-2">Track SaaS penetration across borders and industries. All currencies normalized to USD.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Global ARR Run Rate</p>
                    <p className="text-3xl font-bold font-mono tracking-tight text-indigo-600">$1.7M</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {regions.map(region => (
                    <Card key={region.name} className="border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase">{region.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-3xl font-mono font-bold text-slate-800">{region.mrr}</p>
                                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" /> {region.growth} YoY</p>
                                </div>
                                <div className={`w-2 h-12 rounded-full bg-gradient-to-t ${region.color}`}></div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-400 font-bold uppercase">Top Industry Pack</p>
                                <p className="text-sm font-medium text-slate-700">{region.dominantPack}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Simulated Heatmap Placeholder */}
            <Card className="border-slate-200 shadow-sm p-8 bg-indigo-900 text-white flex flex-col items-center justify-center min-h-[300px] overflow-hidden relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <Globe2 className="w-24 h-24 mb-4 text-indigo-400 opacity-50" />
                <h3 className="text-2xl font-bold z-10 mb-2">Live Heatmap</h3>
                <p className="text-indigo-200 z-10 text-center max-w-md">Plotting active active concurrent users across 4 continents and 3 timezones. 74% Traffic routing through Asia-South (AWS).</p>
            </Card>

        </div>
    )
}
