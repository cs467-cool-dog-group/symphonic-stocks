var userControllers = angular.module('user.controllers', []);

userControllers.controller('MainController', ['$scope', '$rootScope', function($scope, $rootScope) {

}]);

userControllers.controller('UserController', ['$scope', '$rootScope', 'UserService', function($scope, UserService) {
    $scope.userData = {};
    $scope.isLogin = true;

    $scope.login = function() {
        UserService.login($scope.userData).then(function(authData) {
            $rootScope.uid = authData.uid;
        });
    };

    $scope.signup = function() {
        UserService.signup($scope.userData).then(function(user) {
            return UserService.login($scope.userData);
        }).then(function(authData) {
            $rootScope.uid = authData.uid;
            $rootScope.username = $scope.userData.username;
        });
    };
}]);