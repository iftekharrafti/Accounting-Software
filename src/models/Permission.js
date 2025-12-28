module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'e.g., income.create, expense.delete'
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'e.g., income, expense, invoice, budget'
    },
    action: {
      type: DataTypes.ENUM('create', 'read', 'update', 'delete', 'approve', 'export', 'import'),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'permissions',
    timestamps: true,
    indexes: [
      { fields: ['name'], unique: true },
      { fields: ['module'] },
      { fields: ['action'] },
      { fields: ['isActive'] }
    ]
  });

  return Permission;
};