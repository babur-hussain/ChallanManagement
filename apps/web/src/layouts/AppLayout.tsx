import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { cn } from '@/lib/utils';
import { useSettingsData } from '@/hooks/api/useSettings';
import { useThemeStore } from '@/stores/themeStore';

// ═══════════════════════════════════════════════════════════════
// App Layout — authenticated shell with sidebar + topbar
// ═══════════════════════════════════════════════════════════════

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const { data: settings } = useSettingsData();

  useEffect(() => {
    if (settings) {
      useThemeStore.getState().hydrateFromSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        console.log('Search triggered');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          "transition-all duration-300",
          isMobile ? "ml-0" : sidebarOpen ? "ml-64" : "ml-[72px]"
        )}
      >
        <TopBar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
        />

        <main className="p-4 md:p-6 lg:p-8">
          <Breadcrumb />
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
