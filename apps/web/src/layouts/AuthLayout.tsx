import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Auth Layout — centered card layout for login/register
// ═══════════════════════════════════════════════════════════════

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — gradient branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        <div className="absolute inset-0 gradient-premium" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTZ2Mkgy NHYtMmgxMnptMC02djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">TextilePro</h1>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            India's Best<br />
            Challan Management<br />
            <span className="text-primary-foreground/80">for Textile Business</span>
          </h2>

          <p className="text-lg text-white/80 max-w-lg mb-10 leading-relaxed">
            Streamline your delivery challans, manage parties, track payments,
            and grow your Surat textile business with the most trusted platform.
          </p>

          <div className="flex gap-8">
            {[
              { value: '10,000+', label: 'Challans Managed' },
              { value: '500+', label: 'Textile Businesses' },
              { value: '₹50Cr+', label: 'Transactions Tracked' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-lg gradient-saffron flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gradient-saffron">TextilePro</h1>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
