import { useState } from 'react';
import { useTasks, useCompleteTask } from '@/hooks/api/useTasks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { formatIndianDate } from '@textilepro/shared';

export function TasksPage() {
    const [search, setSearch] = useState('');
    const { data, isLoading } = useTasks();
    const completeTask = useCompleteTask();
    const tasks = data as any[] | undefined;

    const handleComplete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Mark this task as done?')) {
            completeTask.mutate({ id, notes: 'Completed via UI' });
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
            case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (isLoading) return <div className="p-8">Loading tasks...</div>;

    const pendingTasks = tasks?.filter((t: any) => t.status === 'PENDING') || [];
    const doneTasks = tasks?.filter((t: any) => t.status === 'DONE') || [];

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Follow-Up Workflow</h1>
                    <p className="text-muted-foreground">Manage and track your lead and party interactions.</p>
                </div>
                <Button className="shrink-0 group">
                    <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90" />
                    New Follow-up
                </Button>
            </div>

            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Basic Kanban Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* PENDING COLUMN */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 min-h-[500px]">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Pending
                        </h2>
                        <Badge variant="secondary">{pendingTasks.length}</Badge>
                    </div>

                    <div className="space-y-3">
                        {pendingTasks.map((task: any) => (
                            <div key={task._id} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                        {task.priority}
                                    </Badge>
                                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                                        {task.relatedType}
                                    </span>
                                </div>
                                <h3 className="font-medium text-slate-900 mb-1">{task.title}</h3>
                                {task.description && (
                                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{task.description}</p>
                                )}
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center text-xs text-slate-500 font-medium">
                                        <Calendar className="w-3.5 h-3.5 mr-1" />
                                        {formatIndianDate(task.dueAt)}
                                    </div>
                                    <Button size="sm" variant="outline" className="h-7 text-xs hover:bg-green-50 hover:text-green-600 hover:border-green-200" onClick={(e) => handleComplete(task._id, e)}>
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                        Complete
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {pendingTasks.length === 0 && (
                            <div className="text-center py-8 text-slate-500 text-sm">No pending tasks</div>
                        )}
                    </div>
                </div>

                {/* DONE COLUMN */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 min-h-[500px]">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Completed
                        </h2>
                        <Badge variant="secondary">{doneTasks.length}</Badge>
                    </div>

                    <div className="space-y-3 opacity-75">
                        {doneTasks.map((task: any) => (
                            <div key={task._id} className="bg-white p-4 rounded-lg border border-slate-200 group">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-slate-700 line-through decoration-slate-300">{task.title}</h3>
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                                <p className="text-xs text-slate-500">
                                    Completed on {formatIndianDate(task.completedAt)}
                                </p>
                            </div>
                        ))}
                        {doneTasks.length === 0 && (
                            <div className="text-center py-8 text-slate-500 text-sm">No completed tasks</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
