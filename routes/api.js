var config = require('../config.js');
var skt = require('./socket');
var datacaptureapi = require('./datacaptureapi.js');
var occurrencestrack = require('./occurrences/occurrencestrack.js');
var dataaccess = require('./dataaccess/dataaccess.js');
var metadataaccess = require('./metadataaccess.js');
var dashboarddata = require('./dataaccess/dashboarddata.js');

// initialize our faux database
var data = {
  "posts": [
    {
      "title": "Lorem ipsum",
      "text": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      "title": "Sed egestas",
      "text": "Sed egestas, ante et vulputate volutpat, eros pede semper est, vitae luctus metus libero eu augue. Morbi purus libero, faucibus adipiscing, commodo quis, gravida id, est. Sed lectus."
    }
  ]
};

// GET

exports.posts = function (req, res) {
  var posts = [];
  data.posts.forEach(function (post, i) {
    posts.push({
      id: i,
      title: post.title,
      text: post.text.substr(0, 50) + '...'
    });
  });
  res.json({
    posts: posts
  });
};

exports.post = function (req, res) {
  var id = req.params.id;
  if (id >= 0 && id < data.posts.length) {
    res.json({
      post: data.posts[id]
    });
  } else {
    res.json(false);
  }
};

// POST
exports.addPost = function (req, res) {
  data.posts.push(req.body);
  res.json(req.body);
};

// PUT
exports.editPost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts[id] = req.body;
    res.json(true);
  } else {
    res.json(false);
  }
};

// DELETE
exports.deletePost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts.splice(id, 1);
    res.json(true);
  } else {
    res.json(false);
  }
};




var pg = require('pg');
// var dbUrl = "tcp://postgres:maxtamaxta@localhost/nunoteste";
//var conString = "postgres://postgres:maxtamaxta@localhost/nunoteste";
// var conString = "postgres://ufjpppbpugidqy:o86ol2Bz1SqbV8bErgweMKRLLm@ec2-54-197-237-231.compute-1.amazonaws.com/d3bd4tetkfqefb";
// var conString = 'postgres://ufjpppbpugidqy:o86ol2Bz1SqbV8bErgweMKRLLm@ec2-54-197-237-231.compute-1.amazonaws.com:5432/d3bd4tetkfqefb';
//var conString = 'postgres://yoqlbveohnosxt:pIoxIwxxhRMrpkBZ32dP7xzRvI@ec2-54-221-206-165.compute-1.amazonaws.com:5432/devrbvm2odkqdb';
var conString = config.conString;

var bcrypt = require('bcrypt-nodejs');


// DATA


var projects = [];


var dashboards = [{"id":0, "indicators":[{"iid":0, "title":"Water Quality", "value":"Good", "unit":'', "alarm":'yes', "coord":[{"x":32.666667, "y": -16.85}],
                                                    "readings":[]},
                                        {"iid":2, "title":"Location", "value":"Monte", "unit":'', "alarm":'no', "coord":[{"x":32.666667, "y": -16.95}]}] }];

var indicators = [ {"iid":0, "parameters":[{"parmid":0, "title":"ph", "value":7.3, "unit":"",
                                                    "readings":[[0, 3.4], [1,3.5], [2,4.2], [3,4.4], [4,4.5], [5,5.9], [6,7.3] ]  }] },
                  {"iid":1, "parameters":[{"parmid":1, "title":"Ferro", "value":123, "unit":"mg/l",
                                                    "readings":[[0, 123], [1,113.5], [2,123.5], [3,133.5], [4,153.5] ]  }] },
                  {"iid":2, "parameters":[] }  ];

var def_date = new Date("June 1, 2014 11:13:00");

var activities = [ {"id":0, "activitiesList":[{"aid":0, "title":"Woo Sampling", "start":'2014-05-29T22:00:00.000Z', "end":"", "allDay":true}, {"aid":1, "title":"pH Sampling", "start":'2014-05-30T22:00:00.000Z', "end":"", "allDay":true}] },
                  {"id":1, "activitiesList":[] },
                  {"id":2, "activitiesList":[] }  ];


var pointDashboards = [ {"id": 0, "pointIndicators": [ {"pointid": 0, "coord":[{"x":32.666667, "y": -16.85}],
                                                                "indicators":[{"pointiid":0, "title":"Water Quality", "value":4, "unit":"mg", "alarm":"yes" }] },
                                                       {"pointid": 1, "coord":[{"x":32.666667, "y": -16.95}],
                                                                "indicators":[{"pointiid":1, "title":"Water Quality", "value":2, "unit":"mg", "alarm":"yes" }] }
                                                         ] },
                        {"id": 1, "pointIndicators":[] } ];

var pointIndicators = [ {"pointiid":0, "parameters":[ {"pointparmid":0, "title":"ph", "value":3.3, "unit":"lvl",
                                                    "readings":[[0, 3.4], [1,3.5], [2,4.2], [3,4.4], [4,4.5], [5,5.9], [6,7.3], [7,3.3] ]  } ] },
                        {"pointiid":1, "parameters":[ {"pointparmid":1, "title":"ph", "value":7, "unit":"lvl",
                                                    "readings":[[0, 3.4], [1,3.5], [2,4.2], [3,4.4], [4,4.5], [5,5.9], [6,7.3], [7,7] ]  },
                                                    {"pointparmid":2, "title":"Ferro", "value":200, "unit":"lvl",
                                                    "readings":[[0, 100], [1,200], [3,175], [4,200] ]  } ] } ];


var nextIID = 3;
var nextParmId = 2;

var nextAID = 2;

var nextPointID = 2;

var nextPointIID = 2;
var nextPointParmId = 3;



// UTILS
function findMaxProjectId() {
  var highest = 0;
  for (id in projects) {
    if (projects.hasOwnProperty(id)) {
      if(id > highest)
        highest = id;
    }
  }
  return parseInt(highest);
}


function findProjectById(pid) {
  var result = {};
  result.title = 'NOT FOUND';
  if(typeof projects == 'array'){
    projects.forEach(function(project){
      if(project.hasOwnProperty('id') ){
        if(project.id == pid){
          result = project;
        }
      }
    });
  } else {
    // its an object
    if(projects.hasOwnProperty('id') ){
      if(projects.id == pid){
        result = projects;
      }
    }
  }
  return result;
}


function findDashboardIndicatorsById(pid) {
  var result = {};
  dashboards.forEach(function(dashboard){
    if(dashboard.hasOwnProperty('id') ){
      if(dashboard.id == pid){
        result = dashboard.indicators;
      }
    }
  });
  return result;
}


function findPointIndicatorsById(pid, pointid) {
  var result = {};
  pointDashboards.forEach(function(pointDashboard){
    if(pointDashboard.hasOwnProperty('id') ){
      if(pointDashboard.id == pid){
        pointDashboard.pointIndicators.forEach(function(pointIndicator){
          if(pointIndicator.pointid == pointid)
            result = pointIndicator.indicators;
        });
        // result = dashboard.indicators;
      }
    }
  });
  return result;
}


function findDashboardIndicatorsIIDById(pid) {
  var result = [];
  dashboards.forEach(function(dashboard){
    if(dashboard.hasOwnProperty('id') ){
      if(dashboard.id == pid){
        for(var ind in dashboard.indicators)
          result.push(ind);
      }
    }
  });
  return result;
}


function findProjectActivitiesById(pid){
  var result = [];
  activities.forEach(function(entry){
    if(entry.hasOwnProperty('id') ){
      if(entry.id == pid){
          result = entry.activitiesList;
      }
    }
  });
  return result;
}


function setActivityByPid(pid, obj){
  var result = [];
  activities.forEach(function(entry){
    if(entry.hasOwnProperty('id') ){
      if(entry.id == pid){
          entry.activitiesList.forEach(function(activity){
            if(activity.aid == obj.aid){
              // // console.log(obj.start);
              activity.start = obj.start;
              activity.end = obj.end;
              activity.allDay = obj.allDay;
              // falta actualizar o end e o title
              // // console.log(entry.activitiesList);
            }
          });
      }
    }
  });
  return result;
}



function addActivityByPid(pid, obj){
  var result = [];
  activities.forEach(function(entry){
    if(entry.hasOwnProperty('id') ){
      if(entry.id == pid){
          obj.aid = nextAID;
          entry.activitiesList.push(obj);
          nextAID++;
      }
    }
  });
  return result;
}




function findIndicatorById(iid){
  var result = {};
  dashboards.forEach(function(dashboard){
    if(dashboard.hasOwnProperty('id') ){
      dashboard.indicators.forEach(function(indicator){
        if(indicator.iid == iid){
          result = indicator;
        }
      });
    }
  });
  return result;
}

function findIndicatorByPointiid(pointiid){
  var result = {};
  pointDashboards.forEach(function(dashboard){
    if(dashboard.hasOwnProperty('id') ){
      dashboard.pointIndicators.forEach(function(point){
        point.indicators.forEach(function(indicator){
          if(indicator.pointiid == pointiid){
            result = indicator;
          }
        });
      });
    }
  });
  return result;
}



function findIndicatorParametersByIId(iid) {
  var result = [];
  indicators.forEach(function(indicator){
    if(indicator.hasOwnProperty('iid') ){
      if(indicator.iid == iid){
        result = indicator.parameters;
      }
    }
  });
  return result;
}


function findIndicatorParametersByPointIId(pointiid) {
  var result = [];
  pointIndicators.forEach(function(pointIndicator){
    if(pointIndicator.hasOwnProperty('pointiid') ){
      if(pointIndicator.pointiid == pointiid){
        result = pointIndicator.parameters;
      }
    }
  });
  return result;
}


function findParameterByParmId(iid, parmid){
  var result = {};
  var parameters = findIndicatorParametersByIId(iid);
  parameters.forEach(function(parameter){
    if(parameter.parmid == parmid)
      result = parameter;
  });
  return result;
}


function findParameterByPointParmId(pointiid, pointparmid){
  var result = {};
  var parameters = findIndicatorParametersByPointIId(pointiid);
  parameters.forEach(function(parameter){
    if(parameter.pointparmid == pointparmid)
      result = parameter;
  });
  return result;
}



function getLocationsByPId(pid){
  var result = [];
  // // // console.log(projects);

  pointDashboards.forEach(function(indicator){
    if(indicator.hasOwnProperty('id') ){
      if(indicator.id == pid){
        indicator.pointIndicators.forEach(function(ind){
          if(ind.coord != undefined)
            result.push( {"pointid":ind.pointid , "x": ind.coord[0].x, "y": ind.coord[0].y } );
        });
      }
    }
  });
  return result;
}

function getLocationsByPIdPointid(pid, pointid){
  var result = [];

  pointDashboards.forEach(function(indicator){
    if(indicator.hasOwnProperty('id') ){
      if(indicator.id == pid){
        indicator.pointIndicators.forEach(function(ind){
          if(ind.pointid == pointid)
            result.push( {"pointid":ind.pointid , "x": ind.coord[0].x, "y": ind.coord[0].y } );
        });
      }
    }
  });
  return result;
}


function getPointIndicatorById(pid){
  var result = [];

  pointDashboards.forEach(function(indicator){
    if(indicator.hasOwnProperty('id') ){
      if(indicator.id == pid){
        result = indicator.pointIndicators;
      }
    }
  });
  return result;
}



function ordergetBiggestXInReadings(readings_arr){
  if(readings_arr != undefined && readings_arr != null && readings_arr.length != 0){
    // // // console.log("LAST READING IS "+readings_arr[readings_arr.length-1][0]);
    return (readings_arr[readings_arr.length-1][0]+1);
  } else {
    return 0;
  }
  // readings_arr is something like [ [date/order, value] ]
}



function findIndexOfProjectByPid(pid){
  // // console.log("findIndexOfProjectByPid");
  for(var i in projects){
    // // console.log(projects[i]);
    // // console.log((projects[i].pid == pid) || (projects[i].id == pid));
    if( (projects[i].pid == pid) || (projects[i].id == pid) ){
      return i;
    }
  }
}









function orderedPush(array, element){
  // console.log('orderedPush');

  if(array.length == 0){
    array.push(element);
  } else {
    for(var i in array){
      var elem = array[i];
      // console.log('elem in pos '+i+' is:');
      // console.log(elem);

      if(array[i].timestamp > element.timestamp){
        array.splice(i, 0, element);
        return;
      } else {
        if(i == array.length - 1){
          array.push(element);
          return;
        }

      }
    }
  }



  // return array;
}





// function orderedPush(array, element){
//   var pos = locationOf(element, array);
//   console.log(pos);
//   array.splice(pos + 1, 0, element);
//   return array;
// }

function locationOf(element, array, start, end) {
  start = start || 0;
  end = end || array.length;
  var pivot = parseInt(start + (end - start) / 2, 10);
  // console.log("Compare: "+array[pivot].timestamp+ " "+ element.timestamp + " | RESULT is first smaller than second?: " + (array[pivot].timestamp < element.timestamp) );
  if (end-start <= 1 || array[pivot].timestamp === element.timestamp) return pivot;
  if (array[pivot].timestamp < element.timestamp) {
    return locationOf(element, array, pivot, end);
  } else {
    return locationOf(element, array, start, pivot);
  }
}


// TODO: this was defined at client side, now it is duplicated here.
// In the long term, we should remove it from the client, since
// it is stupid to pass all attributes just to extract the name.
// It makes everything slower.
/* For any object with attributes, try to extract a name,
 * otherwise use the default value */
function nameFromAttributes(i,def) {
  return (i && (i.attributes &&
          (i.attributes.name ||
           i.attributes.Name ||
           i.attributes.location ||
           i.attributes["Store code"] ||
           def
           ) || def) || def);
}





// ************************************************************************************************************************************
// METHODS:
// METHODS:
// METHODS:
// ************************************************************************************************************************************

exports.getUserProfile = function(req, res){
  var toRet = {};
  var uid = req.session.passport.user;
  if(uid === undefined || uid === null){
    res.json({"error":"not authenticated!"});
  } else {
    var client = new pg.Client(conString);
    client.connect(function(err) {
      if(err) {
        client.end();
        res.json({});
        return console.error('getUser: could not connect to postgres', err);
      }
  var q = 'SELECT userprofile FROM users where uid = '+uid;
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        res.json({});
        return console.error('getUserProfile error running query', err);
      }
      toRet = result.rows[0];

      res.json(toRet);
      client.end();

      });
    });
  }

};






exports.getUser = function(req, res){
  var uid = req.session.passport.user;
  if(uid === undefined || uid === null){
    res.json({"error":"not authenticated!"});
  } else {
    var client = new pg.Client(conString);
    client.connect(function(err) {
      if(err) {
        return console.error('getUser: could not connect to postgres', err);
      }
      client.query('SELECT * FROM users, organizations where oid_org = oid and uid = '+uid, function(err, result) {
        if(err) {
          client.end();
          return console.error('getUser: error running query', err);
        }
        // // console.log("Number of results: "+result.rows.length);
        getAllAlerts (req,res,function(res_,allAlertsArray) {
            alerts = allAlertsArray.length;
            result.rows[0].alerts = alerts;
            res.json(result.rows[0]);
            client.end();
        });
      });
    });
  }

};

exports.changeUserPassword = function(req, res){
  console.log('API call: changeUserPassword');

  var form = req.body;
  var uid = req.session.passport.user;

  // console.log("hash for "+form.new_pass+" is "+bcrypt.hashSync(form.new_pass));

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT passwordhash FROM users WHERE uid = '+uid, function(err, result) {
      if(err) {
        client.end();
        return console.error('changeUserPassword error running query', err);
      }
      // var pass = result.rows[0].password;
      var passHash = result.rows[0].passwordhash;

      // if(pass != form.old_pass){
      if( !bcrypt.compareSync(form.old_pass, passHash) ){
        res.json({"status_msg": "old password is wrong"});
        client.end();
      } else {
        client.query("UPDATE users SET passwordhash = '"+ bcrypt.hashSync(form.new_pass) + "' WHERE uid = "+uid, function(err, result) {
          if(err) {
            client.end();
            return console.error('UPDATE users SET password error running query', err);
          }
          res.json({"status_msg": ""});
          client.end();
        });

      }
    });
  });
};


exports.addUser = function(req, res){
  console.log("API call: addUser");

  var uid = req.session.passport.user;
  var form = req.body;
  var resToRet = {};

  var client = new pg.Client(conString);
  client.connect(function(err){
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "select oid_org from users where uid = "+uid;
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addUser error running query', err);
      }

      var oid = result.rows[0].oid_org;
      if(oid != 1){
        res.json(resToRet);
        client.end();
      } else {

        // var q = "INSERT INTO organizations(name, code) VALUES ('"+form.organization+"', '"+form.code+"') ;";
        var q = "INSERT INTO organizations(name, code) SELECT '"+form.organization+"', '"+form.code+"' WHERE NOT EXISTS (SELECT name FROM organizations WHERE name = '"+form.organization+"');";
        console.log(q);

        client.query(q, function(err, result) {
          if(err) {
            resToRet.error = "Error adding organization";
            resToRet.cause = err;
            res.json(resToRet);
            client.end();
            return console.error('addUser2 error running query', err);
          }


          var q2 = "INSERT INTO users(username, passwordhash, email, oid_org) VALUES ( '"+form.username+"', '"+ bcrypt.hashSync(form.password) + "', '"+form.email+"', (select oid from organizations where name = '"+form.organization+"') );"
          console.log(q2);
          client.query(q2, function(err2, result2) {
            if(err) {
              resToRet.error = "Error adding user";
              resToRet.cause = err2;
              res.json(resToRet);
              client.end();
              return console.error('addUser error running query', err2);
            }

            resToRet = form;
            res.json(resToRet);
            client.end();
            
          });

        });

      }

    });

  })
};






// get
exports.getProjects = function(req, res){
  // var projects = [{"id":0, "title":'Water Quality', "location": "São Tomé", "area":'123'}];
  projects = [];

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT * FROM projects', function(err, result) {
      if(err) {
        client.end();
        return console.error('getProjects error running query', err);
      }
      result.rows.forEach(function(row){
        dashboards.push({"id":row.pid, "indicators":[] });
      })
      projects = result.rows;
      res.json(projects);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });
  // res.json(projects);
};


// // in case its needed:
// exports.getProjectPointCount = function(req, res){
//   var pid = req.params.pid;

//   var client = new pg.Client(conString);
//   client.connect(function(err) {
//       if(err) {
//         client.end();
//         return console.error('getProjectPointCount: could not connect to postgres', err);
//       }

//       var q2 = "select count(*) from points where pid_proj ="+row.pid;
//       client.query(q, function(err, result) {

//       });
//   });

// }



exports.getProjectsUsername = function(req, res){
  // // console.log("API call: getProjectsUsername");
  var uid = req.session.passport.user;
  if(uid == undefined || uid == null){
    res.json({});
  } else {
    projects = [];

    var client = new pg.Client(conString);
    client.connect(function(err) {
      if(err) {
        client.end();
        return console.error('getProjectsUsername: could not connect to postgres', err);
      }
      // client.query("select * from projects where pid in (select pid_proj from users_projects where uid_user = '"+uid+"');", function(err, result) {
      var q = 'select pid, title, area, location, uservisible, projects.image, organizations.image_org '
            + 'from organizations, organizations_projects, users, projects '
            + 'where users.oid_org = organizations_projects.oid_org '
            + '  and users.oid_org = organizations.oid '
            + '  and projects.pid = organizations_projects.pid_proj '
            + '  and uid = ' + uid
            + ' order by pid';
      console.log("qqqqqqq");
      console.log(q);
      client.query(q, function(err, result) {
        if(err) {
          client.end();
          return console.error('getProjectsUsername 2: error running query', err);
        }
        // // console.log("Number of results: "+result.rows.length);
        for(var i=0; i<result.rows.length; i++){
          var row = result.rows[i];
          dashboards.push({"id":row.pid, "indicators":[] });
        }
        projects = result.rows;
        res.json(projects);
        // // // console.log(result.rows[0].theTime);
        //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
        client.end();
      });
    });
  }
};


exports.getProjectInfo = function(req, res){

  var uid = req.session.passport.user;
  var pid = req.params.pid;
  
  if(uid == undefined || uid == null){
    res.json({});
  } else {
    projects = [];

    var client = new pg.Client(conString);
    client.connect(function(err) {
      if(err) {
        client.end();
        return console.error('getProjectInfo: could not connect to postgres', err);
      }
      // client.query("select * from projects where pid in (select pid_proj from users_projects where uid_user = '"+uid+"');", function(err, result) {
      var q = "select * from projects, organizations_projects, organizations where pid = pid_proj and oid_org = oid and pid = "+pid;
      client.query(q, function(err, result) {
        if(err) {
          client.end();
          return console.error('getProjectInfo: error running query', err);
        }
        

        projects = result.rows[0];
        res.json(projects);
        // // // console.log(result.rows[0].theTime);
        //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
        client.end();
      });
    });
  }

}

// post
exports.addProject = function(req, res){
  // // console.log('API call: addProject');

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "INSERT INTO projects(title, area, location) VALUES ('"+req.body.title+"', '"+req.body.area+"', '"+req.body.location+"') RETURNING pid;";
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addProject: error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){
        // // console.log(row);
        req.body.pid = row.pid;
        projects.push(req.body);
        dashboards.push({"id":req.body.id, "indicators":[] });

        pointDashboards.push({"id": req.body.id, "pointIndicators":[] });
        res.json(projects);
      })
      client.end();
    });
  });
};



exports.addProjectUsername = function(req, res){
  console.log('API call: addProjectUsername');
  var uid = req.session.passport.user;
  var toRet = {};

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    if(req.body.locationCoord != undefined && req.body.locationCoord != {} && req.body.locationCoord.x != undefined && req.body.locationCoord.y != undefined)
      var q = "INSERT INTO projects(title, area, location, x, y) VALUES ('"+req.body.title+"', '"+(req.body.area || 0)+"', '"+(req.body.location || '')+"', " + req.body.locationCoord.x + ", " + req.body.locationCoord.y + ") RETURNING pid;";
    else
      var q = "INSERT INTO projects(title, area, location) VALUES ('"+req.body.title+"', '"+(req.body.area || 0)+"', '"+(req.body.location || '')+"') RETURNING pid;";
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addProjectUsername error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){
        // // console.log(row);
        req.body.pid = row.pid;
        projects.push(req.body);
        toRet.pid = req.body.pid;

        dashboards.push({"id":req.body.id, "indicators":[] });

        pointDashboards.push({"id": req.body.id, "pointIndicators":[] });

        var q2 = "INSERT INTO organizations_projects(oid_org, pid_proj) VALUES(  (select distinct oid_org from users where uid = "+uid+"), "+req.body.pid+");";
        client.query(q2, function(err, result) {
          if(err) {
            client.end();
            return console.error('addProjectUsername2 error running query', err);
          }
          toRet.projects = projects;
          res.json(toRet);
          client.end();
        });
      })
      // res.json(projects);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)

    });
  });
};


exports.deleteProject = function(req, res){
  // // console.log('API call: deleteProject');
  var pid = req.params.pid;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "DELETE FROM projects WHERE pid = "+pid+" RETURNING pid;";
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('deleteProject error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);

      // ou entao apenas fazer o select à BD!!!!
      //removeProjectByPid(pid);
      var i = findIndexOfProjectByPid(pid);
      projects.splice(i, 1);

      // ou entao apenas fazer o select à BD!!!!

      // // console.log('projects after delete');
      // // console.log(projects);

      res.json(projects);
      client.end();
    });
  });


};





exports.getDashboard = function(req, res){
  console.log('API call: getDashboard');
  var pid = req.params.pid;
  var pointid = req.params.pointid;

  var uid = req.session.passport.user;
  apiDebug("getDashboard: uid is "+uid);

  if(uid == undefined || uid == null || req.session.passport == {}){
    res.json({});
    return console.error("user still not logged in");
  }
  var project = findProjectById(pid);

  var indicators =  [];
  var toReturn = {};

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    apiDebug("getDashboard: connection created");

    // melhor query? select * from indicators, users_projects where indicators.pid_proj = users_projects.pid_proj and indicators.pid_proj = 1 and pointid_point IS NULL and uid_user = 1
    var q = "select * from indicators where pid_proj = "+pid+" and pointid_point IS NULL and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")"

    client.query(q, function(err, result) {
      if(err) {
        client.end();
        apiDebug("getDashboard: error on query "+q);
        return console.error('getDashboard error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      apiDebug("getDashboard: query ok, results length "+result.rows.length);

      result.rows.forEach(function(row){

        if(row.unit == "undefined")
          row.unit = "";
        if(row.value == "undefined")
          row.value = "?";
        indicators.push(row);
      })
      toReturn.indicators = indicators;


      // NUNOALEXX
      // var q2 = "select * from projects where pid = "+pid;
      var q2 = "select * from projects, organizations_projects, organizations where pid = pid_proj and oid_org = oid and pid = "+pid;
      apiDebug("getDashboard: second query "+q2);

      client.query(q2, function(err, result) {
        if(err) {
          res.json(toReturn);
          client.end();
          return console.error('getDashboard 2 get project error running query', err);
        }

        toReturn.project = result.rows[0];

        apiDebug("getDashboard: second query ok, results length "+result.rows.length);

    		if (typeof pointid !== 'undefined') {
    			qName = "select attributes from points where pointid = " + pointid;

          apiDebug("getDashboard: third query is "+qName);

    			client.query(qName, function(err,resultPoints) {
    				if (err) {
              apiDebug("getDashboard: ERROR on third query is "+qName);
    					res.json(toReturn);
    					client.end();
    					return console.error("getDashboard 3 get point name error running attributes query", err);
    				}
    				// this should be safe enough, assuming no one
    				// deletes anything in between...
    				toReturn.pattributes = resultPoints.rows[0];
            apiDebug("getDashboard: third query ok "+resultPoints.length);

    				res.json(toReturn);
    				client.end();
    			});
    		} else {
            apiDebug("getDashboard: no point was found but ok. ending!");

    				res.json(toReturn);
    				client.end();
    		}


      });


    });


  });

};




exports.getDataTypes = function(req, res){
  // // console.log('API call: getDataTypes');
  var pid = req.params.pid;
  var uid = req.session.passport.user;
  var project = findProjectById(pid);

  var datatypes =  [];
  var toReturn = {};

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // melhor query? select * from indicators, users_projects where indicators.pid_proj = users_projects.pid_proj and indicators.pid_proj = 1 and pointid_point IS NULL and uid_user = 1
    // var q = "select * from indicators where pid_proj = "+pid+" and pointid_point IS NULL and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")"
    var q = "SELECT * FROM datatypes WHERE pid_proj = "+pid+" OR pid_proj = -1";

    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('getDataTypes error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){

        if(row.unit == "undefined")
          row.unit = "";
        if(row.pid_proj == -1)
          row.global = 'yes';
        else
          row.global = 'no';
        datatypes.push(row);
      })
      toReturn.datatypes = datatypes;


      var q2 = "select * from projects, organizations_projects, organizations where pid = pid_proj and oid_org = oid and pid = "+pid;
      client.query(q2, function(err, result) {
        if(err) {
          res.json(toReturn);
          client.end();
          return console.error('getDataTypes get project error running query', err);
        }

        toReturn.project = result.rows[0];
        res.json(toReturn);
        client.end();
      });


    });
  });

};


exports.getIndicatorsMetaData = function(req, res){
  console.log("API call: getIndicatorsMetaData");
  var pid = req.params.pid;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "select distinct title, aggrmethod from indicators where pid_proj = "+pid;
    console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        res.json({});
        client.end();
        return console.error('getIndicatorsMetaData error running query', err);
      }

      res.json(result.rows);
      client.end();
    });
  });
}


exports.addDataType = function(req, res){
  console.log("API call: addDataType");

  var pid = req.params.pid;

  console.log(req.body);

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    if(req.body.global == 'yes')
      pid = -1;

    var q = "INSERT INTO datatypes(title, unit, alarm, pid_proj, min, max) VALUES ('"+req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', "+pid+", '"+req.body.min+"', '"+req.body.max+"') RETURNING dtid;";
    console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        console.log("ERROR");
        console.log(result.rows);

        res.writeHead(500, {'content-type': 'text/plain'});
        res.end(err.toString());
        client.end();
        return console.error('addDataType error running query', err);
      }



      // // console.log("Number of results: "+result.rows.length);
      console.log("OK "+Date.now());
      console.log(result.rows);
      console.log(result.rows[0]);
      console.log(result.rows[0].dtid);

      req.body.dtid = result.rows[0].dtid;
      res.json(req.body);
      client.end();

    });


  });
}


exports.editDataType = function(req, res){
  console.log("API call: editDataType");
  var dtid = req.params.dtid;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO indicators(title, unit, alarm, value, readings, pid_proj, min, max) VALUES ('"+req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', '"+req.body.value+"', '[]'::json, "+pid+", '"+req.body.min+"', '"+req.body.max+"') RETURNING iid;";
    var q = "UPDATE datatypes SET title='"+req.body.title+"', unit='"+req.body.unit+"', alarm='"+req.body.alarm+"', min='"+req.body.min+"', max='"+req.body.max+"' WHERE dtid = "+dtid+";";
    console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        res.writeHead(500, {'content-type': 'text/plain'});
        res.end(err.toString());
        client.end();
        return console.error('editDataType error running query', err);
      }


      res.json({});
      client.end();
    });
  });
}


exports.deleteDataType = function(req, res){
  console.log("API call: deleteDataType");
  var dtid = req.params.dtid;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "DELETE FROM datatypes WHERE dtid = "+dtid+" RETURNING dtid;";
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('deleteDataType error running query', err);
      }

        res.json(result.rows);
        client.end();
    });
  });
};




exports.getPointIndicators = function(req, res){
  console.log("API call: getPointIndicators");
  var pid = req.params.pid;
  var pointid = req.params.pointid;

  var indicators = [];

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = 'SELECT iid, title, unit, alarm, value, pid_proj, readings, pointid_point, min, max FROM indicators where pointid_point = '+pointid;
    client.query(q, function(err, result) {
      if(err) {
        res.json([]);
        client.end();
        return console.error('getPointIndicators error running query', err);
      }

      res.json(result.rows);
      client.end();

    });

  });



};


exports.getDashboardPoint = function(req, res){
  console.log('API call: getDashboardPoint');
  var pid = req.params.pid;
  var pointid = req.params.pointid;
  var uid = req.session.passport.user;
  // // console.log(pid + " " + pointid);

  var indicators = [];
  var toReturn = {};

  if(uid == undefined || uid == null || req.session.passport == {}){
    res.json({});
    return console.error("user still not logged in");
  }

  // DEPOIS É PARA FILTRAR NA QUERY POR POINTID TAMBEM!
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "SELECT * FROM indicators WHERE pid_proj = "+pid+" and pointid_point = "+pointid+" and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+");";
    // NA QUERY TB QUEREMOS EVITAR OS QUE TÊM POINTID!
    // // console.log(q);

    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('getDashboardPoint error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){
        if(row.unit == "undefined")
          row.unit = "";
        if(row.value == "undefined")
          row.value = "?";
        // // console.log(row);
        indicators.push(row); 

      })
      // result.project = project;
      toReturn.indicators = indicators;

      var q2 = "select * from projects, organizations_projects, organizations where pid = pid_proj and oid_org = oid and pid = "+pid;
      client.query(q2, function(err2, result2) {
        if(err2) {
          res.json(toReturn);
          client.end();
          return console.error('getDashboardPoint 2 get project error running query', err2);
        }

        toReturn.project = result2.rows[0];
    		qName = "select attributes from points where pointid = " + pointid;
    		client.query(qName, function(err,resultPoints) {
    			if (err) {
    				res.json(toReturn);
    				client.end();
    				return console.error("getDashboardPoint 3 get point name error running query", err);
    			}
    			// this should be safe enough, assuming no one
    			// deletes anything in between...
    			toReturn.pattributes = resultPoints.rows[0];


          // var q3 = "WITH "+
          //   "perc AS ( select pointid_point, title, cast(percent->>'value' as decimal)/100 as p_vl, percent->>'timestamp' as dayy , percent->>'hour' as houry from indicators,  "+
          //   "json_array_elements(readings) as percent where title='Net Margin' and pid_proj = "+pid+" and pointid_point = "+pointid+" and to_date(percent->>'timestamp', 'YYYY MM DD') =  "+
          //   "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')from indicators, json_array_elements(indicators.readings) as pairs where pid_proj = "+pid+") "+
          //   "ORDER BY pointid_point ),  "+

          //   "sales AS ( select pointid_point, title, cast(sales->>'value' as decimal) as sales_vl, sales->>'timestamp' as dayy , sales->>'hour' as houry  "+
          //   "from indicators, json_array_elements(readings) as sales where title='Net Sales' and pid_proj = "+pid+" and pointid_point = "+pointid+" and to_date(sales->>'timestamp', 'YYYY MM DD') =  "+
          //   "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')from indicators, json_array_elements(indicators.readings) as pairs where pid_proj = "+pid+")ORDER BY pointid_point ),  "+

          //   "pln AS ( select perc.pointid_point, perc.houry, perc.p_vl*sales.sales_vl as pln_vl from perc, sales where perc.pointid_point = sales.pointid_point   "+
          //   "and ( perc.houry is null or perc.houry = sales.houry ) GROUP BY perc.pointid_point, sales.pointid_point, perc.p_vl, sales.sales_vl, perc.houry),  "+

          //   "sum_pln AS ( select sum(pln.pln_vl) as pln_total from pln ),  "+
          //   "revenue_daily AS ( select pln.pln_vl/perc.p_vl as revenue, perc.dayy from perc, pln where perc.pointid_point = pln.pointid_point and ( perc.houry is null or perc.houry = pln.houry ) ),  "+
          //   "sum_revenue AS ( select sum(revenue) as rev_total from revenue_daily), "+

          //   "customers AS ( select pointid_point, title, cast(cust->>'value' as decimal) as cust_vl, cust->>'timestamp' as dayy , cust->>'hour' as houry from indicators,  "+
          //   "json_array_elements(readings) as cust where title = 'Number of Customers' and pid_proj = "+pid+" and pointid_point = "+pointid+" and to_date(cust->>'timestamp', 'YYYY MM DD') =  "+
          //   "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')from indicators, json_array_elements(indicators.readings) as pairs where pid_proj = "+pid+")), "+

          //   "sum_customers AS ( select sum(customers.cust_vl) as customers_total from customers), "+


          //   "multi AS ( select pointid_point, title, cast(bills->>'value' as decimal)/100 as bills_vl, bills->>'timestamp' as dayy , bills->>'hour' as houry from indicators,  "+
          //   "json_array_elements(readings) as bills where title = 'Multiline Bills' and pid_proj = "+pid+" and pointid_point = "+pointid+" and to_date(bills->>'timestamp', 'YYYY MM DD') =  "+
          //   "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')from indicators, json_array_elements(indicators.readings) as pairs where pid_proj = "+pid+")), "+

          //   "bills_daily AS ( select multi.pointid_point, multi.bills_vl*customers.cust_vl as bills, multi.dayy , multi.houry from multi, customers  "+
          //   "where multi.pointid_point = customers.pointid_point and ( multi.houry is null or multi.houry = customers.houry )),  "+


          //   "sum_bills AS ( select sum(bills) as bills_total from bills_daily ) "+

          //   "select (a.pln_total/b.rev_total)*100 as net_margin, (d.bills_total/c.customers_total)*100 as multiline_bills, "+
          //   " b.rev_total as net_sales, c.customers_total as number_of_customers, b.rev_total/c.customers_total as basket "+
          //   " from sum_revenue as b , sum_pln as a, sum_customers as c, sum_bills as d";



            var q3 = "with maxdate as (select title, max(to_date(c->>'timestamp', 'YYYY-MM-DD')) as max from indicators, json_array_elements(readings) as c "+
              " WHERE  pid_proj = "+pid+" and pointid_point in ("+pointid+") group by title ) "+
              "select  "+

              "SUM(querya.values) as number_of_customers, "+
              "SUM(queryb.values) as net_sales, "+
              "SUM(queryb.values) / SUM(querya.values)  as basket, "+
              "SUM(queryc.values / 100 * queryb.values) / SUM(queryb.values)  *100 as net_margin, "+
              "SUM(queryd.values / 100 * querya.values) / SUM(querya.values)  *100 as multiline_bills "+

              "from "+
              "( "+
              "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date FROM indicators, json_array_elements(readings) AS c WHERE title='Number of Customers' and pid_proj = "+pid+" and pointid_point in ("+pointid+") and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate where title = 'Number of Customers') and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate where title = 'Number of Customers')  order by (c->>'hour')::numeric "+
              " ) as querya "+

              "left outer join "+
              "( "+
              "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date FROM indicators, json_array_elements(readings) AS c WHERE title='Net Sales' and pid_proj = "+pid+" and pointid_point in ("+pointid+") and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate where title = 'Net Sales') and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate where title = 'Net Sales')  order by (c->>'hour')::numeric "+ 
              " ) as queryb "+
              "on ( (querya.hour is null or querya.hour = queryb.hour) and querya.date = queryb.date and querya.pointid_point = queryb.pointid_point) "+

              " left outer join "+
              "( "+
              "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date FROM indicators, json_array_elements(readings) AS c WHERE title='Net Margin' and pid_proj = "+pid+" and pointid_point in ("+pointid+") and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate where title = 'Net Margin') and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate where title = 'Net Margin')  order by (c->>'hour')::numeric "+
              " ) as queryc "+
              "on ( (queryb.hour is null or queryb.hour = queryc.hour) and queryb.date = queryc.date and queryb.pointid_point = queryc.pointid_point) "+

              " left outer join "+
              " ( "+
              "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date FROM indicators, json_array_elements(readings) AS c WHERE title='Multiline Bills' and pid_proj = "+pid+" and pointid_point in ("+pointid+") and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate where title = 'Multiline Bills') and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate where title = 'Multiline Bills')  order by (c->>'hour')::numeric "+
              " ) as queryd "+
              "on ( (querya.hour is null or querya.hour = queryd.hour) and querya.date = queryd.date and querya.pointid_point = queryd.pointid_point) ";



             apiDebug(q3);



             client.query(q3, function(err3,result3) {
              if (err3) {
                res.json(toReturn);
                client.end();
                return console.error("getDashboardPoint 3 get point name error running query", err3);
              }

              apiDebug(result3.rows);

              var translateIndicatorTitle = function(title){
                switch(title){
                  case "Basket":
                    return "basket";
                    break;
                  case "Number of Customers":
                    return "number_of_customers";
                    break;
                  case "Multiline Bills":
                    return "multiline_bills";
                    break;
                  case "Net Sales":
                    return "net_sales";
                    break;
                  case "Net Margin":
                    return "net_margin";
                    break;
                  default:
                    return null;
                }
              }

              
              if(result3.rows.length > 0){
                for(var i=0; i<toReturn.indicators.length; i++){
                  var auxIndic = toReturn.indicators[i];
                  if(translateIndicatorTitle(auxIndic.title) != null){
                    toReturn.indicators[i].value = result3.rows[0][translateIndicatorTitle(auxIndic.title)];
                  }
                }
              }

              var honIndex = -1;
              for(var i=0; i<toReturn.indicators.length; i++){
                var auxIndic = toReturn.indicators[i];
                if(auxIndic.title == 'NPS INDEX (HoN)'){
                  honIndex = i;
                }
              }
              if(honIndex >= 0){
                // it has searched and found the kpi
                var q4 = "Drop table if exists HoNTable; "
                  +"Drop table if exists HorNTable; "
                  +"Drop table if exists NPSvals; "
                  +"Drop table if exists NegVals; "
                  +"Drop table if exists VPvals; "
                  +"Drop table if exists Replies; "
                    
                  +"SELECT json_array_elements(readings) as dados "
                  +"INTO HoNTable "
                  +"FROM indicators "
                  +"WHERE title = 'NPS INDEX (HoN)' and pid_proj = "+pid+" and pointid_point = "+pointid+";"

                  +"Select dados->>'category' as Category, cast(dados->>'value' as int) as Values, dados->>'timestamp' as Dates "
                  +"into HorNTable "
                  +"from HoNTable; "

                  +"SELECT dates as datesNeg, sum(values)::float as AllNegValues "
                  +"into NegVals "
                  +"from HorNTable "
                  +"where category LIKE '%Negative%' "
                  +"group by dates  "
                  +"order by dates DESC; "

                  +"SELECT dates as datesTot, sum(values)::float as AllReplies "
                  +"into Replies "
                  +"from HorNTable "
                  +"group by dates "
                  +"order by dates DESC; "

                  +"SELECT dates, sum(values)::float as VPValues "
                  +"into VPvals "
                  +"from HorNTable "
                  +"where category = 'Very Positive' " 
                  +"group by dates "
                  +"order by dates DESC; "

                  +" select dates, ((vpvalues-allnegvalues)/AllReplies)*100 as NPS from VPvals, NegVals, Replies "
                  +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) "
                  +"and AllReplies > 0 "
                  +"union "

                  +"select dates, allreplies as NPS from VPvals, NegVals, Replies "
                  +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) "
                  +"and AllReplies = 0  "
                  +"order by dates DESC; "

                  +"Drop table if exists HoNTable; "
                  +"Drop table if exists HorNTable; "
                  +"Drop table if exists NPSvals; "
                  +"Drop table if exists NegVals; "
                  +"Drop table if exists VPvals; "
                  +"Drop table if exists Replies; ";

                  apiDebug(q4)

                  client.query(q4, function(err4, res4) {
                    if(err4) {
                      client.end();
                      return console.error('getDashboardPoint 4: error running query', err4);
                    } else {
                        if(res4.rows.length == 0 || res4.rows[0] == []){
                          res.json(toReturn);
                          client.end();
                          
                        } else {
                          toReturn.indicators[honIndex].value = res4.rows[0].nps;
                          res.json(toReturn);
                          client.end();
                          
                        } 

                    }
                      
                  
                  });

              } else {
                // it has searched and didnt found the kpi
                res.json(toReturn);
                client.end();
              }

        			


            });



    		});

      });

    });
  });
};


exports.getIndicator = function(req, res){
  console.log('API call: getIndicator');
  var pid = req.params.pid;
  var iid = req.params.iid;
  var uid = req.session.passport.user;
  var result = {};

  var indicator = [];
  var parameters = [];

  if(uid == undefined || uid == null){
    res.json({"error":"not authenticated!"});
  } else {
    var client = new pg.Client(conString);
    client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }
      var q = "select * from indicators where iid = "+iid+" and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")";
      client.query(q, function(err, res1) {
        if(err) {
          client.end();
          return console.error('getIndicator 1: error running query', err);
        }
        // // console.log("Number of results getIndicator1: "+res1.rows.length);
        res1.rows.forEach(function(row){
          if(row.unit == "undefined")
            row.unit = "";
          if(row.value == "undefined")
            row.value = "?";
          // // console.log(row);
          result.indicator = row;

          var q2 = "select parameters.parmid, parameters.title, parameters.value, parameters.unit, parameters.alarm, parameters.objective, parameters.min, parameters.max, parameters.readings, parameters.iid_ind from parameters, indicators where parameters.iid_ind=indicators.iid and iid_ind = "+iid+" and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")";
          // // console.log("QUERY 2 IS: "+q2);
          client.query(q2, function(err, res2) {
            if(err) {
              client.end();
              return console.error('getIndicator 2: error running query', err);
            }
            res2.rows.forEach(function(row){
              if(row.unit == "undefined")
                row.unit = "";
              if(row.value == "undefined")
                row.value = "?";
              // // console.log(row);
              parameters.push(row);
            });
            result.parameters = parameters;


            var q3 = "select * from projects, organizations_projects, organizations where pid = pid_proj and oid_org = oid and pid = "+pid;
            client.query(q3, function(err, res3) {
              if(err) {
                res.json(result);
                client.end();
                return console.error('getIndicator 2 get project error running query', err);
              }

              result.project = res3.rows[0];
              res.json(result);
              client.end();
            });

          });
        })
      });
    });
  }
};

exports.getPointIndicator = function(req, res){
  // // console.log('API call: getPointIndicator');
  var pid = req.params.pid;
  var iid = req.params.pointiid;
  var pointid = req.params.pointid;
  var uid = req.session.passport.user;
  var result = {};


  var indicator = [];
  var parameters = [];

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "select * from indicators where iid = "+iid+" and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")";
    client.query(q, function(err, res1) {
      if(err) {
        client.end();
        return console.error('getPointIndicator error running query', err);
      }
      // // console.log("Number of results getIndicator1: "+res1.rows.length);
      res1.rows.forEach(function(row){
        if(row.unit == "undefined")
          row.unit = "";
        if(row.value == "undefined")
          row.value = "?";
        // // console.log(row);
        result.indicator = row;

        var q2 = "select parameters.parmid, parameters.title, parameters.value, parameters.unit, parameters.alarm, parameters.objective, parameters.min, parameters.max, parameters.readings, parameters.iid_ind from parameters, indicators where parameters.iid_ind=indicators.iid and iid_ind = "+iid+" and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")";
        // // console.log("QUERY 2 IS: "+q2);
        client.query(q2, function(err, res2) {
          if(err) {
            client.end();
            return console.error('getPointIndicator 2 eror on query', err);
          }
          res2.rows.forEach(function(row){
            if(row.unit == "undefined")
              row.unit = "";
            if(row.value == "undefined")
              row.value = "?";
            parameters.push(row);
          });
          result.parameters = parameters;

		  // ATTN: JC - was projects... and was not used
          var q3 = "select attributes from points where pointid = "+ pointid;
          client.query(q3, function(err, res3) {
            if(err) {
              res.json(result);
              client.end();
              return console.error('getPointIndicator 3 get project error running query', err);
            }

            result.pointname = res3.rows[0];

            var q4 = "select * from projects, organizations_projects, organizations where pid = pid_proj and oid_org = oid and pid = "+pid;
            client.query(q4, function(err4, res4) {
              if(err4) {
                res.json(result);
                client.end();
                return console.error('getPointIndicator 4 get project error running query', err4);
              }
              result.project = res4.rows[0];
              
              res.json(result);
              client.end();

            });
          });

        });
      })
    });
  });
};

exports.addIndicator = function(req, res){
  console.log('API call: addIndicator');

  var pid = req.params.pid;

  var indicatorsResult = findDashboardIndicatorsById(pid);

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "INSERT INTO indicators(title, unit, alarm, value, readings, pid_proj, min, max) VALUES ('"+req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', '"+req.body.value+"', '[]'::json, "+pid+", '"+req.body.min+"', '"+req.body.max+"') RETURNING iid;";
    console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        res.writeHead(500, {'content-type': 'text/plain'});
        res.end(err.toString());
        client.end();
        return console.error('addIndicator error running query', err);
      }



      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){
        // // console.log(row);
        req.body.iid = row.iid;
        indicators.push( {"iid":req.body.iid, "parameters":[]} );
        res.json(row.iid);
      })
      client.end();
    });
  });
};

exports.updateIndicator = function(req, res){
  console.log('API call: updateIndicator');

  var pid = req.params.pid;
  var iid = req.params.iid;

  var indicatorsResult = findDashboardIndicatorsById(pid);

  console.log(req.body.occ);
  if(!req.body.hasOwnProperty('occ'))
    req.body.occ = -1;
  else
    req.body.occ = req.body.occ.occtyp_id;
  console.log(req.body.occ);

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO indicators(title, unit, alarm, value, readings, pid_proj, min, max) VALUES ('"+req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', '"+req.body.value+"', '[]'::json, "+pid+", '"+req.body.min+"', '"+req.body.max+"') RETURNING iid;";
    var q = "UPDATE indicators SET title='"+req.body.title+"', unit='"+req.body.unit+"', alarm='"+req.body.alarm+"', value='"+req.body.value+"', min='"+req.body.min+"', max='"+req.body.max+"', aggrmethod='"+req.body.aggrmethod+"', occtypeid_typ='"+req.body.occ+"' WHERE iid = "+iid+";";
    // console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        res.writeHead(500, {'content-type': 'text/plain'});
        res.end(err.toString());
        client.end();
        return console.error('updateIndicator error running query', err);
      }


      res.json({});
      client.end();
    });
  });
};




exports.deleteIndicator = function(req, res){
  // // console.log('API call: deleteIndicator');
  var pid = req.params.pid;
  var iid = req.params.iid;

  var project = findProjectById(pid);

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "DELETE FROM indicators WHERE iid = "+iid+" RETURNING iid;";
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('deleteIndicator error running query', err);
      }

      var q2 = "SELECT * FROM indicators WHERE pid_proj = "+pid+" and pointid_point IS NULL;";
      client.query(q2, function(err, result2) {
        res.json(result2.rows);
        client.end();
      });
    });
  });

  // res.json({});
};


exports.deletePointIndicator = function(req, res){
  // // console.log('API call: deletePointIndicator');
  var pid = req.params.pid;
  var iid = req.params.iid;
  var pointid = req.params.pointid;

  var uid = req.session.passport.user;

  var project = findProjectById(pid);

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO projects(title, area, location) VALUES ('"+req.body.title+"', '"+req.body.area+"', '"+req.body.location+"') RETURNING pid;";
    var q = "DELETE FROM indicators WHERE iid = "+iid+" RETURNING title;";
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('deletePointIndicator error running query', err);
      }
      var deletedTitle = result.rows[0].title;
      console.log("deletedTitle");
      console.log(deletedTitle);
      // // console.log("Number of results: "+result.rows.length);
      var q2 = "SELECT * FROM indicators WHERE pid_proj = "+pid+" and pointid_point = "+pointid+" and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+");";
      client.query(q2, function(err2, result2) {
        if(err2) {
          client.end();
          return console.error('deletePointIndicator 2 error running query', err2);
        }

        // we also need to check if the deleted indicator is the last for this project
        if(deletedTitle != undefined){
          // stupid test but states that an indicator was deleted, but undefined shouldnt happen though...
          var q3 = "SELECT count(*) FROM indicators WHERE pid_proj = "+pid+" and title = '"+deletedTitle+"' and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+");";

          client.query(q3, function(err3, res3){
            if(err3) {
              client.end();
              return console.error('deletePointIndicator 3 error running query', err3);
            }

            // if res3.rows[0].count is 0, it means that this project has no more indicators with the title of the deleted indicator
            // and the correspondent widget must be deleted
            if(res3.rows[0].count == 0){

              var q4 = "delete from widgets where pid_proj = "+pid+" and title = '"+deletedTitle+"'";
              client.query(q4, function(err4, res4){
                if(err4) {
                  client.end();
                  return console.error('deletePointIndicator 4 error running query', err4);
                }

                console.log("Deleted widget. Query: "+q4);
                client.end();

              });

            } else {
              client.end();
            }

          });

        } else {
          client.end();
        }

        res.json(result2.rows);
      });
    });
  });
};


exports.addPointIndicator = function(req, res){
  console.log('API call: addPointIndicator');

  var pid = req.params.pid;
  var pointid = req.params.pointid;

  var indicatorsResult = findPointIndicatorsById(pid, pointid);

  console.log(req.body);

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error(' could not connect to postgres', err);
    }
    var q = "INSERT INTO indicators(title, unit, alarm, value, readings, pid_proj, pointid_point, min, max) VALUES ('"
          +req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', '"+req.body.value+"', '[]'::json, "+pid+", "+pointid+", '"+req.body.min+"', '"+req.body.max+"') RETURNING iid;";
    console.log(q);
    // // console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addPointIndicator error running query', err);
      }


      var source_of_data = 'LOCAL_TABLE.indicators.'+req.body.title;
      // var q2 = "INSERT INTO widgets(title, datasource, pid_proj) SELECT '"+req.body.title+"', '"+source_of_data+"', "+pid+" WHERE NOT EXISTS (SELECT title FROM widgets WHERE title = '"+req.body.title+"');";
      var q2 = "INSERT INTO widgets(title, datasource, pid_proj) SELECT '"+req.body.title+"', '"+source_of_data+"', "+pid+" WHERE NOT EXISTS (SELECT title, pid_proj FROM widgets WHERE title = '"+req.body.title+"' AND pid_proj = '"+pid+"');";

      console.log("Q2: "+q2);
      client.query(q2, function(err, resultq2) {
        if(err) {
            client.end();
          }
        console.log("added auto widget "+req.body.title+". Rows added: ");
        // console.log(resultq2);
        client.end();
      });


      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){
        // // console.log(row);
        req.body.iid = row.iid;
        pointIndicators.push({"pointiid":req.body.iid, "parameters":[] });

        if(req.body.hasOwnProperty('id') ){
          // this is an indicator that was sourced from another indicator - so we need to also add the parameters of that indicator, identified by id

          var q = "SELECT * FROM parameters WHERE iid_ind = "+req.body.id;
          client.query(q, function(err, result2) {
            if(err) {
              client.end();
              return console.error('addPointIndicator2 error running query', err);
            }
            // console.log("showing parameters of iid "+req.body.id);
            if(result2.rows.length > 0){
              var insertQuerySuffix = "INSERT INTO parameters(title, unit, alarm, objective, min, max, readings, iid_ind) VALUES ";
              for(var i = 0; i < result2.rows.length; i++){
                var parm = result2.rows[i];
                // console.log(parm);
                insertQuerySuffix += "('"+parm.title+"', '"+parm.unit+"', '"+parm.alarm+"', '"+parm.objective+"', '"+parm.min+"', '"+parm.max+"', '[]'::json, "+req.body.iid+")";
                if(i < result2.rows.length-1)
                  insertQuerySuffix += ",";
              }
              insertQuerySuffix += ";";
              // console.log(insertQuerySuffix);

              client.query(insertQuerySuffix, function(err, result2) {
                if(err) {
                  client.end();
                  return console.error('addPointIndicator3 error running query', err);
                }
                // console.log("AUTO ADD of PARMS");
                client.end();
              });
            } else {
              // console.log("no AUTO add of PARMS");
              client.end();
            }


          });


        } else {

          client.end();
        }
        res.json(row.iid);
      })

    });
  });
};



function accumValueFromDate(readings, date, unit){
  var aux = 0;

  // console.log("accumValueFromDate: "+unit);

  for(var i=0; i<readings.length; i++){
    if(readings[i].timestamp == date){
        aux += +readings[i].value;
    }
  }
  return aux;
}

function accumValueFromDateOpt(readings, date, aggrmethod){
  var aux = 0;
  var ctr = 0;

  // console.log("accumValueFromDate: "+unit);

  for(var i=0; i<readings.length; i++){
    if(readings[i].timestamp == date){

        // GM-2#5
        if(aggrmethod == 'average'){
          ctr++;
          aux = aux*(ctr-1)/ctr + +readings[i].value/ctr;
        } else {
          aux += +readings[i].value;
        }



    }
  }

  // GM-2#5
  if(aggrmethod == 'average'){
    console.log("aux: "+aux+" ; ctr: "+ctr);
    return aux;
  } else {
    return aux;
  }
}


function accumValueFromDateOptOLD(readings, date, unit){
  var aux = 0;
  var ctr = 0;

  // console.log("accumValueFromDate: "+unit);

  for(var i=0; i<readings.length; i++){
    if(readings[i].timestamp == date){
        aux += +readings[i].value;
        ctr++;
    }
  }
  if(unit == '%'){
    console.log("aux: "+aux+" ; ctr: "+ctr);
    return aux/ctr;
  } else {
    return aux;
  }
}




exports.addPointIndicatorAndReadings = function(req, res){
  console.log('API call: addPointIndicatorAndReadings');

  var pid = req.params.pid;
  var pointid = req.params.pointid;

  // console.log(req.body.form);
  var addedReadings = req.body.form.readings.length;

  // req.body.form.readings;
  var readings = [];
  var newReadings = req.body.form.readings;
  var lastValue;
  for(var i = 0; i < newReadings.length; i++){
    var aux = newReadings[i].split("\t");
    aux[1] = aux[1].replace(',', '.');
    var str = aux[0].replace(/\//g, '-');
    var processedDate = "";
    if(str.indexOf('-') == 4){
      // year is coming first
      processedDate = str.substr(0,4) + '-' + str.substr(5,2) + '-' + str.substr(8,2);
    } else {
      // year is coming last...
      processedDate = str.substr(6,4) + '-' + str.substr(3,2) + '-' + str.substr(0,2);
    }
    // var auxObj = {"value":aux[1], "timestamp": (processedDate+' 00:00:00:000000') };
    // var auxObj = {"value":aux[1], "timestamp": (processedDate+' 00:00:00:000000'), "category": aux[2] };
    // var auxObj = {"value":aux[1], "timestamp": addTimeToDate(processedDate), "category": aux[2], "product": aux[3], "promoter": aux[4] };
    var auxObj = {"value":aux[1], "timestamp": addTimeToDate(processedDate)};
    processAndAddLevels(auxObj, 2, aux, req.body.levels);
    // console.log(auxObj);

    //readings.push(auxObj);
    orderedPush(readings, auxObj);

    if(i == newReadings.length-1){
      lastValueDate = readings[readings.length-1].timestamp;

      var lastValueNumber = accumValueFromDateOpt(readings, lastValueDate, req.body.form.aggrmethod);
      // console.log('lastValue for '+req.body.form.title);
      // console.log(lastValueNumber);

      // lastValue = accumValueFromDate(readings, lastValueDate);

      // console.log(lastValue);

      // this precision is fixed, but should be adapted to the value...
      // eg. if lastValueNumber = 0.0003123234 the toFixed should be 6
      lastValueNumber = lastValueNumber.toFixed(3);

      // lastValue must be a string with no more than 12 chars
      lastValue = lastValueNumber.toString();
      lastValue = lastValue.replace('.000', '');
      lastValue = lastValue.substring(0, 12);

      // console.log('lastValue string for '+req.body.form.title);
      // console.log(lastValue);
    }
  }

  // console.log('readings');
  // console.log(readings);


  // console.log("req.body");
  // console.log(req.body);

  // return;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error(' could not connect to postgres', err);
    }
    var q = "INSERT INTO indicators(title, unit, alarm, value, readings, pid_proj, pointid_point, min, max, aggrmethod) VALUES ('"
		+req.body.form.title+"', '"+req.body.form.unit+"', '"+req.body.form.alarm+"', '"+lastValue+"', '"+JSON.stringify(readings)+"'::json, "+pid+", "+pointid+", '"+req.body.form.min+"', '"+req.body.form.max+"', '"+req.body.form.aggrmethod+"') RETURNING iid;";
    // // console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addPointIndicatorAndReadings error running query', err);
      }


      var source_of_data = 'LOCAL_TABLE.indicators.'+req.body.form.title;
      // var q2 = "INSERT INTO widgets(title, datasource, pid_proj) SELECT '"+req.body.form.title+"', '"+source_of_data+"', "+pid+" WHERE NOT EXISTS (SELECT title FROM widgets WHERE title = '"+req.body.form.title+"');";
      var q2 = "INSERT INTO widgets(title, datasource, pid_proj) SELECT '"+req.body.form.title+"', '"+source_of_data+"', "+pid+" WHERE NOT EXISTS (SELECT title, pid_proj FROM widgets WHERE title = '"+req.body.form.title+"' AND pid_proj = '"+pid+"') RETURNING wid;";

      // console.log("Q2: "+q2);
      client.query(q2, function(err, resultq2) {
        if(err) {
            client.end();
          }
        console.log("added auto widget "+req.body.form.title+". Rows added: ");
        // console.log(resultq2);
        client.end();
      });

      res.json({"iid":result.rows[0].iid, "addedReadings":addedReadings, "indicator":req.body.form});
      client.end();
    });
  });
};



exports.getParameter = function(req, res){
  console.log('API call: getParameter');
  var iid = req.params.iid;
  var parmid = req.params.parmid;
  var uid = req.session.passport.user;
  var result = {};

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "SELECT * FROM parameters WHERE parmid = "+parmid+";";
    var q = "select parameters.parmid, parameters.title, parameters.value, parameters.unit, parameters.alarm, parameters.objective, parameters.min, parameters.max, parameters.readings, parameters.iid_ind from parameters, indicators where parameters.iid_ind=indicators.iid and parmid="+parmid+" and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")"
    client.query(q, function(err, res1) {
      if(err) {
        client.end();
        return console.error('getParameter error running query', err);
      }
      console.log("Number of results for getParameter: "+res1.rows.length);
      res1.rows.forEach(function(row){
        if(row.unit == "undefined")
          row.unit = "";
        if(row.value == "undefined")
          row.value = "?";
        result = row;
      })

      res.json(result);
      client.end();
    });
  });
};



exports.updateParameter = function(req, res){
  console.log('API call: updateParameter');

  var pid = req.params.pid;
  var iid = req.params.iid;
  var parmid = req.params.parmid;


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO indicators(title, unit, alarm, value, readings, pid_proj, min, max) VALUES ('"+req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', '"+req.body.value+"', '[]'::json, "+pid+", '"+req.body.min+"', '"+req.body.max+"') RETURNING iid;";
    var q = "UPDATE parameters SET title='"+req.body.title+"', unit='"+req.body.unit+"', alarm='"+req.body.alarm+"', value='"+req.body.value+"', min='"+req.body.min+"', max='"+req.body.max+"', objective='"+req.body.objective+"' WHERE parmid = "+parmid+";";
    // console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        res.writeHead(500, {'content-type': 'text/plain'});
        res.end(err.toString());
        client.end();
        return console.error('updateParameter error running query', err);
      }


      res.json({});
      client.end();
    });
  });
};



exports.deleteParameter = function(req, res){
  // // console.log('API call: deleteParameter');


  var iid = req.params.iid;
  var parmid = req.params.parmid;


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "DELETE FROM parameters WHERE parmid = "+parmid+" RETURNING parmid;";

    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('deleteParameter error running query', err);
      }

      var q2 = "SELECT * FROM parameters WHERE iid_ind = "+iid+";";
      client.query(q2, function(err, result2) {
        if(err) {
          client.end();
          return console.error('error running query', err);
        }
        res.json(result2.rows);
        client.end();
      });
    });
  });
}




exports.getParameterPoint = function(req, res){
  // // console.log('API call: getParameterPoint');
  var iid = req.params.pointiid;
  var parmid = req.params.pointparmid;
  var uid = req.session.passport.user;
  var result = {};



  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "select parameters.parmid, parameters.title, parameters.value, parameters.unit, parameters.alarm, parameters.objective, parameters.min, parameters.max, parameters.readings, parameters.iid_ind from parameters, indicators where parameters.iid_ind=indicators.iid and parmid="+parmid+" and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")";
    client.query(q, function(err, res1) {
      if(err) {
        client.end();
        return console.error('getParameterPoint error running query', err);
      }
      res1.rows.forEach(function(row){
        if(row.unit == "undefined")
          row.unit = "";
        if(row.value == "undefined")
          row.value = "?";
        result = row;
      })
      res.json(result);
      client.end();
    });
  });
};


exports.addParameter = function(req, res){
  // console.log('API call: addParameter');
  var result = {};
  var pid = req.params.pid;
  var iid = req.params.iid;

  var parameters = findIndicatorParametersByIId(iid);

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "INSERT INTO parameters(title, unit, alarm, value, objective, min, max, readings, iid_ind) VALUES ('"+req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', '"+req.body.value+"', '"+req.body.objective+"', '"+req.body.min+"', '"+req.body.max+"', '[]'::json, "+iid+") RETURNING parmid;";
    client.query(q, function(err, result) {
      if(err) {
        res.writeHead(500, {'content-type': 'text/plain'});
        res.end(err.toString());
        client.end();
        return console.error('addParameter error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){
        req.body.parmid = row.parmid;
        parameters.push(req.body);
        res.json(parameters);
      })
      client.end();
    });
  });


  // // // console.log("Dashboards");
  // // // console.log(dashboards);
  // // // console.log("Indicators");
  // // // console.log(indicators);

  // res.json(parameters);
};

exports.addParameterPoint = function(req, res){
  // // console.log('API call: addParameterPoint');
  var result = {};
  var pid = req.params.pid;
  var iid = req.params.pointiid;
  var pointid = req.params.pointid;
  // // console.log("pid: "+pid+" iid: "+iid+" pointid: "+pointid);
  // // // console.log(req.body);

  // req.body.pointparmid = nextPointParmId;
  // req.body.readings = [];
  // nextPointParmId++;

  var parameters = findIndicatorParametersByPointIId(iid);


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "INSERT INTO parameters(title, unit, alarm, value, objective, min, max, readings, iid_ind) VALUES ('"+req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', '"+req.body.value+"', '"+req.body.objective+"', '"+req.body.min+"', '"+req.body.max+"', '[]'::json, "+iid+") RETURNING parmid;";
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addParameterPoint error running query', err);
      }
      // // console.log("Number of results addParameterPoint: "+result.rows.length);
      result.rows.forEach(function(row){
        // // console.log(row);
        req.body.parmid = row.parmid;
        parameters.push(req.body);
        res.json(parameters);
        // projects.push({"id":row.pid, "title":row.title, "location":"m", "area":row.area});
      })
      // res.json(projects);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });





  // // // console.log("Pushing parm into parms");
  // // // console.log(parameters);
  // parameters.push(req.body);

  // res.json(parameters);
};


exports.geoapi = function(req, res){
  console.log('API call: geoapi');
  var pid = req.params.pid;
  var uid = req.session.passport.user;
  // // // console.log(pid);
  // var loc = getLocationsByPId(pid);
  var loc = [];

  // console.log("pid "+pid+ " / uid "+ uid);
  if(pid == undefined || uid == undefined){
    res.json({});
    return;
  }

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT * FROM points WHERE pid_proj = '+pid+' and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = '+uid+');', function(err, result) {
      if(err) {
        client.end();
        return console.error('geoapi error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){
        // // console.log(row);

        if(row.geometry != undefined && row.geometry != null){
          row.geometry.properties.pointid = row.pointid;
        }

        if(row.attributes != undefined && row.attributes != null &&
           row.geometry != undefined && row.geometry != null){
          if(row.attributes.StoreCodeAbbrv != undefined && row.attributes.StoreCodeAbbrv != null){
            row.geometry.properties.StoreCodeAbbrv = row.attributes.StoreCodeAbbrv;
          }
        }

        loc.push(row);
      })
      // // console.log("loc");
      // // console.log(loc);
      res.json(loc);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });

  // // // console.log("loc");
  // // // console.log(loc);
  // res.json(loc);
};


// exports.geoapi = function(req, res){
//   // // console.log('API call: geoapi');
//   var pid = req.params.pid;
//   var uid = req.session.passport.user;
//   // // // console.log(pid);
//   // var loc = getLocationsByPId(pid);
//   var loc = [];

//   var client = new pg.Client(conString);
//   client.connect(function(err) {
//     if(err) {
//       return console.error('could not connect to postgres', err);
//     }
//     client.query( 'SELECT points.*, indicators.value, indicators.readings, indicators.min, indicators.max, indicators.alarm '
//                 + 'FROM  points, indicators '
//                 + 'WHERE points.pid_proj = ' + pid
//                 + '  AND indicators.pid_proj = ' + pid
//                 + '  AND indicators.pointid_point = points.pointid '
//                 + '  AND points.pid_proj IN (select pid_proj FROM organizations_projects, users '
//                                                 + '   WHERE organizations_projects.oid_org = users.oid_org '
//                                                 + '     AND users.uid = '+uid+');'

//                 , function(err, result) {
//       if(err) {
//         client.end();
//         return console.error('geoapi error running query', err);
//       }
//       // // console.log("Number of results: "+result.rows.length);
//       toRet = {};
//       result.rows.forEach(function(row){
//         // // console.log(row);
//         var alerts = calcAlerts(row,function(ind) {});
//         var alarm = hasAlarm(row);
//         row.alerts = alarm ? alerts : undefined;
//         if (typeof (toRet[row.pointid]) == "undefined") {
//           toRet[row.pointid] = row;
//         } else {
//           toRet[row.pointid] = typeof (row.alerts) != "undefined" && row.alerts > 0
//                              ? row
//                              : toRet[row.pointid];
//         };
//       });
//       /* TODO: use lodash ! */
//       var loc = Object.keys(toRet).map(function (key) {return toRet[key]});
//       console.log("loc");
//       console.log(loc.length);
//       res.json(loc);
//       // // // console.log(result.rows[0].theTime);
//       //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
//       client.end();
//     });
//   });

//   // // // console.log("loc");
//   // // // console.log(loc);
//   // res.json(loc);
// };


exports.geoapiPoint = function(req, res){
  // // console.log('API call: geoapiPoint');
  var pid = req.params.pid;
  var pointid = req.params.pointid;
  var uid = req.session.passport.user;
  // // // console.log(pid);

  var loc = [];

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // client.query('SELECT * FROM points WHERE pid_proj = '+pid+' and pointid = '+pointid, function(err, result) {
    client.query('SELECT * FROM points WHERE pid_proj = '+pid+' and pointid = '+pointid+'and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = '+uid+')', function(err, result) {
      if(err) {
        client.end();
        return console.error('geoapiPoint error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){
        // // console.log(row);
        loc.push(row);
      })
      // // console.log("loc");
      // // console.log(loc);
      res.json(loc);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });


  // var loc = getLocationsByPIdPointid(pid, pointid);
  // // // // console.log(loc);
  // res.json(loc);
};



exports.setProjectCenter = function(req, res){
  // // console.log('API call: setProjectCenter');
  var pid = req.params.pid;
  // // console.log(req.body);

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "UPDATE projects SET x="+req.body.lat+", y="+req.body.lng+" WHERE pid = "+pid;
    // // console.log("Q is: "+q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('setProjectCenter error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      res.json({});
      client.end();
    });
  });

};






exports.getProjectCenter = function(req, res){
  // // console.log('API call: getProjectCenter');
  var pid = req.params.pid;
  // // console.log(req.body);
  var toReturn = {};

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "SELECT x, y FROM projects WHERE pid = "+pid;
    // // console.log("Q is: "+q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('getProjectCenter error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      if(result.rows.length > 0)
        toReturn = result.rows[0];

      // var q2 = "SELECT count(*) FROM points where pid_proj = "+pid;
      var q2 = "SELECT x,y FROM points where pid_proj = "+pid;
      client.query(q2, function(err, result2) {
        if(err) {
          res.json(toReturn);
          client.end();
          return console.error('getProjectCenter2 error running query', err);
        }

        // toReturn.numOfPoints = result2.rows[0];
        toReturn.numOfPoints = result2.rows.length;
        
        toReturn.points = result2.rows;

        res.json(toReturn);
        client.end();

      });


    });
  });

};




exports.geoapiAddPoint = function(req, res){
  console.log('API call: geoapiAddPoint');
  // console.log(req.body);
  var pid = req.params.pid;

  var pointIndicator = getPointIndicatorById(pid);

  var type = req.body.template[0].text;
  var attributes = {};
  if (req.body.hasOwnProperty('attributes') )
    attributes = req.body.attributes;
  // console.log("attributes:");
  // console.log(attributes);

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "INSERT INTO points(x, y, location, picturename, type, attributes, pid_proj) VALUES ("+req.body.point.lat+", "+req.body.point.lng+", 'EMPTY_LOC', 'EMPTY_JPG', '"+type+"', '"+JSON.stringify(attributes)+"'::json, '"+pid+"') RETURNING pointid;";
    // console.log("Q is: "+q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('geoapiAddPoint error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      var pointToAdd = {};
      result.rows.forEach(function(row){

        pointToAdd = { "pointid": row.pointid, "coord":[{"x":req.body.point.lat, "y":req.body.point.lng}], "indicators":[]};


        pointIndicator.push(pointToAdd);

      });

      // :::::::::::::::::::::::::::::::
      // :::: auto add indicators!
      // NUNOOOOOOOOOOOOOOOOOOOOOOOOOO
      // :::::::::::::::::::::::::::::::

      res.json(pointToAdd);
      client.end();
    });
  });







  // var currPointid = nextPointID;
  // nextPointID++;
  // var pointToAdd = { "pointid": currPointid, "coord":[{"x":req.body.lat, "y":req.body.lng}], "indicators":[]};

  // pointIndicator.push(pointToAdd);

  // // {"pointid": 1, "coord":[{"x":32.666667, "y": -16.95}],
  // //                                                               "indicators":[] }

  // // obter proximo pointid
  // // adicionar ao pointToAdd bem como os restantes x, y
  // // adicionar o pointToAdd ao pointIndicator
  // // // console.log(pointIndicator);

  // // // console.log("add geo point");
  // // // console.log(pointDashboards);

  // res.json(pointToAdd);
};


exports.geoapiUpdatePoint = function(req, res){
  console.log('API call: geoapiUpdatePoint');
  console.log(req.body);
  var pid = req.params.pid;
  var pointid = req.params.pointid;

  var type = req.body.template[0].text;
  var attributes = {};
  if (req.body.hasOwnProperty('attributes') )
    attributes = req.body.attributes;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO points(x, y, location, picturename, type, attributes, pid_proj) VALUES ("+req.body.point.lat+", "+req.body.point.lng+", 'EMPTY_LOC', 'EMPTY_JPG', '"+type+"', '"+JSON.stringify(attributes)+"'::json, '"+pid+"') RETURNING pointid;";
    var q = "UPDATE points SET x="+req.body.point.lat+", y="+req.body.point.lng+", type='"+type+"', attributes='"+JSON.stringify(attributes)+"'::json WHERE pointid = "+pointid+";";

    // console.log("Q is: "+q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('geoapiAddPoint error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      var pointToAdd = {};
      result.rows.forEach(function(row){

        pointToAdd = { "pointid": row.pointid, "coord":[{"x":req.body.point.lat, "y":req.body.point.lng}], "indicators":[]};


        pointIndicator.push(pointToAdd);

      });

      // :::::::::::::::::::::::::::::::
      // :::: auto add indicators!
      // NUNOOOOOOOOOOOOOOOOOOOOOOOOOO
      // :::::::::::::::::::::::::::::::

      res.json(pointToAdd);
      client.end();
    });


  });




};


exports.geoapiDeletePoint = function(req, res){
  // // console.log('API call: geoapiDeletePoint');
  var pointid = req.params.pointid;


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO projects(title, area, location) VALUES ('"+req.body.title+"', '"+req.body.area+"', '"+req.body.location+"') RETURNING pid;";
    var q = "DELETE FROM points WHERE pointid = "+pointid+" RETURNING pointid;";
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('geoapiDeletePoint error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);

      // se calhar devolvemos o conjunto de pontos actuais para o pid (project) para mostar as alteracoes à bd!
      // para atacar o problema de dois users apagarem pontos diferentes no mm projecto!

      res.json(pointid);
      client.end();
    });
  });

  // // // console.log("pointid: "+pointid);
  // res.json(pointid);
};



exports.addPointGeometries = function(req, res){
  console.log('API call: addPointGeometries');
  var pid = req.params.pid;

  // console.log(req.body.features);

  // select dos pointid e PointKey e criar o mapping
  // para cada req.body.features, ver qual o PointKey, obter o pointid do mapping e fazer insert da geometria para esse pointid

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO projects(title, area, location) VALUES ('"+req.body.title+"', '"+req.body.area+"', '"+req.body.location+"') RETURNING pid;";
    var q = "SELECT pointid, attributes FROM points where pid_proj = "+pid;
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addPointGeometries error running query', err);
      }

      var mapping = {};
      for(var i = 0; i < result.rows.length; i++){
        var row = result.rows[i];
        if(row.attributes.PointKey != undefined && row.attributes.PointKey != null)
          mapping[row.attributes.PointKey] = row.pointid;
      }

      // console.log(mapping);

      var currJ = 0;

      console.log(req.body.features.length);
      for(var j=0; j<req.body.features.length; j++){
        var geojson = req.body.features[j];
        var pointid = mapping[geojson.properties.PointKey];

        if(pointid != undefined && pointid != null){

          var q2 = "UPDATE points SET geometry = '"+JSON.stringify(geojson)+"'::json WHERE pointid = "+pointid;
          client.query(q2, function(err, result) {
            if(err) {
              res.writeHead(500, {'content-type': 'text/plain'});
              res.end(err.toString());
              client.end();
              return console.error('updateParameter error running query', err);
            }

            // console.log(req.body.features.length-1);
            currJ++;
            // console.log(currJ);
            if(currJ == req.body.features.length-1){
              res.json({});
              client.end();
            }
            
          })
        } else {
          console.log("Error: no pointid mapping found for PointKey "+geojson.properties.PointKey);

          currJ++;
          if(currJ == req.body.features.length-1){
            res.json({});
            client.end();
          }
        }

      }

    });
  });


};





// obter todas as activities de um determinado projecto.
exports.getActivities = function(req, res){
  // // console.log('API call: getActivities');
  var pid = req.params.pid;
  var uid = req.session.passport.user;
  var activities_arr = [];

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('SELECT * FROM activities WHERE pid_proj = '+pid+' AND pointid_point IS NULL and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = '+uid+');', function(err, result) {
      if(err) {
        client.end();
        return console.error('getActivities error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){
        // // console.log(row);
        activities_arr.push(row);
      })
      res.json(activities_arr);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });


  // // obter todos os indicadores de um projecto
  // var activities_arr = findProjectActivitiesById(pid);
  // // // // console.log(activities_arr);
  // // para cada indicador, obter as tarefas


  // // var activitiesList
  // // for(var activitiesList in activities){
  // //   // // console.log(activitiesList);
  // // }

  // // incluir as tarefas na variavel de resultado
  // res.json(activities_arr);
}

exports.getActivitiesPoint = function(req, res){
  // // console.log('API call: getActivitiesPoint');
  var pid = req.params.pid;
  var pointid = req.params.pointid;
  var uid = req.session.passport.user;
  var activities_arr = [];

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = 'SELECT * FROM activities WHERE pid_proj = '+pid+' AND pointid_point = '+pointid+' and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = '+uid+')';
    // // console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('getActivitiesPoint error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){
        // // console.log(row);
        activities_arr.push(row);
      })
      res.json(activities_arr);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });
}


exports.setActivities = function(req, res){
  // // console.log('API call: setActivities');
  var today = new Date();
  // // console.log(req.body);
  var pid = req.params.pid;

  var querySQL = '';

  // // console.log(req.body.aid != null);
  if(req.body.aid != undefined && req.body.aid != null){
    if( typeof(req.body) == 'object' ){
      var aid = req.body.aid;
      // // console.log("setActivityByPid");

      querySQL = "UPDATE activities SET start = '"+req.body.start+"'::timestamptz WHERE aid = "+aid+";";
      // setActivityByPid(pid, req.body);
      // // see if we have the aid on activities
      // //else add the req.body to the pid on activities
    }
  } else {
    // // were adding a new one because it has no aid (activity id)
    // addActivityByPid(pid, req.body);
    // INSERT INTO activities(title, description, responsible, start, allday, pid_proj) VALUES ('Budget Revision', 'The monthly task to revise the operational expenses and profits.', 'João Santos', '2014-06-20 00:00:00.000000', true, 1);
    // querySQL = "INSERT INTO activities(title, description, responsible, start, allday, pid_proj) VALUES ("+req.body.title+", "+req.body.title+") RETURNING aid";
    querySQL = "INSERT INTO activities(title, responsible, start, allday, pid_proj) VALUES ('"+req.body.title+"', '"+req.body.responsible+"', '"+req.body.start+"'::timestamptz, "+req.body.allDay+", "+pid+") RETURNING aid;";
    // // // console.log('querySQL');
    // // // console.log(querySQL);
  }

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query(querySQL, function(err, result) {
      if(err) {
        client.end();
        return console.error('setActivities error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){
        // // console.log(row);
        req.body.aid = row.aid;
      })
      res.json(req.body);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });


}


exports.setActivitiesPoint = function(req, res){
  // // console.log('API call: setActivitiesPoint');
  var today = new Date();
  // // console.log(req.body);
  var pid = req.params.pid;
  var pointid = req.params.pointid;

  var querySQL = '';

  // // console.log(req.body.aid != null);
  if(req.body.aid != undefined && req.body.aid != null){
    if( typeof(req.body) == 'object' ){
      var aid = req.body.aid;
      // // console.log("req.body");
      // // console.log(req.body);

      querySQL = "UPDATE activities SET start = '"+req.body.start+"'::timestamptz WHERE aid = "+aid+" and pointid_point = "+pointid+";";
      // setActivityByPid(pid, req.body);
      // // see if we have the aid on activities
      // //else add the req.body to the pid on activities
    }
  } else {
    // // were adding a new one because it has no aid (activity id)
    // addActivityByPid(pid, req.body);
    // INSERT INTO activities(title, description, responsible, start, allday, pid_proj) VALUES ('Budget Revision', 'The monthly task to revise the operational expenses and profits.', 'João Santos', '2014-06-20 00:00:00.000000', true, 1);
    // querySQL = "INSERT INTO activities(title, description, responsible, start, allday, pid_proj) VALUES ("+req.body.title+", "+req.body.title+") RETURNING aid";
    querySQL = "INSERT INTO activities(title, responsible, start, allday, pid_proj, pointid_point) VALUES ('"+req.body.title+"', '"+req.body.responsible+"', '"+req.body.start+"'::timestamptz, "+req.body.allDay+", "+pid+", "+pointid+") RETURNING aid;";
    // // console.log('querySQL');
    // // console.log(querySQL);
  }

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    client.query(querySQL, function(err, result) {
      if(err) {
        client.end();
        return console.error('setActivitiesPoint error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);
      result.rows.forEach(function(row){
        // // console.log(row);
        req.body.aid = row.aid;
      })
      res.json(req.body);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });
}

// to test...
exports.getParameterReadings = function(req, res){
  // // console.log('API call: getParameterReadings');
  var pid = req.params.pid;
  var iid = req.params.iid;
  var parmid = req.params.parmid;
  var uid = req.session.passport.user;


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    // var q = "SELECT readings FROM parameters WHERE parmid = "+parmid+";";
    var q = "select parameters.readings from parameters, indicators where parameters.iid_ind=indicators.iid and parmid="+parmid+" and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")";
    // // console.log(q);
    client.query(q, function(err, res1) {
      if(err) {
        client.end();
        return console.error('getParameterReadings error running query', err);
      }
      // // console.log("Number of results for getParameterReadings: "+res1.rows.length);
      res1.rows.forEach(function(row){
        var readingsInt = row.readings.map(function(item){
          return parseInt(item, 10);
        });
        // // console.log(readingsInt);
        result = readingsInt;
        // res.json(result);
        // projects.push({"id":row.pid, "title":row.title, "location":"m", "area":row.area});
      })

      res.json(result);
      // res.json(projects);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });

  // var parameter = findParameterByParmId(iid, parmid);
  // // // console.log(parameter.readings);
  // res.json(parameter.readings);
}


exports.getParameterPointReadings = function(req, res){
  console.log('API call: getParameterPointReadings');
  var pid = req.params.pid;
  var pointiid = req.params.pointiid;
  var parmid = req.params.pointparmid;
  var uid = req.session.passport.user;

  var result = [];


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "SELECT readings FROM parameters WHERE parmid = "+parmid+";";
    var q = "select parameters.readings from parameters, indicators where parameters.iid_ind=indicators.iid and parmid="+parmid+" and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")";
    // // console.log(q);
    client.query(q, function(err, res1) {
      if(err) {
        client.end();
        return console.error('getParameterPointReadings error running query', err);
      }
      // // console.log("Number of results for getParameterPointReadings: "+res1.rows.length);
      res1.rows.forEach(function(row){
        // // console.log('row');
        // // console.log(row);
        var readingsDouble = row.readings.map(function(item){
          // // console.log("item.value");
          // // console.log(item.value);
          item.value = parseFloat(item.value).toFixed(2);
          // // console.log("item.value2");
          // // console.log(item.value);
          return item;
        });

        var readingsDoubleArr = [];
        // // console.log('lennnnnnnn: '+readingsInt.length);
        for(var i = 0; i<readingsDouble.length; i++){
          var aux = [readingsDouble[i].timestamp, parseFloat(readingsDouble[i].value)];
          readingsDoubleArr.push(aux);
        }
        // // console.log('readingsIntArr');
        // // console.log(readingsIntArr);

        result = readingsDoubleArr;
        // res.json(result);
        // projects.push({"id":row.pid, "title":row.title, "location":"m", "area":row.area});
      });

      res.json(result);
      // res.json(projects);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });

  // var parameter = findParameterByPointParmId(pointiid, pointparmid);
  // // // console.log(parameter.readings);
  // res.json(parameter.readings);
}



exports.getIndicatorPointReadings = function(req, res){
  console.log('API call: getIndicatorPointReadings');
  var currentTimeMillis = new Date().getTime();
  var pid = req.params.pid;
  var pointiid = req.params.pointiid;
  var uid = req.session.passport.user;

  var result = [];
  var toRet = {};

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "select unit, aggrmethod, readings, pid_proj, pointid_point, title from indicators where iid="+pointiid+" and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")";
    apiDebug(q);
    client.query(q, function(err, res0) {
      if(err) {
        client.end();
        return console.error('getIndicatorPointReadings error running query', err);
      }

      toRet.unit = res0.rows[0].unit;
      toRet.aggrmethod = res0.rows[0].aggrmethod;
      if(toRet.aggrmethod == undefined || toRet.aggrmethod == null || toRet.aggrmethod == '')
        toRet.aggrmethod = "average";



      var q1 = "select reads from indicators, json_array_elements(readings) as reads where iid="+pointiid+" "+
      "order by to_date(reads->>'timestamp', 'YYYY-MM-DD'), (reads->>'hour')::numeric";

      console.log(">>>> q1");
      console.log(q1);
      apiDebug(q1);
      client.query(q1, function(err1, res1) {
        if(err) {
          client.end();
          return console.error('getIndicatorPointReadings error running query', err);
        }


        var readingsDouble = new Array();
        for(var j=0; j<res1.rows.length; j++){
          var item = res1.rows[j];
          item.reads.value = parseFloat(item.reads.value).toFixed(2);
          readingsDouble.push(item.reads);
        }


          var readingsDoubleArr = [];

          for(var i = 0; i<readingsDouble.length; i++){
            var aux = [readingsDouble[i].timestamp, parseFloat(readingsDouble[i].value), readingsDouble[i].category, readingsDouble[i].product, readingsDouble[i].promoter, readingsDouble[i].hour];
            // console.log(aux);
            readingsDoubleArr.push(aux);
          }

          result = readingsDoubleArr;
          toRet.result = result;
        

        console.log(res0.rows[0].pid_proj);
        console.log(res0.rows[0].pointid_point);
        console.log(res0.rows[0].title);

        var q2 = generatePointIndicatorHistoryQuery(res0.rows[0].pid_proj, res0.rows[0].pointid_point, res0.rows[0].title, (toRet.aggrmethod == 'average'));

        console.log(q2);

        client.query(q2, function(err2, res2) {
          if(err2) {
            client.end();
            return console.error('getIndicatorPointReadings2 error running query', err2);
          }

          toRet.aggr_result = res2.rows;

          res.json(toRet);
          client.end();
          console.log(">>>>>>>>>> TIMER: took " + ( new Date().getTime() - currentTimeMillis) );
        });

      });




    });
  });
};






var kpiQueryCalcs = {};
kpiQueryCalcs["Net Sales"] = {"n_base_kpis": 1, "base_kpi_a": "Net Sales", "base_kpi_b": "Net Sales", "calc_formula": "( (SUM(querya.values)) )"};
kpiQueryCalcs["Number of Customers"] = {"n_base_kpis": 1, "base_kpi_a": "Number of Customers", "base_kpi_b": "Number of Customers", "calc_formula": "( (SUM(querya.values)) )"};
kpiQueryCalcs["NPS INDEX (HoN)"] = {"n_base_kpis": 1, "base_kpi_a": "NPS INDEX (HoN)", "base_kpi_b": "NPS INDEX (HoN)", "calc_formula": "( (SUM(querya.values)) )"};
kpiQueryCalcs["Basket"] = {"n_base_kpis": 2, "base_kpi_a": "Net Sales", "base_kpi_b": "Number of Customers", "calc_formula": "( (SUM(querya.values)) / (SUM(queryb.values)) )"};
kpiQueryCalcs["Net Margin"] = {"n_base_kpis": 2, "base_kpi_a": "Net Margin", "base_kpi_b": "Net Sales", "calc_formula": "( (SUM(querya.values / 100 * queryb.values)) / (SUM(queryb.values)) ) *100"};
kpiQueryCalcs["Multiline Bills"] = {"n_base_kpis": 2, "base_kpi_a": "Multiline Bills", "base_kpi_b": "Number of Customers", "calc_formula": "( (SUM(querya.values / 100 * queryb.values)) / (SUM(queryb.values)) ) *100"};

kpiQueryCalcs["default_kpi_average"] = {"n_base_kpis": 1, "base_kpi_a": "", "base_kpi_b": "", "calc_formula": "( (AVG(querya.values)) )"};
kpiQueryCalcs["default_kpi_total"] = {"n_base_kpis": 1, "base_kpi_a": "", "base_kpi_b": "", "calc_formula": "( (SUM(querya.values)) )"};

var generatePointIndicatorHistoryQuery = function(pid, pointid_point, title, isAverage){
  var kpiCalc = kpiQueryCalcs[title];
  if(!kpiQueryCalcs.hasOwnProperty(title)){
    if(isAverage){
      kpiCalc = kpiQueryCalcs["default_kpi_average"];
    } else {
      kpiCalc = kpiQueryCalcs["default_kpi_total"];
    }
    kpiCalc.base_kpi_a = title;
    kpiCalc.base_kpi_b = title;
  }

  var toReturn = "WITH ";

  toReturn += "mindate as (select min(to_date(c->>'timestamp', 'YYYY-MM-DD')) as min from indicators, json_array_elements(readings) as c ";
  toReturn += "WHERE title='"+kpiCalc.base_kpi_b+"' and pid_proj = "+pid+"),";

  toReturn += "maxdate as (select max(to_date(c->>'timestamp', 'YYYY-MM-DD')) as max from indicators, json_array_elements(readings) as c ";
  toReturn += "WHERE title='"+kpiCalc.base_kpi_b+"' and pid_proj = "+pid+") ";

  toReturn += "select valuesjson from ( select rawvalues.pointid_point, json_agg((date, value)) as values from ( ";
  toReturn += "select querya.pointid_point, querya.date, "+kpiCalc.calc_formula+" as value from ";

  toReturn += "( SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date ";
  toReturn += "FROM indicators, json_array_elements(readings) AS c ";

  toReturn += "WHERE title='"+kpiCalc.base_kpi_a+"' and pid_proj = "+pid+" ";

  toReturn += "and pointid_point in ("+pointid_point+") "+
  "and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select min from mindate) "+
  "and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate) "+
  // "and (c->>'hour')::numeric >= 0 and (c->>'hour')::numeric <= 23 "+
  "order by (c->>'hour')::numeric) as querya ";

  if(kpiCalc.n_base_kpis == 2){
    toReturn += "right outer join ( "+
    "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
    "FROM indicators, json_array_elements(readings) AS c "+
    "WHERE title='"+kpiCalc.base_kpi_b+"' and pid_proj = "+pid+" "+
    "and pointid_point in ("+pointid_point+") "+
    "and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select min from mindate) "+
    "and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate) "+
    // "and (c->>'hour')::numeric >= 0 and (c->>'hour')::numeric <= 23 "+
    "order by (c->>'hour')::numeric "+
    ") as queryb "+
    "on ( (querya.hour is null or querya.hour = queryb.hour) and querya.date = queryb.date and querya.pointid_point = queryb.pointid_point) ";
  }

  toReturn += "group by querya.pointid_point, querya.date "+
  "order by querya.pointid_point, querya.date "+
  ") as rawvalues "+
  "group by rawvalues.pointid_point "+
  ") as aas, json_array_elements(aas.values) as valuesjson "+
  "where valuesjson->>'f1' <> 'null'";

  return toReturn;
}


var generatePointRankingQuery = function(pid, title, isAverage){
  var kpiCalc = kpiQueryCalcs[title];
  if(!kpiQueryCalcs.hasOwnProperty(title)){
    if(isAverage){
      kpiCalc = kpiQueryCalcs["default_kpi_average"];
    } else {
      kpiCalc = kpiQueryCalcs["default_kpi_total"];
    }
    kpiCalc.base_kpi_a = title;
    kpiCalc.base_kpi_b = title;
  }

  var toReturn = "WITH ";

  toReturn += "maxdate as (select max(to_date(c->>'timestamp', 'YYYY-MM-DD')) as max from indicators, json_array_elements(readings) as c ";
  toReturn += "WHERE title='"+kpiCalc.base_kpi_b+"' and pid_proj = "+pid+") ";

  toReturn += "select pointid_point, valuesjson from ( select rawvalues.pointid_point, json_agg((date, value)) as values from ( ";
  toReturn += "select querya.pointid_point, querya.date, "+kpiCalc.calc_formula+" as value from ";

  toReturn += "( SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date ";
  toReturn += "FROM indicators, json_array_elements(readings) AS c ";

  toReturn += "WHERE title='"+kpiCalc.base_kpi_a+"' and pid_proj = "+pid+" ";

  toReturn += 
  "and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate) "+
  "and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate) "+
  // "and (c->>'hour')::numeric >= 0 and (c->>'hour')::numeric <= 23 "+
  "order by (c->>'hour')::numeric) as querya ";

  if(kpiCalc.n_base_kpis == 2){
    toReturn += "right outer join ( "+
    "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
    "FROM indicators, json_array_elements(readings) AS c "+
    "WHERE title='"+kpiCalc.base_kpi_b+"' and pid_proj = "+pid+" "+
    "and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate) "+
    "and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate) "+
    // "and (c->>'hour')::numeric >= 0 and (c->>'hour')::numeric <= 23 "+
    "order by (c->>'hour')::numeric "+
    ") as queryb "+
    "on ( (querya.hour is null or querya.hour = queryb.hour) and querya.date = queryb.date and querya.pointid_point = queryb.pointid_point) ";
  }

  toReturn += "group by querya.pointid_point, querya.date "+
  "order by querya.pointid_point, querya.date "+
  ") as rawvalues "+
  "group by rawvalues.pointid_point "+
  ") as aas, json_array_elements(aas.values) as valuesjson "+
  "where valuesjson->>'f1' <> 'null' and valuesjson->>'f2' <> 'null' "+
  "order by (valuesjson->>'f2')::decimal DESC";

  return toReturn;
}







exports.addParameterReadings = function(req, res){
  // // console.log('API call: addParameterReadings');
  var iid = req.params.iid;
  var parmid = req.params.parmid;

  // // console.log(iid + " " + parmid);


  var readingToAdd = [];
  var parameter = findParameterByParmId(iid, parmid);

  // UPDATE parameters SET readings = array_append( (select readings from parameters where parmid=4), '55') WHERE parmid=4;


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO parameters(title, unit, alarm, value, objective, min, max, readings, iid_ind) VALUES ('"+req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', "+req.body.value+", "+req.body.objective+", "+req.body.min+", "+req.body.max+", ARRAY["+req.body.value+"], "+iid+") RETURNING parmid;";
    // var q = "UPDATE parameters SET readings = array_append( (select readings from parameters where parmid="+parmid+"), '"+req.body.value+"') WHERE parmid="+parmid+";";
    var q = "SELECT readings FROM parameters WHERE parmid="+parmid;
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addParameterReadings error running query', err);
      }
      // // console.log("Number of results addParameterPoint: "+result.rows.length);
      // // console.log(result.rows);
      result.rows.forEach(function(row){
        // // console.log(row);
        // req.body.parmid = row.parmid;
        // parameters.push(req.body);

        // projects.push({"id":row.pid, "title":row.title, "location":"m", "area":row.area});
      })
      parameter.value = req.body.value;
      res.json(parameter);
      // res.json(projects);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      client.end();
    });
  });
}



var processAndAddLevels = function(obj, startIndex, reading, levels){
  for(var i=0; i<levels.length; i++){
    obj[levels[i].toLowerCase()] = reading[i+startIndex];
  }
}

exports.addIndicatorReadings = function(req, res){
  console.log('API call: addIndicatorReadings');
  var iid = req.params.iid;

  var parameter = {};
  var indicator = {};
  var readingsToAdd = [];

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO parameters(title, unit, alarm, value, objective, min, max, readings, iid_ind) VALUES ('"+req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', "+req.body.value+", "+req.body.objective+", "+req.body.min+", "+req.body.max+", ARRAY["+req.body.value+"], "+iid+") RETURNING parmid;";
    // var q = "UPDATE parameters SET readings = array_append( (select readings from parameters where parmid="+parmid+"), '"+req.body.value+"') WHERE parmid="+parmid+";";
    var q = 'SELECT indicators.readings'
          + '     , points.attributes'
          + '     , points.pointid '
          + 'FROM indicators,points '
          + 'WHERE indicators.iid=' + iid
          + '  AND indicators.pointid_point = points.pointid';
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addIndicatorReadings error running query', err);
      }
      // // console.log("Number of results updateParameterPointReadings: "+result.rows.length);

      var readings = result.rows[0].readings;

      // now lets iterate on the posted readings
      var postedReadings = req.body.readings;

      for(var i = 0; i < postedReadings.length; i++){
        var aux = postedReadings[i].split("\t");
        aux[1] = aux[1].replace(',', '.');
        var str = aux[0].replace(/\//g, '-');
        var processedDate = "";
        if(str.indexOf('-') == 4){
          // year is coming first
          processedDate = str.substr(0,4) + '-' + str.substr(5,2) + '-' + str.substr(8,2);
        } else {
          // year is coming last...
          processedDate = str.substr(6,4) + '-' + str.substr(3,2) + '-' + str.substr(0,2);
        }
        // var auxObj = {"value":aux[1], "timestamp": addTimeToDate(processedDate),"category":aux[2], "product":aux[3], "promoter": aux[4]};
        var auxObj = {"value":aux[1], "timestamp": addTimeToDate(processedDate)};
        processAndAddLevels(auxObj, 2, aux, req.body.levels);

        orderedPush(readings, auxObj);

      }
      var latest = latestReading(readings).value;

      /* Determine the point name */
      var rres = result.rows[0];
      var pointname= nameFromAttributes(rres, rres.pointid);

      var q2 = "UPDATE indicators SET readings = '"
             + JSON.stringify(readings)
             + "'::json "
             + " WHERE iid=" + iid + ";";

      client.query(q2, function(err, result2){
        if(err) {
          client.end();
          return console.error('addIndicatorReadings 2 error running query', err);
        }

        var latest = latestReading(readings).value;

        // TODO: This is NOT ATOMIC. If app crashes here, value is not updated
        //       to match readings. FIXME
        var q3 = "UPDATE indicators "
               + "SET value = '" + latest + "', readings = '" +JSON.stringify(readings)+"'::json WHERE  iid=" + iid + " "
               + "RETURNING iid, title, value, alarm, unit, readings, min, max, occtypeid_typ;";
        console.log(q3);
        client.query(q3, function(err, result3){
          if(err) {
            client.end();
            return console.error('addIndicatorReadings3 error running query', err);
          }
           console.log('result3.rows');
           console.log(result3.rows);
          indicator.value = latest;
          var toRet = result3.rows[0];
          toRet.pointname = pointname;
          toRet.inputReadings = req.body;
          res.json(toRet);
          client.end();
        });
      });
    });
  });
}

addTimeToDate = function (processedDate) {
	return (processedDate + ' 00:00:00:000000')
}

exports.addIndicatorMultipleReadings = function(req, res){
  // // console.log('API call: addIndicatorMultipleReadings');
  var iid = req.params.iid;

  var readingsToAdd = [];
  var indicator = {};

  var lastValue = '';

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO parameters(title, unit, alarm, value, objective, min, max, readings, iid_ind) VALUES ('"+req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', "+req.body.value+", "+req.body.objective+", "+req.body.min+", "+req.body.max+", ARRAY["+req.body.value+"], "+iid+") RETURNING parmid;";
    // var q = "UPDATE indicators SET readings = ((select readings from indicators where iid="+iid+") || ARRAY["+str+"]) WHERE iid="+iid+";";
    var q = 'SELECT indicator.readings '
          + '     , points.attributes '
          + '     , points.pointid '
          + 'FROM indicators, points '
          + 'WHERE indicators.iid=' + iid
          + '  AND indicators.pointid_point = points.pointid';
    // // console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addIndicatorMultipleReadings error running query', err);
      }
      // // console.log("Number of results updateParameterPointReadings: "+result.rows.length);

      var readings = result.rows[0].readings;
      for(var i = 0; i < req.body.length; i++){
        var aux = req.body[i].split("\t");
        aux[1] = aux[1].replace(',', '.');
        var str = aux[0].replace(/\//g, '-');
        var processedDate = "";
        if(str.indexOf('-') == 4){
          // year is coming first
          processedDate = str.substr(0,4) + '-' + str.substr(5,2) + '-' + str.substr(8,2);
        } else {
          // year is coming last...
          processedDate = str.substr(6,4) + '-' + str.substr(3,2) + '-' + str.substr(0,2);
        }
        var auxObj = {"value":aux[1], "timestamp": addTimeToDate(processedDate), "category":aux[2], "product":aux[3], "promoter":aux[4] };

        orderedPush(readings, auxObj);

      }
      var latest = latestReading(readings).value;

      var q2 = "UPDATE indicators SET readings = '"
             + JSON.stringify(readings)
             + "'::json "
             + " WHERE iid=" + iid + ";";
      client.query(q2, function(err, result2){
        if(err) {
          client.end();
          return console.error('addIndicatorMultipleReadings 2 error running query', err);
        }

        var q3 = "UPDATE indicators "
               + "SET value = '" + latest + "' "
               + "WHERE iid=" + iid + " "
               + "RETURNING iid, title, value, alarm, unit, readings, min, max;";
        client.query(q3, function(err, result3){
          if(err) {
            client.end();
            return console.error('addIndicatorMultipleReadings 3 error running query', err);
          }
          indicator.value = latest;
          var toRet = result3.rows[0];
          //toRet.pointname = pointname;
          res.json(toRet);
          client.end();
        });
      });
    });
  });
};


exports.deleteIndicatorReadings = function(req, res){
  console.log('API call: deleteIndicatorReadings');
  var iid = req.params.iid;
  var date = req.params.date;
  var hour = req.params.hour;

  // ir buscar o indicator readings por iid
  // fazer splice conforme date
  // fazer update do indicator readings
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "SELECT readings FROM indicators WHERE iid="+iid+";";
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('deleteIndicatorReadings1 error running query', err);
      }
      var readings = result.rows[0].readings;

      var found = false;

      for(var i in readings){
        // console.log(readings[i].timestamp + " -- " + date);

        var hourTest = true;
        if(hour != undefined && hour != null){
          if(!readings[i].hasOwnProperty('hour')){
            hourTest = false;
          } else {
            if(readings[i].hour != hour){
              hourTest = false;
            }
          }
        }

        if(readings[i].timestamp == date && hourTest){
          // console.log("FOUND");
          found = true;
          readings.splice(i, 1);

          var q2 = "UPDATE indicators SET readings = '"+JSON.stringify(readings)+"'::json WHERE iid="+iid+";";
          client.query(q2, function(err, result2){
            if(err) {
              res.json({});
              client.end();
              return console.error('deleteIndicatorReadings2 error running query', err);
            }

            console.log("DELETED READING");

            if(readings[readings.length-1] == undefined){
              var lastValue = null;
            } else {
              var lastValue = readings[readings.length-1].value;

            }

            var theLastValue = '';
            if(lastValue != null && lastValue != undefined){
              theLastValue = lastValue.substring(0,12);
            }
            var q3 = "UPDATE indicators SET value = '"+theLastValue+"' where iid="+iid;
            client.query(q3, function(err, result3){
              if(err) {
                res.json({});
                client.end();
                return console.error('deleteIndicatorReadings3 error running query', err);
              }

              console.log("UPDATED VALUE");
              res.json({});
              client.end();
            });

          });
        }
      }
      if(!found){
        res.json({});
        client.end();
      }

    });
  });


};







exports.addParameterPointReadings = function(req, res){
  console.log('API call: addParameterPointReadings');
  var iid = req.params.pointiid;
  var parmid = req.params.pointparmid;

  req.body.value = req.body.value.replace(',', '.');


  // var readingToAdd = {"value":req.body.value, "timestamp": (req.body.timestamp+' 00:00:00:000000') };
  var readingToAdd = {"value":req.body.value, "timestamp": (req.body.timestamp) };
  var parameter = {};

  // UPDATE parameters SET readings = array_append( (select readings from parameters where parmid=4), '55') WHERE parmid=4;


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO parameters(title, unit, alarm, value, objective, min, max, readings, iid_ind) VALUES ('"+req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', "+req.body.value+", "+req.body.objective+", "+req.body.min+", "+req.body.max+", ARRAY["+req.body.value+"], "+iid+") RETURNING parmid;";
    // var q = "UPDATE parameters SET readings = array_append( (select readings from parameters where parmid="+parmid+"), '"+req.body.value+"') WHERE parmid="+parmid+";";
    var q = "SELECT readings FROM parameters WHERE parmid="+parmid;
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addParameterPointReadings error running query', err);
      }
      console.log("Number of results updateParameterPointReadings: "+result.rows.length);

      // // console.log(result.rows[0].readings);
      var readings = result.rows[0].readings;


      // readings.push(readingToAdd);

      orderedPush(readings, readingToAdd);
      // console.log(readings);


      var q2 = "UPDATE parameters SET readings = '"+JSON.stringify(readings)+"'::json WHERE parmid="+parmid+";";
      // // console.log(q2);

      client.query(q2, function(err, result2){
        if(err) {
          client.end();
          return console.error('addParameterPointReadings2 error running query', err);
        }

        var q3 = "UPDATE parameters SET value = '"+req.body.value+"' where parmid="+parmid+" RETURNING value, alarm, min, max, title, readings;";
        // // console.log(q3);
        client.query(q3, function(err, result3){
          if(err) {
            client.end();
            return console.error('addParameterPointReadings3 error running query', err);
          }
          // // console.log('result3.rows');
          // // console.log(result3.rows);
          parameter.value = req.body.value;
          res.json(result3.rows[0]);
          client.end();
        });



      });


      // res.json(projects);
      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      // client.end();
    });
  });



  // var readingToAdd = [];

  // // // // console.log(pointiid + " " + pointparmid);

  // // get readings entry for pointiid and pointparmid
  // var parameter = findParameterByPointParmId(pointiid, pointparmid);
  // // // // console.log(parameter);
  // var readings = parameter.readings;


  // parameter.value = req.body.value;

  // // see if date was provided. if not, we need to find the last reading id, increment it and set to readingToAdd

  // var reading_id = ordergetBiggestXInReadings(parameter.readings);
  // // // // console.log("reading_id : "+reading_id);

  // if(req.body.date == undefined || req.body.date == null || req.body.date == ''){
  //   readingToAdd = [ reading_id, req.body.value ]
  // }

  // // push readingToAdd to the readings array
  // readings.push(readingToAdd);

  // res.json(parameter);
};




exports.addParameterPointMultipleReadings = function(req, res){
  // console.log('API call: addParameterPointMultipleReadings');
  var iid = req.params.pointiid;
  var parmid = req.params.pointparmid;

  var readingsToAdd = [];
  var parameter = {};

  var lastValue = '';


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO parameters(title, unit, alarm, value, objective, min, max, readings, iid_ind) VALUES ('"+req.body.title+"', '"+req.body.unit+"', '"+req.body.alarm+"', "+req.body.value+", "+req.body.objective+", "+req.body.min+", "+req.body.max+", ARRAY["+req.body.value+"], "+iid+") RETURNING parmid;";
    // var q = "UPDATE parameters SET readings = array_append( (select readings from parameters where parmid="+parmid+"), '"+req.body.value+"') WHERE parmid="+parmid+";";
    var q = "SELECT readings FROM parameters WHERE parmid="+parmid;
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addParameterPointMultipleReadings error running query', err);
      }
      // // console.log("Number of results updateParameterPointReadings: "+result.rows.length);

      // // console.log(result.rows[0].readings);


      var readings = result.rows[0].readings;
      for(var i = 0; i < req.body.length; i++){
        var aux = req.body[i].split("\t");
        aux[1] = aux[1].replace(',', '.');
        var str = aux[0].replace(/\//g, '-');
        var processedDate = str.substr(6,4) + '-' + str.substr(3,2) + '-' + str.substr(0,2);
        var auxObj = {"value":aux[1], "timestamp": (processedDate+' 00:00:00:000000'), "category":aux[2], "product":aux[3], "promoter":aux[4] };
        // console.log(auxObj);

        //readings.push(auxObj);
        orderedPush(readings, auxObj);

        if(i == req.body.length-1){
          lastValue = aux[1];
          // console.log('lastValue');
          // console.log(lastValue);
        }
      }
      // // console.log('readings');
      // // console.log(readings);


      var q2 = "UPDATE parameters SET readings = '"+JSON.stringify(readings)+"'::json WHERE parmid="+parmid+";";
      // // console.log(q2);

      client.query(q2, function(err, result2){
        if(err) {
          client.end();
          return console.error('addParameterPointMultipleReadings2 error running query', err);
        }

        var q3 = "UPDATE parameters SET value = '"+lastValue+"' where parmid="+parmid+" RETURNING value, alarm, min, max, title, readings;";
        // console.log(q3);
        client.query(q3, function(err, result3){
          if(err) {
            client.end();
            return console.error('addParameterPointMultipleReadings3 error running query', err);
          }
          // console.log('result3.rows');
          // console.log(result3.rows);
          parameter.value = lastValue;
          res.json(result3.rows[0]);
          client.end();
        });
      });


      // // // console.log(result.rows[0].theTime);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)

      // res.json(parameter);
      // client.end();
    });
  });
};


exports.deleteParameterReadings = function(req, res){
  console.log('API call: deleteParameterReadings');
  var parmid = req.params.parmid;
  var date = req.params.date;

  // ir buscar o parameter readings por parmid
  // fazer splice conforme date
  // fazer update do indicator readings
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "SELECT readings FROM parameters WHERE parmid="+parmid+";";
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('deleteIndicatorReadings1 error running query', err);
      }
      var readings = result.rows[0].readings;

      var found = false;

      for(var i in readings){
        // console.log(readings[i].timestamp + " -- " + date);
        if(readings[i].timestamp == date){
          // console.log("FOUND");
          found = true;
          readings.splice(i, 1);

          var q2 = "UPDATE parameters SET readings = '"+JSON.stringify(readings)+"'::json WHERE parmid="+parmid+";";
          client.query(q2, function(err, result2){
            if(err) {
              res.json({});
              client.end();
              return console.error('deleteIndicatorReadings2 error running query', err);
            }

            console.log("DELETED READING");

            if(readings[readings.length-1] == undefined){
              var lastValue = null;
            } else {
              var lastValue = readings[readings.length-1].value;

            }


            var q3 = "UPDATE parameters SET value = '"+lastValue+"' where parmid="+parmid;
            client.query(q3, function(err, result3){
              if(err) {
                res.json({});
                client.end();
                return console.error('deleteIndicatorReadings3 error running query', err);
              }

              console.log("UPDATED VALUE");
              res.json({});
              client.end();
            });

          });
        }
      }
      if(!found){
        res.json({});
        client.end();
      }

    });
  });


};




exports.getPointsFromWidget = function(req, res){
  console.log("API CALL : getPointsFromWidget");

  var wid = req.params.wid;
  var pid = req.params.pid;

  var title = ""; // get from select title from widgets where wid = wid

  var pointValues = [];
  var pointCoords = [];

  // // console.log(pid + " " + parmid);


  var toRet = {};


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "select title from widgets where wid = "+wid+" and pid_proj = "+pid+";";
    client.query(q, function(err, result) {
      // console.log(result.rows);

      if(err) {
        client.end();
        return console.error('getPointsFromWidget error running query', err);
      }
      title = result.rows[0].title;



      // var q2 = "select * from indicators where title = '"+toReturn.widget.title+"' and pid_proj = "+pid;
      var q2 = "SELECT pointid_point as pointid, x, y, geometry, indicators.value, indicators.unit, attributes, type, indicators.readings, indicators.aggrmethod FROM indicators, points where  indicators.pointid_point = points.pointid and title = '"+title+"' and indicators.pid_proj = "+pid+" and pointid_point is not null"
      // console.log("Q2: "+q2);
      client.query(q2, function(err2, result2) {
        // console.log(result.rows);

        if(err2) {
          client.end();
          return console.error('getPointsFromWidget2 error running query', err);
        }

        var unit = '';

        // sync for loop, to get mappings PointKey - PointID and build MAPPING
        // predecessor property may not exist or exist but be ''
        var mapping = {};
        for(var i = 0; i < result2.rows.length; i++){
          var row = result2.rows[i];
          if(row.attributes.PointKey != undefined && row.attributes.PointKey != null)
            mapping[row.attributes.PointKey] = row.pointid;

          if(row.unit != '')
            unit = row.unit;
        }



        // apiDebug("mapping");
        // apiDebug(mapping);



        for(var i = 0; i < result2.rows.length; i++){
          var row = result2.rows[i];
          // // // console.log(row);
          var locToAdd = row;

          locToAdd.name = nameFromAttributes(locToAdd, locToAdd.pointid);

          // console.log(locToAdd.attributes.Predecessor);
          locToAdd.predecessor = mapping[locToAdd.attributes.Predecessor]; // THIS IS HARDCODED... needs to call mapping MAPPING to translate attributes.PointKey to pointId
          
          if(locToAdd.geometry != undefined && locToAdd.geometry != null){
            locToAdd.geometry.properties.pointid = locToAdd.pointid;
          }

          if(locToAdd.attributes != undefined && locToAdd.attributes != null &&
            locToAdd.geometry != undefined && locToAdd.geometry != null){
            if(locToAdd.attributes.StoreCodeAbbrv != undefined && locToAdd.attributes.StoreCodeAbbrv != null){
              locToAdd.geometry.properties.StoreCodeAbbrv = locToAdd.attributes.StoreCodeAbbrv;
            }
          }

          pointCoords.push(locToAdd);


          var average = true;
          if(locToAdd.aggrmethod != "average" && locToAdd.aggrmethod != "")
            average = false;

          var lastDate = null;
          for(var j=0; j<row.readings.length; j++){
            var reading = row.readings[j];

            if(lastDate == null){
              lastDate = reading.timestamp;
            } else {
              if(new Date(reading.timestamp) > new Date(lastDate))
                lastDate = reading.timestamp;
            }
          }

          console.log("lastDate "+lastDate);
          
          var totalSum = 0;
          var totalCount = 0;
          for(var j=0; j<row.readings.length; j++){
            var reading = row.readings[j];
              if( new Date(lastDate).getTime() == new Date(reading.timestamp).getTime() ){
                  totalSum += +reading.value;
                  totalCount += 1;
              }
          }
          if(average)
            row.value = parseFloat(totalSum/totalCount).toFixed(2);
          else
            row.value = parseFloat(totalSum).toFixed(2);

          // console.log(parseFloat(row.value));

          pointValues.push([ row.pointid, parseFloat(row.value) ]);
        }

        pointValues.sort(function(a,b) {
          return parseFloat(b) - parseFloat(a);
        });

        toRet.locations = pointCoords;
        toRet.ranking = pointValues;
        toRet.unit = unit;


      //   var q3 = 
      //       "select to_date(pairs->>'timestamp', 'YYYY MM DD') as ts, pairs->>'value' as vl, pairs->>'product' as pr, pairs->>'category' as ct, pointid_point from "
      //       +"indicators, "
      //       +"json_array_elements(indicators.readings) as pairs "
      //       +"where pid_proj = "+pid+" "
      //       +"and title = '"+title+"' "
						// +"and to_date(pairs->>'timestamp', 'YYYY MM DD') = "
						// +"(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')"
						// +"from indicators, json_array_elements(indicators.readings) as pairs "
						// +"where pid_proj = " + pid + " and title = '"+title+"')";
						
										
				var q3 = generatePointRankingQuery(pid, title, average);
				
				
           /* "order by pairs->>'timestamp' DESC "
            + 	", pairs->>'vl' DESC "
            + "limit ((select count(*) from points where pid_proj = "+pid+") * (with categories as ( "
            + "select distinct json_array_elements(readings)->>'category' "
            + "from indicators "
            + "where title = '"+title+"' "
            + "and pid_proj = "+pid+" "
            + ") "
            + "select count(*) from categories) )+1"*/

        console.log("\n>>> q3");
        console.log(q3);

        client.query(q3, function(err3, result3){
          if(err){
            console.error("error on q3");
            console.error(err3);
            client.end();
            res.json(toRet);
          } else {
            console.log("result3");
            apiDebug(result3);
            if(result3 != undefined){
              toRet.ordFiltValues = result3.rows;
            }
            
            if(title != 'NPS INDEX (HoN)'){
              res.json(toRet);
              client.end();
            } else {
              // title == NPS INDEX (HoN)
              //query to get NPS value ((VP - (VN+N))/Total)*100 from Happy or Not replies
              //IR -  NPS needs to be calculated in the database, it's not a "normal" reading
               var q4 = "Drop table if exists HoNTable; "
              +"Drop table if exists HorNTable; "
              +"Drop table if exists NPSvals; "
              +"Drop table if exists NegVals; "
              +"Drop table if exists VPvals; "
              +"Drop table if exists Replies; "
                
              +"SELECT json_array_elements(readings) as dados, pointid_point as pointid "
              +"INTO HoNTable "
              +"FROM indicators "
              +"WHERE title = 'NPS INDEX (HoN)' and pid_proj = "+pid+";"

              +"Select dados->>'category' as Category, cast(dados->>'value' as int) as Values, dados->>'timestamp' as Dates, pointid "
              +"into HorNTable "
              +"from HoNTable; "

              +"SELECT dates as datesNeg, pointid as pointidNeg, sum(values)::float as AllNegValues "
              +"into NegVals "
              +"from HorNTable "
              +"where category LIKE '%Negative%' "
              +"group by dates, pointid  "
              +"order by dates DESC, pointid ASC; "

              +"SELECT dates as datesTot, pointid as pointidTot, sum(values)::float as AllReplies "
              +"into Replies "
              +"from HorNTable "
              +"group by dates, pointid "
              +"order by dates DESC, pointid ASC; "

              +"SELECT dates, pointid, sum(values)::float as VPValues "
              +"into VPvals "
              +"from HorNTable "
              +"where category = 'Very Positive' " 
              +"group by dates, pointid "
              +"order by dates DESC, pointid ASC; "

              +" select dates, pointid, ((vpvalues-allnegvalues)/AllReplies)*100 as NPS from VPvals, NegVals, Replies "
              +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) and (VPVals.pointid = NegVals.pointidNeg and VPVals.pointid = Replies.pointidTot) "
              +"and AllReplies > 0 "
              +"union "

              +"select dates, pointid, allreplies as NPS from VPvals, NegVals, Replies "
              +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) and (VPVals.pointid = NegVals.pointidNeg and VPVals.pointid = Replies.pointidTot) "
              +"and AllReplies = 0  "
              +"order by dates; "

              +"Drop table if exists HoNTable; "
              +"Drop table if exists HorNTable; "
              +"Drop table if exists NPSvals; "
              +"Drop table if exists NegVals; "
              +"Drop table if exists VPvals; "
              +"Drop table if exists Replies; ";


              apiDebug("getWidgets: the NPS query is: "+q4);
              client.query(q4, function(err4, res4) {
                 if(err4) {
                  client.end();
                  res.json(toRet);
                  return console.error('getPointsFromWidget error running NPS query', err4);
                } else {
                 //console.log(res4.rows);
                 toRet.npsvalues = res4.rows;
                 client.end();
                 res.json(toRet);
               }

                apiDebug("getPointsFromWidget: no error on NPS query");
              });

            }
            
          }

        });


      });


            

    });
  });

}



exports.getOrderedPointValuesOfParameter = function(req, res){
  // // console.log('API call: getOrderedPointValuesOfParameter');
  var pid = req.params.pid;
  var iid = req.params.iid;
  var parmid = req.params.parmid;
  var uid = req.session.passport.user;

  var pointValues = [];
  var pointCoords = [];

  // // console.log(pid + " " + parmid);


  var toRet = {};




  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "SELECT * FROM indicators WHERE pid_proj = "+pid+" and pointid_point = "+pointid+";";
    // var q = "select pointid_point as pointid, x, y, parameters.value from parameters, indicators, points where iid_ind = iid and indicators.pointid_point = points.pointid and indicators.pid_proj = "+pid+" and pointid_point is not null and parameters.title = (select title from parameters where parmid="+parmid+");";
    var q = "select pointid_point as pointid, x, y, parameters.value from parameters, indicators, points where iid_ind = iid and indicators.pointid_point = points.pointid and indicators.pid_proj = "+pid+" and pointid_point is not null and parameters.title = (select title from parameters where parmid="+parmid+") and indicators.pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+");";
    // NA QUERY TB QUEREMOS EVITAR OS QUE TÊM POINTID!

    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('getOrderedPointValuesOfParameter error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);

      for(var i = 0; i < result.rows.length; i++){
        var row = result.rows[i];
        // // // console.log(row);
        var locToAdd = row;
        pointCoords.push(locToAdd);

        pointValues.push([ row.pointid, parseFloat(row.value) ]);
      }

      pointValues.sort(function(a,b) {
        return parseFloat(b) - parseFloat(a);
      });

      toRet.locations = pointCoords;
      toRet.ranking = pointValues;


      res.json(toRet);


      client.end();
    });
  });
}

function onlyNumbers(s){
  if(s == null || s == undefined)
    return false;
  return s.match(/^[0-9\.]+$/) != null;
}

exports.getAlerts = function(req, res){
  getAllAlerts(req,res,function(res_,allAlertsArray) {
        res.json(allAlertsArray);
});
}

function getAllAlerts (req,res,f,errorMsg_) {
  var errorMsg = typeof errorMsg_ !== 'undefined' ? errorMsg_ : 'getAllIndicators error running query';
  var uid = req.session.passport.user;
  var pid = req.params.pid;
  var title = req.params.title;
  var client = new pg.Client(conString);
  var allAlertsArray = [];

  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

      var q2 = "select  iid"
          +          ", indicators.pid_proj as pid"
          +             ", pointid_point as pointid"
          +          ", indicators.title"
          +          ", indicators.readings"
          +          ", indicators.min"
          +          ", indicators.max"
          +          ", indicators.alarm"
          // +          ", indicators.category"
          +          ", points.attributes"
          +          ", projects.title as ptitle"
          +    " from indicators,projects, points"
          +    " where indicators.alarm='yes' "
          +    "   and indicators.pid_proj = projects.pid "
          +    ((typeof pid !== "undefined") ? " and projects.pid =" + pid : "")
          +    ((typeof title !== "undefined") ? " and indicators.title = '" + title + "'" : "")
          +    "   and pointid_point = points.pointid"
          +    "   and indicators.pid_proj in (select organizations_projects.pid_proj "
          +                         " from organizations_projects"
          +                             ", users"
          +                         " where organizations_projects.oid_org = users.oid_org "
          +                            "   and users.uid = " + uid + ")";

      client.query(q2, function(err, result2) {
        if(err) {
          client.end();
          return console.error(errorMsg, err);
        }
        for(var i = 0; i < result2.rows.length; i++){
          var row = result2.rows[i];
          /* Determine more up to date value based solely on readings, if available */
          calcAlerts(row,function (r) {
             allAlertsArray.push(r);
          });
        }
        f (res,allAlertsArray);
        //req.session.alerts = allAlertsArray.length;
        //req.session.save();
        client.end();
      });
  });
}

/* calc alert on row, which must have readings, alarm, min, max and value fields */
/* if readings exist, the most recent value takes precedence over the value field */
function calcAlerts (row,f) {
    if (row.alarm === "yes") {
        var readings = row.readings;
        var min = row.min;
        var max = row.max;
        var defValue = row.value;
        var lastReading = latestReading(readings);
        value = (lastReading && lastReading.value) || defValue;
        if(onlyNumbers(value) && onlyNumbers(min) && onlyNumbers(max)
         && (parseFloat(value) < parseFloat(min) || parseFloat(value) > parseFloat(max))) {
            row.value = value;
            row.timestamp = (lastReading && lastReading.timestamp) || undefined;
            f (row);
            return 1;
        } else {
            return 0;
        }
    } else return 0;
}


function calcAlertsLastReading (row,f) {
    if (row.alarm === "yes") {
        var readings = row.readings;
        var min = row.min;
        var max = row.max;
        var defValue = row.value;
        var lastReading = row.latestReading;
        value = (lastReading && lastReading.value) || defValue;
        if(onlyNumbers(value) && onlyNumbers(min) && onlyNumbers(max)
         && (parseFloat(value) < parseFloat(min) || parseFloat(value) > parseFloat(max))) {
            row.value = value;
            row.timestamp = (lastReading && lastReading.timestamp) || undefined;
            f (row);
            return 1;
        } else {
            return 0;
        }
    } else return 0;
}


function hasAlarm (row) {
  return (row.alarm === "yes");
}

exports.getAlertsCount = function(req, res){
  // // console.log('API call: getAlertsCount');
  var uid = req.session.passport.user;
  if(uid == undefined || req.session.passport == {}){
    res.json({});
    return console.error("user still not logged in");
  }
  // // console.log(uid);

  var finalCount = 0;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "select parmid, iid, pid_proj as pid, pointid_point as pointid, parameters.title, parameters.value, parameters.min, parameters.max from parameters, indicators where parameters.iid_ind=indicators.iid and (parameters.value::double precision < parameters.min::double precision or parameters.value::double precision > parameters.max::double precision) and parameters.alarm='yes' and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")";
    var q = "select parmid, iid, pid_proj as pid, pointid_point as pointid, parameters.title, parameters.value, parameters.min, parameters.max from parameters, indicators where parameters.iid_ind=indicators.iid and parameters.alarm='yes' and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")";
    // // console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        console.log(q);
        return console.error('getAlertsCount error running query', err);
      }
      // // console.log("Number of results: "+result.rows.length);

      for(var i = 0; i < result.rows.length; i++){
        var row = result.rows[i];
        // // console.log(row);
        if(onlyNumbers(row.value) && onlyNumbers(row.min) && onlyNumbers(row.max) && (parseFloat(row.value) < parseFloat(row.min) || parseFloat(row.value) > parseFloat(row.max)))
          finalCount++;
      }

      var q2 = "select iid, pid_proj as pid, pointid_point as pointid, indicators.title, indicators.value, indicators.min, indicators.max from indicators where indicators.alarm='yes' and pid_proj in (select pid_proj from organizations_projects, users where organizations_projects.oid_org = users.oid_org and users.uid = "+uid+")";
      client.query(q2, function(err, result2) {
        if(err) {
          client.end();
          console.log(q2);
          return console.error('getAlertsCount2 error running query', err);
        }
        for(var i = 0; i < result2.rows.length; i++){
          var row = result2.rows[i];
          // // console.log(row);
          if(onlyNumbers(row.value) && onlyNumbers(row.min) && onlyNumbers(row.max) && (parseFloat(row.value) < parseFloat(row.min) || parseFloat(row.value) > parseFloat(row.max)))
            finalCount++;
        }
        // allAlertsArray.concat(result2.rows)
        // // console.log('finalCount');
        // // console.log(finalCount);
        res.json(finalCount);
        client.end();
      });
    });
  });
}

var pointTemplates = [
    { attribute:'Name'},
    { attribute:'Code'}
  ];

var itemsPointTemplates = [
    { id: 1, text: 'database' },
    { id: 2, text: 'tag' },
    { id: 3, text: 'blah'}];




exports.getPointTemplates = function(req, res){
  console.log("API call: getPointTemplates");
  // var toRet = pointTemplates;

  // 1o fazer o select dos atributos todos => allAttributes
  // dps de ter a lista, fazer o select distinct type
  // e em cada ciclo do distinct type, ver no allAttributes todos os atributos...

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "select distinct type as text from points where type <> '';";
    // var q = "select distinct type as text, row_number() OVER () as id from points where type <> '';";
    // var q = "select distinct type as text from points where type <> '';";
    apiDebug("getPointTemplates: connection ok");

    var q = 'SELECT type'
          +      ', count(*) as count '
          + 'FROM points '
          + 'WHERE pid_proj = ' + req.params.pid
          + '  AND type is not null '
          + 'GROUP by type';
    apiDebug("getPointTemplates: first query is "+q);

    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('getPointTemplates error running query', err);
      }

      apiDebug("getPointTemplates: first connection ok");

      var typeCounts = {};
      for(var j=0; j<result.rows.length; j++){
        typeCounts[result.rows[j].type] = result.rows[j].count;
      }




      if(req.params.hasOwnProperty('filtered'))
        var q = 'select distinct type from points where pid_proj = '+req.params.pid+' and type is not null';
      else
        var q = "select tid, text, attributes as fields from types where oid_org in (select oid_org from organizations_projects where pid_proj = "+req.params.pid+");";
      // // console.log(q);

      apiDebug("getPointTemplates: second query "+q);

      client.query(q, function(err, result) {
        if(err) {
          client.end();
          return console.error('getPointTemplates 2 error running query', err);
        }

        // res.json(itemsPointTemplates);
        apiDebug("getPointTemplates: second query OK");

        for(var i = 0; i < result.rows.length; i++){
          result.rows[i].id = i;
          if(req.params.hasOwnProperty('filtered'))
            result.rows[i].count = typeCounts[result.rows[i].type];
          else
            result.rows[i].count = typeCounts[result.rows[i].text];
          // result.rows[i].fields = ['chapaid', 'anoconstrucao'];
        }

        // console.log(result.rows);

        apiDebug("getPointTemplates: processing OK");

        res.json(result.rows);
        client.end();

      });





    });







  });

  // var data = {};
  // data.itemsPointTemplates = itemsPointTemplates;
  // data.pointTemplates = pointTemplates;
  // res.json(data);
}


// exports.getPointTemplates = function(req, res){
//   console.log("API call: getPointTemplates");
//   // var toRet = pointTemplates;
//   var data = {};
//   data.itemsPointTemplates = itemsPointTemplates;
//   data.pointTemplates = pointTemplates;
//   res.json(data);
// }


exports.addPointTemplate = function(req, res){
  console.log("API call: addPointTemplate");
  console.log(req.params.pid);
  console.log(req.body);
  var extraFields = req.body.fields;
  if(extraFields == undefined)
    extraFields = [];

  // { id: 'Lago', text: 'Lago', fields: [ 'Diametro' ] }

  // obter o oid pelo pid
  // inserir na tabela o [req.body.text] [req.body.fields] [oid]

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "INSERT INTO types(text, attributes, oid_org) VALUES ('"+req.body.text+"', '"+JSON.stringify(extraFields)+"'::json, (select oid_org from organizations_projects where pid_proj = "+req.params.pid+"));";
    console.log(q);
    // // console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('insert type error running query', err);
      }

      console.log("added type");
      res.json("added type");
      client.end();

    });
  });
}

exports.addPointTemplateAttribute = function(req, res){
  console.log("API call: addPointTemplateAttribute");
  console.log(req.params.tid);
  console.log(req.body);




  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var q = "UPDATE types SET attributes='"+JSON.stringify(req.body)+"' WHERE tid = "+req.params.tid;

    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('addPointTemplateAttribute error running query', err);
      }

      console.log("addPointTemplateAttribute DONE");
      res.json("updated type");
      client.end();

    });
  });
}



exports.getOrganizationsStatistics = function(req, res){
  var resToRet = {};

  var uid = req.session.passport.user;


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }


    var q = "select oid_org from users where uid = "+uid;
    // // console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('getOrganizationsStatistics0 error running query', err);
      }

      var oid = result.rows[0].oid_org;
      if(oid != 1){

        res.json(resToRet);
        client.end();

      } else {

        var q = "select name, count(username) from users, organizations where users.oid_org = organizations.oid group by name;";
        // // console.log(q);
        client.query(q, function(err, result) {
          if(err) {
            client.end();
            return console.error('getOrganizationsStatistics error running query', err);
          }
          resToRet.organizationsUserCount = result.rows;
          // var q = "select organizations.name, count(organizations_projects.oid_org) from organizations LEFT JOIN organizations_projects on oid = oid_org group by organizations.name;";
          var q = "select organizations.name, count(organizations_projects.oid_org) from organizations, organizations_projects, projects where oid = oid_org and pid_proj = pid group by organizations.name;";
          // console.log(q);
          client.query(q, function(err, result) {
            if(err) {
              client.end();
              return console.error('getOrganizationsStatistics2 error running query', err);
            }
            resToRet.organizationsProjectsCount = result.rows;

            var q3 = 'select organizations.name, count(points.pointid) from organizations, organizations_projects, projects, points where oid = oid_org and organizations_projects.pid_proj = pid and projects.pid = points.pid_proj group by organizations.name;';
            client.query(q3, function(err, result3){
              if(err) {
                resToRet.organizationsPointsCount = [['', 0]];
                res.json(resToRet);
                client.end();
                return console.error('getOrganizationsStatistics error running query', err);
              }

              resToRet.organizationsPointsCount = result3.rows;
              res.json(resToRet);
              client.end();
            });

          });
        });

      }

    });




  });
};


exports.getIndicatorsStatistics = function(req, res){
  var resToRet = {};

  var uid = req.session.passport.user;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "select oid_org from users where uid = "+uid;
    // // console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('getOrganizationsStatistics0 error running query', err);
      }

      var oid = result.rows[0].oid_org;
      if(oid != 1){

        res.json(resToRet);
        client.end();

      } else {

        // var q = "select projects.title, x, y, indicators.title, indicators.readings from projects left join indicators on pid = pid_proj;";
        // var q = "select projects.title, count(indicators.title) from projects left join indicators on pid = pid_proj group by projects.title;";
        var q = "select organizations.name, count(indicators.iid) from organizations, organizations_projects, projects, indicators where oid = oid_org and organizations_projects.pid_proj = pid and projects.pid = indicators.pid_proj group by organizations.name;";
        client.query(q, function(err, result) {
          if(err) {
            client.end();
            return console.error('getIndicatorsStatistics error running query', err);
          }
          resToRet.projectsIndicatorsCount = result.rows;

          var q = "select indicators.title, count(parameters.title) from indicators left join parameters on iid = iid_ind group by indicators.title";
          client.query(q, function(err, result) {
            if(err) {
              client.end();
              return console.error('getIndicatorsStatistics2 error running query', err);
            }
            resToRet.indicatorsParametersCount = result.rows;
            res.json(resToRet);
            client.end();
          });
        });

      }

    });

  });
}

exports.getLoggedInUsers = function(req, res){
  console.log('API call: getLoggedInUsers');
  var resToRet = {};

  var uid = req.session.passport.user;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }


    var q = "select oid_org from users where uid = "+uid;
    // // console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('getOrganizationsStatistics0 error running query', err);
      }

      var oid = result.rows[0].oid_org;
      if(oid != 1){

        res.json(resToRet);
        client.end();

      } else {


        // var q = "select projects.title, x, y, indicators.title, indicators.readings from projects left join indicators on pid = pid_proj;";
        // var q = "select * from users where login > logout;";
        var q = "select * from users, organizations where oid = oid_org;";
        client.query(q, function(err, result) {
          if(err) {
            client.end();
            return console.error('getLoggedInUsers error running query', err);
          }
          // console.log('rows length '+result.rows.length);

          // resToRet.currentLoggedInUsers = result.rows;
          resToRet.allUsersOrganizations = result.rows;
          res.json(resToRet);
          client.end();
        });

      }

    });

  });
}

function getHighestDate(arr){
  var timestamp = "";
  for(var i in arr){
    var reading = arr[i];
    if(timestamp == undefined || timestamp == "")
      timestamp = arr[i].timestamp;
    else{
      if(new Date(arr[i].timestamp) > new Date(timestamp)){
        timestamp = arr[i].timestamp;
      }
    }
  }
  return timestamp;
}

/* Given a reading array, return the most recent reading
 * i.e. a value and timestamp pair */
/* JC: this is the same as the above, isn't it... */
/* well, no, I return the whole reading, not the timestamp */
function latestReading (readings) {
  var max = readings.sort(function(a,b) { return (
				((new Date(a.timestamp)) < (new Date(b.timestamp)))
				? -1
				: ((new Date(a.timestamp)) > (new Date(b.timestamp)))
	  )}).slice(-1)[0];

  return max;
}




// var debug = false;
var debug = process.env.API_CONSOLE_DEBUG;
console.log("API_CONSOLE_DEBUG: "+debug);
if(debug == undefined || debug == null){
  debug = false;
  console.log("API_CONSOLE_DEBUG: "+debug);
}
// we need to set this via environment var, something like
// process.env.API_DEBUG_MODE

function apiDebug(str){
  if(debug){
    console.log(">> ");
    console.log(str);
  }
}


exports.getWidgets = function(req, res){
  console.log("API call: getWidgets");

  var toReturn = [];
  var pid = req.params.pid;

  var pointid = req.params.pointid;

  var uid = req.session.passport.user;

  if(uid == undefined || uid == null || req.session.passport == {}){
    res.json({});
    return console.error("user still not logged in");
  }

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    apiDebug("getWidgets: connected");

    var q = "select * from widgets where pid_proj = "+pid+";";
    apiDebug("getWidgets: the first query is: "+q);
    client.query(q, function(err, result) {
      // console.log(result.rows);

      if(err) {
        client.end();
        res.json({});
        return console.error('getWidgets error running query', err);
      }

      apiDebug("getWidgets: no error on first query");

      toReturn = result.rows;
      var widgetCount = result.rows.length;
      apiDebug("getWidgets: results of first query, count is "+widgetCount);

      if(widgetCount > 0){
        // NUNOALEX 
        var honindex = -1;
        result.rows.forEach(function(widget, forCount){

          var point_query = "";
          if(pointid != undefined && pointid != '')
            point_query += " and pointid_point = "+pointid;

          var q2 = "with maxdate as (select max(to_date(c->>'timestamp', 'YYYY-MM-DD')) as max from indicators, "+
              "json_array_elements(readings) as c "+
            "WHERE title='"+widget.title+"' and pid_proj = "+pid+" "+
            point_query+
            ") "+
            " select title, unit, alarm, aggrmethod, pairs->>'timestamp' as date, sum(CAST(pairs->>'value' as decimal)) as aggrvalue, icon from  "+
            " indicators, "+
            " json_array_elements(indicators.readings) as pairs "+
            " where title = '"+widget.title+"'  "+
            " and pid_proj = "+pid+" "+
            point_query+
            " and to_date(pairs->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate) "+
            " group by title, unit, alarm, aggrmethod, icon,pairs->>'timestamp'";



          

          apiDebug("getWidgets: the second query is: "+q2);

          client.query(q2, function(err, res2) {
            if(err) {
              client.end();
              return console.error('getWidgets 2: error running query', err);
            }

            apiDebug("getWidgets: no error on second query");

            apiDebug("\nnum of readings "+res2.rows.length);

            if(res2.rows.length > 0) {

              for(var k=0; k<toReturn.length; k++){
                if(toReturn[k].title == res2.rows[0].title){

                  //IR -  NPS needs to be calculated in the database, it's not a "normal" reading
                  //see further down where honindex is used
                  if(toReturn[k].title == 'NPS INDEX (HoN)'){
                    honindex = k;


                  }
                  // GM-2#5
                  // if(aggrmethod == 'average')
                  //   value /= res2.rows.length;

                  // apiDebug("VALUE BEFORE: "+value);

                  // if(value > 10000)
                  //   valueStr = value.toFixed(0).toString().replace('.000','').replace('.00','').replace('.0','');
                  // else if(value > 10)
                  //   valueStr = value.toFixed(1).toString().replace('.000','').replace('.00','').replace('.0','');
                  // else if(value < 10)
                  // valueStr = value.toFixed(3).toString().replace('.000','').replace('.00','').replace('.0','');

                  // apiDebug("VALUE AFTER: "+valueStr);

                  // apiDebug("\nDate: "+date);

                  toReturn[k].value = res2.rows[0].aggrvalue;
                  toReturn[k].unit = res2.rows[0].unit;
                  // toReturn[k].date = date.replace(' 00:00:00:000000','');
                  toReturn[k].date = new Date(res2.rows[0].date.replace(' 00:00:00:000000',''));
                  toReturn[k].date = new Date(toReturn[k].date);
                  toReturn[k].alerts = res2.rows[0].alarm ? res2.rows[0].alerts : undefined;
                  toReturn[k].aggrmethod = res2.rows[0].aggrmethod;
                  toReturn[k].icon = res2.rows[0].icon;
                }
              }
              
            }


            if(widgetCount-1 == forCount){
              // console.log("ending conn");
              // console.log(toReturn);
              apiDebug("getWidgets: end processing");


              var finalReturn = new Array();
              for(var i=0; i<toReturn.length; i++){
                dashboarddata.getComparingIntervalsValues(pid, toReturn[i], null, function(widget){
                  finalReturn.push(widget);

                  if(finalReturn.length == toReturn.length){
                    toReturn = finalReturn;

                    if(honindex == -1){
                      res.json(toReturn);
                      client.end();

                    } else {

                    //query to return the overall NPS (of all pharmacies - to be added to widget in dashboard)
                    //IR -  overall NPS needs to be calculated in the database, it's not a "normal" reading
                    var q3 = "Drop table if exists HoNTable; "
                    +"Drop table if exists HorNTable; "
                    +"Drop table if exists NPSvals; "
                    +"Drop table if exists NegVals; "
                    +"Drop table if exists VPvals; "
                    +"Drop table if exists Replies; "
                      
                    +"SELECT json_array_elements(readings) as dados "
                    +"INTO HoNTable "
                    +"FROM indicators "
                    +"WHERE title = 'NPS INDEX (HoN)' and pid_proj = "+pid+";"

                    +"Select dados->>'category' as Category, cast(dados->>'value' as int) as Values, dados->>'timestamp' as Dates "
                    +"into HorNTable "
                    +"from HoNTable; "

                    +"SELECT dates as datesNeg, sum(values)::float as AllNegValues "
                    +"into NegVals "
                    +"from HorNTable "
                    +"where category LIKE '%Negative%' "
                    +"group by dates  "
                    +"order by dates DESC; "

                    +"SELECT dates as datesTot, sum(values)::float as AllReplies "
                    +"into Replies "
                    +"from HorNTable "
                    +"group by dates "
                    +"order by dates DESC; "

                    +"SELECT dates, sum(values)::float as VPValues "
                    +"into VPvals "
                    +"from HorNTable "
                    +"where category = 'Very Positive' " 
                    +"group by dates "
                    +"order by dates DESC; "

                    +" select dates, ((vpvalues-allnegvalues)/AllReplies)*100 as NPS from VPvals, NegVals, Replies "
                    +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) "
                    +"and AllReplies > 0 "
                    +"union "

                    +"select dates, allreplies as NPS from VPvals, NegVals, Replies "
                    +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) "
                    +"and AllReplies = 0  "
                    +"order by dates DESC; "

                    +"Drop table if exists HoNTable; "
                    +"Drop table if exists HorNTable; "
                    +"Drop table if exists NPSvals; "
                    +"Drop table if exists NegVals; "
                    +"Drop table if exists VPvals; "
                    +"Drop table if exists Replies; ";

                    client.query(q3, function(err3, res3) {
                      if(err3) {
                        client.end();
                        res.json(toReturn);
                        return console.error('getWidgets 3: error running query', err);
                      } else {
                          if(res3.rows[0] == []){
                            res.json(toReturn);
                            client.end();
                            
                          } else {
                            if(res3.rows.length > 0){
                              toReturn[honindex].value = res3.rows[0].nps;
                            }
                            res.json(toReturn);
                            client.end();
                            
                          } 

                      }
                        
                    
                    });

                  }
                    
                  }
                })
              }

              
          }


        });



        }); // end result.rows
      } else {
        apiDebug("getWidgets: no widgets, so nothing else to add");
        res.json(toReturn);
        client.end();
      }

    });

  });

}




exports.getWidgetsOLD = function(req, res){
  console.log("API call: getWidgets");
  var toReturn = [];
  var pid = req.params.pid;

  // read from table widgets


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "select * from widgets where pid_proj = "+pid+";";
    // console.log("Q: "+q);
    client.query(q, function(err, result) {
      // console.log(result.rows);

      if(err) {
        client.end();
        return console.error('getWidgets error running query', err);
      }
      toReturn = result.rows;



      for(var j=0; j<toReturn.length; j++){
        var widget = toReturn[j];
        var q2 = "select * from indicators where pid_proj = "+pid+" and title = '"+ widget.title +"';";
        // console.log(q2);

        client.query(q, function(err, resultArr){
          if(err) {
            client.end();
            return console.error('getWidgets 2 error running query', err);
          }

          var accumValue = 0;
          for(var i=0; i<resultArr.rows.length; i++){
            var indic = resultArr.rows[i];
            console.log(indic);
          }

          res.json(toReturn);
          client.end();

        });
      }







    });
  });

}


exports.getWidgetIndicators = function(req, res){
  console.log("API call: getWidgetIndicators");
  var toReturn = {};
  toReturn.indicators = new Array();
  var pid = req.params.pid;
  var wid = req.params.wid;

  var pointid = req.params.pointid;

  // read from table widgets:
  // obter o widget com wid e pid

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "select * from widgets where wid = "+wid+" and pid_proj = "+pid+";";
    console.log("Q: "+q);
    client.query(q, function(err, result) {
      // console.log(result.rows);

      if(err) {
        client.end();
        return console.error('getWidgetIndicators error running query', err);
      }
      toReturn.widget = result.rows[0];
      // console.log(toReturn.widget);

      

      var q2 = "select * from indicators where title = '"+toReturn.widget.title+"' and pid_proj = "+pid;
      if(pointid != undefined && pointid != '')
          q2 += " and pointid_point = "+pointid;

      console.log("Q2: "+q2);
      client.query(q2, function(err, result2) {
        // console.log(result.rows);

        if(err) {
          client.end();
          return console.error('getWidgetIndicators2 error running query', err);
        }

        result2.rows.forEach(function(elem){

          // console.log("elem");
          // console.log(elem.title + " " + elem.iid);

          toReturn.widget.unit = elem.unit;

          if(elem.aggrmethod == undefined || elem.aggrmethod == null || elem.aggrmethod == '')
            elem.aggrmethod = "average";
          toReturn.widget.aggrmethod = elem.aggrmethod;

          var readingsDouble = elem.readings.map(function(item){
            item.value = parseFloat(item.value).toFixed(2);
            return item;
          });

          elem.readingsDoubleArr = [];
          var indice = 0;
          for(var i = 0; i<readingsDouble.length; i++){
            var aux = [readingsDouble[i].timestamp, parseFloat(readingsDouble[i].value), readingsDouble[i].category, readingsDouble[i].product, readingsDouble[i].promoter];
            // console.log("aux");
            // console.log(aux);
            elem.readingsDoubleArr.push(aux);

            if(!toReturn.widget.hasOwnProperty('date')){
              toReturn.widget.date = readingsDouble[i].timestamp;
              indice = i;
              // console.log(aux);
            } else {
              if(new Date(toReturn.widget.date) < new Date(readingsDouble[i].timestamp) ){
                toReturn.widget.date = readingsDouble[i].timestamp;
                indice = i;
                // console.log(indice);
                // console.log(aux);
              }
            }
          }
          if(readingsDouble.length == 0){
            // its possible that no readings exist, and toReturn.widget.date never gets assigned, thus causing an error on WidgetCtrl
            toReturn.widget.date = '';
          } else {
            apiDebug("----------");
            apiDebug(toReturn.widget.title + " ; index: "+indice);
            apiDebug(toReturn.widget.date);
            apiDebug(readingsDouble[indice].timestamp);


            apiDebug(new Date(toReturn.widget.date));
            apiDebug(new Date(readingsDouble[indice].timestamp));
            apiDebug("----------");


            toReturn.indicators.push(elem);
            
          }


        });

        res.json(toReturn);
        client.end();
      });

    });
  });



  // read from table indicators:
  // obter os pointIndicator deste projecto que tenham o widget.title
  // para cada pointIndicator, obter o value e o readingsHistory, criar objecto com isso tudo e colocar no toReturn


}




function acceptedByFilter(filter, reading){
  // for now, only filter by product
  // console.log("testing acceptedByFilter");
  // console.log(reading);

  // if(filter.products != []){

  
  var foundCat = false,
  foundProd = false,
  foundDate = false;

  if(filter.categories.length > 0){
    if(filter.categories[0].hasOwnProperty(reading.category) ){
      if(filter.categories[0][reading.category])
        foundCat = true;
    }
  }

  if(filter.products.length > 0){
    if(filter.products[0].hasOwnProperty(reading.product) ){
      if(filter.products[0][reading.product])
        foundProd = true;
    }
  }

  if(filter.categories.length == 0)
    foundCat = true;
  if(filter.products.length == 0)
    foundProd = true;
  
  if(reading.category == 'Start'){
    // console.log(reading);
    // console.log("foundCat + foundProd " + foundCat + "  "+ foundProd);
  }


  var startDate = new Date(filter.dates.startdate);
  var finishDate = new Date(filter.dates.finishdate);
  var readingDate = new Date(reading.timestamp);
  



  if(filter.dates.state == true){
    apiDebug(filter.dates.startdate + " < " + reading.timestamp + " < " + filter.dates.finishdate);

    if(startDate.getTime() <= readingDate.getTime()  &&  readingDate.getTime() <= finishDate.getTime()){
      foundDate = true;
    }
    // console.log("foundDate = "+foundDate);
    // console.log("start date: "+filter.dates.startdate+"   <   " + reading.timestamp + "   <   finish date: " + filter.dates.finishdate );
  } else {
    foundDate = true;
  }

  apiDebug("foundCat && foundProd && foundDate == " + foundCat + " " + foundProd + " " + foundDate);

  return (foundCat && foundProd && foundDate);
  
  

  // if(filter.products.length > 0){

  //   console.log("filter products length > 0");
    
  //   if(filter.products[0].hasOwnProperty(reading.product)){
  //     // console.log("test: "+ ((filter.products[0][reading.product])) );
  //     if(filter.products[0][reading.product])
  //       return true;
  //     else
  //       return false;    
  //   } else {
  //     return false;
  //   }
  // } else {
  //   console.log("no lengths...");
  //   return true;
  // }
}



function parseLastValuesAllKpis(rows){
  // rows é do tipo: [ {"pointid": 12163, "title": "Basket", "value": "19.980"}, {"pointid": 12163, "title": "Pieces", "value": "3"}, ... ]
  var ret = {};

  for(var i=0; i<rows.length; i++){
    var row = rows[i];
    // row é do tipo: {"pointid": 12163, "title": "Basket", "value": "19.980"}
    if(!ret.hasOwnProperty(row.pointid)){
      var obj = {};
      obj[row.title] = parseFloat(row.value);
      ret[row.pointid] = obj;
    } else {
      ret[row.pointid][row.title] = parseFloat(row.value);
    }
  }

  return ret;
};

exports.getLastValuesAllKpis = function(req, res){
  console.log("API call: getLastValuesAllKpis");
  var pid = req.params.pid;
  var uid = req.session.passport.user;

  if(uid == undefined || uid == null || req.session.passport == {}){
    res.json({});
    return console.error("user still not logged in");
  }

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "select pointid, indicators.title, indicators.value from organizations_projects, users, projects, points, indicators "
            +"where users.oid_org = organizations_projects.oid_org "
            +"and projects.pid = organizations_projects.pid_proj "
            +"and points.pid_proj = projects.pid "
            +"and indicators.pointid_point = points.pointid "
            +"and uid = "+uid+" and pid = "+pid;

    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('getLastValuesAllKpis error running query', err);
      }

      var toReturn = parseLastValuesAllKpis(result.rows);
      // console.log("toReturn");
      // console.log(toReturn);

      res.json(toReturn);
      client.end();

      // res.json({
      //         12158: {"Margin": 12},
      //         12159: {"Margin": 2},
      //         12160: {"Margin": 3},
      //         12161: {"Margin": 112},
      //         12162: {"Margin": 112},
      //         12163: {"Margin": 112},
      //         12164: {"Margin": 112},
      //         12165: {"Margin": 112},
      //         12166: {"Margin": 112}
      //       });
    });

    

  });





  
  



  // OLD
  // var q = "select pointid, points.pid_proj from organizations_projects, users, projects, points " 
  //         +"where users.oid_org = organizations_projects.oid_org and projects.pid = organizations_projects.pid_proj "
  //         +"and points.pid_proj = projects.pid "
  //         +"and uid = "+uid+" and pid = "+pid;

  // obter todos os pontos do projecto pid (inclusive valida o user - opcional)
  // fazer um for loop como no exports.getWidgets
  // para cada pointid, obter os value de cada indicador associado 
}



var buildSqlFilter = function(filter, level){
  var result = "";
  var levelFilter = "";
  if(level == "category"){
    levelFilter = "categories";
  } else if(level == "product"){
    levelFilter = "products";
  }
  if(filter[levelFilter].length > 0){
    var cats = filter[levelFilter][0];
    for(var prop in cats){
      if(cats.hasOwnProperty(prop)){
        if(cats[prop] == true){
          if(result == ""){
            result = "and (pairs->>'"+level+"' = '"+prop+"' ";
          } else {
            result += "or pairs->>'"+level+"' = '"+prop+"' ";
          }
        }
      }
    }
    if(result != ""){
      result += ") ";
    }
  }
  return result;
}


exports.getWidgetIndicatorsFiltered = function(req,res){



  console.log("API call: getWidgetIndicatorsFiltered");
  var toReturn = {};
  toReturn.indicators = new Array();
  var pid = req.params.pid;
  var wid = req.params.wid;
  var pointid = req.params.pointid;
  var filter = req.body;

  apiDebug("filter");
  apiDebug(filter);
  //console.log(filter);

  var catSqlFilter = buildSqlFilter(filter, "category");
  var prodSqlFilter = buildSqlFilter(filter, "product");

  // read from table widgets:
  // obter o widget com wid e pid

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "select * from widgets where wid = "+wid+" and pid_proj = "+pid+";";
    //console.log("Q: "+q);
    client.query(q, function(err, result) {
      // console.log(result.rows);

      if(err) {
        client.end();
        return console.error('getWidgetIndicators error running query', err);
      }
      toReturn.widget = result.rows[0];
      // console.log(toReturn.widget);

      var pointSqlAux = "";

      var q2 = "select * from indicators where title = '"+toReturn.widget.title+"' and pid_proj = "+pid;
      if(pointid != undefined && pointid != ''){
          q2 += " and pointid_point = "+pointid;
          pointSqlAux += " and pointid_point = "+pointid;
      } else {
        if(filter.points.length > 0){
          q2 += " and (";
          pointSqlAux += " and (";
          for(var pt = 0; pt < filter.points.length; pt++){
            q2 += "pointid_point = "+filter.points[pt]+" ";
            pointSqlAux += "pointid_point = "+filter.points[pt]+" ";
            if(pt < filter.points.length-1){
              q2 += "or ";
              pointSqlAux += "or ";
            }
          }
          q2 += ");";
          pointSqlAux += ")";
        }
      }

      client.query(q2, function(err, result2) {
        console.log("result2");
        console.log(q2);

        if(err) {
          client.end();
          return console.error('getWidgetIndicators2 error running query', err);
        }

        result2.rows.forEach(function(elem, index){

          // console.log("elem");
          // console.log(elem.title + " " + elem.iid);

          toReturn.widget.unit = elem.unit;

          if(elem.aggrmethod == undefined || elem.aggrmethod == null || elem.aggrmethod == '')
            elem.aggrmethod = "average";
          toReturn.widget.aggrmethod = elem.aggrmethod;

          var readingsDouble = elem.readings.map(function(item){
            item.value = parseFloat(item.value).toFixed(2);
            return item;
          });

          elem.readingsDoubleArr = [];
          var indice = 0;
          for(var i = 0; i<readingsDouble.length; i++){
            readingsDouble[i].timestamp = readingsDouble[i].timestamp.replace(' 00:00:00:000000','');
            var aux = [readingsDouble[i].timestamp, parseFloat(readingsDouble[i].value), readingsDouble[i].category, readingsDouble[i].product, readingsDouble[i].promoter];
            // console.log("aux");
            // console.log(aux);
            apiDebug("is accepted by filter on apiWidgetsFilter? " + (acceptedByFilter(filter, readingsDouble[i])) );
            if(acceptedByFilter(filter, readingsDouble[i])){
              // console.log("pushing "+ (readingsDouble[i].category) + " // " + (readingsDouble[i].product) );
              elem.readingsDoubleArr.push(aux);
            }

            if(!toReturn.widget.hasOwnProperty('date')){
              toReturn.widget.date = readingsDouble[i].timestamp;
              indice = i;
              // console.log(aux);
            } else {
              if(new Date(toReturn.widget.date).getTime() < new Date(readingsDouble[i].timestamp).getTime() ){
                toReturn.widget.date = readingsDouble[i].timestamp;
                indice = i;
                // console.log(indice);
                // console.log(aux);
              }
            }
          }
          if(readingsDouble.length == 0){
            // its possible that no readings exist, and toReturn.widget.date never gets assigned, thus causing an error on WidgetCtrl
            toReturn.widget.date = '';
          }


          apiDebug("----------");
          apiDebug(toReturn.widget.title + " ; index: "+indice);
          apiDebug(toReturn.widget.date);
          apiDebug(readingsDouble[indice].timestamp);


          apiDebug(new Date(toReturn.widget.date));
          apiDebug(new Date(readingsDouble[indice].timestamp));
          apiDebug("----------");


          toReturn.indicators.push(elem);


          if(filter.dates.state && (index == result2.rows.length-1)){
  
              var q3 = 
              "select pairs->>'timestamp' as ts, pairs->>'value' as vl, pairs->>'product' as pr, pairs->>'category' as ct, pointid_point from "+
              "indicators, "+
              "json_array_elements(indicators.readings) as pairs "+
              "where pid_proj = "+pid+" "+
              "and title = '"+toReturn.widget.title+"' "+
              pointSqlAux +
              catSqlFilter +
              prodSqlFilter +
              "and to_date(pairs->>'timestamp', 'YYYY MM DD') >= '"+(filter.dates.startdate).replace(' 00:00:00:000000', '')+"'::date "+
              "and to_date(pairs->>'timestamp', 'YYYY MM DD') <= '"+(filter.dates.finishdate).replace(' 00:00:00:000000', '')+"'::date "+
              "order by pairs->>'timestamp' DESC " +
              ", pairs->>'vl' DESC";
            

            apiDebug("\nq3");
            apiDebug(q3);
            client.query(q3, function(err3, result3){
              if(err){
                console.error("error on q3");
                console.error(err3);
                if(toReturn.widget.title != "NPS INDEX (HoN)"){
                  res.json(toReturn);
                  client.end();
                }
              } else {

                console.log("result3");
                apiDebug(result3);
                if(result3 != undefined){
                    toReturn.ordFiltValues = result3.rows; 
                }

                if(toReturn.widget.title != "NPS INDEX (HoN)"){
                  res.json(toReturn);
                  client.end();
                }
              }

            });

            if(toReturn.widget.title == "NPS INDEX (HoN)"){

              //IR -  NPS needs to be calculated in the database, it's not a "normal" reading

            var q4 = "Drop table if exists HoNTable; "
              +"Drop table if exists HorNTable; "
              +"Drop table if exists NPSvals; "
              +"Drop table if exists NegVals; "
              +"Drop table if exists VPvals; "
              +"Drop table if exists Replies; "
                
              +"SELECT json_array_elements(readings) as dados, pointid_point as pointid "
              +"INTO HoNTable "
              +"FROM indicators "
              +"WHERE title = 'NPS INDEX (HoN)' and pid_proj = "+pid
              if(pointid != undefined && pointid != ''){
                  q4 += " and pointid_point = "+pointid;
                  pointSqlAux += " and pointid_point = "+pointid;
              } else {
                if(filter.points.length > 0){
                  q4 += " and (";
                  pointSqlAux += " and (";
                  for(var pt = 0; pt < filter.points.length; pt++){
                    q4 += "pointid_point = "+filter.points[pt]+" ";
                    pointSqlAux += "pointid_point = "+filter.points[pt]+" ";
                    if(pt < filter.points.length-1){
                      q4 += "or ";
                      pointSqlAux += "or ";
                    }
                  }
                  q4 += ");";
                  pointSqlAux += ")";
                }
              }

              q4 += "Select dados->>'category' as Category, cast(dados->>'value' as int) as Values, dados->>'timestamp' as Dates, pointid "
              +"into HorNTable "
              +"from HoNTable; "

              +"SELECT dates as datesNeg, pointid as pointidNeg, sum(values)::float as AllNegValues "
              +"into NegVals "
              +"from HorNTable "
              +"where category LIKE '%Negative%' "
              +"group by dates, pointid  "
              +"order by dates DESC, pointid ASC; "

              +"SELECT dates as datesTot, pointid as pointidTot, sum(values)::float as AllReplies "
              +"into Replies "
              +"from HorNTable "
              +"group by dates, pointid "
              +"order by dates DESC, pointid ASC; "

              +"SELECT dates, pointid, sum(values)::float as VPValues "
              +"into VPvals "
              +"from HorNTable "
              +"where category = 'Very Positive' " 
              +"group by dates, pointid "
              +"order by dates DESC, pointid ASC; "

              +"select dates, pointid, ((vpvalues-allnegvalues)/AllReplies)*100 as NPS from VPvals, NegVals, Replies "
              +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) and (VPVals.pointid = NegVals.pointidNeg and VPVals.pointid = Replies.pointidTot) "
              +"and to_date(dates , 'YYYY-MM-DD') >= '"+filter.dates.startdate+"' and to_date(dates , 'YYYY-MM-DD') <= '"+filter.dates.finishdate+"' "
              +"and AllReplies > 0 "
              +"union "
              +"select dates, pointid, allreplies as NPS from VPvals, NegVals, Replies "
              +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) and (VPVals.pointid = NegVals.pointidNeg and VPVals.pointid = Replies.pointidTot) "
              +"and to_date(dates , 'YYYY-MM-DD') >= '"+filter.dates.startdate+"' and to_date(dates , 'YYYY-MM-DD') <= '"+filter.dates.finishdate+"' "
              +"and AllReplies = 0 " 
              +"order by dates; "

              +"Drop table if exists HoNTable; "
              +"Drop table if exists HorNTable; "
              +"Drop table if exists NPSvals; "
              +"Drop table if exists NegVals; "
              +"Drop table if exists VPvals; "
              +"Drop table if exists Replies; "

              console.log(q4);

              apiDebug("\nq4");
              apiDebug(q4);
              client.query(q4, function(err4, result4){
              if(err4){
                console.error("error on q4");
                console.error(err4);
                client.end();
                res.json(toReturn);
              } else {

                console.log("result4");
                apiDebug(result4);

                if(result4 != undefined)
                    toReturn.npsvaluesfiltered = result4.rows;
                
                res.json(toReturn);
                client.end();
              }

            });
              
            }

          }
        });

        if(!filter.dates.state){
          apiDebug("filter date state is "+ filter.dates.state+ ". Returning!");
          res.json(toReturn);
          client.end();
        }
      });

    });
  });


}

exports.getAccumRanking = function(req, res){
	console.log("API CALL : getAccumRanking")

	var wid = req.params.wid;
	var pid = req.params.pid;

	var title = ""; // get from select title from widgets where wid = wid

	var filter = req.body;
	var client = new pg.Client(conString);

	client.connect(function(err) {

		if(err) {
			return console.error('could not connect to postgres', err);
		}

		var q = "select title from widgets where wid = "+wid+" and pid_proj = "+pid+";";

		client.query(q, function(err, result) 
		{
			if(err)
			{
				client.end();
				return console.error('getAccumRanking error running query', err);
			}

			title = result.rows[0].title;

			if( title != 'Basket' && title != 'Net Margin' && title !='Multiline Bills' && title !='Stock Level')
			{
				res.json(null);
				client.end();
			}

      if(title == 'Stock Level' && filter.dates.state == true) 
      {
        var q1 = "select pointid_point, cast(s->>'value' as decimal) AS values  "+
            "FROM indicators, json_array_elements(readings) AS s "+
            "WHERE title='Stock Level' and pid_proj = " + pid;

        if(filter.points.length > 0){
             
          for(var pt = 0; pt < filter.points.length; pt++){

            if(pt == 0)
              q1 += " and (pointid_point = "+filter.points[pt];
            else 
              q1 += " or pointid_point = "+filter.points[pt];
          }
          q2 += ')';

        }

        q1 +=" and to_date(s->>'timestamp', 'YYYY MM DD') = '" +
              (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";

        client.query(q1, function(err1, result1)
        {
          if(err1) 
          {
            apiDebug(q1);
            client.end();
            console.log(q1);
            return console.error('getAccumRanking error running query ', err1);
          }

          var obj = {}
          obj = result1.rows;

          apiDebug(q1);
          res.json(obj);
          //res.json(null);
          client.end();
        });
      }

			else if(title == 'Basket' && filter.dates.state == true) 
			{
				var q2 = "WITH "+
          "customers AS ( "+
            "SELECT pointid_point, title, SUM(CAST(c->>'value' as decimal)) AS values  "+
            "FROM indicators, json_array_elements(readings) AS c "+
            "WHERE title='Number of Customers' and pid_proj = " + pid;

            if(filter.points.length > 0){
                 
              for(var pt = 0; pt < filter.points.length; pt++){

                if(pt == 0)
                  q2 += " and (pointid_point = "+filter.points[pt];
                else 
                  q2 += " or pointid_point = "+filter.points[pt];
              }
              q2 += ')';

            }

            q2 +=" and to_date(c->>'timestamp', 'YYYY MM DD') >= '" +
                  (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date and to_date(c->>'timestamp', 'YYYY MM DD') <= '" +
                  (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date "+ 
            "GROUP BY pointid_point, title ), "+
          
          "sales AS ( "+
            "SELECT pointid_point, title, SUM(CAST(sales->>'value' as decimal)) AS values "+
            "FROM indicators, json_array_elements(readings) AS sales "+
            "WHERE title='Net Sales' and pid_proj = " + pid;

            if(filter.points.length > 0){
                 
              for(var pt = 0; pt < filter.points.length; pt++){

                if(pt == 0)
                  q2 += " and (pointid_point = "+filter.points[pt];
                else 
                  q2 += " or pointid_point = "+filter.points[pt];
              }
              q2 += ')';
                        
            }

            q2 +=" and to_date(sales->>'timestamp', 'YYYY MM DD') >= '" +
                  (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date and to_date(sales->>'timestamp', 'YYYY MM DD') <= '" +
                  (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date "+
            "GROUP BY pointid_point, title ) ";
            
            q2 += "SELECT customers.pointid_point, sales.values/customers.values as basket "+
                  "from customers, sales "+
                  "where customers.pointid_point = sales.pointid_point";

				client.query(q2, function(err2, result2)
				{
					if(err2) 
					{
            apiDebug(q2);
						client.end();
						console.log(q2);
						return console.error('getAccumRanking error running query ', err2);
					}

					var obj = {}
					obj = result2.rows;

          apiDebug(q2);
					res.json(obj);
					//res.json(null);
					client.end();
				});
			}

			else if(title =='Net Margin' && filter.dates.state == true) 
			{

        var point_query = "";
        if(filter.points.length > 0){
            for(var pt = 0; pt < filter.points.length; pt++){
              if(pt == 0){
                point_query += " and (pointid_point = "+filter.points[pt];
              } else {
                point_query += " or pointid_point = "+filter.points[pt];
              }
              if(pt == filter.points.length-1){
                point_query += ") ";
              }
            }
          }


        var q3 = "with "+
            "maxdate as (select max(to_date(c->>'timestamp', 'YYYY-MM-DD')) as max from indicators, json_array_elements(readings) as c "+
            "WHERE title='Net Margin' and pid_proj = "+pid+") "+
            "select queryb.pointid_point, ( (SUM(querya.values / 100 * queryb.values)) / (SUM(queryb.values)) ) *100 as acc_margin from "+
            "( "+
            "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
            "FROM indicators, json_array_elements(readings) AS c "+
            "WHERE title='Net Margin' and pid_proj = "+pid+" "+
            ""+point_query+" "+
            "and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= "+
            "'"+(filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "
            +" and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= "+
            "'"+(filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date "
            +"  "+
            "order by (c->>'hour')::numeric) as querya "+
            "right outer join "+
            "( "+
            "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
            "FROM indicators, json_array_elements(readings) AS c "+
            "WHERE title='Net Sales' and pid_proj = "+pid+" "+
            ""+point_query+" "+
            "and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= "+
            "'"+(filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date " +
            " and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= "+
            "'"+(filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date "+
            "  "+
           " order by (c->>'hour')::numeric "+
            ") as queryb "+
           " on ( (querya.hour is null or querya.hour = queryb.hour) and querya.date = queryb.date and querya.pointid_point = queryb.pointid_point)";

           q3 += " group by queryb.pointid_point";

          console.log("q3");
          console.log(q3);
          



				client.query(q3, function(err3, result3)
				{
					if(err3	) 
					{
            apiDebug(q3);
						client.end();
						console.log(q3);
						return console.error('getAccumRanking error running query ', err3);
					}

					var obj = {}
					obj = result3.rows;

          apiDebug(q3);
					res.json(obj);
					//res.json(null);
					client.end();
				});
			}

			else if(title =='Multiline Bills' && filter.dates.state == true) 
			{

				var q4 ="WITH "+ 

					"customers AS ( "+
						"select pointid_point, title, cast(cust->>'value' as decimal) as cust_vl, cust->>'timestamp' as dayy "+
						"from indicators, json_array_elements(readings) as cust " +
						"where title = 'Number of Customers' and pid_proj = " + pid;

            if(filter.points.length > 0){
                 
              for(var pt = 0; pt < filter.points.length; pt++){

                if(pt == 0)
                  q4 += " and( pointid_point = "+filter.points[pt];
                else 
                  q4 += " or pointid_point = "+filter.points[pt];
              }
              q2 += ')';
                        
            }

            q4+=" and to_date(cust->>'timestamp', 'YYYY MM DD') >= '" +
									(filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date and to_date(cust->>'timestamp', 'YYYY MM DD') <= '" +
									(filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date "+
						"ORDER BY pointid_point ), "+

					"multi AS ( "+
						"select pointid_point, title, cast(bills->>'value' as decimal)/100 as bills_vl, bills->>'timestamp' as dayy " +
						"from indicators, json_array_elements(readings) as bills " +
						"where title = 'Multiline Bills' and pid_proj = " + pid;

             if(filter.points.length > 0){
                 
              for(var pt = 0; pt < filter.points.length; pt++){

                if(pt == 0)
                  q4 += " and( pointid_point = "+filter.points[pt];
                else 
                  q4 += " or pointid_point = "+filter.points[pt];
              }
              q2 += ')';
                        
            }

            q4+=" and to_date(bills->>'timestamp', 'YYYY MM DD') >= '" +
									(filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date and to_date(bills->>'timestamp', 'YYYY MM DD') <= '" +
									(filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date "+
						"ORDER BY pointid_point), "+

					"bills_daily AS ( " +
						"select multi.pointid_point, multi.bills_vl*customers.cust_vl as bills, multi.dayy " +
						"from multi, customers " +
						"where multi.pointid_point = customers.pointid_point and to_date(customers.dayy, 'YYYY-MM-DD') = to_date(multi.dayy, 'YYYY-MM-DD')), " +

					"sum_customers AS ( " +
						"select pointid_point, title, sum(customers.cust_vl) as customers_total " +
						"from customers " +
						"GROUP BY pointid_point, title " +
						"ORDER BY pointid_point ), " +

					"sum_bills AS ( " +
						"select pointid_point, sum(bills) as bills_total " +
						"from bills_daily " + 
						"group by pointid_point " +
						"order by pointid_point) " +

					"select a.pointid_point, (a.bills_total/b.customers_total)*100 as acc_bills " +
						"from sum_customers as b , sum_bills as a " +
						"where a.pointid_point = b.pointid_point";
            //"GROUP BY a.pointid_point, a.bills_total, b.customers_total ";
						//"order by pointid_point";

				client.query(q4, function(err4, result4)
				{
					if(err4) 
					{
						client.end();
						console.log(q4);
            apiDebug(q4);
						return console.error('getAccumRanking error running query ', err4);
					}

					var obj = {}
					obj = result4.rows;

          apiDebug(q4);
					res.json(obj);
					//res.json(null);
					client.end();
				});
			}


			else {

				res.json(null);
				client.end();
			}
		});
	});
}

exports.getAccumDashboard = function(req, res){
  console.log("API CALL : getAccumDashboard")

  var pid = req.params.pid;
  var pointid = req.params.pointid;

  var client = new pg.Client(conString);

  var toReturn = [];

  client.connect(function(err) {

    if(err) {
      return console.error('could not connect to postgres', err);
    }

    apiDebug("\n\nConnected on getAccumDashboard");

    var point_query = "";
    if(pointid != undefined && pointid != '')
      point_query += " and pointid_point = "+pointid;

    // var q2 = "WITH "+
    //   "customers AS ( "+
    //     "SELECT SUM(CAST(c->>'value' as decimal)) AS values  "+
    //     "FROM indicators, json_array_elements(readings) AS c "+
    //     "WHERE title='Number of Customers' and pid_proj = " + pid;

    //     q2 += point_query;

    //     // possible bug: by doing to_date(max(pairs->>'timestamp'), 'YYYY MM DD')
    //     // were finding the maximum of a string and then converting it to date.
    //     // maybe we should be first converting to date and then finding its max.
    //     q2 +=" and to_date(c->>'timestamp', 'YYYY MM DD') = " +
    //            "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
    //           "from indicators, json_array_elements(indicators.readings) as pairs " +
    //           "where pid_proj = " + pid + ")),"+
      
    //   "sales AS ( "+
    //     "SELECT SUM(CAST(sales->>'value' as decimal)) AS values "+
    //     "FROM indicators, json_array_elements(readings) AS sales "+
    //     "WHERE title='Net Sales' and pid_proj = " + pid;

    //     q2 += point_query;

    //     q2 +=" and to_date(sales->>'timestamp', 'YYYY MM DD') = " +
    //           "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
    //           "from indicators, json_array_elements(indicators.readings) as pairs " +
    //           "where pid_proj = " + pid + "))";
        
    //     q2 += "SELECT sales.values/customers.values as basket "+
    //           "from customers, sales";



         var q2 = "with "+
            "maxdate as (select max(to_date(c->>'timestamp', 'YYYY-MM-DD')) as max from indicators, json_array_elements(readings) as c "+
            "WHERE title='Number of Customers' and pid_proj = "+pid+") "+
            "select ( (SUM(querya.values)) / (SUM(queryb.values)) )  as basket from "+
            "( "+
            "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
            "FROM indicators, json_array_elements(readings) AS c "+
            "WHERE title='Net Sales' and pid_proj = "+pid+" "+
            ""+point_query+" "+
            "and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate) and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate)  "+
            "order by (c->>'hour')::numeric) as querya "+
            "right outer join "+
            "( "+
            "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
            "FROM indicators, json_array_elements(readings) AS c "+
            "WHERE title='Number of Customers' and pid_proj = "+pid+" "+
            ""+point_query+" "+
            "and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate) and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate)  "+
           " order by (c->>'hour')::numeric "+
            ") as queryb "+
           " on ( (querya.hour is null or querya.hour = queryb.hour) and querya.date = queryb.date and querya.pointid_point = queryb.pointid_point)";

      apiDebug(q2);
      client.query(q2, function(err2, result2)
      {
        if(err2) 
        {
          apiDebug("\nError on getAccumDashboard 2");
          apiDebug(q2);
          client.end();
          console.log(q2);
          return console.error('getAccumDashboard error running query q2', err2);
        }

        apiDebug("q2 done");
        var obj = {}
        obj = result2.rows[0];
        apiDebug("obj\n");
        apiDebug(obj);
        toReturn.push(obj);
        apiDebug("q2 toReturn lenght " + toReturn.length);


        // var q3 ="WITH "+
        //   "perc AS ( "+
        //     "select pointid_point, title, cast(percent->>'value' as decimal)/100 as p_vl, percent->>'timestamp' as dayy "+
        //     ", percent->>'hour' as houry "+
        //     "from indicators, json_array_elements(readings) as percent "+
        //     "where title='Net Margin' and pid_proj = " + pid;

        //     q3 += point_query;

        //     q3 +=" and to_date(percent->>'timestamp', 'YYYY MM DD') = " +
        //           "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
        //         "from indicators, json_array_elements(indicators.readings) as pairs " +
        //         "where pid_proj = " + pid + ")"+
        //     "ORDER BY pointid_point ), "+
          
        //   "sales AS ( "+
        //     "select pointid_point, title, cast(sales->>'value' as decimal) as sales_vl, sales->>'timestamp' as dayy "+
        //     ", sales->>'hour' as houry "+
        //     "from indicators, json_array_elements(readings) as sales "+
        //     "where title='Net Sales' and pid_proj = " + pid;

        //     q3 += point_query;

        //     q3 +=" and to_date(sales->>'timestamp', 'YYYY MM DD') = " +
        //           "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
        //         "from indicators, json_array_elements(indicators.readings) as pairs " +
        //         "where pid_proj = " + pid + ")"+
        //     "ORDER BY pointid_point ), "+

        //   "pln AS ( "+
        //     "select perc.pointid_point, perc.houry, perc.p_vl*sales.sales_vl as pln_vl "+
        //     "from perc, sales "+
        //     "where perc.pointid_point = sales.pointid_point "+
        //     " and ( perc.houry is null or perc.houry = sales.houry ) "+
        //     "GROUP BY perc.pointid_point, sales.pointid_point, perc.p_vl, sales.sales_vl, perc.houry), "+

        //   "sum_pln AS ( "+
        //     "select sum(pln.pln_vl) as pln_total "+
        //     "from pln ), "+

        //   "revenue_daily AS ( "+
        //     "select pln.pln_vl/perc.p_vl as revenue, perc.dayy "+
        //     "from perc, pln "+
        //     "where perc.pointid_point = pln.pointid_point and ( perc.houry is null or perc.houry = pln.houry ) ), "+

        //   "sum_revenue AS ( "+
        //     "select sum(revenue) as rev_total "+
        //     "from revenue_daily) "+

        //   "select (a.pln_total/b.rev_total)*100 as acc_margin "+
        //   "from sum_revenue as b , sum_pln as a ";


        var q3 = "with "+
              "maxdate as (select max(to_date(c->>'timestamp', 'YYYY-MM-DD')) as max from indicators, json_array_elements(readings) as c "+
              "WHERE title='Net Margin' and pid_proj = "+pid+") "+
              "select ( (SUM(querya.values / 100 * queryb.values)) / (SUM(queryb.values)) ) *100 as acc_margin from "+
              "( "+
              "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
              "FROM indicators, json_array_elements(readings) AS c "+
              "WHERE title='Net Margin' and pid_proj = "+pid+" "+
              ""+point_query+" "+
              "and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate) and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate)  "+
              "order by (c->>'hour')::numeric) as querya "+
              "right outer join "+
              "( "+
              "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
              "FROM indicators, json_array_elements(readings) AS c "+
              "WHERE title='Net Sales' and pid_proj = "+pid+" "+
              ""+point_query+" "+
              "and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate) and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate)  "+
             " order by (c->>'hour')::numeric "+
              ") as queryb "+
             " on ( (querya.hour is null or querya.hour = queryb.hour) and querya.date = queryb.date and querya.pointid_point = queryb.pointid_point)";

          apiDebug(q3);
          client.query(q3, function(err3, result3)
          {
            if(err3 ) 
            {
              apiDebug("\nError on getAccumDashboard 3");
              apiDebug(q3);
              client.end();
              console.log(q3);
              return console.error('getAccumDashboard error running query q3 ', err3);
            }

            apiDebug("q3 done");
            var obj = {}
            obj = result3.rows[0];
            apiDebug("obj\n");
            apiDebug(obj);
            toReturn.push(obj);
            apiDebug("q3 toReturn lenght " + toReturn.length);

            // var q4 ="WITH "+ 

            //   "customers AS ( "+
            //     "select pointid_point, title, cast(cust->>'value' as decimal) as cust_vl, cust->>'timestamp' as dayy "+
            //     ", cust->>'hour' as houry "+
            //     "from indicators, json_array_elements(readings) as cust " +
            //     "where title = 'Number of Customers' and pid_proj = " + pid;

            //     q4 += point_query;

            //     q4+=" and to_date(cust->>'timestamp', 'YYYY MM DD') = " +
            //           "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
            //       "from indicators, json_array_elements(indicators.readings) as pairs " +
            //       "where pid_proj = " + pid + ")),"+
              
            //   "multi AS ( "+
            //     "select pointid_point, title, cast(bills->>'value' as decimal)/100 as bills_vl, bills->>'timestamp' as dayy " +
            //     ", bills->>'hour' as houry "+
            //     "from indicators, json_array_elements(readings) as bills " +
            //     "where title = 'Multiline Bills' and pid_proj = " + pid;

            //     q4 += point_query;

            //     q4+=" and to_date(bills->>'timestamp', 'YYYY MM DD') = " +
            //           "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
            //       "from indicators, json_array_elements(indicators.readings) as pairs " +
            //       "where pid_proj = " + pid + ")),"+

            //   "bills_daily AS ( " +
            //     "select multi.pointid_point, multi.bills_vl*customers.cust_vl as bills, multi.dayy " +
            //     ", multi.houry "+
            //     "from multi, customers " +
            //     "where multi.pointid_point = customers.pointid_point and ( multi.houry is null or multi.houry = customers.houry )), " +

            //   "sum_customers AS ( " +
            //     "select sum(customers.cust_vl) as customers_total " +
            //     "from customers), " +

            //   "sum_bills AS ( " +
            //     "select sum(bills) as bills_total " +
            //     "from bills_daily ) " +

            //   "select (a.bills_total/b.customers_total)*100 as acc_bills " +
            //     "from sum_customers as b , sum_bills as a ";



            var q4 = "with "+
              "maxdate as (select max(to_date(c->>'timestamp', 'YYYY-MM-DD')) as max from indicators, json_array_elements(readings) as c "+
              "WHERE title='Net Margin' and pid_proj = "+pid+") "+
              "select ( (SUM(querya.values / 100 * queryb.values)) / (SUM(queryb.values)) ) *100 as acc_bills from "+
              "( "+
              "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
              "FROM indicators, json_array_elements(readings) AS c "+
              "WHERE title='Multiline Bills' and pid_proj = "+pid+" "+
              ""+point_query+" "+
              "and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate) and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate)  "+
              "order by (c->>'hour')::numeric) as querya "+
              "right outer join "+
              "( "+
              "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
              "FROM indicators, json_array_elements(readings) AS c "+
              "WHERE title='Number of Customers' and pid_proj = "+pid+" "+
              ""+point_query+" "+
              "and  to_date(c->>'timestamp', 'YYYY-MM-DD') >= (select max from maxdate) and  to_date(c->>'timestamp', 'YYYY-MM-DD') <= (select max from maxdate)  "+
             " order by (c->>'hour')::numeric "+
              ") as queryb "+
             " on ( (querya.hour is null or querya.hour = queryb.hour) and querya.date = queryb.date and querya.pointid_point = queryb.pointid_point)";
      

            apiDebug(q4);
            client.query(q4, function(err4, result4) {
              if(err4) 
              {
                apiDebug("\nError on getAccumDashboard 2");
                client.end();
                console.log(q4);
                apiDebug(q4);
                return console.error('getAccumDashboard error running query q4   ', err4);
              }

              apiDebug("q4 done");
              var obj = {}
              obj = result4.rows[0];
              apiDebug("obj\n");
              apiDebug(obj);
              toReturn.push(obj);
              apiDebug("q4 toReturn lenght " + toReturn.length);

              var q5 = "Drop table if exists HoNTable; "
                    +"Drop table if exists HorNTable; "
                    +"Drop table if exists NPSvals; "
                    +"Drop table if exists NegVals; "
                    +"Drop table if exists VPvals; "
                    +"Drop table if exists Replies; "
                      
                    +"SELECT json_array_elements(readings) as dados "
                    +"INTO HoNTable "
                    +"FROM indicators "
                    +"WHERE title = 'NPS INDEX (HoN)' and pid_proj = "+pid+";"

                    +"Select dados->>'category' as Category, cast(dados->>'value' as int) as Values, dados->>'timestamp' as Dates "
                    +"into HorNTable "
                    +"from HoNTable; "

                    +"SELECT dates as datesNeg, sum(values)::float as AllNegValues "
                    +"into NegVals "
                    +"from HorNTable "
                    +"where category LIKE '%Negative%' "
                    +"group by dates  "
                    +"order by dates DESC; "

                    +"SELECT dates as datesTot, sum(values)::float as AllReplies "
                    +"into Replies "
                    +"from HorNTable "
                    +"group by dates "
                    +"order by dates DESC; "

                    +"SELECT dates, sum(values)::float as VPValues "
                    +"into VPvals "
                    +"from HorNTable "
                    +"where category = 'Very Positive' " 
                    +"group by dates "
                    +"order by dates DESC; "

                    +" select dates, ((vpvalues-allnegvalues)/AllReplies)*100 as NPS from VPvals, NegVals, Replies "
                    +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) "
                    +"and AllReplies > 0 "
                    +"union "

                    +"select dates, allreplies as NPS from VPvals, NegVals, Replies "
                    +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) "
                    +"and AllReplies = 0  "
                    +"order by dates DESC; "

                    +"Drop table if exists HoNTable; "
                    +"Drop table if exists HorNTable; "
                    +"Drop table if exists NPSvals; "
                    +"Drop table if exists NegVals; "
                    +"Drop table if exists VPvals; "
                    +"Drop table if exists Replies; ";

            apiDebug(q5);
            client.query(q5, function(err5, result5) {
              if(err5) 
              {
                apiDebug("\nError on getAccumDashboard 5");
                client.end();
                console.log(q5);
                apiDebug(q5);
                return console.error('getAccumDashboard error running query q5   ', err5);
              }

              apiDebug("q5 done");
              var obj = {}
              obj = result5.rows[0];
              apiDebug("obj\n");
              apiDebug(obj);
              toReturn.push(obj);
              apiDebug("q5 toReturn lenght " + toReturn.length);

              res.json(toReturn);
              apiDebug("res json");
              client.end();
            });
            });
          });


      });
    
  });

}





exports.getWidgetValues = function(req, res){
  console.log("API CALL : getWidgetValues");
  var pid = req.params.pid;
  var title = req.body.title;
  var filter = req.body.filter;

  if(filter.dates.hasOwnProperty('startdate') && !filter.dates.hasOwnProperty('startDate')){
    filter.dates.startDate = filter.dates.startdate;
  }
  if(filter.dates.hasOwnProperty('finishdate') && !filter.dates.hasOwnProperty('endDate')){
    filter.dates.endDate = filter.dates.finishdate;
  }

  filter.dates.aggrmethod = req.body.filter.aggrmethod; // not good best ideia 

  var toReturn = [];

  dataaccess.getTotalValue(pid, title, filter.dates, function(result, kpi_title){
    toReturn.push(result[0].values);
    toReturn.push(null); // legacy code is expecting an element on the middle of the returning array, but doesnt use it

    // added to handle comparision calculation
    // TODO: support points filter on getComparingIntervalsValues
    // if(filter.dates.state == true || filter.points.length > 0){
    if(filter.dates.state == true){

      dashboarddata.getComparingIntervalsValues(pid, {"title": title, aggrmethod: req.body.filter.aggrmethod}, {"startDate": filter.dates.startdate, "endDate": filter.dates.finishdate}, function(resultWidget){
        toReturn.push({"homologousValue": resultWidget.homologousValue});
        
        res.json(toReturn);
      });

    } else {
      res.json(toReturn);
    }

  });

}






exports.getTotalNetSales = function(req, res){
  console.log("API CALL : getTotalNetSales")

  var pid = req.params.pid;

  var client = new pg.Client(conString);

  var toReturn = [];

  var filter = req.body;


  client.connect(function(err) {

    if(err) {
      return console.error('could not connect to postgres', err);
    }

    
    var q2 = "SELECT sum(CAST(c->>'value' as decimal)) AS value "+
      "FROM indicators, json_array_elements(readings) AS c "+
      "WHERE title='Net Sales' and pid_proj = "+ pid;

    if(filter.points.length > 0){
                 
      for(var pt = 0; pt < filter.points.length; pt++)
      {

        if(pt == 0)
          q2 += " and( pointid_point = "+filter.points[pt];
        else 
          q2 += " or pointid_point = "+filter.points[pt];
          
      }
      q2 += ") ";
    }

    if(filter.dates.state == true)
    {
      q2+=" and to_date(c->>'timestamp', 'YYYY MM DD') >= '" +
                  (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                  "and to_date(c->>'timestamp', 'YYYY MM DD') <= '" +
                  (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
    }

    else
    {
      q2 += " and to_date(c->>'timestamp', 'YYYY MM DD') = "+
            "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
        "from indicators, json_array_elements(indicators.readings) as pairs " +
        "where pid_proj = " + pid + 
        " and title='Net Sales'"+
        ")";
    }

    apiDebug(q2);

    client.query(q2, function(err2, result2)
    {
      if(err2) 
      {
        apiDebug(q2);
        client.end();
        console.log(q2);
        return console.error('totalNetSales error running query q2', err2);
      }

      var obj = [];
      obj = result2.rows[0].value;
      apiDebug("obj is");
      apiDebug(obj);
      toReturn.push(obj);



      var q3 ="SELECT sum(CAST(c->>'value' as decimal))::int as value, extract(EPOCH FROM to_date(c->>'timestamp', 'YYYY MM DD'))*1000 as dayy "+
      "FROM indicators, json_array_elements(readings) AS c WHERE title='Net Sales' and pid_proj =" + pid; 

        if(filter.points.length > 0){
                         
          for(var pt = 0; pt < filter.points.length; pt++)
          {
            if(pt == 0)
              q3 += " and( pointid_point = "+filter.points[pt];
            else 
              q3 += " or pointid_point = "+filter.points[pt];
          }
          q3 += ") ";
        }

        if(filter.dates.state == true)
        {
          q3+=" and to_date(c->>'timestamp', 'YYYY MM DD') >= '" +
                      (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                      "and to_date(c->>'timestamp', 'YYYY MM DD') <= '" +
                      (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
        }

        else
        {
          var date = new Date();
          date.setDate(date.getDate() - 30);

          date = date.getFullYear() +  "-" + (date.getMonth()+1) + "-"  +  date.getDate();

          q3 += " and to_date(c->>'timestamp', 'YYYY MM DD') >= to_timestamp('" +
                      date + "', 'YYYY MM DD')::date "+
                " and to_date(c->>'timestamp', 'YYYY MM DD') <= "+
                "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
            "from indicators, json_array_elements(indicators.readings) as pairs " +
            "where pid_proj = " + pid + "  and title = 'Net Sales') ";
        }       
        
        q3 += " GROUP BY dayy ORDER BY dayy";


        apiDebug("q3");
        apiDebug(q3);


        client.query(q3, function(err3, result3)
        {
          if(err3) 
          {
            client.end();
            console.log(q3);
            apiDebug(q3);
            return console.error('totalNetSales error running query q3   ', err3);
          }

          var obj = []

          for(var i = 0; i < result3.rows.length; i++)
          {
              var temp = [];

              temp.push(result3.rows[i].dayy)
              temp.push(result3.rows[i].value)

              obj.push(temp);
          }

          apiDebug("obj for q3 is ");
          apiDebug(obj);
          apiDebug("\n\n");

          toReturn.push(obj);

          // added to handle comparision calculation
          // TODO: support points filter on getComparingIntervalsValues
          // if(filter.dates.state == true || filter.points.length > 0){
          if(filter.dates.state == true){

            dashboarddata.getComparingIntervalsValues(pid, {"title": "Net Sales"}, {"startDate": filter.dates.startdate, "endDate": filter.dates.finishdate}, function(widget){
              toReturn.push({"homologousValue": widget.homologousValue});
              
              res.json(toReturn);
              client.end();
            });

          } else {
            res.json(toReturn);
            client.end();
          }

        });
      
    });
      

    

  });
}

exports.getTotalCustomers = function(req, res){
  console.log("API CALL : getTotalCustomers")

  var pid = req.params.pid;

  var client = new pg.Client(conString);

  var toReturn = [];

  var filter = req.body;


  client.connect(function(err) {

    if(err) {
      return console.error('could not connect to postgres', err);
    }

    
    var q2 = "SELECT SUM(CAST(c->>'value' as decimal)) AS value "+
            "FROM indicators, json_array_elements(readings) AS c "+
            " WHERE title='Number of Customers' and pid_proj = "+ pid;

          if(filter.points.length > 0){
                       
            for(var pt = 0; pt < filter.points.length; pt++)
            {

              if(pt == 0)
                q2 += " and( pointid_point = "+filter.points[pt];
              else 
                q2 += " or pointid_point = "+filter.points[pt];
            }
            q2 += ") ";
                      
          }

          if(filter.dates.state == true)
          {
            q2+=" and to_date(c->>'timestamp', 'YYYY MM DD') >= '" +
                        (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                        "and to_date(c->>'timestamp', 'YYYY MM DD') <= '" +
                        (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
          }

          else
          {
            q2 += " and to_date(c->>'timestamp', 'YYYY MM DD') = "+
                  "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
              "from indicators, json_array_elements(indicators.readings) as pairs " +
              "where title='Number of Customers' and pid_proj = " + pid + ")";
          }       
  
    client.query(q2, function(err2, result2)
    {
      if(err2) 
      {
        apiDebug(q2);
        client.end();
        console.log(q2);
        return console.error('getTotalCustomers error running query q2', err2);
      }

      var obj = [];
      obj = result2.rows[0].value;
      toReturn.push(obj);





      var q3 ="SELECT sum(CAST(c->>'value' as decimal))::int as value, extract(EPOCH FROM to_date(c->>'timestamp', 'YYYY MM DD'))*1000 as dayy "+
      "FROM indicators, json_array_elements(readings) AS c "+
      "WHERE title='Number of Customers' and pid_proj =" + pid;

        if(filter.points.length > 0){
                         
          for(var pt = 0; pt < filter.points.length; pt++)
          {
            if(pt == 0)
              q3 += " and( pointid_point = "+filter.points[pt];
            else 
              q3 += " or pointid_point = "+filter.points[pt];
          }         

          q3 += ") ";
        }

        if(filter.dates.state == true)
        {
          q3+=" and to_date(c->>'timestamp', 'YYYY MM DD') >= '" +
                      (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                      "and to_date(c->>'timestamp', 'YYYY MM DD') <= '" +
                      (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
        }

        else
        {
          var date = new Date();
          date.setDate(date.getDate() - 30);

          date = date.getFullYear() +  "-" + (date.getMonth()+1) + "-"  +  date.getDate();

          q3 += " and to_date(c->>'timestamp', 'YYYY MM DD') >= to_timestamp('" +
                      date + "', 'YYYY MM DD')::date "+
                " and to_date(c->>'timestamp', 'YYYY MM DD') <= "+
                "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
                    "from indicators, json_array_elements(indicators.readings) as pairs " +
                    "where title='Number of Customers' and pid_proj = " + pid + ") ";
        }       
        
        q3 += " GROUP BY dayy ORDER BY dayy";



      client.query(q3, function(err3, result3)
      {
        if(err3) 
        {
          client.end();
          console.log(q3);
          apiDebug(q3);
          return console.error('getTotalCustomers error running query q3   ', err3);
        }

        var obj = []

        for(var i = 0; i < result3.rows.length; i++)
        {
            var temp = [];

            temp.push(result3.rows[i].dayy)
            temp.push(result3.rows[i].value)

            obj.push(temp);
        }

        toReturn.push(obj);

        // added to handle comparision calculation
        // TODO: support points filter on getComparingIntervalsValues
        // if(filter.dates.state == true || filter.points.length > 0){
        if(filter.dates.state == true){

          dashboarddata.getComparingIntervalsValues(pid, {"title": "Number of Customers"}, {"startDate": filter.dates.startdate, "endDate": filter.dates.finishdate}, function(widget){
            toReturn.push({"homologousValue": widget.homologousValue});
            
            res.json(toReturn);
            client.end();
          });

        } else {
          res.json(toReturn);
          client.end();
        }

      });

    }); // END q2
      

    
    

  });
}


exports.getTotalBasket = function(req, res){
  console.log("API CALL : getTotalBasket")

  var pid = req.params.pid;

  var client = new pg.Client(conString);

  var toReturn = [];

  var filter = req.body;


  client.connect(function(err) {

    if(err) {
      return console.error('could not connect to postgres', err);
    }

    
    var q2 = 
      "WITH " +

      "customers as (" +
        "SELECT SUM(CAST(c->>'value' as decimal)) AS values " +
        "FROM indicators, json_array_elements(readings) AS c " +
        "WHERE title='Number of Customers' and pid_proj = " + pid;

        if(filter.points.length > 0){
                     
          for(var pt = 0; pt < filter.points.length; pt++)
          {

            if(pt == 0)
              q2 += " and( pointid_point = "+filter.points[pt];
            else 
              q2 += " or pointid_point = "+filter.points[pt];
              
          }
          q2 += ") ";            
        }

        if(filter.dates.state == true)
        {
          q2+=" and to_date(c->>'timestamp', 'YYYY MM DD') >= '" +
                      (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                      "and to_date(c->>'timestamp', 'YYYY MM DD') <= '" +
                      (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
        }

        else
        {
          q2 += " and to_date(c->>'timestamp', 'YYYY MM DD') = "+
                "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
            "from indicators, json_array_elements(indicators.readings) as pairs " +
            "where title='Number of Customers' and pid_proj = " + pid + ")";
        }

        q2 += "), ";

    q2 += 
        "sales as (" +
          "SELECT SUM(CAST(c->>'value' as decimal)) AS values " +
          "FROM indicators, json_array_elements(readings) AS c " +
          "WHERE title='Net Sales' and pid_proj = " + pid;

          if(filter.points.length > 0){
                     
            for(var pt = 0; pt < filter.points.length; pt++)
            {

              if(pt == 0)
                q2 += " and( pointid_point = "+filter.points[pt];
              else 
                q2 += " or pointid_point = "+filter.points[pt];
              
            }

            q2 += ") ";            
          }

          if(filter.dates.state == true)
          {
            q2+=" and to_date(c->>'timestamp', 'YYYY MM DD') >= '" +
                        (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                        "and to_date(c->>'timestamp', 'YYYY MM DD') <= '" +
                        (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
          }

          else
          {
            q2 += " and to_date(c->>'timestamp', 'YYYY MM DD') = "+
                  "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
              "from indicators, json_array_elements(indicators.readings) as pairs " +
              "where title='Net Sales' and pid_proj = " + pid + ")";
          }

          q2 += ") ";
      
      q2 += "SELECT sales.values/customers.values as value from customers, sales";

    client.query(q2, function(err2, result2)
    {
      if(err2) 
      {
        apiDebug(q2);
        client.end();
        console.log(q2);
        return console.error('getTotalBasket error running query q2', err2);
      }

      var obj = [];
      obj = result2.rows[0].value;
      toReturn.push(obj);




      var q3 =
        "WITH "+
        "customers AS ( "+
          "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'timestamp' as dayy "+
          "FROM indicators, json_array_elements(readings) AS c "+
          "WHERE title='Number of Customers' and pid_proj = " + pid;



          if(filter.points.length > 0){
                           
            for(var pt = 0; pt < filter.points.length; pt++)
            {
              if(pt == 0)
                q3 += " and( pointid_point = "+filter.points[pt];
              else 
                q3 += " or pointid_point = "+filter.points[pt];
            }
            q3 += ") ";
          }

          if(filter.dates.state == true)
          {
            q3+=" and to_date(c->>'timestamp', 'YYYY MM DD') >= '" +
                        (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                        "and to_date(c->>'timestamp', 'YYYY MM DD') <= '" +
                        (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
          }

          else
          {
            var date = new Date();
            date.setDate(date.getDate() - 30);

            date = date.getFullYear() +  "-" + (date.getMonth()+1) + "-"  +  date.getDate();

            q3 += " and to_date(c->>'timestamp', 'YYYY MM DD') >= to_timestamp('" +
                        date + "', 'YYYY MM DD')::date "+
                  " and to_date(c->>'timestamp', 'YYYY MM DD') <= "+
                  "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
              "from indicators, json_array_elements(indicators.readings) as pairs " +
              "where title='Number of Customers' and pid_proj = " + pid + ") ";
          }       
          
          q3 += "), ";

        q3 += 
          "sales AS ("+
            "SELECT pointid_point, title, CAST(sales->>'value' as decimal) AS values, sales->>'timestamp' as dayy  "+
            "FROM indicators, json_array_elements(readings) AS sales "+
            "WHERE title='Net Sales' and pid_proj = " + pid;


            if(filter.points.length > 0){
                             
              for(var pt = 0; pt < filter.points.length; pt++)
              {
                if(pt == 0)
                  q3 += " and( pointid_point = "+filter.points[pt];
                else 
                  q3 += " or pointid_point = "+filter.points[pt];
              }
              q3 += ") ";
            }

            if(filter.dates.state == true)
            {
              q3+=" and to_date(sales->>'timestamp', 'YYYY MM DD') >= '" +
                          (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                          "and to_date(sales->>'timestamp', 'YYYY MM DD') <= '" +
                          (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
            }

            else
            {
              var date = new Date();
              date.setDate(date.getDate() - 30);

              date = date.getFullYear() +  "-" + (date.getMonth()+1) + "-"  +  date.getDate();

              q3 += " and to_date(sales->>'timestamp', 'YYYY MM DD') >= to_timestamp('" +
                          date + "', 'YYYY MM DD')::date "+
                    " and to_date(sales->>'timestamp', 'YYYY MM DD') <= "+
                    "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
                "from indicators, json_array_elements(indicators.readings) as pairs " +
                "where title='Net Sales' and pid_proj = " + pid + ") ";
            }       
            
          q3 += "), ";

        q3 += "sum_customers AS ( SELECT SUM(customers.values) as customers_vl, customers.dayy from customers GROUP BY customers.dayy), ";
        q3 += "sum_sales AS ( SELECT SUM(sales.values) as sales_vl, sales.dayy from sales GROUP BY sales.dayy) ";
        q3 += "SELECT EXTRACT(EPOCH FROM to_date(sum_sales.dayy, 'YYYY MM DD' ))*1000 as dayy, (sum_sales.sales_vl/sum_customers.customers_vl) as value from sum_customers, sum_sales where sum_customers.dayy = sum_sales.dayy ORDER BY dayy ";


      client.query(q3, function(err3, result3)
      {
        if(err3) 
        {
          client.end();
          console.log(q3);
          apiDebug(q3);
          return console.error('getTotalBasket error running query q3   ', err3);
        }

        var obj = []

        for(var i = 0; i < result3.rows.length; i++)
        {
            var temp = [];

            temp.push(result3.rows[i].dayy);
            temp.push(parseFloat(parseFloat(result3.rows[i].value).toFixed(2)));

            obj.push(temp);
        }

        toReturn.push(obj);

        // added to handle comparision calculation
        // TODO: support points filter on getComparingIntervalsValues
        // if(filter.dates.state == true || filter.points.length > 0){
        if(filter.dates.state == true){

          dashboarddata.getComparingIntervalsValues(pid, {"title": "Basket"}, {"startDate": filter.dates.startdate, "endDate": filter.dates.finishdate}, function(widget){
            toReturn.push({"homologousValue": widget.homologousValue});
            
            res.json(toReturn);
            client.end();
          });

        } else {
          res.json(toReturn);
          client.end();
        }
      });


    }); // END q2
      

    

  });
}

exports.getTotalNetMargin = function(req, res){
  console.log("API CALL : getTotalNetMargin")

  var pid = req.params.pid;

  var client = new pg.Client(conString);

  var toReturn = [];

  var filter = req.body;


  client.connect(function(err) {

    if(err) {
      return console.error('could not connect to postgres', err);
    }

    
    var q2 = 
      "WITH " +

      "perc as (" +
        "select pointid_point, title, cast(percent->>'value' as decimal)/100 as p_vl, percent->>'timestamp' as dayy " +
        "from indicators, json_array_elements(readings) as percent " +
        "where title='Net Margin' and pid_proj = " + pid;

        if(filter.points.length > 0){
                     
          for(var pt = 0; pt < filter.points.length; pt++)
          {

            if(pt == 0)
              q2 += " and( pointid_point = "+filter.points[pt];
            else 
              q2 += " or pointid_point = "+filter.points[pt];
              
          }
          q2 += ") ";            
        }

        if(filter.dates.state == true)
        {
          q2+=" and to_date(percent->>'timestamp', 'YYYY MM DD') >= '" +
                      (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                      "and to_date(percent->>'timestamp', 'YYYY MM DD') <= '" +
                      (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
        }

        else
        {
          q2 += " and to_date(percent->>'timestamp', 'YYYY MM DD') = "+
                "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
            "from indicators, json_array_elements(indicators.readings) as pairs " +
            "where title='Net Margin' and pid_proj = " + pid + ")";
        }

        q2 += "), ";

    q2 += 
        "sales as (" +
          "select pointid_point, title, cast(c->>'value' as decimal) as sales_vl, c->>'timestamp' as dayy " +
          "FROM indicators, json_array_elements(readings) AS c " +
          "WHERE title='Net Sales' and pid_proj = " + pid;

          if(filter.points.length > 0){
                     
            for(var pt = 0; pt < filter.points.length; pt++)
            {

              if(pt == 0)
                q2 += " and( pointid_point = "+filter.points[pt];
              else 
                q2 += " or pointid_point = "+filter.points[pt];
              
            }

            q2 += ") ";            
          }

          if(filter.dates.state == true)
          {
            q2+=" and to_date(c->>'timestamp', 'YYYY MM DD') >= '" +
                        (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                        "and to_date(c->>'timestamp', 'YYYY MM DD') <= '" +
                        (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
          }

          else
          {
            q2 += " and to_date(c->>'timestamp', 'YYYY MM DD') = "+
                  "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
              "from indicators, json_array_elements(indicators.readings) as pairs " +
              "where title='Net Sales' and pid_proj = " + pid + ")";
          }

          q2 += "), ";
      
      q2 +=
        "pln AS (" +
          "select perc.pointid_point, perc.p_vl*sales.sales_vl as pln_vl, perc.dayy as dayy " +
          "from perc, sales " +
          "where perc.pointid_point = sales.pointid_point and to_date(perc.dayy, 'YYYY-MM-DD') = to_date(sales.dayy, 'YYYY-MM-DD')), "+
        
        "sum_pln AS ( select sum(pln.pln_vl) as pln_total from pln), " +
        "revenue_daily AS ( select perc.pointid_point, pln.pln_vl/perc.p_vl as revenue, perc.dayy from perc, pln where perc.pointid_point = pln.pointid_point and to_date(perc.dayy, 'YYYY-MM-DD') = to_date(pln.dayy, 'YYYY-MM-DD')), " +
        "sum_revenue AS (select sum(revenue) as rev_total from revenue_daily) " +
        "select (a.pln_total/b.rev_total)*100 as value from sum_revenue as b , sum_pln as a ";



        var point_query = "";
        if(filter.points.length > 0){
            for(var pt = 0; pt < filter.points.length; pt++){
              if(pt == 0){
                point_query += " and (pointid_point = "+filter.points[pt];
              } else {
                point_query += " or pointid_point = "+filter.points[pt];
              }
              if(pt == filter.points.length-1){
                point_query += ") ";
              }
            }
          }


        var q2 = "with "+
            "maxdate as (select max(to_date(c->>'timestamp', 'YYYY-MM-DD')) as max from indicators, json_array_elements(readings) as c "+
            "WHERE title='Net Margin' and pid_proj = "+pid+") "+
            "select ( (SUM(querya.values / 100 * queryb.values)) / (SUM(queryb.values)) ) *100 as acc_margin from "+
            "( "+
            "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
            "FROM indicators, json_array_elements(readings) AS c "+
            "WHERE title='Net Margin' and pid_proj = "+pid+" "+
            ""+point_query+" "

            if(filter.dates.state == true){
              q2+=" and to_date(c->>'timestamp', 'YYYY MM DD') >= '" +
                          (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                          "and to_date(c->>'timestamp', 'YYYY MM DD') <= '" +
                          (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
            } else {
              q2 += " and to_date(c->>'timestamp', 'YYYY MM DD') = "+
                    "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
                "from indicators, json_array_elements(indicators.readings) as pairs " +
                "where title='Net Sales' and pid_proj = " + pid + ")";
            }

            q2 += "  "+
            "order by (c->>'hour')::numeric) as querya "+
            "right outer join "+
            "( "+
            "SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
            "FROM indicators, json_array_elements(readings) AS c "+
            "WHERE title='Net Sales' and pid_proj = "+pid+" "+
            ""+point_query+" ";

            if(filter.dates.state == true){
              q2+=" and to_date(c->>'timestamp', 'YYYY MM DD') >= '" +
                          (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                          "and to_date(c->>'timestamp', 'YYYY MM DD') <= '" +
                          (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
            } else {
              q2 += " and to_date(c->>'timestamp', 'YYYY MM DD') = "+
                    "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
                "from indicators, json_array_elements(indicators.readings) as pairs " +
                "where title='Net Sales' and pid_proj = " + pid + ")";
            }

            q2 += "  "+
           " order by (c->>'hour')::numeric "+
            ") as queryb "+
           " on ( (querya.hour is null or querya.hour = queryb.hour) and querya.date = queryb.date and querya.pointid_point = queryb.pointid_point)";




    client.query(q2, function(err2, result2)
    {
      if(err2) 
      {
        apiDebug(q2);
        client.end();
        console.log(q2);
        res.json(toReturn);
        return console.error('getTotalNetMargin error running query q2', err2);
      }

      var obj = [];
      obj = result2.rows[0].value;
      toReturn.push(obj);

        var datestring = "";

        if(filter.dates.state == true){
          datestring+=" and to_date(c->>'timestamp', 'YYYY MM DD') >= '" +
                      (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                      "and to_date(c->>'timestamp', 'YYYY MM DD') <= '" +
                      (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
        }
        else
        {
          var date = new Date();
          date.setDate(date.getDate() - 30);
          date = date.getFullYear() +  "-" + (date.getMonth()+1) + "-"  +  date.getDate();
          datestring += " and to_date(c->>'timestamp', 'YYYY MM DD') >= to_timestamp('" +
                      date + "', 'YYYY MM DD')::date "+
                " and to_date(c->>'timestamp', 'YYYY MM DD') <= "+
                "(select max from maxdate) ";
        }


        var q3 = "WITH mindate as (select min(to_date(c->>'timestamp', 'YYYY-MM-DD')) as min from indicators, "+
          " json_array_elements(readings) as c"+
           " WHERE title='Net Sales' and pid_proj = " + pid + " ";

           if(filter.points.length > 0){
                             
              for(var pt = 0; pt < filter.points.length; pt++)
              {
                if(pt == 0)
                  q3 += " and( pointid_point = "+filter.points[pt];
                else 
                  q3 += " or pointid_point = "+filter.points[pt];
              }
              q3 += ") ";
            }

           q3 += "),"+
          " maxdate as (select max(to_date(c->>'timestamp', 'YYYY-MM-DD')) as max from indicators, json_array_elements(readings) as c "+
            " WHERE title='Net Sales' and pid_proj = " + pid + " ";

            if(filter.points.length > 0){
                             
              for(var pt = 0; pt < filter.points.length; pt++)
              {
                if(pt == 0)
                  q3 += " and( pointid_point = "+filter.points[pt];
                else 
                  q3 += " or pointid_point = "+filter.points[pt];
              }
              q3 += ") ";
            }

            q3 += ") "+

            " select * from ( "+

           " select EXTRACT(EPOCH FROM to_date(querya.date, 'YYYY-MM-DD' ))*1000 as dayy , ( (SUM(querya.values / 100 * queryb.values)) / (SUM(queryb.values)) ) *100 as value "+
           " from ( "+
          " SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
            " FROM indicators, json_array_elements(readings) AS c "+
          " WHERE title='Net Margin' and pid_proj = " + pid + " ";

          if(filter.points.length > 0){
                           
            for(var pt = 0; pt < filter.points.length; pt++)
            {
              if(pt == 0)
                q3 += " and( pointid_point = "+filter.points[pt];
              else 
                q3 += " or pointid_point = "+filter.points[pt];
            }
            q3 += ") ";
          }

          q3 += datestring +
           " order by (c->>'hour')::numeric"+
          " ) as querya "+
          " right outer join "+
          " ( SELECT pointid_point, title, CAST(c->>'value' as decimal) AS values, c->>'hour' as hour, c->>'timestamp' as date "+
            " FROM indicators, json_array_elements(readings) AS c WHERE title='Net Sales' and pid_proj = " + pid + " ";


            if(filter.points.length > 0){
                             
              for(var pt = 0; pt < filter.points.length; pt++)
              {
                if(pt == 0)
                  q3 += " and( pointid_point = "+filter.points[pt];
                else 
                  q3 += " or pointid_point = "+filter.points[pt];
              }
              q3 += ") ";
            }

           q3 += datestring +
           " order by (c->>'hour')::numeric "+
          " ) as queryb "+
          " on ( (querya.hour is null or querya.hour = queryb.hour) and querya.date = queryb.date and querya.pointid_point = queryb.pointid_point) "+
          " group by querya.date "+
          " order by dayy " +

          ") as aaa where value is not null";



          console.log("\n\nQ3:");
          console.log(q3);


        var filter_obj = {"startDate": "MAX", "endDate": "MAX"};

        dataaccess.getTotalValue(pid, 'Net Margin', filter_obj, function(result, kpi_title){

          console.log("getTotalValue result for "+kpi_title+":");
          if(result != null & result != undefined && result[0] != null & result[0] != undefined){
            console.log(result[0].values);
            toReturn[0] = parseFloat(result[0].values);
          } else {
            console.log(result);
          }


          client.query(q3, function(err3, result3)
          {
            if(err3) 
            {
              client.end();
              console.log(q3);
              apiDebug(q3);
              res.json(toReturn);
              return console.error('getTotalNetMargin error running query q3   ', err3);
            }

            var obj = []

            for(var i = 0; i < result3.rows.length; i++)
            {
                var temp = [];

                temp.push(result3.rows[i].dayy);
                temp.push( parseFloat(parseFloat( result3.rows[i].value ).toFixed(2))  );

                obj.push(temp);
            }

            toReturn.push(obj);

            // added to handle comparision calculation
            // TODO: support points filter on getComparingIntervalsValues
            // if(filter.dates.state == true || filter.points.length > 0){
            if(filter.dates.state == true){

              dashboarddata.getComparingIntervalsValues(pid, {"title": "Net Margin"}, {"startDate": filter.dates.startdate, "endDate": filter.dates.finishdate}, function(widget){
                toReturn.push({"homologousValue": widget.homologousValue});
                
                res.json(toReturn);
                client.end();
              });

            } else {
              res.json(toReturn);
              client.end();
            }




          });

        });



    }); // END q2
      

    

  });
}

exports.getTotalMultilineBills = function(req, res){
  console.log("API CALL : getTotalMultilineBills")

  var pid = req.params.pid;

  var client = new pg.Client(conString);

  var toReturn = [];

  var filter = req.body;


  client.connect(function(err) {

    if(err) {
      return console.error('could not connect to postgres', err);
    }

    
    var q2 = 
      "WITH " +

      "customers AS (" +
        "select pointid_point, title, cast(cust->>'value' as decimal) as cust_vl, cust->>'timestamp' as dayy " +
        "from indicators, json_array_elements(readings) as cust  " +
        "where title = 'Number of Customers' and pid_proj = " + pid;

        if(filter.points.length > 0){
                     
          for(var pt = 0; pt < filter.points.length; pt++)
          {

            if(pt == 0)
              q2 += " and( pointid_point = "+filter.points[pt];
            else 
              q2 += " or pointid_point = "+filter.points[pt];
              
          }
          q2 += ") ";            
        }

        if(filter.dates.state == true)
        {
          q2+=" and to_date(cust->>'timestamp', 'YYYY MM DD') >= '" +
                      (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                      "and to_date(cust->>'timestamp', 'YYYY MM DD') <= '" +
                      (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
        }

        else
        {
          q2 += " and to_date(cust->>'timestamp', 'YYYY MM DD') = "+
                "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
            "from indicators, json_array_elements(indicators.readings) as pairs " +
            "where title = 'Number of Customers' and pid_proj = " + pid + ")";
        }

        q2 += "), ";

    q2 += 
        "multi AS (" +
          "select pointid_point, title, cast(bills->>'value' as decimal)/100 as bills_vl, bills->>'timestamp' as dayy  " +
          "from indicators, json_array_elements(readings) as bills " +
          "where title = 'Multiline Bills' and pid_proj =  " + pid;

          if(filter.points.length > 0){
                     
            for(var pt = 0; pt < filter.points.length; pt++)
            {

              if(pt == 0)
                q2 += " and( pointid_point = "+filter.points[pt];
              else 
                q2 += " or pointid_point = "+filter.points[pt];
              
            }

            q2 += ") ";            
          }

          if(filter.dates.state == true)
          {
            q2+=" and to_date(bills->>'timestamp', 'YYYY MM DD') >= '" +
                        (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                        "and to_date(bills->>'timestamp', 'YYYY MM DD') <= '" +
                        (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
          }

          else
          {
            q2 += " and to_date(bills->>'timestamp', 'YYYY MM DD') = "+
                  "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
              "from indicators, json_array_elements(indicators.readings) as pairs " +
              "where title = 'Multiline Bills' and pid_proj = " + pid + ")";
          }

          q2 += "), ";
      
      q2 +=
        "bills_daily AS ( select multi.pointid_point, multi.bills_vl*customers.cust_vl as bills, multi.dayy from multi, customers where multi.pointid_point = customers.pointid_point and to_date(customers.dayy, 'YYYY-MM-DD') = to_date(multi.dayy, 'YYYY-MM-DD')), " +
        "sum_customers AS (select sum(customers.cust_vl) as customers_total from customers), " +
        "sum_bills AS ( select sum(bills) as bills_total from bills_daily) " +
        "select (a.bills_total/b.customers_total)*100 as value from sum_customers as b , sum_bills as a ";


        apiDebug("\n\ngetTotalMultilineBills CALL");
        apiDebug(q2);

    client.query(q2, function(err2, result2)
    {
      if(err2) 
      {
        apiDebug(q2);
        client.end();
        console.log(q2);
        return console.error('getTotalMultilineBills error running query q2', err2);
      }

      var obj = [];
      obj = result2.rows[0].value;
      toReturn.push(obj);

      apiDebug("\ngetTotalMultilineBills q2 OK, calling dataaccess.getTotalValue");


      var q3 =
        "WITH "+

        "customers AS (" +
          "select pointid_point, title, cast(cust->>'value' as decimal) as cust_vl, cust->>'timestamp' as dayy " +
          "from indicators, json_array_elements(readings) as cust " +
          "where title = 'Number of Customers' and pid_proj = " + pid;



          if(filter.points.length > 0){
                           
            for(var pt = 0; pt < filter.points.length; pt++)
            {
              if(pt == 0)
                q3 += " and( pointid_point = "+filter.points[pt];
              else 
                q3 += " or pointid_point = "+filter.points[pt];
            }
            q3 += ") ";
          }

          if(filter.dates.state == true)
          {
            q3+=" and to_date(cust->>'timestamp', 'YYYY MM DD') >= '" +
                        (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                        "and to_date(cust->>'timestamp', 'YYYY MM DD') <= '" +
                        (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
          }

          else
          {
            var date = new Date();
            date.setDate(date.getDate() - 30);

            date = date.getFullYear() +  "-" + (date.getMonth()+1) + "-"  +  date.getDate();

            q3 += " and to_date(cust->>'timestamp', 'YYYY MM DD') >= to_timestamp('" +
                        date + "', 'YYYY MM DD')::date "+
                  " and to_date(cust->>'timestamp', 'YYYY MM DD') <= "+
                  "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
              "from indicators, json_array_elements(indicators.readings) as pairs " +
              "where title = 'Number of Customers' and pid_proj = " + pid + ") ";
          }       
          
          q3 += "), ";

        q3 += 
          "multi AS (" +
            "select pointid_point, title, cast(bills->>'value' as decimal)/100 as bills_vl, bills->>'timestamp' as dayy " +
            "from indicators, json_array_elements(readings) as bills " +
            "where title = 'Multiline Bills' and pid_proj = " + pid;

            if(filter.points.length > 0){
                             
              for(var pt = 0; pt < filter.points.length; pt++)
              {
                if(pt == 0)
                  q3 += " and( pointid_point = "+filter.points[pt];
                else 
                  q3 += " or pointid_point = "+filter.points[pt];
              }
              q3 += ") ";
            }

            if(filter.dates.state == true)
            {
              q3+=" and to_date(bills->>'timestamp', 'YYYY MM DD') >= '" +
                          (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                          "and to_date(bills->>'timestamp', 'YYYY MM DD') <= '" +
                          (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
            }

            else
            {
              var date = new Date();
              date.setDate(date.getDate() - 30);

              date = date.getFullYear() +  "-" + (date.getMonth()+1) + "-"  +  date.getDate();

              q3 += " and to_date(bills->>'timestamp', 'YYYY MM DD') >= to_timestamp('" +
                          date + "', 'YYYY MM DD')::date "+
                    " and to_date(bills->>'timestamp', 'YYYY MM DD') <= "+
                    "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
                "from indicators, json_array_elements(indicators.readings) as pairs " +
                "where title = 'Multiline Bills' and pid_proj = " + pid + ") ";
            }       
            
          q3 += "), ";

        q3 +=
          "bills_daily AS ( select multi.pointid_point, multi.bills_vl*customers.cust_vl as bills, multi.dayy as dayy from multi, customers where multi.pointid_point = customers.pointid_point and to_date(customers.dayy, 'YYYY-MM-DD') = to_date(multi.dayy, 'YYYY-MM-DD')), " +
          "sum_customers AS (select sum(customers.cust_vl) as customers_total, customers.dayy as dayy from customers GROUP BY dayy ), " +
          "sum_bills AS (select sum(bills) as bills_total, bills_daily.dayy as dayy from bills_daily GROUP BY dayy ) " +
          "select (a.bills_total/b.customers_total)*100 as value, extract(epoch from to_date(b.dayy, 'YYYY-MM-DD'))*1000 as dayy from sum_customers as b , sum_bills as a where a.dayy = b.dayy ORDER BY dayy ASC ";
      


        var filter_obj = {"startDate": "MAX", "endDate": "MAX"};

        dataaccess.getTotalValue(pid, 'Multiline Bills', filter_obj, function(result, kpi_title){
          console.log("getTotalValue result for "+kpi_title+":");


          if(result != null & result != undefined && result[0] != null & result[0] != undefined){
            console.log(result[0].values);
            toReturn[0] = parseFloat(result[0].values);
            apiDebug(" dataaccess.getTotalValue OK")
          } else {
            console.log(result);
            apiDebug("dataaccess.getTotalValue NOT OK")
          }

          client.query(q3, function(err3, result3)
          {
            if(err3) 
            {
              client.end();
              console.log(q3);
              apiDebug(q3);
              return console.error('getTotalMultilineBills error running query q3   ', err3);
            }

            var obj = []

            for(var i = 0; i < result3.rows.length; i++)
            {
                var temp = [];

                temp.push(result3.rows[i].dayy);
                temp.push(parseFloat(parseFloat(result3.rows[i].value).toFixed(2)));

                obj.push(temp);
            }

            apiDebug("dataaccess.getTotalValue hmologous val -- toReturn so far:");
            apiDebug(toReturn);

            toReturn.push(obj);

            
            // added to handle comparision calculation
            // TODO: support points filter on getComparingIntervalsValues
            // if(filter.dates.state == true || filter.points.length > 0){
            if(filter.dates.state == true){

              dashboarddata.getComparingIntervalsValues(pid, {"title": "Multiline Bills"}, {"startDate": filter.dates.startdate, "endDate": filter.dates.finishdate}, function(widget){
                toReturn.push({"homologousValue": widget.homologousValue});
                
                apiDebug("getTotalMultilineBills filter active");
                res.json(toReturn);
                client.end();
              });

            } else {

              apiDebug("getTotalMultilineBills no filter active");

              res.json(toReturn);
              client.end();
            }



          }); // client q1
          
        })
    }); // client q2
  }); // client connect
}

exports.getTotalStockLevel = function(req, res){
  
  console.log("API CALL : getTotalStockLevel")

  var pid = req.params.pid;
  var client = new pg.Client(conString);
  var toReturn = [];
  var filter = req.body;


  client.connect(function(err)
  {

    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q1 = 
    "select sum(cast(s->>'value' as decimal)) as stock " +
    "from indicators, json_array_elements(readings) as s  " +
    "where title = 'Stock Level' and pid_proj = " + pid;

    if(filter.points.length > 0){

      for(var pt = 0; pt < filter.points.length; pt++)
      {
        if(pt == 0)
          q1 += " and pointid_point in ("+filter.points[pt];
        else 
          q1 += "," + filter.points[pt];
      }
      q1 += ") ";            
    }
      
    if(filter.dates.state == true)
    {
      q1+=" and to_date(s->>'timestamp', 'YYYY MM DD') = '" +
                  (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
    }
      
    else
    {
      q1 += " and to_date(s->>'timestamp', 'YYYY MM DD') = "+
            "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
        "from indicators, json_array_elements(indicators.readings) as pairs " +
        "where title = 'Stock Level' and pid_proj = " + pid + ")";
    }

    client.query(q1, function(err1, result1)
    {
      if(err1) 
      {
        apiDebug(q1);
        client.end();
        console.log(q1);
        return console.error('getTotalStockLevel error running query q1', err1);
      }
    
      toReturn.push(result1.rows[0].stock);

      // no comparision with homologous period for this kpi due to lack of config on dataaccess.js

      res.json(toReturn);
      client.end();
    });
  });
}

exports.getStandardError = function(req, res){
  console.log("API CALL : getStandarError");
  
  var wid = req.params.wid;
  var pid = req.params.pid;
  var filter = req.body;
  var client = new pg.Client(conString);
  var toReturn;
  var title;

  client.connect(function(err) {

    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "select title from widgets where wid = "+wid+" and pid_proj = "+pid+";";

    client.query(q, function(err, result) 
    {
      if(err)
      {
        client.end();
        return console.error('getStandardError error running query', err);
      }

      title = result.rows[0].title;

      if(title == 'Number of Customers' || title == 'Net Sales' || title == 'Stock Level')
      {
        var q1 = 
          "WITH " +

          "kpi as ( "+
          "SELECT pointid_point, sum(CAST(k->>'value' as decimal)) as values " +
          "FROM indicators, json_array_elements(readings) AS k "+
          "WHERE title='" + title + "' and pid_proj = " + pid;

          
          if (filter.points.length > 0)
          {
            for(var pt = 0; pt < filter.points.length; pt++)
              {
            
                if(pt == 0)
                  q1 += " and pointid_point in ("+filter.points[pt];
                else 
                  q1 += "," + filter.points[pt];
              }
            q1 += ") ";
          }

          if(filter.dates.state == true && title != 'Stock Level' )
            {
              q1+=" and to_date(k->>'timestamp', 'YYYY MM DD') >= '" +
                          (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                          "and to_date(k->>'timestamp', 'YYYY MM DD') <= '" +
                          (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
            }

          else if(filter.dates.state == true && title == 'Stock Level' )
          {
            q1+=" and to_date(k->>'timestamp', 'YYYY MM DD') = '" +
                        (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
          }

          else
          {
            q1 += " and to_date(k->>'timestamp', 'YYYY MM DD') = " +
                  "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
                  "from indicators, json_array_elements(indicators.readings) as pairs " +
                  "where title='" + title + "' and pid_proj = " + pid + ") ";
          }     

          q1 += "group by pointid_point) ";

          q1 += "SELECT stddev_samp(values)/(|/(COUNT(distinct pointid_point)))::numeric as se from kpi";

        client.query(q1, function(err1, result1)
        {
          if(err1) 
          {
            client.end();
            apiDebug(q1);
            return console.error('getStandardError error running query q1   ', err1);
          }

          toReturn = result1.rows[0];
          res.json(toReturn);
          client.end();
        });
      }
      
      else if(title == "Basket" || title == "Net Margin" || title == "Multiline Bills")
      {
        var kpi1, kpi2, t1, t2, d1, d2, d3, queryKpi;
        
        d1 = "";
        d2 = "";
        d3 = "";

        if(title == "Basket")
        {
          kpi1 = "customers";
          kpi2 = "sales";
          t1 = "Number of Customers";
          t2 = "Net Sales";

          queryKpi  = "select stddev_samp(s.sales/c.customers)/(|/(COUNT(distinct s.pointid_point)))::numeric as se from customers as c, sales as s where s.pointid_point = c.pointid_point";
        }

        else if(title == "Net Margin")
        {
          kpi1 = "margin";
          kpi2 = "sales";
          t1 = "Net Margin";
          t2 = "Net Sales";
          d1 = "k1->>'timestamp' as date, ";
          d2 = "k2->>'timestamp' as date, ";
          d3 = ", date";

          queryKpi = "select stddev_samp(t.values)/(|/(COUNT(distinct t.p))) as se from ( " +
            "select SUM(m.margin*s.sales)/ SUM(((m.margin*s.sales)/m.margin)) as values, m.pointid_point as p " +
            "from margin as m, sales as s " +
            "where m.pointid_point = s.pointid_point group by m.pointid_point ) as t";
        }

        else if(title == "Multiline Bills")
        {
          kpi1 = "customers";
          kpi2 = "bills";
          t1 = "Number of Customers";
          t2 = "Multiline Bills";
          d1 = "k1->>'timestamp' as date, ";
          d2 = "k2->>'timestamp' as date, ";
          d3 = ", date";

          queryKpi = "select stddev_samp(t.values)/(|/(COUNT(distinct t.p))) as se from ( " +
            "select SUM(b.bills/100*c.customers)/SUM(c.customers)*100  as values , b.pointid_point as p " +
            "from bills as b, customers as c " +
            "where b.pointid_point = c.pointid_point and b.date = c.date group by b.pointid_point ) as t" ;
        }          

        
        var q2 = 

        "WITH "+

        kpi1 + " AS (" +
        " SELECT pointid_point, " + d1 + " sum(CAST(k1->>'value' as decimal)) as " + kpi1 +
        " FROM indicators, json_array_elements(readings) AS k1 " +
        " WHERE title='" + t1 + "' and pid_proj = " + pid;

        if (filter.points.length > 0)
          {
            for(var pt = 0; pt < filter.points.length; pt++)
              {
            
                if(pt == 0)
                  q1 += " and pointid_point in ("+filter.points[pt];
                else 
                  q1 += "," + filter.points[pt];
              }
            q1 += ") ";
          }

          if(filter.dates.state == true)
            {
              q2+=" and to_date(k1->>'timestamp', 'YYYY MM DD') >= '" +
                          (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                          "and to_date(k1->>'timestamp', 'YYYY MM DD') <= '" +
                          (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
            }

          else
          {
            q2 += " and to_date(k1->>'timestamp', 'YYYY MM DD') = " +
                  "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
                  "from indicators, json_array_elements(indicators.readings) as pairs " +
                  "where title='" + title + "' and  pid_proj = " + pid + ") ";
          }

          q2 += "group by pointid_point " + d3 + " ), ";

          q2 += 

          kpi2 + " AS (" +
          " SELECT pointid_point, " + d2 + " sum(CAST(k2->>'value' as decimal)) as " + kpi2 +
          " FROM indicators, json_array_elements(readings) AS k2 " +
          " WHERE title='" + t2 + "' and pid_proj = " + pid;

          if (filter.points.length > 0)
            {
              for(var pt = 0; pt < filter.points.length; pt++)
                {
              
                  if(pt == 0)
                    q2 += " and pointid_point in ("+filter.points[pt];
                  else 
                    q2 += "," + filter.points[pt];
                }
              q2 += ") ";
            }

            if(filter.dates.state == true)
              {
                q2 +=" and to_date(k2->>'timestamp', 'YYYY MM DD') >= '" +
                            (filter.dates.startdate).replace(' 00:00:00:000000', '') + "'::date "+  
                            "and to_date(k2->>'timestamp', 'YYYY MM DD') <= '" +
                            (filter.dates.finishdate).replace(' 00:00:00:000000', '') + "'::date ";
              }

            else
            {
              q2 += " and to_date(k2->>'timestamp', 'YYYY MM DD') = " +
                    "(select to_date(max(pairs->>'timestamp'), 'YYYY MM DD')" +
                    "from indicators, json_array_elements(indicators.readings) as pairs " +
                    "where title='" + title + "' and pid_proj = " + pid + ") ";
            }

            q2 += "group by pointid_point " + d3 +" ) ";

            q2 += queryKpi;  

        client.query(q2, function(err2, result2)
        {
          if(err2) 
          {
            client.end();
            apiDebug(q2);
            return console.error('getStandardError error running query q2   ', err2);
          }

          toReturn = result2.rows[0];
          res.json(toReturn);
          client.end();
        });
      }

      else {
        // needs to be completed: standard deviation for any kpi
        res.json(toReturn);
        client.end();
      }

    });
  });
}

function acceptedByFilterExclusive(filter, reading){
  // for now, only filter by product
  
  // it must return false if reading has a false filter

  // if(filter.products != []){
  if(filter.products.length > 0){
    
    if(filter.products[0].hasOwnProperty(reading.product)){
      // console.log("test: "+ ((filter.products[0][reading.product])) );
      if(filter.products[0][reading.product])
        return true;
      else
        return false;
    } else {
      return false;
    }
  } else {
    return true;
  }
}

exports.getPointsFromWidgetFiltered = function(req, res){
  console.log("API CALL : getPointsFromWidgetFiltered");

  var wid = req.params.wid;
  var pid = req.params.pid;

  var title = ""; // get from select title from widgets where wid = wid

  var pointValues = [];
  var pointCoords = [];

  // // console.log(pid + " " + parmid);
  var filter = req.body;

  apiDebug("filter");
  apiDebug( JSON.stringify(filter));


  var toRet = {};


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "select title from widgets where wid = "+wid+" and pid_proj = "+pid+";";
    client.query(q, function(err, result) {
      // console.log(result.rows);

      if(err) {
        client.end();
        return console.error('getPointsFromWidgetFiltered error running query', err);
      }
      title = result.rows[0].title;
      // console.log(title);



      // var q2 = "select * from indicators where title = '"+toReturn.widget.title+"' and pid_proj = "+pid;
      // var q2 = "SELECT pointid_point as pointid, x, y, geometry, indicators.value, indicators.unit, attributes, type, indicators.readings as readings, indicators.aggrmethod as aggrmethod FROM indicators, points where  indicators.pointid_point = points.pointid and title = '"+title+"' and indicators.pid_proj = "+pid+" and pointid_point is not null"
      
      var q2 = "SELECT pointid_point as pointid, x, y, geometry, indicators.value, indicators.unit, attributes, type, "+
        " indicators.readings as readings, indicators.aggrmethod as aggrmethod FROM indicators, points " +
        " where  indicators.pointid_point = points.pointid and title = '"+title+"' and indicators.pid_proj = "+pid+
        " and pointid_point is not null"
      
      if(filter.dates.state == true){

        q2 += " and pointid_point in ( "+
          "select distinct pointid_point from indicators, "+
          "json_array_elements(indicators.readings) as pairs "+
          "where pid_proj = "+pid+" "+
          "and title = '"+title+"' "+
          "and to_date(pairs->>'timestamp', 'YYYY MM DD') >= '"+(filter.dates.startdate).replace(' 00:00:00:000000', '')+"'::date "+
          "and to_date(pairs->>'timestamp', 'YYYY MM DD') <= '"+(filter.dates.finishdate).replace(' 00:00:00:000000', '')+"'::date "+
          ")";
      }

      apiDebug("Q2: "+q2);
      client.query(q2, function(err, result2) {
         console.log("result2");
         console.log(q2);

        if(err) {
          client.end();
          return console.error('getPointsFromWidgetFiltered2 error running query', err);
        }

        var unit = '';

        var mapping = {};
        for(var i = 0; i < result2.rows.length; i++){
          var row = result2.rows[i];
          if(row.attributes.PointKey != undefined && row.attributes.PointKey != null)
            mapping[row.attributes.PointKey] = row.pointid;

          if(row.unit != '')
            unit = row.unit;
        }

        apiDebug("mappingg");
        apiDebug( JSON.stringify(mapping));



        apiDebug("result2.rows.length");
        apiDebug(result2.rows.length);

        for(var i = 0; i < result2.rows.length; i++){
          var row = result2.rows[i];
          // console.log(row);
          var locToAdd = row;

          locToAdd.name = nameFromAttributes(locToAdd, locToAdd.pointid);
          locToAdd.predecessor = mapping[locToAdd.attributes.Predecessor]; // THIS IS HARDCODED... needs to call mapping MAPPING to translate attributes.PointKey to pointId

          if(locToAdd.geometry != undefined && locToAdd.geometry != null){
            locToAdd.geometry.properties.pointid = locToAdd.pointid;
          }

          if(locToAdd.attributes != undefined && locToAdd.attributes != null &&
            locToAdd.geometry != undefined && locToAdd.geometry != null){
            if(locToAdd.attributes.StoreCodeAbbrv != undefined && locToAdd.attributes.StoreCodeAbbrv != null){
              locToAdd.geometry.properties.StoreCodeAbbrv = locToAdd.attributes.StoreCodeAbbrv;
            }
          }

          var average = true;

          if(locToAdd.aggrmethod != "average" && locToAdd.aggrmethod != "")
            average = false;

          // console.log("average? "+average);

          // obter a maior data, no entanto isto é limitativo (mais à frente vamos querer filtrar por uma determinada data)
          var lastDate = null;
          if(filter.dates.state == true){
            lastDate = filter.dates.finishdate;
          } else {
            for(var j=0; j<row.readings.length; j++){
              var reading = row.readings[j];

              if(lastDate == null){
                lastDate = reading.timestamp;
              } else {
                if(new Date(reading.timestamp) > new Date(lastDate))
                  lastDate = reading.timestamp;
              }
            }
          }
          

          apiDebug("lastDate");
          apiDebug(lastDate);

          // INIT: criar obj A com produtosFiltrados a true e counter a 0: [prop] = 0
          // para cada reading
            // incrementar obj A[reading.produto]
          // END: para cada A[prop], se houver um a 0, nao faz push ;; else faz push


          var a = {};
          var b = {};
          var found = true;
          var found_2 = true;
          var foundOR = false;
          var foundOR_2 = false;
          var totalSum = 0;
          var totalCount = 0;
          if(filter.products.length > 0 || filter.categories.length > 0 || filter.dates.state == true){
            apiDebug("im on IF OR");

            if(filter.products.length > 0){
              for(var prop in filter.products[0]){
                if(filter.products[0][prop] == true){
                  a[prop] = 0;
                }
              }
            } else {
              apiDebug("   --- passing on products");
              foundOR = true;
            }

            if(filter.categories.length > 0){
              for(var cat in filter.categories[0]){
                if(filter.categories[0][cat] == true){
                  b[cat] = 0;
                }
              }
            } else {
              apiDebug("   --- passing on categories");
              foundOR_2 = true;
            }
            // console.log("a");
            // console.log(a);

            apiDebug("row readings "+row.readings.length);

            for(var j=0; j<row.readings.length; j++){
              var reading = row.readings[j];
              // if(a.hasOwnProperty(reading.product) || b.hasOwnProperty(reading.category) ){
                // console.log("incrementing "+reading.product);
                

                // still allowing points to go if they have a reading (no matter the date)
                

                if( new Date(lastDate).getTime() == new Date(reading.timestamp).getTime() ){

                  apiDebug(totalSum+") accepted reading? "+(acceptedByFilter(filter, reading)));

                  if(acceptedByFilter(filter, reading)){

                    

                    totalSum += +reading.value;
                    totalCount += 1;
                    if(filter.products.length > 0)
                      a[reading.product] = a[reading.product] + 1;
                    if(filter.categories.length > 0)
                      b[reading.category] = b[reading.category] + 1;
                  }
                }
              // }
            }
            for(var prop in a){
              if(a.hasOwnProperty(prop)){
                if(a[prop] == 0)
                  found = false;
                if(a[prop] > 0)
                  foundOR = true;
              }
            }
            for(var cat in b){
              if(b.hasOwnProperty(cat)){
                if(b[cat] == 0)
                  found_2 = false;
                if(b[cat] > 0)
                  foundOR_2 = true;
              }
            }
          } else {
            foundOR = true;
            foundOR_2 = true;
          }
          
          apiDebug("foundOR "+foundOR);
          apiDebug("foundOR_2 "+foundOR_2);
          if(foundOR && foundOR_2){ // use if(found) for exclusive search
            if(filter.products.length > 0 || filter.categories.length > 0 || filter.dates.state == true){
              if(average)
                locToAdd.value = parseFloat(totalSum/totalCount).toFixed(2);
              else
                locToAdd.value = parseFloat(totalSum).toFixed(2);

              pointValues.push([ row.pointid, locToAdd.value ]);
            } else {
              apiDebug("adicionando à parva");
              pointValues.push([ row.pointid, parseFloat(row.value) ]);
            }
            pointCoords.push(locToAdd);
          }



          // if( row.readings contains active products on filter, do both pushes below )
          // var found = true;
          // for(var j=0; j<row.readings.length; j++){
          //   var reading = row.readings[j];
          //   if( !acceptedByFilterExclusive(filter, reading) )
          //     found = false;
          // }
          // if(found){
          //   pointCoords.push(locToAdd);
          //   pointValues.push([ row.pointid, parseFloat(row.value) ]);
          // }


          
        }

        pointValues.sort(function(a,b) {
          return parseFloat(b) - parseFloat(a);
        });

        toRet.locations = pointCoords;
        toRet.ranking = pointValues;
        toRet.unit = unit;

          apiDebug("\ntoRet");
          // apiDebug(JSON.stringify(toRet));

          if(title != "NPS INDEX (HoN)"){
            res.json(toRet);
            client.end();
        }


      });
    

    
        if(title == "NPS INDEX (HoN)"){

              //IR -  NPS needs to be calculated in the database, it's not a "normal" reading

            var q4 = "Drop table if exists HoNTable; "
              +"Drop table if exists HorNTable; "
              +"Drop table if exists NPSvals; "
              +"Drop table if exists NegVals; "
              +"Drop table if exists VPvals; "
              +"Drop table if exists Replies; "
                
              +"SELECT json_array_elements(readings) as dados, pointid_point as pointid "
              +"INTO HoNTable "
              +"FROM indicators "
              +"WHERE title = 'NPS INDEX (HoN)' and pid_proj = "+pid+"; "
              +"Select dados->>'category' as Category, cast(dados->>'value' as int) as Values, dados->>'timestamp' as Dates, pointid "
              +"into HorNTable "
              +"from HoNTable; "

              +"SELECT dates as datesNeg, pointid as pointidNeg, sum(values)::float as AllNegValues "
              +"into NegVals "
              +"from HorNTable "
              +"where category LIKE '%Negative%' "
              +"group by dates, pointid  "
              +"order by dates DESC, pointid ASC; "

              +"SELECT dates as datesTot, pointid as pointidTot, sum(values)::float as AllReplies "
              +"into Replies "
              +"from HorNTable "
              +"group by dates, pointid "
              +"order by dates DESC, pointid ASC; "

              +"SELECT dates, pointid, sum(values)::float as VPValues "
              +"into VPvals "
              +"from HorNTable "
              +"where category = 'Very Positive' " 
              +"group by dates, pointid "
              +"order by dates DESC, pointid ASC; "

              if(filter.dates == true){
                q4 += "select dates, pointid, ((vpvalues-allnegvalues)/AllReplies)*100 as NPS from VPvals, NegVals, Replies "
                +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) and (VPVals.pointid = NegVals.pointidNeg and VPVals.pointid = Replies.pointidTot) "
                +"and to_date(dates , 'YYYY-MM-DD') >= '"+filter.dates.startdate+"' and to_date(dates , 'YYYY-MM-DD') <= '"+filter.dates.finishdate+"' "
                +"and AllReplies > 0 "
                +"union "
                +"select dates, pointid, allreplies as NPS from VPvals, NegVals, Replies "
                +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) and (VPVals.pointid = NegVals.pointidNeg and VPVals.pointid = Replies.pointidTot) "
                +"and to_date(dates , 'YYYY-MM-DD') >= '"+filter.dates.startdate+"' and to_date(dates , 'YYYY-MM-DD') <= '"+filter.dates.finishdate+"' "
                +"and AllReplies = 0 " 
                +"order by dates; "

              } else {
                q4 += "select dates, pointid, ((vpvalues-allnegvalues)/AllReplies)*100 as NPS from VPvals, NegVals, Replies "
                +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) and (VPVals.pointid = NegVals.pointidNeg and VPVals.pointid = Replies.pointidTot) "
                +"and AllReplies > 0 "
                +"union "
                +"select dates, pointid, allreplies as NPS from VPvals, NegVals, Replies "
                +"where (VPVals.dates = NegVals.datesNeg and VPVals.dates = Replies.datesTot) and (VPVals.pointid = NegVals.pointidNeg and VPVals.pointid = Replies.pointidTot) "
                +"and AllReplies = 0 " 
                +"order by dates; "
              }

              q4 +="Drop table if exists HoNTable; "
              +"Drop table if exists HorNTable; "
              +"Drop table if exists NPSvals; "
              +"Drop table if exists NegVals; "
              +"Drop table if exists VPvals; "
              +"Drop table if exists Replies; "

              console.log(q4);

              apiDebug("\nq4");
              apiDebug(q4);
              client.query(q4, function(err4, result4){
              if(err4){
                console.error("error on q4");
                console.error(err4);
                client.end();
                res.json(toRet);
              } else {

                console.log("result4");
                console.log(result4.rows);
                apiDebug(result4);

                if(result4 != undefined)
                    toRet.npsvaluesfiltered = result4.rows;

                res.json(toRet);
                client.end();
              }

            });
              
        }

    });
  });

}



var customMarkerCfg = [
  {"title": "Customer Happiness", "source": "pointindicator", "name":"happiness", "iid": 123, "position":0, "type":"Intervals", 
      "buckets":[
        {"topVal":100, "bottomVal":80, "icon":"img/custommarkers/happy.png"},
        {"topVal":80, "bottomVal":60, "icon":"img/custommarkers/ok.png"},
        {"topVal":60, "bottomVal":40, "icon":"img/custommarkers/nok.png"},
        {"topVal":40, "bottomVal":0, "icon":"img/custommarkers/sad.png"}
      ]
  },
  {"title": "Basket" , "name":"basket", "source": "pointindicator", "iid": 124, "position":1, "type":"AroundZero",
      "buckets":[
        {"aroundZero":"bigger", "icon":"img/custommarkers/arrowup.png"},
        {"aroundZero":"equal", "icon":"img/custommarkers/arrowright.png"},
        {"aroundZero":"smaller", "icon":"img/custommarkers/arrowdown.png"}
      ]
  },
  {"title": "Videostream", "name":"cam", "source": "pointattribute", "iid": 125, "position":2, "type":"EmptyOrNot",
      "buckets":[
        {"val":0, "icon":"img/custommarkers/nocam.png"},
        {"val":1, "icon":"img/custommarkers/cam.png"}
      ]
  }
];









exports.getCustomIcons = function(req, res){
  console.log("API call: getCustomIcons");
  var pid = req.params.pid;

  var toReturn = {};

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "select iconconfig from projects where pid = "+pid;
    client.query(q, function(err, result) {
      if(err) {
        // this is because customMarkerCfg is hardcoded!!
        toReturn.customMarkerCfg = customMarkerCfg;
        
        res.json(toReturn);
        client.end();
        return console.error('getCustomIcons get project error running query', err);
      }


      if(result.rows.length == 0){
        // no project with that pid
        toReturn.customMarkerCfg = [];
      } else {
        // it can only be length 1
        if(result.rows[0].iconconfig == null){
          // it exists but it has not been initialized
          toReturn.customMarkerCfg = [];
        } else {
          // happy path / normal situation
          toReturn.customMarkerCfg = result.rows[0].iconconfig;
        }
      }

      var q2 = "select * from projects, organizations_projects, organizations where pid = pid_proj and oid_org = oid and pid = "+pid;
      client.query(q2, function(err, result) {
        if(err) {
          // // this is because customMarkerCfg is hardcoded!!
          // toReturn.customMarkerCfg = customMarkerCfg;
          
          res.json(toReturn);
          client.end();
          return console.error('getCustomIcons2 get project error running query', err);
        }

        toReturn.project = result.rows[0];

        var q3 = "SELECT * FROM occurrenceconfigs WHERE pid_proj = "+pid;

        client.query(q3, function(err3, result3){
          if(err3) {
            res.json(toReturn);
            client.end();
            return console.error('getOccurrenceConfigs error running query', err);
          }

          apiDebug(result3.rows);
          toReturn.occurrenceconfigs = result3.rows;

          res.json(toReturn);
          client.end();

        });
        
        

      });

    });
  });
}


exports.setCustomIcon = function(req, res){
  console.log("API call: setCustomIcon");
  var pid = req.params.pid;
  // console.log(req.body);
  // customMarkerCfg = req.body.slice(0);

  var toReturn = [];

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }


    var q = "update projects set iconconfig = '"+JSON.stringify(req.body.slice(0))+"'::json where pid = "+pid+" returning iconconfig";

    // console.log("q");
    // console.log(q);

    // res.json(req.body.slice(0));
    // client.end();

    // return;

    client.query(q, function(err, result) {
      if(err) {
        // this is because customMarkerCfg is hardcoded!!
        // toReturn.customMarkerCfg = customMarkerCfg;
        // we could have a cache to store this... but it would require version control..
        toReturn = [];
        
        res.json(toReturn);
        client.end();
        return console.error('getCustomIcons get project error running query', err);
      }


      console.log("result.rows[0].iconconfig");
      console.log(result.rows[0].iconconfig);

      if(result.rows.length == 0){
        // no project with that pid
        toReturn = [];
      } else {
        // it can only be length 1
        if(result.rows[0].iconconfig == null){
          // it exists but it has not been initialized
          toReturn = [];
        } else {
          // happy path / normal situation
          toReturn = result.rows[0].iconconfig;
        }
      }

      res.json(toReturn);
      client.end();

    });

    


  });

    


  // we could validate a versionCounter on the config,
  // so we detect when another user changed the config
  // - two users read the config with versionCounter = 1
  // - user A calls setCustomIcon, comparing the versionCounter on req.body with the versionCounter on database. 
  //         if theyre the same, it will increase the versionCounter to 2.
  // - when user B calls setCustomIcon, it will provide a versionCounter 1, which is smaller/behind the versionCounter on database.
  //         it detects the differences and tries to merge - if the merge is successful, it will return the final version with no error.
  //         if it cannot merge, it will return an error containing the confliting portions... client logic will handle the changes and
  //         the next setCustomIcon will have the changes merged and the versionCounter to 3.
  //    --- we still have the problem if a user C reads versionCounter 2 before it becomes 3... will provoke another merge changes...
  
}



exports.getGeneralNames = function(req, res){
  console.log("API call: getGeneralNames");
  // res.json({ indicatorNames: [ 'happiness', 'basket', 'revenue' ], attributeNames: [ 'cam', 'accessibility' ] });

  var pid = req.params.pid;
  var toRet = {};

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }



    var q = "select distinct title from indicators where pid_proj = "+pid;


    var q = "select ARRAY( select distinct title from indicators where pid_proj = "+pid+")";

    client.query(q, function(err, result) {
      if(err) {
        toRet = {indicatorNames: [], attributeNames: []};
        res.json(toRet);
        client.end();
        return console.error('getGeneralNames get project error running query', err);
      }


      // console.log("result.rows[0].array");
      // console.log(result.rows[0].array);

      toRet.indicatorNames = result.rows[0].array;


      var q2 = "select distinct json_object_keys(attributes) from points where pid_proj = "+pid;
      var q2 = "select array_to_string( ARRAY ( select distinct json_object_keys(attributes) from points where pid_proj = "+pid+" ), ', ')";
      var q2 = "select ARRAY ( select distinct json_object_keys(attributes) from points where pid_proj = "+pid+" )";

      client.query(q2, function(err, result2) {
        if(err) {
          toRet.attributeNames = [];
          res.json(toRet);
          client.end();
          return console.error('getGeneralNames2 get project error running query', err);
        }

        // console.log("result2.rows[0].array");
        // console.log(result2.rows[0].array);

        // toRet.attributeNames = [ 'cam', 'accessibility' ];
        toRet.attributeNames = result2.rows[0].array;

        res.json(toRet);
        // res.json({ indicatorNames: [ 'happiness', 'basket', 'revenue' ], attributeNames: [ 'cam', 'accessibility' ] });
        client.end();

      });


    });

  });


  // "select distinct title from indicators where pid_proj = 132"

  // "select attributes from points where pid_proj = 132"
}


exports.getNamesMinMax = function(req, res){
  console.log("API call: getNamesMinMax");


  var pid = req.params.pid;

  
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = 'select min(cast(value as double precision) ), max(cast(value as double precision)), title from indicators where pid_proj = '+pid+' group by title';

    client.query(q, function(err, result) {
      if(err) {
        res.json({});
        client.end();
        return console.error('getGeneralNames get project error running query', err);
      }


      // console.log("result.rows");
      // console.log(result.rows);

      // toRet.indicatorNames = result.rows[0].array;


      res.json(result.rows);
      // res.json({ indicatorNames: [ 'happiness', 'basket', 'revenue' ], attributeNames: [ 'cam', 'accessibility' ] });
      client.end();

    });

  });
}
// select min(value), max(value), title from indicators where pid_proj = 141 group by title


var occurrences = [
                  {status: "Closed", title: "Basket is below 10 PLN", date: "23/01/2015", pointid:12159, lat:'51.1197818', lng:'23.4658107',
                    tasks: [
                      {done:true, title:"Validate basket readings' history", obs: "Well... it just didnt worked as expected...!"},
                      {done:true, title:"Call Operator to find why the value has changed", obs: ""},
                      {done:true, title:"Call Manager", obs: ""},
                      {done:true, title:"Call the doctor!", obs: ""},
                      {done:true, title:"Call João Cabral", obs: ""},
                      {done:true, title:"Call CEO", obs: ""},
                    ]},
                  {status: "Ongoing", title: "Margin below 20%", date: "23/01/2015", pointid:12166, lat:'51.7480996', lng:'19.4128204',
                    tasks: [
                      {done:false, title:"Validate basket readings' history", obs: "Well... it just didnt worked as expected...!"},
                      {done:true, title:"Call Operator to find why the value has changed", obs: ""},
                    ]},
                  {status: "Assigned", title: "Basket is below 3 PLN", date: "24/01/2015", pointid:12164, lat:'52.5450523', lng:'19.6921815000001',
                    tasks: [
                      {done:false, title:"Call Manager", obs: ""},
                    ]},
                  {status: "Open", title: "1 sad satisfaction per hour", date: "25/01/2015", pointid:12159, lat:'51.1197818', lng:'23.4658107',
                    tasks: [
                      {done:false, title:"Validate customer satisfaction readings' history", obs: ""},
                    ]},
                  {status: "Open", title: "10 sad satisfaction per hour", date: "27/01/2015", pointid:12163, lat:'51.416691', lng:'21.9641091',
                    tasks: [
                      {done:false, title:"Validate customer satisfaction readings' history", obs: "Well... it just didnt worked as expected...!"},
                      {done:false, title:"Call Operator to find why the value has changed", obs: ""},
                      {done:false, title:"Call Manager", obs: ""},
                    ]},
                  {status: "Open", title: "3 sad satisfaction per hour", date: "28/01/2015", pointid:12159, lat:'51.1197818', lng:'23.4658107',
                    tasks: [
                      {done:false, title:"Freak out!!!", obs: ""},
                      {done:false, title:"Call João Cabral!!!", obs: ""},
                      {done:false, title:"Call CEO", obs: ""},
                    ]},
                ];


exports.getOccurrences = function(req, res){
  // res.json(occurrences);



  // ter o occurrences em tabela
  // a tabela das occurrences tem de mapear com o pid e (pointid e) iid
  // pid para se fazer o select de todos, iid para ir buscar o title e formar a msg de alerta (usar funcao dos alertas)
  // e dps tem de se incluir tb um json que contem as tasks

  // algures no codigo, aquando de um add, tem de se validar se ha alerta gerado - se sim, tem de se introduzir
  //   na tabela das occurrences, adicionando as tasks a vazio de acordo com o occurrence type!
  

  var pid = req.params.pid;
  var firstload = (req.params.firstload == 1 || req.params.firstload == "1" ) ? true : false;

  var toRet = {};
  toRet.occurrences = [];

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var firstloadstr = "";
    var firstloadstr2 = "";
    if(firstload){
      firstloadstr = " and to_date(object->>'date', 'YYYY-MM-DD') = (select max(to_date(object->>'date', 'YYYY-MM-DD')) from occurrences where pid_proj = "+pid+") ";
      firstloadstr2 = " and to_date(object->>'date', 'YYYY-MM-DD') = (select max(to_date(object->>'date', 'YYYY-MM-DD')) from occurrences where pid_proj = 518) ";
    }

    //order by date of occurrence (more recent first)
    // var q = "select * from occurrences where pid_proj = "+pid+" order by object->>'date' DESC";
    var q = "select * from occurrences where pid_proj = "+pid+
    firstloadstr +
    " order by to_date(object->>'date', 'YYYY-MM-DD') DESC, object->>'time' DESC, object->>'pointid', object->>'kpi', occid DESC";

    // hardcoded fix just for showing occurrences on moja demonstration
    if(pid == 419){
      q = "select * from occurrences where (pid_proj = 419 or pid_proj = 518) and to_date(object->>'date', 'YYYY-MM-DD') >= '2015-07-01'::date "+
      firstloadstr2 +
      "order by to_date(object->>'date', 'YYYY-MM-DD') DESC, object->>'time' DESC, object->>'pointid', object->>'kpi', occid DESC";
    }

    //order by occurrence id
    //var q = "select * from occurrences where pid_proj = "+pid+" order by occid";

    console.log("occurrences query");
    console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('getOccurrences error running query', err);
      }

      // console.log(result.rows);
      // toRet.occurrences = occurrences;

      for(var i=0; i<result.rows.length; i++){
        var aux = result.rows[i].object;
        aux.occid = result.rows[i].occid;
        toRet.occurrences.push(aux);
      }


      var q2 = "select count(*) from occurrences where pid_proj = "+pid+" and object->>'status' = 'Open'";
      if(pid == 419){
        q2 = "select count(*) from occurrences where (pid_proj = 419 or pid_proj = 518) "+
        " and to_date(object->>'date', 'YYYY-MM-DD') >= '2015-07-01'::date "+
        " and object->>'status' = 'Open'";
      }

      client.query(q2, function(err2, result2) {
        if(err2) {
          client.end();
          return console.error('getOccurrences2 error running query', err2);
        }

        toRet.openOcc = result2.rows[0].count;


        res.json(toRet);
        client.end();

      });
    });
  });

}



exports.saveOccurrence = function(req, res){
  console.log("API call: saveOccurrence");
  // console.log(JSON.stringify(req.body, null, 4) );
  var occid = req.body.occid;


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "UPDATE occurrences SET object = '"+JSON.stringify(req.body)+"'::json WHERE occid = "+occid;
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('saveOccurrence error running query', err);
      }

      res.json({});
      client.end();
    });
  });

};











var generateOccurrenceAux = function(pid, aux, tlid, res, warnsocket, isLast){

  // if res != null, it was called from exports.generateOccurrence and res needs to be handled
  // else, it was called from datacaptureapi. 
  // TODO NUNOALEX Both situations will lead to sending socket.io packet to inform that a new occurrence has been generated!
  

  var obj = {"pid": pid, "status": "Open", "title": aux.title, "date": aux.date, "time":aux.time, "pointid":aux.pointid, 
  "statusdate": aux.statusdate,"new":"true", "kpi": aux.kpi, "value": aux.value, "frequency": aux.frequency, 
  "pointkey": aux.pointkey, "plannedvalue": aux.plannedvalue, "unit": aux.unit, "duedate": aux.duedate, 
  "duehour": aux.duehour, "max":aux.max, "min":aux.min, "tasks": []};


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q1 = "select x, y, attributes from points where pointid = "+aux.pointid;
    client.query(q1, function(err1, result1) {
      if(err1) {
        client.end();
        if(res != null) { res.json({}); }
        return console.error('saveOccurrence error running query', err1);
      }
      obj["lat"] = result1.rows[0].x;
      obj["lng"] = result1.rows[0].y;

      if(result1.rows[0].attributes.hasOwnProperty('name')){
        obj["pointname"] = result1.rows[0].attributes.name;
      } else if(result1.rows[0].attributes.hasOwnProperty('Name')){
        obj["pointname"] = result1.rows[0].attributes.Name;
      }


      var q2 = 'select tasklist from tasklists where tlid = '+tlid;
      console.log(q2);
      if(tlid == null || tlid == undefined){
        client.end();
        if(res != null) { res.json({}); }
        return console.error("saveOccurrence2b is null "+q2);
      }
      client.query(q2, function(err2, result2) {
        if(err) {
          client.end();
          if(res != null) { res.json({}); }
          return console.error('saveOccurrence2 error running query', err2);
        }

        if(result2 == null || result2 == undefined || result2.rows == null || result2.rows == undefined && result2.rows[0] == null || result2.rows[0] == undefined ){
          console.log("no results!! query: "+q2);
          client.end();
          if(res != null) { res.json({}); }
          return console.log('saveOccurrence2b error no results!! query: '+q2);
        } else {
          console.log(result2.rows[0].tasklist.tasks);
          obj.tasks = result2.rows[0].tasklist.tasks;
        }
        // then source obj.tasks

        var q = "INSERT INTO occurrences (pid_proj, object) VALUES ("+pid+", '"+JSON.stringify(obj)+"'::json);";
        client.query(q, function(err, result) {
          if(err) {
            client.end();
            if(res != null) { res.json({}); }
            return console.error('saveOccurrence3 error running query', err);
          }

          if(res != null) { 

            res.json({}); 
          }
          if(warnsocket){
            console.log("\nwarn socket now >>>>>>>>>> !!!\n\n");
            skt.broadcastAll('new_occurrence_triggered', {});
          } else {
            console.log("DONT WARN SOCKET YET!!!\n\n");
          }
          skt.broadcastAll('new_occurrence_triggered_notif', obj);

          if(aux.hasOwnProperty('frequency') && aux.frequency == "daily" && isLast){
            // if(aux.hasOwnProperty('frequency') && aux.frequency == "hourly"){
            //   occurrencestrack.processAndSendHourlyOccurrence(pid, aux.date, aux.time);
            // } else {
            //   occurrencestrack.processAndSendDailyOccurrences(pid, aux.date);
            //   occurrencestrack.processAndSendOverdueOccurrences(pid, aux.date);
            // }
            occurrencestrack.processAndSendDailyOccurrences(pid, aux.date);
            occurrencestrack.processAndSendOverdueOccurrences(pid, aux.date);
          }

          // forcing each new hourly occurrence to send an email
          if(aux.hasOwnProperty('frequency') && aux.frequency == "hourly"){
            occurrencestrack.sendHourlyOccurrence(pid, obj);
          }

          client.end();
        });
      });


    });

    
  });
}



exports.generateOccurrenceInternal = function(pid, aux, tlid, warnsocket, isLast){
  console.log("API call: generateOccurrenceInternal");

  generateOccurrenceAux(pid, aux, tlid, null, warnsocket, isLast);
}



exports.generateOccurrence = function(req, res){
  console.log("API call: generateOccurrence");
  var pid = req.params.pid;
  var aux = req.body;
  var tlid = req.body.occtype_id;

  if(tlid == undefined || tlid == null){
    console.log("found null TL ID");
    res.json({});
  }
  
  console.log(pid);
  // console.log(aux);


  generateOccurrenceAux(pid, aux, tlid, res, false);


  // get lat lng from local cache? or db SELECT
  // get task list from local cache? or db SELECT
  // fill aux status, lat, lng, tasks

  

  // {status: "Closed", title: "Basket is below 10 PLN", date: "23/01/2015", pointid:12159, lat:'51.1197818', lng:'23.4658107',
  //   tasks: [
  //     {done:true, title:"Validate basket readings' history", obs: "Well... it just didnt worked as expected...!"},
  //     {done:true, title:"Call Operator to find why the value has changed", obs: ""},
  //     {done:true, title:"Call Manager", obs: ""},
  //     {done:true, title:"Call the doctor!", obs: ""},
  //     {done:true, title:"Call João Cabral", obs: ""},
  //     {done:true, title:"Call CEO", obs: ""},
  //   ]}
}


exports.getOccurrenceConfigs = function(req, res){
  console.log("API call: getOccurrenceConfigs");
  var pid = req.params.pid;
  
  var q = "SELECT * FROM occurrenceconfigs WHERE pid_proj = "+pid;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    client.query(q, function(err, result){
      if(err) {
        client.end();
        res.json({});
        return console.error('getOccurrenceConfigs error running query', err);
      }

      apiDebug(result.rows);

      res.json(result.rows);
      client.end();

    });

  });
}



exports.saveOccurrenceConfig = function(req, res){
  console.log("API call: saveOccurrenceConfig");
  apiDebug(req.body);
  apiDebug(req.params.pid);
  apiDebug(JSON.stringify(req.params.occcfgid));

  var obj = req.body;
  var pid = req.params.pid;
  var occcfgid = req.params.occcfgid;


  var q = "";
  if(occcfgid == undefined || occcfgid == null){
    // its a new config

    q = "INSERT INTO occurrenceconfigs (pid_proj, config) VALUES ("+pid+", '"+JSON.stringify(obj)+"'::json) RETURNING occcfgid, pid_proj, config;";
    console.log(q);



  } else {
    // were editing an existing config
    occcfgid = parseInt(occcfgid);

    var q = "UPDATE occurrenceconfigs SET config='"+JSON.stringify(obj)+"'::json WHERE occcfgid = "+occcfgid+" and pid_proj = "+pid;
    // res.json({});
  }

  if(q != ""){
    var client = new pg.Client(conString);
    client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }

      client.query(q, function(err, result){
        if(err) {
          client.end();
          res.json({});
          return console.error('saveOccurrenceConfig error running query', err);
        }

        console.log(result.rows[0]);

        res.json(result.rows[0]);
        client.end();

      });

    });
    
  }



  // res.json({});
}


exports.deleteOccurrenceConfig = function(req, res){
  console.log("API call: deleteOccurrenceConfig");

  var pid = req.params.pid;
  var occcfgid = req.params.occcfgid;


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO projects(title, area, location) VALUES ('"+req.body.title+"', '"+req.body.area+"', '"+req.body.location+"') RETURNING pid;";
    var q = "DELETE FROM occurrenceconfigs WHERE occcfgid = "+occcfgid+" and pid_proj = "+pid+" RETURNING occcfgid;";
    console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('deleteOccurrenceConfig error running query', err);
      }
      res.json(result.rows[0]);
      client.end();
    });
  });

}




exports.getTaskLists = function(req, res){
  console.log("API call: getTaskLists");

  var pid = req.params.pid;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = 'select tlid as tasklistid, tasklist from tasklists where pid_proj = '+pid;
    client.query(q, function(err, result) {
      if(err) {
        res.json([]);
        client.end();
        return console.error('getTaskLists error running query', err);
      }

      res.json(result.rows);
      client.end();

    });

  });
};


exports.addTaskList = function(req, res){
  console.log("API call: addTaskList");

  var pid = req.params.pid;
  var tasklist = req.body;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "insert into tasklists(pid_proj, tasklist) values ("+pid+", '"+JSON.stringify(tasklist)+"'::json) RETURNING tlid, pid_proj, tasklist";
    console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        res.json([]);
        client.end();
        return console.error('addTaskList error running query', err);
      }

      var toReturn = tasklist;
      toReturn.tasklistid = result.rows[0].tlid;
      // toReturn.pid_proj = result.rows[0].pid_proj;
      // toReturn.tasklist = result.rows[0].tasklist;
      res.json(toReturn);
      client.end();

    });

  });
};



exports.updateTaskList = function(req, res){
  console.log("API call: updateTaskList");

  var pid = req.params.pid;
  var tlid = req.params.tlid;
  var tasklist = req.body;

  if(!tasklist.hasOwnProperty('tasklistid'))
    tasklist.tasklistid = tlid;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q = "UPDATE tasklists SET tasklist='"+JSON.stringify(tasklist)+"'::json WHERE tlid = "+tlid+" and pid_proj = "+pid;
    console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        res.json([]);
        client.end();
        return console.error('updateTaskList error running query', err);
      }

      var toReturn = {};
      toReturn.status = 'success';
      res.json(toReturn);
      client.end();

    });

  });
};


exports.deleteTaskList = function(req, res){
  console.log('API call: deleteTaskList');
  
  var pid = req.params.pid;
  var tlid = req.params.tlid;


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // var q = "INSERT INTO projects(title, area, location) VALUES ('"+req.body.title+"', '"+req.body.area+"', '"+req.body.location+"') RETURNING pid;";
    var q = "DELETE FROM tasklists WHERE tlid = "+tlid+" and pid_proj = "+pid+" RETURNING tlid;";
    console.log(q);
    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('deleteTaskList error running query', err);
      }
      res.json(result.rows[0]);
      client.end();
    });
  });
};




exports.getHonSurveyKeys = function(req, res){
  console.log("API call: getHonSurveyKeys");
  res.json({});
}

exports.getHonSurveyResults = function(req, res){
  console.log("API call: getHonSurveyKeys");
  var key = req.params.key;

  res.json({});
}


var xmla = require('xmla4js');

exports.connectToDataCube = function(req, res){
  console.log("API call: connectToDataCube");
  
  var x = new xmla.Xmla();

  x.discoverDataSources({
      async: true,
      url: "http://sqlmf.cloudapp.net:8080/olap/msmdpump.dll",
      headers: {
      },
      success: function(x, xmlaRequest, xmlaResponse){
         //handle success
         // console.log("xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
         // console.log("xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
         // console.log(xmlaRequest);
         // console.log("xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
         // console.log("xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
         // console.log(xmlaResponse);
         console.log("connectToDataCube success");
         // discoverCatalogs();
      },
      error: function(x, xmlaRequest, exception){
         //handle error
         console.log("connectToDataCube ERROR");
      },
      username: "mf\\TestOlap",
      password: "Test2015"
    });

  res.json({});
}



var xmla = require('xmla4js');

exports.connectToDataCube = function(req, res){
  console.log("API call: connectToDataCube");
  
  var x = new xmla.Xmla();

  x.discoverDataSources({
      async: true,
      url: "http://sqlmf.cloudapp.net:8080/olap/msmdpump.dll",
      headers: {
      },
      success: function(x, xmlaRequest, xmlaResponse){
         //handle success
         // console.log("xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
         // console.log("xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
         // console.log(xmlaRequest);
         // console.log("xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
         // console.log("xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
         // console.log(xmlaResponse);
         console.log("connectToDataCube success");
         // discoverCatalogs();
      },
      error: function(x, xmlaRequest, exception){
         //handle error
         console.log("connectToDataCube ERROR");
      },
      username: "mf\\TestOlap",
      password: "Test2015"
    });

  res.json({});
}






// var xmla = require('xmla4js');

var INIT_URL = "http://sqlmf.cloudapp.net:8080/olap/msmdpump.dll";
var INIT_CATALOG_NAME = "CoreAnalytics_OLAP";
var INIT_USER = "mf\\TestOlap";
var INIT_PASS = "Test2015";

var x = new xmla.Xmla();

exports.discoverDataSources = function(req, res){
  console.log("API call: testOlap");

    var toRet = {};
    toRet.dataSources = new Array();

    x.discoverDataSources({
      async: true,
      url: INIT_URL,
      headers: {
      },
      success: function(xmla, request, response){
        console.log("SUCCESS, got "+response.rowCount());
        response.eachRow(function(row){
          var url = row["URL"] || INIT_URL;
            var dataSourceInfo = row["DataSourceInfo"];

            toRet.dataSources.push({"DataSourceName": row["DataSourceName"], "DataSourceInfo": row["DataSourceInfo"], "DataSourceDescription": row["DataSourceDescription"] });


          x.discoverDBCatalogs({
        async: true,
        url: url,
        properties: {DataSourceInfo: dataSourceInfo},
        success: function(xmla, request, response){
          console.log(">>> SUCCESS discoverDBCatalogs, got "+response.rowCount());
          response.eachRow(function(row){
            
            if(row["CATALOG_NAME"] == INIT_CATALOG_NAME){
                      console.log("Found catalog!!! "+row["CATALOG_NAME"]);
                      catalogName = row["CATALOG_NAME"];
                      toRet.cat = catalogName;

                      x.discoverMDCubes({
              async: true,
                            url: request.url,
                            properties: {
                                DataSourceInfo: request.properties.DataSourceInfo,
                                Catalog: catalogName
                            },
                            restrictions: {CATALOG_NAME: catalogName},
              success: function(xmla, request, response){
                console.log(">>> SUCCESS discoverMDCubes");
                var arr = new Array();

                response.eachRow(function(row){
                  var cubeName = row["CUBE_NAME"];
                                console.log(cubeName);
                                arr.push(cubeName);

                  
                });
                console.log("> returning");
                toRet.arr = arr;
                  res.json(toRet);
              },
              error: function(x, xmlaRequest, exception){
                 //handle error
                 console.log("ERROR");
                 res.json({});
              },
              username: INIT_USER,
              password: INIT_PASS
            });


                    }

          });
          
        },
        error: function(x, xmlaRequest, exception){
           //handle error
           console.log("ERROR");
           res.json({});
        },
        username: INIT_USER,
        password: INIT_PASS
      });


        });
        

        },
      error: function(x, xmlaRequest, exception){
         //handle error
         console.log("ERROR");
         res.json({});
      },
      username: INIT_USER,
      password: INIT_PASS
    });

  
}



exports.discoverMDDimensions = function(req, res){
  console.log("API call: discoverMDDimensions");

  var cubeName = req.params.cubename;
  var properties = { DataSourceInfo: null, Catalog: INIT_CATALOG_NAME };

  var toRet = {};

  x.discoverMDDimensions({
    async: true,
        url: INIT_URL,
        properties: properties,
        restrictions: {
            CATALOG_NAME: INIT_CATALOG_NAME,
            CUBE_NAME: cubeName
        },
    success: function(xmla, request, response){
      console.log("SUCCESS");
      toRet.dims = new Array();

      response.eachRow(function(row){
        var dimensionName = row["DIMENSION_NAME"];
            var dimensionUniqueName = row["DIMENSION_UNIQUE_NAME"];
            var dimensionType = row["DIMENSION_TYPE"];

            console.log(dimensionType + "\t\t" + dimensionName + " " + dimensionUniqueName + " " + dimensionType );
            if(dimensionType != 2) {
              // toRet.dims.push(dimensionUniqueName);

              x.discoverMDHierarchies({
          async: true,
          url: INIT_URL,
          properties: properties,
              restrictions: {
                  CATALOG_NAME: INIT_CATALOG_NAME,
                  CUBE_NAME: cubeName,
                  DIMENSION_UNIQUE_NAME: dimensionUniqueName
              },
          success: function(xmla, request, response){
            console.log("SUCCESS");
            var obj = {};
            obj.dimUniqueName = dimensionUniqueName;
            obj.arr = new Array();

            response.eachRow(function(row){
              obj.arr.push(row["HIERARCHY_UNIQUE_NAME"]);

            });
            toRet.dims.push(obj);

            if(dimensionUniqueName == "[Zwrot]")
              res.json(toRet);
          },
          error: function(x, xmlaRequest, exception){
             //handle error
             console.log("ERROR");
             res.json({});
          },
          username: INIT_USER,
          password: INIT_PASS
        });
          }

      });
      
    },
    error: function(x, xmlaRequest, exception){
       //handle error
       console.log("ERROR");
       res.json({});
    },
    username: INIT_USER,
    password: INIT_PASS
  });
}



exports.discoverMDDimensionsMeasures = function(req, res){
  console.log("API call: discoverMDDimensionsMeasures");

  var cubeName = req.params.cubename;
  var properties = { DataSourceInfo: null, Catalog: INIT_CATALOG_NAME };

  var toRet = {};

  x.discoverMDDimensions({
    async: true,
        url: INIT_URL,
        properties: properties,
        restrictions: {
            CATALOG_NAME: INIT_CATALOG_NAME,
            CUBE_NAME: cubeName
        },
    success: function(xmla, request, response){
      console.log("SUCCESS");
      toRet.dims = new Array();

      response.eachRow(function(row){
        var dimensionName = row["DIMENSION_NAME"];
            var dimensionUniqueName = row["DIMENSION_UNIQUE_NAME"];
            var dimensionType = row["DIMENSION_TYPE"];

            console.log(dimensionType + "\t\t" + dimensionName + " " + dimensionUniqueName + " " + dimensionType );
            if(dimensionType == 2) {
              
            x.discoverMDMeasures({
            async: true,
                url: INIT_URL,
                properties: properties,
                restrictions: {
                    CATALOG_NAME: INIT_CATALOG_NAME,
                    CUBE_NAME: cubeName
                },
            success: function(xmla, request, response){
              console.log("SUCCESS");
              toRet.arr = new Array();
              response.eachRow(function(row){
                // console.log(row["MEASURE_NAME"]);
                toRet.arr.push(row["MEASURE_NAME"]);
              });
              res.json(toRet);
            },
            error: function(x, xmlaRequest, exception){
               //handle error
               console.log("ERROR");
               res.json({});
            },
            username: INIT_USER,
            password: INIT_PASS
          });
          }

      });
    },
    error: function(x, xmlaRequest, exception){
       //handle error
       console.log("ERROR");
       res.json({});
    },
    username: INIT_USER,
    password: INIT_PASS
  });
}



// exports.olapExecute = function(req, res){
//   console.log("API call: olapExecute");
//   console.log(req.body.sentence);

//   var toRet = {};

//   var properties = { DataSourceInfo: null, Catalog: INIT_CATALOG_NAME };

//   x.execute({
//     async: true,
//     url: INIT_URL,
//     statement: req.body.sentence,
//       properties: properties,
//     success: function(xmla, request, response){
//       console.log("SUCCESS EXEC");

//       var dataset = response;
//       console.log(dataset);
      
//       var cellset = dataset.getCellset();
//       console.log(cellset);

//       var cellCount = cellset.cellCount();
//       console.log("\ncell count "+cellCount);

//       var arr = new Array();
//       for(var i=0; i<cellCount; i++){
//         arr.push(cellset.getByIndex(i));
//       }

//       var arrAxes = new Array();


//       function renderAxes(parent, axisIndex){
//             if (typeof(axisIndex)==="undefined"){
                
//                 axisIndex = dataset.axisCount() - 1;
//             }
//             var axis = dataset.getAxis(axisIndex),
//                 member, tupleHTML,
//                 node, nodeHead, nodeBody, cell
//             ;

//             var objToAdd = {};

//             axis.eachTuple(function(tuple){
//                 tupleHTML = "";

//                 // console.log("\ntuple");
//                 // console.log(tuple);
                
//                 // node = document.createElement("DIV");
//                 // node.className = "node";
//                 // node.appendChild(nodeHead = document.createElement("DIV"));
//                 // nodeHead.className = "node-head";

//                 this.eachHierarchy(function(hierarchy){
//                     member = this.member();
//                     if (tupleHTML!=="") {
//                         tupleHTML += " - ";
//                     }
//                     tupleHTML += member.Caption;

//                     objToAdd[hierarchy] = member.Caption;
//                     // console.log("\nhierarchy");
//                     // console.log(hierarchy);
//                 });

//                 // console.log("\nmember 0");
//                 // console.log(this.members);

//                 // nodeHead.innerHTML = tupleHTML;
//                 // node.appendChild(nodeBody = document.createElement("DIV"));
//                 // nodeBody.className = "node-body";
//                 // parent.appendChild(node);

//                 console.log("\ntupleHTML");
//                 console.log(tupleHTML);

//                 if (axisIndex) {
//                     renderAxes(nodeBody, axisIndex-1);
//                     arrAxes.push(objToAdd);
//                 }
//                 else {
//                     objToAdd["value"] = cellset.cellValue();
//                     console.log(cellset.cellValue());
//                     cellset.nextCell();
//                     arrAxes.push(objToAdd);
//                 }
//             });
//             axis.reset();
//         }
//       renderAxes();









//       toRet.arr = arr;
//       toRet.arrAxes = arrAxes;
//       toRet.count = cellCount;
//       console.log("doneeee");

//       res.json(toRet);
//     },
//     error: function(x, xmlaRequest, exception){
//        //handle error
//        console.log("ERROR EXEC");
//        console.log(exception);
//        res.json({});
//     },
//     username: INIT_USER,
//     password: INIT_PASS
//   });
// }





function tryExecuteOLAP(req, res, arr, timeframe, startDate, endDate, yesterday){

    var toRet = {};

    var sentences = new Array();
    var recoverySentences = new Array();

    arr.forEach(function(variable){

      var sentence = "WITH MEMBER [Measures].[Basket] AS\n"+
          "  [Measures].[W_sp_csn_rb] /   \n"+
          "  [Measures].[Paragony]\n"+
 
          " MEMBER [Measures].[ParagonuOverOne] AS"+
          " SUM ({[Linie paragonu].[Linie paragonu].&[2]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony])"+    
          " MEMBER [Measures].[AllParagonu] AS"+
          " SUM ({[Linie paragonu].[Linie paragonu].&[0]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony])"+  
          " MEMBER [Measures].[PercBills] AS"+
          " ([Measures].[ParagonuOverOne] /[Measures].[AllParagonu] )*100"+  

          "SELECT { \n"+
          " [Measures].["+variable+"]}  ON COLUMNS,\n"+
          " NON EMPTY\n"+
          " ([Data].[Kalendarz].[Dzień].&["+endDate+"],\n"+
          " [Czas].[Czas].Members,\n"+
          " [Sklep].[Sklep Lokalizacja].Members,\n"+
          " [Sklep].[Sklep Miasto].Members,\n"+
          " [Sklep].[Sklep Nazwa].Members)\n"+
          " ON ROWS\n"+
          "FROM [BI_Reports]";

      if(timeframe == 5){
        sentence = "WITH MEMBER [Measures].[Basket] AS\n"+
          "  [Measures].[W_sp_csn_rb] /   \n"+
          "  [Measures].[Paragony]\n"+

          " MEMBER [Measures].[ParagonuOverOne] AS"+
          " SUM ({[Linie paragonu].[Linie paragonu].&[2]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony])"+    
          " MEMBER [Measures].[AllParagonu] AS"+
          " SUM ({[Linie paragonu].[Linie paragonu].&[0]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony])"+  
          " MEMBER [Measures].[PercBills] AS"+
          " ([Measures].[ParagonuOverOne] /[Measures].[AllParagonu] )*100"+ 


          "SELECT { \n"+
          " [Measures].["+variable+"]}  ON COLUMNS,\n"+
          " NON EMPTY\n"+
          " ([Data].[Kalendarz].[Dzień].&["+startDate+"]:[Data].[Kalendarz].[Dzień].&["+endDate+"],\n"+
          " [Sklep].[Sklep Lokalizacja].Members,\n"+
          " [Sklep].[Sklep Miasto].Members,\n"+
          " [Sklep].[Sklep Nazwa].Members)\n"+
          " ON ROWS\n"+
          "FROM [BI_Reports]";
      }
      sentences.push(sentence);


      var sentence = "WITH MEMBER [Measures].[Basket] AS\n"+
            "  [Measures].[W_sp_csn_rb] /   \n"+
            "  [Measures].[Paragony]\n"+

            " MEMBER [Measures].[ParagonuOverOne] AS"+
            " SUM ({[Linie paragonu].[Linie paragonu].&[2]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony])"+    
            " MEMBER [Measures].[AllParagonu] AS"+
            " SUM ({[Linie paragonu].[Linie paragonu].&[0]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony])"+  
            " MEMBER [Measures].[PercBills] AS"+
            " ([Measures].[ParagonuOverOne] /[Measures].[AllParagonu] )*100"+             

            "SELECT { \n"+
            " [Measures].["+variable+"]}  ON COLUMNS,\n"+
            " NON EMPTY\n"+
            " ([Data].[Kalendarz].[Dzień].&["+yesterday+"]:[Data].[Kalendarz].[Dzień].&["+endDate+"],\n"+
            " [Czas].[Czas].Members,\n"+
            " [Sklep].[Sklep Lokalizacja].Members,\n"+
            " [Sklep].[Sklep Miasto].Members,\n"+
            " [Sklep].[Sklep Nazwa].Members)\n"+
            " ON ROWS\n"+
            "FROM [BI_Reports]";
      if(timeframe == 5){
        sentence = "WITH MEMBER [Measures].[Basket] AS\n"+
          "  [Measures].[W_sp_csn_rb] /   \n"+
          "  [Measures].[Paragony]\n"+

          " MEMBER [Measures].[ParagonuOverOne] AS"+
          " SUM ({[Linie paragonu].[Linie paragonu].&[2]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony])"+    
          " MEMBER [Measures].[AllParagonu] AS"+
          " SUM ({[Linie paragonu].[Linie paragonu].&[0]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony])"+  
          " MEMBER [Measures].[PercBills] AS"+
          " ([Measures].[ParagonuOverOne] /[Measures].[AllParagonu] )*100"+ 


          "SELECT { \n"+
          " [Measures].["+variable+"]}  ON COLUMNS,\n"+
          " NON EMPTY\n"+
          " ([Data].[Kalendarz].[Dzień].&["+startDate+"]:[Data].[Kalendarz].[Dzień].&["+endDate+"],\n"+
          " [Sklep].[Sklep Lokalizacja].Members,\n"+
          " [Sklep].[Sklep Miasto].Members,\n"+
          " [Sklep].[Sklep Nazwa].Members)\n"+
          " ON ROWS\n"+
          "FROM [BI_Reports]";
      }
      recoverySentences.push(sentence);
     
    });


    var date1 = new Date(cacheUpdated);
    var date2 = new Date();
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffSecs = Math.ceil(timeDiff / (1000)); 

    if(diffSecs <= CACHE_LIMIT_SECS && cacheTimeframe == timeframe){
      console.log("cache was updated "+diffSecs+" s ago (less than limit "+CACHE_LIMIT_SECS+" s). Returning cache.");
      res.json(polandOlapCache);
    } else {
      console.log("invalid cache, letting the method update!");
      cacheTimeframe = timeframe;
      var parent = {"parent": []};
      executeQueryMDX(req, res, sentences, recoverySentences, parent);
    }
}


function tryExecuteOLAPcumulativeCzas(req, res, arr, timeframe, startDate, endDate, yesterday){
  // function to query the server on some measure and get the last czas
  
  var hoursInSeconds = 0;

  // var endDate = '20150329';

  var sentence = "SELECT { "+
 "[Measures].[W_sp_csn_rb]}  ON COLUMNS, "+
 "NON EMPTY "+
 "([Data].[Kalendarz].[Dzień].&["+endDate+"], "+
 "[Sklep].[Sklep Lokalizacja].Members, "+
 "[Sklep].[Sklep Miasto].Members, "+
 "[Czas].[Czas].Members, "+
 "[Sklep].[Sklep Nazwa].Members) "+
 "ON ROWS "+
"FROM [BI_Reports]";

  console.log("sentence "+sentence);


  var properties = { DataSourceInfo: null, Catalog: INIT_CATALOG_NAME };
  var parent = {"parent": []};


  x.execute({
    async: true,
    url: INIT_URL,
    statement: sentence,
      properties: properties,
    success: function(xmla, request, response){
      console.log("SUCCESS EXEC");

      var dataset = response;

      var cellset = response.getCellset();

    var oobj = {};
    var theobj = cellset.getByIndex(0, oobj);



    function append(obj, destinationObject){
      if(destinationObject.hasOwnProperty("parent"))
        destinationObject["parent"].push(obj);
      else
        destinationObject["node"].push(obj);
    }


        function renderAxes(parent, axisIndex){
            if (typeof(axisIndex)==="undefined"){
                
                axisIndex = dataset.axisCount() - 1;
            }
            var axis = dataset.getAxis(axisIndex),
                member, tupleHTML,
                node, nodeHead, nodeBody, cell
            ;
            axis.eachTuple(function(tuple){
                tupleHTML = "";



                // console.log("\ntuple");
                // console.log(tuple);

                // node = document.createElement("DIV");
                node = { "node": []};
                // node.className = "node";
                // node.appendChild(nodeHead = document.createElement("DIV"));
                var nodeArrObj = {};
                // console.log("node");
                append(nodeArrObj, node);
                // nodeHead.className = "node-head";

                var tupleMembers = {};

                this.eachHierarchy(function(hierarchy){
                    member = this.member();
                    if (tupleHTML!=="") {
                        tupleHTML += " - ";
                    }
                    tupleHTML += member.Caption;
                    // console.log("\nhierarchy");
                    // console.log(hierarchy);
                    // console.log("\nmember");
                    // console.log(member);
                    if(member.hierarchy == '[Measures]'){
                      tupleMembers["kpi"] = member.Caption;
                    } else {
                      tupleMembers[member.hierarchy] = member.Caption;
                    }
                });


                // console.log("\nmember 0");
                // console.log(this.members);

                // nodeHead.innerHTML = tupleHTML;

                // nodeArrObj["head"] = tupleHTML; // APPEND HEAD - commented

                // node.appendChild(nodeBody = document.createElement("DIV"));
                nodeBody = [];
                nodeArrObj["body"] = nodeBody;
                // nodeBody.className = "node-body";
                // parent.appendChild(node);
                // console.log("parent");
                append(node, parent);

                // console.log("\ntupleHTML");
                // console.log(tupleHTML);

                if (axisIndex) {
                  // console.log("renderAxes");
                    // renderAxes(nodeBody, axisIndex-1);

                    var axis2 = dataset.getAxis(axisIndex-1);
                    axis2.eachTuple(function(tuple2){

                      this.eachHierarchy(function(hierarchy){
                        member = this.member();
                        // if (tupleHTML!=="") {
                        //     tupleHTML += " - ";
                        // }
                        // tupleHTML += member.Caption;
                        // console.log("\nhierarchy");
                        // console.log(hierarchy);
                        // console.log("\nmember");
                        // console.log(member);
                        if(member.hierarchy == '[Measures]'){
                          // tupleMembers["kpi"] = member.Caption;
                          tupleMembers[member.Caption] = cellset.cellValue();
                        } else {
                          tupleMembers[member.hierarchy] = member.Caption;
                        }
                    });
                      // console.log("tupleHTML "+ tupleHTML);
                      // tupleMembers["value"] = cellset.cellValue();
                      tupleMembers["tupleHTML"] = tupleHTML;
                      nodeBody[0] = tupleMembers;
                      cellset.nextCell();
                    });


                }
                else {
                  // tupleMembers["value"] = cellset.cellValue();
                  tupleMembers["tupleHTML"] = tupleHTML;
                  nodeBody[0] = tupleMembers;
                    // console.log(cellset.cellValue());
                    cellset.nextCell();
                }

            });
            axis.reset();
        }
        
        renderAxes(parent);

        if(cellset.cellCount() == 0){
          console.log("there are no values for today!");
          res.json({});
        } else {
          console.log("\n\nparent");
          // console.log(parent);
          console.log(parent.parent.length);

          // improvement: get the last czas for each Locactia, then on the controller.draw chart render until that one
          var lastHours = parent.parent[parent.parent.length-1].node[0].body[0]['[Czas].[Czas]'];
          


          hoursInSeconds = lastHours * 60 * 60;
          console.log(hoursInSeconds);
          
          // res.json({});
          // hoursInSeconds = 
          tryExecuteOLAPcumulative(req, res, arr, timeframe, startDate, endDate, yesterday, hoursInSeconds);
        }
        // if(cellset.cellCount() < MIN_CELLCOUNT){
        //   console.log(">>>> GOING RECOVERY SENTENCES!! ");
        //   executeQueryMDX(req, res, recoverySentencesArr, [], parent);
        // } else {
        //   if(statementsArr.length == 0){
        //     console.log("END");
        //     polandOlapCache = parent;
        //     cacheUpdated = new Date();
        //     console.log("updated cache, time "+cacheUpdated);
        //     res.json(parent);
        //   }
        //   else {
        //     console.log("... more statements to exec");
        //     executeQueryMDX(req, res, statementsArr, recoverySentencesArr, parent);
        //   }
        // }

        
    },
    error: function(x, xmlaRequest, exception){
       //handle error
       console.log("ERROR EXEC");
       console.log(exception);
       res.json({});
    },
    username: INIT_USER,
    password: INIT_PASS
  });




}

function tryExecuteOLAPcumulative(req, res, arr, timeframe, startDate, endDate, yesterday, hoursInSeconds){
  var toRet = {};

  var sentences = new Array();
  var recoverySentences = new Array();

  var sentence = "WITH MEMBER [Measures].[Sales] AS "+
   "SUM ({[Czas].[Czas].CurrentMember.level.Members.Item(0):[Czas].[Czas].CurrentMember},[Measures].[W_sp_csn_rb]) "+
    "   MEMBER [Measures].[Customers] AS "+
    "   SUM ({[Czas].[Czas].CurrentMember.level.Members.Item(0):[Czas].[Czas].CurrentMember},[Measures].[Paragony]) "+
    "   MEMBER [Measures].[Basket] AS "+
    "   ([Measures].[Sales] / [Measures].[Customers]) "+

   " MEMBER [Measures].[Revenue] AS "+
   " SUM ({[Czas].[Czas].CurrentMember.level.Members.Item(0):[Czas].[Czas].CurrentMember},([Measures].[M_spn_rb] /[Measures].[M_spn_rb%])) "+
   " MEMBER [Measures].[Margin] AS "+
   " SUM ({[Czas].[Czas].CurrentMember.level.Members.Item(0):[Czas].[Czas].CurrentMember},[Measures].[M_spn_rb]) "+
   " MEMBER [Measures].[MarginPerc] AS "+
   " ([Measures].[Margin] / [Measures].[Revenue]) "+

    "SELECT {[Measures].[Sales],[Measures].[Customers],[Measures].[Basket], [Measures].[MarginPerc]}  ON COLUMNS, "+
    " NON EMPTY "+
    " ([Data].[Kalendarz].[Dzień].&["+endDate+"],  "+
    " [Sklep].[Sklep Lokalizacja].Members, "+
    "[Czas].[Czas].&[0]:[Czas].[Czas].&["+hoursInSeconds+"]) "+
    " ON ROWS "+
    "FROM [BI_Reports]";
  sentences.push(sentence);



  var sentenceStock = "SELECT { [Measures].[W_zap_czn_r]}  ON COLUMNS,  "+
    "NON EMPTY  ([Data].[Kalendarz].[Dzień].&["+endDate+"], "+
    "[Czas].[Czas].&[0]:[Czas].[Czas].&["+hoursInSeconds+"], "+
    " [Sklep].[Sklep Lokalizacja].Members)  ON ROWS "+
    " FROM [BI_Reports]";
  sentences.push(sentenceStock);



  var sentence = "WITH MEMBER [Measures].[Sales] AS "+
   "SUM ({[Czas].[Czas].CurrentMember.level.Members.Item(0):[Czas].[Czas].CurrentMember},[Measures].[W_sp_csn_rb]) "+
    "   MEMBER [Measures].[Customers] AS "+
    "   SUM ({[Czas].[Czas].CurrentMember.level.Members.Item(0):[Czas].[Czas].CurrentMember},[Measures].[Paragony]) "+
    "   MEMBER [Measures].[Basket] AS "+
    "   ([Measures].[Sales] / [Measures].[Customers]) "+
   " MEMBER [Measures].[Revenue] AS "+
   " SUM ({[Czas].[Czas].CurrentMember.level.Members.Item(0):[Czas].[Czas].CurrentMember},([Measures].[M_spn_rb] /[Measures].[M_spn_rb%])) "+
   " MEMBER [Measures].[Margin] AS "+
   " SUM ({[Czas].[Czas].CurrentMember.level.Members.Item(0):[Czas].[Czas].CurrentMember},[Measures].[M_spn_rb]) "+
   " MEMBER [Measures].[MarginPerc] AS "+
   " ([Measures].[Margin] / [Measures].[Revenue]) "+

    "SELECT {[Measures].[Sales],[Measures].[Customers],[Measures].[Basket], [Measures].[MarginPerc]}  ON COLUMNS, "+
    " NON EMPTY "+
    " ([Data].[Kalendarz].[Dzień].&["+yesterday+"]:[Data].[Kalendarz].[Dzień].&["+endDate+"],  "+
    " [Sklep].[Sklep Lokalizacja].Members, "+
    "[Czas].[Czas].Members) "+
    " ON ROWS "+
    "FROM [BI_Reports]";
  recoverySentences.push(sentence);


  // criar aqui query para o bills


  var sentenceBills = "WITH MEMBER [Measures].[ParagonuOverOne] AS  SUM ({[Linie paragonu].[Linie paragonu].&[2]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony]) "+
    " MEMBER [Measures].[AllParagonu] AS  SUM ({[Linie paragonu].[Linie paragonu].&[1]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony]) "+
    " MEMBER [Measures].[CumParagonuOverOne] AS SUM ({[Czas].[Czas].CurrentMember.level.Members.Item(0):[Czas].[Czas].CurrentMember},[Measures].[ParagonuOverOne]) "+
    " MEMBER [Measures].[CumAllParagonu] AS SUM ({[Czas].[Czas].CurrentMember.level.Members.Item(0):[Czas].[Czas].CurrentMember},[Measures].[AllParagonu]) "+
    " MEMBER [Measures].[PercBills] AS  ([Measures].[CumParagonuOverOne] /[Measures].[CumAllParagonu] )*100 "+
    " SELECT { "+
    " [Measures].[PercBills] "+
    " } "+
    " ON COLUMNS,  NON EMPTY  "+
    " ([Data].[Kalendarz].[Dzień].&["+endDate+"], "+
    " [Sklep].[Sklep Lokalizacja].Members, "+
    " [Czas].[Czas].&[0]:[Czas].[Czas].&["+hoursInSeconds+"]) "+
    " ON ROWS FROM [BI_Reports]";

  sentences.push(sentenceBills);


  var date1 = new Date(cacheUpdated);
  var date2 = new Date();
  var timeDiff = Math.abs(date2.getTime() - date1.getTime());
  var diffSecs = Math.ceil(timeDiff / (1000)); 

  if(diffSecs <= CACHE_LIMIT_SECS && cacheTimeframe == timeframe){
    console.log("cache was updated "+diffSecs+" s ago (less than limit "+CACHE_LIMIT_SECS+" s). Returning cache.");
    res.json(polandOlapCache);
  } else {
    console.log("invalid cache, letting the method update!");
    cacheTimeframe = timeframe;
    var parent = {"parent": []};
    executeQueryMDX(req, res, sentences, recoverySentences, parent);
  }
}




function executeQueryMDX(req, res, statementsArr, recoverySentencesArr, parent){
  console.log("API call: executeQueryMDX");

  var properties = { DataSourceInfo: null, Catalog: INIT_CATALOG_NAME };

  var statement = statementsArr.shift();
  console.log(statement);

  x.execute({
    async: true,
    url: INIT_URL,
    statement: statement,
      properties: properties,
    success: function(xmla, request, response){
      console.log("SUCCESS EXEC");

      var dataset = response;
      
      // console.log(dataset);

      // toRet.dataset = dataset;

      // console.log("\n\nget cell set");
      var cellset = response.getCellset();
      // console.log("\n\ncellset");
      // console.log(cellset);

    console.log("\n\n CELLSET cellset cellCount "+ (cellset.cellCount()));



    // console.log("\n\ncellset cellOrdinal "+ (cellset.cellOrdinal()));
    // console.log("\n\ncellset curr "+ (cellset.curr()));

      // console.log(cellset.cellCount());
      // cellset.eachCell(function(cell){
      //  console.log("cell");
      //  console.log(cell);
      // });

    var oobj = {};
    var theobj = cellset.getByIndex(0, oobj);

    console.log(theobj);

      console.log("done");





      // console.log("\n\ndataset.axisCount()");
      // console.log(dataset.axisCount());

      // var axis = dataset.getAxis(0);

      // axis.eachTuple(function(tuple){
      //  console.log("tuple");
      //  console.log(tuple);
      // });


      // var axis1 = dataset.getAxis(1);

      // axis1.eachTuple(function(tuple1){
      //  console.log("tuple1");
      //  console.log(tuple1);
      // });


    function append(obj, destinationObject){
      if(destinationObject.hasOwnProperty("parent"))
        destinationObject["parent"].push(obj);
      else
        destinationObject["node"].push(obj);
    }


        function renderAxes(parent, axisIndex){
            if (typeof(axisIndex)==="undefined"){
                
                axisIndex = dataset.axisCount() - 1;
            }
            var axis = dataset.getAxis(axisIndex),
                member, tupleHTML,
                node, nodeHead, nodeBody, cell
            ;
            axis.eachTuple(function(tuple){
                tupleHTML = "";



                // console.log("\ntuple");
                // console.log(tuple);

                // node = document.createElement("DIV");
                node = { "node": []};
                // node.className = "node";
                // node.appendChild(nodeHead = document.createElement("DIV"));
                var nodeArrObj = {};
                // console.log("node");
                append(nodeArrObj, node);
                // nodeHead.className = "node-head";

                var tupleMembers = {};

                this.eachHierarchy(function(hierarchy){
                    member = this.member();
                    if (tupleHTML!=="") {
                        tupleHTML += " - ";
                    }
                    tupleHTML += member.Caption;
                    // console.log("\nhierarchy");
                    // console.log(hierarchy);
                    // console.log("\nmember");
                    // console.log(member);
                    if(member.hierarchy == '[Measures]'){
                      tupleMembers["kpi"] = member.Caption;
                    } else {
                      tupleMembers[member.hierarchy] = member.Caption;
                    }
                });


                // console.log("\nmember 0");
                // console.log(this.members);

                // nodeHead.innerHTML = tupleHTML;

                // nodeArrObj["head"] = tupleHTML; // APPEND HEAD - commented

                // node.appendChild(nodeBody = document.createElement("DIV"));
                nodeBody = [];
                nodeArrObj["body"] = nodeBody;
                // nodeBody.className = "node-body";
                // parent.appendChild(node);
                // console.log("parent");
                append(node, parent);

                // console.log("\ntupleHTML");
                // console.log(tupleHTML);

                if (axisIndex) {
                  // console.log("renderAxes");
                    // renderAxes(nodeBody, axisIndex-1);

                    var axis2 = dataset.getAxis(axisIndex-1);
                    axis2.eachTuple(function(tuple2){

                      this.eachHierarchy(function(hierarchy){
                        member = this.member();
                        // if (tupleHTML!=="") {
                        //     tupleHTML += " - ";
                        // }
                        // tupleHTML += member.Caption;
                        // console.log("\nhierarchy");
                        // console.log(hierarchy);
                        // console.log("\nmember");
                        // console.log(member);
                        if(member.hierarchy == '[Measures]'){
                          // tupleMembers["kpi"] = member.Caption;
                          tupleMembers[member.Caption] = cellset.cellValue();
                        } else {
                          tupleMembers[member.hierarchy] = member.Caption;
                        }
                    });
                      // console.log("tupleHTML "+ tupleHTML);
                      // tupleMembers["value"] = cellset.cellValue();
                      tupleMembers["tupleHTML"] = tupleHTML;
                      nodeBody[0] = tupleMembers;
                      cellset.nextCell();
                    });


                }
                else {
                  // tupleMembers["value"] = cellset.cellValue();
                  tupleMembers["tupleHTML"] = tupleHTML;
                  nodeBody[0] = tupleMembers;
                    // console.log(cellset.cellValue());
                    cellset.nextCell();
                }

            });
            axis.reset();
        }


        var MIN_CELLCOUNT = 1;
        
        if(cellset.cellCount() >= MIN_CELLCOUNT)
          renderAxes(parent);




        console.log("Testing: "+cellset.cellCount());
        if(cellset.cellCount() < MIN_CELLCOUNT){
          console.log(">>>> GOING RECOVERY SENTENCES!! ");
          executeQueryMDX(req, res, recoverySentencesArr, [], parent);
        } else {
          if(statementsArr.length == 0){
            console.log("END");
            polandOlapCache = parent;
            cacheUpdated = new Date();
            console.log("updated cache, time "+cacheUpdated);
            res.json(parent);
          }
          else {
            console.log("... more statements to exec");
            executeQueryMDX(req, res, statementsArr, recoverySentencesArr, parent);
          }
        }


      
      
        
      


      // if(statementsArr.length == 0){
      //   console.log("END");
      //   polandOlapCache = parent;
      //   cacheUpdated = new Date();
      //   console.log("updated cache, time "+cacheUpdated);
      //   res.json(parent);
      // }
      // else {
      //   console.log("Testing: "+cellset.cellCount());
      //   if(cellset.cellCount() < 170){
      //     executeQueryMDX(req, res, recoverySentencesArr, [], parent);
      //     console.log(">>>> GOING RECOVERY SENTENCES!! ");
      //   } else {
      //     executeQueryMDX(req, res, statementsArr, recoverySentencesArr, parent);
      //   }
      // }
    },
    error: function(x, xmlaRequest, exception){
       //handle error
       console.log("ERROR EXEC");
       console.log(exception);
       res.json({});
    },
    username: INIT_USER,
    password: INIT_PASS
  });


}



function getKpisFromIconConfig(arr){
  var retArr = new Array();

  if(arr != undefined && arr != null){
    arr.forEach(function(cfgobj){
      if(cfgobj.hasOwnProperty('source_olap')){
        if(cfgobj.source_olap)
          retArr.push(cfgobj.name);
      }
    });
  }

  return retArr;

  // [ { buckets: [ [Object], [Object], [Object], [Object], [Object] ],
  //   title: 'Baskete',
  //   source: 'pointindicator',
  //   position: 1,
  //   name: 'Basket',
  //   type: 'Intervals' },
  // { buckets: [ [Object], [Object], [Object] ],
  //   title: 'Paragonias',
  //   source: 'pointindicator',
  //   position: 2,
  //   name: 'Number of Customers',
  //   type: 'Intervals' },
  // { buckets: [ [Object], [Object], [Object] ],
  //   title: 'Margin',
  //   source: 'pointindicator',
  //   position: 3,
  //   name: 'Net Margin',
  //   type: 'Intervals' },
  // { buckets: [ [Object], [Object], [Object], [Object] ],
  //   source: 'pointindicator',
  //   name: 'Net Sales',
  //   type: 'Intervals',
  //   title: 'Net Sales',
  //   position: 4 } ]


}



var polandOlapCache = {};
var cacheTimeframe = -1;
var cacheUpdated = 0;
var CACHE_LIMIT_SECS = 1;

exports.olapExecuteKpis = function(req,res){
  console.log("API call: olapExecuteKpis");
  var uid = req.session.passport.user;
  var timeframe = req.params.timeframe;
  var pid = req.params.pid



  if(uid === undefined || uid === null){
    res.json({"error":"not authenticated!"});
  } else {

    
    

    // console.log(req.body.kpis);




    var today = new Date(); // there is a challenge here, it was set with summer time (daylight savings time)
    // console.log(today); // Sun Mar 15 2015 16:54:07 GMT+0100 (Hora de Verão de GMT)  e eram 15:54
    today.setHours(today.getHours() - 1);
    // console.log("today");
    // console.log(today);
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    } 

    if(mm<10) {
        mm='0'+mm
    } 

    var endDate = yyyy+""+mm+""+dd;
    console.log(endDate);


    var hh = today.getHours();
    var hoursInSeconds = hh * 3600;


    var yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 1);
    yesterday.setDate(yesterday.getDate() - 1);
    var dd = yesterday.getDate();
    var mm = yesterday.getMonth()+1; //January is 0!
    var yyyy = yesterday.getFullYear();

    if(dd<10) {
        dd='0'+dd
    } 

    if(mm<10) {
        mm='0'+mm
    } 

    var yesterday = yyyy+""+mm+""+dd;
    console.log(yesterday);


    // endDate = "20150317";
    // endDate = '20150329';
    // endDate = '20150603';

    var weekago = new Date();
    weekago.setDate(weekago.getDate() - 5);

    var dd = weekago.getDate();
    var mm = weekago.getMonth()+1; //January is 0!
    var yyyy = weekago.getFullYear();

    if(dd<10) {
        dd='0'+dd
    } 

    if(mm<10) {
        mm='0'+mm
    } 

    var startDate = yyyy+""+mm+""+dd;
    console.log(startDate);


  sentence = "WITH MEMBER [Measures].[Basket] AS\n"+
  "  [Measures].[W_sp_csb] / [Measures].[Paragony]\n"+

  " MEMBER [Measures].[ParagonuOverOne] AS\n"+
  " SUM ({[Linie paragonu].[Linie paragonu].&[2]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony]),\n"+    
  " MEMBER [Measures].[AllParagonu] AS\n"+
  " SUM ({[Linie paragonu].[Linie paragonu].&[0]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony]),\n"+  
  " MEMBER [Measures].[PercBills] AS\n"+
  " ([Measures].[ParagonuOverOne] /[Measures].[AllParagonu] )*100,\n"+  

  "SELECT { \n"+
  " [Measures].[Basket], [Measures].[W_sp_csb], [Measures].[PercBills]}  ON COLUMNS,\n"+
  " NON EMPTY\n"+
  " ([Data].[Kalendarz].[Dzień].&[20150315]:[Data].[Kalendarz].[Dzień].&[20150310],\n"+
  " [Sklep].[Sklep Lokalizacja].Members,\n"+
  " [Sklep].[Sklep Miasto].Members,\n"+
  " [Sklep].[Sklep Nazwa].Members)\n"+
  " ON ROWS\n"+
  "FROM [BI_Reports]";



  sentence = "WITH MEMBER [Measures].[Basket] AS\n"+
  "  [Measures].[W_sp_csb] /   \n"+
  "  [Measures].[Paragony]\n"+

  " MEMBER [Measures].[ParagonuOverOne] AS\n"+
  " SUM ({[Linie paragonu].[Linie paragonu].&[2]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony]),\n"+    
  " MEMBER [Measures].[AllParagonu] AS\n"+
  " SUM ({[Linie paragonu].[Linie paragonu].&[0]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony]),\n"+  
  " MEMBER [Measures].[PercBills] AS\n"+
  " ([Measures].[ParagonuOverOne] /[Measures].[AllParagonu] )*100,\n"+  

  "SELECT { \n"+
  " [Measures].[Basket], [Measures].[W_sp_csb], [Measures].[PercBills]}  ON COLUMNS,\n"+
  " NON EMPTY\n"+
  " ([Data].[Kalendarz].[Dzień].&["+endDate+"]:[Data].[Kalendarz].[Dzień].&["+startDate+"],\n"+
  " [Sklep].[Sklep Lokalizacja].Members,\n"+
  " [Sklep].[Sklep Miasto].Members,\n"+
  " [Sklep].[Sklep Nazwa].Members)\n"+
  " ON ROWS\n"+
  "FROM [BI_Reports]";


    
    


    

    // NUNOALEX: these should come from the currently configured custom icons

    var toReturn = {};

    var client = new pg.Client(conString);
    client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }

      var q = "select iconconfig from projects where pid = "+pid;
      client.query(q, function(err, result) {
        if(err) {
          // this is because customMarkerCfg is hardcoded!!
          toReturn.customMarkerCfg = customMarkerCfg;
          
          res.json(toReturn);
          client.end();
          return console.error('getCustomIcons get project error running query', err);
        }


        if(result.rows.length == 0){
          // no project with that pid
          toReturn.customMarkerCfg = [];
        } else {
          // it can only be length 1
          if(result.rows[0].iconconfig == null){
            // it exists but it has not been initialized
            toReturn.customMarkerCfg = [];
          } else {
            // happy path / normal situation
            toReturn.customMarkerCfg = result.rows[0].iconconfig;
          }
        }

        var olap_kpis_list = ['Basket', 'Paragony', 'W_sp_csn_rb', 'M_spn_rb%', 'PercBills', 'W_zap_czn_r'];

        // kpis_list = getKpisFromIconConfig()
        var kpis_list = getKpisFromIconConfig(result.rows[0].iconconfig);

        var found = false;
        for(var i in kpis_list){
          if(kpis_list[i] == "Basket" ||
             kpis_list[i] == "Number of Customers" ||
             kpis_list[i] == "Net Margin" ||
             kpis_list[i] == "Net Sales" || 
             kpis_list[i] == "Multiline Bills" ||
             kpis_list[i] == "Stock Level")
            found = true;
        }

        console.log(found);

        if(found){
          if(timeframe == '0' || timeframe == 0){
            tryExecuteOLAPcumulativeCzas(req, res, olap_kpis_list, timeframe, startDate, endDate, yesterday);
          }
          else {
            var olap_kpis_list = ['Basket', 'Paragony', 'W_sp_csn_rb', 'M_spn_rb%', 'PercBills'];
            tryExecuteOLAP(req, res, olap_kpis_list, timeframe, startDate, endDate, yesterday);
          }
        }
        else
          res.json({});
          
        client.end();
      });
    });



  }
}



exports.olapExecute = function(req, res){
  console.log("API call: olapExecute");
  console.log(req.body.sentence);

  var toRet = {};

  var sentences = new Array();
  sentences.push(req.body.sentence);
  
  var parent = {"parent": []};
  executeQueryMDX(req, res, sentences, [], parent);

  // var properties = { DataSourceInfo: null, Catalog: INIT_CATALOG_NAME };

  // x.execute({
  //   async: true,
  //   url: INIT_URL,
  //   statement: req.body.sentence,
  //     properties: properties,
  //   success: function(xmla, request, response){
  //     console.log("SUCCESS EXEC");

  //     var dataset = response;
  //     // console.log(dataset);

  //     // toRet.dataset = dataset;

  //     // console.log("\n\nget cell set");
  //     var cellset = response.getCellset();
  //     // console.log("\n\ncellset");
  //     // console.log(cellset);

  //   console.log("\n\ncellset cellCount "+ (cellset.cellCount()));
  //   // console.log("\n\ncellset cellOrdinal "+ (cellset.cellOrdinal()));
  //   // console.log("\n\ncellset curr "+ (cellset.curr()));

  //     // console.log(cellset.cellCount());
  //     // cellset.eachCell(function(cell){
  //     //  console.log("cell");
  //     //  console.log(cell);
  //     // });

  //   var oobj = {};
  //   var theobj = cellset.getByIndex(0, oobj);

  //   console.log(theobj);

  //     console.log("done");





  //     // console.log("\n\ndataset.axisCount()");
  //     // console.log(dataset.axisCount());

  //     // var axis = dataset.getAxis(0);

  //     // axis.eachTuple(function(tuple){
  //     //  console.log("tuple");
  //     //  console.log(tuple);
  //     // });


  //     // var axis1 = dataset.getAxis(1);

  //     // axis1.eachTuple(function(tuple1){
  //     //  console.log("tuple1");
  //     //  console.log(tuple1);
  //     // });


  //   function append(obj, destinationObject){
  //     if(destinationObject.hasOwnProperty("parent"))
  //       destinationObject["parent"].push(obj);
  //     else
  //       destinationObject["node"].push(obj);
  //   }


  //       function renderAxes(parent, axisIndex){
  //           if (typeof(axisIndex)==="undefined"){
                
  //               axisIndex = dataset.axisCount() - 1;
  //           }
  //           var axis = dataset.getAxis(axisIndex),
  //               member, tupleHTML,
  //               node, nodeHead, nodeBody, cell
  //           ;
  //           axis.eachTuple(function(tuple){
  //               tupleHTML = "";



  //               // console.log("\ntuple");
  //               // console.log(tuple);

  //               // node = document.createElement("DIV");
  //               node = { "node": []};
  //               // node.className = "node";
  //               // node.appendChild(nodeHead = document.createElement("DIV"));
  //               var nodeArrObj = {};
  //               console.log("node");
  //               append(nodeArrObj, node);
  //               // nodeHead.className = "node-head";

  //               var tupleMembers = {};

  //               this.eachHierarchy(function(hierarchy){
  //                   member = this.member();
  //                   if (tupleHTML!=="") {
  //                       tupleHTML += " - ";
  //                   }
  //                   tupleHTML += member.Caption;
  //                   // console.log("\nhierarchy");
  //                   // console.log(hierarchy);
  //                   // console.log("\nmember");
  //                   // console.log(member);
  //                   if(member.hierarchy == '[Measures]'){
  //                     tupleMembers["kpi"] = member.Caption;
  //                   } else {
  //                     tupleMembers[member.hierarchy] = member.Caption;
  //                   }
  //               });


  //               // console.log("\nmember 0");
  //               // console.log(this.members);

  //               // nodeHead.innerHTML = tupleHTML;

  //               // nodeArrObj["head"] = tupleHTML; // APPEND HEAD - commented

  //               // node.appendChild(nodeBody = document.createElement("DIV"));
  //               nodeBody = [];
  //               nodeArrObj["body"] = nodeBody;
  //               // nodeBody.className = "node-body";
  //               // parent.appendChild(node);
  //               console.log("parent");
  //               append(node, parent);

  //               // console.log("\ntupleHTML");
  //               // console.log(tupleHTML);

  //               if (axisIndex) {
  //                 console.log("renderAxes");
  //                   // renderAxes(nodeBody, axisIndex-1);

  //                   var axis2 = dataset.getAxis(axisIndex-1);
  //                   axis2.eachTuple(function(tuple2){

  //                     this.eachHierarchy(function(hierarchy){
  //                       member = this.member();
  //                       // if (tupleHTML!=="") {
  //                       //     tupleHTML += " - ";
  //                       // }
  //                       // tupleHTML += member.Caption;
  //                       // console.log("\nhierarchy");
  //                       // console.log(hierarchy);
  //                       // console.log("\nmember");
  //                       // console.log(member);
  //                       if(member.hierarchy == '[Measures]'){
  //                         // tupleMembers["kpi"] = member.Caption;
  //                         tupleMembers[member.Caption] = cellset.cellValue();
  //                       } else {
  //                         tupleMembers[member.hierarchy] = member.Caption;
  //                       }
  //                   });
  //                     // console.log("tupleHTML "+ tupleHTML);
  //                     // tupleMembers["value"] = cellset.cellValue();
  //                     tupleMembers["tupleHTML"] = tupleHTML;
  //                     nodeBody[0] = tupleMembers;
  //                     cellset.nextCell();
  //                   });


  //               }
  //               else {
  //                 // tupleMembers["value"] = cellset.cellValue();
  //                 tupleMembers["tupleHTML"] = tupleHTML;
  //                 nodeBody[0] = tupleMembers;
  //                   // console.log(cellset.cellValue());
  //                   cellset.nextCell();
  //               }

  //           });
  //           axis.reset();
  //       }
  //       var parent = {"parent": []};
  //     renderAxes(parent);


  //     res.json(parent);
  //   },
  //   error: function(x, xmlaRequest, exception){
  //      //handle error
  //      console.log("ERROR EXEC");
  //      console.log(exception);
  //      res.json({});
  //   },
  //   username: INIT_USER,
  //   password: INIT_PASS
  // });
}


exports.saveOlapStore = function(req, res){
  console.log("API call: saveOlapStore");
  var aux = req.body;
  console.log(aux);

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }



    var q2 = "UPDATE points SET olapstoreinfo = '"+JSON.stringify(aux)+"'::json WHERE pointid = (select pointid from points where attributes->>'PointKey' = '"+req.params.pointkey+"' and pid_proj = "+req.params.pid+")";

              // console.log(q2);

    client.query(q2, function(err, result) {
      if(err) {
        client.end();
        res.json(aux);
        return console.error('saveOlapStore error running query', err);
      }
      console.log("UPDATED OLAPSTOREINFO json");
      res.json(aux);
      client.end();
    });
    

  });
}


exports.deleteOlapStore = function(req, res){
  console.log("API call: deleteOlapStore");
  console.log(req.body);

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }



    var q2 = "UPDATE points SET olapstoreinfo = NULL WHERE pointid = (select pointid from points where attributes->>'PointKey' = '"+req.params.pointkey+"' and pid_proj = "+req.params.pid+")";

    console.log(q2);

    client.query(q2, function(err, result) {
      if(err) {
        client.end();
        res.json(req.body);
        return console.error('deleteOlapStore error running query', err);
      }
      console.log("Resetted OLAPSTOREINFO json");
      res.json(req.body);
      client.end();
    });
    

  });
}

exports.getOlapStore = function(req, res){
  console.log("API call: getOlapStore");


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      res.json([]);
      return console.error('could not connect to postgres', err);
    }



    var q3 = "select olapstoreinfo from points where attributes->>'PointKey' = '"+req.params.pointkey+"' and pid_proj = "+req.params.pid;

              apiDebug(q3);

    client.query(q3, function(err, result) {
      if(err) {
        client.end();
        return console.error('getOlapStore error running query', err);
      }
      apiDebug("get OLAPSTOREINFO json");
      apiDebug(result.rows[0]);

      res.json(result.rows[0]);
      client.end();
    });
    

  });
}

exports.getAllOlapStores = function(req, res){
  console.log("API call: getAllOlapStores");


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }



    var q3 = "select olapstoreinfo from points where pid_proj = "+req.params.pid +" and olapstoreinfo is not null";

    console.log(q3);

    client.query(q3, function(err, result) {
      if(err) {
        res.json([]);
        client.end();
        return console.error('getAllOlapStores error running query', err);
      }
      console.log("get all OLAPSTOREINFO json");
      console.log(result.rows);

      res.json(result.rows);
      client.end();
    });
    

  });
}

// to deal with mailing lists
exports.getMailingList = function(req, res){
  console.log("API call: getMailingList");
  var pid = req.params.pid;
  
  var q = "SELECT mailinglists FROM projects WHERE pid = "+pid;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    client.query(q, function(err, result){
      if(err) {
        client.end();
        res.json({});
        return console.error('getMailingList error running query', err);
      }

      apiDebug(result.rows[0]);

      res.json(result.rows[0]);
      client.end();

    });

  });
}



exports.setMailingList = function(req, res){
  console.log("API call: setMailingList");

  var obj = req.body;
  var pid = req.params.pid;

  var q = "UPDATE projects SET mailinglists='"+JSON.stringify(obj)+"'::json WHERE pid = "+pid;

    var client = new pg.Client(conString);
    client.connect(function(err) {
      if(err) {
        return console.error('could not connect to postgres', err);
      }

      client.query(q, function(err, result){
        if(err) {
          client.end();
          res.json({});
          return console.error('setMailingList  error running query', err);
        } else {

          console.log("I'm OK HERE!!!!!!!!");
          console.log(result.rows[0]);

          res.json(result.rows[0]);
          client.end();
        }

      });

    });

}

exports.generateTable = function(req, res) {
    console.log("API call: generateTable");

    var pid = req.params.pid;

    if (req != null && req != undefined) {
        pid = req.params.pid;
    }

    var filter = {};

    if (req.body.startDate != null && req.body.startDate != undefined) {
        filter.startDate = req.body.startDate;
        filter.endDate = req.body.endDate;
    }

    dataaccess.getKpisAndPointsList(pid, function(result) {
        var kpis_list = result.kpis_list;
        //console.log(kpis_list);

        for (var i = 0; i < kpis_list.length; i++) {
            var kpi_title = kpis_list[i].title;
            var processed_kpis = 0;
            var to_results = {};
            to_results.points = {};

            dataaccess.getAllPointValues(pid, kpi_title, filter, function(n_results, results, kpi_title) {

                //console.log(results);

                processed_kpis++;
                to_results.points[kpi_title] = results;

                if (processed_kpis == kpis_list.length) {

                    var matrixPoints = new Array();

                    if (result.points_list != null) {

                        for (var g = 0; g < result.points_list.length; g++) {

                            var point = result.points_list[g];
                            var row = {};
                            row.A = point.attr;

                            for (var h = 0; h < kpis_list.length; h++) {

                                var kpi = kpis_list[h].title;
                                var val = findPointValue(to_results.points[kpi], point.pointid);
                                row[kpi] = val;
                            }
                            
                            matrixPoints.push(row);
                        }
                    }

                    to_results.matrixPoints = matrixPoints;
                    res.json(to_results);
                }
            });
        }
    });

    // aux

    var findPointValue = function(array, pointid) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].pointid_point == pointid) {
                return array[i].valuesjson.f2;
            }
        }
        return 'n/a';
    }
}




exports.getDatesToDelete = function(req, res){
  console.log("API call: getDatesToDelete");

  var dates = [];

  metadataaccess.getAllReadingsDates(req.params.pid, function(rows){
    dates = rows;
    dataaccess.getKpisList(req.params.pid, function(rows2){
      res.json({"dates": dates, "kpis": rows2});
    })
  });
  // for(var i=1; i<10; i++){
  //   dates.push({"date": "2015-06-0"+i});
  // }

}


exports.deleteDatesBulk = function(req, res){
  console.log("API call: deleteDatesBulk");

  



  var pid = req.params.pid;
  var selectedDates = req.body.selDates;

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }


    // var q = "select iid from indicators where pid_proj = " + pid;
    var q = "select distinct iid from indicators, json_array_elements(readings) as c where pid_proj = "+ pid;

    if(req.body.selKpis != ''){
      q += " and title in ("+req.body.selKpis+") ";
    }

    var q_dates = "";
    var q_dates_not = "";
    var q_dates_array = "";

    if(selectedDates.length > 0){
      q_dates += " and to_date(c->>'timestamp', 'YYYY-MM-DD') in ";
      q_dates_not += " and to_date(c->>'timestamp', 'YYYY-MM-DD') not in ";


      q_dates_array += "(";

      for(var i=0; i<selectedDates.length; i++){
        q_dates_array += "'" + selectedDates[i] + "'::date";
        if(i < selectedDates.length - 1){
          q_dates_array += ",";
        }
      }
      q_dates_array += ")";
      q += q_dates + q_dates_array;
    }

    client.query(q, function(err, result) {
      if(err) {
        client.end();
        res.json({});
        return console.error('deleteDatesBulk error running query', err);
      }


      var totalIid = result.rows.length;
      console.log("totalIid " + totalIid);

      // if(totalIid == 1){
        var iid_counter = 0;
        for(var i=0; i<totalIid; i++){
          // get all iid s (improvement: get only the iids that have req.body.selectedDates)
            // for each iid
              // select readings whith dates != selectedDates
                // update readings with result.rows on iid
          
          // console.log(result.rows[i]);

          // select c from indicators, json_array_elements(readings) as c where pid_proj = 144 and iid = 2598
          // and to_date(c->>'timestamp', 'YYYY-MM-DD') not in ('2015-07-23'::date, '2015-07-25'::date, '2015-07-30'::date)

          var iid = result.rows[i].iid;


          deleteUnwantedDates(client, iid, pid, q_dates_not, q_dates_array, i, function(i){
            iid_counter++;

            if(iid_counter == totalIid ){
              console.log("\ntotalIid");
              console.log(totalIid);
              client.end();
              res.json({});
            }
          })

          
        }
        
      // } else {
      //   console.log("\ntotalIid");
      //   console.log(totalIid);
      //   res.json({});
      // }


    });


  });

}



var deleteUnwantedDates = function(client, iid, pid, q_dates_not, q_dates_array, i, callback){

  console.log("deleteUnwantedDates + " + iid + "   i:" + i);

  var q2 = " select c from indicators, json_array_elements(readings) as c "
    + "where pid_proj = "+pid+" and iid = "+iid+" "
    + q_dates_not + q_dates_array +
    " order by to_date(c->>'timestamp', 'YYYY-MM-DD')"


  client.query(q2, function(err2, result2) {
    if(err2) {
      client.end();
      res.json({});
      console.log("q2");
      console.log(q2);
      return console.error('deleteDatesBulk2 error running query', err2);
    }

    var currentTimeMillis = new Date().getTime();

    var readings_aux = result2.rows;
    var readings = [];

    for(var i=0; i<readings_aux.length; i++){
      var c = readings_aux[i].c;
      readings.push({});
      for(var prop in c){
        if(c.hasOwnProperty(prop)){
          readings[readings.length-1][prop] = c[prop];
        }
      }
      // console.log(readings[readings.length-1]);
    }

    console.log(">>>>>>>>>> TIMER: took " + ( new Date().getTime() - currentTimeMillis) );

    var q3 = "UPDATE indicators SET readings = '"
     + JSON.stringify(readings)
     + "'::json "
     + " WHERE iid=" + iid + ";";

     console.log("DELETING READINGS of indicator " + iid + ";; updated # of readings to " + readings.length);
     console.log(q_dates_not + q_dates_array);


    client.query(q3, function(err3, result3) {
      if(err3) {
        client.end();
        res.json({});
        console.log("q3");
        console.log(q3);
        return console.error('deleteDatesBulk3 error running query', err3);
      }

      if (typeof callback === "function") {
        callback(i);
      }

    });


  });
}