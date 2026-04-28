import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const CustomerSuccessHub = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Customer Success Desk</h1>
                <p className="text-muted-foreground">Predicts churn risk and handles incoming support queries.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Churn Risk Engine</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Business</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Health Score</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">State</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Negative Flags</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t bg-destructive/10">
                                    <td className="p-3 font-semibold">Galaxy Traders</td>
                                    <td className="p-3 text-xl font-bold text-destructive">35 / 100</td>
                                    <td className="p-3"><Badge variant="destructive">HIGH CHURN RISK</Badge></td>
                                    <td className="p-3 text-xs text-red-600">Past Due Sub • 3 CRITICAL tickets</td>
                                    <td className="p-3"><Button size="sm" variant="outline">Call Owner</Button></td>
                                </tr>
                                <tr className="border-t hover:bg-muted/50">
                                    <td className="p-3 font-semibold">Balaji Synthetics</td>
                                    <td className="p-3 text-xl font-bold text-warning">65 / 100</td>
                                    <td className="p-3"><Badge variant="warning">AT RISK</Badge></td>
                                    <td className="p-3 text-xs text-orange-600">Low Staff Adoption in last 7 days</td>
                                    <td className="p-3"><Button size="sm" variant="outline">Send Tutorials</Button></td>
                                </tr>
                                <tr className="border-t hover:bg-muted/50">
                                    <td className="p-3 font-semibold">Reliance Weavers</td>
                                    <td className="p-3 text-xl font-bold text-success">98 / 100</td>
                                    <td className="p-3"><Badge variant="success">HEALTHY</Badge></td>
                                    <td className="p-3 text-xs text-muted-foreground">No flags</td>
                                    <td className="p-3"><Button size="sm" variant="ghost">View Profile</Button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Open Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="bg-muted/20 border p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm">Issue with API Key Generation <Badge className="ml-2 bg-purple-600">DEVELOPER</Badge></p>
                                <p className="text-xs text-muted-foreground mt-1">Requested by: Mukesh A. • 1 hour ago</p>
                            </div>
                            <Button size="sm">Reply via Desk</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
