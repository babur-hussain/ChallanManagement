import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SettingsField, SettingsSelect, SettingsToggle } from './SettingsPanelsA';
import { Send, Plus, ExternalLink, Check, RefreshCw, Loader2 } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { toast } from 'sonner';

/* ═══════════ SECTION 9: CRM ═══════════ */
export function CrmSettings({ settings, onChange }: any) {
    const c = settings?.crm || {};
    const set = (k: string, v: any) => onChange({ crm: { ...c, [k]: v } });
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">CRM & Leads</h2><p className="text-muted-foreground text-sm">Lead management, assignment rules, and duplicate detection.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsField label="Default Salesperson" value={c.defaultSalesperson} onChange={(v: string) => set('defaultSalesperson', v)} placeholder="Auto-assign" />
                <SettingsField label="Reminder Default (days)" value={c.reminderDefaults} onChange={(v: string) => set('reminderDefaults', parseInt(v) || 3)} placeholder="3" type="number" />
                <SettingsSelect label="Duplicate Detection" value={c.duplicateDetectionStrictness || 'medium'} onChange={(v: string) => set('duplicateDetectionStrictness', v)} options={[{ v: 'low', l: 'Low' }, { v: 'medium', l: 'Medium' }, { v: 'strict', l: 'Strict' }]} />
            </div>
            <Card><CardContent className="p-4">
                <SettingsToggle label="Auto-assign Leads to Salesperson" checked={c.autoAssignLeads ?? true} onChange={(v: boolean) => set('autoAssignLeads', v)} />
            </CardContent></Card>
        </div>
    );
}

/* ═══════════ SECTION 10: QUOTATIONS ═══════════ */
export function QuotationsSettings({ settings, onChange }: any) {
    const q = settings?.quotations || {};
    const set = (k: string, v: any) => onChange({ quotations: { ...q, [k]: v } });
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Quotations</h2><p className="text-muted-foreground text-sm">Quotation numbering and defaults.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsField label="Quotation Prefix" value={q.prefix || 'QT'} onChange={(v: string) => set('prefix', v)} placeholder="QT" />
                <SettingsField label="Validity (days)" value={q.validityDays || 15} onChange={(v: string) => set('validityDays', parseInt(v) || 15)} placeholder="15" type="number" />
            </div>
        </div>
    );
}

/* ═══════════ SECTION 11: WHATSAPP & NOTIFICATIONS ═══════════ */
export function WhatsappSettings({ settings, onChange }: any) {
    const w = settings?.whatsapp || {};
    const set = (k: string, v: any) => onChange({ whatsapp: { ...w, [k]: v } });
    const notifs = [
        { k: 'paymentAlerts', l: 'Payment Received Alerts' },
        { k: 'challanSent', l: 'Challan Sent Confirmation' },
        { k: 'lowStock', l: 'Low Stock Warnings' },
        { k: 'overdueInvoices', l: 'Overdue Invoice Reminders' },
        { k: 'newLeads', l: 'New Lead Notifications' },
    ];
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">WhatsApp & Notifications</h2><p className="text-muted-foreground text-sm">Configure messaging providers, templates, and alert rules.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsSelect label="Provider" value={w.provider || 'wati'} onChange={(v: string) => set('provider', v)} options={[{ v: 'wati', l: 'WATI' }, { v: 'twilio', l: 'Twilio' }, { v: 'meta', l: 'Meta Direct (Future)' }]} />
                <SettingsField label="API Key" value={w.apiKey} onChange={(v: string) => set('apiKey', v)} placeholder="wati_api_key_xxxxx" type="password" />
                <SettingsField label="Webhook URL" value={w.webhookUrl} onChange={(v: string) => set('webhookUrl', v)} placeholder="https://api.textilepro.in/webhooks/wa" />
                <SettingsField label="Sender Number" value={w.senderNumber} onChange={(v: string) => set('senderNumber', v)} placeholder="+91 98765 43210" />
            </div>
            <Card><CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm mb-2">Notification Toggles</h3>
                {notifs.map(n => (
                    <SettingsToggle key={n.k} label={n.l} checked={(w as any)[n.k] ?? true} onChange={(v: boolean) => set(n.k, v)} />
                ))}
            </CardContent></Card>
            <Button variant="outline" size="sm" onClick={async () => {
                try {
                    if (!w.apiKey || !w.senderNumber) {
                        toast.error('API Key and Sender Number are required to test.');
                        return;
                    }
                    const loadingId = toast.loading('Sending test message...');
                    await apiPost('/api/settings/whatsapp/test', {
                        provider: w.provider || 'wati',
                        apiKey: w.apiKey,
                        senderNumber: w.senderNumber
                    });
                    toast.dismiss(loadingId);
                    toast.success('Test message sent successfully on WhatsApp!');
                } catch (e: any) {
                    toast.dismiss();
                    toast.error(e.response?.data?.error?.message || 'Failed to send WhatsApp message.');
                }
            }}>
                <Send className="w-3.5 h-3.5 mr-2" />Send Test Message
            </Button>
        </div>
    );
}

