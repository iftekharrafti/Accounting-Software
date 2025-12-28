module.exports = (sequelize, DataTypes) => {
  const BankAccount = sequelize.define('BankAccount', {
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
    accountName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountType: {
      type: DataTypes.ENUM('checking', 'savings', 'credit_card', 'cash', 'investment', 'loan', 'other'),
      allowNull: false,
      defaultValue: 'checking'
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bankBranch: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ifscCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    swiftCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    routingNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'BDT'
    },
    initialBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    currentBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    availableBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    creditLimit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      comment: 'For credit cards'
    },
    overdraftLimit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    minimumBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    accountHolderName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    openingDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    closingDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#3B82F6'
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'bank_accounts',
    timestamps: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['accountType'] },
      { fields: ['isActive'] },
      { fields: ['isDefault'] },
      { fields: ['createdAt'] }
    ]
  });

  return BankAccount;
};