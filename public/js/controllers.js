'use strict';

/* Various utilities  */
function isValidObject(o) {
    return (angular.isDefined(o) && angular.isObject(o));
}
/* Controllers */

angular.module('myApp.controllers', []).
controller('AppCtrl', function($scope, $http) {

    $http({
        method: 'GET',
        url: '/api/name'
    }).
    success(function(data, status, headers, config) {
        $scope.name = data.name;
    }).
    error(function(data, status, headers, config) {
        $scope.name = 'Error!';
    });

}).
controller('MyCtrl1', function($scope) {
    // write Ctrl here

}).
controller('MyCtrl2', function($scope) {
    // write Ctrl here

});

function IndexCtrl($scope, $http) {
    // // console.log('IndexCtrl');
    $http.get('/api/user').
    success(function(data, status, headers, config) {
        $scope.username = data.username;
    });
}

function AddPostCtrl($scope, $http, $location) {
    $scope.form = {};
    $scope.submitPost = function() {
        $http.post('/api/post', $scope.form).
        success(function(data) {
            $location.path('/');
        });
    };
}

function ReadPostCtrl($scope, $http, $routeParams) {
    $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
        $scope.post = data.post;
    });
}

function EditPostCtrl($scope, $http, $location, $routeParams) {
    $scope.form = {};
    $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
        $scope.form = data.post;
    });

    $scope.editPost = function() {
        $http.put('/api/post/' + $routeParams.id, $scope.form).
        success(function(data) {
            $location.url('/readPost/' + $routeParams.id);
        });
    };
}

function DeletePostCtrl($scope, $http, $location, $routeParams) {
    $http.get('/api/post/' + $routeParams.id).
    success(function(data) {
        $scope.post = data.post;
    });

    $scope.deletePost = function() {
        $http.delete('/api/post/' + $routeParams.id).
        success(function(data) {
            $location.url('/');
        });
    };

    $scope.home = function() {
        $location.url('/');
    };
}



function buildMessage(point, includeValue) {
    var tag = "h5";
    var ret = "<" + tag + ">PointID:<small> " + point.pointid + "</small></" + tag + ">";
    ret += "<" + tag + ">Latitude:<small> " + point.x + "</small></" + tag + "><" + tag + ">Longitude:<small> " + point.y + "</small></" + tag + ">";
    ret += "<hr><" + tag + ">Type:<small> " + point.type + "</small></" + tag + ">";

    for (var att in point.attributes) {
        if (point.attributes.hasOwnProperty(att)) {
            ret += "<" + tag + ">" + att + ":<small> " + point.attributes[att] + "</small></" + tag + ">"
        }
    }

    if (includeValue) {
        ret += "<hr><h4>" + point.value + " " + point.unit + "</h4>";
    }
    return ret;
}


NavBarCtrl.$inject = ['$scope', '$http', '$routeParams', 'sharedCommsService', '$timeout', 'socket'];

function NavBarCtrl($scope, $http, $routeParams, sharedCommsService, $timeout, socket) {

    console.log("NavBarCtrl");

    $scope.buttonsClass = 'display-none';
    $scope.newAlert = '';

    /* Internal functions */
    function getUserAndAlerts(isNew) {
        $http.get('/api/user').
        success(function(data, status, headers, config) {
            if (!data.hasOwnProperty("error")) {
                $scope.username = data.username;
                $scope.organization = data.name;
                $scope.alerts = data.alerts;
                $scope.newAlert = isNew ? 'color:red;' : '';
                $scope.buttonsClass = '';
            }
        });
    };

    $scope.hideNewAlert = function() {
        $scope.newAlert = '';
    };

    socket.on('send:alert', function(u) {
        getUserAndAlerts(true);
    });
    $scope.$on('socketSelf', function(u) {
        getUserAndAlerts(true);
    });

    getUserAndAlerts(false);


    $scope.pid = $routeParams.pid;


    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.message == "updatePid") {
            $scope.pid = parseInt(sharedCommsService.pid);
        }
    });


    var index = 0;
    $scope.notifications = {};
    $scope.notificationsTtl = 30000;

    var addNotification = function(occurrence) {
        // convert here from occurrence to notification
        if (occurrence.pid == $scope.pid) {
            var i = index++;
            $scope.notifications[i] = {};
            $scope.notifications[i].message = occurrence.kpi + ": " + occurrence.title;
            if (!occurrence.hasOwnProperty('pointname') || occurrence.pointname == '' || occurrence.pointname == undefined) {
                occurrence.pointname = "Lublin";
            }
            $scope.notifications[i].messagesec = occurrence.pointname + " at " + occurrence.date + " " + occurrence.time;
        }
    }

    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.message == "generateNotification") {
            addNotification(sharedCommsService.occurrence);
        }
    });

    socket.on('send:generateNotification', function(occurrence) {
        addNotification(occurrence.occurrence);
    })


    $scope.forceAddOccurrence = function() {
        addNotification({
            "title": "Forced notif " + (index + 1)
        });
    }


    socket.on('new_occurrence_triggered_notif', function(occurrence) {
        console.log("REFRESH new_occurrence_triggered_notif");
        console.log(occurrence);
        addNotification(occurrence);
    });
}


// function ModalDemoCtrl($scope, $modal, $log) {

//   $scope.items = ['item1', 'item2', 'item3'];

//   $scope.open = function (size) {
//     console.log("open modal");

//     console.log('$modal');
//     console.log($modal);

//     var modalInstance = $modal.open({
//       templateUrl: 'myModalContent.html',
//       controller: ModalInstanceCtrl,
//       size: size,
//       resolve: {
//         items: function () {
//           return $scope.items;
//         }
//       }
//     });

//     modalInstance.result.then(function (selectedItem) {
//       $scope.selected = selectedItem;
//     }, function () {
//       $log.info('Modal dismissed at: ' + new Date());
//     });
//   };
// };

// // Please note that $modalInstance represents a modal window (instance) dependency.
// // It is not the same as the $modal service used above.

// function ModalInstanceCtrl($scope, $modalInstance, items) {

//   $scope.items = items;
//   $scope.selected = {
//     item: $scope.items[0]
//   };

//   $scope.ok = function () {
//     $modalInstance.close($scope.selected.item);
//   };

//   $scope.cancel = function () {
//     $modalInstance.dismiss('cancel');
//   };
// };



function ParseDMS(input) {
    var parts = input.split(/[^\d\w\.\,]+/);
    // console.log(parts);
    for (var i = 0; i < parts.length - 1; i++)
        parts[i] = parts[i].replace(',', '.');
    return parts;
    // var lat = ConvertDMSToDD(parts[0], parts[1], parts[2], parts[3]);
    // var lng = ConvertDMSToDD(parts[4], parts[5], parts[6], parts[7]);
}

function ConvertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = degrees + minutes / 60 + seconds / (60 * 60);

    if (direction.toUpperCase() == "S" || direction.toUpperCase() == "W") {
        dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
}

function isDegreeCoord(coord) {
    if (coord.indexOf('°') != -1 || coord.indexOf('º') != -1)
        return true;
    else
        return false;
}


ModalSpreadsheetCtrl.$inject = ['$scope', '$http', '$routeParams', 'sharedCommsService', '$timeout'];

function ModalSpreadsheetCtrl($scope, $http, $routeParams, sharedCommsService, $timeout) {
    console.log("ModalSpreadsheetCtrl");
    $scope.pid = $routeParams.pid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    console.log('sharedCommsService');
    console.log(sharedCommsService);

    $scope.addPointsButtonStyle = 'display: inline-block';
    $scope.cancelAddPointsButtonStyle = 'display: none';
    var cancel = false;

    $scope.cancelAddSpreadsheet = function() {
        cancel = true;
        $scope.addMessage2 = "Cancelled!";
        $scope.addMessageStyle2 = 'color:red;';
        clearTimeout($scope.addTimer);

        $scope.addPointsButtonStyle = 'display: inline-block';
        $scope.cancelAddPointsButtonStyle = 'display: none';
    }

    $scope.saveSpreadsheet = function() {
        console.log("saveSpreadsheet");



        // console.log($scope.sentence);
        if ($scope.sentence == undefined) {
            $scope.addMessage = 'The spreadsheet input is empty!';
            $scope.addMessageStyle = 'color:red;';
            return;
        }


        var lines = $scope.sentence.split('\n');

        if (lines.length == 1) {
            $scope.addMessage = 'The spreadsheet input format is incorrect!';
            $scope.addMessageStyle = 'color:red;';
            return;
        }

        $scope.addPointsButtonStyle = 'display: none';
        $scope.cancelAddPointsButtonStyle = 'display: inline-block';
        cancel = false;


        var firstLine = lines.shift(); // removing header line


        $scope.addMessage = 'Adding ' + (lines.length) + ' points';
        $scope.addMessageStyle = 'color:#555;';
        var addedPoints = 0,
            timedoutPoints = 0;
        var beginAddPointsTimestamp = Date.now();

        var attributes = (firstLine.split("\t"));
        attributes.shift(); // remove Latitude
        attributes.shift(); // remove Longitude
        attributes.shift(); // remove Place
        attributes.shift(); // remove Type
        console.log('attributes');
        console.log(attributes);

        var geocoder = new google.maps.Geocoder();
        var addTime = Date.now();
        var timeouts = [];

        var total_to_geocode = 0;
        var alreadyGeocoded = new Array();

        for (var j = 0; j < lines.length; j++) {
            var elem = lines[j];
            var aux = elem.split("\t");
            timeouts.push([j, j * 1000]);
            var isToGeocode = (aux[0] == "" || aux[1] == "");

            // NUNOOOOOO: tou a validar se tem ou nao coordenadas, mas tenho tb de ver se nao tem nem coords e place, e por noutro array.
            // dps esse array é o q vai restar no input (em vez de apagar tudo do input)
            if (isToGeocode)
                total_to_geocode++;
            else {
                alreadyGeocoded.push(lines.splice(j, 1));
                // NUNOOOOOO: add to database instead of pushing to alreadyGeocoded... it was just a confirmation
                j--;
            }
        }

        var totalPointsToAdd = total_to_geocode + alreadyGeocoded.length;
        var totalAddedPoints = 0;

        function parseQuotes(str) {
            // return str.replace(/('[a-zA-Z0-9\s]+\s*)'(\s*[a-zA-Z0-9\s]+')/g,"$1\\\'$2");
            return str.replace("'", " ");
        }

        alreadyGeocoded.forEach(function(elem) {
            var addForm = {};
            var aux = elem[0].split("\t");
            // console.log(aux);
            // aux[1] = aux[1].replace(',', '.');
            // var str = aux[0].replace(/\//g, '-');

            // 0 e 1 sao latitude e longitude
            // se lat e lng forem do tipo degree, passar para decimal
            if (isDegreeCoord(aux[0])) {
                // console.log("is degree! "+aux[0] );
                var parts = ParseDMS(aux[0]);
                aux[0] = ConvertDMSToDD(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]), parts[3]);

                var partsLng = ParseDMS(aux[1]);
                aux[1] = ConvertDMSToDD(parseInt(partsLng[0]), parseInt(partsLng[1]), parseFloat(partsLng[2]), partsLng[3]);
            } else {
                aux[0] = aux[0].replace(',', '.');
                aux[1] = aux[1].replace(',', '.');
            }

            // we may need to support degrees decimal minutes to decimal degrees: N 47° 38.938 W 122° 20.887      DDD° MM.MMM' DDD° MM.MMM'


            addForm.point = {
                lat: parseFloat(aux[0]),
                lng: parseFloat(aux[1])
            };

            addForm.template = new Array();
            addForm.template.push({
                text: aux[3]
            });

            addForm.attributes = {};
            for (var i = 0; i < attributes.length; i++) {
                // console.log( attributes[i] + " : " + aux[3 + i]);
                if (aux[4 + i] != "")
                    addForm.attributes[attributes[i]] = parseQuotes(aux[4 + i]);
            }

            addForm.autoIndicators = 'no';

            addForm.indicators = {};


            $http.post('/geoapi/addPoint/' + $scope.pid, addForm).
            success(function(data, status) {
                var pointToAdd = data;
                // console.log('added point '+pointToAdd.pointid);

                totalAddedPoints++;

                sharedCommsService.pointsToRefresh.push(pointToAdd.pointid);
                sharedCommsService.pointsToRefresh2.push(pointToAdd.pointid);
                sharedCommsService.bufferAndBroadcast("refreshPoints");

                if (totalAddedPoints == (totalPointsToAdd)) {
                    $scope.sentence = '';
                    $scope.addMessage = "Finished adding all " + (totalPointsToAdd) + " points (" + (Date.now() - beginAddPointsTimestamp) + " ms)";
                    $scope.addMessageStyle = 'color:green;';

                    sharedCommsService.addMessage = "Finished adding all " + (totalPointsToAdd) + " points";
                    sharedCommsService.bufferAndBroadcast("updatedAddMessage");

                    $scope.addPointsButtonStyle = 'display: inline-block';
                    $scope.cancelAddPointsButtonStyle = 'display: none';
                    cancel = false;
                } else {
                    $scope.addMessage = "Added " + totalAddedPoints + " of total " + (totalPointsToAdd) + " points (" + (Date.now() - beginAddPointsTimestamp) + " ms)";
                    $scope.addMessageStyle = 'color:#555;';

                    sharedCommsService.addMessage = "Added " + totalAddedPoints + " of total " + (totalPointsToAdd) + " points";
                    sharedCommsService.bufferAndBroadcast("updatedAddMessage");

                }
            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });

        });

        // return;



        function parseLine(line, results) {
            var aux = line.split("\t");
            var addForm = {};
            aux[0] = results[0].geometry.location.lat();
            aux[1] = results[0].geometry.location.lng();

            // console.log("adding coords "+aux[0]+" "+aux[1]);

            addForm.point = {
                lat: parseFloat(aux[0]),
                lng: parseFloat(aux[1])
            };

            addForm.template = new Array();
            addForm.template.push({
                text: aux[3]
            });

            addForm.attributes = {};
            for (var i = 0; i < attributes.length; i++) {
                // console.log( attributes[i] + " : " + aux[3 + i]);
                if (aux[4 + i] != "")
                    addForm.attributes[attributes[i]] = parseQuotes(aux[4 + i]);
            }

            addForm.autoIndicators = 'no';

            addForm.indicators = {};

            return addForm;
        }



        var attempts = 0;
        var timeouts = 0;

        var index = 0;
        var retryLine = null;

        var delay = 100;
        var wait = 2000;
        var delayAcceleration = 100;
        var delayLimitToAccelerate = 1000;
        var acceleration = 10;

        // funcao
        var geocodeFunction = function() {
            console.log("geocodeFunction. cancel? " + cancel);
            if (cancel) {
                return;
            }
            if (attempts < 5) {
                // faz shift ao lines para obter o primeiro
                var line = retryLine;
                if (retryLine == null)
                    line = lines.shift();

                // console.log("          retryLine: "+retryLine+" ;;; LINE: "+line);

                var aux = line.split("\t");
                // console.log('address'+ aux[2]);

                geocoder.geocode({
                    'address': aux[2]
                }, function(results, status) {
                    // tenta fazer geocode
                    // console.log("Geocoding "+index);
                    $scope.addMessage2 = "(waiting for google to geocode/translate the address: " + aux[2] + ")";

                    $scope.addMessageStyle2 = 'color:#555;';

                    if (status == google.maps.GeocoderStatus.OK) {
                        // se OK
                        // console.log("OK: "+results[0].geometry.location.k+" "+results[0].geometry.location.A);
                        // faz add na database
                        var addForm = parseLine(line, results);
                        // console.log(addForm);

                        addedPoints++;
                        attempts = 0;

                        $http.post('/geoapi/addPoint/' + $scope.pid, addForm).
                        success(function(data, status) {
                            var pointToAdd = data;
                            // console.log('added point '+pointToAdd.pointid);

                            totalAddedPoints++;

                            // sharedCommsService.pointid = pointToAdd.pointid;
                            sharedCommsService.pointsToRefresh.push(pointToAdd.pointid);
                            sharedCommsService.pointsToRefresh2.push(pointToAdd.pointid);
                            sharedCommsService.bufferAndBroadcast("refreshPoints");

                            if (totalAddedPoints == (totalPointsToAdd)) {
                                $scope.sentence = '';
                                $scope.addMessage = "Finished adding all " + (totalPointsToAdd) + " points (" + (Date.now() - beginAddPointsTimestamp) + " ms)";
                                $scope.addMessageStyle = 'color:green;';


                                $scope.addMessage2 = "(Finished geocoding/translating adding all " + (addedPoints) + " addresses)";
                                $scope.addMessageStyle2 = 'color:#555;';
                                sharedCommsService.addMessage = "Finished adding all " + (totalPointsToAdd) + " points";
                                sharedCommsService.bufferAndBroadcast("updatedAddMessage");

                                $scope.addPointsButtonStyle = 'display: inline-block';
                                $scope.cancelAddPointsButtonStyle = 'display: none';
                                cancel = false;

                            } else {
                                $scope.addMessage = "Added " + totalAddedPoints + " of total " + (totalPointsToAdd) + " points (" + (Date.now() - beginAddPointsTimestamp) + " ms)";
                                $scope.addMessageStyle = 'color:#555;';
                                sharedCommsService.addMessage = "Added " + totalAddedPoints + " of total " + (totalPointsToAdd) + " points";
                                sharedCommsService.bufferAndBroadcast("updatedAddMessage");
                            }
                        }).
                        error(function(data, status) {
                            $scope.data = data || "Request failed";
                        });

                        console.log("delay: " + delay + "; added " + addedPoints + " of " + total_to_geocode);

                        if (addedPoints == total_to_geocode) {
                            var elapsedTime = (Date.now() - addTime);
                            console.log("addedPoints " + addedPoints);
                            console.log("attempts " + attempts);
                            console.log("timeouts " + timeouts);
                            console.log("delay " + delay);
                            console.log("elapsed time: " + elapsedTime);
                            console.log((parseInt(elapsedTime / addedPoints)) + " ms per point");
                        } else {
                            retryLine = null;
                            if (delay > delayLimitToAccelerate)
                                delay -= acceleration;
                            $scope.addTimer = setTimeout(geocodeFunction, delay);
                        }
                    } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                        console.error("delay: " + delay + "; Error: " + status);
                        retryLine = null;
                        $scope.addTimer = setTimeout(geocodeFunction, delay);
                    } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                        // se QUERY_LIMIT
                        console.error("delay: " + delay + "; wait:" + wait + ";; Error query limit: " + status);
                        delay += delayAcceleration;
                        attempts++;
                        timeouts++;
                        retryLine = line;
                        $scope.addTimer = setTimeout(geocodeFunction, wait);
                    } else if (status == google.maps.GeocoderStatus.REQUEST_DENIED || status == google.maps.GeocoderStatus.INVALID_REQUEST) {

                    } else {
                        // se outro erro
                        console.error("delay: " + delay + "; Geocode was not successful for the following reason: " + status);
                        attempts++;
                        retryLine = line;
                        $scope.addTimer = setTimeout(geocodeFunction, wait);
                    }

                });

            } else {
                // retornar erro de daily quota reached
                console.log("geocoding terminated with problem: ");
                console.log("addedPoints " + addedPoints);
                console.log("attempts " + attempts);
                console.log("delay " + delay);
                console.log("elapsed time: " + (Date.now() - addTime));
            }

        }


        // set timeout da funcao
        if (lines.length > 0)
            $scope.addTimer = setTimeout(geocodeFunction, delay);


        // lines.forEach( function(elem){
        //   var addForm = {};
        //   var aux = elem.split("\t");
        //   // console.log(aux);
        //   // aux[1] = aux[1].replace(',', '.');
        //   // var str = aux[0].replace(/\//g, '-');

        //   var isToGeocode = (aux[0] == "" || aux[1] == "");

        //   // 0 e 1 sao latitude e longitude
        //   // se lat e lng forem do tipo degree, passar para decimal
        //   if( isDegreeCoord( aux[0]) ){
        //     // console.log("is degree! "+aux[0] );
        //     var parts = ParseDMS(aux[0]);
        //     aux[0] = ConvertDMSToDD(parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]), parts[3]);

        //     var partsLng = ParseDMS(aux[1]);
        //     aux[1] = ConvertDMSToDD(parseInt(partsLng[0]), parseInt(partsLng[1]), parseFloat(partsLng[2]), partsLng[3]);
        //   }

        //   // we may need to support degrees decimal minutes to decimal degrees: N 47° 38.938 W 122° 20.887      DDD° MM.MMM' DDD° MM.MMM'

        //   // NUNOOOOOOOOO if needs to geocode:
        //   // With a rate limit or 10 QPS (queries per second), on sending the 11th request your application should check the timestamp of the
        //   // first request and wait until 1 second has passed. The same should be applied to daily limits.



        //   if(isToGeocode){
        //     // incrementar contador
        //     // ver se estamos em contador <= 10
        //     // se sim, executa logo
        //     // se nao, executa faz reset ao contador
        //     var timeoutObj = timeouts.shift();
        //     var index = timeoutObj[0];
        //     var timeToWait = timeoutObj[1];

        //     var functionToGeocode = function(){
        //         geocoder.geocode( { 'address': aux[2] }, function(results, status){
        //         console.log(index+ " " +timeToWait+" of timeout. time since last geocode: "+ (Date.now() - addTime) );
        //         if (status == google.maps.GeocoderStatus.OK)
        //         {
        //             console.log("location: "+results[0].geometry.location);
        //             aux[0] = results[0].geometry.location.k;
        //             aux[1] = results[0].geometry.location.A;

        //             // console.log($scope.locationFindStatus + $scope.locationFindCoordinates);

        //             addForm.point = { lat: parseFloat(aux[0]), lng: parseFloat(aux[1]) };

        //             addForm.template = new Array();
        //             addForm.template.push({ text : aux[3] });

        //             addForm.attributes = {};
        //             for(var i = 0; i < attributes.length; i++){
        //               // console.log( attributes[i] + " : " + aux[3 + i]);
        //               if( aux[4 + i] != "" )
        //                 addForm.attributes[attributes[i]] = aux[4 + i];
        //             }

        //             addForm.autoIndicators = 'no';

        //             addForm.indicators = {};

        //             console.log(addForm);

        //             addedPoints++;
        //             console.log(index+" added "+addedPoints+" of "+total_to_geocode);
        //             if(addedPoints == total_to_geocode){
        //               console.log("addedPoints "+addedPoints);
        //               console.log("timedoutPoints "+timedoutPoints);
        //               console.log("elapsed time: "+(Date.now() - addTime));
        //             }
        //         }
        //         else
        //         {
        //             console.error(index+" Geocode was not successful for the following reason: " + status);
        //             timedoutPoints++;
        //             if(timedoutPoints < 50)
        //               setTimeout( functionToGeocode, timeToWait);
        //             else{
        //               console.log("geocoding terminated with problem: ");
        //               console.log("addedPoints "+addedPoints);
        //               console.log("timedoutPoints "+timedoutPoints);
        //               console.log("elapsed time: "+(Date.now() - addTime));
        //             }

        //         }
        //         // $scope.$digest();
        //     })
        //     };

        //     setTimeout( functionToGeocode, timeToWait);



        //   } else {
        //     addForm.point = { lat: parseFloat(aux[0]), lng: parseFloat(aux[1]) };

        //     addForm.template = new Array();
        //     addForm.template.push({ text : aux[3] });

        //     addForm.attributes = {};
        //     for(var i = 0; i < attributes.length; i++){
        //       // console.log( attributes[i] + " : " + aux[3 + i]);
        //       if( aux[4 + i] != "" )
        //         addForm.attributes[attributes[i]] = aux[4 + i];
        //     }

        //     addForm.autoIndicators = 'no';

        //     addForm.indicators = {};

        //     console.log(addForm);

        //     // $http.post('/geoapi/addPoint/'+$scope.pid, addForm).
        //     //   success(function(data, status) {
        //     //     var pointToAdd = data;
        //     //     console.log('added point '+pointToAdd.pointid);

        //     //     addedPoints++;
        //     //     if(addedPoints == (lines.length)){
        //     //       $scope.sentence = '';
        //     //       $scope.addMessage = "Finished adding all "+(lines.length)+" points ("+(Date.now() - beginAddPointsTimestamp)+" ms)";
        //     //       $scope.addMessageStyle = 'color:green;';
        //     //       sharedCommsService.bufferAndBroadcast("refreshPoints");
        //     //     } else {
        //     //       $scope.addMessage = "Added "+addedPoints+" of total "+(lines.length)+" points ("+(Date.now() - beginAddPointsTimestamp)+" ms)";
        //     //       $scope.addMessageStyle = 'color:#555;';
        //     //     }
        //     //   }).
        //     //   error(function (data, status) {
        //     //     $scope.data = data || "Request failed";
        //     //   });
        //   }



        // });


    }
};



function getIid(arr, title) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].title == title)
            return arr[i].iid;
    }
    return (-1);
};


function extractReadingsMultipoint(arr, levels) {
    // hardcoded to index 5 is date, and index 6 is value
    // added new field category with index 9
    // added new field product with index 10
    // added new field promoter with index 11
    // datalevels start at index 9 and go until 9 + levels.length-1 which is arr.length-1
    var readings = new Array();
    var startIndex = 9;
    var endIndex = startIndex + levels.length - 1;

    for (var i = 0; i < arr.length; i++) {
        var elem = arr[i];

        if (elem[5] != "" && elem[6] != "") {
            // var toPush = elem[5]+"\t"+elem[6]+"\t"+elem[9]+"\t"+elem[10]+"\t"+elem[11];
            var toPush = elem[5] + "\t" + elem[6];
            for (var j = startIndex; j <= endIndex; j++) {
                if (elem[j] == undefined) {
                    elem[j] = "";
                }
                toPush += "\t" + elem[j];
            }
            readings.push(toPush);
        }
    }
    return readings;
}


function extractReadings(arr) {
    // hardcoded to index 5 is date, and index 6 is value
    // added new field category with index 8
    var readings = new Array();
    for (var i = 0; i < arr.length; i++) {
        var elem = arr[i];

        if (elem[8] == undefined)
            elem[8] = "";

        if (elem[9] == undefined)
            elem[9] = "";

        if (elem[10] == undefined)
            elem[10] = "";

        if (elem[5] != "" && elem[6] != "")
            readings.push(elem[5] + "\t" + elem[6] + "\t" + elem[8] + "\t" + elem[9] + "\t" + elem[10]);
    }
    return readings;
}

function translateAlarm(val) {
    // val is a string
    val = val.toUpperCase();
    if (val == "Y" || val == "YES" || val == "YS" || val == "YE" || val == "S" || val == "SIM")
        return 'yes';
    else
        return 'no';
}



function getProps(obj) {
    var ret = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            ret.push(prop);
    }
    return ret;
}

function extractPointIdAndMatchingAttribute(points, attribute) {
    var ret = {};

    for (var i = 0; i < points.length; i++) {
        var elem = points[i];
        ret[elem.attributes[attribute]] = elem.pointid;
    }
    return ret;
}

var convertDateToYYYYMMDD = function(dateStr) {
    var toRet = dateStr;
    if (dateStr.charAt(2) == '-' || dateStr.charAt(2) == ' ' || dateStr.charAt(2) == '/') {
        // we need to convert
        toRet = "";
        toRet += dateStr.substring(6, 10);
        toRet += '-';
        toRet += dateStr.substring(3, 5);
        toRet += '-';
        toRet += dateStr.substring(0, 2);
    }
    return toRet;
}

var zero = function(i) {
    if (i < 10) i = "0" + i;
    return i;
}

var processOccurrences = function(pid, pointid, indicator, $http) {
    // for all line in indicator.readings
    // check if any line is out of interval data.min .max
    // if true, add occurrence on DB and send occurrence to socket
    var addedOccurrence = false;
    var tempDate = new Date();

    if (indicator.title == "Time")
        console.log("waahhhh");

    for (var i = 0; i < indicator.readings.length; i++) {
        var line = indicator.readings[i];
        var lineArr = line.split("\t");

        if (indicator.alarm == 'yes')
            console.log("alarm!!!");

        if (indicator.alarm == 'yes' && (parseFloat(lineArr[1]) < parseFloat(indicator.min) || parseFloat(lineArr[1]) > parseFloat(indicator.max))) {

            // api should add status: open + date: now() + lat,lng via pointid
            // we should send here title, pointid, occurrType
            var obj = {};

            var str = '';
            var preStr = '';
            if (parseFloat(lineArr[1]) > parseFloat(indicator.max))
                str = preStr + ' ' + 'Above the maximum value';
            else if (parseFloat(lineArr[1]) < parseFloat(indicator.min))
                str = preStr + ' ' + 'Below the minimum value';

            obj.title = str;
            obj.date = convertDateToYYYYMMDD(lineArr[0]);
            obj.pointid = pointid;
            obj.statusdate = new Date();
            obj.occtype_id = indicator.occtypeid_typ;
            obj.kpi = indicator.title;
            obj.value = parseFloat(lineArr[1]);
            obj.time = zero(tempDate.getHours()) + ':' + zero(tempDate.getMinutes());
            obj.max = indicator.max;
            obj.min = indicator.min;

            if (indicator.occtypeid_typ == null || indicator.occtypeid_typ == undefined) {
                console.error("indicator occurrence type is null");
            } else {

                $http.post('/api/newoccurrence/' + pid, obj).
                success(function(data, status) {
                    console.log("added occurrence");
                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                });

                addedOccurrence = true;
            }

        }
    }
    console.log("added any occurrence? " + addedOccurrence);
}


function tryAdd(matchAttr, matchesPointIds, groupedPointLines, $scope, $http, levels) {
    console.log("trying to add attr " + matchAttr);

    var pointIndicators;
    var donotadd = false;


    console.log("GET: " + ('/api/pointindicators/' + $scope.pid + '/' + matchesPointIds[matchAttr]));
    $http.get('/api/pointindicators/' + $scope.pid + '/' + matchesPointIds[matchAttr]).
    success(function(data, status) {


        console.log("matchAttr " + matchAttr);
        pointIndicators = data;


        var newLines = new Array();
        for (var key in groupedPointLines[matchAttr]) {
            if (groupedPointLines[matchAttr].hasOwnProperty(key)) {


                // console.log('groupedPointLines[matchAttr][key]');
                // console.log(groupedPointLines[matchAttr][key]);

                var readings = extractReadingsMultipoint(groupedPointLines[matchAttr][key], levels);
                $scope.addedIndicators++;

                var indicator = groupedPointLines[matchAttr][key][0];
                var form = {};
                form.title = indicator[0];
                form.unit = indicator[1];
                form.alarm = translateAlarm(indicator[2]);
                form.min = indicator[3];
                form.max = indicator[4];
                form.aggrmethod = indicator[8];
                form.value = '';
                form.readings = readings;

                // console.log('form');
                // console.log(form);


                // console.log("Via 1");

                // console.log("Posting new indicator on pointid "+matchesPointIds[matchAttr]);
                $scope.postedIndicator = form;


                // PASSO 1: obter o iid pelo pointid. se iid/indicador nao existir, fazer add indicator.
                var iid = getIid(pointIndicators, key)
                    // console.log("iid: "+iid);
                if (iid == -1) {
                    // PASSO 2: add indicator

                    // var indicator = groupedPointLines[matchAttr][key][0];
                    // var form = {};
                    // form.title = indicator[0];
                    // form.unit = indicator[1];
                    // form.alarm = translateAlarm(indicator[2]);
                    // form.min = indicator[3];
                    // form.max = indicator[4];
                    // form.aggrmethod = indicator[8];
                    // form.value = '';
                    // form.readings = readings;

                    // // console.log('form');
                    // // console.log(form);


                    console.log("Via 1");

                    // // console.log("Posting new indicator on pointid "+matchesPointIds[matchAttr]);
                    // $scope.postedIndicator = form;
                    // processOccurrences($scope.pid, matchesPointIds[matchAttr], $scope.postedIndicator);


                    if (!donotadd) {
                        var toSend = {
                            "form": form,
                            "levels": levels
                        };
                        $http.post('/api/indicatorAndReadings/' + $scope.pid + '/' + matchesPointIds[matchAttr], toSend).
                        success(function(data, status) {
                            var iid = data.iid;
                            processOccurrences($scope.pid, matchesPointIds[matchAttr], data.indicator, $http);

                        }).
                        error(function(data, status) {
                            // $scope.data = data || "Request failed";
                            $scope.lastAddedMsg = data || "Request failed";
                            $scope.lastAddedMsgStyle = 'color: red;';
                        });

                    }

                    $scope.addedReadings += groupedPointLines[matchAttr][key].length;

                    $scope.addMessage = 'Added ' + ($scope.addedReadings) + ' readings of total ' + ($scope.lines.length);

                    if ($scope.addedReadings == $scope.lines.length) {

                        $scope.addPointsButtonStyle = 'display: inline-block';
                        $scope.cancelAddPointsButtonStyle = 'display: none';
                        $scope.addMessage = 'Added ' + ($scope.addedReadings) + ' of total ' + ($scope.lines.length) + ' readings for ' + ($scope.addedIndicators) + ' indicators (' + (Date.now() - $scope.beginAddTimestamp) + ' ms)';
                        $scope.addMessageStyle = 'color:green;';
                    }

                } else {
                    // PASSO 2: fazer add dos readings para o iid.


                    console.log("Via 2");

                    // console.log("Posting readings to existing indicator "+iid+" on pointid "+matchesPointIds[matchAttr]);



                    if (!donotadd) {
                        // $http.post('/api/indicatorPointMultipleReadings/'+iid, readings).
                        var toSend = {
                            "readings": readings,
                            "levels": levels
                        };
                        $http.post('/api/indicatorReadings/' + iid, toSend).
                        success(function(data, status) {
                            // $scope.indicator.value = data.value;
                            data.readings = data.inputReadings;
                            processOccurrences($scope.pid, matchesPointIds[matchAttr], data, $http);

                        }).
                        error(function(data, status) {
                            $scope.data = data || "Request failed";
                        });
                    }


                    $scope.addedReadings += groupedPointLines[matchAttr][key].length;


                    $scope.addMessage = 'Added ' + ($scope.addedReadings) + ' readings of total ' + ($scope.lines.length);

                    if ($scope.addedReadings == $scope.lines.length) {

                        $scope.addPointsButtonStyle = 'display: inline-block';
                        $scope.cancelAddPointsButtonStyle = 'display: none';
                        $scope.addMessage = 'Added ' + ($scope.addedReadings) + ' of total ' + ($scope.lines.length) + ' readings for ' + ($scope.addedIndicators) + ' indicators (' + (Date.now() - $scope.beginAddTimestamp) + ' ms)';
                        $scope.addMessageStyle = 'color:green;';
                    }

                }
            }
        }


    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });

}


SpreadsheetGeojsonCtrl.$inject = ['$scope', '$http', '$routeParams', 'sharedCommsService'];

function SpreadsheetGeojsonCtrl($scope, $http, $routeParams, sharedCommsService) {
    console.log("SpreadsheetGeojsonCtrl");
    $scope.pid = $routeParams.pid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.addPointsButtonStyle = 'display: inline-block; background-color: lightgray;';
    $scope.addGeojsonButtonDisabled = false;
    $scope.bottomMatchDivStyle = 'display: none';
    $scope.cancelAddPointsButtonStyle = 'display: none';
    $scope.pointselected;
    $scope.indicatorselected;
    $scope.matchStatus = '';


    $scope.addMessage = "";



    $scope.saveGeojson = function() {
        console.log("saveGeojson");

        if ($scope.sentence2 != null && $scope.sentence2 != undefined && $scope.sentence2 != "") {


            try {
                var geometries = JSON.parse($scope.sentence2);
            } catch (err) {

                $scope.addMessage = 'Bad GeoJSON structure: ' + err.message;
                $scope.addMessageStyle = 'color:red;';
                return;
            }
            console.log(geometries.features);


            if (geometries.features != undefined && geometries.features.length > 0) {

                var missingPointKey = false;
                geometries.features.forEach(function(feature) {
                    if (feature.properties.hasOwnProperty("PointKey")) {

                    } else {
                        missingPointKey = true;
                    }
                });

                if (missingPointKey) {
                    $scope.addMessage = 'One or more GeoJSON feature has no property PointKey on feature.properties!';
                    $scope.addMessageStyle = 'color:red;';
                    return;
                } else {
                    console.log("GOING TO ADD GEOJSON");
                    $http.post('/geoapi/pointgeometries/' + $scope.pid, geometries).
                    success(function(data, status) {
                        console.log("success post");
                        $scope.sentence2 = "";
                        $scope.addMessage = 'Added GeoJSON!';
                        $scope.addMessageStyle = 'color:green;';
                    }).
                    error(function(data, status) {
                        $scope.data = data || "Request failed";
                    });
                }


                return;
            } else {
                $scope.addMessage = 'The GeoJSON has no features!';
                $scope.addMessageStyle = 'color:red;';
                return;
            }


        } else {
            $scope.addMessage = 'The GeoJSON input is empty!';
            $scope.addMessageStyle = 'color:red;';
            return;
        }

        // if($scope.sentence2.length <= 1){
        //   $scope.addMessage = 'The spreadsheet input format is incorrect!';
        //   $scope.addMessageStyle = 'color:red;';
        //   return;
        // }



    };

}


AddMultiIndicatorsSpreadsheetCtrl.$inject = ['$scope', '$http', '$routeParams', 'sharedCommsService'];

function AddMultiIndicatorsSpreadsheetCtrl($scope, $http, $routeParams, sharedCommsService) {
    console.log("AddMultiIndicatorsSpreadsheetCtrl");
    $scope.pid = $routeParams.pid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.addPointsButtonStyle = 'display: inline-block; background-color: lightgray;';
    $scope.addPointsButtonDisabled = true;
    $scope.bottomMatchDivStyle = 'display: none';
    $scope.cancelAddPointsButtonStyle = 'display: none';
    $scope.pointselected;
    $scope.indicatorselected;
    $scope.matchStatus = '';

    // populate the point attribute dropdown for $scope.pid
    $scope.pointoptions = [];
    var points = [];



    $scope.parseSpreadsheetColumns = function() {

        $http.get('/geoapi/' + $scope.pid).
        success(function(data, status) {
            console.log("yeah read geoapi!");

            points = data;

            data.forEach(function(elem, i) {
                var elemProps = getProps(elem.attributes);
                $scope.pointoptions = $scope.pointoptions.concat(elemProps);
                $scope.pointoptions = $scope.pointoptions.filter(function(item, pos) {
                    return $scope.pointoptions.indexOf(item) == pos
                });
            });


            // read all columns on the input
            $scope.parseMessage = '';

            console.log($scope.sentence2);
            if ($scope.sentence2 == undefined || $scope.sentence2 == '') {
                $scope.parseMessage = 'The spreadsheet input is empty!';
                $scope.parseMessageStyle = 'color:red;';
                return;
            }


            var lines = $scope.sentence2.split('\n');

            var firstLine = lines.shift(); // removing header line
            var attributes = (firstLine.split("\t"));

            // populate indicator attribute dropdown
            $scope.indicatoroptions = attributes;


            // show the attribute match div
            $scope.bottomMatchDivStyle = 'display: block;';

            // activate add indicators button
            $scope.addPointsButtonStyle = 'display: inline-block;';
            $scope.addPointsButtonDisabled = false;


            // // we can also automatically find if a point attribute is equal to an indicator attribute
            // for(var i=0; i<$scope.indicatoroptions.length; i++){
            //   var indexInPointOptions = $scope.pointoptions.indexOf($scope.indicatoroptions[i]);
            //   if(indexInPointOptions >= 0){
            //     console.log("found auto match");
            //     match = [$scope.pointoptions[indexInPointOptions], i];

            //     matchesPointIds = extractPointIdAndMatchingAttribute( points, $scope.pointoptions[indexInPointOptions] );

            //     $scope.pointselected = $scope.pointoptions[indexInPointOptions];
            //     $scope.indicatorselected = $scope.indicatoroptions[i];

            //     console.log($scope.pointselected);
            //     console.log($scope.indicatorselected);
            //     console.log("--------");

            //     return;
            //   }

            // }

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });



    }



    var match = [];
    var matchesPointIds = {};

    $scope.dropdownChange = function() {
        console.log($scope.pointselected);
        console.log($scope.indicatorselected);

        if ($scope.pointselected == $scope.indicatorselected) {
            $scope.matchStatus = 'match!';
            match = [$scope.pointselected, $scope.indicatoroptions.indexOf($scope.indicatorselected)];

            matchesPointIds = extractPointIdAndMatchingAttribute(points, $scope.pointselected);
            console.log("matchesPointIds");
            console.log(matchesPointIds);
        } else {
            $scope.matchStatus = 'no match...';
            match = [];
        }
    }

    var extractLevels = function(header) {
        var headerTokens = header.split("\t");
        var startingIndex = 9; // this is where the data levels begin
        var result = [];

        for (var i = startingIndex; i < headerTokens.length; i++) {
            result.push(headerTokens[i]);
        }

        return result;
    }

    var cancel = false;

    $scope.saveMultiSpreadsheet = function() {
        console.log("saveMultiSpreadsheet");


        $scope.lines = $scope.sentence2.split('\n');

        if ($scope.lines.length <= 1) {
            $scope.addMessage = 'The spreadsheet input format is incorrect!';
            $scope.addMessageStyle = 'color:red;';
            return;
        }

        $scope.addPointsButtonStyle = 'display: none';
        $scope.cancelAddPointsButtonStyle = 'display: inline-block';
        cancel = false;


        var firstLine = $scope.lines.shift(); // removing header line
        var levels = extractLevels(firstLine);


        $scope.addMessage = 'Adding ' + ($scope.lines.length) + ' readings';
        $scope.addMessageStyle = 'color:#555;';
        $scope.addedIndicators = 0;
        $scope.addedReadings = 0;
        $scope.beginAddTimestamp = Date.now();

        // group scattered indicator rows
        var groupedLines = {};

        for (var i = 0; i < $scope.lines.length; i++) {
            var elem = $scope.lines[i];
            var line = elem.split("\t");
            var title = line[0];
            if (!groupedLines.hasOwnProperty(title)) {
                groupedLines[title] = new Array();
            }
            groupedLines[title].push(line);
        }

        console.log("groupedLines");
        console.log(groupedLines);



        var groupedPointLines = {};

        for (var i = 0; i < $scope.lines.length; i++) {
            var elem = $scope.lines[i];
            var line = elem.split("\t");
            var keyField = line[match[1]];
            // console.log(keyField);
            if (!groupedPointLines.hasOwnProperty(keyField)) {
                groupedPointLines[keyField] = {};
            }


            var title = line[0];
            if (!groupedPointLines[keyField].hasOwnProperty(title)) {
                groupedPointLines[keyField][title] = new Array();
            }
            groupedPointLines[keyField][title].push(line);
        }

        console.log("groupedPointLines");
        console.log(groupedPointLines);


        for (var matchAttr in groupedPointLines) {
            console.log("attribute value " + matchAttr + " corresponds to pointid " + matchesPointIds[matchAttr]);

            tryAdd(matchAttr, matchesPointIds, groupedPointLines, $scope, $http, levels);



        } // end for var matchAttr in groupedPointLines



    }


}



AddIndicatorSpreadsheetCtrl.$inject = ['$scope', '$http', '$routeParams', 'sharedCommsService'];

function AddIndicatorSpreadsheetCtrl($scope, $http, $routeParams, sharedCommsService) {
    console.log('AddIndicatorSpreadsheetCtrl');
    $scope.pid = $routeParams.pid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");


    $scope.addPointsButtonStyle = 'display: inline-block';
    $scope.cancelAddPointsButtonStyle = 'display: none';
    var cancel = false;

    $scope.cancelAddSpreadsheet = function() {
        cancel = true;
        $scope.addMessage2 = "Cancelled!";
        $scope.addMessageStyle2 = 'color:red;';
        // clearTimeout($scope.addTimer);

        $scope.addPointsButtonStyle = 'display: inline-block';
        $scope.cancelAddPointsButtonStyle = 'display: none';
    }

    $scope.saveSpreadsheet = function() {
        console.log("saveSpreadsheet");

        if ($scope.sentence == undefined) {
            $scope.addMessage = 'The spreadsheet input is empty!';
            $scope.addMessageStyle = 'color:red;';
            return;
        }


        var lines = $scope.sentence.split('\n');

        if (lines.length <= 1) {
            $scope.addMessage = 'The spreadsheet input format is incorrect!';
            $scope.addMessageStyle = 'color:red;';
            return;
        }

        $scope.addPointsButtonStyle = 'display: none';
        $scope.cancelAddPointsButtonStyle = 'display: inline-block';
        cancel = false;


        var firstLine = lines.shift(); // removing header line


        $scope.addMessage = 'Adding ' + (lines.length) + ' readings';
        $scope.addMessageStyle = 'color:#555;';
        var addedIndicators = 0;
        var addedReadings = 0;
        var beginAddTimestamp = Date.now();

        // group scattered indicator rows
        var groupedLines = {};

        for (var i = 0; i < lines.length; i++) {
            var elem = lines[i];
            var line = elem.split("\t");
            var title = line[0];
            if (!groupedLines.hasOwnProperty(title)) {
                groupedLines[title] = new Array();
            }
            groupedLines[title].push(line);
        }

        console.log(groupedLines);

        var pointIndicators;
        $scope.addedReadingsApi = 0;

        var donotadd = false;

        $http.get('/api/pointindicators/' + $scope.pid + '/' + $scope.pointid).
        success(function(data, status) {



            pointIndicators = data;


            var newLines = new Array();
            for (var key in groupedLines) {
                if (groupedLines.hasOwnProperty(key)) {
                    // console.log('groupedLines[key]');
                    // console.log(groupedLines[key]);
                    var readings = extractReadings(groupedLines[key]);
                    addedIndicators++;
                    // console.log('readings');
                    // console.log(readings);
                    // newLines = newLines.concat(groupedLines[key]);

                    // PASSO 1: obter o iid pelo pointid. se iid/indicador nao existir, fazer add indicator.
                    var iid = getIid(pointIndicators, key)
                        // console.log("iid: "+iid);
                    if (iid == -1) {
                        // PASSO 2: add indicator



                        // Object {alarm: "yes", title: "sdf", value: "23", unit: "mm", min: "1"…}
                        //   alarm: "yes"
                        //   max: "333"
                        //   min: "1"
                        //   title: "sdf"
                        //   unit: "mm"
                        //   value: "23"
                        // console.log(groupedLines[key]);

                        var indicator = groupedLines[key][0];
                        var form = {};
                        form.title = indicator[0];
                        form.unit = indicator[1];
                        form.alarm = translateAlarm(indicator[2]);
                        form.min = indicator[3];
                        form.max = indicator[4];
                        form.aggrmethod = indicator[7];
                        form.value = '';
                        form.readings = readings;

                        // console.log('key');
                        // console.log(key);
                        // console.log('readings');
                        // console.log(readings);
                        console.log('form');
                        console.log(form);


                        console.log("Via 1");



                        if (!donotadd) {

                            $http.post('/api/indicatorAndReadings/' + $scope.pid + '/' + $scope.pointid, form).
                            success(function(data, status) {
                                var iid = data.iid;
                                var addedReadingsApiAux = data.addedReadings;
                                $scope.addedReadingsApi += addedReadingsApiAux;

                                if ($scope.addedReadingsApi == lines.length)
                                    sharedCommsService.bufferAndBroadcast("refreshIndicators");



                                //     // PASSO 2: fazer add dos readings para o iid. VER ABAIXO



                                // $http.post('/api/indicatorPointMultipleReadings/'+iid, readings).
                                //   success(function(data, status) {
                                //     // $scope.indicator.value = data.value;


                                //   }).
                                //   error(function (data, status) {
                                //     $scope.data = data || "Request failed";
                                //   });


                            }).
                            error(function(data, status) {
                                // $scope.data = data || "Request failed";
                                $scope.lastAddedMsg = data || "Request failed";
                                $scope.lastAddedMsgStyle = 'color: red;';
                            });

                        }



                        addedReadings += groupedLines[key].length;


                        $scope.addMessage = 'Added ' + (addedReadings) + ' readings of total ' + (lines.length);

                        if (addedReadings == lines.length) {

                            $scope.addPointsButtonStyle = 'display: inline-block';
                            $scope.cancelAddPointsButtonStyle = 'display: none';
                            $scope.addMessage = 'Added ' + (addedReadings) + ' of total ' + (lines.length) + ' readings for ' + (addedIndicators) + ' indicators (' + (Date.now() - beginAddTimestamp) + ' ms)';
                            $scope.addMessageStyle = 'color:green;';
                        }

                    } else {
                        // PASSO 2: fazer add dos readings para o iid.


                        console.log("Via 2");


                        if (!donotadd) {
                            $http.post('/api/indicatorPointMultipleReadings/' + iid, readings).
                            success(function(data, status) {
                                // $scope.indicator.value = data.value;


                            }).
                            error(function(data, status) {
                                $scope.data = data || "Request failed";
                            });
                        }



                        // readings tem de ser algo do genero:
                        // ["10/07/2014  7,7", "12/07/2014 7,9", "14/07/2014 7,8", "16/07/2014 7,7", "18/07/2014 7,5", "20/07/2014 7,3", "22/07/2014 7,5", "24/07/2014 7,9"]
                        // ["10/07/2014 7,7", "12/07/2014 7,9", "14/07/2014 7,8", "16/07/2014 7,7", "18/07/2014 7,5", "20/07/2014 7,3", "22/07/2014 7,5", "24/07/2014 7,9"]

                        // console.log('key');
                        // console.log(key);
                        // console.log('readings');
                        // console.log(readings);

                        addedReadings += groupedLines[key].length;
                        $scope.addedReadingsApi += groupedLines[key].length;

                        $scope.addMessage = 'Added ' + (addedReadings) + ' readings of total ' + (lines.length);

                        if (addedReadings == lines.length) {
                            sharedCommsService.bufferAndBroadcast("refreshIndicators");
                            $scope.addPointsButtonStyle = 'display: inline-block';
                            $scope.cancelAddPointsButtonStyle = 'display: none';
                            $scope.addMessage = 'Added ' + (addedReadings) + ' of total ' + (lines.length) + ' readings for ' + (addedIndicators) + ' indicators (' + (Date.now() - beginAddTimestamp) + ' ms)';
                            $scope.addMessageStyle = 'color:green;';
                        }

                    }
                }
            }


        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });



        // console.log('newLines');
        // console.log(newLines);


        // for(var j = 0; j < newLines.length; j++){
        //   console.log(newLines[j]);


        //   $scope.addMessage = 'Added '+(addedIndicators)+' readings of total '+(lines.length);
        //   addedIndicators++;
        // }



        // tirar a 1a linha
        // fazer ciclo para fazer parse
        // se existir na "cache", fazer add reading
        // se nao existir na "cache", adicionar a cache (o title apenas) e fazer add indicator + add reading

        // para evitar demasiadas idas à bd:
        // ir juntando as readings até aparecer um title diferente, e antes de tratar o novo title, fazer add multiple readings
        // para optimizar a acima, fazer logo no inicio uma ordenacao das linhas (juntar/desfragmentar tudo por title) e ja n precisa de fazer a tal cache
        // para cada grupo de title, ver se o indicator ja existe ou nao (se nao, recolher o title, unit, alarm, min e max e criar o indicator)
        // e enquanto nao chegar a um novo title, ir juntando num array de readings. quando chegar a um novo title ou ao fim, adicionar os readings e recomecar o ciclo.

    };

}


ProjectsCtrl.$inject = ['$scope', '$http', '$location', 'sharedCommsService', 'Profile'];

function ProjectsCtrl($scope, $http, $location, sharedCommsService, Profile) {
    $scope.showProjectsHelp = 0;
    console.log('ProjectsCtrl');
    // $scope.projects = [{id:'0', title:'California', area:'123'},{id:'1', title:'Texas', area:'321'}];
    $http.get('/api/projects').
    success(function(data, status) {
        // // // console.log("yeah read!");
        // // // console.log(data);
        $scope.projects = data;
        if ($scope.projects.length == 0)
            $scope.showProjectsHelp = 1;
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });

    $scope.userProfile = Profile.userprofile;
    console.log(Profile.userprofile);

    $scope.form = {};
    $scope.newProjectMsg = '';
    $scope.locationFindStatus = '';
    $scope.locationFindCoordinates = '';
    var geocoder = new google.maps.Geocoder();


    $scope.$watch('form.location', function(newVal, oldVal) {

        if ($scope.form.location != undefined && $scope.form.location != '') {
            $scope.locationFindStatus = 'Press confirm location to validate your input.';
            $scope.locationFindCoordinates = '';
            $scope.locationFindStatusStyle = 'color: #999999;';
        } else {
            $scope.locationFindStatus = '';
            $scope.locationFindCoordinates = '';
        }

    });

    $scope.checkLocation = function() {
        console.log("checkLocation: " + $scope.form.location);



        geocoder.geocode({
            'address': $scope.form.location
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                // console.log("location: "+results[0].geometry.location);
                $scope.locationFindStatus = "Found coordinates! ";
                $scope.locationFindCoordinates = "" + results[0].geometry.location;
                $scope.locationFindStatusStyle = 'color: green;';
                $scope.locationCoord = {};
                $scope.locationCoord.x = results[0].geometry.location.lat();
                $scope.locationCoord.y = results[0].geometry.location.lng();

                // console.log($scope.locationFindStatus + $scope.locationFindCoordinates);
            } else {
                // alert("Geocode was not successful for the following reason: " + status);
                $scope.locationFindStatus = "Couldn't find location. Reason: " + status;
                $scope.locationFindCoordinates = '';
                $scope.locationFindStatusStyle = 'color: red;';
            }
            $scope.$digest();
        });

    }



    $scope.submitNewProject = function() {

        // if($scope.form.location != undefined && $scope.form.location != ''){



        // }
        // return;


        // // console.log('submitNewProject '+(!$scope.form.hasOwnProperty('location')));
        // // console.log($scope.form);

        // if(!$scope.form.hasOwnProperty('title') || !$scope.form.hasOwnProperty('location') || !$scope.form.hasOwnProperty('area')){
        if (!$scope.form.hasOwnProperty('title')) {
            $scope.newProjectMsg = 'Missing the field Title.';
            $scope.newProjectMsgStyle = 'color: red;';
        } else {
            $scope.form.locationCoord = $scope.locationCoord;

            $http.post('/api/projects', $scope.form).
            success(function(data, status) {
                // // // console.log("yeah write!" + status);
                // // // console.log(data);
                $scope.projects = data.projects;
                var pid = data.pid;
                // $scope.projects.push($scope.form);
                $scope.newProjectMsg = 'Project ' + $scope.form.title + ' added with success.';
                $scope.newProjectMsgStyle = 'color: green;';
                $scope.form = {};

                // redirect to open project. Maybe we should have a timeout?
                $location.path('data/' + pid);
            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });
        }



    }

    $scope.deleteProject = function(item) {
        console.log("deleteProject: " + item.pid);

        sharedCommsService.deleteItem = {
            "type": "project",
            "pid": item.pid,
            "itemName": item.title
        };
        sharedCommsService.bufferAndBroadcast("confirmDelete");

        // $http.delete('/api/project/'+pid).
        //   success(function(data, status){
        //     // // // console.log("deleted project");
        //     // // // console.log(data);
        //     // $scope.projects = [];
        //     $scope.projects = data;
        //     // // // console.log($scope.projects);
        //   });

    }

    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.message == "doDelete") {
            // console.log("received message confirmDelete");
            // console.log(sharedCommsService.deleteItem);

            if (sharedCommsService.deleteItem.type == "project") {
                console.log("deleting project " + sharedCommsService.deleteItem.pid);

                $http.delete('/api/project/' + sharedCommsService.deleteItem.pid).
                success(function(data, status) {
                    // // // console.log("deleted project");
                    // // // console.log(data);
                    // $scope.projects = [];
                    $scope.projects = data;
                    // // // console.log($scope.projects);
                });
            }

        }
    });

};

// NEW DASH CTRL

// auxiliar functions
function addSpace(num) {

    var x = num.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';

    var rgx = /(\d+)(\d{3})/;

    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }

    return x1 + x2;
}

function formatNumber(num) {
    if (parseFloat(num) % 1 != 0 && isNaN(num) == false) {
        var number = parseFloat(num).toFixed(2) + '';
        return addSpace(number);
    } else if (isNaN(num) == false) {

        var number = num + '';
        return addSpace(number);
    } else return num;
}

xWidgetCtrl.$inject = ['$scope', '$http', '$routeParams', '$timeout', 'sharedCommsService', 'selectedAttrs', 'Profile', 'Occurrences', '$location'];

function xWidgetCtrl($scope, $http, $routeParams, $timeout, sharedCommsService, selectedAttrs, Profile, Occurrences, $location) {
    console.log('xWidgetCtrl');


    $scope.loading = false;
    $scope.occLoading = false;
    $scope.isLoading = true;

    $scope.graph = "ranking";

    $scope.$on('$locationChangeSuccess', function(event) {
        if ($location.path().indexOf('/map') >= 0)
            $scope.loading = true

        if ($location.path().indexOf('/occurrences') >= 0)
            $scope.occLoading = true
    })

    $scope.occurrences = Occurrences.occurrences;

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.showOpenOcc = false;
    //console.log($scope.showOpenOcc);
    $scope.openOcc = Occurrences.openOcc;

    if ($scope.openOcc > 0)
        $scope.showOpenOcc = true;
    else
        $scope.showOpenOcc = false;

    //console.log($scope.showOpenOcc);

    $scope.$watch('currOccurrence.status', function() {
        $scope.openOcc = Occurrences.openOcc;

        if ($scope.openOcc > 0)
            $scope.showOpenOcc = true;
        else
            $scope.showOpenOcc = false;

        //console.log($scope.showOpenOcc);
    });

    $scope.pid = $routeParams.pid;
    $scope.wid = $routeParams.wid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.userProfile = Profile.userprofile;
    //console.log(Profile.userprofile);

    $scope.pointid = $routeParams.pointid;

    $scope.sum = 0;
    $scope.nPoints = 0;
    $scope.minimum = null;
    $scope.maximum = null;


    if ($scope.pointid != undefined && $scope.pointid != null) {
        var query = '/api/pointdashboard/' + $scope.pid + "/" + $scope.pointid;

        $http.get(query).
        success(function(data, status) {
            $scope.project = data.project;
            $scope.pointname = nameFromAttributes(data.pattributes, $scope.pointid);

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

    // structure to hold the filtered points on filterBox
    $scope.pointsFilteredBox = new Array();



    var dataRanking = new Array();
    var dataCategoryRanking = new Array();
    var dataProductRanking = new Array();
    var pointIdAttributes = {};

    $scope.catFilters = {};
    $scope.prodFilters = {};
    var DEFAULT_PROD_FILTER = {};
    var DEFAULT_CAT_FILTER = {};
    var DEFAULT_POINTS_FILTER = {};
    var DEFAULT_DATE_FILTER = {};

    var DEFAULT_FILTER = {
        "dates": [],
        "points": [],
        "categories": [],
        "products": []
    };

    $scope.filterSpec = DEFAULT_FILTER;
    $scope.dateFilter = {};

    $http.get('/api/dashboard/' + $scope.pid).
    success(function(data, status) {
        $scope.project = data.project;

    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });


    if ($routeParams.wid == undefined || $routeParams.wid == null) {
        $http.get('/api/widgets/' + $scope.pid)
            .success(function(data, status) {

                // select the first wid
                console.log("api/widgets data");
                if (data.length > 0 && data[0].hasOwnProperty('wid')) {
                    $scope.wid = data[0].wid;

                    sharedCommsService.wid = $scope.wid;
                    sharedCommsService.bufferAndBroadcast("updateWid");

                    if ($scope.widgets != undefined && $scope.widgets != null) {
                        for (var i = 0; i < $scope.widgets.length; i++) {
                            var w = $scope.widgets[i];
                            if (w.wid == $scope.wid) {
                                $scope.widgets[i].isActive = true;
                            }
                        }
                    }
                }



                var query = '/api/widgetIndicators/' + $scope.pid + '/' + $scope.wid;

                if ($scope.pointid != null && $scope.pointid != undefined) {
                    query += '/' + $scope.pointid;
                }



                $http.get(query).
                success(function(data, status) {

                    console.log("/api/widgetIndicators/", data);

                    $scope.widget = data.widget;

                    if ($scope.widget.hasOwnProperty("date"))
                        $scope.widget.date = $scope.widget.date.replace(' 00:00:00:000000', '');

                    $scope.indicators = data.indicators;

                    for (var i = 0; i < $scope.indicators.length; i++) {
                        var ind = $scope.indicators[i];
                        if (ind.title == $scope.widget.title)
                            $scope.indicator = ind;
                    }

                    $scope.categories = [];
                    $scope.products = [];
                    $scope.prodCatMap = {};

                    $http.get('/api/pointsFromWidget/' + $scope.pid + '/' + $scope.wid).
                    success(function(data, status) {
                        console.log("/api/pointsFromWidget/", data);

                        $scope.npsvalues = data.npsvalues;

                        // for(var d in data.locations){
                        for (var d = 0; d < data.locations.length; d++) {

                            $scope.pointsFilteredBox[data.locations[d].pointid] = true;

                            pointIdAttributes[data.locations[d].pointid] = data.locations[d].attributes;
                            pointIdAttributes[data.locations[d].pointid].type = data.locations[d].type;

                        }

                        // console.log("max is "+max);
                        // processValues(data.ranking);
                        processValues(data.ordFiltValues, data.npsvalues, null);
                        totalGraphs($scope.widget.title);
                        getHistoryTotal();
                        standardError();
                        $scope.isLoading = false;

                    }).
                    error(function(data, status) {});

                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                });


            })
            .error(function(data, status) {
                // $scope.data = data || "Request failed";
                $scope.lastAddedMsg = data || "Request failed";
            });

    }


    // ENVIAR:
    // request por wid
    // RECEBER:
    // num de pontos com indicador widget.title
    // value de todos os pontos (para dps aqui fazer a media e mostrar o ranking)
    // history de cada ponto
    // console.log('/api/widgetIndicators/'+$scope.pid+'/'+$scope.wid);

    /*if ($scope.pointid != null && $scope.pointid != undefined){
        query += '/' + $scope.pointid;
    }*/

    $scope.applyFilter = function(usingFilterBox) {
        console.log("applyFilter");
        if (usingFilterBox) {
            //console.log($scope.pointsFilteredBox);

            var listOfPointsToFilter = new Array();

            for (var pointid in $scope.pointsFilteredBox) {
                if ($scope.pointsFilteredBox.hasOwnProperty(pointid)) {
                    if ($scope.pointsFilteredBox[pointid] == true)
                        listOfPointsToFilter.push(+pointid);
                }
            }

            $scope.filterSpec.points = listOfPointsToFilter;
            //console.log($scope.filterSpec);
        }

        var query = '/api/widgetIndicatorsFilter/' + $scope.pid + '/' + $scope.wid;

        $http.post(query, $scope.filterSpec)
            .success(function(data, status) {

                console.log("/api/widgetIndicatorsFilter/", data);

                $scope.exampleData = [{
                    "key": "History",
                    "values": []
                }];


                dataRanking = [];
                dataProductRanking = [];
                dataCategoryRanking = [];
                $scope.sum = 0;
                $scope.nPoints = 0;
                $scope.minimum = null;
                $scope.maximum = null;


                $scope.widget = data.widget;

                if ($scope.widget.hasOwnProperty("date"))
                    $scope.widget.date = $scope.widget.date.replace(' 00:00:00:000000', '');

                $scope.indicators = data.indicators;

                for (var i = 0; i < $scope.indicators.length; i++) {
                    var ind = $scope.indicators[i];
                    if (ind.title == $scope.widget.title)
                        $scope.indicator = ind;
                }

                $scope.categories = [];
                $scope.products = [];
                $scope.prodCatMap = {};

                $scope.ordFiltValues = data.ordFiltValues;
                $scope.npsvaluesfiltered = data.npsvaluesfiltered;

                $http.get('/api/pointsFromWidget/' + $scope.pid + '/' + $scope.wid)
                    .success(function(data, status) {
                        console.log("/api/pointsFromWidget/", data);

                        if ($scope.npsvaluesfiltered == undefined)
                            $scope.npsvaluesfiltered = data.npsvalues;

                        // NUNOALEX if in $scope.filterSpec.points NOT REQUIRED I THINK

                        for (var d = 0; d < data.locations.length; d++) {
                            pointIdAttributes[data.locations[d].pointid] = data.locations[d].attributes;
                            pointIdAttributes[data.locations[d].pointid].type = data.locations[d].type;
                        }

                        // console.log("max is "+max);
                        StoresHistory();
                        //processValues(null, $scope.npsvaluesfiltered, $scope.accumRanking);
                        totalGraphs($scope.widget.title);
                        getHistoryTotal();
                        standardError();

                        if (usingFilterBox) {
                            // we need to communicate to controller DemoWidgetPointsController that a filter was applied
                            sharedCommsService.widgetFilter = $scope.filterSpec;
                            sharedCommsService.bufferAndBroadcast("filterSpec");
                            sharedCommsService.bufferAndBroadcast("eraseFilterGeo");

                            //$scope.applyFilterButtonDisabled = false;
                            //$scope.applyFilterButtonText = 'Apply Filter';
                            //$scope.filterBoxFunction('apply');

                            $scope.dateFilter.stateapplied = $scope.filterSpec.dates.state;
                        }

                        $http.post('/dashboard/pointranking/' + $scope.pid + '/' + $scope.wid, $scope.filterSpec).
                        success(function(data, status) {

                            console.log("/dashboard/pointranking/", data);

                            if (data.length > 0) {
                                var pointRanking = new Array();
                                for (var i = 0; i < data.length; i++) {
                                    var aux = data[i];
                                    pointRanking.push([translatePointId(aux.pointid_point), +aux.value])
                                    checkMinimum(+data[i].value);
                                    checkMaximum(+data[i].value);
                                    $scope.sum += +data[i].value;
                                    $scope.nPoints++;
                                }

                                $scope.exampleDataRanking =
                                    [{
                                        "key": "Ranking",
                                        "values": pointRanking
                                    }];

                                $scope.setSelectedChart('Ranking');
                            }
                            $scope.isLoading = false;

                        }).error(function(data, status) {});

                    }).error(function(data, status) {});

            }).error(function(data, status) {
                // $scope.data = data || "Request failed";
                $scope.lastAddedMsg = data || "Request failed";
                $scope.lastAddedMsgStyle = 'color: red;';
            });
    }


    if (sharedCommsService.messageFilter == "updatedFilter") {
        $scope.filterSpec = sharedCommsService.filterSpec;
        $scope.dateFilter = sharedCommsService.filterSpec.dates;

        console.log("dateFilter from WidgetCtrl", $scope.dateFilter);
        console.log("filterSpec from WidgetCtrl", $scope.filterSpec);
        $scope.applyFilter(true);
    } else {

        if ($scope.pid != undefined && $scope.wid != undefined) {

            $http.get('/api/widgetIndicators/' + $scope.pid + '/' + $scope.wid).
            success(function(data, status) {

                console.log("/api/widgetIndicators/", data);

                $scope.widget = data.widget;

                if ($scope.widget.hasOwnProperty("date"))
                    $scope.widget.date = $scope.widget.date.replace(' 00:00:00:000000', '');

                $scope.indicators = data.indicators;

                for (var i = 0; i < $scope.indicators.length; i++) {
                    var ind = $scope.indicators[i];
                    if (ind.title == $scope.widget.title)
                        $scope.indicator = ind;
                }

                $scope.categories = [];
                $scope.products = [];
                $scope.prodCatMap = {};

                $http.get('/api/pointsFromWidget/' + $scope.pid + '/' + $scope.wid).
                success(function(data, status) {
                    console.log("/api/pointsFromWidget/", data);

                    $scope.npsvalues = data.npsvalues;

                    // for(var d in data.locations){
                    for (var d = 0; d < data.locations.length; d++) {

                        $scope.pointsFilteredBox[data.locations[d].pointid] = true;

                        pointIdAttributes[data.locations[d].pointid] = data.locations[d].attributes;
                        pointIdAttributes[data.locations[d].pointid].type = data.locations[d].type;

                    }

                    // console.log("max is "+max);
                    // processValues(data.ranking);
                    StoresHistory();
                    //processValues(data.ordFiltValues, data.npsvalues, null);
                    //totalGraphs($scope.widget.title);
                    getHistoryTotal();
                    standardError();
                    $http.post('/dashboard/pointranking/' + $scope.pid + '/' + $scope.wid, $scope.filterSpec).
                    success(function(data, status) {

                        console.log("/dashboard/pointranking/", data);

                        if (data.length > 0) {
                            var pointRanking = new Array();
                            for (var i = 0; i < data.length; i++) {
                                var aux = data[i];
                                pointRanking.push([translatePointId(aux.pointid_point), +aux.value])
                                checkMinimum(+data[i].value);
                                checkMaximum(+data[i].value);
                                $scope.sum += +data[i].value;
                                $scope.nPoints++;
                            }

                            $scope.exampleDataRanking =
                                [{
                                    "key": "Ranking",
                                    "values": pointRanking
                                }];

                            $scope.setSelectedChart('Ranking');
                        }

                        $scope.isLoading = false;
                    }).error(function(data, status) {});

                }).
                error(function(data, status) {});

            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });

        }


    }

    $scope.parseFloat = function(value, steps) {
        return parseFloat(value).toFixed(steps);
    }

    function translatePointId(id) {
        var attrName;

        if (pointIdAttributes == null || pointIdAttributes == undefined) {
            return id;
        }

        if (pointIdAttributes[id].hasOwnProperty("StoreCodeAbbrv")) {
            attrName = "StoreCodeAbbrv";
        } else if (pointIdAttributes[id].hasOwnProperty("name")) {
            attrName = "name";
        } else if (pointIdAttributes[id].hasOwnProperty("PointKey")) {
            attrName = "PointKey";
        } else if (pointIdAttributes[id].hasOwnProperty("Point_Key")) {
            attrName = "Point_Key";
        } else {
            return id;
        }
        return pointIdAttributes[id][attrName];
    }

    function translateFullPointId(id) {
        var attrName;
        if (pointIdAttributes[id].hasOwnProperty("StoreCodeAbbrv")) {
            attrName = "StoreCodeAbbrv";
        } else if (pointIdAttributes[id].hasOwnProperty("name")) {
            attrName = "name";
        } else if (pointIdAttributes[id].hasOwnProperty("PointKey")) {
            attrName = "PointKey";
        } else if (pointIdAttributes[id].hasOwnProperty("Point_Key")) {
            attrName = "Point_Key";
        } else {
            return id;
        }
        return getFullPointData(id)[attrName];
    }

    function getFullPointData(id) {
        return pointIdAttributes[id];
    }



    // $scope.exampleDataRankingMulti = [
    //     {
    //        "key": "Frozen Foods",
    //         "values": [ [ "SP" , 123] , [ "RJ", 155]  ]
    //     },
    //     {
    //         "key": "Snacks",
    //         "values": [ [ "SP" , 223] , [ "RJ", 115]  ]
    //     },
    //     {
    //         "key": "Cereals",
    //         "values": [ [ "SP" , 444] , [ "RJ", 1050]  ]
    //     }
    // ];



    function getLastDate(arr) {

        var lastDate;

        for (var i = 0; i < arr.length; i++) {
            if (lastDate == undefined || lastDate == null)
                lastDate = arr[i][0];
            else {
                if (new Date(arr[i][0]) > new Date(lastDate))
                    lastDate = arr[i][0];
            }
        }

        return lastDate;
    }

    function hasFalseValue(obj) {
        // function to validate if a javascript object has any property with a false value
        // e.g. input for obj = { "prop1" : true, "prop2" : false}
        for (var prop in obj) {
            if (obj[prop] == false)
                return true;
        }
        return false;
    }

    function isFiltering(currFilter) {
        // return false if currFilter has all properties with [] or the filled properties only have { "prop1": true, "prop2": true}
        for (var prop in currFilter) {
            if (currFilter[prop].length == 0)
                continue;
            else {
                if (hasFalseValue(currFilter[prop][0]))
                    return true;
            }
        }
        return false;
    }

    function getLastDateValueFiltered(arr, lastDate, filter, aggrmethod) {

        console.log("getLastDateValueFiltered");

        var accumValue = 0;
        var filteredProducts = [];
        var filteredValues = [];
        var ctr = 0;

        // put all filtered (products) on a simple array ["Chex", "Wheaties"]
        for (var p in filter.products[0]) {
            if (filter.products[0][p] == true)
                filteredProducts.push(p);
        }

        // transverse all readings on arr with date lastDate
        for (var i = 0; i < arr.length; i++) {

            if ($scope.dateFilter.state == true) {
                var reading = arr[i];

                //if( new Date(reading[0]).getTime() == new Date(lastDate).getTime() ){

                filteredValues.push(+reading[1]);

                // if reading has product on simple array, accumulate (dont do that, values already come filtered from Backend API)
                if (aggrmethod != "average") {
                    accumValue += +reading[1];
                } else {
                    ctr++;
                    accumValue = accumValue * (ctr - 1) / ctr + +reading[1] / ctr;
                }
                //}
            } else {
                var reading = arr[i];

                if (lastDate == reading[0]) {
                    filteredValues.push(+reading[1]);

                    // if reading has product on simple array, accumulate (dont do that, values already come filtered from Backend API)
                    if (aggrmethod != "average") {
                        accumValue += +reading[1];
                    } else {
                        ctr++;
                        accumValue = accumValue * (ctr - 1) / ctr + +reading[1] / ctr;
                    }
                }
            }
        }
        // return accumulated value
        return accumValue;
    }

    function getHistoryTotal() {

        var filter = angular.copy($scope.filterSpec);
        filter.title = $scope.widget.title;
        filter.aggrmethod = $scope.widget.aggrmethod;
        if ($scope.filterSpec.dates.state == false || $scope.filterSpec.dates.state == undefined) {
            filter.endDate = $scope.widget.date;

            var dt = new Date($scope.widget.date);

            dt.setDate(dt.getDate() - 30);

            var day = dt.getDate();
            var month = dt.getMonth() + 1;

            if ((dt.getMonth() + 1) < 10)
                month = '0' + (dt.getMonth() + 1)

            if (dt.getDate() < 10)
                day = '0' + dt.getDate();

            filter.startDate = dt.getFullYear() + '-' + month + '-' + day;

        } else {
            filter.startDate = $scope.filterSpec.dates.startdate;
            filter.endDate = $scope.filterSpec.dates.finishdate;
        }

        filter.chart = {
            xAxis: 'dates'
        };


        $http.post('/dashboard/getHistoryTotal/' + $scope.pid, filter).
        then(

            function(data, status) {

                fillChart(data)
            },

            function(error) {
                console.log('error', error)
            }
        );
    }

    $scope.chartHistoryTotal = {

        config: {
            options: {
                chart: {
                    type: 'line',
                },
                subtitle: {
                    text: ''
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    startOnTick: false
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: false
                        },
                        enableMouseTracking: true
                    },
                    column: {

                    },
                }
                //for reference
                //tooltip: {
                //pointFormat: 'Population in 2008: <b>{point.y:.1f} millions</b>' // Ex
                //}
            },
            title: {
                text: ''
            },

            xAxis: {
                type: '',
                categories: [],
                labels: {
                    rotation: -45,
                    style: {
                        fontSize: '10px',
                        fontFamily: 'Verdana, sans-serif'
                    }
                }
            },

            series: [
                /*
                for reference
                {   
                    type:'',
                    name : 'shit',
                    data: [0, 10, 15, 12, 8, 7, 10, 15, 55, 98, 30, 10]
                },
                {   
                    type:'',
                    name : 'not',
                    data: [10, 20, 35, 22, 18, 17, 5, 4, 2, 10, 10]
                }*/
            ],
            size: {
                //width: 400,
                height: 280
            },
            loading: false,

            func: function(chart) {
                $timeout(function() {
                    chart.reflow();
                }, 0);
            }
        }

    };


    function fillChart(response) {


        $scope.chartHistoryTotal.config.xAxis.categories = [];
        var addedCategories = {};
        var added = 0;
        var zeroedData = [];
        $scope.chartHistoryTotal.config.series = [];



        var series = response.data;
        for (var i = 0; i < series.length; i++) {
            var xaxis_name = cleanXAxisName(series[i].xaxis);
            if (!addedCategories.hasOwnProperty(xaxis_name)) {
                addedCategories[xaxis_name] = added;
                added++;
                $scope.chartHistoryTotal.config.xAxis.categories.push(xaxis_name.replace(' 00:00:00:000000', ''));
                zeroedData.push(0);
            }
        }



        var series = response.data;

        var tempSeries = {
            name: series.name,
            data: zeroedData.slice()
        };

        for (var i = 0; i < series.length; i++) {
            var xaxis_name = cleanXAxisName(series[i].xaxis);
            // we need to try to add all xaxis of all results! but in a distinct add approach
            tempSeries.data[addedCategories[xaxis_name]] = parseFloat(series[i].value);
            // tempSeries.data.push([series.data[i].xaxis, parseFloat(series.data[i].value)]);
            // tempSeries.data.push(parseFloat(series.data[i].value));
        }

        $scope.chartHistoryTotal.config.series.push(tempSeries);



        $timeout(function() {
            $scope.$broadcast('highchartsng.reflow');
        }, 0);
    }

    var cleanXAxisName = function(raw_name) {
        var toReturn = raw_name;
        toReturn = toReturn.replace(/\\/g, '');
        if (toReturn.charAt(0) == '"' && toReturn.charAt(toReturn.length - 1) == '"') {
            toReturn = toReturn.slice(1, -1);
        }
        return toReturn;
    }

    // adapt from processValues
    function StoresHistory() {

        var chartReadingsArray = [];

        dataProductRanking = new Array();


        $scope.stackedData = new Array()

        for (var j = 0; j < $scope.indicators.length; j++) {
            var elem = $scope.indicators[j];

            if (elem.value != undefined && elem.value != null) {

                $scope.unit = elem.unit;

                if (elem.pointid_point != "") {
                    var readingsArray = convertObjectArrayToArrayArray(elem.readingsDoubleArr);
                    var highestDateOnReadings = getLastDate(readingsArray);
                    var comparingDate = new Date(highestDateOnReadings);
                    var filteredDate = new Date($scope.widget.date);


                    if (elem.readingsDoubleArr.length > 0) {
                        var readingsArrayAccum = new Array();
                        for (var k = 0; k < readingsArray.length; k++) {
                            // console.log(readingsArray[k]);
                            // only push if filter allows it!! e.g. if filter has Marco Belinni to false, we shouldnt accumPush it
                            accumPush(readingsArrayAccum, readingsArray[k], "date", elem.aggrmethod, $scope.filterSpec);


                            var satisfLevel = readingsArray[k][2];
                            // console.log(readingsArray[k]);


                            for (var l = 0; l < $scope.stackedData.length; l++) {
                                if ($scope.stackedData[l].key == satisfLevel) {
                                    var updated = false;
                                    for (var m = 0; m < $scope.stackedData[l].values.length; m++) {

                                        var x = new Date($scope.stackedData[l].values[m][0]);
                                        var y = new Date(readingsArray[k][0]);
                                        if (x.getTime() === y.getTime()) {
                                            $scope.stackedData[l].values[m][1] += readingsArray[k][1];
                                            updated = true;
                                            // console.log("UPDATE");
                                        }
                                    }
                                    if (!updated) {

                                        orderedDateAdd($scope.stackedData[l].values, [readingsArray[k][0], readingsArray[k][1]]);
                                    }
                                }
                            }
                        }

                        chartReadingsArray.push({
                            "key": translatePointId(elem.pointid_point),
                            "values": readingsArrayAccum
                        });
                    }
                }
            }

            if (j == $scope.indicators.length - 1) {

                $scope.exampleDataRankingMulti = dataCategoryRanking;

                //NPS values into $scope.exampleData just for NPS INDEX (HoN) widget (assuming just two points with HoN!!!)
                if ($scope.widget.title == "NPS INDEX (HoN)" && $scope.npsvalues != null && $scope.npsvalues != undefined) {
                    $scope.exampleData = [{
                        "key": [],
                        "values": []
                    }, {
                        "key": [],
                        "values": []
                    }];

                    for (var i = 0; i < $scope.npsvalues.length; i++) {

                        if (i == 0) {

                            $scope.exampleData[0].key = translatePointId($scope.npsvalues[i].pointid);
                            $scope.exampleData[0].values.push([new Date($scope.npsvalues[i].dates), Math.round($scope.npsvalues[i].nps), "", "", ""]);
                        } else {

                            if ($scope.exampleData[0].key == translatePointId($scope.npsvalues[i].pointid)) {

                                $scope.exampleData[0].key = translatePointId($scope.npsvalues[i].pointid);
                                $scope.exampleData[0].values.push([new Date($scope.npsvalues[i].dates), Math.round($scope.npsvalues[i].nps), "", "", ""]);

                            } else {

                                $scope.exampleData[1].key = translatePointId($scope.npsvalues[i].pointid);
                                $scope.exampleData[1].values.push([new Date($scope.npsvalues[i].dates), Math.round($scope.npsvalues[i].nps), "", "", ""]);


                            }
                        }

                    }

                    if ($scope.filterSpec.points.length == 1) {
                        if ($scope.exampleData[0].key == translatePointId($scope.filterSpec.points[0]))
                            $scope.exampleData = [$scope.exampleData[0]];
                        else
                            $scope.exampleData = [$scope.exampleData[1]];
                    }
                    console.log($scope.exampleData);
                } else {
                    $scope.exampleData = chartReadingsArray;
                    $scope.exampleDataLarge = chartReadingsArray.slice(0);

                    $scope.chartReadingsArray = chartReadingsArray;
                }
            }
        }
    }

    function processValues(ranking, npsvalues, accRanking) {

        console.log("processValues");
        //console.log("filterSpec from processValues", $scope.filterSpec);

        var chartReadingsArray = [];
        // $scope.indicators.forEach(function(elem);
        dataProductRanking = new Array();

        if (ranking != undefined && ranking != null) {

            for (var i = 0; i < ranking.length; i++) {
                var pointrankingaux = ranking[i];
                dataRanking.push([translatePointId(pointrankingaux.pointid_point), parseFloat(pointrankingaux.valuesjson["f2"].toFixed(2))])
                checkMinimum(parseFloat(+pointrankingaux.valuesjson["f2"]));
                checkMaximum(parseFloat(+pointrankingaux.valuesjson["f2"]));
                $scope.sum += parseFloat(+pointrankingaux.valuesjson["f2"]);
                $scope.nPoints++;
            }

            //var latestDate = ranking[0].ts;

            var objs = {};


            if (selectedAttrs.pointid != undefined)
                $scope.selectedMarkerKey = translatePointId(selectedAttrs.pointid);

            $scope.exampleDataRanking =
                [{
                    "key": "Ranking",
                    "values": dataRanking
                }];

            $scope.setSelectedChart('Ranking');
        }

        if (accRanking != null) {
            var objs = {};

            for (var i = 0; i < accRanking.length; i++) {
                objs[accRanking[i].pointid_point] = {};

                objs[accRanking[i].pointid_point].basket = parseFloat(accRanking[i].basket);
                objs[accRanking[i].pointid_point].accMargin = parseFloat(accRanking[i].acc_margin);
                objs[accRanking[i].pointid_point].accBills = parseFloat(accRanking[i].acc_bills);
                objs[accRanking[i].pointid_point].stock = parseFloat(accRanking[i].values);
            }

            for (var obj in objs) {

                var temp = {};
                temp.pointid_point = obj;

                if (isNaN(objs[obj].basket) == false)
                    temp.average = objs[obj].basket;

                if (isNaN(objs[obj].accMargin) == false)
                    temp.average = objs[obj].accMargin;

                if (isNaN(objs[obj].accBills) == false)
                    temp.average = objs[obj].accBills;

                if (isNaN(objs[obj].stock) == false)
                    temp.average = objs[obj].stock;

                orderedPairAdd(dataRanking, [translatePointId(temp.pointid_point), +temp.average], true);
                checkMinimum(parseFloat(+temp.average));
                checkMaximum(parseFloat(+temp.average));
                $scope.sum += parseFloat(+temp.average);
                $scope.nPoints++;
            }

            if (selectedAttrs.pointid != undefined)
                $scope.selectedMarkerKey = translatePointId(selectedAttrs.pointid);

            $scope.exampleDataRanking =
                [{
                    "key": "Ranking",
                    "values": dataRanking
                }];

            $scope.setSelectedChart('Ranking');
        }

        $scope.stackedData = [{
            "key": "Very Negative",
            "values": []
        }, {
            "key": "Negative",
            "values": []
        }, {
            "key": "Positive",
            "values": []
        }, {
            "key": "Very Positive",
            "values": []
        }];


        for (var j = 0; j < $scope.indicators.length; j++) {
            var elem = $scope.indicators[j];

            if (elem.value != undefined && elem.value != null) {

                $scope.unit = elem.unit;

                if (elem.pointid_point != "") {
                    var readingsArray = convertObjectArrayToArrayArray(elem.readingsDoubleArr);
                    var highestDateOnReadings = getLastDate(readingsArray);
                    var comparingDate = new Date(highestDateOnReadings);
                    var filteredDate = new Date($scope.widget.date);

                    if ($scope.dateFilter.state == true)
                        filteredDate = new Date($scope.dateFilter.finishdate);

                    filteredDate.setHours(comparingDate.getHours());

                    // console.log(comparingDate);
                    // console.log( (filteredDate.getTime() == comparingDate.getTime()) );
                    if ($scope.dateFilter.state == true) {
                        if (comparingDate.getTime() <= filteredDate.getTime()) {
                            if ((ranking == undefined || ranking == null) && accRanking == null) {
                                // console.log("Point " + translatePointId(elem.pointid_point) + " Value " + (+elem.value));
                                // console.log("is filtering: "+(isFiltering($scope.filterSpec)) );
                                // if(!isFiltering($scope.filterSpec)){
                                //   orderedPairAdd(dataRanking, [ translatePointId(elem.pointid_point), +elem.value ]);
                                //   checkMinimum(parseFloat(+elem.value).toFixed(2));
                                //   checkMaximum(parseFloat(+elem.value).toFixed(2));
                                //   $scope.sum += parseFloat(+elem.value);
                                // } else {
                                // we need to find the filtered (products, for now) lastDate values
                                var ldValue = getLastDateValueFiltered(readingsArray, highestDateOnReadings, $scope.filterSpec, elem.aggrmethod);
                                orderedPairAdd(dataRanking, [translatePointId(elem.pointid_point), +ldValue], true);
                                checkMinimum(parseFloat(+ldValue));
                                checkMaximum(parseFloat(+ldValue));
                                $scope.sum += parseFloat(+ldValue);
                                // }
                                $scope.nPoints++;
                            }
                        }
                    } else {

                        if (comparingDate.getTime() == filteredDate.getTime()) {
                            if ((ranking == undefined || ranking == null) && accRanking == null) {
                                // console.log("Point " + translatePointId(elem.pointid_point) + " Value " + (+elem.value));
                                // console.log("is filtering: "+(isFiltering($scope.filterSpec)) );
                                // if(!isFiltering($scope.filterSpec)){
                                //   orderedPairAdd(dataRanking, [ translatePointId(elem.pointid_point), +elem.value ]);
                                //   checkMinimum(parseFloat(+elem.value).toFixed(2));
                                //   checkMaximum(parseFloat(+elem.value).toFixed(2));
                                //   $scope.sum += parseFloat(+elem.value);
                                // } else {
                                // we need to find the filtered (products, for now) lastDate values
                                var ldValue = getLastDateValueFiltered(readingsArray, highestDateOnReadings, $scope.filterSpec, elem.aggrmethod);
                                orderedPairAdd(dataRanking, [translatePointId(elem.pointid_point), +ldValue], true);
                                checkMinimum(parseFloat(+ldValue));
                                checkMaximum(parseFloat(+ldValue));
                                $scope.sum += parseFloat(+ldValue);
                                // }
                                $scope.nPoints++;
                            }
                        }
                    }

                    if ((ranking == undefined || ranking == null) && accRanking == null) {
                        $scope.exampleDataRanking = [{
                            "key": "Ranking",
                            "values": dataRanking
                        }];

                        $scope.setSelectedChart('Ranking');
                    }

                    // $scope.exampleDataRanking = [
                    // {
                    // "key": "Series 1",
                    // "values": [ [ 3 , 88] , [ 8 , 55] , [ 2 , 30] , [ 5 , 20] , [ 10 , 19] , [ 9 , 18]  ]
                    // }
                    // ];



                    // dataCategoryRanking
                    // translatePointId(elem.pointid_point)
                    // console.log(getFullPointData(elem.pointid_point));
                    // console.log(getFullPointData(elem.pointid_point).type);
                    // console.log(getFullPointData(elem.pointid_point)["Store code"]);
                    // console.log("elemo");
                    // console.log(elem);


                    //categoryAdd(dataCategoryRanking, getFullPointData(elem.pointid_point).type, [translateFullPointId(elem.pointid_point), +elem.value]);

                    // para cada ponto
                    // ver todos os pares categoria:valor
                    var catAux = parseCategories(dataCategoryRanking, elem, filteredDate);

                    if ($scope.ordFiltValues == undefined || $scope.ordFiltValues == null || $scope.ordFiltValues.length == 0)
                        var productAux = parseProducts(dataProductRanking, elem);
                    // console.log("Processed categories and products");
                    // console.log(dataCategoryRanking);
                    // console.log(dataProductRanking);

                    //console.log(">>>>> another indicator");

                    var orderedDateAdd = function(arr, pair) {
                        if (arr.length == 0) {
                            arr.push(pair);
                            return;
                        }

                        for (var i = 0; i < arr.length; i++) {
                            var elem = arr[i];

                            var x = new Date(elem[0]);
                            var y = new Date(pair[0]);

                            if (x > y) {
                                arr.splice(i, 0, pair);
                                return;
                            } else {
                                if (i == arr.length - 1) {
                                    arr.push(pair);
                                    return;
                                }
                            }

                        }
                    }

                    if (elem.readingsDoubleArr.length > 0) {
                        var readingsArrayAccum = new Array();
                        for (var k = 0; k < readingsArray.length; k++) {
                            // console.log(readingsArray[k]);
                            // only push if filter allows it!! e.g. if filter has Marco Belinni to false, we shouldnt accumPush it
                            accumPush(readingsArrayAccum, readingsArray[k], "date", elem.aggrmethod, $scope.filterSpec);


                            var satisfLevel = readingsArray[k][2];
                            // console.log(readingsArray[k]);


                            for (var l = 0; l < $scope.stackedData.length; l++) {
                                if ($scope.stackedData[l].key == satisfLevel) {
                                    var updated = false;
                                    for (var m = 0; m < $scope.stackedData[l].values.length; m++) {
                                        // console.log("comparing: "+$scope.stackedData[l].values[m][0]+" with "+readingsArray[k][0]);

                                        // if($scope.stackedData[l].values[m][0] == readingsArray[k][0]){
                                        var x = new Date($scope.stackedData[l].values[m][0]);
                                        var y = new Date(readingsArray[k][0]);
                                        if (x.getTime() === y.getTime()) {
                                            $scope.stackedData[l].values[m][1] += readingsArray[k][1];
                                            updated = true;
                                            // console.log("UPDATE");
                                        }
                                    }
                                    if (!updated) {
                                        // console.log("added");
                                        // $scope.stackedData[l].values.push([readingsArray[k][0], readingsArray[k][1]]);

                                        orderedDateAdd($scope.stackedData[l].values, [readingsArray[k][0], readingsArray[k][1]]);
                                    }
                                }
                            }
                        }

                        chartReadingsArray.push({
                            "key": translatePointId(elem.pointid_point),
                            "values": readingsArrayAccum
                        });

                        // console.log("chartReadingsArray");
                        // console.log(chartReadingsArray);
                    }
                }


                // console.log("changed average to "+($scope.sum / $scope.nPoints));
            } else {
                // console.log("NOOO changes on average");
            }

            // $scope.api.refresh();

            if (j == $scope.indicators.length - 1) {
                // // uncomment for updating history chart on modal
                // sharedCommsService.lineChartData.push($scope.exampleDataLarge);
                // sharedCommsService.bufferAndBroadcast("lineChartData");
                $scope.exampleDataRankingMulti = dataCategoryRanking;


                if (dataProductRanking.length == 0 && $scope.ordFiltValues != undefined)
                    parseOrdFiltValues(dataProductRanking, $scope.ordFiltValues, filteredDate, elem.aggrmethod);
                $scope.productsRankingMulti = dataProductRanking;

                //NPS values into $scope.exampleData just for NPS INDEX (HoN) widget (assuming just two points with HoN!!!)
                if ($scope.widget.title == "NPS INDEX (HoN)" && npsvalues != null && npsvalues != undefined) {
                    $scope.exampleData = [{
                        "key": [],
                        "values": []
                    }, {
                        "key": [],
                        "values": []
                    }];

                    for (var i = 0; i < npsvalues.length; i++) {

                        if (i == 0) {

                            $scope.exampleData[0].key = translatePointId(npsvalues[i].pointid);
                            $scope.exampleData[0].values.push([new Date(npsvalues[i].dates), Math.round(npsvalues[i].nps), "", "", ""]);
                        } else {

                            if ($scope.exampleData[0].key == translatePointId(npsvalues[i].pointid)) {

                                $scope.exampleData[0].key = translatePointId(npsvalues[i].pointid);
                                $scope.exampleData[0].values.push([new Date(npsvalues[i].dates), Math.round(npsvalues[i].nps), "", "", ""]);

                            } else {

                                $scope.exampleData[1].key = translatePointId(npsvalues[i].pointid);
                                $scope.exampleData[1].values.push([new Date(npsvalues[i].dates), Math.round(npsvalues[i].nps), "", "", ""]);


                            }


                        }

                    }

                    if ($scope.filterSpec.points.length == 1) {
                        if ($scope.exampleData[0].key == translatePointId($scope.filterSpec.points[0]))
                            $scope.exampleData = [$scope.exampleData[0]];
                        else
                            $scope.exampleData = [$scope.exampleData[1]];
                    }
                    console.log($scope.exampleData);

                } else {
                    $scope.exampleData = chartReadingsArray;
                    $scope.exampleDataLarge = chartReadingsArray.slice(0);

                    $scope.chartReadingsArray = chartReadingsArray;

                }



            }
        } // end for cycle

        //console.log("dataRanking", dataRanking);

        //hide history plot inside widget when there's only one date
        for (var i = 0; i < $scope.exampleData.length; i++) {

            if ($scope.exampleData[i].values.length <= 1) {

                $scope.hide = 'display-none';

            }
        }

    } // end processValues()
    var key;

    function totalGraphs(widget) {

        var widgetTitle = widget;

        var query;

        if (widgetTitle == "Net Sales") {
            query = '/api/totalNetSales/';
            key = "Total of Net Sales";
        }


        if (widgetTitle == "Number of Customers") {
            query = '/api/totalCustomers/';
            key = "Total of Customers";
        }


        if (widgetTitle == "Basket") {
            query = '/api/totalBasket/';
            key = "Total of Basket";
        }


        if (widgetTitle == "Net Margin") {
            query = '/api/totalNetMargin/';
            key = "Total of Net Margin";
        }

        if (widgetTitle == "Multiline Bills") {
            query = '/api/totalMultilineBills/';
            key = "Total of Multiline Bills";
        }

        if (widgetTitle == "Stock Level") {
            query = '/api/totalStockLevel/';
            key = "Total of Stock Level";
        }


        if (query != undefined) {
            $http.post(query + $scope.pid + '/' + $scope.wid, $scope.filterSpec)
                .success(function(data, status) {

                    $scope.dataRankingTotal = data[0];
                    $scope.dataHistoryTotal = data[1];

                    $scope.setSelectedChart('Total History');

                })
                .error(function(data, status) {});
        }
    }

    $scope.changeGraphs = function() {

        if ($scope.graph == "historyStores") {
            $scope.exampleData = $scope.chartReadingsArray;
        } else if ($scope.graph == "historyTotal") {
            $scope.exampleData =
                [{
                    "key": key,
                    "values": $scope.dataHistoryTotal
                }];
        }
    }

    $scope.changeGraphsOld = function(choice) {

        if (choice == "stores") {
            $scope.exampleData = $scope.chartReadingsArray;
        } else if (choice == "total") {
            $scope.exampleData =
                [{
                    "key": key,
                    "values": $scope.dataHistoryTotal
                }];
        }
    }

    function standardError() {
        $http.post('/api/standardError/' + $scope.pid + '/' + $scope.wid, $scope.filterSpec)
            .success(function(data, status) {

                $scope.standardError = data.se;

            })
            .error(function(data, status) {});
    }

    function checkMinimum(val) {
        if ($scope.minimum == null)
            $scope.minimum = +val;
        else {
            if ($scope.minimum > +val)
                $scope.minimum = +val;
        }
    }

    function checkMaximum(val) {
        if ($scope.maximum == null)
            $scope.maximum = +val;
        else {
            if ($scope.maximum < +val)
                $scope.maximum = +val;
        }
    }

    function orderedPairAdd(dataRanking, pair, reverse) {
        if (dataRanking.length == 0) {
            dataRanking.push(pair);
            return;
        }
        for (var i = 0; i < dataRanking.length; i++) {
            var elem = dataRanking[i];
            if (reverse) {
                // console.log("inserting in reverse");
                if (parseFloat(elem[1]) < parseFloat(pair[1])) {
                    dataRanking.splice(i, 0, pair);
                    return;
                } else {
                    if (i == dataRanking.length - 1) {
                        dataRanking.push(pair);
                        return;
                    }
                }

            } else {

                if (parseFloat(elem[1]) > parseFloat(pair[1])) {
                    dataRanking.splice(i, 0, pair);
                    return;
                } else {
                    if (i == dataRanking.length - 1) {
                        dataRanking.push(pair);
                        return;
                    }
                }

            }
        }
    }

    var genProductRankingArray = function(reading) {
        // 
        var arr = new Array();
        var auxArr = new Array();
        auxArr.push(translatePointId(reading.pointid_point));
        auxArr.push(+reading.vl);
        arr.push(auxArr);
        return arr;
    }

    // function to group filtered readings loosenArr to 
    // grouped product objects for display on product ranking chart
    var parseOrdFiltValues = function(groupedArr, loosenArr, filteredDate, aggrmethod) {
        // objective: array with objects of
        // key: string with product name
        // values: array of arrays containing [string, number]
        // of pointShortName (from translatePointId), value

        var filDate = new Date(filteredDate);
        // uncomment line below to show the highest date
        // var filDate = new Date(loosenArr[0].ts);
        var eachProd = {};

        if (aggrmethod == undefined || aggrmethod == null) {
            aggrmethod = 'average';
        }

        for (var i = 0; i < loosenArr.length; i++) {
            var reading = loosenArr[i];
            reading.vl = +reading.vl;
            var auxDate = new Date(reading.ts);
            auxDate.setHours(filDate.getHours());

            if (auxDate.getTime() == filDate.getTime()) {
                if (!eachProd.hasOwnProperty(reading.pr)) {
                    var obj = {};
                    obj.key = reading.pr;
                    obj.values = {};
                    obj.values[reading.pointid_point] = reading;
                    obj.values[reading.pointid_point].vl = +reading.vl;
                    obj.values[reading.pointid_point].count = 1;
                    eachProd[reading.pr] = obj;
                } else {
                    var obj = eachProd[reading.pr];
                    if (!obj.values.hasOwnProperty(reading.pointid_point)) {
                        obj.values[reading.pointid_point] = reading;
                        obj.values[reading.pointid_point].vl = +reading.vl;
                        obj.values[reading.pointid_point].count = 1;
                    } else {
                        // merge
                        obj.values[reading.pointid_point].count++;
                        if (aggrmethod == 'average') {
                            var val = obj.values[reading.pointid_point].vl;
                            obj.values[reading.pointid_point].vl = obj.values[reading.pointid_point].vl * (obj.values[reading.pointid_point].count - 1) / obj.values[reading.pointid_point].count + +reading.vl / obj.values[reading.pointid_point].count;
                            // aux*(ctr-1)/ctr + +readings[i].value/ctr;
                        } else {
                            obj.values[reading.pointid_point].vl += +reading.vl;
                        }
                        // NUNO: we need to calc the running average if this
                        // indicator has aggregation method average!
                    }
                }
            } else {
                // break the loop, the api provided an array ordered by timestamp
                break;
            }
        }
        //onsole.log("eachProd");
        //console.log(eachProd);

        $scope.sumProducts = 0;
        $scope.minProducts;
        $scope.maxProducts;

        for (var prop in eachProd) {
            if (eachProd.hasOwnProperty(prop)) {
                $scope.prodFilters[prop] = true;
                DEFAULT_PROD_FILTER[prop] = true;

                productObjAdd(dataProductRanking, prop, objToArr(eachProd[prop].values));
            }
        }
    }

    function productObjAdd(data, product, elemArr) {
        var catIndex = -1;
        for (var i = 0; i < data.length; i++) {
            var groupElem = data[i];
            if (groupElem.key == product) {
                catIndex = i;
                break;
            }
        }

        if (catIndex == -1) {
            data.push({
                "key": product,
                "values": elemArr
            });
        } else {
            data[catIndex].values.push(elemArr);
            // console.log("Gotta find it and add elemArr to it...");
        }
    }

    function objToArr(obj) {
        console.log("objToArr", obj);
        var arr = new Array();
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                // arr.push([obj[prop].pointid_point, obj[prop].vl]);
                arr.push([translatePointId(obj[prop].pointid_point), obj[prop].vl]);
                // arr.push([translatePointId(prop.pointid_point), vl]);
            }
        }
        return arr;
    }

    function convertObjectArrayToArrayArray(objArr) {
        // var toRet = [];
        // for(var i = 0; i < objArr.length; i++)
        //   toRet.push( [ objArr[i].timestamp , objArr[i].value ] );
        // return toRet;

        var data = objArr;
        var dataAux = [];


        // for(var d in data){
        for (var d = 0; d < data.length; d++) {
            // // // console.log(data[d]);
            if (data[d][1] != null) {
                // var date = new Date(data[d][0]);

                var a = data[d][0].split(/[^0-9]/);
                var date = new Date(a[0], a[1] - 1, a[2]);

                // console.log(data[d][0] + " --- " + date);
                var aux = [date, data[d][1], data[d][2], data[d][3], data[d][4]];
                dataAux.push(aux);


            }
        }
        dataAux.sort(function(a, b) {
            return new Date(a[0]) - new Date(b[0]);
        });
        // console.log('dataAux');
        // console.log(dataAux);

        return dataAux;
    }

    function categoryAdd(data, category, elemArr) {
        // console.log("adding to category "+category+" the element ["+elemArr[0]+", "+elemArr[1]+"]"  );
        var catIndex = -1;
        for (var i = 0; i < data.length; i++) {
            var groupElem = data[i];
            if (groupElem.key == category) {
                catIndex = i;
                break;
            }
        }

        if (catIndex == -1) {
            data.push({
                "key": category,
                "values": [elemArr]
            });
        } else {
            data[catIndex].values.push(elemArr);
            // console.log("Gotta find it and add elemArr to it...");
        }
    }

    function productAdd(data, product, elemArr) {
        var catIndex = -1;
        for (var i = 0; i < data.length; i++) {
            var groupElem = data[i];
            if (groupElem.key == product) {
                catIndex = i;
                break;
            }
        }

        if (catIndex == -1) {
            data.push({
                "key": product,
                "values": [elemArr]
            });
        } else {
            data[catIndex].values.push(elemArr);
            // console.log("Gotta find it and add elemArr to it...");
        }
    }

    function parseProducts(dataProductRanking, elem, filteredDate) {
        var arr = elem.readingsDoubleArr;
        var eachProd = {};

        // console.log(elem);
        var filDate = new Date(filteredDate);

        for (var i = 0; i < arr.length; i++) {
            if (arr[i][2] != null) {
                if (!eachProd.hasOwnProperty(arr[i][3])) {
                    eachProd[arr[i][3]] = arr[i];
                } else {
                    // console.log(eachCat[arr[i][2]]);
                    // console.log(arr[i]);
                    if (new Date(eachProd[arr[i][3]][0]) < new Date(arr[i][0]))
                        eachProd[arr[i][3]] = arr[i];
                }

            }
        }


        $scope.sumProducts = 0;
        $scope.minProducts;
        $scope.maxProducts;

        for (var prop in eachProd) {
            if (eachProd.hasOwnProperty(prop)) {
                $scope.prodFilters[prop] = true;
                DEFAULT_PROD_FILTER[prop] = true;

                if (new Date($scope.widget.date).getTime() == new Date(eachProd[prop][0]).getTime()) {
                    productAdd(dataProductRanking, prop, [translateFullPointId(elem.pointid_point), +eachProd[prop][1]]);
                }

                // category statistics
                $scope.sumProducts += eachProd[prop][1];
                if ($scope.minProducts == undefined)
                    $scope.minProducts = eachProd[prop][1];
                else {
                    if ($scope.minProducts > eachProd[prop][1])
                        $scope.minProducts = eachProd[prop][1];
                }
                if ($scope.maxProducts == undefined)
                    $scope.maxProducts = eachProd[prop][1];
                else {
                    if ($scope.maxProducts < eachProd[prop][1])
                        $scope.maxProducts = eachProd[prop][1];
                }

                if ($scope.products.indexOf(prop) == -1)
                    $scope.products.push(prop);

                // populate the product-category mapping
                if (!$scope.prodCatMap.hasOwnProperty(prop))
                    $scope.prodCatMap[prop] = eachProd[prop][2];
            }
        }

        // console.log("$scope.products");
        // console.log($scope.products);

        if ($scope.products[0] == '' || $scope.products[0] == 'null')
            $scope.realProductsLength = 0;
        else
            $scope.realProductsLength = $scope.products.length;

        // bubble sort the array
        var changed;
        for (var i = 0; i < dataProductRanking.length - 1; i++) {
            changed = false;
            for (var j = 0; j < dataProductRanking.length - 1; j++) {
                if (+dataProductRanking[j].values[0][1] > +dataProductRanking[j + 1].values[0][1]) {
                    changed = true;
                    var temp = dataProductRanking[j];
                    dataProductRanking[j] = dataProductRanking[j + 1];
                    dataProductRanking[j + 1] = temp;
                }
            }
            if (!changed) {
                break;
            }
        }
    }

    function parseCategories(dataCategoryRanking, elem, filteredDate) {
        var arr = elem.readingsDoubleArr;
        var eachCat = {};
        // console.log("widget date is "+$scope.widget.date);

        var filDate = new Date(filteredDate);

        for (var i = 0; i < arr.length; i++) {

            if (arr[i][2] != null) {
                var auxDate = new Date(arr[i][0]);
                auxDate.setHours(filDate.getHours());

                if (!eachCat.hasOwnProperty(arr[i][2])) {


                    if (auxDate.getTime() == filDate.getTime()) {
                        eachCat[arr[i][2]] = arr[i].concat(1);
                    }
                } else {

                    if (auxDate.getTime() == filDate.getTime()) {
                        // console.log("found date: "+arr[i][0]);
                        // console.log("merging");
                        // console.log(arr[i]);
                        // console.log("on existing");
                        // console.log(eachCat[arr[i][2]]);


                        // merge code

                        if (elem.aggrmethod == "average") {
                            var currIndex = +eachCat[arr[i][2]][5] + 1;
                            // console.log("currIndex "+currIndex);
                            // eachCat will have the result of the formula: arr[i][1] = arr[i][1]*(ctr-1)/ctr + +elem[1]/ctr;
                            var lastValue = +eachCat[arr[i][2]][1];
                            var currValue = +arr[i][1];
                            eachCat[arr[i][2]][1] = lastValue * (currIndex - 1) / currIndex + currValue / currIndex;
                            eachCat[arr[i][2]][5] = currIndex;

                        } else {
                            // eachCat will have the sum of both eachCat[arr[i][2]] and arr[i]
                            eachCat[arr[i][2]][1] = +eachCat[arr[i][2]][1] + +arr[i][1];
                        }

                    }


                    // if( new Date(eachCat[arr[i][2]][0]) < new Date(arr[i][0]) ){
                    //   eachCat[arr[i][2]] = arr[i] ;
                    // }
                }
            }

        }

        $scope.sumCategories = 0;
        $scope.minCategories;
        $scope.maxCategories;

        for (var prop in eachCat) {
            if (eachCat.hasOwnProperty(prop)) {
                $scope.catFilters[prop] = true;
                DEFAULT_CAT_FILTER[prop] = true;


                var auxDate = new Date(eachCat[prop][0]);
                auxDate.setHours(filDate.getHours());

                if (filDate.getTime() == auxDate.getTime()) {
                    categoryAdd(dataCategoryRanking, prop, [translateFullPointId(elem.pointid_point), +eachCat[prop][1]]);
                }


                // category statistics
                $scope.sumCategories += eachCat[prop][1];
                if ($scope.minCategories == undefined)
                    $scope.minCategories = eachCat[prop][1];
                else {
                    if ($scope.minCategories > eachCat[prop][1])
                        $scope.minCategories = eachCat[prop][1];
                }
                if ($scope.maxCategories == undefined)
                    $scope.maxCategories = eachCat[prop][1];
                else {
                    if ($scope.maxCategories < eachCat[prop][1])
                        $scope.maxCategories = eachCat[prop][1];
                }

                if ($scope.categories.indexOf(prop) == -1)
                    $scope.categories.push(prop);
            }
        }

        if ($scope.categories[0] == '')
            $scope.realCategoriesLength = 0;
        else
            $scope.realCategoriesLength = $scope.categories.length;

        // bubble sort the array
        var changed;
        for (var i = 0; i < dataCategoryRanking.length - 1; i++) {
            changed = false;
            for (var j = 0; j < dataCategoryRanking.length - 1; j++) {
                if (+dataCategoryRanking[j].values[0][1] > +dataCategoryRanking[j + 1].values[0][1]) {
                    changed = true;
                    var temp = dataCategoryRanking[j];
                    dataCategoryRanking[j] = dataCategoryRanking[j + 1];
                    dataCategoryRanking[j + 1] = temp;
                }
            }
            if (!changed) {
                break;
            }
        }
    }


    // function parseCategories(dataCategoryRanking, elem){
    //   var arr = elem.readingsDoubleArr;
    //   var eachCat = {};

    //   for(var i=0; i<arr.length; i++){
    //     if( !eachCat.hasOwnProperty(arr[i][2]) ){
    //       eachCat[arr[i][2]] = arr[i][1];
    //     } else {
    //       eachCat[arr[i][2]] += arr[i][1];
    //     }
    //   }

    //   return eachCat;
    // }



    // second box: ranking chart

    // var pid = $routeParams.pid;
    // var iid = $routeParams.iid;
    // var parmid = $routeParams.parmid;

    // isto tb vai ser importante para o outro grafico
    $scope.xAxisTickFormatFunction = function() {
        return function(d) {
            return d3.time.format('%b')(new Date(d));
        }
    }

    var colorCategory = d3.scale.category10();
    $scope.colorFunction = function() {
        return function(d, i) {
            return colorCategory(i);
        };
    }

    var colorCategory20 = d3.scale.category20();
    $scope.colorFunction20 = function() {
        return function(d, i) {
            return colorCategory20(i);
        };
    }

    $scope.randomColor = function() {
        var golden_ratio_conjugate = 0.618033988749895;
        var h = Math.random();

        $scope.hue2rgb = function(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        $scope.hslToRgb = function(h, s, l) {
            var r, g, b;

            if (s == 0) {
                r = g = b = l; // achromatic
            } else {


                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = $scope.hue2rgb(p, q, h + 1 / 3);
                g = $scope.hue2rgb(p, q, h);
                b = $scope.hue2rgb(p, q, h - 1 / 3);
            }

            return '#' + Math.round(r * 255).toString(16) + Math.round(g * 255).toString(16) + Math.round(b * 255).toString(16);
        }


        h += golden_ratio_conjugate;
        h %= 1;
        return $scope.hslToRgb(h, 0.5, 0.60);
    }

    var randProductColors = {};

    // this works, but some colors can be quite close to each other...
    // randomColor needs to take into account the colors generated in the past
    $scope.randomInfiniteColorFunction = function() {
        return function(d, i) {
            var key = d.key;
            if (key == undefined) {
                key = d[0];
                if (key == undefined) {
                    return colorCategory(i);
                }
            }

            if (!randProductColors.hasOwnProperty(key)) {
                randProductColors[key] = $scope.randomColor();
            }

            return randProductColors[key];
            // return colorCategory(i);
        };
    }

    $scope.happyOrNotColorFunction = function() {
        return function(d, i) {
            var key = d.key;
            if (key == undefined) {
                key = d[0];
                if (key == undefined) {
                    return colorCategory(i);
                }
            }
            if (key == 'Very Positive')
                return 'rgb(106, 200, 50)';
            if (key == 'Positive')
                return 'rgb(178, 211, 156)';
            if (key == 'Negative')
                return 'rgb(240, 155, 141)';
            if (key == 'Very Negative')
                return 'rgb(240, 69, 77)';


            return colorCategory(i);
        }
    }

    var colors = {};
    var colorCount = 0;

    $scope.catColorFunction = function() {
        return function(d, i) {
            // console.log("d for i:"+i);
            // console.log(d);
            // console.log(d.key);

            var key = d.key;
            if (key == undefined) {
                key = d[0];
                if (key == undefined) {
                    return colorCategory(i);
                }
            }

            if (key == 'Very Positive')
                return 'rgb(106, 200, 50)';
            if (key == 'Positive')
                return 'rgb(178, 211, 156)';
            if (key == 'Negative')
                return 'rgb(240, 155, 141)';
            if (key == 'Very Negative')
                return 'rgb(240, 69, 77)';

            if (!colors.hasOwnProperty(key)) {
                colors[key] = colorCount;
                colorCount++;
            }

            // console.log(colors);

            return colorCategory(colors[key]);
        };
    }

    function testNameToSelectedAttributes(name) {
        if ($scope.selectedAttrs.hasOwnProperty("StoreCodeAbbrv")) {
            if (name == $scope.selectedAttrs.StoreCodeAbbrv)
                return true;
        }
        if ($scope.selectedAttrs.hasOwnProperty("name")) {
            if (name == $scope.selectedAttrs.name)
                return true;
        }
        if ($scope.selectedAttrs.hasOwnProperty("PointKey")) {
            if (name == $scope.selectedAttrs.PointKey)
                return true;
        }
        if ($scope.selectedAttrs.hasOwnProperty("Point_Key")) {
            if (name == $scope.selectedAttrs.Point_Key)
                return true;
        }
        if ($scope.selectedAttrs.hasOwnProperty("reservedPointId")) {
            if (name == $scope.selectedAttrs.reservedPointId)
                return true;
        }
        return false;
    }

    $scope.pointSelectedFunction = function() {
        return function(d, i) {
            var key = d.key;
            if (key == undefined) {
                key = d[0];
                if (key == undefined) {
                    return colorCategory(i);
                }
            }

            // $scope.selectedAttrs = selectedAttrs;

            // if(testNameToSelectedAttributes(key)){
            //   return '#f0ad4e'
            // } else {
            //   return '#666666'
            // }

            if (key == $scope.selectedMarkerKey) {
                return '#f0ad4e'
            } else {
                return '#666666'
            }

        }
    }

    // TODO: NB - we need to make this function for product colors...
    $scope.prodColorFunction = function() {



        return function(d, i) {
            // console.log("d for i:"+i);
            // console.log(d);
            // console.log(d.key);

            var key = d.key;
            if (key == undefined) {
                key = d[0];
                if (key == undefined) {
                    return colorCategory(i);
                }
            }

            key = $scope.prodCatMap[key];
            // console.log("key is "+key);

            if (!colors.hasOwnProperty(key)) {
                colors[key] = colorCount;
                colorCount++;
            }

            // console.log(colors);

            return colorCategory(colors[key]);
        };
    }

    // $scope.exampleDataRanking = [
    // {
    // "key": "Series 1",
    // "values": [ [ 3 , 88] , [ 8 , 55] , [ 2 , 30] , [ 5 , 20] , [ 10 , 19] , [ 9 , 18]  ]
    // }
    // ];
    $scope.exampleDataRanking = [];

    // $http.get('/api/orderedPointValuesOfParameter/'+pid+'/'+iid+'/'+parmid).
    //   success(function(data, status){
    //     // // // console.log("read ordered pointvalues");
    //     // // // console.log(data);
    //     $scope.exampleDataRanking = [
    //       {
    //       "key": "Series 1",
    //       "values": data.ranking
    //       }
    //       ];
    //   }).
    //   error(function(data, status){});



    // third box: all points history chart


    $scope.xAxisTickFormatFunction = function() {
        // return function(d){
        //     return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
        // }
        return function(d) {
            // return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
            return d3.time.format("%Y-%m-%d")(new Date(d));
        }
    }

    $scope.exampleData = [];

    // $scope.exampleData = [
    //     {
    //         "key": "Series 1",
    //         "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] , [ 1059624000000 , 11.341210982529] , [ 1062302400000 , 14.734820409020] , [ 1064894400000 , 12.387148007542] , [ 1067576400000 , 18.436471461827] , [ 1070168400000 , 19.830742266977] , [ 1072846800000 , 22.643205829887] , [ 1075525200000 , 26.743156781239] , [ 1078030800000 , 29.597478802228] , [ 1080709200000 , 30.831697585341] , [ 1083297600000 , 28.054068024708] , [ 1085976000000 , 29.294079423832] , [ 1088568000000 , 30.269264061274] , [ 1091246400000 , 24.934526898906] , [ 1093924800000 , 24.265982759406] , [ 1096516800000 , 27.217794897473] , [ 1099195200000 , 30.802601992077] , [ 1101790800000 , 36.331003758254] , [ 1104469200000 , 43.142498700060] , [ 1107147600000 , 40.558263931958] , [ 1109566800000 , 42.543622385800] , [ 1112245200000 , 41.683584710331] , [ 1114833600000 , 36.375367302328] , [ 1117512000000 , 40.719688980730] , [ 1120104000000 , 43.897963036919] , [ 1122782400000 , 49.797033975368] , [ 1125460800000 , 47.085993935989] , [ 1128052800000 , 46.601972859745] , [ 1130734800000 , 41.567784572762] , [ 1133326800000 , 47.296923737245] , [ 1136005200000 , 47.642969612080] , [ 1138683600000 , 50.781515820954] , [ 1141102800000 , 52.600229204305] , [ 1143781200000 , 55.599684490628] , [ 1146369600000 , 57.920388436633] , [ 1149048000000 , 53.503593218971] , [ 1151640000000 , 53.522973979964] , [ 1154318400000 , 49.846822298548] , [ 1156996800000 , 54.721341614650] , [ 1159588800000 , 58.186236223191] , [ 1162270800000 , 63.908065540997] , [ 1164862800000 , 69.767285129367] , [ 1167541200000 , 72.534013373592] , [ 1170219600000 , 77.991819436573] , [ 1172638800000 , 78.143584404990] , [ 1175313600000 , 83.702398665233] , [ 1177905600000 , 91.140859312418] , [ 1180584000000 , 98.590960607028] , [ 1183176000000 , 96.245634754228] , [ 1185854400000 , 92.326364432615] , [ 1188532800000 , 97.068765332230] , [ 1191124800000 , 105.81025556260] , [ 1193803200000 , 114.38348777791] , [ 1196398800000 , 103.59604949810] , [ 1199077200000 , 101.72488429307] , [ 1201755600000 , 89.840147735028] , [ 1204261200000 , 86.963597532664] , [ 1206936000000 , 84.075505208491] , [ 1209528000000 , 93.170105645831] , [ 1212206400000 , 103.62838083121] , [ 1214798400000 , 87.458241365091] , [ 1217476800000 , 85.808374141319] , [ 1220155200000 , 93.158054469193] , [ 1222747200000 , 65.973252382360] , [ 1225425600000 , 44.580686638224] , [ 1228021200000 , 36.418977140128] , [ 1230699600000 , 38.727678144761] , [ 1233378000000 , 36.692674173387] , [ 1235797200000 , 30.033022809480] , [ 1238472000000 , 36.707532162718] , [ 1241064000000 , 52.191457688389] , [ 1243742400000 , 56.357883979735] , [ 1246334400000 , 57.629002180305] , [ 1249012800000 , 66.650985790166] , [ 1251691200000 , 70.839243432186] , [ 1254283200000 , 78.731998491499] , [ 1256961600000 , 72.375528540349] , [ 1259557200000 , 81.738387881630] , [ 1262235600000 , 87.539792394232] , [ 1264914000000 , 84.320762662273] , [ 1267333200000 , 90.621278391889] , [ 1270008000000 , 102.47144881651] , [ 1272600000000 , 102.79320353429] , [ 1275278400000 , 90.529736050479] , [ 1277870400000 , 76.580859994531] , [ 1280548800000 , 86.548979376972] , [ 1283227200000 , 81.879653334089] , [ 1285819200000 , 101.72550015956] , [ 1288497600000 , 107.97964852260] , [ 1291093200000 , 106.16240630785] , [ 1293771600000 , 114.84268599533] , [ 1296450000000 , 121.60793322282] , [ 1298869200000 , 133.41437346605] , [ 1301544000000 , 125.46646042904] , [ 1304136000000 , 129.76784954301] , [ 1306814400000 , 128.15798861044] , [ 1309406400000 , 121.92388706072] , [ 1312084800000 , 116.70036100870] , [ 1314763200000 , 88.367701837033] , [ 1317355200000 , 59.159665765725] , [ 1320033600000 , 79.793568139753] , [ 1322629200000 , 75.903834028417] , [ 1325307600000 , 72.704218209157] , [ 1327986000000 , 84.936990804097] , [ 1330491600000 , 93.388148670744]]
    //     }
    // ];



    // $scope.exampleDataCumulative = [
    //   {
    //     key: "Cumulative Return",
    //     values: [
    //         ["A", -29.765957771107 ],
    //         ["B" , 0 ],
    //         ["C" , 32.807804682612 ],
    //         ["D" , 196.45946739256 ],
    //         ["E" , 0.19434030906893 ],
    //         ["F" , -98.079782601442 ],
    //         ["G" , -13.925743130903 ],
    //         ["H" , -5.1387322875705 ]
    //         ]
    //   }
    // ];

    // $scope.exampleDataLines = [
    // {
    //     "key": "Series 1",
    //     "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] , [ 1059624000000 , 11.341210982529] , [ 1062302400000 , 14.734820409020] , [ 1064894400000 , 12.387148007542] , [ 1067576400000 , 18.436471461827] , [ 1070168400000 , 19.830742266977] , [ 1072846800000 , 22.643205829887] , [ 1075525200000 , 26.743156781239] , [ 1078030800000 , 29.597478802228] , [ 1080709200000 , 30.831697585341] , [ 1083297600000 , 28.054068024708] , [ 1085976000000 , 29.294079423832] , [ 1088568000000 , 30.269264061274] , [ 1091246400000 , 24.934526898906] , [ 1093924800000 , 24.265982759406] , [ 1096516800000 , 27.217794897473] , [ 1099195200000 , 30.802601992077] , [ 1101790800000 , 36.331003758254] , [ 1104469200000 , 43.142498700060] , [ 1107147600000 , 40.558263931958] , [ 1109566800000 , 42.543622385800] , [ 1112245200000 , 41.683584710331] , [ 1114833600000 , 36.375367302328] , [ 1117512000000 , 40.719688980730] , [ 1120104000000 , 43.897963036919] , [ 1122782400000 , 49.797033975368] , [ 1125460800000 , 47.085993935989] , [ 1128052800000 , 46.601972859745] , [ 1130734800000 , 41.567784572762] , [ 1133326800000 , 47.296923737245] , [ 1136005200000 , 47.642969612080] , [ 1138683600000 , 50.781515820954] , [ 1141102800000 , 52.600229204305] , [ 1143781200000 , 55.599684490628] , [ 1146369600000 , 57.920388436633] , [ 1149048000000 , 53.503593218971] , [ 1151640000000 , 53.522973979964] , [ 1154318400000 , 49.846822298548] , [ 1156996800000 , 54.721341614650] , [ 1159588800000 , 58.186236223191] , [ 1162270800000 , 63.908065540997] , [ 1164862800000 , 69.767285129367] , [ 1167541200000 , 72.534013373592] , [ 1170219600000 , 77.991819436573] , [ 1172638800000 , 78.143584404990] , [ 1175313600000 , 83.702398665233] , [ 1177905600000 , 91.140859312418] , [ 1180584000000 , 98.590960607028] , [ 1183176000000 , 96.245634754228] , [ 1185854400000 , 92.326364432615] , [ 1188532800000 , 97.068765332230] , [ 1191124800000 , 105.81025556260] , [ 1193803200000 , 114.38348777791] , [ 1196398800000 , 103.59604949810] , [ 1199077200000 , 101.72488429307] , [ 1201755600000 , 89.840147735028] , [ 1204261200000 , 86.963597532664] , [ 1206936000000 , 84.075505208491] , [ 1209528000000 , 93.170105645831] , [ 1212206400000 , 103.62838083121] , [ 1214798400000 , 87.458241365091] , [ 1217476800000 , 85.808374141319] , [ 1220155200000 , 93.158054469193] , [ 1222747200000 , 65.973252382360] , [ 1225425600000 , 44.580686638224] , [ 1228021200000 , 36.418977140128] , [ 1230699600000 , 38.727678144761] , [ 1233378000000 , 36.692674173387] , [ 1235797200000 , 30.033022809480] , [ 1238472000000 , 36.707532162718] , [ 1241064000000 , 52.191457688389] , [ 1243742400000 , 56.357883979735] , [ 1246334400000 , 57.629002180305] , [ 1249012800000 , 66.650985790166] , [ 1251691200000 , 70.839243432186] , [ 1254283200000 , 78.731998491499] , [ 1256961600000 , 72.375528540349] , [ 1259557200000 , 81.738387881630] , [ 1262235600000 , 87.539792394232] , [ 1264914000000 , 84.320762662273] , [ 1267333200000 , 90.621278391889] , [ 1270008000000 , 102.47144881651] , [ 1272600000000 , 102.79320353429] , [ 1275278400000 , 90.529736050479] , [ 1277870400000 , 76.580859994531] , [ 1280548800000 , 86.548979376972] , [ 1283227200000 , 81.879653334089] , [ 1285819200000 , 101.72550015956] , [ 1288497600000 , 107.97964852260] , [ 1291093200000 , 106.16240630785] , [ 1293771600000 , 114.84268599533] , [ 1296450000000 , 121.60793322282] , [ 1298869200000 , 133.41437346605] , [ 1301544000000 , 125.46646042904] , [ 1304136000000 , 129.76784954301] , [ 1306814400000 , 128.15798861044] , [ 1309406400000 , 121.92388706072] , [ 1312084800000 , 116.70036100870] , [ 1314763200000 , 88.367701837033] , [ 1317355200000 , 59.159665765725] , [ 1320033600000 , 79.793568139753] , [ 1322629200000 , 75.903834028417] , [ 1325307600000 , 72.704218209157] , [ 1327986000000 , 84.936990804097] , [ 1330491600000 , 93.388148670744]]
    // },
    // {
    //     "key": "Series 2",
    //     "area": true,
    //     "values": [ [ 1025409600000 , 4] , [ 1028088000000 , 8] , [ 1030766400000 , 10] , [ 1033358400000 , 14] , [ 1036040400000 , 3] , [ 1038632400000 , 9] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] , [ 1059624000000 , 11.341210982529] , [ 1062302400000 , 14.734820409020] , [ 1064894400000 , 12.387148007542] , [ 1067576400000 , 18.436471461827] , [ 1070168400000 , 19.830742266977] , [ 1072846800000 , 22.643205829887] , [ 1075525200000 , 26.743156781239] , [ 1078030800000 , 29.597478802228] , [ 1080709200000 , 30.831697585341] , [ 1083297600000 , 28.054068024708] , [ 1085976000000 , 29.294079423832] , [ 1088568000000 , 30.269264061274] , [ 1091246400000 , 24.934526898906] , [ 1093924800000 , 24.265982759406] , [ 1096516800000 , 27.217794897473] , [ 1099195200000 , 30.802601992077] , [ 1101790800000 , 36.331003758254] , [ 1104469200000 , 43.142498700060] , [ 1107147600000 , 40.558263931958] , [ 1109566800000 , 42.543622385800] , [ 1112245200000 , 41.683584710331] , [ 1114833600000 , 36.375367302328] , [ 1117512000000 , 40.719688980730] , [ 1120104000000 , 43.897963036919] , [ 1122782400000 , 49.797033975368] , [ 1125460800000 , 47.085993935989] , [ 1128052800000 , 46.601972859745] , [ 1130734800000 , 41.567784572762] , [ 1133326800000 , 47.296923737245] , [ 1136005200000 , 47.642969612080] , [ 1138683600000 , 50.781515820954] , [ 1141102800000 , 52.600229204305] , [ 1143781200000 , 55.599684490628] , [ 1146369600000 , 57.920388436633] , [ 1149048000000 , 53.503593218971] , [ 1151640000000 , 53.522973979964] , [ 1154318400000 , 49.846822298548] , [ 1156996800000 , 54.721341614650] , [ 1159588800000 , 58.186236223191] , [ 1162270800000 , 63.908065540997] , [ 1164862800000 , 69.767285129367] , [ 1167541200000 , 72.534013373592] , [ 1170219600000 , 77.991819436573] , [ 1172638800000 , 78.143584404990] , [ 1175313600000 , 83.702398665233] , [ 1177905600000 , 91.140859312418] , [ 1180584000000 , 98.590960607028] , [ 1183176000000 , 96.245634754228] , [ 1185854400000 , 92.326364432615] , [ 1188532800000 , 97.068765332230] , [ 1191124800000 , 105.81025556260] , [ 1193803200000 , 114.38348777791] , [ 1196398800000 , 103.59604949810] , [ 1199077200000 , 101.72488429307] , [ 1201755600000 , 89.840147735028] , [ 1204261200000 , 86.963597532664] , [ 1206936000000 , 84.075505208491] , [ 1209528000000 , 93.170105645831] , [ 1212206400000 , 103.62838083121] , [ 1214798400000 , 87.458241365091] , [ 1217476800000 , 85.808374141319] , [ 1220155200000 , 93.158054469193] , [ 1222747200000 , 65.973252382360] , [ 1225425600000 , 44.580686638224] , [ 1228021200000 , 36.418977140128] , [ 1230699600000 , 38.727678144761] , [ 1233378000000 , 36.692674173387] , [ 1235797200000 , 30.033022809480] , [ 1238472000000 , 36.707532162718] , [ 1241064000000 , 52.191457688389] , [ 1243742400000 , 56.357883979735] , [ 1246334400000 , 57.629002180305] , [ 1249012800000 , 66.650985790166] , [ 1251691200000 , 70.839243432186] , [ 1254283200000 , 78.731998491499] , [ 1256961600000 , 72.375528540349] , [ 1259557200000 , 81.738387881630] , [ 1262235600000 , 87.539792394232] , [ 1264914000000 , 84.320762662273] , [ 1267333200000 , 90.621278391889] , [ 1270008000000 , 102.47144881651] , [ 1272600000000 , 102.79320353429] , [ 1275278400000 , 90.529736050479] , [ 1277870400000 , 76.580859994531] , [ 1280548800000 , 86.548979376972] , [ 1283227200000 , 81.879653334089] , [ 1285819200000 , 101.72550015956] , [ 1288497600000 , 107.97964852260] , [ 1291093200000 , 106.16240630785] , [ 1293771600000 , 114.84268599533] , [ 1296450000000 , 121.60793322282] , [ 1298869200000 , 133.41437346605] , [ 1301544000000 , 125.46646042904] , [ 1304136000000 , 129.76784954301] , [ 1306814400000 , 128.15798861044] , [ 1309406400000 , 87.92388706072] , [ 1312084800000 , 35.70036100870] , [ 1314763200000 , 78.367701837033] , [ 1317355200000 , 29.159665765725] , [ 1320033600000 , 39.793568139753] , [ 1322629200000 , 75.903834028417] , [ 1325307600000 , 72.704218209157] , [ 1327986000000 , 84.936990804097] , [ 1330491600000 , 93.388148670744]]
    // }];

    var filterArray = ["cal", "place", "cat", "prod"];
    var filterBoxArray = [];
    var onFilterArray = [];

    $scope.filterBoxClassInnerCal = "display-none";
    $scope.filterBoxClassInnerPlace = "display-none";
    $scope.filterBoxClassInnerCat = "display-none";
    $scope.filterBoxClassInnerProd = "display-none";


    $scope.iconCal = "";
    $scope.iconPoint = "";
    $scope.iconCat = "";
    $scope.iconProd = "";

    $scope.filterBoxClass = "display-none";
    $scope.filterBoxClassInner = "display-none";
    $scope.filterBoxIcon = "fa-sort-desc";
    $scope.filterCurrDateMessage = "";
    $scope.filterCurrCategoryMessage = "";
    $scope.filterCurrProductMessage = "";
    $scope.filterCurrPointMessage = "";


    $scope.catFilter = {};
    $scope.catFilter.state = false;
    // $scope.catFilters = {}; // beginning of controller
    $scope.prodFilter = {};
    $scope.prodFilter.state = false;

    $scope.pointFilter = {};
    $scope.pointFilter.state = false;


    $scope.toggleClassCat = 'disablePointerCursor';
    $scope.toggleClassProd = 'disablePointerCursor';
    $scope.toggleClassPoints = 'disablePointerCursor';
    $scope.toggleClassDate = 'disablePointerCursor';

    var filteredCats = 0;
    var totalCats = 0;

    var filteredPoints = 0;
    var totalPoints = 0;

    var filteredProds = 0;
    var totalProds = 0;
    // $scope.prodFilters = {}; // beginning of controller

    $scope.applyFilterButtonText = 'Apply Filter';
    $scope.applyFilterButtonDisabled = false;

    $scope.dateFilter = {};
    $scope.dateFilter.state = false;
    $scope.dateFilter.startdate = "";
    $scope.dateFilter.finishdate = "";

    $scope.datepicker = false;

    // IR used to get size of Object to hide/show category and product filter
    $scope.Objectsize = function(obj) {
        var size = 0,
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    var k;

    $scope.filterBoxFunction = function(z) {

        if (($scope.filterBoxClassInner == "display-block" && k == z) || z == 'apply') hideFilter();
        else showFilter();

        function hideFilter() {
            $scope.filterBoxClassInner = "display-none";

            if ($scope.filterCurrDateMessage == "" && $scope.filterCurrCategoryMessage == "" && $scope.filterCurrPointMessage == "" && $scope.filterCurrProductMessage == "") {
                $scope.filterBoxClass = "display-none";

                $scope.iconCal = "";
                $scope.iconPoint = "";
                $scope.iconCat = "";
                $scope.iconProd = "";
            } else {
                if ($scope.filterCurrDateMessage != "") $scope.iconCal = "filter-active";
                else $scope.iconCal = "";

                if ($scope.filterCurrCategoryMessage != "") $scope.iconCat = "filter-active";
                else $scope.iconCat = "";

                if ($scope.filterCurrPointMessage != "") $scope.iconPoint = "filter-active";
                else $scope.iconPoint = "";

                if ($scope.filterCurrProductMessage != "") $scope.iconProd = "filter-active";
                else $scope.iconProd = "";
            }
        }

        function showFilter() {
            for (var i = 0; i < 4; i++) {
                if (filterArray[i] == z) {
                    filterBoxArray[i] = "display-block";
                    onFilterArray[i] = "on-filter";
                    k = z;
                } else {
                    filterBoxArray[i] = "display-none";
                    onFilterArray[i] = "";
                }
            }

            $scope.iconCal = onFilterArray[0];
            $scope.iconPoint = onFilterArray[1];
            $scope.iconCat = onFilterArray[2];
            $scope.iconProd = onFilterArray[3];

            $scope.filterBoxClassInnerCal = filterBoxArray[0];
            $scope.filterBoxClassInnerPlace = filterBoxArray[1];
            $scope.filterBoxClassInnerCat = filterBoxArray[2];
            $scope.filterBoxClassInnerProd = filterBoxArray[3];

            if ($scope.filterCurrDateMessage != "" && onFilterArray[0] == "") $scope.iconCal = "filter-active";
            if ($scope.filterCurrCategoryMessage != "" && onFilterArray[2] == "") $scope.iconCat = "filter-active";
            if ($scope.filterCurrPointMessage != "" && onFilterArray[1] == "") $scope.iconPoint = "filter-active";
            if ($scope.filterCurrProductMessage != "" && onFilterArray[3] == "") $scope.iconProd = "filter-active";


            // if($scope.filterCurrMessage == "")
            $scope.filterBoxClass = "display-block";
            $scope.filterBoxClassInner = "display-block";
        }

    }

    $scope.clearFilter = function() {

        //  $scope.procDateFilter(false,true);
        $scope.procPointsFilter(false);
        //$scope.procCategoryFilter(false);
        //$scope.procProductFilter(false);
    }

    $scope.procCategoryFilter = function(forceState) {
        $scope.catFilter.state = forceState;

        if ($scope.catFilter.state) {
            $scope.filterCurrCategoryMessage = "Category filter is active (" + (totalCats - filteredCats) + " of total " + totalCats + " categories)";
            $scope.toggleClassCat = 'state-success';
            $scope.applyFilter(true);
        } else {
            $scope.filterCurrCategoryMessage = "";

            // $scope.filterSpec = DEFAULT_FILTER;
            // do a reset filter instead (put all found fields to true)
            resetFilterSpec('categories');

            $scope.toggleClassCat = 'disablePointerCursor';
            $scope.catFilters = DEFAULT_CAT_FILTER;
            console.log($scope.catFilters);
            $scope.applyFilter(true);
        }

        // $scope.catFilter = !$scope.catFilter;
        // console.log("procCategoryFilter has "+$scope.catFilter);
        // if($scope.catFilter){
        //   $scope.filterCurrMessage = "Category filter is active";
        // } else {
        //   $scope.filterCurrMessage = "";
        // }
    }

    $scope.toggleCatFilter = function() {
        // console.log("changed ");


        $scope.filterSpec.categories[0] = $scope.catFilters;
        console.log($scope.catFilters);

        var foundFalse = false;
        filteredCats = 0;
        totalCats = 0;
        for (var p in $scope.catFilters) {
            totalCats++;
            if ($scope.catFilters[p] == false) {
                foundFalse = true;
                filteredCats++;
            }
        }
        if (foundFalse)
            $scope.procCategoryFilter(true);
        else
            $scope.procCategoryFilter(false);
    }

    function resetFilterSpec(filterType) {
        // NUNOALEX this is not supporting the circle filter pointid array
        //$scope.filterSpec
        console.log("resetFilterSpec");
        for (var c in $scope.filterSpec) {
            // if c == argument
            // console.log(message);
            if (filterType == 'points') {
                initFilteredPoints(true);

            }
            /*      else if(filterType == 'dates'){
                      $scope.filterSpec.dates.startdate = ""
                      $scope.filterSpec.dates.finishdate = ""
                  }*/
            else {
                if (c == filterType && $scope.filterSpec[c].length > 0) {
                    for (var prop in $scope.filterSpec[c][0])
                        $scope.filterSpec[c][0][prop] = true;
                }

            }

        }

    }

    $scope.procProductFilter = function(forceState) {
        // if(forceState != undefined)
        $scope.prodFilter.state = forceState;
        // else {
        //   if($scope.prodFilter.state)
        //     $scope.prodFilter.state = false;
        //   else
        //     $scope.prodFilter.state = true;
        // }

        $scope.prodFilter.state = forceState;

        console.log("procProductFilter has " + $scope.prodFilter.state);
        if ($scope.prodFilter.state) {
            $scope.filterCurrProductMessage = "Product filter is active (" + (totalProds - filteredProds) + " of total " + totalProds + " products)";
            $scope.toggleClassProd = 'state-success';
        } else {
            $scope.filterCurrProductMessage = "";

            // $scope.filterSpec = DEFAULT_FILTER;
            // do a reset filter instead (put all found fields to true)
            resetFilterSpec('products');

            $scope.toggleClassProd = 'disablePointerCursor';
            $scope.prodFilters = DEFAULT_PROD_FILTER;
            console.log($scope.prodFilters);
        }

        $scope.applyFilter(true);
    }

    $scope.toggleProdFilter = function() {
        // console.log("changed ");

        console.log("toggleProdFilter");

        $scope.filterSpec.products[0] = $scope.prodFilters;
        console.log($scope.prodFilters);

        var foundFalse = false;
        filteredProds = 0;
        totalProds = 0;
        for (var p in $scope.prodFilters) {
            totalProds++;
            if ($scope.prodFilters[p] == false) {
                foundFalse = true;
                filteredProds++;
            }
        }

        if (foundFalse) $scope.procProductFilter(true);
        else $scope.procProductFilter(false);
    }

    $scope.procPointsFilter = function(forceState) {

        console.log("procPointsFilter");

        $scope.pointFilter.state = forceState;

        if ($scope.pointFilter.state) {
            $scope.filterCurrPointMessage = "Points filter is active (" + (totalPoints - filteredPoints) + " of total " + totalPoints + " points)";
            $scope.toggleClassPoints = 'state-success';
            $scope.applyFilter(true);

        } else {

            $scope.filterCurrPointMessage = "";

            // do a reset filter instead (put all found fields to true)
            resetFilterSpec('points');

            $scope.toggleClassPoints = 'disablePointerCursor';

            $scope.applyFilter(true);

            //$scope.toggleAll = "Unselect All";
            $scope.check = "checked";

        }
    }

    $scope.togglePointsFilter = function() {

        console.log("togglePointsFilter");

        // $scope.filterSpec.points[0] = $scope.pointsFilteredBox;

        var foundFalse = false;
        filteredPoints = 0;
        totalPoints = 0

        for (var p in $scope.pointsFilteredBox) {
            totalPoints++;

            if ($scope.pointsFilteredBox[p] == false) {
                foundFalse = true;
                filteredPoints++;
            }
        }

        if (foundFalse) $scope.procPointsFilter(true);
        else $scope.procPointsFilter(false);
    }

    $scope.procDateFilter = function(forceState, btn) {

        console.log("procDateFilter");

        $scope.dateFilter.state = forceState;

        $scope.filterSpec.dates = $scope.dateFilter;

        console.log("filterSpec from procDateFilter ", $scope.filterSpec);

        if ($scope.dateFilter.state) {

            $scope.filterCurrDateMessage = "Dates filter is active from " + $scope.filterSpec.dates.startdate + " to " + $scope.filterSpec.dates.finishdate;
            $scope.toggleClassDate = 'state-success';

            $scope.datepickerStart = false;
            $scope.datepickerEnd = false;

            sharedCommsService.messageFilter = "updatedFilter"
            sharedCommsService.filterSpec = $scope.filterSpec;
            sharedCommsService.broadcastFilter();

            $scope.applyFilter(true);
        } else {
            $scope.filterCurrDateMessage = "";

            // $scope.filterSpec = DEFAULT_FILTER;
            // do a reset filter instead (put all found fields to true)
            resetFilterSpec('dates');
            $scope.toggleClassDate = 'disablePointerCursor';
            console.log($scope.dateFilter);
            $scope.hide = "";
            $scope.applyFilter(true);

            if (btn == true) {
                $scope.dateFilter.startdate = "";
                $scope.dateFilter.finishdate = "";
            }
        }
    }

    $scope.toggleDatepicker = function() {
        if ($scope.datepicker == false) {
            $scope.datepicker = true;
        } else
            $scope.datepicker = false;
    }

    $scope.toggleDateFilter = function(btnDatepicker) {
        console.log("toggleDateFilter");

        $scope.datepicker = false

        if (btnDatepicker) {
            var dt = new Date($scope.dt1);

            var day = dt.getDate();
            var month = dt.getMonth() + 1;

            if ((dt.getMonth() + 1) < 10) month = '0' + (dt.getMonth() + 1);
            if (dt.getDate() < 10) day = '0' + dt.getDate();
            $scope.dateFilter.startdate = dt.getFullYear() + "-" + month + "-" + day;


            var dt = new Date($scope.dt2)

            var day = dt.getDate();
            var month = dt.getMonth() + 1;

            if ((dt.getMonth() + 1) < 10) month = '0' + (dt.getMonth() + 1)
            if (dt.getDate() < 10) day = '0' + dt.getDate();
            $scope.dateFilter.finishdate = dt.getFullYear() + "-" + month + "-" + day;

        }

        var foundFalse = false;
        var startdate = $scope.dateFilter.startdate;
        var finishdate = $scope.dateFilter.finishdate;

        if (startdate > $scope.widget.date || finishdate > $scope.widget.date) {
            $scope.dateMessage = "Latest date is " + $scope.widget.date;
            $scope.dateWarn = 'display-block';
            foundFalse = true;
        } else if (startdate > finishdate && finishdate != "") {
            $scope.dateMessage = "Verify your dates";
            $scope.dateWarn = 'display-block';
            foundFalse = true;
        } else {
            $scope.dateMessage = "";
            $scope.dateWarn = 'display-none';
            foundFalse = false;
        }

        if (startdate != "" && finishdate != "" && startdate <= finishdate && foundFalse == false) {

            if (startdate == finishdate) $scope.hide = "display-none";
            else $scope.hide = "";

            console.log("dateFilter from toggleDateFilter", $scope.dateFilter);

            $scope.procDateFilter(true, false);
        }
    }

    $scope.preDatesFilter = function(value) {

        console.log('preDatesFilter')
        var start = null;
        var end = null;

        var lastSample = new Date($scope.widget.date);

        if (value == 'today') {
            start = new Date();
            end = new Date();
        } else if (value == 'yesterday') {
            start = new Date();
            start.setDate(start.getDate() - (start.getDay() - 1));

            end = new Date();
            end.setDate(start.getDate() - (start.getDay() - 1));
        } else if (value == 'thisWeek') {
            start = new Date();
            start.setDate(start.getDate() - (start.getDay() - 1));

            end = lastSample;
        } else if (value == 'lastWeek') {
            start = new Date();
            start.setDate(start.getDate() - start.getDay() - 6);

            end = new Date();
            end.setDate(end.getDate() - end.getDay());
        } else if (value == 'last15') {
            start = new Date();
            start.setDate(start.getDate() - 15);

            end = lastSample;
        } else if (value == 'thisMonth') {
            start = new Date();
            start.setDate(1);

            end = lastSample;
        } else if (value == 'lastMonth') {
            start = new Date();
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);

            end = new Date();
            end.setMonth(end.getMonth() - 1);


            switch (new Date(end.getYear(), end.getMonth() + 1, 0).getDate()) {
                case 28:
                    end.setDate(28);
                    break;

                case 29:
                    end.setDate(29);
                    break;

                case 30:
                    end.setDate(30);
                    break;

                case 31:
                    end.setDate(31);
                    break;
            }

        } else if (value == 'trimester') {
            start = new Date();
            start.setMonth(start.getMonth() - 3);

            end = lastSample;
        } else if (value == 'quarter') {
            start = new Date();
            start.setMonth(start.getMonth() - 4);

            end = lastSample;
        } else if (value == 'semester') {
            start = new Date();
            start.setMonth(start.getMonth() - 6);

            end = lastSample;
        } else if (value == 'thisYear') {
            start = new Date();
            start.setMonth(0);
            start.setDate(1);

            end = lastSample;
        } else if (value == 'lastYear') {
            start = new Date();
            start.setFullYear(start.getFullYear() - 1);
            start.setMonth(0);
            start.setDate(1);

            end = new Date();
            end.setFullYear(end.getFullYear() - 1);
            end.setMonth(11);
            end.setDate(31);
        }

        var startMonth = start.getMonth() + 1;
        var endMonth = end.getMonth() + 1;
        var endDay = end.getDate();
        var startDay = start.getDate();

        if (startMonth < 10) startMonth = '0' + startMonth;
        if (endMonth < 10) endMonth = '0' + endMonth;

        if (startDay < 10) startDay = '0' + startDay;
        if (endDay < 10) endDay = '0' + endDay;


        $scope.dateFilter.startdate = start.getFullYear() + "-" + startMonth + "-" + startDay;
        $scope.dateFilter.finishdate = end.getFullYear() + "-" + endMonth + "-" + endDay;

        console.log("dateFilter from preDatesFilter", $scope.dateFilter);

        $scope.datepicker = false;
        $scope.toggleDateFilter();
    }

    // initFilteredPoints();

    var initFilteredPoints = function(state) {
        console.log("initFilteredPoints");
        // $scope.pointsFilteredBox

        for (var pointid in $scope.pointsFilteredBox) {
            if ($scope.pointsFilteredBox.hasOwnProperty(pointid)) {
                // do stuff
                $scope.pointsFilteredBox[pointid] = state;
            }
        }
    }

    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.message == "filterGeo") {
            // console.log("received filter filterGeo");
            // console.log(sharedCommsService.pointIdsToFilter);

            console.log("FILTER GEO");


            // definir o $scope.filterSpec, parte dos pontos
            $scope.filterSpec.points = sharedCommsService.pointIdsToFilter;
            // console.log("$scope.filterSpec");
            // console.log($scope.filterSpec);

            console.log($scope.filterSpec.points);
            initFilteredPoints(false);


            // $scope.filterSpec.points.forEach(function(pointid){
            //   $scope.pointsFilteredBox[pointid] = true;
            // })

            for (var pointid in $scope.filterSpec.points) {
                if ($scope.filterSpec.points.hasOwnProperty(pointid)) {
                    $scope.pointsFilteredBox[$scope.filterSpec.points[pointid]] = true;
                }
            }

            // perceber se nao tem impacto nos outros, 
            // e se os outros n tem impacto neste OK
            // chamar a função $scope.applyFilter()
            $scope.applyFilter(false);
            // ver na api se recebemos o filterspec com os pontos
            // dps na api é filtrar pelos pontid

            if (sharedCommsService.pointIdsToFilter.length > 0) {
                $scope.togglePointsFilter();
                $scope.procPointsFilter(true);
            } else
                $scope.procPointsFilter(false);

        }
    });


    $scope.chartTypes = [{
        "id": "line",
        "title": "Line"
    }, {
        "id": "spline",
        "title": "Smooth line"
    }, {
        "id": "area",
        "title": "Area"
    }, {
        "id": "areaspline",
        "title": "Smooth area"
    }, {
        "id": "column",
        "title": "Column"
    }];



    $scope.highchartsNG = {
        options: {
            chart: {
                type: 'bar'
            }
        },
        series: [{
            data: [10, 15, 12, 8, 7]
        }],
        title: {
            text: 'Hello'
        },
        size: {
            height: 235
        },
        loading: false
    }


    $scope.chartSelectOptions = {
        chartOptions: ['Ranking', 'Stores History', 'Total History'],
        selectedChartOption: null
    }


    var extractFromData = function(arr, attribute) {
        var index = 1;
        if (attribute == 'value') {
            index = 1;
        }
        if (attribute == 'category') {
            index = 0;
        }

        var toRet = new Array();
        for (var i = 0; i < arr.length; i++) {
            // toRet.push(arr[i][index]);
            var datetime = arr[i][0];
            if (datetime instanceof Date) {
                datetime = datetime.getTime();
            }
            toRet.push([datetime, arr[i][1]]);
        }
        return toRet;
    }

    var extractSeries = function(arr, attribute, multiple_series) {
        var toRet = {};
        toRet.data = new Array();
        toRet.displaySymbols = false;

        if (multiple_series == false) {
            var data = extractFromData(arr, 'value');
            if (data.length == 1) {
                toRet.displaySymbols = true;
            }
            toRet.data = [{
                'name': 'All stores',
                'data': data
            }];
            return toRet;
        } else {
            for (var i = 0; i < arr.length; i++) {
                var aux = arr[i];
                var data = extractFromData(aux.values, 'value');
                if (data.length == 1) {
                    toRet.displaySymbols = true;
                }
                toRet.data.push({
                    'name': aux.key,
                    'data': data
                });
            }
            return toRet;
        }
    }

    // needs to return 
    var extractCategoriesValues = function(arr) {
        var toRet = {};

        var arrAux = arr[0].values;
        var categories = new Array();
        var values = new Array();

        for (var i = 0; i < arrAux.length; i++) {
            categories.push(arrAux[i][0]);
            values.push(arrAux[i][1]);
        }

        toRet.series = [{
            data: values
        }];
        toRet.categories = categories;
        return toRet;
    }

    var charopts = {
        'Ranking': {
            "chart": 'column',
            'xaxistype': 'linear',
            'series': [{
                data: []
            }],
            "categories": ['waka', 'nana', 'fofandem', 'foraeldre']
        },
        'Stores History': {
            "chart": 'line',
            'xaxistype': 'datetime',
            'series': [{
                data: []
            }]
        },
        'Total History': {
            "chart": 'line',
            'xaxistype': 'datetime',
            'series': [{
                data: []
            }]
        }
    }


    $scope.applyChart = function(newvalue) {
        $scope.highchartsNG.loading = true;
        if ($scope.chartSelectOptions.chartOptions.indexOf(newvalue) > -1) {
            if (newvalue == 'Ranking' && $scope.exampleDataRanking != null && $scope.exampleDataRanking != undefined && $scope.exampleDataRanking.length > 0) {
                var data = extractCategoriesValues($scope.exampleDataRanking);
                charopts['Ranking'].series = data.series;
                charopts['Ranking'].categories = data.categories;
                charopts['Ranking'].series[0].showInLegend = false;
            }

            if (newvalue == 'Stores History' && $scope.chartReadingsArray != null && $scope.chartReadingsArray != undefined) {
                var extracted = extractSeries($scope.chartReadingsArray, 'value', true);
                charopts['Stores History'].series = extracted.data;
                // $scope.highchartsNG.options.plotOptions.series.marker.enabled = extracted.displaySymbols;
            }


            $scope.highchartsNG.options.chart.type = charopts[newvalue].chart;
            $scope.highchartsNG.xAxis.type = charopts[newvalue].xaxistype;
            $scope.highchartsNG.series = charopts[newvalue].series;
            //$scope.highchartsNG.yAxis.title.text = $scope.widget.unit;


            if (charopts[newvalue].hasOwnProperty('categories')) {
                $scope.highchartsNG.xAxis.categories = charopts[newvalue].categories;
            } else {
                $scope.highchartsNG.xAxis.categories = null;
            }

            if (newvalue == 'Total History') {
                $scope.highchartsNG = angular.copy($scope.chartHistoryTotal.config);
                $scope.highchartsNG.series[0].name = 'All';
                $scope.higchartsNg.options.yAxis.title.text = $scope.widget.unit;

                //$scope.highchartsNG.options.plotOptions.series.marker.enabled = extracted.displaySymbols;
            }

            // use this when the statistics box values change (minimum today could be different than minimum from all history)
            // $scope.highchartsNG.yAxis.min = $scope.minimum;
            // $scope.highchartsNG.yAxis.max = $scope.maximum;
            //$scope.highchartsNG.options.chart.marginRight = $scope.rightMarginIn;


        }
        $scope.highchartsNG.loading = false;
        $timeout(function() {
            $scope.$broadcast('highchartsng.reflow');
        }, 0);
    }


    var lastSelectedChart = null;

    $scope.setSelectedChart = function(newvalue, ignoreLastSelected) {
        $scope.chartSelectOptions.selectedChartOption = null;
        if (lastSelectedChart == null) {
            $scope.chartSelectOptions.selectedChartOption = 'Ranking';
        } else {
            if (ignoreLastSelected == undefined || ignoreLastSelected == false) {
                // comes from filters...
                $scope.chartSelectOptions.selectedChartOption = lastSelectedChart;
            } else {
                $scope.chartSelectOptions.selectedChartOption = newvalue;
            }
        }
        lastSelectedChart = $scope.chartSelectOptions.selectedChartOption;
        $scope.applyChart($scope.chartSelectOptions.selectedChartOption);
    }

    // placed this as a scope variable so that it could be edited via input on newdash.jade
    $scope.rightMarginIn = 40;

    $scope.highchartsNG = {
        options: {
            chart: {
                type: 'line',
                //marginRight: $scope.rightMarginIn
            },
            plotOptions: {
                series: {
                    stacking: '',
                    marker: {
                        enabled: true
                    }
                }
            }
            //   ,
            // legend: {
            //     layout: 'vertical',
            //     align: 'topleft',
            //     verticalAlign: 'bottom',
            //     borderWidth: 1,
            //     style: {
            //      display: 'none'
            //     }
            // }
        },
        series: [{
            // name: 'Retail',
            data: []
        }],
        title: {
            text: null
        },
        size: {
            height: 250
        },
        xAxis: {
            type: 'linear',
            categories: []
        },
        yAxis: {
            title: {
                text: null
            },
            startOnTick: false
        },
        loading: true
    }
}

xTableCtrl.$inject = ['$scope', '$http', '$location', '$routeParams', '$timeout', 'socket', 'sharedCommsService'];

function xTableCtrl($scope, $http, $location, $routeParams, $timeout, socket, sharedCommsService) {

    console.log('xTableCtrl');

    $scope.search = {};
    $scope.points = [];
    $scope.order = 'label';
    $scope.isLoading = true;
    $scope.tableHeight = '380px';

    if (sharedCommsService.messageFilter == "updatedFilter") {
        generateTable(sharedCommsService.filterSpec)
    } else {
        generateTable($scope.filterSpec);
    }

    $scope.$on('handleBroadcastFilter', function() {

        console.log('handleBroadcastFilter from Table')

        if (sharedCommsService.messageFilter == "updatedFilter") {
            generateTable(sharedCommsService.filterSpec);
        }
    });

    $scope.isString = function(item) {
        return angular.isString(item);
    }

    $scope.setOrder = function(val) {
        //$scope.order = '\u0022'+ val +'\u0022';

        if (val == 'label') {
            $scope.reverse = false;
        } else $scope.reverse = true;

        $scope.order = val;
    }

    $scope.predicate = function(val) {
        return val[$scope.order];
    }

    function generateTable(filter) {
        $http.post('/dashboard/pointsMatrix/' + $scope.pid, filter).
        success(function(data, status) {
            console.log("/dashboard/pointsMatrix/", data);

            $scope.points = data.matrixPoints;
            $scope.isLoading = false;


            $timeout(function() {
                $scope.tableHeight = document.getElementById('table').offsetHeight + 'px';
            });

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

}

xDashCtrl.$inject = ['$scope', '$http', '$location', '$routeParams', 'socket', 'sharedCommsService'];

function xDashCtrl($scope, $http, $location, $routeParams, socket, sharedCommsService) {

    console.log('xDashCtrl');

    $scope.showDashboardHelp = 0;
    $scope.pid = $routeParams.pid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.widgets = [];

    $scope.widgetLoading = 0;
    $scope.isLoading = true;

    socket.on('send:alert', function(u) {
        getWidgets(u.pid == $scope.pid, u.title)
    });
    $scope.$on('send:alert', function(u) {
        getWidgets(u.pid == $scope.pid, u.title)
    });

    if (sharedCommsService.messageFilter == "updatedFilter") {
        $scope.filterSpec = sharedCommsService.filterSpec;
        $scope.widgetLoading = 0;
        $scope.isLoading = true;
        getWidgets();
    } else {
        getWidgets();
    }

    $scope.$on('handleBroadcastFilter', function() {

        console.log("handleBroadcastFilter from xDashCtrl")

        if (sharedCommsService.messageFilter == "updatedFilter") {

            $scope.filterSpec = sharedCommsService.filterSpec;
            $scope.widgetLoading = 0;
            $scope.isLoading = true;
            getWidgets();
        }
    });

    var testWidgetActive = function(widget) {
        if (widget != undefined && widget != null) {
            if (widget.hasOwnProperty('isActive')) {
                return widget.isActive;
            }
        }
        return false;
    }

    $scope.isActive = function(location, widget) {
        var active = (location === $location.path()) || testWidgetActive(widget);
        return active;
    };

    $scope.moveKpi = function(move) {
            var parent = document.getElementById("inner").clientWidth;
            var child = document.getElementById("inner").scrollWidth;
            console.log(parent, child)

            if (move == 'right') {
                $scope.pos = (parent - child);
            } else {
                $scope.pos = 0;
            }
        }
        /*function getWidgets(isNew, title) {

            $http.get('/api/widgets/' + $scope.pid).
            success(function(data, status) {

                $scope.widgets = data;

                if ($scope.widgets.length == 0)
                    $scope.showDashboardHelp = 1;

                $http.post('/api/accumDashboard/' + $scope.pid).
                success(function(data, status) {

                    console.log("/api/accumDashboard/", data)

                    $scope.accumValues = data;

                    for (var i = 0; i < $scope.widgets.length; i++) {
                        if ($scope.widgets[i].title == "Basket")
                            $scope.widgets[i].value = $scope.accumValues[0].basket;

                        else if ($scope.widgets[i].title == "Net Margin")
                            $scope.widgets[i].value = $scope.accumValues[1].acc_margin;

                        else if ($scope.widgets[i].title == "Multiline Bills")
                            $scope.widgets[i].value = $scope.accumValues[2].acc_bills;
                    }
                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                });
            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });
        };*/


    $scope.calculateVariation = function(val, prev) {
        var a = +val;
        var b = +prev;
        return ((a - b) / Math.abs(b)) * 100;
    }

    $scope.getVariationClass = function(value) {
        if (value < 0) {
            return {
                "label": "bg-red",
                "caret": "fa-caret-down"
            };
        } else if (value > 0) {
            return {
                "label": "bg-green",
                "caret": "fa-caret-up"
            };
        } else {
            return {
                "label": "bg-yellow",
                "caret": "fa-caret-right"
            };
        }
    }

    function getWidgets() {
        $http.get('/api/widgets/' + $scope.pid).
        success(function(data, status) {

            $scope.isLoading = false;

            $scope.widgets = data;
            for (var i = 0; i < $scope.widgets.length; i++) {
                var w = $scope.widgets[i];
                if (w.wid == $scope.wid) {
                    $scope.widgets[i].isActive = true;
                }
                if (w.title != "NPS INDEX (HoN)") {
                    $scope.widgets[i].isLoading = true;
                } else {
                    $scope.widgets[i].isLoading = false;
                }
            }


            if ($scope.widgets.length == 0) {
                $scope.showDashboardHelp = 1;
            }



            var assignValueToWidget = function(arr, title, val, data2) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].title == title) {
                        arr[i].value = val;
                        if (data2 != null && data2 != undefined && data2.hasOwnProperty('homologousValue')) {
                            arr[i].homologousValue = data2.homologousValue;
                        }
                        arr[i].isLoading = false;
                    }
                }
            }

            var requests = [];
            for (var i = 0; i < $scope.widgets.length; i++) {

                var tempTitle = $scope.widgets[i].title;
                requests.push({
                    "title": tempTitle,
                    "urlPrefix": "/api/getWidgetValues/",
                    aggrmethod: $scope.widgets[i].aggrmethod
                });

            }
            /*
            var requests = [];
            requests.push({"title": "Net Sales", "urlPrefix": "/api/getWidgetValues/"});
            requests.push({"title": "Number of Customers", "urlPrefix": "/api/getWidgetValues/"});
            requests.push({"title": "Basket", "urlPrefix": "/api/getWidgetValues/"});
            requests.push({"title": "Net Margin", "urlPrefix": "/api/getWidgetValues/"});
            requests.push({"title": "Stock Level", "urlPrefix": "/api/getWidgetValues/"});
            requests.push({"title": "Multiline Bills", "urlPrefix": "/api/getWidgetValues/"});*/


            var shiftAndExecRequest = function() {
                console.log("another round of shiftAndExecRequest");

                var request = requests.shift();

                if (request == undefined) {
                    console.log("request is undefined, stopping shiftAndExecRequest");
                    return;
                }

                console.log("shiftAndExecRequest going for post");

                var toPost = {};
                toPost.filter = $scope.filterSpec;
                toPost.filter.aggrmethod = request.aggrmethod;
                toPost.title = request.title;

                $http.post(request.urlPrefix + $scope.pid, toPost)
                    .success(function(data, status) {
                        console.log("ok: POST " + request.urlPrefix);
                        assignValueToWidget($scope.widgets, request.title, data[0], data[2]);
                        shiftAndExecRequest();
                    })
                    .error(function(data, status) {
                        console.log("ERROR: POST " + request.urlPrefix);
                        assignValueToWidget($scope.widgets, request.title, '-', data[2]);
                        shiftAndExecRequest();
                    });
            }


            shiftAndExecRequest();


            /*if($scope.pid != '3') {
                  for(var i=0; i<$scope.widgets.length; i++){
                  
                    $scope.widgets[i].isLoading = false;
               
                }
            }*/
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

};

xMapCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'leafletData', 'sharedCommsService'];

function xMapCtrl($scope, $http, $routeParams, $location, leafletData, sharedCommsService) {
    console.log('xMapCtrl');
    $scope.pid = $routeParams.pid;
    $scope.wid = $routeParams.wid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    // get row click in PointxKPI table and center map on tha point
    $scope.rowClicked = function(row) {
        console.log("This is rowClicked");
        leafletData.getMap().then(function(map) {
            for (var i = 0; i < $scope.markers.length; i++) {
                if (row.A == $scope.markers[i].name)
                    map.setView(new L.LatLng($scope.markers[i].lat, $scope.markers[i].lng), 15);
            }
        });
    }

    // auxiliar functions
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1); // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }


    function distancesOnPoints(pointsArr) {
        // console.log("maxDistanceOnPoints");
        // console.log(pointsArr);
        var max = 0;
        var min;

        for (var i = 0; i < pointsArr.length; i++) {
            var a = pointsArr[i];
            for (var j = 0; j < pointsArr.length; j++) {
                var b = pointsArr[j];
                if (i != j) {
                    // var distance = Math.ceil(getDistanceFromLatLonInKm( a[0], a[1], b[0], b[1] ));
                    var distance = (getDistanceFromLatLonInKm(a[0], a[1], b[0], b[1]));
                    // console.log("calculated distance: "+ distance );
                    if (max < distance)
                        max = distance;

                    if (min == undefined || min == null)
                        min = distance;
                    if (min > distance)
                        min = distance;
                }
            }
        }
        // min and max are in km, we need to return meters
        return [min * 1000, max * 1000];
    }


    function averageDistancesOnPoints(pointsArr) {
        var sum = 0;
        var count = 0;

        for (var i = 0; i < pointsArr.length; i++) {
            var a = pointsArr[i];
            for (var j = 0; j < pointsArr.length; j++) {
                var b = pointsArr[j];
                if (i != j) {
                    var distance = Math.ceil(getDistanceFromLatLonInKm(a[0], a[1], b[0], b[1]));
                    // console.log("calculated distance: "+ distance );
                    sum += distance;
                    count++;
                }
            }
        }
        return Math.round((sum / count) * 1000);
    }



    $http.get('/api/getProjectCenter/' + $scope.pid).
    success(function(data) {
        // // // console.log("yeah getProjectCenter");
        // $location.path('/projects');
        // // // console.log(data);
        $scope.madeira.lat = data.x;
        $scope.madeira.lng = data.y;
        $scope.madeira.zoom = 10;

        // // transform array of objects to array of arrays
        // var procPoints = new Array();
        // for(var i=0; i<data.points.length; i++){
        //   var point = data.points[i];
        //   // console.log(point);
        //   procPoints.push([point.x, point.y]);
        // }

        var hmSz = 30000;


        // // if min max approach
        // var distances = distancesOnPoints(procPoints);
        // // console.log("distances "+distances[0]+" "+distances[1]);
        // hmSz = distances[0]*3;
        // hmSz = distances[1]/2;
        // // console.log("average min max distance points: "+((distances[0]+distances[1])/2));
        // hmSz = ((distances[0]+distances[1])/2);


        // // if distances average approach
        // var hmSz = averageDistancesOnPoints(procPoints);
        // // console.log("average all points: "+hmSz);

        // // console.log("heatmap size: "+hmSz);
        $scope.updateHeatmapSize(hmSz, null);
    });

    // $scope.dataPointsHeatmap = [[ 44.651144316, -63.586260171, 0.5], [44.75, -63.5, 0.8]];
    $scope.dataPointsHeatmap = [];

    angular.extend($scope, {
        london: {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        },
        madeira: {
            lat: 39.666667,
            lng: -8.133333,
            zoom: 6
        },
        events: {},
        controls: {
            draw: {
                polygon: false,
                polyline: false,
                marker: false,
                circle: {
                    shapeOptions: {
                        color: '#22ad91'
                    }
                }
            }
        },
        layers: {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                cycle: {
                    name: 'OpenCycleMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                google: {
                    name: 'Google Satellite',
                    layerType: 'SATELLITE',
                    type: 'google'
                }
                /*,
                                dark: {
                                  name: 'Dark CartoDB',
                                  type: 'xyz',
                                  url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                                  layerOptions: {
                                      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
                                  }
                                }*/
            },
            overlays: {
                // heatmap: {
                //     name: 'Heat Map',
                //     type: 'heatmap',
                //     data: $scope.dataPointsHeatmap,
                //     // layerOptions: {"size": 30000}, // doesnt work... we need to use layerOptions instead of options
                //     layerOptions: {"size": 400000}, // doesnt work... we need to use layerOptions instead of options
                //     visible: true
                // }
            }
        },
        updateHeatmapSize: function(val, dataPoints) {
            // console.log("updateHeatmapSize with size: "+val);
            // console.log(this.layers.overlays.heatmap.layerOptions.size);
            // this.layers.overlays.heatmap.layerOptions.size = val;
            // console.log(this.layers.overlays.heatmap.layerOptions.size);
            // console.log(this.layers.overlays);



            if (val == null || val == undefined)
                val = this.layers.overlays.heatmap.layerOptions.size;

            if (dataPoints == null || dataPoints == undefined)
                dataPoints = $scope.dataPointsHeatmap;


            delete this.layers.overlays.heatmap;
            // console.log(this.layers.overlays);

            /*this.layers.overlays.heatmap = {
                name: 'Heat Map',
                type: 'heatmap',
                data: dataPoints,
                // layerOptions: {"size": 30000}, // doesnt work... we need to use layerOptions instead of options
                layerOptions: {"size": val}, // doesnt work... we need to use layerOptions instead of options
                visible: false
            };*/
            // console.log(this.layers.overlays);
        }
    });

    $scope.markers = new Array();



    $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        // Args will contain the marker name and other relevant information
        console.log("Leaflet Click");

        // removed code for handling clicks on map marker on the new dashboard
        // in the future, this would handle clicks to select markers onto the point filterSpec

    });



    $scope.$on('leafletDirectiveMarker.mouseover', function(e, args) {
        args.leafletEvent.target.openPopup();
        // console.log("Leaflet Hover");
    });

    $scope.$on('leafletDirectiveMarker.mouseout', function(e, args) {
        args.leafletEvent.target.closePopup();
        // console.log("Leaflet out");
    });


    var geojsoncolors = {};
    $scope.filteredPoints = new Array();
    $scope.filteringPointsDraw = false;


    function isInArray(arr, elem) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == elem)
                return true;
        }
        return false;
    }

    function getGeojsonColor(id) {
        var ret = geojsoncolors[id];

        if (ret == undefined || ret == null)
            ret = "gray";
        return ret;
    }

    function getColorIfSelected(id, selectedId) {
        if (id == selectedId)
            return "orange";
        else {
            if (!$scope.filteringPointsDraw) {
                if ($scope.heatmapActive)
                    return getGeojsonColor(id);
                else
                    return "purple";
            } else {
                // we need to search if the id is in the filteredPoints
                if (isInArray($scope.filteredPoints, id)) {
                    // console.log( id + " is on array");
                    // console.log($scope.filteredPoints);
                    if ($scope.heatmapActive)
                        return getGeojsonColor(id);
                    else
                        return "purple";
                } else {
                    // console.log( id + " is NOT on array");
                    // console.log($scope.filteredPoints);
                    return "gray";
                }
            }
        }
    }

    function featureStyle(feature) {
        return {
            fillColor: getColorIfSelected(feature.properties.pointid, $scope.pointid),
            weight: 3,
            opacity: 1,
            // color: 'purple',
            color: getColorIfSelected(feature.properties.pointid, $scope.pointid),
            // dashArray: '3',
            fillOpacity: 0.5,
            onEachFeature: function(feature, layer) {
                    layer.bindPopup("number: " + feature.properties.ref);
                } // nao surtiu efeito...
        };
    }


    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }


    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }


    function hslToRgbToHex(h, s, v) {
        var r, g, b, i, f, p, q, t;
        if (h && s === undefined && v === undefined) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        // console.log(Math.round(r * 255) + " " + Math.round(g * 255) + " " + Math.round(b * 255));

        return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));

        // return {
        //     r: Math.floor(r * 255),
        //     g: Math.floor(g * 255),
        //     b: Math.floor(b * 255)
        // };
    }


    $scope.geojsonObj = {};
    $scope.hoveredGeometry = "";

    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.message == "updateWid") {
            $scope.wid = parseInt(sharedCommsService.wid);
            getPointsFromWidget();
        }
    });


    var getPointsFromWidget = function() {
        if ($scope.wid != null && $scope.wid != undefined && $scope.wid != -1 && $scope.wid != '-1') {

            $http.get('/api/pointsFromWidget/' + $scope.pid + '/' + $scope.wid).
            success(function(data, status) {
                $scope.markers = new Array();
                var unit = data.unit;
                var max;
                var min;
                var auxHeatmap = [];
                var auxGeojsonHeatmap = [];

                $scope.geojsonObj = {
                    "type": "FeatureCollection",
                    "crs": {
                        "type": "name",
                        "properties": {
                            "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                        }
                    },
                    "features": []
                };

                var bounds = [];
                bounds.push([$scope.madeira.lat, $scope.madeira.lng]);

                // for(var d in data.locations){
                for (var d = 0; d < data.locations.length; d++) {

                    if (data.locations[d].geometry == null) {
                        auxHeatmap.push([data.locations[d].x, data.locations[d].y, data.locations[d].value, data.locations[d].name]);
                    } else {
                        auxGeojsonHeatmap.push([data.locations[d].pointid, data.locations[d].value]);
                    }

                    if (d == 0) {
                        max = +data.locations[d].value;
                    } else {
                        if (+data.locations[d].value > max)
                            max = +data.locations[d].value;
                    }

                    if (d == 0) {
                        min = +data.locations[d].value;
                    } else {
                        if (+data.locations[d].value < min)
                            min = +data.locations[d].value;
                    }



                    // $scope.legend = {
                    //   position: 'bottomleft',
                    //   colors: [ '#ff0000', '#28c9ff', '#0000ff', '#ecf386' ],
                    //   labels: [ 'National Cycle Route', 'Regional Cycle Route', 'Local Cycle Network', 'Cycleway' ]
                    // };



                    if (data.locations[d].pointid == $scope.pointid) {

                        if (data.locations[d].geometry == null) {
                            $scope.markers.push({
                                lat: data.locations[d].x,
                                lng: data.locations[d].y,
                                pointid: data.locations[d].pointid,
                                zIndexOffset: 1000,
                                name: nameFromAttributes(data.locations[d], data.locations[d].pointid),
                                icon: {
                                    type: 'awesomeMarker',
                                    // icon: 'crosshairs',
                                    icon: 'check',
                                    prefix: 'fa',
                                    markerColor: 'orange',
                                    // spin: true,
                                    weight: 5,
                                    opacity: 0
                                }
                            });
                        } else {
                            $scope.geojsonObj.features.push(data.locations[d].geometry);
                        }



                        bounds.push([data.locations[d].x, data.locations[d].y]);

                    } else {

                        // console.log(data.locations[d].type);
                        var icon = 'circle';
                        var prefix = 'fa';
                        var markerColor = 'blue';
                        if (data.locations[d].type == "Laboratory") {
                            icon = 'home';
                            // markerColor = 'green';
                        } else if (data.locations[d].type == "Distribution") {
                            icon = 'ambulance';
                            // markerColor = 'orange';
                        } else if (data.locations[d].type == "Final Client") {
                            icon = 'users';
                            // markerColor = 'purple';
                        }


                        var toPush = {
                            lat: data.locations[d].x,
                            lng: data.locations[d].y,
                            pointid: data.locations[d].pointid,
                            predecessorId: data.locations[d].predecessor,
                            value: parseFloat(data.locations[d].value),
                            //message: buildMessage(data.locations[d], true),
                            name: data.locations[d].name,
                            // layer: attrType,
                            icon: {
                                type: 'awesomeMarker',
                                // icon: 'crosshairs',
                                icon: icon,
                                prefix: prefix,
                                markerColor: markerColor,
                                // spin: true,
                                opacity: 0
                            }
                        };

                        // if(data.locations.length > 19)
                        //   toPush['group'] = 'clustermarkers';

                        if (data.locations[d].geometry == null) {
                            $scope.markers.push(toPush);
                        } else {
                            $scope.geojsonObj.features.push(data.locations[d].geometry);
                        }

                        if ($scope.pointid == undefined || $scope.pointid == undefined)
                            bounds.push([data.locations[d].x, data.locations[d].y]);

                    }


                } // end data.locations

                if (bounds.length > 0) {
                    leafletData.getMap().then(function(map) {
                        map.fitBounds(bounds, {
                            padding: [50, 50]
                        });
                    });
                }

                // console.log("max is "+max);
                leafletData.getMap().then(function(map) {
                    $scope.legend = L.control({
                        position: 'bottomleft'
                    });

                    $scope.legend.onAdd = function(map) {
                        var div = L.DomUtil.create('div', 'info legend'),
                            grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                            labels = [];
                        // loop through our density intervals and generate a label with a colored square for each interval
                        // for (var i = 0; i < grades.length; i++) {
                        //     div.innerHTML +=
                        //         '<i style="background:' + '#0000ff' + '"></i> ' +
                        //         grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                        // }

                        div.innerHTML += "<h5 style='margin-top: 0;'>Heat map values:</h5>";

                        var max2 = max * 0.25;
                        var max3 = max * 0.75;
                        var min2 = min * 0.25;
                        var min3 = min * 0.75;

                        if (min < 0) {
                            div.innerHTML +=
                                '<i style="background:' + '#ff0000' + '"></i> ' +
                                +max.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + '#ffff00' + '; opacity: 0.75;"></i> ' +
                                +max3.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + '#00ff00' + '; opacity: 0.5;"></i> ' +
                                +max2.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + 'transparent' + '"></i> ' +
                                0 + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + '#ff00ff' + '; opacity: 0.5;"></i> ' +
                                +min2.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + '#00ffff' + '; opacity: 0.75;"></i> ' +
                                +min3.toFixed(2) + ' ' + unit + '<br>';

                            div.innerHTML +=
                                '<i style="background:' + '#0000ff' + '"></i> ' +
                                +min.toFixed(2) + ' ' + unit + '<br>';
                        } else {
                            div.innerHTML +=
                                '<i style="background:' + '#ff0000' + '"></i> ' +
                                +max.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + '#ffff00' + '; opacity: 0.75;"></i> ' +
                                +max3.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + '#00ff00' + '; opacity: 0.5;"></i> ' +
                                +max2.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + 'transparent' + '"></i> ' +
                                0 + ' ' + unit + '<br>';
                        }



                        return div;
                    };
                    // $scope.legend.addTo(map);

                });



                $scope.testDataHeatmap = new Array();
                $scope.testDataHeatmap2 = new Array();

                // for(var z in auxHeatmap){
                //   // console.log($scope.dataPointsHeatmap);
                //   var elem = auxHeatmap[z];
                //   // $scope.dataPointsHeatmap.push([elem[0], elem[1], (elem[2]/(max)) ]);
                //   var factor = 1;
                //   var logsActive = 0;
                //   var logs = (Math.log(elem[2]/(max)) * factor );

                //   if(logs < -1)
                //     logs = -1;


                //   if(elem[2] < 0){
                //     // var intensity = (elem[2]/(min))+(logs*logsActive);
                //     var intensity = (elem[2]/(min));
                //     var loga = Math.log(intensity);
                //     if(loga > intensity)
                //       loga = intensity;
                //     var valu = intensity+(loga*logsActive);
                //     if(valu < 0)
                //       valu = 0;
                //     // console.log("intensity: "+(intensity)+ " || "+"loga "+loga + " FINAL: "+( valu ));
                //     $scope.testDataHeatmap2.push({lat: elem[0], lng:elem[1], count: valu*10})
                //     // console.log("inv: "+(elem[2]/(min))+" "+ Math.abs(intensity*10) + " "+logs );
                //   }else{
                //     var intensity = (elem[2]/(max))+(logs*logsActive);
                //     $scope.dataPointsHeatmap.push([elem[0], elem[1], intensity ]);
                //     console.log("NORMAL: "+(elem[2]/(max))+" "+ intensity + " "+logs );
                //   }

                //   // console.log(elem[2]+" "+ intensity );
                // }

                for (var z in auxHeatmap) {
                    var elem = auxHeatmap[z];



                    var prevalu = elem[2] * elem[2];


                    if (elem[2] < 0) {
                        var intensity = (prevalu / (min * min));
                        $scope.testDataHeatmap2.push({
                                lat: elem[0],
                                lng: elem[1],
                                count: intensity * 10
                            })
                            // console.log("intensity negative "+(intensity*10));
                    } else {
                        var intensity = (prevalu / (max * max));
                        $scope.testDataHeatmap.push({
                                lat: elem[0],
                                lng: elem[1],
                                count: intensity * 10
                            })
                            // console.log("intensity positive "+(intensity*10));
                    }


                }

                $scope.distances = distancesOnPoints(auxHeatmap);

                // *************************
                // overriden value
                $scope.radius = Math.round($scope.distances[0]) / 150000;
                // hardcoded for moja farmacja
                if ($scope.userProfile != undefined && $scope.userProfile != null && $scope.userProfile.heatMapMF == true) {
                    $scope.heatmapradius = "Fixed0.5";
                    $scope.radius = 0.5;
                    $scope.localextreme = true;

                };

                //IR - for OralMED users, set radius to 0.1 and localextreme as TRUE
                if ($scope.userProfile != undefined && $scope.userProfile != null && $scope.userProfile.heatMapOM == true) {
                    $scope.heatmapradius = "Fixed0.1";
                    $scope.radius = 0.1;
                    $scope.localextreme = true;

                };

                // console.log("min distance: " + distances[0] + " ; radius "+radius);

                for (var c = 0; c < auxGeojsonHeatmap.length; c++) {
                    // populate geojsoncolors
                    var aux = auxGeojsonHeatmap[c];

                    var hue = 0;
                    hue = 120 - (120 * (parseFloat(aux[1]) / max));
                    if (aux[1] == 0)
                        geojsoncolors[aux[0]] = 'white';
                    else
                        geojsoncolors[aux[0]] = hslToRgbToHex(hue / 360, 1, 1);
                }


                angular.extend($scope, {
                    geojson: {
                        data: $scope.geojsonObj,
                        style: featureStyle
                    }
                });



                /*$scope.$on("leafletDirectiveMap.geojsonMouseover", function(ev, feature, leafletEvent) {
                    // console.log("geojsonMouseover");
                    // countryMouseover(feature, leafletEvent);
                    $scope.hoveredGeometry = feature.properties.ref + "    [" + feature.properties.StoreCodeAbbrv + "]";
                });*/
                /*$scope.$on("leafletDirectiveMap.geojsonMouseout", function(ev, feature, leafletEvent) {
                    // countryMouseover(feature, leafletEvent);
                    $scope.hoveredGeometry = "";
                });*/
                /*$scope.$on("leafletDirectiveMap.geojsonClick", function(ev, feature, leafletEvent) {
                    // countryClick(featureSelected, leafletEvent);
                    // console.log("click geojson");
                    // leafletEvent.target.openPopup();
                    // console.log(feature.properties);
                    // console.log(leafletEvent);

                    if($location.path().indexOf('dashboard') > 0 ){
                      $location.path( "/dashboard/"+$scope.pid+"/"+feature.properties.pointid );
                    } else if($location.path().indexOf('widget') > 0){
                      // console.log("PATH: "+ ("/widget/"+$scope.pid+"/"+$scope.wid+"/"+$scope.markers[args.markerName].pointid) );
                      $location.path( "/widget/"+$scope.pid+"/"+$scope.wid+"/"+feature.properties.pointid );
                    } else {
                      $location.path( "/data/"+$scope.pid+"/"+feature.properties.pointid );
                    }
                    
                });*/


                leafletData.getMap().then(function(map) {

                    // $scope.testDataHeatmap2 = [
                    //     {lat: -7.965555, lng:-53.80444, count: 4},
                    //     {lat: -9.2108333, lng:-52.4808333, count: 5}];


                    var testData = {
                        max: 8,
                        data: $scope.testDataHeatmap
                    };


                    $scope.cfg = {
                        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                        "radius": $scope.radius,
                        "blur": 0.75,
                        "maxOpacity": 0.85,
                        "minOpacity": 0.0,
                        // scales the radius based on map zoom
                        "scaleRadius": true,
                        // if set to false the heatmap uses the global maximum for colorization
                        // if activated: uses the data maximum within the current map boundaries 
                        //   (there will always be a red spot with useLocalExtremas true)
                        "useLocalExtrema": $scope.localextreme,
                        // which field name in your data represents the latitude - default "lat"
                        latField: 'lat',
                        // which field name in your data represents the longitude - default "lng"
                        lngField: 'lng',
                        // which field name in your data represents the data value - default "value"
                        valueField: 'count',
                        gradient: {
                            0: "rgb(0,255,0)",
                            0.75: "rgb(255,255,0)",
                            1.0: "rgb(255,0,0)"
                        }
                    };

                    $scope.heatmapLayer = new HeatmapOverlay($scope.cfg);

                    map.addLayer($scope.heatmapLayer);

                    $scope.heatmapLayer.setData(testData);

                    map.removeLayer($scope.heatmapLayer); // this is a hack...



                    var testData2 = {
                        max: 8,
                        data: $scope.testDataHeatmap2
                    };


                    $scope.cfg2 = {
                        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                        "radius": $scope.radius,
                        "blur": 0.75,
                        "maxOpacity": 0.85,
                        "minOpacity": 0.0,
                        // scales the radius based on map zoom
                        "scaleRadius": true,
                        // if set to false the heatmap uses the global maximum for colorization
                        // if activated: uses the data maximum within the current map boundaries 
                        //   (there will always be a red spot with useLocalExtremas true)
                        "useLocalExtrema": $scope.localextreme,
                        // which field name in your data represents the latitude - default "lat"
                        latField: 'lat',
                        // which field name in your data represents the longitude - default "lng"
                        lngField: 'lng',
                        // which field name in your data represents the data value - default "value"
                        valueField: 'count',
                        gradient: {
                            0: "rgb(255,0,255)",
                            0.75: "rgb(0,255,255)",
                            1.0: "rgb(0,0,255)"
                        }
                        // gradient: { 0: "rgb(0,255,0)", 0.5: "rgb(0,255,255)", 1.0: "rgb(0,0,255)"}
                    };



                    $scope.heatmapLayer2 = new HeatmapOverlay($scope.cfg2);

                    map.addLayer($scope.heatmapLayer2);

                    $scope.heatmapLayer2.setData(testData2);

                    map.removeLayer($scope.heatmapLayer2); // this is a hack...

                });



                leafletData.getMap().then(function(map) {
                    // console.log("MAP");



                    var max = null;
                    for (var i = 0; i < $scope.markers.length; i++) {
                        var oA = $scope.markers[i];
                        if (getPredecessorCoords(oA.predecessorId) != null) {
                            if (max == null) {
                                max = oA.value;
                            } else {
                                if (oA.value > max)
                                    max = oA.value;
                            }
                        }
                    }



                    var item, oA, oB;
                    var counter = 0;
                    $scope.polylinesAndDecors = new Array();

                    for (var i = 0; i < $scope.markers.length; i++) {
                        oA = $scope.markers[i];

                        var locA = new L.LatLng(oA.lat, oA.lng);
                        var locB = getPredecessorCoords(oA.predecessorId);


                        var hue = 0;
                        if (max != null)
                            hue = 120 - (120 * oA.value / max);

                        // determinar hue green 120 a red 0
                        // obter hue conforme value está entre 0 e max (4.5)

                        // 120 * value/max

                        // traduzir de hsl para hex
                        // console.log(oA.value + " " + hue + " " + hslToRgbToHex(hue/100, 1, 1));



                        if (locB != null) {
                            var polysubgroup = createPolyLine(locB, locA, map, hslToRgbToHex(hue / 360, 1, 1));
                            $scope.polylinesAndDecors = $scope.polylinesAndDecors.concat(polysubgroup);
                        }
                        // else, point has no precessor, so no polyline is to be drawn.
                    }
                    // console.log($scope.polylinesAndDecors);
                    $scope.lg = L.layerGroup($scope.polylinesAndDecors);
                    map.addLayer($scope.lg);



                    function getPredecessorCoords(pointid) {
                        for (var i = 0; i < $scope.markers.length; i++) {
                            if ($scope.markers[i].pointid == pointid)
                                return new L.LatLng($scope.markers[i].lat, $scope.markers[i].lng);
                        }
                        return null;
                    }


                    //draw polyline
                    function createPolyLine(loc1, loc2, map, col) {
                        // console.log(loc1);
                        // console.log(loc2);
                        // console.log("---");
                        if (col == '#NaNNaNNaN')
                            col = null;
                        var color = col || '#33EE33';

                        var latlongs = [loc1, loc2];
                        if (Math.abs(loc1.lng - loc2.lng) > 180) {
                            latlongs = [loc1.wrap(179, -179), loc2];
                        }
                        var polyline = new L.Polyline(latlongs, {
                            color: color,
                            opacity: 1,
                            weight: 5,
                            clickable: false
                        });
                        // }).addTo(map);

                        var decorator = L.polylineDecorator(polyline, {
                            patterns: [
                                // define a pattern of 10px-wide dashes, repeated every 20px on the line 
                                {
                                    offset: '50%',
                                    symbol: L.Symbol.arrowHead({
                                        pixelSize: 15,
                                        pathOptions: {
                                            fillOpacity: 1,
                                            weight: 0,
                                            color: '#00BB00'
                                        }
                                    })
                                }
                            ]
                        });
                        // }).addTo(map);

                        return [polyline, decorator];
                    }
                });



            }).
            error(function(data, status) {});


        }
    }


    getPointsFromWidget();



    $scope.historyWidgetIcon = 'fa-expand';
    $scope.historyWidgetClass = 'col-md-6';
    $scope.historyWidgetChartWidth = 'width:90%;';

    $scope.expand = function(elemName) {
        if (elemName == 'history') {
            if ($scope.historyWidgetIcon == 'fa-expand') {
                $scope.historyWidgetIcon = 'fa-compress';
                $scope.historyWidgetClass = 'col-md-12';

            } else {
                $scope.historyWidgetIcon = 'fa-expand';
                $scope.historyWidgetClass = 'col-md-6';
            }
        }
    }



    function updateByFilter() {
        console.log("updateByFilter");

        var query = '/api/pointsFromWidgetFilter/' + $scope.pid + '/' + $scope.wid;

        $http.post(query, $scope.filterSpec).
        success(function(data, status) {

            console.log("/api/pointsFromWidgetFilter/", data);
            console.log("read filtered pointlocations");
            console.log(data);

            $scope.markers = new Array();
            //console.log("1st in order");

            var unit = data.unit;

            var max;
            var min;
            var auxHeatmap = [];
            var auxGeojsonHeatmap = [];
            $scope.dataPointsHeatmap = new Array();

            $scope.geojsonObj = {
                "type": "FeatureCollection",
                "crs": {
                    "type": "name",
                    "properties": {
                        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                    }
                },
                "features": []
            };

            var pointIdAttributes = {};
            for (var d = 0; d < data.locations.length; d++) {
                pointIdAttributes[data.locations[d].pointid] = data.locations[d].attributes;
                pointIdAttributes[data.locations[d].pointid].type = data.locations[d].type;
            }

            function translatePointId(id) {
                var attrName;

                if (pointIdAttributes == null || pointIdAttributes == undefined) {
                    return id;
                }

                if (pointIdAttributes[id].hasOwnProperty("PointKey")) {
                    attrName = "PointKey";
                } else {
                    return id;
                }
                return pointIdAttributes[id][attrName];
            }


            $http.post('/dashboard/pointranking/' + $scope.pid + '/' + $scope.wid, $scope.filterSpec).
            success(function(dataR, status) {

                console.log("/dashboard/pointranking/", dataR);

                if (dataR.length > 0) {
                    var pointRanking = new Array();
                    for (var i = 0; i < dataR.length; i++) {
                        var aux = dataR[i];
                        pointRanking.push([translatePointId(aux.pointid_point), +aux.value])
                    }

                    $scope.exampleDataRanking =
                        [{
                            "key": "Ranking",
                            "values": pointRanking
                        }];
                }


                //IR - match example ranking data with data locations for heatmap update
                for (var d = 0; d < data.locations.length; d++) {
                    for (var pr = 0; pr < $scope.exampleDataRanking[0].values.length; pr++) {
                        if (translatePointId(data.locations[d].pointid) == $scope.exampleDataRanking[0].values[pr].slice(0, 1))
                            data.locations[d].value = $scope.exampleDataRanking[0].values[pr].slice(1, 2).toString()
                    }
                }

                if ($scope.pointFilter.state == false)
                    $scope.filterSpec.points = [];

                // for(var d in data.locations){
                for (var d = 0; d < data.locations.length; d++) {
                    if (data.locations[d].geometry == null) {
                        // NUNOALEX faz push se o pointid estiver no $scope.filterSpec.points
                        // console.log("$scope.filterSpec.points.length " + $scope.filterSpec.points.length);
                        if ($scope.filterSpec.points.length == 0 || isInArray($scope.filterSpec.points, data.locations[d].pointid))
                            auxHeatmap.push([data.locations[d].x, data.locations[d].y, data.locations[d].value, data.locations[d].name]);
                    } else {
                        // NUNOALEX else temos de por noutro container para fazer o morph
                        auxGeojsonHeatmap.push([data.locations[d].pointid, data.locations[d].value]);
                    }

                    if ($scope.filterSpec.points.length == 0 || isInArray($scope.filterSpec.points, data.locations[d].pointid)) {

                        if (max == undefined || max == null) {
                            max = +data.locations[d].value;
                        } else {
                            if (+data.locations[d].value > max)
                                max = +data.locations[d].value;
                        }

                        if (min == undefined || min == null) {
                            min = +data.locations[d].value;
                        } else {
                            if (+data.locations[d].value < min)
                                min = +data.locations[d].value;
                        }

                    }

                    if (data.locations[d].pointid == $scope.pointid || isInArray($scope.filterSpec.points, data.locations[d].pointid)) {
                        // NUNOALEX ou se estiver no $scope.filterSpec.points

                        if (data.locations[d].geometry == null) {
                            $scope.markers.push({
                                lat: data.locations[d].x,
                                lng: data.locations[d].y,
                                pointid: data.locations[d].pointid,
                                zIndexOffset: 1000,
                                name: data.locations[d].name,
                                icon: {
                                    type: 'awesomeMarker',
                                    // icon: 'crosshairs',
                                    icon: 'check',
                                    prefix: 'fa',
                                    markerColor: 'orange',
                                    // spin: true,
                                    weight: 5,
                                    opacity: 0
                                }
                            });
                        } else {
                            $scope.geojsonObj.features.push(data.locations[d].geometry);
                        }

                    } else {
                        var icon = 'circle';
                        var prefix = 'fa';
                        var markerColor = 'blue';
                        if (data.locations[d].type == "Laboratory") {
                            icon = 'home';
                            // markerColor = 'green';
                        } else if (data.locations[d].type == "Distribution") {
                            icon = 'ambulance';
                            // markerColor = 'orange';
                        } else if (data.locations[d].type == "Final Client") {
                            icon = 'users';
                            // markerColor = 'purple';
                        }
                        /*            
                                    console.log("data locations");
                                    console.log(data.locations[d]);*/

                        if (data.locations[d].geometry == null) {
                            $scope.markers.push({
                                lat: data.locations[d].x,
                                lng: data.locations[d].y,
                                pointid: data.locations[d].pointid,
                                predecessorId: data.locations[d].predecessor,
                                value: parseFloat(data.locations[d].value),
                                // message: buildMessage(data.locations[d], true),
                                name: data.locations[d].name,
                                // layer: attrType,
                                icon: {
                                    type: 'awesomeMarker',
                                    // icon: 'crosshairs',
                                    icon: icon,
                                    prefix: prefix,
                                    markerColor: markerColor,
                                    // spin: true,
                                    opacity: 0
                                }
                            });
                        } else {
                            $scope.geojsonObj.features.push(data.locations[d].geometry);
                        }


                    }
                }

                // console.log("min is "+min+"; max is "+max);

                $scope.testDataHeatmap = new Array();
                $scope.testDataHeatmap2 = new Array();

                for (var z in auxHeatmap) {
                    var elem = auxHeatmap[z];

                    var prevalu = elem[2] * elem[2];


                    if (elem[2] < 0) {
                        var intensity = (prevalu / (min * min));
                        $scope.testDataHeatmap2.push({
                                lat: elem[0],
                                lng: elem[1],
                                count: intensity * 10
                            })
                            // console.log("intensity negative "+(intensity*10));
                    } else {
                        var intensity = (prevalu / (max * max));
                        $scope.testDataHeatmap.push({
                                lat: elem[0],
                                lng: elem[1],
                                count: intensity * 10
                            })
                            // console.log("intensity positive "+(intensity*10));
                    }


                    // $scope.dataPointsHeatmap.push([elem[0], elem[1], (elem[2]/(max)) ]);
                }

                // update the positive heatmap
                // $scope.updateHeatmapSize(null, $scope.dataPointsHeatmap);



                angular.extend($scope, {
                    geojson: {
                        data: $scope.geojsonObj,
                        style: featureStyle
                    }
                });



                leafletData.getMap().then(function(map) {

                    // $scope.testDataHeatmap2 = [
                    //     {lat: -7.965555, lng:-53.80444, count: 4},
                    //     {lat: -9.2108333, lng:-52.4808333, count: 5}];

                    map.removeLayer($scope.heatmapLayer);

                    var testData = {
                        max: 8,
                        data: $scope.testDataHeatmap
                    };

                    //IR - this is the new dashboard heatmap after the filter (accumulated values)
                    console.log("this is the new dashboard heatmap after the filter");
                    $scope.heatmapLayer = new HeatmapOverlay($scope.cfg);

                    map.addLayer($scope.heatmapLayer);

                    $scope.heatmapLayer.setData(testData);

                    if (!$scope.showingHeatmap)
                        map.removeLayer($scope.heatmapLayer); // this is a hack...



                    map.removeLayer($scope.heatmapLayer2);

                    var testData2 = {
                        max: 8,
                        data: $scope.testDataHeatmap2
                    };



                    $scope.heatmapLayer2 = new HeatmapOverlay($scope.cfg2);

                    // we need to test if the map already has it. if not, do the add
                    map.addLayer($scope.heatmapLayer2);

                    $scope.heatmapLayer2.setData(testData2);


                    if (!$scope.showingHeatmap)
                        map.removeLayer($scope.heatmapLayer2); // this is a hack...



                    if ($scope.showingHeatmap)
                        map.removeControl($scope.legend);

                    $scope.legend = L.control({
                        position: 'bottomleft'
                    });

                    $scope.legend.onAdd = function(map) {
                        var div = L.DomUtil.create('div', 'info legend'),
                            grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                            labels = [];
                        // loop through our density intervals and generate a label with a colored square for each interval
                        // for (var i = 0; i < grades.length; i++) {
                        //     div.innerHTML +=
                        //         '<i style="background:' + '#0000ff' + '"></i> ' +
                        //         grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                        // }

                        div.innerHTML += "<h5 style='margin-top: 0;'>Heatmap values</h5>";

                        var max2 = max * 0.25;
                        var max3 = max * 0.75;
                        var min2 = min * 0.25;
                        var min3 = min * 0.75;

                        if (min < 0) {
                            div.innerHTML +=
                                '<i style="background:' + '#ff0000' + '"></i> ' +
                                +max.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + '#ffff00' + '; opacity: 0.75;"></i> ' +
                                +max3.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + '#00ff00' + '; opacity: 0.5;"></i> ' +
                                +max2.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + 'transparent' + '"></i> ' +
                                0 + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + '#ff00ff' + '; opacity: 0.5;"></i> ' +
                                +min2.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + '#00ffff' + '; opacity: 0.75;"></i> ' +
                                +min3.toFixed(2) + ' ' + unit + '<br>';

                            div.innerHTML +=
                                '<i style="background:' + '#0000ff' + '"></i> ' +
                                +min.toFixed(2) + ' ' + unit + '<br>';
                        } else {
                            div.innerHTML +=
                                '<i style="background:' + '#ff0000' + '"></i> ' +
                                +max.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + '#ffff00' + '; opacity: 0.75;"></i> ' +
                                +max3.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + '#00ff00' + '; opacity: 0.5;"></i> ' +
                                +max2.toFixed(2) + ' ' + unit + '<br>';
                            div.innerHTML +=
                                '<i style="background:' + 'transparent' + '"></i> ' +
                                0 + ' ' + unit + '<br>';
                        }

                        return div;
                    };

                    if ($scope.showingHeatmap)
                        $scope.legend.addTo(map);


                });


                var bounds = [];
                for (var i = 0; i < $scope.markers.length; i++) {
                    bounds.push([$scope.markers[i].lat, $scope.markers[i].lng])
                }
                bounds.push([$scope.madeira.lat, $scope.madeira.lng]);
                if (bounds.length > 0) {
                    leafletData.getMap().then(function(map) {
                        map.fitBounds(bounds, {
                            padding: [50, 50]
                        });
                    });
                }

            }).error(function(dataR, status) {});



            leafletData.getMap().then(function(map) {


                // var ctr = 0;
                // console.log("map._layers lenght "+(Object.keys(map._layers).length));
                // for(i in map._layers) {
                //     if(map._layers[i]._path != undefined) {
                //       ctr++;
                //       console.log(map._layers[i]);
                //       try {
                //           map.removeLayer(map._layers[i]);
                //           console.log("map._layers lenght "+(Object.keys(map._layers).length));
                //       }
                //       catch(e) {
                //           console.log("problem with " + e + map._layers[i]);
                //       }
                //     }
                // }

                // console.log("2nd in order; removed "+ctr);


                map.removeLayer($scope.lg);

                var max = null;
                for (var i = 0; i < $scope.markers.length; i++) {
                    var oA = $scope.markers[i];
                    if (getPredecessorCoords(oA.predecessorId) != null) {
                        if (max == null) {
                            max = oA.value;
                        } else {
                            if (oA.value > max)
                                max = oA.value;
                        }
                    }
                }


                var item, oA, oB;
                $scope.polylinesAndDecors = new Array();

                for (var i = 0; i < $scope.markers.length; i++) {
                    oA = $scope.markers[i];

                    var locA = new L.LatLng(oA.lat, oA.lng);
                    var locB = getPredecessorCoords(oA.predecessorId);


                    var hue = 0;
                    if (max != null)
                        hue = 120 - (120 * oA.value / max);
                    // determinar hue green 120 a red 0
                    // obter hue conforme value está entre 0 e max (4.5)

                    // 120 * value/max

                    // traduzir de hsl para hex
                    // console.log(oA.value + " " + hue + " " + hslToRgbToHex(hue/100, 1, 1));



                    if (locB != null) {
                        var polysubgroup = createPolyLine(locB, locA, map, hslToRgbToHex(hue / 360, 1, 1));
                        $scope.polylinesAndDecors = $scope.polylinesAndDecors.concat(polysubgroup);

                    }
                    // else, point has no precessor, so no polyline is to be drawn.
                }
                $scope.lg = L.layerGroup($scope.polylinesAndDecors);
                map.addLayer($scope.lg);



                function getPredecessorCoords(pointid) {
                    for (var i = 0; i < $scope.markers.length; i++) {
                        if ($scope.markers[i].pointid == pointid)
                            return new L.LatLng($scope.markers[i].lat, $scope.markers[i].lng);
                    }
                    return null;
                }


                //draw polyline
                function createPolyLine(loc1, loc2, map, col) {
                    // console.log(loc1);
                    // console.log(loc2);
                    // console.log("---");
                    if (col == '#NaNNaNNaN')
                        col = null;
                    var color = col || '#33EE33';

                    var latlongs = [loc1, loc2];
                    if (Math.abs(loc1.lng - loc2.lng) > 180) {
                        latlongs = [loc1.wrap(179, -179), loc2];
                    }
                    var polyline = new L.Polyline(latlongs, {
                        color: color,
                        opacity: 1,
                        weight: 5,
                        clickable: false
                    });

                    var decorator = L.polylineDecorator(polyline, {
                        patterns: [
                            // define a pattern of 10px-wide dashes, repeated every 20px on the line 
                            {
                                offset: '50%',
                                symbol: L.Symbol.arrowHead({
                                    pixelSize: 15,
                                    pathOptions: {
                                        fillOpacity: 1,
                                        weight: 0,
                                        color: '#00BB00'
                                    }
                                })
                            }
                        ]
                    });

                    return [polyline, decorator];
                }


            });

        }).
        error(function(data, status) {});
    }


    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.message == "filterSpec") {
            console.log("received filter filterSpec");
            //console.log(sharedCommsService.widgetFilter);


            // reset every base variable
            // read from new api method to get points according to filter via post filter
            // '/api/pointsFromWidgetFilter/'+$scope.pid+'/'+$scope.wid
            updateByFilter();

        }

        if (sharedCommsService.message == "eraseFilterGeo") {
            // just erase the filterGeo geometry (circle or rectangle)
            /*
                  // NUNOALEX
                  leafletData.getMap().then(function(map){
                    var drawnItems = $scope.controls.edit.featureGroup;

                    var allLayers = $scope.controls.edit.featureGroup._layers;
                    for(var prop in allLayers){
                      // console.log(allLayers[prop]);
                      drawnItems.removeLayer(allLayers[prop]);
                    }


                    // drawnItems.removeLayer(allLayers);


                    // allLayers.forEach(function(layer){
                    //   drawnItems.removeLayer(layer);
                    // })
                  });*/
        }

    });

    var activateHeatmap = function(map) {

        console.log("heatmap add");
        map.addLayer($scope.heatmapLayer);
        map.addLayer($scope.heatmapLayer2);
        $scope.legend.addTo(map);

        $scope.heatmapActive = true;
        angular.extend($scope, {
            geojson: {
                data: $scope.geojsonObj,
                style: featureStyle
            }
        });

        $scope.showingHeatmap = true;

    }

    var deactivateHeatmap = function(map) {

        console.log("heatmap remove");
        map.removeLayer($scope.heatmapLayer);
        map.removeLayer($scope.heatmapLayer2);
        map.removeControl($scope.legend);

        $scope.heatmapActive = false;
        angular.extend($scope, {
            geojson: {
                data: $scope.geojsonObj,
                style: featureStyle
            }
        });

        $scope.showingHeatmap = false;
    }

    $scope.$watch('heatmapcheck', function() {
        //console.log($scope.heatmapcheck);

        leafletData.getMap().then(function(map) {
            if ($scope.heatmapcheck == true) {
                activateHeatmap(map);
            } else if ($scope.heatmapcheck == false) {

                deactivateHeatmap(map);
            }
        });
    });


    leafletData.getMap().then(function(map) {
        map.on('overlayremove', function(eventLayer) {
            // console.log("overlayremove");
            if (eventLayer.name == 'Heat Map') {
                deactivateHeatmap(map);
            }
            // Switch to the Permafrost legend...
            // if (eventLayer.name === 'Permafrost') {
            //     map.removeControl(legend1);
            //     legend2.addTo(map);
            // } else { // Or switch to the treeline legend...
            //     map.removeControl(legend2);
            //     legend1.addTo(map);
            // }
        });


        map.on('overlayadd', function(eventLayer) {
            // console.log("overlayadd "+(eventLayer.name));
            if (eventLayer.name == 'Heat Map') {
                activateHeatmap(map);
            }

        });
    });


    $scope.configBoxClass = "display-none";
    $scope.configBoxIcon = "fa-sort-desc";

    $scope.applyConfigButtonText = 'Apply Config';
    $scope.applyConfigButtonDisabled = false;

    $scope.localextreme = false;

    $scope.heatmapradius = "Small";
    // overridden for moja farmacja
    if ($scope.userProfile != undefined && $scope.userProfile != null && $scope.userProfile.heatMapMF == true) {
        $scope.heatmapradius = "Fixed0.5";
        $scope.localextreme = true;
    }

    //IR - for OralMED users, set radius to 0.3 and localextreme as TRUE
    if ($scope.userProfile != undefined && $scope.userProfile != null && $scope.userProfile.heatMapOM == true) {
        $scope.heatmapradius = "Fixed0.1";
        $scope.radius = 0.1;
        $scope.localextreme = true;

    };


    $scope.configBoxFunction = function() {

        if ($scope.configBoxClass == "display-none") {
            $scope.configBoxIcon = "fa-sort-asc";
            $scope.configBoxClass = "display-block";
        } else {
            $scope.configBoxIcon = "fa-sort-desc";
            $scope.configBoxClass = "display-none";
        }
    }


    $scope.applyConfig = function() {
        // console.log("applyConfig");
        // console.log($scope.localextreme);
        // console.log($scope.heatmapradius);

        $scope.radius = Math.round($scope.distances[0]) / 150000;

        if ($scope.heatmapradius == "Tiny") {
            $scope.radius = $scope.radius / 2;
        } else if ($scope.heatmapradius == "Small") {

        } else if ($scope.heatmapradius == "Medium") {
            $scope.radius = $scope.radius * 2;
        } else if ($scope.heatmapradius == "Big") {
            $scope.radius = $scope.radius * 3;
            // $scope.radius = Math.round((($scope.distances[0]+$scope.distances[1])/2)) / 150000;
        } else if ($scope.heatmapradius == "Giant") {
            $scope.radius = $scope.radius * 6;
        } else if ($scope.heatmapradius == "Fixed0.005") {
            $scope.radius = 0.005;
        } else if ($scope.heatmapradius == "Fixed0.01") {
            $scope.radius = 0.01;
        } else if ($scope.heatmapradius == "Fixed0.1") {
            $scope.radius = 0.1;
        } else if ($scope.heatmapradius == "Fixed0.5") {
            $scope.radius = 0.5;
        } else if ($scope.heatmapradius == "Fixed1") {
            $scope.radius = 1;
        } else if ($scope.heatmapradius == "Average") {
            $scope.radius = Math.round((($scope.distances[0] + $scope.distances[1]) / 2)) / 150000;
        }



        leafletData.getMap().then(function(map) {
            map.removeLayer($scope.heatmapLayer);
            map.removeLayer($scope.heatmapLayer2);

            var testData = {
                max: 8,
                data: $scope.testDataHeatmap
            };

            $scope.cfg = {
                // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                "radius": $scope.radius,
                "blur": 0.75,
                "maxOpacity": 0.85,
                "minOpacity": 0.0,
                // scales the radius based on map zoom
                "scaleRadius": true,
                // if set to false the heatmap uses the global maximum for colorization
                // if activated: uses the data maximum within the current map boundaries 
                //   (there will always be a red spot with useLocalExtremas true)
                "useLocalExtrema": $scope.localextreme,
                // which field name in your data represents the latitude - default "lat"
                latField: 'lat',
                // which field name in your data represents the longitude - default "lng"
                lngField: 'lng',
                // which field name in your data represents the data value - default "value"
                valueField: 'count',
                gradient: {
                    0: "rgb(0,255,0)",
                    0.75: "rgb(255,255,0)",
                    1.0: "rgb(255,0,0)"
                }
            };

            $scope.heatmapLayer = new HeatmapOverlay($scope.cfg);
            map.addLayer($scope.heatmapLayer);
            $scope.heatmapLayer.setData(testData);

            if (!$scope.showingHeatmap)
                map.removeLayer($scope.heatmapLayer);


            var testData2 = {
                max: 8,
                data: $scope.testDataHeatmap2
            };

            $scope.cfg2 = {
                // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                "radius": $scope.radius,
                "blur": 0.75,
                "maxOpacity": 0.85,
                "minOpacity": 0.0,
                // scales the radius based on map zoom
                "scaleRadius": true,
                // if set to false the heatmap uses the global maximum for colorization
                // if activated: uses the data maximum within the current map boundaries 
                //   (there will always be a red spot with useLocalExtremas true)
                "useLocalExtrema": $scope.localextreme,
                // which field name in your data represents the latitude - default "lat"
                latField: 'lat',
                // which field name in your data represents the longitude - default "lng"
                lngField: 'lng',
                // which field name in your data represents the data value - default "value"
                valueField: 'count',
                gradient: {
                    0: "rgb(255,0,255)",
                    0.75: "rgb(0,255,255)",
                    1.0: "rgb(0,0,255)"
                }
                // gradient: { 0: "rgb(0,255,0)", 0.5: "rgb(0,255,255)", 1.0: "rgb(0,0,255)"}
            };



            $scope.heatmapLayer2 = new HeatmapOverlay($scope.cfg2);
            map.addLayer($scope.heatmapLayer2);
            $scope.heatmapLayer2.setData(testData2);

            if (!$scope.showingHeatmap)
                map.removeLayer($scope.heatmapLayer2);


            $scope.configBoxIcon = "fa-sort-desc";
            $scope.configBoxClass = "display-none";

        });
    };



    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1); // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }



    function testPointInsideCircle(px, py, cx, cy, r) {
        // calc distance elem.lat, elem.lng to filterGeo.x, filterGeo.y
        // check if distance is smaller or equal than filterGeo.radius
        // if true, return true
        var dist = getDistanceFromLatLonInKm(px, py, cx, cy);
        // console.log(px + " " + py + " to  " + cx + " " + cy + " is " + dist + " <= " + r/1000);
        if (dist <= r / 1000)
            return true;
        else
            return false;
    }


    function testPointInsideRect(px, py, layer) {
        var point = L.latLng(px, py);
        var bounds = layer.getBounds();
        // console.log("is inside? "+ bounds.contains(point));
        return bounds.contains(point);
    }


    function testElemInsideShape(elem, filterGeo, shapeType) {
        if (elem.lat != undefined && elem.lng != undefined) {
            // this is a marker
            if (shapeType == "circle")
                return testPointInsideCircle(elem.lat, elem.lng, filterGeo.latLng.lat, filterGeo.latLng.lng, filterGeo.radius);
            else if (shapeType == "rectangle")
                return testPointInsideRect(elem.lat, elem.lng, filterGeo.layer);
        } else {
            // console.log(elem.geometry.coordinates);
            var test = false;
            for (var i = 0; i < elem.geometry.coordinates.length; i++) {
                var aux = elem.geometry.coordinates[i];
                if (aux.length == 2 && typeof aux[0] == "number") {
                    if (shapeType == "circle") {
                        if (testPointInsideCircle(aux[1], aux[0], filterGeo.latLng.lat, filterGeo.latLng.lng, filterGeo.radius))
                            test = true;
                    } else if (shapeType == "rectangle") {
                        if (testPointInsideRect(aux[1], aux[0], filterGeo.layer))
                            test = true;
                    }
                } else {
                    // go deeper on the array
                    for (var j = 0; j < aux.length; j++) {
                        var subaux = aux[j];

                        if (subaux.length == 2 && typeof subaux[0] == "number") {
                            if (shapeType == "circle") {
                                if (testPointInsideCircle(subaux[1], subaux[0], filterGeo.latLng.lat, filterGeo.latLng.lng, filterGeo.radius))
                                    test = true;
                            } else if (shapeType == "rectangle") {
                                if (testPointInsideRect(subaux[1], subaux[0], filterGeo.layer))
                                    test = true;
                            }
                        } else {
                            for (var k = 0; k < subaux.length; k++) {
                                var subsubaux = subaux[k];

                                if (subsubaux.length == 2 && typeof subsubaux[0] == "number") {
                                    if (shapeType == "circle") {
                                        if (testPointInsideCircle(subsubaux[1], subsubaux[0], filterGeo.latLng.lat, filterGeo.latLng.lng, filterGeo.radius))
                                            test = true;
                                    } else if (shapeType == "rectangle") {
                                        if (testPointInsideRect(subsubaux[1], subsubaux[0], filterGeo.layer))
                                            test = true;
                                    }
                                } else {
                                    // console.info(subsubaux);
                                    console.warn("there are more levels on the GeoJSON to scan!!");
                                }
                            }

                        }
                    }
                }


            }
            return test;
        }
    }


    function getIntersectingPointids(filterGeo) {
        // filter by circle (circlex, circley, radius) 
        // (calc geometries inside circle to return pointid
        // [fazer loop em todos as geometries, obter 1o as bounds de cada para filtrar logo de inicio, 
        // e 2o so dps das bounds se intersectarem é que fazemos o calculo fino de ver se estao dentro ou nao], 
        // dps retornar array de pointids que estao la dentro)
        var toRet = new Array();
        // console.log($scope.markers);
        // console.log($scope.geojson.data.features);
        // console.log("------------");

        $scope.markers.forEach(testInsideMethod)

        $scope.geojson.data.features.forEach(testInsideMethod);

        function testInsideMethod(elem) {
            if (filterGeo.type == "circle") {
                if (testElemInsideShape(elem, filterGeo, "circle"))
                    toRet.push(elem.pointid || elem.properties.pointid);
            } else if (filterGeo.type == "rectangle") {
                if (testElemInsideShape(elem, filterGeo, "rectangle"))
                    toRet.push(elem.pointid || elem.properties.pointid);
            }
        }

        return toRet;
    }



    var getShapeType = function(layer) {
        if (layer instanceof L.Circle) {
            return 'circle';
        }
        if (layer instanceof L.Marker) {
            return 'marker';
        }
        if ((layer instanceof L.Polyline) && !(layer instanceof L.Polygon)) {
            return 'polyline';
        }
        if ((layer instanceof L.Polygon) && !(layer instanceof L.Rectangle)) {
            return 'polygon';
        }
        if (layer instanceof L.Rectangle) {
            return 'rectangle';
        }
    };


    var highlightMarkers = function(markers, filteredPointids) {
        for (var i = 0; i < markers.length; i++) {
            var elem = markers[i];
            if (isInArray(filteredPointids, elem.pointid)) {
                elem.icon.markerColor = "orange";
            } else {
                elem.icon.markerColor = "blue";
            }
        }
    }


    leafletData.getMap().then(function(map) {
        if ($scope.controls.edit == undefined)
            return;

        var drawnItems = $scope.controls.edit.featureGroup;
        var currlayer;
        map.on('draw:created', function(e) {
            var type = e.layerType;
            var layer = e.layer;
            var filterGeo = {};

            if (type == "circle") {
                filterGeo.type = type;
                filterGeo.radius = layer._mRadius;
                filterGeo.latLng = layer._latlng;

            } else if (type == "rectangle") {
                filterGeo.type = type;
                filterGeo.latLngs = layer._latlngs;
                filterGeo.layer = layer;
            }
            // send to WidgetCtrl via sharedComms?

            $scope.filteringPointsDraw = true;

            $scope.filteredPoints = getIntersectingPointids(filterGeo);
            sharedCommsService.filteringPointsDraw = $scope.filteringPointsDraw;
            sharedCommsService.pointIdsToFilter = $scope.filteredPoints;

            if ($scope.markers.length > 0)
                updateByFilter();
            // highlightMarkers($scope.markers, $scope.filteredPoints);

            angular.extend($scope, {
                geojson: {
                    data: $scope.geojsonObj,
                    style: featureStyle
                }
            });

            sharedCommsService.bufferAndBroadcast("filterGeo");

            drawnItems.addLayer(layer);
            // console.log(JSON.stringify(layer.toGeoJSON()));
        });

        map.on('draw:edited', function(e) {
            var layers = e.layers;
            layers.eachLayer(function(layer) {
                //do whatever you want, most likely save back to db
                var type = getShapeType(layer);

                var filterGeo = {};

                if (type == "circle") {
                    filterGeo.type = type;
                    filterGeo.radius = layer._mRadius;
                    filterGeo.latLng = layer._latlng;

                } else if (type == "rectangle") {
                    filterGeo.type = type;
                    filterGeo.latLngs = layer._latlngs;
                    filterGeo.layer = layer;
                }
                // send to WidgetCtrl via sharedComms?

                $scope.filteringPointsDraw = true;

                $scope.filteredPoints = getIntersectingPointids(filterGeo);
                sharedCommsService.filteringPointsDraw = $scope.filteringPointsDraw;
                sharedCommsService.pointIdsToFilter = $scope.filteredPoints;

                if ($scope.markers.length > 0)
                    updateByFilter();
                // highlightMarkers($scope.markers, $scope.filteredPoints);

                angular.extend($scope, {
                    geojson: {
                        data: $scope.geojsonObj,
                        style: featureStyle
                    }
                });

                sharedCommsService.bufferAndBroadcast("filterGeo");

            });
        });

        map.on('draw:deleted', function(e) {
            $scope.filteredPoints = new Array();
            $scope.filteringPointsDraw = false;

            sharedCommsService.filteringPointsDraw = $scope.filteringPointsDraw;
            sharedCommsService.pointIdsToFilter = $scope.filteredPoints;

            // highlightMarkers($scope.markers, $scope.filteredPoints);
            if ($scope.markers.length > 0)
                updateByFilter();

            angular.extend($scope, {
                geojson: {
                    data: $scope.geojsonObj,
                    style: featureStyle
                }
            });

            sharedCommsService.bufferAndBroadcast("filterGeo");

        });
    });


}


xReportCtrl.$inject = ['$scope', '$http', '$location', '$routeParams', 'socket', 'sharedCommsService'];

function xReportCtrl($scope, $http, $location, $routeParams, socket, sharedCommsService) {

    console.log('xReportCtrl');

    $scope.pid = $routeParams.pid;
    $scope.wid = $routeParams.wid;

    $scope.sortReportList = 'label.text';

    $scope.userReports = [];
    getReports();

    $scope.deleteReport = function(report, pid) {

        deleteReport(report, pid)
    }

    function deleteReport(report, pid) {

        $http.delete('/api/deleteReport/' + pid + '/' + report.id).
        then(
            function(data, status) {

                var index = $scope.userReports.indexOf(report)
                $scope.userReports.splice(index, 1);

            },

            function(error) {
                console.log('Request failed', error)
            }
        );
    }

    function getReports() {
        $http.get('/api/reports/' + $scope.pid).
        success(function(data, status) {

            for (var i = 0; i < data.result.length; i++) {
                var aux = data.result[i];
                if (aux.report.id == undefined || aux.report.id == null) {
                    aux.report.id = aux.rid;
                }
                $scope.userReports.push(aux.report);
            }

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }
}

xCreateReportCtrl.$inject = ['$scope', '$http', '$location', '$routeParams', 'socket', 'sharedCommsService', 'dateService', '$timeout'];

function xCreateReportCtrl($scope, $http, $location, $routeParams, socket, sharedCommsService, dateService, $timeout) {

    console.log('xCreateReportCtrl');

    // variable declaration

    $scope.pid = $routeParams.pid;
    $scope.wid = $routeParams.wid;
    $scope.rid = $routeParams.rid;

    $scope.filterSpec = {};
    $scope.stateFilter = false;
    $scope.stateReport = false;

    $scope.widget = {};
    $scope.widget.date = new Date();

    $scope.dates = {};
    $scope.dates.label = 'dates';
    $scope.dates.icon = 'fa fa-calendar-o'
        //$scope.dates.startDate = dateService.formatDate($scope.widget.date);
        //$scope.dates.endDate = dateService.formatDate($scope.widget.date);
    $scope.dates.state = false;

    //$scope.dt1 = new Date($scope.widget.date);
    //$scope.dt2 = new Date($scope.widget.date);

    $scope.btnSelected = null;
    $scope.search = '';

    $scope.selectedCharts = 0;

    $scope.userReport = {
        id: null,
        label: null,
        //filter: [],
        charts: [],
        info: {} // create date, modified date, number of charts etc
    }

    loadReport()

    $scope.filterOptions = [];
    getFilterOptions();

    $scope.preCharts = [];
    $scope.tempCharts = [];
    $scope.selectedCharts = 0;

    $scope.selectedIndicator = {
        index: 0,
        label: null
    };

    $scope.readingsDates = {
        max: null,
        min: null
    };

    getReadingsDates();

    $scope.emptyDatalevels = true;

    $scope.tempSort = 'name';

    // scope functions

    $scope.setSort = function(key) {
        $scope.tempSort = key
    }

    $scope.countSelectedCharts = function() {

        $scope.selectedCharts = 0;

        angular.forEach($scope.userReport.charts, function(chart) {
            $scope.selectedCharts += chart.selected ? 1 : 0;
        })

        angular.forEach($scope.preCharts, function(chart) {
            $scope.selectedCharts += chart.selected ? 1 : 0;
        })
    }

    $scope.$watch('dt1', function(newValue, oldValue) {

        if (oldValue != newValue) {

            if ($scope.dt1 > $scope.dt2)
                $scope.dt2 = $scope.dt1;

            var dt = dateService.toggleDatepicker($scope.dt1, $scope.dt2, $scope.widget.date);

            if (dt.foundFalse == true) {
                $scope.dateWarnMessage = dt.dateWarnMessage;
                $scope.dateWarn = dt.dateWarn;
            } else {

                $scope.dateWarn = dt.dateWarn;
                $scope.dates.startDate = dt.dates.startDate;
                $scope.dates.state = dt.dates.state;
            }

        }
    });

    $scope.$watch('dt2', function(newValue, oldValue) {

        if (oldValue != newValue) {

            if ($scope.dt1 > $scope.dt2)
                $scope.dt1 = $scope.dt2;

            var dt = dateService.toggleDatepicker($scope.dt1, $scope.dt2, $scope.widget.date);

            if (dt.foundFalse == true) {
                $scope.dateWarnMessage = dt.dateWarnMessage;
                $scope.dateWarn = dt.dateWarn;
            } else {
                $scope.dateWarn = dt.dateWarn;
                $scope.dates.endDate = dt.dates.endDate;
                $scope.dates.state = dt.dates.state;
            }

        }
    });

    $scope.togglePreDates = function(preDate) {

        var dt = dateService.togglePreDates(preDate, $scope.widget.date);

        $scope.dt1 = dt.startDate;
        $scope.dt2 = dt.endDate;
    }

    $scope.getButton = function(obj) {
        $scope.stateFilter = false;
        $scope.btnSelected = obj.label;
    }

    $scope.checkAll = function(data) {
        angular.forEach(data, function(obj) {
            obj.state = true;
        });
    };

    $scope.uncheckAll = function(data) {
        angular.forEach(data, function(obj) {
            obj.state = false;
        });
    };

    $scope.checkIndicator = function() {

        for (var i = 0; i < $scope.filterOptions.length; i++) {

            if ($scope.filterOptions[i].label == "KPIs") {

                var ind = $scope.selectedIndicator.index;

                for (var z = 0; z < $scope.filterOptions[i].data.length; z++) {

                    if ($scope.filterOptions[i].data[z].id == ind) {
                        $scope.filterOptions[i].data[z].state = true;
                        $scope.selectedIndicator.label = $scope.filterOptions[i].data[z].label;
                    } else {

                        $scope.filterOptions[i].data[z].state = false;
                    }
                }
            }
        }
    }

    $scope.saveStates = function(save) {

        for (var i = 0; i < $scope.filterOptions.length; i++) {

            if ($scope.filterOptions[i].label == "dates") {
                $scope.filterOptions.splice(i, 1);
            }
        }

        $scope.checkIndicator();

        var temp = {};

        temp.label = 'dates';
        temp.data = [{
            'startDate': $scope.dates.startDate,
            'endDate': $scope.dates.endDate
        }];
        temp.state = true;

        $scope.filterOptions.push(temp);

        $scope.dates.state = true;
        $scope.btnSelected = null;

        if (save) {

            setFilterSpec();
            $scope.stateFilter = true;
        }
    }

    $scope.loadPreCharts = function() {

        if ($scope.selectedIndicator.label != 'NPS INDEX (HoN)') {

            $scope.preCharts = [];
            $scope.preCharts.push(generateChart('Untitled', $scope.selectedIndicator.label, '', $scope.selectedIndicator.label, '', '', '', 'new'));
            //generateTemplateCharts(); // standby
        }
    }

    $scope.editChart = function(chart) {
        $scope.tempCharts.push(chart);

        if (chart.extra.category == 'chart') {
            $scope.typeChart = 'chart';
        } else if (chart.extra.category = 'table') {
            $scope.typeChart = 'table'
        }

        $scope.deleteChart(chart);

        //scope.stateReport = false;
        $scope.configChart = true;
        $scope.saveStates(true)

    }

    $scope.delTempChart = function(chart) {

        var index = $scope.tempCharts.indexOf(chart);
        $scope.tempCharts.splice(index, 1);

        $scope.configChart = false;
        $scope.typeChart = false
    }

    $scope.saveChart = function(chart) {

        chart.selected = false
        chart.extra.category = $scope.typeChart;
        chart.filter = angular.copy($scope.filterSpec);
        $scope.userReport.charts.push(chart);

        var index = $scope.tempCharts.indexOf(chart);
        $scope.tempCharts.splice(index, 1);

        /*if($scope.selectedIndicator.label != 'NPS INDEX (HoN)') {
            $scope.preCharts = [];
            $scope.preCharts.push(generateChart('New Chart', $scope.selectedIndicator.label, null, $scope.selectedIndicator.label, 'dates', null, null));
            //generateTemplateCharts(); // standby
        }*/

        if ($scope.tempCharts.length == 0) {
            $scope.configChart = false;
            $scope.typeChart = false;
        }

        $timeout(function() {
            $scope.$broadcast('highchartsng.reflow');
        }, 0);
        $scope.countSelectedCharts();
    }

    $scope.deleteChart = function(chart) {
        var index = $scope.userReport.charts.indexOf(chart);
        $scope.userReport.charts.splice(index, 1);
    }

    $scope.saveReport = function() {
        //$scope.userReport.filter.push($scope.filterSpec);
        //chart.filter = angular.copy($scope.filterSpec);

        $scope.stateReport = true;

        $http.post('/api/saveReport/' + $scope.pid, $scope.userReport).
        success(function(data, status) {
            console.log("saved report");
            if (data.status == 'OK') {
                $scope.userReport.id = data.result[0].rid;
            }
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

        $location.path('/report/' + $scope.pid)
    }

    $scope.editReport = function() {
        $scope.stateReport = false;
    }

    $scope.deleteReport = function() {
        //$window.location.href = "/report/pid";
        $location.path('/report/' + $scope.pid)
    }

    $scope.loadSelectedCharts = function() {
        angular.forEach($scope.preCharts, function(chart) {
            if (chart.selected == true) {
                $scope.tempCharts.push(angular.copy(chart))
                chart.selected = false;
            }
        });

        angular.forEach($scope.userReport.charts, function(chart) {
            if (chart.selected == true) {
                $scope.tempCharts.push(angular.copy(chart));
                chart.selected = false;
            }
        });

        $scope.selectedCharts = 0;
        $scope.configChart = true;
    }

    $scope.unloadSelectedCharts = function() {
        angular.forEach($scope.preCharts, function(chart) {
            if (chart.selected == true) {
                chart.selected = false;
            }
        });

        angular.forEach($scope.userReport.charts, function(chart) {
            if (chart.selected == true) {
                chart.selected = false;
            }
        });

        $scope.selectedCharts = 0;
    }

    $scope.changeConfigChart = function(chart) {

        var indexTempChart = $scope.tempCharts.indexOf(chart);

        if ($scope.typeChart == 'table' && ((chart.extra.xAxis == '' || chart.extra.series == ''))) {
            console.log("dont fetch yet");

        } else {
            // for now, dont allow for tables to send getDataChart without both xAxis and series
            $scope.tempCharts[indexTempChart].config.options.subtitle.text = moment($scope.filterSpec.dates.startDate).format('DD/MM/YYYY') + ' - ' + moment($scope.filterSpec.dates.endDate).format('DD/MM/YYYY');
            var filter = $scope.filterSpec;
            getDataChart(null, indexTempChart, filter)
                .then(
                    function(response) {


                        if ($scope.typeChart == 'table') {
                            fillTable(null, indexTempChart, response);
                        } else if ($scope.typeChart == 'chart') {
                            fillChart(null, indexTempChart, response);
                        }
                    },

                    function() {
                        console.log('error')
                    }
                );
        }

    }

    $scope.refreshChart = function(chart) {

        var startDate = moment(chart.filter.dates.startDate);
        var endDate = moment(chart.filter.dates.endDate);

        var dt = dateService.getCurrentPeriod(startDate, endDate);

        chart.filter.dates.startDate = dt.startDate;
        chart.filter.dates.endDate = dt.endDate;

        chart.filter.startDate = dt.startDate;
        chart.filter.endDate = dt.endDate

        chart.config.options.subtitle.text = moment(dt.startDate).format('DD/MM/YYYY') + ' - ' + moment(dt.endDate).format('DD/MM/YYYY');

        getDataChart(chart, null, chart.filter)
            .then(
                function(response) {

                    if (chart.filter.chart.category == 'table') {
                        fillTable(chart, null, response);
                    } else if (chart.filter.chart.category == 'chart') {
                        fillChart(chart, null, response);
                    }
                },

                function() {
                    console.log("Request failed")
                }
            );
    }



    // auxiliar functions
    var cleanXAxisName = function(raw_name) {
        var toReturn = raw_name;
        toReturn = toReturn.replace(/\\/g, '');
        if (toReturn.charAt(0) == '"' && toReturn.charAt(toReturn.length - 1) == '"') {
            toReturn = toReturn.slice(1, -1);
        }
        return toReturn;
    }

    function nameFromAttributes(i, def) {
        return (i && (i.attributes &&
            (i.attributes.name ||
                i.attributes.Name ||
                i.attributes.StoreCodeAbbrv ||
                i.attributes.location ||
                i.attributes["Store code"] ||
                def
            ) || def) || def);
    }

    var translatePointIdToName = function(pointid) {
        var storesObj = null;
        for (var i = 0; i < $scope.filterOptions.length; i++) {
            if ($scope.filterOptions[i].label == "stores") {
                storesObj = $scope.filterOptions[i].data;
            }
        }

        if (storesObj == null) {
            return pointid;
        } else {
            // TODO: find the right attribute

            for (var j = 0; j < storesObj.length; j++) {
                var storeObjAux = storesObj[j];
                if (storeObjAux.pointid == pointid) {
                    return nameFromAttributes(storeObjAux, pointid);
                }
            }
            return pointid;
        }
    }

    function getReadingsDates() {

        $http.post('/api/getMinAndMaxDate/' + $scope.pid).
        then(

            function(data, status) {

                $scope.readingsDates.max = new Date(data.data[0].max);
                $scope.readingsDates.min = new Date(data.data[0].min);
                $scope.widget.date = new Date(data.data[0].max);
                $scope.dates.startDate = dateService.formatDate($scope.widget.date);
                $scope.dates.endDate = dateService.formatDate($scope.widget.date);
                $scope.dt1 = new Date($scope.widget.date);
                $scope.dt2 = new Date($scope.widget.date);

                console.log($scope.readingsDates)
            },

            function(error) {
                console.log('error', error)
            }
        );
    }

    function fillTable(chart, indexTempChart, response) {

        if (response.data instanceof Array) {
            var src = null;
            if (indexTempChart != null && indexTempChart != undefined) {
                src = $scope.tempCharts[indexTempChart];
            } else {
                src = chart;
            }

            src.table.headers = [];
            src.table.data = [];

            var addedHeaders = {};
            var added = 0;
            var zeroedDataTableRow = [];

            for (var s = 0; s < response.data.length; s++) {
                var series = response.data[s];
                for (var i = 0; i < series.data.length; i++) {
                    var xaxis_name = cleanXAxisName(series.data[i].xaxis);
                    if (!addedHeaders.hasOwnProperty(xaxis_name)) {
                        addedHeaders[xaxis_name] = '-';

                        src.table.headers.push(xaxis_name.replace(' 00:00:00:000000', ''));
                        zeroedDataTableRow.push(0);
                    }
                }
            }


            for (var s = 0; s < response.data.length; s++) {

                var series = response.data[s];
                if (series.hasOwnProperty('name')) {
                    var tempRow = angular.copy(addedHeaders);
                    tempRow.name = series.name;

                    if (src.extra.series == 'stores') {
                        tempRow.name = translatePointIdToName(tempRow.name);
                    }

                    for (var i = 0; i < series.data.length; i++) {
                        var xaxis_name = cleanXAxisName(series.data[i].xaxis);
                        // we need to try to add all xaxis of all results! but in a distinct add approach
                        tempRow[xaxis_name] = parseFloat(series.data[i].value);
                        //tempRow[xaxis_name] = parseFloat(series.data[i].value);
                        // tempSeries.data.push([series.data[i].xaxis, parseFloat(series.data[i].value)]);
                        // tempSeries.data.push(parseFloat(series.data[i].value));
                    }

                    src.table.data.push(tempRow);

                }

            }
        }
    }


    function fillChart(chart, indexTempChart, response) {
        var src = null;

        if (indexTempChart != null && indexTempChart != undefined) {
            src = $scope.tempCharts[indexTempChart];
        } else {
            src = chart;
        }


        src.config.xAxis.categories = [];
        var addedCategories = {};
        var added = 0;
        var zeroedData = [];
        src.config.series = [];


        for (var s = 0; s < response.data.length; s++) {
            var series = response.data[s];
            for (var i = 0; i < series.data.length; i++) {
                var xaxis_name = cleanXAxisName(series.data[i].xaxis);
                if (!addedCategories.hasOwnProperty(xaxis_name)) {
                    addedCategories[xaxis_name] = added;
                    added++;
                    src.config.xAxis.categories.push(xaxis_name.replace(' 00:00:00:000000', ''));
                    zeroedData.push(0);
                }
            }
        }


        for (var s = 0; s < response.data.length; s++) {

            var series = response.data[s];

            var tempSeries = {
                name: series.name,
                data: zeroedData.slice()
            };

            for (var i = 0; i < series.data.length; i++) {
                var xaxis_name = cleanXAxisName(series.data[i].xaxis);
                // we need to try to add all xaxis of all results! but in a distinct add approach
                tempSeries.data[addedCategories[xaxis_name]] = parseFloat(series.data[i].value);
                // tempSeries.data.push([series.data[i].xaxis, parseFloat(series.data[i].value)]);
                // tempSeries.data.push(parseFloat(series.data[i].value));
            }

            src.config.series.push(tempSeries);

        }

        $timeout(function() {
            $scope.$broadcast('highchartsng.reflow');
        }, 0);
    }

    function setFilterSpec() {

        $scope.filterSpec = {}


        for (var i = 0; i < $scope.filterOptions.length; i++) {

            var statesCount = 0;

            $scope.filterSpec[$scope.filterOptions[i].label] = [];
            $scope.filterSpec["meta_" + $scope.filterOptions[i].label] = [];

            for (var z = 0; z < $scope.filterOptions[i].data.length; z++) {

                if ($scope.filterOptions[i].data[z].state == true) {
                    statesCount++;

                    if ($scope.filterOptions[i].label == "stores") {
                        $scope.filterSpec[$scope.filterOptions[i].label].push($scope.filterOptions[i].data[z].pointid);
                        $scope.filterSpec["meta_" + $scope.filterOptions[i].label].push({
                            pointid: $scope.filterOptions[i].data[z].pointid,
                            label: $scope.filterOptions[i].data[z].label
                        });
                    } else if ($scope.filterOptions[i].label == "KPIs") {
                        $scope.filterSpec[$scope.filterOptions[i].label].push($scope.filterOptions[i].data[z]);
                    } else {
                        $scope.filterSpec[$scope.filterOptions[i].label].push($scope.filterOptions[i].data[z].label);
                        $scope.filterSpec["meta_" + $scope.filterOptions[i].label].push($scope.filterOptions[i].data[z].label);
                    }
                }

                // we need to avoid the comparision below for KPIs since we only accept one KPI, and a bug would happen if the project only had one KPI
                if (statesCount == $scope.filterOptions[i].data.length && $scope.filterOptions[i].label != 'KPIs') {
                    $scope.filterSpec[$scope.filterOptions[i].label] = [];
                }
            }
        }

        $scope.filterSpec.dates = $scope.dates;
        $scope.filterSpec.startDate = $scope.dates.startDate;
        $scope.filterSpec.endDate = $scope.dates.endDate;

        $scope.filterSpec.levels = $scope.levels;


        if ($scope.filterSpec.stores != null && $scope.filterSpec.stores != undefined) {
            if ($scope.filterSpec.stores.length > 0) {
                $scope.filterSpec.points = $scope.filterSpec.stores.toString();
            }
        }
    }



    function getDataChart(chart, indexTempChart, filter) {

        if (indexTempChart != null && indexTempChart != undefined) {
            $scope.filterSpec.chart = $scope.tempCharts[indexTempChart].extra;
        } else {
            $scope.filterSpec.chart = chart.extra;
        }

        return $http.post('/report/PointRankingByTitle/' + $scope.pid, angular.copy(filter))
    }

    function generateTemplateCharts() {

        var templates = [
            generateChart('History', $scope.selectedIndicator.label, 'line', $scope.selectedIndicator.label, 'dates', 'stores', '', 'history'),
            generateChart('By Category', $scope.selectedIndicator.label, 'line', $scope.selectedIndicator.label, 'dates', 'category', '', 'history'),
            generateChart('By Product', $scope.selectedIndicator.label, 'line', $scope.selectedIndicator.label, 'dates', 'product', '', 'history'),
            generateChart('By Store', $scope.selectedIndicator.label, 'line', $scope.selectedIndicator.label, 'dates', 'stores', '', 'history'),
            generateChart('History vs Last Year', $scope.selectedIndicator.label, 'line', $scope.selectedIndicator.label, 'dates', 'stores', 'last year', 'objective'),
            generateChart('History vs Plan', $scope.selectedIndicator.label, 'line', $scope.selectedIndicator.label, 'dates', 'stores', 'plan', 'objective'),
            generateChart('By Category', $scope.selectedIndicator.label, 'column', $scope.selectedIndicator.label, 'category', '', '', 'ranking'),
            generateChart('By Product', $scope.selectedIndicator.label, 'column', $scope.selectedIndicator.label, 'product', '', '', 'ranking'),
            generateChart('By Store', $scope.selectedIndicator.label, 'column', $scope.selectedIndicator.label, 'stores', '', '', 'ranking'),
            generateChart('By Store and Product', $scope.selectedIndicator.label, 'column', $scope.selectedIndicator.label, 'stores', 'category', '', 'twof'),
            generateChart('By Category and Product', $scope.selectedIndicator.label, 'column', $scope.selectedIndicator.label, 'category', 'product', '', 'twof'),
            generateChart('By Store and Product', $scope.selectedIndicator.label, 'column', $scope.selectedIndicator.label, 'stores', 'product', '', 'twof')
        ]

        for (var i = 0; i < templates.length; i++) {

            var tmp = templates[i];
            getDataChart(tmp);
            tmp.config.options.exporting = false;
            $scope.preCharts.push(tmp);
        }
    };

    $scope.print = function(chart) {

        var chart = chart.getHighcharts();
        chart.print();
    }


    function generateChart(title, kpi, type, y, x, series, extra, category) {

        return {
            id: 0,
            config: {
                options: {
                    chart: {
                        type: type,
                    },
                    subtitle: {
                        text: ($scope.dates.startDate === $scope.dates.endDate) ? dateService.formatDate($scope.dates.startDate) : (dateService.formatDate($scope.dates.startDate) + ' - ' + dateService.formatDate($scope.dates.endDate))
                    },
                    yAxis: {
                        title: {
                            text: kpi
                        },
                        startOnTick: false
                    },
                    plotOptions: {
                        line: {
                            dataLabels: {
                                enabled: false
                            },
                            enableMouseTracking: true
                        },
                        column: {

                        },
                    }
                    //for reference
                    //tooltip: {
                    //pointFormat: 'Population in 2008: <b>{point.y:.1f} millions</b>' // Ex
                    //}
                },
                title: {
                    text: title
                },

                xAxis: {
                    type: '',
                    categories: [],
                    labels: {
                        rotation: -45,
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    }
                },

                series: [
                    /*
                    for reference
                    {   
                        type:'',
                        name : 'shit',
                        data: [0, 10, 15, 12, 8, 7, 10, 15, 55, 98, 30, 10]
                    },
                    {   
                        type:'',
                        name : 'not',
                        data: [10, 20, 35, 22, 18, 17, 5, 4, 2, 10, 10]
                    }*/
                ],
                loading: false,

                func: function(chart) {
                    $timeout(function() {
                        chart.reflow();
                    }, 0);
                }
            },
            extra: {
                note: {
                    text: '',
                    enabled: false
                },
                yAxis: y,
                xAxis: x,
                series: series,
                category: category
            },
            table: {
                enabled: false,
                headers: [],
                data: [],
                sort: 'name'
                    /*predicate: function(val) {
                        return val[this.sort];
                    }*/
            }
        }
    }


    // Nuno
    function nameFromAttributes(i, def) {
        return (i && (i.attributes &&
            (i.attributes.name ||
                i.attributes.Name ||
                i.attributes.StoreCodeAbbrv ||
                i.attributes.location ||
                i.attributes["Store code"] ||
                def
            ) || def) || def);
    }

    var readKpis = false;

    function getFilterOptions() {
        $http.get('/api/getProjectIndicators/' + $scope.pid)
            .success(function(data, status) {

                var aux = {};
                aux.label = 'KPIs'
                aux.data = [];

                for (var i = 0; i < data.length; i++) {
                    aux.data.push({
                        "id": i,
                        "label": data[i].title,
                        "sublabel": data[i].unit,
                        "aggrmethod": data[i].aggrmethod
                    });
                }

                $scope.filterOptions.push(aux);
                readKpis = true;

                $http.get('/geoapi/' + $scope.pid).
                success(function(data, status) {
                    //console.log("geoapi got points for report");

                    var aux = {};
                    aux.label = 'stores'
                    aux.data = [];

                    for (var i = 0; i < data.length; i++) {
                        aux.data.push({
                            "id": i,
                            "state": true,
                            "label": nameFromAttributes(data[i], data[i].pointid),
                            "attributes": data[i].attributes,
                            "pointid": data[i].pointid
                        });
                    }


                    $scope.filterOptions.push(aux);

                    // get metalevels for this KPI!
                    $scope.getKpiMetalevels($scope.filterOptions[0].data[$scope.selectedIndicator.index].label);

                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                });
            }).
        error(function(data, status) {

        });
    }

    function loadReport() {

        if ($scope.rid != null) {

            $http.get('/api/reports/' + $scope.pid + '/' + $scope.rid).
            then(function(data) {

                    $scope.userReport = data.data.result[0].report;
                    $scope.stateReport = true;
                    $scope.userReport.id = $scope.rid;


                    $timeout(function() {
                        $scope.$broadcast('highchartsng.reflow');
                    }, 0);
                },
                function(err) {
                    $scope.data = err || "Request failed";
                });
        }
    }

    $scope.getKpiMetalevels = function(kpi_title) {
        // todo: create api method for this post
        // todo: handle the metalevels

        //console.log(kpi_title);
        var toSend = {
            "kpi_title": kpi_title
        };
        $http.post('/api/getMetaLevels/' + $scope.pid, toSend).
        success(function(data, status) {

            $scope.filterOptions = $scope.filterOptions.slice(0, 2);
            $scope.dataHierarchies = {};
            $scope.levels = new Array();

            $scope.filterOptions = $scope.filterOptions.concat(data.metaLevels);
            $scope.dataHierarchies = data.hierarchy;
            $scope.levels = data.levels;

            $scope.dataLevelsClass = 'col-md-' + Math.floor(12 / $scope.levels.length);

            populateParentCounts($scope.levels, 0, $scope.dataHierarchies, $scope.filterOptions, null, []);
            //console.log("done populateParentCounts");


            /*if($scope.rid != null){
              console.log('getting rid ' + $scope.rid);
              $http.get('/api/reports/'+$scope.pid+'/'+$scope.rid).
                success(function(data, status) {
                  console.log("read report");

                  // TODO remove this after finishing this requirement
                  console.log(data);


                  // copy label and info
                  $scope.userReport.label = data.result[0].report.label;
                  $scope.userReport.label.enabled = true;
                  $scope.userReport.info = data.result[0].report.info;
                  $scope.userReport.id = $scope.rid;

                  // copy the filter to userReport, but also assign its values to the current filterSpec
                  // TODO
                  $scope.saveStates(true);

                  // then the charts
                  // TODO assign
                  // $scope.userReport = data.result[0].report;
                  $scope.userReport.charts = data.result[0].report.charts;
                  // TODO fetch the data (today, were storing the data on each chart)
                  

                  $scope.stateReport = true;
                  $timeout(function() { $scope.$broadcast('highchartsng.reflow'); }, 0);
                }).
                error(function (data, status) {
                  $scope.data = data || "Request failed";
                });
            }*/

            for (var i = 0; i < $scope.filterOptions.length; i++) {

                if ($scope.filterOptions[i].label != 'KPIs' && $scope.filterOptions[i].label != 'stores') {

                    for (var z = 0; z < $scope.filterOptions[i].data.length; z++) {

                        if ($scope.filterOptions[i].data[z].label != '')
                            $scope.emptyDatalevels = false;
                    }
                }

            }
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }


    $scope.$watch('selectedIndicator.index', function(oldVal, newVal) {
        // handle the change of kpi selection
        if (readKpis) {
            $scope.getKpiMetalevels($scope.filterOptions[0].data[$scope.selectedIndicator.index].label);
        }
    });


    $scope.metalevels = new Array();

    $scope.dataHierarchies = {};
    $scope.levels = new Array();
    $scope.dataLevelsClass = 'col-md-12';

    // $http.get('/api/getMetaLevels/'+$scope.pid)
    //   .success(function(data, status) {
    //     $scope.filterOptions = $scope.filterOptions.concat(data.metaLevels);
    //     $scope.dataHierarchies = data.hierarchy;
    //     $scope.levels = data.levels;

    //     $scope.dataLevelsClass = 'col-md-' +  Math.ceil(12/$scope.levels.length);

    //     populateParentCounts($scope.levels, 0, $scope.dataHierarchies, $scope.filterOptions, null, []);
    //     console.log("done populateParentCounts");
    //   }).
    //   error(function (data, status) {

    //   });



    var populateParentCounts = function(levelsArr, nLevel, transverseObj, receptionArr, lastParentVal, currChain) {
        // para cada obj no transverseObj
        // ir ao mesmo obj no receptionArr e acrescentar parent

        var originalChain = currChain.slice();


        for (var levelVal in transverseObj) {
            if (transverseObj.hasOwnProperty(levelVal)) {

                if (lastParentVal != null) {
                    addParent(levelsArr[nLevel], levelVal, lastParentVal, currChain, receptionArr);
                }

                var auxCurrChain = originalChain.slice();
                auxCurrChain.push(levelVal);

                populateParentCounts(levelsArr, nLevel + 1, transverseObj[levelVal], receptionArr, levelVal, auxCurrChain);
            }
        }


    }

    var addParent = function(metaLevel, levelVal, parentVal, currParentsChain, metaLevelsArr) {
        for (var i = 0; i < metaLevelsArr.length; i++) {
            if (metaLevelsArr[i].label == metaLevel) {
                // console.log("found metalevel");

                for (var j = 0; j < metaLevelsArr[i].data.length; j++) {

                    if (metaLevelsArr[i].data[j].label == levelVal) {
                        // console.log("found level");

                        if (!metaLevelsArr[i].data[j].hasOwnProperty('parents')) {
                            metaLevelsArr[i].data[j].parents = new Array();
                            metaLevelsArr[i].data[j].parents.push(parentVal);

                            metaLevelsArr[i].data[j].parentsChain = new Array();
                            metaLevelsArr[i].data[j].parentsChain.push(currParentsChain);

                        } else {
                            // TODO: avoid duplicates
                            metaLevelsArr[i].data[j].parents.push(parentVal);
                            metaLevelsArr[i].data[j].parentsChain.push(currParentsChain);
                        }

                        return;

                    }


                }
            }
        }
    }



    $scope.metaLevelChange = function(toState, levelValue, metaLevelTitle) {
        console.log("metaLevelChange");
        console.log(toState);

        // leave this dummy condition like this for now, because we may have to evaluate if the activation process is like this
        if (toState == false || toState == true) {

            // now test the parents
            var parentLevels = new Array();
            var uncheckedLevelParents = findParentLevels(levelValue, metaLevelTitle, $scope.levels, 0, $scope.dataHierarchies, parentLevels);

            // now, for each parent, test if each one has all childs deactivated.
            // if so, deactivate the parent.
            if (parentLevels.length > 0) {
                for (var j = 0; j < parentLevels.length; j++) {
                    var parentElem = parentLevels[j];
                    testEachParentMetaLevel(parentElem.metaleveltitle, parentElem.parents, $scope.filterOptions, levelValue, $scope.levels);
                }
            }


            var childLevels = new Array();
            var uncheckedLevelChilds = findLevel(levelValue, metaLevelTitle, $scope.levels, 0, $scope.dataHierarchies, childLevels);
            // obter os childs do levelValue e metaLevelTitle em $scope.dataHierarchies

            if (childLevels.length > 0) {
                // for each child, mas agora existente em $scope.filterOptions
                // get this child's parents
                // calc by $scope.levels.indexOf(metaLevelTitle)-1 to get the parents parentsMetaLevelTitle
                // if all parents have state = false
                // set this child hidden to true
                for (var i = 0; i < childLevels.length; i++) {
                    var childElem = childLevels[i];
                    testEachChildMetaLevel(childElem.metaleveltitle, childElem.childs, $scope.filterOptions, levelValue);
                }

            } else {
                // didnt find the levels... weird
            }



            console.log("message");

        } else {
            // TODO: missing code for activation of level
            // we also need to take in account that this reactivated level has some cached childs on child.temp (see method testEachChildMetaLevel below)

        }
    }


    var getParentLevelObject = function(parentLabel, parentMetaLevel, filterOptionsArr) {
        for (var i = 0; i < filterOptionsArr.length; i++) {
            var aux = filterOptionsArr[i];
            if (aux.label == parentMetaLevel) {
                var parentLevels = aux.data;

                for (var j = 0; j < parentLevels.length; j++) {
                    var parent = parentLevels[j];

                    if (parent.label == parentLabel) {
                        return parent;
                    }
                }
            }
        }
        return null;
    }

    // auxilliary functions

    var isEmptyObject = function(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }
        return true;
    }

    function cloneObject(obj) {
        if (obj == null || typeof(obj) != 'object')
            return obj;

        var temp = obj.constructor(); // changed

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                temp[key] = cloneObject(obj[key]);
            }
        }
        return temp;
    }


    var testEachChildMetaLevel = function(metalevel, childsObj, filterOptionsArr, parentValue) {
        for (var i = 0; i < filterOptionsArr.length; i++) {
            var aux = filterOptionsArr[i];
            if (aux.label == metalevel) {
                var childs = aux.data;
                for (var j = 0; j < childs.length; j++) {
                    var child = childs[j];

                    for (var prop in childsObj) {
                        if (childsObj.hasOwnProperty(prop)) {
                            if (child.label == prop) {

                                // avoid already tested levels
                                // console.log("testing for "+ metalevel + " " + prop);

                                if (child.hasOwnProperty('parents')) {
                                    var oneIsActive = !(child.parents.length > 0);
                                    var oneIsActiveChain = !(child.parents.length > 0);

                                    for (var k = 0; k < child.parents.length; k++) {
                                        var parentLabel = child.parents[k];
                                        var parentMetaLabel = $scope.levels[$scope.levels.indexOf(metalevel) - 1];
                                        var parent = getParentLevelObject(parentLabel, parentMetaLabel, filterOptionsArr);

                                        var parentsChain = child.parentsChain[k].slice();
                                        var allParentsAreActive = checkIfAllParentsAreActive(parentsChain, $scope.levels.indexOf(metalevel) - 1, filterOptionsArr, true);


                                        if (parent != null) {
                                            oneIsActive = oneIsActive || parent.state;
                                            oneIsActiveChain = oneIsActiveChain || allParentsAreActive;
                                        }
                                    }

                                    console.log(child.label + " || oneIsActive: " + oneIsActive + " |||| oneIsActiveChain " + oneIsActiveChain);

                                    if (!oneIsActiveChain) {
                                        child.hide = true;
                                        child.state = false;
                                        if (child.temp) {
                                            // console.log("child.temp "+child.temp);

                                            for (var ch in child.temp) {
                                                if (child.temp.hasOwnProperty(ch)) {
                                                    // each elment in child.temp will be guaranteed to be unchecked, because when we check them back we remove its entry from child.temp

                                                    if (!isEmptyObject(child.temp[ch])) {
                                                        var temp = cloneObject(child.temp[ch]);
                                                        child.temp[ch] = {};
                                                        testEachChildMetaLevel(metalevel, temp, filterOptionsArr, child.label);
                                                    }


                                                }
                                            }
                                        }
                                        console.log("disabling " + child.label + " on " + metalevel);
                                    } else {

                                        if (child.hide == true || (child.hide == false && child.state == false)) {
                                            console.log("enabling " + child.label + " on " + metalevel);
                                            child.hide = false;
                                            child.state = true;
                                        }

                                        child.temp[parentValue] = childsObj;
                                    }

                                }


                                // after this, we need to continue to go down on childsObj
                                // start with index = $scope.levels.indexOf(metalevel) + 1
                                // and call testEachChildMetaLevel( $scope.levels[index], forEach childsObj[property], filterOptionsArr)

                                var index = $scope.levels.indexOf(metalevel) + 1;
                                if (index < $scope.levels.length) {
                                    testEachChildMetaLevel($scope.levels[index], childsObj[prop], filterOptionsArr, child.label);
                                }

                            }
                        }
                    }
                }
            }
        }
    }


    var checkIfAllParentsAreActive = function(parentsChain, parentStartingLevel, filterOptionsArr, accumState) {
        // parentsChain is an array of strings where 0 is the closest parent
        // and parentStartingLevel is its level

        var parentLabel = parentsChain.pop();
        var parent = getParentLevelObject(parentLabel, $scope.levels[parentStartingLevel], filterOptionsArr);


        var auxAccumState = accumState && parent.state;

        if (parentsChain.length == 0 || parentStartingLevel == 0 || auxAccumState == false) {
            return auxAccumState;
        } else {
            return checkIfAllParentsAreActive(parentsChain, parentStartingLevel - 1, filterOptionsArr, auxAccumState);
        }
    }

    var testChildsDeactivated = function(metalevel, parent, filterOptionsArr, levels) {
        // get the parent s childs
        var parentLevelIndex = $scope.levels.indexOf(metalevel);
        var childMetaLevel = $scope.levels[parentLevelIndex + 1];

        for (var i = 0; i < filterOptionsArr.length; i++) {
            var aux = filterOptionsArr[i];
            if (aux.label == childMetaLevel) {
                var elems = aux.data;

                var allActive = false;

                for (var j = 0; j < elems.length; j++) {
                    var elem = elems[j];

                    if (elem.parents.indexOf(parent) >= 0) {
                        allActive = allActive || elem.state;
                    }

                }

                return !allActive;
            }
        }

    }


    var testEachParentMetaLevel = function(metalevel, parent, filterOptionsArr) {
        for (var i = 0; i < filterOptionsArr.length; i++) {
            var aux = filterOptionsArr[i];
            if (aux.label == metalevel) {
                var elems = aux.data;
                for (var j = 0; j < elems.length; j++) {
                    var elem = elems[j];

                    if (elem.label == parent) {

                        // check if all childs of this elem are deactivated
                        var allChildsDeactivated = testChildsDeactivated(metalevel, parent, filterOptionsArr, $scope.levels);

                        console.log("are " + parent + " 's childs deactivated? " + allChildsDeactivated);

                        if (allChildsDeactivated) {
                            elem.state = false;

                        } else {
                            elem.state = true;

                        }

                        var currLevelIndex = $scope.levels.indexOf(metalevel);
                        if (currLevelIndex > 0) {
                            for (var k = 0; k < elem.parentsChain.length; k++) {
                                var farfar = elem.parentsChain[k][elem.parentsChain[k].length - 1];
                                console.log("asd " + farfar);
                                testEachParentMetaLevel($scope.levels[currLevelIndex - 1], farfar, filterOptionsArr);
                            }
                        }
                    }
                }
            }
        }
    }


    var findLevel = function(levelValue, metaLevelTitle, levels, currLevel, transverseObj, childLevels) {
        var rightLevel = $scope.levels.indexOf(metaLevelTitle);

        if (currLevel < rightLevel) {
            for (var levelVal in transverseObj) {
                if (transverseObj.hasOwnProperty(levelVal)) {
                    findLevel(levelValue, metaLevelTitle, levels, currLevel + 1, transverseObj[levelVal], childLevels);
                }
            }
        } else if (currLevel >= levels.length) {
            // return null;
            return;
            console.log("null");
        } else {
            var found = false;
            for (var levelVal in transverseObj) {
                if (transverseObj.hasOwnProperty(levelVal)) {
                    if (levelVal == levelValue) {
                        found == true;
                        childLevels.push({
                            "metaleveltitle": $scope.levels[rightLevel + 1],
                            "childs": transverseObj[levelVal]
                        });
                        // return transverseObj[levelVal];
                    }
                }
            }
            // return null;
            if (!found) {
                return;
            }
            console.log("null");
        }
    }


    var hasChild = function(levelValue, transverseObj) {
        for (var levelVal in transverseObj) {
            if (transverseObj.hasOwnProperty(levelVal)) {
                if (levelValue == levelVal) {
                    return true;
                }
            }
        }
        return false;
    }

    var findParentLevels = function(levelValue, metaLevelTitle, levels, currLevel, transverseObj, parentLevels) {
        var rightLevel = $scope.levels.indexOf(metaLevelTitle);

        if (currLevel < rightLevel - 1) {
            // still far away to test each transverseObj s childes
            for (var levelVal in transverseObj) {
                if (transverseObj.hasOwnProperty(levelVal)) {
                    findParentLevels(levelValue, metaLevelTitle, levels, currLevel + 1, transverseObj[levelVal], parentLevels);
                }
            }
        } else if (currLevel >= levels.length) {
            // return null;
            return;
            console.log("null");
        } else {
            var found = false;
            for (var levelVal in transverseObj) {
                if (transverseObj.hasOwnProperty(levelVal)) {

                    if (hasChild(levelValue, transverseObj[levelVal])) {
                        found == true;
                        parentLevels.push({
                            "metaleveltitle": $scope.levels[rightLevel - 1],
                            "parents": levelVal
                        });
                    }

                }
            }
        }

        if (!found) {
            return;
        }
        console.log("null");
    }



    $scope.uncheckAllDataLevels = function() {
        // TODO: 
    }

    $scope.checkAllDataLevels = function() {
        // TODO: 
    }


}

// END NEW DASH CTRL

ModalDeleteConfirmCtrl.$inject = ['$scope', '$http', '$routeParams', 'sharedCommsService'];

function ModalDeleteConfirmCtrl($scope, $http, $routeParams, sharedCommsService) {
    // NUNOOOOOO
    console.log("ModalDeleteConfirmCtrl");
    $scope.deleteMessage = "";
    $scope.deleteItem = {};


    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.message == "confirmDelete") {
            // console.log("received message confirmDelete");
            // console.log(sharedCommsService.deleteItem);

            if (sharedCommsService.deleteItem.type == "project") {
                $scope.deleteMessage = 'Are you sure you want to delete project "' + sharedCommsService.deleteItem.itemName + '"? (project id: ' + sharedCommsService.deleteItem.pid + ')';
                $scope.deleteItem = sharedCommsService.deleteItem;
            }

        }
    });


    $scope.delete = function() {
        console.log("deleteOnModal pid:" + $scope.deleteItem.pid);
        sharedCommsService.bufferAndBroadcast("doDelete");
    }


}



WidgetCtrl.$inject = ['$scope', '$http', '$routeParams', 'sharedCommsService', 'selectedAttrs', 'Profile', 'Occurrences', '$location'];

function WidgetCtrl($scope, $http, $routeParams, sharedCommsService, selectedAttrs, Profile, Occurrences, $location) {
    console.log('WidgetCtrl');


    $scope.loading = false;
    $scope.occLoading = false;

    $scope.graph = "ranking";


    $scope.$on('$locationChangeSuccess', function(event) {
        if ($location.path().indexOf('/map') >= 0)
            $scope.loading = true

        if ($location.path().indexOf('/occurrences') >= 0)
            $scope.occLoading = true
    })

    $scope.occurrences = Occurrences.occurrences;

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.showOpenOcc = false;
    //console.log($scope.showOpenOcc);
    $scope.openOcc = Occurrences.openOcc;

    if ($scope.openOcc > 0)
        $scope.showOpenOcc = true;
    else
        $scope.showOpenOcc = false;

    //console.log($scope.showOpenOcc);

    $scope.$watch('currOccurrence.status', function() {
        $scope.openOcc = Occurrences.openOcc;

        if ($scope.openOcc > 0)
            $scope.showOpenOcc = true;
        else
            $scope.showOpenOcc = false;

        //console.log($scope.showOpenOcc);
    });

    $scope.pid = $routeParams.pid;
    $scope.wid = $routeParams.wid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.userProfile = Profile.userprofile;
    console.log(Profile.userprofile);

    $scope.pointid = $routeParams.pointid;

    $scope.sum = 0;
    $scope.nPoints = 0;
    $scope.minimum = null;
    $scope.maximum = null;


    if ($scope.pointid != undefined && $scope.pointid != null) {
        var query = '/api/pointdashboard/' + $scope.pid + "/" + $scope.pointid;

        $http.get(query).
        success(function(data, status) {
            $scope.project = data.project;
            $scope.pointname = nameFromAttributes(data.pattributes, $scope.pointid);

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

    // function to control decimal places in y axis and labels
    $scope.yAxisTickFormatFunction = function() {
        return function(d) {
            if (d >= 1000 || $scope.widget.title == 'Number of Customers' || $scope.widget.title == 'NPS INDEX (HoN)')
                return d3.format('0.0f')(d);
            else
                return d3.format('0.2f')(d);
        }
    }

    // structure to hold the filtered points on filterBox
    $scope.pointsFilteredBox = new Array();



    var dataRanking = new Array();
    var dataCategoryRanking = new Array();
    var dataProductRanking = new Array();
    var pointIdAttributes = {};

    $scope.catFilters = {};
    $scope.prodFilters = {};
    var DEFAULT_PROD_FILTER = {};
    var DEFAULT_CAT_FILTER = {};
    var DEFAULT_POINTS_FILTER = {};
    var DEFAULT_DATE_FILTER = {};

    var DEFAULT_FILTER = {
        "dates": [],
        "points": [],
        "categories": [],
        "products": []
    };

    $scope.filterSpec = DEFAULT_FILTER;

    $scope.applyFilter = function(usingFilterBox) {
        console.log("applyFilter");

        sharedCommsService.messageFilter = "updatedFilter"
        sharedCommsService.filterSpec = $scope.filterSpec;
        sharedCommsService.broadcastMessage();

        /*if ($scope.dateFilter.state) {
            // $scope.filterSpec.startdate = $scope.dateFilter.startdate;
            // $scope.filterSpec.finishdate = $scope.dateFilter.finishdate;
            console.log($scope.dateFilter.startdate);
            console.log($scope.dateFilter.finishdate);
            $scope.filterSpec.dates = $scope.dateFilter;
        }*/

        //console.log($scope.filterSpec);

        if (usingFilterBox) {
            //console.log($scope.pointsFilteredBox);

            var listOfPointsToFilter = new Array();

            for (var pointid in $scope.pointsFilteredBox) {
                if ($scope.pointsFilteredBox.hasOwnProperty(pointid)) {
                    if ($scope.pointsFilteredBox[pointid] == true)
                        listOfPointsToFilter.push(+pointid);
                }
            }

            $scope.filterSpec.points = listOfPointsToFilter;
            //console.log($scope.filterSpec);
        }

        var query = '/api/widgetIndicatorsFilter/' + $scope.pid + '/' + $scope.wid;

        $http.post(query, $scope.filterSpec)
            .success(function(data, status) {

                console.log("/api/widgetIndicatorsFilter/", data);

                $scope.exampleData = [{
                    "key": "History",
                    "values": []
                }];


                dataRanking = [];
                dataProductRanking = [];
                dataCategoryRanking = [];
                $scope.sum = 0;
                $scope.nPoints = 0;
                $scope.minimum = null;
                $scope.maximum = null;


                $scope.widget = data.widget;

                if ($scope.widget.hasOwnProperty("date"))
                    $scope.widget.date = $scope.widget.date.replace(' 00:00:00:000000', '');

                $scope.indicators = data.indicators;

                for (var i = 0; i < $scope.indicators.length; i++) {
                    var ind = $scope.indicators[i];
                    if (ind.title == $scope.widget.title)
                        $scope.indicator = ind;
                }

                $scope.categories = [];
                $scope.products = [];
                $scope.prodCatMap = {};

                $scope.ordFiltValues = data.ordFiltValues;
                $scope.npsvaluesfiltered = data.npsvaluesfiltered;

                $http.post('/api/accumRanking/' + $scope.pid + '/' + $scope.wid, $scope.filterSpec)
                    .success(function(data, status) {

                        console.log("/api/accumRanking/", data);

                        $scope.accumRanking = (data == 'null') ? null : data;

                        $http.get('/api/pointsFromWidget/' + $scope.pid + '/' + $scope.wid)
                            .success(function(data, status) {
                                console.log("/api/pointsFromWidget/", data);

                                if ($scope.npsvaluesfiltered == undefined)
                                    $scope.npsvaluesfiltered = data.npsvalues;

                                // NUNOALEX if in $scope.filterSpec.points NOT REQUIRED I THINK

                                for (var d = 0; d < data.locations.length; d++) {
                                    pointIdAttributes[data.locations[d].pointid] = data.locations[d].attributes;
                                    pointIdAttributes[data.locations[d].pointid].type = data.locations[d].type;
                                }

                                // console.log("max is "+max);
                                processValues(null, $scope.npsvaluesfiltered, $scope.accumRanking);
                                totalGraphs($scope.widget.title);
                                standardError();

                                if (usingFilterBox) {
                                    // we need to communicate to controller DemoWidgetPointsController that a filter was applied
                                    sharedCommsService.widgetFilter = $scope.filterSpec;
                                    sharedCommsService.bufferAndBroadcast("filterSpec");
                                    sharedCommsService.bufferAndBroadcast("eraseFilterGeo");

                                    //$scope.applyFilterButtonDisabled = false;
                                    //$scope.applyFilterButtonText = 'Apply Filter';
                                    //$scope.filterBoxFunction('apply');

                                    $scope.dateFilter.stateapplied = $scope.filterSpec.dates.state;
                                }

                                $http.post('/dashboard/pointranking/' + $scope.pid + '/' + $scope.wid, $scope.filterSpec).
                                success(function(data, status) {

                                    if (data.length > 0) {
                                        var pointRanking = new Array();
                                        for (var i = 0; i < data.length; i++) {
                                            var aux = data[i];
                                            pointRanking.push([translatePointId(aux.pointid_point), +aux.value])
                                        }

                                        $scope.exampleDataRanking =
                                            [{
                                                "key": "Ranking",
                                                "values": pointRanking
                                            }];
                                    }


                                }).error(function(data, status) {});

                            }).error(function(data, status) {});
                    }).error(function(data, status) {});
            }).error(function(data, status) {
                // $scope.data = data || "Request failed";
                $scope.lastAddedMsg = data || "Request failed";
                $scope.lastAddedMsgStyle = 'color: red;';
            });
    }

    $scope.parseFloat = function(value, steps) {
        return parseFloat(value).toFixed(steps);
    }

    if (sharedCommsService.messageFilter == "updatedFilter") {
        $scope.filterSpec = sharedCommsService.filterSpec;
        $scope.applyFilter(true);
    } else {

        $http.get('/api/dashboard/' + $scope.pid).
        success(function(data, status) {
            $scope.project = data.project;

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });



        // //   // NUNOALEX
        // $scope.exampleDataStacked = [
        //                 {
        //                     "key": "Very Positive",
        //                     "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] ]
        //                 },
        //                 {
        //                     "key": "Positive",
        //                     "values": [ [ 1025409600000 , 0] , [ 1028088000000 , 0] , [ 1030766400000 , 0] , [ 1033358400000 , 0] , [ 1036040400000 , 0] , [ 1038632400000 , 0] , [ 1041310800000 , 0] , [ 1043989200000 , 0] , [ 1046408400000 , 0] , [ 1049086800000 , 0] , [ 1051675200000 , 0] , [ 1054353600000 , 0] , [ 1056945600000 , 0] , [ 1059624000000 , 0] , [ 1062302400000 , 0] , [ 1064894400000 , 0] , [ 1067576400000 , 0] , [ 1070168400000 , 0] , [ 1072846800000 , 0] , [ 1075525200000 , -0.049184266875945] ]
        //                },
        //                {
        //                    "key": "Negative",
        //                    "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] ]
        //                },
        //                {
        //                    "key": "Very Negative",
        //                    "values": [ [ 1025409600000 , -7.0674410638835] , [ 1028088000000 , -14.663359292964] , [ 1030766400000 , -14.104393060540] , [ 1033358400000 , -23.114477037218] , [ 1036040400000 , -16.774256687841] , [ 1038632400000 , -11.902028464000] , [ 1041310800000 , -16.883038668422] , [ 1043989200000 , -19.104223676831] , [ 1046408400000 , -20.420523282736] , [ 1049086800000 , -19.660555051587] , [ 1051675200000 , -13.106911231646] , [ 1054353600000 , -8.2448460302143] , [ 1056945600000 , -7.0313058730976] ]
        //                }
        //            ];


        // ENVIAR:
        // request por wid
        // RECEBER:
        // num de pontos com indicador widget.title
        // value de todos os pontos (para dps aqui fazer a media e mostrar o ranking)
        // history de cada ponto
        // console.log('/api/widgetIndicators/'+$scope.pid+'/'+$scope.wid);
        var query = '/api/widgetIndicators/' + $scope.pid + '/' + $scope.wid;

        if ($scope.pointid != null && $scope.pointid != undefined)
            query += '/' + $scope.pointid;

        $http.get(query).
        success(function(data, status) {

            console.log("/api/widgetIndicators/", data);

            $scope.widget = data.widget;

            if ($scope.widget.hasOwnProperty("date"))
                $scope.widget.date = $scope.widget.date.replace(' 00:00:00:000000', '');

            $scope.indicators = data.indicators;

            for (var i = 0; i < $scope.indicators.length; i++) {
                var ind = $scope.indicators[i];
                if (ind.title == $scope.widget.title)
                    $scope.indicator = ind;
            }

            $scope.categories = [];
            $scope.products = [];
            $scope.prodCatMap = {};

            $http.get('/api/pointsFromWidget/' + $scope.pid + '/' + $scope.wid).
            success(function(data, status) {
                console.log("/api/pointsFromWidget/", data);

                $scope.npsvalues = data.npsvalues;

                // for(var d in data.locations){
                for (var d = 0; d < data.locations.length; d++) {

                    $scope.pointsFilteredBox[data.locations[d].pointid] = true;

                    pointIdAttributes[data.locations[d].pointid] = data.locations[d].attributes;
                    pointIdAttributes[data.locations[d].pointid].type = data.locations[d].type;

                }

                // console.log("max is "+max);
                // processValues(data.ranking);
                processValues(data.ordFiltValues, data.npsvalues, null);
                totalGraphs($scope.widget.title);
                standardError();

            }).
            error(function(data, status) {});

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

    }

    function translatePointId(id) {
        var attrName;

        if (pointIdAttributes == null || pointIdAttributes == undefined) {
            return id;
        }

        if (pointIdAttributes[id].hasOwnProperty("StoreCodeAbbrv")) {
            attrName = "StoreCodeAbbrv";
        } else if (pointIdAttributes[id].hasOwnProperty("name")) {
            attrName = "name";
        } else if (pointIdAttributes[id].hasOwnProperty("PointKey")) {
            attrName = "PointKey";
        } else if (pointIdAttributes[id].hasOwnProperty("Point_Key")) {
            attrName = "Point_Key";
        } else {
            return id;
        }
        return pointIdAttributes[id][attrName];
    }

    function translateFullPointId(id) {
        var attrName;
        if (pointIdAttributes[id].hasOwnProperty("StoreCodeAbbrv")) {
            attrName = "StoreCodeAbbrv";
        } else if (pointIdAttributes[id].hasOwnProperty("name")) {
            attrName = "name";
        } else if (pointIdAttributes[id].hasOwnProperty("PointKey")) {
            attrName = "PointKey";
        } else if (pointIdAttributes[id].hasOwnProperty("Point_Key")) {
            attrName = "Point_Key";
        } else {
            return id;
        }
        return getFullPointData(id)[attrName];
    }

    function getFullPointData(id) {
        return pointIdAttributes[id];
    }



    // $scope.exampleDataRankingMulti = [
    //     {
    //        "key": "Frozen Foods",
    //         "values": [ [ "SP" , 123] , [ "RJ", 155]  ]
    //     },
    //     {
    //         "key": "Snacks",
    //         "values": [ [ "SP" , 223] , [ "RJ", 115]  ]
    //     },
    //     {
    //         "key": "Cereals",
    //         "values": [ [ "SP" , 444] , [ "RJ", 1050]  ]
    //     }
    // ];



    function getLastDate(arr) {

        var lastDate;

        for (var i = 0; i < arr.length; i++) {
            if (lastDate == undefined || lastDate == null)
                lastDate = arr[i][0];
            else {
                if (new Date(arr[i][0]) > new Date(lastDate))
                    lastDate = arr[i][0];
            }
        }

        return lastDate;
    }

    function hasFalseValue(obj) {
        // function to validate if a javascript object has any property with a false value
        // e.g. input for obj = { "prop1" : true, "prop2" : false}
        for (var prop in obj) {
            if (obj[prop] == false)
                return true;
        }
        return false;
    }

    function isFiltering(currFilter) {
        // return false if currFilter has all properties with [] or the filled properties only have { "prop1": true, "prop2": true}
        for (var prop in currFilter) {
            if (currFilter[prop].length == 0)
                continue;
            else {
                if (hasFalseValue(currFilter[prop][0]))
                    return true;
            }
        }
        return false;
    }

    function getLastDateValueFiltered(arr, lastDate, filter, aggrmethod) {

        console.log("getLastDateValueFiltered");

        var accumValue = 0;
        var filteredProducts = [];
        var filteredValues = [];
        var ctr = 0;

        // put all filtered (products) on a simple array ["Chex", "Wheaties"]
        for (var p in filter.products[0]) {
            if (filter.products[0][p] == true)
                filteredProducts.push(p);
        }

        // transverse all readings on arr with date lastDate
        for (var i = 0; i < arr.length; i++) {

            if ($scope.dateFilter.state == true) {
                var reading = arr[i];

                //if( new Date(reading[0]).getTime() == new Date(lastDate).getTime() ){

                filteredValues.push(+reading[1]);

                // if reading has product on simple array, accumulate (dont do that, values already come filtered from Backend API)
                if (aggrmethod != "average") {
                    accumValue += +reading[1];
                } else {
                    ctr++;
                    accumValue = accumValue * (ctr - 1) / ctr + +reading[1] / ctr;
                }
                //}
            } else {
                var reading = arr[i];

                if (lastDate == reading[0]) {
                    filteredValues.push(+reading[1]);

                    // if reading has product on simple array, accumulate (dont do that, values already come filtered from Backend API)
                    if (aggrmethod != "average") {
                        accumValue += +reading[1];
                    } else {
                        ctr++;
                        accumValue = accumValue * (ctr - 1) / ctr + +reading[1] / ctr;
                    }
                }
            }
        }
        // return accumulated value
        return accumValue;
    }

    function processValues(ranking, npsvalues, accRanking) {

        console.log("processValues");

        var chartReadingsArray = [];
        // $scope.indicators.forEach(function(elem);
        dataProductRanking = new Array();

        if (ranking != undefined && ranking != null) {

            for (var i = 0; i < ranking.length; i++) {
                var pointrankingaux = ranking[i];
                dataRanking.push([translatePointId(pointrankingaux.pointid_point), parseFloat(pointrankingaux.valuesjson["f2"].toFixed(2))])
                checkMinimum(parseFloat(+pointrankingaux.valuesjson["f2"]));
                checkMaximum(parseFloat(+pointrankingaux.valuesjson["f2"]));
                $scope.sum += parseFloat(+pointrankingaux.valuesjson["f2"]);
                $scope.nPoints++;
            }

            //var latestDate = ranking[0].ts;

            var objs = {};


            if (selectedAttrs.pointid != undefined)
                $scope.selectedMarkerKey = translatePointId(selectedAttrs.pointid);

            $scope.exampleDataRanking =
                [{
                    "key": "Ranking",
                    "values": dataRanking
                }];
        }

        if (accRanking != null) {
            var objs = {};

            for (var i = 0; i < accRanking.length; i++) {
                objs[accRanking[i].pointid_point] = {};

                objs[accRanking[i].pointid_point].basket = parseFloat(accRanking[i].basket);
                objs[accRanking[i].pointid_point].accMargin = parseFloat(accRanking[i].acc_margin);
                objs[accRanking[i].pointid_point].accBills = parseFloat(accRanking[i].acc_bills);
                objs[accRanking[i].pointid_point].stock = parseFloat(accRanking[i].values);
            }

            for (var obj in objs) {

                var temp = {};
                temp.pointid_point = obj;

                if (isNaN(objs[obj].basket) == false)
                    temp.average = objs[obj].basket;

                if (isNaN(objs[obj].accMargin) == false)
                    temp.average = objs[obj].accMargin;

                if (isNaN(objs[obj].accBills) == false)
                    temp.average = objs[obj].accBills;

                if (isNaN(objs[obj].stock) == false)
                    temp.average = objs[obj].stock;

                orderedPairAdd(dataRanking, [translatePointId(temp.pointid_point), +temp.average], true);
                checkMinimum(parseFloat(+temp.average));
                checkMaximum(parseFloat(+temp.average));
                $scope.sum += parseFloat(+temp.average);
                $scope.nPoints++;
            }

            if (selectedAttrs.pointid != undefined)
                $scope.selectedMarkerKey = translatePointId(selectedAttrs.pointid);

            $scope.exampleDataRanking =
                [{
                    "key": "Ranking",
                    "values": dataRanking
                }];
        }



        // $scope.stackedData = [
        //               {
        //                   "key": "Very Positive",
        //                   "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] ]
        //               },
        //               {
        //                   "key": "Positive",
        //                   "values": [ [ 1025409600000 , 0] , [ 1028088000000 , 0] , [ 1030766400000 , 0] , [ 1033358400000 , 0] , [ 1036040400000 , 0] , [ 1038632400000 , 0] , [ 1041310800000 , 0] , [ 1043989200000 , 0] , [ 1046408400000 , 0] , [ 1049086800000 , 0] , [ 1051675200000 , 0] , [ 1054353600000 , 0] , [ 1056945600000 , 0] , [ 1059624000000 , 0] , [ 1062302400000 , 0] , [ 1064894400000 , 0] , [ 1067576400000 , 0] , [ 1070168400000 , 0] , [ 1072846800000 , 0] , [ 1075525200000 , -0.049184266875945] ]
        //              },
        //              {
        //                  "key": "Negative",
        //                  "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] ]
        //              },
        //              {
        //                  "key": "Very Negative",
        //                  "values": [ [ 1025409600000 , -7.0674410638835] , [ 1028088000000 , -14.663359292964] , [ 1030766400000 , -14.104393060540] , [ 1033358400000 , -23.114477037218] , [ 1036040400000 , -16.774256687841] , [ 1038632400000 , -11.902028464000] , [ 1041310800000 , -16.883038668422] , [ 1043989200000 , -19.104223676831] , [ 1046408400000 , -20.420523282736] , [ 1049086800000 , -19.660555051587] , [ 1051675200000 , -13.106911231646] , [ 1054353600000 , -8.2448460302143] , [ 1056945600000 , -7.0313058730976] ]
        //              }
        //          ];

        // $scope.stackedData = [
        //       {
        //          "key": "Very Negative",
        //          "values": [ [ 1025409600000 , 3] , [ 1028088000000 , 2]  ]
        //      },
        //       {
        //          "key": "Negative",
        //          "values": [ [ 1025409600000 , 0] , [ 1028088000000 , 1]  ]
        //      },
        //       {
        //           "key": "Positive",
        //           "values": [ [ 1025409600000 , 0] , [ 1028088000000 , 0] ]
        //      },
        //       {
        //           "key": "Very Positive",
        //           "values": [ [ 1025409600000 , 8] , [ 1028088000000 , 12]  ]
        //       }
        //  ];


        $scope.stackedData = [{
            "key": "Very Negative",
            "values": []
        }, {
            "key": "Negative",
            "values": []
        }, {
            "key": "Positive",
            "values": []
        }, {
            "key": "Very Positive",
            "values": []
        }];


        for (var j = 0; j < $scope.indicators.length; j++) {
            var elem = $scope.indicators[j];

            // console.log("elem "+j);
            // console.log(elem);

            if (elem.value != undefined && elem.value != null) {

                $scope.unit = elem.unit;

                if (elem.pointid_point != "") {
                    var readingsArray = convertObjectArrayToArrayArray(elem.readingsDoubleArr);
                    var highestDateOnReadings = getLastDate(readingsArray);
                    var comparingDate = new Date(highestDateOnReadings);
                    var filteredDate = new Date($scope.widget.date);

                    if ($scope.dateFilter.state == true)
                        filteredDate = new Date($scope.dateFilter.finishdate);

                    filteredDate.setHours(comparingDate.getHours());

                    // console.log(comparingDate);
                    // console.log( (filteredDate.getTime() == comparingDate.getTime()) );
                    if ($scope.dateFilter.state == true) {
                        if (comparingDate.getTime() <= filteredDate.getTime()) {
                            if ((ranking == undefined || ranking == null) && accRanking == null) {
                                // console.log("Point " + translatePointId(elem.pointid_point) + " Value " + (+elem.value));
                                // console.log("is filtering: "+(isFiltering($scope.filterSpec)) );
                                // if(!isFiltering($scope.filterSpec)){
                                //   orderedPairAdd(dataRanking, [ translatePointId(elem.pointid_point), +elem.value ]);
                                //   checkMinimum(parseFloat(+elem.value).toFixed(2));
                                //   checkMaximum(parseFloat(+elem.value).toFixed(2));
                                //   $scope.sum += parseFloat(+elem.value);
                                // } else {
                                // we need to find the filtered (products, for now) lastDate values
                                var ldValue = getLastDateValueFiltered(readingsArray, highestDateOnReadings, $scope.filterSpec, elem.aggrmethod);
                                orderedPairAdd(dataRanking, [translatePointId(elem.pointid_point), +ldValue], true);
                                checkMinimum(parseFloat(+ldValue));
                                checkMaximum(parseFloat(+ldValue));
                                $scope.sum += parseFloat(+ldValue);
                                // }
                                $scope.nPoints++;
                            }
                        }
                    } else {

                        if (comparingDate.getTime() == filteredDate.getTime()) {
                            if ((ranking == undefined || ranking == null) && accRanking == null) {
                                // console.log("Point " + translatePointId(elem.pointid_point) + " Value " + (+elem.value));
                                // console.log("is filtering: "+(isFiltering($scope.filterSpec)) );
                                // if(!isFiltering($scope.filterSpec)){
                                //   orderedPairAdd(dataRanking, [ translatePointId(elem.pointid_point), +elem.value ]);
                                //   checkMinimum(parseFloat(+elem.value).toFixed(2));
                                //   checkMaximum(parseFloat(+elem.value).toFixed(2));
                                //   $scope.sum += parseFloat(+elem.value);
                                // } else {
                                // we need to find the filtered (products, for now) lastDate values
                                var ldValue = getLastDateValueFiltered(readingsArray, highestDateOnReadings, $scope.filterSpec, elem.aggrmethod);
                                orderedPairAdd(dataRanking, [translatePointId(elem.pointid_point), +ldValue], true);
                                checkMinimum(parseFloat(+ldValue));
                                checkMaximum(parseFloat(+ldValue));
                                $scope.sum += parseFloat(+ldValue);
                                // }
                                $scope.nPoints++;
                            }
                        }
                    }

                    if ((ranking == undefined || ranking == null) && accRanking == null) {
                        $scope.exampleDataRanking = [{
                            "key": "Ranking",
                            "values": dataRanking
                        }];
                    }

                    // $scope.exampleDataRanking = [
                    // {
                    // "key": "Series 1",
                    // "values": [ [ 3 , 88] , [ 8 , 55] , [ 2 , 30] , [ 5 , 20] , [ 10 , 19] , [ 9 , 18]  ]
                    // }
                    // ];



                    // dataCategoryRanking
                    // translatePointId(elem.pointid_point)
                    // console.log(getFullPointData(elem.pointid_point));
                    // console.log(getFullPointData(elem.pointid_point).type);
                    // console.log(getFullPointData(elem.pointid_point)["Store code"]);
                    // console.log("elemo");
                    // console.log(elem);


                    //categoryAdd(dataCategoryRanking, getFullPointData(elem.pointid_point).type, [translateFullPointId(elem.pointid_point), +elem.value]);

                    // para cada ponto
                    // ver todos os pares categoria:valor
                    var catAux = parseCategories(dataCategoryRanking, elem, filteredDate);

                    if ($scope.ordFiltValues == undefined || $scope.ordFiltValues == null || $scope.ordFiltValues.length == 0)
                        var productAux = parseProducts(dataProductRanking, elem);
                    // console.log("Processed categories and products");
                    // console.log(dataCategoryRanking);
                    // console.log(dataProductRanking);

                    //console.log(">>>>> another indicator");

                    var orderedDateAdd = function(arr, pair) {
                        if (arr.length == 0) {
                            arr.push(pair);
                            return;
                        }

                        for (var i = 0; i < arr.length; i++) {
                            var elem = arr[i];

                            var x = new Date(elem[0]);
                            var y = new Date(pair[0]);

                            if (x > y) {
                                arr.splice(i, 0, pair);
                                return;
                            } else {
                                if (i == arr.length - 1) {
                                    arr.push(pair);
                                    return;
                                }
                            }

                        }
                    }

                    if (elem.readingsDoubleArr.length > 0) {
                        var readingsArrayAccum = new Array();
                        for (var k = 0; k < readingsArray.length; k++) {
                            // console.log(readingsArray[k]);
                            // only push if filter allows it!! e.g. if filter has Marco Belinni to false, we shouldnt accumPush it

                            var addedReading = accumPush(readingsArrayAccum, readingsArray[k], "date", elem.aggrmethod, $scope.filterSpec, $scope.widget.date);


                            var satisfLevel = readingsArray[k][2];
                            // console.log(readingsArray[k]);

                            if (addedReading) {
                                for (var l = 0; l < $scope.stackedData.length; l++) {
                                    if ($scope.stackedData[l].key == satisfLevel) {
                                        var updated = false;
                                        for (var m = 0; m < $scope.stackedData[l].values.length; m++) {
                                            // console.log("comparing: "+$scope.stackedData[l].values[m][0]+" with "+readingsArray[k][0]);

                                            // if($scope.stackedData[l].values[m][0] == readingsArray[k][0]){
                                            var x = new Date($scope.stackedData[l].values[m][0]);
                                            var y = new Date(readingsArray[k][0]);
                                            if (x.getTime() === y.getTime()) {
                                                $scope.stackedData[l].values[m][1] += readingsArray[k][1];
                                                updated = true;
                                                // console.log("UPDATE");
                                            }
                                        }
                                        if (!updated) {
                                            // console.log("added");
                                            // $scope.stackedData[l].values.push([readingsArray[k][0], readingsArray[k][1]]);

                                            orderedDateAdd($scope.stackedData[l].values, [readingsArray[k][0], readingsArray[k][1]]);
                                        }
                                    }
                                }
                            }
                        }

                        chartReadingsArray.push({
                            "key": translatePointId(elem.pointid_point),
                            "values": readingsArrayAccum
                        });

                        // console.log("chartReadingsArray");
                        // console.log(chartReadingsArray);
                    }
                }


                // console.log("changed average to "+($scope.sum / $scope.nPoints));
            } else {
                // console.log("NOOO changes on average");
            }

            // $scope.api.refresh();

            if (j == $scope.indicators.length - 1) {
                // // uncomment for updating history chart on modal
                // sharedCommsService.lineChartData.push($scope.exampleDataLarge);
                // sharedCommsService.bufferAndBroadcast("lineChartData");
                $scope.exampleDataRankingMulti = dataCategoryRanking;


                if (dataProductRanking.length == 0 && $scope.ordFiltValues != undefined)
                    parseOrdFiltValues(dataProductRanking, $scope.ordFiltValues, filteredDate, elem.aggrmethod);
                $scope.productsRankingMulti = dataProductRanking;

                //NPS values into $scope.exampleData just for NPS INDEX (HoN) widget (assuming just two points with HoN!!!)
                if ($scope.widget.title == "NPS INDEX (HoN)" && npsvalues != null && npsvalues != undefined) {
                    $scope.exampleData = [];

                    var findPosition = function(arr, translatedPointId) {
                        for (var i = 0; i < arr.length; i++) {
                            if (arr[i].key == translatedPointId) {
                                return i;
                            }
                        }
                        return -1;
                    }

                    for (var i = 0; i < npsvalues.length; i++) {

                        var pos = findPosition($scope.exampleData, translatePointId(npsvalues[i].pointid));
                        // console.log("pos: " + pos + " || pointId: " + translatePointId(npsvalues[i].pointid));

                        if (pos == -1) {
                            $scope.exampleData.push({
                                "key": [],
                                "values": []
                            })
                            pos = $scope.exampleData.length - 1;
                        }

                        $scope.exampleData[pos].key = translatePointId(npsvalues[i].pointid);
                        $scope.exampleData[pos].values.push([new Date(npsvalues[i].dates), Math.round(npsvalues[i].nps), "", "", ""]);

                    }

                    if ($scope.filterSpec.points.length == 1) {
                        if ($scope.exampleData[0].key == translatePointId($scope.filterSpec.points[0]))
                            $scope.exampleData = [$scope.exampleData[0]];
                        else
                            $scope.exampleData = [$scope.exampleData[1]];
                    }
                    console.log($scope.exampleData);

                } else {
                    $scope.exampleData = chartReadingsArray;
                    $scope.exampleDataLarge = chartReadingsArray.slice(0);

                    $scope.chartReadingsArray = chartReadingsArray;

                }


            }
        } // end for cycle

        //console.log("dataRanking", dataRanking);

        // console.log("IM DONE PROCESS");

        //hide history plot inside widget when there's only one date
        for (var i = 0; i < $scope.exampleData.length; i++) {

            if ($scope.exampleData[i].values.length <= 1) {

                $scope.hide = 'display-none';

            }

        }

        //console.log("$scope.stackedData");
        //console.log($scope.stackedData);


        // // $scope.chartClass = 'col-md-6';
        // $scope.chartClass = 'col-md-12';


        // $scope.toggleChartClass = function(){
        //   console.log("toggleChartClass");

        //   if($scope.chartClass == 'col-md-6'){
        //     $scope.chartClass = 'col-md-12';
        //   } else {
        //     $scope.chartClass = 'col-md-6';
        //     $scope.chartHeight = 400;
        //   }
        // }

    } /// end processValues()
    var key;

    function totalGraphs(widget) {

        var widgetTitle = widget;

        var query;

        if (widgetTitle == "Net Sales") {
            query = '/api/totalNetSales/';
            key = "Total of Net Sales";
        }


        if (widgetTitle == "Number of Customers") {
            query = '/api/totalCustomers/';
            key = "Total of Customers";
        }


        if (widgetTitle == "Basket") {
            query = '/api/totalBasket/';
            key = "Total of Basket";
        }


        if (widgetTitle == "Net Margin") {
            query = '/api/totalNetMargin/';
            key = "Total of Net Margin";
        }

        if (widgetTitle == "Multiline Bills") {
            query = '/api/totalMultilineBills/';
            key = "Total of Multiline Bills";
        }

        if (widgetTitle == "Stock Level") {
            query = '/api/totalStockLevel/';
            key = "Total of Stock Level";
        }


        if (query != undefined) {
            $http.post(query + $scope.pid + '/' + $scope.wid, $scope.filterSpec)
                .success(function(data, status) {

                    $scope.dataRankingTotal = data[0];
                    $scope.dataHistoryTotal = data[1];

                    $scope.setSelectedChart('Total History');

                })
                .error(function(data, status) {});
        }
    }

    $scope.changeGraphs = function() {

        if ($scope.graph == "historyStores") {
            $scope.exampleData = $scope.chartReadingsArray;
        } else if ($scope.graph == "historyTotal") {
            $scope.exampleData =
                [{
                    "key": key,
                    "values": $scope.dataHistoryTotal
                }];
        }
    }

    $scope.changeGraphsOld = function(choice) {

        if (choice == "stores") {
            $scope.exampleData = $scope.chartReadingsArray;
        } else if (choice == "total") {
            $scope.exampleData =
                [{
                    "key": key,
                    "values": $scope.dataHistoryTotal
                }];
        }
    }

    function standardError() {
        $http.post('/api/standardError/' + $scope.pid + '/' + $scope.wid, $scope.filterSpec)
            .success(function(data, status) {

                $scope.standardError = data.se;

            })
            .error(function(data, status) {});
    }

    function checkMinimum(val) {
        if ($scope.minimum == null)
            $scope.minimum = +val;
        else {
            if ($scope.minimum > +val)
                $scope.minimum = +val;
        }
    }

    function checkMaximum(val) {
        if ($scope.maximum == null)
            $scope.maximum = +val;
        else {
            if ($scope.maximum < +val)
                $scope.maximum = +val;
        }
    }

    function orderedPairAdd(dataRanking, pair, reverse) {
        if (dataRanking.length == 0) {
            dataRanking.push(pair);
            return;
        }
        for (var i = 0; i < dataRanking.length; i++) {
            var elem = dataRanking[i];
            if (reverse) {
                // console.log("inserting in reverse");
                if (parseFloat(elem[1]) < parseFloat(pair[1])) {
                    dataRanking.splice(i, 0, pair);
                    return;
                } else {
                    if (i == dataRanking.length - 1) {
                        dataRanking.push(pair);
                        return;
                    }
                }

            } else {

                if (parseFloat(elem[1]) > parseFloat(pair[1])) {
                    dataRanking.splice(i, 0, pair);
                    return;
                } else {
                    if (i == dataRanking.length - 1) {
                        dataRanking.push(pair);
                        return;
                    }
                }

            }
        }
    }

    var genProductRankingArray = function(reading) {
        // 
        var arr = new Array();
        var auxArr = new Array();
        auxArr.push(translatePointId(reading.pointid_point));
        auxArr.push(+reading.vl);
        arr.push(auxArr);
        return arr;
    }

    // function to group filtered readings loosenArr to 
    // grouped product objects for display on product ranking chart
    var parseOrdFiltValues = function(groupedArr, loosenArr, filteredDate, aggrmethod) {
        // objective: array with objects of
        // key: string with product name
        // values: array of arrays containing [string, number]
        // of pointShortName (from translatePointId), value

        var filDate = new Date(filteredDate);
        // uncomment line below to show the highest date
        // var filDate = new Date(loosenArr[0].ts);
        var eachProd = {};

        if (aggrmethod == undefined || aggrmethod == null) {
            aggrmethod = 'average';
        }

        for (var i = 0; i < loosenArr.length; i++) {
            var reading = loosenArr[i];
            reading.vl = +reading.vl;
            var auxDate = new Date(reading.ts);
            auxDate.setHours(filDate.getHours());

            if (auxDate.getTime() == filDate.getTime()) {
                if (!eachProd.hasOwnProperty(reading.pr)) {
                    var obj = {};
                    obj.key = reading.pr;
                    obj.values = {};
                    obj.values[reading.pointid_point] = reading;
                    obj.values[reading.pointid_point].vl = +reading.vl;
                    obj.values[reading.pointid_point].count = 1;
                    eachProd[reading.pr] = obj;
                } else {
                    var obj = eachProd[reading.pr];
                    if (!obj.values.hasOwnProperty(reading.pointid_point)) {
                        obj.values[reading.pointid_point] = reading;
                        obj.values[reading.pointid_point].vl = +reading.vl;
                        obj.values[reading.pointid_point].count = 1;
                    } else {
                        // merge
                        obj.values[reading.pointid_point].count++;
                        if (aggrmethod == 'average') {
                            var val = obj.values[reading.pointid_point].vl;
                            obj.values[reading.pointid_point].vl = obj.values[reading.pointid_point].vl * (obj.values[reading.pointid_point].count - 1) / obj.values[reading.pointid_point].count + +reading.vl / obj.values[reading.pointid_point].count;
                            // aux*(ctr-1)/ctr + +readings[i].value/ctr;
                        } else {
                            obj.values[reading.pointid_point].vl += +reading.vl;
                        }
                        // NUNO: we need to calc the running average if this
                        // indicator has aggregation method average!
                    }
                }
            } else {
                // break the loop, the api provided an array ordered by timestamp
                break;
            }
        }
        //onsole.log("eachProd");
        //console.log(eachProd);

        $scope.sumProducts = 0;
        $scope.minProducts;
        $scope.maxProducts;

        for (var prop in eachProd) {
            if (eachProd.hasOwnProperty(prop)) {
                $scope.prodFilters[prop] = true;
                DEFAULT_PROD_FILTER[prop] = true;

                productObjAdd(dataProductRanking, prop, objToArr(eachProd[prop].values));
            }
        }
    }

    function productObjAdd(data, product, elemArr) {
        var catIndex = -1;
        for (var i = 0; i < data.length; i++) {
            var groupElem = data[i];
            if (groupElem.key == product) {
                catIndex = i;
                break;
            }
        }

        if (catIndex == -1) {
            data.push({
                "key": product,
                "values": elemArr
            });
        } else {
            data[catIndex].values.push(elemArr);
            // console.log("Gotta find it and add elemArr to it...");
        }
    }

    function objToArr(obj) {
        console.log("objToArr");
        console.log(obj);
        var arr = new Array();
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                // arr.push([obj[prop].pointid_point, obj[prop].vl]);
                arr.push([translatePointId(obj[prop].pointid_point), obj[prop].vl]);
                // arr.push([translatePointId(prop.pointid_point), vl]);
            }
        }
        return arr;
    }

    function convertObjectArrayToArrayArray(objArr) {
        // var toRet = [];
        // for(var i = 0; i < objArr.length; i++)
        //   toRet.push( [ objArr[i].timestamp , objArr[i].value ] );
        // return toRet;

        var data = objArr;
        var dataAux = [];


        // for(var d in data){
        for (var d = 0; d < data.length; d++) {
            // // // console.log(data[d]);
            if (data[d][1] != null) {
                // var date = new Date(data[d][0]);

                var a = data[d][0].split(/[^0-9]/);
                var date = new Date(a[0], a[1] - 1, a[2]);

                // console.log(data[d][0] + " --- " + date);
                var aux = [date, data[d][1], data[d][2], data[d][3], data[d][4]];
                dataAux.push(aux);


            }
        }
        dataAux.sort(function(a, b) {
            return new Date(a[0]) - new Date(b[0]);
        });
        // console.log('dataAux');
        // console.log(dataAux);

        return dataAux;
    }

    function categoryAdd(data, category, elemArr) {
        // console.log("adding to category "+category+" the element ["+elemArr[0]+", "+elemArr[1]+"]"  );
        var catIndex = -1;
        for (var i = 0; i < data.length; i++) {
            var groupElem = data[i];
            if (groupElem.key == category) {
                catIndex = i;
                break;
            }
        }

        if (catIndex == -1) {
            data.push({
                "key": category,
                "values": [elemArr]
            });
        } else {
            data[catIndex].values.push(elemArr);
            // console.log("Gotta find it and add elemArr to it...");
        }
    }

    function productAdd(data, product, elemArr) {
        var catIndex = -1;
        for (var i = 0; i < data.length; i++) {
            var groupElem = data[i];
            if (groupElem.key == product) {
                catIndex = i;
                break;
            }
        }

        if (catIndex == -1) {
            data.push({
                "key": product,
                "values": [elemArr]
            });
        } else {
            data[catIndex].values.push(elemArr);
            // console.log("Gotta find it and add elemArr to it...");
        }
    }

    function parseProducts(dataProductRanking, elem, filteredDate) {
        var arr = elem.readingsDoubleArr;
        var eachProd = {};

        // console.log(elem);
        var filDate = new Date(filteredDate);

        for (var i = 0; i < arr.length; i++) {
            if (arr[i][2] != null) {
                if (!eachProd.hasOwnProperty(arr[i][3])) {
                    eachProd[arr[i][3]] = arr[i];
                } else {
                    // console.log(eachCat[arr[i][2]]);
                    // console.log(arr[i]);
                    if (new Date(eachProd[arr[i][3]][0]) < new Date(arr[i][0]))
                        eachProd[arr[i][3]] = arr[i];
                }

            }
        }


        $scope.sumProducts = 0;
        $scope.minProducts;
        $scope.maxProducts;

        for (var prop in eachProd) {
            if (eachProd.hasOwnProperty(prop)) {
                $scope.prodFilters[prop] = true;
                DEFAULT_PROD_FILTER[prop] = true;

                var a = $scope.widget.date;
                var b = eachProd[prop][0];

                var aa = new Date(a);
                var bb = new Date(b);

                if ((aa.getDate() == bb.getDate())) {
                    productAdd(dataProductRanking, prop, [translateFullPointId(elem.pointid_point), +eachProd[prop][1]]);
                }

                // category statistics
                $scope.sumProducts += eachProd[prop][1];
                if ($scope.minProducts == undefined)
                    $scope.minProducts = eachProd[prop][1];
                else {
                    if ($scope.minProducts > eachProd[prop][1])
                        $scope.minProducts = eachProd[prop][1];
                }
                if ($scope.maxProducts == undefined)
                    $scope.maxProducts = eachProd[prop][1];
                else {
                    if ($scope.maxProducts < eachProd[prop][1])
                        $scope.maxProducts = eachProd[prop][1];
                }

                if ($scope.products.indexOf(prop) == -1)
                    $scope.products.push(prop);

                // populate the product-category mapping
                if (!$scope.prodCatMap.hasOwnProperty(prop))
                    $scope.prodCatMap[prop] = eachProd[prop][2];
            }
        }

        // console.log("$scope.products");
        // console.log($scope.products);

        if ($scope.products[0] == '' || $scope.products[0] == 'null')
            $scope.realProductsLength = 0;
        else
            $scope.realProductsLength = $scope.products.length;

        // bubble sort the array
        var changed;
        for (var i = 0; i < dataProductRanking.length - 1; i++) {
            changed = false;
            for (var j = 0; j < dataProductRanking.length - 1; j++) {
                if (+dataProductRanking[j].values[0][1] > +dataProductRanking[j + 1].values[0][1]) {
                    changed = true;
                    var temp = dataProductRanking[j];
                    dataProductRanking[j] = dataProductRanking[j + 1];
                    dataProductRanking[j + 1] = temp;
                }
            }
            if (!changed) {
                break;
            }
        }
    }

    function parseCategories(dataCategoryRanking, elem, filteredDate) {
        var arr = elem.readingsDoubleArr;
        var eachCat = {};
        // console.log("widget date is "+$scope.widget.date);

        var filDate = new Date(filteredDate);

        for (var i = 0; i < arr.length; i++) {

            if (arr[i][2] != null) {
                var auxDate = new Date(arr[i][0]);
                auxDate.setHours(filDate.getHours());

                if (!eachCat.hasOwnProperty(arr[i][2])) {


                    if (auxDate.getTime() == filDate.getTime()) {
                        eachCat[arr[i][2]] = arr[i].concat(1);
                    }
                } else {

                    if (auxDate.getTime() == filDate.getTime()) {
                        // console.log("found date: "+arr[i][0]);
                        // console.log("merging");
                        // console.log(arr[i]);
                        // console.log("on existing");
                        // console.log(eachCat[arr[i][2]]);


                        // merge code

                        if (elem.aggrmethod == "average") {
                            var currIndex = +eachCat[arr[i][2]][5] + 1;
                            // console.log("currIndex "+currIndex);
                            // eachCat will have the result of the formula: arr[i][1] = arr[i][1]*(ctr-1)/ctr + +elem[1]/ctr;
                            var lastValue = +eachCat[arr[i][2]][1];
                            var currValue = +arr[i][1];
                            eachCat[arr[i][2]][1] = lastValue * (currIndex - 1) / currIndex + currValue / currIndex;
                            eachCat[arr[i][2]][5] = currIndex;

                        } else {
                            // eachCat will have the sum of both eachCat[arr[i][2]] and arr[i]
                            eachCat[arr[i][2]][1] = +eachCat[arr[i][2]][1] + +arr[i][1];
                        }

                    }


                    // if( new Date(eachCat[arr[i][2]][0]) < new Date(arr[i][0]) ){
                    //   eachCat[arr[i][2]] = arr[i] ;
                    // }
                }
            }

        }

        $scope.sumCategories = 0;
        $scope.minCategories;
        $scope.maxCategories;

        for (var prop in eachCat) {
            if (eachCat.hasOwnProperty(prop)) {
                $scope.catFilters[prop] = true;
                DEFAULT_CAT_FILTER[prop] = true;


                var auxDate = new Date(eachCat[prop][0]);
                auxDate.setHours(filDate.getHours());

                if (filDate.getTime() == auxDate.getTime()) {
                    categoryAdd(dataCategoryRanking, prop, [translateFullPointId(elem.pointid_point), +eachCat[prop][1]]);
                }


                // category statistics
                $scope.sumCategories += eachCat[prop][1];
                if ($scope.minCategories == undefined)
                    $scope.minCategories = eachCat[prop][1];
                else {
                    if ($scope.minCategories > eachCat[prop][1])
                        $scope.minCategories = eachCat[prop][1];
                }
                if ($scope.maxCategories == undefined)
                    $scope.maxCategories = eachCat[prop][1];
                else {
                    if ($scope.maxCategories < eachCat[prop][1])
                        $scope.maxCategories = eachCat[prop][1];
                }

                if ($scope.categories.indexOf(prop) == -1)
                    $scope.categories.push(prop);
            }
        }

        if ($scope.categories[0] == '')
            $scope.realCategoriesLength = 0;
        else
            $scope.realCategoriesLength = $scope.categories.length;

        // bubble sort the array
        var changed;
        for (var i = 0; i < dataCategoryRanking.length - 1; i++) {
            changed = false;
            for (var j = 0; j < dataCategoryRanking.length - 1; j++) {
                if (+dataCategoryRanking[j].values[0][1] > +dataCategoryRanking[j + 1].values[0][1]) {
                    changed = true;
                    var temp = dataCategoryRanking[j];
                    dataCategoryRanking[j] = dataCategoryRanking[j + 1];
                    dataCategoryRanking[j + 1] = temp;
                }
            }
            if (!changed) {
                break;
            }
        }
    }


    // function parseCategories(dataCategoryRanking, elem){
    //   var arr = elem.readingsDoubleArr;
    //   var eachCat = {};

    //   for(var i=0; i<arr.length; i++){
    //     if( !eachCat.hasOwnProperty(arr[i][2]) ){
    //       eachCat[arr[i][2]] = arr[i][1];
    //     } else {
    //       eachCat[arr[i][2]] += arr[i][1];
    //     }
    //   }

    //   return eachCat;
    // }



    // second box: ranking chart

    // var pid = $routeParams.pid;
    // var iid = $routeParams.iid;
    // var parmid = $routeParams.parmid;

    // isto tb vai ser importante para o outro grafico
    $scope.xAxisTickFormatFunction = function() {
        return function(d) {
            return d3.time.format('%b')(new Date(d));
        }
    }

    var colorCategory = d3.scale.category10();
    $scope.colorFunction = function() {
        return function(d, i) {
            return colorCategory(i);
        };
    }

    var colorCategory20 = d3.scale.category20();
    $scope.colorFunction20 = function() {
        return function(d, i) {
            return colorCategory20(i);
        };
    }

    $scope.randomColor = function() {
        var golden_ratio_conjugate = 0.618033988749895;
        var h = Math.random();

        $scope.hue2rgb = function(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        $scope.hslToRgb = function(h, s, l) {
            var r, g, b;

            if (s == 0) {
                r = g = b = l; // achromatic
            } else {


                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = $scope.hue2rgb(p, q, h + 1 / 3);
                g = $scope.hue2rgb(p, q, h);
                b = $scope.hue2rgb(p, q, h - 1 / 3);
            }

            return '#' + Math.round(r * 255).toString(16) + Math.round(g * 255).toString(16) + Math.round(b * 255).toString(16);
        }


        h += golden_ratio_conjugate;
        h %= 1;
        return $scope.hslToRgb(h, 0.5, 0.60);
    }

    var randProductColors = {};

    // this works, but some colors can be quite close to each other...
    // randomColor needs to take into account the colors generated in the past
    $scope.randomInfiniteColorFunction = function() {
        return function(d, i) {
            var key = d.key;
            if (key == undefined) {
                key = d[0];
                if (key == undefined) {
                    return colorCategory(i);
                }
            }

            if (!randProductColors.hasOwnProperty(key)) {
                randProductColors[key] = $scope.randomColor();
            }

            return randProductColors[key];
            // return colorCategory(i);
        };
    }

    $scope.happyOrNotColorFunction = function() {
        return function(d, i) {
            var key = d.key;
            if (key == undefined) {
                key = d[0];
                if (key == undefined) {
                    return colorCategory(i);
                }
            }
            if (key == 'Very Positive')
                return 'rgb(106, 200, 50)';
            if (key == 'Positive')
                return 'rgb(178, 211, 156)';
            if (key == 'Negative')
                return 'rgb(240, 155, 141)';
            if (key == 'Very Negative')
                return 'rgb(240, 69, 77)';


            return colorCategory(i);
        }
    }

    var colors = {};
    var colorCount = 0;

    $scope.catColorFunction = function() {
        return function(d, i) {
            // console.log("d for i:"+i);
            // console.log(d);
            // console.log(d.key);

            var key = d.key;
            if (key == undefined) {
                key = d[0];
                if (key == undefined) {
                    return colorCategory(i);
                }
            }

            if (key == 'Very Positive')
                return 'rgb(106, 200, 50)';
            if (key == 'Positive')
                return 'rgb(178, 211, 156)';
            if (key == 'Negative')
                return 'rgb(240, 155, 141)';
            if (key == 'Very Negative')
                return 'rgb(240, 69, 77)';

            if (!colors.hasOwnProperty(key)) {
                colors[key] = colorCount;
                colorCount++;
            }

            // console.log(colors);

            return colorCategory(colors[key]);
        };
    }

    function testNameToSelectedAttributes(name) {
        if ($scope.selectedAttrs.hasOwnProperty("StoreCodeAbbrv")) {
            if (name == $scope.selectedAttrs.StoreCodeAbbrv)
                return true;
        }
        if ($scope.selectedAttrs.hasOwnProperty("name")) {
            if (name == $scope.selectedAttrs.name)
                return true;
        }
        if ($scope.selectedAttrs.hasOwnProperty("PointKey")) {
            if (name == $scope.selectedAttrs.PointKey)
                return true;
        }
        if ($scope.selectedAttrs.hasOwnProperty("Point_Key")) {
            if (name == $scope.selectedAttrs.Point_Key)
                return true;
        }
        if ($scope.selectedAttrs.hasOwnProperty("reservedPointId")) {
            if (name == $scope.selectedAttrs.reservedPointId)
                return true;
        }
        return false;
    }

    $scope.pointSelectedFunction = function() {
        return function(d, i) {
            var key = d.key;
            if (key == undefined) {
                key = d[0];
                if (key == undefined) {
                    return colorCategory(i);
                }
            }

            // $scope.selectedAttrs = selectedAttrs;

            // if(testNameToSelectedAttributes(key)){
            //   return '#f0ad4e'
            // } else {
            //   return '#666666'
            // }

            if (key == $scope.selectedMarkerKey) {
                return '#f0ad4e'
            } else {
                return '#666666'
            }

        }
    }

    // TODO: NB - we need to make this function for product colors...
    $scope.prodColorFunction = function() {



        return function(d, i) {
            // console.log("d for i:"+i);
            // console.log(d);
            // console.log(d.key);

            var key = d.key;
            if (key == undefined) {
                key = d[0];
                if (key == undefined) {
                    return colorCategory(i);
                }
            }

            key = $scope.prodCatMap[key];
            // console.log("key is "+key);

            if (!colors.hasOwnProperty(key)) {
                colors[key] = colorCount;
                colorCount++;
            }

            // console.log(colors);

            return colorCategory(colors[key]);
        };
    }

    // $scope.exampleDataRanking = [
    // {
    // "key": "Series 1",
    // "values": [ [ 3 , 88] , [ 8 , 55] , [ 2 , 30] , [ 5 , 20] , [ 10 , 19] , [ 9 , 18]  ]
    // }
    // ];
    $scope.exampleDataRanking = [];

    // $http.get('/api/orderedPointValuesOfParameter/'+pid+'/'+iid+'/'+parmid).
    //   success(function(data, status){
    //     // // // console.log("read ordered pointvalues");
    //     // // // console.log(data);
    //     $scope.exampleDataRanking = [
    //       {
    //       "key": "Series 1",
    //       "values": data.ranking
    //       }
    //       ];
    //   }).
    //   error(function(data, status){});



    // third box: all points history chart


    $scope.xAxisTickFormatFunction = function() {
        // return function(d){
        //     return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
        // }
        return function(d) {
            // return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
            return d3.time.format("%Y-%m-%d")(new Date(d));
        }
    }

    $scope.exampleData = [];

    // $scope.exampleData = [
    //     {
    //         "key": "Series 1",
    //         "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] , [ 1059624000000 , 11.341210982529] , [ 1062302400000 , 14.734820409020] , [ 1064894400000 , 12.387148007542] , [ 1067576400000 , 18.436471461827] , [ 1070168400000 , 19.830742266977] , [ 1072846800000 , 22.643205829887] , [ 1075525200000 , 26.743156781239] , [ 1078030800000 , 29.597478802228] , [ 1080709200000 , 30.831697585341] , [ 1083297600000 , 28.054068024708] , [ 1085976000000 , 29.294079423832] , [ 1088568000000 , 30.269264061274] , [ 1091246400000 , 24.934526898906] , [ 1093924800000 , 24.265982759406] , [ 1096516800000 , 27.217794897473] , [ 1099195200000 , 30.802601992077] , [ 1101790800000 , 36.331003758254] , [ 1104469200000 , 43.142498700060] , [ 1107147600000 , 40.558263931958] , [ 1109566800000 , 42.543622385800] , [ 1112245200000 , 41.683584710331] , [ 1114833600000 , 36.375367302328] , [ 1117512000000 , 40.719688980730] , [ 1120104000000 , 43.897963036919] , [ 1122782400000 , 49.797033975368] , [ 1125460800000 , 47.085993935989] , [ 1128052800000 , 46.601972859745] , [ 1130734800000 , 41.567784572762] , [ 1133326800000 , 47.296923737245] , [ 1136005200000 , 47.642969612080] , [ 1138683600000 , 50.781515820954] , [ 1141102800000 , 52.600229204305] , [ 1143781200000 , 55.599684490628] , [ 1146369600000 , 57.920388436633] , [ 1149048000000 , 53.503593218971] , [ 1151640000000 , 53.522973979964] , [ 1154318400000 , 49.846822298548] , [ 1156996800000 , 54.721341614650] , [ 1159588800000 , 58.186236223191] , [ 1162270800000 , 63.908065540997] , [ 1164862800000 , 69.767285129367] , [ 1167541200000 , 72.534013373592] , [ 1170219600000 , 77.991819436573] , [ 1172638800000 , 78.143584404990] , [ 1175313600000 , 83.702398665233] , [ 1177905600000 , 91.140859312418] , [ 1180584000000 , 98.590960607028] , [ 1183176000000 , 96.245634754228] , [ 1185854400000 , 92.326364432615] , [ 1188532800000 , 97.068765332230] , [ 1191124800000 , 105.81025556260] , [ 1193803200000 , 114.38348777791] , [ 1196398800000 , 103.59604949810] , [ 1199077200000 , 101.72488429307] , [ 1201755600000 , 89.840147735028] , [ 1204261200000 , 86.963597532664] , [ 1206936000000 , 84.075505208491] , [ 1209528000000 , 93.170105645831] , [ 1212206400000 , 103.62838083121] , [ 1214798400000 , 87.458241365091] , [ 1217476800000 , 85.808374141319] , [ 1220155200000 , 93.158054469193] , [ 1222747200000 , 65.973252382360] , [ 1225425600000 , 44.580686638224] , [ 1228021200000 , 36.418977140128] , [ 1230699600000 , 38.727678144761] , [ 1233378000000 , 36.692674173387] , [ 1235797200000 , 30.033022809480] , [ 1238472000000 , 36.707532162718] , [ 1241064000000 , 52.191457688389] , [ 1243742400000 , 56.357883979735] , [ 1246334400000 , 57.629002180305] , [ 1249012800000 , 66.650985790166] , [ 1251691200000 , 70.839243432186] , [ 1254283200000 , 78.731998491499] , [ 1256961600000 , 72.375528540349] , [ 1259557200000 , 81.738387881630] , [ 1262235600000 , 87.539792394232] , [ 1264914000000 , 84.320762662273] , [ 1267333200000 , 90.621278391889] , [ 1270008000000 , 102.47144881651] , [ 1272600000000 , 102.79320353429] , [ 1275278400000 , 90.529736050479] , [ 1277870400000 , 76.580859994531] , [ 1280548800000 , 86.548979376972] , [ 1283227200000 , 81.879653334089] , [ 1285819200000 , 101.72550015956] , [ 1288497600000 , 107.97964852260] , [ 1291093200000 , 106.16240630785] , [ 1293771600000 , 114.84268599533] , [ 1296450000000 , 121.60793322282] , [ 1298869200000 , 133.41437346605] , [ 1301544000000 , 125.46646042904] , [ 1304136000000 , 129.76784954301] , [ 1306814400000 , 128.15798861044] , [ 1309406400000 , 121.92388706072] , [ 1312084800000 , 116.70036100870] , [ 1314763200000 , 88.367701837033] , [ 1317355200000 , 59.159665765725] , [ 1320033600000 , 79.793568139753] , [ 1322629200000 , 75.903834028417] , [ 1325307600000 , 72.704218209157] , [ 1327986000000 , 84.936990804097] , [ 1330491600000 , 93.388148670744]]
    //     }
    // ];



    // $scope.exampleDataCumulative = [
    //   {
    //     key: "Cumulative Return",
    //     values: [
    //         ["A", -29.765957771107 ],
    //         ["B" , 0 ],
    //         ["C" , 32.807804682612 ],
    //         ["D" , 196.45946739256 ],
    //         ["E" , 0.19434030906893 ],
    //         ["F" , -98.079782601442 ],
    //         ["G" , -13.925743130903 ],
    //         ["H" , -5.1387322875705 ]
    //         ]
    //   }
    // ];

    // $scope.exampleDataLines = [
    // {
    //     "key": "Series 1",
    //     "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] , [ 1059624000000 , 11.341210982529] , [ 1062302400000 , 14.734820409020] , [ 1064894400000 , 12.387148007542] , [ 1067576400000 , 18.436471461827] , [ 1070168400000 , 19.830742266977] , [ 1072846800000 , 22.643205829887] , [ 1075525200000 , 26.743156781239] , [ 1078030800000 , 29.597478802228] , [ 1080709200000 , 30.831697585341] , [ 1083297600000 , 28.054068024708] , [ 1085976000000 , 29.294079423832] , [ 1088568000000 , 30.269264061274] , [ 1091246400000 , 24.934526898906] , [ 1093924800000 , 24.265982759406] , [ 1096516800000 , 27.217794897473] , [ 1099195200000 , 30.802601992077] , [ 1101790800000 , 36.331003758254] , [ 1104469200000 , 43.142498700060] , [ 1107147600000 , 40.558263931958] , [ 1109566800000 , 42.543622385800] , [ 1112245200000 , 41.683584710331] , [ 1114833600000 , 36.375367302328] , [ 1117512000000 , 40.719688980730] , [ 1120104000000 , 43.897963036919] , [ 1122782400000 , 49.797033975368] , [ 1125460800000 , 47.085993935989] , [ 1128052800000 , 46.601972859745] , [ 1130734800000 , 41.567784572762] , [ 1133326800000 , 47.296923737245] , [ 1136005200000 , 47.642969612080] , [ 1138683600000 , 50.781515820954] , [ 1141102800000 , 52.600229204305] , [ 1143781200000 , 55.599684490628] , [ 1146369600000 , 57.920388436633] , [ 1149048000000 , 53.503593218971] , [ 1151640000000 , 53.522973979964] , [ 1154318400000 , 49.846822298548] , [ 1156996800000 , 54.721341614650] , [ 1159588800000 , 58.186236223191] , [ 1162270800000 , 63.908065540997] , [ 1164862800000 , 69.767285129367] , [ 1167541200000 , 72.534013373592] , [ 1170219600000 , 77.991819436573] , [ 1172638800000 , 78.143584404990] , [ 1175313600000 , 83.702398665233] , [ 1177905600000 , 91.140859312418] , [ 1180584000000 , 98.590960607028] , [ 1183176000000 , 96.245634754228] , [ 1185854400000 , 92.326364432615] , [ 1188532800000 , 97.068765332230] , [ 1191124800000 , 105.81025556260] , [ 1193803200000 , 114.38348777791] , [ 1196398800000 , 103.59604949810] , [ 1199077200000 , 101.72488429307] , [ 1201755600000 , 89.840147735028] , [ 1204261200000 , 86.963597532664] , [ 1206936000000 , 84.075505208491] , [ 1209528000000 , 93.170105645831] , [ 1212206400000 , 103.62838083121] , [ 1214798400000 , 87.458241365091] , [ 1217476800000 , 85.808374141319] , [ 1220155200000 , 93.158054469193] , [ 1222747200000 , 65.973252382360] , [ 1225425600000 , 44.580686638224] , [ 1228021200000 , 36.418977140128] , [ 1230699600000 , 38.727678144761] , [ 1233378000000 , 36.692674173387] , [ 1235797200000 , 30.033022809480] , [ 1238472000000 , 36.707532162718] , [ 1241064000000 , 52.191457688389] , [ 1243742400000 , 56.357883979735] , [ 1246334400000 , 57.629002180305] , [ 1249012800000 , 66.650985790166] , [ 1251691200000 , 70.839243432186] , [ 1254283200000 , 78.731998491499] , [ 1256961600000 , 72.375528540349] , [ 1259557200000 , 81.738387881630] , [ 1262235600000 , 87.539792394232] , [ 1264914000000 , 84.320762662273] , [ 1267333200000 , 90.621278391889] , [ 1270008000000 , 102.47144881651] , [ 1272600000000 , 102.79320353429] , [ 1275278400000 , 90.529736050479] , [ 1277870400000 , 76.580859994531] , [ 1280548800000 , 86.548979376972] , [ 1283227200000 , 81.879653334089] , [ 1285819200000 , 101.72550015956] , [ 1288497600000 , 107.97964852260] , [ 1291093200000 , 106.16240630785] , [ 1293771600000 , 114.84268599533] , [ 1296450000000 , 121.60793322282] , [ 1298869200000 , 133.41437346605] , [ 1301544000000 , 125.46646042904] , [ 1304136000000 , 129.76784954301] , [ 1306814400000 , 128.15798861044] , [ 1309406400000 , 121.92388706072] , [ 1312084800000 , 116.70036100870] , [ 1314763200000 , 88.367701837033] , [ 1317355200000 , 59.159665765725] , [ 1320033600000 , 79.793568139753] , [ 1322629200000 , 75.903834028417] , [ 1325307600000 , 72.704218209157] , [ 1327986000000 , 84.936990804097] , [ 1330491600000 , 93.388148670744]]
    // },
    // {
    //     "key": "Series 2",
    //     "area": true,
    //     "values": [ [ 1025409600000 , 4] , [ 1028088000000 , 8] , [ 1030766400000 , 10] , [ 1033358400000 , 14] , [ 1036040400000 , 3] , [ 1038632400000 , 9] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] , [ 1059624000000 , 11.341210982529] , [ 1062302400000 , 14.734820409020] , [ 1064894400000 , 12.387148007542] , [ 1067576400000 , 18.436471461827] , [ 1070168400000 , 19.830742266977] , [ 1072846800000 , 22.643205829887] , [ 1075525200000 , 26.743156781239] , [ 1078030800000 , 29.597478802228] , [ 1080709200000 , 30.831697585341] , [ 1083297600000 , 28.054068024708] , [ 1085976000000 , 29.294079423832] , [ 1088568000000 , 30.269264061274] , [ 1091246400000 , 24.934526898906] , [ 1093924800000 , 24.265982759406] , [ 1096516800000 , 27.217794897473] , [ 1099195200000 , 30.802601992077] , [ 1101790800000 , 36.331003758254] , [ 1104469200000 , 43.142498700060] , [ 1107147600000 , 40.558263931958] , [ 1109566800000 , 42.543622385800] , [ 1112245200000 , 41.683584710331] , [ 1114833600000 , 36.375367302328] , [ 1117512000000 , 40.719688980730] , [ 1120104000000 , 43.897963036919] , [ 1122782400000 , 49.797033975368] , [ 1125460800000 , 47.085993935989] , [ 1128052800000 , 46.601972859745] , [ 1130734800000 , 41.567784572762] , [ 1133326800000 , 47.296923737245] , [ 1136005200000 , 47.642969612080] , [ 1138683600000 , 50.781515820954] , [ 1141102800000 , 52.600229204305] , [ 1143781200000 , 55.599684490628] , [ 1146369600000 , 57.920388436633] , [ 1149048000000 , 53.503593218971] , [ 1151640000000 , 53.522973979964] , [ 1154318400000 , 49.846822298548] , [ 1156996800000 , 54.721341614650] , [ 1159588800000 , 58.186236223191] , [ 1162270800000 , 63.908065540997] , [ 1164862800000 , 69.767285129367] , [ 1167541200000 , 72.534013373592] , [ 1170219600000 , 77.991819436573] , [ 1172638800000 , 78.143584404990] , [ 1175313600000 , 83.702398665233] , [ 1177905600000 , 91.140859312418] , [ 1180584000000 , 98.590960607028] , [ 1183176000000 , 96.245634754228] , [ 1185854400000 , 92.326364432615] , [ 1188532800000 , 97.068765332230] , [ 1191124800000 , 105.81025556260] , [ 1193803200000 , 114.38348777791] , [ 1196398800000 , 103.59604949810] , [ 1199077200000 , 101.72488429307] , [ 1201755600000 , 89.840147735028] , [ 1204261200000 , 86.963597532664] , [ 1206936000000 , 84.075505208491] , [ 1209528000000 , 93.170105645831] , [ 1212206400000 , 103.62838083121] , [ 1214798400000 , 87.458241365091] , [ 1217476800000 , 85.808374141319] , [ 1220155200000 , 93.158054469193] , [ 1222747200000 , 65.973252382360] , [ 1225425600000 , 44.580686638224] , [ 1228021200000 , 36.418977140128] , [ 1230699600000 , 38.727678144761] , [ 1233378000000 , 36.692674173387] , [ 1235797200000 , 30.033022809480] , [ 1238472000000 , 36.707532162718] , [ 1241064000000 , 52.191457688389] , [ 1243742400000 , 56.357883979735] , [ 1246334400000 , 57.629002180305] , [ 1249012800000 , 66.650985790166] , [ 1251691200000 , 70.839243432186] , [ 1254283200000 , 78.731998491499] , [ 1256961600000 , 72.375528540349] , [ 1259557200000 , 81.738387881630] , [ 1262235600000 , 87.539792394232] , [ 1264914000000 , 84.320762662273] , [ 1267333200000 , 90.621278391889] , [ 1270008000000 , 102.47144881651] , [ 1272600000000 , 102.79320353429] , [ 1275278400000 , 90.529736050479] , [ 1277870400000 , 76.580859994531] , [ 1280548800000 , 86.548979376972] , [ 1283227200000 , 81.879653334089] , [ 1285819200000 , 101.72550015956] , [ 1288497600000 , 107.97964852260] , [ 1291093200000 , 106.16240630785] , [ 1293771600000 , 114.84268599533] , [ 1296450000000 , 121.60793322282] , [ 1298869200000 , 133.41437346605] , [ 1301544000000 , 125.46646042904] , [ 1304136000000 , 129.76784954301] , [ 1306814400000 , 128.15798861044] , [ 1309406400000 , 87.92388706072] , [ 1312084800000 , 35.70036100870] , [ 1314763200000 , 78.367701837033] , [ 1317355200000 , 29.159665765725] , [ 1320033600000 , 39.793568139753] , [ 1322629200000 , 75.903834028417] , [ 1325307600000 , 72.704218209157] , [ 1327986000000 , 84.936990804097] , [ 1330491600000 , 93.388148670744]]
    // }];

    var filterArray = ["cal", "place", "cat", "prod"];
    var filterBoxArray = [];
    var onFilterArray = [];

    $scope.filterBoxClassInnerCal = "display-none";
    $scope.filterBoxClassInnerPlace = "display-none";
    $scope.filterBoxClassInnerCat = "display-none";
    $scope.filterBoxClassInnerProd = "display-none";


    $scope.iconCal = "";
    $scope.iconPoint = "";
    $scope.iconCat = "";
    $scope.iconProd = "";

    $scope.filterBoxClass = "display-none";
    $scope.filterBoxClassInner = "display-none";
    $scope.filterBoxIcon = "fa-sort-desc";
    $scope.filterCurrDateMessage = "";
    $scope.filterCurrCategoryMessage = "";
    $scope.filterCurrProductMessage = "";
    $scope.filterCurrPointMessage = "";


    $scope.catFilter = {};
    $scope.catFilter.state = false;
    // $scope.catFilters = {}; // beginning of controller
    $scope.prodFilter = {};
    $scope.prodFilter.state = false;

    $scope.pointFilter = {};
    $scope.pointFilter.state = false;


    $scope.toggleClassCat = 'disablePointerCursor';
    $scope.toggleClassProd = 'disablePointerCursor';
    $scope.toggleClassPoints = 'disablePointerCursor';
    $scope.toggleClassDate = 'disablePointerCursor';

    var filteredCats = 0;
    var totalCats = 0;

    var filteredPoints = 0;
    var totalPoints = 0;

    var filteredProds = 0;
    var totalProds = 0;
    // $scope.prodFilters = {}; // beginning of controller

    $scope.applyFilterButtonText = 'Apply Filter';
    $scope.applyFilterButtonDisabled = false;


    // IR used to get size of Object to hide/show category and product filter
    $scope.Objectsize = function(obj) {
        var size = 0,
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    var k;

    $scope.filterBoxFunction = function(z) {

        if (($scope.filterBoxClassInner == "display-block" && k == z) || z == 'apply') hideFilter();
        else showFilter();

        function hideFilter() {
            $scope.filterBoxClassInner = "display-none";

            if ($scope.filterCurrDateMessage == "" && $scope.filterCurrCategoryMessage == "" && $scope.filterCurrPointMessage == "" && $scope.filterCurrProductMessage == "") {
                $scope.filterBoxClass = "display-none";

                $scope.iconCal = "";
                $scope.iconPoint = "";
                $scope.iconCat = "";
                $scope.iconProd = "";
            } else {
                if ($scope.filterCurrDateMessage != "") $scope.iconCal = "filter-active";
                else $scope.iconCal = "";

                if ($scope.filterCurrCategoryMessage != "") $scope.iconCat = "filter-active";
                else $scope.iconCat = "";

                if ($scope.filterCurrPointMessage != "") $scope.iconPoint = "filter-active";
                else $scope.iconPoint = "";

                if ($scope.filterCurrProductMessage != "") $scope.iconProd = "filter-active";
                else $scope.iconProd = "";
            }
        }

        function showFilter() {
            for (var i = 0; i < 4; i++) {
                if (filterArray[i] == z) {
                    filterBoxArray[i] = "display-block";
                    onFilterArray[i] = "on-filter";
                    k = z;
                } else {
                    filterBoxArray[i] = "display-none";
                    onFilterArray[i] = "";
                }
            }

            $scope.iconCal = onFilterArray[0];
            $scope.iconPoint = onFilterArray[1];
            $scope.iconCat = onFilterArray[2];
            $scope.iconProd = onFilterArray[3];

            $scope.filterBoxClassInnerCal = filterBoxArray[0];
            $scope.filterBoxClassInnerPlace = filterBoxArray[1];
            $scope.filterBoxClassInnerCat = filterBoxArray[2];
            $scope.filterBoxClassInnerProd = filterBoxArray[3];

            if ($scope.filterCurrDateMessage != "" && onFilterArray[0] == "") $scope.iconCal = "filter-active";
            if ($scope.filterCurrCategoryMessage != "" && onFilterArray[2] == "") $scope.iconCat = "filter-active";
            if ($scope.filterCurrPointMessage != "" && onFilterArray[1] == "") $scope.iconPoint = "filter-active";
            if ($scope.filterCurrProductMessage != "" && onFilterArray[3] == "") $scope.iconProd = "filter-active";


            // if($scope.filterCurrMessage == "")
            $scope.filterBoxClass = "display-block";
            $scope.filterBoxClassInner = "display-block";
        }

    }

    $scope.clearFilter = function() {

        //  $scope.procDateFilter(false,true);
        $scope.procPointsFilter(false);
        //$scope.procCategoryFilter(false);
        //$scope.procProductFilter(false);
    }

    $scope.procCategoryFilter = function(forceState) {
        $scope.catFilter.state = forceState;

        if ($scope.catFilter.state) {
            $scope.filterCurrCategoryMessage = "Category filter is active (" + (totalCats - filteredCats) + " of total " + totalCats + " categories)";
            $scope.toggleClassCat = 'state-success';
            $scope.applyFilter(true);
        } else {
            $scope.filterCurrCategoryMessage = "";

            // $scope.filterSpec = DEFAULT_FILTER;
            // do a reset filter instead (put all found fields to true)
            resetFilterSpec('categories');

            $scope.toggleClassCat = 'disablePointerCursor';
            $scope.catFilters = DEFAULT_CAT_FILTER;
            console.log($scope.catFilters);
            $scope.applyFilter(true);
        }

        // $scope.catFilter = !$scope.catFilter;
        // console.log("procCategoryFilter has "+$scope.catFilter);
        // if($scope.catFilter){
        //   $scope.filterCurrMessage = "Category filter is active";
        // } else {
        //   $scope.filterCurrMessage = "";
        // }
    }

    $scope.toggleCatFilter = function() {
        // console.log("changed ");


        $scope.filterSpec.categories[0] = $scope.catFilters;
        console.log($scope.catFilters);

        var foundFalse = false;
        filteredCats = 0;
        totalCats = 0;
        for (var p in $scope.catFilters) {
            totalCats++;
            if ($scope.catFilters[p] == false) {
                foundFalse = true;
                filteredCats++;
            }
        }
        if (foundFalse)
            $scope.procCategoryFilter(true);
        else
            $scope.procCategoryFilter(false);
    }

    function resetFilterSpec(filterType) {
        // NUNOALEX this is not supporting the circle filter pointid array
        //$scope.filterSpec
        console.log("resetFilterSpec");
        for (var c in $scope.filterSpec) {
            // if c == argument
            // console.log(message);
            if (filterType == 'points') {
                initFilteredPoints(true);

            }
            /*      else if(filterType == 'dates'){
                      $scope.filterSpec.dates.startdate = ""
                      $scope.filterSpec.dates.finishdate = ""
                  }*/
            else {
                if (c == filterType && $scope.filterSpec[c].length > 0) {
                    for (var prop in $scope.filterSpec[c][0])
                        $scope.filterSpec[c][0][prop] = true;
                }

            }

        }

    }

    $scope.procProductFilter = function(forceState) {
        // if(forceState != undefined)
        $scope.prodFilter.state = forceState;
        // else {
        //   if($scope.prodFilter.state)
        //     $scope.prodFilter.state = false;
        //   else
        //     $scope.prodFilter.state = true;
        // }

        $scope.prodFilter.state = forceState;

        console.log("procProductFilter has " + $scope.prodFilter.state);
        if ($scope.prodFilter.state) {
            $scope.filterCurrProductMessage = "Product filter is active (" + (totalProds - filteredProds) + " of total " + totalProds + " products)";
            $scope.toggleClassProd = 'state-success';
        } else {
            $scope.filterCurrProductMessage = "";

            // $scope.filterSpec = DEFAULT_FILTER;
            // do a reset filter instead (put all found fields to true)
            resetFilterSpec('products');

            $scope.toggleClassProd = 'disablePointerCursor';
            $scope.prodFilters = DEFAULT_PROD_FILTER;
            console.log($scope.prodFilters);
        }

        $scope.applyFilter(true);
    }

    $scope.toggleProdFilter = function() {
        // console.log("changed ");

        console.log("toggleProdFilter");

        $scope.filterSpec.products[0] = $scope.prodFilters;
        console.log($scope.prodFilters);

        var foundFalse = false;
        filteredProds = 0;
        totalProds = 0;
        for (var p in $scope.prodFilters) {
            totalProds++;
            if ($scope.prodFilters[p] == false) {
                foundFalse = true;
                filteredProds++;
            }
        }

        if (foundFalse) $scope.procProductFilter(true);
        else $scope.procProductFilter(false);
    }

    //$scope.toggleAll = "Unselect All";
    //$scope.check = "checked";

    $scope.procPointsFilter = function(forceState) {

        console.log("procPointsFilter");

        $scope.pointFilter.state = forceState;

        if ($scope.pointFilter.state) {
            $scope.filterCurrPointMessage = "Points filter is active (" + (totalPoints - filteredPoints) + " of total " + totalPoints + " points)";
            $scope.toggleClassPoints = 'state-success';
            $scope.applyFilter(true);

        } else {

            $scope.filterCurrPointMessage = "";

            // do a reset filter instead (put all found fields to true)
            resetFilterSpec('points');

            $scope.toggleClassPoints = 'disablePointerCursor';

            $scope.applyFilter(true);

            //$scope.toggleAll = "Unselect All";
            $scope.check = "checked";

        }
    }

    $scope.togglePointsFilter = function() {

        console.log("togglePointsFilter");

        // $scope.filterSpec.points[0] = $scope.pointsFilteredBox;

        var foundFalse = false;
        filteredPoints = 0;
        totalPoints = 0

        for (var p in $scope.pointsFilteredBox) {
            totalPoints++;

            if ($scope.pointsFilteredBox[p] == false) {
                foundFalse = true;
                filteredPoints++;
            }
        }

        if (foundFalse) $scope.procPointsFilter(true);
        else $scope.procPointsFilter(false);
    }

    /*$scope.togglePointsFilterAll = function(){
          
          if($scope.check == "checked")
          {
              for(var p in $scope.pointsFilteredBox)
              {
                  $scope.pointsFilteredBox[p] = false;
              }

              $scope.toggleAll = "Select All";
              $scope.check = "";
              $scope.togglePointsFilter();
          }
          
          else
          {
              for(var p in $scope.pointsFilteredBox)
              {
                  $scope.pointsFilteredBox[p] = true;
              }

              $scope.toggleAll = "Unselect All";
              $scope.check = "checked";
              $scope.togglePointsFilter();
          }
      }*/

    $scope.dateFilter = {};
    $scope.dateFilter.state = false;
    $scope.dateFilter.startdate = "";
    $scope.dateFilter.finishdate = "";

    $scope.procDateFilter = function(forceState, btn) {

        console.log("procDateFilter");

        $scope.dateFilter.state = forceState;

        console.log("procDateFilter has " + $scope.dateFilter.state);

        if ($scope.dateFilter.state) {

            $scope.filterCurrDateMessage = "Dates filter is active from " + $scope.filterSpec.dates.startdate + " to " + $scope.filterSpec.dates.finishdate;
            $scope.toggleClassDate = 'state-success';

            $scope.datepickerStart = false;
            $scope.datepickerEnd = false;
            sharedCommsService.messageFilter == "updatedFilter";
            $scope.applyFilter(true);
        } else {
            $scope.filterCurrDateMessage = "";

            // $scope.filterSpec = DEFAULT_FILTER;
            // do a reset filter instead (put all found fields to true)
            resetFilterSpec('dates');
            $scope.toggleClassDate = 'disablePointerCursor';
            console.log($scope.dateFilter);
            $scope.hide = "";
            sharedCommsService.messageFilter == "updatedFilter"
            $scope.applyFilter(true);

            if (btn == true) {
                $scope.dateFilter.startdate = "";
                $scope.dateFilter.finishdate = "";
                //$scope.selectedPreDate = 'lastSample'; 
            }
        }
    }

    $scope.datepickerStart = false;
    $scope.datepickerEnd = false;

    $scope.toggleDatepickerStart = function() {
        if ($scope.datepickerStart == false && $scope.datepickerEnd == true) {
            $scope.datepickerStart = true;
            $scope.datepickerEnd = false;

        } else if ($scope.datepickerStart == false)
            $scope.datepickerStart = true

        else
            $scope.datepickerStart = false;
    }

    $scope.toggleDatepickerEnd = function() {

        if ($scope.datepickerEnd == false && $scope.datepickerStart == true) {
            $scope.datepickerStart = false;
            $scope.datepickerEnd = true;

        } else if ($scope.datepickerEnd == false)
            $scope.datepickerEnd = true

        else
            $scope.datepickerEnd = false;
    }

    $scope.toggleDateFilter = function() {
        console.log("toggleDateFilter");

        console.log($scope.dt1)
        console.log($scope.dt2)

        if ($scope.dt1 != undefined) {
            var dt = new Date($scope.dt1);

            var day = dt.getDate();
            var month = dt.getMonth() + 1;

            if ((dt.getMonth() + 1) < 10) month = '0' + (dt.getMonth() + 1);
            if (dt.getDate() < 10) day = '0' + dt.getDate();
            $scope.filterSpec.dates.startdate = dt.getFullYear() + "-" + month + "-" + day;
        }

        if ($scope.dt2 != undefined) {
            var dt = new Date($scope.dt2)

            var day = dt.getDate();
            var month = dt.getMonth() + 1;

            if ((dt.getMonth() + 1) < 10) month = '0' + (dt.getMonth() + 1)
            if (dt.getDate() < 10) day = '0' + dt.getDate();
            $scope.filterSpec.dates.finishdate = dt.getFullYear() + "-" + month + "-" + day;
        }

        $scope.filterSpec.dates = $scope.dateFilter;

        var foundFalse = false;
        var startdate = $scope.filterSpec.dates.startdate;
        var finishdate = $scope.filterSpec.dates.finishdate;


        if (startdate > finishdate && finishdate != "") {
            $scope.dateMessage = "Verify your dates";
            $scope.dateWarn = 'display-block';
            foundFalse = true;
        } else if (startdate > $scope.widget.date || finishdate > $scope.widget.date) {
            $scope.dateMessage = "Latest date is " + $scope.widget.date;
            $scope.dateWarn = 'display-block';
            foundFalse = true;
        } else {
            $scope.dateMessage = "";
            $scope.dateWarn = 'display-none';
            foundFalse = false;
        }

        if (startdate != "" && finishdate != "" && startdate <= finishdate && foundFalse == false) {

            if (startdate == finishdate) $scope.hide = "display-none";
            else $scope.hide = "";

            $scope.procDateFilter(true, false);
        }

        console.log("filterSpec", $scope.filterSpec.dates);
    }

    $scope.preDatesFilter = function(value) {

        console.log('preDatesFilter')
        var start, end;

        //var oneDay = 1000 * 60 * 60 * 24;
        //var today = new Date();

        //var yesterday = new Date();
        //yesterday.setDate(yesterday.getDate() - 1);

        var lastSample = new Date($scope.widget.date);

        if (value == 'lastSample') {
            $scope.procDateFilter(false, true);
        } else if (value == 'thisWeek') {
            var start = new Date();
            start.setDate(start.getDate() - (start.getDay() - 1));

            var end = lastSample;
        } else if (value == 'lastWeek') {
            var start = new Date();
            start.setDate(start.getDate() - start.getDay() - 6);

            var end = new Date();
            end.setDate(end.getDate() - end.getDay());
        } else if (value == 'last15') {
            var start = new Date();
            start.setDate(start.getDate() - 15);

            end = lastSample;
        } else if (value == 'thisMonth') {
            var start = new Date();
            start.setDate(1);

            end = lastSample;
        } else if (value == 'lastMonth') {
            var start = new Date();
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);

            var end = new Date();
            end.setMonth(end.getMonth() - 1);


            switch (new Date(end.getYear(), end.getMonth() + 1, 0).getDate()) {
                case 28:
                    end.setDate(28);
                    break;

                case 29:
                    end.setDate(29);
                    break;

                case 30:
                    end.setDate(30);
                    break;

                case 31:
                    end.setDate(31);
                    break;
            }

        } else if (value == 'trimester') {
            var start = new Date();
            start.setMonth(start.getMonth() - 3);

            end = lastSample;
        } else if (value == 'quarter') {
            var start = new Date();
            start.setMonth(start.getMonth() - 4);

            end = lastSample;
        } else if (value == 'semester') {
            var start = new Date();
            start.setMonth(start.getMonth() - 6);

            end = lastSample;
        } else if (value == 'thisYear') {
            var start = new Date();
            start.setMonth(0);
            start.setDate(1);

            end = lastSample;
        } else if (value == 'lastYear') {
            var start = new Date();
            start.setFullYear(start.getFullYear() - 1);
            start.setMonth(0);
            start.setDate(1);

            var end = new Date();
            end.setFullYear(end.getFullYear() - 1);
            end.setMonth(11);
            end.setDate(31);
        }

        var startMonth = start.getMonth() + 1;
        var endMonth = end.getMonth() + 1;
        var endDay = end.getDate();
        var startDay = start.getDate();

        if (startMonth < 10) startMonth = '0' + startMonth;
        if (endMonth < 10) endMonth = '0' + endMonth;

        if (startDay < 10) startDay = '0' + startDay;
        if (endDay < 10) endDay = '0' + endDay;


        $scope.dateFilter.startdate = start.getFullYear() + "-" + startMonth + "-" + startDay;
        $scope.dateFilter.finishdate = end.getFullYear() + "-" + endMonth + "-" + endDay;

        $scope.toggleDateFilter();
    }

    // initFilteredPoints();

    var initFilteredPoints = function(state) {
        console.log("initFilteredPoints");
        // $scope.pointsFilteredBox

        for (var pointid in $scope.pointsFilteredBox) {
            if ($scope.pointsFilteredBox.hasOwnProperty(pointid)) {
                // do stuff
                $scope.pointsFilteredBox[pointid] = state;
            }
        }
    }

    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.message == "filterGeo") {
            // console.log("received filter filterGeo");
            // console.log(sharedCommsService.pointIdsToFilter);

            console.log("FILTER GEO");


            // definir o $scope.filterSpec, parte dos pontos
            $scope.filterSpec.points = sharedCommsService.pointIdsToFilter;
            // console.log("$scope.filterSpec");
            // console.log($scope.filterSpec);

            console.log($scope.filterSpec.points);
            initFilteredPoints(false);


            // $scope.filterSpec.points.forEach(function(pointid){
            //   $scope.pointsFilteredBox[pointid] = true;
            // })

            for (var pointid in $scope.filterSpec.points) {
                if ($scope.filterSpec.points.hasOwnProperty(pointid)) {
                    $scope.pointsFilteredBox[$scope.filterSpec.points[pointid]] = true;
                }
            }

            // perceber se nao tem impacto nos outros, 
            // e se os outros n tem impacto neste OK
            // chamar a função $scope.applyFilter()
            $scope.applyFilter(false);
            // ver na api se recebemos o filterspec com os pontos
            // dps na api é filtrar pelos pontid

            if (sharedCommsService.pointIdsToFilter.length > 0) {
                $scope.togglePointsFilter();
                $scope.procPointsFilter(true);
            } else
                $scope.procPointsFilter(false);

        }
    });
}



function ExampleBarChartCtrl($scope) {
    $scope.exampleData1 = [{
        key: "Cumulative Return",
        values: [
            ["A", -29.765957771107],
            ["B", 0],
            ["C", 32.807804682612],
            ["D", 196.45946739256],
            ["E", 0.19434030906893],
            ["F", -98.079782601442],
            ["G", -13.925743130903],
            ["H", -5.1387322875705]
        ]
    }];

    $scope.exampleData2 = [{
        key: "Cumulative Return",
        values: [
            ["A", -29.765957771107],
            ["B", 0],
            ["C", 32.807804682612],
            ["D", 196.45946739256],
            ["E", 0.19434030906893],
            ["F", -98.079782601442],
            ["G", -13.925743130903],
            ["H", -5.1387322875705]
        ]
    }, {
        key: "Cumulative Return2",
        values: [
            ["A", 10.765957771107],
            ["B", 0],
            ["C", -32.807804682612],
            ["D", 96.45946739256],
            ["E", 0.19434030906893],
            ["F", -38.079782601442],
            ["G", -43.925743130903],
            ["H", -3.1387322875705]
        ]
    }];


    $scope.$on('tooltipShow.directive', function(event) {
        // console.log('scope.tooltipShow', event);
    });

    $scope.$on('tooltipHide.directive', function(event) {
        // console.log('scope.tooltipHide', event);
    });

}


ModalChartCtrl.$inject = ['$scope', 'sharedCommsService'];

function ModalChartCtrl($scope, sharedCommsService) {

    // $scope.exampleDataModal = [
    //     {
    //         "key": "Series 1",
    //         "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] , [ 1059624000000 , 11.341210982529] , [ 1062302400000 , 14.734820409020] , [ 1064894400000 , 12.387148007542] , [ 1067576400000 , 18.436471461827] , [ 1070168400000 , 19.830742266977] , [ 1072846800000 , 22.643205829887] , [ 1075525200000 , 26.743156781239] , [ 1078030800000 , 29.597478802228] , [ 1080709200000 , 30.831697585341] , [ 1083297600000 , 28.054068024708] , [ 1085976000000 , 29.294079423832] , [ 1088568000000 , 30.269264061274] , [ 1091246400000 , 24.934526898906] , [ 1093924800000 , 24.265982759406] , [ 1096516800000 , 27.217794897473] , [ 1099195200000 , 30.802601992077] , [ 1101790800000 , 36.331003758254] , [ 1104469200000 , 43.142498700060] , [ 1107147600000 , 40.558263931958] , [ 1109566800000 , 42.543622385800] , [ 1112245200000 , 41.683584710331] , [ 1114833600000 , 36.375367302328] , [ 1117512000000 , 40.719688980730] , [ 1120104000000 , 43.897963036919] , [ 1122782400000 , 49.797033975368] , [ 1125460800000 , 47.085993935989] , [ 1128052800000 , 46.601972859745] , [ 1130734800000 , 41.567784572762] , [ 1133326800000 , 47.296923737245] , [ 1136005200000 , 47.642969612080] , [ 1138683600000 , 50.781515820954] , [ 1141102800000 , 52.600229204305] , [ 1143781200000 , 55.599684490628] , [ 1146369600000 , 57.920388436633] , [ 1149048000000 , 53.503593218971] , [ 1151640000000 , 53.522973979964] , [ 1154318400000 , 49.846822298548] , [ 1156996800000 , 54.721341614650] , [ 1159588800000 , 58.186236223191] , [ 1162270800000 , 63.908065540997] , [ 1164862800000 , 69.767285129367] , [ 1167541200000 , 72.534013373592] , [ 1170219600000 , 77.991819436573] , [ 1172638800000 , 78.143584404990] , [ 1175313600000 , 83.702398665233] , [ 1177905600000 , 91.140859312418] , [ 1180584000000 , 98.590960607028] , [ 1183176000000 , 96.245634754228] , [ 1185854400000 , 92.326364432615] , [ 1188532800000 , 97.068765332230] , [ 1191124800000 , 105.81025556260] , [ 1193803200000 , 114.38348777791] , [ 1196398800000 , 103.59604949810] , [ 1199077200000 , 101.72488429307] , [ 1201755600000 , 89.840147735028] , [ 1204261200000 , 86.963597532664] , [ 1206936000000 , 84.075505208491] , [ 1209528000000 , 93.170105645831] , [ 1212206400000 , 103.62838083121] , [ 1214798400000 , 87.458241365091] , [ 1217476800000 , 85.808374141319] , [ 1220155200000 , 93.158054469193] , [ 1222747200000 , 65.973252382360] , [ 1225425600000 , 44.580686638224] , [ 1228021200000 , 36.418977140128] , [ 1230699600000 , 38.727678144761] , [ 1233378000000 , 36.692674173387] , [ 1235797200000 , 30.033022809480] , [ 1238472000000 , 36.707532162718] , [ 1241064000000 , 52.191457688389] , [ 1243742400000 , 56.357883979735] , [ 1246334400000 , 57.629002180305] , [ 1249012800000 , 66.650985790166] , [ 1251691200000 , 70.839243432186] , [ 1254283200000 , 78.731998491499] , [ 1256961600000 , 72.375528540349] , [ 1259557200000 , 81.738387881630] , [ 1262235600000 , 87.539792394232] , [ 1264914000000 , 84.320762662273] , [ 1267333200000 , 90.621278391889] , [ 1270008000000 , 102.47144881651] , [ 1272600000000 , 102.79320353429] , [ 1275278400000 , 90.529736050479] , [ 1277870400000 , 76.580859994531] , [ 1280548800000 , 86.548979376972] , [ 1283227200000 , 81.879653334089] , [ 1285819200000 , 101.72550015956] , [ 1288497600000 , 107.97964852260] , [ 1291093200000 , 106.16240630785] , [ 1293771600000 , 114.84268599533] , [ 1296450000000 , 121.60793322282] , [ 1298869200000 , 133.41437346605] , [ 1301544000000 , 125.46646042904] , [ 1304136000000 , 129.76784954301] , [ 1306814400000 , 128.15798861044] , [ 1309406400000 , 121.92388706072] , [ 1312084800000 , 116.70036100870] , [ 1314763200000 , 88.367701837033] , [ 1317355200000 , 59.159665765725] , [ 1320033600000 , 79.793568139753] , [ 1322629200000 , 75.903834028417] , [ 1325307600000 , 72.704218209157] , [ 1327986000000 , 84.936990804097] , [ 1330491600000 , 93.388148670744]]
    //     }
    // ];



    // $scope.exampleDataRanking = [
    //                {
    //                    "key": "Series 1",
    //                    "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] ]
    //                },
    //                {
    //                    "key": "Series 2",
    //                    "values": [ [ 1025409600000 , 0] , [ 1028088000000 , 0] , [ 1030766400000 , 0] , [ 1033358400000 , 0] , [ 1036040400000 , 0] , [ 1038632400000 , 0] , [ 1041310800000 , 0] , [ 1043989200000 , 0] , [ 1046408400000 , 0] , [ 1049086800000 , 0] , [ 1051675200000 , 0] , [ 1054353600000 , 0] , [ 1056945600000 , 0] , [ 1059624000000 , 0] , [ 1062302400000 , 0] , [ 1064894400000 , 0] , [ 1067576400000 , 0] , [ 1070168400000 , 0] , [ 1072846800000 , 0] , [ 1075525200000 , -0.049184266875945] ]
    //                },
    //                {
    //                    "key": "Series 3",
    //                    "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] ]
    //                },
    //                {
    //                    "key": "Series 4",
    //                    "values": [ [ 1025409600000 , -7.0674410638835] , [ 1028088000000 , -14.663359292964] , [ 1030766400000 , -14.104393060540] , [ 1033358400000 , -23.114477037218] , [ 1036040400000 , -16.774256687841] , [ 1038632400000 , -11.902028464000] , [ 1041310800000 , -16.883038668422] , [ 1043989200000 , -19.104223676831] , [ 1046408400000 , -20.420523282736] , [ 1049086800000 , -19.660555051587] , [ 1051675200000 , -13.106911231646] , [ 1054353600000 , -8.2448460302143] , [ 1056945600000 , -7.0313058730976] ]
    //                }
    //            ];



    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.message == "lineChartData") {
            console.log("received message lineChartData");
            // console.log(sharedCommsService.deleteItem);
            // $scope.exampleData = sharedCommsService.lineChartData;
            $scope.exampleDataModal = sharedCommsService.lineChartData[0];
        }
    });

}

// auxiliar functions
function addSpace(num) {

    var x = num.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';

    var rgx = /(\d+)(\d{3})/;

    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }

    return x1 + x2;
}

function formatNumber(num) {
    if (parseFloat(num) % 1 != 0 && isNaN(num) == false) {
        var number = parseFloat(num).toFixed(2) + '';
        return addSpace(number);
    } else if (isNaN(num) == false) {

        var number = num + '';
        return addSpace(number);
    } else return num;
}


tableKpiCtrl.$inject = ['$scope', '$http', '$location', '$routeParams', 'socket', 'sharedCommsService'];

function tableKpiCtrl($scope, $http, $location, $routeParams, socket, sharedCommsService) {

    $scope.search = {};
    $scope.points = [];
    $scope.order = 'A';

    $scope.isString = function(item) {
        return angular.isString(item);
    }

    $http.post('/api/generateTable/' + $scope.pid).
    success(function(data, status) {
        console.log("/api/generateTable/", data);

        //var matrixPoints = data.matrixPoints;
        $scope.points = data.matrixPoints;

        /*for (var i = 0; i < matrixPoints.length; i++) {
            var temp = [];
            for (var z = 0; z < matrixPoints[i].length; z++) {

                temp.push(formatNumber(matrixPoints[i][z]));

            }
            $scope.points.push(temp);
        }*/

        console.log("points", $scope.points);
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });

    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.messageFilter == "updatedFilter") {
            $scope.points = [];
            var filter = {};
            filter.startDate = sharedCommsService.filterSpec.dates.startdate;
            filter.endDate = sharedCommsService.filterSpec.dates.finishdate;

            $http.post('/api/generateTable/' + $scope.pid, filter)
                .success(function(data, status) {

                    //var matrixPoints = data.matrixPoints;
                    $scope.points = data.matrixPoints;

                    /*for (var i = 0; i < matrixPoints.length; i++) {
                        var temp = [];
                        for (var z = 0; z < matrixPoints[i].length; z++) {
                            temp.push(formatNumber(matrixPoints[i][z]));
                        }
                        $scope.points.push(temp);
                    }*/
                })
                .error(function(data, status) {
                    $scope.data = data || "Request failed";
                });
        }
    });
}

DashCtrl.$inject = ['$scope', '$http', '$location', '$routeParams', 'socket', 'sharedCommsService'];

function DashCtrl($scope, $http, $location, $routeParams, socket, sharedCommsService) {

    console.log('DashCtrl');

    $scope.loading = false;
    $scope.occLoading = false;

    $scope.$on('$locationChangeSuccess', function(event) {
        if ($location.path().indexOf('/map') >= 0)
            $scope.loading = true

        if ($location.path().indexOf('/occurrences') >= 0)
            $scope.occLoading = true
    })

    //$scope.occurrences = nOccurrences.occurrences;

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.showOpenOcc = false;
    //$scope.openOcc = nOccurrences.openOcc;

    if ($scope.openOcc > 0)
        $scope.showOpenOcc = true;
    else
        $scope.showOpenOcc = false;

    $scope.$watch('currOccurrence.status', function() {
        //$scope.openOcc = nOccurrences.openOcc;

        if ($scope.openOcc > 0)
            $scope.showOpenOcc = true;
        else
            $scope.showOpenOcc = false;
    });

    $scope.showDashboardHelp = 0;
    $scope.pid = $routeParams.pid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.lastAddedMsg = '';
    $scope.form = {
        "alarm": "no"
    };


    $scope.isActive = function(location) {

        var active = (location === $location.path());
        return active;
    };

    // obter todos os indicators de pontos
    // para cada um, criar caixa com link para widget\:wid
    // $scope.widgets = [{"wid":0, "title":"pH"}, {"wid":1, "title":"Iron"}];
    $scope.widgets = [];

    var addPoint = function(query) {
        if (angular.isDefined($scope.pointid))
            return (query += '/' + $scope.pointid);
        else return query;
    }

    function getWidgets(isNew, title) {

        var query = '/api/widgets/' + $scope.pid;

        $http.get(addPoint(query)).
        success(function(data, status) {

            $scope.widgets = data;

            if (!$scope.widgets.hasOwnProperty("length"))
                return;

            $scope.widgets.forEach(function(elem) {

                // go to api and get info about elem.title

                // elem.value = Math.floor((Math.random() * 12345) + 1);
                // elem.unit = "$";
                // elem.date = Math.floor((Math.random() * 32) + 1) + "-" + Math.floor((Math.random() * 13) + 1) + "-" + Math.floor((Math.random() * 3) + 2012);
                elem.hasAlarm = angular.isDefined(elem.alerts);
                elem.newAlert = elem.hasAlarm && elem.alerts > 0 ? 'color:red;' : '';
                //elem.newAlert = isNew ? (elem.title == title ? 'color:red;' : '') : '';
                elem.hideNewAlert = function() {
                    elem.newAlert = '';
                };
                //elem.date = elem.date.replace(' 00:00:00:000000', '');
                //elem.points = Math.floor((Math.random() * 6) );
            });

            if ($scope.widgets.length == 0)
                $scope.showDashboardHelp = 1;

            $http.post(addPoint('/api/accumDashboard/' + $scope.pid)).
            success(function(data, status) {

                //console.log("/api/accumDashboard/", data)
                $scope.accumValues = data;

                for (var i = 0; i < $scope.widgets.length; i++) {
                    if ($scope.widgets[i].title == "Basket")
                        $scope.widgets[i].value = $scope.accumValues[0].basket;

                    else if ($scope.widgets[i].title == "Net Margin")
                        $scope.widgets[i].value = $scope.accumValues[1].acc_margin;

                    else if ($scope.widgets[i].title == "Multiline Bills")
                        $scope.widgets[i].value = $scope.accumValues[2].acc_bills;
                }
            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    };

    socket.on('send:alert', function(u) {
        getWidgets(u.pid == $scope.pid, u.title)
    });
    $scope.$on('send:alert', function(u) {
        getWidgets(u.pid == $scope.pid, u.title)
    });

    getWidgets(false);

    $scope.$on('handleBroadcast', function() {

        console.log("messageFilter", sharedCommsService.messageFilter);

        if (sharedCommsService.messageFilter == "updatedFilter") {

            var assignValueToWidget = function(arr, title, val) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].title == title) {
                        arr[i].value = val;
                    }
                }
            }

            $http.post('/api/totalNetSales/' + $scope.pid, $scope.filterSpec)
                .success(function(data, status) {
                    assignValueToWidget($scope.widgets, "Net Sales", data[0]);

                    $http.post('/api/totalCustomers/' + $scope.pid, $scope.filterSpec)
                        .success(function(data, status) {
                            assignValueToWidget($scope.widgets, "Number of Customers", data[0]);

                            $http.post('/api/totalBasket/' + $scope.pid, $scope.filterSpec)
                                .success(function(data, status) {
                                    assignValueToWidget($scope.widgets, "Basket", data[0]);

                                    $http.post('/api/totalNetMargin/' + $scope.pid, $scope.filterSpec)
                                        .success(function(data, status) {
                                            assignValueToWidget($scope.widgets, "Net Margin", data[0]);

                                            $http.post('/api/totalMultilineBills/' + $scope.pid, $scope.filterSpec)
                                                .success(function(data, status) {
                                                    assignValueToWidget($scope.widgets, "Multiline Bills", data[0]);

                                                    $http.post('/api/totalStockLevel/' + $scope.pid, $scope.filterSpec)
                                                        .success(function(data, status) {
                                                            assignValueToWidget($scope.widgets, "Stock Level", data[0]);

                                                        })
                                                        .error(function(data, status) {
                                                            console.log("error: POST /api/totalStockLevel/")
                                                        });
                                                })
                                                .error(function(data, status) {
                                                    console.log("error: POST /api/totalMultilineBills/")
                                                });
                                        })
                                        .error(function(data, status) {
                                            console.log("error: POST /api/totalNetMargin/")
                                        });
                                })
                                .error(function(data, status) {
                                    console.log("error: POST /api/totalBasket/")
                                });
                        })
                        .error(function(data, status) {
                            console.log("error: POST /api/totalCustomers/")
                        });
                })
                .error(function(data, status) {
                    console.log("error: POST /api/totalNetSales/")
                });
        }
    });
};

DashboardCtrl.$inject = ['$scope', '$http', '$location', '$routeParams', 'socket', 'Occurrences', 'Profile', 'sharedCommsService'];

function DashboardCtrl($scope, $http, $location, $routeParams, socket, Occurrences, Profile, sharedCommsService) {

    console.log('DashboardCtrl');

    $scope.loading = false;
    $scope.occLoading = false;

    $scope.$on('$locationChangeSuccess', function(event) {
        if ($location.path().indexOf('/map') >= 0)
            $scope.loading = true

        if ($location.path().indexOf('/occurrences') >= 0)
            $scope.occLoading = true

    })

    $scope.occurrences = Occurrences.occurrences;

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.showOpenOcc = false;
    //console.log($scope.showOpenOcc);
    $scope.openOcc = Occurrences.openOcc;

    if ($scope.openOcc > 0)
        $scope.showOpenOcc = true;
    else
        $scope.showOpenOcc = false;

    //console.log($scope.showOpenOcc);

    $scope.$watch('currOccurrence.status', function() {
        $scope.openOcc = Occurrences.openOcc;

        if ($scope.openOcc > 0)
            $scope.showOpenOcc = true;
        else
            $scope.showOpenOcc = false;

        //console.log($scope.showOpenOcc);
    });

    $scope.showDashboardHelp = 0;
    $scope.pid = $routeParams.pid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.lastAddedMsg = '';
    $scope.form = {
        "alarm": "no"
    };

    $scope.userProfile = Profile.userprofile;
    console.log("User Profile :");
    console.log(Profile.userprofile);

    // obter todos os indicators de pontos
    // para cada um, criar caixa com link para widget\:wid
    // $scope.widgets = [{"wid":0, "title":"pH"}, {"wid":1, "title":"Iron"}];
    $scope.widgets = [];

    var query = '/api/widgets/' + $scope.pid;

    var addPoint = function(query) {
            if (angular.isDefined($scope.pointid))
                return (query += '/' + $scope.pointid);
            else return query;
        }
        //if($scope.pointid != null && $scope.pointid != undefined)
        //query+='/'+$scope.pointid;

    function getWidgets(isNew, title) {
        $http.get(addPoint(query)).
        success(function(data, status) {
            //console.log("yeah read widgets!");
            $scope.widgets = data;
            // // console.log('$scope.project');
            // // console.log($scope.project);

            if (!$scope.widgets.hasOwnProperty("length"))
                return;

            $scope.widgets.forEach(function(elem) {

                // go to api and get info about elem.title


                // elem.value = Math.floor((Math.random() * 12345) + 1);
                // elem.unit = "$";
                // elem.date = Math.floor((Math.random() * 32) + 1) + "-" + Math.floor((Math.random() * 13) + 1) + "-" + Math.floor((Math.random() * 3) + 2012);
                elem.hasAlarm = angular.isDefined(elem.alerts);
                elem.newAlert = elem.hasAlarm && elem.alerts > 0 ? 'color:red;' : '';
                //elem.newAlert = isNew ? (elem.title == title ? 'color:red;' : '') : '';
                elem.hideNewAlert = function() {
                    elem.newAlert = '';
                };
                //elem.date = elem.date.replace(' 00:00:00:000000', '');
                //elem.points = Math.floor((Math.random() * 6) );
            });

            if ($scope.widgets.length == 0)
                $scope.showDashboardHelp = 1;

            $http.post(addPoint('/api/accumDashboard/' + $scope.pid)).
            success(function(data, status) {

                $scope.accumValues = data;

                for (var i = 0; i < $scope.widgets.length; i++) {
                    if ($scope.widgets[i].title == "Basket")
                        $scope.widgets[i].value = $scope.accumValues[0].basket;

                    if ($scope.widgets[i].title == "Net Margin")
                        $scope.widgets[i].value = $scope.accumValues[1].acc_margin;

                    if ($scope.widgets[i].title == "Multiline Bills")
                        $scope.widgets[i].value = $scope.accumValues[2].acc_bills;

                    if ($scope.widgets[i].title == "NPS INDEX (HoN)")
                        $scope.widgets[i].value = $scope.accumValues[3].nps;
                }
            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    };

    socket.on('send:alert', function(u) {
        getWidgets(u.pid == $scope.pid, u.title)
    });
    $scope.$on('send:alert', function(u) {
        getWidgets(u.pid == $scope.pid, u.title)
    });

    getWidgets(false);



    $http.get(addPoint('/api/dashboard/' + $scope.pid)).
    success(function(data, status) {
        // // // console.log("yeah read!");
        // // console.log(data);
        $scope.project = data.project;
        // console.log('$scope.project');
        // console.log($scope.project);
        $scope.indicators = data.indicators;
        $scope.pointname = nameFromAttributes(data.pattributes, $scope.pointid);

        // if($scope.indicators.length == 0)
        //   $scope.showDashboardHelp = 1;
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });


    $scope.submitNewWidget = function() {
        // console.log('submitNewWidget');
        // // // console.log($scope.form);

        if (!$scope.form.hasOwnProperty('title')) {
            $scope.lastAddedMsg = "Missing the required field Title!";
            $scope.lastAddedMsgStyle = 'color: red;';
        } else {


            if ($scope.form.alarm == "yes") {
                if (!$scope.form.hasOwnProperty('min') || !$scope.form.hasOwnProperty('max')) {
                    $scope.lastAddedMsg = "Missing one of the required fields Minimum or Maximum!";
                    $scope.lastAddedMsgStyle = 'color: red;';
                    return;
                } else {
                    if (!(parseFloat($scope.form.min) < parseFloat($scope.form.max))) {
                        $scope.lastAddedMsg = "Minimum is not smaller than Maximum. Adjust the values correctly!";
                        $scope.lastAddedMsgStyle = 'color: red;';
                        return;
                    }
                }
            }

            $http.post('/api/indicator/' + $scope.pid, $scope.form).
            success(function(data, status) {
                // // console.log("yeah write!" + status);
                // // console.log(data);

                if (data.err) {
                    $scope.lastAddedMsg = data.err;
                } else {
                    $scope.indicators = data;
                    $scope.lastAddedMsg = "Indicator " + $scope.form.title + " added with success.";
                    $scope.lastAddedMsgStyle = 'color: green;';
                    $scope.form = {
                        "alarm": "no"
                    };
                    // // // console.log(data);
                }
            }).
            error(function(data, status) {
                // $scope.data = data || "Request failed";
                $scope.lastAddedMsg = data || "Request failed";
                $scope.lastAddedMsgStyle = 'color: red;';
            });
        }


    }

    $scope.deleteIndicator = function(iid) {
        // // // console.log('deleteIndicator iid: '+iid);

        $http.delete('/api/indicator/' + $scope.pid + '/' + iid).
        success(function(data, status) {
            console.log("deleted indicator");
            // // // console.log(data);
            $scope.indicators = data;
        });
    }



};


DashboardPointCtrl.$inject = ['$scope', '$http', '$routeParams', 'sharedCommsService', 'Profile', 'Occurrences', '$location'];

/* For any object with attributes, try to extract a name,
 * otherwise use the default value */
function nameFromAttributes(i, def) {
    return (i && (i.attributes &&
        (i.attributes.name ||
            i.attributes.Name ||
            i.attributes.StoreCodeAbbrv ||
            i.attributes.location ||
            i.attributes["Store code"] ||
            def
        ) || def) || def);
}

function DashboardPointCtrl($scope, $http, $routeParams, sharedCommsService, Profile, Occurrences, $location) {
    console.log('DashboardPointCtrl');

    $scope.loading = false;
    $scope.occLoading = false;

    $scope.$on('$locationChangeSuccess', function(event) {
        if ($location.path().indexOf('/map') >= 0)
            $scope.loading = true

        if ($location.path().indexOf('/occurrences') >= 0)
            $scope.occLoading = true
    })


    $scope.occurrences = Occurrences.occurrences;

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.showOpenOcc = false;
    console.log($scope.showOpenOcc);
    $scope.openOcc = Occurrences.openOcc;

    if ($scope.openOcc > 0)
        $scope.showOpenOcc = true;
    else
        $scope.showOpenOcc = false;

    console.log($scope.showOpenOcc);

    $scope.$watch('currOccurrence.status', function() {
        $scope.openOcc = Occurrences.openOcc;

        if ($scope.openOcc > 0)
            $scope.showOpenOcc = true;
        else
            $scope.showOpenOcc = false;

        console.log($scope.showOpenOcc);
    });


    $scope.showDashboardHelp = 0;
    $scope.pid = $routeParams.pid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.lastAddedMsg = '';
    $scope.form = {
        "alarm": "no"
    };

    $scope.userProfile = Profile.userprofile;
    console.log(Profile.userprofile);


    $scope.items = [{
        id: 1,
        title: 'foo'
    }, {
        id: 2,
        title: 'bar'
    }, {
        id: 3,
        title: 'blah'
    }];



    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.message == "refreshIndicators") {
            console.log("received message refreshIndicators");
            $scope.refreshIndicatorsAndProject();
        }
    });


    $scope.refreshIndicatorsAndProject = function() {
        $http.get('/api/pointdashboard/' + $scope.pid + "/" + $scope.pointid).
        success(function(data, status) {
            console.log("yeah read indicators!");
            console.log(data);
            $scope.project = data.project;
            // console.log('$scope.project');
            // console.log($scope.project);
            $scope.indicators = data.indicators;
            $scope.pointname = nameFromAttributes(data.pattributes, $scope.pointid);

            if ($scope.indicators.length == 0)
                $scope.showDashboardHelp = 1;

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    };

    $scope.refreshIndicatorsAndProject();


    function refreshDataTypes() {
        $http.get('/api/datatypes/' + $scope.pid).
        success(function(data, status) {
            $scope.datatypes = data.datatypes;
            $scope.datatypes.forEach(function(elem) {
                elem.titleG = elem.title;
                if (elem.global == 'yes') {
                    elem.titleG += " (global)"
                }
            });
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }
    $scope.datatypes = [];
    refreshDataTypes();


    $http.get('/api/dashboard/' + $scope.pid).
    success(function(data, status) {
        // // // console.log("yeah read!");
        // // console.log(data);
        var projectiIndicators = data.indicators;

        $scope.items = [];
        projectiIndicators.forEach(function(elem) {
            var aux = {};
            aux.id = elem.iid;
            aux.title = elem.title;
            aux.unit = elem.unit;
            aux.alarm = "no";
            $scope.items.push(aux);
        });
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });



    $scope.submitNewWidget = function() {
        // console.log('submitNewWidget');

        $scope.form = this.form;



        if (!$scope.form.hasOwnProperty('title')) {
            $scope.lastAddedMsg = "Missing the required field Title!";
            $scope.lastAddedMsgStyle = 'color: red;';
        } else {


            if ($scope.form.alarm == "yes") {
                if (!$scope.form.hasOwnProperty('min') || !$scope.form.hasOwnProperty('max')) {
                    $scope.lastAddedMsg = "Missing one of the required fields Minimum or Maximum!";
                    $scope.lastAddedMsgStyle = 'color: red;';
                    return;
                } else {
                    if (!(parseFloat($scope.form.min) < parseFloat($scope.form.max))) {
                        $scope.lastAddedMsg = "Minimum is not smaller than Maximum. Adjust the values correctly!";
                        $scope.lastAddedMsgStyle = 'color: red;';
                        return;
                    }
                }
            }

            this.form = {
                "alarm": "no"
            };

            // console.log($scope.form);
            // return;
            $http.post('/api/indicator/' + $scope.pid + "/" + $scope.pointid, $scope.form).
            success(function(data, status) {
                // // // console.log("yeah write!" + status);
                // // // console.log(data);

                $scope.indicators = data;
                $scope.lastAddedMsg = "Indicator " + $scope.form.title + " added with success.";
                $scope.lastAddedMsgStyle = 'color: green;';
                $scope.form = {
                    "alarm": "no"
                };
            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });

            // $scope.projects.push($scope.form);
            // fazer o post
            // obter o indicators q este post retorna

        }



    }

    $scope.deleteMessage = '';
    $scope.indicatorToDelete = {};

    $scope.toDeleteIndicator = function(indicator) {
        // console.log('toDeleteIndicator iid: '+indicator.iid);
        // console.log('/api/indicator/'+$scope.pid+'/'+indicator.iid+'/'+$scope.pointid);

        $scope.deleteMessage = 'Are you sure you want to delete indicator "' + indicator.title + '"? (indicator id: ' + indicator.iid + ')';
        $scope.indicatorToDelete = indicator;

    }


    $scope.deleteIndicator = function() {
        $http.delete('/api/indicator/' + $scope.pid + '/' + $scope.indicatorToDelete.iid + '/' + $scope.pointid).
        success(function(data, status) {
            // // // console.log("deleted point indicator");
            // // // console.log(data);
            $scope.indicators = data;
        });
    }

};

// Requires data
//  .value
//  .min
//  .max
//  .pointname
//  .readings
//  .alarm
//  .title
function checkAndEmitAlert(scope, data, socket, socketSelf) {
    if (data.alarm == 'yes' &&
        (parseFloat(data.value) < parseFloat(data.min) || parseFloat(data.value) > parseFloat(data.max))
    ) {
        var data = {
            pid: scope.pid,
            iid: scope.iid,
            pointid: scope.pointid,
            pointname: data.pointname,
            value: data.value,
            // TODO: wrong: should not be array last element
            timestamp: data.readings[data.readings.length - 1].timestamp,
            alarm: data.alarm,
            title: data.title,
            min: data.min,
            max: data.max
        };
        socketSelf.emit(data);
        socket.emit('send:alert', data);
    }
}


IndicatorCtrl.$inject = ['$scope', '$http', '$routeParams', 'socket', 'socketSelf', '$modal', '$log', 'Profile', 'Occurrences', 'sharedCommsService'];

function IndicatorCtrl($scope, $http, $routeParams, socket, socketSelf, $modal, $log, Profile, Occurrences, sharedCommsService) {
    console.log('IndicatorCtrl');

    $scope.occurrences = Occurrences.occurrences;

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.openOcc = Occurrences.openOcc;

    $scope.$watch('currOccurrence.status', function(oldVal, newVal) {
        if (newVal != "") {
            $scope.openOcc = Occurrences.openOcc;

        }

    });

    $scope.pid = $routeParams.pid;
    $scope.iid = $routeParams.iid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.userProfile = Profile.userprofile;
    console.log(Profile.userprofile);

    socket.on('send:value', function(elem) {
        // // console.log("received value!");
        // // console.log(elem);
        if ((elem.parmid == '' || elem.parmid == undefined || elem.parmid == null || !elem.hasOwnProperty('parmid')) && elem.iid == $scope.iid)
            $scope.indicator.value = elem.value;
    });


    $scope.pid = $routeParams.pid;

    $scope.parmid = $routeParams.parmid;
    // // // console.log('pid: '+$scope.pid + ' iid: ' + $scope.iid + ' parmid: '+$scope.parmid);
    $scope.readingsFormClass = 'display-none';
    $scope.iconConfig = 'fa-pencil';

    $http.get('/api/indicator/' + $scope.pid + '/' + $scope.iid).
    success(function(data, status) {
        // // // console.log("yeah read!");
        // // // console.log(data);
        // $scope.project = data.title;
        $scope.project = data.project;
        $scope.indicator = data.indicator;
        $scope.parameters = data.parameters;
        // // // console.log($scope.indicators);
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });



    $scope.toggleShowReadingsForm = function() {
        console.log("toggleShowReadingsForm");
        if ($scope.readingsFormClass == 'display-none') {
            $scope.readingsFormClass = 'display-block';
            $scope.iconConfig = 'fa-chevron-circle-up';
        } else {
            $scope.readingsFormClass = 'display-none';
            $scope.iconConfig = 'fa-pencil';
        }
    };

    $scope.deleteParameter = function(parmid) {
        // // // console.log('deleteParameter : '+$scope.iid+' '+parmid);

        $http.delete('/api/parameter/' + $scope.iid + '/' + parmid).
        success(function(data, status) {
            // // // console.log("deleted parameter");
            // // // console.log(data);
            $scope.parameters = data;
        });
    };


    $scope.readingForm = {};

    $scope.submitPointReadings = function(multiple) {
        console.log("submitPointReadings");
        var lines = multiple ? $scope.sentence.split('\n') : [$scope.readingForm.body.timestamp + '\t' + $scope.readingForm.body.value]
        console.log(lines);

        // since levels arent supported at point indicator screen, we set them to []
        var toSend = {
            "readings": lines,
            "levels": []
        };

        $http.post('/api/indicatorReadings/' + $scope.iid, toSend).
        success(function(data, status) {
            $scope.indicator.value = data.value;
            checkAndEmitAlert($scope, data, socket, socketSelf);


            socket.emit('send:value', {
                pid: $scope.pid,
                iid: $scope.iid,
                pointid: $scope.pointid,
                value: data.value
            });

            $scope.readingForm = {};
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    };


    $scope.shareFormClass = 'display-none';

    $scope.toggleShowShareForm = function() {
        // // console.log("toggleShowShareForm "+$scope.shareFormClass);
        // if($scope.shareFormClass == 'display-none'){
        //   $scope.shareFormClass = 'display-block';
        // } else {
        //   $scope.shareFormClass = 'display-none';
        // }
    };



};


IndicatorPointCtrl.$inject = ['$scope', '$http', '$routeParams', 'socket', 'socketSelf', 'Profile', 'Occurrences', '$location', 'sharedCommsService'];

function IndicatorPointCtrl($scope, $http, $routeParams, socket, socketSelf, Profile, Occurrences, $location, sharedCommsService) {
    console.log('IndicatorPointCtrl');

    $scope.loading = false;
    $scope.occLoading = false;

    $scope.$on('$locationChangeSuccess', function(event) {
        if ($location.path().indexOf('/map') >= 0)
            $scope.loading = true

        if ($location.path().indexOf('/occurrences') >= 0)
            $scope.occLoading = true
    })

    $scope.occurrences = Occurrences.occurrences;

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.showOpenOcc = false;
    console.log($scope.showOpenOcc);
    $scope.openOcc = Occurrences.openOcc;

    if ($scope.openOcc > 0)
        $scope.showOpenOcc = true;
    else
        $scope.showOpenOcc = false;

    console.log($scope.showOpenOcc);

    $scope.$watch('currOccurrence.status', function() {
        $scope.openOcc = Occurrences.openOcc;

        if ($scope.openOcc > 0)
            $scope.showOpenOcc = true;
        else
            $scope.showOpenOcc = false;

        console.log($scope.showOpenOcc);
    });



    $scope.pid = $routeParams.pid;
    $scope.iid = $routeParams.iid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.userProfile = Profile.userprofile;
    console.log(Profile.userprofile);

    socket.on('send:value', function(elem) {
        // // console.log("received value!");
        // // console.log(elem);
        if ((elem.parmid == '' || elem.parmid == undefined || elem.parmid == null || !elem.hasOwnProperty('parmid')) && elem.iid == $scope.iid)
            $scope.indicator.value = elem.value;
    });


    $scope.pid = $routeParams.pid;
    $scope.parmid = $routeParams.parmid;
    $scope.pointid = $routeParams.pointid;
    // // // console.log('pid: '+$scope.pid + ' iid: ' + $scope.iid + ' parmid: '+$scope.parmid);

    $http.get('/api/indicator/' + $scope.pid + '/' + $scope.iid + '/' + $scope.pointid).
    success(function(data, status) {
        // // // console.log("yeah read!");
        // // // console.log(data);
        $scope.indicator = data.indicator;
        $scope.parameters = data.parameters;
        $scope.pointname = nameFromAttributes(data.pointname, $scope.pointid);
        $scope.project = data.project;
        // // // console.log($scope.indicators);


        $scope.refreshChart();

    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });

    $scope.deleteParameter = function(parmid) {
        // // // console.log('deletePointParameter : '+$scope.iid+' '+parmid);

        $http.delete('/api/parameter/' + $scope.iid + '/' + parmid).
        success(function(data, status) {
            // // // console.log("deleted parameter");
            // // // console.log(data);
            $scope.parameters = data;
        });
    };

    $scope.readingsFormClass = 'display-none';
    $scope.iconConfig = 'fa-pencil';

    $scope.toggleShowReadingsForm = function() {
        console.log("toggleShowReadingsForm");
        if ($scope.readingsFormClass == 'display-none') {
            $scope.readingsFormClass = 'display-block';
            $scope.iconConfig = 'fa-pencil';
        } else {
            $scope.readingsFormClass = 'display-none';
            $scope.iconConfig = 'fa-chevron-circle-up';
        }
    };

    // auxiliary function to detect if readings are out of intervals and
    // generating occurrences on the backend.
    var processOccurrences = function(pid, pointid, lines, data, socket) {
        // for all line in lines
        // check if any line is out of interval data.min .max
        // if true, add occurrence on DB and send occurrence to socket
        var tempDate = new Date();
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var lineArr = line.split("\t");
            if (data.alarm == 'yes' && (parseFloat(lineArr[1]) < parseFloat(data.min) || parseFloat(lineArr[1]) > parseFloat(data.max))) {

                // api should add status: open + date: now() + lat,lng via pointid
                // we should send here title, pointid, occurrType
                var obj = {};

                var str = '';
                var preStr = '';
                if (parseFloat(lineArr[1]) > parseFloat(data.max))
                    str = preStr + ' ' + 'Above the maximum value';
                else if (parseFloat(lineArr[1]) < parseFloat(data.min))
                    str = preStr + ' ' + 'Below the minimum value';

                obj.title = str;
                obj.date = convertDateToYYYYMMDD(lineArr[0]);
                obj.pointid = pointid;
                obj.statusdate = "";
                obj.occtype_id = data.occtypeid_typ;
                obj.kpi = data.title;
                obj.value = data.value;
                obj.time = zero(tempDate.getHours()) + ':' + zero(tempDate.getMinutes());
                obj.setvalue = data.max;
                obj.min = data.min;


                if (data.occtypeid_typ == null || data.occtypeid_typ == undefined) {
                    console.error("indicator occurrence type is null");
                } else {

                    $http.post('/api/newoccurrence/' + pid, obj).
                    success(function(data, status) {
                        console.log("added occurrence");
                    }).
                    error(function(data, status) {
                        $scope.data = data || "Request failed";
                    });

                }



            }
        }
    }


    var convertDateToYYYYMMDD = function(dateStr) {
        var toRet = dateStr;
        if (dateStr.charAt(2) == '-' || dateStr.charAt(2) == ' ' || dateStr.charAt(2) == '/') {
            // we need to convert
            toRet = "";
            toRet += dateStr.substring(6, 10);
            toRet += '-';
            toRet += dateStr.substring(3, 5);
            toRet += '-';
            toRet += dateStr.substring(0, 2);
        }
        return toRet;
    }

    var zero = function(i) {
        if (i < 10) i = "0" + i;
        return i;
    }

    $scope.readingForm = {};

    $scope.submitPointReadings = function(multiple) {
        console.log('submitPointReadings');
        $scope.lines = multiple ? $scope.sentence.split('\n') : [$scope.readingForm.timestamp + '\t' + $scope.readingForm.value]

        console.log("$scope.lines");
        console.log($scope.lines);

        // since levels arent supported at point indicator screen, we set them to []
        var toSend = {
            "readings": $scope.lines,
            "levels": []
        };

        $http.post('/api/indicatorReadings/' + $scope.iid, toSend).
        success(function(data, status) {
            $scope.indicator.value = data.value;
            checkAndEmitAlert($scope, data, socket, socketSelf);
            processOccurrences($scope.pid, $scope.pointid, $scope.lines, data, socket);

            socket.emit('send:value', {
                pid: $scope.pid,
                iid: $scope.iid,
                pointid: $scope.pointid,
                value: data.value
            });
            //     $scope.parameter.value = data.value;
            $scope.readingForm = {};

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

    };



    socket.on('send:value', function(elem) {
        // // console.log("received value on ExampleCtrl!");
        if (elem.parmid == parmid)
            $scope.refreshChart();
    });



    $scope.xAxisTickFormatFunction = function() {
        // return function(d){
        //     return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
        // }
        return function(d) {
            // return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
            return d3.time.format("%Y-%m-%d")(new Date(d));
        }
    }



    $scope.exampleData = [{
        "key": "History",
        "values": []
    }];

    $scope.readings = [];
    var dataAux = [];


    $scope.refreshChart = function() {
        // // console.log('refreshChart');
        var q = '/api/parameterPointReadings/' + $scope.iid;


        $http.get(q).
        success(function(retData, status) {
            console.log("yeah read readings!");
            console.log(retData);


            var data = retData.result;

            dataAux = [];
            $scope.readings = [];

            for (var d in data) {
                // // // console.log(data[d]);
                if (data[d][1] != null) {
                    // var date = new Date(data[d][0]);

                    var a = data[d][0].split(/[^0-9]/);
                    var date = new Date(a[0], a[1] - 1, a[2]);

                    // console.log(data[d][0] + " --- " + date);
                    var aux = [date, data[d][1], data[d][2], data[d][3], data[d][4], data[d][5]]; // NUNOALEX this is hardcoded...


                    dataAux.push(aux);
                    // accumPush(dataAux, aux, "date", retData.aggrmethod);
                    // console.log('dataAux');
                    // console.log(dataAux);

                    // var aux2 = { date:date, rawDate:data[d][0], value:data[d][1]};
                    var aux2 = {
                        date: date,
                        rawDate: data[d][0],
                        value: data[d][1],
                        category: data[d][2],
                        product: data[d][3],
                        promoter: data[d][4],
                        hour: data[d][5]
                    };
                    // console.log(aux2.date + " --- " + aux2.rawDate);

                    $scope.readings.push(aux2);
                    // accumPush($scope.readings, aux2, "rawdate");
                }
            }
            // dataAux.sort(function(a,b){
            //   return new Date(a[0]) - new Date(b[0]);
            // });
            // console.log('dataAux');
            // console.log(dataAux);

            // $scope.readings.sort(function(a,b){
            //   return new Date(a.rawDate) - new Date(b.rawDate);
            // });

            // console.log('$scope.readings');
            // console.log($scope.readings);

            var valuesAux = retData.aggr_result.map(function(val) {
                return [new Date(val.valuesjson["f1"]), parseFloat(val.valuesjson["f2"].toFixed(2))];
            });

            $scope.indicator.value = retData.aggr_result[retData.aggr_result.length - 1].valuesjson["f2"];

            $scope.exampleData = [{
                "key": "History",
                "values": valuesAux
            }];
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    };



    $scope.deleteReading = function(date, hour) {
        console.log("deleteReading " + date + " at hour " + hour);

        // find postion and splice
        for (var i in $scope.readings) {
            var hourTest = true;
            if (hour != undefined && hour != null) {
                if (!$scope.readings[i].hasOwnProperty('hour')) {
                    hourTest = false;
                } else {
                    if ($scope.readings[i].hour != hour) {
                        hourTest = false;
                    }
                }
            }
            if ($scope.readings[i].rawDate == date && hourTest) {
                console.log("FOUND " + i);
                $scope.readings.splice(i, 1);
                dataAux.splice(i, 1);

                $scope.exampleData = [{
                    "key": "History",
                    "values": dataAux
                }];

                // console.log($scope.readings[i]);
                // console.log(dataAux[i]);

                // send delete to api
                // '/api/indicatorReadings/'+$scope.iid+'/'+date
                var query = '/api/indicatorReadings/' + $scope.iid + '/' + date;
                if (hour != undefined && hour != null) {
                    query += '/' + hour;
                }

                console.log('delete query');
                console.log(query);

                $http.delete(query).
                success(function(data) {
                    // here splice

                    console.log("deleted");
                });

            }
        }


    }


};


EditIndicatorCtrl.$inject = ['$scope', '$http', '$routeParams', 'socket', 'Profile', 'Occurrences', '$location', 'sharedCommsService'];

function EditIndicatorCtrl($scope, $http, $routeParams, socket, Profile, Occurrences, $location, sharedCommsService) {
    console.log('EditIndicatorCtrl');

    $scope.loading = false;
    $scope.occLoading = false;

    $scope.$on('$locationChangeSuccess', function(event) {
        if ($location.path().indexOf('/map') >= 0)
            $scope.loading = true

        if ($location.path().indexOf('/occurrences') >= 0)
            $scope.occLoading = true
    })

    $scope.occurrences = Occurrences.occurrences;

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.showOpenOcc = false;
    console.log($scope.showOpenOcc);
    $scope.openOcc = Occurrences.openOcc;

    if ($scope.openOcc > 0)
        $scope.showOpenOcc = true;
    else
        $scope.showOpenOcc = false;

    console.log($scope.showOpenOcc);

    $scope.$watch('currOccurrence.status', function() {
        $scope.openOcc = Occurrences.openOcc;

        if ($scope.openOcc > 0)
            $scope.showOpenOcc = true;
        else
            $scope.showOpenOcc = false;

        console.log($scope.showOpenOcc);
    });



    $scope.pid = $routeParams.pid;
    $scope.iid = $routeParams.iid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.userProfile = Profile.userprofile;
    console.log(Profile.userprofile);

    $http.get('/api/pointdashboard/' + $scope.pid + "/" + $scope.pointid).
    success(function(data, status) {
        $scope.project = data.project;
        $scope.pointname = nameFromAttributes(data.pattributes, $scope.pointid);
        console.log($scope.pointname);

    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });



    if ($scope.pointid == undefined || $scope.pointid == '') {
        $scope.backUrl = '/dashboard/' + $scope.pid;
    } else {
        $scope.backUrl = '/dashboard/' + $scope.pid + '/' + $scope.pointid;
    }

    // source pid iid
    var query = '/api/indicator/' + $scope.pid + '/' + $scope.iid;

    // get indicator by pid iid
    $http.get(query).
    success(function(data, status) {
        // console.log('got indicator data');
        // console.log(data);
        $scope.form = data.indicator;


        $http.get('/api/tasklists/' + $scope.pid).
        success(function(data, status) {
            // console.log('got tasklists data');
            // console.log(data);
            for (var i in data) {
                var aux = data[i];
                var obj = {
                    "occtyp_id": aux.tasklistid,
                    "occtype_title": aux.tasklist.title
                };
                $scope.occtypes.push(obj);
                if (obj.occtyp_id == $scope.form.occtypeid_typ)
                    $scope.form.occ = obj;
            }
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });


    $scope.occtypes = new Array();


    // function to edit with validations
    $scope.editIndicator = function() {
        // // console.log('editIndicator');
        $scope.lastAddedMsg = '';

        // // console.log(!$scope.form.hasOwnProperty('title') || $scope.form.title == '');

        if (!$scope.form.hasOwnProperty('title') || $scope.form.title == '') {
            $scope.lastAddedMsg = "Missing the required field Title!";
            $scope.lastAddedMsgStyle = 'color: red;';
        } else {


            if ($scope.form.alarm == "yes") {
                if (!$scope.form.hasOwnProperty('min') || !$scope.form.hasOwnProperty('max') || $scope.form.min == '' || $scope.form.max == '') {
                    $scope.lastAddedMsg = "Missing one of the required fields Minimum or Maximum!";
                    $scope.lastAddedMsgStyle = 'color: red;';
                    return;
                } else {
                    if (!(parseFloat($scope.form.min) < parseFloat($scope.form.max))) {
                        $scope.lastAddedMsg = "Minimum is not smaller than Maximum. Adjust the values correctly!";
                        $scope.lastAddedMsgStyle = 'color: red;';
                        return;
                    }
                }
            }

            // // console.log("PASSED");
            // return;

            $http.post('/api/updateIndicator/' + $scope.pid + '/' + $scope.iid, $scope.form).
            success(function(data, status) {
                // // console.log("yeah edit!" + status);
                // // console.log(data);

                if (data.err) {
                    $scope.lastAddedMsg = data.err;
                } else {
                    // $scope.indicators = data;
                    $scope.lastAddedMsg = "Indicator " + $scope.form.title + " edited with success.";
                    $scope.lastAddedMsgStyle = 'color: green;';
                    // // // console.log(data);
                }
            }).
            error(function(data, status) {
                // $scope.data = data || "Request failed";
                $scope.lastAddedMsg = data || "Request failed";
                $scope.lastAddedMsgStyle = 'color: red;';
            });
        }

    }
};


ParameterCtrl.$inject = ['$scope', '$http', '$routeParams', 'socket', 'socketSelf', 'sharedCommsService'];

function ParameterCtrl($scope, $http, $routeParams, socket, socketSelf, sharedCommsService) {
    socket.on('send:value', function(elem) {
        // // // console.log("received value!");
        if (elem.parmid == $scope.parmid)
            $scope.parameter.value = elem.value;
    });

    console.log('ParameterCtrl');
    $scope.pid = $routeParams.pid;
    $scope.iid = $routeParams.iid;
    $scope.parmid = $routeParams.parmid;
    if ($routeParams.pointid != undefined)
        $scope.pointid = $routeParams.pointid;
    // // // console.log('pid: '+$scope.pid + ' iid: ' + $scope.iid + ' parmid: '+$scope.parmid);

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $http.get('/api/indicator/' + $scope.iid).
    success(function(data, status) {
        // // // console.log("yeah read!");
        // // // console.log(data);
        // $scope.project = data.title;
        $scope.indicator = data.indicator;
        $scope.parameters = data.parameters;
        // // // console.log($scope.indicators);
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });


    if ($scope.parmid != undefined) {
        // para view get parameter
        $http.get('/api/parameter/' + $scope.iid + '/' + $scope.parmid).
        success(function(data, status) {
            // // // console.log("yeah read!");
            // // // console.log(data);
            // $scope.project = data.title;
            $scope.parameter = data;
            // // // console.log($scope.indicators);
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

    $scope.form = {
        "alarm": "no"
    };

    $scope.submitNewParameter = function() {
        // console.log('submitNewParameter');



        if (!$scope.form.hasOwnProperty('title') || $scope.form.title == '') {
            $scope.lastAddedMsg = "Missing the required field Title!";
            $scope.lastAddedMsgStyle = 'color: red;';
        } else {


            if ($scope.form.alarm == "yes") {
                if (!$scope.form.hasOwnProperty('min') || !$scope.form.hasOwnProperty('max') || $scope.form.min == '' || $scope.form.max == '') {
                    $scope.lastAddedMsg = "Missing one of the required fields Minimum or Maximum!";
                    $scope.lastAddedMsgStyle = 'color: red;';
                    return;
                } else {
                    if (!(parseFloat($scope.form.min) < parseFloat($scope.form.max))) {
                        $scope.lastAddedMsg = "Minimum is not smaller than Maximum. Adjust the values correctly!";
                        $scope.lastAddedMsgStyle = 'color: red;';
                        return;
                    }
                }
            }

            // // console.log("PASSED");
            // return;

            $http.post('/api/parameter/' + $scope.pid + '/' + $scope.iid, $scope.form).
            success(function(data, status) {
                // // // console.log("yeah write!" + status);
                // // // console.log(data);
                $scope.parameters = data;
                $scope.lastAddedMsg = "Parameter " + $scope.form.title + " added with success.";
                $scope.lastAddedMsgStyle = 'color: green;';
                $scope.form = {
                    "alarm": "no"
                };
            }).
            error(function(data, status) {
                // $scope.data = data || "Request failed";
                $scope.lastAddedMsg = data || "Request failed";
                $scope.lastAddedMsgStyle = 'color: red;';
            });

            // $scope.projects.push($scope.form);

            // fazer o post
            // obter o indicators q este post retorna
        }



    };


    $scope.readingsFormClass = 'display-none';
    $scope.iconConfig = 'fa-pencil';

    $scope.toggleShowReadingsForm = function() {
        // // // console.log("toggleShowReadingsForm");
        if ($scope.readingsFormClass == 'display-none') {
            $scope.readingsFormClass = 'display-block';
            $scope.iconConfig = 'fa-chevron-circle-up';
        } else {
            $scope.readingsFormClass = 'display-none';
            $scope.iconConfig = 'fa-pencil';
        }
    };


    $scope.readingForm = {};

    $scope.submitNewPointReading = function() {
        // // console.log('submitNewPointReading');
        // // console.log($scope.readingForm);

        $http.post('/api/parameterPointReadings/' + $scope.iid + '/' + $scope.parmid, $scope.readingForm).
        success(function(retData, status) {
            // // // console.log("yeah write parameterPointReadings!" + status);
            // // // console.log(data);

            var data = retData.result;
            checkAndEmitAlert($scope, data, socket, socketSelf);

            socket.emit('send:value', {
                pid: $scope.pid,
                iid: $scope.iid,
                parmid: $scope.parmid,
                pointid: $scope.pointid,
                value: data.value
            });

            $scope.parameter.value = data.value;
            $scope.readingForm = {};


        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

        // $scope.projects.push($scope.form);

    };


    $scope.submitNewPointMultipleReadings = function() {
        // // // console.log('submitNewPointMultipleReadings');
        // // // console.log($scope.sentence);
        // // // console.log(typeof($scope.sentence));
        var lines = $scope.sentence.split('\n');
        // // // console.log(lines);



        $http.post('/api/parameterPointMultipleReadings/' + $scope.iid + '/' + $scope.parmid, lines).
        success(function(data, status) {
            // // console.log("yeah write parameterPointMultipleReadings!" + status);
            // // console.log(data);

            $scope.parameter.value = data.value;
            checkAndEmitAlert($scope, data, socket, socketSelf);

            socket.emit('send:value', {
                pid: $scope.pid,
                iid: $scope.iid,
                parmid: $scope.parmid,
                pointid: $scope.pointid,
                value: data.value
            });


        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

        // $scope.projects.push($scope.form);
        $scope.sentence = '';

        // é uma coluna (apenas valor) ou sao duas colunas (data e valor)
        // se sao duas colunas, fazer a divisao [data, valor] para dois arrays
        // fazer mais a frente qd suportarmos datas no historico

        // partir por cada \n

        // construir array
        // enviar array no post
        // dps na api, é juntar ao array actual adicionando os readids correctos

    }
};

EditParameterCtrl.$inject = ['$scope', '$http', '$routeParams', 'socket', 'sharedCommsService'];

function EditParameterCtrl($scope, $http, $routeParams, socket, sharedCommsService) {

    $scope.pid = $routeParams.pid;
    $scope.iid = $routeParams.iid;
    $scope.parmid = $routeParams.parmid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    console.log('EditParameterCtrl');

    if ($scope.pointid == undefined || $scope.pointid == '') {
        $scope.backUrl = '/indicator/' + $scope.pid + '/' + $scope.iid;
    } else {
        $scope.backUrl = '/indicator/' + $scope.pid + '/' + $scope.iid + '/' + $scope.pointid;
    }


    var query = '/api/parameter/' + $scope.iid + '/' + $scope.parmid;

    $http.get(query).
    success(function(data, status) {
        // // console.log('got indicator data');
        // // console.log(data);
        $scope.form = data;
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });



    // function to edit with validations
    $scope.editParameter = function() {
        // // console.log('editIndicator');
        $scope.lastAddedMsg = '';

        // // console.log(!$scope.form.hasOwnProperty('title') || $scope.form.title == '');

        if (!$scope.form.hasOwnProperty('title') || $scope.form.title == '') {
            $scope.lastAddedMsg = "Missing the required field Title!";
            $scope.lastAddedMsgStyle = 'color: red;';
        } else {


            if ($scope.form.alarm == "yes") {
                if (!$scope.form.hasOwnProperty('min') || !$scope.form.hasOwnProperty('max') || $scope.form.min == '' || $scope.form.max == '') {
                    $scope.lastAddedMsg = "Missing one of the required fields Minimum or Maximum!";
                    $scope.lastAddedMsgStyle = 'color: red;';
                    return;
                } else {
                    if (!(parseFloat($scope.form.min) < parseFloat($scope.form.max))) {
                        $scope.lastAddedMsg = "Minimum is not smaller than Maximum. Adjust the values correctly!";
                        $scope.lastAddedMsgStyle = 'color: red;';
                        return;
                    }
                }
            }

            // // console.log("PASSED");
            // return;

            $http.post('/api/updateParameter/' + $scope.pid + '/' + $scope.iid + '/' + $scope.parmid, $scope.form).
            success(function(data, status) {
                // // console.log("yeah edit!" + status);
                // // console.log(data);

                if (data.err) {
                    $scope.lastAddedMsg = data.err;
                } else {
                    // $scope.indicators = data;
                    $scope.lastAddedMsg = "Parameter " + $scope.form.title + " edited with success.";
                    $scope.lastAddedMsgStyle = 'color: green;';
                    // // // console.log(data);
                }
            }).
            error(function(data, status) {
                // $scope.data = data || "Request failed";
                $scope.lastAddedMsg = data || "Request failed";
                $scope.lastAddedMsgStyle = 'color: red;';
            });
        }

    }

}


ParameterPointCtrl.$inject = ['$scope', '$http', '$routeParams', 'socket', 'socketSelf', 'sharedCommsService'];

function ParameterPointCtrl($scope, $http, $routeParams, socket, socketSelf, sharedCommsService) {
    console.log('ParameterPointCtrl');

    socket.on('send:value', function(elem) {
        // // // console.log("received value!");
        if (elem.parmid == $scope.pointparmid)
            $scope.parameter.value = elem.value;
    });

    $scope.pid = $routeParams.pid;
    $scope.iid = $routeParams.iid;
    $scope.pointparmid = $routeParams.pointparmid;
    $scope.pointid = $routeParams.pointid;
    // // // console.log('pid: '+$scope.pid + ' iid: ' + $scope.iid + ' parmid: '+$scope.parmid);

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.lastAddedMsg = '';
    $scope.form = {
        "alarm": "no"
    };
    $scope.parameter = {};

    $http.get('/api/indicator/' + $scope.iid + '/' + $scope.pointid).
    success(function(data, status) {
        // // // console.log("yeah read!");
        // // // console.log(data);
        // $scope.project = data.title;
        $scope.indicator = data.indicator;
        $scope.parameters = data.parameters;
        // // // console.log($scope.parameters);
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });


    if ($scope.pointparmid != undefined) {
        // para view get parameter
        // // // console.log("GOING TO FETCH FOR iid and PointParmID: "+'/api/parameter/'+$scope.iid+'/'+$scope.pointparmid);
        $http.get('/api/parameterPoint/' + $scope.iid + '/' + $scope.pointparmid).
        success(function(data, status) {
            // // // console.log("yeah read!");
            // // // console.log(data);
            // $scope.project = data.title;
            $scope.parameter = data;
            // // // console.log($scope.indicators);
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }


    $scope.submitNewParameter = function() {
        // // // console.log('submitNewParameter');
        // // // console.log($scope.form);


        if (!$scope.form.hasOwnProperty('title') || $scope.form.title == '') {
            $scope.lastAddedMsg = "Missing the required field Title!";
            $scope.lastAddedMsgStyle = 'color: red;';
        } else {


            if ($scope.form.alarm == "yes") {
                if (!$scope.form.hasOwnProperty('min') || !$scope.form.hasOwnProperty('max') || $scope.form.min == '' || $scope.form.max == '') {
                    $scope.lastAddedMsg = "Missing one of the required fields Minimum or Maximum!";
                    $scope.lastAddedMsgStyle = 'color: red;';
                    return;
                } else {
                    if (!(parseFloat($scope.form.min) < parseFloat($scope.form.max))) {
                        $scope.lastAddedMsg = "Minimum is not smaller than Maximum. Adjust the values correctly!";
                        $scope.lastAddedMsgStyle = 'color: red;';
                        return;
                    }
                }
            }

            // // console.log("PASSED");
            // return;

            $http.post('/api/parameter/' + $scope.pid + '/' + $scope.iid + '/' + $scope.pointid, $scope.form).
            success(function(data, status) {
                // // // console.log("yeah write!" + status);
                // // // console.log(data);
                $scope.parameters = data;
                $scope.lastAddedMsg = "Parameter " + $scope.form.title + " added with success.";
                $scope.lastAddedMsgStyle = 'color: green;';
                $scope.form = {
                    "alarm": "no"
                };
            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });

            // $scope.projects.push($scope.form);

            // fazer o post
            // obter o indicators q este post retorna
        }



    };


    $scope.readingsFormClass = 'display-none';
    $scope.iconConfig = 'fa-pencil';

    $scope.toggleShowReadingsForm = function() {
        // // // console.log("toggleShowReadingsForm");
        if ($scope.readingsFormClass == 'display-none') {
            $scope.readingsFormClass = 'display-block';
            $scope.iconConfig = 'fa-chevron-circle-up';
        } else {
            $scope.readingsFormClass = 'display-none';
            $scope.iconConfig = 'fa-pencil';
        }
    };


    $scope.readingForm = {};

    $scope.submitNewPointReading = function() {
        // // console.log('submitNewPointReading');
        // // console.log($scope.readingForm);

        $http.post('/api/parameterPointReadings/' + $scope.iid + '/' + $scope.pointparmid, $scope.readingForm).
        success(function(retData, status) {
            // // // console.log("yeah write parameterPointReadings!" + status);
            // // // console.log(data);

            var data = retData.result;
            checkAndEmitAlert($scope, data, socket, socketSelf);

            socket.emit('send:value', {
                pid: $scope.pid,
                iid: $scope.iid,
                parmid: $scope.pointparmid,
                pointid: $scope.pointid,
                value: data.value
            });

            $scope.parameter.value = data.value;
            $scope.readingForm = {};


        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

        // $scope.projects.push($scope.form);

    };


    $scope.submitNewPointMultipleReadings = function() {
        // // // console.log('submitNewPointMultipleReadings');
        // // // console.log($scope.sentence);
        // // // console.log(typeof($scope.sentence));
        var lines = $scope.sentence.split('\n');
        // // // console.log(lines);



        $http.post('/api/parameterPointMultipleReadings/' + $scope.iid + '/' + $scope.pointparmid, lines).
        success(function(data, status) {
            // // // console.log("yeah write parameterPointMultipleReadings!" + status);
            // // // console.log(data);

            $scope.parameter.value = data.value;
            checkAndEmitAlert($scope, data, socket, socketSelf);

            socket.emit('send:value', {
                pid: $scope.pid,
                iid: $scope.iid,
                parmid: $scope.pointparmid,
                pointid: $scope.pointid,
                value: data.value
            });

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

        // $scope.projects.push($scope.form);
        $scope.sentence = '';

        // é uma coluna (apenas valor) ou sao duas colunas (data e valor)
        // se sao duas colunas, fazer a divisao [data, valor] para dois arrays
        // fazer mais a frente qd suportarmos datas no historico

        // partir por cada \n

        // construir array
        // enviar array no post
        // dps na api, é juntar ao array actual adicionando os readids correctos

    }


};


// function ExampleCtrl2($scope, $http, $routeParams){
//   // // console.log('ExampleCtrl2');
//   var pid = $routeParams.pid;
//   var iid = $routeParams.iid;
//   var parmid = $routeParams.parmid;

//             $scope.exampleData = [
//                 {
//                     "key": "Series 1",
//                     "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] , [ 1059624000000 , 11.341210982529] , [ 1062302400000 , 14.734820409020] , [ 1064894400000 , 12.387148007542] , [ 1067576400000 , 18.436471461827] , [ 1070168400000 , 19.830742266977] , [ 1072846800000 , 22.643205829887] , [ 1075525200000 , 26.743156781239] , [ 1078030800000 , 29.597478802228] , [ 1080709200000 , 30.831697585341] , [ 1083297600000 , 28.054068024708] , [ 1085976000000 , 29.294079423832] , [ 1088568000000 , 30.269264061274] , [ 1091246400000 , 24.934526898906] , [ 1093924800000 , 24.265982759406] , [ 1096516800000 , 27.217794897473] , [ 1099195200000 , 30.802601992077] , [ 1101790800000 , 36.331003758254] , [ 1104469200000 , 43.142498700060] , [ 1107147600000 , 40.558263931958] , [ 1109566800000 , 42.543622385800] , [ 1112245200000 , 41.683584710331] , [ 1114833600000 , 36.375367302328] , [ 1117512000000 , 40.719688980730] , [ 1120104000000 , 43.897963036919] , [ 1122782400000 , 49.797033975368] , [ 1125460800000 , 47.085993935989] , [ 1128052800000 , 46.601972859745] , [ 1130734800000 , 41.567784572762] , [ 1133326800000 , 47.296923737245] , [ 1136005200000 , 47.642969612080] , [ 1138683600000 , 50.781515820954] , [ 1141102800000 , 52.600229204305] , [ 1143781200000 , 55.599684490628] , [ 1146369600000 , 57.920388436633] , [ 1149048000000 , 53.503593218971] , [ 1151640000000 , 53.522973979964] , [ 1154318400000 , 49.846822298548] , [ 1156996800000 , 54.721341614650] , [ 1159588800000 , 58.186236223191] , [ 1162270800000 , 63.908065540997] , [ 1164862800000 , 69.767285129367] , [ 1167541200000 , 72.534013373592] , [ 1170219600000 , 77.991819436573] , [ 1172638800000 , 78.143584404990] , [ 1175313600000 , 83.702398665233] , [ 1177905600000 , 91.140859312418] , [ 1180584000000 , 98.590960607028] , [ 1183176000000 , 96.245634754228] , [ 1185854400000 , 92.326364432615] , [ 1188532800000 , 97.068765332230] , [ 1191124800000 , 105.81025556260] , [ 1193803200000 , 114.38348777791] , [ 1196398800000 , 103.59604949810] , [ 1199077200000 , 101.72488429307] , [ 1201755600000 , 89.840147735028] , [ 1204261200000 , 86.963597532664] , [ 1206936000000 , 84.075505208491] , [ 1209528000000 , 93.170105645831] , [ 1212206400000 , 103.62838083121] , [ 1214798400000 , 87.458241365091] , [ 1217476800000 , 85.808374141319] , [ 1220155200000 , 93.158054469193] , [ 1222747200000 , 65.973252382360] , [ 1225425600000 , 44.580686638224] , [ 1228021200000 , 36.418977140128] , [ 1230699600000 , 38.727678144761] , [ 1233378000000 , 36.692674173387] , [ 1235797200000 , 30.033022809480] , [ 1238472000000 , 36.707532162718] , [ 1241064000000 , 52.191457688389] , [ 1243742400000 , 56.357883979735] , [ 1246334400000 , 57.629002180305] , [ 1249012800000 , 66.650985790166] , [ 1251691200000 , 70.839243432186] , [ 1254283200000 , 78.731998491499] , [ 1256961600000 , 72.375528540349] , [ 1259557200000 , 81.738387881630] , [ 1262235600000 , 87.539792394232] , [ 1264914000000 , 84.320762662273] , [ 1267333200000 , 90.621278391889] , [ 1270008000000 , 102.47144881651] , [ 1272600000000 , 102.79320353429] , [ 1275278400000 , 90.529736050479] , [ 1277870400000 , 76.580859994531] , [ 1280548800000 , 86.548979376972] , [ 1283227200000 , 81.879653334089] , [ 1285819200000 , 101.72550015956] , [ 1288497600000 , 107.97964852260] , [ 1291093200000 , 106.16240630785] , [ 1293771600000 , 114.84268599533] , [ 1296450000000 , 121.60793322282] , [ 1298869200000 , 133.41437346605] , [ 1301544000000 , 125.46646042904] , [ 1304136000000 , 129.76784954301] , [ 1306814400000 , 128.15798861044] , [ 1309406400000 , 121.92388706072] , [ 1312084800000 , 116.70036100870] , [ 1314763200000 , 88.367701837033] , [ 1317355200000 , 59.159665765725] , [ 1320033600000 , 79.793568139753] , [ 1322629200000 , 75.903834028417] , [ 1325307600000 , 72.704218209157] , [ 1327986000000 , 84.936990804097] , [ 1330491600000 , 93.388148670744]]
//                 }
//             ];

//             $scope.xAxisTickFormat = function(){
//                 return function(d){
//                     return d3.time.format('%x')(new Date(d));
//                 }
//             };

//             $scope.toolTipContentFunction = function(){
//                 return function(key, x, y, e, graph) {
//                     // // console.log('tooltip content');
//                     return  'Super New Tooltip' +
//                             '<h1>' + key + '</h1>' +
//                             '<p>' +  y + ' at ' + x + '</p>'
//                 }
//             };


//             var q = '/api/parameterPointReadings/'+iid;
//             if(parmid != null && parmid != undefined)
//               q+='/'+parmid;

//             $http.get(q).
//               success(function(data, status) {
//                 // // // console.log("yeah read readings!");
//                 // // // console.log(data);

//                 var dataAux = [];


//                 for(var d in data){
//                   // // // console.log(data[d]);
//                   if(data[d][1] != null){
//                     // var date = new Date(data[d][0]);

//                     var a = data[d][0].split(/[^0-9]/);
//                     var date = new Date(a[0], a[1]-1, a[2]);

//                     // // console.log(date);
//                     var aux = [date, data[d][1]];
//                     dataAux.push(aux);
//                   }
//                 }
//                 dataAux.sort(function(a,b){
//                   return new Date(a[0]) - new Date(b[0]);
//                 });
//                 // // // console.log('dataAux');
//                 // // // console.log(dataAux);



//                 $scope.exampleData = [
//                   {
//                       "key": "History",
//                       "values": dataAux
//                   }];
//               }).
//               error(function (data, status) {
//                 $scope.data = data || "Request failed";
//               });

//         }


function ExampleOrderedCtrl($scope, $http, $routeParams) {
    console.log("ExampleOrderedCtrl");

    var pid = $routeParams.pid;
    var iid = $routeParams.iid;
    var parmid = $routeParams.parmid;

    // isto tb vai ser importante para o outro grafico
    $scope.xAxisTickFormatFunction = function() {
        return function(d) {
            return d3.time.format('%b')(new Date(d));
        }
    }


    var colorCategory = d3.scale.category20b();
    $scope.colorFunction = function() {
        return function(d, i) {
            return colorCategory(i);
        };
    }


    $scope.exampleDataRanking = [{
        "key": "Series 1",
        "values": [
            [3, 88],
            [8, 55],
            [2, 30],
            [5, 20],
            [10, 19],
            [9, 18]
        ]
    }];

    $http.get('/api/orderedPointValuesOfParameter/' + pid + '/' + iid + '/' + parmid).
    success(function(data, status) {
        // // // console.log("read ordered pointvalues");
        // // // console.log(data);
        $scope.exampleDataRanking = [{
            "key": "Series 1",
            "values": data.ranking
        }];
    }).
    error(function(data, status) {});
}



function accumPush(arr, elem, keyField, aggrmethod, filterSpec, widgetDate) {
    // console.log("unit");
    // console.log(unit);

    // arr has structure [ [date, value, counter] ]

    for (var i = 0; i < arr.length; i++) {

        if (keyField == "date") {
            if (arr[i][0].getTime() == elem[0].getTime()) {

                // if(i==9)
                //   console.log(" ");

                // GM-2#5
                if (aggrmethod == 'average') {
                    // this is hardcoded, assuming counter position is 5
                    arr[i][5]++;
                    var ctr = arr[i][5];
                    arr[i][1] = arr[i][1] * (ctr - 1) / ctr + +elem[1] / ctr;
                } else {
                    arr[i][1] += +elem[1];
                }

                return true;
            }
        }

        if (keyField == "rawdate") {
            if (arr[i].date.getTime() == elem.date.getTime()) {
                arr[i].value += +elem.value;
                return true;
            }
        }
    }
    // scanned all entries on arr and didn't find existing date.
    // add new entry

    if (filterSpec.dates.state == undefined || (filterSpec.dates.startdate == "" && (filterSpec.dates.enddate == "" || filterSpec.dates.finishdate == ""))) {
        // if(filterSpec.dates.state == undefined){
        var date = new Date();
        if (widgetDate != null && widgetDate != undefined) {
            date = new Date(widgetDate);
        }
        date.setDate(date.getDate() - 30);
        date.setHours(0, 0, 0, 0);

        if (elem[0] >= date) {
            arr.push(elem.concat([1]));
            return true;
        } else {
            return false;
        }
    } else {
        arr.push(elem.concat([1]));
        return true;
    }
}


function ExampleCtrl($scope, $http, $routeParams, socket) {

    socket.on('send:value', function(elem) {
        // // console.log("received value on ExampleCtrl!");
        if (elem.parmid == parmid)
            $scope.refreshChart();
    });


    console.log("ExampleCtrl");
    var pid = $routeParams.pid;
    var iid = $routeParams.iid;
    var parmid = $routeParams.parmid;



    // para isto, é preciso colocar o xAxisTickFormat="xAxisTickFormatFunction()" na tag
    // $scope.exampleDataRanking = [
    // {
    // "key": "Series 1",
    // "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] ]
    // }
    // ];

    // [ [ pointid, value]* ]


    $scope.xAxisTickFormatFunction = function() {
        // return function(d){
        //     return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
        // }
        return function(d) {
            // return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
            return d3.time.format("%Y-%m-%d")(new Date(d));
        }
    }



    $scope.exampleData = [{
        "key": "History",
        "values": []
    }];

    $scope.readings = [];
    var dataAux = [];


    $scope.refreshChart = function() {
        // // console.log('refreshChart');
        var q = '/api/parameterPointReadings/' + iid;

        $http.get(q).
        success(function(retData, status) {
            console.log("yeah read readings!");
            console.log(retData);


            var data = retData.result;

            dataAux = [];
            $scope.readings = [];

            for (var d in data) {
                // // // console.log(data[d]);
                if (data[d][1] != null) {
                    // var date = new Date(data[d][0]);

                    var a = data[d][0].split(/[^0-9]/);
                    var date = new Date(a[0], a[1] - 1, a[2]);

                    // console.log(data[d][0] + " --- " + date);
                    var aux = [date, data[d][1], data[d][2], data[d][3], data[d][4], data[d][5]]; // NUNOALEX this is hardcoded...


                    dataAux.push(aux);
                    // accumPush(dataAux, aux, "date", retData.aggrmethod);
                    // console.log('dataAux');
                    // console.log(dataAux);

                    // var aux2 = { date:date, rawDate:data[d][0], value:data[d][1]};
                    var aux2 = {
                        date: date,
                        rawDate: data[d][0],
                        value: data[d][1],
                        category: data[d][2],
                        product: data[d][3],
                        promoter: data[d][4],
                        hour: data[d][5]
                    };
                    // console.log(aux2.date + " --- " + aux2.rawDate);

                    $scope.readings.push(aux2);
                    // accumPush($scope.readings, aux2, "rawdate");
                }
            }
            // dataAux.sort(function(a,b){
            //   return new Date(a[0]) - new Date(b[0]);
            // });
            // console.log('dataAux');
            // console.log(dataAux);

            // $scope.readings.sort(function(a,b){
            //   return new Date(a.rawDate) - new Date(b.rawDate);
            // });

            // console.log('$scope.readings');
            // console.log($scope.readings);

            var valuesAux = retData.aggr_result.map(function(val) {
                return [new Date(val.valuesjson["f1"]), parseFloat(val.valuesjson["f2"].toFixed(2))];
            });

            $scope.indicator.value = retData.aggr_result[retData.aggr_result.length - 1].valuesjson["f2"];

            $scope.exampleData = [{
                "key": "History",
                "values": valuesAux
            }];
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    };



    $scope.refreshChart();

    $scope.deleteReading = function(date, hour) {
        console.log("deleteReading " + date + " at hour " + hour);

        // find postion and splice
        for (var i in $scope.readings) {
            var hourTest = true;
            if (hour != undefined && hour != null) {
                if (!$scope.readings[i].hasOwnProperty('hour')) {
                    hourTest = false;
                } else {
                    if ($scope.readings[i].hour != hour) {
                        hourTest = false;
                    }
                }
            }
            if ($scope.readings[i].rawDate == date && hourTest) {
                console.log("FOUND " + i);
                $scope.readings.splice(i, 1);
                dataAux.splice(i, 1);

                $scope.exampleData = [{
                    "key": "History",
                    "values": dataAux
                }];

                // console.log($scope.readings[i]);
                // console.log(dataAux[i]);

                // send delete to api
                // '/api/indicatorReadings/'+$scope.iid+'/'+date
                var query = '/api/indicatorReadings/' + $scope.iid + '/' + date;
                if (hour != undefined && hour != null) {
                    query += '/' + hour;
                }

                console.log('delete query');
                console.log(query);

                $http.delete(query).
                success(function(data) {
                    // here splice

                    console.log("deleted");
                });

            }
        }


    }

}


function ExamplePointCtrl($scope, $http, $routeParams, socket) {


    socket.on('send:value', function(elem) {
        // // console.log("received value on chart ctrl!");
        if (elem.parmid == pointparmid)
            $scope.refreshChart();
    });

    console.log("ExamplePointCtrl");
    var iid = $routeParams.iid;
    var pointparmid = $routeParams.pointparmid;
    var pid = $routeParams.pid;

    // :pid/:iid/:pointparmid/:pointid

    $scope.xAxisTickFormatFunction = function() {
        // return function(d){
        //     return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
        // }
        return function(d) {
            // return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
            return d3.time.format("%Y-%m-%d")(new Date(d));
        }
    }

    $scope.exampleData = [{
        "key": "History",
        "values": []
    }];



    $scope.refreshChart = function() {
        // // console.log('refreshChart');
        var q = '/api/parameterPointReadings/' + iid;
        if (pointparmid != null && pointparmid != undefined)
            q += '/' + pointparmid;

        $http.get(q).
        success(function(data, status) {
            // // // console.log("yeah read readings!");
            var dataAux = [];

            for (var d in data) {
                // // // console.log(data[d]);
                if (data[d][1] != null) {
                    // var date = new Date(data[d][0]);

                    var a = data[d][0].split(/[^0-9]/);
                    var date = new Date(a[0], a[1] - 1, a[2]);

                    // // console.log(date);
                    var aux = [date, data[d][1]];
                    dataAux.push(aux);
                }
            }
            dataAux.sort(function(a, b) {
                return new Date(a[0]) - new Date(b[0]);
            });


            $scope.exampleData = [{
                "key": "History",
                "values": dataAux
            }];
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    };



    $scope.refreshChart();
}



function BulletCtrl($scope) {
    $scope.bulletData = {
        "ranges": [1, 180, 300],
        "measures": [70],
        "markers": [100]
    };

    $scope.bulletDataRead = {
        "ranges": [1, 3, 5],
        "measures": [3.5],
        "markers": [4.7]
    };

}



function attributize(str) {
    if (str == null || str == undefined || str == "" || str == "undefined") {
        return 'n/a';
    } else {
        // // console.log(str + " => " + str.split(' ').join('_'));
        return str.split(' ').join('_');
    }
}

function js_yyyy_mm_dd_hh_mm_ss() {
    var now = new Date();
    var year = "" + now.getFullYear();
    // var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    var months = new Array();
    months[0] = "January";
    months[1] = "February";
    months[2] = "March";
    months[3] = "April";
    months[4] = "May";
    months[5] = "June";
    months[6] = "July";
    months[7] = "August";
    months[8] = "September";
    months[9] = "October";
    months[10] = "November";
    months[11] = "December";
    var month = months[now.getMonth()];
    var day = "" + now.getDate();
    if (day.length == 1) {
        day = "0" + day;
    }
    var hour = "" + now.getHours();
    if (hour.length == 1) {
        hour = "0" + hour;
    }
    var minute = "" + now.getMinutes();
    if (minute.length == 1) {
        minute = "0" + minute;
    }
    var second = "" + now.getSeconds();
    if (second.length == 1) {
        second = "0" + second;
    }
    return month + " " + day + " at " + hour + ":" + minute;
    // return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}


DemoAddPointController.$inject = ['$scope', '$http', '$routeParams', '$location', 'leafletData', 'sharedCommsService'];

function DemoAddPointController($scope, $http, $routeParams, $location, leafletData, sharedCommsService) {
    console.log("DemoAddPointController!!!");

    $scope.$on('handleBroadcast', function() {
        // console.log(">>>>>>>>>>> handleBroadcast");
        // console.log(sharedCommsService.message);
        // REFRESH
        if (sharedCommsService.message == "refreshPoints") {
            // getPointsOnDatabase(false);
            var pointId = sharedCommsService.pointsToRefresh.shift();
            console.log("Going to update map with point id: " + pointId);


            // ir a bd ler o ponto sharedCommsService.pointsToRefresh.shift()
            // adicionar o ponto ao $scope.markers


            var get_url = '/geoapi/' + $scope.pid + '/' + pointId;

            $http.get(get_url).
            success(function(data, status) {

                for (var d in data) {
                    console.log("putting on map: " + data[d].pointid);

                    $scope.markers.push({
                        lat: data[d].x,
                        lng: data[d].y,
                        pointid: data[d].pointid,
                        icon: $scope.iconGrey,
                        message: "added"
                    });

                }

            });


        } else if (sharedCommsService.message == "updatedAddMessage") {
            // console.log("MESSAGE:::: "+sharedCommsService.addMessage);
            $scope.ongoingAddMessage = sharedCommsService.addMessage + ' (' + js_yyyy_mm_dd_hh_mm_ss() + ')';
        }
    });

    $scope.pid = $routeParams.pid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.isTemplateNew = false;
    $scope.hasNewParms = false;

    $scope.queryList = [{
        name: 'Check Users',
        fields: ["Name", "Id"]
    }, {
        name: 'Audit Report',
        fields: []
    }, {
        name: 'Bounce Back Report',
        fields: ["Date"]
    }];
    $scope.models = {};
    $scope.$watch('addForm.template', function(newVal, oldVal) {
        // // console.log("template: ");
        // // console.log($scope.addForm.template);
        // // console.log($scope.select2Options.tags);

        if ($scope.addForm.template != undefined && $scope.addForm.template.length != 0) {
            $scope.isTemplateNew = true;
            for (var i in $scope.select2Options.tags) {
                // // console.log($scope.select2Options.tags[i].text + " " + $scope.addForm.template[0].text);
                if ($scope.select2Options.tags[i].text == $scope.addForm.template[0].text)
                    $scope.isTemplateNew = false;
            }
        } else {
            // // console.log("EMPTY THE scope.parameters because of TYPE FIELD empty");
            $scope.parameters = [];
        }
        // // console.log("is new? "+$scope.isTemplateNew);

        if ($scope.addForm.template != undefined && $scope.addForm.template[0] != undefined && $scope.addForm.template[0].hasOwnProperty('fields'))
            $scope.parameters = $scope.addForm.template[0].fields;
        // if ($scope.selectedQuery) {
        //     $scope.parameters = $scope.selectedQuery.fields;
        // }
    });

    $scope.addAttribute = function() {
        // // console.log($scope.select2Options.tags);
        // // console.log($scope.addForm.template);

        // if($scope.newAttr )


        if ($scope.addForm.template.length == 0) {
            $scope.addForm.template.push({
                "type": ''
            });
            $scope.isTemplateNew = true;
        }

        if ($scope.newAttr == undefined || $scope.newAttr == '') {
            // // console.log('$scope.newAttr is undefined or empty');
            return;
        }

        if ($scope.isTemplateNew == false) {
            $scope.select2Options.tags.forEach(function(elem) {
                // // console.log(elem.text + " == " + $scope.addForm.template[0].text);
                if (elem.text == $scope.addForm.template[0].text) {
                    if (!elem.hasOwnProperty('fields'))
                        elem.fields = [];
                    elem.fields.push($scope.newAttr);
                }
            });
        } else {
            if (!$scope.addForm.template[0].hasOwnProperty('fields'))
                $scope.addForm.template[0].fields = [];
            $scope.addForm.template[0].fields.push($scope.newAttr);
            $scope.parameters = $scope.addForm.template[0].fields;
        }
        $scope.hasNewParms = true;
        // procurar no tags qual tem o addform.template.text
        // e fazer push nesse tags.fields

        // dps ao fazer add point, tenho de ver se falta o ng-model...

        // $scope.additionalAttributes.push({title: $scope.newAttr});

        $scope.newAttr = '';
    }


    var availableTags = [{
            text: 'Apple',
            id: 1
        },
        // {text: 'Apricot', id: 2},
        // {text: 'Avocado', id: 3},
    ];

    $scope.itemsPointTemplates = [{
        id: 0,
        text: 'Add new Template'
    }];



    $scope.select2Options = {
        tags: [],
        // tags: availableTags,
        // tags: $scope.itemsPointTemplates,
        multiple: true, // TODO: dps tirar isto e adaptar o css para o select2 select
        // data: [],
        formatResult: function(item) {
            return item.text;
        },
        formatSelection: function(item) {
            return item.text;
        },
    }



    $scope.onDropdownChange = function() {

        if ($scope.addForm.template.id == 0)
            $location.path('addPointTemplate/' + $scope.pid);
        else
            $scope.toAdd.icon = $scope.addForm.template.title;


        // $scope.toAdd.icon = $scope.addForm.template;
        // // // console.log($scope.toAdd.icon);
    }


    $scope.addForm = {
        autoIndicators: 'yes',
        indicators: {}
    };

    $http.get('/api/dashboard/' + $scope.pid).
    success(function(data, status) {
        // // console.log("yeah read!");
        $scope.addForm.indicators = {};
        $scope.indicatorsComplete = {};
        data.indicators.forEach(function(elem) {
            // // console.log(elem);
            $scope.addForm.indicators[elem.iid] = true;
            $scope.indicatorsComplete[elem.iid] = {
                title: elem.title,
                unit: elem.unit,
                alarm: elem.alarm
            };
        });
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });


    $scope.templateAttributes = [];


    $http.get('/api/getPointTemplates/' + $scope.pid).
    success(function(data) {
        // // console.log("yeah getPointTemplates");
        // // console.log(data);
        // $scope.templateAttributes = data.pointTemplates;
        // $scope.itemsPointTemplates = data.itemsPointTemplates;
        // $scope.form.templateAttributes = $scope.templateAttributes;
        // $scope.itemsPointTemplates.push({ id: 0, title: 'Add new Template'});

        // availableTags = $scope.itemsPointTemplates;
        // $scope.select2Options.tags = data.itemsPointTemplates;
        // $scope.select2Options.tags.push({ id: 1, title: 'ASddsad'});

        // $scope.select2Options.data = new Array();


        data.forEach(function(elem) {

            // elem.fields = ['chapaid', 'anoconstrucao'];
            // // console.log(elem);

            $scope.select2Options.tags.push(elem);


        });



        // $scope.select2Options.data.push({text: 'Apricot', id: 2});

    }).
    error(function(data, status, headers, config) {
        // // console.log("error getProjectCenter");

    });


    $scope.form = {};

    $scope.submitNewAttribute = function() {
        console.log("submitNewAttribute");
        $scope.templateAttributes.push({
            attribute: $scope.typeattribute
        });
        $scope.form.templateAttributes = $scope.templateAttributes;
        $scope.typeattribute = '';
        // $scope.toAddAttribute = '';
        // $http.post('/api/addPointTemplate/', $scope.formToAdd).
        //   success(function(data) {
        //     // // console.log("yeah addPointTemplate");
        //     $scope.templateAttributes = data;
        //     $scope.formToAdd = {};
        //   }).
        //   error(function(data, status, headers, config) {
        //     // // console.log("error addPointTemplate");

        //   });
    };

    $scope.submitNewPointTemplate = function() {
        // // console.log("submitNewPointTemplate");
        // // console.log($scope.form);



        // $scope.itemsPointTemplates.push({id:5, title:$scope.form.templatename});
        // // // console.log($scope.itemsPointTemplates);

        $http.post('/api/addPointTemplate/', $scope.form).
        success(function(data) {
            // // console.log("yeah addPointTemplate");
            $scope.templateAttributes = data;
            $scope.form = {};
        }).
        error(function(data, status, headers, config) {
            // // console.log("error addPointTemplate");

        });
    };

    // // // console.log($scope);

    // leafletData.getMap().then(function(map) {
    //     // map.fitBounds([ [40.712, -74.227], [40.774, -74.125] ]);

    //     if($scope.pointid != null && $scope.pointid != undefined){
    //       // // // console.log("center on point");
    //       map.setView([32.666667,-16.75], 9);
    //     } else {
    //       // center on madeira ----- this is hardcoded!!!!!
    //       // // // console.log("center on map center");
    //       map.setView([32.666667,-16.85], 4);
    //     }
    // });



    $scope.addPointMode = false;
    $scope.addingPointClass = '';



    var tilesDict = {
        openstreetmap: {
            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            options: {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        },
        opencyclemap: {
            url: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
            options: {
                attribution: 'All maps &copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, map data &copy; <a href="http://www.openstreetmap.org">OpenStreetMap</a> (<a href="http://www.openstreetmap.org/copyright">ODbL</a>'
            }
        }
    };

    angular.extend($scope, {
        madeira: {
            zoom: 6
        }
    });

    $http.get('/api/getProjectCenter/' + $scope.pid).
    success(function(data) {
        // // console.log("yeah getProjectCenter");
        // $location.path('/projects');
        // // // console.log(data);
        if ($scope.markers.length == 0) {
            if (data.x != '' && data.x != undefined && data.x != null) {
                $scope.madeira.lat = data.x;
                $scope.madeira.lng = data.y;
                $scope.madeira.zoom = 10;
            } else {
                $scope.madeira.lat = 39.666667;
                $scope.madeira.lng = -8.133333;
                $scope.madeira.zoom = 6;
            }
        }

    }).
    error(function(data, status, headers, config) {
        // // console.log("error getProjectCenter");
        angular.extend($scope, {
            madeira: {
                lat: 39.666667,
                lng: -8.133333,
                zoom: 6
            }
        });
    });

    angular.extend($scope, {
        london: {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        },
        events: {},
        iconGrey: {
            type: 'awesomeMarker',
            icon: 'lock',
            markerColor: 'blue',
            opacity: 0
        },
        toAdd: {
            type: 'awesomeMarker',
            icon: 'question-circle',
            prefix: 'fa',
            markerColor: 'orange',
            opacity: 0
        },
        layers: {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                cycle: {
                    name: 'OpenCycleMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                google: {
                    name: 'Google Satellite',
                    layerType: 'SATELLITE',
                    type: 'google'
                }
            }
        }
    });


    $scope.markers = new Array();
    var addedPoint = false;

    // UNCOMMENT
    var unableClicks = false;
    $scope.$on("leafletDirectiveMap.movestart", function(event, args) {
        // console.log("leafletDirectiveMap.movestart");
        unableClicks = true;
    });
    $scope.$on("leafletDirectiveMap.moveend", function(event, args) {
        // console.log("leafletDirectiveMap.moveend");
        unableClicks = false;
    });


    // add markers - for now - only when addPoint mode is activated (dashboards)
    $scope.$on("leafletDirectiveMap.click", function(event, args) {
        // UNCOMMENT
        if (unableClicks)
            return;

        var leafEvent = args.leafletEvent;
        var point = leafEvent.latlng;
        console.log("map click " + $scope.addPointMode);
        // // console.log(point);
        if ($scope.addPointMode) {
            $scope.lastAddedMsg = '';

            $scope.addPoint();
            addedPoint = true;

            // $scope.markers.push({
            //     lat: leafEvent.latlng.lat,
            //     lng: leafEvent.latlng.lng,
            //     message: "My Added Marker"
            // });

            // var m1 = {
            //   lat: point.lat,
            //   lng: point.lng,
            //   // pointid: data.pointid,
            //   draggable: true
            //   // message: "Point "+data.pointid
            // };

            $scope.markers.push({
                lat: point.lat,
                lng: point.lng,
                // pointid: data.pointid,
                draggable: true,
                icon: $scope.toAdd
                    // message: "Point "+data.pointid
            });



            // // // console.log($scope.markers);
            // // // console.log($scope.markers[$scope.markers.length-1]);


            // $http.post('/geoapi/addPoint/'+$scope.pid, point).
            //   success(function(data) {
            //     // // // console.log("yeah postPoint added!");
            //     // $location.path('/projects');
            //     // // // console.log(data);

            //   });
        } else {
            // if clicked on map thinking of adding a marker when the marker is already there, center on the adding marker
            for (var i in $scope.markers) {
                if ($scope.markers[i].draggable) {
                    $scope.addForm.point = $scope.markers[i];
                    break;
                }
            }

            leafletData.getMap().then(function(map) {
                // map.fitBounds(bounds, {padding: [50, 50]});
                map.panTo([$scope.markers[i].lat, $scope.markers[i].lng])
            });

        }
    });



    $scope.submitNewPoint = function() {
        console.log("submitNewPoint");
        // // console.log(addedPoint);
        // // console.log($scope.addForm.template);
        // // console.log( $scope.addForm.template.length);



        // // console.log('$scope.models');
        // // console.log($scope.models);

        // // console.log('$scope.parameters');
        // // console.log($scope.parameters);


        if (!$scope.addForm.hasOwnProperty('attributes'))
            $scope.addForm.attributes = {
                name: '',
                observations: ''
            };

        $scope.parameters.forEach(function(elem) {
            $scope.addForm.attributes[attributize(elem)] = '';
        });

        for (var attrname in $scope.models) {
            $scope.addForm.attributes[attributize(attrname)] = $scope.models[attrname];
        }
        // // console.log($scope.addForm);
        // // console.log($scope.models);
        // return;

        // // console.log("add point");
        // // console.log($scope.addForm);

        // return;


        $scope.lastAddedMsg = '';

        if (!addedPoint) {
            $scope.lastAddedMsg = 'Point location is missing. Click on the map to add a point.';
            $scope.lastAddedMsgStyle = 'color: red;';
        } else {
            if ($scope.addForm.template.length > 1) {
                $scope.lastAddedMsg = "You have selected more than one type. Select only one type.";
                $scope.lastAddedMsgStyle = 'color: red;';
                return;
            }

            if ($scope.newAttr != undefined && $scope.newAttr != '') {
                $scope.lastAddedMsg = "You still have a new attribute to be added, named: " + $scope.newAttr + ". Press Add Attribute above or remove it.";
                $scope.lastAddedMsgStyle = 'color: red;';
                return;
            }

            // if($scope.addForm.template == undefined || $scope.addForm.template.length == 0){
            //   $scope.lastAddedMsg = 'The point type is missing... Input a new type and press enter or choose one from the list.';
            //   $scope.lastAddedMsgStyle = 'color: red;';
            // } else {

            // all ok, so lets see if we add or not a new point type or if we update the attributes

            // // console.log("IS TYPE A NEW TYPE? "+$scope.isTemplateNew);
            // // console.log("IS TYPE A NEW PARMS? "+$scope.hasNewParms);
            if ($scope.isTemplateNew) {
                $scope.select2Options.tags.push($scope.addForm.template[0]);
                // // console.log($scope.select2Options.tags);
                // add to db (template name, fields and oid)
                $http.post('/api/addPointTemplate/' + $scope.pid, $scope.addForm.template[0]).
                success(function(data) {
                    // // console.log("added pointTemplate");
                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                });

            } else {
                if ($scope.hasNewParms && ($scope.addForm.template.length > 0 || $scope.addForm.template[0].text != undefined || $scope.addForm.template[0].text != null)) {
                    // update

                    var fields = [];
                    for (var i in $scope.addForm.attributes) {
                        if (i != 'name' && i != 'observations')
                            fields.push(i);
                    }
                    // // console.log('updatign fields for tid '+$scope.addForm.template[0].tid);
                    // // console.log(fields);

                    $http.post('/api/addPointTemplateAttribute/' + $scope.addForm.template[0].tid, fields).
                    success(function(data) {
                        // // console.log("added addPointTemplateAttribute");
                    }).
                    error(function(data, status) {
                        $scope.data = data || "Request failed";
                    });
                }
            }

            // all done about adding or not a new point type, lets restart the control vars
            $scope.isTemplateNew = false;
            $scope.hasNewParms = false;

            // return;


            // pode dar bug se o user clicar antes dos markers lancarem...
            // tenho de ter uma flag a false que torna-se true quando os pontos carregarem
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // $scope.addForm.point = $scope.markers[$scope.markers.length-1];

            for (var i in $scope.markers) {
                if ($scope.markers[i].draggable) {
                    $scope.addForm.point = $scope.markers[i];
                    break;
                }
            }
            // // console.log('$scope.addForm.point');
            // // console.log($scope.addForm.point);

            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            console.log('$scope.addForm.template');
            console.log($scope.addForm.template);

            // return;
            if ($scope.addForm.template.length == 0)
                $scope.addForm.template.push({
                    "type": ''
                });
            else if ($scope.addForm.template[0].text == undefined || $scope.addForm.template[0].text == null)
                $scope.addForm.template[0].text = '';

            $http.post('/geoapi/addPoint/' + $scope.pid, $scope.addForm).
            success(function(data) {

                // $scope.addForm = { autoIndicators : 'yes', indicators : {} };
                // $scope.addForm.template = [];
                // delete $scope.addForm.template;

                // // console.log("add point");
                var pointToAdd = data;
                // // console.log(pointToAdd);


                $scope.addForm.attributes = {};
                $scope.addForm.point = {};

                for (var i in $scope.parameters) {
                    $scope.models[$scope.parameters[i]] = '';
                }

                var get_url = '/geoapi/' + $scope.pid;
                if ($scope.pointid != null || $scope.pointid != undefined)
                    get_url = '/geoapi/' + $scope.pid + '/' + $scope.pointid;

                $http.get(get_url).
                success(function(data, status) {

                    $scope.markers = new Array();

                    $scope.numOfPoints = data.length;

                    for (var d in data) {
                        // // // console.log(data[d]);

                        $scope.markers.push({
                            lat: data[d].x,
                            lng: data[d].y,
                            pointid: data[d].pointid,
                            icon: $scope.iconGrey,
                            message: "added"
                        });

                    }
                    var bounds = [];
                    for (var i = 0; i < $scope.markers.length; i++) {
                        bounds.push([$scope.markers[i].lat, $scope.markers[i].lng])
                    }
                    // if(bounds.length > 0){
                    //   leafletData.getMap().then(function(map){
                    //       map.fitBounds(bounds);
                    //   });
                    // }

                    $scope.addPoint();
                    addedPoint = false;

                    $scope.addForm.autoIndicators = 'no'; // feature was deactivated
                    if ($scope.addForm.autoIndicators == 'yes') {
                        // // console.log($scope.addForm.indicators);
                        for (var id in $scope.addForm.indicators) {
                            if ($scope.addForm.indicators.hasOwnProperty(id) && $scope.addForm.indicators[id]) {
                                // // console.log("adding indicator "+id+" to pointid "+pointToAdd.pointid);
                                // // console.log($scope.indicatorsComplete[id]);

                                var autoPointForm = {};
                                autoPointForm.id = id;
                                autoPointForm.title = $scope.indicatorsComplete[id].title;
                                autoPointForm.unit = $scope.indicatorsComplete[id].unit;
                                autoPointForm.alarm = $scope.indicatorsComplete[id].alarm;
                                autoPointForm.value = '';
                                autoPointForm.min = '';
                                autoPointForm.max = '';

                                $http.post('/api/indicator/' + $scope.pid + "/" + pointToAdd.pointid, autoPointForm).
                                success(function(data, status) {
                                    // // // console.log("yeah write!" + status);
                                    // // // console.log(data);
                                    // // console.log("addded auto indicator");

                                    // $scope.indicators = data;
                                    // $scope.lastAddedMsg = "Indicator "+$scope.form.title+" added with success.";
                                    // $scope.form = {"alarm":"no"};
                                }).
                                error(function(data, status) {
                                    $scope.data = data || "Request failed";
                                });
                            }
                        }
                    }
                    // $scope.indicatorsComplete[elem.iid]


                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                });

            });

            $scope.lastAddedMsg = 'Point added with success';
            $scope.lastAddedMsgStyle = 'color: green;';

        }



    };


    function getPointsOnDatabase(fitToBounds) {
        var get_url = '/geoapi/' + $scope.pid;
        if ($scope.pointid != null || $scope.pointid != undefined)
            get_url = '/geoapi/' + $scope.pid + '/' + $scope.pointid;

        // // console.log("get_url: "+get_url);

        $http.get(get_url).
        success(function(data, status) {
            // // // console.log("yeah read geoapi!");
            // // // console.log(data);
            // $scope.project = data.title;
            // $scope.parameter = data;
            // // // console.log($scope.indicators);

            $scope.numOfPoints = data.length;

            if (data.length == 0) {
                $scope.addPoint();
                // var modalDOM = angular.element('#myModal');
                // console.log("no points from geoapi");
                // modalDOM.modal({show:true});
            }

            for (var d in data) {
                // // // console.log(data[d]);

                $scope.markers.push({
                    lat: data[d].x,
                    lng: data[d].y,
                    pointid: data[d].pointid,
                    icon: $scope.iconGrey,
                    message: "added"
                });

                // // console.log("data.length: "+data.length);
                if (d == data.length - 1 && fitToBounds) {
                    $scope.addPoint();
                    // // console.log("got last geoapi point");
                }

            }

            var bounds = [];
            for (var i = 0; i < $scope.markers.length; i++) {
                bounds.push([$scope.markers[i].lat, $scope.markers[i].lng])
            }
            // bounds.push([$scope.madeira.lat, $scope.madeira.lng]);
            if (bounds.length > 0 && fitToBounds) {
                leafletData.getMap().then(function(map) {
                    map.fitBounds(bounds, {
                        padding: [50, 50]
                    });
                });
            }


            // leafletData.getMap().then(function(map){
            //   map.fitBounds([
            //        [48.7120066603552, 9.04994057067812],
            //        [48.6120066603552, 9.14994057067812]]);
            // });



        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

    getPointsOnDatabase(true);



    $scope.addPoint = function() {
        // // // console.log("addPoint");
        if (!$scope.addPointMode) {
            $scope.addPointMode = true;
            $scope.addingPointClass = 'addingPoints';
            $scope.dropdownClass = 'display-block';
            $scope.deletePointMode = false;
            $scope.settingPointMode = false;
            $scope.deletingPointClass = '';
            $scope.settingPointClass = '';
        } else {
            $scope.addPointMode = false;
            $scope.addingPointClass = '';
            $scope.dropdownClass = '';
        }

    };

    leafletData.getMap().then(function(map) {
        var osmGeocoder = new L.Control.OSMGeocoder({
            collapsed: false,
            position: 'bottomright',
            text: 'Find!',
        });
        map.addControl(osmGeocoder);
    });


}



EditPointController.$inject = ['$scope', '$http', '$routeParams', '$location', 'leafletData', 'Profile', 'Occurrences', 'sharedCommsService'];


function EditPointController($scope, $http, $routeParams, $location, leafletData, Profile, Occurrences, sharedCommsService) {
    console.log('EditPointController');

    $scope.loading = false;
    $scope.occLoading = false;

    $scope.$on('$locationChangeSuccess', function(event) {
        if ($location.path().indexOf('/map') >= 0)
            $scope.loading = true

        if ($location.path().indexOf('/occurrences') >= 0)
            $scope.occLoading = true
    })

    $scope.occurrences = Occurrences.occurrences;

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.showOpenOcc = false;
    console.log($scope.showOpenOcc);
    $scope.openOcc = Occurrences.openOcc;

    if ($scope.openOcc > 0)
        $scope.showOpenOcc = true;
    else
        $scope.showOpenOcc = false;

    console.log($scope.showOpenOcc);

    $scope.$watch('currOccurrence.status', function() {
        $scope.openOcc = Occurrences.openOcc;

        if ($scope.openOcc > 0)
            $scope.showOpenOcc = true;
        else
            $scope.showOpenOcc = false;

        console.log($scope.showOpenOcc);
    });


    $scope.pid = $routeParams.pid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $http.get('/api/pointdashboard/' + $scope.pid + "/" + $scope.pointid).
    success(function(data, status) {
        $scope.project = data.project;
        $scope.pointname = nameFromAttributes(data.pattributes, $scope.pointid);

    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });


    $scope.userProfile = Profile.userprofile;
    console.log(Profile.userprofile);

    $scope.models = {};
    $scope.$watch('addForm.template', function(newVal, oldVal) {
        // // console.log("template: ");
        // console.log($scope.addForm.template);
        // console.log($scope.select2Options.tags);

        if ($scope.addForm.template != undefined && $scope.addForm.template.length != 0) {
            $scope.isTemplateNew = true;
            for (var i in $scope.select2Options.tags) {
                // // console.log($scope.select2Options.tags[i].text + " " + $scope.addForm.template[0].text);
                if ($scope.addForm.template[0] != undefined) {
                    if ($scope.select2Options.tags[i].text == $scope.addForm.template[0].text)
                        $scope.isTemplateNew = false;
                }
            }
        } else {
            // // console.log("EMPTY THE scope.parameters because of TYPE FIELD empty");
            $scope.parameters = [];
        }
        // // console.log("is new? "+$scope.isTemplateNew);

        if ($scope.addForm.template != undefined && $scope.addForm.template[0] != undefined && $scope.addForm.template[0].hasOwnProperty('fields'))
            $scope.parameters = $scope.addForm.template[0].fields;
        // if ($scope.selectedQuery) {
        //     $scope.parameters = $scope.selectedQuery.fields;
        // }
    });


    $scope.addAttribute = function() {
        // // console.log($scope.select2Options.tags);
        // // console.log($scope.addForm.template);

        // if($scope.newAttr )

        $scope.isTemplateNew = false;
        $scope.hasNewParms = false;

        if ($scope.newAttr == undefined || $scope.newAttr == '') {
            // // console.log('$scope.newAttr is undefined or empty');
            return;
        }

        if ($scope.isTemplateNew == false) {
            $scope.select2Options.tags.forEach(function(elem) {
                // // console.log(elem.text + " == " + $scope.addForm.template[0].text);
                if (elem.text == $scope.addForm.template[0].text) {
                    if (!elem.hasOwnProperty('fields'))
                        elem.fields = [];
                    elem.fields.push($scope.newAttr);
                }
            });
        } else {
            if (!$scope.addForm.template[0].hasOwnProperty('fields'))
                $scope.addForm.template[0].fields = [];
            $scope.addForm.template[0].fields.push($scope.newAttr);
            $scope.parameters = $scope.addForm.template[0].fields;
        }
        $scope.hasNewParms = true;
        // procurar no tags qual tem o addform.template.text
        // e fazer push nesse tags.fields

        // dps ao fazer add point, tenho de ver se falta o ng-model...

        // $scope.additionalAttributes.push({title: $scope.newAttr});

        $scope.newAttr = '';
    }


    $scope.select2Options = {
        tags: [],
        // tags: availableTags,
        // tags: $scope.itemsPointTemplates,
        multiple: true, // TODO: dps tirar isto e adaptar o css para o select2 select
        // data: [],
        formatResult: function(item) {
            return item.text;
        },
        formatSelection: function(item) {
            return item.text;
        },
    }

    $scope.addForm = {
        autoIndicators: 'yes',
        indicators: {},
        attributes: {}
    };

    // $http.get('/api/dashboard/'+$scope.pid).
    //   success(function(data, status) {
    //     console.log("yeah read!");
    //     $scope.indicators = data.indicators;
    //     $scope.addForm.indicators = {};
    //     $scope.indicatorsComplete = {};
    //     data.indicators.forEach(function(elem){
    //       // console.log(elem);
    //       $scope.addForm.indicators[elem.iid] = true;
    //       $scope.indicatorsComplete[elem.iid] = { title: elem.title, unit : elem.unit, alarm: elem.alarm};
    //       console.log($scope.addForm.indicators);
    //     });
    //   }).
    //   error(function (data, status) {
    //     $scope.data = data || "Request failed";
    //   });


    $scope.markers = new Array();


    $scope.attributes = [];
    $scope.pointtype = 'No type defined';


    $http.get('/api/getPointTemplates/' + $scope.pid).
    success(function(data) {
        // // console.log("yeah getPointTemplates");
        // // console.log(data);

        data.forEach(function(elem) {
            $scope.select2Options.tags.push(elem);
        });



        // $scope.select2Options.data.push({text: 'Apricot', id: 2});



        var get_url = '/geoapi/' + $scope.pid;
        // if($scope.pointid != null || $scope.pointid != undefined)
        //   get_url = '/geoapi/'+$scope.pid+'/'+$scope.pointid;

        // // console.log("get_url: "+get_url);

        $http.get(get_url).
        success(function(data, status) {
            // // // console.log("yeah read geoapi!");
            // // // console.log(data);
            // $scope.project = data.title;
            // $scope.parameter = data;
            // // // console.log($scope.indicators);

            if (data.length == 0) {
                $scope.addPoint();
                // // console.log("no points from geoapi");
            }

            for (var d in data) {
                // // // console.log(data[d]);

                if (data[d].pointid != $scope.pointid) {
                    $scope.markers.push({
                        lat: data[d].x,
                        lng: data[d].y,
                        pointid: data[d].pointid,
                        icon: $scope.iconGrey,
                        message: "added"
                    });
                } else {
                    // the point to edit must have a different icon and drag capability
                    $scope.markers.push({
                        lat: data[d].x,
                        lng: data[d].y,
                        pointid: data[d].pointid,
                        draggable: true,
                        icon: $scope.toAdd,
                        message: "to edit"
                    });

                    // console.log(data[d]);
                    var attrType = attributize(data[d].type);
                    var fields = [];
                    // $scope.layers.overlays[attrType].visible = true;

                    for (var j in $scope.select2Options.tags) {
                        if ($scope.select2Options.tags[j].text == attrType) {
                            console.log($scope.select2Options.tags[j]);
                            $scope.addForm.template = [];
                            $scope.addForm.template.push({
                                text: $scope.select2Options.tags[j].text,
                                fields: $scope.select2Options.tags[j].fields
                            });
                        }
                        // $scope.addForm.template.push( $scope.select2Options.tags[j] );
                    }

                    for (var name in data[d].attributes) {
                        // console.log( name +" => "+ data[d].attributes[name] );
                        $scope.attributes.push({
                            name: name,
                            value: data[d].attributes[name]
                        });
                        if (name != 'name' && name != 'observations')
                            fields.push(name);
                    }
                    $scope.pointtype = data[d].type;

                    // $scope.addForm.template = [];
                    // $scope.addForm.template.push( { text:attrType, fields:fields } );

                    for (var name in data[d].attributes) {
                        if (name != 'name' && name != 'observations')
                            $scope.models[name] = data[d].attributes[name];
                        else {
                            $scope.addForm.attributes[name] = data[d].attributes[name];
                        }
                    }

                    // console.log($scope.addForm.template);
                    // console.log($scope.select2Options.tags);
                }



                // // console.log("data.length: "+data.length);
                // if(d == data.length-1){
                //   $scope.addPoint();
                // }

            }

            var bounds = [];
            for (var i = 0; i < $scope.markers.length; i++) {
                bounds.push([$scope.markers[i].lat, $scope.markers[i].lng])
            }
            bounds.push([$scope.madeira.lat, $scope.madeira.lng]);
            if (bounds.length > 0) {
                leafletData.getMap().then(function(map) {
                    map.fitBounds(bounds, {
                        padding: [50, 50]
                    });
                });
            }


            // leafletData.getMap().then(function(map){
            //   map.fitBounds([
            //        [48.7120066603552, 9.04994057067812],
            //        [48.6120066603552, 9.14994057067812]]);
            // });



        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });



    }).
    error(function(data, status, headers, config) {
        // // console.log("error getProjectCenter");

    });



    // GEO INFO

    var tilesDict = {
        openstreetmap: {
            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            options: {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        },
        opencyclemap: {
            url: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
            options: {
                attribution: 'All maps &copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, map data &copy; <a href="http://www.openstreetmap.org">OpenStreetMap</a> (<a href="http://www.openstreetmap.org/copyright">ODbL</a>'
            }
        }
    };

    angular.extend($scope, {
        madeira: {
            zoom: 6
        }
    });

    $http.get('/api/getProjectCenter/' + $scope.pid).
    success(function(data) {
        // // console.log("yeah getProjectCenter");
        // $location.path('/projects');
        // // // console.log(data);
        if ($scope.markers.length == 0) {
            if (data.x != '' && data.x != undefined && data.x != null) {
                $scope.madeira.lat = data.x;
                $scope.madeira.lng = data.y;
                $scope.madeira.zoom = 10;
            } else {
                $scope.madeira.lat = 39.666667;
                $scope.madeira.lng = -8.133333;
                $scope.madeira.zoom = 6;
            }
        }

    }).
    error(function(data, status, headers, config) {
        // // console.log("error getProjectCenter");
        angular.extend($scope, {
            madeira: {
                lat: 39.666667,
                lng: -8.133333,
                zoom: 6
            }
        });
    });

    angular.extend($scope, {
        london: {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        },
        events: {},
        iconGrey: {
            type: 'awesomeMarker',
            icon: 'lock',
            markerColor: 'blue',
            opacity: 0
        },
        toAdd: {
            type: 'awesomeMarker',
            icon: 'question-circle',
            prefix: 'fa',
            markerColor: 'orange',
            opacity: 0
        },
        layers: {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                cycle: {
                    name: 'OpenCycleMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                google: {
                    name: 'Google Satellite',
                    layerType: 'SATELLITE',
                    type: 'google'
                }
            }
        }
    });



    // falta por os indicadores do projecto
    // mas nao deixar adicionar indicadores q ja tenha,
    // apenas fazer update a parametros q nao tenha

    $scope.submitEditPoint = function() {
        // console.log('submitEditPoint');
        // console.log($scope.newAttr);

        if ($scope.addForm.template.length > 1) {
            $scope.lastAddedMsg = "You have selected more than one type. Select only one type.";
            $scope.lastAddedMsgStyle = 'color: red;';
            return;
        }

        if ($scope.newAttr != undefined && $scope.newAttr != '') {
            $scope.lastAddedMsg = "You still have a new attribute to be added, named: " + $scope.newAttr + ". Press Add Attribute above or remove it.";
            $scope.lastAddedMsgStyle = 'color: red;';
            return;
        }


        if (!$scope.addForm.hasOwnProperty('attributes'))
            $scope.addForm.attributes = {
                name: '',
                observations: ''
            };

        $scope.parameters.forEach(function(elem) {
            $scope.addForm.attributes[attributize(elem)] = '';
        });

        for (var attrname in $scope.models) {
            $scope.addForm.attributes[attributize(attrname)] = $scope.models[attrname];
        }

        // // console.log("add point");
        // // console.log($scope.addForm);


        if ($scope.addForm.template == undefined || $scope.addForm.template.length == 0) {
            $scope.lastAddedMsg = 'The point type is missing... Input a new type and press enter or choose one from the list.';
            $scope.lastAddedMsgStyle = 'color: red;';
        } else {


            if ($scope.isTemplateNew) {
                $scope.select2Options.tags.push($scope.addForm.template[0]);
                console.log("TO ADD POINT TYPE");
                // $http.post('/api/addPointTemplate/'+$scope.pid, $scope.addForm.template[0]).
                //   success(function(data) {
                //     // // console.log("added pointTemplate");
                //   }).
                //   error(function (data, status) {
                //     $scope.data = data || "Request failed";
                //   });

            } else {
                if ($scope.hasNewParms) {
                    // update

                    var fields = [];
                    for (var i in $scope.addForm.attributes) {
                        if (i != 'name' && i != 'observations')
                            fields.push(i);
                    }
                    console.log("TO ADD POINT TYPE ATTRIBUTE " + $scope.addForm.template[0].tid);

                    // $http.post('/api/addPointTemplateAttribute/'+$scope.addForm.template[0].tid, fields).
                    //   success(function(data) {
                    //     // // console.log("added addPointTemplateAttribute");
                    //   }).
                    //   error(function (data, status) {
                    //     $scope.data = data || "Request failed";
                    //   });
                }
            }

            // all done about adding or not a new point type, lets restart the control vars
            $scope.isTemplateNew = false;
            $scope.hasNewParms = false;

            // return;


            // pode dar bug se o user clicar antes dos markers lancarem...
            // tenho de ter uma flag a false que torna-se true quando os pontos carregarem
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // $scope.addForm.point = $scope.markers[$scope.markers.length-1];

            for (var i in $scope.markers) {
                if ($scope.markers[i].draggable) {
                    $scope.addForm.point = $scope.markers[i];
                    break;
                }
            }



            // POST for UPDATE
            $http.post('/geoapi/updatePoint/' + $scope.pid + '/' + $scope.pointid, $scope.addForm).
            success(function(data) {
                // console.log('updated');
                // console.log(data);

                $scope.lastAddedMsg = 'Point edited with success';
                $scope.lastAddedMsgStyle = 'color: green;';
            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });



        } // end else if has point type


    };

}


EditPointCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'leafletData', 'sharedCommsService'];

function EditPointCtrl($scope, $http, $routeParams, $location, leafletData, sharedCommsService) {
    console.log("EditPointCtrl");

    $scope.pid = $routeParams.pid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.pointAttributes = [{
        name: "aaa",
        value: "wkaka"
    }, {
        name: "bf",
        value: "45"
    }];
    $scope.attrmodels = {};

    var get_url = '/geoapi/' + $scope.pid;
    // if($scope.pointid != null || $scope.pointid != undefined)
    //   get_url = '/geoapi/'+$scope.pid+'/'+$scope.pointid;

    // // console.log("get_url: "+get_url);

    $http.get(get_url).
    success(function(data, status) {

        $scope.pointAttributes = [];
        // // // console.log("yeah read geoapi!");
        // // // console.log(data);
        // $scope.project = data.title;
        // $scope.parameter = data;
        // // // console.log($scope.indicators);


        for (var d in data) {
            // // // console.log(data[d]);

            if (data[d].pointid != $scope.pointid) {

            } else {


                // console.log(data[d]);
                // var attrType = attributize(data[d].type);
                var fields = [];
                // $scope.layers.overlays[attrType].visible = true;



                for (var name in data[d].attributes) {
                    console.log(name + " => " + data[d].attributes[name]);
                    // $scope.attributes.push({ name : name, value : data[d].attributes[name] });

                    $scope.pointAttributes.push(name);
                    $scope.attrmodels[name] = data[d].attributes[name];


                }

                console.log($scope.pointAttributes);
                $scope.pointtype = data[d].type;

                // $scope.addForm.template = [];
                // $scope.addForm.template.push( { text:attrType, fields:fields } );

                // for(var name in data[d].attributes){
                //   if(name != 'name' && name != 'observations')
                //     $scope.models[name] = data[d].attributes[name];
                //   else{
                //     $scope.addForm.attributes[name] = data[d].attributes[name];
                //   }
                // }

                // console.log($scope.addForm.template);
                // console.log($scope.select2Options.tags);
            }



            // // console.log("data.length: "+data.length);
            // if(d == data.length-1){
            //   $scope.addPoint();
            // }

        }


        // leafletData.getMap().then(function(map){
        //   map.fitBounds([
        //        [48.7120066603552, 9.04994057067812],
        //        [48.6120066603552, 9.14994057067812]]);
        // });



    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });



    $scope.addAttribute = function() {
        if ($scope.newAttr == undefined || $scope.newAttr == '') {
            // // console.log('$scope.newAttr is undefined or empty');
            return;
        }
        $scope.pointAttributes.push($scope.newAttr);
        $scope.newAttr = '';
    }

    $scope.submitEditPoint = function() {
        console.log('submitEditPoint');
        // console.log($scope.addForm);



        // if($scope.addForm.template.length > 1){
        //   $scope.lastAddedMsg = "You have selected more than one type. Select only one type.";
        //   $scope.lastAddedMsgStyle = 'color: red;';
        //   return;
        // }

        if ($scope.newAttr != undefined && $scope.newAttr != '') {
            $scope.lastAddedMsg = "You still have a new attribute to be added, named: " + $scope.newAttr + ". Press Add Attribute above or remove it.";
            $scope.lastAddedMsgStyle = 'color: red;';
            return;
        }


        // if(!$scope.addForm.hasOwnProperty('attributes'))
        //   $scope.addForm.attributes = { name : '', observations: ''};

        // $scope.parameters.forEach(function(elem){
        //   $scope.addForm.attributes[attributize(elem)] = '';
        // });

        for (var attrname in $scope.attrmodels) {
            $scope.addForm.attributes[attributize(attrname)] = $scope.attrmodels[attrname];
        }

        // // console.log("add point");



        // return;


        // pode dar bug se o user clicar antes dos markers lancarem...
        // tenho de ter uma flag a false que torna-se true quando os pontos carregarem
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // $scope.addForm.point = $scope.markers[$scope.markers.length-1];

        for (var i in $scope.markers) {
            if ($scope.markers[i].draggable) {
                $scope.addForm.point = $scope.markers[i];
                break;
            }
        }


        $scope.addForm.template = [{
            text: $scope.pointtype
        }];


        // console.log($scope.addForm);
        // return;

        // POST for UPDATE
        $http.post('/geoapi/updatePoint/' + $scope.pid + '/' + $scope.pointid, $scope.addForm).
        success(function(data) {
            // console.log('updated');
            // console.log(data);

            $scope.lastAddedMsg = 'Point edited with success';
            $scope.lastAddedMsgStyle = 'color: green;';
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });



    }

}



DemoController.$inject = ['$scope', '$http', '$routeParams', '$location', 'leafletData', 'sharedCommsService', 'socket'];

function DemoController($scope, $http, $routeParams, $location, leafletData, sharedCommsService, socket) {
    console.log("DemoController");
    $scope.showAddPointHelp = 0;
    $scope.pid = $routeParams.pid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.numOfPoints = 0;


    $scope.addForm = {
        autoIndicators: 'yes'
    };

    $scope.popoverDivDisplay = "none";

    $scope.hidePopoverDiv = function() {
        $scope.popoverDivDisplay = "none";
    };

    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.message = 'refreshPoints') {
            var pointId = sharedCommsService.pointsToRefresh2.shift();

            if (pointId == undefined)
                return;

            console.log("Going to update map with point id: " + pointId);

            var get_url = '/geoapi/' + $scope.pid + '/' + pointId;
            $http.get(get_url).
            success(function(data, status) {

                for (var d in data) {
                    console.log("putting on map: " + data[d].pointid);

                    // $scope.markers.push({
                    //   lat: data[d].x,
                    //   lng: data[d].y,
                    //   pointid: data[d].pointid,
                    //   icon:$scope.iconGrey,
                    //   message: "added"
                    // });

                    // var attrType = attributize(data[d].type);
                    // $scope.layers.overlays[attrType].visible = true;

                    $scope.markers.push({
                        lat: data[d].x,
                        lng: data[d].y,
                        pointid: data[d].pointid,
                        // layer: attrType,
                        group: 'clustermarkers',
                        message: buildMessage(data[d], false),
                        icon: {
                            type: 'awesomeMarker',
                            // icon: 'crosshairs',
                            icon: 'circle',
                            prefix: 'fa',
                            markerColor: 'blue',
                            // spin: true,
                            opacity: 0
                        }
                    });

                    $scope.numOfPoints = $scope.numOfPoints + 1;
                    if ($scope.showAddPointHelp == 1) {
                        $scope.showAddPointHelp = 0;
                        $scope.popoverDivDisplay = "none";
                    }

                }

            });
        }
    });

    $scope.$on('leafletDirectiveMarker.mouseover', function(e, args) {
        args.leafletEvent.target.openPopup();
        console.log("Leaflet Hover");
        // console.log(args.leafletEvent);
    });

    $scope.$on('leafletDirectiveMarker.mouseout', function(e, args) {
        args.leafletEvent.target.closePopup();
        // console.log("Leaflet out");
    });



    // // // console.log($scope);

    // leafletData.getMap().then(function(map) {
    //     // map.fitBounds([ [40.712, -74.227], [40.774, -74.125] ]);

    //     if($scope.pointid != null && $scope.pointid != undefined){
    //       // // // console.log("center on point");
    //       map.setView([32.666667,-16.75], 9);
    //     } else {
    //       // center on madeira ----- this is hardcoded!!!!!
    //       // // // console.log("center on map center");
    //       map.setView([32.666667,-16.85], 4);
    //     }
    // });



    $scope.addPointMode = false;
    $scope.deletePointMode = false;
    $scope.settingPointMode = false;
    $scope.addingPointClass = '';
    $scope.dropdownClass = '';
    $scope.deletingPointClass = '';
    $scope.settingPointClass = '';
    $scope.configClass = 'display-block';
    $scope.iconConfig = 'fa-chevron-circle-up';

    $scope.toggleConfigClass = function() {
        // // console.log("toggling");
        if ($scope.configClass == 'display-none') {
            $scope.configClass = 'display-block';
            $scope.iconConfig = 'fa-chevron-circle-up';
            $scope.addPointMode = false;
            $scope.deletePointMode = false;
            $scope.settingPointMode = false;
            $scope.addingPointClass = '';
            $scope.dropdownClass = '';
            $scope.deletingPointClass = '';
            $scope.settingPointClass = '';
        } else {
            $scope.configClass = 'display-none';
            $scope.iconConfig = 'fa-chevron-circle-down';
        }
    };

    var tilesDict = {
        openstreetmap: {
            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            options: {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        },
        opencyclemap: {
            url: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
            options: {
                attribution: 'All maps &copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, map data &copy; <a href="http://www.openstreetmap.org">OpenStreetMap</a> (<a href="http://www.openstreetmap.org/copyright">ODbL</a>'
            }
        }
    };

    angular.extend($scope, {
        madeira: {
            zoom: 6
        }
    });

    $http.get('/api/getProjectCenter/' + $scope.pid).
    success(function(data) {
        // // console.log("yeah getProjectCenter");
        // $location.path('/projects');
        // // // console.log(data);
        // console.log('data.numOfPoints');
        // console.log(data.numOfPoints.count);
        $scope.numOfPoints = data.numOfPoints.count; // NUNOOOO will be useful in the future

        if ($scope.markers.length == 0) {
            if (data.x != '' && data.x != undefined && data.x != null) {
                $scope.madeira.lat = data.x;
                $scope.madeira.lng = data.y;
                $scope.madeira.zoom = 10;
            } else {
                $scope.madeira.lat = 39.666667;
                $scope.madeira.lng = -8.133333;
                $scope.madeira.zoom = 6;
            }
        }

    }).
    error(function(data, status, headers, config) {
        // // console.log("error getProjectCenter");
        angular.extend($scope, {
            madeira: {
                lat: 39.666667,
                lng: -8.133333,
                zoom: 6
            }
        });
    });

    angular.extend($scope, {
        london: {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        },
        events: {},
        layers: {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                cycle: {
                    name: 'OpenCycleMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                google: {
                    name: 'Google Satellite',
                    layerType: 'SATELLITE',
                    type: 'google'
                }
            },
            overlays: {
                clustermarkers: {
                    name: 'Markers',
                    type: 'markercluster',
                    visible: true
                }
                // fire: {
                //     name: 'OpenFireMap',
                //     type: 'xyz',
                //     url: 'http://openfiremap.org/hytiles/{z}/{x}/{y}.png',
                //     layerOptions: {
                //         attribution: '&copy; <a href="http://www.openfiremap.org">OpenFireMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                //         continuousWorld: true
                //     }
                // }

                // cars: { name: 'Cars', type: 'group', visible: true},
                // bikes: { name: 'Bicycles', type: 'group', visible: false }
            }

        }
    });



    $scope.attributes = [];
    $scope.pointtype = 'No type defined';

    $scope.geojsonObj = {};
    $scope.hoveredGeometry = "";


    function getPoints(alertPoint) {
        // first get the layer group types
        // then get the points and map each marker to each group type
        $http.get('/api/getPointTemplates/' + $scope.pid + '/1').
        success(function(data, status) {
            // // console.log('getPointtemplates');
            // // console.log(data);
            $scope.layers.overlays['n/a'] = {
                name: 'Uncategorized',
                type: 'group',
                visible: true
            };

            for (var i = 0; i < data.length; i++) {
                $scope.layers.overlays[attributize(data[i].type)] = {
                    name: data[i].type + " (" + data[i].count + ")",
                    type: 'group',
                    visible: false
                };
                // $scope.layers.overlays[attributize(data[i].text)] = {name: data[i].text, type: 'group', visible: false};
            }
            // data.forEach(function(elem){
            //   // // console.log(elem.text);
            //   $scope.layers.overlays[elem.text] = {name: elem.text, type: 'group', visible: true};
            // });
            // // console.log('$scope.layers.overlays');
            // // console.log($scope.layers.overlays);

            var get_url = '/geoapi/' + $scope.pid;
            // if($scope.pointid != null || $scope.pointid != undefined)
            //   get_url = '/geoapi/'+$scope.pid+'/'+$scope.pointid;

            $http.get(get_url).
            success(function(data, status) {
                //console.log("yeah read geoapi!");
                //console.log(data.length);
                // // console.log(data);
                // $scope.project = data.title;
                // $scope.parameter = data;
                // // // console.log($scope.indicators);

                $scope.geojsonObj = {
                    "type": "FeatureCollection",
                    "crs": {
                        "type": "name",
                        "properties": {
                            "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                        }
                    },
                    "features": []
                };


                $scope.numOfPoints = data.length;
                var bounds = [];
                bounds.push([$scope.madeira.lat, $scope.madeira.lng]);

                for (var d in data) {

                    var attrType = attributize(data[d].type);
                    $scope.layers.overlays[attrType].visible = true;



                    if (data[d].pointid == $scope.pointid) {

                        var icon = {
                            type: 'awesomeMarker',
                            icon: 'check',
                            prefix: 'fa',
                            markerColor: 'orange',
                            opacity: 0
                        };
                        var isAlertPoint = (angular.isDefined(data[d].alerts) && data[d].alerts > 0) || (angular.isDefined(alertPoint) && data[d].pointid == alertPoint.pointid);
                        icon.icon = isAlertPoint ? 'bell-o' : 'check';
                        icon.markerColor = isAlertPoint ? 'red' : 'orange';


                        if (data[d].geometry == null) {
                            $scope.markers.push({
                                lat: data[d].x,
                                lng: data[d].y,
                                pointid: data[d].pointid,
                                layer: attrType,
                                zIndexOffset: 1000,
                                icon: icon
                            });
                        } else {

                            $scope.geojsonObj.features.push(data[d].geometry);

                        }



                        bounds.push([data[d].x, data[d].y]);

                        if (bounds.length > 0) {
                            leafletData.getMap().then(function(map) {
                                map.fitBounds(bounds, {
                                    padding: [50, 50]
                                });
                            });
                        }


                        for (var name in data[d].attributes) {
                            // // console.log( name +" => "+ data[0].attributes[name] );
                            $scope.attributes.push({
                                name: name,
                                value: data[d].attributes[name]
                            });
                        }
                        $scope.pointtype = data[d].type;
                        $scope.latitude = data[d].x;
                        $scope.longitude = data[d].y;
                    } else {

                        if (data[d].geometry == null) {
                            var icon = {
                                type: 'awesomeMarker',
                                icon: 'circle',
                                prefix: 'fa',
                                markerColor: 'blue',
                                opacity: 0
                            };
                            var isAlertPoint = (angular.isDefined(data[d].alerts) && data[d].alerts > 0) || (angular.isDefined(alertPoint) && data[d].pointid == alertPoint.pointid);
                            icon.icon = isAlertPoint ? 'bell-o' : 'circle';
                            icon.markerColor = isAlertPoint ? 'red' : 'blue';
                            // console.log(icon.icon);
                            $scope.markers.push({
                                lat: data[d].x,
                                lng: data[d].y,
                                pointid: data[d].pointid,
                                // layer: attrType,
                                layer: 'clustermarkers',
                                message: buildMessage(data[d], false),
                                icon: icon
                            });
                        } else {

                            $scope.geojsonObj.features.push(data[d].geometry);

                        }


                        bounds.push([data[d].x, data[d].y]);


                    }

                    $scope.popoverDivDisplay = "none";
                }

                if (data.length == 0) {
                    $scope.showAddPointHelp = 1;
                    $scope.popoverDivDisplay = "block";
                }

                if (bounds.length > 0) {
                    leafletData.getMap().then(function(map) {
                        map.fitBounds(bounds, {
                            padding: [50, 50]
                        });
                    });
                }

                // console.log("$scope.geojson");
                // console.log(JSON.stringify($scope.geojson, null, 4));

                function getColorIfSelected(id, selectedId) {
                    if (id == selectedId)
                        return "orange";
                    else
                        return "purple";
                }

                function featureStyle(feature) {
                    return {
                        fillColor: getColorIfSelected(feature.properties.pointid, $scope.pointid),
                        weight: 3,
                        opacity: 1,
                        // color: 'purple',
                        color: getColorIfSelected(feature.properties.pointid, $scope.pointid),
                        // dashArray: '3',
                        fillOpacity: 0.5,
                        onEachFeature: function(feature, layer) {
                                layer.bindPopup("number: " + feature.properties.ref);
                            } // nao surtiu efeito...
                    };
                }



                angular.extend($scope, {
                    geojson: {
                        data: $scope.geojsonObj,
                        style: featureStyle
                    }
                });


                $scope.$on("leafletDirectiveMap.geojsonMouseover", function(ev, feature, leafletEvent) {
                    // countryMouseover(feature, leafletEvent);
                    if (feature.properties.PointKey != undefined) {
                        $scope.hoveredGeometry = feature.properties.ref + "    [" + feature.properties.PointKey + "]";
                    } else {
                        $scope.hoveredGeometry = feature.properties.ref + "    [" + feature.properties.StoreCodeAbbrv + "]";
                    }

                });
                $scope.$on("leafletDirectiveMap.geojsonMouseout", function(ev, feature, leafletEvent) {
                    // countryMouseover(feature, leafletEvent);
                    $scope.hoveredGeometry = "";
                });
                $scope.$on("leafletDirectiveMap.geojsonClick", function(ev, feature, leafletEvent) {
                    // countryClick(featureSelected, leafletEvent);
                    console.log("click geojson");
                    // leafletEvent.target.openPopup();
                    console.log(feature.properties);
                    // console.log(leafletEvent);

                    if ($location.path().indexOf('dashboard') > 0) {
                        $location.path("/dashboard/" + $scope.pid + "/" + feature.properties.pointid);
                    } else if ($location.path().indexOf('widget') > 0) {
                        // console.log("PATH: "+ ("/widget/"+$scope.pid+"/"+$scope.wid+"/"+$scope.markers[args.markerName].pointid) );
                        $location.path("/widget/" + $scope.pid + "/" + $scope.wid + "/" + feature.properties.pointid);
                    } else {
                        $location.path("/data/" + $scope.pid + "/" + feature.properties.pointid);
                    }

                });


                // if($scope.pointid != null || $scope.pointid != undefined){
                //   for(var name in data[0].attributes){
                //     // // console.log( name +" => "+ data[0].attributes[name] );
                //     $scope.attributes.push({ name : name, value : data[0].attributes[name] });
                //   }
                //   $scope.pointtype = data[0].type;
                // }


            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });


        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    };

    socket.on('send:alert', getPoints);
    getPoints(undefined);


    $scope.markers = new Array();

    // add markers - for now - only when addPoint mode is activated (dashboards)
    $scope.$on("leafletDirectiveMap.click", function(event, args) {
        var leafEvent = args.leafletEvent;
        var point = leafEvent.latlng;
        // // // console.log("point");
        // // // console.log(point);
        if ($scope.addPointMode) {
            // $scope.markers.push({
            //     lat: leafEvent.latlng.lat,
            //     lng: leafEvent.latlng.lng,
            //     message: "My Added Marker"
            // });


            $http.post('/geoapi/addPoint/' + $scope.pid, point).
            success(function(data) {
                // // // console.log("yeah postPoint added!");
                // $location.path('/projects');
                // // // console.log(data);
                $scope.markers.push({
                    lat: data.coord[0].x,
                    lng: data.coord[0].y,
                    pointid: data.pointid,
                    message: "Point " + data.pointid
                });
            });
        } else if ($scope.setPointMode) {
            // // // console.log("Leaflet setting point mode");
            leafletData.getMap().then(function(map) {
                $http.post('/api/setProjectCenter/' + $scope.pid, point).
                success(function(data) {
                    // // // console.log("yeah setProjectCenter added!");
                    $scope.addPointMode = false;
                    $scope.deletePointMode = false;
                    $scope.settingPointMode = false;
                    $scope.addingPointClass = '';
                    $scope.dropdownClass = '';
                    $scope.deletingPointClass = '';
                    $scope.settingPointClass = '';
                });
            });
        }
    });

    // ********************************************************************************************************************************
    // #req_002b
    // leafletData.getMap().then(function(map){
    //   // function my_button_onClick() {
    //   //     // // console.log("someone clicked my button");
    //   // }
    //   // var myButtonOptions = {
    //   //     'text': 'MyButton',  // string
    //   //     'iconUrl': 'images/myButton.png',  // string
    //   //     'onClick': my_button_onClick,  // callback function
    //   //     'hideText': true,  // bool
    //   //     'maxWidth': 30,  // number
    //   //     'doToggle': false,  // bool
    //   //     'toggleStatus': false  // bool
    //   // }
    //   // var control = L.Control;
    //   // var myButton = new control.Button(myButtonOptions);
    //   // myButton.addTo(map);

    //   var myButton = L.control({ position: 'topright' });

    //   myButton.onAdd = function (map) {
    //       // this._div = L.DomUtil.create('div', 'myButton-css-class');
    //       this._div = L.DomUtil.create('div', 'leaflet-control-layers');
    //       this._div.innerHTML = '<a href="addPoint/'+$scope.pid+'" class="inner-control-points"><div><i class="fa fa-map-marker fa-2x"></i><i class="fa fa-plus" style="color: #999;"></i></div></a>';
    //       return this._div;
    //   };

    //   myButton.addTo(map);

    //   var myButtonDel = L.control({ position: 'topright', 'onClick': $scope.deletePoint });

    //   myButtonDel.onAdd = function (map) {
    //       // this._div = L.DomUtil.create('div', 'myButton-css-class');
    //       this._div = L.DomUtil.create('div', 'leaflet-control-layers');
    //       this._div.innerHTML = '<a ng-click="deletePoint()" class="inner-control-points"><div><i class="fa fa-map-marker fa-2x"></i><i class="fa fa-minus" style="color: #999;"></i></div></a>';
    //       return this._div;
    //   };

    //   myButtonDel.addTo(map);

    // });


    var unableClicks = false;
    $scope.$on("leafletDirectiveMap.movestart", function(event, args) {
        // console.log("leafletDirectiveMap.movestart");
        unableClicks = true;
    });
    $scope.$on("leafletDirectiveMap.moveend", function(event, args) {
        // console.log("leafletDirectiveMap.moveend");
        unableClicks = false;
    });



    $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        if (unableClicks)
            return;

        if ($scope.deletePointMode == false) {
            // Args will contain the marker name and other relevant information
            // // // console.log("Leaflet Click");
            // // // console.log(args);
            // // // console.log($scope.markers[args.markerName].pointid);
            // agora é ir ao /dashboard/:pid/:pointid e ele faz o render do dashboard para o projectid e pointid
            // // // console.log("/dashboardPoint/"+$scope.pid+"/"+$scope.markers[args.markerName].pointid);

            if ($location.path().indexOf('dashboard') > 0) {
                $location.path("/dashboard/" + $scope.pid + "/" + $scope.markers[args.markerName].pointid);
            } else if ($location.path().indexOf('widget') > 0) {
                console.log("PATH: " + ("/dashboard/" + $scope.pid + "/" + $scope.wid + "/" + $scope.markers[args.markerName].pointid));
                // $location.path( "/dashboard/"+$scope.pid+"/"+$scope.wid+"/"+$scope.markers[args.markerName].pointid );
            } else {
                $location.path("/data/" + $scope.pid + "/" + $scope.markers[args.markerName].pointid);
            }
        } else {
            // // // console.log("Leaflet Delete Point");
            // chamar api delete point
            // na resposta da api delete point
            // tirar do $scope.markers
            $http.delete('/geoapi/deletePoint/' + $scope.markers[args.markerName].pointid).
            success(function(data) {
                $scope.markers.splice(args.markerName, 1);
                $scope.numOfPoints = $scope.markers.length;
            });
        }
    });



    $scope.addPoint = function() {
        // // // console.log("addPoint");
        if (!$scope.addPointMode) {
            $scope.addPointMode = true;
            $scope.addingPointClass = 'addingPoints';
            $scope.dropdownClass = 'display-block';
            $scope.deletePointMode = false;
            $scope.settingPointMode = false;
            $scope.deletingPointClass = '';
            $scope.settingPointClass = '';
        } else {
            $scope.addPointMode = false;
            $scope.addingPointClass = '';
            $scope.dropdownClass = '';
        }

    };

    $scope.deletePoint = function() {
        // // console.log("deletePointMode");
        if (!$scope.deletePointMode) {
            $scope.deletePointMode = true;
            $scope.deletingPointClass = 'addingPoints';
            $scope.addPointMode = false;
            $scope.settingPointMode = false;
            $scope.addingPointClass = '';
            $scope.dropdownClass = '';
            $scope.settingPointClass = '';
        } else {
            $scope.deletePointMode = false;
            $scope.deletingPointClass = '';
        }
    };

    $scope.setPoint = function() {
        console.log("setPoint");
        if (!$scope.setPointMode) {
            $scope.setPointMode = true;
            $scope.settingPointClass = 'addingPoints';
            $scope.addPointMode = false;
            $scope.deletePointMode = false;
            $scope.addingPointClass = '';
            $scope.dropdownClass = '';
            $scope.deletingPointClass = '';
        } else {
            $scope.setPointMode = false;
            $scope.settingPointClass = '';
        }
    };


    // leafletData.getMap().then(function(map){
    //   var osmGeocoder = new L.Control.OSMGeocoder({
    //         collapsed: false,
    //         position: 'bottomright',
    //         text: 'Find!',
    //   });
    //   map.addControl(osmGeocoder);
    // });



}


DemoWidgetPointsController.$inject = ['$scope', '$http', '$routeParams', '$location', 'leafletData', 'sharedCommsService'];

function DemoWidgetPointsController($scope, $http, $routeParams, $location, leafletData, sharedCommsService) {
    console.log('DemoWidgetPointsController');
    $scope.pid = $routeParams.pid;
    $scope.wid = $routeParams.wid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    // function to control decimal places in y axis and labels
    $scope.yAxisTickFormatFunction = function() {
        return function(d) {
            if (d >= 1000 || $scope.widget.title == 'Number of Customers' || $scope.widget.title == 'NPS INDEX (HoN)')
                return d3.format('0.0f')(d);
            else
                return d3.format('0.2f')(d);
        }
    }

    // auxiliar functions
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1); // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }


    function distancesOnPoints(pointsArr) {
        // console.log("maxDistanceOnPoints");
        // console.log(pointsArr);
        var max = 0;
        var min;

        for (var i = 0; i < pointsArr.length; i++) {
            var a = pointsArr[i];
            for (var j = 0; j < pointsArr.length; j++) {
                var b = pointsArr[j];
                if (i != j) {
                    // var distance = Math.ceil(getDistanceFromLatLonInKm( a[0], a[1], b[0], b[1] ));
                    var distance = (getDistanceFromLatLonInKm(a[0], a[1], b[0], b[1]));
                    // console.log("calculated distance: "+ distance );
                    if (max < distance)
                        max = distance;

                    if (min == undefined || min == null)
                        min = distance;
                    if (min > distance)
                        min = distance;
                }
            }
        }
        // min and max are in km, we need to return meters
        return [min * 1000, max * 1000];
    }


    function averageDistancesOnPoints(pointsArr) {
        var sum = 0;
        var count = 0;

        for (var i = 0; i < pointsArr.length; i++) {
            var a = pointsArr[i];
            for (var j = 0; j < pointsArr.length; j++) {
                var b = pointsArr[j];
                if (i != j) {
                    var distance = Math.ceil(getDistanceFromLatLonInKm(a[0], a[1], b[0], b[1]));
                    // console.log("calculated distance: "+ distance );
                    sum += distance;
                    count++;
                }
            }
        }
        return Math.round((sum / count) * 1000);
    }



    $http.get('/api/getProjectCenter/' + $scope.pid).
    success(function(data) {
        // // // console.log("yeah getProjectCenter");
        // $location.path('/projects');
        // // // console.log(data);
        $scope.madeira.lat = data.x;
        $scope.madeira.lng = data.y;
        $scope.madeira.zoom = 10;

        // // transform array of objects to array of arrays
        // var procPoints = new Array();
        // for(var i=0; i<data.points.length; i++){
        //   var point = data.points[i];
        //   // console.log(point);
        //   procPoints.push([point.x, point.y]);
        // }

        var hmSz = 30000;


        // // if min max approach
        // var distances = distancesOnPoints(procPoints);
        // // console.log("distances "+distances[0]+" "+distances[1]);
        // hmSz = distances[0]*3;
        // hmSz = distances[1]/2;
        // // console.log("average min max distance points: "+((distances[0]+distances[1])/2));
        // hmSz = ((distances[0]+distances[1])/2);


        // // if distances average approach
        // var hmSz = averageDistancesOnPoints(procPoints);
        // // console.log("average all points: "+hmSz);

        // // console.log("heatmap size: "+hmSz);
        $scope.updateHeatmapSize(hmSz, null);
    });

    // $scope.dataPointsHeatmap = [[ 44.651144316, -63.586260171, 0.5], [44.75, -63.5, 0.8]];
    $scope.dataPointsHeatmap = [];

    angular.extend($scope, {
        london: {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        },
        madeira: {
            lat: 39.666667,
            lng: -8.133333,
            zoom: 6
        },
        events: {},
        controls: {
            draw: {
                polygon: false,
                polyline: false,
                marker: false,
                circle: {
                    shapeOptions: {
                        color: '#22ad91'
                    }
                }
            }
        },
        layers: {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                cycle: {
                    name: 'OpenCycleMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                google: {
                    name: 'Google Satellite',
                    layerType: 'SATELLITE',
                    type: 'google'
                },
                dark: {
                    name: 'Dark CartoDB',
                    type: 'xyz',
                    url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
                    }
                }
            },
            overlays: {
                // heatmap: {
                //     name: 'Heat Map',
                //     type: 'heatmap',
                //     data: $scope.dataPointsHeatmap,
                //     // layerOptions: {"size": 30000}, // doesnt work... we need to use layerOptions instead of options
                //     layerOptions: {"size": 400000}, // doesnt work... we need to use layerOptions instead of options
                //     visible: true
                // }
            }
        },
        updateHeatmapSize: function(val, dataPoints) {
            // console.log("updateHeatmapSize with size: "+val);
            // console.log(this.layers.overlays.heatmap.layerOptions.size);
            // this.layers.overlays.heatmap.layerOptions.size = val;
            // console.log(this.layers.overlays.heatmap.layerOptions.size);
            // console.log(this.layers.overlays);



            if (val == null || val == undefined)
                val = this.layers.overlays.heatmap.layerOptions.size;

            if (dataPoints == null || dataPoints == undefined)
                dataPoints = $scope.dataPointsHeatmap;


            delete this.layers.overlays.heatmap;
            // console.log(this.layers.overlays);

            /*this.layers.overlays.heatmap = {
                name: 'Heat Map',
                type: 'heatmap',
                data: dataPoints,
                // layerOptions: {"size": 30000}, // doesnt work... we need to use layerOptions instead of options
                layerOptions: {"size": val}, // doesnt work... we need to use layerOptions instead of options
                visible: false
            };*/
            // console.log(this.layers.overlays);
        }
    });

    $scope.markers = new Array();



    $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        // Args will contain the marker name and other relevant information
        // console.log("Leaflet Click");
        // // // console.log(args);
        // // // console.log($scope.markers[args.markerName].pointid);
        // agora é ir ao /dashboard/:pid/:pointid e ele faz o render do dashboard para o projectid e pointid
        // // // console.log("/dashboardPoint/"+$scope.pid+"/"+$scope.markers[args.markerName].pointid);
        if ($location.path().indexOf('dashboard') > 0) {
            $location.path("/dashboard/" + $scope.pid + "/" + $scope.markers[args.markerName].pointid);
        } else if ($location.path().indexOf('widget') > 0) {
            // console.log("PATH: "+ ("/widget/"+$scope.pid+"/"+$scope.wid+"/"+$scope.markers[args.markerName].pointid) );
            $location.path("/widget/" + $scope.pid + "/" + $scope.wid + "/" + $scope.markers[args.markerName].pointid);
        } else {
            $location.path("/data/" + $scope.pid + "/" + $scope.markers[args.markerName].pointid);
        }


        // $location.path( "/dashboard/"+$scope.pid+"/"+$scope.markers[args.markerName].pointid );
    });



    $scope.$on('leafletDirectiveMarker.mouseover', function(e, args) {
        args.leafletEvent.target.openPopup();
        // console.log("Leaflet Hover");
    });

    $scope.$on('leafletDirectiveMarker.mouseout', function(e, args) {
        args.leafletEvent.target.closePopup();
        // console.log("Leaflet out");
    });


    var geojsoncolors = {};
    $scope.filteredPoints = new Array();
    $scope.filteringPointsDraw = false;


    function isInArray(arr, elem) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == elem)
                return true;
        }
        return false;
    }

    function getGeojsonColor(id) {
        var ret = geojsoncolors[id];

        if (ret == undefined || ret == null)
            ret = "gray";
        return ret;
    }

    function getColorIfSelected(id, selectedId) {
        if (id == selectedId)
            return "orange";
        else {
            if (!$scope.filteringPointsDraw) {
                if ($scope.heatmapActive)
                    return getGeojsonColor(id);
                else
                    return "purple";
            } else {
                // we need to search if the id is in the filteredPoints
                if (isInArray($scope.filteredPoints, id)) {
                    // console.log( id + " is on array");
                    // console.log($scope.filteredPoints);
                    if ($scope.heatmapActive)
                        return getGeojsonColor(id);
                    else
                        return "purple";
                } else {
                    // console.log( id + " is NOT on array");
                    // console.log($scope.filteredPoints);
                    return "gray";
                }
            }
        }
    }

    function featureStyle(feature) {
        return {
            fillColor: getColorIfSelected(feature.properties.pointid, $scope.pointid),
            weight: 3,
            opacity: 1,
            // color: 'purple',
            color: getColorIfSelected(feature.properties.pointid, $scope.pointid),
            // dashArray: '3',
            fillOpacity: 0.5,
            onEachFeature: function(feature, layer) {
                    layer.bindPopup("number: " + feature.properties.ref);
                } // nao surtiu efeito...
        };
    }


    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }


    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }


    function hslToRgbToHex(h, s, v) {
        var r, g, b, i, f, p, q, t;
        if (h && s === undefined && v === undefined) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        // console.log(Math.round(r * 255) + " " + Math.round(g * 255) + " " + Math.round(b * 255));

        return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));

        // return {
        //     r: Math.floor(r * 255),
        //     g: Math.floor(g * 255),
        //     b: Math.floor(b * 255)
        // };
    }


    $scope.geojsonObj = {};
    $scope.hoveredGeometry = "";


    $http.get('/api/pointsFromWidget/' + $scope.pid + '/' + $scope.wid).
    success(function(data, status) {
        // // // console.log("read ordered pointlocations");
        // // // console.log(data.locations);
        $scope.markers = new Array();
        var unit = data.unit;
        var max;
        var min;
        var auxHeatmap = [];
        var auxGeojsonHeatmap = [];

        $scope.geojsonObj = {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                }
            },
            "features": []
        };

        var bounds = [];
        bounds.push([$scope.madeira.lat, $scope.madeira.lng]);

        // for(var d in data.locations){
        for (var d = 0; d < data.locations.length; d++) {

            if (data.locations[d].geometry == null) {
                auxHeatmap.push([data.locations[d].x, data.locations[d].y, data.locations[d].value, data.locations[d].name]);
            } else {
                auxGeojsonHeatmap.push([data.locations[d].pointid, data.locations[d].value]);
            }

            if (d == 0) {
                max = +data.locations[d].value;
            } else {
                if (+data.locations[d].value > max)
                    max = +data.locations[d].value;
            }

            if (d == 0) {
                min = +data.locations[d].value;
            } else {
                if (+data.locations[d].value < min)
                    min = +data.locations[d].value;
            }



            // $scope.legend = {
            //   position: 'bottomleft',
            //   colors: [ '#ff0000', '#28c9ff', '#0000ff', '#ecf386' ],
            //   labels: [ 'National Cycle Route', 'Regional Cycle Route', 'Local Cycle Network', 'Cycleway' ]
            // };



            if (data.locations[d].pointid == $scope.pointid) {

                if (data.locations[d].geometry == null) {
                    $scope.markers.push({
                        lat: data.locations[d].x,
                        lng: data.locations[d].y,
                        pointid: data.locations[d].pointid,
                        zIndexOffset: 1000,
                        name: nameFromAttributes(data.locations[d], data.locations[d].pointid),
                        icon: {
                            type: 'awesomeMarker',
                            // icon: 'crosshairs',
                            icon: 'check',
                            prefix: 'fa',
                            markerColor: 'orange',
                            // spin: true,
                            weight: 5,
                            opacity: 0
                        }
                    });
                } else {
                    $scope.geojsonObj.features.push(data.locations[d].geometry);
                }



                bounds.push([data.locations[d].x, data.locations[d].y]);

            } else {

                // console.log(data.locations[d].type);
                var icon = 'circle';
                var prefix = 'fa';
                var markerColor = 'blue';
                if (data.locations[d].type == "Laboratory") {
                    icon = 'home';
                    // markerColor = 'green';
                } else if (data.locations[d].type == "Distribution") {
                    icon = 'ambulance';
                    // markerColor = 'orange';
                } else if (data.locations[d].type == "Final Client") {
                    icon = 'users';
                    // markerColor = 'purple';
                }


                var toPush = {
                    lat: data.locations[d].x,
                    lng: data.locations[d].y,
                    pointid: data.locations[d].pointid,
                    predecessorId: data.locations[d].predecessor,
                    value: parseFloat(data.locations[d].value),
                    //message: buildMessage(data.locations[d], true),
                    name: data.locations[d].name,
                    // layer: attrType,
                    icon: {
                        type: 'awesomeMarker',
                        // icon: 'crosshairs',
                        icon: icon,
                        prefix: prefix,
                        markerColor: markerColor,
                        // spin: true,
                        opacity: 0
                    }
                };

                // if(data.locations.length > 19)
                //   toPush['group'] = 'clustermarkers';

                if (data.locations[d].geometry == null) {
                    $scope.markers.push(toPush);
                } else {
                    $scope.geojsonObj.features.push(data.locations[d].geometry);
                }

                if ($scope.pointid == undefined || $scope.pointid == undefined)
                    bounds.push([data.locations[d].x, data.locations[d].y]);

            }


        } // end data.locations

        if (bounds.length > 0) {
            leafletData.getMap().then(function(map) {
                map.fitBounds(bounds, {
                    padding: [50, 50]
                });
            });
        }

        // console.log("max is "+max);
        leafletData.getMap().then(function(map) {
            $scope.legend = L.control({
                position: 'bottomleft'
            });

            $scope.legend.onAdd = function(map) {
                var div = L.DomUtil.create('div', 'info legend'),
                    grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                    labels = [];
                // loop through our density intervals and generate a label with a colored square for each interval
                // for (var i = 0; i < grades.length; i++) {
                //     div.innerHTML +=
                //         '<i style="background:' + '#0000ff' + '"></i> ' +
                //         grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                // }

                div.innerHTML += "<h5 style='margin-top: 0;'>Heat map values:</h5>";

                var max2 = max * 0.25;
                var max3 = max * 0.75;
                var min2 = min * 0.25;
                var min3 = min * 0.75;


                if (min < 0) {
                    div.innerHTML +=
                        '<i style="background:' + '#ff0000' + '"></i> ' +
                        +max.toFixed(2) + ' ' + unit + '<br>';
                    div.innerHTML +=
                        '<i style="background:' + '#ffff00' + '; opacity: 0.75;"></i> ' +
                        +max3.toFixed(2) + ' ' + unit + '<br>';
                    div.innerHTML +=
                        '<i style="background:' + '#00ff00' + '; opacity: 0.5;"></i> ' +
                        +max2.toFixed(2) + ' ' + unit + '<br>';
                    div.innerHTML +=
                        '<i style="background:' + 'transparent' + '"></i> ' +
                        0 + ' ' + unit + '<br>';
                    div.innerHTML +=
                        '<i style="background:' + '#ff00ff' + '; opacity: 0.5;"></i> ' +
                        +min2.toFixed(2) + ' ' + unit + '<br>';
                    div.innerHTML +=
                        '<i style="background:' + '#00ffff' + '; opacity: 0.75;"></i> ' +
                        +min3.toFixed(2) + ' ' + unit + '<br>';

                    div.innerHTML +=
                        '<i style="background:' + '#0000ff' + '"></i> ' +
                        +min.toFixed(2) + ' ' + unit + '<br>';
                } else {
                    div.innerHTML +=
                        '<i style="background:' + '#ff0000' + '"></i> ' +
                        +max.toFixed(2) + ' ' + unit + '<br>';
                    div.innerHTML +=
                        '<i style="background:' + '#ffff00' + '; opacity: 0.75;"></i> ' +
                        +max3.toFixed(2) + ' ' + unit + '<br>';
                    div.innerHTML +=
                        '<i style="background:' + '#00ff00' + '; opacity: 0.5;"></i> ' +
                        +max2.toFixed(2) + ' ' + unit + '<br>';
                    div.innerHTML +=
                        '<i style="background:' + 'transparent' + '"></i> ' +
                        0 + ' ' + unit + '<br>';
                }



                return div;
            };
            // $scope.legend.addTo(map);

        });



        $scope.testDataHeatmap = new Array();
        $scope.testDataHeatmap2 = new Array();

        // for(var z in auxHeatmap){
        //   // console.log($scope.dataPointsHeatmap);
        //   var elem = auxHeatmap[z];
        //   // $scope.dataPointsHeatmap.push([elem[0], elem[1], (elem[2]/(max)) ]);
        //   var factor = 1;
        //   var logsActive = 0;
        //   var logs = (Math.log(elem[2]/(max)) * factor );

        //   if(logs < -1)
        //     logs = -1;


        //   if(elem[2] < 0){
        //     // var intensity = (elem[2]/(min))+(logs*logsActive);
        //     var intensity = (elem[2]/(min));
        //     var loga = Math.log(intensity);
        //     if(loga > intensity)
        //       loga = intensity;
        //     var valu = intensity+(loga*logsActive);
        //     if(valu < 0)
        //       valu = 0;
        //     // console.log("intensity: "+(intensity)+ " || "+"loga "+loga + " FINAL: "+( valu ));
        //     $scope.testDataHeatmap2.push({lat: elem[0], lng:elem[1], count: valu*10})
        //     // console.log("inv: "+(elem[2]/(min))+" "+ Math.abs(intensity*10) + " "+logs );
        //   }else{
        //     var intensity = (elem[2]/(max))+(logs*logsActive);
        //     $scope.dataPointsHeatmap.push([elem[0], elem[1], intensity ]);
        //     console.log("NORMAL: "+(elem[2]/(max))+" "+ intensity + " "+logs );
        //   }

        //   // console.log(elem[2]+" "+ intensity );
        // }

        for (var z in auxHeatmap) {
            var elem = auxHeatmap[z];



            var prevalu = elem[2] * elem[2];


            if (elem[2] < 0) {
                var intensity = (prevalu / (min * min));
                $scope.testDataHeatmap2.push({
                        lat: elem[0],
                        lng: elem[1],
                        count: intensity * 10
                    })
                    // console.log("intensity negative "+(intensity*10));
            } else {
                var intensity = (prevalu / (max * max));
                $scope.testDataHeatmap.push({
                        lat: elem[0],
                        lng: elem[1],
                        count: intensity * 10
                    })
                    // console.log("intensity positive "+(intensity*10));
            }


        }

        $scope.distances = distancesOnPoints(auxHeatmap);

        // *************************
        // overriden value
        $scope.radius = Math.round($scope.distances[0]) / 150000;
        // hardcoded for moja farmacja
        if ($scope.userProfile != undefined && $scope.userProfile != null && $scope.userProfile.heatMapMF == true) {
            $scope.heatmapradius = "Fixed0.5";
            $scope.radius = 0.5;
            $scope.localextreme = true;

        };

        //IR - for OralMED users, set radius to 0.3 and localextreme as TRUE
        if ($scope.userProfile != undefined && $scope.userProfile != null && $scope.userProfile.heatMapOM == true) {
            $scope.heatmapradius = "Fixed0.1";
            $scope.radius = 0.1;
            $scope.localextreme = true;

        };

        // console.log("min distance: " + distances[0] + " ; radius "+radius);

        for (var c = 0; c < auxGeojsonHeatmap.length; c++) {
            // populate geojsoncolors
            var aux = auxGeojsonHeatmap[c];

            var hue = 0;
            hue = 120 - (120 * (parseFloat(aux[1]) / max));
            if (aux[1] == 0)
                geojsoncolors[aux[0]] = 'white';
            else
                geojsoncolors[aux[0]] = hslToRgbToHex(hue / 360, 1, 1);
        }


        angular.extend($scope, {
            geojson: {
                data: $scope.geojsonObj,
                style: featureStyle
            }
        });



        $scope.$on("leafletDirectiveMap.geojsonMouseover", function(ev, feature, leafletEvent) {
            // console.log("geojsonMouseover");
            // countryMouseover(feature, leafletEvent);
            $scope.hoveredGeometry = feature.properties.ref + "    [" + feature.properties.StoreCodeAbbrv + "]";
        });
        $scope.$on("leafletDirectiveMap.geojsonMouseout", function(ev, feature, leafletEvent) {
            // countryMouseover(feature, leafletEvent);
            $scope.hoveredGeometry = "";
        });
        $scope.$on("leafletDirectiveMap.geojsonClick", function(ev, feature, leafletEvent) {
            // countryClick(featureSelected, leafletEvent);
            // console.log("click geojson");
            // leafletEvent.target.openPopup();
            // console.log(feature.properties);
            // console.log(leafletEvent);

            if ($location.path().indexOf('dashboard') > 0) {
                $location.path("/dashboard/" + $scope.pid + "/" + feature.properties.pointid);
            } else if ($location.path().indexOf('widget') > 0) {
                // console.log("PATH: "+ ("/widget/"+$scope.pid+"/"+$scope.wid+"/"+$scope.markers[args.markerName].pointid) );
                $location.path("/widget/" + $scope.pid + "/" + $scope.wid + "/" + feature.properties.pointid);
            } else {
                $location.path("/data/" + $scope.pid + "/" + feature.properties.pointid);
            }

        });


        leafletData.getMap().then(function(map) {

            // $scope.testDataHeatmap2 = [
            //     {lat: -7.965555, lng:-53.80444, count: 4},
            //     {lat: -9.2108333, lng:-52.4808333, count: 5}];


            var testData = {
                max: 8,
                data: $scope.testDataHeatmap
            };


            $scope.cfg = {
                // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                "radius": $scope.radius,
                "blur": 0.75,
                "maxOpacity": 0.85,
                "minOpacity": 0.0,
                // scales the radius based on map zoom
                "scaleRadius": true,
                // if set to false the heatmap uses the global maximum for colorization
                // if activated: uses the data maximum within the current map boundaries 
                //   (there will always be a red spot with useLocalExtremas true)
                "useLocalExtrema": $scope.localextreme,
                // which field name in your data represents the latitude - default "lat"
                latField: 'lat',
                // which field name in your data represents the longitude - default "lng"
                lngField: 'lng',
                // which field name in your data represents the data value - default "value"
                valueField: 'count',
                gradient: {
                    0: "rgb(0,255,0)",
                    0.75: "rgb(255,255,0)",
                    1.0: "rgb(255,0,0)"
                }
            };


            //IR - console.log("this is the new dashboard heatmap before any filter");
            console.log("this is the new dashboard heatmap");
            $scope.heatmapLayer = new HeatmapOverlay($scope.cfg);

            map.addLayer($scope.heatmapLayer);

            $scope.heatmapLayer.setData(testData);

            map.removeLayer($scope.heatmapLayer); // this is a hack...



            var testData2 = {
                max: 8,
                data: $scope.testDataHeatmap2
            };


            $scope.cfg2 = {
                // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                "radius": $scope.radius,
                "blur": 0.75,
                "maxOpacity": 0.85,
                "minOpacity": 0.0,
                // scales the radius based on map zoom
                "scaleRadius": true,
                // if set to false the heatmap uses the global maximum for colorization
                // if activated: uses the data maximum within the current map boundaries 
                //   (there will always be a red spot with useLocalExtremas true)
                "useLocalExtrema": $scope.localextreme,
                // which field name in your data represents the latitude - default "lat"
                latField: 'lat',
                // which field name in your data represents the longitude - default "lng"
                lngField: 'lng',
                // which field name in your data represents the data value - default "value"
                valueField: 'count',
                gradient: {
                    0: "rgb(255,0,255)",
                    0.75: "rgb(0,255,255)",
                    1.0: "rgb(0,0,255)"
                }
                // gradient: { 0: "rgb(0,255,0)", 0.5: "rgb(0,255,255)", 1.0: "rgb(0,0,255)"}
            };



            $scope.heatmapLayer2 = new HeatmapOverlay($scope.cfg2);

            map.addLayer($scope.heatmapLayer2);

            $scope.heatmapLayer2.setData(testData2);

            map.removeLayer($scope.heatmapLayer2); // this is a hack...

        });



        leafletData.getMap().then(function(map) {
            // console.log("MAP");



            var max = null;
            for (var i = 0; i < $scope.markers.length; i++) {
                var oA = $scope.markers[i];
                if (getPredecessorCoords(oA.predecessorId) != null) {
                    if (max == null) {
                        max = oA.value;
                    } else {
                        if (oA.value > max)
                            max = oA.value;
                    }
                }
            }



            var item, oA, oB;
            var counter = 0;
            $scope.polylinesAndDecors = new Array();

            for (var i = 0; i < $scope.markers.length; i++) {
                oA = $scope.markers[i];

                var locA = new L.LatLng(oA.lat, oA.lng);
                var locB = getPredecessorCoords(oA.predecessorId);


                var hue = 0;
                if (max != null)
                    hue = 120 - (120 * oA.value / max);

                // determinar hue green 120 a red 0
                // obter hue conforme value está entre 0 e max (4.5)

                // 120 * value/max

                // traduzir de hsl para hex
                // console.log(oA.value + " " + hue + " " + hslToRgbToHex(hue/100, 1, 1));



                if (locB != null) {
                    var polysubgroup = createPolyLine(locB, locA, map, hslToRgbToHex(hue / 360, 1, 1));
                    $scope.polylinesAndDecors = $scope.polylinesAndDecors.concat(polysubgroup);
                }
                // else, point has no precessor, so no polyline is to be drawn.
            }
            // console.log($scope.polylinesAndDecors);
            $scope.lg = L.layerGroup($scope.polylinesAndDecors);
            map.addLayer($scope.lg);



            function getPredecessorCoords(pointid) {
                for (var i = 0; i < $scope.markers.length; i++) {
                    if ($scope.markers[i].pointid == pointid)
                        return new L.LatLng($scope.markers[i].lat, $scope.markers[i].lng);
                }
                return null;
            }


            //draw polyline
            function createPolyLine(loc1, loc2, map, col) {
                // console.log(loc1);
                // console.log(loc2);
                // console.log("---");
                if (col == '#NaNNaNNaN')
                    col = null;
                var color = col || '#33EE33';

                var latlongs = [loc1, loc2];
                if (Math.abs(loc1.lng - loc2.lng) > 180) {
                    latlongs = [loc1.wrap(179, -179), loc2];
                }
                var polyline = new L.Polyline(latlongs, {
                    color: color,
                    opacity: 1,
                    weight: 5,
                    clickable: false
                });
                // }).addTo(map);

                var decorator = L.polylineDecorator(polyline, {
                    patterns: [
                        // define a pattern of 10px-wide dashes, repeated every 20px on the line 
                        {
                            offset: '50%',
                            symbol: L.Symbol.arrowHead({
                                pixelSize: 15,
                                pathOptions: {
                                    fillOpacity: 1,
                                    weight: 0,
                                    color: '#00BB00'
                                }
                            })
                        }
                    ]
                });
                // }).addTo(map);

                return [polyline, decorator];
            }
        });



    }).
    error(function(data, status) {});



    $scope.historyWidgetIcon = 'fa-expand';
    $scope.historyWidgetClass = 'col-md-6';
    $scope.historyWidgetChartWidth = 'width:90%;';

    $scope.expand = function(elemName) {
        if (elemName == 'history') {
            if ($scope.historyWidgetIcon == 'fa-expand') {
                $scope.historyWidgetIcon = 'fa-compress';
                $scope.historyWidgetClass = 'col-md-12';

            } else {
                $scope.historyWidgetIcon = 'fa-expand';
                $scope.historyWidgetClass = 'col-md-6';
            }
        }
    }



    function updateByFilter() {
        console.log("updateByFilter");
        var query = '/api/pointsFromWidgetFilter/' + $scope.pid + '/' + $scope.wid;

        $http.post(query, $scope.filterSpec).
        success(function(data, status) {

            console.log("/api/pointsFromWidgetFilter/ :");
            console.log(data);
            //console.log("read filtered pointlocations");
            //console.log(data);

            $scope.markers = new Array();
            //console.log("1st in order");

            var unit = data.unit;

            var max;
            var min;
            var auxHeatmap = [];
            var auxGeojsonHeatmap = [];
            $scope.dataPointsHeatmap = new Array();

            $scope.geojsonObj = {
                "type": "FeatureCollection",
                "crs": {
                    "type": "name",
                    "properties": {
                        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                    }
                },
                "features": []
            };


            // for(var d in data.locations){
            for (var d = 0; d < data.locations.length; d++) {
                if (data.locations[d].geometry == null) {
                    // NUNOALEX faz push se o pointid estiver no $scope.filterSpec.points
                    // console.log("$scope.filterSpec.points.length " + $scope.filterSpec.points.length);
                    if ($scope.filterSpec.points.length == 0 || isInArray($scope.filterSpec.points, data.locations[d].pointid))
                        auxHeatmap.push([data.locations[d].x, data.locations[d].y, data.locations[d].value, data.locations[d].name]);
                } else {
                    // NUNOALEX else temos de por noutro container para fazer o morph
                    auxGeojsonHeatmap.push([data.locations[d].pointid, data.locations[d].value]);
                }

                if ($scope.filterSpec.points.length == 0 || isInArray($scope.filterSpec.points, data.locations[d].pointid)) {

                    if (max == undefined || max == null) {
                        max = +data.locations[d].value;
                    } else {
                        if (+data.locations[d].value > max)
                            max = +data.locations[d].value;
                    }

                    if (min == undefined || min == null) {
                        min = +data.locations[d].value;
                    } else {
                        if (+data.locations[d].value < min)
                            min = +data.locations[d].value;
                    }

                }

                if (data.locations[d].pointid == $scope.pointid || isInArray($scope.filterSpec.points, data.locations[d].pointid)) {
                    // NUNOALEX ou se estiver no $scope.filterSpec.points

                    if (data.locations[d].geometry == null) {
                        $scope.markers.push({
                            lat: data.locations[d].x,
                            lng: data.locations[d].y,
                            pointid: data.locations[d].pointid,
                            zIndexOffset: 1000,
                            name: data.locations[d].name,
                            icon: {
                                type: 'awesomeMarker',
                                // icon: 'crosshairs',
                                icon: 'check',
                                prefix: 'fa',
                                markerColor: 'orange',
                                // spin: true,
                                weight: 5,
                                opacity: 0
                            }
                        });
                    } else {
                        $scope.geojsonObj.features.push(data.locations[d].geometry);
                    }

                } else {
                    var icon = 'circle';
                    var prefix = 'fa';
                    var markerColor = 'blue';
                    if (data.locations[d].type == "Laboratory") {
                        icon = 'home';
                        // markerColor = 'green';
                    } else if (data.locations[d].type == "Distribution") {
                        icon = 'ambulance';
                        // markerColor = 'orange';
                    } else if (data.locations[d].type == "Final Client") {
                        icon = 'users';
                        // markerColor = 'purple';
                    }
                    //console.log(data.locations[d]);


                    if (data.locations[d].geometry == null) {
                        $scope.markers.push({
                            lat: data.locations[d].x,
                            lng: data.locations[d].y,
                            pointid: data.locations[d].pointid,
                            predecessorId: data.locations[d].predecessor,
                            value: parseFloat(data.locations[d].value),
                            message: buildMessage(data.locations[d], true),
                            name: data.locations[d].name,
                            // layer: attrType,
                            icon: {
                                type: 'awesomeMarker',
                                // icon: 'crosshairs',
                                icon: icon,
                                prefix: prefix,
                                markerColor: markerColor,
                                // spin: true,
                                opacity: 0
                            }
                        });
                    } else {
                        $scope.geojsonObj.features.push(data.locations[d].geometry);
                    }


                }
            }

            // console.log("min is "+min+"; max is "+max);

            $scope.testDataHeatmap = new Array();
            $scope.testDataHeatmap2 = new Array();

            for (var z in auxHeatmap) {
                var elem = auxHeatmap[z];

                var prevalu = elem[2] * elem[2];


                if (elem[2] < 0) {
                    var intensity = (prevalu / (min * min));
                    $scope.testDataHeatmap2.push({
                            lat: elem[0],
                            lng: elem[1],
                            count: intensity * 10
                        })
                        // console.log("intensity negative "+(intensity*10));
                } else {
                    var intensity = (prevalu / (max * max));
                    $scope.testDataHeatmap.push({
                            lat: elem[0],
                            lng: elem[1],
                            count: intensity * 10
                        })
                        // console.log("intensity positive "+(intensity*10));
                }


                // $scope.dataPointsHeatmap.push([elem[0], elem[1], (elem[2]/(max)) ]);
            }

            // update the positive heatmap
            // $scope.updateHeatmapSize(null, $scope.dataPointsHeatmap);



            angular.extend($scope, {
                geojson: {
                    data: $scope.geojsonObj,
                    style: featureStyle
                }
            });



            leafletData.getMap().then(function(map) {

                // $scope.testDataHeatmap2 = [
                //     {lat: -7.965555, lng:-53.80444, count: 4},
                //     {lat: -9.2108333, lng:-52.4808333, count: 5}];

                map.removeLayer($scope.heatmapLayer);

                var testData = {
                    max: 8,
                    data: $scope.testDataHeatmap
                };


                $scope.heatmapLayer = new HeatmapOverlay($scope.cfg);

                map.addLayer($scope.heatmapLayer);

                $scope.heatmapLayer.setData(testData);

                if (!$scope.showingHeatmap)
                    map.removeLayer($scope.heatmapLayer); // this is a hack...



                map.removeLayer($scope.heatmapLayer2);

                var testData2 = {
                    max: 8,
                    data: $scope.testDataHeatmap2
                };



                $scope.heatmapLayer2 = new HeatmapOverlay($scope.cfg2);

                // we need to test if the map already has it. if not, do the add
                map.addLayer($scope.heatmapLayer2);

                $scope.heatmapLayer2.setData(testData2);


                if (!$scope.showingHeatmap)
                    map.removeLayer($scope.heatmapLayer2); // this is a hack...



                if ($scope.showingHeatmap)
                    map.removeControl($scope.legend);

                $scope.legend = L.control({
                    position: 'bottomleft'
                });

                $scope.legend.onAdd = function(map) {
                    var div = L.DomUtil.create('div', 'info legend'),
                        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                        labels = [];
                    // loop through our density intervals and generate a label with a colored square for each interval
                    // for (var i = 0; i < grades.length; i++) {
                    //     div.innerHTML +=
                    //         '<i style="background:' + '#0000ff' + '"></i> ' +
                    //         grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                    // }

                    div.innerHTML += "<h5 style='margin-top: 0;'>Heatmap values</h5>";

                    var max2 = max * 0.25;
                    var max3 = max * 0.75;
                    var min2 = min * 0.25;
                    var min3 = min * 0.75;

                    if (min < 0) {
                        div.innerHTML +=
                            '<i style="background:' + '#ff0000' + '"></i> ' +
                            +max.toFixed(2) + ' ' + unit + '<br>';
                        div.innerHTML +=
                            '<i style="background:' + '#ffff00' + '; opacity: 0.75;"></i> ' +
                            +max3.toFixed(2) + ' ' + unit + '<br>';
                        div.innerHTML +=
                            '<i style="background:' + '#00ff00' + '; opacity: 0.5;"></i> ' +
                            +max2.toFixed(2) + ' ' + unit + '<br>';
                        div.innerHTML +=
                            '<i style="background:' + 'transparent' + '"></i> ' +
                            0 + ' ' + unit + '<br>';
                        div.innerHTML +=
                            '<i style="background:' + '#ff00ff' + '; opacity: 0.5;"></i> ' +
                            +min2.toFixed(2) + ' ' + unit + '<br>';
                        div.innerHTML +=
                            '<i style="background:' + '#00ffff' + '; opacity: 0.75;"></i> ' +
                            +min3.toFixed(2) + ' ' + unit + '<br>';

                        div.innerHTML +=
                            '<i style="background:' + '#0000ff' + '"></i> ' +
                            +min.toFixed(2) + ' ' + unit + '<br>';
                    } else {
                        div.innerHTML +=
                            '<i style="background:' + '#ff0000' + '"></i> ' +
                            +max.toFixed(2) + ' ' + unit + '<br>';
                        div.innerHTML +=
                            '<i style="background:' + '#ffff00' + '; opacity: 0.75;"></i> ' +
                            +max3.toFixed(2) + ' ' + unit + '<br>';
                        div.innerHTML +=
                            '<i style="background:' + '#00ff00' + '; opacity: 0.5;"></i> ' +
                            +max2.toFixed(2) + ' ' + unit + '<br>';
                        div.innerHTML +=
                            '<i style="background:' + 'transparent' + '"></i> ' +
                            0 + ' ' + unit + '<br>';
                    }

                    return div;
                };

                if ($scope.showingHeatmap)
                    $scope.legend.addTo(map);


            });



            var bounds = [];
            for (var i = 0; i < $scope.markers.length; i++) {
                bounds.push([$scope.markers[i].lat, $scope.markers[i].lng])
            }
            bounds.push([$scope.madeira.lat, $scope.madeira.lng]);
            if (bounds.length > 0) {
                leafletData.getMap().then(function(map) {
                    map.fitBounds(bounds, {
                        padding: [50, 50]
                    });
                });
            }



            leafletData.getMap().then(function(map) {


                // var ctr = 0;
                // console.log("map._layers lenght "+(Object.keys(map._layers).length));
                // for(i in map._layers) {
                //     if(map._layers[i]._path != undefined) {
                //       ctr++;
                //       console.log(map._layers[i]);
                //       try {
                //           map.removeLayer(map._layers[i]);
                //           console.log("map._layers lenght "+(Object.keys(map._layers).length));
                //       }
                //       catch(e) {
                //           console.log("problem with " + e + map._layers[i]);
                //       }
                //     }
                // }

                // console.log("2nd in order; removed "+ctr);


                map.removeLayer($scope.lg);

                var max = null;
                for (var i = 0; i < $scope.markers.length; i++) {
                    var oA = $scope.markers[i];
                    if (getPredecessorCoords(oA.predecessorId) != null) {
                        if (max == null) {
                            max = oA.value;
                        } else {
                            if (oA.value > max)
                                max = oA.value;
                        }
                    }
                }


                var item, oA, oB;
                $scope.polylinesAndDecors = new Array();

                for (var i = 0; i < $scope.markers.length; i++) {
                    oA = $scope.markers[i];

                    var locA = new L.LatLng(oA.lat, oA.lng);
                    var locB = getPredecessorCoords(oA.predecessorId);


                    var hue = 0;
                    if (max != null)
                        hue = 120 - (120 * oA.value / max);
                    // determinar hue green 120 a red 0
                    // obter hue conforme value está entre 0 e max (4.5)

                    // 120 * value/max

                    // traduzir de hsl para hex
                    // console.log(oA.value + " " + hue + " " + hslToRgbToHex(hue/100, 1, 1));



                    if (locB != null) {
                        var polysubgroup = createPolyLine(locB, locA, map, hslToRgbToHex(hue / 360, 1, 1));
                        $scope.polylinesAndDecors = $scope.polylinesAndDecors.concat(polysubgroup);

                    }
                    // else, point has no precessor, so no polyline is to be drawn.
                }
                $scope.lg = L.layerGroup($scope.polylinesAndDecors);
                map.addLayer($scope.lg);



                function getPredecessorCoords(pointid) {
                    for (var i = 0; i < $scope.markers.length; i++) {
                        if ($scope.markers[i].pointid == pointid)
                            return new L.LatLng($scope.markers[i].lat, $scope.markers[i].lng);
                    }
                    return null;
                }


                //draw polyline
                function createPolyLine(loc1, loc2, map, col) {
                    // console.log(loc1);
                    // console.log(loc2);
                    // console.log("---");
                    if (col == '#NaNNaNNaN')
                        col = null;
                    var color = col || '#33EE33';

                    var latlongs = [loc1, loc2];
                    if (Math.abs(loc1.lng - loc2.lng) > 180) {
                        latlongs = [loc1.wrap(179, -179), loc2];
                    }
                    var polyline = new L.Polyline(latlongs, {
                        color: color,
                        opacity: 1,
                        weight: 5,
                        clickable: false
                    });

                    var decorator = L.polylineDecorator(polyline, {
                        patterns: [
                            // define a pattern of 10px-wide dashes, repeated every 20px on the line 
                            {
                                offset: '50%',
                                symbol: L.Symbol.arrowHead({
                                    pixelSize: 15,
                                    pathOptions: {
                                        fillOpacity: 1,
                                        weight: 0,
                                        color: '#00BB00'
                                    }
                                })
                            }
                        ]
                    });

                    return [polyline, decorator];
                }


            });

        }).
        error(function(data, status) {});
    }


    $scope.$on('handleBroadcast', function() {
        if (sharedCommsService.message == "filterSpec") {
            console.log("received filter filterSpec");
            //console.log(sharedCommsService.widgetFilter);


            // reset every base variable
            // read from new api method to get points according to filter via post filter
            // '/api/pointsFromWidgetFilter/'+$scope.pid+'/'+$scope.wid
            updateByFilter();

        }

        if (sharedCommsService.message == "eraseFilterGeo") {
            // just erase the filterGeo geometry (circle or rectangle)

            leafletData.getMap().then(function(map) {
                var drawnItems = $scope.controls.edit.featureGroup;

                var allLayers = $scope.controls.edit.featureGroup._layers;
                for (var prop in allLayers) {
                    // console.log(allLayers[prop]);
                    drawnItems.removeLayer(allLayers[prop]);
                }


                // drawnItems.removeLayer(allLayers);


                // allLayers.forEach(function(layer){
                //   drawnItems.removeLayer(layer);
                // })
            });
        }

    });

    var activateHeatmap = function(map) {

        console.log("heatmap add2");
        map.addLayer($scope.heatmapLayer);
        map.addLayer($scope.heatmapLayer2);
        $scope.legend.addTo(map);

        $scope.heatmapActive = true;
        angular.extend($scope, {
            geojson: {
                data: $scope.geojsonObj,
                style: featureStyle
            }
        });

        $scope.showingHeatmap = true;

    }

    var deactivateHeatmap = function(map) {

        console.log("heatmap remove2");
        map.removeLayer($scope.heatmapLayer);
        map.removeLayer($scope.heatmapLayer2);
        map.removeControl($scope.legend);

        $scope.heatmapActive = false;
        angular.extend($scope, {
            geojson: {
                data: $scope.geojsonObj,
                style: featureStyle
            }
        });

        $scope.showingHeatmap = false;
    }

    $scope.$watch('heatmapcheck', function() {
        //console.log($scope.heatmapcheck);

        leafletData.getMap().then(function(map) {
            if ($scope.heatmapcheck == true) {
                activateHeatmap(map);
            } else if ($scope.heatmapcheck == false) {

                deactivateHeatmap(map);
            }
        });
    });


    leafletData.getMap().then(function(map) {
        map.on('overlayremove', function(eventLayer) {
            // console.log("overlayremove");
            if (eventLayer.name == 'Heat Map') {
                deactivateHeatmap(map);
            }
            // Switch to the Permafrost legend...
            // if (eventLayer.name === 'Permafrost') {
            //     map.removeControl(legend1);
            //     legend2.addTo(map);
            // } else { // Or switch to the treeline legend...
            //     map.removeControl(legend2);
            //     legend1.addTo(map);
            // }
        });


        map.on('overlayadd', function(eventLayer) {
            // console.log("overlayadd "+(eventLayer.name));
            if (eventLayer.name == 'Heat Map') {
                activateHeatmap(map);
            }

        });
    });


    $scope.configBoxClass = "display-none";
    $scope.configBoxIcon = "fa-sort-desc";

    $scope.applyConfigButtonText = 'Apply Config';
    $scope.applyConfigButtonDisabled = false;

    $scope.localextreme = false;

    $scope.heatmapradius = "Small";
    // overridden for moja farmacja
    if ($scope.userProfile != undefined && $scope.userProfile != null && $scope.userProfile.heatMapMF == true) {
        $scope.heatmapradius = "Fixed0.5";
        $scope.localextreme = true;
    }
    //IR - for OralMED users, set radius to 0.3 and localextreme as TRUE
    if ($scope.userProfile != undefined && $scope.userProfile != null && $scope.userProfile.heatMapOM == true) {
        $scope.heatmapradius = "Fixed0.1";
        $scope.radius = 0.1;
        $scope.localextreme = true;

    };


    $scope.configBoxFunction = function() {

        if ($scope.configBoxClass == "display-none") {
            $scope.configBoxIcon = "fa-sort-asc";
            $scope.configBoxClass = "display-block";
        } else {
            $scope.configBoxIcon = "fa-sort-desc";
            $scope.configBoxClass = "display-none";
        }
    }


    $scope.applyConfig = function() {
        // console.log("applyConfig");
        // console.log($scope.localextreme);
        // console.log($scope.heatmapradius);

        $scope.radius = Math.round($scope.distances[0]) / 150000;

        if ($scope.heatmapradius == "Tiny") {
            $scope.radius = $scope.radius / 2;
        } else if ($scope.heatmapradius == "Small") {

        } else if ($scope.heatmapradius == "Medium") {
            $scope.radius = $scope.radius * 2;
        } else if ($scope.heatmapradius == "Big") {
            $scope.radius = $scope.radius * 3;
            // $scope.radius = Math.round((($scope.distances[0]+$scope.distances[1])/2)) / 150000;
        } else if ($scope.heatmapradius == "Giant") {
            $scope.radius = $scope.radius * 6;
        } else if ($scope.heatmapradius == "Fixed0.005") {
            $scope.radius = 0.005;
        } else if ($scope.heatmapradius == "Fixed0.01") {
            $scope.radius = 0.01;
        } else if ($scope.heatmapradius == "Fixed0.1") {
            $scope.radius = 0.1;
        } else if ($scope.heatmapradius == "Fixed0.5") {
            $scope.radius = 0.5;
        } else if ($scope.heatmapradius == "Fixed1") {
            $scope.radius = 1;
        } else if ($scope.heatmapradius == "Average") {
            $scope.radius = Math.round((($scope.distances[0] + $scope.distances[1]) / 2)) / 150000;
        }



        leafletData.getMap().then(function(map) {
            map.removeLayer($scope.heatmapLayer);
            map.removeLayer($scope.heatmapLayer2);

            var testData = {
                max: 8,
                data: $scope.testDataHeatmap
            };

            $scope.cfg = {
                // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                "radius": $scope.radius,
                "blur": 0.75,
                "maxOpacity": 0.85,
                "minOpacity": 0.0,
                // scales the radius based on map zoom
                "scaleRadius": true,
                // if set to false the heatmap uses the global maximum for colorization
                // if activated: uses the data maximum within the current map boundaries 
                //   (there will always be a red spot with useLocalExtremas true)
                "useLocalExtrema": $scope.localextreme,
                // which field name in your data represents the latitude - default "lat"
                latField: 'lat',
                // which field name in your data represents the longitude - default "lng"
                lngField: 'lng',
                // which field name in your data represents the data value - default "value"
                valueField: 'count',
                gradient: {
                    0: "rgb(0,255,0)",
                    0.75: "rgb(255,255,0)",
                    1.0: "rgb(255,0,0)"
                }
            };


            console.log("this is my heatmap3");
            $scope.heatmapLayer = new HeatmapOverlay($scope.cfg);
            map.addLayer($scope.heatmapLayer);
            $scope.heatmapLayer.setData(testData);

            if (!$scope.showingHeatmap)
                map.removeLayer($scope.heatmapLayer);


            var testData2 = {
                max: 8,
                data: $scope.testDataHeatmap2
            };

            $scope.cfg2 = {
                // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                "radius": $scope.radius,
                "blur": 0.75,
                "maxOpacity": 0.85,
                "minOpacity": 0.0,
                // scales the radius based on map zoom
                "scaleRadius": true,
                // if set to false the heatmap uses the global maximum for colorization
                // if activated: uses the data maximum within the current map boundaries 
                //   (there will always be a red spot with useLocalExtremas true)
                "useLocalExtrema": $scope.localextreme,
                // which field name in your data represents the latitude - default "lat"
                latField: 'lat',
                // which field name in your data represents the longitude - default "lng"
                lngField: 'lng',
                // which field name in your data represents the data value - default "value"
                valueField: 'count',
                gradient: {
                    0: "rgb(255,0,255)",
                    0.75: "rgb(0,255,255)",
                    1.0: "rgb(0,0,255)"
                }
                // gradient: { 0: "rgb(0,255,0)", 0.5: "rgb(0,255,255)", 1.0: "rgb(0,0,255)"}
            };



            $scope.heatmapLayer2 = new HeatmapOverlay($scope.cfg2);
            map.addLayer($scope.heatmapLayer2);
            $scope.heatmapLayer2.setData(testData2);

            if (!$scope.showingHeatmap)
                map.removeLayer($scope.heatmapLayer2);


            $scope.configBoxIcon = "fa-sort-desc";
            $scope.configBoxClass = "display-none";

        });
    };



    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1); // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }



    function testPointInsideCircle(px, py, cx, cy, r) {
        // calc distance elem.lat, elem.lng to filterGeo.x, filterGeo.y
        // check if distance is smaller or equal than filterGeo.radius
        // if true, return true
        var dist = getDistanceFromLatLonInKm(px, py, cx, cy);
        // console.log(px + " " + py + " to  " + cx + " " + cy + " is " + dist + " <= " + r/1000);
        if (dist <= r / 1000)
            return true;
        else
            return false;
    }


    function testPointInsideRect(px, py, layer) {
        var point = L.latLng(px, py);
        var bounds = layer.getBounds();
        // console.log("is inside? "+ bounds.contains(point));
        return bounds.contains(point);
    }


    function testElemInsideShape(elem, filterGeo, shapeType) {
        if (elem.lat != undefined && elem.lng != undefined) {
            // this is a marker
            if (shapeType == "circle")
                return testPointInsideCircle(elem.lat, elem.lng, filterGeo.latLng.lat, filterGeo.latLng.lng, filterGeo.radius);
            else if (shapeType == "rectangle")
                return testPointInsideRect(elem.lat, elem.lng, filterGeo.layer);
        } else {
            // console.log(elem.geometry.coordinates);
            var test = false;
            for (var i = 0; i < elem.geometry.coordinates.length; i++) {
                var aux = elem.geometry.coordinates[i];
                if (aux.length == 2 && typeof aux[0] == "number") {
                    if (shapeType == "circle") {
                        if (testPointInsideCircle(aux[1], aux[0], filterGeo.latLng.lat, filterGeo.latLng.lng, filterGeo.radius))
                            test = true;
                    } else if (shapeType == "rectangle") {
                        if (testPointInsideRect(aux[1], aux[0], filterGeo.layer))
                            test = true;
                    }
                } else {
                    // go deeper on the array
                    for (var j = 0; j < aux.length; j++) {
                        var subaux = aux[j];

                        if (subaux.length == 2 && typeof subaux[0] == "number") {
                            if (shapeType == "circle") {
                                if (testPointInsideCircle(subaux[1], subaux[0], filterGeo.latLng.lat, filterGeo.latLng.lng, filterGeo.radius))
                                    test = true;
                            } else if (shapeType == "rectangle") {
                                if (testPointInsideRect(subaux[1], subaux[0], filterGeo.layer))
                                    test = true;
                            }
                        } else {
                            for (var k = 0; k < subaux.length; k++) {
                                var subsubaux = subaux[k];

                                if (subsubaux.length == 2 && typeof subsubaux[0] == "number") {
                                    if (shapeType == "circle") {
                                        if (testPointInsideCircle(subsubaux[1], subsubaux[0], filterGeo.latLng.lat, filterGeo.latLng.lng, filterGeo.radius))
                                            test = true;
                                    } else if (shapeType == "rectangle") {
                                        if (testPointInsideRect(subsubaux[1], subsubaux[0], filterGeo.layer))
                                            test = true;
                                    }
                                } else {
                                    // console.info(subsubaux);
                                    console.warn("there are more levels on the GeoJSON to scan!!");
                                }
                            }

                        }
                    }
                }


            }
            return test;
        }
    }


    function getIntersectingPointids(filterGeo) {
        // filter by circle (circlex, circley, radius) 
        // (calc geometries inside circle to return pointid
        // [fazer loop em todos as geometries, obter 1o as bounds de cada para filtrar logo de inicio, 
        // e 2o so dps das bounds se intersectarem é que fazemos o calculo fino de ver se estao dentro ou nao], 
        // dps retornar array de pointids que estao la dentro)
        var toRet = new Array();
        // console.log($scope.markers);
        // console.log($scope.geojson.data.features);
        // console.log("------------");

        $scope.markers.forEach(testInsideMethod)

        $scope.geojson.data.features.forEach(testInsideMethod);

        function testInsideMethod(elem) {
            if (filterGeo.type == "circle") {
                if (testElemInsideShape(elem, filterGeo, "circle"))
                    toRet.push(elem.pointid || elem.properties.pointid);
            } else if (filterGeo.type == "rectangle") {
                if (testElemInsideShape(elem, filterGeo, "rectangle"))
                    toRet.push(elem.pointid || elem.properties.pointid);
            }
        }

        return toRet;
    }



    var getShapeType = function(layer) {
        if (layer instanceof L.Circle) {
            return 'circle';
        }
        if (layer instanceof L.Marker) {
            return 'marker';
        }
        if ((layer instanceof L.Polyline) && !(layer instanceof L.Polygon)) {
            return 'polyline';
        }
        if ((layer instanceof L.Polygon) && !(layer instanceof L.Rectangle)) {
            return 'polygon';
        }
        if (layer instanceof L.Rectangle) {
            return 'rectangle';
        }
    };


    var highlightMarkers = function(markers, filteredPointids) {
        for (var i = 0; i < markers.length; i++) {
            var elem = markers[i];
            if (isInArray(filteredPointids, elem.pointid)) {
                elem.icon.markerColor = "orange";
            } else {
                elem.icon.markerColor = "blue";
            }
        }
    }


    leafletData.getMap().then(function(map) {
        if ($scope.controls.edit == undefined)
            return;

        var drawnItems = $scope.controls.edit.featureGroup;
        var currlayer;
        map.on('draw:created', function(e) {
            var type = e.layerType;
            var layer = e.layer;
            var filterGeo = {};

            if (type == "circle") {
                filterGeo.type = type;
                filterGeo.radius = layer._mRadius;
                filterGeo.latLng = layer._latlng;

            } else if (type == "rectangle") {
                filterGeo.type = type;
                filterGeo.latLngs = layer._latlngs;
                filterGeo.layer = layer;
            }
            // send to WidgetCtrl via sharedComms?

            $scope.filteringPointsDraw = true;

            $scope.filteredPoints = getIntersectingPointids(filterGeo);
            sharedCommsService.filteringPointsDraw = $scope.filteringPointsDraw;
            sharedCommsService.pointIdsToFilter = $scope.filteredPoints;

            if ($scope.markers.length > 0)
                updateByFilter();
            // highlightMarkers($scope.markers, $scope.filteredPoints);

            angular.extend($scope, {
                geojson: {
                    data: $scope.geojsonObj,
                    style: featureStyle
                }
            });

            sharedCommsService.bufferAndBroadcast("filterGeo");

            drawnItems.addLayer(layer);
            // console.log(JSON.stringify(layer.toGeoJSON()));
        });

        map.on('draw:edited', function(e) {
            var layers = e.layers;
            layers.eachLayer(function(layer) {
                //do whatever you want, most likely save back to db
                var type = getShapeType(layer);

                var filterGeo = {};

                if (type == "circle") {
                    filterGeo.type = type;
                    filterGeo.radius = layer._mRadius;
                    filterGeo.latLng = layer._latlng;

                } else if (type == "rectangle") {
                    filterGeo.type = type;
                    filterGeo.latLngs = layer._latlngs;
                    filterGeo.layer = layer;
                }
                // send to WidgetCtrl via sharedComms?

                $scope.filteringPointsDraw = true;

                $scope.filteredPoints = getIntersectingPointids(filterGeo);
                sharedCommsService.filteringPointsDraw = $scope.filteringPointsDraw;
                sharedCommsService.pointIdsToFilter = $scope.filteredPoints;

                if ($scope.markers.length > 0)
                    updateByFilter();
                // highlightMarkers($scope.markers, $scope.filteredPoints);

                angular.extend($scope, {
                    geojson: {
                        data: $scope.geojsonObj,
                        style: featureStyle
                    }
                });

                sharedCommsService.bufferAndBroadcast("filterGeo");

            });
        });

        map.on('draw:deleted', function(e) {
            $scope.filteredPoints = new Array();
            $scope.filteringPointsDraw = false;

            sharedCommsService.filteringPointsDraw = $scope.filteringPointsDraw;
            sharedCommsService.pointIdsToFilter = $scope.filteredPoints;

            // highlightMarkers($scope.markers, $scope.filteredPoints);
            if ($scope.markers.length > 0)
                updateByFilter();

            angular.extend($scope, {
                geojson: {
                    data: $scope.geojsonObj,
                    style: featureStyle
                }
            });

            sharedCommsService.bufferAndBroadcast("filterGeo");

        });
    });


}



DemoOrderedPointsController.$inject = ['$scope', '$http', '$routeParams', '$location', 'sharedCommsService'];

function DemoOrderedPointsController($scope, $http, $routeParams, $location, sharedCommsService) {
    console.log("DemoOrderedPointsController!!!");
    $scope.pid = $routeParams.pid;
    $scope.iid = $routeParams.iid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    // // // console.log($scope);

    // leafletData.getMap().then(function(map) {
    //     // map.fitBounds([ [40.712, -74.227], [40.774, -74.125] ]);

    //     if($scope.pointid != null && $scope.pointid != undefined){
    //       // // // console.log("center on point");
    //       map.setView([32.666667,-16.75], 9);
    //     } else {
    //       // center on madeira ----- this is hardcoded!!!!!
    //       // // // console.log("center on map center");
    //       map.setView([32.666667,-16.85], 4);
    //     }
    // });



    $scope.addPointMode = false;

    $http.get('/api/getProjectCenter/' + $scope.pid).
    success(function(data) {
        // // // console.log("yeah getProjectCenter");
        // $location.path('/projects');
        // // // console.log(data);
        $scope.madeira.lat = data.x;
        $scope.madeira.lng = data.y;
        $scope.madeira.zoom = 10;
    });


    angular.extend($scope, {
        london: {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        },
        madeira: {
            lat: 39.666667,
            lng: -8.133333,
            zoom: 6
        },
        events: {},
        layers: {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                cycle: {
                    name: 'OpenCycleMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                google: {
                    name: 'Google Satellite',
                    layerType: 'SATELLITE',
                    type: 'google'
                }
            }
        }
    });

    $scope.markers = new Array();



    $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        // Args will contain the marker name and other relevant information
        // // // console.log("Leaflet Click");
        // // // console.log(args);
        // // // console.log($scope.markers[args.markerName].pointid);
        // agora é ir ao /dashboard/:pid/:pointid e ele faz o render do dashboard para o projectid e pointid
        // // // console.log("/dashboardPoint/"+$scope.pid+"/"+$scope.markers[args.markerName].pointid);
        $location.path("/dashboard/" + $scope.pid + "/" + $scope.markers[args.markerName].pointid);
    });



    $http.get('/api/orderedPointValuesOfParameter/' + $scope.pid + '/' + $scope.iid + '/' + $scope.parmid).
    success(function(data, status) {
        // // // console.log("read ordered pointlocations");
        // // // console.log(data.locations);
        $scope.markers = new Array();

        for (var d in data.locations) {
            // // // console.log(data[d]);
            $scope.markers.push({
                lat: data.locations[d].x,
                lng: data.locations[d].y,
                pointid: data.locations[d].pointid,
                message: "added"
            });
        }
    }).
    error(function(data, status) {});

}



var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

CalendarCtrl.$inject = ['$scope', '$http', '$routeParams', 'sharedCommsService'];

function CalendarCtrl($scope, $http, $routeParams, sharedCommsService) {
    // // // console.log("CalendarCtrl!!!");
    $scope.pid = $routeParams.pid;
    $scope.pointid = $routeParams.pointid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.nextActivity = {};

    $scope.addForm = 'display-none';
    $scope.viewForm = 'display-none';

    var getQuery = '/api/activities/' + $scope.pid;
    if ($scope.pointid != undefined || $scope.pointid != null)
        getQuery += '/' + $scope.pointid;

    $http.get(getQuery).
    success(function(data) {
        // // // console.log("data is ");
        // // // console.log(data);

        for (var i = 0; i < data.length; i++) {
            var aux_obj = {};
            aux_obj.title = data[i].title;
            aux_obj.start = new Date(data[i].start);
            aux_obj.aid = data[i].aid;
            aux_obj.allDay = data[i].allDay;
            aux_obj.responsible = data[i].responsible;

            // // // console.log(aux_obj);
            $scope.events.push(aux_obj);

            var date_next = new Date($scope.nextActivity.start);
            var date_aux = new Date(aux_obj.start);
            var today = new Date();
            // today.setHours(myDate.getDate()-1);

            // // // console.log("Comparing aux < next "+ (date_aux < date_next) );


            if ($scope.nextActivity.start == undefined || $scope.nextActivity.start == null || (date_aux < date_next)) {
                // end a null, compara só o dia inclusive
                //else
                // // // console.log("Comparing today!");
                // // // console.log("today: " + today + " -- aux_date "+date_aux);
                if (aux_obj.allDay)
                    today.setHours(0, 0, 0, 0);
                // // // console.log("today: " + today + " -- aux_date "+date_aux);
                if (date_aux >= today)
                    $scope.nextActivity = aux_obj;

            }



        }

        if ($scope.nextActivity.start == undefined || $scope.nextActivity.start == null) {
            $scope.nextActivity.day = "None";
            $scope.nextActivity.daySuffix = "";
            $scope.nextActivity.month = "";
            $scope.nextActivity.year = "";
        } else {
            $scope.nextActivity.day = new Date($scope.nextActivity.start).getDate();
            if ($scope.nextActivity.day == '1')
                $scope.nextActivity.daySuffix = "st";
            else if ($scope.nextActivity.day == '2')
                $scope.nextActivity.daySuffix = "nd";
            else if ($scope.nextActivity.day == '3')
                $scope.nextActivity.daySuffix = "rd";
            else
                $scope.nextActivity.daySuffix = "th";
            $scope.nextActivity.month = monthNames[new Date($scope.nextActivity.start).getMonth()];
            $scope.nextActivity.year = new Date($scope.nextActivity.start).getFullYear();
        }


        // $scope.events[0].title = data[0].title;
        // $scope.nextActivity = data.nextActivity;
        // $scope.nextStart = data.nextStart;
        // $scope.events[0].start = $scope.nextStart;
    });


    $scope.nextActivity = {
        name: 'Water Sampling',
        day: '28',
        month: 'May',
        year: '2014'
    };

    // read from api
    // $http.get('/api/nextActivity/').
    //   success(function(data) {
    //     // // // console.log("data is ");
    //     // // // console.log(data.nextActivity);
    //     $scope.nextActivity = data.nextActivity;
    //     $scope.nextStart = data.nextStart;
    //     // // // console.log("NEXT ACTIVITYYYYYYYY:");
    //     // // // console.log($scope.nextStart);
    //     // // // console.log($scope.events[0].start);
    //     $scope.events[0].start = $scope.nextStart;
    //   });


    $scope.alertOnDrop = function(elem) {
        var dateDropped = new Date(elem.start);
        // // // console.log(elem);
        // // // console.log(dateDropped.getDate());
        var togo = {
            'aid': elem.aid,
            'title': elem.title,
            'start': elem.start,
            'end': elem.end,
            'allDay': elem.allDay
        };

        var postQuery = '/api/activities/' + $scope.pid;
        if ($scope.pointid != undefined || $scope.pointid != null)
            postQuery += '/' + $scope.pointid;

        $http.post(postQuery, togo).
        success(function(data) {
            // // // console.log("yeah postNextActivity!");
            // $location.path('/projects');
        });
    };

    $scope.alertDayClick = function(date, allDay, jsEvent, view) {
        $scope.addForm = '';
        $scope.viewForm = 'display-none';

        $scope.calEventsExt.events = [];
        if (allDay) {
            // // // console.log('Clicked on the entire day: ' + date);
        } else {
            // // // console.log('Clicked on the slot: ' + date);
        }
        $scope.toAdd.title = '<empty name>';
        $scope.toAdd.start = new Date(date);
        if (allDay)
            $scope.toAdd.end = null;
        $scope.toAdd.allDay = allDay;
        // // // console.log("to add start "+$scope.toAdd.start);
        // $scope.eventsToAdd.push({title:$scope.toAdd.title, start:$scope.toAdd.start});
        $scope.calEventsExt.events.push({
            title: $scope.toAdd.title,
            start: new Date($scope.toAdd.start),
            "allDay": allDay
        });
        // // // console.log($scope.events);
    };

    $scope.toAdd = {};

    $scope.addActivity = function() {
        $scope.addForm = 'display-none';
        $scope.viewForm = 'display-none';
        $scope.calEventsExt.events = [];
        // $scope.events.push(toAdd);
        // falta adicionar à API
        // // // console.log("sneding scope toadd");
        // // // console.log($scope.toAdd);
        var postQuery = '/api/activities/' + $scope.pid;
        if ($scope.pointid != undefined || $scope.pointid != null)
            postQuery += '/' + $scope.pointid;

        $http.post(postQuery, $scope.toAdd).
        success(function(data) {
            // // // console.log("yeah postNextActivity!");
            // $location.path('/projects');
            // $.each(function(data, i) {
            data.start = new Date(data.start);
            // });

            $scope.events.push(data);
            // // // console.log("received start date "+data.start);
            // // // console.log("translated date "+ (new Date(data.start)) );
            $scope.toAdd = {};
        });
    }

    $scope.alertEventClick = function(eventCell, jsEvent, view) {
        // // // console.log('alertEventClick');
        $scope.addForm = 'display-none';
        $scope.viewForm = '';

        // // // console.log("eventCell");
        // // // console.log(eventCell);

        $scope.toAdd.title = eventCell.title;
        $scope.toAdd.start = new Date(eventCell.start);
        $scope.toAdd.end = eventCell.end;
        $scope.toAdd.allDay = eventCell.allDay;
        $scope.toAdd.location = eventCell.location;
        $scope.toAdd.responsible = eventCell.responsible; // isto tem de vir do events, que veio da BD
        $scope.calEventsExt.events = [];
    };


    $scope.activityToAdd = '';

    $scope.uiConfig = {
        calendar: {
            height: 400,
            editable: true,
            header: {
                // left: 'month basicWeek basicDay agendaWeek agendaDay',
                left: 'agendaDay agendaWeek month',
                center: 'title',
                right: 'today prev,next'
            },
            dayClick: $scope.alertDayClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventClick: $scope.alertEventClick
        }
    };



    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();


    // $scope.events = [
    //   { title: 'Water Sampling', start: new Date(y, m, 28) }, { title: 'Water 2', start: new Date(y, m, 29) }
    // ];
    $scope.events = [];
    $scope.eventsToAdd = [];
    // // // console.log("1 events:");
    // // // console.log($scope.events);

    $scope.calEventsExt = {
        color: '#aa0',
        // textColor: 'yellow',
        events: []
    };

    $scope.eventSources = [$scope.events, $scope.calEventsExt];
}



function Hello($scope, $http, $timeout) {
    console.log("Hello");
    // // // console.log($http);
    /*$http.get('http://127.0.0.1:8080/aptinov-proto/DerbyServlet2').
        success(function(data) {
          //// // // console.log(data);
          $scope.greeting = data;
          //// // // console.log($scope.greeting);
        });*/

    $scope.exampleData = [{
        "key": "History",
        "values": [
            [1025409600000, 0],
            [1028088000000, -6.3382185140371],
            [1030766400000, -5.9507873460847],
            [1033358400000, -11.569146943813],
            [1036040400000, -5.4767332317425],
            [1038632400000, 0.50794682203014],
            [1041310800000, -5.5310285460542],
            [1043989200000, -5.7838296963382],
            [1046408400000, -7.3249341615649],
            [1049086800000, -6.7078630712489],
            [1051675200000, 0.44227126150934],
            [1054353600000, 7.2481659343222],
            [1056945600000, 9.2512381306992],
            [1059624000000, 11.341210982529],
            [1062302400000, 14.734820409020],
            [1064894400000, 12.387148007542],
            [1067576400000, 18.436471461827],
            [1070168400000, 19.830742266977],
            [1072846800000, 22.643205829887],
            [1075525200000, 26.743156781239],
            [1078030800000, 29.597478802228],
            [1080709200000, 30.831697585341],
            [1083297600000, 28.054068024708],
            [1085976000000, 29.294079423832],
            [1088568000000, 30.269264061274],
            [1091246400000, 24.934526898906],
            [1093924800000, 24.265982759406],
            [1096516800000, 27.217794897473],
            [1099195200000, 30.802601992077],
            [1101790800000, 36.331003758254],
            [1104469200000, 43.142498700060],
            [1107147600000, 40.558263931958],
            [1109566800000, 42.543622385800],
            [1112245200000, 41.683584710331],
            [1114833600000, 36.375367302328],
            [1117512000000, 40.719688980730],
            [1120104000000, 43.897963036919],
            [1122782400000, 49.797033975368],
            [1125460800000, 47.085993935989],
            [1128052800000, 46.601972859745],
            [1130734800000, 41.567784572762],
            [1133326800000, 47.296923737245],
            [1136005200000, 47.642969612080],
            [1138683600000, 50.781515820954],
            [1141102800000, 52.600229204305],
            [1143781200000, 55.599684490628],
            [1146369600000, 57.920388436633],
            [1149048000000, 53.503593218971],
            [1151640000000, 53.522973979964],
            [1154318400000, 49.846822298548],
            [1156996800000, 54.721341614650],
            [1159588800000, 58.186236223191],
            [1162270800000, 63.908065540997],
            [1164862800000, 69.767285129367],
            [1167541200000, 72.534013373592],
            [1170219600000, 77.991819436573],
            [1172638800000, 78.143584404990],
            [1175313600000, 83.702398665233],
            [1177905600000, 91.140859312418],
            [1180584000000, 98.590960607028],
            [1183176000000, 96.245634754228],
            [1185854400000, 92.326364432615],
            [1188532800000, 97.068765332230],
            [1191124800000, 105.81025556260],
            [1193803200000, 114.38348777791],
            [1196398800000, 103.59604949810],
            [1199077200000, 101.72488429307],
            [1201755600000, 89.840147735028],
            [1204261200000, 86.963597532664],
            [1206936000000, 84.075505208491],
            [1209528000000, 93.170105645831],
            [1212206400000, 103.62838083121],
            [1214798400000, 87.458241365091],
            [1217476800000, 85.808374141319],
            [1220155200000, 93.158054469193],
            [1222747200000, 65.973252382360],
            [1225425600000, 44.580686638224],
            [1228021200000, 36.418977140128],
            [1230699600000, 38.727678144761],
            [1233378000000, 36.692674173387],
            [1235797200000, 30.033022809480],
            [1238472000000, 36.707532162718],
            [1241064000000, 52.191457688389],
            [1243742400000, 56.357883979735],
            [1246334400000, 57.629002180305],
            [1249012800000, 66.650985790166],
            [1251691200000, 70.839243432186],
            [1254283200000, 78.731998491499],
            [1256961600000, 72.375528540349],
            [1259557200000, 81.738387881630],
            [1262235600000, 87.539792394232],
            [1264914000000, 84.320762662273],
            [1267333200000, 90.621278391889],
            [1270008000000, 102.47144881651],
            [1272600000000, 102.79320353429],
            [1275278400000, 90.529736050479],
            [1277870400000, 76.580859994531],
            [1280548800000, 86.548979376972],
            [1283227200000, 81.879653334089],
            [1285819200000, 101.72550015956],
            [1288497600000, 107.97964852260],
            [1291093200000, 106.16240630785],
            [1293771600000, 114.84268599533],
            [1296450000000, 121.60793322282],
            [1298869200000, 133.41437346605],
            [1301544000000, 125.46646042904],
            [1304136000000, 129.76784954301],
            [1306814400000, 128.15798861044],
            [1309406400000, 121.92388706072],
            [1312084800000, 116.70036100870],
            [1314763200000, 88.367701837033],
            [1317355200000, 59.159665765725],
            [1320033600000, 79.793568139753],
            [1322629200000, 75.903834028417],
            [1325307600000, 72.704218209157],
            [1327986000000, 84.936990804097],
            [1330491600000, 93.388148670744]
        ]
    }];

    $scope.temperatureData = [{
        "key": "History",
        "values": []
    }];
    $scope.humidityData = [{
        "key": "History",
        "values": []
    }];

    $scope.sensorClass = 'display-none';

    $scope.getData = function() {
        $http.get('http://127.0.0.1:8080/aptinov-proto/DerbyServlet3')
            .success(function(data, status, headers, config) {

                $scope.sensorClass = '';

                // Your code here
                // // // console.log('Fetched data!');
                if ($scope.temp != undefined) {
                    $scope.temp = $scope.greeting[0].TEMPS1;
                } else {
                    $scope.temp = 0;
                }
                if ($scope.rh != undefined) {
                    $scope.rh = $scope.greeting[0].RH;
                } else {
                    $scope.rh = 0;
                }


                $scope.greeting = data; // ESTE TEM DE SER O ULTIMO DAS LEITURAS...
                // $scope.exampleData = [
                // {
                //     "key": "History",
                //     "values": data
                // }];


                if ($scope.temp != undefined) {
                    //// // // console.log($scope.greeting[0].TEMPS1 - $scope.temp);
                    $scope.temp = $scope.greeting[0].TEMPS1 - $scope.temp;
                    if ($scope.temp > 0)
                        $scope.tempPos = '+';
                    else
                        $scope.tempPos = '';
                }
                if ($scope.rh != undefined) {
                    //// // // console.log($scope.greeting[0].RH - $scope.rh);
                    $scope.rh = $scope.greeting[0].RH - $scope.rh;
                    if ($scope.rh > 0)
                        $scope.rhPos = '+';
                    else
                        $scope.rhPos = '';
                }

            });
    };



    $scope.getTempData = function() {
        $http.get('http://127.0.0.1:8080/aptinov-proto/DerbyServlet2')
            .success(function(data, status, headers, config) {

                // Your code here
                // // // console.log('Fetched data!');
                // // // console.log(data);

                var dataTemp = [];
                var dataHumid = [];
                for (var d in data) {
                    // // // console.log(data[d]);
                    var date = new Date(data[d].DATAHORA);
                    var aux = [date, data[d].TEMPS1];
                    dataTemp.push(aux);
                    var aux = [date, data[d].RH];
                    dataHumid.push(aux);
                }
                // // // console.log(dataTemp);


                $scope.xAxisTickFormatFunction = function() {
                    // return function(d){
                    //     return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
                    // }
                    return function(d) {
                        return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
                    }
                }



                $scope.temperatureData = [{
                    "key": "History",
                    "values": dataTemp
                }];
                $scope.humidityData = [{
                    "key": "History",
                    "values": dataHumid
                }];



            });
    };

    $scope.intervalFunction = function() {
        $timeout(function() {
            $scope.getData();
            $scope.getTempData();
            $scope.intervalFunction();
        }, 2000)
    };

    // Kick off the interval
    $scope.getData();
    $scope.getTempData();
    // uncomment below to keep updating
    // proxima tarefa é usar o socket.io para fazer update dos valores
    // $scope.intervalFunction();
}



function AddReadingCtrl($scope, $http) {
    console.log("AddReadingCtrl");
    $scope.lastAddedMsg = '';
    $scope.form = {};

    $scope.submitNewReading = function() {
        // // // console.log($scope.form);
        $scope.lastAddedMsg = 'Added reading(s) for Project: ' + $scope.form.projectsSelect[0];
    }
}

// Returns [alertDescription, alertPointName, alertUrl]
function formatAlertDesc(elem) {
    var str = '';
    var preStr = '';
    if (parseFloat(elem.value) > parseFloat(elem.max))
        str = preStr + ' ' + elem.title + ': (' + elem.value + ') is above the maximum value (' + elem.max + ')';
    else if (parseFloat(elem.value) < parseFloat(elem.min))
        str = preStr + ' ' + elem.title + ': (' + elem.value + ') is below the minimum value (' + elem.min + ')';

    // Point Name
    var pointname = nameFromAttributes(elem, elem.pointid);
    //var pointname = elem.pointname;

    if (isValidObject(elem.pointid)) {
        str += ' @ ' + pointname + '(' + elem.pointid + ')';
    }

    // determine openUrl
    var openUrl = '';
    if (isValidObject(elem.parmid)) {
        openUrl = '/parameter/' + elem.pid + '/' + elem.iid + '/' + elem.parmid + '/' + elem.pointid;
    } else {
        openUrl = '/indicator/' + elem.pid + '/' + elem.iid + '/' + elem.pointid;
    }

    return ([str, pointname, openUrl]);
}

function AlertsCtrl($scope, $http, $timeout, $routeParams, socket) {
    console.log('AlertsCtrl');
    var pid = $routeParams.pid;
    var title = $routeParams.title;

    var mergeAlert = function(al, als) {
        var found = false;
        for (var i = 0; i < als.length; i++) {
            // must be ==, one is number, the other is string
            if (al.iid == als[i].iid && al.pid == als[i].pid && al.pointid == als[i].pointid) {
                found = i;
                break;
            };
        }
        if (angular.isNumber(found)) {
            als[found] = al;
        } else {
            als.unshift(al);
        };
    };

    var onAlert = function(elem) {
        var descNName = formatAlertDesc(elem);

        elem.desc = descNName[0];
        //elem.pointname = descNName[1];
        elem.openUrl = descNName[2];

        $http.get('/api/projects').
        success(function(data, status) {
            // // // console.log("yeah read!");
            // // // console.log(data);
            $scope.projects = data;

            for (var i = 0; i < data.length; i++) {
                if (data[i].pid == elem.pid) {
                    elem.ptitle = data[i].title;
                    mergeAlert(elem, $scope.alerts);
                    //$scope.alerts.unshift(elem);
                }
            }
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

    };

    socket.on('send:alert', onAlert);
    $scope.$on('socketSelf', onAlert);

    $scope.alerts = [];

    var apiAdd = angular.isUndefined(pid) ? '' : (angular.isUndefined(title) ? '/' + pid : '/' + pid + '/' + title);

    $http.get('/api/alerts' + apiAdd).
    success(function(recvdAlerts, status) {

        recvdAlerts.forEach(function(elem) {
            var descNName = formatAlertDesc(elem);
            elem.desc = descNName[0];
            elem.pointname = descNName[1];
            elem.openUrl = descNName[2];

            $scope.alerts.unshift(elem);
        });
    });
}

function MenuCtrl($scope, $http, $timeout, $location, socket) {
    console.log('MenuCtrl');

    $scope.userProfile = null;
    $scope.project = null;


    $http.get('/api/userProfile')
        .then(function(response) {
            $scope.userProfile = response.data.userprofile;
        });

    $http.get('/api/dashboard/' + $scope.pid).
    success(function(data, status) {
        $scope.project = data.project;

    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });

    $scope.location = $location.path();

    $scope.alertsCount = 0;
    $http.get('/api/alertsCount').
    success(function(data, status) {
        //select * from parameters where value < min and value > max
        // // // console.log('read alerts');
        // // // console.log(data);
        $scope.alertsCount = data;

    });

    socket.on('send:alert', function(elem) {

        $http.get('/api/projects').
        success(function(data, status) {
            // // // console.log("yeah read!");
            // // // console.log(data);
            $scope.projects = data;
            for (var i = 0; i < data.length; i++) {
                // // // console.log("data pid: "+data[i].pid+" elem pid"+elem.pid+ " ; data[i].pid == elem.pid: "+(data[i].pid == elem.pid))
                if (data[i].pid == elem.pid) {
                    if (parseFloat(elem.value) > parseFloat(elem.max) || parseFloat(elem.value) < parseFloat(elem.min))
                        $scope.alertsCount++;
                }
            }
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    });
}

function LogoutCtrl($scope, $location, $http) {
    console.log('LogoutCtrl');

    $scope.lastAddedMsg = '';
    $scope.form = {};

    $scope.changePassword = function() {
        // // console.log('changePassword '+$scope.form);
        $scope.lastAddedMsg = '';

        if ($scope.form)

            if ($scope.form.new_pass != $scope.form.repeat_new_pass) {
            $scope.lastAddedMsg = 'The new password and confirm password do not match!';
            $scope.lastAddedMsgStyle = 'color: red;';
        } else {
            if ($scope.form.old_pass == $scope.form.new_pass) {
                $scope.lastAddedMsg = 'The old and new password are the same!';
                $scope.lastAddedMsgStyle = 'color: red;';
            } else {
                $http.post('/api/userPassword', $scope.form).
                success(function(data) {

                    if (data.status_msg != "") {
                        $scope.lastAddedMsg = data.status_msg;
                        $scope.lastAddedMsgStyle = 'color: red;';
                    } else {
                        $scope.lastAddedMsg = 'Password changed with success.';
                        $scope.lastAddedMsgStyle = 'color: green;';
                        $scope.form = {};
                    }
                }).
                error(function(data, status) {
                    $scope.lastAddedMsg = "Request failed";
                    $scope.lastAddedMsgStyle = 'color: red;';
                });
            }
        }
    };

    //$location.path('/');
}


function toReadableDatetime(dateString) {
    if (dateString == null || dateString == undefined)
        return '';
    var date = new Date(dateString);
    var h = date.getHours(),
        ampm = 'am',
        m = date.getMinutes(),
        s = date.getSeconds();
    if (h >= 12) {
        if (h > 12) h -= 12;
        ampm = 'pm';
    }

    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;
    // // // console.log("toReadableDatetime: "+ date.toLocaleDateString()+ ' ' + h + ':' + m + ':' + s + ' ' + ampm);
    return date.toLocaleDateString() + ' ' + h + ':' + m + ':' + s + ' ' + ampm;
}



ConfigCtrl.$inject = ['$scope', '$http', '$location', '$routeParams', 'Names', 'socket', 'Profile', 'Occurrences', 'sharedCommsService'];

function ConfigCtrl($scope, $http, $location, $routeParams, Names, socket, Profile, Occurrences, sharedCommsService) {
    console.log("ConfigCtrl");

    $scope.loading = false;
    $scope.occLoading = false;

    $scope.$on('$locationChangeSuccess', function(event) {
        if ($location.path().indexOf('/map') >= 0)
            $scope.loading = true

        if ($location.path().indexOf('/occurrences') >= 0)
            $scope.occLoading = true
    })

    $scope.occurrences = Occurrences.occurrences;

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.showOpenOcc = false;
    console.log($scope.showOpenOcc);
    $scope.openOcc = Occurrences.openOcc;

    if ($scope.openOcc > 0)
        $scope.showOpenOcc = true;
    else
        $scope.showOpenOcc = false;

    console.log($scope.showOpenOcc);

    $scope.$watch('currOccurrence.status', function() {
        $scope.openOcc = Occurrences.openOcc;

        if ($scope.openOcc > 0)
            $scope.showOpenOcc = true;
        else
            $scope.showOpenOcc = false;

        console.log($scope.showOpenOcc);
    });

    $scope.pid = $routeParams.pid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.form = {
        "alarm": "no",
        "global": "no"
    };
    $scope.formEdit = {
        "alarm": "no",
        "global": "no"
    };

    $scope.userProfile = Profile.userprofile;
    console.log(Profile.userprofile);

    $scope.datatypes = [];

    function refreshDataTypes() {
        // console.log("OK2 "+Date.now());
        $http.get('/api/datatypes/' + $scope.pid).
        success(function(data, status) {
            // console.log("yeah read!");
            // console.log(data);
            $scope.project = data.project;

            // console.log("OK3 "+Date.now());
            $scope.datatypes = data.datatypes;

            $scope.datatypes.forEach(function(elem) {
                if (elem.min == 'undefined')
                    elem.min = '';
                if (elem.max == 'undefined')
                    elem.max = '';
            });

            // also read the data types

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

    refreshDataTypes();

    // obter todos os indicators de pontos
    // para cada um, criar caixa com link para widget\:wid
    // $scope.widgets = [{"wid":0, "title":"pH"}, {"wid":1, "title":"Iron"}];
    $scope.widgets = [];

    var query = '/api/widgets/' + $scope.pid;

    var addPoint = function(query) {
            if (angular.isDefined($scope.pointid))
                return (query += '/' + $scope.pointid);
            else return query;
        }
        //if($scope.pointid != null && $scope.pointid != undefined)
        //query+='/'+$scope.pointid;

    function getWidgets(isNew, title) {
        $http.get(addPoint(query)).
        success(function(data, status) {
            console.log("yeah read widgets!");
            $scope.widgets = data;
            // // console.log('$scope.project');
            // // console.log($scope.project);

            if (!$scope.widgets.hasOwnProperty("length"))
                return;

            $scope.widgets.forEach(function(elem) {

                // go to api and get info about elem.title


                // elem.value = Math.floor((Math.random() * 12345) + 1);
                // elem.unit = "$";
                // elem.date = Math.floor((Math.random() * 32) + 1) + "-" + Math.floor((Math.random() * 13) + 1) + "-" + Math.floor((Math.random() * 3) + 2012);
                elem.hasAlarm = angular.isDefined(elem.alerts);
                elem.newAlert = elem.hasAlarm && elem.alerts > 0 ? 'color:red;' : '';
                //elem.newAlert = isNew ? (elem.title == title ? 'color:red;' : '') : '';
                elem.hideNewAlert = function() {
                    elem.newAlert = '';
                };
                //elem.date = elem.date.replace(' 00:00:00:000000', '');
                //elem.points = Math.floor((Math.random() * 6) );
            });

            if ($scope.widgets.length == 0)
                $scope.showDashboardHelp = 1;
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    };

    socket.on('send:alert', function(u) {
        getWidgets(u.pid == $scope.pid, u.title)
    });
    $scope.$on('send:alert', function(u) {
        getWidgets(u.pid == $scope.pid, u.title)
    });

    getWidgets(false);


    $http.get(addPoint('/api/dashboard/' + $scope.pid)).
    success(function(data, status) {
        // // // console.log("yeah read!");
        // // console.log(data);
        $scope.project = data.project;
        // console.log('$scope.project');
        // console.log($scope.project);
        $scope.indicators = data.indicators;
        $scope.pointname = nameFromAttributes(data.pattributes, $scope.pointid);

        // if($scope.indicators.length == 0)
        //   $scope.showDashboardHelp = 1;
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });



    $scope.namesMinMaxArray = [];

    function transformToObjectFromColToKey(arr, col) {
        var toRet = {};
        for (var i = 0; i < arr.length; i++) {
            toRet[arr[i][col]] = {
                min: arr[i]['min'],
                max: arr[i]['max']
            };
        }
        return toRet;
    }

    console.log('/api/namesMinMax/' + $scope.pid);
    $http.get('/api/namesMinMax/' + $scope.pid).
    success(function(data) {

        $scope.namesMinMaxArray = data;
        // console.log("data");
        // console.log(data);
        $scope.minMaxVals = transformToObjectFromColToKey($scope.namesMinMaxArray, 'title');
        // console.log($scope.minMaxVals);

    }).
    error(function(data, status, headers, config) {

    });


    function datatypeAlreadyExists() {
        // it assumes that $scope.form.title is not undefined...
        for (var i = 0; i < $scope.datatypes.length; i++) {
            if ($scope.datatypes[i].title == $scope.form.title &&
                $scope.datatypes[i].global == $scope.form.global) {
                return true;
            }
        }
        return false;
    }

    function hasProperty(obj, prop) {
        if (obj.hasOwnProperty(prop)) {
            if (obj[prop] != '')
                return true;
        }
        return false;
    }


    $scope.addNewDataType = function() {
        console.log("addNewDataType");
        $scope.statusMessage = '';

        // console.log($scope.form);



        // check !missingTitle
        // check on current data types list if title exists. if so, launch error.
        // on the api method, we also need to validate that.
        // if alarm == 'yes', check min and max

        if (!hasProperty($scope.form, 'title')) {
            $scope.statusMessage = 'Title is required. Please specify a title.';
            $scope.statusStyle = 'color: red;';
            return;
        } else {
            if (datatypeAlreadyExists()) {
                $scope.statusMessage = 'A datatype with title "' + $scope.form.title + '" already exists. Please use another title.';
                $scope.statusStyle = 'color: red;';
                return;
            } else {
                if ($scope.form.alarm == 'yes') {
                    if (!hasProperty($scope.form, 'min') && !hasProperty($scope.form, 'max')) {
                        $scope.statusMessage = 'Missing minimum and maximum values for alarm.';
                        $scope.statusStyle = 'color: red;';
                        return;
                    }
                    if (!hasProperty($scope.form, 'min') && hasProperty($scope.form, 'max')) {
                        $scope.statusMessage = 'Missing minimum value for alarm.';
                        $scope.statusStyle = 'color: red;';
                        return;
                    }
                    if (hasProperty($scope.form, 'min') && !hasProperty($scope.form, 'max')) {
                        $scope.statusMessage = 'Missing maximum value for alarm.';
                        $scope.statusStyle = 'color: red;';
                        return;
                    }
                }
            }
        }



        $http.post('/api/datatype/' + $scope.pid, $scope.form).
        success(function(data, status) {
            // console.log("data");
            // console.log(data);

            $scope.statusMessage = 'Data type "' + $scope.form.title + '" was added with success.';
            $scope.statusStyle = 'color: green;';

            $scope.form = {
                "alarm": "no",
                "global": "no"
            };
            console.log("OK1 " + Date.now());
            refreshDataTypes();


        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

    };


    $scope.deleteMessage = '';
    $scope.deleteMessageGlobal = '';
    $scope.datatypeToDelete = {};
    $scope.toDeleteDataType = function(datatype) {
        // console.log("toDeleteDataType");
        // console.log(datatype);
        $scope.datatypeToDelete = datatype;
        $scope.deleteMessage = 'Are you sure you want to delete data type "' + datatype.title + '"? (data type id: ' + datatype.dtid + ')';
    };

    $scope.deleteDataType = function() {
        console.log("deleteDataType");
        console.log($scope.datatypeToDelete);

        $http.delete('/api/datatype/' + $scope.datatypeToDelete.dtid).
        success(function(data, status) {
            refreshDataTypes();
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    };


    $scope.toEditDataType = function(datatype) {
        console.log("toEditDataType");
        $scope.statusMessage = '';
        $scope.formEdit = datatype;
        $scope.formEdit.oldTitle = datatype.title;
        $scope.formEdit.oldGlobal = datatype.global;
    };


    $scope.editDataType = function() {
        // console.log('/api/editDatatype/'+$scope.form.dtid);
        $scope.statusMessage = '';

        // console.log($scope.form);


        // check !missingTitle
        // check on current data types list if title exists. if so, launch error.
        // on the api method, we also need to validate that.
        // if alarm == 'yes', check min and max

        if (!hasProperty($scope.formEdit, 'title')) {
            $scope.statusMessage = 'Title is required. Please specify a title.';
            $scope.statusStyle = 'color: red;';
            return;
        } else {
            // if( $scope.form.oldTitle != $scope.form.title && datatypeAlreadyExists() ){
            if ($scope.formEdit.oldGlobal != $scope.formEdit.global && datatypeAlreadyExists()) {
                var locGlobString = '';
                if ($scope.formEdit.global == 'yes') locGlobString = 'global';
                else locGlobString = 'local';
                $scope.statusMessage = 'A ' + locGlobString + ' datatype with title "' + $scope.formEdit.title + '" already exists. Please use another title.';
                $scope.statusStyle = 'color: red;';
                return;
            } else {
                if ($scope.formEdit.alarm == 'yes') {
                    if (!hasProperty($scope.formEdit, 'min') && !hasProperty($scope.formEdit, 'max')) {
                        $scope.statusMessage = 'Missing minimum and maximum values for alarm.';
                        $scope.statusStyle = 'color: red;';
                        return;
                    }
                    if (!hasProperty($scope.formEdit, 'min') && hasProperty($scope.formEdit, 'max')) {
                        $scope.statusMessage = 'Missing minimum value for alarm.';
                        $scope.statusStyle = 'color: red;';
                        return;
                    }
                    if (hasProperty($scope.formEdit, 'min') && !hasProperty($scope.formEdit, 'max')) {
                        $scope.statusMessage = 'Missing maximum value for alarm.';
                        $scope.statusStyle = 'color: red;';
                        return;
                    }
                }
            }
        }

        $http.post('/api/editDatatype/' + $scope.formEdit.dtid, $scope.formEdit).
        success(function(data, status) {
            refreshDataTypes();
            $scope.statusMessage = 'Data type "' + $scope.formEdit.title + '" was edited with success.';
            $scope.statusStyle = 'color: green;';
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }



    // auxilliary functions
    function cloneObject(obj) {
        if (obj == null || typeof(obj) != 'object')
            return obj;

        var temp = obj.constructor(); // changed

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                temp[key] = cloneObject(obj[key]);
            }
        }
        return temp;
    }



    $scope.iconconfigs = new Array();
    $scope.selectedPositions = [];
    var originalPositions = [];

    function getCustomIcons() {
        var get_url2 = '/api/getCustomIcons/' + $scope.pid;
        $http.get(get_url2).
        success(function(data, status) {
            // console.log("got customIcons");
            // console.log(data.customMarkerCfg);

            $scope.iconconfigs = data.customMarkerCfg;

            // the maximum number of positions is hardcoded to 6!!
            for (var i = 0; i < $scope.iconconfigs.length; i++) {
                if ($scope.iconconfigs[i] != undefined) {
                    $scope.selectedPositions.push($scope.iconconfigs[i].position);
                    originalPositions.push($scope.iconconfigs[i].position);
                }
            }

            // console.log("$scope.selectedPositions");
            // console.log($scope.selectedPositions);
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

    getCustomIcons();



    $scope.toDeleteIcon = function(config, index) {
        $scope.iconToDelete = config;
        $scope.iconToDeleteIndex = index;
    }

    $scope.deleteIcon = function() {
        // todo: request delete icon, and either receive the updated list
        // from data or call local function getCustomIcons() - another request...

        var toSend = [];
        toSend = $scope.iconconfigs.slice(0);


        if ($scope.iconToDeleteIndex != undefined)
            toSend.splice($scope.iconToDeleteIndex, 1);

        postToSend($scope, toSend);

    }



    // modal for store configuration START


    $scope.stores = new Array();
    $scope.storeToEdit = {};



    $scope.getCurrentStores = function() {
        $http.get('/api/getAllOlapStores/' + $scope.pid).
        success(function(data, status) {
            console.log("data");
            console.log(data);
            $scope.stores = new Array();
            data.forEach(function(info) {
                $scope.stores.push(info.olapstoreinfo);
            });
            // data[0].olapstoreinfo 
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }
    $scope.getCurrentStores();


    $scope.toAddEditStore = function(store, index) {
        console.log("toAddEditStore");
        console.log(store);
        console.log(index);
        console.log($scope.weeklyfactors);
        $scope.statusMessage = "";
        $scope.statusStyle = "color: green";

        if (store == null && index == -1) {
            // add mode
            $scope.storeToEdit = {};
            $scope.storeIndex = undefined;
            $scope.weeklyfactors = {};
            $scope.dailyfactors = {};
            $scope.cells = {};

        } else {
            // edit mode

            console.log("toAddEditStore");
            console.log(store);


            if (store != undefined && store != null) {
                $scope.store = store;
                $scope.storeIndex = index;
                $scope.name = store.name;
                $scope.cells = cloneObject(store.cells);
                $scope.weeklyfactors = cloneObject(store.weeklyfactors);
                $scope.dailyfactors = cloneObject(store.dailyfactors);
                console.log(store);
            }
            $scope.storeToEdit = cloneObject($scope.store);


            // console.log($scope.iconToEdit);
            // console.log($scope.iconToEdit.name);


        }

    }


    $scope.toDeleteStore = function(store, index) {
        // console.log("deleting store with pointkey "+store.pointkey);
        $scope.storeToDelete = store;
        $scope.storeToDeleteIndex = index;
    }


    $scope.deleteStore = function() {
        console.log("deleting store");
        console.log($scope.storeToDelete);
        console.log($scope.storeToDeleteIndex);

        var deleteObj = cloneObject($scope.storeToDelete);

        $http.post('/api/deleteOlapStore/' + $scope.pid + '/' + deleteObj.pointkey, deleteObj).
        success(function(data, status) {
            console.log("deleted");

            if ($scope.storeToDeleteIndex != undefined)
                $scope.stores.splice($scope.storeToDeleteIndex, 1);

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });



    }



    var weekdays = new Array(7);
    weekdays[0] = "Sunday";
    weekdays[1] = "Monday";
    weekdays[2] = "Tuesday";
    weekdays[3] = "Wednesday";
    weekdays[4] = "Thursday";
    weekdays[5] = "Friday";
    weekdays[6] = "Saturday";

    var months = new Array();
    months[0] = "Jan";
    months[1] = "Feb";
    months[2] = "Mar";
    months[3] = "Apr";
    months[4] = "May";
    months[5] = "Jun";
    months[6] = "Jul";
    months[7] = "Aug";
    months[8] = "Sep";
    months[9] = "Oct";
    months[10] = "Nov";
    months[11] = "Dec";

    var calcCellPos = function(m, kpi) {
        // console.log("calcCellPos for "+str);
        // console.log("result is "+str.replace(/\s/g, "") + "\n");
        var str = m + "__" + kpi;
        return str.replace(/\s/g, "_");
    }

    var isAverageAggrMethod = function(aggrMethods, kpi) {
        return (aggrMethods.hasOwnProperty(kpi) && aggrMethods[kpi].toUpperCase() == 'AVERAGE')
    }


    var calcObjectiveValues = function(aux, kpiAggrMethods) {
        var kpis = new Array();
        var aggrMethods = {};
        var weeklyObjectives = {};
        var dailyObjectives = {};

        for (var i = 0; i < kpiAggrMethods.length; i++) {
            kpis.push(kpiAggrMethods[i].title);
            aggrMethods[kpiAggrMethods[i].title] = kpiAggrMethods[i].aggrmethod;
            weeklyObjectives[kpiAggrMethods[i].title] = {};
            dailyObjectives[kpiAggrMethods[i].title] = {};
        }

        for (var j = 0; j < kpis.length; j++) {
            var kpi = kpis[j];

            if (!isAverageAggrMethod(aggrMethods, kpi)) {

                for (var k = 0; k < weekdays.length; k++) {
                    var weekday = weekdays[k];

                    if (aux.weeklyfactors.hasOwnProperty(calcCellPos(weekday, kpi)) || isAverageAggrMethod(aggrMethods, kpi)) {
                        var dailyFactor = aux.weeklyfactors[calcCellPos(weekday, kpi)];
                        // console.log(kpi + " daily factor for " + weekday + " is " + dailyFactor);

                        for (var l = 0; l < months.length; l++) {
                            var month = months[l];
                            if (!weeklyObjectives[kpi].hasOwnProperty(month)) {
                                weeklyObjectives[kpi][month] = {};
                            }
                            if (!dailyObjectives[kpi].hasOwnProperty(month)) {
                                dailyObjectives[kpi][month] = {};
                            }
                            if (!dailyObjectives[kpi][month].hasOwnProperty(weekday)) {
                                dailyObjectives[kpi][month][weekday] = {};
                            }

                            if (aux.cells.hasOwnProperty(calcCellPos(month, kpi))) {
                                var monthlyObjective = aux.cells[calcCellPos(month, kpi)];
                                // console.log("monthly objective for " + kpi + " on " + month + " is " + monthlyObjective);

                                if (isAverageAggrMethod(aggrMethods, kpi)) {
                                    weeklyObjectives[kpi][month][weekday] = monthlyObjective;
                                } else {
                                    weeklyObjectives[kpi][month][weekday] = (monthlyObjective / 4.28 / aux.weekndays) * (dailyFactor);
                                }

                                var weekvalue = weeklyObjectives[kpi][month][weekday];
                                var storehours = aux.daynhours;
                                if (weekday == 'Saturday' && aux.saturdaynhours != null && aux.saturdaynhours != undefined) {
                                    storehours = aux.saturdaynhours;
                                }
                                if (weekday == 'Sunday' && aux.sundaynhours != null && aux.sundaynhours != undefined) {
                                    storehours = aux.sundaynhours;
                                }

                                for (var hour = 0; hour < 24; hour++) {

                                    if (aux.dailyfactors.hasOwnProperty(calcCellPos(hour, kpi)) || isAverageAggrMethod(aggrMethods, kpi)) {
                                        var hourlyFactor = aux.dailyfactors[calcCellPos(hour, kpi)];

                                        if (isAverageAggrMethod(aggrMethods, kpi)) {
                                            dailyObjectives[kpi][month][weekday][hour] = monthlyObjective;
                                        } else {
                                            if (hourlyFactor != null && hourlyFactor != undefined && storehours != 0) {
                                                dailyObjectives[kpi][month][weekday][hour] = (weekvalue / storehours * hourlyFactor);
                                            }
                                        }


                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        aux.weeklyObjectives = weeklyObjectives;
        aux.dailyObjectives = dailyObjectives;
        console.log(aux);
    }


    $scope.saveStore = function() {
        console.log("saveStore");
        $scope.statusMessage = "";
        $scope.statusStyle = "color: green";

        // NUNOALEX TODO: validate if store with pointkey already exists...
        console.log("stores");
        console.log($scope.stores);
        var count = 0;
        if ($scope.storeIndex == undefined)
            count = 1;
        for (var i = 0; i < $scope.stores.length; i++) {
            console.log($scope.stores[i]);
            if ($scope.stores[i].pointkey == $scope.storeToEdit.pointkey)
                count++;
        }
        if (count > 1) {
            console.log("DUPLICATE POINT KEY!!!!");
            $scope.statusMessage = "store point key is duplicate!";
            $scope.statusStyle = "color: red";

        } else {
            console.log("new or existing POINT KEY!!!! " + count);

            var toSend = [];
            toSend = $scope.stores.slice(0);

            var aux = $scope.storeToEdit;
            // copy cells, weeklyfactors and daily factors
            aux.cells = $scope.cells;
            aux.weeklyfactors = $scope.weeklyfactors;
            aux.dailyfactors = $scope.dailyfactors;

            if ($scope.storeIndex == undefined) {

                toSend.push(aux);
                $scope.stores.push(aux);
            } else {
                toSend[$scope.storeIndex] = aux;
                $scope.stores[$scope.storeIndex] = aux;
            }

            console.log("toSend");
            console.log(toSend);

            $http.get('/api/indicatorsMetaData/' + $scope.pid).
            success(function(data1, status1) {
                console.log(data1);



                var kpiAggrMethods = data1;
                calcObjectiveValues(aux, kpiAggrMethods);

                console.log(('/api/saveOlapStore/' + $scope.pid + '/' + aux.pointkey));

                $http.post('/api/saveOlapStore/' + $scope.pid + '/' + aux.pointkey, aux).
                success(function(data, status) {
                    console.log("saveOlapStore");
                    console.log(data);

                    if ($scope.storeIndex == undefined) {
                        $scope.storeToEdit = {};
                        $scope.weeklyfactors = {};
                        $scope.dailyfactors = {};
                        $scope.cells = {};
                    }


                    $http.get('/api/getOlapStore/' + $scope.pid + '/' + data.pointkey).
                    success(function(data2, status2) {
                        console.log("!! get olap store");
                        console.log(data2);

                        if ($scope.storeIndex == undefined)
                            $scope.statusMessage = "added store!";
                        else
                            $scope.statusMessage = "saved changes";

                    }).
                    error(function(data2, status2) {
                        $scope.data = data2 || "Request failed";
                    });



                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                });

            }).
            error(function(data1, status1) {
                $scope.data = data1 || "Request failed";
            });


        }



        // if($scope.configIndex == undefined)
        //   toSend.push($scope.iconToEdit);
        // else
        //   toSend[$scope.configIndex] = $scope.iconToEdit;

        // TODO: make post on server
    }



    $scope.objectivesMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    $scope.objectivesKpis = ['Basket', 'Net Sales', 'Number of Customers', 'Net Margin', 'Multiline Bills', 'Stock Level'];

    var mL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var mS = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    $scope.calcCellPos = function(month, kpi) {
        // console.log("calcCellPos for "+str);
        // console.log("result is "+str.replace(/\s/g, "") + "\n");
        var str = month + "__" + kpi;
        return str.replace(/\s/g, "_");
    }
    $scope.cells = {};
    // $scope.cells[$scope.calcCellPos('Jan', 'Basket')] = 2145;



    $scope.weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $scope.weeklyfactors = {};

    $scope.dayhours = new Array();
    for (var i = 0; i < 24; i++)
        $scope.dayhours.push(i);
    $scope.dailyfactors = {};

    // modal for store configuration END



    $scope.iconToEdit = {};
    $scope.iconToEditNameObj = {};
    $scope.iconToEditNameAttrObj = {};
    $scope.iconObj = {};
    $scope.showIndicator = false;
    $scope.showAttribute = false;
    $scope.indicatorNames = Names.indicatorNames;
    $scope.attributeNames = Names.attributeNames;
    $scope.positions = [0, 1, 2, 3, 4, 5, 6]

    $scope.scaleTypeObj = {};

    //options deleted from scaleTypes: 'EmptyOrNot', 'AroundZero',
    $scope.scaleTypes = ['Intervals', 'Percentage'];
    $scope.selectedValue = '';

    function getNameObj(objArr, name) {
        var toRet = {};
        for (var i in objArr) {
            if (objArr[i].name == name)
                toRet = objArr[i];
        }
        return toRet;
    }

    $scope.toEditIcon = function(config, index) {


        if (config == null && index == -1) {
            // add mode
            $scope.iconToEdit = {};
            $scope.iconToEdit.buckets = [];
            $scope.configIndex = undefined;
        } else {
            // edit mode

            if (config != undefined && config != null) {
                $scope.config = config;
                $scope.configIndex = index;
            }
            $scope.iconToEdit = cloneObject($scope.config);
            // $scope.originalIconToEdit = cloneObject(config);

            // $scope.iconToEditNameObj = getNameObj($scope.indicatorNames, $scope.iconToEdit.name);
            // $scope.showIndicator = !(JSON.stringify($scope.iconToEditNameObj) == '{}');
            // $scope.iconToEditNameAttrObj = getNameObj($scope.attributeNames, $scope.iconToEdit.name);
            // $scope.showAttribute = !(JSON.stringify($scope.iconToEditNameAttrObj) == '{}');



            console.log($scope.iconToEdit);
            console.log($scope.iconToEdit.name);


        } // end edit mode


        console.log("going to remove selected config s position");
        $scope.selectedPositions = originalPositions.slice(0);
        for (var i = 0; i < $scope.selectedPositions.length; i++) {
            if ($scope.selectedPositions[i] == $scope.iconToEdit.position)
                $scope.selectedPositions.splice(i, 1);
        }
        // NUNOALEXANDRE Ive removed position 0 so that its reserved for happyornot custom icon
        $scope.selectedPositions.push(0);
        console.log($scope.selectedPositions);
    }



    $scope.editIcon = function() {
        // todo: request delete icon, and either receive the updated list
        // from data or call local function getCustomIcons() - another request...
        console.log($scope.iconToEdit);
        console.log($scope.iconconfigs[$scope.configIndex]);



        var toSend = [];
        toSend = $scope.iconconfigs.slice(0);


        if ($scope.configIndex == undefined)
            toSend.push($scope.iconToEdit);
        else
            toSend[$scope.configIndex] = $scope.iconToEdit;


        postToSend($scope, toSend);
        // place the iconToEdit into iconconfigs[configIndex]
        // call post for setConfig( iconconfigs
        // on post response, update local scope iconconfigs??
        // or not because its updated before the answer... 
        // we should only update with success response from the post
        // using: getCustomIcons();
    }



    function postToSend($scope, toSend) {
        $http.post('/api/setCustomIcon/' + $scope.pid, toSend).
        success(function(data, status) {

            console.log("received data from postToSend");
            console.log(data);

            // $scope.iconconfigs[$scope.configIndex] = $scope.iconToEdit;
            $scope.iconconfigs = data;


            $scope.selectedPositions = [];
            originalPositions = [];

            for (var i = 0; i < $scope.iconconfigs.length; i++) {
                if ($scope.iconconfigs[i] != undefined) {
                    $scope.selectedPositions.push($scope.iconconfigs[i].position);
                    originalPositions.push($scope.iconconfigs[i].position);
                }
            }


        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }



    $scope.allImages = [{
            icon: 'img/custommarkers/happy.png'
        }, {
            icon: 'img/custommarkers/ok.png'
        }, {
            icon: 'img/custommarkers/nok.png'
        }, {
            icon: 'img/custommarkers/sad.png'
        }, {
            icon: 'img/custommarkers/happy-square.png'
        }, {
            icon: 'img/custommarkers/ok-square.png'
        }, {
            icon: 'img/custommarkers/nok-square.png'
        }, {
            icon: 'img/custommarkers/sad-square.png'
        }, {
            icon: 'img/custommarkers/arrowup.png'
        }, {
            icon: 'img/custommarkers/arrowright.png'
        }, {
            icon: 'img/custommarkers/arrowdown.png'
        }, {
            icon: 'img/custommarkers/cam.png'
        }, {
            icon: 'img/custommarkers/nocam.png'
        }, {
            icon: 'img/custommarkers/nocam2.png'
        }, {
            icon: 'img/custommarkers/impaired.png'
        }, {
            icon: 'img/custommarkers/noimpaired.png'
        }, {
            icon: 'img/custommarkers/noimpaired2.png'
        }, {
            icon: 'img/custommarkers/notavailable.png'
        }, {
            icon: 'img/custommarkers/basket-veryhigh.png'
        }, {
            icon: 'img/custommarkers/basket-high.png'
        }, {
            icon: 'img/custommarkers/basket-medium.png'
        }, {
            icon: 'img/custommarkers/basket-low.png'
        }, {
            icon: 'img/custommarkers/basket-verylow.png'
        },

        {
            icon: 'img/custommarkers/margin_green.png'
        }, {
            icon: 'img/custommarkers/margin_yellow.png'
        }, {
            icon: 'img/custommarkers/margin_red.png'
        }, {
            icon: 'img/custommarkers/customers_green.png'
        }, {
            icon: 'img/custommarkers/customers_red.png'
        }, {
            icon: 'img/custommarkers/customers_orange.png'
        }, {
            icon: 'img/custommarkers/customers_yellow.png'
        }, {
            icon: 'img/custommarkers/sales_red.png'
        }, {
            icon: 'img/custommarkers/sales_green.png'
        }, {
            icon: 'img/custommarkers/sales_yellow.png'
        }, {
            icon: 'img/custommarkers/bills_green.png'
        }, {
            icon: 'img/custommarkers/bills_red.png'
        }, {
            icon: 'img/custommarkers/bills_orange.png'
        }, {
            icon: 'img/custommarkers/bills_yellow.png'
        },


        {
            icon: 'img/custommarkers/stockmoney_veryhigh.png'
        }, {
            icon: 'img/custommarkers/stockmoney_high.png'
        }, {
            icon: 'img/custommarkers/stockmoney_medium.png'
        }, {
            icon: 'img/custommarkers/stockmoney_low.png'
        }, {
            icon: 'img/custommarkers/stockmoney_verylow.png'
        },

        {
            icon: 'img/custommarkers/stockmoney2_veryhigh.png'
        }, {
            icon: 'img/custommarkers/stockmoney2_high.png'
        }, {
            icon: 'img/custommarkers/stockmoney2_medium.png'
        }, {
            icon: 'img/custommarkers/stockmoney2_low.png'
        }, {
            icon: 'img/custommarkers/stockmoney2_verylow.png'
        },

        {
            icon: 'img/custommarkers/stockmoney3_veryhigh.png'
        }, {
            icon: 'img/custommarkers/stockmoney3_high.png'
        }, {
            icon: 'img/custommarkers/stockmoney3_medium.png'
        }, {
            icon: 'img/custommarkers/stockmoney3_low.png'
        }, {
            icon: 'img/custommarkers/stockmoney3_verylow.png'
        }
    ];

    $scope.setCurrentIconImage = function(bucket, index) {
        if (bucket == undefined && index != undefined && index != null) {
            // this is an add EmptyOrNot or add AroundZero
            // so we initialize $scope.iconToEdit.buckets

            $scope.iconToEdit.buckets.push({
                val: 0,
                icon: ''
            });
            $scope.iconToEdit.buckets.push({
                val: 1,
                icon: ''
            });
            $scope.currIconBucket = $scope.iconToEdit.buckets[index];

        } else {
            $scope.currIconBucket = bucket;
        }
        // $scope.newIconImage = $scope.currIconBucket.icon;
        // console.log($scope.currIconBucket);
    }

    $scope.setNewIconImage = function(image) {
        $scope.newIconImage = image.icon;
    }

    $scope.setImageOnCurrentIcon = function() {
        $scope.currIconBucket.icon = $scope.newIconImage;
    }


    $scope.translateEmptyOrNotVal = function(val) {
        if (val == 0)
            return 'empty';
        else
            return 'not empty';
    }



    // code to manage task lists

    // $scope.tasklists = [{"tasklistid": 0, "title": "Handle sad customers", "tasks": [{"done":false, "title":"Check kpi values", "obs": ""}, {"done":false, "title":"Call CEO", "obs": ""}]}, {"tasklistid": 1, "title": "aaa", "tasks": [{"done":false, "title":"Freak out!!!", "obs": ""}, {"done":false, "title":"Call the police!!", "obs": ""}]}];


    $scope.tasklists = new Array();
    $http.get('/api/tasklists/' + $scope.pid).
    success(function(data, status) {
        // console.log("received tl data");
        for (var i in data) {
            var obj = data[i].tasklist;
            if (!obj.hasOwnProperty('tasklistid'))
                obj.tasklistid = data[i].tasklistid;
            $scope.tasklists.push(obj);
        }

        // $scope.tasklists = data; // I wasnt able to remove the tasklist level from rows[i].tasklist.ELEMS
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });



    var recoverTaskList = {};

    $scope.toEditTaskList = function(tasklist) {
        if (tasklist == null) {
            // new tasklist add
            $scope.editingTaskList = {
                "title": "",
                "tasks": []
            };
        } else {
            $scope.editingTaskList = tasklist;
        }
        recoverTaskList = cloneObject($scope.editingTaskList);
    }



    $scope.toaddtasktitle = '';


    $scope.addTaskToTaskList = function() {
        var obj = {
            "title": $scope.toaddtasktitle,
            "obs": ""
        };
        $scope.editingTaskList.tasks.push(obj);
        $scope.toaddtasktitle = '';
    }

    $scope.saveTaskList = function() {
        if (!$scope.editingTaskList.hasOwnProperty("tasklistid")) {
            // this is a new task
            // send add task
            // receive from server and push on $scope.tasklists
            $http.post('/api/addtasklist/' + $scope.pid, $scope.editingTaskList).
            success(function(data, status) {
                console.log("received addtl data");
                $scope.tasklists.push(data);
            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });
        } else {
            // edit task
            // send add task
            // receive from server, find edited task on $scope.tasklists and update

            console.log('/api/edittasklist/' + $scope.pid + '/' + $scope.editingTaskList.tasklistid);

            $http.post('/api/edittasklist/' + $scope.pid + '/' + $scope.editingTaskList.tasklistid, $scope.editingTaskList).
            success(function(data, status) {
                console.log("received edittl data");
                for (var i in $scope.tasklists) {
                    if ($scope.tasklists[i].tasklistid == $scope.editingTaskList.tasklistid) {
                        $scope.tasklists[i].tasks = $scope.editingTaskList.tasks;
                        $scope.editingTaskList = {};
                        return;
                    }
                }
            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });
        }
    }



    $scope.toDeleteTaskList = function(index) {
        $scope.toDeleteTaskListIndex = index;
        $scope.toDelTaskList = $scope.tasklists[index];
    }

    $scope.deleteTaskList = function() {

        $http.delete('/api/deletetasklist/' + $scope.pid + '/' + $scope.toDelTaskList.tasklistid).
        success(function(data, status) {
            $scope.tasklists.splice($scope.toDeleteTaskListIndex, 1);
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

        // send to server delete(URI, $scope.toDelTaskList.tasklistid)
        // receive status from server
        // only then we update the local version of tasklists -- the splice:
    }


    // code to manage alarms in config.jade
    $scope.occCfg = {};
    $scope.occCfg.storeBox = {};
    $scope.occCfg.widgetBox = {};

    $scope.saveAlarmList = function() {


        console.log("$scope.occCfg");
        console.log($scope.occCfg);

        if ($scope.occCfg.daysBox == true)
            $scope.occCfg.actionValueInHours = $scope.occCfg.actionValue * 24;
        else
            $scope.occCfg.actionValueInHours = $scope.occCfg.actionValue;

        var q = '/api/saveocccfg/' + $scope.pid;
        if ($scope.occcfgid != undefined && $scope.occcfgid != null) {
            q += '/' + $scope.occcfgid;
        }

        $http.post(q, $scope.occCfg).
        success(function(data, status) {
            console.log("saved occffg");
            console.log(data);

            $scope.readAlarms();

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

    };



    $scope.readAlarms = function() {
        $scope.alarms = new Array();
        $http.get('/api/occcfg/' + $scope.pid).
        success(function(data, status) {
            console.log("get occffg");
            console.log(data);
            $scope.alarms = data;
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

    }

    $scope.readAlarms();



    $scope.toEditAlarmList = function(alarm) {
        console.log("toEditAlarmList");
        console.log(alarm);

        $scope.occCfg = {};

        if (alarm == undefined || alarm == null) {
            // code to manage alarms in config.jade
            $scope.occCfg.storeBox = {};
            $scope.occCfg.widgetBox = {};
            $scope.selectedwidgettitle = "";
            $scope.selectedtasklisttitle = "";
            $scope.occcfgid = null;

        } else {

            $scope.occCfg = alarm.config;
            // $scope.occCfg.widgetBox = alarm.config.widgetBox;
            // $scope.occCfg.widgetBox = {};
            // setObject($scope.occCfg.widgetBox, alarm.config.widgetBox);
            $scope.selectedwidgettitle = $scope.occCfg.widgetBox.title;
            $scope.selectedtasklisttitle = $scope.occCfg.tasklist.title;
            $scope.occcfgid = alarm.occcfgid;

        }
    }



    $scope.toDeleteAlarm = function(index) {
        $scope.toDeleteAlarmIndex = index;
        $scope.toDelAlarm = $scope.alarms[index];
    }

    $scope.deleteAlarm = function() {
        // $scope.alarms.splice($scope.toDeleteAlarmIndex, 1);

        $http.delete('/api/occcfg/' + $scope.pid + '/' + $scope.toDelAlarm.occcfgid).
        success(function(data, status) {
            $scope.alarms.splice($scope.toDeleteAlarmIndex, 1);
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

        // send to server delete(URI, $scope.toDelTaskList.tasklistid)
        // receive status from server
        // only then we update the local version of tasklists -- the splice:
    }

    //IR - code to deal with mailing lists
    $scope.mailingLists = {
        "immediate": [],
        "daily": [],
        "action": [],
        "kpidaily": []

    };

    $scope.emailsList = '';

    $scope.addEmailToImmediateMailingList = function() {
        $scope.addemail;
        $scope.mailingLists.immediate.push($scope.addemail);
        $scope.addemail = '';

        $scope.emailsList = $scope.mailingLists.immediate;
        if ($scope.emailsList.length == 0)
            $scope.emailsList = "No e-mails"
        else {
            $scope.emailsList = $scope.mailingLists.immediate[0];
            for (var i = 1; i < $scope.mailingLists.immediate.length; i++) {
                $scope.emailsList = $scope.emailsList + "; " + $scope.mailingLists.immediate[i];
            }
        }
    }

    $scope.emailsList2 = '';

    $scope.addEmailToDailyMailingList = function() {
        $scope.addemail2;
        $scope.mailingLists.daily.push($scope.addemail2);
        $scope.addemail2 = '';

        $scope.emailsList2 = $scope.mailingLists.daily;
        if ($scope.emailsList2.length == 0)
            $scope.emailsList2 = "No e-mails"
        else {
            $scope.emailsList2 = $scope.mailingLists.daily[0];
            for (var i = 1; i < $scope.mailingLists.daily.length; i++) {
                $scope.emailsList2 = $scope.emailsList2 + "; " + $scope.mailingLists.daily[i];
            }
        }
    }

    $scope.emailsList3 = '';

    $scope.addEmailToActionMailingList = function() {
        $scope.addemail3;
        $scope.mailingLists.action.push($scope.addemail3);
        $scope.addemail3 = '';

        $scope.emailsList3 = $scope.mailingLists.action;
        if ($scope.emailsList3.length == 0)
            $scope.emailsList3 = "No e-mails"
        else {
            $scope.emailsList3 = $scope.mailingLists.action[0];
            for (var i = 1; i < $scope.mailingLists.action.length; i++) {
                $scope.emailsList3 = $scope.emailsList3 + "; " + $scope.mailingLists.action[i];
            }
        }
    }

    $scope.emailsList4 = '';

    $scope.addEmailToKpiDailyMailingList = function() {
        $scope.addemail4;
        $scope.mailingLists.kpidaily.push($scope.addemail4);
        $scope.addemail4 = '';

        $scope.emailsList4 = $scope.mailingLists.kpidaily;
        if ($scope.emailsList4.length == 0)
            $scope.emailsList4 = "No e-mails"
        else {
            $scope.emailsList4 = $scope.mailingLists.kpidaily[0];
            for (var i = 1; i < $scope.mailingLists.kpidaily.length; i++) {
                $scope.emailsList4 = $scope.emailsList4 + "; " + $scope.mailingLists.kpidaily[i];
            }
        }
    }


    $scope.saveMailingList = function() {

        var q = '/api/setMailingList/' + $scope.pid;

        $http.post(q, $scope.mailingLists).
        success(function(data, status) {
            console.log("saved mailing list");

            $scope.readMailingLists();

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

    }

    $scope.readMailingLists = function() {
        $http.get('/api/getMailingList/' + $scope.pid).
        success(function(data, status) {
            console.log("get mailing lists");
            console.log(data.mailinglists);
            $scope.mailingLists = data.mailinglists;


            if ($scope.mailingLists.immediate.length == 0)
                $scope.emailsList = "No e-mails"
            else {
                $scope.emailsList = $scope.mailingLists.immediate[0];
                for (var i = 1; i < $scope.mailingLists.immediate.length; i++) {
                    $scope.emailsList = $scope.emailsList + "; " + $scope.mailingLists.immediate[i];
                }
            }

            if ($scope.mailingLists.daily.length == 0)
                $scope.emailsList2 = "No e-mails"
            else {
                $scope.emailsList2 = $scope.mailingLists.daily[0];
                for (var i = 1; i < $scope.mailingLists.daily.length; i++) {
                    $scope.emailsList2 = $scope.emailsList2 + "; " + $scope.mailingLists.daily[i];
                }
            }

            if ($scope.mailingLists.action.length == 0)
                $scope.emailsList3 = "No e-mails"
            else {
                $scope.emailsList3 = $scope.mailingLists.action[0];
                for (var i = 1; i < $scope.mailingLists.action.length; i++) {
                    $scope.emailsList3 = $scope.emailsList3 + "; " + $scope.mailingLists.action[i];
                }
            }

            if ($scope.mailingLists.kpidaily.length == 0)
                $scope.emailsList4 = "No e-mails"
            else {
                $scope.emailsList4 = $scope.mailingLists.kpidaily[0];
                for (var i = 1; i < $scope.mailingLists.kpidaily.length; i++) {
                    $scope.emailsList4 = $scope.emailsList4 + "; " + $scope.mailingLists.kpidaily[i];
                }
            }


        });

    }

    $scope.sendMail = function(type) {
        console.log("sendMail");
        var path = '/mailapi/sendDummyEmail';
        if (type == 'htmldummy') {
            path = '/mailapi/sendHtmlDummyEmail'
        }

        $http.get(path).
        success(function(data, status) {
            console.log("sendMail OK");
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

    $scope.forceddailyobj = {};

    $scope.forceddailyobj.forcedailymaildate = "2015-07-07";
    $scope.forceddailyobj.forcedpid = "518";

    $scope.sendDailyMail = function() {
        $http.post('/mailapi/forcedailymail', $scope.forceddailyobj).
        success(function(data, status) {
            console.log("sendDailyMail OK");
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }


    $scope.sendDailyOverdueOccurrencesMail = function() {
        $http.post('/mailapi/forceoverdueoccurrences', $scope.forceddailyobj).
        success(function(data, status) {
            console.log("sendDailyOverdueOccurrencesMail OK");
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

    $scope.readMailingLists();



    // $scope.generateSummary = function(){
    //   $http.get('/dataaccess/generateSummary/'+$scope.pid).
    //     success(function(data, status) {
    //       console.log("generateSummary OK");
    //       console.log(data);
    //     }).
    //     error(function (data, status) {
    //       $scope.data = data || "Request failed";
    //     });
    // }



    $scope.generateSummaryTemail = function() {
        $http.post('/dataaccess/generateSummaryTemail/' + $scope.pid, $scope.forceddailyobj).
        success(function(data, status) {
            console.log("generateSummaryTemail OK");
            console.log(data);
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }


};



function StatsCtrl($scope, $http) {
    console.log('StatsCtrl');
    $scope.organizationsUserCount = [];
    $scope.organizationsProjectsCount = [];
    $scope.projectsIndicatorsCount = [];
    $scope.indicatorsParametersCount = [];

    $scope.totalUsers = 0;
    $scope.totalProjects = 0;
    $scope.totalPoints = 0;
    $scope.totalIndicators = 0;
    $scope.totalParameters = 0;


    $http.get('/app/userprojectscounts').
    success(function(data, status) {
        // // console.log('received userprojectscounts');
        $scope.organizationsUserCount = data.organizationsUserCount;
        for (var i = 0, len = $scope.organizationsUserCount.length; i < len; i++) {
            $scope.totalUsers += parseInt($scope.organizationsUserCount[i].count); //Iterate over your first array and then grab the second element add the values up
        }

        $scope.organizationsProjectsCount = data.organizationsProjectsCount;
        for (var i = 0, len = $scope.organizationsProjectsCount.length; i < len; i++) {
            $scope.totalProjects += parseInt($scope.organizationsProjectsCount[i].count); //Iterate over your first array and then grab the second element add the values up
        }

        $scope.organizationsPointsCount = data.organizationsPointsCount;
        for (var i = 0, len = $scope.organizationsPointsCount.length; i < len; i++) {
            $scope.totalPoints += parseInt($scope.organizationsPointsCount[i].count); //Iterate over your first array and then grab the second element add the values up
        }

    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });

    $http.get('/app/projectindicatorscounts').
    success(function(data, status) {
        // // console.log('received projectindicatorscounts');
        $scope.projectsIndicatorsCount = data.projectsIndicatorsCount;
        for (var i = 0, len = $scope.projectsIndicatorsCount.length; i < len; i++) {
            $scope.totalIndicators += parseInt($scope.projectsIndicatorsCount[i].count); //Iterate over your first array and then grab the second element add the values up
        }
        $scope.indicatorsParametersCount = data.indicatorsParametersCount;
        for (var i = 0, len = $scope.indicatorsParametersCount.length; i < len; i++) {
            $scope.totalParameters += parseInt($scope.indicatorsParametersCount[i].count); //Iterate over your first array and then grab the second element add the values up
        }

    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });



    $http.get('/app/loggedInUsers').
    success(function(data, status) {
        // // console.log('received allUsersOrganizations');
        $scope.allUsersOrganizations = data.allUsersOrganizations;
        for (var i in $scope.allUsersOrganizations) {
            var aux = $scope.allUsersOrganizations[i];
            if (aux.login > aux.logout || (aux.login != null && aux.logout == null)) {
                $scope.allUsersOrganizations[i].status = 'logged in';
                $scope.allUsersOrganizations[i].statusClass = 'label-success';
            } else {
                $scope.allUsersOrganizations[i].status = 'logged out';
                $scope.allUsersOrganizations[i].statusClass = 'label-default';
            }
            $scope.allUsersOrganizations[i].login = toReadableDatetime($scope.allUsersOrganizations[i].login);
            $scope.allUsersOrganizations[i].logout = toReadableDatetime($scope.allUsersOrganizations[i].logout);
        }
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });



    $scope.addForm = {};
    $scope.lastAddedMsg = '';
    $scope.lastAddedMsgStyle = 'color: green;'

    function testMissingAddFormField(field) {
        if ($scope.addForm[field] == undefined || $scope.addForm[field] == null || $scope.addForm[field] == '')
            return true;
        return false;
    }

    $scope.submitNewUser = function() {
        $scope.lastAddedMsg = '';
        $scope.lastAddedMsgStyle = 'color: green;';
        // console.log($scope.addForm);

        // console.log(testMissingAddFormField('username'));
        // console.log(testMissingAddFormField('password'));
        // console.log(testMissingAddFormField('email'));
        // console.log(testMissingAddFormField('organization'));
        // console.log(testMissingAddFormField('code'));

        if (!testMissingAddFormField('username') && !testMissingAddFormField('password') && !testMissingAddFormField('email') && !testMissingAddFormField('organization') && !testMissingAddFormField('code')) {

            $http.post('/api/adduser', $scope.addForm)
                .success(function(response) {

                    if (response.error == undefined) {
                        $scope.lastAddedMsg = "New user " + response.username + " added with success!"
                        $scope.addForm = {};
                    } else {
                        $scope.lastAddedMsg = "Error on server: " + response.error;
                        $scope.lastAddedMsgStyle = 'color: red;'
                    }
                })
        } else {
            $scope.lastAddedMsg = "An input field is missing!";
            $scope.lastAddedMsgStyle = 'color: red;'
        }

    }


}



ModalSpreadsheetCtrl.$inject = ['$scope', '$http', '$routeParams', 'sharedCommsService'];

function ModalCompareTable($scope, $http, $routeParams, sharedCommsService) {
    console.log("ModalSpreadsheetCtrl");


}



CompareCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'leafletData', 'Profile', 'Occurrences', 'sharedCommsService'];

function CompareCtrl($scope, $http, $routeParams, $location, leafletData, Profile, Occurrences, sharedCommsService) {
    console.log("CompareCtrl");

    $scope.loading = false;
    $scope.occLoading = false;

    $scope.$on('$locationChangeSuccess', function(event) {
        if ($location.path().indexOf('/map') >= 0)
            $scope.loading = true

        if ($location.path().indexOf('/occurrences') >= 0)
            $scope.occLoading = true
    })

    $scope.occurrences = Occurrences.occurrences;

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.openOcc = Occurrences.openOcc;

    $scope.$watch('currOccurrence.status', function(oldVal, newVal) {
        if (newVal != "") {
            $scope.openOcc = Occurrences.openOcc;

        }

    });

    $scope.pid = $routeParams.pid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.project = {};


    $scope.userProfile = Profile.userprofile;
    console.log(Profile.userprofile);

    $scope.listLeft = [];
    $scope.listRight = [];
    $scope.pointidLeft = -1;
    $scope.pointidRight = -1;

    $scope.pointNames = {};

    $scope.markers = new Array();


    $http.get('/api/dashboard/' + $scope.pid).
    success(function(data, status) {
        $scope.project = data.project;

    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });


    angular.extend($scope, {
        madeira: {
            zoom: 6
        }
    });

    $http.get('/api/getProjectCenter/' + $scope.pid).
    success(function(data) {
        // // console.log("yeah getProjectCenter");
        // $location.path('/projects');
        // // // console.log(data);
        // console.log('data.numOfPoints');
        // console.log(data.numOfPoints.count);
        $scope.numOfPoints = data.numOfPoints.count; // NUNOOOO will be useful in the future

        if ($scope.markers.length == 0) {
            if (data.x != '' && data.x != undefined && data.x != null) {
                $scope.madeira.lat = data.x;
                $scope.madeira.lng = data.y;
                $scope.madeira.zoom = 10;
            } else {
                $scope.madeira.lat = 39.666667;
                $scope.madeira.lng = -8.133333;
                $scope.madeira.zoom = 6;
            }
        }

    }).
    error(function(data, status, headers, config) {
        // // console.log("error getProjectCenter");
        angular.extend($scope, {
            madeira: {
                lat: 39.666667,
                lng: -8.133333,
                zoom: 6
            }
        });
    });

    angular.extend($scope, {
        london: {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        },
        events: {},
        layers: {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                cycle: {
                    name: 'OpenCycleMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                google: {
                    name: 'Google Satellite',
                    layerType: 'SATELLITE',
                    type: 'google'
                }
            },
            overlays: {
                clustermarkers: {
                    name: 'Markers',
                    type: 'markercluster',
                    visible: true
                }
                // fire: {
                //     name: 'OpenFireMap',
                //     type: 'xyz',
                //     url: 'http://openfiremap.org/hytiles/{z}/{x}/{y}.png',
                //     layerOptions: {
                //         attribution: '&copy; <a href="http://www.openfiremap.org">OpenFireMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                //         continuousWorld: true
                //     }
                // }

                // cars: { name: 'Cars', type: 'group', visible: true},
                // bikes: { name: 'Bicycles', type: 'group', visible: false }
            }

        }
    });


    $scope.geojsonObj = {};
    $scope.hoveredGeometry = "";


    // ir buscar os polys/markers
    $http.get('/api/getPointTemplates/' + $scope.pid + '/1').
    success(function(data, status) {
        // // console.log('getPointtemplates');
        // // console.log(data);
        $scope.layers.overlays['n/a'] = {
            name: 'Uncategorized',
            type: 'group',
            visible: true
        };

        for (var i = 0; i < data.length; i++) {
            $scope.layers.overlays[attributize(data[i].type)] = {
                name: data[i].type + " (" + data[i].count + ")",
                type: 'group',
                visible: false
            };
            // $scope.layers.overlays[attributize(data[i].text)] = {name: data[i].text, type: 'group', visible: false};
        }
        // data.forEach(function(elem){
        //   // // console.log(elem.text);
        //   $scope.layers.overlays[elem.text] = {name: elem.text, type: 'group', visible: true};
        // });
        // // console.log('$scope.layers.overlays');
        // // console.log($scope.layers.overlays);

        var get_url = '/geoapi/' + $scope.pid;
        // if($scope.pointid != null || $scope.pointid != undefined)
        //   get_url = '/geoapi/'+$scope.pid+'/'+$scope.pointid;

        $http.get(get_url).
        success(function(data, status) {
            console.log("yeah read geoapi!");
            console.log(data.length);
            // // console.log(data);
            // $scope.project = data.title;
            // $scope.parameter = data;
            // // // console.log($scope.indicators);

            $scope.geojsonObj = {
                "type": "FeatureCollection",
                "crs": {
                    "type": "name",
                    "properties": {
                        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                    }
                },
                "features": []
            };


            $scope.numOfPoints = data.length;
            var bounds = [];
            bounds.push([$scope.madeira.lat, $scope.madeira.lng]);

            var alertPoint = undefined;

            for (var d in data) {

                var attrType = attributize(data[d].type);
                $scope.layers.overlays[attrType].visible = true;



                if (data[d].pointid == $scope.pointid) {

                    var icon = {
                        type: 'awesomeMarker',
                        icon: 'check',
                        prefix: 'fa',
                        markerColor: 'orange',
                        opacity: 0
                    };

                    var isAlertPoint = (angular.isDefined(data[d].alerts) && data[d].alerts > 0) || (angular.isDefined(alertPoint) && data[d].pointid == alertPoint.pointid);
                    icon.icon = isAlertPoint ? 'bell-o' : 'check';
                    icon.markerColor = isAlertPoint ? 'red' : 'orange';


                    if (data[d].geometry == null) {
                        $scope.markers.push({
                            lat: data[d].x,
                            lng: data[d].y,
                            pointid: data[d].pointid,
                            layer: attrType,
                            zIndexOffset: 1000,
                            icon: icon
                        });

                        $scope.pointNames[data[d].pointid] = data[d].pointid;

                    } else {

                        $scope.geojsonObj.features.push(data[d].geometry);

                        // EP#BUG004 is missing best effort to get StoreCodeAbbrv from the point attributes
                        $scope.pointNames[data[d].geometry.properties.pointid] =
                            data[d].geometry.properties.StoreCodeAbbrv || data[d].geometry.properties.pointid;

                    }



                    bounds.push([data[d].x, data[d].y]);

                    if (bounds.length > 0) {
                        leafletData.getMap().then(function(map) {
                            map.fitBounds(bounds, {
                                padding: [50, 50]
                            });
                        });
                    }


                    for (var name in data[d].attributes) {
                        // // console.log( name +" => "+ data[0].attributes[name] );
                        $scope.attributes.push({
                            name: name,
                            value: data[d].attributes[name]
                        });
                    }
                    $scope.pointtype = data[d].type;
                    $scope.latitude = data[d].x;
                    $scope.longitude = data[d].y;
                } else {

                    if (data[d].geometry == null) {
                        var icon = {
                            type: 'awesomeMarker',
                            icon: 'circle',
                            prefix: 'fa',
                            markerColor: 'purple',
                            opacity: 0
                        };
                        var isAlertPoint = (angular.isDefined(data[d].alerts) && data[d].alerts > 0) || (angular.isDefined(alertPoint) && data[d].pointid == alertPoint.pointid);
                        icon.icon = isAlertPoint ? 'bell-o' : 'circle';
                        icon.markerColor = isAlertPoint ? 'red' : 'purple';
                        // console.log(icon.icon);
                        $scope.markers.push({
                            lat: data[d].x,
                            lng: data[d].y,
                            pointid: data[d].pointid,
                            // layer: attrType,
                            layer: 'clustermarkers',
                            message: buildMessage(data[d], false),
                            icon: icon
                        });

                        $scope.pointNames[data[d].pointid] = data[d].pointid;

                    } else {

                        $scope.geojsonObj.features.push(data[d].geometry);

                        // EP#BUG004 is missing best effort to get StoreCodeAbbrv from the point attributes
                        $scope.pointNames[data[d].geometry.properties.pointid] =
                            data[d].geometry.properties.StoreCodeAbbrv || data[d].geometry.properties.pointid;

                    }


                    bounds.push([data[d].x, data[d].y]);


                }

                $scope.popoverDivDisplay = "none";
            }

            if (data.length == 0) {
                $scope.showAddPointHelp = 1;
                $scope.popoverDivDisplay = "block";
            }

            if (bounds.length > 0) {
                leafletData.getMap().then(function(map) {
                    map.fitBounds(bounds, {
                        padding: [50, 50]
                    });
                });
            }

            // console.log("$scope.geojson");
            // console.log(JSON.stringify($scope.geojson, null, 4));

            function getColorIfSelected(id, selectedId) {
                if (id == selectedId)
                    return "orange";
                else
                    return "purple";
            }

            function featureStyle(feature) {
                return {
                    fillColor: getColorIfSelected(feature.properties.pointid, $scope.pointid),
                    weight: 3,
                    opacity: 1,
                    // color: 'purple',
                    color: getColorIfSelected(feature.properties.pointid, $scope.pointid),
                    // dashArray: '3',
                    fillOpacity: 0.5,
                    onEachFeature: function(feature, layer) {
                            layer.bindPopup("number: " + feature.properties.ref);
                        } // nao surtiu efeito...
                };
            }



            angular.extend($scope, {
                geojson: {
                    data: $scope.geojsonObj,
                    style: featureStyle
                }
            });


            $scope.$on("leafletDirectiveMap.geojsonMouseover", function(ev, feature, leafletEvent) {
                // countryMouseover(feature, leafletEvent);

                // BUG BUG#021 feature.properties.ref pode nao estar definido, fazer best effort
                if (feature.properties.PointKey != undefined) {
                    $scope.hoveredGeometry = feature.properties.ref + "    [" + feature.properties.PointKey + "]";
                } else {
                    $scope.hoveredGeometry = feature.properties.ref + "    [" + feature.properties.StoreCodeAbbrv + "]";
                }

                console.log("hover test: " + ((($scope.pointidLeft != feature.properties.pointid) && ($scope.pointidRight != feature.properties.pointid))));

                if (($scope.pointidLeft != feature.properties.pointid) && ($scope.pointidRight != feature.properties.pointid))
                    setLayerSelected(leafletEvent.target, '');
            });
            $scope.$on("leafletDirectiveMap.geojsonMouseout", function(ev, feature, leafletEvent) {
                // countryMouseover(feature, leafletEvent);
                $scope.hoveredGeometry = "";
                if (($scope.pointidLeft != feature.target.feature.properties.pointid) && ($scope.pointidRight != feature.target.feature.properties.pointid))
                    setLayerDeselected(feature.target, '');
            });
            $scope.$on("leafletDirectiveMap.geojsonClick", function(ev, feature, leafletEvent) {
                // countryClick(featureSelected, leafletEvent);
                console.log("click geojson");
                // leafletEvent.target.openPopup();
                // console.log(feature.properties.pointid);
                // console.log(leafletEvent);



                if ($scope.pointidLeft == feature.properties.pointid) {
                    $scope.pointidLeft = -1;
                    removeFromCompareList($scope, "left", feature.properties.pointid);
                    setLayerDeselected(leafletEvent.target);
                } else if ($scope.pointidRight == feature.properties.pointid) {
                    $scope.pointidRight = -1;
                    removeFromCompareList($scope, "right", feature.properties.pointid);
                    setLayerDeselected(leafletEvent.target);
                } else {
                    if ($scope.pointidLeft == -1) {
                        $scope.pointidLeft = feature.properties.pointid;
                        // $scope.listLeft = [{"hasAlarm": false, "title": "Wakaka", "value": "123"}, {"hasAlarm": false, "title": "Foooaka", "value": "443"}];
                        fillCompareList($scope, "left", $scope.pointidLeft, $scope.pid);
                        setLayerSelected(leafletEvent.target, "left");
                    } else if ($scope.pointidRight == -1) {
                        $scope.pointidRight = feature.properties.pointid;
                        fillCompareList($scope, "right", $scope.pointidRight, $scope.pid);
                        setLayerSelected(leafletEvent.target, "right");
                    }
                }
            });

            function setLayerSelected(target, side) {
                var layer = target;
                var colorSelected = 'orange';

                if (side == "left")
                    colorSelected = '#f0ad4e';
                else if (side == "right")
                    colorSelected = '#5bc0de';

                layer.setStyle({
                    color: colorSelected,
                    fillColor: colorSelected
                });
            }

            function setLayerDeselected(target, side) {
                var layer = target;
                layer.setStyle({
                    color: 'purple',
                    fillColor: 'purple'
                });
            }



            function setMarkerSelected(layer, side) {
                var colorSelected = 'orange';

                if (side == "left")
                    colorSelected = 'orange';
                else if (side == "right")
                    colorSelected = 'blue';

                var mouseoverMarker = L.AwesomeMarkers.icon({
                    type: 'awesomeMarker',
                    icon: 'check',
                    prefix: 'fa',
                    markerColor: colorSelected
                });

                var icon = {
                    type: 'awesomeMarker',
                    icon: 'check',
                    prefix: 'fa',
                    markerColor: colorSelected,
                    opacity: 0
                };

                layer.setIcon(mouseoverMarker);
            }


            function setMarkerDeselected(layer) {
                var icon = {
                    type: 'awesomeMarker',
                    icon: 'circle',
                    prefix: 'fa',
                    markerColor: 'purple',
                    opacity: 0
                };

                layer.setIcon(icon);
            }



            $scope.$on('leafletDirectiveMarker.click', function(e, args) {
                console.log("leafletDirectiveMarker.click");

                console.log($scope.markers[args.markerName].pointid);
                var pointidClicked = $scope.markers[args.markerName].pointid;

                if ($scope.pointidLeft == pointidClicked) {
                    $scope.pointidLeft = -1;
                    removeFromCompareList($scope, "left", pointidClicked);
                    setMarkerDeselected(args.leafletEvent.target);
                } else if ($scope.pointidRight == pointidClicked) {
                    $scope.pointidRight = -1;
                    removeFromCompareList($scope, "right", pointidClicked);
                    setMarkerDeselected(args.leafletEvent.target);
                } else {
                    if ($scope.pointidLeft == -1) {
                        $scope.pointidLeft = pointidClicked;
                        // $scope.listLeft = [{"hasAlarm": false, "title": "Wakaka", "value": "123"}, {"hasAlarm": false, "title": "Foooaka", "value": "443"}];
                        fillCompareList($scope, "left", $scope.pointidLeft, $scope.pid);
                        setMarkerSelected(args.leafletEvent.target, "left");
                    } else if ($scope.pointidRight == -1) {
                        $scope.pointidRight = pointidClicked;
                        fillCompareList($scope, "right", $scope.pointidRight, $scope.pid);
                        setMarkerSelected(args.leafletEvent.target, "right");
                    }
                }

            });



            function removeFromCompareList($scope, side, pointid) {
                if (side == "left") {
                    $scope.listLeft = [];
                } else {
                    $scope.listRight = [];
                }

                // agora é fazer reset ao comparingwidgets, se nenhum está seleccionado
                if ($scope.listLeft.length == 0 && $scope.listRight.length == 0)
                    $scope.comparingWidgets = [];

                console.log("$scope.comparingWidgets");
                console.log($scope.comparingWidgets);
                // e tirar do histories


                // remove from histories entries the one related to the deselected pointid            
                for (var i = 0; i < $scope.histories.length; i++) {
                    if ($scope.histories[i] != undefined) {
                        var curr = $scope.histories[i].slice();
                        var newData = [];
                        for (var j = 0; j < curr.length; j++) {
                            if (curr[j].key != pointid)
                                newData.push(curr[j]);
                        }
                        $scope.histories[i] = newData;
                    }
                }


            }



            function fillCompareList($scope, side, pointid, pid) {
                console.log("fillCompareList");
                // console.log(list);
                // console.log(pointid);
                // console.log(pid);


                var query = '/api/widgets/' + pid + '/' + pointid;
                $http.get(query).
                success(function(data, status) {
                    console.log("yeah read widgets for compare!");

                    var list = data;

                    // // console.log('$scope.project');
                    // // console.log($scope.project);

                    if (!list.hasOwnProperty("length"))
                        return;

                    list.forEach(function(elem) {

                        // go to api and get info about elem.title
                        // getHistory(elem);
                        // console.log(elem.title);


                        addToHistoriesCharts(elem, pid, pointid, elem.wid);

                        // elem.value = Math.floor((Math.random() * 12345) + 1);
                        // elem.unit = "$";
                        // elem.date = Math.floor((Math.random() * 32) + 1) + "-" + Math.floor((Math.random() * 13) + 1) + "-" + Math.floor((Math.random() * 3) + 2012);
                        elem.hasAlarm = angular.isDefined(elem.alerts);
                        elem.newAlert = elem.hasAlarm && elem.alerts > 0 ? 'color:red;' : '';
                        //elem.newAlert = isNew ? (elem.title == title ? 'color:red;' : '') : '';
                        elem.hideNewAlert = function() {
                            elem.newAlert = '';
                        };
                        //elem.date = elem.date.replace(' 00:00:00:000000', '');
                        //elem.points = Math.floor((Math.random() * 6) );
                    });

                    if (list.length == 0)
                        $scope.showCompareHelp = 1;
                    else {
                        var aux = {};
                        if (side == "left")
                            aux = {
                                "pointid": $scope.pointNames[$scope.pointidLeft]
                            };
                        else
                            aux = {
                                "pointid": $scope.pointNames[$scope.pointidRight]
                            };

                        for (var i = 0; i < list.length; i++) {
                            var elem = list[i];

                            addUnique($scope.kpilist, elem.title);
                            aux[elem.title] = elem.value;
                        }
                        $scope.lines.push(aux);
                    }

                    if (side == "left")
                        $scope.listLeft = list;
                    else
                        $scope.listRight = list;
                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                });
            }


            // if($scope.pointid != null || $scope.pointid != undefined){
            //   for(var name in data[0].attributes){
            //     // // console.log( name +" => "+ data[0].attributes[name] );
            //     $scope.attributes.push({ name : name, value : data[0].attributes[name] });
            //   }
            //   $scope.pointtype = data[0].type;
            // }


        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });


    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });


    $scope.lines = new Array();

    // util functions to manage currWidgets
    function hasWidgetTitle(currWidgets, title) {
        for (var i = 0; i < currWidgets.length; i++) {
            if (currWidgets[i].title == title)
                return true;
        }
        return false;
    }


    function addToHistoriesCharts(elem, pid, pointid, wid) {

        var widgetHistory = {
            "title": elem.title,
            "wid": elem.wid
        };
        getHistory(elem, pid, pointid, wid);

        if (!hasWidgetTitle($scope.comparingWidgets, elem.title))
            $scope.comparingWidgets.push(widgetHistory);

    }


    function accumPushCompare(arr, elem, aggrmethod) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][0].getTime() == elem[0].getTime()) {

                // if(i==9)
                //   console.log(" ");

                // GM-2#5
                if (aggrmethod == 'average') {
                    // this is hardcoded, assuming counter position is 5
                    arr[i][2]++;
                    var ctr = arr[i][2];
                    arr[i][1] = arr[i][1] * (ctr - 1) / ctr + +elem[1] / ctr;
                } else {
                    arr[i][1] += +elem[1];
                }
                return;
            }
        }
        arr.push(elem.concat([1]));
    }


    function getHistory(elem, pid, pointid, wid) {

        console.log("getHistory");

        var query = "/api/widgetIndicators/" + pid + "/" + wid + "/" + pointid;
        $http.get(query).
        success(function(data, status) {
            // console.log("got getHistory for "+elem.wid);
            // console.log(data.indicators[0].readingsDoubleArr);
            var reads = data.indicators[0].readingsDoubleArr;

            var parsedReadings = [];

            for (var i = 0; i < reads.length; i++) {
                var aux = [new Date(reads[i][0]), reads[i][1]];
                accumPushCompare(parsedReadings, aux, elem.aggrmethod);
                // parsedReadings.push([  new Date(reads[i][0]), reads[i][1] ]);

            }

            // 1. colocar o date array a []
            // 2. no ciclo para ler cada read, ir recolhendo todos os date
            // 3. ordenar os date
            // 4. para cada date, procurar no parsedReadings, agregar segundo o aggrmethod e colocar em novo array

            if ($scope.histories[elem.wid] == undefined) {

                // console.log($scope.histories[elem.wid]);
                $scope.histories[elem.wid] = [{
                    "key": pointid, // CUIDADO: este pointid um dia ha de ser mudado para translateName(pointid)... estou a fazer delete por key == deletedpointid!
                    "values": parsedReadings
                }];
                // console.log($scope.histories[elem.wid]);

            } else {

                var auxHistoriesElem = $scope.histories[elem.wid].slice();
                // $scope.histories[elem.wid] = [];


                auxHistoriesElem.push({
                    "key": pointid, // CUIDADO: este pointid um dia ha de ser mudado para translateName(pointid)... estou a fazer delete por key == deletedpointid!
                    "values": parsedReadings
                });

                // console.log($scope.histories[elem.wid]);
                $scope.histories[elem.wid] = auxHistoriesElem;
                // console.log($scope.histories[elem.wid]);
            }

            // console.log("$scope.histories[elem.wid]");
            // console.log($scope.histories[elem.wid]);



        }).
        error(function(data, status) {});
        // ver qual o metodo da api que da o historico de um ponto e kpi
    }



    function getHistory2(elem) {
        if (elem.title == "Acidentes") {

            $scope.histories[elem.wid] = [{
                "key": "Quantity",
                "values": [
                    [1136005200000, 1271000.0],
                    [1138683600000, 1271000.0],
                    [1141102800000, 1271000.0],
                    [1143781200000, 0],
                    [1146369600000, 0],
                    [1149048000000, 0],
                    [1151640000000, 0],
                    [1154318400000, 0],
                    [1156996800000, 0],
                    [1159588800000, 3899486.0],
                    [1162270800000, 3899486.0],
                    [1164862800000, 3899486.0],
                    [1167541200000, 3564700.0],
                    [1170219600000, 3564700.0],
                    [1172638800000, 3564700.0],
                    [1175313600000, 2648493.0],
                    [1177905600000, 2648493.0],
                    [1180584000000, 2648493.0],
                    [1183176000000, 2522993.0],
                    [1185854400000, 2522993.0],
                    [1188532800000, 2522993.0],
                    [1191124800000, 2906501.0],
                    [1193803200000, 2906501.0],
                    [1196398800000, 2906501.0],
                    [1199077200000, 2206761.0],
                    [1201755600000, 2206761.0],
                    [1204261200000, 2206761.0],
                    [1206936000000, 2287726.0],
                    [1209528000000, 2287726.0],
                    [1212206400000, 2287726.0],
                    [1214798400000, 2732646.0],
                    [1217476800000, 2732646.0],
                    [1220155200000, 2732646.0],
                    [1222747200000, 2599196.0],
                    [1225425600000, 2599196.0],
                    [1228021200000, 2599196.0],
                    [1230699600000, 1924387.0],
                    [1233378000000, 1924387.0],
                    [1235797200000, 1924387.0],
                    [1238472000000, 1756311.0],
                    [1241064000000, 1756311.0],
                    [1243742400000, 1756311.0],
                    [1246334400000, 1743470.0],
                    [1249012800000, 1743470.0],
                    [1251691200000, 1743470.0],
                    [1254283200000, 1519010.0],
                    [1256961600000, 1519010.0],
                    [1259557200000, 1519010.0],
                    [1262235600000, 1591444.0],
                    [1264914000000, 1591444.0],
                    [1267333200000, 1591444.0],
                    [1270008000000, 1543784.0],
                    [1272600000000, 1543784.0],
                    [1275278400000, 1543784.0],
                    [1277870400000, 1309915.0],
                    [1280548800000, 1309915.0],
                    [1283227200000, 1309915.0],
                    [1285819200000, 1331875.0],
                    [1288497600000, 1331875.0],
                    [1291093200000, 1331875.0],
                    [1293771600000, 1331875.0],
                    [1296450000000, 1154695.0],
                    [1298869200000, 1154695.0],
                    [1301544000000, 1194025.0],
                    [1304136000000, 1194025.0],
                    [1306814400000, 1194025.0],
                    [1309406400000, 1194025.0],
                    [1312084800000, 1194025.0],
                    [1314763200000, 1244525.0],
                    [1317355200000, 475000.0],
                    [1320033600000, 475000.0],
                    [1322629200000, 475000.0],
                    [1325307600000, 690033.0],
                    [1327986000000, 690033.0],
                    [1330491600000, 690033.0],
                    [1333166400000, 514733.0],
                    [1335758400000, 514733.0]
                ]
            }];
        } else {
            // widgetHistory.history = [
            $scope.histories[elem.wid] = [{
                "key": "Price",
                "values": [
                    [1136005200000, 71.89],
                    [1138683600000, 75.51],
                    [1141102800000, 68.49],
                    [1143781200000, 62.72],
                    [1146369600000, 70.39],
                    [1149048000000, 59.77],
                    [1151640000000, 57.27],
                    [1154318400000, 67.96],
                    [1156996800000, 67.85],
                    [1159588800000, 76.98],
                    [1162270800000, 81.08],
                    [1164862800000, 91.66],
                    [1167541200000, 84.84],
                    [1170219600000, 85.73],
                    [1172638800000, 84.61],
                    [1175313600000, 92.91],
                    [1177905600000, 99.8],
                    [1180584000000, 121.191],
                    [1183176000000, 122.04],
                    [1185854400000, 131.76],
                    [1188532800000, 138.48],
                    [1191124800000, 153.47],
                    [1193803200000, 189.95],
                    [1196398800000, 182.22],
                    [1199077200000, 198.08],
                    [1201755600000, 135.36],
                    [1204261200000, 125.02],
                    [1206936000000, 143.5],
                    [1209528000000, 173.95],
                    [1212206400000, 188.75],
                    [1214798400000, 167.44],
                    [1217476800000, 158.95],
                    [1220155200000, 169.53],
                    [1222747200000, 113.66],
                    [1225425600000, 107.59],
                    [1228021200000, 92.67],
                    [1230699600000, 85.35],
                    [1233378000000, 90.13],
                    [1235797200000, 89.31],
                    [1238472000000, 105.12],
                    [1241064000000, 125.83],
                    [1243742400000, 135.81],
                    [1246334400000, 142.43],
                    [1249012800000, 163.39],
                    [1251691200000, 168.21],
                    [1254283200000, 185.35],
                    [1256961600000, 188.5],
                    [1259557200000, 199.91],
                    [1262235600000, 210.732],
                    [1264914000000, 192.063],
                    [1267333200000, 204.62],
                    [1270008000000, 235.0],
                    [1272600000000, 261.09],
                    [1275278400000, 256.88],
                    [1277870400000, 251.53],
                    [1280548800000, 257.25],
                    [1283227200000, 243.1],
                    [1285819200000, 283.75],
                    [1288497600000, 300.98],
                    [1291093200000, 311.15],
                    [1293771600000, 322.56],
                    [1296450000000, 339.32],
                    [1298869200000, 353.21],
                    [1301544000000, 348.5075],
                    [1304136000000, 350.13],
                    [1306814400000, 347.83],
                    [1309406400000, 335.67],
                    [1312084800000, 390.48],
                    [1314763200000, 384.83],
                    [1317355200000, 381.32],
                    [1320033600000, 404.78],
                    [1322629200000, 382.2],
                    [1325307600000, 405.0],
                    [1327986000000, 456.48],
                    [1330491600000, 542.44],
                    [1333166400000, 599.55],
                    [1335758400000, 583.98]
                ]
            }];
        }
    }



    // no codigo do click, suporte a selected/unselected
    // aquando de cada selected, e selected# < 1, ir buscar 
    //       os kpis do pointid seleccionado, e adicionar à
    //       listLeft ou listRight (a que estiver vazia [])
    //       - na API, criar metodo conforme pointid dá os
    //         valores e os kpis existentes --> JA HA ESTE METODO, É O QUE SE USA
    //         PARA O DASHBOARDPOINT


    // agora ir buscar, para cada KPI, o historico de cada ponto
    // e qd recebermos colocamos no sitio certo correspondente.
    // deverá aparecer uma caixa de chart para cada kpi, e em cada
    // caixa, deve aparecer uma linha para cada um dos dois pontos

    $scope.comparingWidgets = [];
    $scope.histories = [];


    var colors = {};
    var colorCount = 0;
    var colorCategory = d3.scale.category20b();

    $scope.catColorFunction = function() {
        return function(d, i) {
            // console.log("d for i:"+i);
            // console.log(d.key);

            if (d.key == $scope.pointidLeft)
                return "#f0ad4e";
            else
                return "#5bc0de";
        };
    }

    $scope.xAxisTickFormatFunction = function() {
        // return function(d){
        //     return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
        // }
        return function(d) {
            // return d3.time.format("%Y-%m-%d %H:%M:%S.%L")(new Date(d));
            return d3.time.format("%Y-%m-%d")(new Date(d));
        }
    }



    $scope.kpilist = [];

    function addUnique(arr, elem) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == elem)
                return;
        }
        arr.push(elem);
    }

};



ScatterPlotCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'leafletData', 'Profile', 'Occurrences', 'sharedCommsService'];

function ScatterPlotCtrl($scope, $http, $routeParams, $location, leafletData, Profile, Occurrences, sharedCommsService) {
    console.log("ScatterPlotCtrl");
    $scope.pid = $routeParams.pid;

    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.occurrences = Occurrences.occurrences;

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.openOcc = Occurrences.openOcc;

    $scope.$watch('currOccurrence.status', function(oldVal, newVal) {
        if (newVal != "") {
            $scope.openOcc = Occurrences.openOcc;

        }

    });

    $scope.userProfile = Profile.userprofile;
    console.log(Profile.userprofile);

    $scope.tooltipXContentFunction = function() {
        return function(key, x, y) {
            return '<strong>YO!' + x + '</strong>'
        }
    }

    $http.get('/api/dashboard/' + $scope.pid).
    success(function(data, status) {
        $scope.project = data.project;

    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });


    $scope.plotButtonDisabled = '';
    // get all kpis
    $scope.kpis = [];

    var query = '/api/widgets/' + $scope.pid;
    $http.get(query).
    success(function(data, status) {
        console.log("yeah read widgets for scatterplot!");

        var list = data;

        if (!list.hasOwnProperty("length"))
            return;

        list.forEach(function(elem) {

            $scope.kpis.push({
                "title": elem.title,
                "wid": elem.wid,
                "aggrmethod": elem.aggrmethod
            });


        });


    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });



    $scope.geometries = [];
    $scope.geometries.push({
        "title": "All",
        "pointid": undefined
    });

    var get_url = '/geoapi/' + $scope.pid;

    $http.get(get_url).
    success(function(data, status) {
        console.log("got geometries");
        for (var d in data) {
            var title = '';

            if (data[d].geometry == null) {
                title = data[d].attributes.name || data[d].attributes.StoreCodeAbbrv || data[d].attributes.PointKey || data[d].pointid;
            } else {
                // the difference is that geometry can hold other parameters that are preemptive
                if (data[d].geometry.properties.ref != undefined && data[d].geometry.properties.ref != null && data[d].geometry.properties.StoreCodeAbbrv != undefined && data[d].geometry.properties.StoreCodeAbbrv != null)
                    title = data[d].geometry.properties.ref + " (" + data[d].geometry.properties.StoreCodeAbbrv + ")";
                else {
                    data[d].geometry.properties.StoreCodeAbbrv ||
                        data[d].attributes.name ||
                        data[d].attributes.StoreCodeAbbrv ||
                        data[d].attributes.PointKey ||
                        data[d].geometry.properties.pointid ||
                        data[d].pointid;
                }
            }

            $scope.geometries.push({
                "title": title,
                "pointid": data[d].pointid
            });
        }
    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });



    // function to support ng-click renderScatterPlot()
    // get pid, selectA, selectB
    // get all readings from all points
    // select values of KPIs and create array [selectAValue, selectBValue]
    // assoc array to scatterplot $scope.exampleData


    function accumPushPerfVar(arr, elem, aggrmethod, pointid_point, isPerformanceVar) {
        var valIndex = 1;
        var ctrIndex = 2;

        if (!isPerformanceVar) {
            valIndex = 3;
            ctrIndex = 4;
        }

        for (var i = 0; i < arr.length; i++) {
            var elemDate = new Date(elem[0]);
            if (arr[i][0].getTime() == elemDate.getTime() && arr[i][5] == pointid_point) {

                if (aggrmethod == 'average') {
                    // this is hardcoded, assuming counter position is 2
                    arr[i][ctrIndex]++;
                    var ctr = arr[i][ctrIndex];
                    arr[i][valIndex] = arr[i][valIndex] * (ctr - 1) / ctr + +elem[1] / ctr;
                } else {
                    arr[i][ctrIndex]++;
                    arr[i][valIndex] += +elem[1];
                }

                return;
            }

        }
        // scanned all entries on arr and didn't find existing date.
        // add new entry
        // arr.push(elem.concat([1, 0, 0]));
        if (isPerformanceVar)
            arr.push([new Date(elem[0]), elem[1], 1, 0, 0, pointid_point]);
        else
            arr.push([new Date(elem[0]), 0, 0, elem[1], 1, pointid_point]);
    }

    function addToScatterValues(arr, toAddArr, isPerformanceVar, pointidsArr) {
        // [date, perfVal, perfCtr, inflVal, inflCtr]


        // after searching and finding the date, or pushing
        // will add on [1, 2]
        for (var i = 0; i < toAddArr.length; i++) {
            var toAddArrElem = toAddArr[i];
            var toAddReadingsDoubleArr = toAddArrElem.readingsDoubleArr;

            for (var j = 0; j < toAddReadingsDoubleArr.length; j++) {
                var elem = toAddReadingsDoubleArr[j];
                // if(isPerformanceVar){
                accumPushPerfVar(arr, elem, toAddArrElem.aggrmethod, toAddArrElem.pointid_point, isPerformanceVar);
                addUniqueValToArr(pointidsArr, toAddArrElem.pointid_point);
                // } else {
                //   accumPushInfluVar(arr, elem, toAddArrElem.aggrmethod, toAddArrElem.pointid_point);
                // }
            }
        }
    }

    function addUniqueValToArr(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val)
                return;
        }
        arr.push(val);
    }



    function getCol(matrix, col) {
        var column = [];
        for (var i = 0; i < matrix.length; i++) {
            column.push(matrix[i][col]);
        }
        return column;
    }

    function getXArray(arr) {
        return getCol(arr, 1);
    }

    function getYArray(arr) {
        return getCol(arr, 3);
    }

    function getMin(arr, column) {
        var ret = undefined;
        for (var i = 0; i < arr.length; i++) {
            var elem = arr[i][column];
            if (ret == undefined || elem < ret)
                ret = elem;
        }
        return ret;
    }


    function getLr(y, x) {
        var lr = {};
        var n = y.length;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var sum_yy = 0;

        console.log("linear regression for " + n + " xy entries");

        for (var i = 0; i < y.length; i++) {

            sum_x += x[i];
            sum_y += y[i];
            sum_xy += (x[i] * y[i]);
            sum_xx += (x[i] * x[i]);
            sum_yy += (y[i] * y[i]);
        }

        lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
        lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
        lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

        return lr;
    }



    $scope.logscale = false;
    $scope.logscaleshow = false;

    $scope.rsquared = 0;
    $scope.rsquaredlog = 0;

    $scope.processScatterPlot = function() {
        // console.log($scope.performancevar + " " + $scope.influencingvar);
        // console.log($scope.pruneZeros);

        $scope.exampleData = [];
        $scope.values = [];
        $scope.pointidsArr = [];

        if ($scope.performancevar != undefined && $scope.influencingvar != undefined) {

            var query = "/api/widgetIndicators/" + $scope.pid + "/" + $scope.performancevar;

            if ($scope.specificgeometry != undefined)
                query += "/" + $scope.specificgeometry;

            console.log("query : " + query);
            $http.get(query).
            success(function(data, status) {
                console.log("got widgetIndicators");


                addToScatterValues($scope.values, data.indicators, true, $scope.pointidsArr);


                var query = "/api/widgetIndicators/" + $scope.pid + "/" + $scope.influencingvar;
                if ($scope.specificgeometry != undefined)
                    query += "/" + $scope.specificgeometry;

                $http.get(query).
                success(function(data, status) {
                    addToScatterValues($scope.values, data.indicators, false, $scope.pointidsArr);

                    // console.log("$scope.values");
                    // console.log($scope.values);


                    // var auxArray = [];
                    // for(var k=0; k<$scope.values.length; k++){
                    //   var aux = $scope.values[k];
                    //   if(aux[2] > 0 && aux[4] > 0)
                    //     auxArray.push({"x":aux[1], "y": aux[3], "size": 1});

                    //   if(aux[2] > 1 && aux[4] > 1)
                    //     console.log("im big");
                    // }

                    // $scope.exampleData = [
                    //   {"key": "scatterplot",
                    //     "values": auxArray}
                    // ];
                    var xarray = getXArray($scope.values);
                    var yarray = getYArray($scope.values);


                    var minx = getMin($scope.values, 1);
                    var miny = getMin($scope.values, 3);
                    // console.log("minx "+minx+" ____ miny "+miny);

                    var lr = getLr(yarray, xarray);
                    // console.log("LR R-squared "+lr.r2);
                    $scope.rsquared = parseFloat(lr.r2).toFixed(3);



                    // right place to calc r2 logarithmic scale
                    // transform x and y to log scale
                    // getLr with new yarray and xarray
                    var xarraylog = xarray.map(function(val) {
                        return (minx > 0 ? Math.log(val) : Math.log(val + Math.abs(minx) + 1));
                    });
                    var yarraylog = yarray.map(function(val) {
                        return (miny > 0 ? Math.log(val) : Math.log(val + Math.abs(miny) + 1));
                    });

                    var lrlog = getLr(yarraylog, xarraylog);
                    // console.log("LR R-squared "+lrlog.r2);
                    $scope.rsquaredlog = parseFloat(lrlog.r2).toFixed(3);



                    for (var k = 0; k < $scope.pointidsArr.length; k++) {
                        var pointid = $scope.pointidsArr[k];

                        var auxArray = [];

                        for (var l = 0; l < $scope.values.length; l++) {
                            var aux = $scope.values[l];
                            if (aux[5] == pointid) {
                                if (aux[2] > 0 && aux[4] > 0) {

                                    var x = aux[1];
                                    var y = aux[3];

                                    if ($scope.logscale == true) {

                                        // if min is <= 0, we need to translate all values by (VAL + abs(min)+1)
                                        // console.log("Before y "+x+" ____ y "+y);

                                        if (minx > 0) {
                                            // console.log("going pure x "+Math.log(x));
                                            x = Math.log(x);
                                        } else {
                                            var deviation = Math.abs(minx) + 1;
                                            // console.log("doing normalization x "+ Math.log(x + deviation ) );
                                            x = Math.log(x + deviation);
                                        }

                                        if (miny > 0) {
                                            // console.log("going pure y "+Math.log(y));
                                            y = Math.log(y);
                                        } else {
                                            var deviation = Math.abs(miny) + 1;
                                            // console.log("doing normalization y "+ Math.log(y + deviation ) );
                                            y = Math.log(y + deviation);
                                        }

                                        // x = (minx > 0) ? Math.log(x) : Math.log(x + (Math.abs(x)+1) );
                                        // y = (miny > 0) ? Math.log(y) : Math.log(y + (Math.abs(y)+1) );
                                        // console.log("PLACING      x "+x+" ____ y "+y);
                                    }


                                    if ($scope.pruneZeros == undefined || $scope.pruneZeros == false) {
                                        auxArray.push({
                                            "x": x,
                                            "y": y,
                                            "size": 1
                                        });
                                    } else if ($scope.pruneZeros == true) {
                                        if (aux[1] != 0 && aux[3] != 0) {
                                            auxArray.push({
                                                "x": x,
                                                "y": y,
                                                "size": 1
                                            });
                                        }
                                    }
                                }
                            }
                        }

                        var auxExampleData = $scope.exampleData.slice();
                        auxExampleData.push({
                            "key": pointid,
                            "values": auxArray
                        });
                        $scope.exampleData = auxExampleData;
                    }


                    if ($scope.logscale)
                        $scope.logscaleshow = true;
                    else
                        $scope.logscaleshow = false;

                }).
                error(function(data, status) {
                    $scope.data = data || "Request failed";
                });

            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });

        }
        // get aggregated readings for kpiA
        // source exampleData with {key kpiA, values: RECEIVED_DATA}


        // get aggregated readings for kpiB
        // source exampleData with {key kpiB, values: RECEIVED_DATA}


        //  $scope.exampleData = [
        //     {"key":"A1_km1",
        //        "values":[{"x":55,"y":5,"size":1},{"x":33,"y":20,"size":1},{"x":10,"y":67,"size":1}]
        //     },
        //     {"key":"A1_km11",
        //         "values":[{"x":53,"y":5,"size":1},{"x":38,"y":20,"size":1},{"x":14,"y":67,"size":1}]
        //     }
        // ];


    }



}


function ScatterLineController($scope, $http, $routeParams, $location, leafletData) {
    var getData = function(groups, points) {
        var data = [],
            shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
            random = d3.random.normal();
        for (var i = 0; i < groups; i++) {
            data.push({
                key: 'Group ' + i,
                values: [],
                slope: Math.random() - .01,
                intercept: Math.random() - .5
            });
            for (var j = 0; j < points; j++) {
                data[i].values.push({
                    x: random(),
                    y: random(),
                    size: Math.random()
                        //, shape: shapes[j % 6]
                });
            }
        }
        return data;
    }
    $scope.exampleData = getData(3, 20);
    $scope.tooltipXContentFunction = function() {
        return function(key, x, y) {
            return '<strong>YO!' + x + '</strong>'
        }
    }
    $scope.getShapeCross = function() {
        return function(d) {
            return 'cross';
        }
    }
    $scope.getShapeDiamond = function() {
        return function(d) {
            return 'diamond';
        }
    }
    $scope.getShapeDiamond = function() {
        return function(d) {
            return 'diamond';
        }
    }
}



OccurrencesCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'leafletData', 'sharedCommsService', 'socket', '$timeout', '$window', 'Occurrences', 'Profile', 'ProjectInfo'];

function OccurrencesCtrl($scope, $http, $routeParams, $location, leafletData, sharedCommsService, socket, $timeout, $window, Occurrences, Profile, ProjectInfo) {
    console.log('OccurrencesCtrl');

    $scope.loading = false;
    $scope.occLoading = false;

    $scope.$on('$locationChangeSuccess', function(event) {
        if ($location.path().indexOf('/map') >= 0)
            $scope.loading = true

        if ($location.path().indexOf('/occurrences') >= 0)
            $scope.occLoading = true
    })


    $scope.pid = $routeParams.pid;
    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.widgets = [];
    $scope.numOfPoints = 0;

    $scope.userProfile = Profile.userprofile;
    console.log(Profile.userprofile);

    $scope.complexmarkers = new Array();

    $scope.hoveredGeometry = "";



    var getRule = function(occcfg, occcfgid) {
        var toRet = {};
        if (occcfg.hasOwnProperty("repetitionBox") && occcfg.repetitionBox == true) {
            toRet.repetitions = occcfg.repvalue;
        } else {
            toRet.repetitions = 0;
        }
        toRet.rule = occcfg.rule;
        toRet.value = occcfg.value;

        if (occcfg.hasOwnProperty("objBox") && occcfg.objBox == true) {
            toRet.percentage = true;
        } else {
            toRet.percentage = false;
        }

        toRet.occcfgid = occcfgid;

        return toRet;
    }


    var processOccurrenceConfigs = function(rawOccCfgs) {
        console.log(rawOccCfgs);

        var toReturn = {};

        toReturn["hourly"] = {};
        toReturn["daily"] = {};

        // NUNOALEX: lets focus only on percentage, hourly RULES (dynamic for widget titles and store pointkeys)

        for (var i = 0; i < rawOccCfgs.length; i++) {
            var occcfg = rawOccCfgs[i].config;
            var occcfgid = rawOccCfgs[i].occcfgid;

            if (occcfg.hasOwnProperty('objBox') && occcfg.objBox == true) {
                if (occcfg.hasOwnProperty('hourlyBox') && occcfg.hourlyBox == true) {
                    var widgetTitle = occcfg.widgetBox.title;
                    toReturn["hourly"][widgetTitle] = {};

                    for (var pointkey in occcfg.storeBox) {
                        if (occcfg.storeBox.hasOwnProperty(pointkey) && occcfg.storeBox[pointkey] == true) {
                            var obje = toReturn["hourly"][widgetTitle];

                            if (!obje.hasOwnProperty(pointkey)) {
                                toReturn["hourly"][widgetTitle][pointkey] = new Array();
                            }

                            toReturn["hourly"][widgetTitle][pointkey].push(getRule(occcfg, occcfgid));
                        }
                    }


                }
            }
        }

        return toReturn;
    }


    // NUNOALEX TODO: we need to fetch the $scope.project = data.project from another API method
    $scope.project = ProjectInfo;



    var hasOccurrence = function(arr, occ) {
        for (var i = 0; i < arr.length; i++) {
            var aux = arr[i];
            if (aux.occid == occ.occid) {
                return true;
            }
        }
        return false;
    }


    var clearNewOccurrencesFunction = function() {
        console.log("\n\nclearNewOccurrencesFunction");
        for (var i = 0; i < $scope.occurrences.length; i++) {
            if ($scope.occurrences[i].hasOwnProperty('liveupdateclass') &&
                $scope.occurrences[i].liveupdateclass == 'liveupdate') {
                $scope.occurrences[i].liveupdateclass = '';
            }
        }
        $scope.$apply();
        console.log("done");
    }



    $scope.hideLoadMoreButton = false;
    $scope.loadMoreMessage = "Load more";
    $scope.loadMoreClass = "";

    $scope.loadRemainingOccurrences = function() {
        $scope.loadMoreMessage = "Loading...";
        $scope.loadMoreClass = "powerwidget-loader";

        $http.get('/api/occurrences/' + $scope.pid + "/0")
            .success(function(response, status) {

                for (var i = 0; i < response.occurrences.length; i++) {
                    if ($scope.currOccurrence.occid == undefined ||
                        ($scope.currOccurrence.showTasks == true && $scope.currOccurrence.occid != response.occurrences[i].occid)) {
                        response.occurrences[i].statusMenu = false;
                        response.occurrences[i].showTasks = false;
                        response.occurrences[i].selectedClass = "";
                    } else {
                        console.log("one is selected");
                        response.occurrences[i].statusMenu = $scope.currOccurrence.statusMenu;
                        response.occurrences[i].showTasks = $scope.currOccurrence.showTasks;
                        response.occurrences[i].selectedClass = $scope.currOccurrence.selectedClass;

                        $scope.currOccurrence = response.occurrences[i];
                    }
                }


                $scope.occurrences = response.occurrences;
                $scope.hideLoadMoreButton = true;

                //IR - calculate number of hours until occurrence deadline!
                console.log("get countdown");
                $scope.currentdate = new Date();
                var hournow = $scope.currentdate.getHours();

                for (var i = 0; i < $scope.occurrences.length; i++) {

                    if ($scope.occurrences[i].duedate != undefined && $scope.occurrences[i].duehour != undefined && $scope.occurrences[i].duedate != "" && $scope.occurrences[i].duehour != "") {
                        $scope.occdatetime = new Date($scope.occurrences[i].duedate)
                        $scope.occdatetime.setHours($scope.occurrences[i].duehour)

                        var countdown = Math.abs($scope.currentdate - $scope.occdatetime);
                        var countdownday = parseInt(((countdown / 1000 / 3600) / 24));
                        var countdownhour = parseInt(((countdown / 1000 / 3600)));
                        var countdownminute = parseInt(((countdown / 1000 / 3600) * 60));

                        if (countdownminute > 1440) {
                            $scope.occurrences[i].countdown = countdownday + "d " + (countdownhour - countdownday * 24) + "h ";
                        } else {
                            if (countdownminute > 60)
                                $scope.occurrences[i].countdown = countdownhour + "h " + (countdownminute - countdownhour * 60) + "m ";
                            else
                                $scope.occurrences[i].countdown = (countdownminute - countdownhour * 60) + "m ";
                        }

                        if ($scope.currentdate <= $scope.occdatetime)
                            $scope.occurrences[i].countdowncol = false;
                        else
                            $scope.occurrences[i].countdowncol = true;

                    } else {

                        $scope.occurrences[i].countdown = " ";

                    }

                }



            });
    }


    socket.on('new_occurrence_triggered', function(u) {
        console.log("REFRESH OCCURRENCES");

        $http.get('/api/occurrences/' + $scope.pid + "/0")
            .success(function(response, status) {
                console.log("occurrences response.data");
                console.log(response.occurrences);

                var clearNewOccurrences = false;

                for (var i = 0; i < response.occurrences.length; i++) {

                    if ($scope.currOccurrence.occid == undefined ||
                        ($scope.currOccurrence.showTasks == true && $scope.currOccurrence.occid != response.occurrences[i].occid)) {
                        response.occurrences[i].statusMenu = false;
                        response.occurrences[i].showTasks = false;
                        response.occurrences[i].selectedClass = "";
                    } else {
                        console.log("one is selected");
                        response.occurrences[i].statusMenu = $scope.currOccurrence.statusMenu;
                        response.occurrences[i].showTasks = $scope.currOccurrence.showTasks;
                        response.occurrences[i].selectedClass = $scope.currOccurrence.selectedClass;

                        $scope.currOccurrence = response.occurrences[i];
                    }

                    if (!hasOccurrence($scope.occurrences, response.occurrences[i])) {
                        response.occurrences[i].liveupdateclass = 'liveupdate';
                        clearNewOccurrences = true;

                        // sharedCommsService.occurrence = response.occurrences[i];
                        // sharedCommsService.bufferAndBroadcast("generateNotification");
                        // socket.emit('send:generateNotification', response.occurrences[i]);

                    }
                }

                if (clearNewOccurrences) {
                    setTimeout(clearNewOccurrencesFunction, 15000);
                }

                $scope.occurrences = response.occurrences;

                // return response.data.occurrences;

                // var auxarr = new Array();

                // for(var i=0; i<response.occurrences.length; i++){
                //   var occ = response.occurrences[i];

                //   var found = false;

                //   for(var j=0; j<$scope.occurrences.length; j++){
                //     var auxocc = $scope.occurrences[j];

                //     if(auxocc.occid == occ.occid){
                //       found = true;
                //       break;
                //     }
                //   }

                //   if(!found){

                //   }
                // }

            }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

    });


    var index = 0;
    $scope.notifications = {};
    $scope.notificationsTtl = 30000;
    var getCustomIconsTtl = 10000;
    $scope.shownOccurrences = {};


    $scope.genNotif = function(notif) {
        if (notif == null) {
            var i = index++;
            $scope.notifications[i] = {};
            $scope.notifications[i].message = "oh yeah " + new Date();
            $scope.notifications[i].icon = 'img/custommarkers/nok.png';
            // console.log(message);
        } else {
            console.log("GOOOOOOT NOTIF!");
            console.log(notif);

            var i = index++;
            $scope.notifications[i] = {};
            $scope.notifications[i].message = notif.widgetname + " is " + notif.rule + " " + notif.value + "% of the objective!";

            if (notif.repetitions > 0) {
                $scope.notifications[i].messagerepetition = notif.repetitions + " times in a row";
            }

            $scope.notifications[i].icon = notif.icon;
            $scope.notifications[i].repetitions = notif.repetitions;
            $scope.notifications[i].store = notif.storename;
            $scope.notifications[i].readvalue = parseFloat(notif.readvalue).toFixed(1);
            $scope.notifications[i].hour = notif.hour;
            $scope.notifications[i].unit = notif.unit;



        }
    }

    $scope.range = function(notif) {
        return new Array(notif.repetitions);
    };


    var translateDataPointName = function(attributes) {
        if (attributes.hasOwnProperty('Name'))
            return attributes.Name;
        else if (attributes.hasOwnProperty('name'))
            return attributes.name;
        else
            return 'N/A';
    }



    $scope.occurrences = Occurrences.occurrences;

    for (var obj in $scope.occurrences) {
        if ($scope.occurrences[obj].pointid == 11725 || $scope.occurrences[obj].pointid == 13477) $scope.occurrences[obj].pointname = "Lubelska (Ch)";
        if ($scope.occurrences[obj].pointid == 11727 || $scope.occurrences[obj].pointid == 13480) $scope.occurrences[obj].pointname = "Świdnik";
        if ($scope.occurrences[obj].pointid == 11729 || $scope.occurrences[obj].pointid == 13482) $scope.occurrences[obj].pointname = "Puławy";
        if ($scope.occurrences[obj].pointid == 11730 || $scope.occurrences[obj].pointid == 13483) $scope.occurrences[obj].pointname = "Płock";
        if ($scope.occurrences[obj].pointid == 11731 || $scope.occurrences[obj].pointid == 13484) $scope.occurrences[obj].pointname = "Radom";
        if ($scope.occurrences[obj].pointid == 11732 || $scope.occurrences[obj].pointid == 13485) $scope.occurrences[obj].pointname = "Łódź";
        if ($scope.occurrences[obj].pointid == 11726 || $scope.occurrences[obj].pointid == 13478) $scope.occurrences[obj].pointname = "Lwowska (Ch)";
        if ($scope.occurrences[obj].pointid == 11724 || $scope.occurrences[obj].pointid == 13479) $scope.occurrences[obj].pointname = "Piłsudskiego (Ch)";
        if ($scope.occurrences[obj].pointid == 11728 || $scope.occurrences[obj].pointid == 13481) $scope.occurrences[obj].pointname = "Lublin";

    }

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.showOpenOcc = false;
    console.log($scope.showOpenOcc);
    $scope.openOcc = Occurrences.openOcc;

    if ($scope.openOcc > 0)
        $scope.showOpenOcc = true;
    else
        $scope.showOpenOcc = false;

    //console.log($scope.showOpenOcc);

    $scope.$watch('currOccurrence.status', function() {
        $scope.openOcc = Occurrences.openOcc;

        if ($scope.openOcc > 0)
            $scope.showOpenOcc = true;
        else
            $scope.showOpenOcc = false;
    });



    $scope.currOccurrence = {
        "showTasks": false,
        "selectedClass": "",
        "statusMenu": false
    };
    //$scope.showTaskList = true;
    $scope.editing = new Array();

    $scope.setCurrOccurrence = function(occurrence) {
        console.log("setCurrOccurrence");
        //$scope.showTaskList = false;

        if ($scope.currOccurrence.occid != occurrence.occid) {
            $scope.currOccurrence.showTasks = false;
            $scope.currOccurrence.statusMenu = false;
            $scope.currOccurrence.selectedClass = '';

            $scope.currOccurrence = occurrence;

            $scope.currOccurrence.selectedClass = 'selectedOccurrence';
            $scope.currOccurrence.showTasks = true;
            $scope.currOccurrence.statusMenu = true;
        } else if ($scope.currOccurrence.occid == occurrence.occid) {
            if ($scope.currOccurrence.showTasks == false) {
                $scope.currOccurrence.showTasks = true;
                $scope.currOccurrence.statusMenu = true;
            } else {
                $scope.currOccurrence.showTasks = false;
                $scope.currOccurrence.statusMenu = false;

            }
        }


        $scope.editing = [];

        for (var i = 0; i < $scope.currOccurrence.tasks.length; i++) {
            $scope.editing[i] = false;
        }

        $scope.currColorClass = getColorByOccurrenceState($scope.currOccurrence.status);

        if ($scope.currOccurrence.new == 'true') {
            $scope.currOccurrence.new = false;
            writeToDb($scope.pid, $scope.currOccurrence);
        }
    }

    var finishChange = function() {

        $scope.$apply(
            function() {
                leafletData.getMap().then(function(map) {

                    map.fitBounds([
                        [$scope.currOccurrence.lat, $scope.currOccurrence.lng]
                    ], {
                        padding: [5, 5]
                    });

                    // var rand = Math.floor(Math.random() * $scope.markers.length - 1);
                    // if(rand < 0)
                    //   rand = 0;

                    // map.fitBounds( [
                    //     [$scope.markers[rand].lat, $scope.markers[rand].lng]
                    // ], { padding: [5, 5]});
                });

                //$scope.showTaskList = true;
                //$scope.currColorClass = getColorByOccurrenceState($scope.currOccurrence.status);
            }
        );
    }

    $http.get('/api/user').
    success(function(data, status, headers, config) {
        $scope.username = data.username;
    });

    var writeToDb = function(pid, obj) {
        console.log("writeToDb");
        if (obj == undefined) return;

        $http.post('/api/occurrences/' + $scope.pid, $scope.currOccurrence).
        success(function(data, status) {
            console.log("saveOccurrence ok");
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

    $scope.toggleEdit = function(index, saveToDb) {
        console.log("toggleEdit");

        $scope.editing[index] = !$scope.editing[index];
        $scope.oldComment = $scope.currOccurrence.tasks[index].obs;
        if (saveToDb) {
            $scope.currOccurrence.statusdate = new Date();
            $scope.currOccurrence.tasks[index].modifieddate = new Date();
            $scope.currOccurrence.tasks[index].username = $scope.username;
            writeToDb($scope.pid, $scope.currOccurrence);
        }
    }

    $scope.cancelNote = function(index) {
        console.log("cancelNote");

        $scope.currOccurrence.tasks[index].obs = $scope.oldComment;
        $scope.toggleEdit(index, false);
    }

    $scope.removeNote = function(index) {
        console.log("removeNote");

        $scope.currOccurrence.tasks[index].obs = "";
        $scope.currOccurrence.statusdate = new Date();
        $scope.currOccurrence.tasks[index].modifieddate = new Date();
        $scope.currOccurrence.tasks[index].username = $scope.username;

        writeToDb($scope.pid, $scope.currOccurrence)
    }

    function allTasksDone(currOccurrence) {
        console.log("allTasksDone");

        var tasks = $scope.currOccurrence.tasks;
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].done == false)
                return false;
        }
        return true;
    }


    $scope.changeStatus = function(newStatus, oldStatus) {

        console.log("changeStatus");

        if (newStatus == 'Closed' && !allTasksDone($scope.currOccurrence)) {
            $scope.currOccurrence.status = oldStatus;
            $window.alert("You cannot close when all of your tasks are not done");
            $scope.currOccurrence.status = oldStatus;
        } else {
            if (newStatus != undefined) {
                $scope.currColorClass = getColorByOccurrenceState($scope.currOccurrence.status);
                $scope.currOccurrence.status = newStatus;
                $scope.currOccurrence.statusdate = new Date();
                writeToDb($scope.pid, $scope.currOccurrence);
            }
        }
    }

    $scope.checkedTask = function(index) {

        console.log("checkedTask");

        var error = false;

        if ($scope.currOccurrence.status == 'Closed') {

            $scope.currOccurrence.tasks[index].done = !$scope.currOccurrence.tasks[index].done;
            alert('You cannot change the state of a task on a Closed occurrence...');
            error = true;
        } else if ($scope.currOccurrence.status == 'Open') {
            $scope.currOccurrence.tasks[index].done = !$scope.currOccurrence.tasks[index].done;
            alert('You cannot change the state of a task on a Open occurrence...');
            error = true;
        }

        if (!error) {
            //console.log("checkedTask Ok");
            $scope.currOccurrence.statusdate = new Date();
            $scope.currOccurrence.tasks[index].modifieddate = new Date();
            $scope.currOccurrence.tasks[index].username = $scope.username;
            $scope.currOccurrence.tasks[index].done = $scope.currOccurrence.tasks[index].done;
            writeToDb($scope.pid, $scope.currOccurrence);

            console.log($scope.currOccurrence);
        }
    }


    function getColorByOccurrenceState(state) {

        console.log("getColorByOccurrenceState");

        if (state == 'Open')
            return '#d24d33';
        else if (state == 'Assigned')
            return '#f0ad4e';
        else if (state == 'Ongoing')
        // return 'lightblue';
            return "#5bc0de";
        else if (state == 'Closed')
            return '#82b964;'
    }


    //IR - calculate number of hours until occurrence deadline!
    console.log("get countdown");
    $scope.currentdate = new Date();
    var hournow = $scope.currentdate.getHours();

    for (var i = 0; i < $scope.occurrences.length; i++) {

        if ($scope.occurrences[i].duedate != undefined && $scope.occurrences[i].duehour != undefined && $scope.occurrences[i].duedate != "" && $scope.occurrences[i].duehour != "") {
            $scope.occdatetime = new Date($scope.occurrences[i].duedate)
            $scope.occdatetime.setHours($scope.occurrences[i].duehour)

            var countdown = Math.abs($scope.currentdate - $scope.occdatetime);
            var countdownday = parseInt(((countdown / 1000 / 3600) / 24));
            var countdownhour = parseInt(((countdown / 1000 / 3600)));
            var countdownminute = parseInt(((countdown / 1000 / 3600) * 60));

            if (countdownminute > 1440) {
                $scope.occurrences[i].countdown = countdownday + "d " + (countdownhour - countdownday * 24) + "h ";
            } else {
                if (countdownminute > 59)
                    $scope.occurrences[i].countdown = countdownhour + "h " + (countdownminute - countdownhour * 60) + "m ";
                else
                    $scope.occurrences[i].countdown = (countdownminute - countdownhour * 60) + "m ";
            }

            if ($scope.currentdate <= $scope.occdatetime)
                $scope.occurrences[i].countdowncol = false;
            else
                $scope.occurrences[i].countdowncol = true;

        } else {

            $scope.occurrences[i].countdown = " ";

        }

    }

}



ComplexMarkerMapCtrl.$inject = ['$scope', '$http', '$routeParams', '$location', 'leafletData', 'sharedCommsService', 'socket', '$timeout', '$window', 'CurrKpiValues', 'Occurrences', 'LatestKpiValues', 'StoreOlapInfo', 'Profile'];

function ComplexMarkerMapCtrl($scope, $http, $routeParams, $location, leafletData, sharedCommsService, socket, $timeout, $window, CurrKpiValues, Occurrences, LatestKpiValues, StoreOlapInfo, Profile) {
    console.log('ComplexMarkerMapCtrl');

    $scope.loading = false;
    $scope.occLoading = false;

    $scope.$on('$locationChangeSuccess', function(event) {
        if ($location.path().indexOf('/map') >= 0)
            $scope.loading = true

        if ($location.path().indexOf('/occurrences') >= 0)
            $scope.occLoading = true
    })


    $scope.pid = $routeParams.pid;
    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.widgets = [];
    $scope.numOfPoints = 0;

    $scope.userProfile = Profile.userprofile;
    console.log(Profile.userprofile);

    $scope.complexmarkers = new Array();

    $scope.hoveredGeometry = "";

    angular.extend($scope, {
        madeira: {
            zoom: 6
        },
        london: {
            lat: 51.505,
            lng: -0.09,
            zoom: 4
        },
        events: {},
        layers: {
            baselayers: {
                osm: {
                    name: 'OpenStreetMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                cycle: {
                    name: 'OpenCycleMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                    layerOptions: {
                        attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                },
                google: {
                    name: 'Google Satellite',
                    layerType: 'SATELLITE',
                    type: 'google'
                }
            },
            overlays: {}

        }
    });


    // console.log("open modal");
    // $('#myModalDeleteIcon').modal({show:true});

    $http.get('/api/getProjectCenter/' + $scope.pid).
    success(function(data) {
        // // console.log("yeah getProjectCenter");
        // $location.path('/projects');
        // // // console.log(data);
        // console.log('data.numOfPoints');
        // console.log(data.numOfPoints.count);
        $scope.numOfPoints = data.numOfPoints.count; // NUNOOOO will be useful in the future

        if ($scope.complexmarkers.length == 0) {
            if (data.x != '' && data.x != undefined && data.x != null) {
                $scope.madeira.lat = data.x;
                $scope.madeira.lng = data.y;
                $scope.madeira.zoom = 10;
            } else {
                $scope.madeira.lat = 39.666667;
                $scope.madeira.lng = -8.133333;
                $scope.madeira.zoom = 6;
            }
        }

    }).
    error(function(data, status, headers, config) {
        // // console.log("error getProjectCenter");
        angular.extend($scope, {
            madeira: {
                lat: 39.666667,
                lng: -8.133333,
                zoom: 6
            }
        });
    });


    var getRule = function(occcfg, occcfgid) {
        var toRet = {};
        if (occcfg.hasOwnProperty("repetitionBox") && occcfg.repetitionBox == true) {
            toRet.repetitions = occcfg.repvalue;
        } else {
            toRet.repetitions = 0;
        }
        toRet.rule = occcfg.rule;
        toRet.value = occcfg.value;

        if (occcfg.hasOwnProperty("objBox") && occcfg.objBox == true) {
            toRet.percentage = true;
        } else {
            toRet.percentage = false;
        }

        toRet.occcfgid = occcfgid;

        return toRet;
    }


    var processOccurrenceConfigs = function(rawOccCfgs) {
        console.log(rawOccCfgs);

        var toReturn = {};

        toReturn["hourly"] = {};
        toReturn["daily"] = {};

        // NUNOALEX: lets focus only on percentage, hourly RULES (dynamic for widget titles and store pointkeys)

        for (var i = 0; i < rawOccCfgs.length; i++) {
            var occcfg = rawOccCfgs[i].config;
            var occcfgid = rawOccCfgs[i].occcfgid;

            if (occcfg.hasOwnProperty('objBox') && occcfg.objBox == true) {
                if (occcfg.hasOwnProperty('hourlyBox') && occcfg.hourlyBox == true) {
                    var widgetTitle = occcfg.widgetBox.title;
                    toReturn["hourly"][widgetTitle] = {};

                    for (var pointkey in occcfg.storeBox) {
                        if (occcfg.storeBox.hasOwnProperty(pointkey) && occcfg.storeBox[pointkey] == true) {
                            var obje = toReturn["hourly"][widgetTitle];

                            if (!obje.hasOwnProperty(pointkey)) {
                                toReturn["hourly"][widgetTitle][pointkey] = new Array();
                            }

                            toReturn["hourly"][widgetTitle][pointkey].push(getRule(occcfg, occcfgid));
                        }
                    }


                }
            }
        }

        return toReturn;
    }


    $scope.customIconsCfg = new Array();

    $scope.getCustomIconsCtr = 0;
    $scope.currCustomMarkers = new Array();

    function getCustomIcons($scope) {
        console.log("READING CUSTOM ICONS AGAIN");


        var get_url2 = '/api/getCustomIcons/' + $scope.pid;
        $http.get(get_url2).
        success(function(data2, status2) {
            console.log("got customIcons");
            console.log(data2);

            $scope.project = data2.project;

            if ($location.absUrl().indexOf('/map/') < 0) {
                console.log("Im dropping this getCustomicons because im not on waroom!!!");
                return;
            }

            $scope.customIconsCfg = data2.customMarkerCfg;

            $scope.occurrenceconfigs = processOccurrenceConfigs(data2.occurrenceconfigs);


            var regularMarkers = true;
            var iconsOffset = 0;
            var radiusOffset = 0;


            var outside = false;
            var radiusOutside = 0;

            var hexagonPin = false;


            var get_url = '/geoapi/' + $scope.pid;
            $http.get(get_url).
            success(function(data, status) {

                leafletData.getMap().then(function(map) {

                    var allReadsCount = LatestKpiValues.allReadsCount;
                    console.log(allReadsCount);


                    // // uncomment below to avoid redrawing the icons when no new data exists
                    // // we need to also see if there are new rules, so
                    // // dont pass if # reads is the same as before AND
                    // // # rules is the same as before

                    if (allReadsCount == $scope.allReadsCount) {
                        console.log("No new reads since last read...");

                        if ($location.absUrl().indexOf('/weekly') < 0) {
                            console.log("im still on daily,  not changing the icons but keeping the timeout");
                            setTimeout(callGetCustomIcons, getCustomIconsTtl);
                            $scope.getCustomIconsCtr++;
                        }
                        return;
                    }

                    $scope.allReadsCount = allReadsCount;

                    $scope.complexmarkers = new Array();
                    for (var im = 0; im < $scope.currCustomMarkers.length; im++) {
                        var delMarker = $scope.currCustomMarkers[im];
                        map.removeLayer(delMarker);
                    }

                    // if($scope.getCustomIconsCtr == 1){
                    //   console.log("STOPPING THE READINNNNGNGNGNGN");
                    //   return;
                    // }
                    console.log("\ndata");
                    console.log(data);

                    for (var d in data) {


                        if (regularMarkers == true) {
                            $scope.complexmarkers.push({
                                lat: data[d].x,
                                lng: data[d].y,
                                pointid: data[d].pointid,
                                // layer: attrType,
                                message: buildMessage(data[d], false),
                                icon: {
                                    type: 'awesomeMarker',
                                    // icon: 'crosshairs',
                                    icon: 'circle',
                                    prefix: 'fa',
                                    markerColor: 'blue',
                                    // spin: true,
                                    opacity: 0
                                }
                            });

                        } else {

                            if (!hexagonPin) {
                                var icon = L.icon({
                                    // iconUrl: 'img/custommarkers/hexagonmarker.png',
                                    // iconUrl: 'img/custommarkers/hexagonmarker-square.png',
                                    // iconUrl: 'img/custommarkers/hexagonmarker-square2.png',
                                    // iconUrl: 'img/custommarkers/hexagonmarker-round.png',
                                    // iconUrl: 'img/custommarkers/hexagonmarker-round-fill.png',
                                    // iconUrl: 'img/custommarkers/hexagonmarker-round-fill2.png',
                                    // iconUrl: 'img/custommarkers/hexagonmarker-round-fill3.png',
                                    // iconUrl: 'img/custommarkers/hexagonmarker-round-fill3-opacity50.png',
                                    iconUrl: 'img/custommarkers/hexagonmarker-rotate.png',
                                    // iconUrl: 'img/custommarkers/hexagonmarker-rotate2.png',
                                    // shadowUrl: 'leaf-shadow.png',

                                    iconSize: [155, 155], // size of the icon
                                    shadowSize: [0, 0], // size of the shadow
                                    iconAnchor: [77.5, 77.5], // point of the icon which will correspond to marker's location
                                    // iconAnchor:   [-15, 55], // point of the icon which will correspond to marker's location
                                    shadowAnchor: [0, 0], // the same for the shadow
                                    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
                                });

                            } else {
                                var icon = L.icon({
                                    // iconUrl: 'img/custommarkers/hexagonpinmarker.png',
                                    iconUrl: 'img/custommarkers/hexagonpinmarker-opacity50.png',
                                    // shadowUrl: 'leaf-shadow.png',

                                    iconSize: [155, 200], // size of the icon
                                    shadowSize: [0, 0], // size of the shadow
                                    iconAnchor: [77.5, 198], // point of the icon which will correspond to marker's location
                                    // iconAnchor:   [-15, 55], // point of the icon which will correspond to marker's location
                                    shadowAnchor: [0, 0], // the same for the shadow
                                    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
                                });
                            }



                            L.marker([data[d].x, data[d].y], {
                                icon: icon
                            }).addTo(map);

                            iconsOffset = -20;
                            radiusOffset = 10;

                            if (outside) {
                                radiusOutside = 33;
                            }

                            if (icon.options.iconUrl == 'img/custommarkers/hexagonmarker-rotate.png') {
                                radiusOutside = 22;
                            }

                            if (icon.options.iconUrl == 'img/custommarkers/hexagonmarker-rotate2.png') {
                                radiusOffset = 5;
                            }

                            if (icon.options.iconUrl == 'img/custommarkers/hexagonpinmarker.png' ||
                                icon.options.iconUrl == 'img/custommarkers/hexagonpinmarker-opacity50.png') {
                                console.log("hexagonpin");
                                iconsOffset = 100;
                                radiusOffset = 3;
                                // radiusOffset = 10;
                            }


                        }

                        var allPointsKpissValues = CurrKpiValues;

                        var valuesObj = allPointsKpissValues[data[d].pointid]; // tinha de ir buscar a um allPointsKpissValues[pointid]

                        if ($scope.customIconsCfg.length + 1 == 7) {
                            radiusOffset = 5;
                        }

                        placeCustomIcon($scope.customIconsCfg, data[d], valuesObj, map, radiusOffset, radiusOutside, iconsOffset, $scope.occurrenceconfigs);

                        placeIconHoN($scope.customIconsCfg, data[d], map, radiusOffset, radiusOutside, iconsOffset);
                    }

                    clearTimeout($scope.currRefreshTimeout);
                    if ($location.absUrl().indexOf('/weekly') < 0) {
                        $scope.currRefreshTimeout = setTimeout(callGetCustomIcons, getCustomIconsTtl);
                        $scope.getCustomIconsCtr++;
                    }

                });

            }).
            error(function(data, status) {
                $scope.data = data || "Request failed";
            });



        }).
        error(function(data2, status2) {
            $scope.data = data2 || "Request failed";
        });
    }

    var callGetCustomIcons = function() {
        console.log("calling get custom icons");
        getCustomIcons($scope);
    }


    $scope.callGetCustomIconsForce = function() {
        // should remove the setTimeout
        clearTimeout($scope.currRefreshTimeout);
        callGetCustomIcons();
    }



    var queryHoN = '/questions';
    queryHoN = '/questions/9681/surveys';
    var finalUrl = 'https://api.happy-or-not.com/v1' + queryHoN;
    console.log(finalUrl);

    $http.get(finalUrl, {
        headers: {
            "Content-Type": "application/json",
            "X-HON-Client-Id": "MV8xODI4X01uNDY3M0c2",
            "X-HON-API-Token": "MV8xODI4X0pWNUYxMTBFMTE2eVRuRXRCM1duUDBh"
        }
    }).
    success(function(data) {
        console.log(">> read HoN data");
        console.log(data);

        for (var i = 0; i < data.data.length; i++) {
            processAndGetData(data.data[i].key, data.data[i].folder.name);
        }
    }).
    error(function(data, status) {
        console.log(">> ERROR reading HoN data");
        $scope.data = data || "Request failed";
        $scope.readDateHoN = new Date();
        getCustomIcons($scope);
    });



    function processAndGetData(key, name) {
        var theKey = key;
        var theName = name;
        console.log(theKey);


        var queryHoN = "/surveys/" + theKey + "/results";
        var subqueryHoN = '';
        var finalUrl = 'https://api.happy-or-not.com/v1' + queryHoN + subqueryHoN;

        $http.get(finalUrl, {
            headers: {
                "Content-Type": "application/json",
                "X-HON-Client-Id": "MV8xODI4X01uNDY3M0c2",
                "X-HON-API-Token": "MV8xODI4X0pWNUYxMTBFMTE2eVRuRXRCM1duUDBh"
            }
        }).
        success(function(data) {
            console.log("2>>>>>> read HoN data for " + isOnHoN(theName));
            console.log(data[data.length - 1]);
            // if(isOnHoN(theName))
            //   console.log($scope.dataHoN[isOnHoN(theName)]);

            if (isOnHoN(theName) != 0) {

                var rawtimestamp = data[data.length - 1].ts;
                var rawdata = data[data.length - 1].data;
                var rawlevels = ['verynegative', 'negative', 'positive', 'verypositive'];
                var theData = [];
                for (var j = 0; j < 4; j++) {
                    theData.push({
                        "value": rawdata[j],
                        "level": rawlevels[j]
                    });
                }

                $scope.dataHoN[isOnHoN(theName)] = {
                    "data": theData,
                    "name": theName,
                    "ts": rawtimestamp
                };
                $scope.countHoNdata++;

                if ($scope.countHoNdata == 2) {
                    console.log("DATA:");
                    console.log($scope.dataHoN[1]);
                    console.log($scope.dataHoN[2]);
                    $scope.readDateHoN = new Date();
                    getCustomIcons($scope);
                }
            }
        }).
        error(function(data, status) {
            console.log("2>>>>> ERROR reading HoN data");
            $scope.data = data || "Request failed";
            $scope.readDateHoN = new Date();
            getCustomIcons($scope);
        });
        $scope.applyFilter(true);
    }


    $scope.dataHoN = [];
    $scope.countHoNdata = 0;

    // dataHoN[1] = {"verypositive":15, "positive": 4, "negative":2, "verynegative": 6};
    // dataHoN[2] = {"verypositive":5, "positive": 0, "negative":0, "verynegative": 1};

    $scope.dataHoN[1] = {
        "data": [15, 4, 2, 6],
        name: "Moja Apteka Chełm Lwowska",
        ts: "2015-03-04T00:00:00.000+01:00"
    };
    $scope.dataHoN[2] = {
        "data": [5, 0, 0, 1],
        name: "Moja Apteka Lublin",
        ts: "2015-03-04T00:00:00.000+01:00"
    };

    // dataHoN[1] = {"verypositive":15, "positive": 4, "negative":2, "verynegative": 6};
    // dataHoN[2] = {"verypositive":5, "positive": 0, "negative":0, "verynegative": 1};

    function isOnHoN(name) {
        if (name.indexOf("Lwowska") > -1 || name.indexOf("lwowska") > -1)
            return 1;
        else if (name.indexOf("Lublin") > -1 || name.indexOf("lublin") > -1)
            return 2;
        else
            return 0;
    }

    $scope.exampleDataHoN = [{
        "key": "Series 1",
        "values": [
            [1025409600000, 0],
            [1028088000000, -6.3382185140371],
            [1030766400000, -5.9507873460847],
            [1033358400000, -11.569146943813],
            [1036040400000, -5.4767332317425],
            [1038632400000, 0.50794682203014],
            [1041310800000, -5.5310285460542],
            [1043989200000, -5.7838296963382],
            [1046408400000, -7.3249341615649],
            [1049086800000, -6.7078630712489],
            [1051675200000, 0.44227126150934],
            [1054353600000, 7.2481659343222],
            [1056945600000, 9.2512381306992]
        ]
    }, {
        "key": "Series 2",
        "values": [
            [1025409600000, 0],
            [1028088000000, 0],
            [1030766400000, 0],
            [1033358400000, 0],
            [1036040400000, 0],
            [1038632400000, 0],
            [1041310800000, 0],
            [1043989200000, 0],
            [1046408400000, 0],
            [1049086800000, 0],
            [1051675200000, 0],
            [1054353600000, 0],
            [1056945600000, 0],
            [1059624000000, 0],
            [1062302400000, 0],
            [1064894400000, 0],
            [1067576400000, 0],
            [1070168400000, 0],
            [1072846800000, 0],
            [1075525200000, -0.049184266875945]
        ]
    }, {
        "key": "Series 3",
        "values": [
            [1025409600000, 0],
            [1028088000000, -6.3382185140371],
            [1030766400000, -5.9507873460847],
            [1033358400000, -11.569146943813],
            [1036040400000, -5.4767332317425],
            [1038632400000, 0.50794682203014],
            [1041310800000, -5.5310285460542],
            [1043989200000, -5.7838296963382],
            [1046408400000, -7.3249341615649],
            [1049086800000, -6.7078630712489],
            [1051675200000, 0.44227126150934],
            [1054353600000, 7.2481659343222],
            [1056945600000, 9.2512381306992]
        ]
    }, {
        "key": "Series 4",
        "values": [
            [1025409600000, -7.0674410638835],
            [1028088000000, -14.663359292964],
            [1030766400000, -14.104393060540],
            [1033358400000, -23.114477037218],
            [1036040400000, -16.774256687841],
            [1038632400000, -11.902028464000],
            [1041310800000, -16.883038668422],
            [1043989200000, -19.104223676831],
            [1046408400000, -20.420523282736],
            [1049086800000, -19.660555051587],
            [1051675200000, -13.106911231646],
            [1054353600000, -8.2448460302143],
            [1056945600000, -7.0313058730976]
        ]
    }];



    socket.on('update:warroom', function(u) {
        console.log("we have a notif");

        // $scope.genNotif(u.notif);
        // callGetCustomIcons();

    });


    var hasOccurrence = function(arr, occ) {
        for (var i = 0; i < arr.length; i++) {
            var aux = arr[i];
            if (aux.occid == occ.occid) {
                return true;
            }
        }
        return false;
    }


    var clearNewOccurrencesFunction = function() {
        console.log("\n\nclearNewOccurrencesFunction");
        for (var i = 0; i < $scope.occurrences.length; i++) {
            if ($scope.occurrences[i].hasOwnProperty('liveupdateclass') &&
                $scope.occurrences[i].liveupdateclass == 'liveupdate') {
                $scope.occurrences[i].liveupdateclass = '';
            }
        }
        $scope.$apply();
        console.log("done");
    }


    socket.on('new_occurrence_triggered', function(u) {
        console.log("REFRESH OCCURRENCES");

        $http.get('/api/occurrences/' + $scope.pid + "/0")
            .success(function(response, status) {
                console.log("occurrences response.data");
                console.log(response.occurrences);

                var clearNewOccurrences = false;

                for (var i = 0; i < response.occurrences.length; i++) {

                    if ($scope.currOccurrence.occid == undefined ||
                        ($scope.currOccurrence.showTasks == true && $scope.currOccurrence.occid != response.occurrences[i].occid)) {
                        response.occurrences[i].statusMenu = false;
                        response.occurrences[i].showTasks = false;
                        response.occurrences[i].selectedClass = "";
                    } else {
                        console.log("one is selected");
                        response.occurrences[i].statusMenu = $scope.currOccurrence.statusMenu;
                        response.occurrences[i].showTasks = $scope.currOccurrence.showTasks;
                        response.occurrences[i].selectedClass = $scope.currOccurrence.selectedClass;

                        $scope.currOccurrence = response.occurrences[i];
                    }

                    if (!hasOccurrence($scope.occurrences, response.occurrences[i])) {
                        response.occurrences[i].liveupdateclass = 'liveupdate';
                        clearNewOccurrences = true;

                        // sharedCommsService.occurrence = response.occurrences[i];
                        // sharedCommsService.bufferAndBroadcast("generateNotification");
                        // socket.emit('send:generateNotification', response.occurrences[i]);
                    }
                }

                if (clearNewOccurrences) {
                    setTimeout(clearNewOccurrencesFunction, 15000);
                }

                $scope.occurrences = response.occurrences;

                // return response.data.occurrences;

                // var auxarr = new Array();

                // for(var i=0; i<response.occurrences.length; i++){
                //   var occ = response.occurrences[i];

                //   var found = false;

                //   for(var j=0; j<$scope.occurrences.length; j++){
                //     var auxocc = $scope.occurrences[j];

                //     if(auxocc.occid == occ.occid){
                //       found = true;
                //       break;
                //     }
                //   }

                //   if(!found){

                //   }
                // }

            }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

    });


    var index = 0;
    $scope.notifications = {};
    $scope.notificationsTtl = 30000;
    var getCustomIconsTtl = 10000;
    $scope.shownOccurrences = {};


    $scope.genNotif = function(notif) {
        if (notif == null) {
            var i = index++;
            $scope.notifications[i] = {};
            $scope.notifications[i].message = "oh yeah " + new Date();
            $scope.notifications[i].icon = 'img/custommarkers/nok.png';
            // console.log(message);
        } else {
            console.log("GOOOOOOT NOTIF!");
            console.log(notif);

            var i = index++;
            $scope.notifications[i] = {};
            $scope.notifications[i].message = notif.widgetname + " is " + notif.rule + " " + notif.value + "% of the objective!";

            if (notif.repetitions > 0) {
                $scope.notifications[i].messagerepetition = notif.repetitions + " times in a row";
            }

            $scope.notifications[i].icon = notif.icon;
            $scope.notifications[i].repetitions = notif.repetitions;
            $scope.notifications[i].store = notif.storename;
            $scope.notifications[i].readvalue = parseFloat(notif.readvalue).toFixed(1);
            $scope.notifications[i].hour = notif.hour;
            $scope.notifications[i].unit = notif.unit;



        }
    }

    $scope.range = function(notif) {
        return new Array(notif.repetitions);
    };


    var translateDataPointName = function(attributes) {
        if (attributes.hasOwnProperty('Name'))
            return attributes.Name;
        else if (attributes.hasOwnProperty('name'))
            return attributes.name;
        else
            return 'N/A';
    }

    var placeIconHoN = function(customMarkerCfg, data, map, radiusOffset, radiusOutside, iconsOffset) {
        var posHoN = isOnHoN(translateDataPointName(data.attributes));
        if (posHoN) {
            // console.log(posHoN + " " + data.attributes.Name);
            var plots = customMarkerCfg.length + 1;
            var posLatLng = getCustomMarkerPosition(data.x, data.y, plots, 0, radiusOffset, radiusOutside, iconsOffset, 'HoN');

            var mostFrequentObj = getIconHappiness($scope.dataHoN[posHoN].data);
            var iconImg = mostFrequentObj.img;

            // var averageFrequency = getIconHappinessAverage($scope.dataHoN[posHoN].data);
            // var iconImg = averageFrequency.img;

            var icon = L.icon({
                iconUrl: iconImg,
                // shadowUrl: 'leaf-shadow.png',

                iconSize: [31, 31], // size of the icon
                shadowSize: [0, 0], // size of the shadow
                iconAnchor: [posLatLng.x, posLatLng.y], // point of the icon which will correspond to marker's location
                // iconAnchor:   [-15, 55], // point of the icon which will correspond to marker's location
                shadowAnchor: [0, 0], // the same for the shadow
                popupAnchor: [-posLatLng.x + 15, -posLatLng.y] // point from which the popup should open relative to the iconAnchor
            });


            // var popupDom = "<b>Happiness on "+data.attributes.Name+"</b>";
            // popupDom += "<hr>";
            // popupDom += "<p>"+dataHoN[posHoN].verypositive+"</p>";
            // popupDom += "<p>"+dataHoN[posHoN].positive+"</p>";
            // popupDom += "<p>"+dataHoN[posHoN].negative+"</p>";
            // popupDom += "<p>"+dataHoN[posHoN].verynegative+"</p>";
            // // popupDom += '<nvd3-discrete-bar-chart'+
            // //     ' data="exampleDataHoN"'+
            // //     ' id="exampleId234"'+
            // //     ' showXAxis="true"'+
            // //     ' showYAxis="true"'+
            // //     ' xAxisTickFormat="xAxisTickFormatFunction()"'+
            // //     ' width="550"'+
            // //     ' height="400">'+
            // //       '<svg></svg>'+
            // //   '</nvd3-discrete-bar-chart>';

            // popupDom += "<hr>";
            // popupDom += "<div id='frequencyChart'></div>";



            // var marker = L.marker([data.x, data.y], {icon: icon});
            // marker.bindPopup(popupDom);
            // marker.addTo(map);


            var div = $('<div id="chartid" class="chart" style="width: 200px; height:150px;"></div>')[0];

            var dataHoN = $scope.dataHoN[posHoN].data;
            var dataHoNtheName = $scope.dataHoN[posHoN].name;
            var dataHoNts = new Date($scope.dataHoN[posHoN].ts);

            // var x = d3.scale.linear()
            //     .domain([0, d3.max(dataHoN)])
            //     .range([0, 200]);
            var x = d3.scale.linear()
                .domain([0, d3.max(dataHoN, function(d) {
                    return d.value;
                })])
                .range([0, 200]);


            // d3.select(div)
            //   .selectAll("#chartid")
            //     .data(dataHoN)
            //   .enter().append("div")
            //     .style("width", function(d) { return x(d) + "px"; })
            //     .text(function(d) { return d; });

            var bar = d3.select(div)
                .selectAll("#chartid")
                .data(dataHoN)
                .enter().append("div")
                .attr("class", function(d) {
                    return d.level;
                })
                .style("width", function(d) {
                    return x(d.value) + "px";
                })
                .text(function(d) {
                    return d.value;
                });

            // bar.append("")

            // console.log("div");
            // console.log(div.outerHTML);

            console.log("get Customer Happiness Index");
            var valNPS = ((dataHoN[0].value * 0 + dataHoN[1].value * 0.33 + dataHoN[2].value * 0.66 + dataHoN[3].value * 1) / (dataHoN[0].value + dataHoN[1].value + dataHoN[2].value + dataHoN[3].value)) * 100;
            //console.log(valNPS);

            var popupDomStr = '<div class="row"><div class="col-md-12"><h4>Customer Happiness Index</h4>';
            //((mostFrequentObj.maxFrequency/mostFrequentObj.total)*100)
            popupDomStr += '<h2><img style="margin-top: -4px;" src="' + iconImg + '"/> ' + valNPS.toFixed(1) + '<small>%</small></h2>';

            var ts = $scope.dataHoN[posHoN].ts;
            var hourAdvance = parseInt(ts.substring(ts.indexOf('+') + 1, ts.indexOf('+') + 3));
            var theDate2 = new Date($scope.dataHoN[posHoN].ts);
            theDate2.setHours(theDate2.getHours() + hourAdvance);

            var dd = theDate2.getDate();
            var mm = theDate2.getMonth() + 1; //January is 0!
            var yyyy = theDate2.getFullYear();

            if (dd < 10) {
                dd = '0' + dd
            }

            if (mm < 10) {
                mm = '0' + mm
            }

            var endDate = dd + "/" + mm + "/" + yyyy;

            popupDomStr += '<p style="font-style: italic;">Date: ' + endDate + '</p>';
            popupDomStr += '<h6>Store: ' + dataHoNtheName + '</h6>';
            popupDomStr += '<hr>';

            // popupDomStr += '<p style="font-style: italic;">Survey date: '+dataHoNts+'</p>'

            popupDomStr += '<h6>Distribution</h6>';
            popupDomStr += div.outerHTML;
            popupDomStr += '<p style="font-style: italic; color: grey;">Results read from Happy or Not API at ' + $scope.readDateHoN + '</p>';
            popupDomStr += '</div>';
            popupDomStr += '</div>';

            // console.log(popupDomStr);

            var popup = L.popup().setContent(popupDomStr);
            var marker = L.marker([data.x, data.y], {
                icon: icon
            });
            marker.bindPopup(popup);
            marker.addTo(map);

            $scope.currCustomMarkers.push(marker);

            // var svg = d3.select(div).select("svg").attr("width", 200).attr("height", 200);
            //     svg.append("rect").attr("width", 150).attr("height", 25).style("fill", "lightBlue");



            // body = d3.select('#frequencyChart')
            // svg = body.append('svg').attr('height', 600).attr('width', 200)
            // rect = svg.append('rect').transition().duration(500).attr('width', 150)
            //                 .attr('height', 100)
            //                 .attr('x', 40)
            //                 .attr('y', 100)
            //                 .style('fill', 'white')
            //                 .attr('stroke', 'black')
            // text = svg.append('text').text('This is some information about whatever')
            //                 .attr('x', 50)
            //                 .attr('y', 150)
            //                 .attr('fill', 'black')
        }

    }



    function getIconHappinessAverage(arr) {
        var sum = 0;
        var ctr = 0;

        for (var i in arr) {
            sum += arr[i].value;
            ctr++;
        }

        var avg = sum / ctr;


    }

    function getIconHappiness(arr) {
        var maxFrequency = 0;
        var maxLevel = '';
        var total = 0;
        for (var i in arr) {
            total += parseInt(arr[i].value);
            if (maxLevel == '' || arr[i].value > maxFrequency) {
                maxFrequency = arr[i].value;
                maxLevel = arr[i].level;
            }
        }
        // console.log(maxLevel);
        var toRet = {};
        toRet.img = getImageHappiness(maxLevel);
        toRet.maxFrequency = maxFrequency;
        toRet.total = total;
        return toRet;
    }

    function getImageHappiness(level) {
        if (level == 'verynegative')
            return "img/custommarkers/sad.png";
        else if (level == 'negative')
            return "img/custommarkers/nok.png";
        else if (level == 'positive')
            return "img/custommarkers/ok.png";
        else if (level == 'verypositive')
            return "img/custommarkers/happy.png";
        else
            return "img/custommarkers/notavailable.png";
    }


    function getMaxMin(type, buckets) {
        var min = undefined;
        var max = undefined;

        for (var i = 0; i < buckets.length; i++) {
            var elem = buckets[i];

            if (type == 'Intervals' || type == 'EmptyOrNot') {
                if (min == undefined || min > elem.bottomVal)
                    min = elem.bottomVal;
                if (max == undefined || max < elem.topVal)
                    max = elem.topVal;
            }
        }
        return {
            min: min,
            max: max
        };
    }


    // aux function
    function placeCustomIcon(customMarkerCfg, data, valuesObj, map, radiusOffset, radiusOutside, iconsOffset, occurrenceconfigs) {
        // console.log("\n\nANGLES");
        for (var i = 0; i < customMarkerCfg.length; i++) {
            var item = customMarkerCfg[i];
            var plots = customMarkerCfg.length + 1;
            // plots = 6; // fixed for now
            // plots = 7; // fixed for now to add new kpi
            var posLatLng = getCustomMarkerPosition(data.x, data.y, plots, item.position, radiusOffset, radiusOutside, iconsOffset, item.name);


            var max = 0;
            var min = 0;
            var val;
            // if(item.name == 'happiness'){
            //   max = 100;
            // } else
            if (item.type == 'AroundZero') {
                max = 10;
                min = -5;
                val = Math.round(Math.random() * max + min);
            } else if (item.type == 'EmptyOrNot') {
                max = 1;
                val = Math.round(Math.random() * max + min);
            } else {
                if (valuesObj != undefined && valuesObj.hasOwnProperty(item.name)) {
                    val = valuesObj[item.name]; // this will get the kpi (item.name) from value array
                } else {
                    var maxMin = getMaxMin(item.type, item.buckets);
                    max = maxMin.max;
                    min = maxMin.min;
                    val = Math.round(Math.random() * max + min);
                }
            }



            // forced realtime update
            // var latestVal = val;

            // console.log("LatestKpiValues");
            // console.log(LatestKpiValues);
            // console.log(LatestKpiValues[data.attributes.PointKey][0][item.name]);
            // console.log(LatestKpiValues[data.attributes.PointKey][0].Basket);


            var valArr;
            if (data.attributes.PointKey != undefined && LatestKpiValues[data.attributes.PointKey] != undefined) {
                if (LatestKpiValues[data.attributes.PointKey].length > 0) {
                    if (LatestKpiValues[data.attributes.PointKey][0][item.name] != undefined) {
                        // console.log("KPI title: "+item.name);
                        // console.log(LatestKpiValues[data.attributes.PointKey][0][item.name]);
                        valArr = LatestKpiValues[data.attributes.PointKey][0][item.name];
                        val = valArr[valArr.length - 1].value;
                    } else {
                        valArr = [];
                        val = 'NoValToday';
                    }
                } else {
                    valArr = [];
                    val = 'NoValToday';
                }
            } else {
                valArr = [];
                val = 'NoValToday';
            }
            //   val = LatestKpiValues[data.attributes.PointKey][0][item.name];



            // console.log("StoreOlapInfo");
            var showObjectivesLine = false;
            var storeInfo;
            if (StoreOlapInfo != undefined && StoreOlapInfo != null) {


                if (StoreOlapInfo[data.attributes.PointKey] != null) {
                    showObjectivesLine = true;

                    // console.log(StoreOlapInfo[data.attributes.PointKey]);
                    storeInfo = StoreOlapInfo[data.attributes.PointKey];
                }
            }
            // console.log(showObjectivesLine);



            if (item.name.indexOf("Basket") >= 0 || item.name.indexOf("Net Margin") >= 0 || item.name.indexOf("Net Sales") >= 0 || item.name.indexOf("Number of Customers") >= 0 || item.name.indexOf("Multiline Bills") >= 0 || item.name.indexOf("Stock Level") >= 0) {
                // NUNOALEX


                var div = $('<div id="chartid" class="chart" style="width: 500px; height:230px;"></div>')[0];

                // var dataBasket = item.data;
                var dataBasket = [];
                // dataBasket.push(valArr[0]);
                // dataBasket.push(valArr[1]);
                // dataBasket.push(valArr[2]);

                if (valArr != undefined) {
                    dataBasket = valArr;
                }

                // dataBasket = [];
                // dataBasket.push(valArr[0]);
                // dataBasket.push(valArr[1]);
                // dataBasket.push(valArr[2]);
                // dataBasket.push(valArr[3]);

                // dataBasket[1].value = dataBasket[0].value;

                // dataBasket.pop();
                // if(data.attributes.PointKey == "12"){
                //   dataBasket.pop();
                // }

                // // detect if between each date there should be a sunday
                // if(data.attributes.PointKey == "12"){
                //   console.log("1222");
                //   for(var i=0; i<dataBasket.length-1; i++){
                //     console.log(dataBasket[i].date + " VS " + dataBasket[i+1].date);

                //   }
                // }



                var itemunit = 'PLN';

                if (val != 'NoValToday') {
                    switch (item.name) {
                        case "Basket":
                            itemunit = 'PLN';
                            break;
                        case "Net Margin":
                            itemunit = '%';
                            break;
                        case "Net Sales":
                            itemunit = 'PLN';
                            break;
                        case "Number of Customers":
                            itemunit = 'customers';
                            break;
                        case "Multiline Bills":
                            itemunit = '%';
                            break;
                        default:
                            'units';
                    }
                }


                var dailyView = false;
                var storehours = 0;
                var obj = {};


                if (val == 'NoValToday') {

                } else {

                    var lastDate = new Date(dataBasket[dataBasket.length - 1].date);
                    // console.log(dataBasket[dataBasket.length-1]);

                    // console.log(today); // Sun Mar 15 2015 16:54:07 GMT+0100 (Hora de Verão de GMT)  e eram 15:54
                    var dd = lastDate.getDate();
                    var mm = lastDate.getMonth() + 1; //January is 0!
                    var yyyy = lastDate.getFullYear();

                    if (dd < 10) {
                        dd = '0' + dd
                    }

                    if (mm < 10) {
                        mm = '0' + mm
                    }

                    var d3timeformat = "%Hh";
                    var historyFrequencyStr = "hourly";
                    var theDate = dd + "/" + mm + "/" + yyyy + " " + (dataBasket[dataBasket.length - 1].hour) + ":00";
                    var legendDeviationY = "-4.5em";

                    if (dataBasket[0].hour == undefined) {
                        d3timeformat = "%a %d/%m";
                        historyFrequencyStr = "weekly";
                        theDate = dd + "/" + mm + "/" + yyyy;
                        var legendDeviationY = "-5em";
                    }

                    if (item.name.indexOf("Stock Level") >= 0) {
                        legendDeviationY = "-6em";
                    }

                    var simpleDate = dd + "/" + mm + "/" + yyyy;



                    var objectivesData = new Array();


                    // var format = d3.time.format("%Y-%m-%d");
                    var format = d3.time.format("%Y-%m-%d");

                    dataBasket.forEach(function(d) {
                        // if(showObjectivesLine){
                        //   console.log("showObjectivesLine");
                        // }
                        // d.date = parseDate(d.date);
                        if (d.hour == undefined) {
                            if (d.date instanceof Date)
                                d.date = new Date(d.date);
                            else
                                d.date = new Date(format.parse(d.date));
                        } else {
                            dailyView = true;
                            // d.date = new Date(d.date).setHours(d.hour);
                            if (typeof d.date == 'string') {
                                d.date = new Date(format.parse(d.date)).setHours(d.hour);
                                // d.date = format.parse(d.date);
                                d.date = new Date(d.date);
                            } else {
                                // its already a Date object
                                (d.date).setHours(d.hour);
                            }
                        }
                        d.value = +d.value;


                        if (showObjectivesLine && !dailyView) {
                            obj = {};
                            obj.date = d.date;


                            var dailyFactor;

                            var weekday = new Array(7);
                            weekday[0] = "Sunday";
                            weekday[1] = "Monday";
                            weekday[2] = "Tuesday";
                            weekday[3] = "Wednesday";
                            weekday[4] = "Thursday";
                            weekday[5] = "Friday";
                            weekday[6] = "Saturday";

                            var weekday = weekday[obj.date.getDay()];

                            $scope.calcCellPos = function(m, kpi) {
                                // console.log("calcCellPos for "+str);
                                // console.log("result is "+str.replace(/\s/g, "") + "\n");
                                var str = m + "__" + kpi;
                                return str.replace(/\s/g, "_");
                            }
                            dailyFactor = storeInfo.weeklyfactors[$scope.calcCellPos(weekday, item.name)];


                            var monthlyObjective;

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
                            var month = monthArr[obj.date.getMonth()];


                            monthlyObjective = storeInfo.cells[$scope.calcCellPos(month, item.name)];

                            if (item.name.indexOf("Basket") >= 0 || item.name.indexOf("Net Margin") >= 0 || item.name.indexOf("Multiline Bills") >= 0) {
                                if (monthlyObjective != undefined && monthlyObjective != null) {
                                    // console.log("JUST PLACE THE VALUE "+monthlyObjective);
                                    obj.value = +monthlyObjective;
                                    objectivesData.push(obj);
                                }


                            } else {
                                if (monthlyObjective != undefined && monthlyObjective != null && dailyFactor != undefined && dailyFactor != null) {
                                    obj.value = (monthlyObjective / 4.28 / storeInfo.weekndays) * (dailyFactor); // 4.28 by dividing 30 days per 7 days giving 4.28 weeks per month



                                    if (d.hour != undefined) {
                                        // this is daily view


                                        // console.log(d.hour);
                                        var hourlyFactor;
                                        // hourlyFactor = storeInfo.dailyfactors[parseInt(d.hour)];
                                        hourlyFactor = storeInfo.dailyfactors[$scope.calcCellPos(parseInt(d.hour), item.name)];

                                        if (hourlyFactor != undefined && hourlyFactor != null) {
                                            var accumulated = 0;
                                            if (objectivesData.length > 0)
                                                accumulated = objectivesData[objectivesData.length - 1].value;
                                            // console.log(accumulated+" accumulated");
                                            obj.value = (obj.value / storeInfo.daynhours * hourlyFactor) + accumulated;
                                            storehours = storeInfo.daynhours;
                                        }
                                    }

                                    objectivesData.push(obj);
                                    // console.log("-------- pishing");
                                }
                            }


                        }

                    });



                    if (showObjectivesLine && dailyView) {


                        var auxDate = new Date(dataBasket[0].date);

                        // console.log("AUX DATE: " + auxDate + " " + auxDate.getDay());

                        var storehours = storeInfo.daynhours;
                        if (auxDate.getDay() == 6 && storeInfo.saturdaynhours != null && storeInfo.saturdaynhours != undefined)
                            storehours = storeInfo.saturdaynhours;
                        if (auxDate.getDay() == 0 && storeInfo.sundaynhours != null && storeInfo.sundaynhours != undefined)
                            storehours = storeInfo.sundaynhours;

                        while (storehours >= 0) {

                            obj = {};
                            obj.date = new Date(auxDate);

                            var dailyFactor;

                            var weekday = new Array(7);
                            weekday[0] = "Sunday";
                            weekday[1] = "Monday";
                            weekday[2] = "Tuesday";
                            weekday[3] = "Wednesday";
                            weekday[4] = "Thursday";
                            weekday[5] = "Friday";
                            weekday[6] = "Saturday";

                            var weekday = weekday[obj.date.getDay()];

                            $scope.calcCellPos = function(m, kpi) {
                                // console.log("calcCellPos for "+str);
                                // console.log("result is "+str.replace(/\s/g, "") + "\n");
                                var str = m + "__" + kpi;
                                return str.replace(/\s/g, "_");
                            }
                            dailyFactor = storeInfo.weeklyfactors[$scope.calcCellPos(weekday, item.name)];


                            var monthlyObjective;

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
                            var month = monthArr[obj.date.getMonth()];


                            monthlyObjective = storeInfo.cells[$scope.calcCellPos(month, item.name)];

                            if (item.name.indexOf("Basket") >= 0 || item.name.indexOf("Net Margin") >= 0 || item.name.indexOf("Multiline Bills") >= 0) {
                                if (monthlyObjective != undefined && monthlyObjective != null) {
                                    // console.log("JUST PLACE THE VALUE "+monthlyObjective);
                                    obj.value = +monthlyObjective;
                                    objectivesData.push(obj);
                                }


                            } else {
                                if (monthlyObjective != undefined && monthlyObjective != null && dailyFactor != undefined && dailyFactor != null) {
                                    obj.value = (monthlyObjective / 4.28 / storeInfo.weekndays) * (dailyFactor); // 4.28 by dividing 30 days per 7 days giving 4.28 weeks per month



                                    if (dailyView) {
                                        // this is daily view


                                        // console.log(d.hour);
                                        var hourlyFactor;
                                        // hourlyFactor = storeInfo.dailyfactors[parseInt(d.hour)];
                                        hourlyFactor = storeInfo.dailyfactors[$scope.calcCellPos(parseInt(auxDate.getHours()), item.name)];

                                        if (hourlyFactor != undefined && hourlyFactor != null) {
                                            var accumulated = 0;
                                            if (objectivesData.length > 0)
                                                accumulated = objectivesData[objectivesData.length - 1].value;
                                            // console.log(accumulated+" accumulated");
                                            obj.value = (obj.value / storeInfo.daynhours * hourlyFactor) + accumulated;
                                            // storehours = storeInfo.daynhours;
                                        }
                                    }

                                    objectivesData.push(obj);
                                    // console.log("-------- adding");
                                }
                            }



                            auxDate.setHours(auxDate.getHours() + 1);
                            storehours--;
                        }



                    }


                    // if(dailyView && showObjectivesLine){
                    //   var objectiveHoursLeft = storehours - objectivesData.length;
                    //   console.log("WE HAVE "+objectiveHoursLeft+" LEFT -- last hour "+obj.date + " kpi " + item.name);


                    //   while(objectiveHoursLeft > 0){
                    //     obj.date.setHours(obj.date.getHours()+1);

                    //     // objectivesData.push(obj);

                    //     objectiveHoursLeft--;
                    //   }

                    // }


                    var dataBasketDashed = new Array();
                    var dataBasketSliced = new Array();

                    if (!dailyView && dataBasket != null && dataBasket != undefined && dataBasket.length > 1) {
                        console.log("\nTHIS IS WEEKLY VIEW");

                        dataBasketSliced = dataBasket.slice(0);

                        dataBasketDashed.push(dataBasket[dataBasket.length - 2]);
                        dataBasketDashed.push(dataBasketSliced.pop());

                        // console.log(dataBasketDashed);
                        // console.log(dataBasketSliced);
                    }



                    // should be the historic values array via RESOLVE

                    // var x = d3.scale.linear()
                    //     .domain([0, d3.max(dataBasket, function(d){ return d.value; })])
                    //     .range([0, 200]);


                    // var bar = d3.select(div)
                    //   .selectAll("#chartid")
                    //     .data(dataBasket)
                    //   .enter().append("div")
                    //     .attr("class", function(d) { return d.level; })
                    //     .style("width", function(d) { return x(d.value) + "px"; })
                    //     .text(function(d) { return d.value; });

                    // var margin = {top: 20, right: 30, bottom: 40, left: 60},
                    //   width = 470 - margin.left - margin.right,
                    //   height = 190 - margin.top - margin.bottom;


                    var margin = {
                            top: 40,
                            right: 30,
                            bottom: 40,
                            left: 70
                        },
                        width = 470 - margin.left - margin.right,
                        height = 240 - margin.top - margin.bottom;

                    var bisectDate = d3.bisector(function(d) {
                        return d.date;
                    }).left;

                    var x = d3.time.scale()
                        .range([0, width]);

                    var y = d3.scale.linear()
                        .range([height, 0]);


                    var nTicks = dataBasket.length - 1;
                    if (dataBasket.length == 1)
                        nTicks = 1;

                    if (objectivesData.length > dataBasket.length) {
                        nTicks = objectivesData.length - 1;
                        if (objectivesData.length == 1)
                            nTicks = 1;
                    }

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom")
                        // .ticks(5)
                        .ticks(nTicks)
                        .tickFormat(d3.time.format(d3timeformat));
                    // .tickFormat(d3.time.format("%a\n%d/%m %H:00"));

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left");

                    var parseDate = d3.time.format("%Y").parse;

                    var line = d3.svg.line()
                        .x(function(d) {
                            return x(d.date);
                        })
                        .y(function(d) {
                            return y(d.value);
                        });

                    var linechart = d3.select(div).append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    var linechartSvg = linechart.append("g");

                    var focus = linechart.append("g")
                        .style("display", "none");


                    // var minValueY = d3.min(dataBasket, function(d) { return d.value; });
                    var maxValueY = d3.max(dataBasket, function(d) {
                        return d.value;
                    });
                    var minValueY = d3.min(dataBasket, function(d) {
                        return d.value;
                    });
                    if (showObjectivesLine) {
                        maxValueY = d3.max(dataBasket.concat(objectivesData), function(d) {
                            return d.value;
                        });
                        minValueY = d3.min(dataBasket.concat(objectivesData), function(d) {
                            return d.value;
                        });
                    }

                    if (minValueY > 0)
                        minValueY = 0;

                    x.domain(d3.extent(dataBasket.concat(objectivesData), function(d) {
                        return d.date;
                    }));
                    y.domain([minValueY, maxValueY]);


                    linechart.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    linechart.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", legendDeviationY)
                        .style("text-anchor", "end")
                        .text(function() {
                            if (item.name == "Number of Customers")
                                return item.name;
                            else
                                return (item.name + " (" + itemunit + ")");
                        });



                    if (!dailyView && dataBasket.length > 1) {
                        linechartSvg.append("svg:rect")
                            .attr("x", 2 * width / 3 + 20)
                            .attr("y", -30)
                            .attr("stroke", "steelblue")
                            .attr("height", 1)
                            .attr("width", 17);

                        for (var n = 0; n < 3; n++) {
                            linechartSvg.append("svg:rect")
                                .attr("x", 2 * width / 3 + 38 + n * (9))
                                .attr("y", -30)
                                .attr("stroke", "steelblue")
                                .attr("height", 1)
                                .attr("width", 4);
                        }
                    } else {
                        linechartSvg.append("svg:rect")
                            .attr("x", 2 * width / 3 + 20)
                            .attr("y", -30)
                            .attr("stroke", "steelblue")
                            .attr("height", 1)
                            .attr("width", 40);
                    }

                    linechartSvg.append("svg:text")
                        .attr("x", 70 + 2 * width / 3)
                        .attr("y", -26)
                        .text("Real Value");


                    if (showObjectivesLine && item.name != "Multiline Bills" && item.name != "Stock Level") {

                        for (var n = 0; n < 5; n++) {
                            linechartSvg.append("svg:rect")
                                .attr("x", 2 * width / 3 + 20 + n * (9))
                                .attr("y", -20)
                                .attr("stroke", "#9e1983")
                                .attr("height", 1)
                                .attr("width", 4);
                        }
                        // linechartSvg.append("svg:rect")
                        //     .attr("x", 2*width/3 + 20)
                        //     .attr("y", -20)
                        //     .attr("stroke", "#9e1983")
                        //     .attr("height", 1)
                        //     .attr("width", 40);

                        linechartSvg.append("svg:text")
                            .attr("x", 70 + 2 * width / 3)
                            .attr("y", -16)
                            .text("Projected");
                    }

                    // if(dataBasket.length > 1){
                    //   linechartSvg.append("path")
                    //     .datum(dataBasket)
                    //     .attr("class", "line")
                    //     .attr("d", line);
                    // } else {
                    //   // linechartSvg.append("circle")
                    //   //   .attr("cx", );
                    //   console.log("no draw");
                    // }


                    if (!dailyView && dataBasket.length > 1) {
                        var pathSvg = linechartSvg.append("path")
                            // .datum(dataBasket)
                            .data([dataBasketSliced])
                            .attr("class", "line")
                            .attr("d", line);

                        var pathSvg = linechartSvg.append("path")
                            // .datum(dataBasket)
                            .data([dataBasketDashed])
                            .attr("class", "line todaysLine")
                            .attr("d", line);

                    } else {
                        var pathSvg = linechartSvg.append("path")
                            // .datum(dataBasket)
                            .data([dataBasket])
                            .attr("class", "line")
                            .attr("d", line);
                    }



                    if (showObjectivesLine) {
                        // console.log("SHOWINNNGGNNG");
                        // console.log(objectivesData);

                        var pathSvg = linechartSvg.append("path")
                            // .datum(dataBasket)
                            .data([objectivesData])
                            .attr("class", "line objectivesLine")
                            .attr("d", line);


                    }


                    var translateY = 0;



                    if (dataBasket.length == 1) {



                        // if(data.attributes.PointKey == "12"){
                        //   console.log("\n"+item.name);
                        //   console.log(dataBasket[0].value);
                        //   console.log(maxValueY);
                        //   console.log("im deviating on the Y "+  (dataBasket[0].value) );

                        //   console.log( dataBasket[0].value );
                        //   console.log(maxValueY);



                        //   // translateY = 86;
                        // }



                        var circle = linechartSvg.append("circle")
                            .attr("r", 4)
                            .style("fill", "steelblue")
                            .attr("cy", function(d) {
                                console.log("returning ");
                                console.log(y(dataBasket[0].value));
                                return y(dataBasket[0].value);
                            })
                            // .attr("transform", "translate(" + 0 + ", " + translateY + ")");
                            // .attr("transform", "translate(" + width/2 + ", " + translateY + ")");



                    }



                    // linechartSvg.selectAll(".point")
                    //   .data(dataBasket)
                    // .enter().append("circle")
                    //   .attr("r", 4)
                    //   .attr("transform", function(d) { return "translate(" + d.value + ")"; });



                    focus.append("circle") // **********
                        .attr("class", "y") // **********
                        .style("fill", "none") // **********
                        .style("stroke", "blue") // **********
                        .attr("r", 4);


                    // append the rectangle to capture mouse               // **********
                    linechart.append("rect") // **********
                        .attr("width", width) // **********
                        .attr("height", height) // **********
                        .style("fill", "none") // **********
                        .style("pointer-events", "all") // **********
                        .on("mouseover", function() {
                            focus.style("display", null);
                        })
                        .on("mouseout", function() {
                            focus.style("display", "none");
                        })
                        .on("mousemove", mousemove); // **********

                    function mousemove() {
                        console.log("mousemove"); // **********
                        var x0 = x.invert(d3.mouse(this)[0]), // **********
                            i = bisectDate(data, x0, 1), // **********
                            d0 = data[i - 1], // **********
                            d1 = data[i], // **********
                            d = x0 - d0.date > d1.date - x0 ? d1 : d0; // **********

                        focus.select("circle.y") // **********
                            .attr("transform", // **********
                                "translate(" + x(d.date) + "," + // **********
                                y(d.value) + ")"); // **********
                    }
                }



                // // tralha
                // bar.append("")
                // console.log("div");
                // console.log(div.outerHTML);
                // var dupedVal = LatestKpiValues[0]

                // this is hardcoded, we need to read on resolve the mapping widget/indicator name - unit
                // and here map by the item.name to get the unit



                if (showObjectivesLine && objectivesData != undefined && objectivesData != null && objectivesData.length > 0) {

                    // if(data.attributes.PointKey == 12 || data.attributes.PointKey == "12"){
                    //   console.log("para no 12");
                    // }

                    // item.type = "Percentage";
                    // item.buckets = 
                    var todayObjval = objectivesData[objectivesData.length - 1].value;
                    if (dailyView) {
                        var hourToFind = +dataBasket[dataBasket.length - 1].hour;
                        for (var k = 0; k < objectivesData.length; k++) {
                            var auxDate = new Date(objectivesData[k].date);
                            // console.log(auxDate.getHours());
                            if (auxDate.getHours() == hourToFind) {
                                // console.log(objectivesData.length-1 +" VS new index " + k);
                                // console.log(todayObjval + " VS new val " + objectivesData[k].value);
                                todayObjval = objectivesData[k].value;
                                break;
                            }
                        }
                    }
                    // console.log("COMPARING " + val + " with objective " + todayObjval + " // val is " + (100 - (val * 100 / todayObjval)) + " of objective");

                    // item.type = "Percentage";
                    // item.buckets = new Array();
                    // item.buckets.push({ "bottomPerc": -5000, "icon": "img/custommarkers/arrowdown.png", "topPerc": -50 });
                    // item.buckets.push({ "bottomPerc": -50, "icon": "img/custommarkers/arrowright.png", "topPerc": -10 });
                    // item.buckets.push({ "bottomPerc": -10, "icon": "img/custommarkers/arrowup.png", "topPerc": 5000 });
                }



                var iconImage = getIconImage(val, item.type, item.buckets, todayObjval);
                // var iconImage = getIconImage(val, item.type, item.buckets);



                // console.log(item);

                var checkIfOccurrenceIsInexistent = function(PointKey, itemname, readingdate, readinghour, repetitions, rulerule, rulevalue) {
                    // construct unique code using all arguments
                    // check if scope.shownOccurrences doesnt have this unique code
                    // if it doesnt have, return true
                    // else return false
                    var uniqueCode = PointKey + "#" + itemname + "#" + readingdate + "#" + readinghour + "#" + repetitions + "#" + rulerule + "#" + rulevalue;
                    if ($scope.shownOccurrences.hasOwnProperty(uniqueCode)) {
                        $scope.shownOccurrences[uniqueCode]++;
                        return false
                    } else {
                        $scope.shownOccurrences[uniqueCode] = 1;
                        return true;
                    }
                }


                var getActiveRules = function(occcfgs, dailyView, pointkey, widgetTitle) {
                    // console.log("getActiveRules "+dailyView+" "+pointkey+" "+widgetTitle);

                    // *******************************************
                    // deactivated this feature / code due to new 
                    // occurrence mechanism on datacaptureapi.js
                    return [];
                    // *******************************************

                    if (dailyView) {
                        // hourly view
                        var obj = occcfgs.hourly;
                        if (obj.hasOwnProperty(widgetTitle)) {
                            obj = obj[widgetTitle];
                            if (obj.hasOwnProperty(pointkey)) {
                                return obj[pointkey];
                            }
                        }

                    } else {}
                    return [];
                }


                var getIndexByHour = function(objectivesData, date) {
                    for (var i = 0; i < objectivesData.length; i++) {
                        var aux = objectivesData[i];

                        // console.log("\ncomparing dates");
                        // console.log(aux.date);
                        // console.log(date);
                        // console.log(new Date(aux.date).getTime() == new Date(date).getTime());
                        if (new Date(aux.date).getTime() == new Date(date).getTime()) {
                            return i;
                        }
                    }
                    return -1;
                }



                var activeRules = getActiveRules(occurrenceconfigs, dailyView, data.attributes.PointKey, item.name);
                if (activeRules.length > 0) {
                    console.log("GOT ACTIVE RULES!!");

                    var lastHour = {};
                    var count = {};

                    if (dailyView && showObjectivesLine && objectivesData != undefined && objectivesData != null && objectivesData.length > 0) {
                        for (var idx = 0; idx < dataBasket.length; idx++) {
                            var reading = dataBasket[idx];
                            var theIndex = getIndexByHour(objectivesData, reading.date);

                            for (var idy = 0; idy < activeRules.length; idy++) {

                                var rule = activeRules[idy];

                                // console.log(rule);
                                if (rule.percentage == true) {

                                    if (theIndex >= 0) {
                                        var objective = objectivesData[theIndex];

                                        var difference = -1 * (100 - (reading.value * 100 / objective.value));
                                        // console.log("difference " + difference + " < " + rule.value + "  TEST: " + (difference < rule.value) );

                                        if (rule.rule == "Less than" && difference < rule.value) {

                                            if (rule.repetitions > 0) {


                                                if (lastHour[rule.occcfgid] == undefined || lastHour[rule.occcfgid] == null) {
                                                    lastHour[rule.occcfgid] = reading.hour;
                                                    count[rule.occcfgid] = 1;
                                                } else {
                                                    if (lastHour[rule.occcfgid] == reading.hour - 1) {
                                                        lastHour[rule.occcfgid] = reading.hour;
                                                        count[rule.occcfgid]++;
                                                    } else {
                                                        lastHour[rule.occcfgid] = reading.hour;
                                                        count[rule.occcfgid] = 1;
                                                    }
                                                }
                                                // console.log(reading.hour + " " + lastHour[rule.occcfgid] + " ||| with count " + count[rule.occcfgid]);

                                                if (count[rule.occcfgid] == rule.repetitions) {
                                                    // console.log("FOUND ONE THAT CAN GENERATE A REPEATED OCCURRENCE!");
                                                    // console.log(reading.value + " at " + reading.hour + " // objective " + objective.value);
                                                    // console.log(reading.value + " against objective value " + objective.value + " at hour "+ reading.hour);
                                                    // console.log("difference " + difference + " of rule < " + rule.value + "  TEST: " + (difference < rule.value)  + " // hour: "+ reading.hour);

                                                    // checkIfOccurrenceIsInexistent method wont work for now as we need that all occurrences have this code:
                                                    // pointkey#widgetname#readinghour#repetitions#rule#value
                                                    var inexistent = checkIfOccurrenceIsInexistent(data.attributes.PointKey, item.name, simpleDate, reading.hour, rule.repetitions, rule.rule, rule.value);
                                                    // var inexistent = true;

                                                    if (inexistent) {
                                                        console.log("FOUND OCCURRENCE!!!!! ");

                                                        var notif = rule;
                                                        notif.readvalue = reading.value;
                                                        notif.hour = reading.hour;
                                                        notif.icon = iconImage;
                                                        notif.widgetname = item.name;
                                                        notif.storename = nameFromAttributes(data, "n/a");
                                                        notif.unit = itemunit;
                                                        $scope.genNotif(notif);

                                                        socket.emit('update:warroom', {
                                                            "notif": notif
                                                        });

                                                        // add occurrence to server DB, then when done
                                                        // invoke local function to add  a new notification
                                                        // send to all others via socket.io to add a new notification (send the necessary material to show the notification? or just send the occurrenceId and make the other read from db?)
                                                    } else {
                                                        console.log("already shown this occurrence");
                                                    }
                                                }


                                            } else {
                                                // no repetitions, single reading to generate occurrence

                                                // console.log("FOUND ONE THAT CAN GENERATE OCCURRENCE!");
                                                // // console.log(reading.value + " at " + reading.hour + " // objective " + objective.value);
                                                // console.log(reading.value + " against objective value " + objective.value + " at hour "+ reading.hour);
                                                // console.log("difference " + difference + " of rule < " + rule.value + "  TEST: " + (difference < rule.value)  + " // hour: "+ reading.hour);

                                            }


                                        }
                                    }

                                }



                            }



                        }
                    }

                }

                // for(var a=0; a<occurrenceconfigs.length; a++){
                //   var occcfg = occurrenceconfigs[a];

                //   if(occcfg.config)
                // }



                var popupDomStr = '<div class="row"><div class="col-md-12"><h4>' + item.name + '</h4>';

                if (val == 'NoValToday') {
                    valFixed = 'No value for today...';
                    itemunit = '';
                } else {
                    var valFixed = (val.toFixed(1));
                    if (item.name == "Number of Customers")
                        valFixed = parseInt(val);
                }
                popupDomStr += '<h2><img style="margin-top: -4px;" src="' + iconImage + '"/> ' + valFixed + '<small>' + itemunit + '</small></h2>';
                if (val != 'NoValToday')
                    popupDomStr += '<p style="font-style: italic;">Date: ' + theDate + '</p>';
                popupDomStr += '<h6>Store: ' + nameFromAttributes(data, "n/a") + '</h6>';
                popupDomStr += '<hr>';

                // popupDomStr += '<p style="font-style: italic;">Survey date: '+dataHoNts+'</p>'

                // popupDomStr += '<h6>History<small> (last 5 days)</small></h6>';

                if (val != 'NoValToday')
                    popupDomStr += '<h6>History<small> (' + historyFrequencyStr + ', ' + dd + "/" + mm + "/" + yyyy + ')</small></h6>';
                popupDomStr += div.outerHTML;
                // popupDomStr += '<p style="font-style: italic; color: grey;">Results read from Happy or Not API at '+$scope.readDateHoN+'</p>';
                popupDomStr += '</div>';
                popupDomStr += '</div>';

                // console.log(popupDomStr);

                var popup = L.popup().setContent(popupDomStr);



                // console.log(iconImage);
                // console.log(min);
                // console.log(max);
                // console.log(val);
                // console.log(item.type);
                // console.log(item.buckets);

                var icon = L.icon({
                    iconUrl: iconImage,
                    // shadowUrl: 'leaf-shadow.png',

                    iconSize: [31, 31], // size of the icon
                    shadowSize: [0, 0], // size of the shadow
                    iconAnchor: [posLatLng.x, posLatLng.y], // point of the icon which will correspond to marker's location
                    // iconAnchor:   [-15, 55], // point of the icon which will correspond to marker's location
                    shadowAnchor: [0, 0], // the same for the shadow
                    popupAnchor: [-posLatLng.x + 15, -posLatLng.y] // point from which the popup should open relative to the iconAnchor
                });



                var marker = L.marker([data.x, data.y], {
                    icon: icon
                });


                marker.bindPopup(popup);



            } else {
                if (item.type == 'EmptyOrNot')
                    marker.bindPopup("<b>Videostream                     LIVE</b><br><video width='600' height='500' autoplay='autoplay' loop muted><source src='http://techslides.com/demos/sample-videos/small.mp4' type='video/mp4'></video>");
                else
                    marker.bindPopup("<b>History of KPI </b><br>" + item.name + ": " + val + "<br><img src='img/custommarkers/History_Basket_sm.png' height='116' width='370'/>");
            }

            marker.addTo(map);

            $scope.currCustomMarkers.push(marker);
        }

    }

    function getIconImage(val, type, buckets, todayObjval) {

        // console.log(val + " / " + type);

        for (var i = 0; i < buckets.length; i++) {
            var b = buckets[i];

            if (type == 'Intervals') {
                if (val <= b.topVal && val >= b.bottomVal && val != 'NoValToday') // should be: val <= b.topVal && val > b.bottomVal and last one tests the >= bottomVal
                    return (b.icon);
            } else
            if (type == 'AroundZero') {
                if (val < 0 && b.aroundZero == 'smaller')
                    return (b.icon);
                else if (val == 0 && b.aroundZero == 'equal')
                    return (b.icon);
                else if (val > 0 && b.aroundZero == 'bigger')
                    return (b.icon);
            } else if (type == 'EmptyOrNot') {
                if (val == b.val)
                    return (b.icon);
            } else if (type == 'Percentage') {
                if (val != undefined && val != null && (typeof val != 'string') && todayObjval != undefined && todayObjval != null) {
                    var difference = -1 * (100 - (val * 100 / todayObjval));
                    // console.log(val + " VS " + todayObjval + " == difference is "+difference);
                    // console.log("COMPARING " + val + " with objective " + todayObjval + " // val is " + (100 - (val * 100 / todayObjval)) + " of objective");

                    if (difference <= b.topPerc && difference >= b.bottomPerc) {
                        return (b.icon);
                    }

                }
            }

        }

        // if not found, return default/error/not found icon
        return 'img/custommarkers/notavailable.png';
    }


    function getCustomMarkerPosition(x, y, plots, position, radiusOffset, radiusOutside, iconsOffset, title) {
        // assuming a hexagon around the marker in x, y
        // hexagon = circle cut in 6, aligning a vertex on x=center, y=topMostPossible
        // return something around 

        var radius = 40;
        radius += radiusOffset;
        radius += radiusOutside;
        var defAngle = ((Math.PI) / plots);

        if (plots == 7) {
            // defAngle = 25.714285714285715 * (Math.PI / 180);
            defAngle = 38 * (Math.PI / 180);
        }

        var angle = defAngle + ((Math.PI * 2 / plots) * position);
        var toRet = {};
        var xDev = 14;

        // console.log(defAngle + "   " + angle * (180 / Math.PI)  + "  for " + title);

        if (iconsOffset != 0) {
            xDev -= 0;
        }
        var yDev = 35;
        yDev += iconsOffset;
        toRet.x = radius * Math.cos(angle) + xDev;
        toRet.y = radius * Math.sin(angle) + yDev;
        // console.log(toRet.x + " " + toRet.y);
        return toRet;
    }

    $scope.occurrences = Occurrences.occurrences;

    for (var obj in $scope.occurrences) {
        if ($scope.occurrences[obj].pointid == 11725 || $scope.occurrences[obj].pointid == 13477) $scope.occurrences[obj].pointname = "Lubelska (Ch)";
        if ($scope.occurrences[obj].pointid == 11727 || $scope.occurrences[obj].pointid == 13480) $scope.occurrences[obj].pointname = "Świdnik";
        if ($scope.occurrences[obj].pointid == 11729 || $scope.occurrences[obj].pointid == 13482) $scope.occurrences[obj].pointname = "Puławy";
        if ($scope.occurrences[obj].pointid == 11730 || $scope.occurrences[obj].pointid == 13483) $scope.occurrences[obj].pointname = "Płock";
        if ($scope.occurrences[obj].pointid == 11731 || $scope.occurrences[obj].pointid == 13484) $scope.occurrences[obj].pointname = "Radom";
        if ($scope.occurrences[obj].pointid == 11732 || $scope.occurrences[obj].pointid == 13485) $scope.occurrences[obj].pointname = "Łódź";
        if ($scope.occurrences[obj].pointid == 11726 || $scope.occurrences[obj].pointid == 13478) $scope.occurrences[obj].pointname = "Lwowska (Ch)";
        if ($scope.occurrences[obj].pointid == 11724 || $scope.occurrences[obj].pointid == 13479) $scope.occurrences[obj].pointname = "Piłsudskiego (Ch)";
        if ($scope.occurrences[obj].pointid == 11728 || $scope.occurrences[obj].pointid == 13481) $scope.occurrences[obj].pointname = "Lublin";

    }

    //to update the number of occurrences in red (tab Occurrences) with only the Open occurrences
    $scope.showOpenOcc = false;
    console.log($scope.showOpenOcc);
    $scope.openOcc = Occurrences.openOcc;

    if ($scope.openOcc > 0)
        $scope.showOpenOcc = true;
    else
        $scope.showOpenOcc = false;

    //console.log($scope.showOpenOcc);

    $scope.$watch('currOccurrence.status', function() {
        $scope.openOcc = Occurrences.openOcc;

        if ($scope.openOcc > 0)
            $scope.showOpenOcc = true;
        else
            $scope.showOpenOcc = false;
    });



    //console.log("aaaaaaaaaaaaaaaaaaa");
    //console.log($scope.occurrences);
    // $scope.occurrences = [
    //   {status: "Closed", title: "Basket is below 10 PLN", date: "23/01/2015", pointid:12159, lat:'51.1197818', lng:'23.4658107',
    //     tasks: [
    //       {done:true, title:"Validate basket readings' history", obs: "Well... it just didnt worked as expected...!"},
    //       {done:true, title:"Call Operator to find why the value has changed", obs: ""},
    //       {done:true, title:"Call Manager", obs: ""},
    //       {done:true, title:"Call the doctor!", obs: ""},
    //       {done:true, title:"Call João Cabral", obs: ""},
    //       {done:true, title:"Call CEO", obs: ""},
    //     ]},
    //   {status: "Ongoing", title: "Margin below 20%", date: "23/01/2015", pointid:12166, lat:'51.7480996', lng:'19.4128204',
    //     tasks: [
    //       {done:false, title:"Validate basket readings' history", obs: "Well... it just didnt worked as expected...!"},
    //       {done:true, title:"Call Operator to find why the value has changed", obs: ""},
    //     ]},
    //   {status: "Assigned", title: "Basket is below 3 PLN", date: "24/01/2015", pointid:12164, lat:'52.5450523', lng:'19.6921815000001',
    //     tasks: [
    //       {done:false, title:"Call Manager", obs: ""},
    //     ]},
    //   {status: "Open", title: "1 sad satisfaction per hour", date: "25/01/2015", pointid:12159, lat:'51.1197818', lng:'23.4658107',
    //     tasks: [
    //       {done:false, title:"Validate customer satisfaction readings' history", obs: ""},
    //     ]},
    //   {status: "Open", title: "10 sad satisfaction per hour", date: "27/01/2015", pointid:12163, lat:'51.416691', lng:'21.9641091',
    //     tasks: [
    //       {done:false, title:"Validate customer satisfaction readings' history", obs: "Well... it just didnt worked as expected...!"},
    //       {done:false, title:"Call Operator to find why the value has changed", obs: ""},
    //       {done:false, title:"Call Manager", obs: ""},
    //     ]},
    //   {status: "Open", title: "3 sad satisfaction per hour", date: "28/01/2015", pointid:12159, lat:'51.1197818', lng:'23.4658107',
    //     tasks: [
    //       {done:false, title:"Freak out!!!", obs: ""},
    //       {done:false, title:"Call João Cabral!!!", obs: ""},
    //       {done:false, title:"Call CEO", obs: ""},
    //     ]},
    // ];

    $scope.currOccurrence = {
        "showTasks": false,
        "selectedClass": "",
        "statusMenu": false
    };
    //$scope.showTaskList = true;
    $scope.editing = new Array();

    $scope.setCurrOccurrence = function(occurrence) {
        console.log("setCurrOccurrence");
        //$scope.showTaskList = false;

        if ($scope.currOccurrence.occid != occurrence.occid) {
            $scope.currOccurrence.showTasks = false;
            $scope.currOccurrence.statusMenu = false;
            $scope.currOccurrence.selectedClass = '';

            $scope.currOccurrence = occurrence;

            $scope.currOccurrence.selectedClass = 'selectedOccurrence';
            $scope.currOccurrence.showTasks = true;
            $scope.currOccurrence.statusMenu = true;
        } else if ($scope.currOccurrence.occid == occurrence.occid) {
            if ($scope.currOccurrence.showTasks == false) {
                $scope.currOccurrence.showTasks = true;
                $scope.currOccurrence.statusMenu = true;
            } else {
                $scope.currOccurrence.showTasks = false;
                $scope.currOccurrence.statusMenu = false;

            }
        }


        $scope.editing = [];

        for (var i = 0; i < $scope.currOccurrence.tasks.length; i++) {
            $scope.editing[i] = false;
        }

        $scope.currColorClass = getColorByOccurrenceState($scope.currOccurrence.status);

        if ($scope.currOccurrence.new == 'true') {
            $scope.currOccurrence.new = false;
            writeToDb($scope.pid, $scope.currOccurrence);
        }
    }

    var finishChange = function() {

        $scope.$apply(
            function() {
                leafletData.getMap().then(function(map) {

                    map.fitBounds([
                        [$scope.currOccurrence.lat, $scope.currOccurrence.lng]
                    ], {
                        padding: [5, 5]
                    });

                    // var rand = Math.floor(Math.random() * $scope.markers.length - 1);
                    // if(rand < 0)
                    //   rand = 0;

                    // map.fitBounds( [
                    //     [$scope.markers[rand].lat, $scope.markers[rand].lng]
                    // ], { padding: [5, 5]});
                });

                //$scope.showTaskList = true;
                //$scope.currColorClass = getColorByOccurrenceState($scope.currOccurrence.status);
            }
        );
    }

    $http.get('/api/user').
    success(function(data, status, headers, config) {
        $scope.username = data.username;
    });

    var writeToDb = function(pid, obj) {
        console.log("writeToDb");
        if (obj == undefined) return;

        $http.post('/api/occurrences/' + $scope.pid, $scope.currOccurrence).
        success(function(data, status) {
            console.log("saveOccurrence ok");
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

    $scope.toggleEdit = function(index, saveToDb) {
        console.log("toggleEdit");

        $scope.editing[index] = !$scope.editing[index];
        $scope.oldComment = $scope.currOccurrence.tasks[index].obs;
        if (saveToDb) {
            $scope.currOccurrence.statusdate = new Date();
            $scope.currOccurrence.tasks[index].modifieddate = new Date();
            $scope.currOccurrence.tasks[index].username = $scope.username;
            writeToDb($scope.pid, $scope.currOccurrence);
        }
    }

    $scope.cancelNote = function(index) {
        console.log("cancelNote");

        $scope.currOccurrence.tasks[index].obs = $scope.oldComment;
        $scope.toggleEdit(index, false);
    }

    $scope.removeNote = function(index) {
        console.log("removeNote");

        $scope.currOccurrence.tasks[index].obs = "";
        $scope.currOccurrence.statusdate = new Date();
        $scope.currOccurrence.tasks[index].modifieddate = new Date();
        $scope.currOccurrence.tasks[index].username = $scope.username;

        writeToDb($scope.pid, $scope.currOccurrence)
    }

    function allTasksDone(currOccurrence) {
        console.log("allTasksDone");

        var tasks = $scope.currOccurrence.tasks;
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].done == false)
                return false;
        }
        return true;
    }


    $scope.changeStatus = function(newStatus, oldStatus) {

        console.log("changeStatus");

        if (newStatus == 'Closed' && !allTasksDone($scope.currOccurrence)) {
            $scope.currOccurrence.status = oldStatus;
            $window.alert("You cannot close when all of your tasks are not done");
            $scope.currOccurrence.status = oldStatus;
        } else {
            if (newStatus != undefined) {
                $scope.currColorClass = getColorByOccurrenceState($scope.currOccurrence.status);
                $scope.currOccurrence.status = newStatus;
                $scope.currOccurrence.statusdate = new Date();
                writeToDb($scope.pid, $scope.currOccurrence);
            }
        }
    }

    $scope.checkedTask = function(index) {

        console.log("checkedTask");

        var error = false;

        if ($scope.currOccurrence.status == 'Closed') {
            $scope.currOccurrence.tasks[index].done = !$scope.currOccurrence.tasks[index].done;
            alert('You cannot change the state of a task on a Closed occurrence...');
            error = true;
        } else if ($scope.currOccurrence.status == 'Open') {
            $scope.currOccurrence.tasks[index].done = !$scope.currOccurrence.tasks[index].done;
            alert('You cannot change the state of a task on a Open occurrence...');
            error = true;
        }

        if (!error) {
            //console.log("checkedTask Ok");
            $scope.currOccurrence.statusdate = new Date();
            $scope.currOccurrence.tasks[index].modifieddate = new Date();
            $scope.currOccurrence.tasks[index].username = $scope.username;
            $scope.currOccurrence.tasks[index].done = $scope.currOccurrence.tasks[index].done;
            writeToDb($scope.pid, $scope.currOccurrence);

            console.log($scope.currOccurrence);
        }
    }


    function getColorByOccurrenceState(state) {

        console.log("getColorByOccurrenceState");

        if (state == 'Open')
            return '#d24d33';
        else if (state == 'Assigned')
            return '#f0ad4e';
        else if (state == 'Ongoing')
        // return 'lightblue';
            return "#5bc0de";
        else if (state == 'Closed')
            return '#82b964;'
    }

}



OlapCubeCtrl.$inject = ['$scope', '$http', '$routeParams', 'sharedCommsService'];

function OlapCubeCtrl($scope, $http, $routeParams, sharedCommsService) {
    console.log("OlapCubeCtrl");


    $scope.pid = $routeParams.pid;
    sharedCommsService.pid = $scope.pid;
    sharedCommsService.bufferAndBroadcast("updatePid");

    $scope.project = {};



    $http.get('/api/dashboard/' + $scope.pid).
    success(function(data, status) {
        $scope.project = data.project;

    }).
    error(function(data, status) {
        $scope.data = data || "Request failed";
    });



    $scope.cubeName = "";

    $scope.triggerOlapRead = function() {
        console.log("triggerOlapRead");
        $http.get('/olapapi/discoverDataSources').
        success(function(data, status) {
            $scope.dataSources = data;
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }

    $scope.setCubeName = function(name) {
        $scope.cubeName = name;
    }


    $scope.triggerCubeName = function() {
        console.log("triggerCubeName");
        $http.get('/olapapi/discoverMDDimensions/' + $scope.cubeName).
        success(function(data, status) {
            console.log("dimensions");
            $scope.dimensions = data;
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });


        $http.get('/olapapi/discoverMDDimensionsMeasures/' + $scope.cubeName).
        success(function(data, status) {
            console.log("measures");
            $scope.measures = data;
        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });
    }


    $scope.selectMeasure = function(m) {
        $scope.measure = m;
    }
    $scope.selectHierarchy = function(h) {
        $scope.hierarchy = h;
    }

    $scope.sentence = "";
    $scope.execSentence = function() {
        var obj = {};
        obj.sentence = $scope.sentence;
        $http.post('/olapapi/olapExecute/' + $scope.cubeName, obj).
        success(function(data, status) {

            // $scope.cellcount = data.count;
            // $scope.execresults = data.arr;
            $scope.resultnodes = data.parent;

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

    }

    $scope.execSentenceSync = function() {
        var obj = {};
        obj.sentence = $scope.sentence;
        $http.post('/olapapi/olapExecuteSync/' + $scope.cubeName, obj).
        success(function(data, status) {

            $scope.cellcount = data.count;
            $scope.execresults = data.arr;

        }).
        error(function(data, status) {
            $scope.data = data || "Request failed";
        });

    }


    $scope.sentence = "SELECT {\n" +
        " [Measures].[W_sp_csb]}  ON COLUMNS,\n" +
        " NON EMPTY\n" +
        " ([Data].[Kalendarz].[Rok].Members,\n" +
        " [Sklep].[Sklep Nazwa].Members)\n" +
        " ON ROWS\n" +
        "FROM [BI_Reports]";


    $scope.sentence = "WITH MEMBER [Measures].[Basket] AS\n" +
        "  [Measures].[W_sp_csb] /   \n" +
        "  [Measures].[Paragony]\n" +
        "  FORMAT_STRING = '0.00%'  -- Result set \n" +
        "SELECT { \n" +
        " [Measures].[Basket]}  ON COLUMNS,\n" +
        " NON EMPTY\n" +
        " ([Data].[Kalendarz].[Rok].Members,\n" +
        " [Sklep].[Sklep Nazwa].Members)\n" +
        " ON ROWS\n" +
        "FROM [BI_Reports]";


    $scope.sentence = "WITH MEMBER [Measures].[Basket] AS\n" +
        "  [Measures].[W_sp_csb] /   \n" +
        "  [Measures].[Paragony]\n" +
        "  FORMAT_STRING = '0.00%'  -- Result set \n" +
        "SELECT { \n" +
        " [Measures].[Basket], [Measures].[W_sp_csb]}  ON COLUMNS,\n" +
        " NON EMPTY\n" +
        " ([Data].[Kalendarz].[Rok].Members,\n" +
        " [Sklep].[Sklep Lokalizacja].Members,\n" +
        " [Sklep].[Sklep Miasto].Members,\n" +
        " [Sklep].[Sklep Nazwa].Members)\n" +
        " ON ROWS\n" +
        "FROM [BI_Reports]";


}



function DataLevelsCtrl($scope, $routeParams, $http, $timeout, socket) {
    console.log("DataLevelsCtrl");
    $scope.pid = $routeParams.pid;

    $scope.levels = new Array();

    $http.get('/api/getMetaLevels/' + $scope.pid)
        .success(function(data, status) {
            // $scope.levels = data.levels;
            var tarii = [];
            var auxTarii = {
                "title": data.levels[0],
                "childs": []
            };
            tarii.push(auxTarii);


            for (var i = 1; i < data.levels.length; i++) {
                var auxTarii2 = {
                    "title": data.levels[i],
                    "childs": []
                };
                auxTarii.childs.push(auxTarii2);
                auxTarii = auxTarii2;
            }

            $scope.tree = tarii;

            // $scope.tree = [
            //                   {
            //                       "title": "employee",
            //                       "childs": [
            //                           {
            //                               "title": "category",
            //                               "childs": [
            //                                   {
            //                                       "title": "subcategory",
            //                                       "childs": [
            //                                           {
            //                                               "title": "product",
            //                                               "childs": []
            //                                           }
            //                                       ]
            //                                   }
            //                               ]
            //                           }
            //                       ]
            //                   }
            //               ];



        }).
    error(function(data, status) {

    });


    $scope.delete = function(data) {
        data.childs = [];
    };
    $scope.add = function(data) {
        var post = data.childs.length + 1;
        var newTitle = data.title + '-' + post;
        data.childs.push({
            title: newTitle,
            childs: []
        });
    };
    $scope.tree = [{
        title: "Node",
        childs: []
    }];


    $scope.moveDown = function(data, childIndex) {
        var tmp = data.title;
        data.title = data.childs[childIndex].title;
        data.childs[childIndex].title = tmp;
    }


    var findParentRec = function(node, childTitle, childIndex) {
        // test if the child at childIndex has title childTitle

        if (node.childs != undefined && node.childs.length > 0 && node.childs[childIndex] != undefined && node.childs[childIndex].title == childTitle) {
            return node;
        } else {
            if (node.childs != undefined && node.childs.length > 0) {
                for (var i = 0; i < node.childs.length; i++) {
                    return findParentRec(node.childs[i], childTitle, childIndex);
                }
            } else {
                return null;
            }
        }

        // else, call findParentRec(node.childs[childIndex], childTitle, childIndex)


    }


    $scope.findParent = function(data, childIndex) {
        // to find the parent of data, we need to iterate tree from the beginning,
        // and return a node which child[childIndex] is data.title

        // but first we need to test if the root node is the provided child...
        if ($scope.tree[0].title == data.title) {
            return null;
        } else {
            return findParentRec($scope.tree[0], data.title, childIndex);
        }

    }


    var twoDigit = function(val) {
        if (val < 10) {
            return "0" + val;
        } else {
            return val;
        }
    }

    var resetSaveStatus = function() {
        $scope.savingStatusText = "";
    }

    var resetSaveButton = function(init) {
        $scope.saving = false;
        $scope.savingText = "Save";
        var now = new Date();
        $scope.savingStatusText = "Saved at " + twoDigit(now.getHours()) + ":" + twoDigit(now.getMinutes()) + ":" + twoDigit(now.getSeconds());
        if (!init) {
            $timeout(resetSaveStatus, 10000);
        } else {
            resetSaveStatus();
        }
    }
    resetSaveButton(true);

    $scope.saveLevels = function() {
        // iterate on tree (assuming linear hierarchy) to build the linear array of levels

        $scope.saving = true;
        // $scope.savingText = "Saving...";

        var arr = [];

        var aux = $scope.tree[0];
        arr.push({
            "title": aux.title
        });
        while (aux.childs.length > 0) {

            aux = aux.childs[0];
            arr.push({
                "title": aux.title
            });

        }

        console.log(arr);

        $http.post('/api/setMetaLevels/' + $scope.pid, arr)
            .success(function(data, status) {
                $scope.getKpiMetalevels($scope.filterOptions[0].data[$scope.selectedIndicator.index].label);
                $timeout(resetSaveButton, 2000);

            }).
        error(function(data, status) {

        });

    }
}   