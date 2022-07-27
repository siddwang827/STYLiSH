const db = require('../database');
const Order = require('../model/order');
const OrderItem = require('../model/orderItem.js');
const axios = require('axios');


async function getDummy(url) {
    const dummy = await axios.get(url)
    return dummy.data
}


async function importDummy(dummydata) {
    try {
        const result = await Order.addDummyOrders(dummydata)
    }
    catch (err) {
        console.log(err)
    }




}

module.exports = { getDummy, importDummy }