var auth = require('./auth.json');
var fs = require('fs');
var path = require('path');
var Mailgun = require('mailgun-js');
var MailComposer = require("mailcomposer").MailComposer;

var mailgun = new Mailgun({apiKey: auth.api_key, domain: auth.domain});
var mailcomposer = new MailComposer();

var occurrencestrack = require('../occurrences/occurrencestrack.js');
var datacaptureapi = require('../datacaptureapi.js');

var summarytrack = require('../dataaccess/summarytrack.js');
var mailinglists = require('../email/mailinglists');


var sendEmail = function(data){

	mailgun.messages().send(data, function (err, body) {
		if (err) {
	        // res.render('error', { error : err});
	        console.log("got an error: ", err);
	        return;
	    }
		
		console.log(body);
	});
}

var sendMailComposer = function(data){
	mailcomposer.setMessageOption(data);

	mailcomposer.buildMessage(function(mailBuildError, messageSource) {

	    var dataToSend = {
	        to: data.to,
	        message: messageSource
	    };

	    mailgun.messages().sendMime(dataToSend, function (sendError, body) {
	        if (sendError) {
	            console.log(sendError);
	            return;
	        } 
	    });
	});
}

exports.sendDummyEmail = function(req, res){
	console.log("MAIL API call: sendDummyEmail");

	var data = {
	  from: 'Earthindicators <no-reply@earthindicators.com>',
	  to: 'isamdr@gmail.com, isabel.rosa@earthindicators.com',
	  subject: 'Hello',
	  text: 'Testing some Mailgun awesomness!'
	};

    var filename = 'logo.png';
    var filepath = path.join(__dirname, '../../public/images/'+filename);
    var file = fs.readFileSync(filepath);

    data.attachment = new Mailgun.Attachment({data: file, filename: filename})
	
	sendEmail(data);

	res.json({});
}


exports.sendHtmlDummyEmail = function(req, res){
	console.log("MAIL API call: sendHtmlDummyEmail");

	var data = {
	  from: 'Earthindicators App <no-reply@earthindicators.com>',
	  to: 'isamdr@gmail.com',
	  subject: 'Hello',
	  text: 'Testing some Mailgun awesomness!',
	  html: '<html><head></head><body><h5>Hi there user!</h5></body></html>'
	};
	
	// sendEmail(data);
	sendTableEmail();

	res.json({});
}


