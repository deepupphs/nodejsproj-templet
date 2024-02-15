const express = require("express");
//const logger = require('morgan');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const aws = require("aws-sdk");
const logger = require("./app/handlers/logHandlers");

var path = require("path");
var cors = require("cors");
const app = express();
const router = express.Router();
const helmet = require("helmet");

var config = require("./config");
var port = config.port;
var connUri = config.dbUri;
const passport = require("passport");
app.use(passport.initialize());
passport.serializeUser(function (result, done) {
  done(null, result);
});

passport.deserializeUser(function (result, done) {
  done(null, result);
});

const expressip = require("express-ip");
app.use(expressip().getIpInfoMiddleware);

//fire-base-------------------------------------------------------------
const admin = require("firebase-admin");

var serviceAccount = {
  type: "service_account",
  project_id: "golo-8df78",
  private_key_id: "548378d6b58a811aff618ca75b978a8373fbe679",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCpaQ/ORIJ/xpak\nPTwg07WpVQ8Ur/r9uv6Yncb8gZlu/xYR2z+3vsG2cH8AZdtWXBeTftYObnN2KDKz\nPeXEwLRSVDKGIBSejlxiC0nF8HSV5NFvefNjiEXxjtfoJoN8Azww8tm03HslUMa3\naZUxiSxE0dxcg4qJ3JbKlC2F8rujojfaaP+1rQcbU5Wz39EUbHQl7UIuWFZnD6ji\nhHv7WjBYBTOHtFqJrdbfsY5f09XZ78CNJLMwK/q8zkU4zswnH8CNU43IOTzC9X5l\n/H9eRD3dtbLCN+c9a735FoG50IgsknGEi6hb+quiwZfNOjQnIp2RG1tRop1VEm2s\nwXZHkdyNAgMBAAECggEAAMlkcbsZtrQvtjrekPHKvIA7ngdPLWcf5YozXAV8tpTn\n/6nlUC9063726APmZ9lCTBoLrmzO4R6WAFpqOxFWBQfaZYsNQss7HJgcKJd8QxyZ\nPbZIQ2Rk8WvjZB2XALgXIHcQPGnFsfT/vJGjSA6bWQUhy9WEitgDuenEPa9UixGk\n0yHJG99Tb4Z0yrDHUmvw6ZQ76boQvoZakeVOarfmp9eP39hKkJH5AOBdd9if0KAV\n2WiZ5Wr5a/dKI6JQ7eI6fTwi/XMdq+MX97qiIAJAEUUJar3SOY09a1mF3wMCmlH+\nGOQI27d7asHgqyXsJIMSlGhjDwOSaMy8r9QaOBw6QQKBgQDuN4ljmLyD75Dy3DG/\n0xOxcLheu6XXKJuKPtgPTf8ToEyLou2SxDbgDEjd0BarRlOhvJLlzhLTxShkOyqv\nvR7BY4zkQxM5I9poqbOzpmnrS75F/n2wM9AjGuWCqLWlTFDjTbcc1XEicEa/Ogdd\nzLn1Esrm8vMXpxzCdPIeHWFRUQKBgQC2DpegU4fyVRG4lv1okeEIFqkeXSAD70zI\n6MEw7rNm9TmYaPu18VCg3yfovjTmOxbQcxmJgwNql7cswu+fwDuQ29xX/jCRN9aC\nrXqMXqbyPOtZ4l7VtRk+9qJeytNt9DlacHsHq0NTKPqgwT814fBKt9K52c8hi+ik\nSw3VCrCofQKBgFXDovA7ritmFe6J/lNMwDtTFN3uey+yjAVCyPEBqMM9JDHlz9jW\nUddqNNW/NFonsLZ7OPwJrFeYFQm5D45D7Y28tJ391C7vTJP//RXB5UJ0e6WhkUjd\n7qKk7VqUOQmxJzIe6b00z02R1LbGQp6vtYeZY3mwoHq0jLMp/X2AIGhxAoGATBOI\n9Owy8Obvgs1Fk37yJCkj/pY3nK1QztvEbygwO6PZr4CfPoZahP77dFyXSmYCwJR4\nZWgj81T2rHPBImZ3/a6CQxrrPKOyteS8QxACf1NJncPkkTUeGZuCek4TT+0wUkSS\nhL/iYEvNf4OBYIjLms1590O3NHN8gbsDSrUu4RkCgYAzhYNQWDCnH7J3muSoteSZ\n85QdkcdmViPkqtGpw5MX4eonQFLgGM+SLqla0H8h2elHTUCARqSz7wdRy5NtRHg9\nSXZew5+HcAmR0829HrC3Vn7qYQqjyB3ucg7GVqz7SDBXlvs8e6jZDHr69IkHgLP5\nQHnDB05H0E1b4KrEs6irfg==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-bmjto@golo-8df78.iam.gserviceaccount.com",
  client_id: "104104351060373105912",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-bmjto%40golo-8df78.iam.gserviceaccount.com",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://golo-8df78.firebaseio.com",
});

