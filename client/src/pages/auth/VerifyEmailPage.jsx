import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, CircleCheck, CircleX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [errorMessage, setErrorMessage] = useState('');
  // React 19 StrictMode double-invokes effects in dev — guard so we don't
  // fire the (state-mutating) verification request twice.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.message || 'This verification link is invalid or has expired.');
      });
  }, [token, verifyEmail]);

  if (status === 'verifying') {
    return (
      <div className="text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Verifying your email…</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CircleCheck className="size-6" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold">Email verified</h2>
        <p className="mt-2 text-sm text-muted-foreground">You’re all set and logged in.</p>
        <Button className="mt-6 w-full" onClick={() => navigate(ROUTES.DASHBOARD, { replace: true })}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <CircleX className="size-6" />
      </div>
      <h2 className="mt-4 font-display text-2xl font-semibold">Verification failed</h2>
      <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
      <Button variant="outline" className="mt-6 w-full" asChild>
        <Link to={ROUTES.SIGNUP}>Back to sign up</Link>
      </Button>
    </div>
  );
}
