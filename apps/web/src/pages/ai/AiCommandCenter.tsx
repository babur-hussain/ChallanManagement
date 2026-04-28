import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, Bot, PhoneCall, Headphones, Search, BrainCircuit } from 'lucide-react';

export const AiCommandCenter = () => {

    const agents = [
        { id: 'sales', name: 'AI Sales Rep', icon: <PhoneCall className="text-orange-500" />, status: 'ONLINE', tasks: 1240, influence: '$14,200', score: '98%' },
        { id: 'support', name: 'AI L1 Support', icon: <Headphones className="text-emerald-500" />, status: 'ONLINE', tasks: 450, influence: 'N/A', score: '92%' },
        { id: 'finance', name: 'AI Finance Analyst', icon: <Search className="text-indigo-500" />, status: 'STANDBY', tasks: 22, influence: '$3,100', score: '99%' },
        { id: 'founder', name: 'Founder Copilot', icon: <BrainCircuit className="text-purple-500" />, status: 'ONLINE', tasks: 104, influence: 'Strategic', score: '99%' },
        { id: 'collections', name: 'Collections Bot', icon: <Bot className="text-rose-500" />, status: 'ERROR', tasks: 8, influence: '$0', score: '64%' },
    ];

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary" />
                        AI Workforce Command Center
                    </h1>
                    <p className="text-slate-500 mt-2">Monitor the performance and ROI of your autonomous digital workers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map(agent => (
                    <Card key={agent.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    {agent.icon}
                                </div>
                                <CardTitle className="text-lg font-bold">{agent.name}</CardTitle>
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${agent.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-700' :
                                    agent.status === 'ERROR' ? 'bg-rose-100 text-rose-700' :
                                        'bg-slate-200 text-slate-600'
                                }`}>
                                {agent.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Tasks</p>
                                    <p className="text-lg font-mono font-bold text-slate-800">{agent.tasks}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">ROI/Impact</p>
                                    <p className="text-lg font-mono font-bold text-slate-800">{agent.influence}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Confidence</p>
                                    <p className={`text-lg font-mono font-bold ${parseInt(agent.score) < 90 ? 'text-rose-500' : 'text-emerald-500'}`}>{agent.score}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
