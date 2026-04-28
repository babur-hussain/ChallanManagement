import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Languages, DollarSign, Calculator } from 'lucide-react';

export const LocalizationManager = () => {
    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <Languages className="w-8 h-8 text-cyan-600" />
                    Localization & Taxes
                </h1>
                <p className="text-slate-500 mt-2">Activate regions, currencies, and translation engines globally.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Languages */}
                <Card className="border-slate-200 shadow-sm flex flex-col">
                    <div className="p-4 bg-cyan-50 border-b border-cyan-100 flex items-center justify-between">
                        <h3 className="font-bold text-cyan-900">Supported Locales</h3>
                        <Languages className="w-5 h-5 text-cyan-600" />
                    </div>
                    <CardContent className="p-4 flex-1">
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center text-sm font-medium"><span className="flex items-center gap-2">🇬🇧 English (Global)</span> <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded">Default</span></li>
                            <li className="flex justify-between items-center text-sm font-medium"><span className="flex items-center gap-2">🇮🇳 Hindi (India)</span> <span className="text-xs text-emerald-600 font-bold">100% Translated</span></li>
                            <li className="flex justify-between items-center text-sm font-medium"><span className="flex items-center gap-2">🇦🇪 Arabic (RTL)</span> <span className="text-xs text-orange-600 font-bold">In Progress (82%)</span></li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Tax Engines */}
                <Card className="border-slate-200 shadow-sm flex flex-col">
                    <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                        <h3 className="font-bold text-purple-900">Active Tax Modules</h3>
                        <Calculator className="w-5 h-5 text-purple-600" />
                    </div>
                    <CardContent className="p-4 flex-1">
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center text-sm font-medium"><span>India GST</span> <span className="text-xs text-emerald-600 font-bold border border-emerald-200 px-2 rounded-full">ACTIVE</span></li>
                            <li className="flex justify-between items-center text-sm font-medium"><span>UAE VAT (5%)</span> <span className="text-xs text-emerald-600 font-bold border border-emerald-200 px-2 rounded-full">ACTIVE</span></li>
                            <li className="flex justify-between items-center text-sm font-medium text-slate-400"><span>UK VAT (20%)</span> <span className="text-xs text-slate-500 font-bold">TESTING</span></li>
                            <li className="flex justify-between items-center text-sm font-medium text-slate-400"><span>US Sales Tax (Zipcode)</span> <span className="text-xs text-slate-500 font-bold">PLUGIN REQ</span></li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Base Currencies */}
                <Card className="border-slate-200 shadow-sm flex flex-col">
                    <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                        <h3 className="font-bold text-emerald-900">Active Base Currencies</h3>
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <CardContent className="p-4 flex-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-100 p-3 rounded-md text-center">
                                <p className="text-2xl font-mono font-bold text-slate-800">₹</p>
                                <p className="text-xs font-bold text-slate-500">INR</p>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-md text-center">
                                <p className="text-2xl font-mono font-bold text-slate-800">$</p>
                                <p className="text-xs font-bold text-slate-500">USD</p>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-md text-center">
                                <p className="text-2xl font-mono font-bold text-slate-800">د.إ</p>
                                <p className="text-xs font-bold text-slate-500">AED</p>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-md text-center">
                                <p className="text-2xl font-mono font-bold text-slate-800">£</p>
                                <p className="text-xs font-bold text-slate-500">GBP</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
