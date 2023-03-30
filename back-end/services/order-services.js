const Order = require("../models/order-model");

const findOrder = (order_id, t) => {
    return Order.findOne({where: {orderid: order_id}, transaction: t});
}

const updateOrder = (order, payment_id, status) => {
    return order.update({paymentId: payment_id, status: status});
}

module.exports = {
    findOrder,
    updateOrder
}