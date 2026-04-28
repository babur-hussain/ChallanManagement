import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Activity, Users, ShieldAlert } from 'lucide-react';

export const OpsDashboard = () => {
    return (
        <div className="space-y-6 bg-[#0a0a0a] min-h-screen text-slate-200 p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2"><Activity className="text-indigo-500" /> TextilePro Root Ops</h1>
                    <p className="text-slate-400 text-sm mt-1">Global command center and real-time event ingestion.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10">● ALL SYSTEMS OPERATIONAL</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#121212] border-slate-800">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-slate-400">Total Requests (1h)</p>
                        <p className="text-3xl font-bold text-white mt-2">142,504</p>
                        <p className="text-xs text-emerald-400 mt-2">↑ 12% vs last hour</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#121212] border-slate-800">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-slate-400">Active Tenants</p>
                        <p className="text-3xl font-bold text-white mt-2">1,940</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#121212] border-slate-800">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-slate-400">Error Rate</p>
                        <p className="text-3xl font-bold text-emerald-400 mt-2">0.02%</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#121212] border-slate-800">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-slate-400">SOC Alerts</p>
                        <p className="text-3xl font-bold text-red-500 mt-2 flex items-center gap-2">3 <ShieldAlert className="w-5 h-5" /></p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#121212] border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Live Event Stream</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 font-mono text-xs">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-400">2026-10-15 14:02:11</span>
                                <span className="text-emerald-400">SIGNUP_COMPLETED</span>
                                <span className="text-white">bus_991823</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-400">2026-10-15 14:01:45</span>
                                <span className="text-indigo-400">OCR_DOCUMENT_SCANNED</span>
                                <span className="text-white">bus_112044</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-400">2026-10-15 14:01:20</span>
                                <span className="text-amber-400">FIRST_PAYMENT_RECORDED</span>
                                <span className="text-white">bus_55411</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
