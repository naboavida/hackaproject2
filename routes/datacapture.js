var pg = require('pg');
var config = require('../config.js');
var datacaptureapi = require('./datacaptureapi.js');
var conString = config.conString;
var client;

var lastReads = new Array();


exports.init = function(){
	
}


var uniquePush = function(arr, read){
	if(arr.length > 0){
		for(var i=0; i<arr.length; i++){
			var aux = arr[i];
			if(aux["timestamp"] == read["timestamp"] && aux["hour"] == read["hour"]){
				// we found a duplicate reading. return to avoid push
				return;
			}
		}
	}
	arr.push(read);
}

var translateKp = function(readkp){
	switch(readkp){
		case "Basket":
			return 'Basket';
		case "W_sp_csn_rb":
			return 'Net Sales';
		case "Paragony":
			return 'Number of Customers';
		case "PercBills":
			return 'Multiline Bills';
		case "NetMargin":
			return 'Net Margin';
		case "W_zap_czn_r":
			return "Stock Level";
		default:
			return null;
	}

}


var sameReading = function(readA, readB){
	return ( readA['timestamp'] == readB['timestamp'] &&
		readA['hour'] == readB['hour'] &&
		readA['category'] == readB['category'] &&
		readA['product'] == readB['product'] &&
		readA['promoter'] == readB['promoter']);
}

