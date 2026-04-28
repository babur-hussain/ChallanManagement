import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Send, User } from 'lucide-react';

export const FounderCopilot = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Good morning CEO. I analyzed the systems overnight. We onboarded 12 new users in the UAE, but I am noticing elevated churn risk in the Garments Mfg segment.' }
    ]);
    const [input, setInput] = useState('');

    const send = () => {
        if (!input.trim()) return;
        setMessages([...messages, { role: 'user', text: input }]);
        setInput('');
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', text: 'Let me pull the metrics. The Garments segment has seen a 14% drop in active production orders this week. The Finance Agent suggests this may be due to raw material price hikes in Surat. Would you like me to draft an email to those affected users offering a temporary discount?' }]);
        }, 1500);
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen flex flex-col h-[calc(100vh-64px)] max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <BrainCircuit className="w-8 h-8 text-purple-600" />
                    Founder Copilot
                </h1>
                <p className="text-slate-500 mt-1">Direct conversational access to your platform's entire database, operations, and anomalies.</p>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm bg-white">
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-100' : 'bg-purple-100'}`}>
                                {m.role === 'user' ? <User className="text-indigo-600 w-5 h-5" /> : <BrainCircuit className="text-purple-600 w-5 h-5" />}
                            </div>
                            <div className={`p-4 rounded-xl max-w-[80%] ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                <p className="leading-relaxed">{m.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-white border-t border-slate-200 flex gap-4">
                    <input
                        type="text"
                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        placeholder="Ask anything about MRR, active users, or risks..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && send()}
                    />
                    <button onClick={send} className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 shadow-md transition-colors">
                        <Send className="w-5 h-5 ml-1" />
                    </button>
                </div>
            </Card>
        </div>
    )
}
