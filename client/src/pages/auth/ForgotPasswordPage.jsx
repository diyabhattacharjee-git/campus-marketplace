import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MailCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { forgotPasswordSchema } from '@/schemas/authSchemas';
import { ROUTES } from '@/constants/routes';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values) => {
    // The backend always responds the same way whether or not the email
    // exists (see auth.service.js) — this prevents using this form to
    // enumerate registered accounts, so we show the same success state
    // unconditionally too.
    await forgotPassword(values.email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold">Check your email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for that email, we’ve sent a link to reset your password.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">Reset your password</h2>
      <p className="mt-1 text-sm text-muted-foreground">We’ll email you a link to reset it.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">College email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@college.edu"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
