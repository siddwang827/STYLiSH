const express = require("express");
const multer = require("multer");
const db = require("../database.js");
const Product = require("../model/product");
const Color = require("../model/color");
// const path = require("path");
const router = express.Router();

function variantFormat(data) {
    const variant = data.variantObj.toString().split("/");
    const variantArray = variant.map((item) => item.split(","));


    let sizeSet = new Set()
    let colorNameCodeObj = {};
    let colorsArray = [];
    data.variant = [];

    for (i = 0; i < variantArray.length; i++) {
        if (!(variantArray[i][3] in colorNameCodeObj)) colorNameCodeObj[variantArray[i][3]] = variantArray[i][0]
        if (!(sizeSet.has(variantArray[i][1]))) sizeSet.add(variantArray[i][1])
        data.variant.push({
            color_code: variantArray[i][0],
            size: variantArray[i][1],
            stock: parseInt(variantArray[i][2]),
        });
    }

    Object.keys(colorNameCodeObj).forEach((name, i) => {
        colorsArray.push({ name: name, code: Object.values(colorNameCodeObj)[i] })
    })

    data.colors = colorsArray;
    data.sizes = (Array.from(sizeSet)).sort().reverse();
    delete data.variantObj;
}

function ImageFormat(data) {
    data.images = [];
    data.main_image = '/img/stylish/products/' + data.main_image
    if (data.otherImage) {
        // const images = data.otherImage;
        // const imagesArray = images.split(",");
        const images = data.otherImage.split(',')
        const imagesArray = images.map(ele => '/img/stylish/products/' + ele)
        data.images = imagesArray;
    }
    delete data.otherImage;
}

function dataFormat(data) {
    delete data["pid"];
    ImageFormat(data);
    variantFormat(data);
}

router.get("/all", async (req, res) => {
    try {
        const page = req.query.paging | 0;
        let count = { start: page * 6, end: page + 1 * 7 };

        sql = `
        SELECT * From (product
        INNER join 
        (SELECT pid, group_concat( concat(variant.code, ',' , variant.size, ',' , variant.stock, ',' , variant.name ) separator '/') AS variantObj FROM variant group by pid) AS variantTable
        on product.id=variantTable.pid)
        LEFT join 
        (SELECT pid, group_concat( path separator ',') AS otherImage From images group by pid) AS otherImageTable
        on product.id=otherImageTable.pid LIMIT ${count.start}, ${count.end} ;
        `;
        const result = await db.queryDB(sql);
        let returnData = {};

        if (result.length > 6) {
            returnData = { data: result, next_paging: page + 1 };
            result.pop();
        } else {
            returnData = { data: result };
        }
        result.forEach((ele) => dataFormat(ele));
        res.send(returnData);
    } catch (err) {
        res.status(500);
    }

    // }
});

router.get("/test", async (req, res) => {
    sql = "SELECT * FROM stylish.images";
    const results = await db.queryDB(sql);
    console.log(results);
    res.send(results);
});

router.get("/search", async (req, res) => {
    const keyword = `%${req.query.keyword}%`;
    const page = req.query.paging | 0;

    let count = { start: page * 6, end: page + 1 * 7 };
    try {
        let sqlSelect = `
        SELECT * From (product
        INNER join 
        (SELECT pid, group_concat( concat(variant.code, ',' , variant.size, ',' , variant.stock, ',' , variant.name ) separator '/') AS variantObj 
        FROM variant group by pid) AS variantTable on product.id=variantTable.pid)
        LEFT join 
        (SELECT pid, group_concat( path separator ',') AS otherImage From images group by pid) AS otherImageTable
        on product.id=otherImageTable.pid
        WHERE product.title LIKE ? LIMIT ?, ? ;
        `;
        const result = await db.queryDB(sqlSelect, [keyword, count.start, count.end]);
        let returnData = {};

        if (result.length > 6) {
            returnData = { data: result, next_paging: page + 1 };
            result.pop();
        } else {
            returnData = { data: result };
        }
        result.forEach((ele) => dataFormat(ele));
        res.send(returnData);
    } catch (err) {
        res.status(500);
    }
});

router.get("/details", async (req, res) => {
    const queryId = req.query.id;
    try {
        let sqlSelect = `
        SELECT * From (product
        INNER join 
        (SELECT pid, group_concat( concat(variant.code, ',' , variant.size, ',' , variant.stock, ',' , variant.name ) separator '/') AS variantObj 
        FROM variant group by pid) AS variantTable on product.id=variantTable.pid)
        LEFT join 
        (SELECT pid, group_concat( path separator ',') AS otherImage From images group by pid) AS otherImageTable
        on product.id=otherImageTable.pid
        WHERE product.id=? ;
        `;
        const result = await db.queryDB(sqlSelect, [queryId]);
        result.forEach((ele) => dataFormat(ele));
        res.send({ data: result[0] });
    } catch (err) {
        res.status(500);
    }
});

router.get("/:category(women|men|accessories)", async (req, res) => {
    const catergory = req.params.category;
    const page = req.query.paging | 0;
    let count = { start: page * 6, end: page + 1 * 7 };

    try {
        let sqlSelect = `
        SELECT * From (product
        INNER join 
        (SELECT pid, group_concat( concat(variant.code, ',' , variant.size, ',' , variant.stock, ',' , variant.name ) separator '/') AS variantObj 
        FROM variant group by pid) AS variantTable on product.id=variantTable.pid)
        LEFT join 
        (SELECT pid, group_concat( path separator ',') AS otherImage From images group by pid) AS otherImageTable
        on product.id=otherImageTable.pid
        WHERE product.category=? LIMIT ?, ? ;
        `;

        const result = await db.queryDB(sqlSelect, [catergory, count.start, count.end]);
        let returnData = {};

        if (result.length > 6) {
            returnData = { data: result, next_paging: page + 1 };
            result.pop();
        } else {
            returnData = { data: result };
        }
        result.forEach((ele) => dataFormat(ele));
        res.send(returnData);
    } catch (err) {
        console.log(err)
        res.status(500);
    }
});

router.get("/get-productID", async (req, res) => {
    const productIDArray = await Product.getProductID();
    res.json(productIDArray);
});

router.get("/get-colorname", async (req, res) => {
    try {
        const colorName = await Color.getColorNames();
        res.json(colorName);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

module.exports = router;
