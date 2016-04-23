var newsControllers = angular.module('news.controllers', []);

newsControllers.controller('NewsController', ['$scope', 'News', function($scope, News) {
    $scope.company = 'PIH';
    $scope.date = 'some date';
    $scope.newsResults = ['t', 'b', 'h'];
    $scope.initialize = function() {
        News.getTicker().then(function(results) {
            News.validate();
            return News.getNews();
        }).then(function(newsResults) {
            // display the data or set a variable
        });
    };
}]);