const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Item = sequelize.define('item', {
        orderId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'orders',
                key: 'orderId'
            }
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'items'
    });

    Item.associate = (models) => {
        Item.belongsTo(models.order, {
            foreignKey: 'orderId',
            as: 'order'
        });
    };

    return Item;
};