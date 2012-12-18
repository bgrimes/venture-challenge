'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('ventureChallenge.services', []).

  factory('Admin', function($http, api_url, $q) {
    var self = this;
    self.ventures = [];
    self.created = new Date().getTime();
    return {
      self: self,
      /*
       * This is similar to Venture.getVentures but it will list ALL ventures (including the
       * ventures that need to be accepted into the system).
       */
      getVentures: function() {
        var deferred = $q.defer();

        $http.get(api_url + '/admin/ventures').
          success(function(data, status, headers, config) {
            self.ventures = data;
            deferred.resolve();
          }).
          error(function(data, status, headers, config) {
            deferred.reject();
          })
        ;
        return deferred.promise;
      },
      getVenture: function(ventureId) {

        if ( typeof(ventureId) == "undefined" )
        {
          return false;
        }

        // Return the venture if found ( http://underscorejs.org/#find )
        return _.find(self.ventures, function(venture){
          return ( venture.id == ventureId );
        });

      },
      approveVenture: function(ventureId) {
        var deferred = $q.defer();

        $http.post(api_url + '/admin/venture/approve', {id: ventureId}).
          success(function(data, status, headers, config) {

            deferred.resolve();
          }).
          error(function(data, status, headers, config) {
            deferred.reject();
          })
        ;
        return deferred.promise;
      }
    }
  }).

  factory('Venture', function($resource, $http, api_url, $q) {
    var self           = this;
    self.ventures      = [];
    self.created       = new Date().getTime();
    return {
      self: self,
      /**
       * Return an array of ventures
       */
      getVentures: function () {

        var deferred = $q.defer();

        $http.get(api_url + "/venture").
          success(function(data, status, headers, config){
            // Data should be an array of ventures with {votes: <int>, ventureInfo: <object>}
            self.ventures = data;
            deferred.resolve();
          }).
          error(function(data, status, headers, config){
            deferred.reject();
          });

        return deferred.promise;
      },
      getVentureById: function(ventureId) {
        if ( typeof(ventureId) == "undefined" )
        {
          return [];
        }

        // Return the venture if found ( http://underscorejs.org/#find )
        return _.find(self.ventures, function(venture){
          venture.ventureImages = _.filter(venture.ventureInfo.ventureImages, function(ventureImage) {
            return ventureImage != null;
          });
          return venture.id == ventureId;
        });
      },
      upvote: function(ventureId) {
        if ( typeof(ventureId) == "undefined" )
        {
          return false;
        }

        var deferred = $q.defer();

        $http.post(api_url + '/venture/upvote', {id: ventureId}).
          success(function(data, status, headers, config) {
            deferred.resolve(data.votes); // Return the number of votes
          }).
          error(function(data, status, headers, config) {
            deferred.reject(data.message);
          });
        return deferred.promise;
      }
    };
  }).

  factory('User', function ($resource, $http, $q, api_url) {
    var self           = this;
    self.authenticated = false;
    self.email         = null;
    self.isAdmin       = false;
    self.ventureInfo   = null;
    return {
      isAuthenticated:function () {
        return self.authenticated;
      },
      isAdmin:function () {
        return self.isAdmin;
      },
      getEmail:function () {
        return self.email;
      },
      login:function (email, password) {
        var auth_url = api_url + "/auth";
        var deferred = $q.defer();

        // Request the auth route passing the email and password
        $http.post(auth_url, {email:email, pass: password}).
          success(function(data, status, headers, config) {
            self.email         = data.user.email;
            self.ventureInfo   = data.user.ventureInfo;
            self.votes         = data.user.votes;
            self.isAdmin       = (data.user.role == 'admin');
            self.authenticated = true;
            console.log(self);
            deferred.resolve();
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with status
            // code outside of the <200, 400) range
            console.log("Error");
            deferred.reject(data.message);
          });
        // Add cookie?
        return deferred.promise;
      },
      logout:function (callback) {
        if (self.authenticated) {
          // Post logout ?
          // Remove cookie?
          self.authenticated = false;
          self.email = null;
          self.ventureInfo = null;
          self.votes = null;
          self.isAdmin = null;
          return callback(true);
        }
        else {
          return callback(false);
        }
      }
    }
  });
