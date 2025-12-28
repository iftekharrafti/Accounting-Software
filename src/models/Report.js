module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
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
    reportType: {
      type: DataTypes.ENUM(
        'profit_loss', 
        'balance_sheet', 
        'cash_flow', 
        'income_statement', 
        'expense_report',
        'tax_report',
        'budget_report',
        'category_report',
        'custom'
      ),
      allowNull: false
    },
    reportName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    filters: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Store report filters and parameters'
    },
    reportData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Cached report data'
    },
    generatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL to exported file'
    },
    fileFormat: {
      type: DataTypes.ENUM('pdf', 'excel', 'csv', 'json'),
      allowNull: true
    },
    isScheduled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    scheduleFrequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
      allowNull: true
    },
    nextScheduledDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emailRecipients: {
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
    }
  }, {
    tableName: 'reports',
    timestamps: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['reportType'] },
      { fields: ['isScheduled'] },
      { fields: ['createdAt'] }
    ]
  });

  return Report;
};