exports.addOrUpdate = function(reads, pid, avoidAlarms){
	if(avoidAlarms == undefined || avoidAlarms == null){
		avoidAlarms = false;
	}
	if(reads != undefined && reads.length > 0 ){
		/*
			2 ways: first we process reads to aggregate by point and then by kpi, so that on second, we add/update the readings by get, merge and update
			(wrong way: or we try to add each element on reads - and this should be less performant than the above because of the number of DB connection opens and queries...)
		*/

		console.log("datacapture addOrUpdate");

		var points = {};

		for(var i=0; i<reads.length; i++){
			var read = reads[i];

			if(!points.hasOwnProperty( parseInt(read.pk).toString() )){
				points[parseInt(read.pk).toString()] = {};
				points[parseInt(read.pk).toString()][translateKp(read.kp)] = new Array();
			} else {
				if(!points[parseInt(read.pk).toString()].hasOwnProperty(translateKp(read.kp))){
					points[parseInt(read.pk).toString()][translateKp(read.kp)] = new Array();
				}
			}
			uniquePush(points[parseInt(read.pk).toString()][translateKp(read.kp)], {"value": read.vl+'', "timestamp": read.dt, "hour": read.hr, "category": "", "product": "", "promoter": ""});
		}

		// console.log(JSON.stringify(points) );


		// now that we have our data indexed by points and then by kpi
		// we get the corresponding kpi's readings and merge them with each array
		// and update the kpi's readings with the result of the merge

		var q1 = "SELECT iid, title, readings, pointid_point, points.attributes->>'PointKey' as pk FROM indicators join points on indicators.pointid_point = pointid WHERE indicators.pid_proj = "+pid;

		// for(var pk in points){
		// 	q1 += " points.attributes->>'PointKey' = '" + parseInt(pk).toString() + "'";
		// }

		// console.log("QUERYYYY:");
		// console.log(q1);

		client = new pg.Client(conString);
		client.connect(function(err) {
			if(err) {
				return console.error('could not connect to postgres', err);
			}

		

			client.query(q1, function(err1, result1){
				if(err1) {
					client.end();
					return console.error('datacapture.addOrUpdate1 error running query', err1);
				}

				// console.log("found "+result1.rows.length+" point indicators");
				var alreadyOutputted = false;
				var issuedIndex = 0;

				for(var i=0; i<result1.rows.length; i++){
					var test = (points.hasOwnProperty(result1.rows[i]['pk']) && points[result1.rows[i]['pk']].hasOwnProperty(result1.rows[i]['title']) );

					// if(result1.rows[i]['title'] == "Stock Level"){
					// 	console.log("test is " + test + " || pk " + result1.rows[i]['pk'] + " || title " + result1.rows[i]['title']);
					// }
					
					var iid = result1.rows[i]['iid'];

					if( test ){
						if(!alreadyOutputted || true){
							alreadyOutputted = true;
							var updOrAddReads = 0;
							var readReads = points[result1.rows[i]['pk']][result1.rows[i]['title']];

							// console.log("try merging for kpi " + result1.rows[i]['title'] + " on pointid " + result1.rows[i]['pointid_point'] + " PointKey: "+ result1.rows[i]['pk']);
							// console.log(readReads);
							// console.log("\nWITH\n");
							// console.log(result1.rows[i]['readings']);
							// console.log("\n\n");

							var newReadings = result1.rows[i]['readings'];
							var readsToTestAlarms = new Array();

							for(var j=0; j<readReads.length; j++){
								var readRead = readReads[j];
								var foundDup = false;

								// try for duplicates, if found, update
								for(var k=0; k<newReadings.length; k++){
									var currRead = newReadings[k];

									if( sameReading( readRead, currRead) ){
										foundDup = true;
										// console.log("foundDup " + foundDup);
										// if value is the same, do nothing
										// if value is different, change value and increment updated or added readings
										if( readRead['value'] != currRead['value'] ){
											// console.log("updated value!!");
											newReadings[k]['value'] = readRead['value'];
											readsToTestAlarms.push(readRead);
											updOrAddReads++;
										} else {
											// console.log(">>> they have the same value... boring job!");
										}
									}
								}

								if(!foundDup){
									// ordered insertion of readRead in newReadings
									// console.log("newRead");
									newReadings.push(readRead);
									readsToTestAlarms.push(readRead);
									updOrAddReads++;
								}


							}
							if(updOrAddReads > 0){
								console.log("updOrAddReads " + updOrAddReads);
								// console.log(newReadings);

								// now update readings on DB for this point indicator

								// var q2 = "UPDATE indicators SET readings = '"
								// 	+ JSON.stringify(newReadings)
								// 	+ "'::json "
								// 	+ " WHERE iid=" + iid + " returning iid, title, pointid_point;";
								// console.log(q2);

								// client.query(q2, function(err2, result2){
								// 	if(err2) {
								// 		// client.end();
								// 		return console.error('datacapture.addOrUpdate2 error running query', err2);
								// 	}

								// 	// console.log("\nUPDATED INDICATOR "+result2.rows[0]['title'] + " || iid " + result2.rows[0]['iid'] + " || pointid " + result2.rows[0]['pointid_point']+" \n\n");
									

								// });

								// NUNOALEX uncomment below after initial reading tests
								var doUpdate = function(iid, pk, newReadings, readsToTestAlarms, i, isLast, avoidAlarms){
									console.log("timming out in " + (i*1000) );
									setTimeout(function(){ 
										console.log("going to update indicator readings " + iid + " for pointkey " + pk);
										datacaptureapi.updateIndicatorReadings(iid, pk, newReadings, readsToTestAlarms, isLast, avoidAlarms);
									}, i*1000);
								}

								// if(i == result1.rows.length-1){
								// 	console.log("force trigger hourly email");
								// }

								doUpdate(iid, result1.rows[i]['pk'], newReadings, readsToTestAlarms, issuedIndex, (i == result1.rows.length-1), avoidAlarms);
								issuedIndex++;
							} else {
								// this has no new readings, but it is the last one - we need to trigger hourly email
								
								// if(i == result1.rows.length-1){
								// 	console.log("force trigger hourly email");
								// }
							}
						}

						
					} else {
						// this has no point with kpi, but it is the last one - we need to trigger hourly email
						// if(i == result1.rows.length-1){
						// 	console.log("force trigger hourly email");
						// }
					}
				}
				
				client.end();

			});

		});
	}
}

