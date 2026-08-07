import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-center">
      <p className="font-display text-6xl font-semibold text-primary">404</p>
      <h1 className="font-display text-xl font-semibold">This page doesn’t exist</h1>
      <p className="text-sm text-muted-foreground">Check the link, or head back to the marketplace.</p>
      <Button asChild className="mt-2">
        <Link to={ROUTES.HOME}>Go home</Link>
      </Button>
    </div>
  );
}
