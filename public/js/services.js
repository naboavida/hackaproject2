'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  factory('socket', function (socketFactory) {
    return socketFactory();
  }).
  factory('socketSelf', function($rootScope) {
    var sSelf = {};
    sSelf.emit = function (data) {
      $rootScope.$broadcast('socketSelf', data);
    };
    return sSelf;
  }).
  factory('sharedCommsService', function($rootScope){
    var sharedService = {};
    sharedService.message = '';
    sharedService.addMessage = '';
    sharedService.pointsToRefresh = new Array();
    sharedService.pointsToRefresh2 = new Array();
    sharedService.deletePid = -1;
    sharedService.widgetFilter = {};
    sharedService.filteringPointsDraw = false;
    sharedService.pointIdsToFilter = new Array();
    sharedService.occurrence = {};
    sharedService.pid = -1;
    sharedService.wid = -1;
    sharedService.messageFilter = ''; 
    sharedService.filterSpec = {};

    sharedService.bufferAndBroadcast = function (message){
      this.message = message;
      this.broadcastMessage();
    };

    sharedService.broadcastMessage = function(){
      $rootScope.$broadcast('handleBroadcast')  ;
    };

    sharedService.broadcastFilter = function(){
      $rootScope.$broadcast('handleBroadcastFilter')  ;
    };

    return sharedService;
  }).
  service('dateService', function($rootScope){
      
      var dates = {};

      function toggleDateFilter () {

        console.log("toggleDateFilter");

        var foundFalse = false;
        var startDate = new Date(dates.startDate);
        var endDate = new Date(dates.endDate);
        var widget = new Date(dates.widget);

        if (startDate > widget || endDate > widget) {
      
            return {
              dateWarnMessage: "Latest date is",
              dateWarn: true,
              foundFalse: true
            }
        }
        // with datepicker this is not used
        else if (startDate > endDate && endDate != "") {
            
            return {
              dateWarnMessage: "Verify your dates",
              dateWarn: true,
              foundFalse: true
            }
        } 

        if (startDate != undefined && endDate != undefined && startDate <= endDate && foundFalse == false) {

            dates.state = true;

            return {
              foundFalse: false,
              dateWarn: false,
              dates
            }
        }   
      }

    this.togglePreDates = function(value, widget) {

        console.log('preDates')

        var start = null;
        var end = null;

        var lastSample = new Date(widget);

        if(value == 'today') {
            start = new Date();
            end = new Date();
        } else if (value == 'yesterday') {
            start = new Date();
            start.setDate(start.getDate() - 1);

            end = new Date();
            end.setDate(end.getDate() - 1);
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

        //var startMonth = start.getMonth() + 1;
        //var endMonth = end.getMonth() + 1;
        //var endDay = end.getDate();
        //var startDay = start.getDate();

        //if (startMonth < 10) startMonth = '0' + startMonth;
        //if (endMonth < 10) endMonth = '0' + endMonth;

        //if (startDay < 10) startDay = '0' + startDay;
        //if (endDay < 10) endDay = '0' + endDay;


        dates.startDate = start;
        dates.endDate = end;

        return dates;
    }

    this.toggleDatepicker = function (startDate, endDate, widget) {

      if(startDate != undefined && endDate != undefined){

          
          dates.startDate = startDate;
          dates.endDate = endDate;
          dates.widget = widget;

          return toggleDateFilter();
      }
    }

    this.formatDate = function(date){
  
          var dt = new Date(date)

          var day = dt.getDate();
          var month = dt.getMonth() + 1;

          if ((dt.getMonth() + 1) < 10) 
                month = '0' + (dt.getMonth() + 1)
          
          if (dt.getDate() < 10) 
                day = '0' + dt.getDate();

          dt = day + "/" + month + "/" + dt.getFullYear();  

          return dt;
    }

    this.getCurrentPeriod = function (startDate, endDate) {
        var number = (endDate.diff(startDate, 'days'));

        return {
            startDate: new Date (moment().subtract(number, 'days')),
            endDate: new Date()
        }
    }
      
  }).
  value('version', '0.1');
