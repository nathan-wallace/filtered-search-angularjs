// JavaScript Document
'use strict';
var app = angular.module('ObitApp', ['ngRoute', 'ngAnimate', 'angular-bootstrap-select', 'ui.bootstrap', 'ui.bootstrap.tpls']);
app.config(function ($routeProvider){
	$routeProvider
	
	.when('/', {
		templateUrl: './pages/main.html',
		controller: 'mainController'
	})
	.when('/edit', {
		templateUrl: './pages/edit.html',
		controller: 'mainController'
	})
});

// ANGULAR FILTERS

app.filter('startFrom', function () {
	return function (input, start) {
		if (input) {
			start = +start;
			return input.slice(start);
		}
		return [];
	};
});

app.filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});


//filter Multiple...
app.filter('filterMultiple',['$filter',function ($filter) {
	return function (items, keyObj) {
		var filterObj = {
							data:items,
							filteredData:[],
							applyFilter : function(obj,key){
								var fData = [];
								if(this.filteredData.length == 0)
									this.filteredData = this.data;
								if(obj){
									var fObj = {};
									if(!angular.isArray(obj)){
										fObj[key] = obj;
										fData = fData.concat($filter('filter')(this.filteredData,fObj));
									}else if(angular.isArray(obj)){
										if(obj.length > 0){	
											for(var i=0;i<obj.length;i++){
												if(angular.isDefined(obj[i])){
													fObj[key] = obj[i];
													fData = fData.concat($filter('filter')(this.filteredData,fObj));	
												}
											}
											
										}										
									}									
									if(fData.length > 0){
										this.filteredData = fData;
									}
								}
							}
				};

		if(keyObj){
			angular.forEach(keyObj,function(obj,key){
				filterObj.applyFilter(obj,key);
			});			
		}
		
		return filterObj.filteredData;
	}
}]);

// END ANGULAR FILTERS

