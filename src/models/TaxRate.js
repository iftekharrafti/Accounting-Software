module.exports = (sequelize, DataTypes) => {
  const TaxRate = sequelize.define('TaxRate', {
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
    type: {
      type: DataTypes.ENUM('VAT', 'GST', 'Sales_Tax', 'Income_Tax', 'Other'),
      defaultValue: 'VAT'
    },
    rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Tax rate in percentage'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isCompound: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Is this a compound tax'
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    tableName: 'tax_rates',
    timestamps: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['type'] },
      { fields: ['isActive'] }
    ]
  });

  return TaxRate;
};