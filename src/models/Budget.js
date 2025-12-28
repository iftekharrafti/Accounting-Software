module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define('Budget', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    profileId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    budgetType: {
      type: DataTypes.ENUM('monthly', 'quarterly', 'yearly', 'custom'),
      defaultValue: 'monthly'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'BDT'
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
    status: {
      type: DataTypes.ENUM('draft', 'active', 'completed', 'exceeded', 'cancelled'),
      defaultValue: 'draft'
    },
    isRollover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Unused budget rolls over to next period'
    },
    rolloverAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    alertThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 80,
      comment: 'Alert when budget usage reaches this percentage'
    },
    isAlertEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    alertSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'budgets',
    timestamps: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['budgetType'] },
      { fields: ['status'] },
      { fields: ['startDate'] },
      { fields: ['endDate'] },
      { fields: ['createdAt'] }
    ]
  });

  return Budget;
};