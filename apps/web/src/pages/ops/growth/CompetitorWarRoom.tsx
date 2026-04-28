import React from 'react';
import { Sword, Quote, HardDrive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const CompetitorWarRoom = () => {
    return (
        <div className="p-6 bg-slate-950 min-h-screen text-slate-100">
            <div className="flex items-center gap-3 mb-8">
                <Sword className="w-8 h-8 text-rose-500" />
                <h1 className="text-3xl font-bold tracking-tight">Competitor War Room <span className="opacity-50">/ Objection Handling</span></h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-slate-900 border-slate-800 shadow-xl">
                    <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                        <CardTitle className="flex items-center gap-2">
                            <span className="bg-emerald-900/20 text-emerald-500 p-2 rounded-md"><Quote className="w-5 h-5" /></span>
                            "Tally is enough for me."
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <h4 className="text-sm uppercase font-bold text-slate-500 mb-2">Counterplay Script</h4>
                        <p className="text-slate-300 italic mb-4">
                            "Tally is perfect for your accountant, Sir. But does Tally tell you from your mobile phone that Vinayak Textiles owes you ₹4 Lakhs on a Sunday? TextilePro is your Control Tower, Tally is just the ledger."
                        </p>
                        <ul className="text-sm space-y-2 text-slate-400 mt-4 border-t border-slate-800 pt-4">
                            <li>⚔️ Pitch: Mobile Real-time Access</li>
                            <li>⚔️ Pitch: Auto-WhatsApp PDF dispatch</li>
                            <li>⚔️ Goal: Position TextilePro as Ops, not Accounting.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 shadow-xl">
                    <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                        <CardTitle className="flex items-center gap-2">
                            <span className="bg-blue-900/20 text-blue-500 p-2 rounded-md"><HardDrive className="w-5 h-5" /></span>
                            "I don't trust cloud, what if data leaks?"
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <h4 className="text-sm uppercase font-bold text-slate-500 mb-2">Counterplay Script</h4>
                        <p className="text-slate-300 italic mb-4">
                            "If your local computer crashes or gets a virus today, your entire business history is gone. We use AWS Bank-grade encryption. Your data is 100x safer with us than sitting on a dusty hard drive in the shop."
                        </p>
                        <ul className="text-sm space-y-2 text-slate-400 mt-4 border-t border-slate-800 pt-4">
                            <li>⚔️ Pitch: Disaster Recovery (AWS)</li>
                            <li>⚔️ Pitch: Encrypted Vaults</li>
                            <li>⚔️ Goal: Expose the fragility of local databases.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
