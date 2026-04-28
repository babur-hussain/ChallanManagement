import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════
// Breadcrumb — auto-generated from current route path
// ═══════════════════════════════════════════════════════════════

const labelMap: Record<string, string> = {
  app: 'Home',
  dashboard: 'Dashboard',
  challans: 'Challans',
  parties: 'Parties',
  'items': 'Fabric Master',
  inventory: 'Inventory',
  billing: 'Billing & GST',
  brokers: 'Brokers',
  reports: 'Reports',
  settings: 'Settings',
  new: 'New',
  edit: 'Edit',
};

export function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumb on dashboard
  if (pathSegments.length <= 2 && pathSegments.includes('dashboard')) {
    return null;
  }

  const crumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;
    const isFirst = index === 0;

    return { path, label, isLast, isFirst, segment };
  });

  return (
    <nav className="flex items-center gap-1.5 text-sm py-3 px-1" aria-label="Breadcrumb">
      {crumbs.map((crumb) => (
        <div key={crumb.path} className="flex items-center gap-1.5">
          {!crumb.isFirst && (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          )}
          {crumb.isFirst ? (
            <Link
              to="/app/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          ) : crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                "hover:underline underline-offset-4"
              )}
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
