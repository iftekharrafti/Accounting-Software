module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
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
    clientNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    clientType: {
      type: DataTypes.ENUM('individual', 'company'),
      defaultValue: 'individual'
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
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
    billingAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    billingCity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    billingState: {
      type: DataTypes.STRING,
      allowNull: true
    },
    billingCountry: {
      type: DataTypes.STRING,
      allowNull: true
    },
    billingZipCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shippingCity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shippingState: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shippingCountry: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shippingZipCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'BDT'
    },
    paymentTerms: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: 'Payment due in X days'
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
    tableName: 'clients',
    timestamps: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['clientNumber'], unique: true },
      { fields: ['email'] },
      { fields: ['isActive'] },
      { fields: ['createdAt'] }
    ]
  });

  return Client;
};