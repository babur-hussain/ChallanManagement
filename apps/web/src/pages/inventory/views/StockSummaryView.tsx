import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Progress } from '@/components/ui/progress';
import { useStockSummary } from '@/hooks/api/useInventory';
import { formatCurrency, formatDate } from '@textilepro/shared';
import { AlertTriangle, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function StockSummaryView() {
    const [search, setSearch] = useState('');
    const [filterLow, setFilterLow] = useState(false);

    const { data: summaries, isLoading } = useStockSummary({
        search,
        isLowStock: filterLow ? true : undefined
    });

    const totalValue = summaries?.reduce((acc, s) => acc + (s.currentStock * s.averageCost), 0) || 0;
    const totalMeters = summaries?.reduce((acc, s) => acc + s.currentStock, 0) || 0;
    const lowCount = summaries?.filter(s => s.isLowStock).length || 0;

    return (
        <>
            <PageHeader
                title="Stock Summary"
                description="Real-time stock valuation and low-stock alerts."
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Total Volume</p>
                    <p className="text-2xl font-bold mt-1 text-primary">{totalMeters.toFixed(1)} m</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Valuation</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(totalValue)}</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Total SKUs</p>
                    <p className="text-2xl font-bold mt-1">{summaries?.length || 0}</p>
                </div>
                <div className={`bg-card border rounded-lg p-4 ${lowCount > 0 ? 'border-destructive/30 bg-destructive/5' : ''}`}>
                    <div className="flex justify-between items-start">
                        <p className="text-[11px] text-muted-foreground uppercase font-medium">Under Threshold</p>
                        {lowCount > 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    </div>
                    <p className={`text-2xl font-bold mt-1 ${lowCount > 0 ? 'text-destructive' : 'text-green-600'}`}>{lowCount}</p>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search items..."
                    className="flex-1 max-w-md"
                />
                <Button
                    variant={filterLow ? 'destructive' : 'outline'}
                    onClick={() => setFilterLow(!filterLow)}
                    className={filterLow ? '' : 'text-foreground'}
                >
                    <AlertTriangle className="mr-2 h-4 w-4" /> Low Stock Only
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 bg-muted/20 animate-pulse rounded-lg border" />)}
                </div>
            ) : summaries?.length === 0 ? (
                <div className="text-center py-12 bg-muted/10 rounded-lg">
                    <Target className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-3" />
                    <p className="text-muted-foreground">No stock tracking data found. Make your first purchase to see stock here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {summaries?.map((s) => {
                        const pct = Math.min((s.currentStock / (s.lowStockThreshold * 3)) * 100, 100);
                        return (
                            <div key={s._id} className="bg-card border rounded-lg p-4 shadow-sm hover:border-primary/30 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold">{s.itemName}</h3>
                                        <p className="text-xs text-muted-foreground">Code: {s.itemCode || '-'}</p>
                                    </div>
                                    {s.isLowStock && <Badge variant="destructive">LOW</Badge>}
                                </div>
                                <div className="my-4">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-3xl font-bold">{s.currentStock.toFixed(1)} <span className="text-sm text-muted-foreground font-normal">m</span></span>
                                    </div>
                                    <Progress
                                        value={pct}
                                        className={`h-2 ${s.isLowStock ? '*:bg-destructive' : pct < 40 ? '*:bg-warning' : '*:bg-primary'}`}
                                    />
                                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                                        <span>Threshold: {s.lowStockThreshold}</span>
                                        <span className="text-blue-600">Reserved: {s.reservedStock}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs pt-3 border-t">
                                    <span className="text-muted-foreground">Avg Cost: {formatCurrency(s.averageCost)}</span>
                                    <span className="text-muted-foreground">
                                        Last: {s.lastMovementType || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
