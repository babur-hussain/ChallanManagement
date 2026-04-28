import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Map, Flag, Swords } from 'lucide-react';

export const CityDominationMap = () => {

    const cities = [
        { name: 'Surat', state: 'Gujarat', tam: '45,000', penetration: '12.4%', status: 'BATTLEGROUND', mrr: '₹14.2L' },
        { name: 'Bhilwara', state: 'Rajasthan', tam: '12,000', penetration: '0.5%', status: 'UNTAPPED', mrr: '₹0' },
        { name: 'Tiruppur', state: 'Tamil Nadu', tam: '28,000', penetration: '2.1%', status: 'GROWING', mrr: '₹1.8L' },
        { name: 'Ahmedabad', state: 'Gujarat', tam: '35,000', penetration: '8.7%', status: 'GROWING', mrr: '₹5.5L' },
    ];

    return (
        <div className="p-6 bg-slate-950 min-h-screen text-slate-100">
            <div className="flex items-center gap-3 mb-8">
                <Map className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">City Domination <span className="opacity-50">/ Market Analysis</span></h1>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {cities.map(city => (
                    <Card key={city.name} className="bg-slate-900 border-slate-800 shadow-xl flex items-center justify-between p-6">
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${city.penetration > '10%' ? 'border-primary' : 'border-slate-800'} bg-slate-950 shadow-inner`}>
                                <Flag className={`w-6 h-6 ${city.penetration > '10%' ? 'text-primary' : 'text-slate-500'}`} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-white mb-1">{city.name}</h3>
                                <p className="text-slate-500 text-sm font-medium">{city.state}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-12 text-center">
                            <div>
                                <p className="text-xs uppercase text-slate-500 font-bold mb-1">Total Market</p>
                                <p className="text-xl font-mono text-white">{city.tam}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-slate-500 font-bold mb-1">Penetration</p>
                                <p className="text-xl font-mono text-emerald-400">{city.penetration}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-slate-500 font-bold mb-1">MRR Captured</p>
                                <p className="text-xl font-mono text-slate-200">{city.mrr}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-slate-500 font-bold mb-1">Expansion Status</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-opacity-20 ${city.status === 'UNTAPPED' ? 'bg-blue-500 text-blue-400' : 'bg-orange-500 text-orange-400'}`}>
                                    {city.status}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="mt-8 opacity-50 flex items-center gap-2 text-sm justify-center">
                <Swords className="w-4 h-4" /> Penetration &gt; 30% triggers the "Regional Lock" achievement.
            </div>
        </div>
    )
}
