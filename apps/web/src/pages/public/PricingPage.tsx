import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

export const PricingPage = () => {
    return (
        <div className="py-24 max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Transparent Pricing for India.</h1>
                <p className="mt-4 text-xl text-slate-600">No hidden fees. Scale from a single Surat shop to a National Enterprise.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <PricingTier
                    name="STARTER"
                    price="₹600"
                    desc="Perfect for single shops moving off paper."
                    features={['Base ERP', '1 Branch Limit', '10 WhatsApp/mo', 'No AI Credits']}
                />
                <PricingTier
                    name="GROWTH"
                    price="₹2,400"
                    isPopular
                    desc="For established traders requiring team sync."
                    features={['Up to 3 Branches', 'Finance OS', '500 WhatsApp/mo', 'Included Support']}
                />
                <PricingTier
                    name="PRO"
                    price="₹6,000"
                    desc="Heavy automations for expanding companies."
                    features={['Unlimited Branches', 'Marketplace Access', '2000 WhatsApp/mo', 'AI OCR Inbox']}
                />
                <PricingTier
                    name="ENTERPRISE"
                    price="₹24,000+"
                    desc="Custom integrations and on-prem capable."
                    features={['White-Label Apps', 'Dedicated Account Manager', 'Custom ERP Bridges', 'SLA 99.9%']}
                />
            </div>
        </div>
    )
}

const PricingTier = ({ name, price, desc, features, isPopular }: any) => (
    <Card className={`relative overflow-hidden ${isPopular ? 'border-primary border-2 shadow-lg scale-105 z-10' : 'border-slate-200'}`}>
        {isPopular && <div className="absolute top-0 w-full bg-primary text-white text-center text-xs font-bold py-1 uppercase tracking-wider">Most Popular</div>}
        <CardContent className={`p-8 ${isPopular ? 'pt-10' : ''}`}>
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="text-sm text-slate-500 mt-2 h-10">{desc}</p>
            <div className="my-6">
                <span className="text-4xl font-extrabold">{price}</span>
                <span className="text-slate-500">/mo</span>
            </div>
            <Button className="w-full mb-6" variant={isPopular ? 'default' : 'outline'}>Start Free Trial</Button>

            <ul className="space-y-3">
                {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center text-sm text-slate-700">
                        <Check className="w-4 h-4 text-emerald-500 mr-2 shrink-0" /> {f}
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
)
