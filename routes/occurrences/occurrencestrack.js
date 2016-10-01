var pg = require('pg');
var config = require('../../config.js');
var conString = config.conString;
var temail = require('../email/temail');



exports.processAndSendDailyOccurrences = function(pid, date){

  // get all the daily occurrences of the current day

  // select * from occurrences 
  // where pid_proj = 144
  // and to_date(object->>'date', 'YYYY-MM-DD') = '2015-07-07'::date
  // and object->>'frequency' = 'daily'

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
    return console.error('could not connect to postgres', err);
    }

    var q = "SELECT * FROM occurrences WHERE pid_proj = "+pid+
            " and to_date(object->>'date', 'YYYY-MM-DD') = '"+date+"'::date "+
            " and object->>'frequency' = 'daily' "+
            " order by (object->>'pointkey')::integer, object->>'kpi', object->>'time' DESC ";

    client.query(q, function(err, result) {
      if(err) {
        client.end();
        return console.error('occurrencestrack.processAndSendDailyOccurrences error running query', err);
      }

      var occurrences = new Array();

      for(var i=0; i<result.rows.length; i++){
        var occAux = result.rows[i];
        occurrences.push({"title": occAux.object.title, "kpi": occAux.object.kpi, "pointname": occAux.object.pointname, 
          "value": parseFloat(occAux.object.value).toFixed(2), "time": occAux.object.time, "unit": occAux.object.unit,
          "budget": occAux.object.plannedvalue });
      }

      //IR  - just for testing
      /*occurrences.push({"kpi": "Sales", "title": "below budget", "pointname": "Lublin", "value": 900, "unit":"PLN", "budget": "1000"});
      occurrences.push({"kpi": "Sales", "title": "below budget", "pointname": "Lublin", "value": 700, "unit":"PLN", "budget": "1000"});
	  occurrences.push({"kpi": "Customers", "title": "below budget", "pointname": "Lublin", "value": 900, "unit":"PLN", "budget": "1000"});
      occurrences.push({"kpi": "Customers", "title": "below budget", "pointname": "Lublin", "value": 700, "unit":"PLN", "budget": "1000"});
      occurrences.push({"kpi": "Sales", "title": "below budget", "pointname": "Pulawy", "value": 500, "unit":"PLN", "budget": "1000"});
      occurrences.push({"kpi": "Sales", "title": "below budget", "pointname": "Chelm III", "value": 300, "unit":"PLN", "budget": "1000"});
      occurrences.push({"kpi": "Margin", "title": "below budget", "pointname": "Chelm III", "value": 100, "unit":"PLN", "budget": "1000"});
	*/

      if(occurrences.length > 0){
        console.log("we have occurrences for today, issuing email send!");

        //IR - get deviation from plan
        console.log("getting deviation from plan: for Moja Project only!");
        for(var i=0; i<occurrences.length; i++){
          var obs = occurrences[i].value; 
          var plan = Number(occurrences[i].budget);
          var deviation = ((obs - plan)/plan)*100;

          //IR - add deviaton to occurrences object
          occurrences[i].deviation = deviation.toFixed(2);
        }


        var q2 = "select json_array_elements(mailinglists->'daily') as mail from projects where pid = "+pid;
        client.query(q2, function(err2, result2) {
          if(err2) {
            client.end();
            return console.error('occurrencestrack.processAndSendDailyOccurrences2 error running query', err2);
          }

          var recipients = "";
          for(var i=0; i<result2.rows.length; i++){
            recipients += result2.rows[i].mail;
            if(i != result2.rows.length -1 ){
              recipients += ", "
            }
          }

          temail.sendHtmlTableEmail(pid, occurrences, recipients);

          client.end();
        });
      }

      
    });

  });





  // generate the array


  // issue email/temail.js to send htmltable email based on the array


}





