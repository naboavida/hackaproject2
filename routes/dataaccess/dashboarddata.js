var dataaccess = require('./dataaccess');
var metadataaccess = require('../metadataaccess.js');
var datesutils = require('../datesutils.js');
var objectivesdata = require('./objectivesdata.js');
var moment = require('moment');







exports.getHistoryTotal = function(req, res){
    console.log("dashboarddata API call: getHistoryTotal");

    var pid = req.params.pid;
    var kpi_title = req.body.title;
    var filter = req.body;
    var aggrmethod = req.body.aggrmethod;

    dataaccess.getChartData(pid, kpi_title, aggrmethod, filter, function(length, result, title){

       res.json(result);
    });

}


exports.getPointRanking = function(req, res){
	console.log("dashboarddata API call: getPointRanking");
	var pid = req.params.pid;
	var wid = req.params.wid;
	var filter = {};

	if(req.body != null && req.body != undefined){
		if(req.body.dates.hasOwnProperty('state') && req.body.dates.state == true){
			filter.startDate = req.body.dates.startdate;
			filter.endDate = req.body.dates.finishdate;
		}
		if(req.body.points.length > 0){
			filter.points = req.body.points.toString();
		}
	}

	// missing filter
	// filter.points.length > 0
	// filter.points[0]  --> id::number

	dataaccess.getKpiTitleByWid(pid, wid, function(kpi_title, aggrmethod){
		

		if(kpi_title != null){
			dataaccess.getAllPointRanking(pid, kpi_title, aggrmethod, filter, function(length, result, title){
				// console.log("result");
				// console.log(result);
				res.json(result);
			})
		} else {
			res.json([]);
		}


	})

}

// returns an array of objects
// each object has a point with respective kpis and values

exports.getPointsMatrix = function(req, res) {
    console.log("dashboarddata API call: getPointsMatrix");

    var pid = req.params.pid;
    var filter = {};

    if (req.body != null && req.body != undefined) {
    	if(req.body.dates.hasOwnProperty('state') && req.body.dates.state == true)
    	{
    		filter.startDate = req.body.dates.startdate;
        	filter.endDate = req.body.dates.finishdate;	
    	}
    }

    to_results = {};

    var kpis_list = {}
    var points_list = {};

    var wid = "";
    
    var kpis_list = {};
    var points_list = {}

    var points = {};
    
    var processed_kpis = 0;
    var processed_wids = 0;

    dataaccess.getKpisAndPointsList(pid, function(result) {
        kpis_list = result.kpis_list;
        points_list = result.points_list;
  
        for (var i = 0; i < kpis_list.length; i++) {

            dataaccess.getAllWid(pid, function(result){

                wid_list = result;
                processed_kpis++;

                if (processed_kpis == kpis_list.length) {

                    for (var i = 0; i < wid_list.length; i++) {

                        wid = wid_list[i].wid;

                        dataaccess.getKpiTitleByWid(pid, wid, function(kpi_title, aggrmethod){

                            if(kpi_title != null){
                                dataaccess.getAllPointRanking(pid, kpi_title, aggrmethod, filter, function(length, result, title){
                                 
                                    points[title] = result;

                                    processed_wids++;

                                    if (processed_wids == wid_list.length) {

                                        var matrixPoints = new Array();

                                            for (var g = 0; g < points_list.length; g++) {

                                                var point = points_list[g];
                                                var row = {};
                                                row.label = point.attr;

                                                for (var h = 0; h < kpis_list.length; h++) {

                                                    var kpi = kpis_list[h].title;
                                                    var val = findPointValue(points[kpi], point.pointid);
                                                    row[kpi] = val;
                                                }
                                                
                                                matrixPoints.push(row);
                                            }
                                                            
                                        to_results.matrixPoints = matrixPoints;
                                        res.json(to_results);
                                    }
                                })

                            } else {
                                res.json([]);
                            }

                        })
                    }
                }
            })
        }
    })
}

// auxiliar functions

var findPointValue = function(array, pointid) {
    for (var i = 0; i < array.length; i++) {

        if (array[i].pointid_point == pointid) {
            return +array[i].value;
        }
    }
    return '-';
}



