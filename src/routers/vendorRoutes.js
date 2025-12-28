const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const VendorController = require('../controllers/vendorController');
const { authenticate, checkProfile } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { auditLogger } = require('../middlewares/auditLogger');

const vendorValidation = [
  body('profileId').isUUID().withMessage('Valid profile ID is required'),
  body('companyName').notEmpty().trim().withMessage('Company name is required'),
  body('email').optional().isEmail().normalizeEmail()
];

router.use(authenticate);

router.post('/', checkProfile, vendorValidation, validate, auditLogger('create', 'vendor'), VendorController.create);
router.get('/', checkProfile, VendorController.getAll);
router.get('/:id', checkProfile, VendorController.getById);
router.put('/:id', checkProfile, vendorValidation, validate, auditLogger('update', 'vendor'), VendorController.update);
router.delete('/:id', checkProfile, auditLogger('delete', 'vendor'), VendorController.delete);

module.exports = router;