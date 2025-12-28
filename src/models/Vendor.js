module.exports = (sequelize, DataTypes) => {
  const Vendor = sequelize.define('Vendor', {
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
    vendorNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    vendorType: {
      type: DataTypes.ENUM('individual', 'company'),
      defaultValue: 'company'
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    alternatePhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    taxNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bankAccountNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bankRoutingNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'BDT'
    },
    paymentTerms: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    creditLimit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
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
    }
  }, {
    tableName: 'vendors',
    timestamps: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['vendorNumber'], unique: true },
      { fields: ['email'] },
      { fields: ['isActive'] },
      { fields: ['createdAt'] }
    ]
  });

  return Vendor;
};