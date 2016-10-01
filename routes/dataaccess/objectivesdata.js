var pg = require('pg');
var config = require('../../config.js');
var conString = config.conString;




// generic auxilliary methods

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
        return console.error('objectivesdata.runQuery error running query', err);
      }

      if (typeof callback === "function") {
        callback(result.rows);
      }
      // else should return an error

      client.end();
    });

  });
}





// this may or may not receive a points_array
// if points_array.length == 0, we need to aggregate all points objectives
// else aggregate only the points on points_array
exports.getObjectives = function(pid, title, points_array, callback){
	var q = "select olapstoreinfo from points where pid_proj = " + pid + " and pointid in (select pointid_point from indicators where title = '" +title+"')"

	runQuery(q, function(rows){
		if (typeof callback === "function") {
			callback(rows);
		}
	});
}


exports.extractObjectives = function(title, objectives, date, callback){
	if (typeof callback === "function") {
		callback(1000);
	}
}