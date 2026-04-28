import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { UserRole } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Role Guard — restricts access by user role
// ═══════════════════════════════════════════════════════════════

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    toast.error('Access denied. You don\'t have permission to view this page.');
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}
