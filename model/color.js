const db = require("../database");

class Color {
  constructor(name, code) {
    this.name = name;
    this.code = code;
  }

  static async getColorNames() {
    const sql = `
        SELECT name FROM color;
        `;
    const result = await db.queryDB(sql);
    const colorNames = result.map((ele) => ele.name);
    return colorNames;
  }
}

module.exports = Color;
