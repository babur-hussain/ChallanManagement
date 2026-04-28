import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { useTransfers, useCreateTransfer } from '@/hooks/api/useInventory';
import { useStockSummary } from '@/hooks/api/useInventory';
import { formatDate } from '@textilepro/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, Plus, X } from 'lucide-react';
import { FormModal } from '@/components/shared/FormModal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function TransfersView() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const { data, isLoading } = useTransfers({ page, limit: 20, search });
    const createTransfer = useCreateTransfer();

    const transfers = data?.data || [];
    const pagination = data?.pagination;

    return (
        <>
            <PageHeader
                title="Warehouse Transfers"
                description="Move inventory between warehouses with full audit trail."
                actions={
                    <Button size="sm" onClick={() => setShowModal(true)}>
                        <Plus className="mr-2 h-4 w-4" /> New Transfer
                    </Button>
                }
            />

            <div className="mb-6">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search transfers..."
                    className="max-w-md"
                />
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-lg border" />)}
                </div>
            ) : transfers.length === 0 ? (
                <div className="text-center py-12 bg-muted/10 rounded-lg">
                    <ArrowRightLeft className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-3" />
                    <p className="text-muted-foreground">No transfers recorded yet.</p>
                    <Button size="sm" className="mt-4" onClick={() => setShowModal(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create First Transfer
                    </Button>
                </div>
            ) : (
                <>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/30 text-xs text-muted-foreground uppercase">
                                    <th className="text-left px-4 py-3 font-medium">Transfer #</th>
                                    <th className="text-left px-4 py-3 font-medium">Date</th>
                                    <th className="text-left px-4 py-3 font-medium">From</th>
                                    <th className="text-left px-4 py-3 font-medium">To</th>
                                    <th className="text-right px-4 py-3 font-medium">Items</th>
                                    <th className="text-right px-4 py-3 font-medium">Total Qty</th>
                                    <th className="text-center px-4 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transfers.map((t: any) => (
                                    <tr key={t._id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-sm font-medium text-primary">{t.transferNumber}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(t.date)}</td>
                                        <td className="px-4 py-3 text-sm">{t.fromWarehouseName}</td>
                                        <td className="px-4 py-3 text-sm">{t.toWarehouseName}</td>
                                        <td className="px-4 py-3 text-sm text-right">
                                            <Badge variant="secondary">{t.items?.length || 0}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium">{t.totalQuantity?.toFixed(1)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge variant={t.status === 'COMPLETED' ? 'default' : 'secondary'}>{t.status}</Badge>
                                        </td>
                                    </tr>
                                ))}
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

            <TransferModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={async (data) => {
                    await createTransfer.mutateAsync(data);
                    setShowModal(false);
                }}
                isLoading={createTransfer.isPending}
            />
        </>
    );
}

function TransferModal({ isOpen, onClose, onSubmit, isLoading }: {
    isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; isLoading: boolean;
}) {
    const { data: stockItems } = useStockSummary();
    const [fromWarehouse, setFromWarehouse] = useState('Main Warehouse');
    const [toWarehouse, setToWarehouse] = useState('');
    const [items, setItems] = useState<{ itemId: string; itemName: string; quantity: number }[]>([]);
    const [remarks, setRemarks] = useState('');

    const addItem = () => {
        setItems([...items, { itemId: '', itemName: '', quantity: 0 }]);
    };

    const removeItem = (idx: number) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    const updateItem = (idx: number, field: string, value: any) => {
        const updated = [...items];
        if (field === 'itemId') {
            const found = stockItems?.find(s => s.itemId === value);
            updated[idx] = { ...updated[idx], itemId: value, itemName: found?.itemName || '' };
        } else {
            (updated[idx] as any)[field] = value;
        }
        setItems(updated);
    };

    const handleSubmit = () => {
        if (!toWarehouse || items.length === 0) return;
        onSubmit({
            date: new Date().toISOString(),
            fromWarehouseId: 'main',
            fromWarehouseName: fromWarehouse,
            toWarehouseId: 'branch',
            toWarehouseName: toWarehouse,
            remarks,
            items: items.filter(i => i.itemId && i.quantity > 0),
        });
    };

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="New Transfer" description="Move stock between warehouses." isLoading={isLoading} className="sm:max-w-[650px]">
            <div className="space-y-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>From Warehouse</Label>
                        <Input value={fromWarehouse} onChange={e => setFromWarehouse(e.target.value)} placeholder="Main Warehouse" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>To Warehouse *</Label>
                        <Input value={toWarehouse} onChange={e => setToWarehouse(e.target.value)} placeholder="Branch Name" />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <Label>Items</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addItem}>
                            <Plus className="mr-1 h-3 w-3" /> Add Item
                        </Button>
                    </div>
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">Click "Add Item" to start adding items to transfer.</p>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <Select value={item.itemId} onValueChange={(v) => updateItem(idx, 'itemId', v)}>
                                            <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                                            <SelectContent>
                                                {stockItems?.map(s => (
                                                    <SelectItem key={s.itemId} value={s.itemId}>{s.itemName} ({s.currentStock.toFixed(0)}m)</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-28">
                                        <Input type="number" placeholder="Qty" value={item.quantity || ''} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                                    </div>
                                    <Button type="button" size="icon" variant="ghost" onClick={() => removeItem(idx)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label>Remarks</Label>
                    <Input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional notes" />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading || items.length === 0 || !toWarehouse}>
                        {isLoading ? 'Processing...' : 'Create Transfer'}
                    </Button>
                </div>
            </div>
        </FormModal>
    );
}
