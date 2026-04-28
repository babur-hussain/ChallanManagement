import React from 'react';
import { ShieldCheck, Server, Lock } from 'lucide-react';

export const TrustBadges = () => {
    return (
        <div className="flex flex-wrap gap-4 items-center justify-center py-4 opacity-60">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium tracking-tight">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                GST Compliant Output
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium tracking-tight">
                <Lock className="w-4 h-4 text-blue-500" />
                Bank-grade Encryption
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium tracking-tight">
                <Server className="w-4 h-4 text-amber-500" />
                Real-time Offline Sync
            </div>
        </div>
    )
}
