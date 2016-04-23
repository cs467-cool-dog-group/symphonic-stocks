var newsServices = angular.module('news.services', []);

newsServices.factory('News', function($http) {
    return {
        validate: function(company) {
            var json = {};
        },
        getTicker: function(exchange) {
            return $http.get('./data');
        },
        getNews: function(company, date) {
            return $http.get('google');
        }
    };
});