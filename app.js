
/**
 * Module dependencies
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  pollingapi = require('./routes/pollingapi'),
  olapModule = require('./routes/olapmodule'),
  http = require('http'),
  path = require('path'),
  flash = require('connect-flash'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  bcrypt = require('bcrypt-nodejs'),
  mail = require('./routes/email/temail'),
  dashboarddata = require('./routes/dataaccess/dashboarddata'),
  summarytrack = require('./routes/dataaccess/summarytrack'),
  metadataaccess = require('./routes/metadataaccess.js'),
  report = require('./routes/dataaccess/reportdata'),
  dropboxApi = require('./routes/datasources/dropbox'),
  config = require('./config.js');


pollingapi.init();

var app = module.exports = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

io.set('log level', 1); // reduce logging

app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.favicon(path.join(__dirname, 'public/img/favicon.ico')));


var users = [
    { uid: 1, username: 'naboavida', passwordhash: "$2a$10$7vcKXhQT/0tedH9gRC/5a.YPyJ1GZ8Uq2xseipLntiNwlJSMx9tf6", email: 'naboavida@example.com' }
  , { uid: 2, username: 'jpsantos', passwordhash: "$2a$10$7vcKXhQT/0tedH9gRC/5a.YPyJ1GZ8Uq2xseipLntiNwlJSMx9tf6", email: 'jpsantos@example.com' }
];

// var users = [];

var pg = require('pg');
// var dbUrl = "tcp://postgres:maxtamaxta@localhost/nunoteste";
// var conString = "postgres://postgres:maxtamaxta@localhost/nunoteste";
// var conString = "postgres://ufjpppbpugidqy:o86ol2Bz1SqbV8bErgweMKRLLm@ec2-54-197-237-231.compute-1.amazonaws.com/d3bd4tetkfqefb";
// var conString = 'postgres://ufjpppbpugidqy:o86ol2Bz1SqbV8bErgweMKRLLm@ec2-54-197-237-231.compute-1.amazonaws.com:5432/d3bd4tetkfqefb';
// var conString = 'postgres://yoqlbveohnosxt:pIoxIwxxhRMrpkBZ32dP7xzRvI@ec2-54-221-206-165.compute-1.amazonaws.com:5432/devrbvm2odkqdb';
var conString = config.conString;

console.log("conString: "+conString);


// function refreshUsersFromDb(){
//   // console.log("REFRESHING REFRESHING REFRESHING REFRESHING RFRESHING");


// 	var client = new pg.Client(conString);
// 	  // var uid = req.session.passport.user;
// 	  // var username = req.params.username;
// 	  var result = {};

// 	  client.connect(function(err) {
// 	    if(err) {
// 	      return console.error('could not connect to postgres', err);
// 	    }
// 	    client.query("SELECT uid as id, username, passwordhash, email FROM users", function(err, result) {
// 	      if(err) {
//           client.end();
// 	        return console.error('usersAppJs error running query', err);
// 	      }
// 	      // console.log("Number of results USERNAME: "+result.rows.length);
// 	      // // console.log(result.rows[0]);
// 	      users = result.rows;
// 	      // console.log(users);
// 	      // // console.log(result.rows[0].theTime);
// 	      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
// 	      client.end();

// 	    });

// 	  });

// }
// refreshUsersFromDb();

// function refreshUsersFromDbRepeat(){
//   refreshUsersFromDb();
//   setTimeout(refreshUsersFromDbRepeat, 360000);
// }




function findById(id, fn) {

  // var client = new pg.Client(conString);
  // // var uid = req.session.passport.user;
  // // var username = req.params.username;
  // var result = {};
  // // console.log('USERNAME');
  // // console.log(username);

  // client.connect(function(err) {
  //   if(err) {
  //     return console.error('could not connect to postgres', err);
  //   }
  //   client.query("SELECT * FROM users WHERE uid = "+id, function(err, result) {
  //     if(err) {
  //       return console.error('error running query', err);
  //     }
  //     console.log("Number of results USERNAME: "+result.rows.length);
  //     console.log(result.rows[0]);
  //     console.log("Now: "+Date.now() );
  //     // console.log(result.rows[0]);
  //     // // console.log(result.rows[0].theTime);
  //     //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)

  //     client.end();


  //     if(result.rows.length == 1){
  //       // console.log(">>> FOUND USERNAME");
  //       return fn(null, result.rows[0]);
  //     }
  //     else {
  //       // console.log("DID NOT FIND USERNAME");
  //       return fn(null, null);
  //     }


  //   });

  // });




  // // var idx = id - 1;
  // // if (users[idx]) {
  // //   fn(null, users[idx]);
  // // } else {
  // //   fn(new Error('User ' + id + ' does not exist'));
  // // }
  var exists = -1;
  for(var i in users){
  	if(users[i].uid == id)
  		exists = i;
  }
  if(exists != -1)
  	fn(null, users[exists]);
  else
  	fn(new Error('User ' + id + ' does not exist'));
}

function findByUsername(username, fn) {
	// var pg = require('pg');
	// // var dbUrl = "tcp://postgres:maxtamaxta@localhost/nunoteste";
	// var conString = "postgres://postgres:maxtamaxta@localhost/nunoteste";
	// // var conString = "postgres://ufjpppbpugidqy:o86ol2Bz1SqbV8bErgweMKRLLm@ec2-54-197-237-231.compute-1.amazonaws.com/d3bd4tetkfqefb";
	// // var conString = 'postgres://ufjpppbpugidqy:o86ol2Bz1SqbV8bErgweMKRLLm@ec2-54-197-237-231.compute-1.amazonaws.com:5432/d3bd4tetkfqefb';

	var client = new pg.Client(conString);
  // var uid = req.session.passport.user;
  // var username = req.params.username;
  var result = {};
  // console.log('USERNAME');
  // console.log(username);

  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query("SELECT * FROM users WHERE username = '"+username+"'", function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      console.log("Number of results USERNAME: "+result.rows.length);
      console.log(result.rows[0]);
      console.log("Now: "+Date.now() );
      // console.log(result.rows[0]);
      // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)


      client.end();


      if(result.rows.length == 1){
        // console.log(">>> FOUND USERNAME");

        var exists = -1;
        for(var i in users){
          if(users[i].uid == result.rows[0].uid)
            exists = i;
        }
        if(exists == -1)
          users.push(result.rows[0]);

        return fn(null, result.rows[0]);
      }
      else {
        // console.log("DID NOT FIND USERNAME");
        return fn(null, null);
      }


    });

  });




  // for (var i = 0, len = users.length; i < len; i++) {
  //   var user = users[i];
  //   if (user.username === username) {
  //     return fn(null, user);
  //   }
  // }
  // return fn(null, null);
}




// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  function(username, password, done) {
  	// refreshUsersFromDb();

    // asynchronous verification, for effect...
    process.nextTick(function () {

      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        // console.log("findByUsername password hash is: "+user.passwordhash);

        // var hash = bcrypt.hashSync(user.password);

        // var savedhash = '$2a$10$KuGn9O8i97CmmCW4zVGQJuOnVa4IvA9COauwiCo8kxVQarj.UUIVy';


        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        // if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        if ( !bcrypt.compareSync(password, user.passwordhash) ) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));





// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  // done(null, user.id);
  // // console.log("serializeUser");
  done(null, user.uid);
});


// var shown = 0;

passport.deserializeUser(function(id, done) {
  // shown++;
  // console.log(">>>>> deserializeUser "+shown);
  // // console.trace();
  findById(id, function (err, user) {
    done(err, user);
  });
});





/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
// app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard dog' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.favicon(path.join(__dirname, 'public/img/favicon.ico')));
app.use(app.router);

// development only
if (app.get('env') === 'development') {
  app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
  // TODO
}



/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);
// app.get('/dashboard', routes.dashboard);
// app.get('/projects', routes.projects);
app.get('/addProject', ensureAuthenticated, routes.addProject);
// app.get('/addWidget/:pid', routes.addWidget);
// app.get('/dashboard/:pid', routes.dashboard);

app.get('/partials/:name', ensureAuthenticated, routes.partials);



app.get('/login', function(req, res){
	console.log("login!!");
	console.log(req.passport);
  res.render('login', {locals:{ user: req.user, message: req.flash('error') }} );




});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login

var globalUser = {};

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/', failureFlash: true } ),
  function(req, res) {
  	console.log("login ok!!" + Date.now());
  	console.log(req.user);
  	app.set('globalUser', req.user);

    res.redirect(req.session.returnTo.replace('partials/', '') || '/');
    // res.redirect('/');


    var client = new pg.Client(conString);
      // var uid = req.session.passport.user;
      // var username = req.params.username;
    var result = {};

    var user_id = req.user.uid;

    client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }
      var datetime = new Date();

      if(user_id != undefined){
        var q = "UPDATE users SET login = '"+datetime+"' WHERE uid = "+user_id;
        console.log(q);
        client.query(q, function(err, result) {
          if(err) {
            return console.error('error running query', err);
          }
          client.end();

        });
      } else {
        console.error("couldn't update user_id");
        console.error(req.user);
      }


    });


  }
);

app.get('/logout', function(req, res){
  console.log("LOGOUT!!");


  var client = new pg.Client(conString);
    // var uid = req.session.passport.user;
    // var username = req.params.username;
  var result = {};

  if(req != undefined && req.user != undefined && req.user.hasOwnProperty("id") ){
    var user_id = req.user.id;

    client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }
      var datetime = new Date();
      console.log(datetime);
      var q = "UPDATE users SET logout = '"+datetime+"' WHERE uid = "+user_id;
      console.log(q);
      client.query(q, function(err, result) {
        if(err) {
          return console.error('error running query', err);
        }
        client.end();

      });

    });
  }

  req.logout();
  res.redirect('/');





});






// API

app.get('/api/user', ensureAuthenticatedApi, api.getUser);
app.post('/api/userPassword', ensureAuthenticatedApi, api.changeUserPassword);
app.post('/api/adduser', ensureAuthenticatedApi, api.addUser)

app.get('/api/userProfile', ensureAuthenticatedApi, api.getUserProfile);

app.get('/api/projectinfo/:pid', ensureAuthenticatedApi, api.getProjectInfo);
// app.get('/api/projects', api.getProjects);
app.get('/api/projects', ensureAuthenticatedApi, api.getProjectsUsername);
// app.post('/api/projects', api.addProject);
app.post('/api/projects', ensureAuthenticatedApi, api.addProjectUsername);
app.delete('/api/project/:pid', ensureAuthenticatedApi, api.deleteProject);

app.post('/api/setProjectCenter/:pid', ensureAuthenticatedApi, api.setProjectCenter);
app.get('/api/getProjectCenter/:pid', ensureAuthenticatedApi, api.getProjectCenter);

app.get('/api/dashboard/:pid/:pointid', ensureAuthenticatedApi, api.getDashboard);
app.get('/api/dashboard/:pid', ensureAuthenticatedApi, api.getDashboard);
app.get('/api/indicator/:pid/:iid', ensureAuthenticatedApi, api.getIndicator);
app.get('/api/indicator/:pid/:pointiid/:pointid', ensureAuthenticatedApi, api.getPointIndicator);
app.post('/api/indicator/:pid', ensureAuthenticatedApi, api.addIndicator);
app.post('/api/updateIndicator/:pid/:iid', ensureAuthenticatedApi, api.updateIndicator);
app.delete('/api/indicator/:pid/:iid/:pointid', ensureAuthenticatedApi, api.deletePointIndicator);
app.delete('/api/indicator/:pid/:iid', ensureAuthenticatedApi, api.deleteIndicator);

app.get('/api/pointindicators/:pid/:pointid', ensureAuthenticatedApi, api.getPointIndicators);
app.get('/api/pointdashboard/:pid/:pointid', ensureAuthenticatedApi, api.getDashboardPoint);
app.post('/api/indicator/:pid/:pointid', ensureAuthenticatedApi, api.addPointIndicator);
app.post('/api/indicatorAndReadings/:pid/:pointid', ensureAuthenticatedApi, api.addPointIndicatorAndReadings);

app.post('/api/indicatorReadings/:iid', ensureAuthenticatedApi, api.addIndicatorReadings);
app.delete('/api/indicatorReadings/:iid/:date/:hour', ensureAuthenticatedApi, api.deleteIndicatorReadings);
app.delete('/api/indicatorReadings/:iid/:date', ensureAuthenticatedApi, api.deleteIndicatorReadings);

app.get('/api/parameter/:iid/:parmid', ensureAuthenticatedApi, api.getParameter);
app.get('/api/parameterPoint/:pointiid/:pointparmid', ensureAuthenticatedApi, api.getParameterPoint);
app.post('/api/parameter/:pid/:iid', ensureAuthenticatedApi, api.addParameter);
app.post('/api/updateParameter/:pid/:iid/:parmid', ensureAuthenticatedApi, api.updateParameter);
app.delete('/api/parameter/:iid/:parmid', ensureAuthenticatedApi, api.deleteParameter);
app.post('/api/parameter/:pid/:pointiid/:pointid', ensureAuthenticatedApi, api.addParameterPoint);
app.get('/api/parameterReadings/:iid/:parmid', ensureAuthenticatedApi, api.getParameterReadings);
app.post('/api/parameterReadings/:iid/:parmid', ensureAuthenticatedApi, api.addParameterReadings);
app.delete('/api/parameterReadings/:parmid/:date', ensureAuthenticatedApi, api.deleteParameterReadings);

app.get('/api/parameterPointReadings/:pointiid/:pointparmid', ensureAuthenticatedApi, api.getParameterPointReadings);
app.get('/api/parameterPointReadings/:pointiid', ensureAuthenticatedApi, api.getIndicatorPointReadings);
app.post('/api/parameterPointReadings/:pointiid/:pointparmid', ensureAuthenticatedApi, api.addParameterPointReadings);
app.post('/api/parameterPointMultipleReadings/:pointiid/:pointparmid', ensureAuthenticatedApi, api.addParameterPointMultipleReadings);


app.get('/api/pointsFromWidget/:pid/:wid', ensureAuthenticatedApi, api.getPointsFromWidget);
app.get('/api/orderedPointValuesOfParameter/:pid/:iid/:parmid', ensureAuthenticatedApi, api.getOrderedPointValuesOfParameter);

app.get('/api/posts', ensureAuthenticatedApi, api.posts);

app.get('/api/post/:id', ensureAuthenticatedApi, api.post);
app.post('/api/post', ensureAuthenticatedApi, api.addPost);
app.put('/api/post/:id', ensureAuthenticatedApi, api.editPost);
app.delete('/api/post/:id', ensureAuthenticatedApi, api.deletePost);

app.get('/geoapi/:pid', ensureAuthenticatedApi, api.geoapi);
app.get('/geoapi/:pid/:pointid', ensureAuthenticatedApi, api.geoapiPoint);
app.post('/geoapi/addPoint/:pid', ensureAuthenticatedApi, api.geoapiAddPoint);
app.post('/geoapi/updatePoint/:pid/:pointid', ensureAuthenticatedApi, api.geoapiUpdatePoint);
app.delete('/geoapi/deletePoint/:pointid', ensureAuthenticatedApi, api.geoapiDeletePoint);
app.post('/geoapi/pointgeometries/:pid', ensureAuthenticatedApi, api.addPointGeometries);

app.get('/api/activities/:pid/:pointid', ensureAuthenticatedApi, api.getActivitiesPoint);
app.get('/api/activities/:pid', ensureAuthenticatedApi, api.getActivities);
app.post('/api/activities/:pid/:pointid', ensureAuthenticatedApi, api.setActivitiesPoint);
app.post('/api/activities/:pid', ensureAuthenticatedApi, api.setActivities);

app.get('/api/alerts', ensureAuthenticatedApi, api.getAlerts);
app.get('/api/alerts/:pid', ensureAuthenticatedApi, api.getAlerts);
app.get('/api/alerts/:pid/:title', ensureAuthenticatedApi, api.getAlerts);
app.get('/api/alertsCount', ensureAuthenticatedApi, api.getAlertsCount);


app.get('/api/getPointTemplates/:pid', ensureAuthenticatedApi, api.getPointTemplates);
app.get('/api/getPointTemplates/:pid/:filtered', ensureAuthenticatedApi, api.getPointTemplates);
app.post('/api/addPointTemplate/:pid', ensureAuthenticatedApi, api.addPointTemplate);
app.post('/api/addPointTemplateAttribute/:tid', ensureAuthenticatedApi, api.addPointTemplateAttribute);


app.get('/app/userprojectscounts', ensureAuthenticatedApi, api.getOrganizationsStatistics);
app.get('/app/projectindicatorscounts', ensureAuthenticatedApi, api.getIndicatorsStatistics);
app.get('/app/loggedInUsers', ensureAuthenticatedApi, api.getLoggedInUsers);

app.get('/api/widgets/:pid', ensureAuthenticatedApi, api.getWidgets);
app.get('/api/widgets/:pid/:pointid', ensureAuthenticatedApi, api.getWidgets);
app.get('/api/widgetIndicators/:pid/:wid', ensureAuthenticatedApi, api.getWidgetIndicators);
app.get('/api/widgetIndicators/:pid/:wid/:pointid', ensureAuthenticatedApi, api.getWidgetIndicators);

app.post('/api/accumDashboard/:pid/:pointid', ensureAuthenticatedApi, api.getAccumDashboard);
app.post('/api/accumDashboard/:pid', ensureAuthenticatedApi, api.getAccumDashboard);
app.post('/api/accumRanking/:pid/:wid', ensureAuthenticatedApi, api.getAccumRanking);


app.post('/api/getWidgetValues/:pid', ensureAuthenticatedApi, api.getWidgetValues);

app.post('/api/totalNetSales/:pid/:wid', ensureAuthenticatedApi, api.getTotalNetSales);
app.post('/api/totalCustomers/:pid/:wid', ensureAuthenticatedApi, api.getTotalCustomers);
app.post('/api/totalBasket/:pid/:wid', ensureAuthenticatedApi, api.getTotalBasket);
app.post('/api/totalNetMargin/:pid/:wid', ensureAuthenticatedApi, api.getTotalNetMargin);
app.post('/api/totalMultilineBills/:pid/:wid', ensureAuthenticatedApi, api.getTotalMultilineBills);
app.post('/api/totalStockLevel/:pid/:wid', ensureAuthenticatedApi, api.getTotalStockLevel);

app.post('/api/totalNetSales/:pid', ensureAuthenticatedApi, api.getTotalNetSales);
app.post('/api/totalCustomers/:pid', ensureAuthenticatedApi, api.getTotalCustomers);
app.post('/api/totalBasket/:pid', ensureAuthenticatedApi, api.getTotalBasket);
app.post('/api/totalNetMargin/:pid', ensureAuthenticatedApi, api.getTotalNetMargin);
app.post('/api/totalMultilineBills/:pid', ensureAuthenticatedApi, api.getTotalMultilineBills);
app.post('/api/totalStockLevel/:pid', ensureAuthenticatedApi, api.getTotalStockLevel);
app.post('/api/standardError/:pid/:wid', ensureAuthenticatedApi, api.getStandardError);

app.post('/api/standardError/:pid/:wid', ensureAuthenticatedApi, api.getStandardError);

app.post('/api/widgetIndicatorsFilter/:pid/:wid', ensureAuthenticatedApi, api.getWidgetIndicatorsFiltered);
app.post('/api/pointsFromWidgetFilter/:pid/:wid', ensureAuthenticatedApi, api.getPointsFromWidgetFiltered);
app.get('/api/lastValuesAllKpis/:pid', ensureAuthenticatedApi, api.getLastValuesAllKpis);

app.get('/api/datatypes/:pid', ensureAuthenticatedApi, api.getDataTypes);
app.post('/api/datatype/:pid', ensureAuthenticatedApi, api.addDataType);
app.post('/api/editDatatype/:dtid', ensureAuthenticatedApi, api.editDataType);
app.delete('/api/datatype/:dtid', ensureAuthenticatedApi, api.deleteDataType);

app.get('/api/indicatorsMetaData/:pid', ensureAuthenticatedApi, api.getIndicatorsMetaData);

app.post('/api/getMetaLevels/:pid', ensureAuthenticatedApi, metadataaccess.getMetaLevels);
app.get('/api/getMetaLevels/:pid', ensureAuthenticatedApi, metadataaccess.getMetaLevels);
app.post('/api/setMetaLevels/:pid', ensureAuthenticatedApi, metadataaccess.setMetaLevels);
app.get('/api/getProjectIndicators/:pid', ensureAuthenticatedApi, metadataaccess.getProjectIndicators);


app.get('/api/getCustomIcons/:pid', ensureAuthenticatedApi, api.getCustomIcons);
app.post('/api/setCustomIcon/:pid', ensureAuthenticatedApi, api.setCustomIcon);

app.get('/api/getMailingList/:pid', ensureAuthenticatedApi, api.getMailingList);
app.post('/api/setMailingList/:pid', ensureAuthenticatedApi, api.setMailingList);

app.get('/api/names/:pid', ensureAuthenticatedApi, api.getGeneralNames);
app.get('/api/namesMinMax/:pid', ensureAuthenticatedApi, api.getNamesMinMax);

app.get('/api/occurrences/:pid/:firstload', ensureAuthenticatedApi, api.getOccurrences);
app.post('/api/occurrences/:pid', ensureAuthenticatedApi, api.saveOccurrence);
app.post('/api/newoccurrence/:pid', ensureAuthenticatedApi, api.generateOccurrence);

app.get('/api/occcfg/:pid', ensureAuthenticatedApi, api.getOccurrenceConfigs);
app.post('/api/saveocccfg/:pid/:occcfgid', ensureAuthenticatedApi, api.saveOccurrenceConfig);
app.post('/api/saveocccfg/:pid', ensureAuthenticatedApi, api.saveOccurrenceConfig);
app.delete('/api/occcfg/:pid/:occcfgid', ensureAuthenticatedApi, api.deleteOccurrenceConfig);


app.get('/api/tasklists/:pid', ensureAuthenticatedApi, api.getTaskLists);
app.post('/api/addtasklist/:pid', ensureAuthenticatedApi, api.addTaskList);
app.post('/api/edittasklist/:pid/:tlid', ensureAuthenticatedApi, api.updateTaskList);
app.delete('/api/deletetasklist/:pid/:tlid', ensureAuthenticatedApi, api.deleteTaskList);


app.get('/externalapi/honSurveyKeys', ensureAuthenticatedApi, api.getHonSurveyKeys);
app.get('/externalapi/honSurveyResults/:key', ensureAuthenticatedApi, api.getHonSurveyResults);
app.get('/olapapi/discoverDataSources', ensureAuthenticatedApi, api.discoverDataSources);
app.get('/olapapi/discoverMDDimensions/:cubename', ensureAuthenticatedApi, api.discoverMDDimensions);
app.get('/olapapi/discoverMDDimensionsMeasures/:cubename', ensureAuthenticatedApi, api.discoverMDDimensionsMeasures);
app.post('/olapapi/olapExecute/:cubename', ensureAuthenticatedApi, api.olapExecute);
app.post('/olapapi/olapExecuteKpis/:pid/:timeframe', ensureAuthenticatedApi, api.olapExecuteKpis);

app.get('/pollingapi/getIntervalValue',  pollingapi.getIntervalValue);
app.post('/pollingapi/setIntervalValue',  pollingapi.setIntervalValue);
app.get('/pollingapi/getCurrentReads',  pollingapi.getCurrentReads);
app.post('/pollingapi/setStartStopInterval',  pollingapi.setStartStopInterval);
app.get('/pollingapi/clearBackendReadings',  olapModule.clearBackendReadings);
app.post('/pollingapi/forceDate',  pollingapi.syncDate);

app.post('/pollingapi/setTriggerTimeXlsxDropbox', pollingapi.setTriggerTimeXlsxDropbox);
app.post('/pollingapi/getXlsxDropboxProjects', pollingapi.getXlsxDropboxProjects);


app.post('/api/saveOlapStore/:pid/:pointkey', ensureAuthenticatedApi, api.saveOlapStore);
app.post('/api/deleteOlapStore/:pid/:pointkey', ensureAuthenticatedApi, api.deleteOlapStore);
app.get('/api/getOlapStore/:pid/:pointkey', ensureAuthenticatedApi, api.getOlapStore);
app.get('/api/getAllOlapStores/:pid', ensureAuthenticatedApi, api.getAllOlapStores);


app.get('/mailapi/sendDummyEmail', ensureAuthenticatedApi, mail.sendDummyEmail)
app.get('/mailapi/sendHtmlDummyEmail', ensureAuthenticatedApi, mail.sendHtmlDummyEmail)
app.post('/mailapi/forcedailymail', ensureAuthenticatedApi, mail.forceSendDailyMail)
app.post('/mailapi/forceoverdueoccurrences', ensureAuthenticatedApi, mail.forceOverdueOccurrences);

// app.get('/dataaccess/generateSummary/:pid', ensureAuthenticatedApi, summarytrack.generateSummary);
app.post('/dataaccess/generateSummaryTemail/:pid', ensureAuthenticatedApi, mail.generateSummary);

//dashboard
app.post('/dashboard/getHistoryTotal/:pid',ensureAuthenticatedApi, dashboarddata.getHistoryTotal)
app.post('/dashboard/pointsMatrix/:pid', ensureAuthenticatedApi, dashboarddata.getPointsMatrix);
app.post('/dashboard/pointranking/:pid/:wid', ensureAuthenticatedApi, dashboarddata.getPointRanking);

app.get('/api/getDatesToDelete/:pid', ensureAuthenticatedApi, api.getDatesToDelete);
app.post('/api/deleteDates/:pid', ensureAuthenticatedApi, api.deleteDatesBulk);

//report
app.post('/report/PointRankingByTitle/:pid', ensureAuthenticatedApi, report.getPointRankingByTitle);
app.post('/api/saveReport/:pid', ensureAuthenticatedApi, metadataaccess.saveReport);
app.get('/api/reports/:pid/:rid', ensureAuthenticatedApi, metadataaccess.getReports);
app.get('/api/reports/:pid', ensureAuthenticatedApi, metadataaccess.getReports);

app.post('/api/getMinAndMaxDate/:pid',ensureAuthenticatedApi, metadataaccess.getMinAndMaxDate)
app.delete('/api/deleteReport/:pid/:rid',ensureAuthenticatedApi, report.deleteReport)


// metadata
app.get('/metadata/pointsNames/:pid', ensureAuthenticated, metadataaccess.getPointsNames);
app.post('/dropboxMetaData/storeMapping/:pointid', ensureAuthenticated, metadataaccess.setStoreMapping);
app.get('/metadata/datasources/:pid', ensureAuthenticated, metadataaccess.getDataSources);
app.delete('/api/deletedatasource/:pid/:pointid', ensureAuthenticated, metadataaccess.deleteDataSource);

// dropbox api
app.post('/dropboxApi/listPublicFolder/:pid', ensureAuthenticated, dropboxApi.listPublicFolder);
app.post('/dropboxApi/fetchXlsxFile/:pid', ensureAuthenticated, dropboxApi.fetchXlsxFile);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


/**
 * Start Server
 */


// // http.createServer(app).listen(app.get('port'), function () {
// //   // console.log('Express server listening on port ' + app.get('port'));
// // });

// var server = app.listen(app.get('port'), function () {
//   // console.log('Express server listening on port ' + app.get('port'));
// });
// var io = require('socket.io').listen(server);


io.sockets.on('connection', require('./routes/socket').init);

io.set('authorization', function(handshakeData, acceptFn){
  // console.log("socket::::::");
  // console.log(handshakeData.cookie);
  acceptFn(null, true);
});



function ensureAuthenticatedApi(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.render('login');
}


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }

  req.session.returnTo = req.headers.referer || req.path;
  res.redirect('/login');
}


var srvr = server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

srvr.timeout = 120000;
