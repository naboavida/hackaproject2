var skt = require('./socket');
var polling = require('./pollingapi');
var xmla = require('xmla4js');
var dataCaptureModule = require('./datacapture');

dataCaptureModule.init();

// AINDA É CEDO PARA ISTO... either require pg and create connection or call the api to try to add on db





var INIT_URL = "http://sqlmf.cloudapp.net:8080/olap/msmdpump.dll";
var INIT_CATALOG_NAME = "CoreAnalytics_OLAP";
var INIT_USER = "mf\\TestOlap";
var INIT_PASS = "Test2015";

var x = new xmla.Xmla();

// lastParent will hold the contents of parent of the last executeQueryMDXArray
var lastParent;


function executeQueryMDX(statement, last_read_readings){
  // console.log("API call: executeQueryMDX");

  var parent = {"parent": []};

  var properties = { DataSourceInfo: null, Catalog: INIT_CATALOG_NAME };

  // console.log(statement);

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

    // console.log("\n\n CELLSET cellset cellCount "+ (cellset.cellCount()));



    var oobj = {};
    var theobj = cellset.getByIndex(0, oobj);

    // console.log(theobj);

      // console.log("done");





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


                node = { "node": []};

                var nodeArrObj = {};
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


                nodeBody = [];
                nodeArrObj["body"] = nodeBody;

                append(node, parent);


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




        // console.log("Testing: "+cellset.cellCount());


            console.log("END");
            // console.log( JSON.stringify(parent) );
            console.log( parent.parent.length + " results!!" );
            last_read_readings = parent.parent.length;


            var dateNow = new Date();
			polling.addRead({"id":ctr, "count":parent.parent.length, "date":dateNow});
			ctr++;

            skt.broadcastAll('update_counter_test', parent.parent.length);


      

    },
    error: function(x, xmlaRequest, exception){
       //handle error
       console.log("ERROR EXEC");
       console.log(exception);
       console.log(parent.length + " results");
       if(parent != undefined && parent != null && parent.hasOwnProperty('parent')){
       	skt.broadcastAll('update_counter_test', parent.parent.length);
       } else {
       	skt.broadcastAll('update_counter_test', 0);
       }

    },
    username: INIT_USER,
    password: INIT_PASS
  });


}






  function cloneObject(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            temp[key] = cloneObject(obj[key]);
        }
    }
    return temp;
  }

  function mergeObjects(objA, objB){
    var toRet = {};

    for(var propA in objA){
      if(!toRet.hasOwnProperty(propA)){
        toRet[propA] = objA[propA];
      }
    }
    for(var propB in objB){
      if(!toRet.hasOwnProperty(propB)){
        toRet[propB] = objB[propB];
      }
    }

    return toRet;
  }



  function normalizeParent(parentObj){
    var toRet = { "length" : 0};
    if(parentObj == undefined){
      // console.log("parentObj is undefined");
      return undefined;
    }

    for(var prop in parentObj){
      if(!toRet.hasOwnProperty(parentObj[prop].node[0].body[0].tupleHTML)){
        // console.log("parentObj[prop].node[0].body[0].tupleHTML " + parentObj[prop].node[0].body[0].tupleHTML);
        toRet[parentObj[prop].node[0].body[0].tupleHTML] = parentObj[prop].node[0].body[0];
        toRet.length++;
      } else {
        // console.log("normalizeParent - WARNING: there are duplicate properties on this object");
        toRet[parentObj[prop].node[0].body[0].tupleHTML] = mergeObjects(toRet[parentObj[prop].node[0].body[0].tupleHTML], parentObj[prop].node[0].body[0]);
        // console.log( toRet[parentObj[prop].node[0].body[0].tupleHTML]);
      }
    }
    // console.log("LWENGTH " + parentObj.length + " toRet " + toRet.length);
    return toRet;
  }

  var kpis_list = ['Basket', 'Paragony', 'W_sp_csn_rb', 'NetMargin', 'PercBills', 'W_zap_czn_r'];

  function calcDifferencesNode(lastNode, newNode, forceReadings){
    // console.log("\nComparing");
    // console.log(lastNode);
    // console.log(newNode);
    var toRet = new Array();
    for(var kpi in newNode){
      if(kpis_list.indexOf(kpi) >= 0){
        // console.log(kpi);
        if(lastNode == undefined || lastNode.hasOwnProperty(kpi)){
          if(lastNode == undefined || lastNode[kpi] != newNode[kpi]){
            if(newNode['[Sklep].[Sklep Lokalizacja]'] != "All" && newNode['[Czas].[Czas]'] != "All"){
              // console.log({"kpi": kpi, "val": newNode[kpi], "PointKey": newNode['[Sklep].[Sklep Lokalizacja]']});
              toRet.push({"pk": newNode['[Sklep].[Sklep Lokalizacja]'], "kp": kpi, "hr": newNode['[Czas].[Czas]'], "vl": newNode[kpi], "dt": newNode['[Data].[Kalendarz]']});

              if(lastNode == undefined){
                // console.log("ADD "+kpi+" NIL -> "+newNode[kpi]+" ["+newNode['[Sklep].[Sklep Lokalizacja]']+"] @ "+ newNode['[Czas].[Czas]'] );
                // NUNOALEX
                var objToSend = {"pk": newNode['[Sklep].[Sklep Lokalizacja]'], "kp": kpi, "hr": newNode['[Czas].[Czas]'], "vl": newNode[kpi], "dt": newNode['[Data].[Kalendarz]']};
                if(!forceReadings){
                  skt.broadcastAll('new_live_reading', objToSend);
                } else {
                  skt.broadcastAll('new_live_reading_forced', objToSend);
                }

                // dataCaptureModule.addOrUpdate(objToSend);
              } else {
                // console.log("UPD "+kpi+" "+lastNode[kpi]+" -> "+newNode[kpi]+" ["+newNode['[Sklep].[Sklep Lokalizacja]']+"] @ "+ newNode['[Czas].[Czas]'] );
                var objToSend = {"pk": newNode['[Sklep].[Sklep Lokalizacja]'], "kp": kpi, "hr": newNode['[Czas].[Czas]'], "vl": newNode[kpi], "dt": newNode['[Data].[Kalendarz]']};
                if(!forceReadings){
                  skt.broadcastAll('new_live_reading', objToSend);
                } else {
                  skt.broadcastAll('new_live_reading_forced', objToSend);
                }
              }
              
            }
          }
        }
      }
    }
    return toRet;
  }


  function calcDifferences(lastParent, newParent, debug, forceReadings){
    var toRet = new Array();

    if(lastParent == undefined){
      // console.log("typeof lastParent newParent " + "UNDEFINED" + " " + (typeof newParent));
      // console.log("length lastParent newParent " + "UNDEFINED" + " " + (newParent.length));
    } else {
      // console.log("typeof lastParent newParent " + (typeof lastParent) + " " + (typeof newParent));
      // console.log("length lastParent newParent " + (lastParent.length) + " " + (newParent.length));
    }


    var newLastParent = normalizeParent(lastParent);
    var newNewParent = normalizeParent(newParent);


    var toInform = {};
    if(debug == true){
      toInform.lastParent = cloneObject(lastParent);
      toInform.newParent = cloneObject(newParent);
      toInform.newLastParent = cloneObject(newLastParent);
      toInform.newNewParent = cloneObject(newNewParent);
      skt.broadcastAll('to_inform_compares', (toInform));
    }

    // return toRet; // TIRAR ISTO!!


    for(var prop in newNewParent){
      // console.log("prop "+prop);
      // console.log(newNewParent[prop]);

      // console.log((newLastParent == undefined || newLastParent.hasOwnProperty(prop)));

      if(newLastParent == undefined || newLastParent.length == 0 || newLastParent.hasOwnProperty(prop)){
        // console.log("\n\nnewLastParent");
        // console.log(newLastParent);
        var toTestLastParent;
        if(newLastParent != undefined && newLastParent.length != 0){
          toTestLastParent = newLastParent[prop];
        } 

        // if(debug == true){
        //   console.log("\n\nDEBUG");
        //   console.log("prop " + prop);
        //   console.log(toTestLastParent);
        //   console.log(newNewParent[prop]);
        // }

        var nodeDiffs = calcDifferencesNode(toTestLastParent, newNewParent[prop], forceReadings);
        // we need to then compare all KPIs as props inside each object
        // if any KPI has different value or new parent doesnt even have it, make the toRet.push
        // we can also separate them for update or add
        // console.log("nodeDiffs lenght " + nodeDiffs.length);
        // for(var i=0; i<nodeDiffs.length; i++){
        //   toRet.push("wahh//"+prop+"//"+i);
        // }
        toRet = toRet.concat(nodeDiffs);
      }

      // console.log("\n\n");
    }

    return toRet;
  }



  function buildReadingsArray(parent){
    for(var prop in newParent){
      console.log(newParent[prop].node[0].body[0]);
    }
  }






