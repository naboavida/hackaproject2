


function IntervalReadsCtrl($scope, $http, $timeout, socket){
  console.log("IntervalReadsCtrl");
  $scope.intervalValue = 1000;
  $scope.changeIntervalValueMsg = "";
  $scope.reads = new Array();
  $scope.startStopInterval = false;

  $scope.xlsxdropbox = {"date": '12-11-2015', "projectid": 163, "triggerTime": "02:00", "reads": []};


  $scope.forceDateReadingsXlsxDropbox = function(){
  	$scope.xlsxdropbox.connector = "xlsxdropbox";
    $scope.forceDateXlsxIsFetching = true;

  	$http.post('/pollingapi/forceDate', $scope.xlsxdropbox).
		success(function(data, status){
			if(data.status == 200){
				// $scope.forceDateMessageXlsx = "Forced date "+$scope.forcedate;
        $scope.forceDateMessageXlsx = "Forced date "+$scope.xlsxdropbox.date + ", processed " + data.processed + " store setups.";
        $scope.forceDateXlsxIsFetching = false;

        // clear the feedback message after 4 seconds (longer than 2 for more visibility)
        var clearMsg = function(){
          $scope.forceDateMessageXlsx = "";
        }
        $timeout(clearMsg, 8000);
			} else if(data.status == 404){
        $scope.forceDateMessageXlsx = "Forced date "+$scope.xlsxdropbox.date + " error, missing resource. " + data.message;
        $scope.forceDateXlsxIsFetching = false;

        // clear the feedback message after 4 seconds (longer than 2 for more visibility)
        var clearMsg = function(){
          $scope.forceDateMessageXlsx = "";
        }
        $timeout(clearMsg, 8000);
      }
		}).
  		error(function (data, status) {
        $scope.forceDateMessageXlsx = "Forced date "+$scope.xlsxdropbox.date + " with error: DB connections exceeded ";
        $scope.forceDateXlsxIsFetching = false;

        // clear the feedback message after 4 seconds (longer than 2 for more visibility)
        var clearMsg = function(){
          $scope.forceDateMessageXlsx = "";
        }
        $timeout(clearMsg, 8000);
			$scope.data = data || "Request failed";
		});
  }


  socket.on("new_xlsxdropbox_forcedread", function(data){
    console.log("new_xlsxdropbox_forcedread!!");
    console.log(data);
    // $scope.addTodayLastValue(data.pk, data.kp, data.hr, data.vl)
    $scope.xlsxdropbox.reads.push(data);
  });

  socket.on('new_xlsxdropbox_read', function (data) {
    console.log("new_xlsxdropbox_read!!");
    console.log(data);
    // $scope.addTodayLastValue(data.pk, data.kp, data.hr, data.vl)
    $scope.xlsxdropbox.reads.push(data);
  });

  // get the saved data on DB (project id and trigger time), for the inital launch of the controller
  $http.post('/pollingapi/getXlsxDropboxProjects', {"projectsAttributes": "xlsxdropbox"}).
    success(function(data, status){
      if(data.length > 0){
        $scope.xlsxdropbox.projectid = data[0]['pid_proj'];
        $scope.xlsxdropbox.triggerTime = data[0]['triggertime'];
      }
    }).
    error(function (data, status) {
      $scope.data = data || "Request failed";
    });



  $http.get('/pollingapi/getIntervalValue').
    success(function(data, status){
      $scope.intervalValue = parseInt(data.intervalValue);
      $scope.projectid = parseInt(data.projectid);
      $scope.startStopInterval = data.currentIntervalStatus;
    }).
    error(function (data, status) {
      $scope.data = data || "Request failed";
    });



  $scope.changeIntervalValueDropboxXlsx = function(){
    $http.post('/pollingapi/setTriggerTimeXlsxDropbox', $scope.xlsxdropbox).
      success(function(data, status){

      }).
      error(function (data, status) {
        $scope.changeIntervalValueMsg = data || "Request failed";
      });
  }
    




  var getReadingsDetails = function(){
    // get readings
      // response success
        // set $scope.reads = data.reads

    $http.get('/pollingapi/getCurrentReads').
      success(function(data, status){
        console.log("getCurr Reads");
        $scope.reads = data;
      }).
      error(function (data, status) {
        $scope.data = data || "Request failed";
      });
  }

  getReadingsDetails();


  $scope.changeIntervalValue = function(){
    $scope.changeIntervalValueMsg = "";
    var toPost = {};
    toPost.intervalValue = $scope.intervalValue;
    toPost.projectid = $scope.projectid;

    $http.post('/pollingapi/setIntervalValue', toPost).
      success(function(data, status){
        $scope.intervalValue = parseInt(data.intervalValue);
        $scope.projectid = parseInt(data.projectid);
        $scope.changeIntervalValueMsg = "Changed interval to "+data.intervalValue+ " and pid to " + data.projectid;

        var clearChangeIntervalValueMsg = function(){
          $scope.changeIntervalValueMsg = "";
        }
        $timeout(clearChangeIntervalValueMsg, 2000);

      }).
      error(function (data, status) {
        $scope.changeIntervalValueMsg = data || "Request failed";
      });
  }

  var startStopInterval = function(status){
    $scope.changeIntervalValueMsg = "";
      var toPost = {};
      toPost.status = status;
      toPost.projectid = $scope.projectid;

      $http.post('/pollingapi/setStartStopInterval', toPost).
        success(function(data, status){
          $scope.startStopInterval = data;
          $scope.changeIntervalValueMsg = "Changed startStop to "+data;

          var clearChangeIntervalValueMsg = function(){
            $scope.changeIntervalValueMsg = "";
          }
          $timeout(clearChangeIntervalValueMsg, 2000);

        }).
        error(function (data, status) {
          $scope.changeIntervalValueMsg = data || "Request failed";
        });
  }

  $scope.startInterval = function(){
    startStopInterval(true);
  }

  $scope.stopInterval = function(){
    startStopInterval(false);
  }


  socket.on('update_counter_test', function (data) {
    console.log("UPDATING!! "+data);
    getReadingsDetails();
  });






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


  $scope.kpis_list = ["Basket", "W_sp_csn_rb", "Paragony", "NetMargin", "PercBills", "W_zap_czn_r"];
  // $scope.kpis_list = ["Basket"];

  // objecto todayLastValues PointKey.KPI.push([czas, value])
  $scope.todayLastValues = [];
  $scope.lastForcedValues = [];

  // var readsObj = {"Basket" : [{"hour": "08", "value": 123}, {"hour": "09", "value": 333}] };
  var readsObj = {"Basket" : [],  "W_sp_csn_rb" : [], "Paragony" : [], "NetMargin" : [], "PercBills" : [], "W_zap_czn_r" : []};
  var obj = {"PointKey": "001", "reads": cloneObject(readsObj)};
  $scope.todayLastValues.push(cloneObject(obj));
  $scope.lastForcedValues.push(cloneObject(obj));

  obj = {"PointKey": "002", "reads": cloneObject(readsObj)};
  $scope.todayLastValues.push(cloneObject(obj));
  $scope.lastForcedValues.push(cloneObject(obj));

  obj = {"PointKey": "003", "reads": cloneObject(readsObj)};
  $scope.todayLastValues.push(cloneObject(obj));
  $scope.lastForcedValues.push(cloneObject(obj));

  obj = {"PointKey": "005", "reads": cloneObject(readsObj)};
  $scope.todayLastValues.push(cloneObject(obj));
  $scope.lastForcedValues.push(cloneObject(obj));

  obj = {"PointKey": "006", "reads": cloneObject(readsObj)};
  $scope.todayLastValues.push(cloneObject(obj));
  $scope.lastForcedValues.push(cloneObject(obj));

  obj = {"PointKey": "008", "reads": cloneObject(readsObj)};
  $scope.todayLastValues.push(cloneObject(obj));
  $scope.lastForcedValues.push(cloneObject(obj));


  obj = {"PointKey": "009", "reads": cloneObject(readsObj)};
  $scope.todayLastValues.push(cloneObject(obj));
  $scope.lastForcedValues.push(cloneObject(obj));

  obj = {"PointKey": "010", "reads": cloneObject(readsObj)};
  $scope.todayLastValues.push(cloneObject(obj));
  $scope.lastForcedValues.push(cloneObject(obj));

  obj = {"PointKey": "012", "reads": cloneObject(readsObj)};
  $scope.todayLastValues.push(cloneObject(obj));
  $scope.lastForcedValues.push(cloneObject(obj));







  // funcao para adicionar ao objecto todayLastValues dado PointKey, KPI, czas e value
  $scope.addTodayLastValue = function(pk, kp, hr, vl){
    // console.log("addTodayLastValue");
    // console.log(pk + " " + kp + " " + hr + " " + vl);
    // var obj = {"PointKey": "002"};
    // $scope.todayLastValues.push(obj);
    var PointKey = pk || "001";
    var kpi = kp || "Basket";
    var hour = hr || "10";
    var value = vl || Math.floor(Math.random() * 634) + 122;
    console.log(PointKey + " " + kpi + " " + hour + " " + value);
    console.log("\n\n");

    for(var i=0; i<$scope.todayLastValues.length; i++){
      var aux = $scope.todayLastValues[i];
      if(aux.PointKey == PointKey){
        if(aux.reads[kpi].length == 0){
          aux.reads[kpi].push({"hour": hour, "value": value});
          return;
        } else {
          for(var j=0; j<aux.reads[kpi].length; j++){
            var read = aux.reads[kpi][j];
            if(read.hour == hour){
              aux.reads[kpi][j].value = value;
              return;
            }
          }
        }
        aux.reads[kpi].push({"hour": hour, "value": value});
      }
    }
  }


  
  $scope.addForcedValue = function(pk, kp, hr, vl){
    // console.log("addTodayLastValue");
    // console.log(pk + " " + kp + " " + hr + " " + vl);
    // var obj = {"PointKey": "002"};
    // $scope.todayLastValues.push(obj);
    var PointKey = pk || "001";
    var kpi = kp || "Basket";
    var hour = hr || "10";
    var value = vl || Math.floor(Math.random() * 634) + 122;
    console.log(PointKey + " " + kpi + " " + hour + " " + value);
    console.log("\n\n");

    for(var i=0; i<$scope.lastForcedValues.length; i++){
      var aux = $scope.lastForcedValues[i];
      if(aux.PointKey == PointKey){
        if(aux.reads[kpi].length == 0){
          aux.reads[kpi].push({"hour": hour, "value": value});
          return;
        } else {
          for(var j=0; j<aux.reads[kpi].length; j++){
            var read = aux.reads[kpi][j];
            if(read.hour == hour){
              aux.reads[kpi][j].value = value;
              return;
            }
          }
        }
        aux.reads[kpi].push({"hour": hour, "value": value});
      }
    }
  }



  $scope.lastBackendReads = new Array();

  $scope.clearBackendReadings = function(){


    $http.get('/pollingapi/clearBackendReadings').
      success(function(data, status){
        console.log("clearBackendReadings");
        $scope.lastBackendReads = data;
      }).
      error(function (data, status) {
        $scope.data = data || "Request failed";
      });
  }


  socket.on('new_live_reading', function (data) {
    console.log("new_live_reading!!");
    console.log(data);
    $scope.addTodayLastValue(data.pk, data.kp, data.hr, data.vl)
  });

  socket.on('new_live_reading_forced', function (data) {
    console.log("new_live_reading_forced!!");
    console.log(data);
    $scope.addForcedValue(data.pk, data.kp, data.hr, data.vl)
  });

  socket.on('to_inform_compares', function (data) {
    console.log("to_inform_compares!!");
    console.log(data);
    
  });

  $scope.forceDateObj = {};
  $scope.forceDateObj.projectid = $scope.projectid;
  $scope.forcedate = "2015-07-04";
  $scope.forceDateObj.forcedate = "2015-07-04";
  $scope.forceDateObj.connector = "olap";
  $scope.forceDateMessage = "";
  $scope.forceDateMessageXlsx = "";
  $scope.forceDateXlsxIsFetching = false;

  $scope.forceDateReadings = function(){
    if($scope.forceDateObj.projectid == "" || $scope.forceDateObj.forcedate == ""){
      $scope.forceDateMessage = "Error: Empty input.";
      return;
    }

    $scope.forceDateObj.date = trimHiphens($scope.forcedate);
    $scope.forceDateObj.projectid = $scope.projectid;

    $http.post('/pollingapi/forceDate', $scope.forceDateObj).
      success(function(data, status){
        if(data.status == 200){
          $scope.forceDateMessage = "Forced date "+$scope.forcedate;
        }
      })
  }

  var trimHiphens = function(date){
    return date.replace(/\D/g,'');
  }






  // code to delete readings in bulk
  $scope.kpis = [];
  $scope.dates = [];
  $scope.selectedDates = [];
  $scope.selectedKpis = [];

  $scope.fetchDates = function(){
    $scope.dates = [];
    $scope.kpis = [];
    $scope.selectedDates = [];
    $scope.selectedKpis = [];

    $http.get('/api/getDatesToDelete/'+$scope.projectid).
      success(function(data, status){
          $scope.dates = data.dates;
          $scope.kpis = data.kpis;
      })
  }

  $scope.deleteReadingDates = function(){
    // send post to delete
      // reset dates and selectedDates
      // refetch dates

    var selObject = {};
    selObject.selDates = [];
    selObject.selKpis = "";

    for(var i=0; i<$scope.selectedDates.length; i++){
      var aux = $scope.selectedDates[i];
      selObject.selDates.push(getDateString(new Date(aux.date), true ));
    }
    for(var j=0; j<$scope.selectedKpis.length; j++){
      selObject.selKpis += "'" + $scope.selectedKpis[j].title + "'";
      if(j < $scope.selectedKpis.length - 1){
        selObject.selKpis += ", ";
      }
    }

    $http.post('/api/deleteDates/'+$scope.projectid, selObject).
      success(function(data, status){
        $scope.fetchDates();
      })

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

}