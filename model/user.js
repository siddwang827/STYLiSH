const db = require('../database');


class User {
    constructor(provider, username, email, password, picture) {
        this.provider = "native";
        this.username = username;
        this.email = email;
        this.password = password;
        this.picture = "img/user/default.jpg";
    }

    async saveProfile() {

        const sql = `
        INSERT INTO user (provider, name, email, password, picture) 
        VALUES (?, ?, ?, ?, ?)
        `
        const result = await db.queryDB(sql, Object.values(this))
        return result
    }

    static async checkFBProfile(email) {

        const sql = ` 
        SELECT * 
        FROM user 
        WHERE provider='facebook' AND email=? 
        `
        const result = await db.queryDB(sql, email)
        return result[0]
    }

    static async updateDuplicateKey(provider, name, email, picture) {
        const sql = `
        INSERT INTO user (provider, name, email, picture)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=?, picture=? 
        `
        const result = await db.queryDB(sql, [provider, name, email, picture, name, picture])
        console.log(result)
        return result
    }


    static async getProfileByEmail(email) {

        const sql = `
        SELECT id, provider, name, password, picture
        FROM user 
        WHERE email= ?
        `
        const result = await db.queryDB(sql, [email])

        if (!result[0]) {
            throw new Error('Email Not Exist')
        }

        return result[0]
    }

    static userProfileReturn(access_token, access_expired, id, provider, name, email, picture) {

        let returnData =
        {
            data: {
                access_token: access_token,
                access_expired: access_expired,
                user: { id, provider, name, email, picture, }
            }
        }

        return returnData
    }
}

module.exports = User