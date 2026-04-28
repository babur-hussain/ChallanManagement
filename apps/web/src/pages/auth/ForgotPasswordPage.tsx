import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════
// Forgot Password Page
// ═══════════════════════════════════════════════════════════════

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { resetPassword, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Failed to send reset email. Please try again.');
    }
  };

  if (sent) {
    return (
      <div className="text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
        <p className="text-muted-foreground mb-6">
          We've sent a password reset link to{' '}
          <span className="font-medium text-foreground">{getValues('email')}</span>
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            onClick={() => setSent(false)}
            className="text-primary hover:text-primary/80 font-medium"
          >
            try again
          </button>
        </p>
        <Link to="/login">
          <Button variant="outline" size="lg" className="w-full h-12">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Reset your password</h2>
        <p className="text-muted-foreground mt-1">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@business.com"
              className="pl-10"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-12"
          isLoading={isLoading}
          disabled={isLoading}
          id="reset-submit-btn"
        >
          Send Reset Link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          to="/login"
          className="text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