/* ═══════════ SECTION 12: AI ═══════════ */
export function AiSettings({ settings, onChange }: any) {
    const ai = settings?.ai || {};
    const set = (k: string, v: any) => onChange({ ai: { ...ai, [k]: v } });
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">AI Settings</h2><p className="text-muted-foreground text-sm">Configure your AI workforce powered by OpenRouter.</p></div>
            <Card className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-purple-500/20">
                <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">AI Provider</p>
                    <p className="text-lg font-bold mt-1">OpenRouter</p>
                    <p className="text-sm text-muted-foreground mt-0.5">Model: <span className="font-mono text-primary">{ai.defaultModel || 'google/gemma-4-31b-it:free'}</span></p>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsField label="API Key" value={ai.apiKey} onChange={(v: string) => set('apiKey', v)} placeholder="sk-or-v1-xxxx" type="password" />
                <SettingsSelect label="Default Model" value={ai.defaultModel || 'google/gemma-4-31b-it:free'} onChange={(v: string) => set('defaultModel', v)} options={[{ v: 'google/gemma-4-31b-it:free', l: 'Gemma 4 31B (Free)' }, { v: 'meta-llama/llama-4-maverick:free', l: 'Llama 4 Maverick (Free)' }, { v: 'anthropic/claude-sonnet-4', l: 'Claude Sonnet 4' }, { v: 'openai/gpt-4.1', l: 'GPT-4.1' }]} />
                <SettingsField label="Token Budget / month" value={ai.tokenBudget} onChange={(v: string) => set('tokenBudget', parseInt(v) || 100000)} placeholder="100000" type="number" />
                <SettingsSelect label="AI Tone" value={ai.tone || 'professional'} onChange={(v: string) => set('tone', v)} options={[{ v: 'professional', l: 'Professional' }, { v: 'friendly', l: 'Friendly' }, { v: 'formal', l: 'Formal' }]} />
            </div>
            <Card><CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <SettingsToggle label="Multilingual Mode" checked={ai.multilingualMode ?? false} onChange={(v: boolean) => set('multilingualMode', v)} />
                <SettingsToggle label="Memory Enabled" checked={ai.memoryEnabled ?? true} onChange={(v: boolean) => set('memoryEnabled', v)} />
                <SettingsToggle label="Founder Copilot" checked={ai.founderCopilotEnabled ?? true} onChange={(v: boolean) => set('founderCopilotEnabled', v)} />
                <SettingsToggle label="Support Bot" checked={ai.supportBotEnabled ?? true} onChange={(v: boolean) => set('supportBotEnabled', v)} />
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">AI Usage This Month</p>
                <div className="flex justify-center gap-8">
                    <div><p className="text-2xl font-black text-primary">12,847</p><p className="text-xs text-muted-foreground">Tokens Used</p></div>
                    <div><p className="text-2xl font-black">47</p><p className="text-xs text-muted-foreground">Tasks Completed</p></div>
                    <div><p className="text-2xl font-black text-green-500">₹0</p><p className="text-xs text-muted-foreground">Cost (Free Tier)</p></div>
                </div>
            </CardContent></Card>
        </div>
    );
}

/* ═══════════ SECTION 13: MARKETPLACE ═══════════ */
export function MarketplaceSettings({ settings, onChange }: any) {
    const m = settings?.marketplace || {};
    const set = (k: string, v: any) => onChange({ marketplace: { ...m, [k]: v } });
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Marketplace / B2B Network</h2><p className="text-muted-foreground text-sm">Control your public listing and visibility in the TextilePro B2B network.</p></div>
            <Card><CardContent className="p-4 space-y-4">
                <SettingsToggle label="Enable Public Listing" checked={m.enablePublicListing ?? false} onChange={(v: boolean) => set('enablePublicListing', v)} />
                <SettingsToggle label="Show Phone Number" checked={m.showPhone ?? false} onChange={(v: boolean) => set('showPhone', v)} />
                <SettingsToggle label="Inquiry Notifications" checked={m.inquiryNotifications ?? true} onChange={(v: boolean) => set('inquiryNotifications', v)} />
            </CardContent></Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsSelect label="Business Visibility" value={m.businessVisibility || 'private'} onChange={(v: string) => set('businessVisibility', v)} options={[{ v: 'private', l: 'Private' }, { v: 'verified', l: 'Verified Only' }, { v: 'public', l: 'Public' }]} />
                <SettingsSelect label="Catalog Visibility" value={m.catalogVisibility || 'hidden'} onChange={(v: string) => set('catalogVisibility', v)} options={[{ v: 'hidden', l: 'Hidden' }, { v: 'partial', l: 'Partial' }, { v: 'full', l: 'Full Catalog' }]} />
            </div>
        </div>
    );
}

