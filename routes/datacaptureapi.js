var pg = require('pg');
var config = require('../config.js');
var api = require('./api.js');
var conString = config.conString;
var temail = require('./email/temail');
var occurrencestrack = require('./occurrences/occurrencestrack.js');






var testIndependentOccurrence = function(config, value, reading){
  console.log(reading);

  switch(config.rule){

    case "Equal to":
      if(+reading.value == +value){
        return true;
      }
      break;
    case "Less than":
      if(+reading.value < +value){
        return true;
      }
      break;
    case "Greater than":
      if(+reading.value > +value){
        return true;
      }
      break;
    case "Less than or equal to":
      if(+reading.value <= +value){
        return true;
      }
      break;
    case "Greater than or equal to":
      if(+reading.value >= +value){
        return true;
      }
      break;
    case "Not equal to":
      if(+reading.value != +value){
        return true;
      }
      break;

  }

  return false;
}




var calcCellPos = function(m, kpi){
  // console.log("calcCellPos for "+str);
  // console.log("result is "+str.replace(/\s/g, "") + "\n");
  var str = m + "__" + kpi;
  return str.replace(/\s/g, "_") ;
}


var getObjectivesBudget = function(olapstoreinfo){
  console.log("getObjectivesBudget");
  if(olapstoreinfo.hasOwnProperty('cells')){
    return olapstoreinfo.cells;
  }
  return null;
}


var getObjectivesIfHasWeekday = function(olapstoreinfo){
  console.log("getObjectivesIfHasWeekday");
  if(olapstoreinfo.hasOwnProperty('weeklyObjectives')){
    return olapstoreinfo.weeklyObjectives;
  }
  return null;
}


var getObjectivesIfHasHour = function(olapstoreinfo, hour){
  console.log("getObjectivesIfHasHour");
  if(olapstoreinfo.hasOwnProperty('dailyObjectives')){
    return olapstoreinfo.dailyObjectives;
  }
  return null;
}



var occToGenBatch = new Array();



var weekdays = new Array(7);
weekdays[0]=  "Sunday";
weekdays[1] = "Monday";
weekdays[2] = "Tuesday";
weekdays[3] = "Wednesday";
weekdays[4] = "Thursday";
weekdays[5] = "Friday";
weekdays[6] = "Saturday";


var monthArr = new Array();
monthArr[0] = "Jan";
monthArr[1] = "Feb";
monthArr[2] = "Mar";
monthArr[3] = "Apr";
monthArr[4] = "May";
monthArr[5] = "Jun";
monthArr[6] = "Jul";
monthArr[7] = "Aug";
monthArr[8] = "Sep";
monthArr[9] = "Oct";
monthArr[10] = "Nov";
monthArr[11] = "Dec";


var hasProperty = function(objectivesData, kpititle, month, weekday, readhour){
  if(weekday != null && weekday != undefined){
    if(readhour != null && readhour != undefined){
      if(objectivesData != null && objectivesData != undefined && 
          objectivesData.hasOwnProperty(kpititle) && 
          objectivesData[kpititle].hasOwnProperty(month) && 
          objectivesData[kpititle][month].hasOwnProperty(weekday) && 
          objectivesData[kpititle][month][weekday].hasOwnProperty(readhour)){
        return true;
      }
    } else {
      if(objectivesData != null && objectivesData != undefined && 
        objectivesData.hasOwnProperty(kpititle) && 
        objectivesData[kpititle].hasOwnProperty(month) && 
        objectivesData[kpititle][month].hasOwnProperty(weekday)){
        return true;
      }
    }
  } else {
    // complex / average aggr method kpi objectives
    if( objectivesData.hasOwnProperty(calcCellPos(month, kpititle)) ){
      return true;
    }
  }
  return false;
}