var sendTableEmail = function(dataObj, occArr){


	var occurrences = occArr;
	if(occArr == null || occArr == undefined){
		occurrences = new Array();
		occurrences.push({"indicator": "Basket", "occurrence": "below budget", "store": "Lublin", "value": "34.6 PLN"});
		occurrences.push({"indicator": "Net Margin", "occurrence": "below budget", "store": "Chelm III", "value": "11.3 %"});
	}


	var htmlTable;

	htmlTable = '<table cellspacing="0" cellpadding="0" style"=font-family: Trebuchet MS, Tahoma, sans-serif, Arial;color: #666;">';
	htmlTable += '<thead style="font-size: 14px;">';
	
	htmlTable += '<tr><th colspan="6" style="font-size:18px!important;font-weight:bold;margin-bottom: 10px; padding: 10px; text-align: left; background-color:#F0F0F0"><img src="http://app.earthindicators.com/img/mail/report.png" style="vertical-align:middle; padding-right: 5px"/>  Occurrences Report <h5>Total number of occurrences: ' + occurrences.length + '</h5></th></tr>';	
	htmlTable += '<td style="text-align: left; padding: 10px 10px; font-weight: bold"> Store </td>';
	htmlTable += '<td style="text-align: left; padding: 10px 10px; font-weight: bold"> Indicator </td>';
	htmlTable += '<td style="text-align: left; padding: 10px 10px; font-weight: bold"> Occurrence </td>';
	htmlTable += '<td style="text-align: left; padding: 10px 10px; font-weight: bold"> Observed value </td>';
	htmlTable += '<td style="text-align: left; padding: 10px 10px; font-weight: bold"> Planned Value </td>';
	htmlTable += '<td style="text-align: left; padding: 10px 10px; font-weight: bold"> Severity </td>';

	htmlTable  += '</thead>';

	htmlTable  += '<tbody style="font-size: 14px;">';

	//IR - point names in Occurrences
	var names = [];
	for(var i = 0; i < occurrences.length; i++) {
	    names.push(occurrences[i].pointname);
	}

	//IR - count number of occurrences per point name
	var counts = {};
	for (var i = 0; i < names.length; i++) {
	   	counts[names[i]] = 1 + (counts[names[i]] || 0);
	}

	Object.size = function(obj) {
    var size = 0, key;
	for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

	// Get the size of an object
	var size = Object.size(counts);

	//IR - add a different background color to odd and evens
	var colors = {};
	for (var i = 0; i < size; i++) {
	   	if(i % 2 == 0)
			colors[Object.keys(counts)[i]] = "#EEF5FC;"
		else
			colors[Object.keys(counts)[i]] = "#FFFFFF;"
	}

	//IR - loop over occurrences to build Occurrences Table
	var names = [];
	for(var i=0; i<occurrences.length; i++){
		var occ = occurrences[i];
		var auxStr = "<tr>";
		var color = colors[occ.pointname];

		//IR - merge 1st column's rows that have the same point name 
		if(names.indexOf(occ.pointname) < 0){
			var row = counts[occ.pointname];
			auxStr += "<td rowspan= "+ row +" style= 'text-align: left; padding-left: 10px; padding: 10px 0px; font-weight: bold; background:" + color + "'> "+ occ.pointname +" </td>";
		} 
		names.push(occ.pointname);

		//IR - add kpi name, occurrence, value, plan, and deviation
		auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'>"+occ.kpi+"</td>";
		auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'>"+occ.title+"</td>";
		auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'>"+occ.value+" "+occ.unit+"</td>";
		auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'>"+occ.budget+" "+occ.unit+"</td>";
		
			//IR - for deviation only, change the color of text according to the magnitude 
			switch(Number(occ.deviation) != undefined) { 
				case occ.deviation <= -75:
					auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'><FONT COLOR='#B40404'><strong>"+occ.deviation+"%"+"</strong></FONT></td>";
					break;
				case occ.deviation <= -50 && occ.deviation > -75:
					auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'><FONT COLOR='#FF0000'><strong>"+occ.deviation+"%"+"</strong></FONT></td>";
					break;
				case occ.deviation <= -25 && occ.deviation > -50:
					auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'><FONT COLOR='#FF9E00'><strong>"+occ.deviation+"%"+"</strong></FONT></td>";
					break;
				case occ.deviation < 0 && occ.deviation > -25:
					auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'><FONT COLOR='#F7D708'><strong>"+occ.deviation+"%"+"</strong></FONT></td>";
					break;
				case occ.deviation >= 0:
					auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'><FONT COLOR='#000000'><strong>"+occ.deviation+"%"+"</strong></FONT></td>";
					break;
			}
		
		//auxStr += "<td>"+occ.time+"</td>";
		auxStr += "</tr>";
		//auxStr += '<tr><td colspan="5" style="line-height: 5px; background: #FFFFFF;"></td></tr>';
		htmlTable += auxStr;
	}

	// IR - EI logo and message
	htmlTable += '<tr><td style="padding-right:10px; padding-top:30px; text-align: right;font-size: 10px" colspan="6">Thank you for using <img src="http://app.earthindicators.com/img/logo-24.png" style="vertical-align:middle"/></td></tr>';

	htmlTable += '</tbody>';
	htmlTable += '</table>';

	var filename = 'logo.png';
    var filepath = path.join(__dirname, '../../public/img/'+filename);

    //var projectpath = "app.earthindicators.com/occurrences/" + pid;

    var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd
	} 

	if(mm<10) {
	    mm='0'+mm
	} 

	today = dd+'/'+mm+'/'+yyyy;

	var htmlPayload = htmlTable;
	//<div style='float:left;'><img src = " + filepath + "></img></div>


	var data = dataObj;

	if(dataObj == null || dataObj == undefined){
		data = {
			from: 'Earthindicators App <no-reply@earthindicators.com>',
			to: 'isamdr@gmail.com',
			subject: 'Daily Occurrences (' + today + ') for Moja Farmacja Project', // + pid,
			text: '',
			html: htmlPayload
		};
	} else {
		data.html = htmlPayload;
	}


	sendEmail(data);
}


