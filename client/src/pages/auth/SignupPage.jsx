import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MailCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { signupSchema } from '@/schemas/authSchemas';
import { ROUTES } from '@/constants/routes';

export default function SignupPage() {
  const { signup, resendVerification } = useAuth();
  const [serverError, setServerError] = useState(null);
  const [submittedEmail, setSubmittedEmail] = useState(null); // set once signup succeeds
  const [resendState, setResendState] = useState('idle'); // idle | sending | sent

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values) => {
    setServerError(null);
    try {
      await signup(values);
      setSubmittedEmail(values.email);
    } catch (err) {
      setServerError(err.message || 'Could not create your account. Please try again.');
    }
  };

  const handleResend = async () => {
    setResendState('sending');
    try {
      await resendVerification(submittedEmail);
    } finally {
      setResendState('sent');
    }
  };

  // Post-signup: account exists but is unverified. Show the "check your
  // inbox" state instead of the form — signup deliberately does NOT log
  // the user in (see AuthContext.signup).
  if (submittedEmail) {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold">Check your email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a verification link to <span className="font-medium text-foreground">{submittedEmail}</span>.
          Click it to activate your account and log in.
        </p>
        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={handleResend}
          disabled={resendState === 'sending' || resendState === 'sent'}
        >
          {resendState === 'sending' && <Loader2 className="animate-spin" />}
          {resendState === 'sent' ? 'Verification email sent' : 'Resend email'}
        </Button>
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
      <h2 className="font-display text-2xl font-semibold">Create your account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Use your college email — you’ll verify it in the next step.
      </p>

      {serverError && (
        <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            placeholder="Asha Verma"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

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

        <div className="space-y-1.5">
          <Label htmlFor="college">College</Label>
          <Input
            id="college"
            placeholder="NIT Durgapur"
            autoComplete="organization"
            aria-invalid={Boolean(errors.college)}
            {...register('college')}
          />
          {errors.college && <p className="text-sm text-destructive">{errors.college.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
