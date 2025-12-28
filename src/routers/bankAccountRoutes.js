const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const BankAccountController = require('../controllers/bankAccountController');
const { authenticate, checkProfile } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { auditLogger } = require('../middlewares/auditLogger');

const accountValidation = [
  body('profileId').isUUID().withMessage('Valid profile ID is required'),
  body('accountName').notEmpty().trim().withMessage('Account name is required'),
  body('accountType').isIn(['checking', 'savings', 'credit_card', 'cash', 'investment', 'loan', 'other'])
];

router.use(authenticate);

router.post('/', checkProfile, accountValidation, validate, auditLogger('create', 'bank_account'), BankAccountController.create);
router.get('/', checkProfile, BankAccountController.getAll);
router.get('/:id', checkProfile, BankAccountController.getById);
router.get('/:id/balance', checkProfile, BankAccountController.getBalance);
router.put('/:id', checkProfile, accountValidation, validate, auditLogger('update', 'bank_account'), BankAccountController.update);
router.delete('/:id', checkProfile, auditLogger('delete', 'bank_account'), BankAccountController.delete);

module.exports = router;