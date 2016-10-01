var dataaccess = require('./dataaccess');
var datesutils = require('../datesutils.js');


var findPointValue = function(array, pointid){
	for(var i=0; i<array.length; i++){
		if(array[i].pointid_point == pointid){
			return array[i].valuesjson.f2;
		}
	}
	return 'n/a';
}











// this method assumes that the beginning of the week is Monday
var generateDatePeriods = function(date){
	var to_return = {};

	to_return.today = new Date(date);
	to_return.monday = datesutils.getMonday(new Date(date));
	to_return.firstMonthDay = datesutils.getFirstMonthDay(new Date(date));
	to_return.firstYearDay = datesutils.getFirstYearMonth(new Date(date));

	to_return.today = datesutils.getDateString(to_return.today, true);
	to_return.monday = datesutils.getDateString(to_return.monday, true);
	to_return.firstMonthDay = datesutils.getDateString(to_return.firstMonthDay, true);
	to_return.firstYearDay = datesutils.getDateString(to_return.firstYearDay, true);

	return to_return;
}


var generatePreviousDatePeriods = function(date){
	var to_return = {};

	// o dia da semana actual na semana passada
	// a 2a feira e domingo da semana passada
	// dia 1 e ultimo dia do mes passado
	// dia 1 jan e dia 31 dez do ano passado


	to_return.prev_week_day = datesutils.getWeekDay(new Date(date), 7);
	
	to_return.prev_week_monday = datesutils.getMondayOffset(new Date(date), 7);
	to_return.prev_week_sunday = datesutils.getMondayOffset(new Date(date), 1);

	// console.log(to_return.monday);

	to_return.firstMonthDay = datesutils.getFirstMonthDayOffset(new Date(date), 1);
	var auxFirstMonthDay = datesutils.getFirstMonthDay(new Date(date));
	to_return.lastMonthLastDay = datesutils.getWeekDay(auxFirstMonthDay, 1);
	to_return.todayMonth = datesutils.getTodayMonthOffset(new Date(date), 1);



	to_return.firstYearDay = datesutils.getFirstYearDayOffset(new Date(date), 1);
	to_return.todayYear = datesutils.getTodayYearOffset(new Date(date), 1);


	// to_return.today = datesutils.getDateString(to_return.today, true);
	// to_return.monday = datesutils.getDateString(to_return.monday, true);
	// to_return.firstMonthDay = datesutils.getDateString(to_return.firstMonthDay, true);
	// to_return.firstYearDay = datesutils.getDateString(to_return.firstYearDay, true);

	to_return.prev_week_day = datesutils.getDateString(to_return.prev_week_day, true);
	to_return.prev_week_monday = datesutils.getDateString(to_return.prev_week_monday, true);
	to_return.prev_week_sunday = datesutils.getDateString(to_return.prev_week_sunday, true);
	
	to_return.firstMonthDay = datesutils.getDateString(to_return.firstMonthDay, true);
	to_return.lastMonthLastDay = datesutils.getDateString(to_return.lastMonthLastDay, true);
	to_return.todayMonth = datesutils.getDateString(to_return.todayMonth, true);

	to_return.firstYearDay = datesutils.getDateString(to_return.firstYearDay, true);
	to_return.todayYear = datesutils.getDateString(to_return.todayYear, true);

	return to_return;
}



var hardcodedTrim = function(arr){
	var to_return = new Array();

	for(var i=0; i<arr.length; i++){
		if( arr[i].title != 'Stock Level' && arr[i].title != 'NPS INDEX (HoN)'){
			to_return.push(arr[i]);
		}
	}

	return to_return;
}



var notes = {};
notes["Daily Total"] = "Daily variation represents the percentage variation between the KPI value on current day, compared against the KPI value on the same weekday of last week.";
notes["Weekly Total"] = "Weekly variation represents the percentage variation between the total KPI value on current week, compared against the total KPI value of last week (taking into account the same number of days).";
notes["Monthly Total"] = "Monthly variation represents the percentage variation between the total KPI value on current month, compared against the total KPI value of the same number of days for last month.";
//notes["Annual Total"] = "Annual variation represents the percentage variation between the total KPI value on current year, compared against the total KPI value of the same number of days for last year.";
   

exports.getNotes = function(){
	return notes;
}



