import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye, EyeOff, Building2, User, Mail, Phone, Lock,
  ArrowLeft, ArrowRight, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/authStore';
import { registerSchema, type RegisterInput } from '@textilepro/shared';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════
// Register Page — Multi-step form (3 steps)
// Step 1: Business Info | Step 2: Owner Info | Step 3: Password
// ═══════════════════════════════════════════════════════════════

const STEPS = [
  { id: 1, title: 'Business', icon: Building2 },
  { id: 2, title: 'Your Details', icon: User },
  { id: 3, title: 'Security', icon: Lock },
];

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const goToStep = async (targetStep: number) => {
    if (targetStep > step) {
      let fieldsToValidate: (keyof RegisterInput)[] = [];
      if (step === 1) fieldsToValidate = ['businessName'];
      if (step === 2) fieldsToValidate = ['ownerName', 'mobile', 'email'];
      
      const valid = await trigger(fieldsToValidate);
      if (!valid) return;
    }
    setStep(targetStep);
  };

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser({
        businessName: data.businessName,
        gstin: data.gstin || undefined,
        ownerName: data.ownerName,
        mobile: data.mobile,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created successfully! 🎉');
      navigate('/app/dashboard', { replace: true });
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
        <p className="text-muted-foreground mt-1">
          Start managing your textile business in minutes
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isActive = step === s.id;

            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    isCompleted
                      ? 'bg-success text-success-foreground'
                      : isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
        <Progress value={(step / 3) * 100} className="h-1.5" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Business Info */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="businessName"
                  placeholder="e.g. Shree Krishna Textiles"
                  className="pl-10"
                  {...register('businessName')}
                />
              </div>
              {errors.businessName && (
                <p className="text-xs text-destructive">{errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstin">
                GSTIN <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="gstin"
                placeholder="e.g. 24AABCU9603R1ZP"
                className="uppercase"
                maxLength={15}
                {...register('gstin')}
              />
              {errors.gstin && (
                <p className="text-xs text-destructive">{errors.gstin.message}</p>
              )}
              <p className="text-xs text-muted-foreground">You can add this later in settings</p>
            </div>

            <Button
              type="button"
              size="lg"
              className="w-full h-12 mt-4"
              onClick={() => goToStep(2)}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Step 2: Owner Info */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="ownerName">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="ownerName"
                  placeholder="Your full name"
                  className="pl-10"
                  {...register('ownerName')}
                />
              </div>
              {errors.ownerName && (
                <p className="text-xs text-destructive">{errors.ownerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="9876543210"
                  className="pl-[4.5rem]"
                  maxLength={10}
                  {...register('mobile')}
                />
              </div>
              {errors.mobile && (
                <p className="text-xs text-destructive">{errors.mobile.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@business.com"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1 h-12"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                type="button"
                size="lg"
                className="flex-1 h-12"
                onClick={() => goToStep(3)}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="password">Create Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  className="pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}

              {/* Password strength hints */}
              <div className="grid grid-cols-2 gap-1 mt-2">
                {[
                  { test: /.{8,}/, label: '8+ characters' },
                  { test: /[A-Z]/, label: 'Uppercase letter' },
                  { test: /[a-z]/, label: 'Lowercase letter' },
                  { test: /[0-9]/, label: 'Number' },
                  { test: /[^A-Za-z0-9]/, label: 'Special character' },
                ].map(({ test, label }) => {
                  const pwd = watch('password') || '';
                  const passes = test.test(pwd);
                  return (
                    <div key={label} className="flex items-center gap-1.5">
                      <div
                        className={`w-3 h-3 rounded-full flex items-center justify-center ${
                          passes ? 'bg-success' : 'bg-muted'
                        }`}
                      >
                        {passes && <Check className="w-2 h-2 text-white" />}
                      </div>
                      <span
                        className={`text-xs ${passes ? 'text-success' : 'text-muted-foreground'}`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1 h-12"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-1 h-12"
                isLoading={isLoading}
                disabled={isLoading}
                id="register-submit-btn"
              >
                Create Account
              </Button>
            </div>
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:text-primary/80 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
