var audioControllers = angular.module('audio', []);

audioControllers.controller('AudioController', ['$scope', '$interval', function($scope, $interval) {
    $scope.instrument = T.soundfont;
    $scope.notes = [];
    $scope.currCompanies = [];
    $scope.currentIndex = 0;
    $scope.isPlaying = false;
    $scope.midiNumbers = [57, 58, 72, 74, 43, 1, 41];
    $scope.midiInstrumentNames = ['trumpet', 'trombone', 'clarinet', 'flute', 'cello', 'piano', 'violin'];

    // 4 octaves of pentatonic scale
    $scope.pentatonicScaleNotes = [36, 38, 40, 43, 45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84];
    $scope.pentatonicScaleNoteNames = ['C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6'];
    var play;

    $scope.sortByKey = function(array, key) {
        return array.sort(function(a,b) { return a[key] - b[key];});
    }

    $scope.play = function() {
        $scope.isPlaying = true;
        var circles = {};
        for (var l = 0; l < $scope.currCompanies.length; l++) {
            circles[$scope.currCompanies[l]] = [];
        }
        for (var i = 0; i < $scope.chart.series[0].shapes[0].length; i++) {
            var currObject = {}
            currObject.x = $scope.chart.series[0].shapes[0][i].cx.animVal.value;
            currObject.y = $scope.chart.series[0].shapes[0][i].cy.animVal.value;
            var co = $scope.chart.series[0].shapes[0][i].__data__.aggField[0];
            if (circles || circles[co])
                circles[co].push(currObject);
        }
        if (circles) {
            for (var c in circles) {
                circles[c] = $scope.sortByKey(circles[c], 'x');
            }
        }
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
                $scope.draw(circles[$scope.currCompanies[i]][$scope.currentIndex].x, circles[$scope.currCompanies[i]][$scope.currentIndex].y, $scope.currCompanies[i]);
            }
            $scope.currentIndex++;
            if ($scope.currentIndex == $scope.notes[0].length) {
                $scope.isPlaying = false;
                if (!$scope.exploreOwn && $scope.yearStart < 2017) {
                    $scope.updateYearFromAudio();
                }
            }
        }, 700, $scope.notes[0].length - $scope.currentIndex);
    };
    $scope.draw = function(xValue, yValue, company) {
        var yExt = 158;
        var xExt = 26;
        if ($scope.loc == '/portfolios') {
            yExt = 358;
            xExt = -4;
        } else if ($scope.loc == '/companies') {
            xExt = 12;
            yExt = 158;
        }
        var cursorLine = document.getElementById("cursorLine" + company);
        cursorLine.style.left = (xValue + xExt) + "px";
        cursorLine.style.top = (yValue + yExt) + "px";
    };

    $scope.pause = function() {
        $scope.isPlaying = false;
        if (angular.isDefined(play)) {
            $interval.cancel(play);
            play = undefined;
        }
    };

    $scope.fetchNoteName = function(note) {
        for (var i = 0; i < $scope.pentatonicScaleNotes.length; i++) {
            if ($scope.pentatonicScaleNotes[i] == note) {
                return $scope.pentatonicScaleNoteNames[i];
            }
        }
        return 'no note';
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
            $scope.notes[j] = priceData.map(function(price) {
                var note = 0;
                var percentageOfFirstDay = 0;
                if (price === firstDayPrice) {
                    note = $scope.pentatonicScaleNotes[10];
                } else if (price < firstDayPrice) {
                    percentageOfFirstDay = Math.floor((price / firstDayPrice)*10);
                    note = $scope.pentatonicScaleNotes[percentageOfFirstDay];
                } else if (price > firstDayPrice) {
                    percentageOfFirstDay = Math.floor((price - firstDayPrice) / firstDayPrice * 10);
                    note = $scope.pentatonicScaleNotes[10 + percentageOfFirstDay];
                }
                return note;
            });
        }
        $scope.currentIndex = 0;
        console.log($scope.currCompanies);
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