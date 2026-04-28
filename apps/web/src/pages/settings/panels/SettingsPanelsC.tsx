import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useThemeStore } from '@/stores/themeStore';
import { SettingsField, SettingsSelect, SettingsToggle } from './SettingsPanelsA';
import { Trash2, Plus, AlertTriangle, ExternalLink, Download, Upload, Search, MessageSquare } from 'lucide-react';

/* ═══════════ SECTION 17: REPORTS & EXPORTS ═══════════ */
export function ReportsSettings({ settings, onChange }: any) {
    const r = settings?.reports || {};
    const set = (k: string, v: any) => onChange({ reports: { ...r, [k]: v } });
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Reports & Exports</h2><p className="text-muted-foreground text-sm">Default formats, scheduled reports, and branding.</p></div>
            <SettingsSelect label="Default Export Format" value={r.defaultExportFormat || 'pdf'} onChange={(v: string) => set('defaultExportFormat', v)} options={[{ v: 'pdf', l: 'PDF' }, { v: 'excel', l: 'Excel' }, { v: 'csv', l: 'CSV' }]} />
            <Card><CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <SettingsToggle label="Owner Email Reports" checked={r.ownerEmailReports ?? true} onChange={(v: boolean) => set('ownerEmailReports', v)} />
                <SettingsToggle label="Auto Monthly MIS" checked={r.autoMonthlyMis ?? false} onChange={(v: boolean) => set('autoMonthlyMis', v)} />
                <SettingsToggle label="Watermark on PDFs" checked={r.watermarkOnPdfs ?? false} onChange={(v: boolean) => set('watermarkOnPdfs', v)} />
                <SettingsToggle label="Logo in Reports" checked={r.logoInReports ?? true} onChange={(v: boolean) => set('logoInReports', v)} />
            </CardContent></Card>
        </div>
    );
}

/* ═══════════ SECTION 18: MOBILE APP ═══════════ */
export function MobileSettings({ settings, onChange }: any) {
    const m = settings?.mobile || {};
    const set = (k: string, v: any) => onChange({ mobile: { ...m, [k]: v } });
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Mobile App Preferences</h2><p className="text-muted-foreground text-sm">Push notifications and mobile-specific settings.</p></div>
            <Card><CardContent className="p-4 space-y-4">
                <SettingsToggle label="Push Notifications" checked={m.pushNotifications ?? true} onChange={(v: boolean) => set('pushNotifications', v)} />
                <SettingsToggle label="Offline Mode" checked={m.offlineMode ?? true} onChange={(v: boolean) => set('offlineMode', v)} />
                <SettingsToggle label="Quick Actions on Home" checked={m.quickActionsOnHome ?? true} onChange={(v: boolean) => set('quickActionsOnHome', v)} />
                <SettingsToggle label="Biometric App Lock" checked={m.biometricAppLock ?? false} onChange={(v: boolean) => set('biometricAppLock', v)} />
            </CardContent></Card>
        </div>
    );
}

