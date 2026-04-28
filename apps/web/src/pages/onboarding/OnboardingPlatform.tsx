import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, CircleDashed, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConfettiAPI = () => <div className="absolute inset-0 pointer-events-none overflow-hidden z-50 text-center flex justify-center items-center"><span className="text-6xl animate-ping">🎉🎉🎉</span></div>

export const OnboardingPlatform = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [celebrate, setCelebrate] = useState(false);

    const steps = [
        { id: 1, title: 'Create Business Shell', desc: 'Secure your GST Identity.' },
        { id: 2, title: 'Upload Logo', desc: 'White-label your outgoing PDFs.' },
        { id: 3, title: 'Add First Stock', desc: 'Pre-load some textile inventory items.' },
        { id: 4, title: 'Pair WhatsApp', desc: 'Connect the WhatsApp notification runner.' },
        { id: 5, title: 'Generate Invoice', desc: 'Hit your first $ billing cycle!' }
    ];

    const nextStep = () => {
        if (step === 5) {
            setCelebrate(true);
            setTimeout(() => {
                navigate('/app');
            }, 2500);
            return;
        }
        setStep(s => s + 1);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            {celebrate && <ConfettiAPI />}
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Progress Sidebar */}
                <div className="md:col-span-1 space-y-4">
                    <h2 className="text-xl font-bold mb-6">Setup Sequence</h2>
                    {steps.map((s, idx) => {
                        const isActive = step === s.id;
                        const isDone = step > s.id;

                        return (
                            <div key={s.id} className={`flex gap-3 items-start ${isActive ? 'opacity-100' : isDone ? 'opacity-70' : 'opacity-40'}`}>
                                {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                ) : isActive ? (
                                    <CircleDashed className="w-5 h-5 text-primary shrink-0 mt-0.5 animate-spin-slow" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-slate-900'}`}>{s.title}</p>
                                    <p className="text-xs text-slate-500">{s.desc}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Form Injection Area */}
                <Card className="md:col-span-2 shadow-xl border-0 overflow-hidden">
                    <CardHeader className="bg-primary text-primary-foreground border-b border-primary-foreground/10 pb-8">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            {step === 5 ? <Rocket /> : null}
                            {steps[step - 1].title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 h-64 flex flex-col justify-center items-center text-center">
                        <p className="text-slate-500 mb-8 max-w-md">
                            (Mock injection for the {steps[step - 1].title} React hooks.) This will configure your tenant environment automatically!
                        </p>
                        <Button size="lg" onClick={nextStep} className="w-full max-w-sm rounded-xl h-12 text-lg font-bold shadow-md hover:shadow-lg transition-all">
                            {step === 5 ? 'Launch TextilePro!' : 'Complete & Continue'}
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
