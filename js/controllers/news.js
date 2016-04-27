var newsControllers = angular.module('news.controllers', []);

newsControllers.controller('NewsController', ['$scope', 'News', function($scope, News) {
    $scope.newsData = {};
    $scope.nysedata;
    $scope.nasdaqdata;
    $scope.news;
    $scope.company;
    $scope.date;

    $scope.initialize = function() {
        if($scope.currDate == undefined && $scope.companyTicker == undefined){
            return;
        }
        News.getIndexData('nyse').then(
            function(results) {
                $scope.nysedata = results.data;
                return News.getIndexData('nasdaq');
            }
        ).then(
            function(results2) {
                $scope.nasdaqdata = results2.data;
                //$scope.company = News.getCompany($scope.companyTicker, $scope.nysedata, $scope.nasdaqdata);
                $scope.date = News.getDate($scope.currDate);
                return News.getNews($scope.company, $scope.date);
            }
        ).then(
            function(results4) {
                $scope.news = results4.data;
                $scope.newsData = News.parseNewsData($scope.news);
            }
        );
    };

    $scope.$watchGroup(['companyTicker', 'currDate'], $scope.initialize);
}]);