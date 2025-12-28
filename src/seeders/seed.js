require('dotenv').config();
const db = require('../models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Sync database
    await db.sequelize.sync({ force: true });
    console.log('✓ Database synced');

    // Create Permissions
    const permissions = [
      // Income permissions
      { name: 'income.create', displayName: 'Create Income', module: 'income', action: 'create' },
      { name: 'income.read', displayName: 'View Income', module: 'income', action: 'read' },
      { name: 'income.update', displayName: 'Update Income', module: 'income', action: 'update' },
      { name: 'income.delete', displayName: 'Delete Income', module: 'income', action: 'delete' },
      { name: 'income.approve', displayName: 'Approve Income', module: 'income', action: 'approve' },
      { name: 'income.export', displayName: 'Export Income', module: 'income', action: 'export' },

      // Expense permissions
      { name: 'expense.create', displayName: 'Create Expense', module: 'expense', action: 'create' },
      { name: 'expense.read', displayName: 'View Expense', module: 'expense', action: 'read' },
      { name: 'expense.update', displayName: 'Update Expense', module: 'expense', action: 'update' },
      { name: 'expense.delete', displayName: 'Delete Expense', module: 'expense', action: 'delete' },
      { name: 'expense.approve', displayName: 'Approve Expense', module: 'expense', action: 'approve' },
      { name: 'expense.export', displayName: 'Export Expense', module: 'expense', action: 'export' },

      // Category permissions
      { name: 'category.create', displayName: 'Create Category', module: 'category', action: 'create' },
      { name: 'category.read', displayName: 'View Category', module: 'category', action: 'read' },
      { name: 'category.update', displayName: 'Update Category', module: 'category', action: 'update' },
      { name: 'category.delete', displayName: 'Delete Category', module: 'category', action: 'delete' },

      // Budget permissions
      { name: 'budget.create', displayName: 'Create Budget', module: 'budget', action: 'create' },
      { name: 'budget.read', displayName: 'View Budget', module: 'budget', action: 'read' },
      { name: 'budget.update', displayName: 'Update Budget', module: 'budget', action: 'update' },
      { name: 'budget.delete', displayName: 'Delete Budget', module: 'budget', action: 'delete' },

      // Invoice permissions
      { name: 'invoice.create', displayName: 'Create Invoice', module: 'invoice', action: 'create' },
      { name: 'invoice.read', displayName: 'View Invoice', module: 'invoice', action: 'read' },
      { name: 'invoice.update', displayName: 'Update Invoice', module: 'invoice', action: 'update' },
      { name: 'invoice.delete', displayName: 'Delete Invoice', module: 'invoice', action: 'delete' },
      { name: 'invoice.export', displayName: 'Export Invoice', module: 'invoice', action: 'export' },

      // Bank Account permissions
      { name: 'bank.create', displayName: 'Create Bank Account', module: 'bank', action: 'create' },
      { name: 'bank.read', displayName: 'View Bank Account', module: 'bank', action: 'read' },
      { name: 'bank.update', displayName: 'Update Bank Account', module: 'bank', action: 'update' },
      { name: 'bank.delete', displayName: 'Delete Bank Account', module: 'bank', action: 'delete' },

      // Report permissions
      { name: 'report.create', displayName: 'Create Report', module: 'report', action: 'create' },
      { name: 'report.read', displayName: 'View Report', module: 'report', action: 'read' },
      { name: 'report.export', displayName: 'Export Report', module: 'report', action: 'export' }
    ];

    const createdPermissions = await db.Permission.bulkCreate(permissions);
    console.log(`✓ Created ${createdPermissions.length} permissions`);

    // Create Roles
    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
        description: 'Full system access',
        isSystem: true,
        priority: 100
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Profile administrator',
        isSystem: true,
        priority: 90
      },
      {
        name: 'manager',
        displayName: 'Manager',
        description: 'Manage income, expenses, and budgets',
        isSystem: true,
        priority: 70
      },
      {
        name: 'accountant',
        displayName: 'Accountant',
        description: 'View and manage financial data',
        isSystem: true,
        priority: 60
      },
      {
        name: 'user',
        displayName: 'User',
        description: 'Basic user access',
        isSystem: true,
        priority: 10
      }
    ];

    const createdRoles = await db.Role.bulkCreate(roles);
    console.log(`✓ Created ${createdRoles.length} roles`);

    // Assign permissions to roles
    const superAdminRole = createdRoles.find(r => r.name === 'super_admin');
    const adminRole = createdRoles.find(r => r.name === 'admin');
    const managerRole = createdRoles.find(r => r.name === 'manager');
    const accountantRole = createdRoles.find(r => r.name === 'accountant');
    const userRole = createdRoles.find(r => r.name === 'user');

    // Super Admin - All permissions
    await superAdminRole.setPermissions(createdPermissions);

    // Admin - All except some system permissions
    const adminPermissions = createdPermissions.filter(p => !p.name.includes('system'));
    await adminRole.setPermissions(adminPermissions);

    // Manager - Income, Expense, Budget, Category
    const managerPermissions = createdPermissions.filter(p =>
      ['income', 'expense', 'budget', 'category', 'invoice'].includes(p.module) &&
      ['create', 'read', 'update', 'approve'].includes(p.action)
    );
    await managerRole.setPermissions(managerPermissions);

    // Accountant - Read all, manage reports
    const accountantPermissions = createdPermissions.filter(p =>
      p.action === 'read' || (p.module === 'report' && ['create', 'export'].includes(p.action))
    );
    await accountantRole.setPermissions(accountantPermissions);

    // User - Read only
    const userPermissions = createdPermissions.filter(p => p.action === 'read');
    await userRole.setPermissions(userPermissions);

    console.log('✓ Assigned permissions to roles');

    // Create default categories
    const defaultCategories = [
      // Income categories
      { name: 'Salary', type: 'income', color: '#10B981', icon: '💰', isSystem: true },
      { name: 'Business Income', type: 'income', color: '#3B82F6', icon: '💼', isSystem: true },
      { name: 'Investment', type: 'income', color: '#8B5CF6', icon: '📈', isSystem: true },
      { name: 'Freelance', type: 'income', color: '#F59E0B', icon: '💻', isSystem: true },
      { name: 'Other Income', type: 'income', color: '#6B7280', icon: '💵', isSystem: true },

      // Expense categories
      { name: 'Food & Dining', type: 'expense', color: '#EF4444', icon: '🍔', isSystem: true },
      { name: 'Transportation', type: 'expense', color: '#F59E0B', icon: '🚗', isSystem: true },
      { name: 'Shopping', type: 'expense', color: '#EC4899', icon: '🛍️', isSystem: true },
      { name: 'Entertainment', type: 'expense', color: '#8B5CF6', icon: '🎬', isSystem: true },
      { name: 'Bills & Utilities', type: 'expense', color: '#3B82F6', icon: '📱', isSystem: true },
      { name: 'Healthcare', type: 'expense', color: '#10B981', icon: '🏥', isSystem: true },
      { name: 'Education', type: 'expense', color: '#6366F1', icon: '📚', isSystem: true },
      { name: 'Rent', type: 'expense', color: '#DC2626', icon: '🏠', isSystem: true },
      { name: 'Insurance', type: 'expense', color: '#059669', icon: '🛡️', isSystem: true },
      { name: 'Other Expense', type: 'expense', color: '#6B7280', icon: '📝', isSystem: true }
    ];

    // Note: Categories need profileId, so create them when a profile is created
    console.log('✓ Default categories defined (will be created with profiles)');

    // Create demo admin user
    const demoUser = await db.User.create({
      email: 'admin@gmail.com',
      password: '123456',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      isVerified: true
    });

    await demoUser.addRole(adminRole);
    console.log('✓ Created demo admin user (admin@gmail.com / 123456)');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDefault Credentials:');
    console.log('Email: admin@gmail.com');
    console.log('Password: 123456');

    process.exit(0);
  } catch (error) {
    console.error('✗ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();