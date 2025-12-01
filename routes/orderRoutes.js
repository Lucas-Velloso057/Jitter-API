const express = require('express');
const router = express.Router();
const {
    createOrder, 
    getOrderById, 
    listOrders, 
    updateOrder, 
    deleteOrder
} = require('../controller/orderController'); 

const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, createOrder); 

router.get('/list', verifyToken, listOrders);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id', verifyToken, updateOrder);
router.delete('/:id', verifyToken, deleteOrder);

module.exports = router;