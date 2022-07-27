const Redis = require('redis')
const { REDIS_USER, REDIS_PASSWORD, REDIS_HOST, REDIS_PORT } = process.env

const redisClient = Redis.createClient({
    url: `redis://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
    socket: {
        keepAlive: false,
    },
})

redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.connect();

module.exports = redisClient
