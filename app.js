var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require("passport");
const cors = require("cors");
const whitelist = ["http://localhost:8888"];
require("dotenv").config();

const apiRouter = require("./routes/api");

const deserializeUserPassport = require('./passports/deserializeUser.passport');
const serializeUserPassport = require('./passports/serializeUser.passport');
const GithubPassport = require('./passports/github.passport');
const GooglePassport = require('./passports/google.passport');

var app = express();
var corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
      return callback(null, true);
    }
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  allowedHeader: "*"
};
app.use(session({
  secret: 'Social login API',
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use("google", GooglePassport);
passport.use("github", GithubPassport);

passport.serializeUser(serializeUserPassport);
passport.deserializeUser(deserializeUserPassport);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', cors(corsOptions), apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
