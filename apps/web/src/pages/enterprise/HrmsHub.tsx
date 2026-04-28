import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, Download } from 'lucide-react';

export const HrmsHub = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">HRMS Core</h1>
                    <p className="text-muted-foreground">Manage employees, track attendance, and process payroll engines.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export Payroll Sheet</Button>
                    <Button className="gap-2"><UserPlus className="w-4 h-4" /> Onboard Staff</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Pipeline Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="p-3 text-left font-medium text-muted-foreground">Employee</th>
                                        <th className="p-3 text-left font-medium text-muted-foreground">Branch</th>
                                        <th className="p-3 text-left font-medium text-muted-foreground">Check-in time</th>
                                        <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t">
                                        <td className="p-3 font-medium">Rajesh Kumar <span className="block text-xs text-muted-foreground">EMP-012</span></td>
                                        <td className="p-3">Surat HO</td>
                                        <td className="p-3 font-semibold">08:55 AM (On Time)</td>
                                        <td className="p-3"><Badge variant="success">Present</Badge></td>
                                    </tr>
                                    <tr className="border-t bg-secondary/10">
                                        <td className="p-3 font-medium">Priya Sharma <span className="block text-xs text-muted-foreground">EMP-088</span></td>
                                        <td className="p-3">Mumbai Branch</td>
                                        <td className="p-3 font-semibold text-warning">09:40 AM (Late)</td>
                                        <td className="p-3"><Badge variant="warning">Late Entry</Badge></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payroll Run (M-1)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <div className="space-y-1">
                                    <p className="font-semibold">Sumit Traders <Badge className="ml-2">SALES</Badge></p>
                                    <p className="text-xs text-muted-foreground">Salary: ₹35,000 | Commissions: +₹12,400</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary text-lg">₹47,400</p>
                                    <Button size="sm" variant="link">Generate Slip</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
