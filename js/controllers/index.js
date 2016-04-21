var indexControllers = angular.module('index.controllers', []);

indexControllers.controller('IndexController', ['$scope', 'Index', '$interval', function($scope, Index, $interval) {
    $scope.instrument = T.soundfont;
    $scope.notes = [];
    $scope.currentIndex = 0;
    $scope.isPlaying = false;

    $scope.play = function() {
        $interval(function() {
            $scope.instrument.play($scope.notes[$scope.currentIndex]);
            $scope.currentIndex++;
        }, 500, $scope.notes.length);
        // instrument.play(#) - 0 - 127
    };

    // TODO: Figure out how to pause the sound
    $scope.pause = function() {
        $scope.isPlaying = false;
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
        console.log($scope.notes);
    };

    $scope.initialize = function() {
        $scope.instrument.setInstrument(1); // piano for now
        $scope.instrument.emptyCache();
        Index.getSample().then(function(result) {
            $scope.prices = result.data.map(function(x) {
                return +x;
            });
            $scope.determineSong();
        }, function(err) {
            console.log(err);
        });
    };
}]);