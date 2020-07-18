/*jshint esversion: 6 */
/*jshint esversion: 8 */
const path = require('path');
const scriptName = path.basename(__filename);
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const timeStamp = require('./utils/timeStamp');
const AppError = require('./utils/appError'); // appError.js
const globalErrorHandler = require('./controllers/errorController');

process.on('uncaughtException', err => {
  console.log('\n\n=== uncaughtException error log ===\n');
  console.log(err.name, err.message); //see below for full error log

  console.log("\n\nuncaught exception! 🤔 And shutting down now...\n");

  console.log('\n\n=== End of uncaughtException error log ===\n');


  // server.close(() => {
  //   process.exit(1);
  // });

});

// Log the message when Heroku sending a SIGTERM for shutting down after inactivity every 24 hours
process.on('SIGTERM', () => {
  console.log(`\nSIGTERM RECEIVED! Shutting down now ... 👋 \n`);
  //Log a message for terminating all process when closing server
  server.close(() => {
    console.log(`All processes terminated! 🔚`);
  });
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});



const app = require("./app"); // getting all config from app.js , so use nodemon server.js to start server

dotenv.config({
  path: './config.env'
});



const port = process.env.PORT || 3000; // the port to be used for the localhost page

const server = app.listen(port, () => {
  const hostAddress = server.address() === undefined ? server.address() : '127.0.0.1';
  const port = server.address().port;
  const currentTimeStamp = timeStamp.getTimeStamp();

  console.log("\x1b[31m",
    `\n(from ${scriptName}:) =>> Starting App on port: ${port}` + "\nat " + currentTimeStamp + " (UTC+8 Taipei time)" + "\x1b[0m");

  console.log(`\nThe full address is: ${'\x1b[4m'}http://${hostAddress}:${port}/` +
    "\x1b[0m" + "\n");

  console.log("Establishing connection to database ...");
});


// ------- Mongoose ------------
//use DB and replace password string with env
const DB = process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD);

// will return a promise obj with using Mongoose
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true // to hide deprication error warning message in terminal
}).then(connection => {
    //to show connections properties
    // console.log(connection.connections);
    console.log("\n\nConnection is successful!  (●'◡'●)\n\n");
  },
  err => {
    console.log("\n\nConnection failed! The error log:\n");
    console.log(err);
  }
);



// ==================================
//process.on ==> event listener
//global error handling - Stops the server from accepting new connections and keeps existing connections


// process.on('unhandledRejection', err => {
//   // https://nodejs.org/api/process.html#process_event_unhandledrejection
//
//   console.log('\n\n=== global error handling ===\n');
//   console.log(err.name, err.message); //see below for full error log
//
//   console.log("UNHANDLED REJECTION! 🤔 And shutting down now...");
//
//   server.close(() => {
//     //ref: https://nodejs.org/api/net.html#net_server_close_callback
//     process.exit(1);
//   });
//
//
// console.log('\n\n=== global error handling ===\n\n');
// console.log(err); //see below for full error log
// });







//=======================================================
