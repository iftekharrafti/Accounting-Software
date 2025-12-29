const db = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse, createdResponse, paginatedResponse } = require('../utils/responseHandler');
const { buildPaginationOptions, buildSortOptions, formatPaginationResponse } = require('../utils/helper');

const VendorController = {
  create: async (req, res) => {
    try {
      const vendor = await db.Vendor.create({
        ...req.body,
        profileId: req.profileId,
        createdBy: req.userId
      });
      return createdResponse(res, vendor, 'Vendor created successfully');
    } catch (error) {
      console.error('Create vendor error:', error);
      return errorResponse(res, 'Failed to create vendor', 500);
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

      if (req.query.vendorType) where.vendorType = req.query.vendorType;
      if (req.query.isActive === 'true') {
        where.isActive = true;
      } else if (req.query.isActive === 'false') {
        where.isActive = false;
      } else {
        where.isActive = true;
      }

      const { count, rows } = await db.Vendor.findAndCountAll({
        where, limit, offset, order, distinct: true
      });

      const response = formatPaginationResponse(rows, page, limit, count);
      return paginatedResponse(res, response.data, response.pagination, 'Vendors retrieved successfully');
    } catch (error) {
      console.error('Get vendors error:', error);
      return errorResponse(res, 'Failed to retrieve vendors', 500);
    }
  },

  getById: async (req, res) => {
    try {
      const vendor = await db.Vendor.findOne({
        where: { id: req.params.id, profileId: req.profileId }
      });
      if (!vendor) return errorResponse(res, 'Vendor not found', 404);
      return successResponse(res, vendor, 'Vendor retrieved successfully');
    } catch (error) {
      console.error('Get vendor error:', error);
      return errorResponse(res, 'Failed to retrieve vendor', 500);
    }
  },

  update: async (req, res) => {
    try {
      const vendor = await db.Vendor.findOne({
        where: { id: req.params.id, profileId: req.profileId }
      });
      if (!vendor) return errorResponse(res, 'Vendor not found', 404);

      await vendor.update({ ...req.body, updatedBy: req.userId });
      return successResponse(res, vendor, 'Vendor updated successfully');
    } catch (error) {
      console.error('Update vendor error:', error);
      return errorResponse(res, 'Failed to update vendor', 500);
    }
  },

  delete: async (req, res) => {
    try {
      const vendor = await db.Vendor.findOne({
        where: { id: req.params.id, profileId: req.profileId }
      });
      if (!vendor) return errorResponse(res, 'Vendor not found', 404);

      const expenseCount = await db.Expense.count({ where: { vendorId: vendor.id } });
      if (expenseCount > 0) {
        return errorResponse(res, 'Cannot delete vendor with existing expenses', 400);
      }

      await vendor.destroy();
      return successResponse(res, null, 'Vendor deleted successfully');
    } catch (error) {
      console.error('Delete vendor error:', error);
      return errorResponse(res, 'Failed to delete vendor', 500);
    }
  }
};

module.exports = VendorController;