exports.sendHtmlTableEmail = function(pid, occArr, recipients, time){
	console.log("MAIL API call: sendHtmlTableEmail");

	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd
	} 

	if(mm<10) {
	    mm='0'+mm
	} 

	today = dd+'/'+mm+'/'+yyyy;

	var tempTo = recipients;
	if(tempTo == ""){
		tempTo = 'isamdr@gmail.com';
	}

	var subject = 'Daily Occurrences (' + today + ') in Moja Farmacja Project';
	if(time != null && time != undefined){
		subject = 'Hourly Summary (' + today + ' ' +time+') for ' + occArr[0].kpi + ' on ' + occArr[0].pointname + ' -- Moja Farmacja Project';
	}

	var data = {
	  from: 'Earthindicators App <no-reply@earthindicators.com>',
	  // to: 'naboavida@gmail.com, isamdr@gmail.com, jpas984@gmail.com',
	  to: tempTo,
	  subject: subject, // + pid,
	  text: 'Hi Earthindicators user,\n\nthis is the summary of today\'s occurrences:'
	};
	
	sendTableEmail(data, occArr);
}




var getStatusColor = function(status){
	var color = '555555';
	switch(status){
		case "Open":
			color = 'd24d33';
			break;
		case "Assigned":
			color = 'f0ad4e';
			break;
		case "Ongoing":
			color = '5bc0de';
			break;
		case "Closed":
			color = '82b964';
			break;
	}

	return color;
	// var backgroundColor = 'background-color: #'+color+';'
	// return 'line-height: 1;color: #fff;text-align: center;white-space: nowrap;vertical-align: baseline;border-radius: .25em;'+backgroundColor;
}