/* ═══════════ SECTION 14: HRMS ═══════════ */
export function HrmsSettings({ settings, onChange }: any) {
    const h = settings?.hrms || {};
    const set = (k: string, v: any) => onChange({ hrms: { ...h, [k]: v } });
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">HRMS & Payroll</h2><p className="text-muted-foreground text-sm">Attendance, shifts, and payroll configuration.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsSelect label="Attendance Mode" value={h.attendanceMode || 'mobile'} onChange={(v: string) => set('attendanceMode', v)} options={[{ v: 'mobile', l: 'Mobile App' }, { v: 'biometric', l: 'Biometric Device' }, { v: 'manual', l: 'Manual Register' }]} />
                <SettingsField label="Payroll Date" value={h.payrollDate} onChange={(v: string) => set('payrollDate', parseInt(v) || 1)} placeholder="1" type="number" />
            </div>
            <Card><CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <SettingsToggle label="GPS Required" checked={h.gpsRequired ?? true} onChange={(v: boolean) => set('gpsRequired', v)} />
                <SettingsToggle label="Selfie Required" checked={h.selfieRequired ?? false} onChange={(v: boolean) => set('selfieRequired', v)} />
            </CardContent></Card>
        </div>
    );
}

/* ═══════════ SECTION 15: SECURITY ═══════════ */
export function SecuritySettings({ settings, onChange }: any) {
    const s = settings?.security || {};
    const set = (k: string, v: any) => onChange({ security: { ...s, [k]: v } });
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Security</h2><p className="text-muted-foreground text-sm">Authentication, session management, and access controls.</p></div>
            <Card><CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <SettingsToggle label="Two-Factor Authentication (2FA)" checked={s.twoFactorAuth ?? false} onChange={(v: boolean) => set('twoFactorAuth', v)} />
                <SettingsToggle label="Biometric Mobile Login" checked={s.biometricMobileLogin ?? false} onChange={(v: boolean) => set('biometricMobileLogin', v)} />
                <SettingsToggle label="Export Restrictions" checked={s.exportRestrictions ?? false} onChange={(v: boolean) => set('exportRestrictions', v)} />
                <SettingsToggle label="Screenshot Protection (Mobile)" checked={s.screenshotProtectionMobile ?? false} onChange={(v: boolean) => set('screenshotProtectionMobile', v)} />
                <SettingsToggle label="Audit Strict Mode" checked={s.auditStrictMode ?? false} onChange={(v: boolean) => set('auditStrictMode', v)} />
            </CardContent></Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsField label="Session Timeout (minutes)" value={s.sessionTimeoutMins} onChange={(v: string) => set('sessionTimeoutMins', parseInt(v) || 30)} placeholder="30" type="number" />
            </div>
            <Card><CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3">Active Devices</h3>
                {['Chrome on MacOS · Surat · Now', 'Safari on iPhone · Surat · 2h ago'].map((d, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                        <p className="text-sm">{d}</p>
                        <Button variant="ghost" size="sm" className="text-destructive">Revoke</Button>
                    </div>
                ))}
                <Button variant="destructive" size="sm" className="mt-3">Logout All Devices</Button>
            </CardContent></Card>
        </div>
    );
}

/* ═══════════ SECTION 16: INTEGRATIONS ═══════════ */
export function IntegrationsSettings({ settings }: any) {
    const integrations = [
        { name: 'Tally', icon: '📊' },
        { name: 'Zoho Books', icon: '📘' },
        { name: 'Shopify', icon: '🛒' },
        { name: 'Shiprocket', icon: '🚀' },
        { name: 'Razorpay', icon: '💳' },
        { name: 'Cashfree', icon: '💰' },
        { name: 'Gmail', icon: '📧' },
        { name: 'Slack', icon: '💬' },
    ];
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Integrations</h2><p className="text-muted-foreground text-sm">Connect and manage third-party services.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map(ig => (
                    <Card key={ig.name} className="transition-all hover:border-primary/30">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{ig.icon}</span>
                                <div>
                                    <p className="font-semibold text-sm">{ig.name}</p>
                                    <p className="text-xs text-muted-foreground">Not connected</p>
                                </div>
                            </div>
                            <Button size="sm">Connect</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Button variant="outline" size="sm"><RefreshCw className="w-3.5 h-3.5 mr-2" />View Sync Logs</Button>
        </div>
    );
}
