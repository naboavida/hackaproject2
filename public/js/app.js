'use strict';

// Declare app level module which depends on filters, and services
// angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'nvd3ChartDirectives', 'leaflet-directive', 'ui.calendar', 'btford.socket-io', 'angulartics', 'angulartics.mixpanel']).
angular.module('myApp', ['ngRoute', 'myApp.filters', 'myApp.services', 'myApp.directives', 'nvd3ChartDirectives', 'leaflet-directive', 'ui.calendar', 'btford.socket-io', 'ui.select2', 'ui.bootstrap', 'growlNotifications', 'highcharts-ng', 'datePicker']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      // when('/', {
      //   templateUrl: 'partials/projects',
      //   controller: ProjectsCtrl
      // }).
      when('/login', {
        templateUrl: 'partials/login',
        controller: NavBarCtrl 
      }).
      when('/projects', {
        templateUrl: 'partials/projects',
        controller: ProjectsCtrl,
          resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              }
            } 
      }).
      when('/addProject', {
        templateUrl: 'addProject',
        controller: ProjectsCtrl,
          resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              }
            } 
      }).
      when('/addWidget/:pid/:pointid', {
        templateUrl: 'partials/addPointWidget',
        controller: DashboardPointCtrl,
          resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
            Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
            }
          }      
      }).
      when('/addIndicator/:pid', {
        templateUrl: 'partials/addWidget',
        controller: DashboardCtrl,
          resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
            Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
              .then(function(response){
                console.log("occurrences response.data");
                console.log(response.data);
                return response.data;
              });
            } 
          }        
      }).
      when('/addPointTemplate/:pid', {
        templateUrl: 'partials/addPointTemplate',
        controller: DemoAddPointController
      }).
      when('/data/:pid/:pointid', {
        templateUrl: 'partials/dataPoint',
        controller: DashboardPointCtrl,
        resolve: {
          Profile : function($route, $http){
            return $http.get('/api/userProfile')
                .then(function(response){
                  console.log(response.data);
                return response.data;
              });
            },
            Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
            }
        }
      }).
      when('/widget/:pid/:wid/:pointid', {
        templateUrl: 'partials/widgetPoint',
        controller: WidgetCtrl,
        resolve: {
          Profile : function($route, $http){
            return $http.get('/api/userProfile')
            .then(function(response){
            console.log(response.data);
            return response.data;
            });
          },
          Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
          },
          selectedAttrs : function($route) {
            var pointid = $route.current.params.pointid;
            // console.log("POINT ID is " + pointid);
            return {pointid: pointid};
            // return {name: 'Hospital B'};
          }
        }
      }).
      when('/widget/:pid/:wid', {
        templateUrl: 'partials/widget',
        controller: WidgetCtrl,
        resolve: {
          Profile : function($route, $http){
            return $http.get('/api/userProfile')
            .then(function(response){
            console.log(response.data);
            return response.data;
            });
          },
          Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
          },
          selectedAttrs : function($route) {
            var pointid = $route.current.params.pointid;
            // console.log("POINT ID is " + pointid);
            return {pointid: pointid};
            // return {name: 'Hospital B'};
          }
        }
      }).
      when('/dashboard/:pid/:pointid', {
        templateUrl: 'partials/dashboardPoint',
        controller: DashboardCtrl,
          resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
            Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
            }
          }
      }).
      when('/dashboard/:pid', {
        templateUrl: 'partials/dashboard',
        controller: DashboardCtrl,
          resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
            Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
            }
          }
      }).
      when('/data/:pid', {
        templateUrl: 'partials/data',
        controller: DashboardCtrl,
        resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
            Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
            }
            }
      }).
      when('/config/:pid', {
        templateUrl: 'partials/config',
        controller: ConfigCtrl,
        resolve: {
          Names : function($route, $http){
              // return { indicatorNames: [ 'happiness', 'basket', 'revenue' ], attributeNames: [ 'cam', 'accessibility' ] };
              console.log("query");
              console.log('/api/names/'+$route.current.params.pid);
              return $http.get('/api/names/'+$route.current.params.pid)
                .then(function(response){
                  return response.data;
                });
          },
          Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
          Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
          }
        }
      }).
      when('/addPoint/:pid', {
        templateUrl: 'partials/addPoint',
        controller: DashboardCtrl,
          resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
            Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
            }
          }        
      }).
      when('/editPoint/:pid/:pointid', {
        templateUrl: 'partials/editPoint',
        controller: EditPointController,
                  resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
            Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
            }
 
          } 
      }).
      when('/indicator/:pid/:iid', {
        templateUrl: 'partials/indicator',
        controller: IndicatorCtrl,
         resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
           Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
          }
 
        } 
      }).
      when('/indicator/:pid/:iid/:pointid', {
        templateUrl: 'partials/indicatorPoint',
        controller: IndicatorPointCtrl,
          resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
           Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
            }
 
          } 
      }).
      when('/editIndicator/:pid/:iid/:pointid', {
        templateUrl: 'partials/editIndicator',
        controller: EditIndicatorCtrl,
          resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
           Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
            }
 
          } 
      }).
      when('/editIndicator/:pid/:iid', {
        templateUrl: 'partials/editIndicator',
        controller: EditIndicatorCtrl,
          resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
            Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
            }
 
          } 
      }).
      when('/newdash/:pid/:wid', {
        templateUrl: 'partials/newdash',
        controller: xWidgetCtrl,
        resolve: {
          Profile : function($route, $http){
            return $http.get('/api/userProfile')
            .then(function(response){
            console.log(response.data);
            return response.data;
            });
          },
          Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
          },
          selectedAttrs : function($route) {
            var pointid = $route.current.params.pointid;
            // console.log("POINT ID is " + pointid);
            return {pointid: pointid};
            // return {name: 'Hospital B'};
          }
        }
      }).
      when('/newdash/:pid', {
        templateUrl: 'partials/newdash',
        controller: xWidgetCtrl,
        resolve: {
          Profile : function($route, $http){
            return $http.get('/api/userProfile')
            .then(function(response){
            console.log(response.data);
            return response.data;
            });
          },
          Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
          },
          selectedAttrs : function($route) {
            var pointid = $route.current.params.pointid;
            // console.log("POINT ID is " + pointid);
            return {pointid: pointid};
            // return {name: 'Hospital B'};
          }
        }
      }).
      when('/report/:pid', {
        templateUrl: 'partials/report',
        controller: xReportCtrl,
        resolve: {
          selectedAttrs : function($route) {
            var pointid = $route.current.params.pointid;
            // console.log("POINT ID is " + pointid);
            return {pointid: pointid};
            // return {name: 'Hospital B'};
          }
        }
      }).
      when('/report/edit/:pid/:rid', {
        templateUrl: 'partials/create-report',
        controller: xCreateReportCtrl,
        resolve: {
          selectedAttrs : function($route) {
            var pointid = $route.current.params.pointid;
            // console.log("POINT ID is " + pointid);
            return {pointid: pointid};
            // return {name: 'Hospital B'};
          }
        }
      }).
      when('/report/create/:pid', {
        templateUrl: 'partials/create-report',
        controller: xCreateReportCtrl,
        resolve: {
          selectedAttrs : function($route) {
            var pointid = $route.current.params.pointid;
            // console.log("POINT ID is " + pointid);
            return {pointid: pointid};
            // return {name: 'Hospital B'};
          }
        }
      }).
      when('/parameter/:pid/:iid/:parmid', {
        templateUrl: 'partials/parameter',
        controller: ParameterCtrl
      }).
      when('/parameter/:pid/:iid/:pointparmid/:pointid', {
        templateUrl: 'partials/parameterPoint',
        controller: ParameterPointCtrl
      }).
      when('/parameterHistory/:pid/:iid/:parmid', {
        templateUrl: 'partials/parameterHistory',
        controller: ParameterCtrl
      }).
      when('/parameterHistory/:pid/:iid/:pointparmid/:pointid', {
        templateUrl: 'partials/parameterHistoryPoint',
        controller: ParameterPointCtrl
      }).
      when('/addParameter/:pid/:iid', {
        templateUrl: 'partials/addParameter',
        controller: ParameterCtrl
      }).
      when('/addParameter/:pid/:iid/:pointid', {
        templateUrl: 'partials/addParameterPoint',
        controller: ParameterPointCtrl
      }).
      when('/editParameter/:pid/:iid/:parmid/:pointid', {
        templateUrl: 'partials/editParameter',
        controller: EditParameterCtrl
      }).
      when('/editParameter/:pid/:iid/:parmid', {
        templateUrl: 'partials/editParameter',
        controller: EditParameterCtrl
      }).
      when('/calendar/:pid/:pointid', {
        templateUrl: 'partials/calendarPoint',
        controller: CalendarCtrl
      }).
      when('/calendar/:pid', {
        templateUrl: 'partials/calendar',
        controller: CalendarCtrl
      }).
      when('/addPost', {
        templateUrl: 'partials/addPost',
        controller: AddPostCtrl
      }).
      when('/readPost/:id', {
        templateUrl: 'partials/readPost',
        controller: ReadPostCtrl
      }).
      when('/editPost/:id', {
        templateUrl: 'partials/editPost',
        controller: EditPostCtrl
      }).
      when('/deletePost/:id', {
        templateUrl: 'partials/deletePost',
        controller: DeletePostCtrl
      }).
      when('/addReading', {
        templateUrl: 'partials/addReading',
        controller: AddReadingCtrl
      }).
      when('/liveSensors/:pid/:pointid', {
        templateUrl: 'partials/liveSensors',
        controller: IndicatorPointCtrl
      }).
      when('/liveSensorsReadings/:pid/:pointid', {
        templateUrl: 'partials/liveSensorsReadings',
        controller: IndicatorPointCtrl
      }).
      when('/alerts', {
        templateUrl: 'partials/alerts',
        controller: AlertsCtrl
      }).
      when('/alerts/:pid', {
        templateUrl: 'partials/alerts',
        controller: AlertsCtrl
      }).
      when('/alerts/:pid/:title', {
        templateUrl: 'partials/alerts',
        controller: AlertsCtrl
      }).
      when('/stats', {
        templateUrl: 'partials/stats',
        controller: StatsCtrl
      })
      .when('/liveexternaldata', {
        templateUrl: 'partials/liveexternaldata',
        controller: IntervalReadsCtrl
      }).
      when('/changePassword', {
        templateUrl: 'partials/changePassword',
        controller: LogoutCtrl
      }).
      when('/readingsParameter/:pid/:iid/:parmid/:pointid', {
        templateUrl: 'partials/readingsParameterPoint',
        controller: ParameterCtrl
      }).
      when('/readingsParameter/:pid/:iid/:parmid', {
        templateUrl: 'partials/readingsParameter',
        controller: ParameterCtrl
      }).
      when('/readings/:pid/:iid/:pointid', {
        templateUrl: 'partials/readingsPoint',
        controller: IndicatorCtrl
      }).
      when('/readings/:pid/:iid', {
        templateUrl: 'partials/readings',
        controller: IndicatorCtrl
      }).
      when('/compare/:pid', {
        templateUrl: 'partials/compare',
        controller: CompareCtrl,
          resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
            Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
            }
 
          } 
      }).
      when('/scatterplot/:pid', {
        templateUrl: 'partials/scatterplot',
        controller: ScatterPlotCtrl,
          resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
            Occurrences : function($route, $http){
              return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
                .then(function(response){
                  console.log("occurrences response.data");
                  console.log(response.data);
                  return response.data;
                });
            }
 
          }
      }).
      when('/map/:pid', {
        templateUrl: 'partials/map',
        controller: ComplexMarkerMapCtrl,
        resolve: {
            Profile : function($route, $http){
              return $http.get('/api/userProfile')
              .then(function(response){
              console.log(response.data);
              return response.data;
            });
          },
          CurrKpiValues : function($route, $http){
            return $http.get('/api/lastValuesAllKpis/'+$route.current.params.pid)
              .then(function(response){
                console.log("lastValuesAllKpis response.data");
                console.log(response.data);
                return response.data;
              });
          },
          Occurrences : function($route, $http){
            return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
              .then(function(response){
                console.log("occurrences response.data");
                console.log(response.data);
                return response.data;
              });
          }, 
          StoreOlapInfo : function($route, $http){
            return $http.get('/geoapi/'+$route.current.params.pid).
              then(function(response){
                // console.log(">>>>>> got points for store olap info");
                // console.log(response.data);

                var parsedData = {};
                if(response.data && response.data.constructor === Array){
                  for(var i=0; i<response.data.length; i++){
                    parsedData[response.data[i].attributes.PointKey] = response.data[i].olapstoreinfo;
                  }
                }

                // console.log(parsedData);
                return parsedData;

              });
          },
          LatestKpiValues : function($route, $http){
            /*
              
              2015 - 001 - Chełm Apteka przy Podziemiach - Chełm - Basket = 38.38625453945196
              2015 - 002 - Świdnik Apteka "Przy Fontannie" - Świdnik - Basket = 33.99247736785749
              2015 - 003 - Puławy - Apteka Centrum Farmaceutyczne - Puławy - Basket = 38.84278467153285
              2015 - 005 - Płock Apteka "Na Sienkiewicza" - Płock - Basket = 56.79845017793594
              2015 - 006 - Radom Apteka "Na Żeromskiego" - Radom - Basket = 40.55282935109022
              2015 - 008 - Łódź - Apteka na Piaskach - Łodź - Basket = 33.4368425504917
              2015 - 009 - Chełm Apteka przy Podziemiach 2 - Chełm - Basket = 49.56174941084053
              2015 - 010 - Chełm Apteka Rodzinna "Stansepol" - Chełm - Basket = 34.093574244415244
              2015 - 012 - Moja Farmacja Sp z o.o. S.K.A. - Lublin - Basket = 35.50975744383114

            */

            // agora é por este objecto a vir da /olapapi/executeQuery/:basket
            // ou ir buscar para kpi definido nos customicons e para cada um /olapapi/executeQuery/:kpi
            // la dentro tem de formar o objecto com keys PointKey transformado de string para int
            // return {"1": [{"Basket": 38.38625453945196 }] ,
            //         "2": [{"Basket": 33.99247736785749 }] ,
            //         "3": [{"Basket": 38.84278467153285 }] ,
            //         "5": [{"Basket": 56.79845017793594 }] ,
            //         "6": [{"Basket": 40.55282935109022 }] ,
            //         "8": [{"Basket": 33.4368425504917 }] ,
            //         "9": [{"Basket": 49.56174941084053 }] ,
            //         "10": [{"Basket": 34.093574244415244 }] ,
            //         "12": [{"Basket": 35.50975744383114 }] }
            //         ;

            return $http.post('/olapapi/olapExecuteKpis/'+$route.current.params.pid+'/0', {})
              .then(function(response){

                console.log("RESPONSE");
                console.log(response);

                var parseCellData = function(aux){
                  var toRet = {};
                  toRet.date = aux["[Data].[Kalendarz]"];
                  toRet.hour = aux["[Czas].[Czas]"];
                  toRet.pointkey = parseInt(aux["[Sklep].[Sklep Lokalizacja]"]);
                  toRet.shopcity = aux["[Sklep].[Sklep Miasto]"];
                  toRet.shopname = aux["[Sklep].[Sklep Nazwa]"];
                  toRet.Basket = aux["Basket"];
                  // changed W_sp_csn_rb to Sales due to Cumulative Query
                  // toRet["Net Sales"] = aux["W_sp_csn_rb"];
                  toRet["Net Sales"] = aux["Sales"];
                  toRet["Stock Level"] = aux["W_zap_czn_r"];
                  // changed Paragony to Customers due to Cumulative Query
                  // toRet['Number of Customers'] = aux["Paragony"];
                  toRet['Number of Customers'] = aux["Customers"];

                  toRet["Multiline Bills"] = aux["PercBills"];

                  // toRet["Net Margin"] = parseFloat(aux["M_spn_rb%"] ) * 100;
                  toRet["Net Margin"] = parseFloat(aux["MarginPerc"] ) * 100;
                  return toRet;
                }

                var filterDataOLAP = function(arr){
                  var toRet = new Array();
                  // also convert lockatia string to int
                  for(var i in data){
                    var aux = data[i].node[0].body[0];
                    if(aux["[Data].[Kalendarz]"] == "All" || aux["[Sklep].[Sklep Lokalizacja]"] == "All" 
                      || aux["[Sklep].[Sklep Miasto]"] == "All" || aux["[Sklep].[Sklep Nazwa]"] == "All"
                      || aux["[Czas].[Czas]"] == "All" ){
                      // console.log("discarding...");
                    } else {
                      aux = parseCellData(aux);
                      toRet.push(aux); // we could be doing here what we do at groupDataOLAP
                      // console.log(aux);
                    }
                  }
                  return toRet;
                }




                var equalDatesStore = function(a, b){
                  // return true if [date, hour, pointkey] are equal
                  return ((a.date == b.date) && (a.hour == b.hour) && (a.pointkey == b.pointkey));
                }


                var getNotNullValue = function(a, b, varName){
                  if(a.hasOwnProperty(varName) && a[varName] != null && !isNaN(a[varName]) )
                    return a[varName];
                  else
                    return b[varName];
                }


                var mergeDataCellsOLAP = function(a, b){
                  var toRet = {};
                  toRet.date = a.date;
                  toRet.hour = a.hour;
                  toRet.pointkey = a.pointkey;
                  toRet.shopcity = a.shopcity;
                  toRet.shopname = a.shopname;
                  toRet.Basket = getNotNullValue(a, b, 'Basket');
                  toRet["Net Sales"] = getNotNullValue(a, b, 'Net Sales');
                  toRet["Stock Level"] = getNotNullValue(a, b, 'Stock Level');
                  toRet['Number of Customers'] = getNotNullValue(a, b, 'Number of Customers');
                  toRet["Net Margin"] = getNotNullValue(a, b, 'Net Margin');
                  toRet["Multiline Bills"] = getNotNullValue(a, b, 'Multiline Bills');

                  return toRet;
                }

                var mergeDataOLAP = function(arr){
                  var toRet = new Array();

                  
                  // var a1 = arr[0];
                  // var a2 = arr[107];


                  // var equalToMerge = equalDatesStore(a1, a2);
                  // var a3 = mergeDataCellsOLAP(a1, a2);

                  // console.log("MERGINNGNGNGNG");

                  for(var i=0; i<arr.length; i++){
                    
                    // console.log(i);
                    if(!arr[i].hasOwnProperty('alreadyMerged')){
                      var elem = arr[i];
                      arr[i]["alreadyMerged"] = true;
                     

                      for(var j=i; j<arr.length; j++){
                        

                        if(!arr[j].hasOwnProperty('alreadyMerged')){
                          var aux = arr[j];
                          

                          if(equalDatesStore(elem, aux)){
                            arr[j]["alreadyMerged"] = true;

                            // console.log("foundMergeeeee");

                            elem = mergeDataCellsOLAP(elem, aux);
                            // elem = arr[i]
                            // get the next elemnt with date+hour+pointkey
                              // merge with elem
                            
                          }
                          
                        }
                        
                      }

                      toRet.push(elem);
                    }
                  }

                  return toRet;
                }


                var groupDataOLAP = function(arr){
                  var toRet = {};

                  for(var i in arr){
                    var aux = arr[i];
                    // console.log(aux.pointkey);
                    if(toRet.hasOwnProperty(aux.pointkey)){
                      // pointkey exists, update its value which is a vector with an object inside having as keys kpi_names

                      if( !isNaN(aux["Basket"]) ){
                        if( (toRet[aux.pointkey][0]).hasOwnProperty('Basket') ){
                          (toRet[aux.pointkey][0])['Basket'].push({"date": aux.date, "value": aux.Basket, "hour": aux.hour});
                          // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                        } else {
                          (toRet[aux.pointkey][0])['Basket'] = [{"date": aux.date, "value": aux.Basket, "hour": aux.hour}];
                        }
                      }

                      if( !isNaN(aux["Net Sales"]) ){
                        if( (toRet[aux.pointkey][0]).hasOwnProperty('Net Sales') ){
                          // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                          (toRet[aux.pointkey][0])['Net Sales'].push({"date": aux.date, "value": aux["Net Sales"], "hour": aux.hour});
                        } else {
                          (toRet[aux.pointkey][0])['Net Sales'] = [{"date": aux.date, "value": aux["Net Sales"], "hour": aux.hour}];
                        }
                      }

                      if( !isNaN(aux["Stock Level"]) ){
                        if( (toRet[aux.pointkey][0]).hasOwnProperty('Stock Level') ){
                          // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                          (toRet[aux.pointkey][0])['Stock Level'].push({"date": aux.date, "value": aux["Stock Level"], "hour": aux.hour});
                        } else {
                          (toRet[aux.pointkey][0])['Stock Level'] = [{"date": aux.date, "value": aux["Stock Level"], "hour": aux.hour}];
                        }
                      }

                      if( !isNaN(aux["Number of Customers"]) ){
                        if( (toRet[aux.pointkey][0]).hasOwnProperty('Number of Customers') ){
                          // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                          (toRet[aux.pointkey][0])['Number of Customers'].push({"date": aux.date, "value": aux['Number of Customers'], "hour": aux.hour});
                        } else {
                          (toRet[aux.pointkey][0])['Number of Customers'] = [{"date": aux.date, "value": aux['Number of Customers'], "hour": aux.hour}];
                        }
                      }

                      if( !isNaN(aux["Net Margin"]) ){
                        if( (toRet[aux.pointkey][0]).hasOwnProperty('Net Margin') ){
                          // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                          (toRet[aux.pointkey][0])['Net Margin'].push({"date": aux.date, "value": aux["Net Margin"], "hour": aux.hour});
                        } else {
                          (toRet[aux.pointkey][0])['Net Margin'] = [{"date": aux.date, "value": aux["Net Margin"], "hour": aux.hour}];
                        }
                      }

                      if( !isNaN(aux["Multiline Bills"]) ){
                        if( (toRet[aux.pointkey][0]).hasOwnProperty('Multiline Bills') ){
                          // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                          (toRet[aux.pointkey][0])['Multiline Bills'].push({"date": aux.date, "value": aux["Multiline Bills"], "hour": aux.hour});
                        } else {
                          (toRet[aux.pointkey][0])['Multiline Bills'] = [{"date": aux.date, "value": aux["Multiline Bills"], "hour": aux.hour}];
                        }
                      }

                      


                    } else {
                      // add field on toRet with pointkey
                      toRet[aux.pointkey] = [{}];

                      if( !isNaN(aux["Basket"]) ){
                        if( (toRet[aux.pointkey][0]).hasOwnProperty('Basket') ){
                          (toRet[aux.pointkey][0])['Basket'].push({"date": aux.date, "value": aux.Basket, "hour": aux.hour});
                          // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                        } else {
                          (toRet[aux.pointkey][0])['Basket'] = [{"date": aux.date, "value": aux.Basket, "hour": aux.hour}];
                        }
                      }

                      if( !isNaN(aux["Net Sales"]) ){
                        if( (toRet[aux.pointkey][0]).hasOwnProperty('Net Sales') ){
                          // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                          (toRet[aux.pointkey][0])['Net Sales'].push({"date": aux.date, "value": aux["Net Sales"], "hour": aux.hour});
                        } else {
                          (toRet[aux.pointkey][0])['Net Sales'] = [{"date": aux.date, "value": aux["Net Sales"], "hour": aux.hour}];
                        }
                      }

                      if( !isNaN(aux["Stock Level"]) ){
                        if( (toRet[aux.pointkey][0]).hasOwnProperty('Stock Level') ){
                          // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                          (toRet[aux.pointkey][0])['Stock Level'].push({"date": aux.date, "value": aux["Stock Level"], "hour": aux.hour});
                        } else {
                          (toRet[aux.pointkey][0])['Stock Level'] = [{"date": aux.date, "value": aux["Stock Level"], "hour": aux.hour}];
                        }
                      }


                      if( !isNaN(aux["Number of Customers"]) ){
                        if( (toRet[aux.pointkey][0]).hasOwnProperty('Number of Customers') ){
                          // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                          (toRet[aux.pointkey][0])['Number of Customers'].push({"date": aux.date, "value": aux['Number of Customers'], "hour": aux.hour});
                        } else {
                          (toRet[aux.pointkey][0])['Number of Customers'] = [{"date": aux.date, "value": aux['Number of Customers'], "hour": aux.hour}];
                        }
                      }

                      if( !isNaN(aux["Net Margin"]) ){
                        if( (toRet[aux.pointkey][0]).hasOwnProperty('Net Margin') ){
                          // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                          (toRet[aux.pointkey][0])['Net Margin'].push({"date": aux.date, "value": aux["Net Margin"], "hour": aux.hour});
                        } else {
                          (toRet[aux.pointkey][0])['Net Margin'] = [{"date": aux.date, "value": aux["Net Margin"], "hour": aux.hour}];
                        }
                      }

                      if( !isNaN(aux["Multiline Bills"]) ){
                        if( (toRet[aux.pointkey][0]).hasOwnProperty('Multiline Bills') ){
                          // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                          (toRet[aux.pointkey][0])['Multiline Bills'].push({"date": aux.date, "value": aux["Multiline Bills"], "hour": aux.hour});
                        } else {
                          (toRet[aux.pointkey][0])['Multiline Bills'] = [{"date": aux.date, "value": aux["Multiline Bills"], "hour": aux.hour}];
                        }
                      }


                    }

                  }

                  return toRet;
                }


                console.log("got olap data");
                var data = response.data.parent;
                // console.log(data);
                var allReadsCount = 0;
                if(data != null && data != undefined){
                  allReadsCount = data.length;
                }

                var filteredData = filterDataOLAP(data);
                // console.log("FILTERED DATA");
                // console.log(filteredData);


                var mergedData = mergeDataOLAP(filteredData);
                // console.log("MERGED DATA");
                // console.log(mergedData);                


                var groupedData = groupDataOLAP(mergedData);
                console.log("GROUPED DATA");
                console.log(groupedData);

                // we should validate if a value raises an alert/occurrence
                // and raise it if it hasn't been raised before

                groupedData.allReadsCount = allReadsCount;

                return groupedData;

                // return {"1": [{"Basket": 38.38625453945196 }] ,
                //         "2": [{"Basket": 33.99247736785749 }] ,
                //         "3": [{"Basket": 38.84278467153285 }] ,
                //         "5": [{"Basket": 56.79845017793594 }] ,
                //         "6": [{"Basket": 40.55282935109022 }] ,
                //         "8": [{"Basket": 33.4368425504917 }] ,
                //         "9": [{"Basket": 49.56174941084053 }] ,
                //         "10": [{"Basket": 34.093574244415244 }] ,
                //         "12": [{"Basket": 35.50975744383114 }] }
                //         ;
              });
          }
        }
      }).
      when('/map/:pid/weekly', {
        templateUrl: 'partials/mapWeekly',
        controller: ComplexMarkerMapCtrl,
        resolve: {
          Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
              },
          CurrKpiValues : function($route, $http){
            return $http.get('/api/lastValuesAllKpis/'+$route.current.params.pid)
              .then(function(response){
                console.log("lastValuesAllKpis response.data");
                console.log(response.data);
                return response.data;
              });
          },
          Occurrences : function($route, $http){
            return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
              .then(function(response){
                console.log("occurrences response.data");
                console.log(response.data);
                return response.data;
              });
          }, 
          StoreOlapInfo : function($route, $http){
            return $http.get('/geoapi/'+$route.current.params.pid).
              then(function(response){
                // console.log(">>>>>> got points for store olap info");
                // console.log(response.data);

                var parsedData = {};

                if(response.data && response.data.constructor === Array){
                  for(var i=0; i<response.data.length; i++){
                    parsedData[response.data[i].attributes.PointKey] = response.data[i].olapstoreinfo;
                  }
                }

                // console.log(parsedData);
                return parsedData;

              });
          },
          LatestKpiValues : function($route, $http){
            /*
              
              2015 - 001 - Chełm Apteka przy Podziemiach - Chełm - Basket = 38.38625453945196
              2015 - 002 - Świdnik Apteka "Przy Fontannie" - Świdnik - Basket = 33.99247736785749
              2015 - 003 - Puławy - Apteka Centrum Farmaceutyczne - Puławy - Basket = 38.84278467153285
              2015 - 005 - Płock Apteka "Na Sienkiewicza" - Płock - Basket = 56.79845017793594
              2015 - 006 - Radom Apteka "Na Żeromskiego" - Radom - Basket = 40.55282935109022
              2015 - 008 - Łódź - Apteka na Piaskach - Łodź - Basket = 33.4368425504917
              2015 - 009 - Chełm Apteka przy Podziemiach 2 - Chełm - Basket = 49.56174941084053
              2015 - 010 - Chełm Apteka Rodzinna "Stansepol" - Chełm - Basket = 34.093574244415244
              2015 - 012 - Moja Farmacja Sp z o.o. S.K.A. - Lublin - Basket = 35.50975744383114

            */

            // agora é por este objecto a vir da /olapapi/executeQuery/:basket
            // ou ir buscar para kpi definido nos customicons e para cada um /olapapi/executeQuery/:kpi
            // la dentro tem de formar o objecto com keys PointKey transformado de string para int
            // return {"1": [{"Basket": 38.38625453945196 }] ,
            //         "2": [{"Basket": 33.99247736785749 }] ,
            //         "3": [{"Basket": 38.84278467153285 }] ,
            //         "5": [{"Basket": 56.79845017793594 }] ,
            //         "6": [{"Basket": 40.55282935109022 }] ,
            //         "8": [{"Basket": 33.4368425504917 }] ,
            //         "9": [{"Basket": 49.56174941084053 }] ,
            //         "10": [{"Basket": 34.093574244415244 }] ,
            //         "12": [{"Basket": 35.50975744383114 }] }
            //         ;

            return $http.post('/olapapi/olapExecuteKpis/'+$route.current.params.pid+'/5', {})
              .then(function(response){

                console.log("RESPONSE");
                console.log(response);

                var parseCellData = function(aux){
                  var toRet = {};
                  toRet.date = aux["[Data].[Kalendarz]"];
                  toRet.pointkey = parseInt(aux["[Sklep].[Sklep Lokalizacja]"]);
                  toRet.shopcity = aux["[Sklep].[Sklep Miasto]"];
                  toRet.shopname = aux["[Sklep].[Sklep Nazwa]"];
                  toRet.Basket = aux["Basket"];
                  toRet["Net Sales"] = aux["W_sp_csn_rb"];
                  // toRet["Stock Level"] = aux["W_zap_czn_r"];
                  toRet['Number of Customers'] = aux["Paragony"];
                  // console.log("parsefloat "+(aux["M_spn_rb%"]));
                  toRet["Net Margin"] = parseFloat(aux["M_spn_rb%"] ) * 100;
                  toRet["Multiline Bills"] = aux["PercBills"];
                  return toRet;
                }

                var filterDataOLAP = function(arr){
                  var toRet = new Array();
                  // also convert lockatia string to int
                  for(var i in data){
                    var aux = data[i].node[0].body[0];
                    if(aux["[Data].[Kalendarz]"] == "All" || aux["[Sklep].[Sklep Lokalizacja]"] == "All" 
                      || aux["[Sklep].[Sklep Miasto]"] == "All" || aux["[Sklep].[Sklep Nazwa]"] == "All" ){
                      // console.log("discarding...");
                    } else {
                      aux = parseCellData(aux);
                      toRet.push(aux); // we could be doing here what we do at groupDataOLAP
                      // console.log(aux);
                    }
                  }
                  return toRet;
                }




                var equalDatesStore = function(a, b){
                  // return true if [date, hour, pointkey] are equal
                  return ((a.date == b.date) && (a.pointkey == b.pointkey));
                }


                var getNotNullValue = function(a, b, varName){
                  if(a.hasOwnProperty(varName) && a[varName] != null && !isNaN(a[varName]) )
                    return a[varName];
                  else
                    return b[varName];
                }


                var mergeDataCellsOLAP = function(a, b){
                  var toRet = {};
                  toRet.date = a.date;
                  toRet.pointkey = a.pointkey;
                  toRet.shopcity = a.shopcity;
                  toRet.shopname = a.shopname;
                  toRet.Basket = getNotNullValue(a, b, 'Basket');
                  toRet["Net Sales"] = getNotNullValue(a, b, 'Net Sales');
                  // toRet["Stock Level"] = getNotNullValue(a, b, 'Stock Level');
                  toRet['Number of Customers'] = getNotNullValue(a, b, 'Number of Customers');
                  toRet["Net Margin"] = getNotNullValue(a, b, 'Net Margin');
                  toRet["Multiline Bills"] = getNotNullValue(a, b, 'Multiline Bills');

                  return toRet;
                }

                var mergeDataOLAP = function(arr){
                  var toRet = new Array();

                  
                  // var a1 = arr[0];
                  // var a2 = arr[107];


                  // var equalToMerge = equalDatesStore(a1, a2);
                  // var a3 = mergeDataCellsOLAP(a1, a2);

                  // console.log("MERGINNGNGNGNG");

                  for(var i=0; i<arr.length; i++){
                    
                    // console.log(i);
                    if(!arr[i].hasOwnProperty('alreadyMerged')){
                      var elem = arr[i];
                      arr[i]["alreadyMerged"] = true;
                     

                      for(var j=i; j<arr.length; j++){
                        

                        if(!arr[j].hasOwnProperty('alreadyMerged')){
                          var aux = arr[j];
                          

                          if(equalDatesStore(elem, aux)){
                            arr[j]["alreadyMerged"] = true;

                            // console.log("foundMergeeeee");

                            elem = mergeDataCellsOLAP(elem, aux);
                            // elem = arr[i]
                            // get the next elemnt with date+hour+pointkey
                              // merge with elem
                            
                          }
                          
                        }
                        
                      }

                      toRet.push(elem);
                    }
                  }

                  return toRet;
                }


                var groupDataOLAP = function(arr){
                  var toRet = {};

                  for(var i in arr){
                    var aux = arr[i];
                    // console.log(aux.pointkey);
                    if(toRet.hasOwnProperty(aux.pointkey)){
                      // pointkey exists, update its value which is a vector with an object inside having as keys kpi_names
                      if( (toRet[aux.pointkey][0]).hasOwnProperty('Basket') ){
                        (toRet[aux.pointkey][0])['Basket'].push({"date": aux.date, "value": aux.Basket});
                        // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                      } else {
                        (toRet[aux.pointkey][0])['Basket'] = [{"date": aux.date, "value": aux.Basket}];
                      }

                      if( (toRet[aux.pointkey][0]).hasOwnProperty('Net Sales') ){
                        // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                        (toRet[aux.pointkey][0])['Net Sales'].push({"date": aux.date, "value": aux["Net Sales"]});
                      } else {
                        (toRet[aux.pointkey][0])['Net Sales'] = [{"date": aux.date, "value": aux["Net Sales"]}];
                      }

                      // if( (toRet[aux.pointkey][0]).hasOwnProperty('Stock Level') ){
                      //   // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                      //   (toRet[aux.pointkey][0])['Stock Level'].push({"date": aux.date, "value": aux["Stock Level"]});
                      // } else {
                      //   (toRet[aux.pointkey][0])['Stock Level'] = [{"date": aux.date, "value": aux["Stock Level"]}];
                      // }

                      if( (toRet[aux.pointkey][0]).hasOwnProperty('Number of Customers') ){
                        // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                        (toRet[aux.pointkey][0])['Number of Customers'].push({"date": aux.date, "value": aux['Number of Customers']});
                      } else {
                        (toRet[aux.pointkey][0])['Number of Customers'] = [{"date": aux.date, "value": aux['Number of Customers']}];
                      }

                      if( (toRet[aux.pointkey][0]).hasOwnProperty('Net Margin') ){
                        // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                        (toRet[aux.pointkey][0])['Net Margin'].push({"date": aux.date, "value": aux["Net Margin"]});
                      } else {
                        (toRet[aux.pointkey][0])['Net Margin'] = [{"date": aux.date, "value": aux["Net Margin"]}];
                      }

                      if( (toRet[aux.pointkey][0]).hasOwnProperty('Multiline Bills') ){
                        // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                        (toRet[aux.pointkey][0])['Multiline Bills'].push({"date": aux.date, "value": aux["Multiline Bills"]});
                      } else {
                        (toRet[aux.pointkey][0])['Multiline Bills'] = [{"date": aux.date, "value": aux["Multiline Bills"]}];
                      }

                      


                    } else {
                      // add field on toRet with pointkey
                      toRet[aux.pointkey] = [{}];


                      if( (toRet[aux.pointkey][0]).hasOwnProperty('Basket') ){
                        (toRet[aux.pointkey][0])['Basket'].push({"date": aux.date, "value": aux.Basket});
                        // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                      } else {
                        (toRet[aux.pointkey][0])['Basket'] = [{"date": aux.date, "value": aux.Basket}];
                      }

                      if( (toRet[aux.pointkey][0]).hasOwnProperty('Net Sales') ){
                        // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                        (toRet[aux.pointkey][0])['Net Sales'].push({"date": aux.date, "value": aux["Net Sales"]});
                      } else {
                        (toRet[aux.pointkey][0])['Net Sales'] = [{"date": aux.date, "value": aux["Net Sales"]}];
                      }

                      // if( (toRet[aux.pointkey][0]).hasOwnProperty('Stock Level') ){
                      //   // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                      //   (toRet[aux.pointkey][0])['Stock Level'].push({"date": aux.date, "value": aux["Stock Level"]});
                      // } else {
                      //   (toRet[aux.pointkey][0])['Stock Level'] = [{"date": aux.date, "value": aux["Stock Level"]}];
                      // }


                      if( (toRet[aux.pointkey][0]).hasOwnProperty('Number of Customers') ){
                        // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                        (toRet[aux.pointkey][0])['Number of Customers'].push({"date": aux.date, "value": aux['Number of Customers']});
                      } else {
                        (toRet[aux.pointkey][0])['Number of Customers'] = [{"date": aux.date, "value": aux['Number of Customers']}];
                      }

                      if( (toRet[aux.pointkey][0]).hasOwnProperty('Net Margin') ){
                        // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                        (toRet[aux.pointkey][0])['Net Margin'].push({"date": aux.date, "value": aux["Net Margin"]});
                      } else {
                        (toRet[aux.pointkey][0])['Net Margin'] = [{"date": aux.date, "value": aux["Net Margin"]}];
                      }

                      if( (toRet[aux.pointkey][0]).hasOwnProperty('Multiline Bills') ){
                        // update (toRet[aux.pointkey][0]).Basket by pushing date, value
                        (toRet[aux.pointkey][0])['Multiline Bills'].push({"date": aux.date, "value": aux["Multiline Bills"]});
                      } else {
                        (toRet[aux.pointkey][0])['Multiline Bills'] = [{"date": aux.date, "value": aux["Multiline Bills"]}];
                      }



                    }

                  }

                  return toRet;
                }


                console.log("got olap data");
                var data = response.data.parent;
                // console.log(data);
                var allReadsCount = 0;
                if(data != null && data != undefined){
                  allReadsCount = data.length;
                }

                var filteredData = filterDataOLAP(data);
                // console.log("FILTERED DATA");
                // console.log(filteredData);


                var mergedData = mergeDataOLAP(filteredData);
                // console.log("MERGED DATA");
                // console.log(mergedData);                


                var groupedData = groupDataOLAP(mergedData);
                console.log("GROUPED DATA");
                console.log(groupedData);

                // we should validate if a value raises an alert/occurrence
                // and raise it if it hasn't been raised before

                groupedData.allReadsCount = allReadsCount;

                return groupedData;

                // return {"1": [{"Basket": 38.38625453945196 }] ,
                //         "2": [{"Basket": 33.99247736785749 }] ,
                //         "3": [{"Basket": 38.84278467153285 }] ,
                //         "5": [{"Basket": 56.79845017793594 }] ,
                //         "6": [{"Basket": 40.55282935109022 }] ,
                //         "8": [{"Basket": 33.4368425504917 }] ,
                //         "9": [{"Basket": 49.56174941084053 }] ,
                //         "10": [{"Basket": 34.093574244415244 }] ,
                //         "12": [{"Basket": 35.50975744383114 }] }
                //         ;
              });
          }
        }
      }).
      when('/occurrences/:pid', {
        templateUrl: 'partials/occurrences',
        controller: OccurrencesCtrl,
        resolve: {
          Profile : function($route, $http){
              return $http.get('/api/userProfile')
                  .then(function(response){
                    console.log(response.data);
                  return response.data;
                });
          },
          ProjectInfo : function($route, $http){
            return $http.get('/api/projectinfo/'+$route.current.params.pid)
              .then(function(response){
                return response.data;
              });
          },
          Occurrences : function($route, $http){
            return $http.get('/api/occurrences/'+$route.current.params.pid+'/1')
              .then(function(response){
                console.log("occurrences response.data");
                console.log(response.data);

                if(response.hasOwnProperty('data') && response.data.hasOwnProperty('occurrences')){
                  for(var i = 0; i < response.data.occurrences.length; i++){
                    response.data.occurrences[i].statusMenu = false;
                    response.data.occurrences[i].showTasks = false;
                    response.data.occurrences[i].selectedClass = "";
                  }
                  return response.data;
                } else {
                  return [];
                }
                
              });
          }

        }
      }).
      when('/olap/:pid', {
        templateUrl: 'partials/olap',
        controller: OlapCubeCtrl
      }).
      when('/configDataLevels/:pid', {
        templateUrl: 'partials/configDataLevels',
        controller: DataLevelsCtrl
      }).
      otherwise({
        redirectTo: '/projects'
      });
    $locationProvider.html5Mode(true);
  }]);