var sendTableOverdueEmail = function(dataObj, occArr){


	var occurrences = occArr;
	if(occArr == null || occArr == undefined){
		occurrences = new Array();
		occurrences.push({"indicator": "Basket", "occurrence": "below budget", "store": "Lublin", "value": "34.6 PLN"});
		occurrences.push({"indicator": "Net Margin", "occurrence": "below budget", "store": "Chelm III", "value": "11.3 %"});
	}

	var htmlTable;

	htmlTable = '<table cellspacing="0" cellpadding="0" style"=font-family: Trebuchet MS, Tahoma, sans-serif, Arial;color: #666;">';
	htmlTable += '<thead style="font-size: 14px;">';
	
	htmlTable += '<tr><th colspan="6" style="font-size:18px!important;font-weight:bold;margin-bottom: 10px; padding: 10px; text-align: left; background-color:#F0F0F0"><img src="http://app.earthindicators.com/img/mail/report.png" style="vertical-align:middle; padding-right: 5px"/>  Overdue Occurrences Report <h5>Total number of overdue occurrences: ' + occurrences.length + '</h5></th></tr>';	
	htmlTable += '<td style="text-align: left; padding: 10px 10px; font-weight: bold"> Store </td>';
	htmlTable += '<td style="text-align: left; padding: 10px 10px; font-weight: bold"> Indicator </td>';
	htmlTable += '<td style="text-align: left; padding: 10px 10px; font-weight: bold"> Occurrence </td>';
	htmlTable += '<td style="text-align: left; padding: 10px 10px; font-weight: bold"> Observed value </td>';
	htmlTable += '<td style="text-align: left; padding: 10px 10px; font-weight: bold"> Status </td>';
	htmlTable += '<td style="text-align: left; padding: 10px 10px; font-weight: bold"> Due at </td>';

	htmlTable  += '</thead>';

	htmlTable  += '<tbody style="font-size: 14px;">';

	//IR - point names in Occurrences
	var names = [];
	for(var i = 0; i < occurrences.length; i++) {
	    names.push(occurrences[i].pointname);
	}

	//IR - count number of occurrences per point name
	var counts = {};
	for (var i = 0; i < names.length; i++) {
	   	counts[names[i]] = 1 + (counts[names[i]] || 0);
	}

	Object.size = function(obj) {
    var size = 0, key;
	for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

	// Get the size of an object
	var size = Object.size(counts);

	//IR - add a different background color to odd and evens
	var colors = {};
	for (var i = 0; i < size; i++) {
	   	if(i % 2 == 0)
			colors[Object.keys(counts)[i]] = "#EEF5FC;"
		else
			colors[Object.keys(counts)[i]] = "#FFFFFF;"
	}

	//IR - loop over occurrences to build Occurrences Table
	var names = [];
	for(var i=0; i<occurrences.length; i++){
		var occ = occurrences[i];
		var auxStr = "<tr>";
		var color = colors[occ.pointname];

		//IR - merge 1st column's rows that have the same point name 
		if(names.indexOf(occ.pointname) < 0){
			var row = counts[occ.pointname];
			auxStr += "<td rowspan= "+ row +" style= 'text-align: left; padding-left: 10px; padding: 10px 0px; font-weight: bold; background:" + color + "'> "+ occ.pointname +" </td>";
		} 
		names.push(occ.pointname);

		//IR - add kpi name, occurrence, value, plan, and deviation
		auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'>"+occ.kpi+"</td>";
		auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'>"+occ.title+"</td>";
		auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'>"+occ.value+" "+occ.unit+"</td>";
		auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'><FONT COLOR='#"+getStatusColor(occ.status)+"'>"+occ.status+"</FONT></td>";
		auxStr += "<td style='text-align: center; padding: 10px 10px; background:" + color + "'>"+occ.duedate+" "+occ.duehour+":00</td>";
		
		//auxStr += "<td>"+occ.time+"</td>";
		auxStr += "</tr>";
		//auxStr += '<tr><td colspan="5" style="line-height: 5px; background: #FFFFFF;"></td></tr>';
		htmlTable += auxStr;
	}

	// IR - EI logo and message
	htmlTable += '<tr><td style="padding-right:10px; padding-top:30px; text-align: right;font-size: 10px" colspan="6">Thank you for using <img src="http://app.earthindicators.com/img/logo-24.png" style="vertical-align:middle"/></td></tr>';

	htmlTable += '</tbody>';
	htmlTable += '</table>';

	var filename = 'logo.png';
    var filepath = path.join(__dirname, '../../public/img/'+filename);

    //var projectpath = "app.earthindicators.com/occurrences/" + pid;

    var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd
	} 

	if(mm<10) {
	    mm='0'+mm
	} 

	today = dd+'/'+mm+'/'+yyyy;

	var htmlPayload = htmlTable;
	//<div style='float:left;'><img src = " + filepath + "></img></div>


	var data = dataObj;

	if(dataObj == null || dataObj == undefined){
		data = {
			from: 'Earthindicators App <no-reply@earthindicators.com>',
			to: 'isamdr@gmail.com',
			subject: 'Daily Overdue Occurrences (' + today + ') for Moja Farmacja Project', // + pid,
			text: 'Hi Earthindicators user, this is the summary of today\'s overdue occurrences:',
			html: htmlPayload
		};
	} else {
		data.html = htmlPayload;
	}


	sendEmail(data);
}



exports.sendHtmlTableOverdueEmail = function(pid, occArr, recipients, subject, text){
	console.log("MAIL API call: sendHtmlTableOverdueEmail");

	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
	    dd='0'+dd
	} 

	if(mm<10) {
	    mm='0'+mm
	} 

	today = dd+'/'+mm+'/'+yyyy;

	var tempTo = recipients;
	if(tempTo == "" || tempTo == null || tempTo == undefined){
		tempTo = 'isamdr@gmail.com';
	}

	var data = {
	  from: 'Earthindicators App <no-reply@earthindicators.com>',
	  to: tempTo,
	  subject: subject,
	  text: text
	};

	sendTableOverdueEmail(data, occArr);
}



