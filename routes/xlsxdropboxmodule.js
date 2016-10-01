var skt = require('./socket');
var pg = require('pg');
var config = require('../config.js');
var metadataaccess = require('./metadataaccess.js');
var conString = config.conString;

var dropbox = require('./datasources/dropbox.js');
var dataCaptureGeneric = require('./datacapture/dataCaptureGeneric.js');

var datesutils = require('./datesutils.js');




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










var extractDigits = function(str){
    var digits = str.replace(/\D/g, ""),
        letters = str.replace(/[^a-z]/gi, ""); 
      return digits;
  }

  var extractLetters = function(str){
    var digits = str.replace(/\D/g, ""),
        letters = str.replace(/[^a-z]/gi, ""); 
      return letters;
  }

  // eg U3 -> row: 2 (= 3-1) 
  var extractRow = function(cell){
    // separate letters from digits
    var row = parseInt(extractDigits(cell));
    return row - 1;
  }


  var convertStringToAscii = function(str){
    // str may have more than 1 digit... how to convert column AA to number?

    var aux = str.toUpperCase();

    var sum = 0;

    for(var i=0; i<aux.length; i++){
      sum *= 26;
      sum += (aux.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }

    return sum;

    /*
      converter tudo para UPPERCASE
      sum = 0;
      para cada letra
        sum *= 26
        sum += letra[i] - 'A' + 1
      return sum;
    */
  }


  // eg U3 -> col: 20 (U-A = 85 - 65 = 20 in ascii codes)
  var extractCol = function(cell){
    var col = extractLetters(cell);
    col = convertStringToAscii(col);
    return col - 1;
  }



var TIMEOUT_INTERVAL = 7500;


var finishWithTimeout = function(callback, obj){
  setTimeout(function(){
    callback(obj);
  }, TIMEOUT_INTERVAL);
}






var parseXlsxToObject = function(xlsxfile){
  var xlsx_file = {};
  if(xlsxfile == undefined || xlsxfile == null){
    return xlsx_file;
  }
  for(var i=0; i<xlsxfile.length; i++){
    var sheet = xlsxfile[i];
    if(!xlsx_file.hasOwnProperty(sheet.name)){
      xlsx_file[sheet.name] = sheet;
    } else {
      // TODO: on sheet.name, we need to append a variable suffix like copy x
      // otherwise it will not add the duplicate name sheet
    }
  }
  return xlsx_file;
}



var processDifferencesXlsxDropbox = function(prev_date_xlsxfile, xlsxfile, store_mapping, i, date, pid, callback){
  var reading_date = datesutils.enforceDateStringYMD(date);

  var prev_date_xlsxfile = parseXlsxToObject(prev_date_xlsxfile);
  var xlsx_file = parseXlsxToObject(xlsxfile);

  // console.log("\n\nProcessing for store ");
  // console.log(JSON.stringify(store_mapping.attributes));

  var kpiMatching = store_mapping.xlsxmapping.kpiMatching;

  for(var title in kpiMatching){
    if(kpiMatching.hasOwnProperty(title)){
      if(kpiMatching.hasOwnProperty(title)){

        // console.log("\nkpi title: " + title);

        var data_levels = store_mapping.xlsxmapping.datalevels;
        var general_data = store_mapping.xlsxmapping.generaldata;

        var readings = [];

        for(var j=0; j<data_levels.length; j++){
          // placing the difference immediately on the value
          // console.log("getting value ");
          var value = parseFloat(getKpiCellValue(xlsx_file, kpiMatching, title, data_levels[j].name));

          // console.log("getting prev_value ");
          var prev_value = parseFloat(getKpiCellValue(prev_date_xlsxfile, kpiMatching, title, data_levels[j].name))


          kpiMatching[title][data_levels[j].name].value = value - prev_value;

          var reading = {"value": kpiMatching[title][data_levels[j].name].value, 
            "timestamp": reading_date, 
            "coordinator": getCellValue(xlsx_file, data_levels[0].sheet, data_levels[0].cell), 
            "manager": getCellValue(xlsx_file, data_levels[j].sheet, data_levels[j].cell)};

          // console.log(JSON.stringify(reading));

          readings.push(reading);
        }


        // assuming that were only fetching the readings for a single date
        // were providing the readings with calculated differences
        dataCaptureGeneric.captureReadingsWithDifferences(readings, reading_date, title, store_mapping.pointid, pid);



      } else {
        // TODO: ALERT! no file on dropbox matches the configured filename template!
        // warn the customer
      }
    }
  }

  if(typeof callback === "function"){
    callback(store_mapping.pointid, date);
  }
}



var processXlsxDropbox = function(pid, folder, client_folder_nodate, filename, store_mapping, i, date, callback){

  // new algorithm based directly on the files on xlsx dropbox, also trying not to use setTimeout since its a bad hack
  // get the file for date
    // get the file of the previous date (loop backwards starting from yesterday, until a file is found or until the first day of the month is exceeded negatively)
      // iterate on each store mapping
        // iterate on each data level
          // get the mapped cells from both todays file and previous date file
          // calc the difference
          // create the reading

  console.log("first level time out in " + (i*TIMEOUT_INTERVAL)  + " for " + i);
  // too many setTimeouts is really bad practice, but its a quick fix to alleviate the server, so it can respond to page requests while it processes the xlsx dropbox fetch.
  setTimeout(function(){
    dropbox.fetchXlsxFile({"body": {"folder": folder, "client_folder_nodate": client_folder_nodate, "file_date": date, "filename": filename}}, null, function(xlsxfile){    
      // can return null, meaning that there is no file on a previous date regarding date
      var prev_date = findPrevDateWithFile(folder, client_folder_nodate, filename, date, function(prev_date){
        if(prev_date.date == null){
          // comparing with nothing... differences are none.
          console.log("COMPARING DATE " + date + " WITH none.........");
        } else {
          console.log("COMPARING DATE " + date + " WITH " + prev_date);
        }

        console.log("second level time out in " + (i*TIMEOUT_INTERVAL)  + " for " + i);
        // were doing a setTimeout because of the database limitations (20 concurrent connections)
        setTimeout(function(){
          processDifferencesXlsxDropbox(prev_date.prev_date_xlsxfile, xlsxfile, store_mapping, i, date, pid, callback);
        }, i*TIMEOUT_INTERVAL);
      });
    });

  }, i*TIMEOUT_INTERVAL);

}



var findFilePrevDate = function(folder, client_folder_nodate, filename, prev_date, curr_day, callback){
  if(curr_day > 1){
    // console.log("\n\n\n\nchanging prev_date from " + prev_date + " to " + datesutils.getDateString(datesutils.getYesterdayFromString(prev_date), true, true));
    prev_date = datesutils.getDateString(datesutils.getYesterdayFromString(prev_date), true, true);
    curr_day = datesutils.getDayFromString( prev_date );

    // filename needs to be the same in every day of the month...
    // otherwise, we need a function that, given a date and a regex, will return the filename
    dropbox.fetchXlsxFile({"body": {"folder": folder, "client_folder_nodate": client_folder_nodate, "file_date": prev_date, "filename": filename}}, null, function(prev_date_xlsxfile){

      if(prev_date_xlsxfile.hasOwnProperty('error')){
        console.log("\n\nnext recursion step");
        console.log(prev_date);
        findFilePrevDate(folder, client_folder_nodate, filename, prev_date, curr_day, callback);
      } else {
        console.log("\n\nFOUND!!! stopping recursive function");
        console.log(prev_date);
        callback(prev_date, prev_date_xlsxfile);
      }

    });

  } else {
    // stop the recursive execution and return null
    // meaning that no previous date with file was found
    console.log("\n\nstopping recursive function");
    callback(null, []);
  }
}


var findPrevDateWithFile = function(folder, client_folder_nodate, filename, date, callback){
  var found = false;
  var prev_date = date;
  var curr_day = datesutils.getDayFromString( prev_date );



  if(curr_day == 1){
    console.log("havent found a previous date with a file on this month!!");
    // return {"date": null, "prev_date_xlsxfile": null};
    callback({"date": null, "prev_date_xlsxfile": null})
  }


  findFilePrevDate(folder, client_folder_nodate, filename, prev_date, curr_day, function(found_prev_date, prev_date_xlsxfile){
    // return {"date": date, "prev_date_xlsxfile": prev_date_xlsxfile};
    callback({"date": date, "prev_date_xlsxfile": prev_date_xlsxfile})
  });



  // while(!found && curr_day > 1){
  //   prev_date = datesutils.getDateString(datesutils.getYesterdayFromString(prev_date), true, true);
  //   curr_day = datesutils.getDayFromString( prev_date );
  //   console.log(" prev_date"+ prev_date);
  //   console.log(found + " " + curr_day);
  // }

  // if(curr_day == 1){
  //   console.log("havent found a previous date with a file on this month!!");
  // }

  // return null;
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



var calculateDateFrom1900Epoch = function(val){
  // var d = new Date(1899, 11, val);
  var d = new Date(1899, 12, val);
  d.setMinutes(d.getTimezoneOffset() - 1); // sometimes, it has offset 0 and its still returns the next day...
  return d;
}

var getDateValue = function(val){
  var d = calculateDateFrom1900Epoch(val);
  return getDateString(d, true);
}


var getCellValue = function(xlsx_file, sheet, cell){
  return xlsx_file[sheet].data[extractRow(cell)][extractCol(cell)];
}


var getKpiCellValue = function(xlsx_file, kpiMatching, title, data_levels_name){
  var sheet_name = kpiMatching[title][data_levels_name].sheet;
  var row = extractRow(kpiMatching[title][data_levels_name].cell);
  var col = extractCol(kpiMatching[title][data_levels_name].cell);

  if(xlsx_file.hasOwnProperty(sheet_name) && xlsx_file[sheet_name].hasOwnProperty('data')){
    return xlsx_file[sheet_name].data[row][col];
  } else {
    // returning 0 so that when this is invoked on difference calculation, and prev xlsx is inexistent, it doesnt ruin the difference calculation
    return 0;
  }

}












var testFnameToMatch = function(fname, regex_name){
  // var queryPattern = regex_name.replace(/\*/g, '\\w');
  var queryPattern = regex_name.replace(/\./g, '\\.');
  queryPattern = queryPattern.replace(/\*/g, '.\*');
  queryPattern = queryPattern.replace(/\(/g, '\\(');
  queryPattern = queryPattern.replace(/\)/g, '\\)');
  var queryRegex = new RegExp(queryPattern, 'i');
  if(fname.match(queryRegex)){
    return true;
  } else {
    return false;
  }
}


var findFilenameMatch = function(entries, curr_filename_regex){
  for(var j=0; j<entries.length; j++){
    if(testFnameToMatch(entries[j], curr_filename_regex)){
      console.log("found a file " + entries[j] + " for this store " + curr_filename_regex);
      // console.log(JSON.stringify(store_mappings[i]));
      return entries[j];
    }
  }
  return null;
}


exports.syncDate = function(pid, date, callback){
	console.log("xlsxdropboxmodule CALL: syncDate");
  console.log(pid + " " + date);
	var store_mappings = [];
  var dropbox_folder_full = "";
  var dropbox_folder = "";
  var dropbox_client_folder = "";

	var query = 'select pointid, attributes, xlsxmapping from points where pid_proj = ' + pid + ' and xlsxmapping is not null;';
	runQuery(query, function(result){
    console.log("got # of results: " + result.length);
		store_mappings = result;

    if(result.length > 0){
      
      // get folder and client folder from the first element
      // ASSUMPTION: all store mappings have the same client folder
      dropbox_folder = store_mappings[0].xlsxmapping.folder;
      dropbox_client_folder_nodate = store_mappings[0].xlsxmapping.client_folder;
      dropbox_client_folder = store_mappings[0].xlsxmapping.client_folder;

      // add the date as the next child folder
      dropbox_client_folder += '/' + date + '/';

      dropbox_folder_full = dropbox_folder + dropbox_client_folder;



      // fetch list public folder from dropbox.js into filenames_list
      var req = { "body" : { "folder" : dropbox_folder, "client_folder": dropbox_client_folder}};

      dropbox.listPublicFolder(req, null, function(entries){
        // for each store, try to match store.filename_regex with one filename on filenames_list

        var ctr = 0;

        // jesus... a double for loop has exponential time complexity (findFilenameMatch has another for)... need to use another approach
        for(var i=0; i<store_mappings.length; i++){
          var matchFound;
          if( ( matchFound = findFilenameMatch(entries, store_mappings[i].xlsxmapping.curr_filename_regex) ) != null ){
            console.log("REQUESTED processXlsxDropbox " + i);
            processXlsxDropbox(pid, dropbox_folder, dropbox_client_folder_nodate, matchFound, store_mappings[i], i, date, function(store_mapping, fetched_date){
              ctr++;
              var str = "Read " + ctr + " of " + (store_mappings.length) + " | " + fetched_date + " for " + store_mapping;
              console.log(str);
              skt.broadcastAll('new_xlsxdropbox_forcedread', str);

              if(ctr == store_mappings.length){
                if (typeof callback === "function") {
                  finishWithTimeout(callback, {"status": 200, "processed": ctr});
                  // callback({"status": "ok", "processed": ctr});
                }
              }
            });
          } else {
            // it may be sunday!!! validate. if its not, send alert to customer.
            console.log("havent found a file for " + store_mappings[i].xlsxmapping.curr_filename_regex);
            if (typeof callback === "function") {
              callback({"status": 404, "message": "havent found files. is it sunday?"});
            }
          }
          // if(i==store_mappings.length-1){
          //   // last one, return to UI that its done
          //   if (typeof callback === "function") {
          //     finishWithTimeout(callback, {"status": 200, "processed": ctr});
          //     // callback({"status": "ok", "processed": ctr});
          //   }
          // }
        }
        
      })

    }

		

	});
}


exports.setTriggerHour = function(triggerTimeStr, triggerHour, projectidxlsxdropbox){
  console.log("xlsxdropboxmodule call: setTriggerHour");

  var q = "update pollingtimers set intervalvalue = " + triggerHour + ", triggertime = '" + triggerTimeStr + "' where pid_proj = " + projectidxlsxdropbox + " and triggertime is not null returning timerid;";

  runQuery(q, function(results){
    if(results.length == 0){
      // the update didnt work because there is no entry for pid_proj projectidxlsxdropbox, so insert one

      var q2 = "INSERT INTO pollingtimers(pid_proj, intervalvalue, triggertime) VALUES ("+projectidxlsxdropbox+", "+triggerHour+", '"+triggerTimeStr+"')";
      runQuery(q2, function(results2){
        console.log("added new timer");
      });
    }
  });
}