function executeQueryMDXArray(statementsArr, todays_curr_hour_secs, parent, forceDate, forcedPid){
  console.log("API call: executeQueryMDXArray");

  if(forceDate == undefined || forceDate == null){
    forceDate = false;
  }


  

  var properties = { DataSourceInfo: null, Catalog: INIT_CATALOG_NAME };
  var statement = statementsArr.shift();
  // console.log(statement);

  x.execute({
    async: true,
    url: INIT_URL,
    statement: statement,
      properties: properties,
    success: function(xmla, request, response){
      // console.log("SUCCESS EXEC");

      var dataset = response;
      
      // console.log(dataset);

      // toRet.dataset = dataset;

      // console.log("\n\nget cell set");
      var cellset = response.getCellset();
      // console.log("\n\ncellset");
      // console.log(cellset);

    // console.log("\n\n CELLSET cellset cellCount "+ (cellset.cellCount()));



    var oobj = {};
    var theobj = cellset.getByIndex(0, oobj);

    // console.log(theobj);

      // console.log("done");





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


                node = { "node": []};

                var nodeArrObj = {};
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


                nodeBody = [];
                nodeArrObj["body"] = nodeBody;

                append(node, parent);


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



        if(statementsArr.length == 0){


          console.log( parent.parent.length + " results!!" );
          console.log("---------------------------");

          if(!forceDate){

            if(lastHourSeconds == todays_curr_hour_secs){

              var deeebug = false;


              if(last_read_readings == parent.parent.length){
                // is same hour && has same number of readings
                // we may also need to check differences, due to updates
                console.log("same hour with same number of readings");
              } else {
                // is same hour && has different number of readings
                console.log("newww readings for this hour, we need to calc them");
              }

              var diffsArray = calcDifferences(lastParent, parent.parent, deeebug);
              if(diffsArray.length > 0){

                var dateNow = new Date();
                polling.addRead({"id":ctr, "count":(diffsArray.length), "date":dateNow});
                ctr++;

                skt.broadcastAll('update_counter_test', (diffsArray.length));

                dataCaptureModule.addOrUpdate(diffsArray, pid);
              }


            } else {
              // is new hour
              console.log("new readings for this newwwwww hour");

              var diffsArray = calcDifferences(lastParent, parent.parent, true);
              console.log("diffsArray.length "+diffsArray.length);

              if(diffsArray.length > 0){
                var dateNow = new Date();
                polling.addRead({"id":ctr, "count":(diffsArray.length), "date":dateNow});
                ctr++;

                skt.broadcastAll('update_counter_test', (diffsArray.length));

                dataCaptureModule.addOrUpdate(diffsArray, pid);
              }
            }

            console.log("---------------------------");

            last_read_readings = parent.parent.length;
            lastHourSeconds = todays_curr_hour_secs;
            // lastParent = cloneObject(parent.parent);
            lastParent = parent.parent;

            clearLastParentDataCounter();

            // compare parent.parent.length with lastParent
            // if lenght != so we have new ones
            // if length == we still need to check using an efficient way
            // check and add the differences (if there is no mapped value, make an add; if there is a mapped value try to update)
            // save the current parent to the aux register


          } else {
            // code for force date
            console.log("FORCE DATE");
            var diffsArray = calcDifferences({}, parent.parent, true, true);
            console.log(diffsArray);
            if(diffsArray.length > 0){
              var dateNow = new Date();
              polling.addRead({"id":"forced", "count":(diffsArray.length), "date":dateNow});
              skt.broadcastAll('update_counter_test', (diffsArray.length));
              dataCaptureModule.addOrUpdate(diffsArray, forcedPid, true);
            }
          }
          

        } else {
          // console.log("another MDX sentence");
          executeQueryMDXArray(statementsArr, todays_curr_hour_secs, parent, forceDate, forcedPid);
        }
      

    },
    error: function(x, xmlaRequest, exception){
       //handle error
       console.log("ERROR EXEC");
       console.log(exception);
       console.log(parent.length + " results");
       if(parent != undefined && parent != null && parent.hasOwnProperty('parent')){
        skt.broadcastAll('update_counter_test', parent.parent.length);
       } else {
        skt.broadcastAll('update_counter_test', 0);
       }

    },
    username: INIT_USER,
    password: INIT_PASS
  });




}



