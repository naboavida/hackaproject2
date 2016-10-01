var dataaccess = require('./dataaccess');
var metadataaccess = require('../metadataaccess.js');
var datesutils = require('../datesutils.js');
var objectivesdata = require('./objectivesdata.js');

var pg = require('pg');
var config = require('../../config.js');
var conString = config.conString;

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




exports.getPointRankingByTitle = function(req, res){
   console.log("Report API call: getPointRankingByTitle");

   var pid = req.params.pid;
   var kpi_title = req.body.KPIs[0].label;
   var filter = req.body;

   var aggrmethod = req.body.KPIs[0].aggrmethod;

  //  if(req.body.dates != null && req.body.dates != undefined){
  //      if(req.body.dates.hasOwnProperty('state') && req.body.dates.state == true){
  //          filter.startDate = req.body.dates.startDate;
  //          filter.endDate = req.body.dates.endDate;
  //      }
  //  }

  // if(req.body.stores != null && req.body.stores != undefined){
  //   if(req.body.stores.length > 0){
  //     filter.points = req.body.stores.toString();
  //   }
  // }

  console.log("xAxis: " + filter.chart.xAxis); // categorias de colunas ou datapoints(datas)
  console.log("series: " + filter.chart.series); // series

  if(filter.chart.series == null || filter.chart.series == undefined || filter.chart.series == ""){
    // no series was selected, so aggregate the results on each xAxis category result
    dataaccess.getChartData(pid, kpi_title, aggrmethod, filter, function(length, result, title){
      var toReturn = [{"name": "All", "data": result}];
       res.json(toReturn);
    });
  } else {
    // all series are at filter[filter.chart.series]
    var metaSeries = filter["meta_"+filter.chart.series];
    var toReturn = [];

    for(var i=0; i<metaSeries.length; i++){
      var auxSeries = metaSeries[i];
      var auxFilter = cloneObject(filter);

      if(filter.chart.series == 'stores'){
          auxFilter[filter.chart.series] = [auxSeries.pointid];
          auxFilter.seriesName = auxSeries.label;
      } else {
          auxFilter[filter.chart.series] = [auxSeries];
          auxFilter.seriesName = auxSeries;
      }
      
      
      dataaccess.getChartData(pid, kpi_title, aggrmethod, auxFilter, function(length, result, title, seriesName){
        toReturn.push({"name": seriesName, "data": result});
        if(toReturn.length == metaSeries.length){
          res.json(toReturn);
        }
      });
    }

    if(metaSeries.length == 0){
      var toReturn = [{"name": "no data for this filter...", "data": []}];
       res.json(toReturn);
    }
  }
}

exports.deleteReport = function(req, res){
    console.log("API call: deleteReport");

    var pid = req.params.pid;
    var rid = req.params.rid;

    var client = new pg.Client(conString);

    client.connect(function(err) {

        if(err) {
          return console.error('could not connect to postgres', err);
        }

        var q = "delete from reports where pid_proj = " + pid + " and rid = " + rid; 

        client.query(q, function(err, result) {

            if(err) {
              client.end();
              res.json({});
              return console.error('error running query', err);
            }

            res.json(result.rows[0]);
            client.end();
        });  
    });
}