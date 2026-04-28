import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Rocket, Target, Users, TrendingUp, IndianRupee } from 'lucide-react';

export const HyperGrowthDashboard = () => {
    return (
        <div className="p-6 bg-slate-950 min-h-screen text-slate-100">
            <div className="flex items-center gap-3 mb-8">
                <Rocket className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Growth OS <span className="opacity-50">/ Founder Command</span></h1>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl overflow-hidden relative">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-bold text-slate-400">MRR Added (Today)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-emerald-400 font-mono tracking-tight flex items-center">
                            <IndianRupee className="w-6 h-6 mr-1 opacity-50" />
                            14,500
                        </div>
                        <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% vs yesterday</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-bold text-slate-400">New Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-400 font-mono tracking-tight">342</div>
                        <p className="text-xs text-slate-500 mt-2">from 4 unique ad campaigns</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-bold text-slate-400">Demos Booked</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-purple-400 font-mono tracking-tight">28</div>
                        <p className="text-xs text-slate-500 mt-2">12 scheduled for tomorrow</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs uppercase font-bold text-slate-400">Paid Conversions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white font-mono tracking-tight">9</div>
                        <p className="text-xs text-slate-500 mt-2">7 Starter, 2 Pro</p>
                    </CardContent>
                </Card>
            </div>

            {/* Funnel Visualization */}
            <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2"><Target className="w-5 h-5" /> Conversion Funnel (Last 7 Days)</h2>
            <Card className="bg-slate-900 border-slate-800 p-6">
                <div className="space-y-4">
                    <div className="w-full bg-slate-800 rounded-sm h-12 flex items-center px-4 justify-between relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 bg-blue-500/20" style={{ width: '100%' }}></div>
                        <span className="relative z-10 font-bold">1. Website Traffic</span>
                        <span className="relative z-10 font-mono">14,200</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-sm h-12 flex items-center px-4 justify-between relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 bg-blue-500/30" style={{ width: '45%' }}></div>
                        <span className="relative z-10 font-bold">2. CRM Leads Captured</span>
                        <span className="relative z-10 font-mono">6,390 <span className="text-xs opacity-50 ml-2">(45%)</span></span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-sm h-12 flex items-center px-4 justify-between relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 bg-purple-500/30" style={{ width: '12%' }}></div>
                        <span className="relative z-10 font-bold">3. Demos Booked</span>
                        <span className="relative z-10 font-mono">766 <span className="text-xs opacity-50 ml-2">(12%)</span></span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-sm h-12 flex items-center px-4 justify-between relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/30" style={{ width: '4%' }}></div>
                        <span className="relative z-10 font-bold">4. Paid Conversions</span>
                        <span className="relative z-10 font-mono flex items-center">
                            30 <span className="text-xs opacity-50 ml-2">(4%)</span>
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    )
}
