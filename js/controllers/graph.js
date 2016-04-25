var graphControllers = angular.module('graph', []);

graphControllers.controller('GraphController', ['$scope', '$location', '$compile',function($scope, $location, $compile) {
    var svg = dimple.newSvg("#chartContainer", 590, 400);
    $scope.allDates = {};
    $scope.allData = {};
    $scope.startDate = "";
    $scope.endDate = "";
    $scope.newStock = "";
    $scope.filteredData = [];
    $scope.stockList = [];
	$scope.loc = $location.path();
	$scope.buttons = {};

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
    	console.log('updating...');
    	startDate = new Date($scope.startDate);
    	endDate = new Date($scope.endDate);

    	var filterDates = $scope.filter(startDate, endDate, $scope.allDates);
    	$scope.filteredData = dimple.filterData($scope.allData, "Date", filterDates);

	    $scope.drawChart($scope.filteredData, startDate, endDate);
	};

	$scope.showAllTime = function(){
		$scope.filteredData = $scope.allData;
		$scope.startDate = "";
		$scope.endDate = "";
		$scope.drawChart($scope.filteredData, $scope.startDate, $scope.endDate);
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

            	var filterNewDates, filteredNewData;
	            //if there are dates to filter by
	            if ($scope.startDate && $scope.endDate){
	            	//filter out all dates we don't need
					filterNewDates = $scope.filter($scope.startDate, $scope.endDate, newDates);

					//get filtered data
					filteredNewData = dimple.filterData(newData, "Date", filterNewDates);

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

				var button = '<button ng-click="removeStock(\''
								+ newStock + '\')" class="btn btn-default" id=\''
								+ newStock + '\'>'
								+ newStock + ' | x</button>';
				var compiled = $compile(button)($scope);
				$('#addedStocks').append(compiled);

				$scope.buttons[newStock] = button;
				$scope.stockList.push(newStock);
			});
	};

	$scope.removeStock = function(stockName){
		console.log('removing ' + stockName);

		var idx = $scope.stockList.indexOf(stockName);
		$scope.stockList.splice(idx, 1);


		$($scope.buttons[stockName]).remove();

		$scope.allData = dimple.filterData($scope.allData, "Company", $scope.stockList);
		$scope.allDates = dimple.getUniqueValues($scope.allData, "Date");

		$('#' + stockName).remove();

		if ($scope.startDate || $scope.endDate){
			$scope.update();
		}
		else{
			$scope.filteredData = $scope.allData;
			$scope.drawChart($scope.filteredData, $scope.startDate, $scope.endDate);
		}

		console.log('finished removing');
	};

    $scope.drawChart = function(data, start, end){
    	console.log('drawing...');
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
	    var myLegend = $scope.chart.addLegend(180, 10, 360, 20, "right");

	    // Draw everything
	    $scope.chart.draw();

	    console.log('finished drawing');
	};

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

					$scope.stockList.push("^DJI");
					$scope.stockList.push("^GSPC");
					$scope.stockList.push("^IXIC");

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

					$scope.stockList.push("TMUS");
					$scope.drawChart($scope.allData, "", "");
				});
		}
    };
}]);