var processAlarms = function(pid, kpititle, pointkey, pointid, allreadings, newreadings, readsBasicVars, isEndOfDayProcessing){
  console.log("\n\n\n***********************\nSTART processAlarms");
  console.log(pid + " " + kpititle + " " + pointkey + " " + pointid);
  // console.log("\n\n\n***********************\n");
  // console.log(allreadings);
  // console.log("\n\n\n***********************\n");
  // console.log(newreadings);
  // console.log("\n\n\n***********************\nEND processAlarms");

  /* 

  obter as occurrCfg deste pid
    para cada uma, ver se ela é igual ao kpi title e tem o pointkey a true
      if(no repetition)
        para cada READ em newreadings
          compara independentemente regra com READ
            (compare independente tenta ver se:
              regra é por valor
                compara directamente valor da regra com READ
              ou por diferença ao objectivo
                ir buscar o olapstoreinfo do pointid
                formula da regra com o objectivo aplicada sobre o READ
            )
      if(repetition)
        if(repetitionIsHourly)
          para cada READ em newreadings
            obter o i dessa READ em allreadings
              e andar para trás no allreadings X casas conforme a regra
                testar a regra em cada elemGoingBackwards
        if(repetitionIsDaily)
          ...
  */

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }


    // var q1 = "select config from occurrenceconfigs where pid_proj = "+pid 
    //   + " and config->'widgetBox'->>'title' = '"+kpititle+"'"
    //   + " and config->'storeBox'->>'"+pointkey+"' = 'true'";




    var q1 = "select config, olapstoreinfo from occurrenceconfigs, points where occurrenceconfigs.pid_proj = "+ pid 
      + " and config->'widgetBox'->>'title' = '"+kpititle+"' and config->'storeBox'->>'"+pointkey+"' = 'true'"
      + " and points.attributes->>'PointKey' = '"+pointkey+"' and points.pid_proj = " + pid;



      console.log("q1");
      console.log(q1);

    client.query(q1, function(err1, result1){
      if(err1) {
        client.end();
        return console.error('datacapture.addOrUpdate1 error running query', err1);
      }

      client.end();

      if(result1.rows.length > 0){
        occToGenBatch = new Array()

        // we have occurrence config for this
        for(var i=0; i<result1.rows.length; i++){
          var config = result1.rows[i].config;
          var olapstoreinfo = result1.rows[i].olapstoreinfo;

          
          if(isHourlyOccurrence(config)){

            if(!isCumulativeOccurrence(config)){
              if(!isRepetitionOccurrence(config)){
                console.log("no repetition occurrence");
                // console.log(config);

                for(var j=0; j<newreadings.length; j++){
                  var read = newreadings[j];
                  var configvalue = config.value;
                  var readVal = read.value;


                  if(!isHourlyOccurrence(config)){
                    // accumulate readings for this day if config is daily (instead of hourly)
                    var foundreads = false;
                    readVal = 0;

                    for(var i=0; i<allreadings.length; i++){
                      var auxhourread = allreadings[i].reads;
                      if(auxhourread.timestamp == read.timestamp){
                        foundreads = true;
                        // this calculation needs to be adapted for average aggr method
                        // we need to inject the base kpis on this function
                        readVal += parseFloat(auxhourread.value);
                      } else {
                        if(foundreads){
                          break;
                        }
                      }
                    }

                    // accumulate objectives for this day if  config is daily (instead of hourly)
                    var auxreadhour = parseInt(read.hour);

                    var objectivesData = getObjectivesIfHasHour(olapstoreinfo, auxreadhour);
                    if(config["objBox"] == true){
                      var theDate = new Date(read.timestamp);
                      var weekday = weekdays[theDate.getDay()];
                      var month = monthArr[theDate.getMonth()];

                      configvalue = 0;

                      for(var l=auxreadhour; l>=0; l--){
                        var vv = objectivesData[kpititle][month][weekday][l];
                        if(vv != null && vv != undefined){
                          configvalue += (config.value) * vv / 100;
                        }
                      }
                    }



                    
                    
                  } else {
                    var objectivesData = getObjectivesIfHasHour(olapstoreinfo, read.hour);
                    if(config["objBox"] == true){
                      var theDate = new Date(read.timestamp);
                      var weekday = weekdays[theDate.getDay()];
                      var month = monthArr[theDate.getMonth()];

                      if(objectivesData != null && hasProperty(objectivesData, kpititle, month, weekday, read.hour)){
                        configvalue = (config.value) * objectivesData[kpititle][month][weekday][read.hour] / 100;
                        // console.log("comparing value " + read.value + " with objective " + configvalue + " (percentage " + config.value + ")" );
                        // console.log(kpititle + " || " + month + " || " + weekday + " || " + read.hour);
                      } else {
                        console.log("OCCURRENCE CONFIG HAS OBJBOX TRUE BUT STORE HAS NO OBJECTIVES!");
                        console.log(kpititle + " || " + month + " || " + weekday + " || " + read.hour);
                        break;
                      }
                    }
                  }


                  console.log("final values!!!");


                  if(testIndependentOccurrence(config, configvalue, {"value": readVal})){
                    console.log("THERE IS AN OCCURRENCE TO BE GENERATED!!!");

                    issueOccurrenceGeneration(read, config, objectivesData, kpititle, month, weekday, pointid, pointkey, pid, null, null);
                  } else {
                    console.log("no occurrence to be gen...");
                  }
                }


              } // end !isRepetitionOccurrence(config)
              else {

                /*
                  for all newreadings
                    get the number of repetitions from config to var NN
                    get the corresponding reading on allreadings and its previous NN-1 readings
                      check the config.rule true for all readings
                        if(true, generate occurrence with a different titleStr)
                        if(false, console log no occurrence to be gen)
                 */

               // NUNOALEX this is only good code for sum aggr method kpis

                var repvalue = config.repvalue;
                var temporalrepStr = (config.hourlyBox == true) ? "hours" : "days";

                console.log("repetition occurrence for repvalue: " + repvalue);
                for(var j=0; j<newreadings.length; j++){
                  var read = newreadings[j];

                  // find the index of read on allreadings
                  var index = -1;
                  for(var k=0; k<allreadings.length; k++){
                    var pastread = allreadings[k].reads;

                    if(compareReads(read, pastread) == 0){
                      index = k;
                      break;
                    }
                  }

                  console.log("index is " + index);
                  if(index != -1){
                    // we found the read, get the previous repvalue-1 reads and test the rule for each one of them
                    var auxindex = index;
                    var allrepreadsgenerate = true;
                    for(var k=0; k<repvalue; k++){
                      auxindex += k;
                      var aux = allreadings[auxindex].reads;

                      var configvalue = config.value;

                      var objectivesData = getObjectivesIfHasHour(olapstoreinfo, aux.hour);
                      console.log('config["objBox"] ' + (config["objBox"]));
                      if(config["objBox"] == true){
                        var theDate = new Date(aux.timestamp);
                        var weekday = weekdays[theDate.getDay()];
                        var month = monthArr[theDate.getMonth()];

                        if(objectivesData != null && hasProperty(objectivesData, kpititle, month, weekday, aux.hour)){
                          configvalue = (config.value) * objectivesData[kpititle][month][weekday][aux.hour] / 100;
                          console.log("comparing value " + aux.value + " with objective " + configvalue + " (percentage " + config.value + ")" );
                          console.log(kpititle + " || " + month + " || " + weekday + " || " + aux.hour);
                        } else {
                          console.log("OCCURRENCE CONFIG HAS OBJBOX TRUE BUT STORE HAS NO OBJECTIVES!");
                          console.log(kpititle + " || " + month + " || " + weekday + " || " + aux.hour);
                          break;
                        }
                      }

                      console.log("testIndependentOccurrence " + testIndependentOccurrence(config, configvalue, aux));
                      if(!testIndependentOccurrence(config, configvalue, aux)){
                        allrepreadsgenerate = false;
                      }

                    }

                    if(allrepreadsgenerate){
                      console.log("THERE IS AN OCCURRENCE WITH REPETITION TO BE GENERATED!!!");

                      issueOccurrenceGeneration(read, config, objectivesData, kpititle, month, weekday, pointid, pointkey, pid, repvalue, temporalrepStr);
                    } else {
                      console.log("no occurrence to be gen...");
                    }
                  }
                }


              } // END isRepetitionOccurrence(config)

            } // END !isCumulativeOccurrence
            else
            {
              console.log("its cumulative occurence!");
              // get the base kpis for this kpi (or hardcode by kpi name)
              // get the formula (or hardcode by kpi name)


              if(kpititle == "Net Sales" || kpititle == "Number of Customers"){

                if(!isRepetitionOccurrence(config)){
                  console.log("no repetition occurrence");
                  // console.log(config);

                  for(var j=0; j<newreadings.length; j++){
                    var read = newreadings[j];
                    var configvalue = config.value;

                    // var readVal = accumulateValue(read, allreadings);

                    var index = -1;
                    var readVal = 0;
                    for(var k=0; k<allreadings.length; k++){
                      var pastread = allreadings[k].reads;

                      if(compareReads(read, pastread) == 0){
                        index = k;
                        break;
                      }
                    }
                    if(index != -1){
                      var auxindex = index;
                      var auxread = allreadings[auxindex].reads;

                      while(auxread.timestamp == read.timestamp){

                        // sendo paragony ou net sales, vamos somando esse kp
                        readVal += +auxread.value;
                        // se fosse basket ou outro, tinhamos era de ir somando os valores
                        // dos kpis associados. no fim dividir um pelo outro.

                        auxindex++;
                        if(auxindex < allreadings.length){
                          auxread = allreadings[auxindex].reads;
                        } else {
                          break;
                        }
                      }
                    }

                    var auxreadhour = parseInt(read.hour);

                    var objectivesData = getObjectivesIfHasHour(olapstoreinfo, auxreadhour);
                    if(config["objBox"] == true){
                      var theDate = new Date(read.timestamp);
                      var weekday = weekdays[theDate.getDay()];
                      var month = monthArr[theDate.getMonth()];

                      configvalue = 0;

                      for(var l=auxreadhour; l>=0; l--){
                        var vv = objectivesData[kpititle][month][weekday][l];
                        if(vv != null && vv != undefined){
                          configvalue += (config.value) * vv / 100;
                        }
                      }
                    }


                    console.log("final values!!!");

                    if(testIndependentOccurrence(config, configvalue, {"value": readVal})){
                      console.log("THERE IS AN OCCURRENCE TO BE GENERATED!!!");

                      issueOccurrenceGeneration(read, config, objectivesData, kpititle, month, weekday, pointid, pointkey, pid, null, null);
                    } else {
                      console.log("no occurrence to be gen...");
                    }

                  }
                } else {


                  for(var j=0; j<newreadings.length; j++){
                    var read = newreadings[j];
                    var configvalue = config.value;

                    // var readVal = accumulateValue(read, allreadings);

                    var index = -1;
                    for(var k=0; k<allreadings.length; k++){
                      var pastread = allreadings[k].reads;

                      if(compareReads(read, pastread) == 0){
                        index = k;
                        break;
                      }
                    }
                    if(index != -1){
                      var auxindex = index;
                      var auxread = allreadings[auxindex].reads;
                      var allrepreadsgenerate = true;

                      var repvalue = config.repvalue;
                      var temporalrepStr = (config.hourlyBox == true) ? "hours" : "days";

                      for(var m=auxindex; m<(auxindex + repvalue); m++){
                        var auxread = allreadings[m].reads;
                        var whileauxindex = m;
                        var whileauxread = allreadings[m].reads;
                        var readVal = 0;

                        while(whileauxread.timestamp == read.timestamp){

                          // sendo paragony ou net sales, vamos somando esse kp
                          readVal += +whileauxread.value;
                          // se fosse basket ou outro, tinhamos era de ir somando os valores
                          // dos kpis associados. no fim dividir um pelo outro.

                          whileauxindex++;
                          if(whileauxindex < allreadings.length){
                            whileauxread = allreadings[whileauxindex].reads;
                          } else {
                            break;
                          }
                        }


                        var auxreadhour = parseInt(auxread.hour);

                        var objectivesData = getObjectivesIfHasHour(olapstoreinfo, auxreadhour);
                        if(config["objBox"] == true){
                          var theDate = new Date(auxread.timestamp);
                          var weekday = weekdays[theDate.getDay()];
                          var month = monthArr[theDate.getMonth()];

                          configvalue = 0;

                          for(var l=auxreadhour; l>=0; l--){
                            var vv = objectivesData[kpititle][month][weekday][l];
                            if(vv != null && vv != undefined){
                              configvalue += (config.value) * vv / 100;
                            }
                          }
                        }


                        console.log("final values!!!");

                        allrepreadsgenerate = allrepreadsgenerate && testIndependentOccurrence(config, configvalue, {"value": readVal});
                      }

                      if(allrepreadsgenerate){
                        console.log("THERE IS AN REPETITIVE OCCURRENCE TO BE GENERATED!!!");
                        issueOccurrenceGeneration(read, config, objectivesData, kpititle, month, weekday, pointid, pointkey, pid, repvalue, temporalrepStr);
                      } else {
                        console.log("no occurrence to be gen...");
                      }
                    }


                    
                  }



                } // end else !isRepetitionOccurrence


              } // end for sum aggr method kpis
              else {
                // start for kpis like basket, margin and multiline bills

                if(!isRepetitionOccurrence(config)){
                  console.log("cumulative, complex kpi, no repetition");

                  for(var j=0; j<newreadings.length; j++){
                    var read = newreadings[j];
                    var configvalue = config.value;

                    var index = -1;
                    var readVal = 0;
                    for(var k=0; k<allreadings.length; k++){
                      var pastread = allreadings[k].reads;

                      if(compareReads(read, pastread) == 0){
                        index = k;
                        break;
                      }
                    }

                    if(index != -1){
                      var foundreads = false;

                      var auxindex = index;
                      var auxread = allreadings[auxindex].reads;



                      if(kpititle == "Basket"){

                        var netSalesAccum = 0;
                        var numCustomersAccum = 0;

                        for(var p=0; p<readsBasicVars["Net Sales"].length; p++){
                          var auxhourread = readsBasicVars["Net Sales"][p].reads;
                          if(auxhourread.timestamp == read.timestamp && parseInt(auxhourread.hour) <= parseInt(read.hour) ){
                            foundreads = true;
                            netSalesAccum += parseFloat(auxhourread.value);
                          } else {
                            if(foundreads){
                              break;
                            }
                          }
                        }

                        foundreads = false;
                        for(var p=0; p<readsBasicVars["Number of Customers"].length; p++){
                          var auxhourread = readsBasicVars["Number of Customers"][p].reads;
                          if(auxhourread.timestamp == read.timestamp && parseInt(auxhourread.hour) <= parseInt(read.hour) ){
                            foundreads = true;
                            numCustomersAccum += parseFloat(auxhourread.value);
                          } else {
                            if(foundreads){
                              break;
                            }
                          }
                        }


                        readVal = netSalesAccum / numCustomersAccum;

                      } else if(kpititle == "Net Margin"){

                        var marginPln = 0;
                        var netSales = 0;

                        while(auxread.timestamp == read.timestamp){
                          for(var q=0; q<readsBasicVars["Net Sales"].length; q++){
                            var auxhourread2 = readsBasicVars["Net Sales"][q].reads;
                            if(auxread.timestamp == auxhourread2.timestamp && auxread.hour == auxhourread2.hour){
                              foundreads = true;
                              marginPln += (parseFloat(auxread.value) / 100 * parseFloat(auxhourread2.value));
                              netSales += parseFloat(auxhourread2.value);
                              break;
                            }
                          }

                          auxindex++;
                          if(auxindex < allreadings.length){
                            auxread = allreadings[auxindex].reads;
                          } else {
                            break;
                          }
                        }

                        readVal = marginPln / netSales * 100;

                      } else if(kpititle == "Multiline Bills"){
                        var overOneBills = 0;
                        var paragony = 0;

                        while(auxread.timestamp == read.timestamp){
                          
                          // readVal += +auxread.value;

                          for(var q=0; q<readsBasicVars["Number of Customers"].length; q++){
                            var auxhourread2 = readsBasicVars["Number of Customers"][q].reads;
                            if(auxread.timestamp == auxhourread2.timestamp && auxread.hour == auxhourread2.hour){
                              foundreads = true;
                              overOneBills += (parseFloat(auxread.value) / 100 * parseFloat(auxhourread2.value));
                              paragony += parseFloat(auxhourread2.value);
                              break;
                            }
                          }

                          auxindex++;
                          if(auxindex < allreadings.length){
                            auxread = allreadings[auxindex].reads;
                          } else {
                            break;
                          }
                        }

                        readVal = overOneBills / paragony * 100;

                      }



                      var objectivesData = getObjectivesBudget(olapstoreinfo);

                      // the objective is simply the kpi and month on budget
                      if(config["objBox"] == true){
                        var theDate = new Date(read.timestamp);
                        var month = monthArr[theDate.getMonth()];

                        var vv = objectivesData[calcCellPos(month, kpititle)];
                        if(vv != null && vv != undefined){
                          configvalue = (config.value) * vv / 100;
                        } else {
                          console.log("OCCURRENCE CONFIG HAS OBJBOX TRUE BUT STORE HAS NO OBJECTIVES!");
                          console.log(kpititle + " || " + month );
                          break;
                        }
                      }



                      console.log("final values!!!");

                      if(testIndependentOccurrence(config, configvalue, {"value": readVal})){
                        console.log("THERE IS AN OCCURRENCE TO BE GENERATED!!!");

                        issueOccurrenceGeneration(read, config, objectivesData, kpititle, month, weekday, pointid, pointkey, pid, null, null);
                      } else {
                        console.log("no occurrence to be gen...");
                      }

                    } // end if(index != -1)

                  }


                } else {
                  // its a repetition occurrence for complex kpis
                  // TODO:
                }
              }


              // get the readings of these kpis
                // for each reading
                  // readVal = accum(mainKpiReadings, 0, reading.hour)

                  // if by objective
                    // for each baseKpi
                      // calc accum(baseKpiReadings, 0, reading.hour)
                    // perform calculation of objective configvalue

                  

            }

          
          } else {
            // !isHourlyOccurrence(config)
            console.log("!isHourlyOccurrence");

          }

        }

        trySendOccToGenBatch(null, isEndOfDayProcessing);
      }

    });

  });
}




