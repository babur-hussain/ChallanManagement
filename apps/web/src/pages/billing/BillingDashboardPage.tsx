import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, FileSpreadsheet, FileBarChart, Download, Plus, Target, CheckCircle2, Search, ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';
import { useInvoices } from '@/hooks/api/useInvoices';
import { formatINR, formatIndianDate, type IInvoice } from '@textilepro/shared';

// Pre-calculated mock totals for the dashboard 
// In production, these should ideally come from a dedicated /api/v1/billing/summary endpoint
const gstSummary = {
    totalSales: 1250450.00,
    totalOutputTax: 98750.50,
    cgst: 49375.25,
    sgst: 49375.25,
    igst: 0,
    totalPurchases: 450200.00,
    totalInputTax: 22510.00,
};

export function BillingDashboardPage() {
    const [period, setPeriod] = useState('current_month');
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch recent invoices as mock outward supplies (GSTR-1)
    const { data: invoicesData, isLoading: isLoadingInvoices } = useInvoices({ page: 1, limit: 10 });
    const invoices: IInvoice[] = (invoicesData as any)?.data?.data || [];

    // Filter invoices locally for demo
    const filteredInvoices = invoices.filter((inv) =>
        inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.partySnapshot as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const kpiCards = [
        {
            title: 'Gross Taxable Value',
            value: formatINR(gstSummary.totalSales),
            trend: '+12.5%',
            trendUp: true,
            description: 'Compared to last month',
            icon: Receipt,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
        },
        {
            title: 'Total Output Tax (GST)',
            value: formatINR(gstSummary.totalOutputTax),
            trend: '+11.2%',
            trendUp: true,
            description: 'CGST + SGST + IGST Collected',
            icon: IndianRupee,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100',
        },
        {
            title: 'Input Tax Credit (ITC)',
            value: formatINR(gstSummary.totalInputTax),
            trend: '-2.4%',
            trendUp: false,
            description: 'From inward purchases',
            icon: ArrowDownRight,
            color: 'text-rose-600',
            bgColor: 'bg-rose-100',
        },
        {
            title: 'Net GST Liability',
            value: formatINR(gstSummary.totalOutputTax - gstSummary.totalInputTax),
            description: 'Estimated payout this period',
            icon: Target,
            color: 'text-amber-600',
            bgColor: 'bg-amber-100',
        },
    ];

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">

            {/* ─── Header ─── */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing & GST</h1>
                    <p className="text-muted-foreground mt-1">Manage tax compliances, GSTR reports, and e-Way bills.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="current_month">Current Month</SelectItem>
                            <SelectItem value="last_month">Last Month</SelectItem>
                            <SelectItem value="q1">Q1 (Apr - Jun)</SelectItem>
                            <SelectItem value="q2">Q2 (Jul - Sep)</SelectItem>
                            <SelectItem value="q3">Q3 (Oct - Dec)</SelectItem>
                            <SelectItem value="q4">Q4 (Jan - Mar)</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Export Return
                    </Button>
                </div>
            </div>

            {/* ─── KPI Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <Card key={idx} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between space-y-0 pb-4">
                                    <p className="text-sm font-medium text-muted-foreground tracking-tight">{kpi.title}</p>
                                    <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                                        <Icon className={`w-4 h-4 ${kpi.color}`} />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold font-mono tracking-tight">{kpi.value}</div>
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center">
                                        {kpi.trend && (
                                            <span className={`mr-2 font-medium ${kpi.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {kpi.trend}
                                            </span>
                                        )}
                                        {kpi.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* ─── Tabs Section ─── */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="px-6 pt-6 border-b border-border bg-slate-50/50">
                    <TabsList className="bg-transparent space-x-6">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="gstr1"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3"
                        >
                            GSTR-1 (Outward)
                        </TabsTrigger>
                        <TabsTrigger
                            value="gstr2"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3"
                        >
                            GSTR-2 (Inward)
                        </TabsTrigger>
                        <TabsTrigger
                            value="eway"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3"
                        >
                            E-Way Bills
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 mt-0 outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            <Card className="col-span-1 lg:col-span-2 shadow-none border-border">
                                <CardHeader>
                                    <CardTitle>Tax Collection Splits (Output Tax)</CardTitle>
                                    <CardDescription>Breakdown by central and state authorities</CardDescription>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between gap-8 py-8">
                                    <div className="flex-1 space-y-6">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium text-slate-600">CGST (Central Tax)</span>
                                                <span className="font-mono">{formatINR(gstSummary.cgst)}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-blue-500 h-full w-[50%]" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium text-slate-600">SGST (State Tax)</span>
                                                <span className="font-mono">{formatINR(gstSummary.sgst)}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-teal-500 h-full w-[50%]" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium text-slate-600">IGST (Inter-state Tax)</span>
                                                <span className="font-mono">{formatINR(gstSummary.igst)}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-purple-500 h-full w-[0%]" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="col-span-1 shadow-none border-border bg-slate-50/50">
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button variant="outline" className="w-full justify-start h-12 bg-white">
                                        <FileSpreadsheet className="w-4 h-4 mr-3 text-emerald-600" />
                                        Download JSON for GST Portal
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start h-12 bg-white">
                                        <FileBarChart className="w-4 h-4 mr-3 text-indigo-600" />
                                        Reconcile GSTR-2B
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start h-12 bg-white">
                                        <Plus className="w-4 h-4 mr-3 text-slate-600" />
                                        Add Purchase Invoice (ITC)
                                    </Button>
                                </CardContent>
                            </Card>

                        </div>
                    </TabsContent>

                    {/* GSTR-1 Tab */}
                    <TabsContent value="gstr1" className="mt-0 outline-none">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold">B2B Outward Supplies</h3>
                                <p className="text-sm text-muted-foreground">List of valid sales invoices generated in this period.</p>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search invoices..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border border-border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Party Name / GSTIN</TableHead>
                                        <TableHead className="text-right">Taxable Val</TableHead>
                                        <TableHead className="text-right">GST</TableHead>
                                        <TableHead className="text-right">Total Amount</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingInvoices ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading invoices...</TableCell>
                                        </TableRow>
                                    ) : filteredInvoices.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No invoices found for this period.</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredInvoices.map((inv) => (
                                            <TableRow key={inv._id}>
                                                <TableCell className="font-medium text-emerald-700">{inv.invoiceNumber}</TableCell>
                                                <TableCell>{formatIndianDate(inv.invoiceDate)}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{(inv.partySnapshot as any)?.name}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{(inv.partySnapshot as any)?.gstin || 'Unregistered'}</div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">{formatINR(inv.subtotal || 0)}</TableCell>
                                                <TableCell className="text-right font-mono text-slate-600">{formatINR(inv.totalGst || 0)}</TableCell>
                                                <TableCell className="text-right font-mono font-medium">{formatINR(inv.finalAmount || 0)}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={inv.status === 'CANCELLED' ? 'destructive' : 'default'} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 shadow-none">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Ready
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* GSTR-2 Tab (Placeholder) */}
                    <TabsContent value="gstr2" className="mt-0 outline-none">
                        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-slate-50">
                            <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold">Inward Supplies (GSTR-2B)</h3>
                            <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                                Purchase invoices and Input Tax Credit (ITC) tracking will be managed here.
                            </p>
                            <Button>Add Purchase Record</Button>
                        </div>
                    </TabsContent>

                    {/* E-Way Bills (Placeholder) */}
                    <TabsContent value="eway" className="mt-0 outline-none">
                        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-slate-50">
                            <span className="text-4xl mb-4">🚛</span>
                            <h3 className="text-lg font-bold">E-Way Bills Management</h3>
                            <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                                Automatically generate and track E-Way bills for consignments exceeding ₹50,000.
                            </p>
                            <Button variant="secondary">Configure E-Way Bill Integration</Button>
                        </div>
                    </TabsContent>

                </div>
            </Tabs>
        </div>
    );
}
