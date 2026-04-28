import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
    return (
        <div>
            {/* HERO SECTION */}
            <section className="pt-24 pb-16 px-4 max-w-7xl mx-auto text-center">
                <BadgeBanner text="🚀 Rated #1 Textile GST Software in Surat & Ahmedabad" />
                <h1 className="mt-8 text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
                    Run your textile business <br /> <span className="text-primary">on autopilot.</span>
                </h1>
                <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto">
                    Generate instant PDF delivery challans, track WhatsApp approvals, manage B2B marketplace leads, and sync GST accounts — from one single dashboard.
                </p>
                <div className="mt-10 flex gap-4 justify-center">
                    <Link to="/auth/register">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-xl">Start 14-day Free Trial <ArrowRight className="ml-2 w-5 h-5" /></Button>
                    </Link>
                    <Link to="/demo">
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl shadow-sm border-slate-300">Book Demo</Button>
                    </Link>
                </div>
            </section>

            {/* TRUST BANNER */}
            <section className="border-y bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-around items-center grayscale gap-8 text-slate-400">
                    {/* Mock logos text */}
                    <p className="font-bold text-xl">BALAJI WEAVERS</p>
                    <p className="font-bold text-xl">SURAT TEXTILES CORP</p>
                    <p className="font-bold text-xl">RELIANCE SYNTHETICS</p>
                    <p className="font-bold text-xl">OMKAR MILLS</p>
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-24 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
                <FeatureCard
                    icon={<Zap className="w-10 h-10 text-amber-500 mb-4" />}
                    title="1-Click PDF Challans"
                    desc="Stop writing challans by hand. Generate GST complaint PDFs instantly and send them via integrated WhatsApp."
                />
                <FeatureCard
                    icon={<ShieldCheck className="w-10 h-10 text-emerald-500 mb-4" />}
                    title="Enterprise Security"
                    desc="ISO-compliant audit logs, Maker-Checker authorization protocols, and multi-branch isolation models."
                />
                <FeatureCard
                    icon={<CheckCircle2 className="w-10 h-10 text-blue-500 mb-4" />}
                    title="Auto-Recovery (Dunning)"
                    desc="TextilePro's billing engine automatically chases up pending collection invoices from your B2B buyers."
                />
            </section>
        </div>
    )
}

const BadgeBanner = ({ text }: { text: string }) => (
    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
        {text}
    </div>
)

const FeatureCard = ({ icon, title, desc }: any) => (
    <div className="p-6 rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all">
        {icon}
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 line-clamp-3">{desc}</p>
    </div>
)
