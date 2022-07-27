// const Queue = require('bull');
const Queue = require('bullmq');

const reportQueue = new Queue("report",
    {
        redis: {
            port: 6379,
            host: '54.236.199.41',
            password: '1qaz2wsx'
        }
    });



module.exports = reportQueue