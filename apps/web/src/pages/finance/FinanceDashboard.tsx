import React from 'react';
import { IndianRupee, TrendingUp, AlertTriangle, Building, CreditCard, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const FinanceDashboard = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Finance Command Center</h1>
                <p className="text-muted-foreground">Real-time accounting, profit analysis, and AI cashflow insights.</p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Bank Balance</p>
                                <p className="text-2xl font-bold text-primary">₹14,50,000</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-lg"><Building className="w-5 h-5 text-primary" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Cash out in Market (AR)</p>
                                <p className="text-2xl font-bold text-success">₹8,45,200</p>
                            </div>
                            <div className="p-2 bg-success/10 rounded-lg"><TrendingUp className="w-5 h-5 text-success" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Payables (AP)</p>
                                <p className="text-2xl font-bold text-destructive">₹2,30,000</p>
                            </div>
                            <div className="p-2 bg-destructive/10 rounded-lg"><CreditCard className="w-5 h-5 text-destructive" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Net Profit (MTD)</p>
                                <p className="text-2xl font-bold text-primary">₹3,42,000</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-lg"><Banknote className="w-5 h-5 text-primary" /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AI Warning Row */}
            <Card className="border-l-4 border-l-destructive bg-destructive/5">
                <CardContent className="p-4 flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-destructive mb-1">AI Risk Alert</h4>
                        <p className="text-sm text-foreground/80">
                            Invoice INV-2024-081 has a &gt;15% discount deviation. Please review salesman approval.
                        </p>
                        <p className="text-sm text-foreground/80 mt-1">
                            Cashflow forecast predicts shortage of ₹3,00,000 in Next 30 Days due to vendor due dates.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Charts & Profit Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Cashflow Forecast</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-end justify-between px-6 pb-6 gap-2">
                        <div className="flex flex-col items-center gap-2 w-1/3">
                            <div className="w-full bg-success/80 rounded-t-lg" style={{ height: '60%' }}></div>
                            <span className="text-xs font-semibold">Next 7 Days</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 w-1/3">
                            <div className="w-full bg-destructive/80 rounded-t-lg" style={{ height: '80%' }}></div>
                            <span className="text-xs font-semibold">Next 30 Days</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 w-1/3">
                            <div className="w-full bg-success/80 rounded-t-lg" style={{ height: '100%' }}></div>
                            <span className="text-xs font-semibold">Next 90 Days</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Profit by Party</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-semibold text-sm">Sagar Textiles</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm">₹90,000</span>
                                    <Badge variant="success">20% Margin</Badge>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-semibold text-sm">Mahavir Fab</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm">₹60,000</span>
                                    <Badge variant="success">18.7% Margin</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
