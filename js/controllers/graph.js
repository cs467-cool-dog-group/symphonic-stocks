var graphControllers = angular.module('graph', []);

graphControllers.controller('GraphController', ['$scope', function($scope) {
    var svg = dimple.newSvg("#chartContainer", 590, 400);
    $scope.allDates = {};
    $scope.allData = {};
    $scope.startDate = "";
    $scope.endDate = "";
    $scope.newStock = "";
    $scope.filteredData = [];

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
    	if ($scope.chart) {
	    	$scope.chart.svg.selectAll('*').remove();
	    }

	    // Create the chart as usual
	    $scope.chart = new dimple.chart(svg, data);
	    $scope.chart.setBounds(70, 50, 490, 320);

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
	    // Handle the hover event - overriding the default behaviour
      	s.addEventHandler("click", onClick);

	    // Add line markers to the line because it looks nice
	    s.lineMarkers = true;

	    // Show a legend
	    var myLegend = $scope.chart.addLegend(180, 10, 360, 20, "right");

	    // Draw everything
	    $scope.chart.draw();

	    // orphan the legend
        $scope.chart.legends = [];
        // add the legend title and note
        $scope.chart.svg.selectAll("title_text")
        .data(["Click legend boxes to show/hide Companies:", "Bubble size represents volume on a given day."])
        .enter()
        .append("text")
        .attr("x", 100)
        .attr("y", function (d, i) { return 15 + i * 14; })
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .style("color", "Black")
        .text(function (d) { return d; });	

        // get unique list of sentiment values
        var filterValues = dimple.getUniqueValues(data, "Company");
        // get all colored rectangles from legend
        myLegend.shapes.selectAll("rect")
        	// add a click event to each rectangle
            .on("click", function (e) {
              	// indicates if the item is already visible or not
              	var hide = false;
              	var newFilters = [];
              	// if the filters contain the clicked shape, hide it
              	filterValues.forEach(function (f) {
              		if (f === e.aggField.slice(-1)[0]) {
                		hide = true;
              		} else {
                		newFilters.push(f);
              		}
              	});
              	// hide the shape or show it
              	if (hide) {
                	d3.select(this).style("opacity", 0.2);
              	} else {
                	newFilters.push(e.aggField.slice(-1)[0]);
                	d3.select(this).style("opacity", 0.8);
              	}
              	// update filters
              	filterValues = newFilters;
              	// filter data
              	$scope.chart.data = dimple.filterData(data, "Company", filterValues);
              	// redraw and animate the chart
              	$scope.chart.draw();
            });

	    // Event to handle mouse click
    	function onClick(e) {
      		var d = new Date(e.xValue);
      		$scope.currDate = (d.getMonth()+1) + "-" + d.getDate() + "-" + d.getFullYear();
      		$scope.companyTicker = e.seriesValue[0];
      		console.log($scope.currDate);
      		console.log($scope.companyTicker);
            $scope.$digest();
      	};
	};

    $scope.initialize = function() {
        // TODO: Get data
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
    };
}]);