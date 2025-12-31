const db = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse, createdResponse, paginatedResponse } = require('../utils/responseHandler');
const { buildPaginationOptions, buildSortOptions, formatPaginationResponse } = require('../utils/helper');
const { createAuditLog } = require('../middlewares/auditLogger');

const CategoryController = {
  /**
   * Create new category
   */
  create: async (req, res) => {
    try {
      const categoryData = {
        ...req.body,
        profileId: req.profileId,
        createdBy: req.userId
      };

      // Convert empty string to null for parentId
      if (categoryData.parentId === '' || categoryData.parentId === undefined) {
        categoryData.parentId = null;
      }

      const category = await db.Category.create(categoryData);

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'create',
        module: 'category',
        recordId: category.id,
        description: `Category created: ${category.name}`,
        newValues: category.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return createdResponse(res, category, 'Category created successfully');
    } catch (error) {
      console.error('Create category error:', error);
      return errorResponse(res, 'Failed to create category', 500);
    }
  },

  /**
   * Get all categories with filtering
   */
  getAll: async (req, res) => {
    try {
      const { page, limit, offset } = buildPaginationOptions(req.query);
      const order = buildSortOptions(req.query, [['sortOrder', 'ASC'], ['name', 'ASC']]);

      const where = { profileId: req.profileId };

      // Search filter
      if (req.query.search) {
        where.name = { [Op.like]: `%${req.query.search}%` };
      }

      // Type filter (income, expense, both)
      if (req.query.type) {
        where.type = req.query.type;
      }

      // Parent category filter
      if (req.query.parentId) {
        where.parentId = req.query.parentId;
      } else if (req.query.parentId === 'null') {
        where.parentId = null; // Get only root categories
      }

      // Active filter
      if (req.query.isActive === 'true') {
        where.isActive = true;
      } else if (req.query.isActive === 'false') {
        where.isActive = false;
      } else {
        where.isActive = true;
      }

      const { count, rows } = await db.Category.findAndCountAll({
        where,
        include: [
          {
            model: db.Category,
            as: 'parent',
            attributes: ['id', 'name', 'type', 'color', 'icon']
          },
          {
            model: db.Category,
            as: 'subcategories',
            attributes: ['id', 'name', 'type', 'color', 'icon'],
            where: { isActive: true },
            required: false
          }
        ],
        limit,
        offset,
        order,
        distinct: true
      });

      const response = formatPaginationResponse(rows, page, limit, count);
      return paginatedResponse(res, response.data, response.pagination, 'Categories retrieved successfully');
    } catch (error) {
      console.error('Get categories error:', error);
      return errorResponse(res, 'Failed to retrieve categories', 500);
    }
  },

  /**
   * Get category tree (hierarchical)
   */
  getTree: async (req, res) => {
    try {
      const where = {
        profileId: req.profileId,
        parentId: null // Get only root categories
      };

      if (req.query.type) {
        where.type = req.query.type;
      }

      if (req.query.isActive !== undefined) {
        where.isActive = req.query.isActive === 'true';
      }

      const categories = await db.Category.findAll({
        where,
        include: [
          {
            model: db.Category,
            as: 'subcategories',
            where: { isActive: true },
            required: false,
            include: [
              {
                model: db.Category,
                as: 'subcategories',
                where: { isActive: true },
                required: false
              }
            ]
          }
        ],
        order: [
          ['sortOrder', 'ASC'],
          ['name', 'ASC'],
          [{ model: db.Category, as: 'subcategories' }, 'sortOrder', 'ASC'],
          [{ model: db.Category, as: 'subcategories' }, 'name', 'ASC']
        ]
      });

      return successResponse(res, categories, 'Category tree retrieved successfully');
    } catch (error) {
      console.error('Get category tree error:', error);
      return errorResponse(res, 'Failed to retrieve category tree', 500);
    }
  },

  /**
   * Get category by ID
   */
  getById: async (req, res) => {
    try {
      const category = await db.Category.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        },
        include: [
          {
            model: db.Category,
            as: 'parent',
            attributes: ['id', 'name', 'type', 'color', 'icon']
          },
          {
            model: db.Category,
            as: 'subcategories',
            attributes: ['id', 'name', 'type', 'color', 'icon', 'isActive']
          },
          {
            model: db.User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      if (!category) {
        return errorResponse(res, 'Category not found', 404);
      }

      return successResponse(res, category, 'Category retrieved successfully');
    } catch (error) {
      console.error('Get category error:', error);
      return errorResponse(res, 'Failed to retrieve category', 500);
    }
  },

  /**
   * Update category
   */
  update: async (req, res) => {
    try {
      const category = await db.Category.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!category) {
        return errorResponse(res, 'Category not found', 404);
      }

      // Prevent setting parent to self
      if (req.body.parentId && req.body.parentId === category.id) {
        return errorResponse(res, 'Category cannot be its own parent', 400);
      }

      // Convert empty string to null for parentId
      const updateData = { ...req.body, updatedBy: req.userId };
      if (updateData.parentId === '' || updateData.parentId === undefined) {
        updateData.parentId = null;
      }

      const oldValues = category.toJSON();

      await category.update(updateData);

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'update',
        module: 'category',
        recordId: category.id,
        description: `Category updated: ${category.name}`,
        oldValues,
        newValues: category.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, category, 'Category updated successfully');
    } catch (error) {
      console.error('Update category error:', error);
      return errorResponse(res, 'Failed to update category', 500);
    }
  },

  /**
   * Delete category
   */
  delete: async (req, res) => {
    try {
      const category = await db.Category.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!category) {
        return errorResponse(res, 'Category not found', 404);
      }

      // Check if system category
      if (category.isSystem) {
        return errorResponse(res, 'System categories cannot be deleted', 400);
      }

      // Check if category has subcategories
      const subcategoryCount = await db.Category.count({
        where: { parentId: category.id }
      });

      if (subcategoryCount > 0) {
        return errorResponse(res, 'Cannot delete category with subcategories', 400);
      }

      // Check if category is being used
      const incomeCount = await db.Income.count({
        where: { categoryId: category.id }
      });

      const expenseCount = await db.Expense.count({
        where: { categoryId: category.id }
      });

      if (incomeCount > 0 || expenseCount > 0) {
        return errorResponse(res, 'Cannot delete category that is being used in transactions', 400);
      }

      const oldValues = category.toJSON();
      await category.destroy();

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'delete',
        module: 'category',
        recordId: category.id,
        description: `Category deleted: ${category.name}`,
        oldValues,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, null, 'Category deleted successfully');
    } catch (error) {
      console.error('Delete category error:', error);
      return errorResponse(res, 'Failed to delete category', 500);
    }
  },

  /**
   * Get category statistics
   */
  getStats: async (req, res) => {
    try {
      const where = { profileId: req.profileId };

      // Count by type
      const byType = await db.Category.findAll({
        where,
        attributes: [
          'type',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['type'],
        raw: true
      });

      // Count active vs inactive
      const byStatus = await db.Category.findAll({
        where,
        attributes: [
          'isActive',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['isActive'],
        raw: true
      });

      // Total categories
      const total = await db.Category.count({ where });

      // Categories with subcategories
      const withSubcategories = await db.Category.count({
        where,
        include: [{
          model: db.Category,
          as: 'subcategories',
          required: true
        }],
        distinct: true
      });

      return successResponse(res, {
        total,
        byType,
        byStatus,
        withSubcategories
      }, 'Category statistics retrieved successfully');
    } catch (error) {
      console.error('Get category stats error:', error);
      return errorResponse(res, 'Failed to retrieve category statistics', 500);
    }
  }
};

module.exports = CategoryController;