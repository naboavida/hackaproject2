var pg = require('pg');
var config = require('../config.js');
var conString = config.conString;
var dataaccess = require('./dataaccess/dataaccess.js');
var datesutils = require('./datesutils.js');



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
        return console.error('metadataaccess.runQuery error running query', err);
      }

      if (typeof callback === "function") {
        callback(result.rows);
      }
      // else should return an error

      client.end();
    });

  });
}



// main module methods

exports.getMinAndMaxDate = function(req, res){
  console.log("API call: getMinAndMaxDate");

  var pid = req.params.pid;

  var client = new pg.Client(conString);

  client.connect(function(err) {

      if(err) {
        return console.error('could not connect to postgres', err);
      }

      var q = "select to_date(max(rd->>'timestamp'), 'YYYY MM DD') as max, to_date(min(rd->>'timestamp'), 'YYYY MM DD') as min from indicators, json_array_elements(readings) as rd where pid_proj =" + pid;
      
      client.query(q, function(err, result) {

          if(err) {
            client.end();
            res.json({});
            return console.error(' error running query', err);
          }

          res.json(result.rows);
          client.end();
      });  
  });
}

exports.getAllReadingsDates = function(pid, callback){
	// var q = "select distinct to_date(c->>'timestamp', 'YYYY-MM-DD') as date from indicators, json_array_elements(readings) as c where pid_proj = "+pid+" order by to_date(c->>'timestamp', 'YYYY-MM-DD')";
	var q = "select distinct to_date(c->>'timestamp', 'YYYY-MM-DD') as date, count(*) from indicators, json_array_elements(readings) as c where pid_proj = "+pid+" group by to_date(c->>'timestamp', 'YYYY-MM-DD') order by to_date(c->>'timestamp', 'YYYY-MM-DD')";
	var q = "select distinct c->>'timestamp' as date, count(*) from indicators, json_array_elements(readings) as c where pid_proj = "+pid+" group by c->>'timestamp' order by c->>'timestamp'";

	runQuery(q, function(rows){
		if (typeof callback === "function") {
			callback(rows);
		}
	})
}


exports.getLastDate = function(pid, wid, callback){
  var q = "select max(c->>'timestamp') as date from indicators, json_array_elements(readings) as c where pid_proj = "+pid
  + "  and title = (select distinct title from widgets where wid = " + wid + ")";

  runQuery(q, function(rows){
    if (typeof callback === "function") {
      callback(rows);
    }
  })
}








exports.getMetaLevels = function(req, res){
  console.log("metadataaccess CALL: getMetaLevels");
  var pid = req.params.pid;
  var kpi_title = "";

  if(req.body.hasOwnProperty('kpi_title')){
    kpi_title = req.body.kpi_title;
  }

  var toReturn = {};
  toReturn.metaLevels = new Array();

  runQuery('select get_meta_levels('+pid+') as meta_levels;', function(rows){
    // console.log(rows);
    if(rows.length > 0 && rows[0].hasOwnProperty('meta_levels') && rows[0]["meta_levels"] != null){
      var arr = rows[0]["meta_levels"];
      // toReturn.meta_levels = arr;

      var ctr = 0;
      var maxCtr = arr.length;

      for(var i=0; i<arr.length; i++){
        // console.log(arr[i]);

        var q = "select distinct c->>'"+arr[i]+"' as "+arr[i]+" from indicators, json_array_elements(readings) as c where pid_proj = "+pid;
        if(kpi_title != ""){
          q += " and title = '" + kpi_title + "';";
        }

        runQuery(q, function(rows2){
          ctr++;
          // console.log(rows2);

          var obj = {
            label: "",
            data: []
                  
          };

          if(rows2.length > 0){

            for(var j=0; j<rows2.length; j++){
              
              if(j==0){
                for(var prop in rows2[0]){
                  if(rows2[0].hasOwnProperty(prop)){
                    obj.label = prop;
                  }
                }
              }

              obj.data.push({"id": j, "label": rows2[j][obj.label], "hide": false, "temp": {} });
            }
          }
          toReturn.metaLevels.push(obj);

          if(ctr == maxCtr){
            // res.json(toReturn);
            getMetaLevelsOrder(pid, arr, toReturn, res);
          }
        })

      }
    } else {
      res.json(toReturn);
    }

  });
  

  /*
  TODO: get the distinct records so we can build the hierarchy network
  
select distinct (c->>'product',
 c->>'promoter', 
 c->>'category')
  from indicators, json_array_elements(readings) as c 
  where pid_proj = 107

  */
}



exports.setMetaLevels = function(req, res){
  console.log("metadataaccess internal call: setMetaLevels");
  
  var pid = req.params.pid;
  var levels = req.body;

  var q = "update projects set levelsmetadata = '"+JSON.stringify(levels)+"'::json where pid = "+pid+" returning levelsmetadata;";

  runQuery(q, function(rows){
    console.log("metadataaccess internal call: done update " + rows.length);
    res.json({});
  })

}



var getMetaLevelsOrder = function(pid, levels, toReturn, res){
  console.log("metadataaccess internal call: getMetaLevelsOrder");
  
  var attributesStr = "";
  var attributesStrNamed = "";

  // TODO!!! this is hardcoded to simulate a previous configuration by the user
  // levels = ["promoter", "category", "product"];

  for(var i=0; i<levels.length; i++){
    attributesStrNamed += "c->>'"+levels[i]+"' as "+levels[i]+" ";
    attributesStr += "c->>'"+levels[i]+"'";
    if(i < levels.length-1){
      attributesStr += ",";
      attributesStrNamed += ",";
    }
    attributesStr += " ";
    attributesStrNamed += " ";
  }


  var q = "select distinct ("+attributesStr+") as row" +
  " from indicators, json_array_elements(readings) as c " +
  " where pid_proj = " + pid;

  runQuery(q, function(rows){
    var auxHierarchy = buildierarchy(rows);

    toReturn.hierarchy = auxHierarchy;
    toReturn.levels = levels;


    res.json(toReturn);
  });

}




