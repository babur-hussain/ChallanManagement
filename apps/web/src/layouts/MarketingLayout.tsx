import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';

export const MarketingLayout = () => {
    return (
        <div className="min-h-screen bg-white">
            <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <Layers className="text-primary w-8 h-8" />
                            <span className="text-xl font-bold tracking-tight text-slate-900">TextilePro <span className="text-primary">OS</span></span>
                        </Link>

                        <div className="hidden md:flex space-x-8 items-center">
                            <Link to="/features" className="text-sm font-medium text-gray-700 hover:text-primary">Features</Link>
                            <Link to="/pricing" className="text-sm font-medium text-gray-700 hover:text-primary">Pricing</Link>
                            <Link to="/trust" className="text-sm font-medium text-gray-700 hover:text-primary">Trust & Uptime</Link>

                            <Link to="/auth/login"><Button variant="ghost" className="text-slate-700 font-bold hover:text-slate-900">Sign In</Button></Link>
                            <Link to="/auth/register"><Button>Start Free Trial</Button></Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                <Outlet />
            </main>

            <footer className="bg-slate-50 border-t py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <Layers className="text-slate-400 w-8 h-8 mb-4" />
                        <p className="text-sm text-slate-500">The #1 ERP and B2B Delivery Challan Software for Surat, Ahmedabad, and beyond.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4 text-slate-900">Product</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link to="/features">Core ERP</Link></li>
                            <li><Link to="/pricing">Pricing</Link></li>
                            <li><Link to="/partners">Reseller Network</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4 text-slate-900">Legal</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><Link to="/legal/privacy">Privacy Policy</Link></li>
                            <li><Link to="/legal/terms">Terms of Service</Link></li>
                            <li><Link to="/legal/dpa">Data Processing (DPA)</Link></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    )
}
