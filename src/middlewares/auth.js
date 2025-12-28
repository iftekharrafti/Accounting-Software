const { verifyAccessToken } = require('../config/jwt');
const db = require('../models');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login to access this resource.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Find user
    const user = await db.User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: db.Profile,
          as: 'profile'
        },
        {
          model: db.Role,
          as: 'roles',
          through: { attributes: [] },
          include: [
            {
              model: db.Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * Profile Middleware
 * Verifies that the user has access to the profile
 */
const checkProfile = async (req, res, next) => {
  try {
    const profileId = req.params.profileId || req.body.profileId || req.query.profileId;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    // Find profile
    const profile = await db.Profile.findByPk(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if user has access to this profile
    const userRole = await db.UserRole.findOne({
      where: {
        userId: req.userId,
        profileId: profileId,
        isActive: true
      }
    });

    // Check if user is the owner or has access
    if (profile.userId !== req.userId && !userRole) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this profile'
      });
    }

    // Attach profile to request
    req.profile = profile;
    req.profileId = profile.id;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Profile verification failed',
      error: error.message
    });
  }
};

/**
 * Permission Middleware
 * Checks if user has required permission
 */
const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Super admin bypass (optional)
      const isSuperAdmin = user.roles?.some(role => role.name === 'super_admin');
      if (isSuperAdmin) {
        return next();
      }

      // Check if user has the required permission
      const hasPermission = user.roles?.some(role =>
        role.permissions?.some(
          permission => permission.module === module && permission.action === action
        )
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `You don't have permission to ${action} ${module}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Permission check failed',
        error: error.message
      });
    }
  };
};

/**
 * Optional Authentication
 * Attaches user if token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);

      const user = await db.User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });

      if (user && user.isActive) {
        req.user = user;
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

module.exports = {
  authenticate,
  checkProfile,
  checkPermission,
  optionalAuth
};