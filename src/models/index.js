const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import Models
db.User = require('./User')(sequelize, Sequelize);
db.Profile = require('./Profile')(sequelize, Sequelize);
db.Role = require('./Role')(sequelize, Sequelize);
db.Permission = require('./Permission')(sequelize, Sequelize);
db.RolePermission = require('./RolePermission')(sequelize, Sequelize);
db.UserRole = require('./UserRole')(sequelize, Sequelize);
db.Category = require('./Category')(sequelize, Sequelize);
db.Income = require('./Income')(sequelize, Sequelize);
db.Expense = require('./Expense')(sequelize, Sequelize);
db.Budget = require('./Budget')(sequelize, Sequelize);
db.BudgetCategory = require('./BudgetCategory')(sequelize, Sequelize);
db.BankAccount = require('./BankAccount')(sequelize, Sequelize);
db.Transaction = require('./Transaction')(sequelize, Sequelize);
db.Transfer = require('./Transfer')(sequelize, Sequelize);
db.Invoice = require('./Invoice')(sequelize, Sequelize);
db.InvoiceItem = require('./InvoiceItem')(sequelize, Sequelize);
db.Client = require('./Client')(sequelize, Sequelize);
db.Vendor = require('./Vendor')(sequelize, Sequelize);
db.PaymentMethod = require('./PaymentMethod')(sequelize, Sequelize);
db.TaxRate = require('./TaxRate')(sequelize, Sequelize);
db.RecurringTransaction = require('./RecurringTransaction')(sequelize, Sequelize);
db.Attachment = require('./Attachment')(sequelize, Sequelize);
db.AuditLog = require('./AuditLog')(sequelize, Sequelize);
db.Notification = require('./Notification')(sequelize, Sequelize);
db.Report = require('./Report')(sequelize, Sequelize);

// Define Associations

// User - Profile (One to One)
db.User.hasOne(db.Profile, { foreignKey: 'userId', as: 'profile' });
db.Profile.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// User - Roles (Many to Many)
db.User.belongsToMany(db.Role, { through: db.UserRole, foreignKey: 'userId', as: 'roles' });
db.Role.belongsToMany(db.User, { through: db.UserRole, foreignKey: 'roleId', as: 'users' });

// Role - Permissions (Many to Many)
db.Role.belongsToMany(db.Permission, { through: db.RolePermission, foreignKey: 'roleId', as: 'permissions' });
db.Permission.belongsToMany(db.Role, { through: db.RolePermission, foreignKey: 'permissionId', as: 'roles' });

// Profile - Categories
db.Profile.hasMany(db.Category, { foreignKey: 'profileId', as: 'categories' });
db.Category.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Category - Parent Category (Self-referencing)
db.Category.hasMany(db.Category, { foreignKey: 'parentId', as: 'subcategories' });
db.Category.belongsTo(db.Category, { foreignKey: 'parentId', as: 'parent' });

// Profile - Income
db.Profile.hasMany(db.Income, { foreignKey: 'profileId', as: 'incomes' });
db.Income.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Category - Income
db.Category.hasMany(db.Income, { foreignKey: 'categoryId', as: 'incomes' });
db.Income.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

// BankAccount - Income
db.BankAccount.hasMany(db.Income, { foreignKey: 'bankAccountId', as: 'incomes' });
db.Income.belongsTo(db.BankAccount, { foreignKey: 'bankAccountId', as: 'bankAccount' });

// Profile - Expense
db.Profile.hasMany(db.Expense, { foreignKey: 'profileId', as: 'expenses' });
db.Expense.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Category - Expense
db.Category.hasMany(db.Expense, { foreignKey: 'categoryId', as: 'expenses' });
db.Expense.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

// BankAccount - Expense
db.BankAccount.hasMany(db.Expense, { foreignKey: 'bankAccountId', as: 'expenses' });
db.Expense.belongsTo(db.BankAccount, { foreignKey: 'bankAccountId', as: 'bankAccount' });

// Vendor - Expense
db.Vendor.hasMany(db.Expense, { foreignKey: 'vendorId', as: 'expenses' });
db.Expense.belongsTo(db.Vendor, { foreignKey: 'vendorId', as: 'vendor' });

// PaymentMethod - Expense
db.PaymentMethod.hasMany(db.Expense, { foreignKey: 'paymentMethodId', as: 'expenses' });
db.Expense.belongsTo(db.PaymentMethod, { foreignKey: 'paymentMethodId', as: 'paymentMethodInfo' });

// Profile - Budget
db.Profile.hasMany(db.Budget, { foreignKey: 'profileId', as: 'budgets' });
db.Budget.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Budget - BudgetCategory
db.Budget.hasMany(db.BudgetCategory, { foreignKey: 'budgetId', as: 'budgetCategories' });
db.BudgetCategory.belongsTo(db.Budget, { foreignKey: 'budgetId', as: 'budget' });