var formatDate = function(date){
  var dd = date.getDate();
  var mm = date.getMonth()+1; //January is 0!
  var yyyy = date.getFullYear();

  if(dd<10) {
      dd='0'+dd
  } 

  if(mm<10) {
      mm='0'+mm
  } 

  var endDate = yyyy+"-"+mm+"-"+dd;
  return endDate;
}


var isLastHourOfDay = function(config, pointkey, read){
  // get the last czas of the day

  var theDate = new Date(read.timestamp);
  var weekday = weekdays[theDate.getDay()];

  if(pointkey == "12"){
    if(weekday == "Saturday"){
      return (read.hour == "20");
    } else if(weekday == "Sunday"){
      return (read.hour == "19");
    } else {
      // regular day
      return (read.hour == "20");
    }
  } else {
    if(weekday == "Saturday"){
      return (read.hour == "14");
    } else if(weekday == "Sunday"){
      // return false because other stores dont open on sunday
      return false;
    } else {
      // regular day
      
      return (read.hour == "19");
    }
  }
}

var trySendOccToGenBatch = function(occBatchArg, isLast){
  if(occBatchArg != null && occBatchArg != undefined){
    if(occBatchArg.length > 0){
      for(var i=0; i<occBatchArg.length; i++){
        var auxocc = occBatchArg[i];
        api.generateOccurrenceInternal(auxocc.pid, auxocc.aux, auxocc.tasklistid, (i == (occBatchArg.length-1) ), isLast);
      }
    }
  } else {
    if(occToGenBatch.length > 0){
      for(var i=0; i<occToGenBatch.length; i++){
        var auxocc = occToGenBatch[i];
        api.generateOccurrenceInternal(auxocc.pid, auxocc.aux, auxocc.tasklistid, (i == (occToGenBatch.length-1) ), isLast);
      }
    }
  }
}