var buildOlapSentence = function(startDate, endDate, startHourSeconds, endHourSeconds) {
	
	var startDateString = " ([Data].[Kalendarz].[Dzień].&["+endDate+"],\n";
	var startHourString = " [Czas].[Czas].Members)\n";


	if(startDate != undefined || startDate != null || startDate == endDate){
		startDateString = " ([Data].[Kalendarz].[Dzień].&["+startDate+"]:[Data].[Kalendarz].[Dzień].&["+endDate+"],\n";
		
		if(startHourSeconds != undefined && startHourSeconds != null && startHourSeconds != endHourSeconds){
			startHourString = " [Czas].[Czas].&["+startHourSeconds+"]:[Czas].[Czas].&["+endHourSeconds+"])\n"
		}
	}

	// if(startHourSeconds != undefined && startHourSeconds != null && startHourSeconds != endHourSeconds){
		startHourString = " [Czas].[Czas].&["+startHourSeconds+"]:[Czas].[Czas].&["+endHourSeconds+"])\n"
	// }



	var sentence = "WITH MEMBER [Measures].[Basket] AS \n"+
	  " [Measures].[W_sp_csn_rb] /   \n"+
	  " [Measures].[Paragony],\n"+
	  " FORMAT_STRING = '0.00%'  -- Result set \n"+
	" SELECT { \n"+
	 " [Measures].[Basket], [Measures].[W_sp_csn_rb]}  ON COLUMNS,\n"+
	"  NON EMPTY\n"+
	 startDateString +
	 " [Sklep].[Sklep Lokalizacja].Members,\n"+
	 " [Sklep].[Sklep Miasto].Members,\n"+
	 startHourString +
	 " ON ROWS\n"+
	" FROM [BI_Reports]";

	return sentence;
}


