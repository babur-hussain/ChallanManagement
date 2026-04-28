import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Download, FileText, PieChart, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ManagementReports = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Management Reports</h1>
                    <p className="text-muted-foreground">Generate P&L, Balance Sheet, and Tax obligations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:border-primary cursor-pointer transition-colors">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="bg-primary/10 p-3 rounded-full"><PieChart className="w-6 h-6 text-primary" /></div>
                        <h3 className="font-semibold">Profit & Loss (P&L)</h3>
                        <p className="text-xs text-muted-foreground">Income, Expenses and Net Margin summary</p>
                    </CardContent>
                </Card>
                <Card className="hover:border-primary cursor-pointer transition-colors">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="bg-primary/10 p-3 rounded-full"><FileText className="w-6 h-6 text-primary" /></div>
                        <h3 className="font-semibold">Balance Sheet</h3>
                        <p className="text-xs text-muted-foreground">Assets, Liabilities, and Equity overview</p>
                    </CardContent>
                </Card>
                <Card className="hover:border-primary cursor-pointer transition-colors">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="bg-primary/10 p-3 rounded-full"><FileText className="w-6 h-6 text-primary" /></div>
                        <h3 className="font-semibold">Trial Balance</h3>
                        <p className="text-xs text-muted-foreground">Ledger closing balances verification</p>
                    </CardContent>
                </Card>
                <Card className="hover:border-primary cursor-pointer transition-colors">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="bg-primary/10 p-3 rounded-full"><FileText className="w-6 h-6 text-primary" /></div>
                        <h3 className="font-semibold">GST Register</h3>
                        <p className="text-xs text-muted-foreground">Input / Output GST payable report</p>
                    </CardContent>
                </Card>
            </div>

            {/* P&L Snapshot viewer */}
            <Card className="mt-8">
                <CardHeader className="border-b flex flex-row items-center justify-between">
                    <CardTitle>Profit & Loss - April 2026</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1"><Printer className="w-4 h-4" /> Print</Button>
                        <Button variant="outline" size="sm" className="gap-1"><Download className="w-4 h-4" /> Export PDF</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-lg">Sales Revenue</span>
                        <span className="font-semibold text-lg text-success">₹42,00,000</span>
                    </div>

                    <div className="space-y-2 pl-4">
                        <div className="flex justify-between"><span className="text-muted-foreground text-sm">Purchase Accounts</span><span>₹28,00,000</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground text-sm">Discounts & Returns</span><span>₹40,000</span></div>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold text-lg">Gross Profit</span>
                        <span className="font-semibold text-lg text-primary">₹13,60,000</span>
                    </div>

                    <div className="flex justify-between font-bold text-xl pt-4">
                        <span>Net Profit</span>
                        <span className="text-primary">₹3,42,000</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