var isHourlyOccurrence = function(config){
  if(config.hasOwnProperty('hourlyBox')){
    return config.hourlyBox;
  }
  if(config.hasOwnProperty('dailyBox')){
    return !config.dailyBox;
  }
}


var isCumulativeOccurrence = function(config){
  if(config.hasOwnProperty('absolute')){
    if(config.absolute == true){
      return false;
    } else {
      return true;
    }
  }
  if(config.hasOwnProperty('cumulative')){
    if(config.cumulative == true){
      return true;
    } else {
      return false;
    }
  }
}


var isRepetitionOccurrence = function(config){
  if(config.hasOwnProperty('noRepBox')){
    if(config.noRepBox == true){
      return false;
    } else {
      return true;
    }
  }
  if(config.hasOwnProperty('repetitionBox')){
    if(config.repetitionBox == true){
      return true;
    } else {
      return false;
    }
  }
}

var issueOccurrenceGeneration = function(read, config, objectivesData, kpititle, month, weekday, pointid, pointkey, pid, repvalue, temporalrepStr, occBatchArg){
  var readingDate = new Date(read.timestamp);
  if(read.hasOwnProperty('hour') && read.hour != ""){
    // will this hour assignment mess up with the timezone?
    readingDate.setHours(read.hour);
  }
  weekday = weekdays[readingDate.getDay()];
  month = monthArr[readingDate.getMonth()];

  var titleStr = config.rule + " " + config.value;
  var frequency = "";
  var plannedvalue = config.value;
  var unit = "";

  if(isHourlyOccurrence(config)){
    frequency = "hourly";
    unit = config['widgetBox']['unit'];

    if(kpititle == "Basket" || kpititle == "Net Margin" || kpititle == "Multiline Bills"){
      if(config["objBox"] == true && hasProperty(objectivesData, kpititle, month)){
        titleStr += " % of objective " + (objectivesData[calcCellPos(month, kpititle)]).toFixed(2) +  " "+config['widgetBox']['unit'];
        plannedvalue = (objectivesData[calcCellPos(month, kpititle)]).toFixed(2);
      } else {
        titleStr += " "+config['widgetBox']['unit'];
      }
    } else {
      if(config["objBox"] == true && hasProperty(objectivesData, kpititle, month, weekday, read.hour)){
        titleStr += " % of objective " + (objectivesData[kpititle][month][weekday][read.hour]).toFixed(2) +  " "+config['widgetBox']['unit'];
        plannedvalue = (objectivesData[kpititle][month][weekday][read.hour]).toFixed(2);
      } else {
        titleStr += " "+config['widgetBox']['unit'];
      }
    }

  } else {
    frequency = "daily";
    unit = config['widgetBox']['unit'];
    if(kpititle == "Basket" || kpititle == "Net Margin" || kpititle == "Multiline Bills"){
      if(config["objBox"] == true && hasProperty(objectivesData, kpititle, month)){
        titleStr += " % of objective " + (objectivesData[calcCellPos(month, kpititle)]).toFixed(2) +  " "+config['widgetBox']['unit'];
        plannedvalue = (objectivesData[calcCellPos(month, kpititle)]).toFixed(2);
      } else {
        titleStr += " "+config['widgetBox']['unit'];
      }
    } else {
      if(config["objBox"] == true && hasProperty(objectivesData, kpititle, month, weekday)){
        titleStr += " % of objective " + (objectivesData[kpititle][month][weekday]).toFixed(2) +  " "+config['widgetBox']['unit'];
        plannedvalue = (objectivesData[kpititle][month][weekday]).toFixed(2);
      } else {
        titleStr += " "+config['widgetBox']['unit'];
      }
    }
  }

  if(isRepetitionOccurrence(config)){
    titleStr += " for " + repvalue + " "+temporalrepStr+" in a row";
  }

  var dueDateObj = calcDateObj(read.timestamp, read.hour, config.actionValueInHours);

  var aux = { "title": titleStr, "date": read.timestamp, "time": read.hour+":00", "pointid": pointid+"", 
    "statusdate": "", "kpi": kpititle, "value": read.value, "frequency": frequency, "pointkey": pointkey,
    "plannedvalue": plannedvalue, "unit": unit, "duedate": dueDateObj.date, "duehour": dueDateObj.hour };

  /* this line below will be changed in the future.
    thats because we cant just generate an occurrence, we need to collect them all together, pass them to 
    an occurrencemanager module, and that module will detect repetitive/duplicate occurrences according
    to thresholds defined by the user:
    e.g. same occurrence in 5 hours shouldnt generate the same 5 notifications, it should collect them and create a single notification.
    e.g. a value that triggers two different occurrence configs on the same kpi, it should precede one of them and drop the other one.
  */
  // api.generateOccurrenceInternal(pid, aux, config.tasklist.tasklistid);
  if(occBatchArg != null && occBatchArg != undefined){
    occBatchArg.push({"pid": pid, "aux": aux, "tasklistid": config.tasklist.tasklistid});
  } else {
    occToGenBatch.push({"pid": pid, "aux": aux, "tasklistid": config.tasklist.tasklistid});
  }
}

