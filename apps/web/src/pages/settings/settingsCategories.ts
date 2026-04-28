import { Building2, Users, GitBranch, CreditCard, FileText, Receipt, Package, Landmark, Target, MessageSquare, Bot, Store, HardHat, Shield, Plug, BarChart3, Palette, Zap, Database, ScrollText, Code, Headphones, AlertTriangle, BookOpen, Clock } from 'lucide-react';

export interface SettingsCategory {
    id: string;
    label: string;
    icon: any;
    keywords: string[];
    danger?: boolean;
}

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
    { id: 'profile', label: 'Business Profile', icon: Building2, keywords: ['company', 'logo', 'gstin', 'pan', 'address', 'phone', 'email', 'timezone', 'currency', 'language', 'branding'] },
    { id: 'users', label: 'Users & Roles', icon: Users, keywords: ['staff', 'permissions', 'role', 'owner', 'manager', 'accountant', 'salesman', 'warehouse', 'delivery', 'hr', 'password', 'deactivate'] },
    { id: 'branches', label: 'Branches', icon: GitBranch, keywords: ['branch', 'location', 'multi-branch', 'warehouse', 'office'] },
    { id: 'billing', label: 'Billing & Subscription', icon: CreditCard, keywords: ['plan', 'subscription', 'renewal', 'usage', 'storage', 'credits', 'upgrade', 'downgrade', 'payment', 'invoice history'] },
    { id: 'challans', label: 'Challans', icon: FileText, keywords: ['challan', 'numbering', 'prefix', 'suffix', 'financial year', 'terms', 'remarks', 'rates', 'vehicle', 'broker', 'pdf', 'whatsapp', 'signature', 'template'] },
    { id: 'invoices', label: 'Invoices & GST', icon: Receipt, keywords: ['invoice', 'gst', 'hsn', 'tax', 'e-invoice', 'eway bill', 'payment terms', 'due days', 'place of supply'] },
    { id: 'inventory', label: 'Inventory', icon: Package, keywords: ['stock', 'low stock', 'negative stock', 'reserve', 'transfer', 'roll', 'barcode'] },
    { id: 'finance', label: 'Finance & Accounts', icon: Landmark, keywords: ['financial year', 'chart of accounts', 'bank', 'cash', 'expense', 'journal', 'tds'] },
    { id: 'crm', label: 'CRM & Leads', icon: Target, keywords: ['lead', 'assign', 'salesperson', 'reminder', 'duplicate', 'quick replies'] },
    { id: 'quotations', label: 'Quotations', icon: BookOpen, keywords: ['quote', 'quotation', 'estimate', 'proposal'] },
    { id: 'whatsapp', label: 'WhatsApp & Notifications', icon: MessageSquare, keywords: ['whatsapp', 'wati', 'twilio', 'meta', 'api key', 'webhook', 'template', 'sender', 'notification', 'alert', 'sms'] },
    { id: 'ai', label: 'AI Settings', icon: Bot, keywords: ['ai', 'openrouter', 'model', 'gemma', 'token', 'tone', 'multilingual', 'memory', 'copilot', 'support bot'] },
    { id: 'marketplace', label: 'Marketplace / B2B', icon: Store, keywords: ['public listing', 'visibility', 'phone', 'inquiry', 'trust badge', 'catalog', 'city'] },
    { id: 'hrms', label: 'HRMS & Payroll', icon: HardHat, keywords: ['attendance', 'gps', 'selfie', 'shift', 'overtime', 'leave', 'payroll', 'salary'] },
    { id: 'security', label: 'Security', icon: Shield, keywords: ['2fa', 'biometric', 'password', 'session', 'ip', 'export', 'screenshot', 'audit', 'devices'] },
    { id: 'integrations', label: 'Integrations', icon: Plug, keywords: ['tally', 'zoho', 'shopify', 'shiprocket', 'razorpay', 'cashfree', 'gmail', 'slack', 'connect', 'sync'] },
    { id: 'reports', label: 'Reports & Exports', icon: BarChart3, keywords: ['export', 'format', 'scheduled', 'email', 'mis', 'watermark', 'logo'] },
    { id: 'mobile', label: 'Mobile App', icon: Clock, keywords: ['mobile', 'app', 'preferences', 'push notification'] },
    { id: 'appearance', label: 'Appearance', icon: Palette, keywords: ['theme', 'dark', 'light', 'accent', 'compact', 'font', 'table density'] },
    { id: 'automations', label: 'Automation Rules', icon: Zap, keywords: ['automation', 'rule', 'trigger', 'action', 'overdue', 'stock', 'lead', 'payment', 'churn'] },
    { id: 'backup', label: 'Backup & Data', icon: Database, keywords: ['backup', 'export', 'import', 'restore', 'retention'] },
    { id: 'audit', label: 'Audit Logs', icon: ScrollText, keywords: ['audit', 'log', 'who', 'changed', 'suspicious', 'login'] },
    { id: 'developer', label: 'API Keys / Developer', icon: Code, keywords: ['api key', 'webhook', 'rate limit', 'docs', 'sandbox'] },
    { id: 'support', label: 'Support', icon: Headphones, keywords: ['chat', 'support', 'onboarding', 'feature request', 'docs', 'version'] },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, keywords: ['deactivate', 'delete', 'revoke', 'disable', 'close account', 'permanent'], danger: true },
];