exports.processAndSendOverdueOccurrences = function(pid, date){
	console.log("OCCURRENCESTRACK API call: processAndSendOverdueOccurrences");

	// fetch from db all occurences for this pid, that have duedate = date and duehour not null, ordered
	// by duedate and duehour (, then by regular ordering: store, kpi, occDate)

	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
		return console.error('could not connect to postgres', err);
		}

		var q = "SELECT * "+
			"FROM occurrences WHERE pid_proj = "+pid+" "+
			"and to_date(object->>'duedate', 'YYYY-MM-DD') = '"+date+"'::date "+
			"and object->>'frequency' = 'daily' "+
			"and object->>'duedate' <> '' "+
			"order by (object->>'pointkey')::integer, (object->>'duehour')::integer, object->>'kpi',  "+
			"object->>'time' DESC";

		client.query(q, function(err, result) {
			if(err) {
				client.end();
				return console.error('occurrencestrack.processAndSendDailyOccurrences error running query', err);
			}

				var q2 = "select json_array_elements(mailinglists->'action') as mail from projects where pid = "+pid;
				client.query(q2, function(err2, result2) {
					if(err2) {
						client.end();
						return console.error('occurrencestrack.processAndSendDailyOccurrences2 error running query', err2);
					}

					var occurrences = new Array();

						for(var i=0; i<result.rows.length; i++){
							var occAux = result.rows[i].object;
							occurrences.push({"title": occAux.title, "kpi": occAux.kpi, "pointname": occAux.pointname, 
									"value": parseFloat(occAux.value).toFixed(2), "time": occAux.time, "unit": occAux.unit,
									"budget": occAux.plannedvalue, "duedate": occAux.duedate, "duehour": occAux.duehour,
									"status": occAux.status });
						}


					      /*//IR  - just for testing
					      occurrences.push({"kpi": "Sales", "title": "below budget", "pointname": "Lublin", "value": 900, "unit":"PLN", "status": "Open", "duedate": "2015-07-01", "duehour": 14});
					      occurrences.push({"kpi": "Sales", "title": "below budget", "pointname": "Lublin", "value": 700, "unit":"PLN", "status": "Ongoing", "duedate": "2015-07-01", "duehour": 15});
						  occurrences.push({"kpi": "Customers", "title": "below budget", "pointname": "Lublin", "value": 900, "unit":"PLN", "status": "Ongoing", "duedate": "2015-07-01", "duehour": 16});
					      occurrences.push({"kpi": "Customers", "title": "below budget", "pointname": "Lublin", "value": 700, "unit":"PLN", "status": "Open", "duedate": "2015-07-03", "duehour": 14});
					      occurrences.push({"kpi": "Sales", "title": "below budget", "pointname": "Pulawy", "value": 500, "unit":"PLN", "status": "Open", "duedate": "2015-07-04", "duehour": 14});
					      occurrences.push({"kpi": "Sales", "title": "below budget", "pointname": "Chelm III", "value": 300, "unit":"PLN", "status": "Ongoing", "duedate": "2015-07-02", "duehour": 14});
					      occurrences.push({"kpi": "Margin", "title": "below budget", "pointname": "Chelm III", "value": 100, "unit":"PLN", "status": "Open", "duedate": "2015-07-01", "duehour": 14});
						*/

						var recipients = "";
						for(var i=0; i<result2.rows.length; i++){
							recipients += result2.rows[i].mail;
							if(i != result2.rows.length -1 ){
								recipients += ", "
							}
						}

					if(result.rows.length > 0){
						temail.sendHtmlTableOverdueEmail(pid, occurrences, recipients, "Overdue Occurrences ("+date+") for Moja Farmacja Project",
							"Hi Earthindicators user,\n\nHere are your occurrences that are/were due today:");
					} else {
						temail.sendHtmlTableOverdueEmail(pid, occurrences, recipients, "Overdue Occurrences ("+date+") for Moja Farmacja Project",
							"Hi Earthindicators user,\n\nYou have no overdue occurrences for today.");
					}

					client.end();
				});


		});
	});

}



exports.sendHourlyOccurrence = function(pid, occAux){
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
		return console.error('could not connect to postgres', err);
		}

	    console.log("issuing hourly single email send!");


	    var q2 = "select json_array_elements(mailinglists->'immediate') as mail from projects where pid = "+pid;
	    client.query(q2, function(err2, result2) {
	      if(err2) {
	        client.end();
	        return console.error('occurrencestrack.processAndSendDailyOccurrences2 error running query', err2);
	      }

	      var occurrences = new Array();

	      occurrences.push({"title": occAux.title, "kpi": occAux.kpi, "pointname": occAux.pointname, 
		      "value": parseFloat(occAux.value).toFixed(2), "time": occAux.time, "unit": occAux.unit,
		      "budget": occAux.plannedvalue });

	      var recipients = "";
	      for(var i=0; i<result2.rows.length; i++){
	        recipients += result2.rows[i].mail;
	        if(i != result2.rows.length -1 ){
	          recipients += ", ";
	        }
	      }

	      temail.sendHtmlTableEmail(pid, occurrences, recipients, occAux.time);

	      client.end();
	    });
	});
}

exports.processAndSendHourlyOccurrence = function(pid, date, time){
	var client = new pg.Client(conString);
	client.connect(function(err) {
		if(err) {
		return console.error('could not connect to postgres', err);
		}

		var q = "SELECT * FROM occurrences WHERE pid_proj = "+pid+
		        " and to_date(object->>'date', 'YYYY-MM-DD') = '"+date+"'::date "+
		        " and object->>'frequency' = 'hourly' "+
		        " and object->>'time' = '"+time+"' "+
		        " order by (object->>'pointkey')::integer, object->>'kpi' ";

		client.query(q, function(err, result) {
		  if(err) {
		    client.end();
		    return console.error('occurrencestrack.processAndSendDailyOccurrences error running query', err);
		  }

		  var occurrences = new Array();

		  for(var i=0; i<result.rows.length; i++){
		    var occAux = result.rows[i];
		    occurrences.push({"title": occAux.object.title, "kpi": occAux.object.kpi, "pointname": occAux.object.pointname, 
		      "value": parseFloat(occAux.object.value).toFixed(2), "time": occAux.object.time, "unit": occAux.object.unit,
		      "budget": occAux.object.plannedvalue });
		  }

		  if(occurrences.length > 0){
		    console.log("issuing hourly email send!");


		    var q2 = "select json_array_elements(mailinglists->'immediate') as mail from projects where pid = "+pid;
		    client.query(q2, function(err2, result2) {
		      if(err2) {
		        client.end();
		        return console.error('occurrencestrack.processAndSendDailyOccurrences2 error running query', err2);
		      }

		      var recipients = "";
		      for(var i=0; i<result2.rows.length; i++){
		        recipients += result2.rows[i].mail;
		        if(i != result2.rows.length -1 ){
		          recipients += ", ";
		        }
		      }

		      temail.sendHtmlTableEmail(pid, occurrences, recipients, time);

		      client.end();
		    });
		  }

		  
		});

	});
}
