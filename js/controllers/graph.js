var graphControllers = angular.module('graph', []);

graphControllers.controller('GraphController', ['$scope', '$location', '$compile', 'Company', 'News', function($scope, $location, $compile, Company, News) {
    var svg = dimple.newSvg("#chartContainer", 800, 550);
    $scope.allDates = {};
    $scope.allData = {};
    $scope.startDate = "";
    $scope.endDate = "";
    $scope.newStock = "";
    $scope.filteredData = [];
    $scope.stockList = [];

	$scope.loc = $location.path();
	$scope.buttons = {};
	$scope.yearsPulled = [];
    $scope.yearStart = 2000;
    $scope.exploreOwn = true;


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
    	//assuming user input is good for now...
    	startDate = new Date($scope.startDate);
    	endDate = new Date($scope.endDate);

    	var minYear = Math.min.apply(null, $scope.yearsPulled);
    	var maxYear = Math.max.apply(null, $scope.yearsPulled);

    	var newMinYear = startDate.getFullYear();
    	var newMaxYear = endDate.getFullYear();

    	var path = $scope.loc == "/index" ? "indexes" : "sample";

    	console.log($scope.stockList);

    	if (newMinYear < minYear){
    		var q = d3_queue.queue();
    		for (var i=0; i<$scope.stockList.length; i++){
				for (var year=newMinYear; year<minYear; year++){
                    if (year >= $scope.firstYears[$scope.stockList[i].ticker])
					    q.defer(d3.json, './data/jsons/' + path + '/' + $scope.stockList[i].ticker + '/' + year.toString() + '.json');
					$scope.yearsPulled.push(year);
				}
			}
			q.awaitAll(function(error, results) {
				var newData = [];
				for (var i = 0; i < results.length; i++) {
					newData = newData.concat(results[i].year.days);
				}
				$scope.allData = $scope.allData.concat(newData);

				var newDates = dimple.getUniqueValues(newData, "Date");
				$scope.allDates = $scope.allDates.concat(newDates);

				var filterDates = $scope.filter(startDate, endDate, $scope.allDates);
		    	$scope.filteredData = dimple.filterData($scope.allData, "Date", filterDates);

			    $scope.drawChart($scope.filteredData, startDate, endDate);
			});
    	}

    	if (newMaxYear > maxYear){
    		var q = d3_queue.queue();
    		for (var i=0; i<$scope.stockList.length; i++){
				for (var year=maxYear+1; year<=newMaxYear; year++){
					q.defer(d3.json, './data/jsons/' + path + '/' + $scope.stockList[i].ticker + '/' + year.toString() + '.json');
					$scope.yearsPulled.push(year);
				}
			}
			q.awaitAll(function(error, results) {
				var newData = [];
				for (var i = 0; i < results.length; i++) {
					newData = newData.concat(results[i].year.days);
				}
				$scope.allData = $scope.allData.concat(newData);

				var newDates = dimple.getUniqueValues(newData, "Date")
				$scope.allDates = $scope.allDates.concat(newDates);

				var filterDates = $scope.filter(startDate, endDate, $scope.allDates);
		    	$scope.filteredData = dimple.filterData($scope.allData, "Date", filterDates);

			    $scope.drawChart($scope.filteredData, startDate, endDate);
			});
    	}

    	if (newMinYear >= minYear && newMaxYear <= maxYear){
	    	var filterDates = $scope.filter(startDate, endDate, $scope.allDates);
	    	$scope.filteredData = dimple.filterData($scope.allData, "Date", filterDates);

		    $scope.drawChart($scope.filteredData, startDate, endDate);
		}
	};

    $scope.updateYear = function() {
        console.log($scope.yearStart);
        $scope.exploreOwn = false;
        $scope.yearStart = +$scope.yearStart;
        $scope.startDate = new Date($scope.yearStart, 0, 1);
        $scope.endDate = new Date($scope.yearStart + 1, 0, 1);
        $scope.update();
    };

    $scope.updateYearFromAudio = function() {
        $scope.yearStart = +$scope.yearStart;
        $scope.yearStart += 1;
        $scope.updateYear();
    };

	$scope.showAllTime = function(){
		$scope.filteredData = $scope.allData;
		$scope.startDate = "";
		$scope.endDate = "";
		$scope.drawChart($scope.filteredData, $scope.startDate, $scope.endDate);
	};

	$scope.addStock = function(){
		var newStock = ($scope.newStock).toUpperCase();
		q = d3_queue.queue();
		for (var i=0; i<$scope.yearsPulled.length; i++){
			q.defer(d3.json, './data/jsons/sample/' + newStock + '/' + $scope.yearsPulled[i].toString() + '.json');
		}
		q.awaitAll(function(error, results) {
			//get new stock's data
			var newData = [];
		 	for (var i = 0; i < results.length; i++) {
                newData = newData.concat(results[i].year.days);
            }
            var companyName = newData[0].Company;

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
							+ newStock + ' | X</button>';
			var compiled = $compile(button)($scope);
			$('#addedStocks').append(compiled);

			$scope.buttons[newStock] = button;
			$scope.stockList.push({ticker: newStock, co: companyName});
		});
	};

	$scope.removeStock = function(stockName){
		console.log('removing ' + stockName);

		$scope.stockList = $scope.stockList.filter(function(o) {
            return o.ticker != stockName;
        });

		$($scope.buttons[stockName]).remove();

		$scope.allData = dimple.filterData($scope.allData, "Company", $scope.stockList.map(function(l) { return l.co; }));
        console.log($scope.allData);
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
	    $scope.chart.setBounds(70, 50, 700, 400);

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
	    var z = $scope.chart.addMeasureAxis("z", "Normalized Volume");

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
	    var myLegend = $scope.chart.addLegend(10, 10, 700, 40, "right");

	    // Draw everything
	    $scope.chart.draw();

	    // orphan the legend
        $scope.chart.legends = [];
        // add the legend title and note
        /*$scope.chart.svg.selectAll("title_text")
        .data(["Click legend boxes to show/hide Companies:", "Bubble size represents volume on a given day."])
        .enter()
        .append("text")
        .attr("x", 100)
        .attr("y", function (d, i) { return 15 + i * 14; })
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .style("color", "Black")
        .text(function (d) { return d; });*/

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
        console.log(e);
      		var d = new Date(e.xValue);
      		var month = d.getMonth() + 1;
      		var day = d.getDate();
      		if(month < 10){
      			month = '0' + month;
      		}
      		if(day < 10){
      			day = '0' + day;
      		}
      		$scope.currDate = month + "-" + day + "-" + d.getFullYear();
      		$scope.company = e.seriesValue[0];
            $scope.$digest();
      	};

	    console.log('finished drawing');

	};

    $scope.drawPortfolio = function() {
        if (!$scope.selectedPortfolio) {
            return;
        }
        var q = d3_queue.queue();
        for (var i = 0; i < $scope.selectedCompanies.length; i++) {
        	for (var year=2016; year<=2016; year++){
	            q.defer(d3.json, './data/jsons/sample/' + $scope.selectedCompanies[i] + '/' + year.toString() + '.json');
	        }
            $scope.stockList.push($scope.selectedCompanies[i]);
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

        Company.getFirstYears().then(function(results) {
            $scope.firstYears = results.data;
        });

		if($scope.loc == "/index"){
			var indexQ = d3_queue.queue();
			for (var year=2014; year<=2016; year++){
				indexQ.defer(d3.json, './data/jsons/indexes/^DJI/' + year.toString() + '.json');
				indexQ.defer(d3.json, './data/jsons/indexes/^GSPC/' + year.toString() + '.json');
				indexQ.defer(d3.json, './data/jsons/indexes/^IXIC/' + year.toString() + '.json');
				$scope.yearsPulled.push(year);
			}

			indexQ.awaitAll(function(error, results) {
				$scope.allData = [];
				for (var i = 0; i < results.length; i++) {
					$scope.allData = $scope.allData.concat(results[i].year.days);
				}
				$scope.allDates = dimple.getUniqueValues($scope.allData, "Date");
				$scope.filteredData = $scope.allData;

				$scope.stockList.push({ticker:"^DJI", co: "Dow Jones Industrial Average"});
				$scope.stockList.push({ticker:"^GSPC", co: "S&P 500"});
				$scope.stockList.push({ticker:"^IXIC", co: "Nasdaq Composite"});

				$scope.drawChart($scope.allData, "", "");
			});
		}

		if($scope.loc == "/companies"){
			var companyQ = d3_queue.queue();
			for (var year=2014; year<=2016; year++){
				companyQ.defer(d3.json, './data/jsons/sample/TMUS/' + year.toString() + '.json');
				$scope.yearsPulled.push(year);
			}

			companyQ.awaitAll(function(error, results) {
				$scope.allData = [];
				for (var i = 0; i < results.length; i++) {
					$scope.allData = $scope.allData.concat(results[i].year.days);
				}
				$scope.allDates = dimple.getUniqueValues($scope.allData, "Date");
				$scope.filteredData = $scope.allData;

				$scope.stockList.push({ticker: "TMUS", co: "T-Mobile US"});
                var button = '<button ng-click="removeStock(\''
    							+ $scope.stockList[0].ticker + '\')" class="btn btn-default" id=\''
    							+ $scope.stockList[0].ticker + '\'>'
    							+ $scope.stockList[0].ticker + ' | X</button>';
    			var compiled = $compile(button)($scope);
                $scope.buttons["TMUS"] = button;
    			$('#addedStocks').append(compiled);
				$scope.drawChart($scope.allData, "", "");
			});
		}
    };
}]);