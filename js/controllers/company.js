var companyControllers = angular.module('company.controllers', []);

companyControllers.controller('CompanyController', ['$scope', '$interval', function($scope, $interval) {
    var svg = dimple.newSvg("#chartContainer", 590, 400);
    $scope.allDates = {};
    $scope.allData = {};
    $scope.startDate = "";
    $scope.endDate = "";

    $scope.instrument = T.soundfont;
    $scope.notes = [];
    $scope.currentIndex = 0;
    $scope.isPlaying = false;

    var play;

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

    $scope.play = function() {
        $scope.isPlaying = true;
        if ($scope.currentIndex >= $scope.notes.length) {
            $scope.currentIndex = 0;
        }
        play = $interval(function() {
            $scope.instrument.play($scope.notes[$scope.currentIndex]);
            $scope.currentIndex++;
        }, 500, $scope.notes.length - $scope.currentIndex);
    };

    $scope.pause = function() {
        $scope.isPlaying = false;
        if (angular.isDefined(play)) {
            $interval.cancel(play);
            play = undefined;
        }
    };

    $scope.determineSong = function() {
        var maxHigh = Math.max.apply(null, $scope.prices);
        var minHigh = Math.min.apply(null, $scope.prices);
        var average = (maxHigh + minHigh) / 2;
        var intervalAboveAverage = (maxHigh - average) / 24;
        var intervalBelowAverage = (average - minHigh) / 24;
        for (var i = 0; i < $scope.prices.length; i++) {
            var price = $scope.prices[i];
            if (price == maxHigh) {
                note = 83;
            } else if (price == minHigh) {
                note = 36;
            } else if (price < average) {
                note = 36 + 24 - Math.floor((average - price) / intervalBelowAverage);
            } else {
                note = 60 + Math.floor((price - average) / intervalAboveAverage);
            }
            $scope.notes.push(note);
        }
        $scope.instrument.preload($scope.notes);
    };

    $scope.initialize = function() {
        $scope.instrument.setInstrument(1); // piano for now
        $scope.instrument.emptyCache();
        d3.csv('./data/prices/nasdaq/GOOGL.csv', function(data) {
            $scope.allDates = dimple.getUniqueValues(data, "Date");
            $scope.prices = dimple.getUniqueValues(data, "High");
            $scope.determineSong();
            $scope.allData = data;
            $scope.drawChart(data, null, null);
        });
    };
}]);