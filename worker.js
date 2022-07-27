require('dotenv').config()
const Order = require('./model/order')
const { Worker } = require('bullmq');


const worker = new Worker('payment', async (job) => {
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
    console.log({ task: job.data.payload, id: job.id, duration: ` ${job.processedOn - job.timestamp} ms` })
    console.log({ data })
},
    {
        connection: {
            port: process.env.REDIS_PORT,
            host: process.env.REDIS_HOST,
            username: process.env.REDIS_USER,
            password: process.env.REDIS_PASSWORD
        }
    }
)

worker.on("completed", (job) => {
    job.remove();
    console.log("Job completed", job.id);
});