const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Order = sequelize.define('order', {
        orderId: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        creationDate: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'orders'
    });

    Order.associate = (models) => {
        Order.hasMany(models.item, {
            foreignKey: 'orderId',
            as: 'items'
        });
    };

    return Order;

};
