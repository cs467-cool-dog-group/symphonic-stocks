var portfolioServices = angular.module('portfolio.services', []);

portfolioServices.factory('Portfolio', function($http) {
    return {
        getAllPortfolios: function() {
            return $http.get('./data/sample_portfolios.json');
        }
    }
});