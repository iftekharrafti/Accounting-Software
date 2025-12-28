module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define('Attachment', {
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
    referenceType: {
      type: DataTypes.ENUM('income', 'expense', 'invoice', 'client', 'vendor', 'other'),
      allowNull: false
    },
    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of the related entity'
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'File size in bytes'
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileExtension: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'attachments',
    timestamps: true,
    indexes: [
      { fields: ['profileId'] },
      { fields: ['referenceType'] },
      { fields: ['referenceId'] },
      { fields: ['uploadedBy'] }
    ]
  });

  return Attachment;
};