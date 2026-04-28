import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { PLAN_LIMITS } from '@textilepro/shared';
import type { Plan } from '@textilepro/shared';

// ═══════════════════════════════════════════════════════════════
// Plan Guard — restricts access by business plan
// ═══════════════════════════════════════════════════════════════

interface PlanGuardProps {
  children: React.ReactNode;
  requiredFeature: string;
}

export function PlanGuard({ children, requiredFeature }: PlanGuardProps) {
  const { business } = useAuthStore();

  if (!business) {
    return <Navigate to="/login" replace />;
  }

  const plan = business.plan as Plan;
  const planConfig = PLAN_LIMITS[plan];

  if (!planConfig) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const hasFeature =
    planConfig.features.includes('*') ||
    planConfig.features.includes(requiredFeature);

  if (!hasFeature) {
    return (
      <Navigate
        to={`/app/upgrade?feature=${encodeURIComponent(requiredFeature)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}
