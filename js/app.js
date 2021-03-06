var app = angular.module('SymphonicStocks', [
    'ngRoute',
    'firebase',

    'user.services',
    'user.controllers',

    'company.services',
    'company.controllers',

    'portfolio.services',
    'portfolio.controllers',

    'index.services',
    'index.controllers',

    'news.services',
    'news.controllers',

    'audio',
    'graph'
]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'templates/home.html',
            controller: 'MainController'
        }).
        when('/index', {
            templateUrl: 'templates/stock-index.html',
            controller: 'IndexController'
        }).
        when('/portfolios', {
            templateUrl: 'templates/portfolios.html',
            controller: 'PortfolioController'
        }).
        when('/companies', {
            templateUrl: 'templates/stock-company.html',
            controller: 'CompanyController'
        }).
        when('/login', {
            templateUrl: 'templates/login.html',
            controller: 'UserController'
        }).
        when('/news', {
            templateUrl: 'templates/news.html',
            controller: 'NewsController'
        }).
        otherwise({
            redirectTo: '/'
        });
}]);