exports.generateSummary = function(req, res, pid_proj, forcedailymaildate, callback){
	console.log("summarytrack call: generateSummary");

	var pid = pid_proj;
	if(req != null && req != undefined){
		pid = req.params.pid;
	}

	var the_dates = generateDatePeriods(forcedailymaildate);
	var the_previous_dates = generatePreviousDatePeriods(forcedailymaildate);
	console.log(the_dates);
	console.log(the_previous_dates);

	dataaccess.getKpisAndPointsList(pid, function(result){
		var kpis_list = result.kpis_list;

		// HARDCODED, remove kpis 'Stock Level' and 'NPS INDEX (HoN)'
		kpis_list = hardcodedTrim(kpis_list);
		console.log(kpis_list);

		// console.log("read kpis_list ");
		// console.log(kpis_list);
	
		// get all kpis, for each kpi:
		// get current daily value of each kpi for each store

		for(var i=0; i<kpis_list.length; i++){
			var kpi_title = kpis_list[i].title;
			var processed_kpis = 0;
			var to_results = {};
			to_results.points = {};
			to_results.pointsPrev = {};
			to_results.dailyperiods = {};
			to_results.dailyperiodsPrevious = {};
			to_results.weeklyperiods = {};
			to_results.weeklyperiodsPrevious = {};
			to_results.monthlyperiods = {};
			to_results.monthlyperiodsPrevious = {};
			to_results.annuallyperiods = {};
			to_results.annuallyperiodsPrevious = {};

			// callback hell... grrr
			// the point is that each call to dataaccess will fetch the necessary data for each summary level on the var to_results
			// we can either refactor each call into functions by passing the necessary variables in scope, or use promises
			// also, were not handling error situations...
			dataaccess.getAllPointValues(pid, kpi_title, {"startDate": the_dates.today, "endDate": the_dates.today}, function(n_results, results, kpi_title){
				
				processed_kpis++;
				to_results.points[kpi_title] = results;

				if(processed_kpis == kpis_list.length ){
					// next processing:
					// get daily total, weekly total, monthly total, annual total for each kpi

					// get daily total for each kpi (aggregate all points, channels, cagtegories, etc)
					for(var j=0; j<kpis_list.length; j++){
						var kpi_title = kpis_list[j].title;
						var processed_kpis_b = 0;

						console.log("going for kpi " + kpi_title);


						// TODO: we need to generate the startDate and endDate

						dataaccess.getTotalValueMultiple(pid, kpi_title, {"startDate": the_dates.today, "endDate": the_dates.today},
																		 {"startDate": the_previous_dates.prev_week_day, "endDate": the_previous_dates.prev_week_day}, function(results, kpi_title){
							to_results.dailyperiods[kpi_title] = results.values;
							to_results.dailyperiodsPrevious[kpi_title] = results.values_b;
							processed_kpis_b++;
							if(processed_kpis_b == kpis_list.length ){

								// get weekly total for each kpi (aggregate all points, channels, cagtegories, etc)
								for(var k=0; k<kpis_list.length; k++){
									var kpi_title = kpis_list[k].title;
									var processed_kpis_c = 0;

									console.log("going for kpi " + kpi_title);

									dataaccess.getTotalValueMultiple(pid, kpi_title, {"startDate": the_dates.monday, "endDate": the_dates.today}, 
																					 {"startDate": the_previous_dates.prev_week_monday, "endDate": the_previous_dates.prev_week_day}, function(results, kpi_title){
										to_results.weeklyperiods[kpi_title] = results.values;
										to_results.weeklyperiodsPrevious[kpi_title] = results.values_b;
										processed_kpis_c++;
										if(processed_kpis_c == kpis_list.length){

											// get monthly total for each kpi (aggregate all points, channels, cagtegories, etc)
											for(var l=0; l<kpis_list.length; l++){
												var kpi_title = kpis_list[l].title;
												var processed_kpis_d = 0;

												console.log("going for kpi " + kpi_title);

												dataaccess.getTotalValueMultiple(pid, kpi_title, {"startDate": the_dates.firstMonthDay, "endDate": the_dates.today},
																								 {"startDate": the_previous_dates.firstMonthDay, "endDate": the_previous_dates.todayMonth}, function(results, kpi_title){
													to_results.monthlyperiods[kpi_title] = results.values;
													to_results.monthlyperiodsPrevious[kpi_title] = results.values_b;
													processed_kpis_d++;
													if(processed_kpis_d == kpis_list.length){

														// get annual total for each kpi (aggregate all points, channels, cagtegories, etc)
														for(var m=0; m<kpis_list.length; m++){
															var kpi_title = kpis_list[m].title;
															var processed_kpis_e = 0;

															console.log("going for kpi " + kpi_title);

															dataaccess.getTotalValueMultiple(pid, kpi_title, {"startDate": the_dates.firstYearDay, "endDate": the_dates.today},
																											 {"startDate": the_previous_dates.firstYearDay, "endDate": the_previous_dates.todayYear}, function(results, kpi_title){
																to_results.annuallyperiods[kpi_title] = results.values;
																to_results.annuallyperiodsPrevious[kpi_title] = results.values_b;
																processed_kpis_e++;

																var p1, p2;
																if(processed_kpis_e == kpis_list.length){

																	for(var n=0; n<kpis_list.length; n++){
																		var kpi_title = kpis_list[n].title;
																		var processed_kpis_f = 0;

																		console.log("going for kpi " + kpi_title);

																			dataaccess.getAllPointValues(pid, kpi_title, {"startDate": the_previous_dates.prev_week_day, "endDate": the_previous_dates.prev_week_day}, function(n_results, results, kpi_title){
																				
																				processed_kpis_f++;
																				to_results.pointsPrev[kpi_title] = results;

																					var p1, p2;
																					if(processed_kpis_f == kpis_list.length){
																						// ir nivelando e traduzindo os pointid usando translatePointId(result.points_list)

																						// ir buscar os pontos
																						// e dps nivelar para criar as 2 tabelas

																						console.log("\n\npoints_list");
																						console.log(result.points_list);
																						to_results.points_list = result.points_list;

																						// 2 matrizes

																						// uma com KPIs nas colunas e periodos temporais nas linhas
																						// outra com KPIs nas colunas e pontos nas linhas
																						var matrixPoints = new Array();
																						var matrixPointsPrev = new Array();
																						var matrixPointsVar = new Array();

																						if(result.points_list != null){
																							for(var g=0; g<result.points_list.length; g++){
																								var row = new Array();
																								var rowPrev = new Array();
																								var rowVar = new Array();
																								var header = new Array();
																								var point = result.points_list[g];
																								row.push(point.attr);
																								rowPrev.push(point.attr);
																								rowVar.push(point.attr);
																								header.push('Attribute');

																								for(var h=0; h<kpis_list.length; h++){
																									var kpi = kpis_list[h].title;

																									if(g == 0 && kpi == 'NPS INDEX (HoN)')
																									{
																										p1 = h;
																										continue;
																									}
						
																									else if( g == 0 && kpi == 'Stock Level')
																									{
																										p2 = h;
																										continue;
																									}

																									else if (g==0) header.push(kpi);
																									
																									if( h == p1 || h == p2)
																										continue;																		

																									var val = findPointValue(to_results.points[kpi], point.pointid);
																									row.push(val);
																									var valPrev = findPointValue(to_results.pointsPrev[kpi], point.pointid);
																									rowPrev.push(valPrev);
																									if(valPrev == 0 || val == 'n/a' || valPrev == 'n/a'){
																										var valVar = 'n/a';
																										rowVar.push(valVar);

																									} else {
																										var valVar = ((val - valPrev)/Math.abs(valPrev))*100;
																										rowVar.push(valVar);
																									}
																									
																								}

																								if(g==0){
																									matrixPoints.push(header);
																									matrixPointsPrev.push(header);
																									matrixPointsVar.push(header);
																								}
																								matrixPoints.push(row);
																								matrixPointsPrev.push(rowPrev);
																								matrixPointsVar.push(rowVar);
																							}
																							
																						}

																						to_results.matrixPoints = matrixPoints;
																						to_results.matrixPointsPrev = matrixPointsPrev;
																						to_results.matrixPointsVar = matrixPointsVar;


																						// matrixTimePeriods

																						// icon row

																						var headerIcons = new Array();
																						headerIcons.push("Icons");

																						for(var i = 0; i < kpis_list.length; i++){

																							if( i == p1 || i == p2)
																								continue;

																							var icon = kpis_list[i].icons;

																							//console.log("icons", icon)
																						
																							if(icon.hasOwnProperty(kpis_list[i].title))
																								headerIcons.push(icon[kpis_list[i].title]);
																							
																						}

																						// header

																						var header2 = new Array();
																						header2.push("Time Period");

																						if(result.points_list != null){
																							for(var g=0; g<result.points_list.length; g++){
																							
																								for(var h=0; h<kpis_list.length; h++){

																									if( h == p1 || h == p2)
																										continue;

																									var kpi = kpis_list[h].title;
																									var unit = kpis_list[h].unit;
																									
																									if(g==0){
																										if(unit == 'customers'){
																											header2.push(kpi);
																										} else {
																											header2.push(kpi + ' (' + unit + ')' );
																										}
																									}
																								}
																							}
																						}

																						// daily

																						var dailyrow = new Array();
																						dailyrow.push("Daily Total");

																						var calculateVariation = function(val, prev){
																							var a = +val;
																							var b = +prev;
																							return ( (a - b) / Math.abs(b) ) * 100;
																						}

																				
																						for(var i = 0; i < kpis_list.length; i++){

																							if( i == p1 || i == p2)
																								continue;
																						
																							if(to_results.dailyperiods.hasOwnProperty(kpis_list[i].title)){
																								dailyrow.push([to_results.dailyperiods[kpis_list[i].title][0].values,
																									calculateVariation(to_results.dailyperiods[kpis_list[i].title][0].values,
																													   to_results.dailyperiodsPrevious[kpis_list[i].title][0].values) ]);
																							}
																							
																						}

																						// weekly
																						var weeklyrow = new Array();
																						weeklyrow.push("Weekly Total");

																						for(var i = 0; i < kpis_list.length; i++){

																							if( i == p1 || i == p2)
																								continue;

																							if(to_results.weeklyperiods.hasOwnProperty(kpis_list[i].title)){
																								weeklyrow.push([to_results.weeklyperiods[kpis_list[i].title][0].values,
																									calculateVariation(to_results.weeklyperiods[kpis_list[i].title][0].values,
																													   to_results.weeklyperiodsPrevious[kpis_list[i].title][0].values) ]);
																							}
																							
																						}

																						// monthly

																						var monthlyrow = new Array();
																						monthlyrow.push("Monthly Total");

																						for(var i = 0; i < kpis_list.length; i++){

																							if( i == p1 || i == p2)
																								continue;

																							if(to_results.monthlyperiods.hasOwnProperty(kpis_list[i].title)){
																								monthlyrow.push([to_results.monthlyperiods[kpis_list[i].title][0].values,
																									calculateVariation(to_results.monthlyperiods[kpis_list[i].title][0].values,
																													   to_results.monthlyperiodsPrevious[kpis_list[i].title][0].values) ]);
																							}
																							
																						}

																						// annually

																						var annuallyrow = new Array();
																						annuallyrow.push("Annual Total");

																						for(var i = 0; i < kpis_list.length; i++){

																							if( i == p1 || i == p2)
																								continue;
																						
																							if(to_results.annuallyperiods.hasOwnProperty(kpis_list[i].title)){
																								annuallyrow.push([to_results.annuallyperiods[kpis_list[i].title][0].values,
																									calculateVariation(to_results.annuallyperiods[kpis_list[i].title][0].values,
																													   to_results.annuallyperiodsPrevious[kpis_list[i].title][0].values) ]);
																							}
																							
																						}

																						var matrixTimePeriods = new Array();
																						matrixTimePeriods.push(headerIcons);
																						matrixTimePeriods.push(header2);
																						matrixTimePeriods.push(dailyrow);
																						matrixTimePeriods.push(weeklyrow);
																						matrixTimePeriods.push(monthlyrow);
																						matrixTimePeriods.push(annuallyrow);

																						to_results.matrixTimePeriods = matrixTimePeriods;

																						to_results.the_dates = the_dates;
																						to_results.the_previous_dates = the_previous_dates;

																						if(res != undefined && res != null){
																							res.json(to_results);
																						} else {
																							if (typeof callback === "function") {
																								callback(to_results);
																							}
																						}
																					}
																				});

																			}

																}
															});
														}
													}
												});
											}
										}
									});
								}
							}
						});
					}

				}

			})
			
		}


		

		// res.json({});
	})

}


exports.getTimePeriod = function(periodString, dates, prefix, suffix, delimiter){
	switch(periodString){
		case 'Daily Total':
			return prefix + dates.today + suffix;
		case 'Weekly Total':
			return prefix + dates.monday + " " + delimiter + " " + dates.today + suffix;
		case 'Monthly Total':
			return prefix + dates.firstMonthDay + " " + delimiter + " " + dates.today + suffix;
		case 'Annually Total':
		case 'Annual Total':
			return prefix + dates.firstYearDay + " " + delimiter + " " + dates.today + suffix;
		default:
			return '';
	}
}
