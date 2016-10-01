var pg = require('pg');
var config = require('../../config.js');
var conString = config.conString;



var runQuery = function(query, callback){
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    client.query(query, function(err, result) {
      if(err) {
        client.end();
        console.log(query);
        return console.error('dataaccess.runQuery error running query', err);
      }

      if (typeof callback === "function") {
        callback(result.rows);
      }
      client.end();
    });

  });
}




exports.updateTimerDB = function(attribute, value, conditions){
	var q = "update pollingtimers set "+attribute+" = '"+value+"' where pid_proj = "+conditions.pid_proj;
	runQuery(q, function(resultrows){
		console.log("timerDb updated");
	})
}


exports.getAttributeValue = function(attribute, conditions, callback){
	var q = "select "+attribute+" from pollingtimers where pid_proj = "+conditions.pid_proj;
	runQuery(q, function(resultrows){
		if (typeof callback === "function") {
	        callback(resultrows[0][attribute]);
	      }
	})
}

exports.getAttributes = function(attributes_arr, conditions, callback){
  var q = "select "+attributes_arr+" from pollingtimers where pid_proj = "+conditions.pid_proj;
  runQuery(q, function(resultrows){
    if (typeof callback === "function") {
      var res_arr = [];
      if(resultrows.length > 0){
        for(var i=0; i<attributes_arr.length; i++){
          res_arr.push(resultrows[0][attributes_arr[i]]);
        }
        callback(res_arr);
      } else {
        callback(null);
      }
    }
  })
}

exports.getProjects = function(projectsAttributes, callback){
  var q = projectsAttributes || "select * from pollingtimers";
  // we used to return every element in pollingtimers
  // but now Ive tried to refactor all situations on this method
  // and support filtering for each type of timer
  runQuery(q, function(resultrows){
    if (typeof callback === "function") {
        callback(resultrows);
      }
  });
}


exports.getProjectIds = function(timertype, callback){
  // today, the pollingtimers table doesnt have the timertype attribute
  // so well just search for the timers with a triggertime set
  var q = "select pid_proj from pollingtimers where triggertime is not null";
  runQuery(q, function(resultrows){
    if (typeof callback === "function") {
        callback(resultrows);
      }
  });
}