var buildOlapSentences = function(startDate, endDate, startHourSeconds, endHourSeconds) {
  var sentences = new Array();

  // endDate = "20150619";

  var startDateString = " ([Data].[Kalendarz].[Dzień].&["+endDate+"],\n";
  var startHourString = " [Czas].[Czas].Members)\n";


  if(startDate != undefined || startDate != null || startDate == endDate){
    startDateString = " ([Data].[Kalendarz].[Dzień].&["+startDate+"]:[Data].[Kalendarz].[Dzień].&["+endDate+"],\n";
    
    if(startHourSeconds != undefined && startHourSeconds != null && startHourSeconds != endHourSeconds){
      startHourString = " [Czas].[Czas].&["+startHourSeconds+"]:[Czas].[Czas].&["+endHourSeconds+"])\n"
    }
  }

  // if(startHourSeconds != undefined && startHourSeconds != null && startHourSeconds != endHourSeconds){
    // startHourString = " [Czas].[Czas].&["+startHourSeconds+"]:[Czas].[Czas].&["+endHourSeconds+"])\n"
  // }

  // startHourString = " [Czas].[Czas].&["+startHourSeconds+"])\n";
  startHourString = " [Czas].[Czas].&["+startHourSeconds+"]:[Czas].[Czas].&["+endHourSeconds+"])\n";


  if(startDate != undefined || startDate != null && startDate != endDate){
    // console.log("\n\nRECOVERY QUERY\n");
    startHourString = " [Czas].[Czas].Members)\n";
  } else {
    // console.log("\n\nnormal QUERY\n");
  }




  var sentence = "WITH MEMBER [Measures].[Basket] AS \n"+
    " [Measures].[Koszyk],   \n"+
    " FORMAT_STRING = '0.00%'  -- Result set \n"+
    " MEMBER [Measures].[NetMargin] AS \n"+
    " [Measures].[M_spn_rb%] * 100 \n"+
  " SELECT { \n"+
   " [Measures].[Basket], [Measures].[W_sp_csn_rb], [Measures].[Paragony]}  ON COLUMNS,\n"+
  "  NON EMPTY\n"+
   startDateString +
   " [Sklep].[Sklep Lokalizacja].Members,\n"+
   " [Sklep].[Sklep Miasto].Members,\n"+
   startHourString +
   " ON ROWS\n"+
  " FROM [BI_Reports]";



  sentences.push(sentence);

  var sentenceMargin = "WITH MEMBER [Measures].[Basket] AS \n"+
    " [Measures].[Koszyk],   \n"+
    " FORMAT_STRING = '0.00%'  -- Result set \n"+
    " MEMBER [Measures].[NetMargin] AS \n"+
    " [Measures].[M_spn_rb%] * 100 \n"+
  " SELECT { \n"+
   " [Measures].[NetMargin]}  ON COLUMNS,\n"+
  "  NON EMPTY\n"+
   startDateString +
   " [Sklep].[Sklep Lokalizacja].Members,\n"+
   " [Sklep].[Sklep Miasto].Members,\n"+
   startHourString +
   " ON ROWS\n"+
  " FROM [BI_Reports]";



  sentences.push(sentenceMargin);


  var stocklevelSentence = "SELECT {  \n"+
   " [Measures].[W_zap_czn_r]}  ON COLUMNS, \n"+
   " NON EMPTY \n"+
   startDateString +
   " [Sklep].[Sklep Lokalizacja].Members, \n"+
   " [Sklep].[Sklep Miasto].Members) \n"+
   " ON ROWS \n"+
   " FROM [BI_Reports]";
  sentences.push(stocklevelSentence);




  var sentenceBills = "WITH MEMBER [Measures].[Basket] AS \n"+
" [Measures].[Koszyk]   \n"+
"MEMBER [Measures].[ParagonuOverOne] AS \n"+
"SUM ({[Linie paragonu].[Linie paragonu].&[2]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony]) \n"+
"MEMBER [Measures].[AllParagonu] AS \n"+
"SUM ({[Linie paragonu].[Linie paragonu].&[0]:[Linie paragonu].[Linie paragonu].&[10]},[Measures].[Paragony]) \n"+
"MEMBER [Measures].[PercBills] AS \n"+
"([Measures].[ParagonuOverOne] /[Measures].[AllParagonu] )*100 \n"+
"SELECT {  \n"+
"[Measures].[PercBills] }  ON COLUMNS, \n"+
"  NON EMPTY\n"+
   startDateString +
   " [Sklep].[Sklep Lokalizacja].Members,\n"+
   " [Sklep].[Sklep Miasto].Members,\n"+
   startHourString +
   " ON ROWS\n"+
  " FROM [BI_Reports]";

  sentences.push(sentenceBills);



  return sentences;
}




