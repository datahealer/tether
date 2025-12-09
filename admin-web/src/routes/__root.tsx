import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { AuthContextType } from '../context/auth';

interface RouterContext {
  auth: AuthContextType;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});