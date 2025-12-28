module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define('Profile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    profileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    businessType: {
      type: DataTypes.ENUM('personal', 'business', 'organization', 'freelancer'),
      defaultValue: 'personal'
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
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
      defaultValue: 'Bangladesh'
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'BDT'
    },
    currencySymbol: {
      type: DataTypes.STRING,
      defaultValue: '৳'
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'Asia/Dhaka'
    },
    dateFormat: {
      type: DataTypes.STRING,
      defaultValue: 'DD-MM-YYYY'
    },
    timeFormat: {
      type: DataTypes.STRING,
      defaultValue: '12h'
    },
    fiscalYearStart: {
      type: DataTypes.STRING,
      defaultValue: '01-07' // July 1st
    },
    taxNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    registrationNumber: {
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
    bankBranchName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bankRoutingNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subscriptionPlan: {
      type: DataTypes.ENUM('free', 'basic', 'pro', 'enterprise'),
      defaultValue: 'free'
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('active', 'inactive', 'trial', 'suspended', 'cancelled'),
      defaultValue: 'trial'
    },
    subscriptionStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    trialEndsAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        features: {
          invoicing: true,
          budgeting: true,
          reporting: true,
          multiCurrency: false,
          taxManagement: true
        },
        autoBackup: true,
        reportSchedule: 'monthly'
      }
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'profiles',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['businessType'] },
      { fields: ['subscriptionPlan'] },
      { fields: ['isActive'] },
      { fields: ['createdAt'] }
    ]
  });

  return Profile;
};