var ctr = 0;

var lastDate;
var lastSecs;
var lastHourSeconds;
var last_read_readings = 0;




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



var dateStr = function(date){

  if(date == undefined){
    return "";
  }

  if(typeof date == 'string'){
    date = new Date(date);
  }

  var dd = date.getDate();
  var mm = date.getMonth()+1; //January is 0!
  var yyyy = date.getFullYear();

  if(dd<10) {
      dd='0'+dd
  }
  if(mm<10) {
      mm='0'+mm
  }
  return ""+yyyy + mm + dd;
}


var getDateToday = function(){
	var today = new Date();
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
	return ""+yyyy + mm + dd;
}

var getCurrHourInSecondsToday = function(houroffset) {
	var today = new Date();

	if(houroffset != null && houroffset != undefined && (typeof houroffset == Number)){
		today.setHours(today.getHours()+houroffset);
	}

  // today.setHours(today.getHours()-8);

	var h = today.getHours();
	
	var m = 0;
	var s = 0;
	// var m = today.getMinutes();
	// var s = today.getSeconds();
	return (+h * 60 * 60) + (+m * 60) + +s;
}



var getCurrHourMinutesSecondsInSecondsToday = function(houroffset){
  var today = new Date();

  if(houroffset != null && houroffset != undefined && (typeof houroffset == Number)){
    today.setHours(today.getHours()+houroffset);
  }

  // today.setHours(today.getHours()-8);

  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  return (+h * 60 * 60) + (+m * 60) + +s;
}


