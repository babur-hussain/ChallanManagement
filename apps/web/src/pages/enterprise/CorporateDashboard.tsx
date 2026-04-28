import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, IndianRupee, MapPin } from 'lucide-react';

export const CorporateDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Enterprise Command Center</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Branches</p>
                                <p className="text-2xl font-bold">14</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-lg"><Building2 className="w-5 h-5 text-primary" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Active Employees</p>
                                <p className="text-2xl font-bold">185</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Group Monthly Revenue</p>
                                <p className="text-2xl font-bold text-success">₹14.5 Cr</p>
                            </div>
                            <div className="p-2 bg-success/10 rounded-lg"><IndianRupee className="w-5 h-5 text-success" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Overall Attendance</p>
                                <p className="text-2xl font-bold">94%</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-lg"><MapPin className="w-5 h-5 text-primary" /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Branch Profit Ranking Matrix</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">1</div>
                                    <div><span className="font-semibold block">Surat Head Office</span><span className="text-xs text-muted-foreground">HO-001</span></div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold text-success">₹4.2 Cr</span>
                                    <Badge variant="success">Leader</Badge>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold">2</div>
                                    <div><span className="font-semibold block">Ahmedabad Whse</span><span className="text-xs text-muted-foreground">WH-002</span></div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold text-success">₹3.8 Cr</span>
                                    <Badge variant="outline">Growth</Badge>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold">5</div>
                                    <div><span className="font-semibold block">Mumbai Branch</span><span className="text-xs text-muted-foreground">BR-005</span></div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-semibold">₹85 L</span>
                                    <Badge variant="destructive">Needs Review</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>HQ Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <Badge variant="destructive" className="mb-1">EXPENSE</Badge>
                                    <p className="font-medium text-sm">Purchase of New Loom Machinery</p>
                                    <p className="text-xs text-red-600 mt-1">₹45,00,000 via Factory WH-002</p>
                                </div>
                            </div>
                            <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <Badge variant="warning" className="mb-1">DISCOUNT TRAP</Badge>
                                    <p className="font-medium text-sm">Quotation QT-802</p>
                                    <p className="text-xs text-orange-600 mt-1">Salesman requested 22% discounting.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
