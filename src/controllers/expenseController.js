const db = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse, createdResponse, paginatedResponse } = require('../utils/responseHandler');
const { buildPaginationOptions, buildSortOptions, formatPaginationResponse } = require('../utils/helper');
const { createAuditLog } = require('../middlewares/auditLogger');

const ExpenseController = {
  /**
   * Create new expense
   */
  create: async (req, res) => {
    try {
      const expenseData = {
        ...req.body,
        profileId: req.profileId,
        createdBy: req.userId
      };

      // Convert empty strings to null for foreign keys
      if (expenseData.bankAccountId === '' || expenseData.bankAccountId === undefined) {
        expenseData.bankAccountId = null;
      }
      if (expenseData.vendorId === '' || expenseData.vendorId === undefined) {
        expenseData.vendorId = null;
      }
      if (expenseData.paymentMethodId === '' || expenseData.paymentMethodId === undefined) {
        expenseData.paymentMethodId = null;
      }

      const expense = await db.Expense.create(expenseData);

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'create',
        module: 'expense',
        recordId: expense.id,
        description: `Expense created: ${expense.title}`,
        newValues: expense.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return createdResponse(res, expense, 'Expense created successfully');
    } catch (error) {
      console.error('Create expense error:', error);
      return errorResponse(res, 'Failed to create expense', 500);
    }
  },

  /**
   * Get all expenses with filtering
   */
  getAll: async (req, res) => {
    try {
      const { page, limit, offset } = buildPaginationOptions(req.query);
      const order = buildSortOptions(req.query, [['expenseDate', 'DESC']]);

      const where = { profileId: req.profileId };

      // Search filter
      if (req.query.search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${req.query.search}%` } },
          { description: { [Op.like]: `%${req.query.search}%` } },
          { expenseNumber: { [Op.like]: `%${req.query.search}%` } }
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

      // Vendor filter
      if (req.query.vendorId) {
        where.vendorId = req.query.vendorId;
      }

      // Payment status filter
      if (req.query.paymentStatus) {
        where.paymentStatus = req.query.paymentStatus;
      }

      // Status filter
      if (req.query.status) {
        where.status = req.query.status;
      }

      // Reimbursement status filter
      if (req.query.reimbursementStatus) {
        where.reimbursementStatus = req.query.reimbursementStatus;
      }

      // Date range filter
      if (req.query.startDate || req.query.endDate) {
        where.expenseDate = {};
        if (req.query.startDate) {
          where.expenseDate[Op.gte] = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          where.expenseDate[Op.lte] = new Date(req.query.endDate);
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

      // Approval required filter
      if (req.query.approvalRequired !== undefined) {
        where.approvalRequired = req.query.approvalRequired === 'true';
      }

      const { count, rows } = await db.Expense.findAndCountAll({
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
            model: db.Vendor,
            as: 'vendor',
            attributes: ['id', 'companyName', 'contactPerson']
          },
          {
            model: db.PaymentMethod,
            as: 'paymentMethodInfo',
            attributes: ['id', 'name', 'type']
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
      return paginatedResponse(res, response.data, response.pagination, 'Expenses retrieved successfully');
    } catch (error) {
      console.error('Get expenses error:', error);
      return errorResponse(res, 'Failed to retrieve expenses', 500);
    }
  },

  /**
   * Get expense by ID
   */
  getById: async (req, res) => {
    try {
      const expense = await db.Expense.findOne({
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
            model: db.Vendor,
            as: 'vendor'
          },
          {
            model: db.PaymentMethod,
            as: 'paymentMethodInfo'
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
          },
          {
            model: db.User,
            as: 'approvedBy',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });

      if (!expense) {
        return errorResponse(res, 'Expense not found', 404);
      }

      return successResponse(res, expense, 'Expense retrieved successfully');
    } catch (error) {
      console.error('Get expense error:', error);
      return errorResponse(res, 'Failed to retrieve expense', 500);
    }
  },

  /**
   * Update expense
   */
  update: async (req, res) => {
    try {
      const expense = await db.Expense.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!expense) {
        return errorResponse(res, 'Expense not found', 404);
      }

      // Convert empty strings to null for foreign keys
      const updateData = { ...req.body, updatedBy: req.userId };
      if (updateData.bankAccountId === '' || updateData.bankAccountId === undefined) {
        updateData.bankAccountId = null;
      }
      if (updateData.vendorId === '' || updateData.vendorId === undefined) {
        updateData.vendorId = null;
      }
      if (updateData.paymentMethodId === '' || updateData.paymentMethodId === undefined) {
        updateData.paymentMethodId = null;
      }

      const oldValues = expense.toJSON();

      await expense.update(updateData);

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'update',
        module: 'expense',
        recordId: expense.id,
        description: `Expense updated: ${expense.title}`,
        oldValues,
        newValues: expense.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, expense, 'Expense updated successfully');
    } catch (error) {
      console.error('Update expense error:', error);
      return errorResponse(res, 'Failed to update expense', 500);
    }
  },

  /**
   * Delete expense
   */
  delete: async (req, res) => {
    try {
      const expense = await db.Expense.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!expense) {
        return errorResponse(res, 'Expense not found', 404);
      }

      const oldValues = expense.toJSON();
      await expense.destroy();

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'delete',
        module: 'expense',
        recordId: expense.id,
        description: `Expense deleted: ${expense.title}`,
        oldValues,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, null, 'Expense deleted successfully');
    } catch (error) {
      console.error('Delete expense error:', error);
      return errorResponse(res, 'Failed to delete expense', 500);
    }
  },

  /**
   * Approve expense
   */
  approve: async (req, res) => {
    try {
      const expense = await db.Expense.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!expense) {
        return errorResponse(res, 'Expense not found', 404);
      }

      await expense.update({
        status: 'approved',
        approvedBy: req.userId,
        approvedAt: new Date()
      });

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'approve',
        module: 'expense',
        recordId: expense.id,
        description: `Expense approved: ${expense.title}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, expense, 'Expense approved successfully');
    } catch (error) {
      console.error('Approve expense error:', error);
      return errorResponse(res, 'Failed to approve expense', 500);
    }
  },

  /**
   * Reject expense
   */
  reject: async (req, res) => {
    try {
      const { rejectionReason } = req.body;

      const expense = await db.Expense.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!expense) {
        return errorResponse(res, 'Expense not found', 404);
      }

      await expense.update({
        status: 'rejected',
        rejectedBy: req.userId,
        rejectedAt: new Date(),
        rejectionReason
      });

      // Audit log
      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'reject',
        module: 'expense',
        recordId: expense.id,
        description: `Expense rejected: ${expense.title}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, expense, 'Expense rejected successfully');
    } catch (error) {
      console.error('Reject expense error:', error);
      return errorResponse(res, 'Failed to reject expense', 500);
    }
  },

  /**
   * Get expense statistics
   */
  getStats: async (req, res) => {
    try {
      const where = { profileId: req.profileId };

      // Date range filter
      if (req.query.startDate || req.query.endDate) {
        where.expenseDate = {};
        if (req.query.startDate) {
          where.expenseDate[Op.gte] = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          where.expenseDate[Op.lte] = new Date(req.query.endDate);
        }
      }

      const stats = await db.Expense.findOne({
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

      // Get expense by category
      const byCategory = await db.Expense.findAll({
        where,
        attributes: [
          'categoryId',
          [db.sequelize.fn('COUNT', db.sequelize.col('Expense.id')), 'count'],
          [db.sequelize.fn('SUM', db.sequelize.col('Expense.amount')), 'total']
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

      // Get expense by payment status
      const byPaymentStatus = await db.Expense.findAll({
        where,
        attributes: [
          'paymentStatus',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
          [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
        ],
        group: ['paymentStatus'],
        raw: true
      });

      // Get pending approvals
      const pendingApprovals = await db.Expense.count({
        where: {
          ...where,
          status: 'pending',
          approvalRequired: true
        }
      });

      return successResponse(res, {
        summary: stats,
        byCategory,
        byPaymentStatus,
        pendingApprovals
      }, 'Expense statistics retrieved successfully');
    } catch (error) {
      console.error('Get expense stats error:', error);
      return errorResponse(res, 'Failed to retrieve expense statistics', 500);
    }
  }
};

module.exports = ExpenseController;