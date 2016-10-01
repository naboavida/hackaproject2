var skt = require('./socket');
var olapModule = require('./olapmodule');
var xlsxdropboxmodule = require('./xlsxdropboxmodule');
var mail = require('./email/temail');
var timerManager = require('./timer/timerManager');
var datesutils = require('./datesutils.js');

var intervalValue = 8000;
var reads = new Array();
var projectid = 518;
var lastDateDay = 0;

var triggerHour = 2;
var projectidxlsxdropbox = 163;




var getDateString = function(date, withDelimiters, daymonthyearorder){
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

	if(daymonthyearorder == true){
		return dd + delim + mm + delim + yyyy;
	} else {
		return yyyy + delim + mm + delim + dd;
	}
}



exports.init = function(){
	// make all external data sources modules get the missing data
	olapModule.getMissingData();
}


exports.setInitValues = function(pollingDetails){
	console.log("\n\setInitValues");
	console.log(pollingDetails);
	if( pollingDetails != null && pollingDetails != undefined ){


		if(pollingDetails.hasOwnProperty('intervalvalue') && pollingDetails.intervalvalue != null && pollingDetails.intervalvalue != undefined && pollingDetails.intervalvalue != ''){
			console.log("setting interval value");
			intervalValue = pollingDetails.intervalvalue;
		}

		if(pollingDetails.hasOwnProperty('pid_proj') && pollingDetails.pid_proj != null && pollingDetails.pid_proj != undefined){
			console.log("setting pid_proj");
			projectid = pollingDetails.pid_proj;
		}

		if(pollingDetails.hasOwnProperty('lastdailyprocessdate') && pollingDetails.lastdailyprocessdate != null && pollingDetails.lastdailyprocessdate != undefined){
			console.log("setting lastdailyprocessdate");
			lastSentDate = pollingDetails.lastdailyprocessdate;
		}

		if(pollingDetails.hasOwnProperty('running') && pollingDetails.running != null && pollingDetails.running != undefined){
			console.log("setting running");
			if(pollingDetails.running == true || pollingDetails.running == 't'){
				console.log("its running!!!!!!!!");
				currentIntervalStatus = true;
				schedule();
			}
		}

	}
}


exports.getIntervalValue = function(req, res){
	console.log("POLLING API call: getIntervalValue");

	var obj = {};
	obj.intervalValue = intervalValue;
	obj.currentIntervalStatus = currentIntervalStatus;
	obj.projectid = projectid;
	res.json(obj);
}



exports.setIntervalValue = function(req, res){
	console.log("POLLING API call: setIntervalValue");
	// console.log(req.body.intervalValue);
	intervalValue = req.body.intervalValue;
	projectid = req.body.projectid;
	olapModule.setIntervalValue(projectid, intervalValue);

	var toRet = {};
	toRet.intervalValue = intervalValue;
	toRet.projectid = projectid;
	res.json(toRet);
}



exports.getCurrentReads = function(req, res){
	console.log("POLLING API call: getCurrentReads");
	res.json(reads.slice(-5));
}



var currentIntervalTimer;
var currentIntervalStatus = false;


