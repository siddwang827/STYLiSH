const db = require("../database");

class Recipient {
  constructor(name, phone, email, address, time, user_id, order_id) {
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.address = address;
    this.time = time;
    this.user_id = user_id;
    this.order_id = order_id;
  }

  async saveRecipient() {
    let sql = `
        INSERT recipient (name, phone, email, address, time, user_id, orders_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=name;
        `;
    const result = await db.queryDB(sql, Object.values(this));

    return result;
  }
}

module.exports = Recipient;
