const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authenticate, checkProfile } = require('../middlewares/auth');

router.use(authenticate);
router.use(checkProfile);

router.get('/profit-loss', ReportController.generateProfitLoss);
router.get('/cash-flow', ReportController.generateCashFlow);
router.get('/tax-report', ReportController.generateTaxReport);
router.post('/save', ReportController.saveReport);
router.get('/saved', ReportController.getSavedReports);

module.exports = router;