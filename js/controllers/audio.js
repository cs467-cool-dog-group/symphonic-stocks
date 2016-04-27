var audioControllers = angular.module('audio', []);

audioControllers.controller('AudioController', ['$scope', '$interval', function($scope, $interval) {
    $scope.instrument = T.soundfont;
    $scope.notes = [];
    $scope.currCompanies = [];
    $scope.currentIndex = 0;
    $scope.isPlaying = false;

    $scope.midiNumbers = [58, 57, 72, 74, 43, 1, 41];
    $scope.midiInstrumentNames = ['trombone', 'trumpet', 'clarinet', 'flute', 'cello', 'piano', 'violin'];
    $scope.xValue;
    var play;

    $scope.play = function() {
        $scope.isPlaying = true;
        var xValArray = [];
        for(var i = 0; i < $scope.chart.series[0].shapes[0].length; i++){
            xValArray.push($scope.chart.series[0].shapes[0][i].cx.animVal.value);
        }
        xValArray.sort();
        $scope.xValue = xValArray[0];
        var step = xValArray[1] - xValArray[0];
        console.log(xValArray);
        if ($scope.currentIndex >= $scope.notes[0].length) {
            $scope.currentIndex = 0;
        }
        play = $interval(function() {
            for (var i = 0; i < $scope.currCompanies.length; i++) {
                if (i < $scope.midiNumbers.length)
                    $scope.instrument.setInstrument($scope.midiNumbers[i]);
                else
                    $scope.instrument.setInstrument($scope.midiNumbers[$scope.midiNumbers.length - 1]);
                $scope.instrument.play($scope.notes[i][$scope.currentIndex]);
            }
            //console.log($scope.chart.series[0].shapes[0][2].cx.animVal.value);
            $scope.draw($scope.xValue);
            $scope.currentIndex++;
            if ($scope.currentIndex == $scope.notes[0].length) {
                $scope.isPlaying = false;
            }
            $scope.xValue += step;
            //console.log($scope.chart.series[0].shapes[0]);
            //console.log($scope.chart.series[0].shapes[0][1].cx.animVal.value);
        }, 700, $scope.notes[0].length - $scope.currentIndex);
    };
    $scope.draw = function(xValue) {
        var cursorLine = document.getElementById("cursorLine");
        cursorLine.style.left = xValue+ "px";
    }

    $scope.pause = function() {
        $scope.isPlaying = false;
        if (angular.isDefined(play)) {
            $interval.cancel(play);
            play = undefined;
        }
    };

    $scope.determineSong = function() {
        $scope.currCompanies = dimple.getUniqueValues($scope.filteredData, "Company");
        $scope.daysPlaying = dimple.getUniqueValues($scope.filteredData, "Date").map(function(a) {
            return new Date(a);
        }).sort(function(a, b) { return a.getTime() - b.getTime(); });
        $scope.uniqueDays = dimple.getUniqueValues($scope.filteredData, "day").sort(function(a, b) { return a - b; });
        var isAllPresent = false;
        var d = 0;
        while (!isAllPresent) {
            var listingsOnDay = $scope.filteredData.filter(function(o) {
                return o.day == $scope.uniqueDays[d];
            });
            if (listingsOnDay.length == $scope.currCompanies.length) {
                isAllPresent = true;
            } else {
                d++;
            }
        }
        $scope.firstDay = $scope.uniqueDays[d];
        $scope.currCompanies.sort(function(a, b) {
            var aFirstDayPrice = $scope.filteredData.filter(function(o) {
                return o.day == $scope.firstDay && o.Company == a;
            })[0].Close;
            var bFirstDayPrice = $scope.filteredData.filter(function(o) {
                return o.day == $scope.firstDay && o.Company == b;
            })[0].Close;
            return bFirstDayPrice - aFirstDayPrice;
        });
        for (var j = 0; j < $scope.currCompanies.length; j++) {
            var companyData = dimple.filterData($scope.filteredData, "Company", $scope.currCompanies[j]);
            companyData.sort(function(a, b) { return a.day - b.day; });
            var priceData = companyData.map(function(a) {
                return a.Close;
            });
            var firstDayPrice = priceData[0];
            var interval = 2*firstDayPrice / 48;
            $scope.notes[j] = priceData.map(function(price) {
                var note = 0;
                if (price === 2 * firstDayPrice) {
                    note = 83;
                } else if (price === 0) {
                    note = 36;
                } else if (price === firstDayPrice) {
                    note = 60;
                } else if (price < firstDayPrice) {
                    note = 36 + 24 - Math.floor((firstDayPrice - price) / interval);
                } else {
                    note = 60 + Math.floor((price - firstDayPrice) / interval);
                }
                return note;
            });
        }
        $scope.currentIndex = 0;
    };

    $scope.$watch('filteredData', $scope.determineSong, true);

    $scope.initialize = function() {
        for (var i = 0; i < $scope.midiNumbers.length; i++) {
            $scope.notes.push([]);
        }
        var uniqueNotes = [];
        for (var j = 36; j < 84; j++) {
            uniqueNotes.push(j);
        }
        $scope.instrument.preload(j);
    };
}]);