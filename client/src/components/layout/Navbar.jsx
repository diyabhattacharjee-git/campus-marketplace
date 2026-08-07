import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, MessageCircle, ShoppingBag, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate(ROUTES.HOME, { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur">
      <Link to={ROUTES.HOME} className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <ShoppingBag className="size-5 text-primary" />
        Campus Marketplace
      </Link>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Messages" asChild>
          <Link to={ROUTES.CHAT}>
            <MessageCircle />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
          <Link to={ROUTES.NOTIFICATIONS}>
            <Bell />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-2 flex size-9 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Account menu"
            >
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={ROUTES.PROFILE}>
                <UserIcon />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
