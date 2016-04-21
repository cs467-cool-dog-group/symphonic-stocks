var indexServices = angular.module('index.services', []);

indexServices.factory('Index', function($http) {
    return {
        getSample: function() {
            return $http.get('./data/sample.json');
        }
    };
});