var getCurrHourInSecondsTodayNegativeOffset = function(negativehouroffset){
  var today = new Date();

  today.setHours(today.getHours()-negativehouroffset);

  // today.setHours(today.getHours()-8);

  var h = today.getHours();
  return (+h * 60 * 60) ;
}




var getCurrHourInSecondsTodayPositiveOffset = function(positivehouroffset){
  var today = new Date();

  today.setHours(today.getHours()+positivehouroffset);

  // today.setHours(today.getHours()-8);

  var h = today.getHours();
  return (+h * 60 * 60) ;
}



var pid;


var doneDaily = false;




var readIntervalQuery = function(projectid, lastPollingDetails){
	console.log('readIntervalQuery');
  pid = projectid;


	var todays_date = getDateToday();
	var todays_curr_hour_secs = getCurrHourInSecondsToday();
  // var todays_next_hour_secs = getCurrHourInSecondsToday(1);
	var todays_next_hour_secs = getCurrHourMinutesSecondsInSecondsToday(1);


  todays_curr_hour_secs = getCurrHourInSecondsTodayNegativeOffset(2);
  todays_next_hour_secs = getCurrHourInSecondsTodayPositiveOffset(2);


  // hardcoded values for testing on after 10 pm period
  // lastDate = '20150706';
  // todays_date = '20150706';

  // todays_curr_hour_secs = getCurrHourInSecondsTodayNegativeOffset(16);
  // todays_next_hour_secs = getCurrHourInSecondsTodayNegativeOffset(6);
  // // todays_next_hour_secs = getCurrHourInSecondsTodayPositiveOffset(6);

  if(lastPollingDetails != null && lastPollingDetails != undefined){
    // NUNOALEX this is a recovery reading, change todays_date etc vars above


    console.log("GOT LAST POLLING DETAILS!!!!");
    console.log(lastPollingDetails);

    lastDate = lastPollingDetails.lastdate;
    todays_curr_hour_secs = lastPollingDetails.lasthoursecs;
  }


  console.log("\n\nVALIDATE DATES AND HOURS");
	console.log(lastDate + " ||| " + todays_date + " " + todays_curr_hour_secs + " " + todays_next_hour_secs);


    if(todays_curr_hour_secs <= todays_next_hour_secs){
      var sentences = buildOlapSentences(lastDate, todays_date, todays_curr_hour_secs, todays_next_hour_secs);
      console.log(sentences);
      var parent = {"parent": []};
      executeQueryMDXArray(sentences, todays_curr_hour_secs, parent);
    } else {
      console.log("SKIPPING BECAUSE CURR HOUR IS BIGGER THAN NEXT HOUR");
    }


    if(lastPollingDetails == null || lastPollingDetails == undefined){
      // PLN#103 - end of day processing of occurrences
      // detectar que é hora de processar as ocorrencias (e enviar o mail diario) para este dia
      // chamar a funcao do datacapture
      // actualizar a lastDailyProcessDate
      // e guarda-la na bd!
      // (falta lastDailyProcessDate na BD, e trigger mail que é dentro do dailyProcessing)

      // PARA JÁ VOU FAZER COM doneDaily SÓ MM PARA FAZER DEBUG

      var currentDate = new Date();

      console.log("testing for daily processing. currentDate: " + dateStr(currentDate) + " lastDailyProcessDate: " + dateStr(lastDailyProcessDateObj[projectid]) + " || hours: " + currentDate.getHours());

      if( dateStr(currentDate) != dateStr(lastDailyProcessDateObj[projectid]) && currentDate.getHours() >= 22 ){
        console.log("\n\nstarting daily processing for today\n\n");
        
        lastDailyProcessDateObj[projectid] = currentDate;
        saveLastDailyProcessDateOnDb(projectid, formatDate(currentDate));

        dataCaptureModule.dailyProcessing(projectid, todays_date);
      } else {
        console.log("\n\nwere not there yet for a daily processing\n\n");
      }
      
    }


	// lastHourSeconds = todays_curr_hour_secs;
  lastDate = todays_date;
	lastSecs = todays_curr_hour_secs;



  // NUNOALEX we need to update the timer on bd with the last date and hour
  // so we get the missing data on each pollingapi.init 
  saveLastPollingDetails(pid, todays_date, todays_curr_hour_secs);


	/*
		if lastDate == null || lastDate == undefined
			lastDate = TODAYS_DATE

		console.log(buildOlapSentence(lastDate, TODAYS_DATE, TODAYS_CURR_HOUR));

		get the results, count them

		if( results_count > 0){
			we have new results to add

			// add on DB
		}


		skt.broadcastAll('update_counter_test', results_count);

		lastDate = TODAYS_DATE
	*/



	// OLD ALGORITHM
	// exec olap query
		// if last date != undefined use last date
		// else use last 1 day or something...
	// check if query returns data
	// if so (sync for loop)
		// add each reading
		// in the end, skt.broadcastAll('update_data', last date);
	// last date == new Date(); // now



	// removed the code below because now we count the results of executeOlapSentence
	// skt.broadcastAll('update_counter_test', ctr);
	// ctr++;
}


