import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { useInventoryStats } from '@/hooks/api/useInventory';
import { formatCurrency } from '@textilepro/shared';
import {
    Package, BarChart3, ShoppingCart, Truck, ArrowRightLeft, SlidersHorizontal,
    TrendingUp, AlertTriangle, ChevronRight, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Sub-views
import { StockSummaryView } from './views/StockSummaryView';
import { PurchasesView } from './views/PurchasesView';
import { DispatchesView } from './views/DispatchesView';
import { TransfersView } from './views/TransfersView';
import { AdjustmentsView } from './views/AdjustmentsView';

type ViewType = 'hub' | 'products' | 'stock' | 'purchases' | 'dispatches' | 'transfers' | 'adjustments';

const MODULES: { id: ViewType; label: string; description: string; icon: React.ElementType; color: string; gradient: string }[] = [
    {
        id: 'products', label: 'Products', description: 'Manage your universal item catalog',
        icon: Package, color: 'text-violet-500', gradient: 'from-violet-500/10 to-violet-500/5',
    },
    {
        id: 'stock', label: 'Stock Summary', description: 'Real-time stock levels & valuation',
        icon: BarChart3, color: 'text-blue-500', gradient: 'from-blue-500/10 to-blue-500/5',
    },
    {
        id: 'purchases', label: 'Purchases', description: 'Inbound stock from suppliers',
        icon: ShoppingCart, color: 'text-emerald-500', gradient: 'from-emerald-500/10 to-emerald-500/5',
    },
    {
        id: 'dispatches', label: 'Sales Dispatch', description: 'Outbound deliveries via challans',
        icon: Truck, color: 'text-amber-500', gradient: 'from-amber-500/10 to-amber-500/5',
    },
    {
        id: 'transfers', label: 'Transfers', description: 'Move stock between warehouses',
        icon: ArrowRightLeft, color: 'text-cyan-500', gradient: 'from-cyan-500/10 to-cyan-500/5',
    },
    {
        id: 'adjustments', label: 'Adjustments', description: 'Manual stock corrections & audits',
        icon: SlidersHorizontal, color: 'text-rose-500', gradient: 'from-rose-500/10 to-rose-500/5',
    },
];

export function InventoryHub() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentView = (searchParams.get('view') as ViewType) || 'hub';

    const { data: stats, isLoading } = useInventoryStats();

    const setView = (view: ViewType) => {
        if (view === 'products') {
            navigate('/app/items');
            return;
        }
        if (view === 'hub') {
            setSearchParams({});
        } else {
            setSearchParams({ view });
        }
    };

    // Sub-view routing
    if (currentView !== 'hub') {
        return (
            <div className="container py-4 max-w-7xl animate-in fade-in-50">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" onClick={() => setView('hub')} className="text-muted-foreground hover:text-foreground -ml-2">
                        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Inventory
                    </Button>
                </div>
                {currentView === 'stock' && <StockSummaryView />}
                {currentView === 'purchases' && <PurchasesView />}
                {currentView === 'dispatches' && <DispatchesView />}
                {currentView === 'transfers' && <TransfersView />}
                {currentView === 'adjustments' && <AdjustmentsView />}
            </div>
        );
    }

    // Grid Hub
    return (
        <div className="container py-4 max-w-7xl animate-in fade-in-50">
            <PageHeader
                title="Inventory"
                description="Comprehensive stock management, purchasing, and dispatch tracking."
            />

            {/* Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <StatCard
                    label="Total Products"
                    value={isLoading ? '—' : String(stats?.totalItems || 0)}
                    icon={Package}
                    accent="text-violet-500"
                />
                <StatCard
                    label="Total Stock"
                    value={isLoading ? '—' : `${(stats?.totalStock || 0).toFixed(0)} m`}
                    icon={TrendingUp}
                    accent="text-blue-500"
                />
                <StatCard
                    label="Stock Value"
                    value={isLoading ? '—' : formatCurrency(stats?.totalStockValue || 0)}
                    icon={BarChart3}
                    accent="text-emerald-500"
                />
                <StatCard
                    label="Low Stock Alerts"
                    value={isLoading ? '—' : String(stats?.lowStockItems || 0)}
                    icon={AlertTriangle}
                    accent={(stats?.lowStockItems || 0) > 0 ? 'text-destructive' : 'text-muted-foreground'}
                    warn={(stats?.lowStockItems || 0) > 0}
                />
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MODULES.map((mod) => {
                    const Icon = mod.icon;
                    // Show dynamic counts from stats
                    let count: string | undefined;
                    if (stats) {
                        if (mod.id === 'products') count = `${stats.totalItems} items`;
                        if (mod.id === 'stock') count = `${stats.totalItems} tracked`;
                        if (mod.id === 'purchases') count = `${stats.totalPurchases} records`;
                        if (mod.id === 'transfers') count = `${stats.totalTransfers} transfers`;
                        if (mod.id === 'adjustments') count = `${stats.recentAdjustments} adjustments`;
                    }

                    return (
                        <button
                            key={mod.id}
                            onClick={() => setView(mod.id)}
                            className={`group relative bg-card border rounded-xl p-6 text-left transition-all duration-200
                hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                bg-gradient-to-br ${mod.gradient}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-lg bg-background/80 border ${mod.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="font-semibold text-base mb-1">{mod.label}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
                            {count && (
                                <p className="text-[11px] font-medium text-muted-foreground/70 mt-3 uppercase tracking-wider">{count}</p>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, accent, warn }: {
    label: string; value: string; icon: React.ElementType; accent: string; warn?: boolean;
}) {
    return (
        <div className={`bg-card border rounded-lg p-4 ${warn ? 'border-destructive/30 bg-destructive/5' : ''}`}>
            <div className="flex justify-between items-center mb-2">
                <p className="text-[11px] text-muted-foreground uppercase font-medium tracking-wide">{label}</p>
                <Icon className={`h-4 w-4 ${accent}`} />
            </div>
            <p className={`text-xl font-bold ${warn ? 'text-destructive' : ''}`}>{value}</p>
        </div>
    );
}
