const { Op } = require('sequelize');

/**
 * Build filter query from request query parameters
 * Supports: search, status, date ranges, category, etc.
 */
const buildFilterQuery = (query, allowedFilters = []) => {
  const where = {};
  const include = [];

  // Search filter
  if (query.search && allowedFilters.includes('search')) {
    where[Op.or] = [
      { title: { [Op.like]: `%${query.search}%` } },
      { description: { [Op.like]: `%${query.search}%` } }
    ];
  }

  // Status filter
  if (query.status && allowedFilters.includes('status')) {
    where.status = query.status;
  }

  // Payment status filter
  if (query.paymentStatus && allowedFilters.includes('paymentStatus')) {
    where.paymentStatus = query.paymentStatus;
  }

  // Category filter
  if (query.categoryId && allowedFilters.includes('categoryId')) {
    where.categoryId = query.categoryId;
  }

  // Bank account filter
  if (query.bankAccountId && allowedFilters.includes('bankAccountId')) {
    where.bankAccountId = query.bankAccountId;
  }

  // Date range filter
  if (allowedFilters.includes('dateRange')) {
    const dateField = query.dateField || 'createdAt';

    if (query.startDate || query.endDate) {
      where[dateField] = {};

      if (query.startDate) {
        where[dateField][Op.gte] = new Date(query.startDate);
      }

      if (query.endDate) {
        where[dateField][Op.lte] = new Date(query.endDate);
      }
    }
  }

  // Amount range filter
  if (allowedFilters.includes('amountRange')) {
    if (query.minAmount || query.maxAmount) {
      where.amount = {};

      if (query.minAmount) {
        where.amount[Op.gte] = parseFloat(query.minAmount);
      }

      if (query.maxAmount) {
        where.amount[Op.lte] = parseFloat(query.maxAmount);
      }
    }
  }

  // Active filter
  if (query.isActive !== undefined && allowedFilters.includes('isActive')) {
    where.isActive = query.isActive === 'true';
  }

  return { where, include };
};

/**
 * Build pagination options
 */
const buildPaginationOptions = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE || 20), parseInt(process.env.MAX_PAGE_SIZE || 100));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Build sort options
 */
const buildSortOptions = (query, defaultSort = [['createdAt', 'DESC']]) => {
  const sortBy = query.sortBy;
  const sortOrder = query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  if (sortBy) {
    return [[sortBy, sortOrder]];
  }

  return defaultSort;
};

/**
 * Format pagination response
 */
const formatPaginationResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      pageSize: limit,
      totalItems: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Calculate date range
 */
const calculateDateRange = (period) => {
  const today = new Date();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = new Date(today.setHours(0, 0, 0, 0));
      endDate = new Date(today.setHours(23, 59, 59, 999));
      break;

    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = new Date(yesterday.setHours(0, 0, 0, 0));
      endDate = new Date(yesterday.setHours(23, 59, 59, 999));
      break;

    case 'this_week':
      const firstDay = today.getDate() - today.getDay();
      startDate = new Date(today.setDate(firstDay));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      break;

    case 'last_week':
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
      lastWeekStart.setHours(0, 0, 0, 0);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      lastWeekEnd.setHours(23, 59, 59, 999);
      startDate = lastWeekStart;
      endDate = lastWeekEnd;
      break;

    case 'this_month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      break;

    case 'last_month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
      break;

    case 'this_quarter':
      const quarter = Math.floor(today.getMonth() / 3);
      startDate = new Date(today.getFullYear(), quarter * 3, 1);
      endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
      break;

    case 'this_year':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;

    case 'last_year':
      startDate = new Date(today.getFullYear() - 1, 0, 1);
      endDate = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      break;

    default:
      startDate = null;
      endDate = null;
  }

  return { startDate, endDate };
};

/**
 * Generate unique number with prefix
 */
const generateUniqueNumber = (prefix = 'NUM', length = 6) => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
  return `${prefix}-${timestamp.slice(-8)}-${random}`;
};

/**
 * Format currency
 */
const formatCurrency = (amount, currency = 'BDT') => {
  const symbols = {
    BDT: '৳',
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹'
  };

  const symbol = symbols[currency] || currency;
  return `${symbol} ${parseFloat(amount).toFixed(2)}`;
};

/**
 * Safe JSON parse
 */
const safeJSONParse = (str, defaultValue = {}) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
};

module.exports = {
  buildFilterQuery,
  buildPaginationOptions,
  buildSortOptions,
  formatPaginationResponse,
  calculateDateRange,
  generateUniqueNumber,
  formatCurrency,
  safeJSONParse
};