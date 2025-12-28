const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const BudgetController = require('../controllers/budgetController');
const { authenticate, checkProfile } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { auditLogger } = require('../middlewares/auditLogger');

const budgetValidation = [
  body('profileId').isUUID().withMessage('Valid profile ID is required'),
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
];

router.use(authenticate);

router.post('/', checkProfile, budgetValidation, validate, auditLogger('create', 'budget'), BudgetController.create);
router.get('/', checkProfile, BudgetController.getAll);
router.get('/stats', checkProfile, BudgetController.getStats);
router.get('/:id', checkProfile, BudgetController.getById);
router.get('/:id/performance', checkProfile, BudgetController.getPerformance);
router.put('/:id', checkProfile, budgetValidation, validate, auditLogger('update', 'budget'), BudgetController.update);
router.delete('/:id', checkProfile, auditLogger('delete', 'budget'), BudgetController.delete);

module.exports = router;