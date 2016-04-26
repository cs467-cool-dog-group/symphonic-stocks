var portfolioControllers = angular.module('portfolio.controllers', []);

portfolioControllers.controller('PortfolioController', ['$scope', 'Portfolio', 'News', function($scope, Portfolio, News) {
    $scope.selectedPortfolio = '';
    $scope.selectedCompanies = [];
    $scope.isDisplaying = false;


    $scope.fetchCompanyName = function(ticker) {
        return News.getCompany(ticker, $scope.nasdaqData, $scope.nyseData);
    };

    $scope.displayPortfolio = function(name) {
        $scope.isDisplaying = true;
        $scope.selectedPortfolio = name;
        $scope.selectedCompanies = $scope.portfolios[name];
    };

    $scope.initialize = function() {
        Portfolio.getAllPortfolios().then(function(results) {
            $scope.portfolioNames = [];
            for (var i in results.data) {
                $scope.portfolioNames.push(i);
            }
            $scope.portfolios = results.data;
            return News.getIndexData('nyse');
        }).then(function(results) {
            $scope.nyseData = results.data;
            return News.getIndexData('nasdaq');
        }).then(function(results) {
            $scope.nasdaqData = results.data;
        });
    };

    // TODO: Need to send specific companies to Graph Controller to display
}]);