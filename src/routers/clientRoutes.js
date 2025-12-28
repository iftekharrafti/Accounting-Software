const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ClientController = require('../controllers/clientController');
const { authenticate, checkProfile } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { auditLogger } = require('../middlewares/auditLogger');

const clientValidation = [
  body('profileId').isUUID().withMessage('Valid profile ID is required'),
  body('companyName').optional().trim(),
  body('email').optional().isEmail().normalizeEmail()
];

router.use(authenticate);

router.post('/', checkProfile, clientValidation, validate, auditLogger('create', 'client'), ClientController.create);
router.get('/', checkProfile, ClientController.getAll);
router.get('/:id', checkProfile, ClientController.getById);
router.put('/:id', checkProfile, clientValidation, validate, auditLogger('update', 'client'), ClientController.update);
router.delete('/:id', checkProfile, auditLogger('delete', 'client'), ClientController.delete);

module.exports = router;