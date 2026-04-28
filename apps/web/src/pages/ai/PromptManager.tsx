import React, { useState } from 'react';
import { Code2, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const PromptManager = () => {
    const [prompt, setPrompt] = useState(`You are the 'TextilePro AI Sales Representative'.
Your goals: 
1. Respond to leads instantly on Website Chat & WhatsApp.
2. Qualify leads.
3. Schedule demos.

Rules:
- Be highly enthusiastic but professional.
- NEVER offer discounts without escalating to a human first.`);

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Code2 className="w-8 h-8 text-slate-800" />
                        Prompt Registry
                    </h1>
                    <p className="text-slate-500 mt-2">Modify the core behavioral instructions driving each AI workforce agent.</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6 h-[600px]">
                <Card className="col-span-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        <li className="p-3 bg-primary/10 text-primary font-bold rounded-md cursor-pointer border border-primary/20">SalesAgent (v2)</li>
                        <li className="p-3 hover:bg-slate-100 text-slate-600 rounded-md cursor-pointer font-medium">SupportAgent (v4)</li>
                        <li className="p-3 hover:bg-slate-100 text-slate-600 rounded-md cursor-pointer font-medium">FinanceAnalyst (v1)</li>
                        <li className="p-3 hover:bg-slate-100 text-slate-600 rounded-md cursor-pointer font-medium">FounderCopilot (v5)</li>
                    </ul>
                </Card>

                <Card className="col-span-3 flex flex-col overflow-hidden">
                    <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                        <div>
                            <span className="font-mono text-emerald-400 text-xs font-bold uppercase tracking-wider block mb-1">Editing Core System Prompt</span>
                            <span className="font-bold">SalesAgent</span>
                        </div>
                        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded text-sm font-bold transition-colors">
                            <Save className="w-4 h-4" /> Deploy Vector
                        </button>
                    </div>
                    <textarea
                        className="flex-1 w-full bg-slate-950 text-emerald-300 font-mono p-6 text-sm resize-none focus:outline-none"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        spellCheck={false}
                    />
                </Card>
            </div>
        </div>
    )
}
