var userServices = angular.module('user.services', []);

userServices.factory('Authorization', ['$firebaseAuth', function($firebaseAuth) {
    var reference = new Firebase('https://cs467cdogs.firebaseio.com/');
    return $firebaseAuth(reference);
}]);

userServices.service('UserService', ['Authorization', function(Authorization) {
    return {
        signup: function(userData) {
            return Authorization.$createUser({
                email: userData.email,
                password: userData.password
            });
        },
        login: function(userData) {
            return Authorization.$authWithPassword({
                email: userData.email,
                password: userData.password
            });
        },
        logout: function() {
            return Authorization.$unauth();
        }
    };
}]);