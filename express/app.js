var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var config = require('./config/main')

var index = require('./routes/index');
var apiRoutes = require('./routes/api');
var authroutes = require('./routes/auth')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Use body-parser to get POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Log requests to console
app.use(morgan('dev'));

//initialize passport for use
app.use(passport.initialize());

//Connect to DB
mongoose.connect(config.database)

//bring in passport strategy
require('./config/passport')(passport);

//Allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Serve Static files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/auth', authroutes)
app.use('/api', apiRoutes)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

// Start the server
app.set('port', process.env.PORT || 3000);
 
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
