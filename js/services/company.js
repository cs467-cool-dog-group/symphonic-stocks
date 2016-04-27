var companyServices = angular.module('company.services', []);

companyServices.factory('Company', function($http) {
    return {
        getFirstYears: function() {
            return $http.get('./data/ticker_first_years.json');
        }
    };
});