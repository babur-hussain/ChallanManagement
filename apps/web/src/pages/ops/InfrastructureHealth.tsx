import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const InfrastructureHealth = () => {
    return (
        <div className="space-y-6 bg-[#0a0a0a] min-h-screen text-slate-200 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Infrastructure Status</h1>
                <p className="text-slate-400 text-sm mt-1">Live telemetry across Docker swarms, DBs, and worker queues.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#121212] border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Core Database (MongoDB)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-sm text-slate-400">Node Status</span>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-0">PRIMARY (HEALTHY)</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-sm text-slate-400">Query Latency</span>
                            <span className="text-white font-mono">14ms</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-sm text-slate-400">Active Connections</span>
                            <span className="text-white font-mono">2,104</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#121212] border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Asynchronous Workers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-sm text-slate-400">OCR Queue Backlog</span>
                            <span className="text-white font-mono">0 pending</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-sm text-slate-400">Webhook Re-tries</span>
                            <span className="text-white font-mono">12 pending</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-sm text-slate-400">Background Job Latency</span>
                            <span className="text-emerald-400 font-mono">45ms</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
