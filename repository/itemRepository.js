const db = require('../models');
const Item = db.item;

exports.bulkCreateItems = async (items, transaction) => {
    const createdItems = await Item.bulkCreate(items, { transaction });
    
    return createdItems.map(item => {
        const itemData = item.get({ plain: true });
        delete itemData.createdAt;
        delete itemData.updatedAt;
        return itemData;
    });
};

exports.deleteItemsByOrderId = async (orderId, transaction) => {
    return await Item.destroy({
        where: { orderId: orderId },
        transaction
    });
};