const db = require('../database');


class Product {
    constructor(category, title, description, price, texture, wash, place, note, story, main_image) {
        this.category = category;
        this.title = title;
        this.description = description;
        this.price = price;
        this.texture = texture;
        this.wash = wash;
        this.place = place;
        this.note = note;
        this.story = story;
        this.main_image = main_image;
    }

    static async getProductID() {

        const sql = `
        SELECT id From product
        `
        const result = await db.queryDB(sql)
        let IDArray = []
        result.forEach(ele => IDArray.push(ele.id))

        return IDArray
    }
}


module.exports = Product;