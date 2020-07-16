/*jshint esversion: 6 */
/*jshint esversion: 8 */
// const Tour = require('../models/tourModel');
// const User = require('../models/userModel'); //to get user's document data
// const Booking = require('../models/bookingModel'); //to get user's document data
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/* !!! Set view engine and path with the code below in app.js in advance to make sure HTTP response obj can render the .pug files in designated folder

app.set('view engine', 'pug'); // will render .pug file to HTML format

//And create a path with a joined path name
app.set('views', path.join(__dirname, 'views')); // which is the "views" folder relatively located under app.js current folder

//Note: path is from another package imported to app.js

*/

//

exports.landingPage = catchAsync(async (req, res, next) => {


  res.status(200).render('landingPage', {
    title: 'Landing page',
    // tours: tours
  });

});

exports.rooms = (req, res, next) => {};


exports.getAllTours = (req, res, next) => {};

exports.getSingleTour = (req, res, next) => {};


exports.getLoginForm = (req, res, next) => {};

exports.signUp = (req, res, next) => {};


exports.userProfile = (req, res, next) => {};


exports.getMyTours = (req, res, next) => {};


exports.alerts = (req, res, next) => {

  const {
    alert
  } = req.query; // use Query parameters ?alert and the value from URL ex: ?alert=booking to set a sub-Object in res.locals

  if (alert === 'booking') {
    //set res.locals for .pug file to access the property and value in .locals obj
    res.locals.alert = "Your booking is successful! Please check your mail for a confirmation.";
  }

  next();

};
