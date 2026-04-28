import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { usePurchases } from '@/hooks/api/useInventory';
import { formatCurrency, formatDate } from '@textilepro/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingCart } from 'lucide-react';

export function PurchasesView() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading } = usePurchases({ page, limit: 20, search });

    const purchases = data?.data || [];
    const pagination = data?.pagination;

    return (
        <>
            <PageHeader
                title="Purchases"
                description="All inbound stock purchases from suppliers."
                actions={
                    <Button size="sm" onClick={() => navigate('/app/inventory/purchase')}>
                        <Plus className="mr-2 h-4 w-4" /> New Purchase
                    </Button>
                }
            />

            <div className="mb-6">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by supplier or purchase number..."
                    className="max-w-md"
                />
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-lg border" />)}
                </div>
            ) : purchases.length === 0 ? (
                <div className="text-center py-12 bg-muted/10 rounded-lg">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-3" />
                    <p className="text-muted-foreground">No purchases recorded yet.</p>
                    <Button size="sm" className="mt-4" onClick={() => navigate('/app/inventory/purchase')}>
                        <Plus className="mr-2 h-4 w-4" /> Record First Purchase
                    </Button>
                </div>
            ) : (
                <>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/30 text-xs text-muted-foreground uppercase">
                                    <th className="text-left px-4 py-3 font-medium">Purchase #</th>
                                    <th className="text-left px-4 py-3 font-medium">Date</th>
                                    <th className="text-left px-4 py-3 font-medium">Supplier</th>
                                    <th className="text-right px-4 py-3 font-medium">Items</th>
                                    <th className="text-right px-4 py-3 font-medium">Total Meters</th>
                                    <th className="text-right px-4 py-3 font-medium">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {purchases.map((p: any) => (
                                    <tr key={p._id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm font-medium text-primary">{p.purchaseNumber}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(p.date)}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{p.supplierName}</td>
                                        <td className="px-4 py-3 text-sm text-right">
                                            <Badge variant="secondary">{p.items?.length || 0}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium">{p.totalMeters?.toFixed(1)} m</td>
                                        <td className="px-4 py-3 text-sm text-right font-bold">{formatCurrency(p.totalAmount || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                            <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                                <Button size="sm" variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
