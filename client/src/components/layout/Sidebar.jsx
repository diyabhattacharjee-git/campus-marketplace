import { NavLink } from 'react-router-dom';
import { LayoutGrid, Package, Gavel, Heart, ClipboardList, User, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutGrid },
  { to: ROUTES.PRODUCTS, label: 'Marketplace', icon: Package },
  { to: ROUTES.MY_LISTINGS, label: 'My Listings', icon: Tags },
  { to: ROUTES.BUYER_REQUESTS, label: 'Bidding', icon: Gavel },
  { to: ROUTES.WISHLIST, label: 'Wishlist', icon: Heart },
  { to: ROUTES.ORDERS, label: 'Orders', icon: ClipboardList },
  { to: ROUTES.PROFILE, label: 'Profile', icon: User },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block">
      <nav className="flex flex-col gap-1 p-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary',
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
