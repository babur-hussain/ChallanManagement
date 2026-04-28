import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AuditLogsPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Security & Audit Logs</h1>
                <p className="text-muted-foreground">Immutable action logs mapped by User and IP Address.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Action Trail</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Timestamp</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">User</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Action</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Module</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Description</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t hover:bg-muted/50 font-mono text-xs">
                                    <td className="p-3">2026-04-25T10:15:22Z</td>
                                    <td className="p-3 text-primary">Mukesh_A</td>
                                    <td className="p-3"><Badge>LOGIN</Badge></td>
                                    <td className="p-3">AUTH</td>
                                    <td className="p-3">User authenticated successfully via OTP.</td>
                                    <td className="p-3">103.22.45.10</td>
                                </tr>
                                <tr className="border-t hover:bg-muted/50 font-mono text-xs">
                                    <td className="p-3">2026-04-25T11:02:10Z</td>
                                    <td className="p-3 text-primary">Rahul_D</td>
                                    <td className="p-3"><Badge variant="destructive">UPDATE</Badge></td>
                                    <td className="p-3">QUOTATION</td>
                                    <td className="p-3">Modified Quotation QT-802 subtotal to ₹4,50,000</td>
                                    <td className="p-3">192.168.1.44</td>
                                </tr>
                                <tr className="border-t hover:bg-muted/50 font-mono text-xs">
                                    <td className="p-3">2026-04-25T11:05:00Z</td>
                                    <td className="p-3 text-purple-600">SYS_AI</td>
                                    <td className="p-3"><Badge variant="secondary">AI_ACTION</Badge></td>
                                    <td className="p-3">WORKFLOW</td>
                                    <td className="p-3">Interceptor blocked QT-802 due to discount limit violation and pushed to Approvals DB.</td>
                                    <td className="p-3">internal</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
