require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/user.js');
const bcrypt = require('bcrypt');
const router = express.Router();
const saltRounds = 10
const tokenExpireTime = Number(process.env.EXPIRE_TIME)
const secretKey = process.env.SECRET_KEY
const axios = require('axios')

function generateToken(id, provider, name, email, picture) {
    return jwt.sign({ id, provider, name, email, picture },
        secretKey,
        { expiresIn: tokenExpireTime });
};


router.get('/signup', (req, res) => {
    res.render('signup')
})

router.get('/signin', (req, res) => {
    res.render('signin')
})

router.post('/signup', async (req, res) => {

    if (req.name || req.email || req.password || req.provider) {
        return res.status(400).json('Lack of necessary information')
    }
    try {
        let { name, email, password } = req.body

        const hash = await bcrypt.hash(password, saltRounds)
        const user = new User(null, name, email, hash, null)
        let provider = user.provider
        let picture = user.picture

        const queryResult = await user.saveProfile()
        let id = queryResult.insertId

        const accessToken = generateToken(id, provider, name, email, picture)
        const returnData = User.userProfileReturn(
            accessToken,
            tokenExpireTime,
            id,
            provider,
            name,
            email,
            picture,
        )

        res.status(200).json(returnData)
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(403).json('Email has already signed up')
        }
        console.log(err)
        res.status(500).json(JSON.stringify(err))
    }
})


router.post('/signin', async (req, res) => {

    if (!req.body.provider) {
        return res.status(400).json('Unknown Provider')
    }
    if (req.body.provider === 'native') {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json('Lack of Necessary Information')
        }

        let { provider, email, password } = req.body

        try {
            const userData = await User.getProfileByEmail(email)
            const compareResult = await bcrypt.compare(password, userData.password)

            if (compareResult) {
                let id = userData.id
                let name = userData.name
                let picture = userData.picture

                const accessToken = generateToken(id, provider, name, email, picture)
                const returnData = User.userProfileReturn(
                    accessToken,
                    tokenExpireTime,
                    id,
                    provider,
                    name,
                    email,
                    picture)

                return res.status(200).json(returnData)
            }
            else {
                return res.status(403).json('Wrong Password')
            }
        }
        catch (err) {
            if (err.message === "Email Not Exist") {
                return res.status(403).json('Email Not Exist')
            }
            console.log(err)
            res.status(500).json(err.message)
        }
    }
    else if (req.body.provider === "facebook") {

        if (!req.body.access_token) {
            return res.status(400).json('No Token')
        }

        const { provider, access_token } = req.body
        let graphApiUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}`

        try {
            const userProfileFromFB = await axios({
                url: graphApiUrl,
                method: 'get',
            })

            let { id, name, email, picture } = userProfileFromFB.data

            // if user profile already exist then update, otherwise sign up
            const updateResult = await User.updateDuplicateKey(provider, name, email, picture.data.url)
            id = updateResult.insertId
            picture = picture.data.url

            const accessToken = generateToken(id, provider, name, email, picture)
            const returnData = User.userProfileReturn(
                accessToken,
                tokenExpireTime,
                id,
                provider,
                name,
                email,
                picture)

            console.log(returnData)
            return res.status(200).json(returnData)


        } catch (err) {
            if (err.name === "AxiosError") {
                return res.status(403).json("Token Authorization Failed")
            }
            console.log(JSON.stringify(err))
        }
    }
})

router.get('/profile', async (req, res, err) => {
    try {
        const rawToken = req.headers.authorization
        if (!rawToken) { return res.status(401).json('You are not logged in!') }
        const checkToken = req.headers.authorization.split(" ")[1]
        const userProfile = jwt.verify(checkToken, secretKey)
        res.status(200).json({
            data: {
                provider: userProfile.provider,
                name: userProfile.name,
                email: userProfile.email,
                picture: userProfile.picture
            }
        })
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            console.log(JSON.stringify(err))
            return res.status(403).json({ error: 'Invalid token' })
        }
        else if (err.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Token expired' })
        }
        console.log(err)
        res.status(500).json(err)
    }
})


module.exports = router