var buildierarchy = function(rows){
  var toRet = [
      {
          "promoter": "Alex",
          "childs": [
              {
                  "category": "Cereals",
                  "childs": []
              },
              {
                  "category": "Yogurts",
                  "childs": []
              }
          ]
      },
      {
          "promoter": "Jack",
          "childs": [
              {
                  "category": "Cereals",
                  "childs": []
              }
          ]
      }
  ];

  var levelsTree = {};

  // tokenize each row (on comma) but watchout if someone has a comma on a product for example
  for(var j=0; j<rows.length; j++){
    var record = rows[j].row;
    record = record.slice(1, record.length-1);
    record = record.replace(/["]/g, '');
    var tokens = record.split(",");

    levelsTreeInsertRecord(levelsTree, tokens, 0);

  }

  // childsBelow(levelsTree, tokens);
  // console.log("done levelsTreeInsertRecord");

  return levelsTree;
}



var levelsTreeInsertRecord = function(tree, levels, nLevel){

  if(levels != null && levels != undefined && levels.length > 0){
    var currTree = tree;
    var currLevel = levels.shift();
    var childTree = upsertAndGetChilds(currTree, currLevel);
    levelsTreeInsertRecord(childTree, levels, nLevel + 1);
  } else {
    return;
  }

}

var upsertAndGetChilds = function(tree, levelValue){
  var found = false;

  for(var v in tree){
    if(tree.hasOwnProperty(v)){
      if(v == levelValue){
        // DO NOTHING but return its childs
        found = true;
        return tree[v];
      }
    }
  }

  if(!found){
    tree[levelValue] = {};
    return tree[levelValue];
  }
}


// var upsertAndGetChilds = function(tree, levelValue){
//   var found = false;

//   for(var v in tree){
//     if(tree.hasOwnProperty(v)){
//       if(v == levelValue){
//         // DO NOTHING but return its childs
//         found = true;
//         // tree[v].parentCount++;
//         return tree[v].childs;
//       }
//     }
//   }

//   if(!found){
//     tree[levelValue] = {"parentCount": 1, "childs": {} };
//     return tree[levelValue].childs;
//   }
// }



exports.getProjectIndicators = function(req, res){
  console.log("metadataaccess CALL: getProjectIndicators");
  var pid = req.params.pid;

  dataaccess.getKpisList(pid, function(result){
    res.json(result);
  })

}



exports.getPointsNames = function(req, res){
  console.log("metadataaccess CALL: getPointsNames");
  var q = "select get_point_name(pointid) as name, pointid from points where pid_proj = " + req.params.pid;

  runQuery(q, function(result){
    res.json(result);
  });
}




exports.saveReport = function(req, res){
  console.log("metadataaccess CALL: saveReport");
  var pid = req.params.pid;
  var obj = req.body;
  var query = "";

  if(obj.id == null || obj.id == undefined){
    // its an insert
    //obj.creationDate = datesutils.getDateString(new Date(), true);
    obj.info.creationDate = new Date();
    obj.info.updateDate = "";
    query = "insert into reports(pid_proj, report) values ("+pid+", '"+JSON.stringify(obj)+"'::json) RETURNING rid, pid_proj, report";
  } else {
    obj.info.updateDate = new Date();
    query = "UPDATE reports SET report='"+JSON.stringify(obj)+"'::json WHERE rid = "+obj.id+" and pid_proj = "+pid+"  RETURNING rid, pid_proj, report;";
  }

  if(query != ""){
    runQuery(query, function(result){
      res.json({"status": "OK", "result": result});
    });
  } else {
    res.json({"status": "NOK"});
  }

}


exports.getReports = function(req, res){
  console.log("metadataaccess CALL: getReports");
  var pid = req.params.pid;
  var rid = req.params.rid;

  var query = "select * from reports where pid_proj = " + pid;
  if(rid != undefined){
    query += " and rid = " + rid;
  }

  runQuery(query, function(result){
    res.json({"status": "OK", "result": result});
  });
  
}



exports.setStoreMapping = function(req, res){
  console.log("metadataaccess CALL: setStoreMapping");
  var pointid = req.params.pointid;
  var pack = req.body;

  var query = "update points set xlsxmapping='"+JSON.stringify(pack)+"'::json where pointid = " + pointid + " RETURNING xlsxmapping;";
  runQuery(query, function(result){
    res.json({"status": "OK", "result": result});
  });
}



exports.getDataSources = function(req, res){
  console.log("metadataaccess CALL: getDataSources");
  var pid = req.params.pid;

  var query = "select xlsxmapping from points where pid_proj = " + pid + " and xlsxmapping is not null";
  runQuery(query, function(result){
    res.json(result);
  });
}


exports.deleteDataSource = function(req, res){
  console.log("metadataaccess CALL: deleteDataSource");
  var pid = req.params.pid;
  var pointid = req.params.pointid;

  var query = "update points set xlsxmapping = null where pid_proj = "+pid+" and pointid = "+pointid+" and xlsxmapping is not null";

  runQuery(query, function(result){
    res.json(result);
  });
}
