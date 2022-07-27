require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken')
const Orders = require('../model/order.js')
const Recipient = require('../model/recipient.js');
const OrderItem = require('../model/orderItem.js');

const router = express.Router();
const secretKey = process.env.SECRET_KEY
const tapPayUrl = process.env.TAPPAY_URL
const PartnerKey = process.env.PARTNERKEY
const MerchantID = process.env.MERCHANTID
const cardholder = {
    "phone_number": "+886923456789",
    "name": "王小明",
    "email": "LittleMing@Wang.com",
    "zip_code": "100",
    "address": "台北市天龍區芝麻街1號1樓",
    "national_id": "A123456789"
}
const details = 'Test'

const axiosTapPay = async (prime, amount) => {
    const data = {
        prime: prime,
        partner_key: PartnerKey,
        merchant_id: MerchantID,
        amount: amount,
        cardholder: cardholder,
        details: details,
    }
    const postPay = await axios({
        url: tapPayUrl,
        method: 'post',
        headers: { 'Content-Type': 'application/json', 'x-api-key': PartnerKey },
        data: data
    }
    )
    return postPay.data
}

router.post('/checkout', async (req, res) => {
    const access_token = req.headers.authorization.split(' ')[1]
    if (!access_token) { return res.status(401).send("No Token") }

    try {
        verifyResult = jwt.verify(access_token, secretKey)
    }
    catch (err) {
        if (err.message === "jwt expired") {
            return res.status(403).json({ error: "Token has expired" })
        }
        return res.status(403).json('Invalid Token')
    }

    const { prime, order } = req.body
    const { shipping, payment, subtotal, freight, total, recipient, list } = order
    const userId = verifyResult.id
    let orderID

    // create unpaid order in DB
    try {
        let order = new Orders(
            shipping,
            payment,
            subtotal,
            freight,
            total,
            userId
        )
        const orderSaveResult = await order.saveOrder()
        orderID = orderSaveResult.insertId
        console.log('Create Order Record Success')
    }
    catch (err) {
        console.log(err)
        return res.status(500).json('Create Order record Failed')
    }

    // create recipient
    try {
        const recipientInfo = new Recipient(...Object.values(recipient), userId, orderID)
        await recipientInfo.saveRecipient()
        console.log('Create Recipient Success')
    }
    catch (err) {
        console.log(err)
        return res.status(500).send("Create Recipient Failed");
    }

    // create order list
    try {
        // format items content
        let orderList = list.map(item => [
            item.id,
            item.name,
            item.price,
            item.color.name,
            item.color.code,
            item.size,
            item.qty,
            orderID
        ])
        // insert multi order items 
        await OrderItem.saveOrderItems(orderList)
        console.log('create Order Items Success')
    }
    catch (err) {
        console.log(err)
        res.status(500).json('Create Order Items Failed')
    }

    let amount = total
    // get paid result from tapPay
    try {
        const paidResult = await axiosTapPay(prime, amount)

        if (paidResult.status === 0) {
            console.log('Order Paid Success')
            await Orders.updatePaidOrder(orderID, paidResult)
            console.log('Update Order Payment Success')
            res.send({ data: { number: orderID } })
        }
        else {
            return res.status(401).json('Tracnsaction Failed')
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

module.exports = router