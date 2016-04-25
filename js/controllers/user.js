var userControllers = angular.module('user.controllers', []);

userControllers.controller('MainController', ['$scope', function($scope) {

}]);

userControllers.controller('UserController', ['$scope', 'UserService', function($scope, UserService) {
    $scope.userData = {};
    $scope.isLogin = true;

    $scope.login = function() {
        
    };

    $scope.signup = function() {

    };


}]);