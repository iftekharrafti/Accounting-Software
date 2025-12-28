module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'System roles cannot be deleted'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Higher priority roles have more authority'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'roles',
    timestamps: true,
    indexes: [
      { fields: ['name'], unique: true },
      { fields: ['isActive'] }
    ]
  });

  return Role;
};