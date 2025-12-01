const db = require('../models');
const sequelize = db.sequelize;
const orderRepository = require('../repository/orderRepository');
const itemRepository = require('../repository/itemRepository');

const mapIncomingData = (incomingData) => {
    const {
        numeroPedido: orderId, 
        valorTotal: value, 
        dataCriacao: creationDate, 
        items: incomingItems
    } = incomingData;

    const items = incomingItems ? incomingItems.map(item => {
        const {
            idItem: productId, 
            quantidadeItem: quantity, 
            valorItem: price 
        } = item;
        
        return { 
            productId: parseInt(productId),
            quantity: parseInt(quantity), 
            price: parseFloat(price) 
        };
    }) : [];

    return { 
        orderId, 
        value: value !== undefined ? parseFloat(value) : undefined, 
        creationDate, 
        items 
    };
};

const validateOrderConsistency = (orderValue, items) => {
    if (!items || items.length === 0) {
        return 'O pedido deve conter pelo menos um item.';
    }

    let calculatedTotal = 0;

    for (const item of items) {
        if (item.quantity <= 0) {
            return `Item (Produto ID: ${item.productId}) tem quantidade inválida. Deve ser maior que zero.`;
        }
        if (item.price < 0) {
            return `Item (Produto ID: ${item.productId}) tem preço negativo.`;
        }
        calculatedTotal += item.quantity * item.price;
    }

    calculatedTotal = Math.round(calculatedTotal * 100) / 100;
    const providedTotal = Math.round(orderValue * 100) / 100;

    if (calculatedTotal !== providedTotal) {
        return `Divergência de valores. Valor Total enviado: ${providedTotal}. Soma dos itens: ${calculatedTotal}.`;
    }

    return null;
};

exports.createOrderService = async (rawData) => {
    const mappedData = mapIncomingData(rawData);
    const { orderId, value, creationDate, items } = mappedData;
    
    const validationError = validateOrderConsistency(value, items);
    if (validationError) {
        throw { status: 400, message: 'Erro de validação', details: validationError };
    }

    let transaction;
    try {
        transaction = await sequelize.transaction();

        const newOrder = await orderRepository.createOrder({
            orderId,
            value,
            creationDate,
        }, transaction);

        const itemsWithOrderId = items.map(item => ({
            ...item,
            orderId: newOrder.orderId
        }));

        await itemRepository.bulkCreateItems(itemsWithOrderId, transaction);
        
        await transaction.commit();

        return await orderRepository.findOrderById(newOrder.orderId);

    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
};

exports.getOrderByIdService = async (numeroPedido) => {
    const order = await orderRepository.findOrderById(numeroPedido);
    if (!order) {
        throw { status: 404, message: `Pedido ID: ${numeroPedido} não encontrado.` };
    }
    return order;
};

exports.listOrdersService = async () => {
    return await orderRepository.findAllOrders();
};

exports.updateOrderService = async (numeroPedido, rawData) => {
    const existingOrder = await orderRepository.findOrderById(numeroPedido);

    if (!existingOrder) {
        throw { status: 404, message: `Pedido ID: ${numeroPedido} não encontrado para atualização.` };
    }

    const mappedData = mapIncomingData(rawData);
            
    const targetValue = mappedData.value !== undefined ? mappedData.value : parseFloat(existingOrder.value);

    let targetItems;
    if (rawData.items && Array.isArray(rawData.items)) {
        targetItems = mappedData.items;
    } else {
        targetItems = existingOrder.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            price: parseFloat(i.price)
        }));
    }

    const validationError = validateOrderConsistency(targetValue, targetItems);
    if (validationError) {
        throw { status: 400, message: 'A atualização resultaria em um estado inválido.', details: validationError };
    }

    let transaction;
    try {
        transaction = await sequelize.transaction();

        const updateData = {};
        if (mappedData.value !== undefined) updateData.value = mappedData.value;
        if (mappedData.creationDate !== undefined) updateData.creationDate = mappedData.creationDate;

        if (Object.keys(updateData).length > 0) {
            await orderRepository.updateOrder(existingOrder, updateData, transaction);
        }

        if (rawData.items && Array.isArray(rawData.items)) {
            await itemRepository.deleteItemsByOrderId(numeroPedido, transaction);

            const itemsWithOrderId = targetItems.map(item => ({
                ...item,
                orderId: numeroPedido
            }));

            await itemRepository.bulkCreateItems(itemsWithOrderId, transaction);
        }

        await transaction.commit();

        return await orderRepository.findOrderById(numeroPedido);

    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
};

exports.deleteOrderService = async (numeroPedido) => {
    const existingOrder = await orderRepository.findOrderById(numeroPedido);
    if (!existingOrder) {
        throw { status: 404, message: `Pedido ID: ${numeroPedido} não encontrado para deleção.` };
    }

    let transaction;
    try {
        transaction = await sequelize.transaction();

        await itemRepository.deleteItemsByOrderId(numeroPedido, transaction);
        await orderRepository.deleteOrder(numeroPedido, transaction);
        
        await transaction.commit();
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
};