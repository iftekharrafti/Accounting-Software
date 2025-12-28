module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
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
    bankAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bank_accounts',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    transactionNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    transactionType: {
      type: DataTypes.ENUM('income', 'expense', 'transfer', 'adjustment'),
      allowNull: false
    },
    referenceType: {
      type: DataTypes.ENUM('income', 'expense', 'transfer', 'invoice', 'manual'),
      allowNull: true
    },
    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of related income, expense, transfer, or invoice'
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isReconciled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reconciledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['bankAccountId'] },
      { fields: ['transactionType'] },
      { fields: ['transactionDate'] },
      { fields: ['isReconciled'] },
      { fields: ['referenceType', 'referenceId'] }
    ]
  });

  return Transaction;
};