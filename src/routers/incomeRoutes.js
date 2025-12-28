const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
// const IncomeController = require('../controllers/incomeController');
const { authenticate, checkProfile } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { auditLogger } = require('../middlewares/auditLogger');
const IncomeController = require('../controllers/IncomeController');

// Validation rules
const incomeValidation = [
  body('profileId').isUUID().withMessage('Valid profile ID is required'),
  body('categoryId').isUUID().withMessage('Valid category ID is required'),
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('incomeDate').optional().isISO8601().withMessage('Valid date is required'),
  body('paymentStatus').optional().isIn(['pending', 'partial', 'paid', 'overdue', 'cancelled'])
];

// All routes require authentication
router.use(authenticate);

// Routes
router.post('/', checkProfile, incomeValidation, validate, auditLogger('create', 'income'), IncomeController.create);
router.get('/', checkProfile, IncomeController.getAll);
router.get('/stats', checkProfile, IncomeController.getStats);
router.get('/:id', checkProfile, IncomeController.getById);
router.put('/:id', checkProfile, incomeValidation, validate, auditLogger('update', 'income'), IncomeController.update);
router.delete('/:id', checkProfile, auditLogger('delete', 'income'), IncomeController.delete);

module.exports = router;