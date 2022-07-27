const express = require('express');
const axios = require('axios');
const Orders = require('../model/order.js')
const router = express.Router();
const OrderItem = require('../model/orderItem.js');

const dummyUrl = 'http://35.75.145.100:1234/api/1.0/order/data'

router.get('/', async (req, res) => {
    let dummyData;
    try {
        const result = await axios.get(dummyUrl)
        dummyData = result.data
    } catch (err) {
        console.log(err)
        res.status(500)
    }

    try {
        await Orders.addDummyOrders(dummyData)
    } catch (err) {
        console.log(err)
        res.status(500)
    }
    res.status(200)

})

router.get('/total', async (req, res) => {
    const result = await Orders.getTotalRevenue()
    res.status(200).json({ data: result })
}
)

router.get("/pie", async (req, res) => {
    const result = await OrderItem.getPieData()
    res.status(200).json({ data: result })
})

router.get("/histogram", async (req, res) => {
    const result = await OrderItem.getHistogramData()
    let priceArray = []
    result.forEach((item) => {
        var priceQuantity = new Array(parseInt(item.quantity)).fill(item.price)
        priceArray = priceArray.concat(priceQuantity)
    })
    res.status(200).json({ data: priceArray })
})

router.get("/bar", async (req, res) => {
    const resultTopFive = await OrderItem.getTopFive()
    const topFive = resultTopFive.map(item => item.product_id)
    const resultSizeSales = await OrderItem.getSizeSales(topFive)
    const sizeSaleOfL = resultSizeSales.slice(0, 5)
    const sizeSaleOfM = resultSizeSales.slice(5, 10)
    const sizeSaleOfS = resultSizeSales.slice(10)
    res.status(200).json({
        data: {
            topFive: topFive.map(item => `Product ${item}`),
            sizeSales: {
                s: sizeSaleOfS.map(product => product.total_sales),
                m: sizeSaleOfM.map(product => product.total_sales),
                l: sizeSaleOfL.map(product => product.total_sales)
            }
        }
    })
})


module.exports = router