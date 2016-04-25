var newsControllers = angular.module('news.controllers', []);

newsControllers.controller('NewsController', ['$scope', 'News', function($scope, News) {
    $scope.company = 'TWTR';
    $scope.date = '01-08-2016';
    $scope.newsData = {};
    $scope.nysedata;
    $scope.nasdaqdata;
    $scope.news;

    $scope.initialize = function() {
        News.getIndexData('nyse').then(
            function(results) {
                $scope.nysedata = results.data;
                return News.getIndexData('nasdaq');
            }
        ).then(
            function(results2) {
                $scope.nasdaqdata = results2.data;
                $scope.company = News.getCompany($scope.company, $scope.nysedata, $scope.nasdaqdata);
                $scope.date = News.getDate($scope.date);
                return News.getNews($scope.company, $scope.date);
            }
        ).then(
            function(results4) {
                $scope.news = results4.data;
                console.log($scope.news);
                $scope.newsData = News.parseNewsData($scope.news);
                console.log($scope.newsData);
            }
        );
    };
}]);