//DB connection
mongoose.connect(
  connUri,
  {
    //reconnectTries: Number.MAX_VALUE,
    useNewUrlParser: true,
    useCreateIndex: true,
    //autoReconnect: true,
    useUnifiedTopology: true,
  },
  function (err, db) {
    if (err) {
      console.log("<----------------------------------------------->");
      logger.error("DB filed to connect : " + err.message);
      console.log("<----------------------------------------------->");
      return;
    } else {
      logger.info(`DB Connected successfully : ${connUri}`);
      console.log("<----------------------------------------------->");
    }
  }
);

// Default Helmet Options
// ================================================
// contentSecurityPolicy: false, for setting Content Security Policy
// expectCt: false, for handling Certificate Transparency
// dnsPrefetchControl: true, controls browser DNS prefetching	✓
// frameguard: true, to prevent clickjacking	✓
// hidePoweredBy: true, to remove the X-Powered-By header	✓
// hpkp: false, for HTTP Public Key Pinning
// hsts: true, for HTTP Strict Transport Security	✓
// ieNoOpen: true, sets X-Download-Options for IE8+	✓
// noCache: false, to disable client-side caching
// noSniff: true, to keep clients from sniffing the MIME type	✓
// referrerPolicy: false, to hide the Referer header
// xssFilter: false, adds some small XSS protections
app.use(
  helmet({
    noCache: false,
  })
);

// configure our app to handle CORS requests
app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials, Access-Control-Allow-Origin"
  );
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 1000000,
  })
);

// app.use(
//   (bodyParser = {
//     json: { limit: "50mb", extended: true },
//     urlencoded: { limit: "50mb", extended: true },
//   })
// );
app.use(express.static(path.join(__dirname, "./app/public")));
app.set("views", path.join(__dirname, "./app/views"));
app.set("view engine", "html");

app.get("/admin-login", function (req, res) {
  res.sendFile(__dirname + "/app/views/login.html");
});

app.get("/dashboard", function (req, res) {
  res.sendFile(__dirname + "/app/views/dashboard.html");
});

app.get("/users", function (req, res) {
  res.sendFile(__dirname + "/app/views/users.html");
});

app.get("/hosts", function (req, res) {
  res.sendFile(__dirname + "/app/views/hosts.html");
});

app.get("/agency", function (req, res) {
  res.sendFile(__dirname + "/app/views/agency.html");
});
app.get("/membership", function (req, res) {
  res.sendFile(__dirname + "/app/views/membership.html");
});
app.get("/recharge", function (req, res) {
  res.sendFile(__dirname + "/app/views/recharge.html");
});
app.get("/charges", function (req, res) {
  res.sendFile(__dirname + "/app/views/charges.html");
});

app.get("/agency-login", function (req, res) {
  res.sendFile(__dirname + "/app/views/agencylogin.html");
});
app.get("/agency-dashboard", function (req, res) {
  res.sendFile(__dirname + "/app/views/agencyDashboard.html");
});
app.get("/agency-hosts", function (req, res) {
  res.sendFile(__dirname + "/app/views/agencyHosts.html");
});
app.get("/agency-host-daily-report", function (req, res) {
  res.sendFile(__dirname + "/app/views/dailyReport.html");
});
app.get("/agency-settlements", function (req, res) {
  res.sendFile(__dirname + "/app/views/agencySettlements.html");
});

//app.use(logger('dev'));

const routes = require("./app/routes/index.js");

let swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./app/myapi_doc/swagger.json");
//swaggerDocument2 = require("./app/myapi_doc/bit_go.json");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//app.use("/api-docs-bit-go", swaggerUi.serve, swaggerUi.setup(swaggerDocument2));

app.use("/api/v1", routes(router));

//Server setup

app.listen(port, () => {
  console.log("<----------------------------------------------->");
  logger.info("GOLO Server lististing at port : " + port);
  console.log("<----------------------------------------------->");
  //console.log("Server Conneted to DB = " + connUri);
});

module.exports = app;
