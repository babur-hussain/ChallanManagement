import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Plus, Edit, Trash2, Copy, FileText,
    MessageSquare, IndianRupee, Headphones, Search,
} from 'lucide-react';
import { useTemplates, useCreateTemplate, useDeleteTemplate, useSeedTemplates } from '@/hooks/api/useWhatsApp';

const catIcons: Record<string, any> = {
    SALES: MessageSquare,
    OPERATIONS: FileText,
    COLLECTIONS: IndianRupee,
    SUPPORT: Headphones,
};

const catColors: Record<string, string> = {
    SALES: 'bg-blue-100 text-blue-700',
    OPERATIONS: 'bg-emerald-100 text-emerald-700',
    COLLECTIONS: 'bg-amber-100 text-amber-700',
    SUPPORT: 'bg-purple-100 text-purple-700',
};

export function TemplatesPage() {
    const [activeCategory, setActiveCategory] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: '', category: 'SALES', bodyEn: '', bodyHi: '', placeholders: '' });

    const { data: templatesRaw } = useTemplates(activeCategory || undefined);
    const templates = (templatesRaw as any) || [];
    const createMutation = useCreateTemplate();
    const deleteMutation = useDeleteTemplate();
    const seedMutation = useSeedTemplates();

    const handleCreate = async () => {
        await createMutation.mutateAsync({
            ...form,
            placeholders: form.placeholders.split(',').map(p => p.trim()).filter(Boolean),
        });
        setShowCreate(false);
        setForm({ name: '', category: 'SALES', bodyEn: '', bodyHi: '', placeholders: '' });
    };

    return (
        <div className="container py-4 max-w-5xl animate-in fade-in-50">
            <PageHeader
                title="Message Templates"
                description="Manage WhatsApp message templates for sales, operations, and collections."
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => seedMutation.mutate()}>
                            Seed Defaults
                        </Button>
                        <Button size="sm" onClick={() => setShowCreate(true)}>
                            <Plus className="mr-2 h-4 w-4" /> New Template
                        </Button>
                    </div>
                }
            />

            {/* Category Filter */}
            <div className="flex gap-2 mb-6">
                {['', 'SALES', 'OPERATIONS', 'COLLECTIONS', 'SUPPORT'].map(cat => (
                    <Button key={cat} size="sm" variant={activeCategory === cat ? 'default' : 'outline'}
                        className="rounded-full" onClick={() => setActiveCategory(cat)}>
                        {cat || 'All'}
                    </Button>
                ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((t: any) => {
                    const Icon = catIcons[t.category] || FileText;
                    return (
                        <div key={t._id} className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${catColors[t.category]}`}>
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{t.name}</p>
                                        <Badge variant="outline" className="text-[9px] mt-0.5">{t.category}</Badge>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigator.clipboard.writeText(t.bodyEn)}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteMutation.mutate(t._id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 text-sm mb-2">{t.bodyEn}</div>
                            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300 mb-2">
                                {t.bodyHi}
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex gap-1 flex-wrap">
                                    {t.placeholders?.map((p: string) => (
                                        <Badge key={p} variant="secondary" className="text-[9px]">{`{{${p}}}`}</Badge>
                                    ))}
                                </div>
                                <span>Used {t.usageCount}x</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {templates.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No templates. Click "Seed Defaults" to get started.</p>
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
                    <div className="bg-card rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">New Template</h3>
                        <div className="space-y-3">
                            <Input placeholder="Template name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            <select className="w-full border rounded-md px-3 py-2 text-sm bg-card" value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}>
                                <option value="SALES">Sales</option>
                                <option value="OPERATIONS">Operations</option>
                                <option value="COLLECTIONS">Collections</option>
                                <option value="SUPPORT">Support</option>
                            </select>
                            <textarea className="w-full border rounded-md px-3 py-2 text-sm resize-none bg-card" rows={3}
                                placeholder="English body (use {{name}}, {{amount}} etc.)" value={form.bodyEn}
                                onChange={e => setForm({ ...form, bodyEn: e.target.value })} />
                            <textarea className="w-full border rounded-md px-3 py-2 text-sm resize-none bg-card" rows={3}
                                placeholder="Hindi body" value={form.bodyHi}
                                onChange={e => setForm({ ...form, bodyHi: e.target.value })} />
                            <Input placeholder="Placeholders (comma separated)" value={form.placeholders}
                                onChange={e => setForm({ ...form, placeholders: e.target.value })} />
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
                                <Button className="flex-1" onClick={handleCreate} disabled={!form.name || !form.bodyEn || createMutation.isPending}>
                                    Create
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
