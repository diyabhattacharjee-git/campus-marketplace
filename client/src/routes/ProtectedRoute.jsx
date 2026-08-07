import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants/routes';

/**
 * Wrap any set of routes that require a logged-in user:
 *
 *   <Route element={<ProtectedRoute />}>
 *     <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
 *   </Route>
 *
 * Redirects to /login and remembers where the user was headed, so Step 4's
 * login page can send them back after a successful sign-in.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
