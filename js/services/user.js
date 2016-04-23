var userServices = angular.module('user.services', []);

userServices.factory('Authorization', ['$firebaseAuth', 'FirebaseUrl', function($firebaseAuth, FirebaseUrl) {
    var reference = new Firebase(FirebaseUrl);
    return $firebaseAuth(reference);
}]);