exports.getComparingIntervalsValues = function(pid, widget, filter, callback){
    var localWidget = widget; // wont we nned a cloneObject?

    localWidget.homologousValue = 990;
    localWidget.objectiveValue = 990;
    // instead we should get the homologous periodvalue by accessing dataaccess
    // then obtain the objective value also, we need to create that api method somewhere

    if(filter == null || (!filter.hasOwnProperty('startDate') && !filter.hasOwnProperty('endDate'))){
        metadataaccess.getLastDate(pid, widget.wid, function(date){
            var date = new Date(date[0].date);
            //date = datesutils.getWeekDay(date, 7);
            var filterObject = {};
            //filterObject.startDate = datesutils.getDateString(date, true);
            //filterObject.endDate = filterObject.startDate;

            filterObject.startDate = moment(date).subtract(7, 'days').format('YYYY-MM-DD');
            filterObject.endDate = filterObject.startDate;
            filterObject.aggrmethod = widget.aggrmethod;

            dataaccess.getTotalValue(pid, widget.title, filterObject, function(value, title){
                localWidget.homologousValue = value[0].values;

                if (typeof callback === "function") {
                    callback(localWidget);
                }
            });
        });
    } else {
        var filterObject = {};
        var startDate = moment(filter.startDate);
        var endDate = moment(filter.endDate)
        //filterObject.startDate = datesutils.getDateString(datesutils.getWeekDay(filter.startDate, 7), true);
        //filterObject.endDate = datesutils.getDateString(datesutils.getWeekDay(filter.endDate, 7), true);

        filterObject.aggrmethod = widget.aggrmethod;

        if(startDate == endDate) {
            filterObject.startDate = moment(startDate).subtract(7, 'days').format('YYYY-MM-DD');
            filterObject.endDate = filterObject.startDate;
        } 

        else {
             var number = (endDate.diff(startDate, 'days')) + 1 ;

            filterObject.startDate = startDate.subtract(number, 'days').format('YYYY-MM-DD');
            filterObject.endDate = endDate.subtract(number, 'days').format('YYYY-MM-DD');
        }
       

        console.log("original date " + filter.startDate + " " + filter.endDate + " || " + filterObject.startDate + " " + filterObject.endDate);

        dataaccess.getTotalValue(pid, widget.title, filterObject, function(value, title){
            localWidget.homologousValue = value[0].values;

            if (typeof callback === "function") {
                callback(localWidget);
            }
        });
    }




    // metadataaccess.getLastDate(pid, widget.wid, function(date){
    //     var date = new Date(date[0].date);
    //     date = datesutils.getWeekDay(date, 7);
    //     var filterObject = {};
    //     filterObject.startDate = datesutils.getDateString(date, true);
    //     filterObject.endDate = filterObject.startDate;

    //     dataaccess.getTotalValue(pid, widget.title, filterObject, function(value, title){
    //         localWidget.homologousValue = value[0].values;

    //         objectivesdata.getObjectives(pid, widget.title, [], function(objectives){

    //             objectivesdata.extractObjectives(widget.title, objectives, function(value){
    //                 if(value != null){
    //                     localWidget.objectiveValue = value;
    //                 }

    //                 if (typeof callback === "function") {
    //                   callback(localWidget);
    //                 }
                    
    //             });
                
    //         });

    //     });
    // });

}

function getVariatonsDates(filter) {

    var max = moment(filter.maxMinDates.max);
    var min = moment(filter.maxMinDates.min);

    var startDate = moment(filter.startDate);
    var endDate = moment(filter.endDate);

    var startDateLastYear = moment(filter.startDate).subtract(1, 'year')
    var endDateLastYear = moment(filter.endDate).subtract(1, 'year')

    if((startDateLastYear >= min && startDateLastYear <= max) && (endDateLastYear >= min && endDateLastYear <= max)) {

        xfilter.variationsDates.min = startDateLastYear.format('YYYY-MM-DD')
        xfilter.variationsDates.max = endDateLastYear.format('YYYY-MM-DD')
    }

    else {
        var number = (startDate.diff(endDate, 'days')) + 1 ;

        xfilter.variationsDates.min = startDate.subtract(number, 'days').format('YYYY-MM-DD'),
        xfilter.variationsDates.max = endDate.subtract(number, 'days').format('YYYY-MM-DD')
    }
}


