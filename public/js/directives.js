'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }).
  directive('a', function(){
  	return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
        	// console.log("PREVENTING IT!!!");
            if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
                elem.on('click', function(e){
                    e.preventDefault();
                });
            }
        }
   };
  }).
  directive('reportHeight', function ($timeout) {
    return function (scope, el, attrs) {
        $timeout(function(){
          console.log('offsetHeight = ' + el[0].offsetHeight);
        }, false);
        }
  });