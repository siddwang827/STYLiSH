const express = require("express");
const Order = require('../model/order');
const router = express.Router();
const { Queue } = require('bullmq')

const queue = new Queue('payment', {
    connection: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASSWORD
    }
});

router.get('/payments', async (req, res) => {

    await queue.add('jobName', { payload: 'payment' })

    res.status(200).json("Request Submit Success")

});



module.exports = router;