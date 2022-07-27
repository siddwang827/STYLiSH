require("dotenv").config();
const express = require("express");
// const redisClient = require('./utility/redis.js')
// const router = express.Router();
const db = require("./database");
const rateLimiter = require('./utility/ratelimiter.js')
const app = express();
const apiVersion = process.env.API_VERSION;


// Middle ware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "pug");


// Route
const adminRoute = require("./routes/admin");
const productRoute = require("./routes/products");
const userRoute = require("./routes/user");
const marketingRoute = require("./routes/marketing");
const orderRoute = require("./routes/order");
const reportRoute = require("./routes/report");
const reportQRoute = require("./routes/reportQ");
const dummyRoute = require("./routes/dummy")

app.use(rateLimiter)

app.use("/admin", adminRoute);
app.use(`/${apiVersion}/products/`, productRoute);
app.use(`/${apiVersion}/user`, userRoute);
app.use(`/${apiVersion}/marketing`, marketingRoute);
app.use(`/${apiVersion}/order`, orderRoute);
app.use(`/${apiVersion}/report`, reportRoute);
app.use(`/${apiVersion}/dummy`, dummyRoute)
app.use(`/api/2.0/report`, reportQRoute);


app.get("/", (req, res) => res.send("<h1>You are on the EC2!!</h1>"));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server listenig on port: ${PORT}`));
