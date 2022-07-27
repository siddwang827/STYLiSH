const express = require('express');
const router = express.Router();
const Campaign = require('../model/campaign.js')
const redisClient = require('../utility/redis.js')


router.get('/campaigns', async (req, res) => {
    try {
        const campaginCache = await redisClient.get('campaigns')
        if (!campaginCache) {
            const campaignDBResult = await Campaign.loadAllCampaign()
            if (campaignDBResult.length === 0) {
                return res.status(500).json({ content: "No campaign" })
            }
            await redisClient.set("campaigns", JSON.stringify(campaignDBResult))
            const returnData = { data: campaignDBResult }
            res.status(200).json(returnData)
        }
        else {
            const campaignData = JSON.parse(campaginCache)
            const returnData = { data: campaignData }
            res.status(200).json(returnData)
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})

router.get('/hots', (req, res) => {
    res.send('This is hots page')
})



module.exports = router