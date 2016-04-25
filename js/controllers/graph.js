var graphControllers = angular.module('graph', []);

graphControllers.controller('GraphController', ['$scope', '$location',function($scope, $location) {
    var svg = dimple.newSvg("#chartContainer", 590, 400);
    $scope.allDates = {};
    $scope.allData = {};
    $scope.startDate = "";
    $scope.endDate = "";
    $scope.newStock = "";
    $scope.filteredData = [];
	$scope.loc = $location.path();
    $scope.filter = function(start, end, dates) {
    	if (!(start instanceof Date)){
	    	start = new Date(start);
	    }
    	if (!(end instanceof Date)){
    		end = new Date(end);
    	}
		var filtered = [];
		for (var i=0; i < dates.length; i++){
			var curr = new Date(dates[i]);
			if (curr >= start && curr <= end){
				filtered.push(dates[i]);
			}
		}
		return filtered;
    };

    $scope.update = function(){
    	startDate = new Date($scope.startDate);
    	endDate = new Date($scope.endDate);

    	var filterDates = $scope.filter(startDate, endDate, $scope.allDates);
    	$scope.filteredData = dimple.filterData($scope.allData, "Date", filterDates);

	    $scope.drawChart($scope.filteredData, startDate, endDate);
	};

	$scope.addStock = function(){
		var newStock = ($scope.newStock).toUpperCase();
		d3_queue.queue()
			.defer(d3.json, './data/jsons/sample/' + newStock + '/2014.json')
			.defer(d3.json, './data/jsons/sample/' + newStock + '/2015.json')
			.defer(d3.json, './data/jsons/sample/' + newStock + '/2016.json')
			.awaitAll(function(error, results) {
				//get new stock's data
				var newData = [];
			 	for (var i = 0; i < results.length; i++) {
	                newData = newData.concat(results[i].year.days);
	            }

	            $scope.allData = $scope.allData.concat(newData);

	            //get all new stock's dates
            	var newDates = dimple.getUniqueValues(newData, "Date");
            	$scope.allDates = $scope.allDates.concat(newDates);

	            //if there are dates to filter by
	            if ($scope.startDate && $scope.endDate){
	            	//filter out all dates we don't need
					var filterNewDates = $scope.filter($scope.startDate, $scope.endDate, newDates);

					//get filtered data
					var filteredNewData = dimple.filterData(newData, "Date", filterNewDates);

					//add new stock's filtered data to all of the filtered data
					$scope.filteredData = $scope.filteredData.concat(filteredNewData);
				}
				else{
					$scope.filteredData = $scope.filteredData.concat(newData);
				}

	    		$scope.drawChart($scope.filteredData, $scope.startDate, $scope.endDate);
                $scope.$digest();
	    		/*
	    		if the other stuff doesn't work >:T
	    		$scope.filteredData = $scope.filteredData.concat(newData);
				$scope.update();
				*/
			});
	};

    $scope.drawChart = function(data, start, end){
		console.log(data.length);
    	if ($scope.chart) {
	    	$scope.chart.svg.selectAll('*').remove();
	    }

	    // Create the chart as usual
	    $scope.chart = new dimple.chart(svg, data);
	    $scope.chart.setBounds(70, 40, 490, 320);

	    // Add the x axis reading dates in the format 01 Jan 2012
	    // and displaying them 01 Jan
	    var x = $scope.chart.addTimeAxis("x", "Date", "%Y-%m-%d", "%m/%d/%Y");

	    if (start){
	    	if (!(start instanceof Date)){
		    	start = new Date(start);
		    }
	    	x.overrideMin = start;
	    }
	    if (end){
	    	if (!(end instanceof Date)){
	    		end = new Date(end);
	    	}
		    x.overrideMax = end;
		}

	    // Add the y axis reading dates and times but only outputting
	    // times.
	    var y = $scope.chart.addMeasureAxis("y", "Close");

	    // Size the bubbles by volume
	    var z = $scope.chart.addMeasureAxis("z", "Volume");

	    // Add the bubble series for shift values first so that it is
	    // drawn behind the lines
	    $scope.chart.addSeries("Company", dimple.plot.bubble);

	    // Add the line series on top of the bubbles.  The bubbles
	    // and line points will naturally fall in the same places
	    var s = $scope.chart.addSeries("Company", dimple.plot.line);

	    // Add line markers to the line because it looks nice
	    s.lineMarkers = true;

	    // Show a legend
	    $scope.chart.addLegend(180, 10, 360, 20, "right");

	    // Draw everything
	    $scope.chart.draw();
	};

    $scope.drawPortfolio = function() {
        if ($scope.selectedPortfolio.length == 0) {
            return;
        }
        var q = d3_queue.queue();
        for (var i = 0; i < $scope.selectedCompanies.length; i++) {
            //q.defer(d3.json, './data/jsons/sample/' + $scope.selectedCompanies[i] + '/2014.json');
            //q.defer(d3.json, './data/jsons/sample/' + $scope.selectedCompanies[i] + '/2015.json');
            q.defer(d3.json, './data/jsons/sample/' + $scope.selectedCompanies[i] + '/2016.json');
        }
        q.awaitAll(function(error, results) {
            $scope.allData = [];
            for (var i = 0; i < results.length; i++) {
                $scope.allData = $scope.allData.concat(results[i].year.days);
            }
            $scope.allDates = dimple.getUniqueValues($scope.allData, "Date");
            $scope.filteredData = $scope.allData;
            $scope.drawChart($scope.allData, "", "");
        });
    };

    $scope.$watch('selectedPortfolio', $scope.drawPortfolio, true);

    $scope.initialize = function() {
		console.log($scope.loc);
		if($scope.loc == "/index"){
			d3_queue.queue()
				.defer(d3.json, './data/jsons/indexes/^DJI/2014.json')
				.defer(d3.json, './data/jsons/indexes/^DJI/2015.json')
				.defer(d3.json, './data/jsons/indexes/^DJI/2016.json')
				.defer(d3.json, './data/jsons/indexes/^GSPC/2014.json')
				.defer(d3.json, './data/jsons/indexes/^GSPC/2015.json')
				.defer(d3.json, './data/jsons/indexes/^GSPC/2016.json')
				.defer(d3.json, './data/jsons/indexes/^IXIC/2014.json')
				.defer(d3.json, './data/jsons/indexes/^IXIC/2015.json')
				.defer(d3.json, './data/jsons/indexes/^IXIC/2016.json')
				.awaitAll(function(error, results) {
					$scope.allData = [];
					for (var i = 0; i < results.length; i++) {
						$scope.allData = $scope.allData.concat(results[i].year.days);
					}
					$scope.allDates = dimple.getUniqueValues($scope.allData, "Date");
					$scope.filteredData = $scope.allData;
					$scope.drawChart($scope.allData, "", "");
				});
		}
		if($scope.loc == "/companies"){
			d3_queue.queue()
				.defer(d3.json, './data/jsons/sample/TMUS/2014.json')
				.defer(d3.json, './data/jsons/sample/TMUS/2015.json')
				.defer(d3.json, './data/jsons/sample/TMUS/2016.json')
				.awaitAll(function(error, results) {
					$scope.allData = [];
					for (var i = 0; i < results.length; i++) {
						$scope.allData = $scope.allData.concat(results[i].year.days);
					}
					$scope.allDates = dimple.getUniqueValues($scope.allData, "Date");
					$scope.filteredData = $scope.allData;
					$scope.drawChart($scope.allData, "", "");
				});
		}
        // TODO: Get data

    };
}]);