var ctr = 0;
var schedule = function() {
	currentIntervalTimer = setTimeout(function do_it(){
		console.log("TIMER GOIN ON!!!");

		// var dateNow = new Date();
		// reads.push({"id":ctr, "count":Math.round(Math.random()*10), "date":dateNow});
		// ctr++;

		olapModule.readIntervalQuery(projectid);
		var now = new Date();

		timerManager.getAttributeValue('lastsummarydate', {"pid_proj" : projectid}, function(result){
			var lastDateDay = new Date(result);
			lastDateDay = lastDateDay.getDate();
			if(parseInt(now.getHours()) >= 22 && now.getDate() != lastDateDay){
				timerManager.updateTimerDB('lastsummarydate', getDateString(now, true), {"pid_proj" : projectid});
				mail.generateSummary({"pid": projectid, "date": getDateString(new Date(), true)});
				// mail.generateSummary(null, null, projectid, getDateString(new Date(), true) );
			}
			
		});



		// fetch the pid_proj of the timer with triggertime

		// in the future, we need to a) add an attribute to the table pollingtimers called e.g. timertype,
		//and b) get all  pid_proj of timers with timertype = 'xlsxdropbox' and c) iterate on all pid_proj and run timerManager.getAttributes...

		timerManager.getProjectIds('xlsxdropbox', function(res1){
			// res1 is on the form of: [ { pid_proj: 163 } ]

			for(var i=0; i<res1.length; i++){
				projectidxlsxdropbox = res1[i]["pid_proj"];

				// we should scatter each pid_proj s processing, so that it doesnt get too heavy for the app
				// but I havent done it because theres only one project with xlsx dropbox timer
				console.log("\ngetting attributes for " + projectidxlsxdropbox);
				timerManager.getAttributes(['triggertime', 'lastdate', 'intervalvalue'], {"pid_proj" : projectidxlsxdropbox}, function(result){

					if(result != null){
						var triggertime_aux = result[0];
						var lastdate_aux = result[1];
						var intervalvalue_aux = result[2];

						console.log(triggertime_aux);
						console.log(lastdate_aux);
						console.log(intervalvalue_aux);

						var lastDateDay_aux;
						if(lastdate_aux != null){
							lastDateDay_aux = new Date(lastdate_aux);
							lastDateDay_aux = lastDateDay_aux.getDate();

							console.log("COMPARING " + parseInt(now.getHours()) + " with " + parseInt(intervalvalue_aux) );
						}


						if(parseInt(now.getHours()) >= parseInt(intervalvalue_aux) && (lastdate_aux == null || now.getDate() != lastDateDay_aux) ){
							console.log("WE CAN TRIGGER THE XLXS DROPBOX READ!!");

							// Im sending socket.io events just to warn for any state change, but we can add more skt.broadcastAll inside xlsxdropboxmodule
							// and make the new updates appear on the live external data screen
							skt.broadcastAll('new_xlsxdropbox_read', "WE CAN TRIGGER THE XLXS DROPBOX READ!!");

							// avoid timer repetitions to get in this again
							timerManager.updateTimerDB('lastdate', getDateString(now, true), {"pid_proj" : projectidxlsxdropbox});

							// fetch data from dropbox
							var yesterday = datesutils.getYesterday(now);
							xlsxdropboxmodule.syncDate(projectidxlsxdropbox, getDateString(yesterday, true, true), null);

						} else {
							console.log("hmmm no, not running now!!!!! need to wait for tomorrow");
							skt.broadcastAll('new_xlsxdropbox_read', "hmmm no, not running now!!!!! need to wait for tomorrow");
						}
					} else {
						console.log("there is no timer with triggertime");
						skt.broadcastAll('new_xlsxdropbox_read', "there is no timer with triggertime");
					}

				});
			}
		})

		// obter a hora e last date do xlsxtimer
			// se o last date != now.date e hora > now.hour
				// ler o dia de ontem no xlsxdropboxmodule.syncDate (projectidxlsxdropbox, yesterday)
				// update do xlsxtimer last date



		schedule();
	}, intervalValue);
}

exports.setStartStopInterval = function(req, res){
	console.log("POLLING API call: setStartStopInterval");
	// console.log(req.body.intervalValue);
	var status = req.body.status;



	
	if(status){
		console.log("START timer");
		schedule();
		currentIntervalStatus = true;
	}
	else {
		console.log("STOP timer");
		clearTimeout(currentIntervalTimer);
		currentIntervalStatus = false;
	}

	// NUNOALEX inform all modules that were starting/stopping
	olapModule.startStop(projectid, status);

	res.json(status);
}


exports.addRead = function(read) {
	reads.push(read);
	if(reads.length > 10){
		reads.shift();
		console.log("reads length: " + reads.length);
	}
}


exports.syncDate = function(req, res){
	console.log("pollingapi CALL: syncDate");
	var connector = req.body.connector;
	var date = req.body.date;
	var projectid = req.body.projectid;

	if(connector == 'olap'){
		olapModule.syncDate(projectid, date);
		res.json({"status": 200});
	} else if(connector == 'xlsxdropbox'){
		xlsxdropboxmodule.syncDate(projectid, date, function(obj){
			res.json(obj);
		});
	}

}

exports.getXlsxDropboxProjects = function(req, res){
	// return to angular the error
	if(!(req.body).hasOwnProperty('projectsAttributes')){
		res.json({"error": 'req.body must have property "projectsAttributes".'});
	}
	// this is to support multiple cases, e.g. if we want to support a new timer, we just need to add an if for that timer
	// e.g. if(req.body.projectsAttributes == 'oracle'){ // inside we put the query to get the polling timers for oracle }
	if(req.body.projectsAttributes == 'xlsxdropbox'){
		req.body.projectsAttributes = "select pid_proj, triggertime from pollingtimers where triggertime is not null;";
	}
	timerManager.getProjects(req.body.projectsAttributes, function(results){
		res.json(results);
	});
}

var extractHour = function(timeStr){
	return parseInt(timeStr.substr(0, 2));

}

exports.setTriggerTimeXlsxDropbox = function(req, res){
	console.log("POLLING API call: setTriggerTimeXlsxDropbox");
	
	triggerHour = extractHour(req.body.triggerTime);
	projectidxlsxdropbox = req.body.projectid;
	xlsxdropboxmodule.setTriggerHour(req.body.triggerTime, triggerHour, projectidxlsxdropbox);

	res.json({"status": 200});
}