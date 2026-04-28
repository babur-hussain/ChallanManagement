import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const FeatureFlagsUI = () => {
    return (
        <div className="space-y-6 bg-[#0a0a0a] min-h-screen text-slate-200 p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Experiments & Flags</h1>
                    <p className="text-slate-400 text-sm mt-1">Roll out new features dynamically without deploying code.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Create Flag</Button>
            </div>

            <Card className="bg-[#121212] border-slate-800">
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="bg-[#1a1a1a]">
                            <tr>
                                <th className="p-4 text-left font-medium text-slate-400">Flag Key</th>
                                <th className="p-4 text-left font-medium text-slate-400">Rollout</th>
                                <th className="p-4 text-left font-medium text-slate-400">Target Scopes</th>
                                <th className="p-4 text-left font-medium text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-slate-800">
                                <td className="p-4 font-mono text-indigo-400">NEW_B2B_MARKETPLACE_UI</td>
                                <td className="p-4 text-white">50%</td>
                                <td className="p-4"><Badge variant="outline" className="border-slate-700 text-slate-300">Random Hash</Badge></td>
                                <td className="p-4"><Badge className="bg-emerald-500/20 text-emerald-400 border-0">ACTIVE</Badge></td>
                            </tr>
                            <tr className="border-t border-slate-800">
                                <td className="p-4 font-mono text-indigo-400">AI_OCR_ENGINE_v4</td>
                                <td className="p-4 text-white">100%</td>
                                <td className="p-4"><Badge variant="outline" className="border-slate-700 text-slate-300">ENTERPRISE ONLY</Badge></td>
                                <td className="p-4"><Badge className="bg-emerald-500/20 text-emerald-400 border-0">ACTIVE</Badge></td>
                            </tr>
                            <tr className="border-t border-slate-800 opacity-50">
                                <td className="p-4 font-mono text-indigo-400">WHATSAPP_AUTO_RESPONDER</td>
                                <td className="p-4 text-white">0%</td>
                                <td className="p-4"><Badge variant="outline" className="border-slate-700 text-slate-300">All</Badge></td>
                                <td className="p-4"><Badge className="bg-slate-800 text-slate-400 border-0">DISABLED</Badge></td>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
