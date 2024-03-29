/*jshint esversion: 6 */
/*jshint esversion: 8 */
const express = require('express');
const morgan = require('morgan'); // https://www.npmjs.com/package/morgan
const dotenv = require('dotenv'); // ref:  https://www.npmjs.com/package/dotenv
const responseSize = require('express-response-size');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const compression = require('compression');
const cors = require('cors');

const timeStamp = require('./utils/timeStamp');



// for reading Environment Variables from config.env file
dotenv.config({
  path: './config.env'
});

// console.log(process.env.NODE_ENV); //若只有process.env 則會列出所有property

//import the relocated codes for route-handlers and router from corresponding files
const AppError = require('./utils/appError'); // appError.js
const globalErrorHandler = require('./controllers/errorController');
const viewRouter = require('./routes/viewRoutes');

// Use express.js
const app = express();

app.enable('trust proxy'); // For deploying on Heroku as it uses proxy

app.set('view engine', 'pug'); //And create a path with a joined path name
app.set('views', path.join(__dirname, 'views')); // which is the "views" folder relatively located under app.js current folder


// 1) ============== MIDDLE-WARES ==============

// === Implement CORS ===
app.use(cors());
// set header : Access-Control-Allow-Origin

// To allow certain specific domain or site to access API
// app.use(cors({
//   origin: 'https://proj-natours-with-steve.herokuapp.com/',
// }));

// To allow access on all routes
app.options('*', cors());
// // To allow only certain routes
// app.options('/api/v1/tours/:id', cors());

// === SERVING STATIC FILES ===
// build-in middleware "express.static" for serving static file like .html
// app.use(express.static(`${__dirname}/public`)); //https://expressjs.com/en/starter/static-files.html
app.use(express.static(path.join(__dirname, 'public')));


// ===== SECURING http header ======
// Helmet helps you set and secure your Express apps by setting various HTTP headers.
app.use(helmet()); //https://www.npmjs.com/package/helmet

// ===== HTTP request logger middleware for node.js ======
// 67. Environment Variables: 透過 env variable 來控制 development 或是 production stage 的某些 middleware是否要啟用
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // https://www.npmjs.com/package/morgan#dev
}

// ===== REQUEST Limiter for IP ======
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour.',
  //ref:  https://www.npmjs.com/package/express-rate-limit
});

app.use('/api', limiter);

// === Webhooks from Stripe for creating a new booking data after completing checkout
app.post(
  '/webhook-checkout',
  bodyParser.raw({
    type: 'application/json'
  }),
  // bookingController.webhookCheckout
);
// https://proj-natours-with-steve.herokuapp.com/webhook-checkout
// http://expressjs.com/en/api.html#express.raw
// must update to above express.js version 4.17.0
//

// === req.body parser . Reading data from body into req.body===
app.use(express.json({
  limit: '10kb',
})); //middleware的使用解說參照git commit 54-1 Node.js Express 的 Middleware的使用 &解說

// === Parse request data from form submitted //
app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}));

// === Parsing Cookie from client request ===
app.use(cookieParser()); // will display req.cookie in test middle ware

// === Data sanitization against NoSQL query injection attack ===
app.use(mongoSanitize()); //https://www.npmjs.com/package/express-mongo-sanitize

// === Data sanitization against Cross-Site Scripting (XSS) attacks ===
app.use(xss()); //https://www.npmjs.com/package/xss-clean

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'],
}));

// === Data compression === (exclude compressed images)
app.use(compression()); //https://github.com/expressjs/compression#options


app.use(responseSize((req, res, size) => {
  const stat = `${req.method} - ${req.url.replace(/[:.]/g, '')}`;
  const convertedSize = Math.round(size / 1024);
  const outputSize = `${convertedSize}kb`;

  console.log("\nSize of current reponse:" + "\x1b[33m" + ` ${outputSize} (${size}bytes)` + "\x1b[0m");

}));


// === Test middleware ===
// to show WHEN a request/log happened
app.use((req, res, next) => {

  //  ---- Time stamp setting ----
  const optionsForTime = {
    timeZone: "Asia/Taipei",
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };
  var formatter = new Intl.DateTimeFormat('zh-tw', optionsForTime); //  https://www.science.co.il/language/Locale-codes.php
  var localTime = formatter.format(new Date());

  console.log("\x1b[33m" + "\n\n\n--// === Start of Test middle ware === //--\n" + "\x1b[0m");
  console.log("\x1b[0m" + "\nCurrent log time is: " + localTime + "\x1b[0m" + "\n");
  //  ---- end of Time stamp setting ----


  //
  if (req.cookies) {
    // // Test the request.cookie message
    console.log(`\nTest message for the content in req.cookie\n`);
    console.log(req.cookies);
  }

  console.log("\x1b[33m" + "\n--// === End of Test middle ware === //--\n\n" + "\x1b[0m");

  next();
});

// 2) ============== ROUTE-HANDLERS (moved to ./routes/tourRoutes.js


// 3) ============== ROUTES ()
app.use('/', viewRouter);


// =============== GLOBAL ERROR HANDLING MIDDLEWARE ===============
//handles all the other routes besides above
app.all('*', (req, res, next) => {

  // Use AppError as the object to pass into the next() as argument
  // (ref: By using err as argument, the middleware stack will skip to app.use((err))  )
  //
  next(new AppError(`\nCan't find ${req.originalUrl} on this server!!\n`, 404));
});


// error-first function which its main taks is to handle errors only and is the next() function called by app.all

app.use(globalErrorHandler); // the module from errorController.js. will be the next() from app.all

// =============== GLOBAL ERROR HANDLING MIDDLEWARE ===============

/*
git commit records of how to refactor routes into concise code
1. app.route('/api/v1/tours'). ....
https://github.com/avgsteve/natour/commit/731c2b4b05e3fe62019cb1a0cf2f2e9134737051
*/

module.exports = app; // export all config in "app" as a standalone module

// 4) ============== START THE SERVER
/* (---=== moved below to server.js ===---)
const port = 3000; // the port to be used for the localhost page
app.listen(port, () => {
  console.log(`App running on port ${port}...\nThe address is: http://127.0.0.1:${port}`);
});
*/