var compareReads = function(read, pastread){
  if( read.category == pastread.category &&
           read.hour == pastread.hour &&
           read.product == pastread.product &&
           read.promoter == pastread.promoter &&
           read.timestamp == pastread.timestamp &&
           read.value == pastread.value ){
    return 0;
  }
  return (-1);
}



var calcDateObj = function(readingDate, readingHour, hourOffset){
  var theDate = new Date(readingDate);
  theDate.setHours(readingHour);
  var toRet = {};
  toRet.date = "";
  toRet.hour = "";

  if(hourOffset != null && hourOffset != undefined && hourOffset != ""){
    theDate.setHours(theDate.getHours()+hourOffset);
    toRet.date = formatDate(theDate);
    toRet.hour = theDate.getHours();
  }

  return toRet;
}



exports.updateIndicatorReadings = function(iid, pointkey, readings, readsToTestAlarms, isLast, avoidAlarms){
  console.log("DATACAPTUREAPI internal call: updateIndicatorReadings");


  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }


    var q1 = "UPDATE indicators SET readings = '"
      + JSON.stringify(readings)
      + "'::json "
      + " WHERE iid=" + iid 
      + " returning iid, title, pointid_point, pid_proj;";
    console.log(q1);

    client.query(q1, function(err1, result1){
      if(err1) {
        client.end();
        return console.error('datacapture.updateIndicatorReadings1 error running query', err1);
      }

      console.log("\nUPDATED INDICATOR "+result1.rows[0]['title'] + " || iid " + result1.rows[0]['iid'] + " || pointid " + result1.rows[0]['pointid_point']+" \n\n");

      if(readsToTestAlarms.length > 0 && !avoidAlarms){

        // *************************************************
        var datesStr = "to_date(reads->>'timestamp', 'YYYY MM DD') = '2015-06-29'::date or to_date(reads->>'timestamp', 'YYYY MM DD') = '2015-06-28'::date";
        datesStr = "true";
        // NUNOALEX some day we will only bring the necessary reads from DB, to avoid returning millions of results
        // take in account that for occurrence alarms with day repetitions N, we need to also bring the previous N days
        // *************************************************

        var q2 = "select iid, reads, occtypeid_typ from indicators, json_array_elements(readings) as reads"
        + " WHERE iid=" + iid 
        + " and (" + datesStr + ") "
        + " order by to_date(reads->>'timestamp', 'YYYY MM DD') DESC, reads->>'hour' DESC;";

        client.query(q2, function(err2, result2){
          if(err2) {
            client.end();
            return console.error('datacapture.addOrUpdate2 error running query', err2);
          }

          // result2.rows will have the readings ordered in DESC order

          if(result1.rows[0]['title'] == "Basket" || result1.rows[0]['title'] == "Net Margin" || result1.rows[0]['title'] == "Multiline Bills"){

            var readsBasicVars = {};

            var q3 = "select iid, title, reads, occtypeid_typ from indicators, json_array_elements(readings) as reads"
              +" WHERE (indicators.title = 'Net Sales' or indicators.title = 'Number of Customers') "
              +" and pointid_point = (select pointid_point from indicators where iid = "+iid+") "
              + " and (" + datesStr + ") "
              +" order by title, to_date(reads->>'timestamp', 'YYYY MM DD') DESC, reads->>'hour' DESC";

              console.log("\n\n\nq3");
              console.log(q3);

            client.query(q3, function(err3, result3){
              if(err3) {
                client.end();
                return console.error('datacapture.addOrUpdate2 error running query', err3);
              }

              var allReads = result3.rows;

              var auxi = parseInt(allReads.length / 2);

              while( allReads[auxi] == allReads[auxi+1] && auxi >= 0 && auxi < allReads.length-1){
                if(allReads[auxi].title == "Net Sales"){
                  auxi++;
                } else {
                  auxi--;
                }
              }

              readsBasicVars["Net Sales"] = allReads.slice(0, auxi);
              readsBasicVars["Number of Customers"] = allReads.slice(auxi);

              processAlarms(result1.rows[0]['pid_proj'], result1.rows[0]['title'], pointkey, result1.rows[0]['pointid_point'], result2.rows, readsToTestAlarms, readsBasicVars, isLast);
              client.end();

            });

            


          } else {
            processAlarms(result1.rows[0]['pid_proj'], result1.rows[0]['title'], pointkey, result1.rows[0]['pointid_point'], result2.rows, readsToTestAlarms, null, isLast);
            client.end();
          }

          

        });
      } else {
        if(avoidAlarms){
          console.log("avoiding alarms!");
        }
        client.end();
      }
      

    });

  });
}




