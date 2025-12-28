const db = require('../models');
const { successResponse, errorResponse, createdResponse, paginatedResponse } = require('../utils/responseHandler');
const { buildFilterQuery, buildPaginationOptions, buildSortOptions, formatPaginationResponse } = require('../utils/helper');
const { createAuditLog } = require('../middlewares/auditLogger');

const ProfileController = {
  /**
   * Create new profile
   */
  create: async (req, res) => {
    try {
      const profileData = {
        ...req.body,
        userId: req.userId
      };

      const profile = await db.Profile.create(profileData);

      // Assign user as admin of this profile
      const adminRole = await db.Role.findOne({ where: { name: 'admin' } });
      if (adminRole) {
        await db.UserRole.create({
          userId: req.userId,
          roleId: adminRole.id,
          profileId: profile.id,
          isActive: true,
          assignedBy: req.userId
        });
      }

      // Audit log
      await createAuditLog({
        profileId: profile.id,
        userId: req.userId,
        action: 'create',
        module: 'profile',
        recordId: profile.id,
        description: 'Profile created',
        newValues: profile.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return createdResponse(res, profile, 'Profile created successfully');
    } catch (error) {
      console.error('Create profile error:', error);
      return errorResponse(res, 'Failed to create profile', 500);
    }
  },

  /**
   * Get all profiles for current user
   */
  getAll: async (req, res) => {
    try {
      const { page, limit, offset } = buildPaginationOptions(req.query);
      const order = buildSortOptions(req.query);

      const { count, rows } = await db.Profile.findAndCountAll({
        where: { userId: req.userId },
        limit,
        offset,
        order,
        distinct: true
      });

      const response = formatPaginationResponse(rows, page, limit, count);
      return paginatedResponse(res, response.data, response.pagination, 'Profiles retrieved successfully');
    } catch (error) {
      console.error('Get profiles error:', error);
      return errorResponse(res, 'Failed to retrieve profiles', 500);
    }
  },

  /**
   * Get profile by ID
   */
  getById: async (req, res) => {
    try {
      const profile = await db.Profile.findByPk(req.params.id, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!profile) {
        return errorResponse(res, 'Profile not found', 404);
      }

      // Check access
      if (profile.userId !== req.userId) {
        const userRole = await db.UserRole.findOne({
          where: {
            userId: req.userId,
            profileId: profile.id,
            isActive: true
          }
        });

        if (!userRole) {
          return errorResponse(res, 'Access denied', 403);
        }
      }

      return successResponse(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      return errorResponse(res, 'Failed to retrieve profile', 500);
    }
  },

  /**
   * Update profile
   */
  update: async (req, res) => {
    try {
      const profile = await db.Profile.findByPk(req.params.id);

      if (!profile) {
        return errorResponse(res, 'Profile not found', 404);
      }

      // Check ownership
      if (profile.userId !== req.userId) {
        return errorResponse(res, 'Access denied', 403);
      }

      const oldValues = profile.toJSON();
      await profile.update(req.body);

      // Audit log
      await createAuditLog({
        profileId: profile.id,
        userId: req.userId,
        action: 'update',
        module: 'profile',
        recordId: profile.id,
        description: 'Profile updated',
        oldValues,
        newValues: profile.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, profile, 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      return errorResponse(res, 'Failed to update profile', 500);
    }
  },

  /**
   * Delete profile
   */
  delete: async (req, res) => {
    try {
      const profile = await db.Profile.findByPk(req.params.id);

      if (!profile) {
        return errorResponse(res, 'Profile not found', 404);
      }

      // Check ownership
      if (profile.userId !== req.userId) {
        return errorResponse(res, 'Access denied', 403);
      }

      await profile.destroy();

      // Audit log
      await createAuditLog({
        profileId: profile.id,
        userId: req.userId,
        action: 'delete',
        module: 'profile',
        recordId: profile.id,
        description: 'Profile deleted',
        oldValues: profile.toJSON(),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, null, 'Profile deleted successfully');
    } catch (error) {
      console.error('Delete profile error:', error);
      return errorResponse(res, 'Failed to delete profile', 500);
    }
  },

  /**
   * Switch active profile
   */
  switchProfile: async (req, res) => {
    try {
      const { profileId } = req.body;

      const profile = await db.Profile.findByPk(profileId);

      if (!profile) {
        return errorResponse(res, 'Profile not found', 404);
      }

      // Check access
      if (profile.userId !== req.userId) {
        const userRole = await db.UserRole.findOne({
          where: {
            userId: req.userId,
            profileId: profileId,
            isActive: true
          }
        });

        if (!userRole) {
          return errorResponse(res, 'Access denied', 403);
        }
      }

      return successResponse(res, profile, 'Profile switched successfully');
    } catch (error) {
      console.error('Switch profile error:', error);
      return errorResponse(res, 'Failed to switch profile', 500);
    }
  }
};

module.exports = ProfileController;