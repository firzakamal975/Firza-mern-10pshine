const { DataTypes } = require('sequelize');
// FIXED: Destructuring use karni hai kyunki db.js ab object export karta hai
const { sequelize } = require('../config/db'); 
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
        validate: { notEmpty: true }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true }
    },
    tags: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    attachment: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // --- PIN AUR FAVORITE KI NAYI FIELDS ---
    isPinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isFavorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
    // ---------------------------------------
}, {
    tableName: 'notes',
    timestamps: true
});

// Relationships
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