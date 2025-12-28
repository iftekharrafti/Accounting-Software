const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ProfileController = require('../controllers/profileController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { auditLogger } = require('../middlewares/auditLogger');

// Validation rules
const profileValidation = [
  body('profileName').notEmpty().trim().withMessage('Profile name is required'),
  body('businessType').optional().isIn(['personal', 'business', 'organization', 'freelancer']),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('email').optional().isEmail().normalizeEmail()
];

// All routes require authentication
router.use(authenticate);

// Routes
router.post('/', profileValidation, validate, auditLogger('create', 'profile'), ProfileController.create);
router.get('/', ProfileController.getAll);
router.get('/:id', ProfileController.getById);
router.put('/:id', profileValidation, validate, auditLogger('update', 'profile'), ProfileController.update);
router.delete('/:id', auditLogger('delete', 'profile'), ProfileController.delete);
router.post('/switch', ProfileController.switchProfile);

module.exports = router;