/* ═══════════ SECTION 19: APPEARANCE ═══════════ */
export function AppearanceSettings({ settings, onChange }: any) {
    const a = settings?.appearance || {};
    const set = (k: string, v: any) => {
        onChange({ appearance: { ...a, [k]: v } });

        const store = useThemeStore.getState();
        if (k === 'theme') store.setTheme(v);
        if (k === 'accentColor') store.setAccentColor(v);
        if (k === 'compactMode') store.setCompactMode(v);
        if (k === 'fontSize') store.setFontSize(v);
        if (k === 'tableDensity') store.setTableDensity(v);
    };
    const themes = [
        { id: 'light', label: '☀️ Light', desc: 'Clean bright interface' },
        { id: 'dark', label: '🌙 Dark', desc: 'Easy on the eyes' },
        { id: 'system', label: '🖥️ System', desc: 'Follow OS preference' },
    ];
    const accents = ['#F97316', '#EF4444', '#8B5CF6', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#6366F1'];
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Appearance</h2><p className="text-muted-foreground text-sm">Customize the look and feel of your workspace.</p></div>
            <div className="grid grid-cols-3 gap-4">
                {themes.map(t => (
                    <Card key={t.id} className={`cursor-pointer transition-all hover:border-primary/50 ${(a.theme || 'dark') === t.id ? 'border-primary ring-2 ring-primary/20' : ''}`}
                        onClick={() => set('theme', t.id)}>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl mb-1">{t.label.split(' ')[0]}</p>
                            <p className="font-semibold text-sm">{t.label.split(' ')[1]}</p>
                            <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Accent Color</Label>
                <div className="flex gap-2">
                    {accents.map(c => (
                        <button key={c} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${(a.accentColor || '#F97316') === c ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }} onClick={() => set('accentColor', c)} />
                    ))}
                </div>
            </div>
            <Card><CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <SettingsToggle label="Compact Mode" checked={a.compactMode ?? false} onChange={(v: boolean) => set('compactMode', v)} />
                <SettingsSelect label="Font Size" value={a.fontSize || 'medium'} onChange={(v: string) => set('fontSize', v)} options={[{ v: 'small', l: 'Small' }, { v: 'medium', l: 'Medium' }, { v: 'large', l: 'Large' }]} />
                <SettingsSelect label="Table Density" value={a.tableDensity || 'comfortable'} onChange={(v: string) => set('tableDensity', v)} options={[{ v: 'compact', l: 'Compact' }, { v: 'comfortable', l: 'Comfortable' }, { v: 'spacious', l: 'Spacious' }]} />
            </CardContent></Card>
        </div>
    );
}

/* ═══════════ SECTION 20: AUTOMATIONS ═══════════ */
export function AutomationsSettings({ settings, onChange }: any) {
    const automations = settings?.automations || [];
    const defaultRules = [
        { id: 'invoice_overdue', trigger: 'Invoice overdue 7 days', action: 'Send WhatsApp reminder', enabled: true },
        { id: 'low_stock', trigger: 'Stock below threshold', action: 'Alert owner via notification', enabled: true },
        { id: 'lead_inactive', trigger: 'Lead inactive 14 days', action: 'Assign follow-up reminder', enabled: false },
        { id: 'payment_large', trigger: 'Payment > ₹1L received', action: 'Notify owner instantly', enabled: true },
        { id: 'churn_risk', trigger: 'High churn risk detected', action: 'AI outreach campaign', enabled: false },
    ];
    const rules = automations.length > 0 ? automations : defaultRules;

    const toggleRule = (idx: number) => {
        const updated = [...rules];
        updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
        onChange({ automations: updated });
    };

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div className="flex items-center justify-between">
                <div><h2 className="text-xl font-bold">Automation Rules</h2><p className="text-muted-foreground text-sm">Create intelligent triggers that automate your operations.</p></div>
                <Button size="sm"><Plus className="w-3.5 h-3.5 mr-2" />New Rule</Button>
            </div>
            {rules.map((r: any, i: number) => (
                <Card key={r.id || i} className={`transition-all ${r.enabled ? 'border-primary/20' : 'opacity-60'}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                            <p className="font-semibold text-sm">If: <span className="text-primary">{r.trigger}</span></p>
                            <p className="text-xs text-muted-foreground mt-0.5">Then: {r.action}</p>
                        </div>
                        <Switch checked={r.enabled} onCheckedChange={() => toggleRule(i)} />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

/* ═══════════ SECTION 21: BACKUP & DATA ═══════════ */
export function BackupSettings({ settings }: any) {
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Backup & Data</h2><p className="text-muted-foreground text-sm">Data protection, exports, and restoration.</p></div>
            <Card className="border-dashed"><CardContent className="p-4 flex items-center justify-between">
                <div><p className="font-semibold">Automated Backups</p><p className="text-sm text-muted-foreground">Backups are performed automatically every 24 hours.</p></div>
                <Button variant="outline" size="sm">Request Manual Backup</Button>
            </CardContent></Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-1"><Download className="w-5 h-5" /><span className="text-xs">Export Full Data</span></Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-1"><Upload className="w-5 h-5" /><span className="text-xs">Import Data</span></Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-1"><span className="text-xs">Restore Request</span></Button>
            </div>
            <Card><CardContent className="p-4">
                <p className="text-sm font-semibold">Retention Policy</p>
                <p className="text-xs text-muted-foreground">Data is retained for 365 days after account closure. Backups are encrypted at rest using AES-256.</p>
            </CardContent></Card>
        </div>
    );
}

/* ═══════════ SECTION 22: AUDIT LOGS ═══════════ */
export function AuditSettings({ settings }: any) {
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Audit Logs</h2><p className="text-muted-foreground text-sm">Track every change and action across your organization.</p></div>
            <Card className="border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p className="text-sm">Audit logs are recorded automatically for all critical operations.</p>
                    <p className="text-xs mt-1">Full audit trail viewer will be available in a future release.</p>
                    <p className="text-xs mt-2">Settings Version: <span className="font-mono font-bold">{settings?.version || 1}</span></p>
                </CardContent>
            </Card>
        </div>
    );
}

/* ═══════════ SECTION 23: DEVELOPER / API ═══════════ */
export function DeveloperSettings({ settings, onChange }: any) {
    const d = settings?.developer || {};
    const set = (k: string, v: any) => onChange({ developer: { ...d, [k]: v } });
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">API Keys / Developer</h2><p className="text-muted-foreground text-sm">Manage API access, webhooks, and sandbox mode.</p></div>
            <Card><CardContent className="p-4 space-y-3">
                <SettingsToggle label="Sandbox Mode" checked={d.sandboxMode ?? false} onChange={(v: boolean) => set('sandboxMode', v)} />
                <div className="flex gap-3">
                    <Button variant="outline" size="sm"><ExternalLink className="w-3.5 h-3.5 mr-2" />API Docs</Button>
                    <Button variant="outline" size="sm">Manage Webhook URLs</Button>
                </div>
            </CardContent></Card>
            <Card className="border-dashed"><CardContent className="p-6 text-center text-muted-foreground">
                <p className="text-sm">API key generation will be available when the Public API launches.</p>
                <p className="text-xs mt-1">Navigate to <code>/app/integrations/api-keys</code> for early access.</p>
            </CardContent></Card>
        </div>
    );
}

/* ═══════════ SECTION 24: SUPPORT ═══════════ */
export function SupportSettings({ settings }: any) {
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Support</h2><p className="text-muted-foreground text-sm">Get help, request features, and access documentation.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { icon: '💬', title: 'Live Chat', desc: 'Chat with our team', action: 'Start Chat' },
                    { icon: '📱', title: 'WhatsApp Support', desc: 'Reach us on WhatsApp', action: 'Open WhatsApp' },
                    { icon: '📞', title: 'Book Onboarding Call', desc: '30-min free walkthrough', action: 'Schedule' },
                    { icon: '💡', title: 'Request Feature', desc: 'Suggest improvements', action: 'Submit' },
                    { icon: '📚', title: 'Documentation', desc: 'Guides and tutorials', action: 'Open Docs' },
                    { icon: 'ℹ️', title: 'Version Info', desc: `Settings v${settings?.version || 1}`, action: 'Changelog' },
                ].map((s, i) => (
                    <Card key={i} className="hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{s.icon}</span>
                                <div><p className="font-semibold text-sm">{s.title}</p><p className="text-xs text-muted-foreground">{s.desc}</p></div>
                            </div>
                            <Button variant="outline" size="sm">{s.action}</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

/* ═══════════ SECTION 25: DANGER ZONE ═══════════ */
export function DangerZoneSettings({ settings }: any) {
    const actions = [
        { title: 'Deactivate Account', desc: 'Temporarily disable your account. You can reactivate later.' },
        { title: 'Revoke All Sessions', desc: 'Force logout all users across all devices.' },
        { title: 'Disable All Integrations', desc: 'Disconnect all third-party services.' },
        { title: 'Export & Close Account', desc: 'Download your data and close the account.' },
        { title: 'Permanent Delete Request', desc: 'Irreversibly delete all data. This cannot be undone.' },
    ];
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold text-destructive">⚠️ Danger Zone</h2><p className="text-muted-foreground text-sm">Destructive actions that cannot be easily reversed. Proceed with extreme caution.</p></div>
            {actions.map((a, i) => (
                <Card key={i} className="border-destructive/30 hover:border-destructive/60 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-sm">{a.title}</p>
                            <p className="text-xs text-muted-foreground">{a.desc}</p>
                        </div>
                        <Button variant="destructive" size="sm">{a.title.split(' ')[0]}</Button>
                    </CardContent>
                </Card>
            ))}
            <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-4 text-center">
                    <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <p className="text-sm font-semibold text-destructive">All destructive actions require password confirmation.</p>
                </CardContent>
            </Card>
        </div>
    );
}