// Category - BudgetCategory
db.Category.hasMany(db.BudgetCategory, { foreignKey: 'categoryId', as: 'budgetCategories' });
db.BudgetCategory.belongsTo(db.Category, { foreignKey: 'categoryId', as: 'category' });

// Profile - BankAccount
db.Profile.hasMany(db.BankAccount, { foreignKey: 'profileId', as: 'bankAccounts' });
db.BankAccount.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Profile - Transaction
db.Profile.hasMany(db.Transaction, { foreignKey: 'profileId', as: 'transactions' });
db.Transaction.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// BankAccount - Transaction
db.BankAccount.hasMany(db.Transaction, { foreignKey: 'bankAccountId', as: 'transactions' });
db.Transaction.belongsTo(db.BankAccount, { foreignKey: 'bankAccountId', as: 'bankAccount' });

// Profile - Transfer
db.Profile.hasMany(db.Transfer, { foreignKey: 'profileId', as: 'transfers' });
db.Transfer.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// BankAccount - Transfer (From)
db.BankAccount.hasMany(db.Transfer, { foreignKey: 'fromAccountId', as: 'transfersFrom' });
db.Transfer.belongsTo(db.BankAccount, { foreignKey: 'fromAccountId', as: 'fromAccount' });

// BankAccount - Transfer (To)
db.BankAccount.hasMany(db.Transfer, { foreignKey: 'toAccountId', as: 'transfersTo' });
db.Transfer.belongsTo(db.BankAccount, { foreignKey: 'toAccountId', as: 'toAccount' });

// Profile - Invoice
db.Profile.hasMany(db.Invoice, { foreignKey: 'profileId', as: 'invoices' });
db.Invoice.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Client - Invoice
db.Client.hasMany(db.Invoice, { foreignKey: 'clientId', as: 'invoices' });
db.Invoice.belongsTo(db.Client, { foreignKey: 'clientId', as: 'client' });

// Invoice - InvoiceItem
db.Invoice.hasMany(db.InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
db.InvoiceItem.belongsTo(db.Invoice, { foreignKey: 'invoiceId', as: 'invoice' });

// Profile - Client
db.Profile.hasMany(db.Client, { foreignKey: 'profileId', as: 'clients' });
db.Client.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Profile - Vendor
db.Profile.hasMany(db.Vendor, { foreignKey: 'profileId', as: 'vendors' });
db.Vendor.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Profile - PaymentMethod
db.Profile.hasMany(db.PaymentMethod, { foreignKey: 'profileId', as: 'paymentMethods' });
db.PaymentMethod.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Profile - TaxRate
db.Profile.hasMany(db.TaxRate, { foreignKey: 'profileId', as: 'taxRates' });
db.TaxRate.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Profile - RecurringTransaction
db.Profile.hasMany(db.RecurringTransaction, { foreignKey: 'profileId', as: 'recurringTransactions' });
db.RecurringTransaction.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Polymorphic Attachments
db.Attachment.belongsTo(db.Income, { foreignKey: 'referenceId', constraints: false, as: 'income' });
db.Attachment.belongsTo(db.Expense, { foreignKey: 'referenceId', constraints: false, as: 'expense' });
db.Attachment.belongsTo(db.Invoice, { foreignKey: 'referenceId', constraints: false, as: 'invoice' });

// Profile - Attachment
db.Profile.hasMany(db.Attachment, { foreignKey: 'profileId', as: 'attachments' });
db.Attachment.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Profile - AuditLog
db.Profile.hasMany(db.AuditLog, { foreignKey: 'profileId', as: 'auditLogs' });
db.AuditLog.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// User - AuditLog
db.User.hasMany(db.AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
db.AuditLog.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Profile - Notification
db.Profile.hasMany(db.Notification, { foreignKey: 'profileId', as: 'notifications' });
db.Notification.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// User - Notification
db.User.hasMany(db.Notification, { foreignKey: 'userId', as: 'notifications' });
db.Notification.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Profile - Report
db.Profile.hasMany(db.Report, { foreignKey: 'profileId', as: 'reports' });
db.Report.belongsTo(db.Profile, { foreignKey: 'profileId', as: 'profile' });

// Created By / Updated By associations
const createdUpdatedModels = [
    'Income', 'Expense', 'Category', 'Budget', 'BankAccount',
    'Invoice', 'Client', 'Vendor', 'PaymentMethod', 'TaxRate'
];

createdUpdatedModels.forEach(modelName => {
    if (db[modelName]) {
        db[modelName].belongsTo(db.User, { foreignKey: 'createdBy', as: 'creator' });
        db[modelName].belongsTo(db.User, { foreignKey: 'updatedBy', as: 'updater' });
    }
});

module.exports = db;