import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useDashboard } from '@/hooks/api/useAnalytics';
import { formatCurrency, formatDate } from '@textilepro/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Truck, IndianRupee, AlertTriangle, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#6366f1', '#eab308'];

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <div className="p-8 space-y-4 animate-pulse">
      <div className="h-12 w-64 bg-muted rounded"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded"></div>)}
      </div>
      <div className="h-96 bg-muted rounded"></div>
    </div>;
  }

  if (!data) return <div>Failed to load dashboard</div>;

  return (
    <div className="container py-4 max-w-7xl animate-in fade-in-50 space-y-6">
      <PageHeader
        title="Business Overview"
        description="Real-time pulse of your operations, inventory, and cash flow."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Today's Challans</p>
              <Truck className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{data.todayChallansCount}</p>
              <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                <span>{data.todayChallansMeters.toFixed(1)}m sent</span>
                <span className={data.todayChallansMeters >= data.yesterdayChallansMeters ? 'text-green-600' : 'text-orange-600'}>
                  {data.yesterdayChallansMeters > 0 ? (
                    `${data.todayChallansMeters >= data.yesterdayChallansMeters ? '+' : ''}${Math.round(((data.todayChallansMeters - data.yesterdayChallansMeters) / data.yesterdayChallansMeters) * 100)}% vs yesterday`
                  ) : ''}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold uppercase text-muted-foreground">This Month Revenue</p>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{formatCurrency(data.thisMonthRevenue)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Previous: {formatCurrency(data.lastMonthRevenue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={data.totalOutstanding > (data.monthlyRevenueForOutstandingThreshold * 0.2) ? 'border-destructive/50 bg-destructive/5' : ''}>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Total Outstanding</p>
              <IndianRupee className={`h-4 w-4 ${data.totalOutstanding > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
            <div className="mt-2 text-destructive">
              <p className="text-2xl font-bold">{formatCurrency(data.totalOutstanding)}</p>
              <p className="mt-1 text-sm opacity-80 cursor-pointer hover:underline" onClick={() => navigate('/app/invoices')}>View Receivables →</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Low Stock SKUs</p>
              <AlertTriangle className={`h-4 w-4 ${data.lowStockItemsCount > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </div>
            <div className="mt-2">
              <p className={`text-2xl font-bold ${data.lowStockItemsCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>{data.lowStockItemsCount}</p>
              <p className="mt-1 text-sm text-muted-foreground cursor-pointer hover:underline" onClick={() => navigate('/app/inventory')}>Manage Inventory →</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Rev vs Collections Dual Line */}
        <Card className="lg:col-span-2">
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Revenue vs Collections (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueCollectionsChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value >= 100000 ? (value / 100000).toFixed(1) + 'L' : value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                    tick={{ fontSize: 12 }}
                  />
                  <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Legend />
                  <Area type="monotone" dataKey="invoiced" name="Invoiced Amount" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorInvoiced)" />
                  <Area type="monotone" dataKey="collected" name="Payments Received" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Quality Sales Mix */}
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Fabric Mix (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.qualityMixChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="meters"
                  >
                    {data.qualityMixChart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => `${Number(value).toFixed(1)} meters`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4 max-h-[120px] overflow-y-auto pr-2">
              {data.qualityMixChart.slice(0, 5).map((q: any, i: number) => (
                <div key={q.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="truncate max-w-[120px]">{q.name}</span>
                  </div>
                  <div>
                    <span className="font-medium">{q.meters}m</span>
                    <span className="text-xs text-muted-foreground ml-2">({q.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Parties */}
        <Card>
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-lg flex justify-between">
              Top 10 Buyers <span className="text-sm font-normal text-muted-foreground">{data.activePartiesThisMonth} active this month</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3 font-medium text-muted-foreground">Party Name</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Volume</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.topPartiesChart.map((party: any, i: number) => (
                  <tr key={party.partyId} className="hover:bg-muted/20 cursor-pointer" onClick={() => navigate(`/app/parties/${party.partyId}`)}>
                    <td className="p-3">
                      <div className="font-medium flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}.</span> {party.name}
                      </div>
                    </td>
                    <td className="p-3 text-right">{party.meters.toFixed(1)}m</td>
                    <td className="p-3 text-right font-medium text-primary">{formatCurrency(party.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.topPartiesChart.length === 0 && <p className="p-4 text-center text-muted-foreground">No dispatch activity this month.</p>}
          </CardContent>
        </Card>

        {/* Outstanding Aging */}
        <Card>
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-lg">Aged Receivables</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {data.outstandingAging.map((bucket: any, i: number) => {
                const total = data.totalOutstanding;
                const pct = total > 0 ? (bucket.amount / total) * 100 : 0;
                // color scaling from blue to deep red based on bucket index
                const barColors = ['bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-600'];
                return (
                  <div key={bucket.bucket}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{bucket.bucket}</span>
                      <span className="font-bold">{formatCurrency(bucket.amount)}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${barColors[i]}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 pt-4 border-t">
              <Button className="w-full" variant="outline" onClick={() => navigate('/app/invoices?overdue=true')}>
                Action Overdue Accounts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
