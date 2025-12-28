module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
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
    clientId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    invoiceDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    issueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paidDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'draft'
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'partial', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'unpaid'
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'BDT'
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    taxAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    discountAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    discountType: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      defaultValue: 'fixed'
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    shippingCharge: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    adjustmentAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    paidAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    balanceAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recurringFrequency: {
      type: DataTypes.ENUM('weekly', 'monthly', 'quarterly', 'yearly'),
      allowNull: true
    },
    nextInvoiceDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    recurringEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paymentTerms: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: 'Payment due in X days'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referenceNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    purchaseOrderNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    terms: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    footer: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastReminderDate: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'invoices',
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['clientId'] },
      { fields: ['invoiceNumber'], unique: true },
      { fields: ['invoiceDate'] },
      { fields: ['dueDate'] },
      { fields: ['status'] },
      { fields: ['paymentStatus'] },
      { fields: ['createdAt'] }
    ],
    hooks: {
      beforeCreate: async (invoice) => {
        // Auto-generate invoice number if not provided
        if (!invoice.invoiceNumber) {
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          invoice.invoiceNumber = `INV-${year}${month}-${random}`;
        }
      }
    }
  });

  return Invoice;
};