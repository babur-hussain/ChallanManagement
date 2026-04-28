// ═══════════════════════════════════════════════════════════════
// Design System — Centralized theme tokens
// ═══════════════════════════════════════════════════════════════

export const colors = {
    // Brand
    primary: '#00CEC8',       // Teal Cyan
    primaryDark: '#00A8A3',   // Darker shade
    primaryLight: '#80E7E4',  // Lighter shade

    // Neutrals
    background: '#f9fafb',    // Gray 50
    surface: '#ffffff',
    surfaceAlt: '#f1f5f9',    // Slate 100
    border: '#e5e7eb',        // Gray 200
    borderLight: '#f3f4f6',   // Gray 100

    // Text
    textPrimary: '#111827',   // Gray 900
    textSecondary: '#6b7280', // Gray 500
    textMuted: '#9ca3af',     // Gray 400
    textInverse: '#ffffff',

    // Semantic
    success: '#16a34a',       // Green 600
    successBg: '#dcfce7',     // Green 100
    error: '#dc2626',         // Red 600
    errorBg: '#fef2f2',       // Red 50
    warning: '#d97706',       // Amber 600
    warningBg: '#fef3c7',     // Amber 100
    info: '#2563eb',          // Blue 600
    infoBg: '#dbeafe',        // Blue 100

    // Dark header / admin
    headerDark: '#0f172a',    // Slate 900
    headerBlue: '#1e3a8a',    // Blue 900
    indigo: '#4f46e5',        // Indigo 600
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
} as const;

export const radius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
} as const;

export const typography = {
    h1: { fontSize: 28, fontWeight: 'bold' as const, color: colors.textPrimary },
    h2: { fontSize: 24, fontWeight: 'bold' as const, color: colors.textPrimary },
    h3: { fontSize: 20, fontWeight: 'bold' as const, color: colors.textPrimary },
    h4: { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary },
    body: { fontSize: 16, color: colors.textPrimary },
    bodySmall: { fontSize: 14, color: colors.textSecondary },
    caption: { fontSize: 12, color: colors.textMuted },
    label: { fontSize: 12, fontWeight: 'bold' as const, color: colors.textSecondary, textTransform: 'uppercase' as const },
} as const;

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
} as const;