exports.readIntervalQuery = readIntervalQuery;




var clearLastParentDataCounter = function(){
  var undef;
  lastParent = undef; 
  last_read_readings = 0;
}


exports.clearBackendReadings = function(req, res){
  console.log("clearBackendReadings");
  var aux = cloneObject(lastParent);
  clearLastParentDataCounter();
  res.json(aux);
}




var saveLastDailyProcessDateOnDb = function(projectid, currentDate){
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q1 = "update pollingtimers set lastdailyprocessdate = '"+currentDate+"' WHERE pid_proj = "+projectid;

    console.log("saving: "+currentDate);
    console.log("q1");
    console.log(q1);

    client.query(q1, function(err1, result1){
      if(err1) {
        client.end();
        return console.error('saveLastDailyProcessDateOnDb1 error running query', err1);
      }


      console.log("saved saveLastDailyProcessDateOnDb as " + currentDate);

      client.end();
    });

  });
}


var pg = require('pg');
var config = require('../config.js');
var conString = config.conString;



var saveLastPollingDetails = function(pid, todays_date, todays_curr_hour_secs){
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q1 = "SELECT * FROM pollingtimers WHERE pid_proj = "+pid;
    client.query(q1, function(err1, result1){
      if(err1) {
        client.end();
        return console.error('saveLastPollingDetails1 error running query', err1);
      }

      var q2 = "";
      if(result1.rows.length == 0){
        // we need to add
        q2 = "INSERT INTO pollingtimers(pid_proj, lastdate, lasthoursecs) VALUES ("+pid+", '"+todays_date+"', "+todays_curr_hour_secs+")"
      } else {
        // we need to update
        q2 = "UPDATE pollingtimers SET lastdate = '"+todays_date+"',  lasthoursecs = "+todays_curr_hour_secs+ " WHERE pid_proj = "+pid;
      }

      // console.log(q2);

      client.query(q2, function(err2, result2){
        if(err2) {
          client.end();
          return console.error('saveLastPollingDetails2 error running query', err2);
        }
        console.log("updated pollingtimers");
        client.end();

      });
    });
  });
}



