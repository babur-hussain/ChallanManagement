import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export const ApprovalsInbox = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Management Approvals</h1>
                <p className="text-muted-foreground">Review high-risk transactions trapped by the workflow engine.</p>
            </div>

            <div className="space-y-4">
                <Card className="border-l-4 border-l-warning">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="warning">DISCOUNT_TRAP</Badge>
                                    <span className="text-sm font-semibold text-muted-foreground">Requested by: Rahul Desai</span>
                                    <span className="text-xs text-muted-foreground ml-4">10 mins ago</span>
                                </div>
                                <h3 className="text-xl font-bold">Unusual Discount on QT-802</h3>
                                <p className="text-sm text-foreground/80">Salesman provided 22% discount to Mahavir Fabrics (Allowed max is 10%). Total loss buffer is ₹45,000.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="destructive" className="gap-2"><XCircle className="w-4 h-4" /> Reject (Enforce limit)</Button>
                                <Button variant="success" className="gap-2"><CheckCircle2 className="w-4 h-4" /> Approve Exception</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-destructive">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="destructive">HIGH_EXPENSE</Badge>
                                    <span className="text-sm font-semibold text-muted-foreground">Requested by: Mukesh Ambani</span>
                                    <span className="text-xs text-muted-foreground ml-4">1 hour ago</span>
                                </div>
                                <h3 className="text-xl font-bold">Loom Machinery Purchase</h3>
                                <p className="text-sm text-foreground/80">Requested expense approval for ₹45,00,000 via Factory WH-002 account.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline"><AlertTriangle className="w-4 h-4 mr-2" /> Request Details</Button>
                                <Button className="gap-2"><CheckCircle2 className="w-4 h-4" /> Sign with OTP</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
