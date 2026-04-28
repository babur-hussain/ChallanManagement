import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Link2 } from 'lucide-react';

export const BranchesManager = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Branches & Factories</h1>
                    <p className="text-muted-foreground">Manage your group's geographical locations and warehouses.</p>
                </div>
                <div className="flex gap-2">
                    <Button className="gap-2"><Plus className="w-4 h-4" /> Add New Branch</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Branches</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Code</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Branch Name</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Type</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Location</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Manager</th>
                                    <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t hover:bg-muted/50">
                                    <td className="p-3 font-semibold text-primary">HO-001</td>
                                    <td className="p-3 font-medium">Surat Head Office</td>
                                    <td className="p-3"><Badge variant="default">HEAD_OFFICE</Badge></td>
                                    <td className="p-3">Ring Road, Surat</td>
                                    <td className="p-3 text-muted-foreground"><Link2 className="w-3 h-3 inline mr-1" /> Mukesh Ambani</td>
                                    <td className="p-3"><Badge variant="success">Active</Badge></td>
                                </tr>
                                <tr className="border-t hover:bg-muted/50">
                                    <td className="p-3 font-semibold text-primary">WH-002</td>
                                    <td className="p-3 font-medium">Ahmedabad Whse</td>
                                    <td className="p-3"><Badge variant="secondary">WAREHOUSE</Badge></td>
                                    <td className="p-3">Sarkhej, Ahmedabad</td>
                                    <td className="p-3 text-muted-foreground"><Link2 className="w-3 h-3 inline mr-1" /> Rahul Desai</td>
                                    <td className="p-3"><Badge variant="success">Active</Badge></td>
                                </tr>
                                <tr className="border-t hover:bg-muted/50">
                                    <td className="p-3 font-semibold text-primary">BR-005</td>
                                    <td className="p-3 font-medium">Mumbai Branch</td>
                                    <td className="p-3"><Badge variant="default" className="bg-orange-500">SALES_OFFICE</Badge></td>
                                    <td className="p-3">Dadar, Mumbai</td>
                                    <td className="p-3 text-muted-foreground"><Link2 className="w-3 h-3 inline mr-1" /> Suresh Patni</td>
                                    <td className="p-3"><Badge variant="success">Active</Badge></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
