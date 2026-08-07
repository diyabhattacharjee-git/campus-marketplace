import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel — hidden on mobile, sets tone on larger screens */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 font-display text-xl font-semibold">
          <ShoppingBag className="size-6" />
          Campus Marketplace
        </Link>
        <div className="max-w-md">
          <p className="font-display text-3xl font-semibold leading-tight">
            Post what you need. Let sellers come to you.
          </p>
          <p className="mt-3 text-primary-foreground/80">
            Smart Reverse Bidding turns buying on campus into a competition —
            you name the item and budget, sellers compete for your order.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">
          Verified with your college email — built for your campus only.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-background p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link to={ROUTES.HOME} className="mb-8 flex items-center gap-2 font-display text-lg font-semibold lg:hidden">
            <ShoppingBag className="size-5 text-primary" />
            Campus Marketplace
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
