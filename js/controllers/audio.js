var audioControllers = angular.module('audio', []);

audioControllers.controller('AudioController', ['$scope', '$interval', function($scope, $interval) {
    $scope.instrument = T.soundfont;
    $scope.notes = [];
    $scope.currCompanies = [];
    $scope.currentIndex = 0;
    $scope.isPlaying = false;

    $scope.midiNumbers = [58, 57, 72, 74, 43, 1, 41];
    $scope.midiInstrumentNames = ['trombone', 'trumpet', 'clarinet', 'flute', 'cello', 'piano', 'violin'];

    var play;

    $scope.play = function() {
        $scope.isPlaying = true;
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
            $scope.currentIndex++;
        }, 1000, $scope.notes[0].length - $scope.currentIndex);
    };

    $scope.pause = function() {
        $scope.isPlaying = false;
        if (angular.isDefined(play)) {
            $interval.cancel(play);
            play = undefined;
        }
    };

    $scope.determineSong = function() {
        $scope.currCompanies = dimple.getUniqueValues($scope.filteredData, "Company");
        // TODO: Sort the companies by beginning price
        $scope.currCompanies.sort(function(a, b) {
            var aFirstDayPrice = $scope.filteredData.filter(function(o) {
                return o.day == 1 && o.Company == a;
            });
            var bFirstDayPrice = $scope.filteredData.filter(function(o) {
                return o.day == 1 && o.Company == b;
            });
            if (bFirstDayPrice > aFirstDayPrice) {
                return -1;
            } else if (bFirstDayPrice < aFirstDayPrice) {
                return 1;
            } else {
                return 0;
            }
        });
        for (var j = 0; j < $scope.currCompanies.length; j++) {
            var companyData = dimple.filterData($scope.filteredData, "Company", $scope.currCompanies[j]);
            companyData.sort(function(a, b) { return a.day - b.day; });
            var priceData = companyData.map(function(a) {
                return a.High;
            });
            var maxHigh = Math.max.apply(null, priceData);
            var minHigh = Math.min.apply(null, priceData);
            var average = (maxHigh + minHigh) / 2;
            var intervalAboveAverage = (maxHigh - average) / 24;
            var intervalBelowAverage = (average - minHigh) / 24;
            $scope.notes[j] = priceData.map(function(price) {
                var note = 0;
                if (price == maxHigh) {
                    note = 83;
                } else if (price == minHigh) {
                    note = 36;
                } else if (price < average) {
                    note = 36 + 24 - Math.floor((average - price) / intervalBelowAverage);
                } else {
                    note = 60 + Math.floor((price - average) / intervalAboveAverage);
                }
                return note;
            });
        }
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