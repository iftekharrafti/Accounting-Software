const db = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse, createdResponse, paginatedResponse } = require('../utils/responseHandler');
const { buildPaginationOptions, buildSortOptions, formatPaginationResponse } = require('../utils/helper');

const ClientController = {
  create: async (req, res) => {
    try {
      const client = await db.Client.create({
        ...req.body,
        profileId: req.profileId,
        createdBy: req.userId
      });
      return createdResponse(res, client, 'Client created successfully');
    } catch (error) {
      console.error('Create client error:', error);
      return errorResponse(res, 'Failed to create client', 500);
    }
  },

  getAll: async (req, res) => {
    try {
      const { page, limit, offset } = buildPaginationOptions(req.query);
      const order = buildSortOptions(req.query, [['createdAt', 'DESC']]);
      const where = { profileId: req.profileId };

      if (req.query.search) {
        where[Op.or] = [
          { companyName: { [Op.like]: `%${req.query.search}%` } },
          { contactPerson: { [Op.like]: `%${req.query.search}%` } },
          { email: { [Op.like]: `%${req.query.search}%` } }
        ];
      }

      if (req.query.clientType) where.clientType = req.query.clientType;
      if (req.query.isActive === 'true') {
        where.isActive = true;
      } else if (req.query.isActive === 'false') {
        where.isActive = false;
      } else {
        where.isActive = true;
      }


      const { count, rows } = await db.Client.findAndCountAll({
        where, limit, offset, order, distinct: true
      });

      const response = formatPaginationResponse(rows, page, limit, count);
      // console.log("response: ", response);
      return paginatedResponse(res, response.data, response.pagination, 'Clients retrieved successfully');
    } catch (error) {
      console.error('Get clients error:', error);
      return errorResponse(res, 'Failed to retrieve clients', 500);
    }
  },

  getById: async (req, res) => {
    try {
      const client = await db.Client.findOne({
        where: { id: req.params.id, profileId: req.profileId }
      });
      if (!client) return errorResponse(res, 'Client not found', 404);
      return successResponse(res, client, 'Client retrieved successfully');
    } catch (error) {
      console.error('Get client error:', error);
      return errorResponse(res, 'Failed to retrieve client', 500);
    }
  },

  update: async (req, res) => {
    try {
      const client = await db.Client.findOne({
        where: { id: req.params.id, profileId: req.profileId }
      });
      if (!client) return errorResponse(res, 'Client not found', 404);

      await client.update({ ...req.body, updatedBy: req.userId });
      return successResponse(res, client, 'Client updated successfully');
    } catch (error) {
      console.error('Update client error:', error);
      return errorResponse(res, 'Failed to update client', 500);
    }
  },

  delete: async (req, res) => {
    try {
      const client = await db.Client.findOne({
        where: { id: req.params.id, profileId: req.profileId }
      });
      if (!client) return errorResponse(res, 'Client not found', 404);

      const invoiceCount = await db.Invoice.count({ where: { clientId: client.id } });
      if (invoiceCount > 0) {
        return errorResponse(res, 'Cannot delete client with existing invoices', 400);
      }

      await client.destroy();
      return successResponse(res, null, 'Client deleted successfully');
    } catch (error) {
      console.error('Delete client error:', error);
      return errorResponse(res, 'Failed to delete client', 500);
    }
  }
};

module.exports = ClientController;