// ANGULAR CONTROLLERS
app.controller('mainController', ['$scope', '$location', '$http', '$timeout','filterFilter', '$modal', '$filter', '$log', '$window', function($scope, $location, $http, $timeout, filterFilter, $modal, $filter, $log, $window){
	
	$scope.obituaries;
	$http.get('./data/obits.json').
    success(function(data, status, headers, config) {
      $scope.obituaries = data;
	  $scope.initPage();
    }).
    error(function(data, status, headers, config) {
      // log error
	  console.log('data load error');
    });
	
	$scope.years = [2010,2009,2008,2007,2006,2005,2004,2003,2002,2001,2000,1999,1998,1997,1996,1995,1994,1993,1992,1991,1990,1989,1988,1987,1986,1985,1984,1983,1982,1981,1980,1979,1978,1977,1976,1975,1974,1973,1972,1971,1970,1969,1968,1967,1966,1965,1964,1963,1962,1961,1960,1959,1958,1957,1956,1955,1954,1953,1952,1951,1950,1949,1948,1947,1946,1945,1944,1943,1942,1941,1940,1939,1938,1937,1936,1935,1934,1933,1932,1931,1930,1929,1928,1927,1926,1925,1924,1923,1922,1921,1920,1919,1918,1917,1916,1915,1914,1913,1912,1911,1910,1909,1908,1907,1906,1905,1904,1903,1902,1901,1900];
	
	$scope.degrees = ['BA','BSBA','BALS','BSFS','BSN','DDS','JD','LHD','LLB','LLM','MA','MAL','MBA','MD','PHD'];
	
	// Only enable "back to top" if the document has a long scroll bar
	// Note the window height + offset
	/*if ( ($(window).height() + 100) < $(document).height() ) {
		$('#top-link-block').removeClass('hidden').affix({
			// how far to scroll down before link "slides" into view
			offset: {top:100}
		});
	}*/
	//END "back to top"
	
	// create empty search model (object) to trigger $watch on update
	$scope.search = [];
	$scope.searchName = '';
	$scope.selectedYear= '$';
	$scope.selectedDegree= '$';;
	$scope.queryBy = {};
	$scope.initPage = function(){
 
	$scope.resetFilters = function () {
		// needs to be a function or it won't trigger a $watch
		$scope.search = {};
		$scope.searchName = '';
		$scope.selectedYear = '$';
		$scope.selectedDegree = '$';
	};
 
	// pagination controls
	$scope.currentPage = 1;
	$scope.totalItems = $scope.obituaries.length;
	$scope.entryLimit = 9; // items per page
	$scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
 
	// $watch search to update pagination
	$scope.$watch('search', function (newVal, oldVal) {
		$scope.filtered = filterFilter($scope.obituaries, newVal);
		//$scope.filtered = $filter('filterMultiple')($scope.obituaries, newVal);
		$timeout(function() {
			$scope.totalItems = $scope.filtered.length;
			$scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
			$scope.currentPage = 1;
    	}, 100);
	}, true);
	
	//setting the query by year selected
	$scope.$watch('searchName', function (newVal, oldVal) {
		$scope.queryBy = {name:$scope.searchName, y1:$scope.selectedYear,y2:$scope.selectedYear,y3:$scope.selectedYear,y4:$scope.selectedYear};
		$scope.search = [$scope.queryBy];
	}, true);
	
	$scope.$watch('selectedYear', function (newVal, oldVal) {
		$scope.queryBy = {name:$scope.searchName, y1:$scope.selectedYear,y2:$scope.selectedYear,y3:$scope.selectedYear,y4:$scope.selectedYear};
		$scope.search = [$scope.queryBy];
	}, true);
	
	//use below if click is required to refine search
	/*$scope.selectYear = function(){
		console.log($scope.selectedYear);
		$scope.queryBy = {name:$scope.searchName, y1:$scope.selectedYear,y2:$scope.selectedYear,y3:$scope.selectedYear,y4:$scope.selectedYear};
		console.log($scope.queryBy)
		$scope.search = [$scope.queryBy];
	};*/
	$scope.$watch('selectedDegree', function (newVal, oldVal) {
		$scope.queryBy = {name:$scope.searchName, y1:$scope.selectedYear,y2:$scope.selectedYear,y3:$scope.selectedYear,y4:$scope.selectedYear, d1:$scope.selectedDegree,d2:$scope.selectedDegree,d3:$scope.selectedDegree,d4:$scope.selectedDegree};
		$scope.search = [$scope.queryBy];
		
	}, true);
	};
	
	// SECTION - CLEARS RESPONSIVE GRID ROWS FOR DIFFERENT HEIGHTS.
	$scope.w = angular.element($window);
	$scope.windowWidth;
	$scope.w.bind('resize', function () {
		$scope.windowWidth = $window.innerWidth;
		$scope.rowPolyfill();
	});
	
	$scope.rowPolyfill = function() {
		$('.multi-columns-row > [class^="col-"]').removeClass('first-in-row');
		if ($scope.windowWidth > 1200) {
			$('.multi-columns-row > .col-lg-6:nth-child(2n + 3)').addClass('first-in-row');
			$('.multi-columns-row > .col-lg-4:nth-child(3n + 4)').addClass('first-in-row');
			$('.multi-columns-row > .col-lg-3:nth-child(4n + 5)').addClass('first-in-row');
			$('.multi-columns-row > .col-lg-2:nth-child(6n + 7)').addClass('first-in-row');
			$('.multi-columns-row > .col-lg-1:nth-child(12n + 13)').addClass('first-in-row');
		} else if ($scope.windowWidth >= 992) {
			$('.multi-columns-row > .col-md-6:nth-child(2n + 3)').addClass('first-in-row');
			$('.multi-columns-row > .col-md-4:nth-child(3n + 4)').addClass('first-in-row');
			$('.multi-columns-row > .col-md-3:nth-child(4n + 5)').addClass('first-in-row');
			$('.multi-columns-row > .col-md-2:nth-child(6n + 7)').addClass('first-in-row');
			$('.multi-columns-row > .col-md-1:nth-child(12n + 13)').addClass('first-in-row');
		} else if ($scope.windowWidth >= 768) {
			$('.multi-columns-row > .col-sm-6:nth-child(2n + 3)').addClass('first-in-row');
			$('.multi-columns-row > .col-sm-4:nth-child(3n + 4)').addClass('first-in-row');
			$('.multi-columns-row > .col-sm-3:nth-child(4n + 5)').addClass('first-in-row');
			$('.multi-columns-row > .col-sm-2:nth-child(6n + 7)').addClass('first-in-row');
			$('.multi-columns-row > .col-sm-1:nth-child(12n + 13)').addClass('first-in-row');
		} else {
			$('.multi-columns-row > .col-xs-6:nth-child(2n + 3)').addClass('first-in-row');
			$('.multi-columns-row > .col-xs-4:nth-child(3n + 4)').addClass('first-in-row');
			$('.multi-columns-row > .col-xs-3:nth-child(4n + 5)').addClass('first-in-row');
			$('.multi-columns-row > .col-xs-2:nth-child(6n + 7)').addClass('first-in-row');
			$('.multi-columns-row > .col-xs-1:nth-child(12n + 13)').addClass('first-in-row');
		}
	}	
	// END SECTION - CLEARS RESPONSIVE GRID ROWS FOR DIFFERENT HEIGHTS.
	
	//Modal Functionality
	$scope.open = function (size, obit) { //passed size and the obit which was clicked
		var modalInstance = $modal.open({
		  templateUrl: 'singleObituary.html', //gets this from inside of main.html
		  controller: 'ModalInstanceCtrl', //controller is below
		  size: size,
		  resolve: {
			obit: function () {
			  return obit;
			}
		  }
		});
		modalInstance.result.then(function () {
		}, function () {
		  $log.info('Modal dismissed at: ' + new Date());
		});
	};
}]);


app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, obit) {
  $scope.obituary = obit;
  //console.log($scope.obituary);
  $scope.ok = function () {
    $modalInstance.close($scope.obituary);
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
// END ANGULAR CONTROLLERS  

// ADD-ON MODULES
//BELOW MAKES DROP DOWN SELECTABLES PRETTY - PROVIDES selectpicker DIRECTIVE

/**
* inject angular-bootstrap-select
* https://raw.githubusercontent.com/joaoneto/angular-bootstrap-select/v0.0.4/src/angular-bootstrap-select.js
*/
angular.module('angular-bootstrap-select', [])
	.directive('selectpicker', ['$parse', function ($parse) {
	return {
	  restrict: 'A',
	  link: function (scope, element, attrs) {
		element.selectpicker($parse(attrs.selectpicker)());
		element.selectpicker('refresh');
		
		scope.$watch(attrs.ngModel, function (newVal, oldVal) {
		  scope.$parent[attrs.ngModel] = newVal;
		  scope.$evalAsync(function () {
			if (!attrs.ngOptions || /track by/.test(attrs.ngOptions)) element.val(newVal);
			element.selectpicker('refresh');
		  });
		});
		
		scope.$on('$destroy', function () {
		  scope.$evalAsync(function () {
			element.selectpicker('destroy');
		  });
		});
	  }
	};
}]);
// END ADD-ON MODULES