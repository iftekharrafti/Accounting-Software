const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const incomeRoutes = require('./incomeRoutes');
const expenseRoutes = require('./expenseRoutes');
const categoryRoutes = require('./categoryRoutes');
const budgetRoutes = require('./budgetRoutes');
const bankAccountRoutes = require('./bankAccountRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const clientRoutes = require('./clientRoutes');
const vendorRoutes = require('./vendorRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const reportRoutes = require('./reportRoutes');
const { authenticate, checkProfile } = require('../middlewares/auth');

// API Routes
router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/incomes', incomeRoutes);
router.use('/expenses', expenseRoutes);
router.use('/categories', categoryRoutes);
router.use('/budgets', budgetRoutes);
router.use('/bank-accounts', bankAccountRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/clients', clientRoutes);
router.use('/vendors', vendorRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use(authenticate);
router.use(checkProfile);

// API Info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Income & Expense Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      profiles: '/profiles',
      incomes: '/incomes',
      expenses: '/expenses',
      categories: '/categories',
      budgets: '/budgets',
      bankAccounts: '/bank-accounts',
      invoices: '/invoices',
      clients: '/clients',
      vendors: '/vendors',
      dashboard: '/dashboard',
      reports: '/reports'
    }
  });
});

module.exports = router;