var processEndOfDayOccurrences = function(pid, iid, pointkey, pointid, kpititle, startDate, endDate, allreadings, readsBasicVars, isLast){




  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }



    var q1 = "select config, olapstoreinfo from occurrenceconfigs, points where occurrenceconfigs.pid_proj = "+ pid 
      + " and config->'widgetBox'->>'title' = '"+kpititle+"' and config->'storeBox'->>'"+pointkey+"' = 'true'"
      + " and points.attributes->>'PointKey' = '"+pointkey+"' and points.pid_proj = " + pid;



    // console.log("q1");
    // console.log(q1);

    client.query(q1, function(err1, result1){
      if(err1) {
        client.end();
        return console.error('datacapture.processEndOfDayOccurrences1 error running query', err1);
      }

      client.end();



      var occToGenBatchArg = new Array();
      if(result1.rows.length > 0){




        // we have occurrence config for this
        for(var i=0; i<result1.rows.length; i++){
          var config = result1.rows[i].config;
          var olapstoreinfo = result1.rows[i].olapstoreinfo;


          if(isHourlyOccurrence(config)){
            // DONT PROCESS, DAILY OCCURRENCES ONLY
          } else {

            if(!isRepetitionOccurrence(config)){
              console.log("no repetition occurrence");
              var configvalue = config.value;


              var foundreads = false;
              var readVal = 0;

              if(kpititle == "Basket" || kpititle == "Net Margin" || kpititle == "Multiline Bills"){

                if(kpititle == "Basket"){

                  var netSalesAccum = 0;
                  var numCustomersAccum = 0;

                  for(var p=0; p<readsBasicVars["Net Sales"].length; p++){
                    var auxhourread = readsBasicVars["Net Sales"][p].reads;
                    if(auxhourread.timestamp == endDate){
                      foundreads = true;
                      netSalesAccum += parseFloat(auxhourread.value);
                    } else {
                      if(foundreads){
                        break;
                      }
                    }
                  }

                  foundreads = false;
                  for(var p=0; p<readsBasicVars["Number of Customers"].length; p++){
                    var auxhourread = readsBasicVars["Number of Customers"][p].reads;
                    if(auxhourread.timestamp == endDate){
                      foundreads = true;
                      numCustomersAccum += parseFloat(auxhourread.value);
                    } else {
                      if(foundreads){
                        break;
                      }
                    }
                  }

                  readVal = netSalesAccum / numCustomersAccum;


                  

                } else if(kpititle == "Net Margin"){

                  var marginPln = 0;
                  var netSales = 0;

                  // for all readings 
                  for(var p=0; p<allreadings.length; p++){
                    var auxhourread = allreadings[p];
                    if(auxhourread["f1"] == endDate){

                      for(var q=0; q<readsBasicVars["Net Sales"].length; q++){
                        var auxhourread2 = readsBasicVars["Net Sales"][q].reads;

                        
                        if(auxhourread["f1"] == auxhourread2.timestamp && auxhourread["f2"] == auxhourread2.hour){
                          foundreads = true;
                          marginPln += (parseFloat(auxhourread["f3"]) / 100 * parseFloat(auxhourread2.value));
                          netSales += parseFloat(auxhourread2.value);
                          break;
                        }
                      }
                    } else {
                      if(foundreads){
                        break;
                      }
                    }
                  }

                  readVal = marginPln / netSales * 100;

                }
                else if(kpititle == "Multiline Bills"){

                  var overOneBills = 0;
                  var paragony = 0;

                  // for all readings 
                  for(var p=0; p<allreadings.length; p++){
                    var auxhourread = allreadings[p];
                    if(auxhourread["f1"] == endDate){


                      for(var q=0; q<readsBasicVars["Number of Customers"].length; q++){
                        var auxhourread2 = readsBasicVars["Number of Customers"][q].reads;

                        
                        if(auxhourread["f1"] == auxhourread2.timestamp && auxhourread["f2"] == auxhourread2.hour){
                          foundreads = true;
                          overOneBills += (parseFloat(auxhourread["f3"]) / 100 * parseFloat(auxhourread2.value));
                          paragony += parseFloat(auxhourread2.value);
                          break;
                        }
                      }
                    } else {
                      if(foundreads){
                        break;
                      }
                    }
                  }

                  readVal = overOneBills / paragony * 100;

                }







                var objectivesData = getObjectivesBudget(olapstoreinfo);

                // the objective is simply the kpi and month on budget
                if(config["objBox"] == true){
                  var theDate = new Date(endDate);
                  var month = monthArr[theDate.getMonth()];

                  var vv = objectivesData[calcCellPos(month, kpititle)];
                  if(vv != null && vv != undefined){
                    configvalue = (config.value) * vv / 100;
                  } else {
                    console.log("OCCURRENCE CONFIG HAS OBJBOX TRUE BUT STORE HAS NO OBJECTIVES!");
                    console.log(kpititle + " || " + month );
                    break;
                  }
                }

              } else {



                // base kpis
                for(var i=0; i<allreadings.length; i++){
                  var auxhourread = allreadings[i];
                  if(auxhourread["f1"] == endDate){
                    foundreads = true;
                    // this calculation needs to be adapted for average aggr method
                    // we need to inject the base kpis on this function
                    readVal += parseFloat(auxhourread["f3"]);
                  } else {
                    if(foundreads){
                      break;
                    }
                  }
                }

                // accumulate objectives for this day if  config is daily (instead of hourly)
                

                var objectivesData = getObjectivesIfHasWeekday(olapstoreinfo);
                if(config["objBox"] == true){
                  var theDate = new Date(endDate);
                  var weekday = weekdays[theDate.getDay()];
                  var month = monthArr[theDate.getMonth()];

                  configvalue = 0;

                  var vv = objectivesData[kpititle][month][weekday];
                  if(vv != null && vv != undefined){
                    configvalue += (config.value) * vv / 100;
                  }
                }

              }


              console.log("final values!!!");

              if(testIndependentOccurrence(config, configvalue, {"value": readVal})){
                console.log("THERE IS A DAILY OCCURRENCE TO BE GENERATED!!!");
                var read = {};
                read.value = readVal;
                read.timestamp = endDate;
                read.hour = "22";
                issueOccurrenceGeneration(read, config, objectivesData, kpititle, month, weekday, pointid, pointkey, pid, null, null, occToGenBatchArg);
              } else {
                console.log("no occurrence to be gen...");
              }






            } else {
              // start isRepetitionOccurrence
              console.log("daily repetition occurrence");





              var read = {};
              read.timestamp = endDate;
              read.hour = "22";
              var configvalue = config.value;
              var readVal = 0;
              var readValRead = 0;
              var readValReadNetSales = 0;
              var readValReadNumCustomers = 0;
              var allrepreadsgenerate = true;

              

                var startDate = new Date(read.timestamp);
                var weekday = weekdays[startDate.getDay()];
                var datesArr = new Array();
                datesArr.push(read.timestamp);

                var repvalue = config.repvalue;
                var temporalrepStr = (config.hourlyBox == true) ? "hours" : "days";

                for(var n=1; n<repvalue; n++){
                  // go back repvalue days
                  startDate.setDate(startDate.getDate() - 1);
                  var dateStrAux = formatDate(startDate);
                  console.log(dateStrAux);

                  // added exception for pointkey 12 that is open on Sunday
                  if(weekdays[startDate.getDay()] != "Sunday" || parseInt(pointkey) == 12){
                    datesArr.push(dateStrAux);
                  } else {
                    n--;
                  }
                }


                for(var o=0; o<datesArr.length; o++){

                  var auxtimestamp = datesArr[o];

                  var foundreads = false;
                  readVal = 0;

                  if(kpititle == "Basket" || kpititle == "Net Margin" || kpititle == "Multiline Bills"){
                    // calc basket accum value for this auxtimestamp


                    if(kpititle == "Basket"){

                      var netSalesAccum = 0;
                      var numCustomersAccum = 0;

                      for(var p=0; p<readsBasicVars["Net Sales"].length; p++){
                        var auxhourread = readsBasicVars["Net Sales"][p].reads;
                        if(auxhourread.timestamp == auxtimestamp){
                          foundreads = true;
                          netSalesAccum += parseFloat(auxhourread.value);
                          if(auxhourread.timestamp == read.timestamp){
                            readValReadNetSales += parseFloat(auxhourread.value);
                          }
                        } else {
                          if(foundreads){
                            break;
                          }
                        }
                      }

                      foundreads = false;
                      for(var p=0; p<readsBasicVars["Number of Customers"].length; p++){
                        var auxhourread = readsBasicVars["Number of Customers"][p].reads;
                        if(auxhourread.timestamp == auxtimestamp){
                          foundreads = true;
                          numCustomersAccum += parseFloat(auxhourread.value);
                          if(auxhourread.timestamp == read.timestamp){
                            readValReadNumCustomers += parseFloat(auxhourread.value);
                          }
                        } else {
                          if(foundreads){
                            break;
                          }
                        }
                      }

                      readVal = netSalesAccum / numCustomersAccum;
                      if(auxtimestamp == read.timestamp){
                        readValRead = readValReadNetSales / readValReadNumCustomers;
                      }
                    } 
                    else if(kpititle == "Net Margin"){

                      var marginPln = 0;
                      var netSales = 0;
                      var marginPlnRead = 0;
                      var netSalesRead = 0;

                      // for all readings 
                      for(var p=0; p<allreadings.length; p++){
                        var auxhourread = allreadings[p];
                        if(auxhourread["f1"] == auxtimestamp){

                          for(var q=0; q<readsBasicVars["Net Sales"].length; q++){
                            var auxhourread2 = readsBasicVars["Net Sales"][q].reads;

                            
                            if(auxhourread["f1"] == auxhourread2.timestamp && auxhourread["f2"] == auxhourread2.hour){
                              foundreads = true;
                              marginPln += (parseFloat(auxhourread["f3"]) / 100 * parseFloat(auxhourread2.value));
                              netSales += parseFloat(auxhourread2.value);
                              if(auxhourread["f1"] == read.timestamp){
                                marginPlnRead += (parseFloat(auxhourread["f3"]) / 100 * parseFloat(auxhourread2.value));
                                netSalesRead += parseFloat(auxhourread2.value);
                              }
                              break;
                            }
                          }
                        } else {
                          if(foundreads){
                            break;
                          }
                        }
                      }

                      readVal = marginPln / netSales * 100;
                      if(auxtimestamp == read.timestamp){
                        readValRead = marginPlnRead / netSalesRead * 100;
                      }

                    } 
                    else if(kpititle == "Multiline Bills"){

                      var overOneBills = 0;
                      var paragony = 0;
                      var overOneBillsRead = 0;
                      var paragonyRead = 0;

                      // for all readings 
                      for(var p=0; p<allreadings.length; p++){
                        var auxhourread = allreadings[p];
                        if(auxhourread["f1"] == auxtimestamp){

                          for(var q=0; q<readsBasicVars["Number of Customers"].length; q++){
                            var auxhourread2 = readsBasicVars["Number of Customers"][q].reads;

                            
                            if(auxhourread["f1"] == auxhourread2.timestamp && auxhourread["f2"] == auxhourread2.hour){
                              foundreads = true;
                              overOneBills += (parseFloat(auxhourread["f3"]) / 100 * parseFloat(auxhourread2.value));
                              paragony += parseFloat(auxhourread2.value);
                              if(auxhourread["f1"] == read.timestamp){
                                overOneBillsRead += (parseFloat(auxhourread["f3"]) / 100 * parseFloat(auxhourread2.value));
                                paragonyRead += parseFloat(auxhourread2.value);
                              }
                              break;
                            }
                          }
                        } else {
                          if(foundreads){
                            break;
                          }
                        }
                      }

                      readVal = overOneBills / paragony * 100;
                      if(auxtimestamp == read.timestamp){
                        readValRead = overOneBillsRead / paragonyRead * 100;
                      }

                    }


                    // get objectives data
                    var objectivesData = getObjectivesBudget(olapstoreinfo);

                    // the objective is simply the kpi and month on budget
                    if(config["objBox"] == true){
                      var theDate = new Date(auxtimestamp);
                      var month = monthArr[theDate.getMonth()];

                      var vv = objectivesData[calcCellPos(month, kpititle)];
                      if(vv != null && vv != undefined){
                        configvalue = (config.value) * vv / 100;
                      } else {
                        console.log("OCCURRENCE CONFIG HAS OBJBOX TRUE BUT STORE HAS NO OBJECTIVES!");
                        console.log(kpititle + " || " + month );
                        break;
                      }
                    }


                  } else {
                    // basic vars net sales and paragony

                    for(var p=0; p<allreadings.length; p++){
                      var auxhourread = allreadings[p];
                      if(auxhourread["f1"] == auxtimestamp){
                        foundreads = true;
                        // this calculation needs to be adapted for average aggr method
                        // we need to inject the base kpis on this function
                        readVal += parseFloat(auxhourread["f3"]);
                        if(auxhourread["f1"] == read.timestamp){
                          readValRead += parseFloat(auxhourread["f3"]);
                        }
                      } else {
                        if(foundreads){
                          break;
                        }
                      }
                    }

                    console.log("readVal " + readVal);

                    var objectivesData = getObjectivesIfHasWeekday(olapstoreinfo);
                    if(config["objBox"] == true){
                      var theDate = new Date(auxtimestamp);
                      var weekday = weekdays[theDate.getDay()];
                      var month = monthArr[theDate.getMonth()];

                      configvalue = 0;

                      var vv = objectivesData[kpititle][month][weekday];
                      if(vv != null && vv != undefined){
                        configvalue += (config.value) * vv / 100;
                      }
                    }
                  }

                  allrepreadsgenerate = allrepreadsgenerate && testIndependentOccurrence(config, configvalue, {"value": readVal});

                }

                console.log("final values!!!");

                if(allrepreadsgenerate){
                  console.log("THERE IS A REPETITIVE DAILY OCCURRENCE TO BE GENERATED!!!");
                  read.value = readValRead;
                  issueOccurrenceGeneration(read, config, objectivesData, kpititle, month, weekday, pointid, pointkey, pid, repvalue, temporalrepStr, occToGenBatchArg);
                } else {
                  console.log("no occurrence to be gen...");
                }
              









            } // end isRepetitionOccurrence

          }


        }

        trySendOccToGenBatch(occToGenBatchArg, isLast);

      }


      if( (result1.rows.length <= 0 || occToGenBatchArg.length == 0) && isLast){
        occurrencestrack.processAndSendDailyOccurrences(pid, endDate);
        occurrencestrack.processAndSendOverdueOccurrences(pid, endDate);
      }

    });

  });

}


