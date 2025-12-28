module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define('Expense', {
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
    vendorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    paymentMethodId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'payment_methods',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    expenseNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: 'Auto-generated expense tracking number'
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
      allowNull: true
    },
    expenseDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paidDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Invoice number, bill number, etc.'
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    billNumber: {
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
    isTaxDeductible: {
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
      allowNull: true
    },
    isReimbursable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reimbursementStatus: {
      type: DataTypes.ENUM('not_applicable', 'pending', 'approved', 'rejected', 'reimbursed'),
      defaultValue: 'not_applicable'
    },
    reimbursedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    reimbursedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isMileage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    mileageDistance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Distance in KM'
    },
    mileageRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Rate per KM'
    },
    startLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    endLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'completed'),
      defaultValue: 'pending'
    },
    approvalRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    rejectedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
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
      defaultValue: []
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
    tableName: 'expenses',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['categoryId'] },
      { fields: ['bankAccountId'] },
      { fields: ['vendorId'] },
      { fields: ['expenseNumber'], unique: true },
      { fields: ['expenseDate'] },
      { fields: ['paymentStatus'] },
      { fields: ['status'] },
      { fields: ['isRecurring'] },
      { fields: ['reimbursementStatus'] },
      { fields: ['createdAt'] },
      { fields: ['createdBy'] }
    ],
    hooks: {
      beforeCreate: async (expense) => {
        // Auto-generate expense number
        if (!expense.expenseNumber) {
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          expense.expenseNumber = `EXP-${year}${month}-${random}`;
        }
        
        // Calculate amount in base currency
        if (expense.amount && expense.exchangeRate) {
          expense.amountInBaseCurrency = expense.amount * expense.exchangeRate;
        }
        
        // Calculate mileage amount
        if (expense.isMileage && expense.mileageDistance && expense.mileageRate) {
          expense.amount = expense.mileageDistance * expense.mileageRate;
        }
        
        // Calculate net amount with tax
        if (expense.taxRate) {
          expense.taxAmount = (expense.amount * expense.taxRate) / 100;
          expense.netAmount = expense.amount + expense.taxAmount;
        } else {
          expense.netAmount = expense.amount;
        }
      },
      beforeUpdate: async (expense) => {
        // Recalculate amounts if changed
        if (expense.changed('amount') || expense.changed('exchangeRate')) {
          expense.amountInBaseCurrency = expense.amount * expense.exchangeRate;
        }
        
        if (expense.changed('mileageDistance') || expense.changed('mileageRate')) {
          if (expense.isMileage && expense.mileageDistance && expense.mileageRate) {
            expense.amount = expense.mileageDistance * expense.mileageRate;
          }
        }
        
        if (expense.changed('amount') || expense.changed('taxRate')) {
          if (expense.taxRate) {
            expense.taxAmount = (expense.amount * expense.taxRate) / 100;
            expense.netAmount = expense.amount + expense.taxAmount;
          } else {
            expense.taxAmount = 0;
            expense.netAmount = expense.amount;
          }
        }
      }
    }
  });

  return Expense;
};