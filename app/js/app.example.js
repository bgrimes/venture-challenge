'use strict';

/**
 * Copy this file to app.js and change the urls to whatever is appropriate for you
 */

// Declare app level module which depends on filters, and services
angular.module('ventureChallenge', ['ventureChallenge.filters', 'ventureChallenge.services', 'ventureChallenge.directives', 'ngCookies', 'ngResource', 'ui']).

  value('root_url', 'http://localhost/venture').
  value('base_url', 'http://localhost/venture/app').
  value('api_url',  'http://localhost/venture/api').

  config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl:'partials/ventures.html', controller: VentureCtrl});
  $routeProvider.when('/venture/:ventureId', {templateUrl: 'partials/venture_view.html', controller: VentureCtrl});
  //$routeProvider.when('/campaigns', {templateUrl:'partials/campaigns.html', controller: CampaignCtrl});
  //$routeProvider.when('/campaign/:campaignId', {templateUrl:'partials/campaign.html', controller: CampaignCtrl});
  $routeProvider.when('/login', {templateUrl:'partials/login.html', controller: LoginCtrl});

  // Admin routes
  $routeProvider.when('/admin', {templateUrl: 'partials/admin/admin.html', controller: AdminCtrl});

  // Register path/controller
  $routeProvider.when('/register', {templateUrl:'partials/register.html', controller: RegisterCtrl});

  // Default to '/'
  $routeProvider.otherwise({redirectTo: '/'});
}]);