exports.forceSendDailyMail = function(req, res){
	console.log("MAIL API call: forceSendDailyMail");
	var postedObj = req.body;
	occurrencestrack.processAndSendDailyOccurrences(postedObj.forcedpid, postedObj.forcedailymaildate);
	res.json({});
}


exports.forceOverdueOccurrences = function(req, res){
	console.log("MAIL API call: forceSendDailyMail");
	var postedObj = req.body;
	occurrencestrack.processAndSendOverdueOccurrences(postedObj.forcedpid, postedObj.forcedailymaildate);
	res.json({});
}


exports.generateSummary = function(req, res){
	if(req.hasOwnProperty('params') && res != null && res != undefined){
		generateSummaryInternal(req, res, null, null);
	} else {
		generateSummaryInternal(null, null, req.pid, req.date);
	}
}


var generateSummaryInternal = function(req, res, pid_proj, date){
	console.log("MAIL API call: generateSummary");
	var pid = pid_proj;
	if(pid == null || pid == undefined){
		pid = req.params.pid;
	}
	var postedObj = null;
	if(date != null && date != undefined){
		postedObj = { "forcedailymaildate" : date};
	} else {
		postedObj = req.body;
	}

	mailinglists.getMailingList(pid, 'kpidaily', function(recipientsResult, listType, pid){
		
		var recipients = "";
		for(var i=0; i<recipientsResult.length; i++){
			recipients += recipientsResult[i].mail;
			if(i != recipientsResult.length -1 ){
				recipients += ", "
			}
		}


		summarytrack.generateSummary(null, null, pid, postedObj.forcedailymaildate, function(results){
			// TABLE 1 is results.matrixTimePeriods
			// TABLE 2 is results.matrixPoints

			// now call Filipe's function to build and send the email when given the two tables 1 and 2 by arguments
			summaryEmail(results.matrixTimePeriods, results.matrixPoints, results.matrixPointsVar, recipients, results.the_dates, results.the_previous_dates);

			if(res != null && res != undefined){
				res.json(results);
			}
		})

	});

}






function addSpace(num){

	var x = num.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';

    var rgx = /(\d+)(\d{3})/;

    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }

    return x1 + x2;
}

function formatNumber(num)
{
	if (parseFloat(num) % 1 !=  0 &&  isNaN(num) == false)
	{	
		var number = parseFloat(num).toFixed(0) + '';
		return addSpace(number);   
	}

	else if (isNaN(num) == false) {

		var number = parseFloat(num) + '';
	   	return addSpace(number);
	}

	else return num;
}

var formatVariation = function(perc){
	var to_return = parseFloat(perc);
	if(isFinite(to_return) && !isNaN(perc)){
		to_return = to_return.toFixed(0);
		var color = 'black';
		var signal = '';
		if(perc > 0){
			color = 'green';
			signal = '+';
		} else if(perc < 0) {
			color = 'red';
		} else {
			color = 'darkgrey';
		}
		return '<span style="color:'+color+'">'+signal+''+to_return+'%</span>';
	} else {
		return '';
	}
}



