import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════
// Theme Store — Dark/Light mode with localStorage persistence
// Respects system preference on first visit
// ═══════════════════════════════════════════════════════════════

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  accentColor: string;
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  tableDensity: 'compact' | 'comfortable' | 'spacious';

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setAccentColor: (color: string) => void;
  setCompactMode: (isCompact: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setTableDensity: (density: 'compact' | 'comfortable' | 'spacious') => void;
  hydrateFromSettings: (settings: any) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('textilepro-theme') as Theme | null;
  return stored || 'system';
}

function applyTheme(resolved: 'light' | 'dark'): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
}

function hexToHSL(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyAccentColor(hex: string): void {
  const hsl = hexToHSL(hex);
  const root = document.documentElement;
  root.style.setProperty('--primary', hsl);
  root.style.setProperty('--ring', hsl);
  root.style.setProperty('--sidebar-primary', hsl);
  root.style.setProperty('--sidebar-ring', hsl);
}

function applyLayoutModes(compactMode: boolean, fontSize: string, tableDensity: string) {
  const root = document.documentElement;
  root.classList.toggle('compact-mode', compactMode);
  root.setAttribute('data-font-size', fontSize);
  root.setAttribute('data-table-density', tableDensity);
}

const initialTheme = getInitialTheme();
const initialResolved = resolveTheme(initialTheme);

// Apply theme immediately to avoid flash
if (typeof window !== 'undefined') {
  applyTheme(initialResolved);
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  resolvedTheme: initialResolved,
  accentColor: '#F97316',
  compactMode: false,
  fontSize: 'medium',
  tableDensity: 'comfortable',

  setTheme: (theme: Theme) => {
    const resolved = resolveTheme(theme);
    localStorage.setItem('textilepro-theme', theme);
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.resolvedTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('textilepro-theme', newTheme);
      applyTheme(newTheme);
      return { theme: newTheme, resolvedTheme: newTheme };
    });
  },

  setAccentColor: (color: string) => {
    applyAccentColor(color);
    set({ accentColor: color });
  },

  setCompactMode: (isCompact: boolean) => {
    set((state) => {
      applyLayoutModes(isCompact, state.fontSize, state.tableDensity);
      return { compactMode: isCompact };
    });
  },

  setFontSize: (size: 'small' | 'medium' | 'large') => {
    set((state) => {
      applyLayoutModes(state.compactMode, size, state.tableDensity);
      return { fontSize: size };
    });
  },

  setTableDensity: (density: 'compact' | 'comfortable' | 'spacious') => {
    set((state) => {
      applyLayoutModes(state.compactMode, state.fontSize, density);
      return { tableDensity: density };
    });
  },

  hydrateFromSettings: (settings: any) => {
    if (!settings || !settings.appearance) return;
    const a = settings.appearance;

    // Theme
    if (a.theme) {
      const resolved = resolveTheme(a.theme);
      applyTheme(resolved);
      localStorage.setItem('textilepro-theme', a.theme);
      set({ theme: a.theme, resolvedTheme: resolved });
    }

    // Accent Color
    if (a.accentColor) {
      applyAccentColor(a.accentColor);
      set({ accentColor: a.accentColor });
    }

    // Layout flags
    const comp = a.compactMode ?? false;
    const fs = a.fontSize || 'medium';
    const td = a.tableDensity || 'comfortable';

    applyLayoutModes(comp, fs, td);
    set({ compactMode: comp, fontSize: fs, tableDensity: td });
  }
}));

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useThemeStore.getState();
    if (state.theme === 'system') {
      const resolved = getSystemTheme();
      applyTheme(resolved);
      useThemeStore.setState({ resolvedTheme: resolved });
    }
  });
}
