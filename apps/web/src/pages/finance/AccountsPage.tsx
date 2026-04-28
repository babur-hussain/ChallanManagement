import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AccountsPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Accounts & Ledgers</h1>
                    <p className="text-muted-foreground">Manage your banking and general ledger journals.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2"><Building className="w-4 h-4" /> Add Bank</Button>
                    <Button className="gap-2"><Plus className="w-4 h-4" /> Manual Journal</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bank Accounts Section */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Building className="w-5 h-5" /> Connected Banks</h3>
                    <Card className="bg-primary/5 border-primary/20 cursor-pointer">
                        <CardContent className="p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="font-bold">HDFC Bank Current</span>
                                <Badge variant="success">Syncing</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">A/C: ****4502</p>
                            <div className="text-xl font-bold pt-2">₹14,50,000</div>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:shadow-md">
                        <CardContent className="p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="font-bold">SBI Cash Credit</span>
                                <Badge variant="secondary">Manual</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">A/C: ****9912</p>
                            <div className="text-xl font-bold pt-2 text-destructive">-₹2,10,000</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Journal Entries Section */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><BookOpen className="w-5 h-5" /> General Ledger</h3>
                    <Card>
                        <CardContent className="p-0">
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                                            <th className="p-3 text-left font-medium text-muted-foreground">Voucher</th>
                                            <th className="p-3 text-left font-medium text-muted-foreground">Narration</th>
                                            <th className="p-3 text-right font-medium text-muted-foreground">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-t hover:bg-muted/50">
                                            <td className="p-3">25-Apr-2026</td>
                                            <td className="p-3"><Badge>SALES</Badge> VCH-1002</td>
                                            <td className="p-3 font-medium">To Sales Invoice INV-080</td>
                                            <td className="p-3 text-right font-semibold">₹45,000</td>
                                        </tr>
                                        <tr className="border-t hover:bg-muted/50 bg-secondary/10">
                                            <td className="p-3">24-Apr-2026</td>
                                            <td className="p-3"><Badge variant="destructive">EXPENSE</Badge> VCH-1001</td>
                                            <td className="p-3 font-medium">Paid Electricity Bill</td>
                                            <td className="p-3 text-right font-semibold text-destructive">₹18,500</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
