const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticate, checkProfile } = require('../middlewares/auth');

router.use(authenticate);
router.use(checkProfile);

router.get('/overview', DashboardController.getOverview);
router.get('/category-breakdown', DashboardController.getCategoryBreakdown);
router.get('/recent-transactions', DashboardController.getRecentTransactions);
router.get('/cash-flow', DashboardController.getCashFlow);

module.exports = router;