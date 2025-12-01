const orderService = require('../service/orderService');

exports.createOrder = async (req, res) => {
    try {
        const orderResult = await orderService.createOrderService(req.body);
        return res.status(201).json(orderResult);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message, details: error.details });
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: `Pedido ID: ${req.body.numeroPedido} já existe.` });
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

        const order = await orderService.getOrderByIdService(numeroPedido);
        return res.status(200).json(order);

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('Erro ao buscar pedido:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao buscar o pedido.', details: error.message });
    }
};

exports.listOrders = async (req, res) => {
    try {
        const orders = await orderService.listOrdersService();
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
    
    try {
        const updatedOrder = await orderService.updateOrderService(numeroPedido, req.body);
        return res.status(200).json(updatedOrder);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message, details: error.details });
        }
        console.error('Erro ao atualizar pedido:', error);
        return res.status(500).json({ 
            error: 'Erro interno do servidor ao atualizar o pedido.', 
            details: error.message 
        });
    }
};

exports.deleteOrder = async (req, res) => {
    const numeroPedido = req.params.numeroPedido || req.params.id;

    try {
        await orderService.deleteOrderService(numeroPedido);
        return res.status(204).send(); 
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('Erro ao deletar pedido:', error);
        return res.status(500).json({ 
            error: 'Erro interno do servidor ao deletar o pedido.',
            details: error.message 
        });
    }
};