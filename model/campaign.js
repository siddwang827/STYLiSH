const db = require('../database');


class Campaign {
    constructor(productID, story, picture) {
        this.productID = productID;
        this.story = story;
        this.picture = picture;

    }

    async saveCampaign() {

        const sql = `
        INSERT INTO campaign (product_id, story, picture) 
        VALUES (?, ?, ?)
        `
        const result = await db.queryDB(sql, Object.values(this))
        return result

    }

    static async loadAllCampaign() {
        const sql = `
        SELECT * FROM campaign 
        `
        const result = await db.queryDB(sql)
        return result
    }
}

module.exports = Campaign