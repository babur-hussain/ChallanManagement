import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ExpensesPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Expenses & Bills</h1>
                    <p className="text-muted-foreground">Manage overheads, rent, salaries, and scan physical bills.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2"><Upload className="w-4 h-4" /> Scan Bill via OCR</Button>
                    <Button className="gap-2"><Plus className="w-4 h-4" /> Add Expense</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Category</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Vendor</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Amount</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t hover:bg-muted/50 cursor-pointer">
                                    <td className="p-3">25-Apr-2026</td>
                                    <td className="p-3 font-medium">ELECTRICITY</td>
                                    <td className="p-3 text-muted-foreground">Torrent Power</td>
                                    <td className="p-3 font-semibold">₹18,500</td>
                                    <td className="p-3"><Badge variant="default">Approved</Badge></td>
                                </tr>
                                <tr className="border-t hover:bg-muted/50 cursor-pointer">
                                    <td className="p-3">28-Apr-2026</td>
                                    <td className="p-3 font-medium">RENT</td>
                                    <td className="p-3 text-muted-foreground">RK Complex</td>
                                    <td className="p-3 font-semibold">₹45,000</td>
                                    <td className="p-3"><Badge variant="warning">Pending Approval</Badge></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
