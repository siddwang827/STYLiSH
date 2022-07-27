const db = require('../database');


class Orders {
    constructor(shipping, payment, subtotal, freight, total, user_id) {
        this.shipping = shipping;
        this.payment = payment;
        this.subtotal = subtotal;
        this.freight = freight;
        this.total = total;
        this.user_id = user_id
    }

    async saveOrder() {
        let sql = `
        INSERT INTO orders (shipping, payment, subtotal, freight, total, user_id )
        VALUES (?, ?, ?, ?, ?, ?)
        `
        const result = await db.queryDB(sql, Object.values(this))

        return result
    }

    static async updatePaidOrder(id, tapPayResponse) {
        let sql = `
        UPDATE orders
        SET rec_trade_id = ? , paid_at = from_unixtime( ? * 0.001)
        where id = ?
        `
        const [result] = await db.queryDB(sql, [tapPayResponse.rec_trade_id, tapPayResponse.transaction_time_millis, id])

        return result

    }

    static async addFakeOrders(fakeOrderArray) {
        let sql = `
        INSERT INTO orders (shipping, payment, subtotal, freight, total, user_id, rec_trade_id )
        VALUES ?
        `
        const result = await db.queryDB(sql, [fakeOrderArray])

        return result

    }

    static async getUserTotalOrders(start, end) {
        let sql = `
        SELECT id, total, user_id
        FROM orders
        where user_id >= ? AND user_id <= ?
        `
        const result = await db.queryDB(sql, [start, end])
        return result
    }

    static async getUserTotalOrdersDb() {
        let sql = `
        select user_id, sum(total) as total From stylishapp.orders group by user_id;
        `
        const result = await db.queryDB(sql)
        return result
    }

    static async addDummyOrders(dummyOrders) {

        let sql1 = `
        INSERT INTO orders (total)
        VALUES (?)
        `
        let sql2 = `
        INSERT INTO order_list (product_id, price, color_name, color_code, size, qty, order_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `
        dummyOrders.forEach(async (dummy, index) => {
            await db.queryDB(sql1, [dummy.total])
            dummy.list.forEach((item) => {
                db.queryDB(sql2, [item.id, item.price, item.color.name, item.color.code, item.size, item.qty, index + 1])
            })
        })


        return

    }

    static async getTotalRevenue() {
        const sql = `
        SELECT sum(total) AS total_revenue FROM stylishapp.orders;
        `
        const [result] = await db.queryDB(sql)
        return result
    }

}

module.exports = Orders