var summaryEmail = function(m1, m2, m3, recipients, dates, previous_dates){
	console.log("MAIL API call: summaryEmail");

	var today = new Date();
	today = today.getDate() + '/' + (today.getMonth()+1) + '/' + today.getFullYear();

	var table;
	var footnotes = new Array();
	var notes = summarytrack.getNotes();

	table = '<table cellspacing="0" cellpadding="0" style"=font-family: Trebuchet MS, Tahoma, sans-serif, Arial;color: #666;">';
	table += '<thead style="font-size: 14px;">';
	
	table += '<tr><th colspan="' + (m1.length + 1) + ' " style="font-size:18px!important;font-weight:bold;margin-bottom: 10px; padding: 10px; text-align: left; background-color:#F0F0F0"><img src="http://app.earthindicators.com/img/mail/report.png" style="vertical-align:middle; padding-right: 5px"/>  Daily Report</th></tr>';

	for(var i = 0; i < m1.length; i++)
	{
		if(i%2 != 0 && i > 1 )
			table += '<tr style="text-align: center; background: #EEF5FC";>';

		else 
			table += '<tr style="text-align: center;">';

		for(var z = 0; z < m1[i].length; z++)
		{	
			if(i == 0 && z == 0) 
				table += '<th></th>';

			else if (i == 0 && z > 0)
				table += '<th style="padding-top:20px"><img src="' + m1[i][z] + '"/></th>';

			else if (i == 1){
				table += '<th style="padding: 20px; padding-top: 10px; border-bottom: 1px solid #e0e0e0;">' + m1[i][z] + '</th>';
			}

			else if(z == 0 && i != 0){
				table += '<td style="text-align: left; font-weight: bold; padding-left:10px">' + m1[i][z] + '<sup>'+(i-1)+'</sup><br>' + 
							summarytrack.getTimePeriod(m1[i][z], dates, "<span style='text-align: left;font-size: 10px; font-weight: normal;'>", "</span>", "to") + '</td>';
				if(notes.hasOwnProperty(m1[i][z])){
					footnotes.push(notes[m1[i][z]]);
				}
			}

			else 
			{
				if(m1[i][z].constructor === Array){
					table += '<td style="padding: 15px 0px;">' + formatNumber(m1[i][z][0]) + '<br>' + '<span style="text-align: left;font-size: 12px; font-weight: normal;">' + formatVariation(m1[i][z][1]) + '</span></td>';
				} else {
					table += '<td style="padding: 15px 0px;">' + formatNumber(m1[i][z]) + '</td>';
				}

			}
				
		}

		table += '</tr>';
	}

	table += '</thead>';

	table += '<tbody style="font-size: 14px;">';
	table += '<tr><td style="padding-left:10px; padding-top:35px; text-align: left; font-weight: bold" colspan="' + (m1.length + 1) + '">Stores</td></tr>';
	table += '<tr><td style="padding-left:10px; padding-top:5px; padding-bottom:5px; text-align: left;border-bottom: 1px solid #e0e0e0;font-size: 10px" colspan="' + (m1.length + 1) + '">DAILY | ' + dates.today +' (vs. ' + previous_dates.prev_week_day + ')</td></tr>';

	for(var i = 1; i < m2.length; i++)
	{
		if(i%2 == 0 && i != 0)
			table += '<tr style="text-align: center; background: #EEF5FC">';

		else 
			table += '<tr style="text-align: center">';

		for(var z = 0; z < m2[i].length; z++)
		{
			if(z == 0)
				table += '<td style="text-align: left; padding-left:10px; font-weight: bold">' + m2[i][z] + '</td>';

			else 
				table += '<td style="padding: 10px 0px;">' + formatNumber(m2[i][z]) + '<br>' + '<span style="text-align: left;font-size: 12px; font-weight: normal;">' + formatVariation(m3[i][z]) + '</span></td>';
		}

		table += '</tr>';
	}

	

	table += '<tr><td style="padding-right:10px; padding-top:30px; text-align: right;font-size: 10px" colspan="' + (m1.length + 1) + '">Thank you for using <img src="http://app.earthindicators.com/img/logo-24.png" style="vertical-align:middle"/></td></tr>';

	table += '</tbody>';
	table += '</table>';

	if(footnotes.length > 0){
		table += '<div style="margin-top: 50px;">';
		table += '<hr style="border: 0;height: 0;border-top: 1px solid rgba(0, 0, 0, 0.2);border-bottom: 1px solid rgba(255, 255, 255, 0.3);">';
		for(var i=0; i<footnotes.length; i++){
			table += "<p style='font-size: 11px;'>"+(i+1)+" - "+footnotes[i]+"</p>";
		}
		table += '</div>';
	}

	if(recipients == '' || recipients == null || recipients == undefined){
		recipients = 'isamdr@gmail.com';
	}

	var data = {
	  from: 'Earthindicators <no-reply@earthindicators.com>',
	  to: recipients,
	  subject: 'Daily KPI Summary',
	  text: table,
	  html: table
	};

	// console.log(table);
	sendEmail(data);
}

