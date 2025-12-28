const db = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse, createdResponse } = require('../utils/responseHandler');

const ReportController = {
  generateProfitLoss: async (req, res) => {
    try {
      const { profileId } = req;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return errorResponse(res, 'Start date and end date are required', 400);
      }

      const dateWhere = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };

      // Income by category
      const incomeByCategory = await db.Income.findAll({
        where: {
          profileId,
          incomeDate: dateWhere,
          paymentStatus: 'paid'
        },
        attributes: [
          'categoryId',
          [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
        ],
        include: [{
          model: db.Category,
          as: 'category',
          attributes: ['name', 'type']
        }],
        group: ['categoryId', 'category.id']
      });

      // Expense by category
      const expenseByCategory = await db.Expense.findAll({
        where: {
          profileId,
          expenseDate: dateWhere,
          paymentStatus: 'paid'
        },
        attributes: [
          'categoryId',
          [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
        ],
        include: [{
          model: db.Category,
          as: 'category',
          attributes: ['name', 'type']
        }],
        group: ['categoryId', 'category.id']
      });

      const totalIncome = incomeByCategory.reduce((sum, item) => sum + parseFloat(item.dataValues.total), 0);
      const totalExpense = expenseByCategory.reduce((sum, item) => sum + parseFloat(item.dataValues.total), 0);
      const netProfit = totalIncome - totalExpense;

      return successResponse(res, {
        period: { startDate, endDate },
        income: {
          byCategory: incomeByCategory,
          total: totalIncome
        },
        expense: {
          byCategory: expenseByCategory,
          total: totalExpense
        },
        netProfit,
        profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0
      }, 'Profit & Loss report generated successfully');
    } catch (error) {
      console.error('Generate P&L report error:', error);
      return errorResponse(res, 'Failed to generate Profit & Loss report', 500);
    }
  },

  generateCashFlow: async (req, res) => {
    try {
      const { profileId } = req;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return errorResponse(res, 'Start date and end date are required', 400);
      }

      const dateWhere = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };

      const cashInflow = await db.Income.sum('amount', {
        where: { profileId, incomeDate: dateWhere, paymentStatus: 'paid' }
      }) || 0;

      const cashOutflow = await db.Expense.sum('amount', {
        where: { profileId, expenseDate: dateWhere, paymentStatus: 'paid' }
      }) || 0;

      const netCashFlow = cashInflow - cashOutflow;

      // Opening balance (sum of all bank accounts at start date)
      const openingBalance = await db.BankAccount.sum('initialBalance', {
        where: { profileId, isActive: true }
      }) || 0;

      const closingBalance = openingBalance + netCashFlow;

      return successResponse(res, {
        period: { startDate, endDate },
        openingBalance: parseFloat(openingBalance),
        cashInflow: parseFloat(cashInflow),
        cashOutflow: parseFloat(cashOutflow),
        netCashFlow: parseFloat(netCashFlow),
        closingBalance: parseFloat(closingBalance)
      }, 'Cash Flow report generated successfully');
    } catch (error) {
      console.error('Generate cash flow report error:', error);
      return errorResponse(res, 'Failed to generate Cash Flow report', 500);
    }
  },

  generateTaxReport: async (req, res) => {
    try {
      const { profileId } = req;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return errorResponse(res, 'Start date and end date are required', 400);
      }

      const dateWhere = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };

      // Taxable income
      const taxableIncome = await db.Income.findAll({
        where: {
          profileId,
          incomeDate: dateWhere,
          isTaxable: true
        },
        attributes: [
          [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'totalAmount'],
          [db.sequelize.fn('SUM', db.sequelize.col('taxAmount')), 'totalTax']
        ],
        raw: true
      });

      // Tax deductible expenses
      const deductibleExpenses = await db.Expense.findAll({
        where: {
          profileId,
          expenseDate: dateWhere,
          isTaxDeductible: true
        },
        attributes: [
          [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'totalAmount'],
          [db.sequelize.fn('SUM', db.sequelize.col('taxAmount')), 'totalTax']
        ],
        raw: true
      });

      return successResponse(res, {
        period: { startDate, endDate },
        taxableIncome: {
          totalAmount: parseFloat(taxableIncome[0]?.totalAmount || 0),
          totalTax: parseFloat(taxableIncome[0]?.totalTax || 0)
        },
        deductibleExpenses: {
          totalAmount: parseFloat(deductibleExpenses[0]?.totalAmount || 0),
          totalTax: parseFloat(deductibleExpenses[0]?.totalTax || 0)
        },
        netTaxable: parseFloat(taxableIncome[0]?.totalAmount || 0) - parseFloat(deductibleExpenses[0]?.totalAmount || 0)
      }, 'Tax report generated successfully');
    } catch (error) {
      console.error('Generate tax report error:', error);
      return errorResponse(res, 'Failed to generate Tax report', 500);
    }
  },

  saveReport: async (req, res) => {
    try {
      const report = await db.Report.create({
        ...req.body,
        profileId: req.profileId,
        createdBy: req.userId,
        generatedAt: new Date()
      });

      return createdResponse(res, report, 'Report saved successfully');
    } catch (error) {
      console.error('Save report error:', error);
      return errorResponse(res, 'Failed to save report', 500);
    }
  },

  getSavedReports: async (req, res) => {
    try {
      const reports = await db.Report.findAll({
        where: { profileId: req.profileId },
        order: [['createdAt', 'DESC']]
      });

      return successResponse(res, reports, 'Saved reports retrieved successfully');
    } catch (error) {
      console.error('Get saved reports error:', error);
      return errorResponse(res, 'Failed to retrieve saved reports', 500);
    }
  }
};

module.exports = ReportController;