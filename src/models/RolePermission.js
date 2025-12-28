module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'role_permissions',
    timestamps: true,
    indexes: [
      { fields: ['roleId'] },
      { fields: ['permissionId'] },
      { fields: ['roleId', 'permissionId'], unique: true }
    ]
  });

  return RolePermission;
};