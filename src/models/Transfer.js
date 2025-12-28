module.exports = (sequelize, DataTypes) => {
  const Transfer = sequelize.define('Transfer', {
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
    fromAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bank_accounts',
        key: 'id'
      },
      onDelete: 'RESTRICT'
    },
    toAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bank_accounts',
        key: 'id'
      },
      onDelete: 'RESTRICT'
    },
    transferNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    fromCurrency: {
      type: DataTypes.STRING,
      defaultValue: 'BDT'
    },
    toCurrency: {
      type: DataTypes.STRING,
      defaultValue: 'BDT'
    },
    exchangeRate: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 1.0000
    },
    convertedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Amount in destination currency'
    },
    transferFee: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    transferDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'failed'),
      defaultValue: 'completed'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    referenceNumber: {
      type: DataTypes.STRING,
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
    }
  }, {
    tableName: 'transfers',
    timestamps: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['fromAccountId'] },
      { fields: ['toAccountId'] },
      { fields: ['transferDate'] },
      { fields: ['status'] }
    ],
    hooks: {
      beforeCreate: async (transfer) => {
        // Auto-generate transfer number
        if (!transfer.transferNumber) {
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          transfer.transferNumber = `TRF-${year}${month}-${random}`;
        }
        
        // Calculate converted amount
        if (transfer.amount && transfer.exchangeRate) {
          transfer.convertedAmount = transfer.amount * transfer.exchangeRate;
        }
      }
    }
  });

  return Transfer;
};