const db = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse, createdResponse, paginatedResponse } = require('../utils/responseHandler');
const { buildPaginationOptions, buildSortOptions, formatPaginationResponse } = require('../utils/helper');
const { createAuditLog } = require('../middlewares/auditLogger');

const BankAccountController = {
  create: async (req, res) => {
    try {
      const accountData = {
        ...req.body,
        profileId: req.profileId,
        createdBy: req.userId
      };

      const bankAccount = await db.BankAccount.create(accountData);

      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'create',
        module: 'bank_account',
        recordId: bankAccount.id,
        description: `Bank account created: ${bankAccount.accountName}`,
        newValues: bankAccount.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return createdResponse(res, bankAccount, 'Bank account created successfully');
    } catch (error) {
      console.error('Create bank account error:', error);
      return errorResponse(res, 'Failed to create bank account', 500);
    }
  },

  getAll: async (req, res) => {
    try {
      const { page, limit, offset } = buildPaginationOptions(req.query);
      const order = buildSortOptions(req.query, [['createdAt', 'DESC']]);

      const where = { profileId: req.profileId };

      if (req.query.search) {
        where[Op.or] = [
          { accountName: { [Op.like]: `%${req.query.search}%` } },
          { bankName: { [Op.like]: `%${req.query.search}%` } },
          { accountNumber: { [Op.like]: `%${req.query.search}%` } }
        ];
      }

      if (req.query.accountType) {
        where.accountType = req.query.accountType;
      }

      if (req.query.isActive !== undefined) {
        where.isActive = req.query.isActive === 'true';
      }

      if (req.query.isDefault !== undefined) {
        where.isDefault = req.query.isDefault === 'true';
      }

      const { count, rows } = await db.BankAccount.findAndCountAll({
        where,
        limit,
        offset,
        order,
        distinct: true
      });

      const response = formatPaginationResponse(rows, page, limit, count);
      return paginatedResponse(res, response.data, response.pagination, 'Bank accounts retrieved successfully');
    } catch (error) {
      console.error('Get bank accounts error:', error);
      return errorResponse(res, 'Failed to retrieve bank accounts', 500);
    }
  },

  getById: async (req, res) => {
    try {
      const bankAccount = await db.BankAccount.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!bankAccount) {
        return errorResponse(res, 'Bank account not found', 404);
      }

      return successResponse(res, bankAccount, 'Bank account retrieved successfully');
    } catch (error) {
      console.error('Get bank account error:', error);
      return errorResponse(res, 'Failed to retrieve bank account', 500);
    }
  },

  update: async (req, res) => {
    try {
      const bankAccount = await db.BankAccount.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!bankAccount) {
        return errorResponse(res, 'Bank account not found', 404);
      }

      const oldValues = bankAccount.toJSON();
      await bankAccount.update({
        ...req.body,
        updatedBy: req.userId
      });

      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'update',
        module: 'bank_account',
        recordId: bankAccount.id,
        description: `Bank account updated: ${bankAccount.accountName}`,
        oldValues,
        newValues: bankAccount.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, bankAccount, 'Bank account updated successfully');
    } catch (error) {
      console.error('Update bank account error:', error);
      return errorResponse(res, 'Failed to update bank account', 500);
    }
  },

  delete: async (req, res) => {
    try {
      const bankAccount = await db.BankAccount.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!bankAccount) {
        return errorResponse(res, 'Bank account not found', 404);
      }

      // Check if account is being used
      const incomeCount = await db.Income.count({ where: { bankAccountId: bankAccount.id } });
      const expenseCount = await db.Expense.count({ where: { bankAccountId: bankAccount.id } });

      if (incomeCount > 0 || expenseCount > 0) {
        return errorResponse(res, 'Cannot delete bank account that is being used in transactions', 400);
      }

      const oldValues = bankAccount.toJSON();
      await bankAccount.destroy();

      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'delete',
        module: 'bank_account',
        recordId: bankAccount.id,
        description: `Bank account deleted: ${bankAccount.accountName}`,
        oldValues,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, null, 'Bank account deleted successfully');
    } catch (error) {
      console.error('Delete bank account error:', error);
      return errorResponse(res, 'Failed to delete bank account', 500);
    }
  },

  getBalance: async (req, res) => {
    try {
      const bankAccount = await db.BankAccount.findOne({
        where: {
          id: req.params.id,
          profileId: req.profileId
        }
      });

      if (!bankAccount) {
        return errorResponse(res, 'Bank account not found', 404);
      }

      // Calculate actual balance from transactions
      const totalIncome = await db.Income.sum('amount', {
        where: {
          bankAccountId: bankAccount.id,
          paymentStatus: 'paid'
        }
      }) || 0;

      const totalExpense = await db.Expense.sum('amount', {
        where: {
          bankAccountId: bankAccount.id,
          paymentStatus: 'paid'
        }
      }) || 0;

      const calculatedBalance = parseFloat(bankAccount.initialBalance) + totalIncome - totalExpense;

      return successResponse(res, {
        accountId: bankAccount.id,
        accountName: bankAccount.accountName,
        initialBalance: parseFloat(bankAccount.initialBalance),
        currentBalance: parseFloat(bankAccount.currentBalance),
        calculatedBalance,
        totalIncome,
        totalExpense,
        difference: calculatedBalance - parseFloat(bankAccount.currentBalance)
      }, 'Account balance retrieved successfully');
    } catch (error) {
      console.error('Get account balance error:', error);
      return errorResponse(res, 'Failed to retrieve account balance', 500);
    }
  }
};

module.exports = BankAccountController;