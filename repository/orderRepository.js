const db = require('../models');
const Order = db.order;
const Item = db.item;

exports.createOrder = async (orderData, transaction) => {
    return await Order.create(orderData, { transaction });
};

exports.findOrderById = async (orderId) => {
    return await Order.findByPk(orderId, {
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [{ 
            model: Item, 
            as: 'items',
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        }]
    });
};

exports.findAllOrders = async () => {
    return await Order.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [{ 
            model: Item, 
            as: 'items',
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        }]
    });
};

exports.updateOrder = async (existingOrder, updateData, transaction) => {
    return await existingOrder.update(updateData, { transaction });
};

exports.deleteOrder = async (orderId, transaction) => {
    return await Order.destroy({
        where: { orderId: orderId },
        transaction
    });
};