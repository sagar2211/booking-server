require("dotenv/config");
// require("./config/config");
// require('./config/passportConfig');
// require("./server/controllers/googleController");
// require("./server/controllers/facebookController");
require("./server/controllers/localAuthController");

const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const winstonLogger = require("./server/libs/winstonLib");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const globalErrorHandler = require("./server/controllers/errorController");
const MESSAGE = require("./config/message.json");
const expireDate = new Date();
const bodyParser = require('body-parser');
const path = require("path")
require('body-parser-xml')(bodyParser);

// loading express
const app = express();
// const server = http.createServer(app);
app.set("view engine", "ejs");
app.set("views", "/server/view");

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "SECRET",
    cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 },
  })
);

// import routes
const users = require("./server/routes/user");
const SOAPTEST = require("./server/routes/soapTest");
// const newsletter = require("./server/routes/newsletter");
// const facebook = require("./server/routes/facebook");
// const google = require("./server/routes/google");
const hitchHikerAgent = require("./server/b2b/hitchHiker/agent/AvailableFares/routes/AvailableFares");
const bookingManager = require("./server/b2b/hitchHiker/agent/BookingManager/routes/BookingManager");
const seoApis = require("./server/b2b/hitchHiker/SEO/route/searchAPI");
const publicservices = require("./server/b2b/hitchHiker/services/publicService/routes/publicService");
const flightApi = require("./server/b2b/hitchHiker/admin/FlightApiSettings/routes/FlightApiSettings");
const hepstarApi = require("./server/hepstar/routes/hepstar");
const mailChimpApi = require("./server/mailChimp/mailChimp");
const hepstar = require("./server/hepstar/routes/hepstar");
const sugarcrm = require("./server/sugar-crm/routes/sugarcrm");
const payFast = require("./server/payFast/route/payFast_Route")

const {
  getGenrateToken,
  getLatestToken,
} = require("./server/b2b/hitchHiker/token");
const { tokenScedular } = require("./server/utils/cron");

//swagger
// const swaggerUI = require("swagger-ui-express");
// const swaggerJsDoc = require("swagger-jsdoc");
// const { http } = require("./server/libs/winstonLib");

// const options = {
//   swaggerDefinition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Wadiia API",
//       version: "1.0.0",
//       description: "A  Express Library API",
//     },
//     servers: [
//       {
//         url: process.env.BASE_PATH,
//       },
//     ],
//   },
//   apis: ["./server/routes/*.js"],
// };

// const specs = swaggerJsDoc(options);
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// middelwares
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.xml());
expireDate.setDate(expireDate.getDate() + 1);

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "./server/view"));
app.use("/image", express.static("server/public/upload_images"));
// route middelwares
app.use("/user", users);
app.use("/mailChimp", mailChimpApi);
// app.use("/", google, facebook);
app.use("/availablefares", hitchHikerAgent);
// app.use("/bookingmanager", bookingManager);
app.use("/seo", seoApis);
app.use("/flightApi", flightApi);
app.use("/publicservices", publicservices);
// app.use("/newsletter", newsletter);
app.use("/soapTest", SOAPTEST);
app.use("/hepstar", hepstar);
app.use("/sugarcrm", sugarcrm);
app.use("/payFast", payFast);
app.use(globalErrorHandler);

// error handler
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    var valErrors = [];
    Object.keys(err.errors).forEach((key) =>
      valErrors.push(err.errors[key].message)
    );
    res.status(422).send(valErrors);
  }
});

app.get("/", async (req, res) => {
  res.send("welcome wadiia");
});

// DB connection
mongoose.connect(process.env.DB_CONNECT, { maxPoolSize: 5 }, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    winstonLogger.info(MESSAGE.DATABASE.CONNECTION.SUCCESS);
  })
  .catch((err) => {
    winstonLogger.error(MESSAGE.DATABASE.CONNECTION.ERROR_CONN_FAILED + err);
  });

tokenScedular();
getGenrateToken();
getLatestToken();

// PORT listen
app.listen(process.env.PORT);
console.log(`running on ${process.env.PORT}`);
winstonLogger.info(`running on ${process.env.PORT}`);