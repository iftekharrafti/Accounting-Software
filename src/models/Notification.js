module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    type: {
      type: DataTypes.ENUM('info', 'warning', 'success', 'error', 'reminder'),
      defaultValue: 'info'
    },
    category: {
      type: DataTypes.ENUM('budget', 'invoice', 'expense', 'income', 'payment', 'system', 'other'),
      defaultValue: 'system'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    referenceType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referenceId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actionText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['userId'] },
      { fields: ['type'] },
      { fields: ['category'] },
      { fields: ['isRead'] },
      { fields: ['createdAt'] }
    ]
  });

  return Notification;
};