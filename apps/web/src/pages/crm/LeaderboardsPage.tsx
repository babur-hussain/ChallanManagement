import { useState } from 'react';
import { useSalesLeaderboards } from '@/hooks/api/useSales';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { formatINR } from '@textilepro/shared';

export function LeaderboardsPage() {
    const [dateOption, setDateOption] = useState<'TODAY' | 'WEEK' | 'MONTH'>('MONTH');
    const { data, isLoading } = useSalesLeaderboards(dateOption);
    const boards = data as any | undefined;

    if (isLoading) return <div className="p-8">Loading leaderboards...</div>;

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Performance Leaderboards</h1>
                    <p className="text-muted-foreground">Track sales team KPIs and top performers.</p>
                </div>
                <Tabs value={dateOption} onValueChange={(v: any) => setDateOption(v)}>
                    <TabsList>
                        <TabsTrigger value="TODAY">Today</TabsTrigger>
                        <TabsTrigger value="WEEK">This Week</TabsTrigger>
                        <TabsTrigger value="MONTH">This Month</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">

                {/* Highest Revenue */}
                <Card className="border-t-4 border-t-emerald-500 shadow-md">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="p-2 bg-emerald-100 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
                                Top Revenue
                            </CardTitle>
                            <Badge variant="outline" className="text-emerald-700 bg-emerald-50">Invoice Value</Badge>
                        </div>
                        <CardDescription>Highest generated invoice billing.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {boards?.highestSales?.map((stat: any, index: number) => (
                            <div key={stat.user._id} className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-center w-8 text-lg font-bold text-slate-400">
                                    {index === 0 ? <Trophy className="w-6 h-6 text-yellow-500" /> : `#${index + 1}`}
                                </div>
                                <Avatar>
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                        {stat.user.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">{stat.user.name}</p>
                                    <p className="text-sm text-slate-500 truncate">{stat.totalChallans} Challans</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-600">{formatINR(stat.totalInvoiceValue)}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Most Active */}
                <Card className="border-t-4 border-t-indigo-500 shadow-md">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="p-2 bg-indigo-100 rounded-lg"><Activity className="w-5 h-5 text-indigo-600" /></div>
                                Most Active
                            </CardTitle>
                            <Badge variant="outline" className="text-indigo-700 bg-indigo-50">Activity Points</Badge>
                        </div>
                        <CardDescription>Highest volume of calls, visits, and follow-ups.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {boards?.mostActive?.map((stat: any, index: number) => (
                            <div key={stat.user._id} className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-center w-8 text-lg font-bold text-slate-400">
                                    {index === 0 ? <Trophy className="w-6 h-6 text-yellow-500" /> : `#${index + 1}`}
                                </div>
                                <Avatar>
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                        {stat.user.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 truncate">{stat.user.name}</p>
                                    <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
                                        <span>{stat.totalMeetings} Meets</span>
                                        <span>•</span>
                                        <span>{stat.totalCalls} Calls</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center justify-center px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm">
                                        {stat.activityScore} pts
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
