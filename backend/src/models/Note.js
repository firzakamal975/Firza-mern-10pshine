const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Note = sequelize.define('Note', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    tags: {
        type: DataTypes.JSON,
        defaultValue: []
    }
}, {
    tableName: 'notes',
    timestamps: true
});

User.hasMany(Note, { 
    foreignKey: 'userId', 
    as: 'notes',
    onDelete: 'CASCADE' 
});
Note.belongsTo(User, {  
    foreignKey: 'userId',
    as: 'author' 
});

module.exports = Note;