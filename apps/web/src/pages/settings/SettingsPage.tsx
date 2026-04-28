import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Search, Settings, Save, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSettingsData, useUpdateSettings } from '@/hooks/api/useSettings';
import { toast } from 'sonner';
import { SETTINGS_CATEGORIES } from './settingsCategories';
import type { UpdateSettingsPayload } from '@textilepro/shared';

// Panels A (1–8)
import { ProfileSettings, UsersSettings, BranchesSettings, BillingSettings, ChallanSettings, InvoiceSettings, InventorySettings, FinanceSettings } from './panels/SettingsPanelsA';
// Panels B (9–16)
import { CrmSettings, QuotationsSettings, WhatsappSettings, AiSettings, MarketplaceSettings, HrmsSettings, SecuritySettings, IntegrationsSettings } from './panels/SettingsPanelsB';
// Panels C (17–25)
import { ReportsSettings, MobileSettings, AppearanceSettings, AutomationsSettings, BackupSettings, AuditSettings, DeveloperSettings, SupportSettings, DangerZoneSettings } from './panels/SettingsPanelsC';

export function SettingsPage() {
    const { data: settings, isLoading } = useSettingsData();
    const updateMutation = useUpdateSettings();

    const [activeSection, setActiveSection] = useState('profile');
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingChanges, setPendingChanges] = useState<UpdateSettingsPayload>({});
    const [isDirty, setIsDirty] = useState(false);
    const [saved, setSaved] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);

    // Merge pending changes into settings for live preview
    const mergedSettings = useMemo(() => {
        if (!settings) return {};
        const merged = JSON.parse(JSON.stringify(settings));
        Object.entries(pendingChanges).forEach(([key, val]) => {
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                merged[key] = { ...(merged[key] || {}), ...val };
            } else {
                (merged as any)[key] = val;
            }
        });
        return merged;
    }, [settings, pendingChanges]);

    const handleChange = useCallback((partial: UpdateSettingsPayload) => {
        setPendingChanges(prev => {
            const next = { ...prev };
            Object.entries(partial).forEach(([key, val]) => {
                if (val && typeof val === 'object' && !Array.isArray(val)) {
                    (next as any)[key] = { ...((next as any)[key] || {}), ...val };
                } else {
                    (next as any)[key] = val;
                }
            });
            return next;
        });
        setIsDirty(true);
        setSaved(false);
    }, []);

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync(pendingChanges);
            setIsDirty(false);
            setSaved(true);
            setPendingChanges({});
            toast.success('Settings saved successfully! ✨');
            setTimeout(() => setSaved(false), 3000);
        } catch {
            toast.error('Failed to save settings.');
        }
    };

    // Fuzzy search filter
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return SETTINGS_CATEGORIES;
        const q = searchQuery.toLowerCase();
        return SETTINGS_CATEGORIES.filter(c =>
            c.label.toLowerCase().includes(q) ||
            c.keywords.some(k => k.includes(q))
        );
    }, [searchQuery]);

    // Auto-jump to first match when searching
    useEffect(() => {
        if (searchQuery && filteredCategories.length > 0 && !filteredCategories.find(c => c.id === activeSection)) {
            setActiveSection(filteredCategories[0].id);
        }
    }, [filteredCategories, searchQuery]);

    const renderPanel = () => {
        const props = { settings: mergedSettings, onChange: handleChange };
        switch (activeSection) {
            case 'profile': return <ProfileSettings {...props} />;
            case 'users': return <UsersSettings {...props} />;
            case 'branches': return <BranchesSettings {...props} />;
            case 'billing': return <BillingSettings {...props} />;
            case 'challans': return <ChallanSettings {...props} />;
            case 'invoices': return <InvoiceSettings {...props} />;
            case 'inventory': return <InventorySettings {...props} />;
            case 'finance': return <FinanceSettings {...props} />;
            case 'crm': return <CrmSettings {...props} />;
            case 'quotations': return <QuotationsSettings {...props} />;
            case 'whatsapp': return <WhatsappSettings {...props} />;
            case 'ai': return <AiSettings {...props} />;
            case 'marketplace': return <MarketplaceSettings {...props} />;
            case 'hrms': return <HrmsSettings {...props} />;
            case 'security': return <SecuritySettings {...props} />;
            case 'integrations': return <IntegrationsSettings {...props} />;
            case 'reports': return <ReportsSettings {...props} />;
            case 'mobile': return <MobileSettings {...props} />;
            case 'appearance': return <AppearanceSettings {...props} />;
            case 'automations': return <AutomationsSettings {...props} />;
            case 'backup': return <BackupSettings {...props} />;
            case 'audit': return <AuditSettings {...props} />;
            case 'developer': return <DeveloperSettings {...props} />;
            case 'support': return <SupportSettings {...props} />;
            case 'danger': return <DangerZoneSettings {...props} />;
            default: return <ProfileSettings {...props} />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground text-sm">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* ─── Top Bar ─── */}
            <div className="border-b bg-card/50 backdrop-blur px-4 py-3 flex items-center gap-4 shrink-0">
                <button className="md:hidden p-1" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
                    <ChevronLeft className={`w-5 h-5 transition-transform ${mobileSidebarOpen ? '' : 'rotate-180'}`} />
                </button>
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    <h1 className="text-lg font-bold">Settings</h1>
                </div>
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        name="settings-search-global"
                        placeholder="Search settings... (e.g. invoice, whatsapp, gst)"
                        className="pl-9 h-9 bg-muted/30"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        autoComplete="off"
                        data-1p-ignore
                    />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    {isDirty && (
                        <span className="text-xs bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full font-medium animate-in fade-in-50">
                            Unsaved changes
                        </span>
                    )}
                    {saved && (
                        <span className="text-xs bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full font-medium animate-in fade-in-50 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Saved
                        </span>
                    )}
                </div>
            </div>

            {/* ─── Body (Sidebar + Content) ─── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ─── Sidebar ─── */}
                <aside className={`${mobileSidebarOpen ? 'w-64' : 'w-0 hidden'} md:w-64 md:block border-r bg-card/30 shrink-0 transition-all`}>
                    <ScrollArea className="h-full py-2">
                        <nav className="space-y-0.5 px-2">
                            {filteredCategories.length === 0 ? (
                                <div className="text-center py-8 px-4 text-sm text-muted-foreground">
                                    No matching settings found
                                </div>
                            ) : (
                                filteredCategories.map(cat => {
                                    const Icon = cat.icon;
                                    const isActive = activeSection === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setActiveSection(cat.id); setMobileSidebarOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group
                                                ${isActive
                                                    ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                                                    : cat.danger
                                                        ? 'text-destructive hover:bg-destructive/5'
                                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : cat.danger ? 'text-destructive' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                            <span className="truncate">{cat.label}</span>
                                        </button>
                                    );
                                })
                            )}
                        </nav>
                    </ScrollArea>
                </aside>

                {/* ─── Content Panel ─── */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto p-6 pb-24">
                        {renderPanel()}
                    </div>
                </main>
            </div>

            {/* ─── Sticky Save Bar ─── */}
            {isDirty && (
                <div className="fixed bottom-0 left-0 sm:left-64 right-0 z-30 bg-background/95 backdrop-blur border-t shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.15)] p-3 flex items-center justify-end gap-3 animate-in slide-in-from-bottom-5">
                    <Button variant="ghost" size="sm" onClick={() => { setPendingChanges({}); setIsDirty(false); }}>
                        Discard Changes
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Settings
                    </Button>
                </div>
            )}
        </div>
    );
}
