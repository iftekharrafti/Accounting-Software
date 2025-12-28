const db = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse, createdResponse, paginatedResponse } = require('../utils/responseHandler');
const { buildFilterQuery, buildPaginationOptions, buildSortOptions, formatPaginationResponse } = require('../utils/helper');
const { createAuditLog } = require('../middlewares/auditLogger');

const IncomeController = {
  /**
   * Create new income
   */
  create: async (req, res) => {
    try {
      const incomeData = {
        ...req.body,
        profileId: req.profileId,
        createdBy: req.userId
      };

      const income = await db.Income.create(incomeData);

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'create',
        module: 'income',
        recordId: income.id,
        description: `Income created: ${income.title}`,
        newValues: income.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return createdResponse(res, income, 'Income created successfully');
    } catch (error) {
      console.error('Create income error:', error);
      return errorResponse(res, 'Failed to create income', 500);
    }
  },

  /**
   * Get all incomes with filtering
   */
  getAll: async (req, res) => {
    try {
      const { page, limit, offset } = buildPaginationOptions(req.query);
      const order = buildSortOptions(req.query, [['incomeDate', 'DESC']]);
      
      // Build where clause
      const where = { profileId: req.profileId };

      // Search filter
      if (req.query.search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${req.query.search}%` } },
          { description: { [Op.like]: `%${req.query.search}%` } },
          { incomeNumber: { [Op.like]: `%${req.query.search}%` } }
        ];
      }

      // Category filter
      if (req.query.categoryId) {
        where.categoryId = req.query.categoryId;
      }

      // Bank account filter
      if (req.query.bankAccountId) {
        where.bankAccountId = req.query.bankAccountId;
      }

      // Payment status filter
      if (req.query.paymentStatus) {
        where.paymentStatus = req.query.paymentStatus;
      }

      // Status filter
      if (req.query.status) {
        where.status = req.query.status;
      }

      // Date range filter
      if (req.query.startDate || req.query.endDate) {
        where.incomeDate = {};
        if (req.query.startDate) {
          where.incomeDate[Op.gte] = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          where.incomeDate[Op.lte] = new Date(req.query.endDate);
        }
      }

      // Amount range filter
      if (req.query.minAmount || req.query.maxAmount) {
        where.amount = {};
        if (req.query.minAmount) {
          where.amount[Op.gte] = parseFloat(req.query.minAmount);
        }
        if (req.query.maxAmount) {
          where.amount[Op.lte] = parseFloat(req.query.maxAmount);
        }
      }

      // Recurring filter
      if (req.query.isRecurring !== undefined) {
        where.isRecurring = req.query.isRecurring === 'true';
      }

      const { count, rows } = await db.Income.findAndCountAll({
        where,
        include: [
          {
            model: db.Category,
            as: 'category',
            attributes: ['id', 'name', 'color', 'icon']
          },
          {
            model: db.BankAccount,
            as: 'bankAccount',
            attributes: ['id', 'accountName', 'accountType']
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
      return paginatedResponse(res, response.data, response.pagination, 'Incomes retrieved successfully');
    } catch (error) {
      console.error('Get incomes error:', error);
      return errorResponse(res, 'Failed to retrieve incomes', 500);
    }
  },

  /**
   * Get income by ID
   */
  getById: async (req, res) => {
    try {
      const income = await db.Income.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        },
        include: [
          {
            model: db.Category,
            as: 'category'
          },
          {
            model: db.BankAccount,
            as: 'bankAccount'
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

      if (!income) {
        return errorResponse(res, 'Income not found', 404);
      }

      return successResponse(res, income, 'Income retrieved successfully');
    } catch (error) {
      console.error('Get income error:', error);
      return errorResponse(res, 'Failed to retrieve income', 500);
    }
  },

  /**
   * Update income
   */
  update: async (req, res) => {
    try {
      const income = await db.Income.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!income) {
        return errorResponse(res, 'Income not found', 404);
      }

      const oldValues = income.toJSON();
      
      await income.update({
        ...req.body,
        updatedBy: req.userId
      });

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'update',
        module: 'income',
        recordId: income.id,
        description: `Income updated: ${income.title}`,
        oldValues,
        newValues: income.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, income, 'Income updated successfully');
    } catch (error) {
      console.error('Update income error:', error);
      return errorResponse(res, 'Failed to update income', 500);
    }
  },

  /**
   * Delete income
   */
  delete: async (req, res) => {
    try {
      const income = await db.Income.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!income) {
        return errorResponse(res, 'Income not found', 404);
      }

      const oldValues = income.toJSON();
      await income.destroy();

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'delete',
        module: 'income',
        recordId: income.id,
        description: `Income deleted: ${income.title}`,
        oldValues,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, null, 'Income deleted successfully');
    } catch (error) {
      console.error('Delete income error:', error);
      return errorResponse(res, 'Failed to delete income', 500);
    }
  },

  /**
   * Get income statistics
   */
  getStats: async (req, res) => {
    try {
      const where = { profileId: req.profileId };

      // Date range filter
      if (req.query.startDate || req.query.endDate) {
        where.incomeDate = {};
        if (req.query.startDate) {
          where.incomeDate[Op.gte] = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          where.incomeDate[Op.lte] = new Date(req.query.endDate);
        }
      }

      const stats = await db.Income.findOne({
        where,
        attributes: [
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'totalCount'],
          [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'totalAmount'],
          [db.sequelize.fn('AVG', db.sequelize.col('amount')), 'averageAmount'],
          [db.sequelize.fn('MAX', db.sequelize.col('amount')), 'maxAmount'],
          [db.sequelize.fn('MIN', db.sequelize.col('amount')), 'minAmount']
        ],
        raw: true
      });

      // Get income by category
      const byCategory = await db.Income.findAll({
        where,
        attributes: [
          'categoryId',
          [db.sequelize.fn('COUNT', db.sequelize.col('Income.id')), 'count'],
          [db.sequelize.fn('SUM', db.sequelize.col('Income.amount')), 'total']
        ],
        include: [
          {
            model: db.Category,
            as: 'category',
            attributes: ['name', 'color', 'icon']
          }
        ],
        group: ['categoryId', 'category.id'],
        raw: true
      });

      // Get income by payment status
      const byPaymentStatus = await db.Income.findAll({
        where,
        attributes: [
          'paymentStatus',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
          [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
        ],
        group: ['paymentStatus'],
        raw: true
      });

      return successResponse(res, {
        summary: stats,
        byCategory,
        byPaymentStatus
      }, 'Income statistics retrieved successfully');
    } catch (error) {
      console.error('Get income stats error:', error);
      return errorResponse(res, 'Failed to retrieve income statistics', 500);
    }
  }
};

module.exports = IncomeController;