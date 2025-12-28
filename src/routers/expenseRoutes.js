const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ExpenseController = require('../controllers/expenseController');
const { authenticate, checkProfile } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { auditLogger } = require('../middlewares/auditLogger');

const expenseValidation = [
  body('profileId').isUUID().withMessage('Valid profile ID is required'),
  body('categoryId').isUUID().withMessage('Valid category ID is required'),
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('expenseDate').optional().isISO8601().withMessage('Valid date is required'),
  body('paymentStatus').optional().isIn(['pending', 'partial', 'paid', 'overdue', 'cancelled'])
];

router.use(authenticate);

router.post('/', checkProfile, expenseValidation, validate, auditLogger('create', 'expense'), ExpenseController.create);
router.get('/', checkProfile, ExpenseController.getAll);
router.get('/stats', checkProfile, ExpenseController.getStats);
router.get('/:id', checkProfile, ExpenseController.getById);
router.put('/:id', checkProfile, expenseValidation, validate, auditLogger('update', 'expense'), ExpenseController.update);
router.delete('/:id', checkProfile, auditLogger('delete', 'expense'), ExpenseController.delete);
router.post('/:id/approve', checkProfile, auditLogger('approve', 'expense'), ExpenseController.approve);
router.post('/:id/reject', checkProfile, auditLogger('reject', 'expense'), ExpenseController.reject);

module.exports = router;