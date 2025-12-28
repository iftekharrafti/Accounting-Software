const db = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse, createdResponse, paginatedResponse } = require('../utils/responseHandler');
const { buildPaginationOptions, buildSortOptions, formatPaginationResponse } = require('../utils/helper');
const { createAuditLog } = require('../middlewares/auditLogger');

const InvoiceController = {
  create: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { items, ...invoiceData } = req.body;

      const invoice = await db.Invoice.create({
        ...invoiceData,
        profileId: req.profileId,
        createdBy: req.userId
      }, { transaction });

      if (items && items.length > 0) {
        const invoiceItems = items.map(item => ({
          invoiceId: invoice.id,
          ...item
        }));
        await db.InvoiceItem.bulkCreate(invoiceItems, { transaction });
      }

      // Calculate totals
      const itemsTotal = await db.InvoiceItem.sum('totalAmount', {
        where: { invoiceId: invoice.id },
        transaction
      }) || 0;

      await invoice.update({
        subtotal: itemsTotal,
        totalAmount: itemsTotal
      }, { transaction });

      await transaction.commit();

      const completeInvoice = await db.Invoice.findByPk(invoice.id, {
        include: [
          { model: db.InvoiceItem, as: 'items' },
          { model: db.Client, as: 'client' }
        ]
      });

      await createAuditLog({
        profileId: req.profileId,
        userId: req.userId,
        action: 'create',
        module: 'invoice',
        recordId: invoice.id,
        description: `Invoice created: ${invoice.invoiceNumber}`,
        newValues: completeInvoice.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return createdResponse(res, completeInvoice, 'Invoice created successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Create invoice error:', error);
      return errorResponse(res, 'Failed to create invoice', 500);
    }
  },

  getAll: async (req, res) => {
    try {
      const { page, limit, offset } = buildPaginationOptions(req.query);
      const order = buildSortOptions(req.query, [['invoiceDate', 'DESC']]);

      const where = { profileId: req.profileId };

      if (req.query.search) {
        where[Op.or] = [
          { invoiceNumber: { [Op.like]: `%${req.query.search}%` } },
          { subject: { [Op.like]: `%${req.query.search}%` } }
        ];
      }

      if (req.query.clientId) where.clientId = req.query.clientId;
      if (req.query.status) where.status = req.query.status;
      if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;

      if (req.query.startDate || req.query.endDate) {
        where.invoiceDate = {};
        if (req.query.startDate) where.invoiceDate[Op.gte] = new Date(req.query.startDate);
        if (req.query.endDate) where.invoiceDate[Op.lte] = new Date(req.query.endDate);
      }

      const { count, rows } = await db.Invoice.findAndCountAll({
        where,
        include: [
          { model: db.Client, as: 'client', attributes: ['id', 'companyName', 'contactPerson', 'email'] },
          { model: db.InvoiceItem, as: 'items' }
        ],
        limit,
        offset,
        order,
        distinct: true
      });

      const response = formatPaginationResponse(rows, page, limit, count);
      return paginatedResponse(res, response.data, response.pagination, 'Invoices retrieved successfully');
    } catch (error) {
      console.error('Get invoices error:', error);
      return errorResponse(res, 'Failed to retrieve invoices', 500);
    }
  },

  getById: async (req, res) => {
    try {
      const invoice = await db.Invoice.findOne({
        where: { id: req.params.id, profileId: req.profileId },
        include: [
          { model: db.Client, as: 'client' },
          { model: db.InvoiceItem, as: 'items' }
        ]
      });

      if (!invoice) return errorResponse(res, 'Invoice not found', 404);
      return successResponse(res, invoice, 'Invoice retrieved successfully');
    } catch (error) {
      console.error('Get invoice error:', error);
      return errorResponse(res, 'Failed to retrieve invoice', 500);
    }
  },

  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { items, ...invoiceData } = req.body;
      const invoice = await db.Invoice.findOne({
        where: { id: req.params.id, profileId: req.profileId }
      });

      if (!invoice) {
        await transaction.rollback();
        return errorResponse(res, 'Invoice not found', 404);
      }

      await invoice.update({ ...invoiceData, updatedBy: req.userId }, { transaction });

      if (items) {
        await db.InvoiceItem.destroy({ where: { invoiceId: invoice.id }, transaction });
        if (items.length > 0) {
          const invoiceItems = items.map(item => ({ invoiceId: invoice.id, ...item }));
          await db.InvoiceItem.bulkCreate(invoiceItems, { transaction });
        }

        const itemsTotal = await db.InvoiceItem.sum('totalAmount', {
          where: { invoiceId: invoice.id },
          transaction
        }) || 0;

        await invoice.update({ subtotal: itemsTotal, totalAmount: itemsTotal }, { transaction });
      }

      await transaction.commit();

      const updatedInvoice = await db.Invoice.findByPk(invoice.id, {
        include: [
          { model: db.InvoiceItem, as: 'items' },
          { model: db.Client, as: 'client' }
        ]
      });

      return successResponse(res, updatedInvoice, 'Invoice updated successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Update invoice error:', error);
      return errorResponse(res, 'Failed to update invoice', 500);
    }
  },

  delete: async (req, res) => {
    try {
      const invoice = await db.Invoice.findOne({
        where: { id: req.params.id, profileId: req.profileId }
      });

      if (!invoice) return errorResponse(res, 'Invoice not found', 404);

      await invoice.destroy();
      return successResponse(res, null, 'Invoice deleted successfully');
    } catch (error) {
      console.error('Delete invoice error:', error);
      return errorResponse(res, 'Failed to delete invoice', 500);
    }
  },

  getStats: async (req, res) => {
    try {
      const where = { profileId: req.profileId };

      const stats = await db.Invoice.findOne({
        where,
        attributes: [
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'totalCount'],
          [db.sequelize.fn('SUM', db.sequelize.col('totalAmount')), 'totalAmount'],
          [db.sequelize.fn('SUM', db.sequelize.col('paidAmount')), 'paidAmount']
        ],
        raw: true
      });

      const byStatus = await db.Invoice.findAll({
        where,
        attributes: [
          'paymentStatus',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
          [db.sequelize.fn('SUM', db.sequelize.col('totalAmount')), 'total']
        ],
        group: ['paymentStatus'],
        raw: true
      });

      return successResponse(res, { summary: stats, byStatus }, 'Invoice statistics retrieved successfully');
    } catch (error) {
      console.error('Get invoice stats error:', error);
      return errorResponse(res, 'Failed to retrieve invoice statistics', 500);
    }
  }
};

module.exports = InvoiceController;