import { createRoute, redirect, Outlet } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Dashboard } from '../pages/Dashboard';
import { CategoryDashboard } from '../pages/CategoryDashboard';
import { ForgotPassword } from '../pages/ForgotPasword';
import { Profile } from '../pages/Profile';
import { Users } from '../pages/Users';
import { Stats } from '../pages/Stats';
import { Unlocks } from '../pages/Unlocks';
import Home from '../pages/Home'

// Root index - Home page
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home
});

// Home route
export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: Home
});

// Admin layout route
export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => <Outlet />,
});

export const loginRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/login',
  component: Login,
  beforeLoad: ({ context }) => {
    // Redirect to dashboard if already authenticated
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: '/admin/dashboard' });
    }
  },
});

export const signupRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/signup',
  component: Signup,
  beforeLoad: ({ context }) => {
    // Redirect to dashboard if already authenticated
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: '/admin/dashboard' });
    }
  },
});

export const dashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/dashboard',
  component: Dashboard,
  beforeLoad: ({ context }) => {
    // Redirect to login if not authenticated
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/admin/login' });
    }
  },
});
export const forgotPasswordRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/forgot-password',
  component: ForgotPassword,
  beforeLoad: ({ context }) => {
    // Redirect to dashboard if already authenticated
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: '/admin/dashboard' });
    }
  },
});
export const profileRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/profile',
  component: Profile,
  beforeLoad: ({ context }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/admin/login' });
    }
  },
});
export const categoryDashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/categories',
  component: CategoryDashboard,
  beforeLoad: ({ context }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/admin/login' });
    }
  },
});

export const usersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/users',
  component: Users,
  beforeLoad: ({ context }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/admin/login' });
    }
  },
});

export const statsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/stats',
  component: Stats,
  beforeLoad: ({ context }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/admin/login' });
    }
  },
});

export const unlocksRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/unlocks',
  component: Unlocks,
  beforeLoad: ({ context }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/admin/login' });
    }
  },
});

// Build the route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  homeRoute,
  adminRoute.addChildren([
    loginRoute,
    signupRoute,
    dashboardRoute,
    forgotPasswordRoute,
    profileRoute,
    categoryDashboardRoute,
    usersRoute,
    statsRoute,
    unlocksRoute,
  ]),
]);

