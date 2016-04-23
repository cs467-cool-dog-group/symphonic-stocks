var graphControllers = angular.module('graph', []);

graphControllers.controller('GraphController', ['$scope', function($scope) {
    var svg = dimple.newSvg("#chartContainer", 590, 400);
    $scope.allDates = {};
    $scope.allData = {};
    $scope.startDate = "";
    $scope.endDate = "";

    $scope.filter = function(start, end, dates) {
		var filtered = new Array();
		for (var i=0; i < dates.length; i++){
			var curr = new Date(dates[i]);
			if (curr >= start && curr <= end){
				filtered.push(dates[i]);
			}
		}
		return filtered;
    };

    $scope.update = function(){
        var startDate = new Date($scope.startDate);
        var endDate = new Date($scope.endDate);

    	var filterDates = $scope.filter(startDate, endDate, $scope.allDates);
    	var filteredData = dimple.filterData($scope.allData, "Date", filterDates);

    	$scope.chart.svg.selectAll('*').remove();
	    $scope.drawChart(filteredData, startDate, endDate);
	};

    $scope.drawChart = function(data, start, end){
	    // Create the chart as usual
	    $scope.chart = new dimple.chart(svg, data);
	    $scope.chart.setBounds(70, 40, 490, 320);

	    // Add the x axis reading dates in the format 01 Jan 2012
	    // and displaying them 01 Jan
	    var x = $scope.chart.addTimeAxis("x", "Date", "%Y-%m-%d", "%m/%d/%Y");

	    if (start){
	    	x.overrideMin = start;
	    }
	    if (end){
		    x.overrideMax = end;
		}

	    // Add the y axis reading dates and times but only outputting
	    // times.
	    var y = $scope.chart.addMeasureAxis("y", "Close");

	    // Size the bubbles by volume
	    var z = $scope.chart.addMeasureAxis("z", "Close");

	    // Add the bubble series for shift values first so that it is
	    // drawn behind the lines
	    $scope.chart.addSeries(null, dimple.plot.bubble);

	    // Add the line series on top of the bubbles.  The bubbles
	    // and line points will naturally fall in the same places
	    var s = $scope.chart.addSeries(null, dimple.plot.line);

	    // Add line markers to the line because it looks nice
	    s.lineMarkers = true;

	    // Show a legend
	    $scope.chart.addLegend(180, 10, 360, 20, "right");

	    // Draw everything
	    $scope.chart.draw();
	};

    $scope.initialize = function() {
        // TODO: Get data
        /*d3_queue.queue()
            .defer(d3.json, './data/jsons/v1/nasdaq/TFSC/2014/2014.json')
            .defer(d3.json, './data/jsons/v1/nasdaq/TFSC/2015/2015.json')
            .defer(d3.json, './data/jsons/v1/nasdaq/TFSC/2016/2016.json')
            .awaitAll(function(error, results) {
                console.log(results);
                $scope.allData = [];
                for (var i = 0; i < results.length; i++) {
                    $scope.allData = $scope.allData.concat(results[i].year.days);
                }
                $scope.allDates = dimple.getUniqueValues($scope.allData, "Date");
                $scope.drawChart($scope.allData, null, null);
            });*/
    };
}]);