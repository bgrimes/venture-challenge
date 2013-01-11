'use strict';

/**
 * Update the root_url, base_url, api_url AND base_dir
 * strings to fully setup this app
 */

// Declare app level module which depends on filters, and services
angular.module('ventureChallenge', ['ventureChallenge.filters', 'ventureChallenge.services', 'ventureChallenge.directives', 'ngCookies', 'ngResource', 'ui']).

  value('site_title', 'UK Venture Challenge').
  value('root_url', 'http://localhost/ci-inet-student').
  value('base_url', 'http://localhost/ci-inet-student/app').
  value('api_url',  'http://localhost/ci-inet-student/api').

  /*
   * Drop the x-requested-with header from the default HTTP config
   * https://github.com/angular/angular.js/pull/1454
   */
  config(['$httpProvider', function($httpProvider) {
    delete $httpProvider.defaults.headers.common["X-Requested-With"]
  }]).

  config(['$routeProvider', function($routeProvider) {
  var base_dir = '/ci-inet-student/app/';

  $routeProvider.when('/', {templateUrl:base_dir + 'partials/ventures.html', controller: VentureCtrl});
  $routeProvider.when('/venture/:ventureId', {templateUrl: base_dir + 'partials/venture_view.html', controller: VentureCtrl});
  //$routeProvider.when('/campaigns', {templateUrl:'partials/campaigns.html', controller: CampaignCtrl});
  //$routeProvider.when('/campaign/:campaignId', {templateUrl:'partials/campaign.html', controller: CampaignCtrl});
  $routeProvider.when('/login', {templateUrl:base_dir + 'partials/login.html', controller: LoginCtrl});

  // Admin routes
  $routeProvider.when('/admin', {templateUrl: base_dir + 'partials/admin/admin.html', controller: AdminCtrl});
  $routeProvider.when('/admin/venture/:ventureId', {templateUrl: base_dir + 'partials/venture_view.html', controller: AdminCtrl});

  // Register path/controller
  $routeProvider.when('/register', {templateUrl:base_dir + 'partials/register.html', controller: RegisterCtrl});

  // Default to '/'
  $routeProvider.otherwise({redirectTo: '/'});
}]);
