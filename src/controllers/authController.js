const db = require('../models');
const { generateTokenPair } = require('../config/jwt');
const { successResponse, errorResponse, createdResponse } = require('../utils/responseHandler');
const { createAuditLog } = require('../middlewares/auditLogger');

const AuthController = {
  /**
   * Register new user
   */
  register: async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      // Check if user already exists
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        return errorResponse(res, 'User with this email already exists', 400);
      }

      // Create user
      const user = await db.User.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        isActive: true,
        isVerified: false
      });

      // Assign default role (user)
      const userRole = await db.Role.findOne({ where: { name: 'user' } });
      if (userRole) {
        await db.UserRole.create({
          userId: user.id,
          roleId: userRole.id,
          isActive: true
        });
      }

      // ✅ Create default profile for new user
      const defaultProfile = await db.Profile.create({
        userId: user.id,
        profileName: `${firstName}'s Profile`,
        businessName: `${firstName} ${lastName}`,
        profileType: 'personal',
        currency: 'BDT',
        currencySymbol: '৳',
        fiscalYearStart: '01-01',
        fiscalYearEnd: '12-31',
        timeZone: 'Asia/Dhaka',
        dateFormat: 'DD-MM-YYYY',
        isActive: true,
        isDefault: true
      });

      // Generate tokens
      const tokens = generateTokenPair({ userId: user.id, email: user.email });

      // Update refresh token
      await user.update({ refreshToken: tokens.refreshToken });

      // Audit log
      await createAuditLog({
        userId: user.id,
        action: 'create',
        module: 'auth',
        description: 'User registered',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return createdResponse(res, {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profile: defaultProfile // ✅ Include default profile
        },
        tokens
      }, 'Registration successful');

    } catch (error) {
      console.error('Registration error:', error);
      return errorResponse(res, 'Registration failed', 500);
    }
  },

  /**
   * Login user
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user with roles, permissions, and profiles
      const user = await db.User.findOne({
        where: { email },
        include: [
          {
            model: db.Role,
            as: 'roles',
            through: { attributes: [] },
            include: [{
              model: db.Permission,
              as: 'permissions',
              through: { attributes: [] }
            }]
          },
          // ✅ Include user's first active profile
          {
            model: db.Profile,
            as: 'profile',
            where: { isActive: true },
            required: false
          }
        ]
      });

      if (!user) {
        return errorResponse(res, 'Invalid email or password', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        return errorResponse(res, 'Your account has been deactivated', 403);
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return errorResponse(res, 'Invalid email or password', 401);
      }

      // Generate tokens
      const tokens = generateTokenPair({ userId: user.id, email: user.email });

      // Update user
      await user.update({
        refreshToken: tokens.refreshToken,
        lastLoginAt: new Date(),
        lastLoginIp: req.ip
      });

      // ✅ Get first active profile (or create one if doesn't exist)
      let userProfile = user.profiles && user.profiles.length > 0
        ? user.profiles[0]
        : null;

      // If no profile exists, create default one
      if (!userProfile) {
        userProfile = await db.Profile.create({
          userId: user.id,
          profileName: `${user.firstName}'s Profile`,
          businessName: `${user.firstName} ${user.lastName}`,
          profileType: 'personal',
          currency: 'BDT',
          currencySymbol: '৳',
          fiscalYearStart: '01-01',
          fiscalYearEnd: '12-31',
          timeZone: 'Asia/Dhaka',
          dateFormat: 'DD-MM-YYYY',
          isActive: true,
          isDefault: true
        });
      }

      // Audit log
      await createAuditLog({
        userId: user.id,
        action: 'login',
        module: 'auth',
        description: 'User logged in',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      // ✅ Format user data with single profile
      const userData = user.toJSON();
      userData.profile = userProfile; // Add single profile
      delete userData.profiles; // Remove profiles array

      return successResponse(res, {
        user: userData,
        tokens
      }, 'Login successful');

    } catch (error) {
      console.error('Login error:', error);
      return errorResponse(res, 'Login failed', 500);
    }
  },

  /**
   * Logout user
   */
  logout: async (req, res) => {
    try {
      await db.User.update(
        { refreshToken: null },
        { where: { id: req.userId } }
      );

      // Audit log
      await createAuditLog({
        userId: req.userId,
        action: 'logout',
        module: 'auth',
        description: 'User logged out',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, null, 'Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      return errorResponse(res, 'Logout failed', 500);
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (req, res) => {
    try {
      const user = await db.User.findByPk(req.userId, {
        include: [
          {
            model: db.Profile,
            as: 'profiles', // ✅ Changed to 'profiles' (plural)
            where: { isActive: true },
            required: false
          },
          {
            model: db.Role,
            as: 'roles',
            through: { attributes: [] }
          }
        ]
      });

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, user, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      return errorResponse(res, 'Failed to retrieve profile', 500);
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (req, res) => {
    try {
      const { firstName, lastName, phone, avatar } = req.body;

      const user = await db.User.findByPk(req.userId);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phone: phone || user.phone,
        avatar: avatar || user.avatar
      });

      // Audit log
      await createAuditLog({
        userId: req.userId,
        action: 'update',
        module: 'user',
        recordId: user.id,
        description: 'User profile updated',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, user, 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      return errorResponse(res, 'Failed to update profile', 500);
    }
  },

  /**
   * Change password
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await db.User.scope('withPassword').findByPk(req.userId);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return errorResponse(res, 'Current password is incorrect', 400);
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Audit log
      await createAuditLog({
        userId: req.userId,
        action: 'update',
        module: 'auth',
        description: 'Password changed',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return successResponse(res, null, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      return errorResponse(res, 'Failed to change password', 500);
    }
  }
};

module.exports = AuthController;