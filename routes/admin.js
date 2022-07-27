require("dotenv").config();
const express = require("express");
const multer = require("multer");
const fs = require("../utility/fs.js");
const path = require("path");
const router = express.Router();
const db = require("../database.js");
const Campaign = require("../model/campaign.js");
const { s3UploadSingle, s3UploadMulti } = require("../utility/s3Service")



const storage = multer.memoryStorage()

// const productImageStorage = multer.diskStorage({
//     // set storage path
//     destination: (req, file, cb) => {
//         let category = req.body.category;
//         const imageDirectory = path.resolve(__dirname, `../public/img/stylish/products/${category}/${req.body.title}`);
//         console.log(imageDirectory);
//         req.params.imagePath = imageDirectory;
//         fs.createDirectory(imageDirectory);
//         cb(null, imageDirectory);
//     },
//     // set file name
//     filename: (req, file, cb) => {
//         let imageName;
//         if (file.fieldname === "mainImage") {
//             imageName = "main" + path.extname(file.originalname);
//             // todo: modify image filename bypass file path
//             req.params.mainImage = (`${req.body.category}/${req.body.title}/` + imageName).toString();
//         } else {
//             imageName = file.originalname;
//             if (!req.params.otherImage) {
//                 req.params.otherImage = [];
//             }
//             req.params.otherImage.push(`${req.body.category}/${req.body.title}/` + imageName).toString();
//         }
//         cb(null, imageName);
//     },
// });

// const productFormFileds = [{ name: "mainImage" }, { name: "otherImage" }];


// const campaignStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const pictureDirectory = path.resolve(__dirname, `../public/img/uploads/capmaign/${req.body.product_id}`);
//         fs.createDirectory(pictureDirectory);
//         cb(null, pictureDirectory);
//     },
//     filename: function (req, file, cb) {
//         const pictureName = file.originalname;
//         req.picture = pictureName;
//         cb(null, pictureName);
//     },
// });

const productUpload = multer({
    storage: storage,
    limit: { fileSize: 1000000 },
}).fields([{ name: "mainImage" }, { name: "otherImage" }]);

const campaignUpload = multer({
    storage: storage,
    limit: { fileSize: 1000000 },
}).single("picture");



router.get("/product", (req, res) => {
    res.render("create");
});

router.get("/campaign.html", async (req, res) => {
    res.render("campaign");
});

router.get("/checkout.html", (req, res) => {
    res.render("checkout");
});


router.post("/create-product", productUpload,
    // insert product basic info and get pid
    async (req, res, next) => {
        try {
            const mainImageFileName = await s3UploadSingle(req.files.mainImage[0])
            const { category, title, description, price, texture, wash, place, note, story } = req.body;
            const sql = `INSERT INTO product (category, title, description, price, texture, wash, place, note, story, main_image) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const insertResult = await db.queryDB(sql, [
                category,
                title,
                description,
                price,
                texture,
                wash,
                place,
                note,
                story,
                mainImageFileName,
            ]);
            req.pid = insertResult.insertId;
        } catch (err) {
            console.log(err.sqlMessage);
        }
        next();
    },
    // insert other image path
    async (req, res, next) => {
        try {
            if (req.files.otherImage) {
                const otherImagesFileName = await s3UploadMulti(req.files.otherImage)
                let sql = "INSERT INTO images (pid, path) VALUES ( ?, ?)";
                otherImagesFileName.forEach(async (file) => {
                    await db.queryDB(sql, [req.pid, file]);
                });
            }
        } catch (err) {
            console.log(err);
        }
        next();
    },
    // add variant
    async (req, res, next) => {
        try {
            // check data type
            if (typeof req.body.colorName === 'string') {

                req.body.colorName = Array(req.body.colorName);
                req.body.variantStock = Array(req.body.variantStock);
            }
            // add product variant
            const variantCount = req.body.colorName.length;
            req.params.hexcode = [];
            for (i = 0; i < variantCount; i++) {
                const sizeCount = req.body.size[i].length;
                const hexcodeResult = await db.queryDB(`SELECT code FROM color WHERE name = '${req.body.colorName[i]}'`);
                console.log(hexcodeResult);
                req.params.hexcode.push(hexcodeResult[0].code);

                for (j = 0; j < sizeCount; j++) {
                    await db.queryDB(
                        `INSERT INTO variant (pid, code, name, size, stock) VALUES ('${req.pid}', '${req.params.hexcode[i]}', '${req.body.colorName[i]}', '${req.body.size[i][j]}', '${req.body.variantStock[i]}')`
                    );
                }
            }
            res.status(200).json("Create Product Success");
            console.log("Create Product Success");
        } catch (err) {
            console.log(err);
        }
    }
);

router.post("/create-campaign", campaignUpload, async (req, res) => {
    try {
        // return file name 
        const resultUploadToS3 = await s3UploadSingle(req.file)
        let { product_id, story } = req.body;
        let picture = resultUploadToS3;
        const campaign = new Campaign(product_id, story, picture);
        const createResult = await campaign.saveCampaign();
        console.log({ campaign, createResult });
        res.status(200).json(`New Campaign Create Successfully: ${JSON.stringify(campaign)} `);
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json("Duplicate File Name");
        }
        console.log(err)
        res.status(500).json(err);
    }
});


module.exports = router;
