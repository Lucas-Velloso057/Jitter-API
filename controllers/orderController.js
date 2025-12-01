const db = require('../models'); 
const Order = db.order;
const Item = db.item;
const sequelize = db.sequelize;

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

exports.createOrder = async (req, res) => {
    const rawData = req.body;
    let transaction; 

    try {
        const mappedData = mapIncomingData(rawData);
        const { orderId, value, creationDate, items } = mappedData;
        
        const validationError = validateOrderConsistency(value, items);
        if (validationError) {
            return res.status(400).json({ error: 'Erro de validação', details: validationError });
        }

        transaction = await sequelize.transaction();

        const newOrder = await Order.create({
            orderId,
            value,
            creationDate,
        }, { transaction });

        const itemsWithOrderId = items.map(item => ({
            ...item,
            orderId: newOrder.orderId
        }));

        await Item.bulkCreate(itemsWithOrderId, { transaction });
        
        await transaction.commit();

        const orderResult = await Order.findByPk(newOrder.orderId, {
            include: [{ model: Item, as: 'items' }]
        });
        
        return res.status(201).json(orderResult);

    } catch (error) {
        if (transaction) await transaction.rollback();

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: `Pedido ID: ${rawData.numeroPedido} já existe.` });
        }
        
        console.error('Erro ao criar pedido:', error);
        return res.status(500).json({ 
            error: 'Erro interno do servidor ao criar o pedido.', 
            details: error.message 
        });
    }
};

exports.getOrderById = async (req, res) => {
    const numeroPedido = req.params.numeroPedido || req.params.id;

    try {
        if (!numeroPedido) {
            return res.status(400).json({ error: 'O número do pedido é obrigatório na URL.' });
        }

        const order = await Order.findByPk(numeroPedido, {
            include: [{ model: Item, as: 'items' }] 
        });

        if (!order) {
            return res.status(404).json({ error: `Pedido ID: ${numeroPedido} não encontrado.` });
        }

        return res.status(200).json(order);

    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao buscar o pedido.', details: error.message });
    }
};

exports.listOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{ model: Item, as: 'items' }]
        });

        return res.status(200).json(orders);

    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        return res.status(500).json({ 
            error: 'Erro interno do servidor ao tentar listar os pedidos.', 
            details: error.message 
        });
    }
};

exports.updateOrder = async (req, res) => {
    const numeroPedido = req.params.numeroPedido || req.params.id; 
    const rawData = req.body;
    let transaction;

    try {
        const existingOrder = await Order.findByPk(numeroPedido, {
            include: [{ model: Item, as: 'items' }]
        });

        if (!existingOrder) {
            return res.status(404).json({ error: `Pedido ID: ${numeroPedido} não encontrado para atualização.` });
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
            return res.status(400).json({ 
                error: 'A atualização resultaria em um estado inválido.', 
                details: validationError 
            });
        }

        transaction = await sequelize.transaction();

        const updateData = {};
        if (mappedData.value !== undefined) updateData.value = mappedData.value;
        if (mappedData.creationDate !== undefined) updateData.creationDate = mappedData.creationDate;

        if (Object.keys(updateData).length > 0) {
            await existingOrder.update(updateData, { transaction });
        }

        if (rawData.items && Array.isArray(rawData.items)) {
            await Item.destroy({
                where: { orderId: numeroPedido },
                transaction
            });

            const itemsWithOrderId = targetItems.map(item => ({
                ...item,
                orderId: numeroPedido
            }));

            await Item.bulkCreate(itemsWithOrderId, { transaction });
        }

        await transaction.commit();

        const updatedOrder = await Order.findByPk(numeroPedido, {
            include: [{ model: Item, as: 'items' }]
        });
        
        return res.status(200).json(updatedOrder);

    } catch (error) {
        if (transaction) await transaction.rollback();
        
        console.error('Erro ao atualizar pedido:', error);
        return res.status(500).json({ 
            error: 'Erro interno do servidor ao atualizar o pedido.', 
            details: error.message 
        });
    }
};

exports.deleteOrder = async (req, res) => {
    const numeroPedido = req.params.numeroPedido || req.params.id;
    let transaction;

    try {
        const existingOrder = await Order.findByPk(numeroPedido);
        if (!existingOrder) {
             return res.status(404).json({ error: `Pedido ID: ${numeroPedido} não encontrado para deleção.` });
        }

        transaction = await sequelize.transaction();

        await Item.destroy({ 
            where: { orderId: numeroPedido },
            transaction 
        });

        await Order.destroy({
            where: { orderId: numeroPedido },
            transaction
        });
        
        await transaction.commit();

        return res.status(204).send(); 

    } catch (error) {
        if (transaction) await transaction.rollback();
        
        console.error('Erro ao deletar pedido:', error);
        return res.status(500).json({ 
            error: 'Erro interno do servidor ao deletar o pedido.',
            details: error.message
        });
    }
};