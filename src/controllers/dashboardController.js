const db = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { calculateDateRange } = require('../utils/helper');

const DashboardController = {
  getOverview: async (req, res) => {
    try {
      const { profileId } = req;
      const { period = 'this_month' } = req.query;
      const { startDate, endDate } = calculateDateRange(period);

      const where = { profileId };
      const dateWhere = startDate && endDate ? {
        [Op.gte]: startDate,
        [Op.lte]: endDate
      } : {};

      // Total Income
      const totalIncome = await db.Income.sum('amount', {
        where: {
          ...where,
          incomeDate: dateWhere,
          paymentStatus: 'paid'
        }
      }) || 0;

      // Total Expense
      const totalExpense = await db.Expense.sum('amount', {
        where: {
          ...where,
          expenseDate: dateWhere,
          paymentStatus: 'paid'
        }
      }) || 0;

      // Net Profit/Loss
      const netProfit = totalIncome - totalExpense;

      // Pending Income
      const pendingIncome = await db.Income.sum('amount', {
        where: {
          ...where,
          paymentStatus: { [Op.in]: ['pending', 'partial'] }
        }
      }) || 0;

      // Pending Expense
      const pendingExpense = await db.Expense.sum('amount', {
        where: {
          ...where,
          paymentStatus: { [Op.in]: ['pending', 'partial'] }
        }
      }) || 0;

      // Bank Accounts Balance
      const totalBankBalance = await db.BankAccount.sum('currentBalance', {
        where: { ...where, isActive: true }
      }) || 0;

      // Counts
      const counts = {
        totalIncomes: await db.Income.count({ where }),
        totalExpenses: await db.Expense.count({ where }),
        totalInvoices: await db.Invoice.count({ where }),
        pendingApprovals: await db.Expense.count({
          where: { ...where, status: 'pending', approvalRequired: true }
        })
      };

      return successResponse(res, {
        summary: {
          totalIncome: parseFloat(totalIncome),
          totalExpense: parseFloat(totalExpense),
          netProfit: parseFloat(netProfit),
          pendingIncome: parseFloat(pendingIncome),
          pendingExpense: parseFloat(pendingExpense),
          totalBankBalance: parseFloat(totalBankBalance)
        },
        counts,
        period: { startDate, endDate, label: period }
      }, 'Dashboard overview retrieved successfully');
    } catch (error) {
      console.error('Get dashboard overview error:', error);
      return errorResponse(res, 'Failed to retrieve dashboard overview', 500);
    }
  },

  getCategoryBreakdown: async (req, res) => {
    try {
      const { profileId } = req;
      const { period = 'this_month', type = 'expense' } = req.query;
      const { startDate, endDate } = calculateDateRange(period);

      const Model = type === 'income' ? db.Income : db.Expense;
      const dateField = type === 'income' ? 'incomeDate' : 'expenseDate';

      const where = { profileId };
      if (startDate && endDate) {
        where[dateField] = { [Op.gte]: startDate, [Op.lte]: endDate };
      }

      const breakdown = await Model.findAll({
        where,
        attributes: [
          'categoryId',
          [db.sequelize.fn('COUNT', db.sequelize.col(`${Model.name}.id`)), 'count'],
          [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
        ],
        include: [{
          model: db.Category,
          as: 'category',
          attributes: ['id', 'name', 'type', 'color', 'icon']
        }],
        group: ['categoryId', 'category.id'],
        order: [[db.sequelize.literal('total'), 'DESC']]
      });

      return successResponse(res, breakdown, 'Category breakdown retrieved successfully');
    } catch (error) {
      console.error('Get category breakdown error:', error);
      return errorResponse(res, 'Failed to retrieve category breakdown', 500);
    }
  },

  getRecentTransactions: async (req, res) => {
    try {
      const { profileId } = req;
      const limit = parseInt(req.query.limit) || 10;

      const recentIncomes = await db.Income.findAll({
        where: { profileId },
        include: [{ model: db.Category, as: 'category', attributes: ['name', 'color', 'icon'] }],
        order: [['incomeDate', 'DESC']],
        limit: limit / 2
      });

      const recentExpenses = await db.Expense.findAll({
        where: { profileId },
        include: [{ model: db.Category, as: 'category', attributes: ['name', 'color', 'icon'] }],
        order: [['expenseDate', 'DESC']],
        limit: limit / 2
      });

      const transactions = [
        ...recentIncomes.map(i => ({ ...i.toJSON(), type: 'income' })),
        ...recentExpenses.map(e => ({ ...e.toJSON(), type: 'expense' }))
      ].sort((a, b) => {
        const dateA = new Date(a.incomeDate || a.expenseDate);
        const dateB = new Date(b.incomeDate || b.expenseDate);
        return dateB - dateA;
      }).slice(0, limit);

      return successResponse(res, transactions, 'Recent transactions retrieved successfully');
    } catch (error) {
      console.error('Get recent transactions error:', error);
      return errorResponse(res, 'Failed to retrieve recent transactions', 500);
    }
  },

  getCashFlow: async (req, res) => {
    try {
      const { profileId } = req;
      const { period = 'this_month' } = req.query;
      const { startDate, endDate } = calculateDateRange(period);

      // Group by day/week/month based on period
      const groupBy = period.includes('year') ? 'month' : period.includes('month') ? 'day' : 'day';

      const incomeData = await db.Income.findAll({
        where: {
          profileId,
          incomeDate: { [Op.gte]: startDate, [Op.lte]: endDate }
        },
        attributes: [
          [db.sequelize.fn('DATE', db.sequelize.col('incomeDate')), 'date'],
          [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
        ],
        group: [db.sequelize.fn('DATE', db.sequelize.col('incomeDate'))],
        raw: true
      });

      const expenseData = await db.Expense.findAll({
        where: {
          profileId,
          expenseDate: { [Op.gte]: startDate, [Op.lte]: endDate }
        },
        attributes: [
          [db.sequelize.fn('DATE', db.sequelize.col('expenseDate')), 'date'],
          [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
        ],
        group: [db.sequelize.fn('DATE', db.sequelize.col('expenseDate'))],
        raw: true
      });

      return successResponse(res, {
        income: incomeData,
        expense: expenseData,
        period: { startDate, endDate }
      }, 'Cash flow data retrieved successfully');
    } catch (error) {
      console.error('Get cash flow error:', error);
      return errorResponse(res, 'Failed to retrieve cash flow data', 500);
    }
  }
};

module.exports = DashboardController;