exports.dailyProcessing = function(pid, date){

	console.log("DATACAPTURE API: dailyProcessing");
	var endDate = addMissingDateDelimiters(date);

	



	var dbclient = new pg.Client(conString);
	dbclient.connect(function(err) {
		if(err) {
			return console.error('datacapture.dailyProcessing0 could not connect to postgres', err);
		}
	
		var q1 = "select max(cast(config->>'repvalue' as integer)) as maximum from occurrenceconfigs where config->>'dailyBox' = 'true' and config->>'repetitionBox' = 'true' and pid_proj = "+pid;

		dbclient.query(q1, function(err1, result1){
			if(err1) {
				dbclient.end();
				return console.error('datacapture.dailyProcessing1 error running query', err1);
			}

			var maxDaysBack = 0;

			if(result1.rows.length > 0 && result1.rows[0].maximum != null){
				maxDaysBack = parseInt(result1.rows[0].maximum);
				console.log("number of sundays for " + endDate + " and " + maxDaysBack + " IS " + countSundays(endDate, maxDaysBack));
				maxDaysBack += countSundays(endDate, maxDaysBack);

			}

			var previousDate = new Date(endDate);
			previousDate.setDate(previousDate.getDate() - ( maxDaysBack ) );

			console.log("number of day repetitions: " + maxDaysBack + " || Dates are " + getDateString(previousDate) + " " + getDateString(endDate));


			var q2 = "with allreads as "+
				"(select  reads->>'timestamp' as ts, reads->>'hour' as hr, reads->>'value' as vl,  "+
				"iid, title, pointid_point "+
				"from indicators, "+
				"json_array_elements(readings) as reads "+
				"where pid_proj = "+pid+" "+
				"and to_date(reads->>'timestamp', 'YYYY MM DD') >= '"+getDateString(previousDate)+"'::date "+
				"and to_date(reads->>'timestamp', 'YYYY MM DD') <= '"+getDateString(endDate)+"'::date "+
				"order by iid, to_date(reads->>'timestamp', 'YYYY MM DD') DESC, reads->>'hour' DESC) "+
				"select allreads.iid, json_agg((ts, hr, vl) order by (ts, hr) DESC), title, pointid_point, attributes->>'PointKey' as pk  "+
				"from allreads join points on allreads.pointid_point = pointid "+
				"group by allreads.iid,  title, pointid_point, attributes->>'PointKey'";

			dbclient.query(q2, function(err2, result2){
				if(err2) {
					dbclient.end();
					return console.error('datacapture.dailyProcessing2 error running query', err2);
				}

				var issuedIndex = 0;

				for(var i=0; i<result2.rows.length; i++){
					var indic = result2.rows[i];
					// console.log(indic);

					var doProcess = function(pid, iid, pk, pointid_point, title, allReadings, i, isLast){
						console.log("doProcess timming out in " + (i*1000) );
						setTimeout(function(){ 
							console.log("going to test indicator readings " + iid + " for pointkey " + pk);
							datacaptureapi.processDailyOccurrences(pid, iid, pk, pointid_point, title, getDateString(previousDate, true), getDateString(endDate, true), allReadings, isLast);
						}, i*1000);
					}

					doProcess(pid, indic.iid, indic.pk, indic.pointid_point, indic.title, indic.json_agg, issuedIndex, (i == result2.rows.length-1) );
					issuedIndex++;
				}
			});


		});

	});


	/*
	// ir buscar o maior numero de dias X que uma ocorrencia deste projecto tem

	select max(cast(config->>'repvalue' as integer)) from occurrenceconfigs
	where pid_proj = 144
	*/

	
		// ir buscar todos os kpis e suas readings (precisamos das datas desde date-X ate date)
			// para cada kpi, chamar datacaptureapi.processDailyOccurrences(readings)
}




var weekdays = new Array(7);
weekdays[0]=  "Sunday";
weekdays[1] = "Monday";
weekdays[2] = "Tuesday";
weekdays[3] = "Wednesday";
weekdays[4] = "Thursday";
weekdays[5] = "Friday";
weekdays[6] = "Saturday";

var weekdaysInv = {};
weekdaysInv["Sunday"]=  0;
weekdaysInv["Monday"] = 1;
weekdaysInv["Tuesday"] = 2;
weekdaysInv["Wednesday"] = 3;
weekdaysInv["Thursday"] = 4;
weekdaysInv["Friday"] = 5;
weekdaysInv["Saturday"] = 6;


var countSundays = function(enddate, backdays){
	// find the number of days (daysToSunday) from enddate to its previous sunday
	var theDate = new Date(enddate);
    var weekday = weekdays[theDate.getDay()];
	var daysToSunday = weekdaysInv[weekday];

	if(daysToSunday > backdays){
		// the immediately previous sunday is way too behind
		return 0;
	} else {
		// find the number of weeks still left on the remaining backdays (weeks)
		var weeks = Math.floor( (backdays - daysToSunday) / 7 );

		// sum and return 1 (the immediately previous Sunday) with weeks (the remaining Sundays)
		return 1 + weeks;
	}
}


var addMissingDateDelimiters = function(date){
	var toRet = date;

	if(date.length == 8){
		toRet = "";
		toRet += date.substring(0, 4);
	    toRet += '-';
	    toRet += date.substring(4, 6);
	    toRet += '-';
	    toRet += date.substring(6, 8);
	}

	return toRet;
}

var getDateString = function(date, withDelimiters){
	var today = new Date(date);

	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd
	}
	if(mm<10) {
	    mm='0'+mm
	} 

	var delim = "";

	if(withDelimiters){
		delim = "-"
	}

	return yyyy + delim + mm + delim + dd;
}
