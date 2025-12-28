const db = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse, createdResponse, paginatedResponse } = require('../utils/responseHandler');
const { buildPaginationOptions, buildSortOptions, formatPaginationResponse } = require('../utils/helper');
const { createAuditLog } = require('../middlewares/auditLogger');

const BudgetController = {
  /**
   * Create new budget with category allocations
   */
  create: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { budgetCategories, ...budgetData } = req.body;

      // Create budget
      const budget = await db.Budget.create({
        ...budgetData,
        profileId: req.profileId,
        createdBy: req.userId
      }, { transaction });

      // Create budget category allocations
      if (budgetCategories && budgetCategories.length > 0) {
        const allocations = budgetCategories.map(bc => ({
          budgetId: budget.id,
          categoryId: bc.categoryId,
          allocatedAmount: bc.allocatedAmount,
          notes: bc.notes
        }));

        await db.BudgetCategory.bulkCreate(allocations, { transaction });
      }

      await transaction.commit();

      // Fetch complete budget with categories
      const completeBudget = await db.Budget.findByPk(budget.id, {
        include: [{
          model: db.BudgetCategory,
          as: 'budgetCategories',
          include: [{
            model: db.Category,
            as: 'category',
            attributes: ['id', 'name', 'type', 'color', 'icon']
          }]
        }]
      });

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'create',
        module: 'budget',
        recordId: budget.id,
        description: `Budget created: ${budget.name}`,
        newValues: completeBudget.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return createdResponse(res, completeBudget, 'Budget created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Create budget error:', error);
      return errorResponse(res, 'Failed to create budget', 500);
    }
  },

  /**
   * Get all budgets with filtering
   */
  getAll: async (req, res) => {
    try {
      const { page, limit, offset } = buildPaginationOptions(req.query);
      const order = buildSortOptions(req.query, [['startDate', 'DESC']]);

      const where = { profileId: req.profileId };

      // Search filter
      if (req.query.search) {
        where.name = { [Op.like]: `%${req.query.search}%` };
      }

      // Budget type filter
      if (req.query.budgetType) {
        where.budgetType = req.query.budgetType;
      }

      // Status filter
      if (req.query.status) {
        where.status = req.query.status;
      }

      // Date range filter
      if (req.query.startDate || req.query.endDate) {
        where.startDate = {};
        if (req.query.startDate) {
          where.startDate[Op.gte] = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          where.startDate[Op.lte] = new Date(req.query.endDate);
        }
      }

      const { count, rows } = await db.Budget.findAndCountAll({
        where,
        include: [
          {
            model: db.BudgetCategory,
            as: 'budgetCategories',
            include: [{
              model: db.Category,
              as: 'category',
              attributes: ['id', 'name', 'type', 'color', 'icon']
            }]
          },
          {
            model: db.User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        limit,
        offset,
        order,
        distinct: true
      });

      const response = formatPaginationResponse(rows, page, limit, count);
      return paginatedResponse(res, response.data, response.pagination, 'Budgets retrieved successfully');
    } catch (error) {
      console.error('Get budgets error:', error);
      return errorResponse(res, 'Failed to retrieve budgets', 500);
    }
  },

  /**
   * Get budget by ID
   */
  getById: async (req, res) => {
    try {
      const budget = await db.Budget.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        },
        include: [
          {
            model: db.BudgetCategory,
            as: 'budgetCategories',
            include: [{
              model: db.Category,
              as: 'category'
            }]
          },
          {
            model: db.User,
            as: 'creator',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: db.User,
            as: 'updater',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!budget) {
        return errorResponse(res, 'Budget not found', 404);
      }

      return successResponse(res, budget, 'Budget retrieved successfully');
    } catch (error) {
      console.error('Get budget error:', error);
      return errorResponse(res, 'Failed to retrieve budget', 500);
    }
  },

  /**
   * Update budget
   */
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { budgetCategories, ...budgetData } = req.body;

      const budget = await db.Budget.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!budget) {
        await transaction.rollback();
        return errorResponse(res, 'Budget not found', 404);
      }

      const oldValues = budget.toJSON();

      // Update budget
      await budget.update({
        ...budgetData,
        updatedBy: req.userId
      }, { transaction });

      // Update budget categories if provided
      if (budgetCategories) {
        // Delete existing allocations
        await db.BudgetCategory.destroy({
          where: { budgetId: budget.id },
          transaction
        });

        // Create new allocations
        if (budgetCategories.length > 0) {
          const allocations = budgetCategories.map(bc => ({
            budgetId: budget.id,
            categoryId: bc.categoryId,
            allocatedAmount: bc.allocatedAmount,
            notes: bc.notes
          }));

          await db.BudgetCategory.bulkCreate(allocations, { transaction });
        }
      }

      await transaction.commit();

      // Fetch updated budget
      const updatedBudget = await db.Budget.findByPk(budget.id, {
        include: [{
          model: db.BudgetCategory,
          as: 'budgetCategories',
          include: [{
            model: db.Category,
            as: 'category',
            attributes: ['id', 'name', 'type', 'color', 'icon']
          }]
        }]
      });

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'update',
        module: 'budget',
        recordId: budget.id,
        description: `Budget updated: ${budget.name}`,
        oldValues,
        newValues: updatedBudget.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, updatedBudget, 'Budget updated successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Update budget error:', error);
      return errorResponse(res, 'Failed to update budget', 500);
    }
  },

  /**
   * Delete budget
   */
  delete: async (req, res) => {
    try {
      const budget = await db.Budget.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!budget) {
        return errorResponse(res, 'Budget not found', 404);
      }

      const oldValues = budget.toJSON();
      await budget.destroy();

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'delete',
        module: 'budget',
        recordId: budget.id,
        description: `Budget deleted: ${budget.name}`,
        oldValues,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, null, 'Budget deleted successfully');
    } catch (error) {
      console.error('Delete budget error:', error);
      return errorResponse(res, 'Failed to delete budget', 500);
    }
  },

  /**
   * Get budget performance/tracking
   */
  getPerformance: async (req, res) => {
    try {
      const budget = await db.Budget.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        },
        include: [{
          model: db.BudgetCategory,
          as: 'budgetCategories',
          include: [{
            model: db.Category,
            as: 'category'
          }]
        }]
      });

      if (!budget) {
        return errorResponse(res, 'Budget not found', 404);
      }

      // Calculate actual spending for each category
      const categoryPerformance = await Promise.all(
        budget.budgetCategories.map(async (bc) => {
          const actualSpent = await db.Expense.sum('amount', {
            where: {
              profileId: req.profileId,
              categoryId: bc.categoryId,
              expenseDate: {
                [Op.gte]: budget.startDate,
                [Op.lte]: budget.endDate
              }
            }
          }) || 0;

          const remaining = bc.allocatedAmount - actualSpent;
          const percentageUsed = bc.allocatedAmount > 0
            ? (actualSpent / bc.allocatedAmount * 100).toFixed(2)
            : 0;

          return {
            categoryId: bc.categoryId,
            categoryName: bc.category.name,
            allocatedAmount: parseFloat(bc.allocatedAmount),
            actualSpent: parseFloat(actualSpent),
            remaining: parseFloat(remaining),
            percentageUsed: parseFloat(percentageUsed),
            isOverBudget: actualSpent > bc.allocatedAmount
          };
        })
      );

      // Calculate overall budget performance
      const totalAllocated = budget.totalAmount;
      const totalSpent = categoryPerformance.reduce((sum, cp) => sum + cp.actualSpent, 0);
      const totalRemaining = totalAllocated - totalSpent;
      const overallPercentage = totalAllocated > 0
        ? (totalSpent / totalAllocated * 100).toFixed(2)
        : 0;

      return successResponse(res, {
        budget: {
          id: budget.id,
          name: budget.name,
          startDate: budget.startDate,
          endDate: budget.endDate,
          totalAllocated,
          totalSpent,
          totalRemaining,
          overallPercentage: parseFloat(overallPercentage),
          isOverBudget: totalSpent > totalAllocated
        },
        categoryPerformance
      }, 'Budget performance retrieved successfully');
    } catch (error) {
      console.error('Get budget performance error:', error);
      return errorResponse(res, 'Failed to retrieve budget performance', 500);
    }
  },

  /**
   * Get budget statistics
   */
  getStats: async (req, res) => {
    try {
      const where = { profileId: req.profileId };

      // Count by status
      const byStatus = await db.Budget.findAll({
        where,
        attributes: [
          'status',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Count by type
      const byType = await db.Budget.findAll({
        where,
        attributes: [
          'budgetType',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['budgetType'],
        raw: true
      });

      // Total budgets
      const total = await db.Budget.count({ where });

      // Active budgets
      const active = await db.Budget.count({
        where: {
          ...where,
          status: 'active'
        }
      });

      return successResponse(res, {
        total,
        active,
        byStatus,
        byType
      }, 'Budget statistics retrieved successfully');
    } catch (error) {
      console.error('Get budget stats error:', error);
      return errorResponse(res, 'Failed to retrieve budget statistics', 500);
    }
  }
};

module.exports = BudgetController;