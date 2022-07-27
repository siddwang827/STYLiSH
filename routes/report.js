const express = require("express");
const Order = require('../model/order');
const router = express.Router();

router.get('/fakeorders', async (req, res) => {

    function getRandomArbitrary(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // let fakeOrderCount = getRandomArbitrary(1000, 5000)
    let fakeOrders = []

    for (let i = 0; i < 5000; i++) {
        let fakeOrder = []
        let shipping = 'devilvery'
        let payment = "credit_card"
        let subtotal = getRandomArbitrary(60, 940)
        let freight = 60
        let total = subtotal + freight
        let user_id = getRandomArbitrary(1, 5)
        let recTradeID = 'test_order'

        fakeOrder.push(shipping, payment, subtotal, freight, total, user_id, recTradeID)
        fakeOrders.push(fakeOrder)
    }

    const dbResult = await Order.addFakeOrders(fakeOrders)
    console.log(dbResult)

})

router.get('/payments', async (req, res) => {

    const result = await Order.getUserTotalOrders(1, 5)
    let totalGropByUser = {}

    result.forEach(order => {
        if (!(order.user_id in totalGropByUser)) {
            totalGropByUser[order.user_id] = 0
        }
        totalGropByUser[order.user_id] += parseInt(order.total)
    })

    let data = Object.entries(totalGropByUser).map((id) => {
        let returnObject = {}
        returnObject['user_id'] = parseInt(id[0])
        returnObject['total_payment'] = id[1]
        return returnObject
    })

    res.status(200).json({ data })
})

router.get('/payments2', async (req, res) => {

    const result = await Order.getUserTotalOrdersDb()

    res.status(200).json({ data: result })
})

module.exports = router;