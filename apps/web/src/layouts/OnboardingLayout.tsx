import React from 'react';
import { Outlet } from 'react-router-dom';

export const OnboardingLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="absolute top-0 w-full p-6 text-center">
                <span className="text-xl font-bold tracking-tight text-slate-800">TextilePro <span className="text-primary">OS</span></span>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    )
}
