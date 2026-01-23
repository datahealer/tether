// // src/routes/index.ts
// import { Express } from 'express';

// // Import all route files
// import authRoutes from './auth';
// import onboardingRoutes from './onboarding';
// // import settingsRoutes from './settings';
// // import couplesRoutes from './couple';
// // import tethersRoutes from './tethers.routes';
// // import progressRoutes from './progress.routes';
// // import purchasesRoutes from './purchases.routes';
// // import adminRoutes from './admin.routes';

// export const setRoutes = (app: Express) => {
//   // === PUBLIC ROUTES ===
//   app.use('/auth', authRoutes);

//   // === PROTECTED ROUTES (all require JWT via authMiddleware) ===
//   app.use('/onboarding', onboardingRoutes);
//   // app.use('/settings', settingsRoutes);
//   // app.use('/couples', couplesRoutes);
//   // app.use('/tethers', tethersRoutes);
//   // app.use('/progress', progressRoutes);
//   // app.use('/purchases', purchasesRoutes);

//   // === ADMIN (add extra protection later) ===
//   // app.use('/admin', adminRoutes);

//   // Health check
//   app.get('/health', (req, res) => {
//     res.json({ status: 'ok', app: 'Tether API v1', time: new Date().toISOString() });
//   });

//   // 404 handler
//   app.use('*', (req, res) => {
//     res.status(404).json({ error: 'Route not found' });
//   });
// };
import { Router } from 'express';
import authRoutes from './auth';
import coupleRoutes from './couple';
import onboardingRoutes from './onboarding';
import settingsRoutes from './settings';
import tetherRoutes from './tethers';

import adminAuthRoutes from './admin/auth';
import adminQuestionRoutes from './admin/questions';
import adminCategoryRoutes from './admin/category';
import adminSubscriptionRoutes from './admin/subscription';
import adminUserRoutes from './admin/user';
import adminCoupleRoutes from './admin/couple';
import adminStatsRoutes from './admin/stats';
import adminUnlockRoutes from './admin/unlock';
import subscriptionRoutes from './subscription';
import profileRoutes from './profile';
import logsRoutes from './logs';
import notificationRoutes from './notification';

import revenueCatRoutes from './revenuecat';

const router = Router();

router.use('/auth', authRoutes);
router.use('/couple', coupleRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/settings', settingsRoutes);
router.use('/tethers', tetherRoutes);

// Admin routes (correctly prefixed)
router.use('/admin/auth', adminAuthRoutes);
router.use('/admin/questions', adminQuestionRoutes);
router.use('/admin/categories', adminCategoryRoutes);
router.use('/admin/subscriptions', adminSubscriptionRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/admin/couples', adminCoupleRoutes);
router.use('/admin/stats', adminStatsRoutes);
router.use('/admin/unlocks', adminUnlockRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/profile', profileRoutes);
router.use('/logs', logsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/revenuecat', revenueCatRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;