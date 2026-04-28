import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Plus, PlayCircle, Pause, CheckCircle, Send, Users,
    Eye, MessageSquare, BarChart3, XCircle, Clock,
} from 'lucide-react';
import { useCampaigns, useCreateCampaign, useUpdateCampaignStatus, useTemplates } from '@/hooks/api/useWhatsApp';
import { formatDate } from '@textilepro/shared';

const statusConfig: Record<string, { icon: any; color: string }> = {
    DRAFT: { icon: Clock, color: 'bg-gray-100 text-gray-700' },
    SCHEDULED: { icon: Clock, color: 'bg-blue-100 text-blue-700' },
    SENDING: { icon: Send, color: 'bg-amber-100 text-amber-700' },
    COMPLETED: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
    CANCELLED: { icon: XCircle, color: 'bg-red-100 text-red-700' },
};

export function CampaignsPage() {
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({
        name: '', templateId: '', scheduledAt: '',
        audienceFilters: { tags: '', cities: '', hasOutstanding: false, dormantDays: 0 },
    });

    const { data: campaignsRaw } = useCampaigns();
    const campaigns = (campaignsRaw as any) || [];
    const { data: templatesRaw } = useTemplates();
    const templates = (templatesRaw as any) || [];
    const createMutation = useCreateCampaign();
    const statusMutation = useUpdateCampaignStatus();

    const handleCreate = async () => {
        await createMutation.mutateAsync({
            name: form.name,
            templateId: form.templateId,
            scheduledAt: form.scheduledAt || undefined,
            audienceFilters: {
                tags: form.audienceFilters.tags ? form.audienceFilters.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                cities: form.audienceFilters.cities ? form.audienceFilters.cities.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                hasOutstanding: form.audienceFilters.hasOutstanding || undefined,
                dormantDays: form.audienceFilters.dormantDays || undefined,
            },
        });
        setShowCreate(false);
        setForm({ name: '', templateId: '', scheduledAt: '', audienceFilters: { tags: '', cities: '', hasOutstanding: false, dormantDays: 0 } });
    };

    return (
        <div className="container py-4 max-w-5xl animate-in fade-in-50">
            <PageHeader
                title="Bulk Campaigns"
                description="Send targeted WhatsApp campaigns for sales, promotions, and reminders."
                actions={
                    <Button size="sm" onClick={() => setShowCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" /> New Campaign
                    </Button>
                }
            />

            {/* Campaign Cards */}
            <div className="space-y-4">
                {campaigns.map((c: any) => {
                    const sc = statusConfig[c.status] || statusConfig.DRAFT;
                    const Icon = sc.icon;
                    const totalSent = c.sentCount || 0;
                    const deliveryRate = totalSent > 0 ? Math.round((c.deliveredCount / totalSent) * 100) : 0;
                    const readRate = totalSent > 0 ? Math.round((c.readCount / totalSent) * 100) : 0;
                    const replyRate = totalSent > 0 ? Math.round((c.repliedCount / totalSent) * 100) : 0;

                    return (
                        <div key={c._id} className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold">{c.name}</h3>
                                        <Badge className={`text-[10px] ${sc.color}`}>
                                            <Icon className="mr-1 h-3 w-3" /> {c.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Template: {c.templateId?.name || 'Unknown'} · Created {formatDate(c.createdAt)}
                                        {c.scheduledAt && ` · Scheduled ${formatDate(c.scheduledAt)}`}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {c.status === 'DRAFT' && (
                                        <Button size="sm" variant="outline" onClick={() => statusMutation.mutate({ id: c._id, status: 'SCHEDULED' })}>
                                            <PlayCircle className="mr-1 h-3.5 w-3.5" /> Schedule
                                        </Button>
                                    )}
                                    {c.status === 'SCHEDULED' && (
                                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => statusMutation.mutate({ id: c._id, status: 'CANCELLED' })}>
                                            <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-5 gap-3 text-center">
                                <div className="bg-muted/50 rounded-lg p-2">
                                    <p className="text-[10px] text-muted-foreground uppercase">Recipients</p>
                                    <p className="text-lg font-bold flex items-center justify-center gap-1">
                                        <Users className="h-3.5 w-3.5 text-blue-500" /> {c.recipientCount}
                                    </p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-2">
                                    <p className="text-[10px] text-muted-foreground uppercase">Sent</p>
                                    <p className="text-lg font-bold flex items-center justify-center gap-1">
                                        <Send className="h-3.5 w-3.5 text-green-500" /> {totalSent}
                                    </p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-2">
                                    <p className="text-[10px] text-muted-foreground uppercase">Delivered</p>
                                    <p className="text-lg font-bold">{deliveryRate}%</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-2">
                                    <p className="text-[10px] text-muted-foreground uppercase">Read</p>
                                    <p className="text-lg font-bold">{readRate}%</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-2">
                                    <p className="text-[10px] text-muted-foreground uppercase">Replied</p>
                                    <p className="text-lg font-bold text-emerald-600">{replyRate}%</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {campaigns.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No campaigns yet. Create your first bulk campaign.</p>
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
                    <div className="bg-card rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Create Campaign</h3>
                        <div className="space-y-3">
                            <Input placeholder="Campaign name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            <select className="w-full border rounded-md px-3 py-2 text-sm bg-card" value={form.templateId}
                                onChange={e => setForm({ ...form, templateId: e.target.value })}>
                                <option value="">Select template...</option>
                                {templates.map((t: any) => (
                                    <option key={t._id} value={t._id}>{t.name} ({t.category})</option>
                                ))}
                            </select>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Schedule (optional)</label>
                                <Input type="datetime-local" value={form.scheduledAt}
                                    onChange={e => setForm({ ...form, scheduledAt: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Audience Tags (comma separated)</label>
                                <Input value={form.audienceFilters.tags}
                                    onChange={e => setForm({ ...form, audienceFilters: { ...form.audienceFilters, tags: e.target.value } })}
                                    placeholder="vip, surat, silk" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Cities (comma separated)</label>
                                <Input value={form.audienceFilters.cities}
                                    onChange={e => setForm({ ...form, audienceFilters: { ...form.audienceFilters, cities: e.target.value } })}
                                    placeholder="Surat, Mumbai, Delhi" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="hasOutstanding" checked={form.audienceFilters.hasOutstanding}
                                    onChange={e => setForm({ ...form, audienceFilters: { ...form.audienceFilters, hasOutstanding: e.target.checked } })} />
                                <label htmlFor="hasOutstanding" className="text-xs">Only parties with outstanding</label>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
                                <Button className="flex-1" onClick={handleCreate}
                                    disabled={!form.name || !form.templateId || createMutation.isPending}>
                                    Create Campaign
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
