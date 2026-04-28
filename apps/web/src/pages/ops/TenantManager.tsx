import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const TenantManager = () => {
    return (
        <div className="space-y-6 bg-[#0a0a0a] min-h-screen text-slate-200 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Tenant Registry</h1>
                <p className="text-slate-400 text-sm mt-1">Search via Tenant ID to manipulate usage caps and billing sequences.</p>
            </div>

            <Card className="bg-[#121212] border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Active Tenants</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-slate-800">
                        <table className="w-full text-sm">
                            <thead className="bg-[#1a1a1a]">
                                <tr>
                                    <th className="p-3 text-left font-medium text-slate-400">Tenant ID</th>
                                    <th className="p-3 text-left font-medium text-slate-400">Business Name</th>
                                    <th className="p-3 text-left font-medium text-slate-400">Plan</th>
                                    <th className="p-3 text-left font-medium text-slate-400">Status</th>
                                    <th className="p-3 text-left font-medium text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t border-slate-800 hover:bg-[#1a1a1a]">
                                    <td className="p-3 font-mono text-indigo-400">bus_094411</td>
                                    <td className="p-3 text-white">Galaxy Traders</td>
                                    <td className="p-3"><Badge className="bg-indigo-500/20 text-indigo-300 border-0">ENTERPRISE</Badge></td>
                                    <td className="p-3"><Badge className="bg-emerald-500/20 text-emerald-400 border-0">ACTIVE</Badge></td>
                                    <td className="p-3 flex gap-2">
                                        <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-800 hover:text-white">Impersonate</Button>
                                        <Button size="sm" variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Suspend</Button>
                                    </td>
                                </tr>
                                <tr className="border-t border-slate-800 hover:bg-[#1a1a1a]">
                                    <td className="p-3 font-mono text-indigo-400">bus_88214</td>
                                    <td className="p-3 text-white">Surat Textiles</td>
                                    <td className="p-3"><Badge className="bg-slate-500/20 text-slate-300 border-0">STARTER</Badge></td>
                                    <td className="p-3"><Badge className="bg-amber-500/20 text-amber-400 border-0">PAST_DUE</Badge></td>
                                    <td className="p-3 flex gap-2">
                                        <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-800 hover:text-white">Impersonate</Button>
                                        <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-800 hover:text-white">Grant Trial</Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
