module.exports = (sequelize, DataTypes) => {
  const InvoiceItem = sequelize.define('InvoiceItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'invoices',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1.00
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'pcs',
      comment: 'Unit of measurement (pcs, kg, hrs, etc.)'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    taxAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    discountRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    discountAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'invoice_items',
    timestamps: true,
    indexes: [
      { fields: ['invoiceId'] }
    ],
    hooks: {
      beforeSave: async (item) => {
        // Calculate amounts
        item.amount = item.quantity * item.unitPrice;
        
        // Calculate discount
        if (item.discountRate > 0) {
          item.discountAmount = (item.amount * item.discountRate) / 100;
        }
        
        const amountAfterDiscount = item.amount - item.discountAmount;
        
        // Calculate tax
        if (item.taxRate > 0) {
          item.taxAmount = (amountAfterDiscount * item.taxRate) / 100;
        }
        
        // Calculate total
        item.totalAmount = amountAfterDiscount + item.taxAmount;
      }
    }
  });

  return InvoiceItem;
};