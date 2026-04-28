import { useSearchParams, Link } from 'react-router-dom';
import { Check, ArrowLeft, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════
// Upgrade Page — shown when user tries to access a feature
// not available in their current plan
// ═══════════════════════════════════════════════════════════════

const plans = [
  {
    id: 'BASIC',
    name: 'Basic',
    price: 0,
    period: 'Free forever',
    features: ['1 User', 'Challans', 'Parties', 'Basic Reports'],
    notIncluded: ['Invoices', 'Fabric Master', 'Brokers', 'Advanced Reports', 'Inventory'],
  },
  {
    id: 'STANDARD',
    name: 'Standard',
    price: 999,
    period: '/month',
    popular: true,
    features: ['3 Users', 'Challans', 'Parties', 'Invoices', 'Fabric Master', 'Email Support'],
    notIncluded: ['Brokers', 'Advanced Reports', 'Inventory'],
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: 2499,
    period: '/month',
    features: [
      '10 Users', 'Everything in Standard', 'Reports & Analytics',
      'Brokers Management', 'Inventory Tracking', 'WhatsApp Integration', 'Priority Support',
    ],
    notIncluded: [],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: -1,
    period: 'Custom pricing',
    features: [
      'Unlimited Users', 'Everything in Professional', 'Custom Integrations',
      'Dedicated Support', 'SLA Guarantee', 'On-premise Option', 'API Access',
    ],
    notIncluded: [],
  },
];

export function UpgradePage() {
  const [searchParams] = useSearchParams();
  const requestedFeature = searchParams.get('feature');
  const { business } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <Link to="/app/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl gradient-saffron flex items-center justify-center">
            <Crown className="w-7 h-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Upgrade Your Plan
        </h1>
        {requestedFeature && (
          <p className="text-muted-foreground text-lg">
            <span className="font-medium text-foreground capitalize">
              {requestedFeature.replace('_', ' ')}
            </span>{' '}
            requires a higher plan. Choose the right one for your business.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = business?.plan === plan.id;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                plan.popular && "border-primary shadow-lg ring-1 ring-primary/20",
                isCurrent && "border-success"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute top-0 left-0">
                  <Badge variant="success" className="rounded-none rounded-br-lg px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4 pt-8">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-3">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold">Free</span>
                  ) : plan.price === -1 ? (
                    <span className="text-2xl font-bold">Contact Us</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm text-muted-foreground/50 line-through">
                      <Check className="w-4 h-4 shrink-0 mt-0.5 opacity-30" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full mt-4"
                  variant={plan.popular ? 'default' : 'outline'}
                  disabled={isCurrent}
                >
                  {isCurrent ? 'Current Plan' : plan.price === -1 ? 'Contact Sales' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
