module.exports = (sequelize, DataTypes) => {
  const Income = sequelize.define('Income', {
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
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'RESTRICT'
    },
    bankAccountId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'bank_accounts',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    incomeNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: 'Auto-generated income tracking number'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'BDT'
    },
    exchangeRate: {
      type: DataTypes.DECIMAL(10, 4),
      defaultValue: 1.0000
    },
    amountInBaseCurrency: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Converted amount in profile base currency'
    },
    incomeDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    receivedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Cash, Bank Transfer, Check, etc.'
    },
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Invoice number, receipt number, etc.'
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    projectName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recurringFrequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'),
      allowNull: true
    },
    recurringEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextRecurringDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isTaxable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    taxAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    netAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Amount after tax deduction'
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'completed'),
      defaultValue: 'pending'
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of attachment file paths'
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
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'incomes',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['categoryId'] },
      { fields: ['bankAccountId'] },
      { fields: ['incomeNumber'], unique: true },
      { fields: ['incomeDate'] },
      { fields: ['paymentStatus'] },
      { fields: ['status'] },
      { fields: ['isRecurring'] },
      { fields: ['createdAt'] },
      { fields: ['createdBy'] }
    ],
    hooks: {
      beforeCreate: async (income) => {
        // Auto-generate income number
        if (!income.incomeNumber) {
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          income.incomeNumber = `INC-${year}${month}-${random}`;
        }
        
        // Calculate amount in base currency
        if (income.amount && income.exchangeRate) {
          income.amountInBaseCurrency = income.amount * income.exchangeRate;
        }
        
        // Calculate net amount if taxable
        if (income.isTaxable && income.taxRate) {
          income.taxAmount = (income.amount * income.taxRate) / 100;
          income.netAmount = income.amount - income.taxAmount;
        } else {
          income.netAmount = income.amount;
        }
      },
      beforeUpdate: async (income) => {
        // Recalculate amounts if changed
        if (income.changed('amount') || income.changed('exchangeRate')) {
          income.amountInBaseCurrency = income.amount * income.exchangeRate;
        }
        
        if (income.changed('amount') || income.changed('taxRate') || income.changed('isTaxable')) {
          if (income.isTaxable && income.taxRate) {
            income.taxAmount = (income.amount * income.taxRate) / 100;
            income.netAmount = income.amount - income.taxAmount;
          } else {
            income.taxAmount = 0;
            income.netAmount = income.amount;
          }
        }
      }
    }
  });

  return Income;
};