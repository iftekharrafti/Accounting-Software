const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const InvoiceController = require('../controllers/invoiceController');
const { authenticate, checkProfile } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { auditLogger } = require('../middlewares/auditLogger');

const invoiceValidation = [
  body('profileId').isUUID().withMessage('Valid profile ID is required'),
  body('invoiceDate').isISO8601().withMessage('Valid invoice date is required')
];

router.use(authenticate);

router.post('/', checkProfile, invoiceValidation, validate, auditLogger('create', 'invoice'), InvoiceController.create);
router.get('/', checkProfile, InvoiceController.getAll);
router.get('/stats', checkProfile, InvoiceController.getStats);
router.get('/:id', checkProfile, InvoiceController.getById);
router.put('/:id', checkProfile, invoiceValidation, validate, auditLogger('update', 'invoice'), InvoiceController.update);
router.delete('/:id', checkProfile, auditLogger('delete', 'invoice'), InvoiceController.delete);

module.exports = router;