var lastDailyProcessDateObj = {};


exports.getMissingData = function(){
  // NUNOALEX eventually we need to add a column timertype and get by olapdatasource
  // NUNOALEX were getting a pid but well need to handle all project timers!

  // NUNOALEX we need to check if the timer is running!

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q1 = "SELECT * FROM pollingtimers where triggertime is null";
    client.query(q1, function(err1, result1){
      if(err1) {
        client.end();
        return console.error('getMissingData1 error running query', err1);
      }

      client.end();


      // console.log("\n\n\ngetMissingData");
      // console.log(result1.rows);

      for(var i=0; i<result1.rows.length; i++){
        var timer = result1.rows[i];
        // console.log("timer.running");
        // console.log(timer.running);
        if(timer.running == true || timer.running == 't'){
          readIntervalQuery(timer.pid_proj, timer);
          lastDailyProcessDateObj[timer.pid_proj] = timer.lastdailyprocessdate;
        } else {
          console.log("timer for pid " + timer.pid_proj + " is stopped.");
        }
      }

      polling.setInitValues(result1.rows[0]);


    });
  });
}


exports.startStop = function(pid, status){
  console.log("startStop");
  console.log(status);
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q1 = "SELECT * FROM pollingtimers WHERE pid_proj = "+pid;
    client.query(q1, function(err1, result1){
      if(err1) {
        client.end();
        return console.error('savestartStop1 error running query', err1);
      }

      var q2 = "";
      if(result1.rows.length == 0){
        // we need to add
        q2 = "INSERT INTO pollingtimers(pid_proj, running) VALUES ("+pid+", '"+status+"')";
      } else {
        // we need to update
        q2 = "UPDATE pollingtimers SET running = '"+status+ "' WHERE pid_proj = "+pid;
      }

      // console.log(q2);

      client.query(q2, function(err2, result2){
        if(err2) {
          client.end();
          return console.error('savestartStop2 error running query', err2);
        }
        console.log("updated startStop");
        client.end();

      });
    });
  });
}



exports.setIntervalValue = function(pid, interval){
  console.log("setIntervalValue");
  console.log(interval);
  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }

    var q1 = "SELECT * FROM pollingtimers WHERE pid_proj = "+pid;
    client.query(q1, function(err1, result1){
      if(err1) {
        client.end();
        return console.error('setIntervalValue1 error running query', err1);
      }

      var q2 = "";
      if(result1.rows.length == 0){
        // we need to add
        q2 = "INSERT INTO pollingtimers(pid_proj, intervalvalue) VALUES ("+pid+", "+interval+")";
      } else {
        // we need to update
        q2 = "UPDATE pollingtimers SET intervalvalue = "+interval+ " WHERE pid_proj = "+pid;
      }

      // console.log(q2);

      client.query(q2, function(err2, result2){
        if(err2) {
          client.end();
          return console.error('setIntervalValue2 error running query', err2);
        }
        console.log("updated setIntervalValue");
        client.end();

      });
    });
  });
}

exports.syncDate = function(pid, date){
  var sentences = buildOlapSentences(date, date, (6*60*60), (22*60*60));
  console.log(sentences);

  var parent = {"parent": []};
  executeQueryMDXArray(sentences, (6*60*60), parent, true, pid);

}
