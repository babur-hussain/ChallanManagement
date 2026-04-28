import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, AlertTriangle, IndianRupee } from 'lucide-react';

export const SaaSDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">SaaS Command Center</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</p>
                                <p className="text-2xl font-bold text-success">₹12.4 L</p>
                            </div>
                            <div className="p-2 bg-success/10 rounded-lg"><IndianRupee className="w-5 h-5 text-success" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Active Businesses</p>
                                <p className="text-2xl font-bold">1,402</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Churn Rate</p>
                                <p className="text-2xl font-bold text-destructive">2.4%</p>
                            </div>
                            <div className="p-2 bg-destructive/10 rounded-lg"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Trial Conversion</p>
                                <p className="text-2xl font-bold">48%</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="w-5 h-5 text-primary" /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Enterprise Upgrades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <span className="font-semibold block">Mahavir Synthetics</span>
                                    <span className="text-xs text-muted-foreground">Upgraded: GROWTH → PRO</span>
                                </div>
                                <div>
                                    <Badge variant="success" className="mb-1">+ ₹6,000 / mo</Badge>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <span className="font-semibold block">Reliance Weavers Hub</span>
                                    <span className="text-xs text-muted-foreground">Upgraded: PRO → ENTERPRISE</span>
                                </div>
                                <div>
                                    <Badge variant="success" className="mb-1">+ ₹24,000 / mo</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dunning & Failed Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-sm">Surat Trading Co. <Badge variant="destructive" className="ml-2">PAST DUE</Badge></p>
                                    <p className="text-xs text-muted-foreground mt-1">₹4,500 Failed (Card Expired)</p>
                                </div>
                                <button className="text-xs bg-primary text-white px-2 py-1 rounded">Retry Trigger</button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
