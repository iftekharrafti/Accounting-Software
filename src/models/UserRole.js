module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
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
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    profileId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'profiles',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Role assigned for specific profile/tenant'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'user_roles',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['roleId'] },
      { fields: ['profileId'] },
      { fields: ['userId', 'roleId', 'profileId'], unique: true }
    ]
  });

  return UserRole;
};