const db = require('../database');


class OrderItem {
    constructor(product_id, name, price, color_name, color_code, size, qty, order_id) {
        this.product_id = product_id;
        this.name = name;
        this.price = price;
        this.color_name = color_name;
        this.color_code = color_code;
        this.size = size;
        this.qty = qty;
        this.order_id = order_id;
    }

    static async saveOrderItems(orderItems) {
        let sql = `
        INSERT INTO order_list (product_id, name, price, color_name, color_code, size, qty, order_id)
        VALUES ?
        `
        const result = await db.queryDB(sql, [orderItems])

        return result

    }

    static async getPieData() {
        let sql = `
        SELECT  color_name, color_code, sum(qty) AS total, sum(qty) * 100 / SUM(sum(qty)) OVER () AS percentage FROM order_list group by color_name;
        `
        const result = await db.queryDB(sql)
        return result
    }

    static async getHistogramData() {
        let sql = `
        SELECT  Sum(qty) AS quantity, price FROM order_list group by price order by price ASC;
        `
        const result = await db.queryDB(sql)
        return result
    }

    static async getBarData() {
        let sql = `
        SELECT  color_name, color_code, sum(qty) AS total, sum(qty) * 100 / SUM(sum(qty)) OVER () AS Percentage FROM order_list group by color_name;
        `
        const result = await db.queryDB(sql)
        return result
    }

    static async getTopFive() {
        let sql = `
        SELECT product_id, sum(qty) AS "total_sales"
        FROM stylishapp.order_list 
        group by product_id order by total_sales DESC limit 5
        `
        const result = await db.queryDB(sql)
        return result
    }

    static async getSizeSales(productIds) {
        let sql = `
        SELECT product_id, size, sum(qty) AS "total_sales"
        FROM stylishapp.order_list 
        Where product_id in ? 
        group by product_id, size order by size, FIELD( product_id, ?)`
        const result = await db.queryDB(sql, [[productIds], productIds])
        return result

    }
}

module.exports = OrderItem