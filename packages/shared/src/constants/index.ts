import type { UserRole } from '../types';

// ═══════════════════════════════════════════════════════════════
// @textilepro/shared — Constants
// Business constants, role permissions, plan limits, formatting helpers
// ═══════════════════════════════════════════════════════════════

// ─── Plan Limits ────────────────────────────────────────────

export const PLAN_LIMITS = {
  BASIC: {
    maxUsers: 1,
    features: ['challans', 'parties'] as string[],
  },
  STANDARD: {
    maxUsers: 3,
    features: ['challans', 'parties', 'invoices', 'fabric_master', 'crm', 'quotations', 'collections', 'whatsapp'] as string[],
  },
  PROFESSIONAL: {
    maxUsers: 10,
    features: [
      'challans', 'parties', 'invoices', 'fabric_master',
      'reports', 'brokers', 'inventory', 'crm', 'quotations', 'collections', 'whatsapp'
    ] as string[],
  },
  ENTERPRISE: {
    maxUsers: -1, // unlimited
    features: ['*'] as string[],
  },
} as const;

// ─── Role Permissions ───────────────────────────────────────

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  OWNER: ['*'], // Full access to everything
  ACCOUNTANT: [
    'challans:read',
    'challans:write',
    'invoices:read',
    'invoices:write',
    'reports:read',
    'parties:read',
    'parties:write',
    'fabric_master:read',
    'fabric_master:write',
    'brokers:read',
    'brokers:write',
    'inventory:read',
    'inventory:write',
    'billing:read',
    'billing:write',
    'quotations:read',
  ],
  SALESMAN: [
    'challans:create',
    'challans:read_own',
    'parties:read',
    'fabric_master:read',
    'crm:read_own',
    'crm:write_own',
    'quotations:read_own',
    'quotations:write_own',
  ],
  DELIVERY_BOY: [
    'challans:read_assigned',
    'challans:mark_delivered',
  ],
  REGIONAL_MANAGER: [
    'reports:read',
    'crm:read',
    'parties:read',
    'challans:read',
    'inventory:read'
  ],
  HR_MANAGER: [
    'employees:read',
    'employees:write',
    'attendance:read',
    'attendance:write',
    'payroll:read',
    'payroll:write'
  ],
  AUDITOR: [
    'reports:read',
    'invoices:read',
    'challans:read',
    'parties:read',
    'audit_logs:read'
  ]
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

// ─── Rate Limits ────────────────────────────────────────────

export const RATE_LIMITS = {
  GLOBAL: { max: 1000, windowMs: 15 * 60 * 1000 }, // 1000 per 15 min
  AUTH: { max: 20, windowMs: 15 * 60 * 1000 },      // 20 per 15 min
  PDF: { max: 50, windowMs: 60 * 60 * 1000 },       // 50 per hour
  WHATSAPP: { max: 100, windowMs: 60 * 60 * 1000 }, // 100 per hour
} as const;

// ─── Session Config ─────────────────────────────────────────

export const SESSION_CONFIG = {
  JWT_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY: '30d',
  MAX_CONCURRENT_SESSIONS: 5,
  REFRESH_TOKEN_PREFIX: 'refresh_token:',
  SESSION_PREFIX: 'session:',
} as const;

// ─── Indian Formatting Helpers ──────────────────────────────

/**
 * Format a number in Indian numbering system (lakhs, crores)
 * e.g., 123456.78 → "1,23,456.78"
 */
