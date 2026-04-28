import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAdjustments, useCreateAdjustment, useStockSummary } from '@/hooks/api/useInventory';
import { formatDate } from '@textilepro/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SlidersHorizontal, Plus } from 'lucide-react';
import { FormModal } from '@/components/shared/FormModal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function AdjustmentsView() {
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const { data, isLoading } = useAdjustments({ page, limit: 20 });
    const createAdjustment = useCreateAdjustment();

    const adjustments = data?.data || [];
    const pagination = data?.pagination;

    return (
        <>
            <PageHeader
                title="Stock Adjustments"
                description="Manual stock corrections for discrepancies, shrinkage, or wastage."
                actions={
                    <Button size="sm" onClick={() => setShowModal(true)}>
                        <Plus className="mr-2 h-4 w-4" /> New Adjustment
                    </Button>
                }
            />

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-lg border" />)}
                </div>
            ) : adjustments.length === 0 ? (
                <div className="text-center py-12 bg-muted/10 rounded-lg">
                    <SlidersHorizontal className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-3" />
                    <p className="text-muted-foreground">No adjustments recorded yet.</p>
                    <Button size="sm" className="mt-4" onClick={() => setShowModal(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Make First Adjustment
                    </Button>
                </div>
            ) : (
                <>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/30 text-xs text-muted-foreground uppercase">
                                    <th className="text-left px-4 py-3 font-medium">Date</th>
                                    <th className="text-left px-4 py-3 font-medium">Item</th>
                                    <th className="text-center px-4 py-3 font-medium">Direction</th>
                                    <th className="text-right px-4 py-3 font-medium">Quantity</th>
                                    <th className="text-right px-4 py-3 font-medium">Before</th>
                                    <th className="text-right px-4 py-3 font-medium">After</th>
                                    <th className="text-left px-4 py-3 font-medium">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {adjustments.map((a: any) => {
                                    const itemInfo = a.itemId && typeof a.itemId === 'object' ? a.itemId : null;
                                    return (
                                        <tr key={a._id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(a.date)}</td>
                                            <td className="px-4 py-3 text-sm font-medium">{itemInfo?.name || 'Item'}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant={a.direction === 'IN' ? 'default' : 'destructive'}>
                                                    {a.direction === 'IN' ? '▲ IN' : '▼ OUT'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium">{a.meters?.toFixed(1)}</td>
                                            <td className="px-4 py-3 text-sm text-right text-muted-foreground">{a.balanceBefore?.toFixed(1)}</td>
                                            <td className="px-4 py-3 text-sm text-right font-semibold">{a.balanceAfter?.toFixed(1)}</td>
                                            <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">{a.notes || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                            <span>Page {pagination.page} of {pagination.totalPages}</span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                                <Button size="sm" variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <AdjustModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={async (data) => {
                    await createAdjustment.mutateAsync(data);
                    setShowModal(false);
                }}
                isLoading={createAdjustment.isPending}
            />
        </>
    );
}

function AdjustModal({ isOpen, onClose, onSubmit, isLoading }: {
    isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; isLoading: boolean;
}) {
    const { data: stockItems } = useStockSummary();
    const [itemId, setItemId] = useState('');
    const [newQuantity, setNewQuantity] = useState(0);
    const [reason, setReason] = useState('');

    const selectedItem = stockItems?.find(s => s.itemId === itemId);

    const handleSubmit = () => {
        if (!itemId || !reason) return;
        onSubmit({ itemId, newQuantity, reason });
    };

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Stock Adjustment" description="Correct stock discrepancies manually." isLoading={isLoading} className="sm:max-w-[500px]">
            <div className="space-y-4 pb-4">
                <div className="space-y-1.5">
                    <Label>Select Item *</Label>
                    <Select value={itemId} onValueChange={setItemId}>
                        <SelectTrigger><SelectValue placeholder="Choose an item" /></SelectTrigger>
                        <SelectContent>
                            {stockItems?.map(s => (
                                <SelectItem key={s.itemId} value={s.itemId}>{s.itemName} (Current: {s.currentStock.toFixed(0)}m)</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedItem && (
                    <div className="bg-muted/30 rounded-lg p-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Stock</span>
                            <span className="font-bold">{selectedItem.currentStock.toFixed(1)} m</span>
                        </div>
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label>New Quantity (meters) *</Label>
                    <Input type="number" value={newQuantity || ''} onChange={e => setNewQuantity(Number(e.target.value))} placeholder="Enter the corrected quantity" />
                </div>

                <div className="space-y-1.5">
                    <Label>Reason *</Label>
                    <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Physical count mismatch, wastage, damaged" />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !itemId || !reason}>
                        {isLoading ? 'Adjusting...' : 'Apply Adjustment'}
                    </Button>
                </div>
            </div>
        </FormModal>
    );
}
