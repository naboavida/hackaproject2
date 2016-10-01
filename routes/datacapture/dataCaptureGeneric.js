var pg = require('pg');
var config = require('../../config.js');
var conString = config.conString;

var datesutils = require('../datesutils.js');
var dataacess = require('../dataaccess/dataaccess.js');



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



var mergeReadings = function(all_readings, readings){
	return all_readings.concat(readings);
}



var parseReadings = function(readings){
	var toReturn = [];

	if(readings == null){
		return toReturn;
	}

	for(var i=0; i<readings.length; i++){
		if(readings[i].hasOwnProperty('c')){
			toReturn.push(readings[i].c);
		} else {
			toReturn.push(readings[i]);
		}
	}

	return toReturn;
}





var compatibleReadings = function(readA, readB){
	// compare everything but value and date
	for(var prop in readA){
		if(readA.hasOwnProperty(prop)){
			if(prop != 'value' && prop != 'timestamp'){
				if(readA[prop] != readB[prop]){
					return false;
				}
			}
		}
	}
	return true;
}

var findReading = function(readings, reading){
	for(var i=0; i<readings.length; i++){
		if(compatibleReadings(readings[i], reading)){
			return readings[i];
		}
	}
	return null;
}



var replicateObject = function(obj){
	var toReturn = {};
	for(var prop in obj){
		if(obj.hasOwnProperty(prop)){
			toReturn[prop] = obj[prop];
		}
	}
	return toReturn;
}

var calculateReadDiff = function(readA, readB){
	var toReturn = replicateObject(readB);
	toReturn.value = parseFloat(readB.value) - parseFloat(readA.value);
	return toReturn;
}



var calculateReadingsDifferences = function(yesterday_readings, today_readings){
	var toReturn = [];

	for(var i=0; i<today_readings.length; i++){
		var today_read = today_readings[i];
		var yesterday_read = findReading(yesterday_readings, today_read);

		if(yesterday_read != null){
			var diff_read = calculateReadDiff(yesterday_read, today_read);
			toReturn.push(diff_read);
		} else {
			toReturn.push(today_read);
		}
	}
	return toReturn;
}


// this method will override any readings for the given date of the given indicator title, pointid and project id pid
// and is based on calculating the difference between todays values and yesterdays values
exports.captureReadings = function(readings, reading_date, title, pointid, pid){
	console.log("dataCaptureGeneric call: captureReadings");

	// select all readings into all_readings
	var q = "select c from indicators, json_array_elements(readings) AS c where iid = "
			+ " (SELECT iid FROM indicators join points on indicators.pointid_point = pointid "
			+ " WHERE indicators.pid_proj = " + pid
			+ " and pointid = " + pointid
			+ " and title = '" + title + "') "
			+ " and to_date(c->>'timestamp', 'YYYY-MM-DD') <> '" + reading_date + "'";

	runQuery(q, function(results){
		// index 0 because its expected to have only one result (theres only one kpi named title for point with id pointid)
		var all_readings = parseReadings(results);

		// get the readings for the previous day (if this is not day 1)
		// compare prev_readings with readings, to calculate the difference on each reading and pushing them into today_readings
		var firstmonth_date = datesutils.getDateString( datesutils.getFirstMonthDay(new Date(reading_date)), true );
		var yesterday_date = datesutils.getDateString( datesutils.getYesterday(new Date(reading_date)), true );

		// var q1 = "select c from indicators, json_array_elements(readings) AS c where iid = "
		// 	+ " (SELECT iid FROM indicators join points on indicators.pointid_point = pointid "
		// 	+ " WHERE indicators.pid_proj = " + pid
		// 	+ " and pointid = " + pointid
		// 	+ " and title = '" + title + "') "
		// 	+ " and to_date(c->>'timestamp', 'YYYY-MM-DD') = '" + yesterday_date + "'";

		// we need to get the values of this kpi since day 1 until yesterday, separated by all data levels (coordinator, manager)
		// create method on data access that, by given a kpititle and a begin_date, end_date, returns all values separated by all data levels (coordinator, manager)

		dataacess.getDataAllLevels(pid, title, pointid, firstmonth_date, yesterday_date, function(results2){
			var yesterday_readings = parseReadings(results2);
			var today_readings = calculateReadingsDifferences(yesterday_readings, readings);

			// merge all_readings with readings
			var final_readings = mergeReadings(all_readings, today_readings);

			// update the resulting merge
			var q2 = "UPDATE indicators SET readings = '"
				+ JSON.stringify(final_readings)
				+ "'::json "
				+ " WHERE iid = " 
				+ " (SELECT iid FROM indicators join points on indicators.pointid_point = pointid "
				+ " WHERE indicators.pid_proj = " + pid
				+ " and pointid = " + pointid
				+ " and title = '" + title + "') "
				+ " returning iid, title, pointid_point, pid_proj, readings;";

			runQuery(q2, function(results){
				console.log("results");
				console.log(results);
			});

		});

	});


}



exports.captureReadingsWithDifferences = function(readings, reading_date, title, pointid, pid){
	console.log("dataCaptureGeneric call: captureReadings");

	// select all readings into all_readings
	var q = "select c from indicators, json_array_elements(readings) AS c where iid = "
			+ " (SELECT iid FROM indicators join points on indicators.pointid_point = pointid "
			+ " WHERE indicators.pid_proj = " + pid
			+ " and pointid = " + pointid
			+ " and title = '" + title + "') "
			+ " and to_date(c->>'timestamp', 'YYYY-MM-DD') <> '" + reading_date + "'";

	runQuery(q, function(results){
		var all_readings = parseReadings(results);

		// unlike the method captureReadings above, we dont need to calculate the differences...

		var final_readings = mergeReadings(all_readings, readings);

		// update the resulting merge
		var q2 = "UPDATE indicators SET readings = '"
			+ JSON.stringify(final_readings)
			+ "'::json "
			+ " WHERE iid = " 
			+ " (SELECT iid FROM indicators join points on indicators.pointid_point = pointid "
			+ " WHERE indicators.pid_proj = " + pid
			+ " and pointid = " + pointid
			+ " and title = '" + title + "') "
			+ " returning iid, title, pointid_point, pid_proj, readings;";

		runQuery(q2, function(results){
			// console.log("results");
			// console.log(results);
		});
	});
}