import { useMapSummary } from '@/hooks/api/useVisits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { formatIndianDate } from '@textilepro/shared';
import { Badge } from '@/components/ui/badge';

export function VisitsPage() {
    const { data, isLoading } = useMapSummary();
    const visits = data as any[] | undefined;

    if (isLoading) return <div className="p-8">Loading field visits...</div>;

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Field Sales GPS Tracking</h1>
                    <p className="text-muted-foreground">Monitor real-time agent locations and meeting durations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Placeholder for actual Google Map */}
                <div className="lg:col-span-2">
                    <Card className="min-h-[500px] overflow-hidden flex flex-col">
                        <div className="flex-1 bg-slate-100 flex items-center justify-center flex-col gap-4 text-slate-500 relative">
                            <MapPin className="w-12 h-12 opacity-50" />
                            <p>Map visualization disabled in Development Mode.</p>
                            <p className="text-sm">Supply a valid Google Maps API Key to render geospatial paths.</p>
                        </div>
                    </Card>
                </div>

                {/* Timeline Log */}
                <div className="space-y-4">
                    <h3 className="font-bold flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-indigo-500" />
                        Today's Route Timeline
                    </h3>
                    <div className="bg-white rounded-xl border p-1 border-slate-200">
                        {visits?.map((visit: any, index: number) => (
                            <div key={visit._id} className="relative p-4 pl-8 border-b last:border-0 hover:bg-slate-50">
                                <div className="absolute left-3.5 top-5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                {index !== visits.length - 1 && (
                                    <div className="absolute left-[17px] top-[26px] bottom-[-22px] w-[2px] bg-indigo-100" />
                                )}
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-slate-900 text-sm">Meeting Marker</span>
                                    <Badge variant="outline" className={visit.checkOutAt ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}>
                                        {visit.checkOutAt ? 'Completed' : 'Checked In'}
                                    </Badge>
                                </div>
                                <div className="flex items-center text-xs text-slate-500 gap-3 mt-2">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(visit.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    {visit.durationMinutes && (
                                        <span className="font-medium text-slate-700">{visit.durationMinutes} min</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {visits?.length === 0 && (
                            <div className="p-8 text-center text-sm text-slate-500">
                                No check-ins recorded today.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
