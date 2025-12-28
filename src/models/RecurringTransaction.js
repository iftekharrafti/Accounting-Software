module.exports = (sequelize, DataTypes) => {
  const RecurringTransaction = sequelize.define('RecurringTransaction', {
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
    transactionType: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    bankAccountId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'bank_accounts',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    frequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextOccurrence: {
      type: DataTypes.DATE,
      allowNull: false
    },
    lastProcessedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    numberOfOccurrences: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Total number of times to occur'
    },
    occurrencesCreated: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'completed', 'cancelled'),
      defaultValue: 'active'
    },
    description: {
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
    }
  }, {
    tableName: 'recurring_transactions',
    timestamps: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['transactionType'] },
      { fields: ['status'] },
      { fields: ['nextOccurrence'] }
    ]
  });

  return RecurringTransaction;
};