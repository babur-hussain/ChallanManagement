import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { useDispatches } from '@/hooks/api/useInventory';
import { formatDate } from '@textilepro/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';

export function DispatchesView() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading } = useDispatches({ page, limit: 20, search });

    const dispatches = data?.data || [];
    const pagination = data?.pagination;

    const statusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'DELIVERED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'IN_TRANSIT': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'DRAFT': return 'bg-muted text-muted-foreground';
            case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <>
            <PageHeader
                title="Sales Dispatch"
                description="Outbound deliveries tracked from your challans."
            />

            <div className="mb-6">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by challan number or party..."
                    className="max-w-md"
                />
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-lg border" />)}
                </div>
            ) : dispatches.length === 0 ? (
                <div className="text-center py-12 bg-muted/10 rounded-lg">
                    <Truck className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-3" />
                    <p className="text-muted-foreground">No dispatch records found. Create challans to see outbound dispatch data here.</p>
                </div>
            ) : (
                <>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/30 text-xs text-muted-foreground uppercase">
                                    <th className="text-left px-4 py-3 font-medium">Challan #</th>
                                    <th className="text-left px-4 py-3 font-medium">Date</th>
                                    <th className="text-left px-4 py-3 font-medium">Party</th>
                                    <th className="text-right px-4 py-3 font-medium">Items</th>
                                    <th className="text-right px-4 py-3 font-medium">Total Qty</th>
                                    <th className="text-center px-4 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {dispatches.map((d: any) => (
                                    <tr key={d._id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm font-medium text-primary">{d.challanNumber}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(d.date)}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{d.partyName}</td>
                                        <td className="px-4 py-3 text-sm text-right">
                                            <Badge variant="secondary">{d.items?.length || 0}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium">{d.totalQuantity?.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor(d.status)}`}>
                                                {d.status}
                                            </span>
                                        </td>
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
