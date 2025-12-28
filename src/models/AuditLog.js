module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    profileId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'profiles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    action: {
      type: DataTypes.ENUM('create', 'read', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'export', 'import'),
      allowNull: false
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'income, expense, invoice, etc.'
    },
    recordType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Type of record being audited'
    },
    recordId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of the record being audited'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    oldValues: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Previous values before change'
    },
    newValues: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'New values after change'
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'audit_logs',
    timestamps: false,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['userId'] },
      { fields: ['action'] },
      { fields: ['module'] },
      { fields: ['recordType'] },
      { fields: ['recordId'] },
      { fields: ['timestamp'] }
    ]
  });

  return AuditLog;
};