import {
  FileText, Users, IndianRupee, Package,
  TrendingUp, ArrowUpRight, Clock, Scan
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { formatINR, formatIndianDate } from '@textilepro/shared';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════
// Dashboard Page
// ═══════════════════════════════════════════════════════════════

const stats = [
  {
    title: 'Total Challans',
    value: 247,
    change: '+12%',
    changeType: 'up' as const,
    icon: FileText,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Pending Deliveries',
    value: 18,
    change: '-3',
    changeType: 'down' as const,
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    title: 'Outstanding Amount',
    value: 1234567.89,
    isCurrency: true,
    change: '+8%',
    changeType: 'up' as const,
    icon: IndianRupee,
    color: 'text-textile-500',
    bgColor: 'bg-textile-500/10',
  },
  {
    title: 'Active Parties',
    value: 56,
    change: '+5',
    changeType: 'up' as const,
    icon: Users,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    title: 'Typing Hours Saved (OCR)',
    value: 124.5,
    change: '+15%',
    changeType: 'up' as const,
    icon: Scan,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

const recentChallans = [
  { id: 'DC-00247', party: 'Shree Ram Textiles', amount: 45600, status: 'DELIVERED', date: new Date() },
  { id: 'DC-00246', party: 'Krishna Fabrics', amount: 128750, status: 'IN_TRANSIT', date: new Date(Date.now() - 86400000) },
  { id: 'DC-00245', party: 'Nakoda Silk Mills', amount: 67200, status: 'DISPATCHED', date: new Date(Date.now() - 2 * 86400000) },
  { id: 'DC-00244', party: 'Gujarat Textile Hub', amount: 234100, status: 'CREATED', date: new Date(Date.now() - 3 * 86400000) },
  { id: 'DC-00243', party: 'Tulsi Sarees Pvt Ltd', amount: 89500, status: 'DELIVERED', date: new Date(Date.now() - 4 * 86400000) },
];

const statusColors: Record<string, string> = {
  CREATED: 'bg-muted text-muted-foreground',
  DISPATCHED: 'bg-textile-500/10 text-textile-500',
  IN_TRANSIT: 'bg-warning/10 text-warning',
  DELIVERED: 'bg-success/10 text-success',
};

export function DashboardPage() {
  const { user, business } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            नमस्ते, {user?.name?.split(' ')[0] || 'User'}! 🙏
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at <span className="font-medium text-foreground">{business?.name}</span> today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{formatIndianDate(new Date())}</span>
          <Badge variant="outline">{business?.plan} Plan</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", stat.bgColor)}>
                    <Icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <div className={cn(
                    "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
                    stat.changeType === 'up' ? 'text-success bg-success/10' : 'text-muted-foreground bg-muted'
                  )}>
                    {stat.changeType === 'up' && <TrendingUp className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.isCurrency ? formatINR(stat.value) : stat.value.toLocaleString('en-IN')}
                </div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Challans */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Challans</CardTitle>
          <a
            href="/app/challans"
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentChallans.map((challan) => (
              <div
                key={challan.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{challan.id}</span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        statusColors[challan.status] || 'bg-muted'
                      )}>
                        {challan.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{challan.party}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{formatINR(challan.amount)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatIndianDate(challan.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
