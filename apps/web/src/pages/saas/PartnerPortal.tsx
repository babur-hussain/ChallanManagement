import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Network, ArrowUpRight } from 'lucide-react';

export const PartnerPortal = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Affiliate Partner Hub</h1>
                    <p className="text-muted-foreground">Manage your custom invite links and track commission flow.</p>
                </div>
                <div className="flex gap-2">
                    <Button className="gap-2"><Network className="w-4 h-4" /> Register Sub-Partner</Button>
                </div>
            </div>

            <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6 flex justify-between items-center">
                    <div>
                        <p className="text-primary-foreground/80 text-sm">Your Monthly Commission Payout</p>
                        <p className="text-4xl font-bold mt-1">₹45,200 <span className="text-sm font-normal">due Oct 1st</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-primary-foreground/80 text-sm">Active MRR Referred</p>
                        <p className="text-2xl font-bold">₹2,26,000</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Referred Clients (Active)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Client Name</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Sub Date</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Plan Level</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Your Cut</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t hover:bg-muted/50">
                                    <td className="p-3 font-semibold">Tirupati Balaji Textiles</td>
                                    <td className="p-3">2026-09-12</td>
                                    <td className="p-3"><Badge>PRO</Badge></td>
                                    <td className="p-3 text-success font-semibold">₹1,200 / mo</td>
                                    <td className="p-3 text-right"><Button variant="ghost" size="sm"><ArrowUpRight className="w-4 h-4" /></Button></td>
                                </tr>
                                <tr className="border-t hover:bg-muted/50">
                                    <td className="p-3 font-semibold">Omkar Saree Center</td>
                                    <td className="p-3">2026-09-15</td>
                                    <td className="p-3"><Badge variant="outline">GROWTH</Badge></td>
                                    <td className="p-3 text-success font-semibold">₹600 / mo</td>
                                    <td className="p-3 text-right"><Button variant="ghost" size="sm"><ArrowUpRight className="w-4 h-4" /></Button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
