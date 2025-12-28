module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
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
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('income', 'expense', 'both'),
      allowNull: false,
      defaultValue: 'expense'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#3B82F6'
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'System categories cannot be deleted'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isTaxable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    taxRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    budgetAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
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
    tableName: 'categories',
    timestamps: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['parentId'] },
      { fields: ['type'] },
      { fields: ['isActive'] },
      { fields: ['createdAt'] }
    ]
  });

  return Category;
};