import { createRoute, Navigate, redirect } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Dashboard } from '../pages/Dashboard';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    // Use navigate dynamically instead of checking in component
    return <Navigate to="/dashboard" />;
  },
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
  beforeLoad: ({ context }) => {
    // Redirect to dashboard if already authenticated
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
});

export const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: Signup,
  beforeLoad: ({ context }) => {
    // Redirect to dashboard if already authenticated
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
});

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
  beforeLoad: ({ context }) => {
    // Redirect to login if not authenticated
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  dashboardRoute,
]);