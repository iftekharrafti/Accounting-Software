module.exports = (sequelize, DataTypes) => {
  const BudgetCategory = sequelize.define('BudgetCategory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    budgetId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'budgets',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    allocatedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    actualSpent: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    remainingAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    percentageUsed: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'budget_categories',
    timestamps: true,
    indexes: [
      { fields: ['budgetId'] },
      { fields: ['categoryId'] },
      { fields: ['budgetId', 'categoryId'], unique: true }
    ],
    hooks: {
      beforeSave: async (budgetCategory) => {
        // Calculate remaining and percentage
        budgetCategory.remainingAmount = budgetCategory.allocatedAmount - budgetCategory.actualSpent;
        if (budgetCategory.allocatedAmount > 0) {
          budgetCategory.percentageUsed = (budgetCategory.actualSpent / budgetCategory.allocatedAmount) * 100;
        }
      }
    }
  });

  return BudgetCategory;
};