export function formatINR(amount: number): string {
  const parts = amount.toFixed(2).split('.');
  const integerPart = parts[0]!;
  const decimalPart = parts[1]!;

  // For negative numbers
  const isNegative = integerPart.startsWith('-');
  const absInteger = isNegative ? integerPart.slice(1) : integerPart;

  let result: string;
  if (absInteger.length <= 3) {
    result = absInteger;
  } else {
    // Last 3 digits separated, then groups of 2
    const lastThree = absInteger.slice(-3);
    const remaining = absInteger.slice(0, -3);
    const groups = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${groups},${lastThree}`;
  }

  return `${isNegative ? '-' : ''}₹${result}.${decimalPart}`;
}

/**
 * Format a Date to Indian standard: DD/MM/YYYY
 */
export function formatIndianDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format a Date to ISO for API inputs: YYYY-MM-DD
 */
export function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

// ─── Indian States ──────────────────────────────────────────

export const INDIAN_STATES = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
] as const;

// ─── GST Rates (India standard) ─────────────────────────────

export const GST_RATES = [0, 5, 12, 18, 28] as const;

// ─── Fabric Units ───────────────────────────────────────────

export const FABRIC_UNITS = [
  { value: 'METER', label: 'Meter (m)', labelHi: 'मीटर' },
  { value: 'YARD', label: 'Yard (yd)', labelHi: 'गज' },
  { value: 'KG', label: 'Kilogram (kg)', labelHi: 'किलोग्राम' },
  { value: 'PIECE', label: 'Piece (pc)', labelHi: 'पीस' },
  { value: 'THAN', label: 'Than (थान)', labelHi: 'थान' },
] as const;

// ─── Navigation Items ───────────────────────────────────────

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', labelHi: 'डैशबोर्ड', path: '/app/dashboard', icon: 'LayoutDashboard', requiredFeature: null },
  { id: 'crm', label: 'CRM Leads', labelHi: 'लीड्स', path: '/app/crm/leads', icon: 'Target', requiredFeature: 'crm' },
  { id: 'tasks', label: 'Follow-ups', labelHi: 'फॉलो-अप', path: '/app/crm/tasks', icon: 'ListTodo', requiredFeature: 'crm' },
  {
    id: 'visits', label: 'Field Map', labelHi: 'फ़ील्ड मैप', path: '/app/crm/visits', icon: 'MapPin', requiredFeature: 'crm', subItems: [
      { icon: 'ShieldAlert', label: 'Feature Flags', path: '/app/ops/flags', requiredModule: 'TEXTILE_CORE' },
      { icon: 'Rocket', label: 'Growth OS', path: '/app/ops/growth', requiredModule: 'TEXTILE_CORE' },
      { icon: 'Map', label: 'City Domination', path: '/app/ops/growth/map', requiredModule: 'TEXTILE_CORE' },
      { icon: 'Columns', label: 'Pipeline', path: '/app/ops/growth/pipeline', requiredModule: 'TEXTILE_CORE' },
      { icon: 'Sword', label: 'War Room', path: '/app/ops/growth/war-room', requiredModule: 'TEXTILE_CORE' },
    ]
  },
  { id: 'leaderboards', label: 'Leaderboards', labelHi: 'लीडरबोर्ड', path: '/app/crm/leaderboards', icon: 'Trophy', requiredFeature: 'crm' },
  { id: 'quotations', label: 'Quotations', labelHi: 'कोटेशन', path: '/app/quotations', icon: 'FileCheck', requiredFeature: 'quotations' },
  { id: 'collections', label: 'Collections', labelHi: 'वसूली', path: '/app/collections', icon: 'Wallet', requiredFeature: 'collections' },
  { id: 'ai-workforce', label: 'AI Workforce OS', labelHi: 'AI वर्कफ़ोर्स', path: '/app/ai', icon: 'BrainCircuit', requiredFeature: null },
  { id: 'settings', label: 'Settings', labelHi: 'सेटिंग्स', path: '/app/settings', icon: 'Settings', requiredFeature: null },
  {
    id: 'integrations', label: 'App Store', labelHi: 'ऐप्प स्टोर', path: '/app/integrations', icon: 'Link', requiredFeature: null, subItems: [
      { icon: 'Server', label: 'Marketplace', path: '/app/integrations' },
      { icon: 'KeyRound', label: 'Developer API Keys', path: '/app/integrations/api-keys' },
      { icon: 'Webhook', label: 'Webhooks', path: '/app/integrations/webhooks' },
    ]
  },
  { id: 'whatsapp', label: 'WhatsApp Hub', labelHi: 'वॉट्सएप हब', path: '/app/whatsapp', icon: 'MessageCircle', requiredFeature: 'whatsapp' },
  { id: 'challans', label: 'Challans', labelHi: 'चालान', path: '/app/challans', icon: 'FileText', requiredFeature: 'challans' },
  { id: 'invoices', label: 'Invoices', labelHi: 'इन्वॉइस', path: '/app/invoices', icon: 'Receipt', requiredFeature: 'invoices' },
  { id: 'master', label: 'Masters', labelHi: 'मास्टर', path: '/app/items', icon: 'Database', requiredFeature: null },
  { id: 'parties', label: 'Parties', labelHi: 'पार्टी', path: '/app/parties', icon: 'Users', requiredFeature: null },
  { id: 'inventory', label: 'Inventory', labelHi: 'इन्वेंटरी', path: '/app/inventory', icon: 'Package', requiredFeature: 'inventory' },
  { id: 'billing', label: 'Billing & GST', labelHi: 'बिलिंग और GST', path: '/app/billing', icon: 'Receipt', requiredFeature: 'invoices' },
  { id: 'brokers', label: 'Brokers', labelHi: 'दलाल', path: '/app/brokers', icon: 'Handshake', requiredFeature: 'brokers' },
  { id: 'reports', label: 'Reports', labelHi: 'रिपोर्ट', path: '/app/reports', icon: 'BarChart3', requiredFeature: 'reports' },
  { id: 'finance', label: 'Finance OS', labelHi: 'फायनेंस', path: '/app/finance', icon: 'Wallet', requiredFeature: null },
  { id: 'enterprise', label: 'Enterprise & HR', labelHi: 'एंटरप्राइज़', path: '/app/enterprise', icon: 'Building2', requiredFeature: null },
  { id: 'marketplace', label: 'B2B Network', labelHi: 'B2B नेटवर्क', path: '/app/marketplace', icon: 'Globe', requiredFeature: null },
  { id: 'saas', label: 'Platform OS', labelHi: 'मंच', path: '/app/saas', icon: 'Cloud', requiredFeature: null },
  { id: 'ops', label: 'DevOps / Root', labelHi: 'ऑपरेशंस', path: '/app/ops', icon: 'TerminalSquare', requiredFeature: null },
  { id: 'settings', label: 'Settings', labelHi: 'सेटिंग्स', path: '/app/settings', icon: 'Settings', requiredFeature: null },
] as const;
