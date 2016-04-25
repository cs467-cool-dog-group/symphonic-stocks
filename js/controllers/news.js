var newsControllers = angular.module('news.controllers', []);

newsControllers.controller('NewsController', ['$scope', 'News', function($scope, News) {
    $scope.newsData = {};
    $scope.nysedata;
    $scope.nasdaqdata;
    $scope.news;

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
                $scope.company = News.getCompany($scope.companyTicker, $scope.nysedata, $scope.nasdaqdata);
                $scope.date = News.getDate($scope.currDate);
                return News.getNews($scope.companyTicker, $scope.currDate);
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

    $scope.$watchGroup(['companyTicker', 'currDate'], $scope.initialize);
}]);
