'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', function (version) {
    return function (text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }).
  filter('unselectedIconPositions', function() {
    return function(positions, selectedPositions) {
        return positions.filter(function(pos) {
        	// console.log("FILTER unselectedIconPositions");
            // for (var i in pos.Tags) {
            //     if (tags.indexOf(pos.Tags[i]) != -1) {
            //         return false;
            //     }
            // }
            if(selectedPositions.indexOf(pos) != -1)
            	return false;
            else
            	return true;

        });
    };
  }).
  filter('numberEx', ['numberFilter', '$locale',
      function(number, $locale) {

        var formats = $locale.NUMBER_FORMATS;
        return function(input, fractionSize) {
          //Get formatted value
          var formattedValue = number(input, fractionSize);

          //get the decimalSepPosition
          var decimalIdx = formattedValue.indexOf(formats.DECIMAL_SEP);

          //If no decimal just return
          if (decimalIdx == -1) return formattedValue;


          var whole = formattedValue.substring(0, decimalIdx);
          var decimal = (Number(formattedValue.substring(decimalIdx)) || "").toString();

          return whole +  decimal.substring(1);
        };
      }
    ]).
  filter('dataLevelsFilter', function(){
    return function(input, scope){
      var toReturn = new Array();
      var toAvoid = ['indicators', 'points'];

      for(var i=0; i<input.length; i++){
        if(toAvoid.indexOf(input[i].label) < 0){
          // toReturn.push(input[i]);
          toReturn[scope.levels.indexOf(input[i].label)] = input[i];
        }
      }

      return toReturn;
    }
  }).
  filter('dataLevelsFilterInverse', function(){
    return function(input, scope){
      var toReturn = new Array();
      var toInclude = ['indicators', 'points'];

      for(var i=0; i<input.length; i++){
        if(toInclude.indexOf(input[i].label) >= 0){
          toReturn.push(input[i]);
        }
      }

      return toReturn;
    }
  });