exports.processDailyOccurrences = function(pid, iid, pk, pointid_point, title, startDate, endDate, allreadings, isLast){
  // for this kpi, point and readings, we need to get the config
  // and calc using the above code for the !hourly

  // console.log("DATACAPTUREAPI call: processDailyOccurrences");

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

      if(title == "Basket" || title == "Net Margin" || title == "Multiline Bills"){

        var readsBasicVars = {};

        var datesStr = "to_date(reads->>'timestamp', 'YYYY MM DD') >= '"+startDate+"'::date and to_date(reads->>'timestamp', 'YYYY MM DD') <= '"+endDate+"'::date";

        var q3 = "select iid, title, reads, occtypeid_typ from indicators, json_array_elements(readings) as reads"
          +" WHERE (indicators.title = 'Net Sales' or indicators.title = 'Number of Customers') "
          +" and pointid_point = (select pointid_point from indicators where iid = "+iid+") "
          + " and (" + datesStr + ") "
          +" order by title, to_date(reads->>'timestamp', 'YYYY MM DD') DESC, reads->>'hour' DESC";

          // console.log("\n\nq3");
          // console.log(q3);

        client.query(q3, function(err3, result3){
          if(err3) {
            client.end();
            return console.error('datacapture.addOrUpdate2 error running query', err3);
          }

          var allReads = result3.rows;

          var auxi = parseInt(allReads.length / 2);

          while( allReads[auxi] == allReads[auxi+1] && auxi >= 0 && auxi < allReads.length-1){
            if(allReads[auxi].title == "Net Sales"){
              auxi++;
            } else {
              auxi--;
            }
          }

          readsBasicVars["Net Sales"] = allReads.slice(0, auxi);
          readsBasicVars["Number of Customers"] = allReads.slice(auxi);

          processEndOfDayOccurrences(pid, iid, pk, pointid_point, title, startDate, endDate, allreadings, readsBasicVars, isLast);
          client.end();

        });

      } else {


        processEndOfDayOccurrences(pid, iid, pk, pointid_point, title, startDate, endDate, allreadings, null, isLast);
        client.end();
      }

  });






}




exports.sendDailyEmail = function(pid, date){

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
        return console.error('datacaptureapi.sendDailyEmail error running query', err);
      }

      var occurrences = new Array();

      for(var i=0; i<result.rows.length; i++){
        var occAux = result.rows[i];
        occurrences.push({"title": occAux.object.title, "kpi": occAux.object.kpi, "pointname": occAux.object.pointname, 
          "value": parseFloat(occAux.object.value).toFixed(2), "time": occAux.object.time, "unit": occAux.object.unit,
          "budget": occAux.object.plannedvalue });
      }

      if(occurrences.length > 0){

        var q2 = "select json_array_elements(mailinglists->'daily') as mail from projects where pid = "+pid;
        client.query(q2, function(err2, result2) {
          if(err2) {
            client.end();
            return console.error('datacaptureapi.sendDailyEmail2 error running query', err2);
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
