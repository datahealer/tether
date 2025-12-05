import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { useAuth } from '../context/auth';

interface RouterContext {
  auth: AuthContextType;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});