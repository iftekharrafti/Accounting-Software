const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const CategoryController = require('../controllers/categoryController');
const { authenticate, checkProfile } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { auditLogger } = require('../middlewares/auditLogger');

const categoryValidation = [
  body('profileId').isUUID().withMessage('Valid profile ID is required'),
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('type').isIn(['income', 'expense', 'both']).withMessage('Type must be income, expense, or both'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex code')
];

router.use(authenticate);

router.post('/', checkProfile, categoryValidation, validate, auditLogger('create', 'category'), CategoryController.create);
router.get('/', checkProfile, CategoryController.getAll);
router.get('/tree', checkProfile, CategoryController.getTree);
router.get('/stats', checkProfile, CategoryController.getStats);
router.get('/:id', checkProfile, CategoryController.getById);
router.put('/:id', checkProfile, categoryValidation, validate, auditLogger('update', 'category'), CategoryController.update);
router.delete('/:id', checkProfile, auditLogger('delete', 'category'), CategoryController.delete);

module.exports = router;