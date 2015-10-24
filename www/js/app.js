// Ionic Starter App
var $ApiEndpoint = {
  url: 'http://localhost:8100/json.php',
  assetServer: 'http://localhost:8100/exif.php'
};

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic',
  'ngCordova',
  'ionic.service.core',
  'ionic.service.push',
  'ionic.service.deploy',
  'starter.controllers'
])

.config(['$ionicAppProvider', function($ionicAppProvider) {
  // Identify app
  $ionicAppProvider.identify({
    // The App ID (from apps.ionic.io) for the server
    app_id: 'c45b1445',
    // The public API key all services will use for this app
    api_key: 'ddfc4c2d66018aad7f07e578a8fbcffc358b69d37e1641cf',
    // The GCM project ID (project number) from your Google Developer Console (un-comment if used)
    // gcm_id: 'GCM_ID'
  });
}])

.run(function($rootScope, $ionicDeploy, $ionicPlatform, $cordovaStatusbar) {

  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    // Color the iOS status bar text to white
    if (window.StatusBar) {
      $cordovaStatusbar.overlaysWebView(true);
      $cordovaStatusBar.style(1); //Light
    }

    // Default update checking
    $rootScope.updateOptions = {
      interval: 2 * 60 * 1000
    };

    // Watch Ionic Deploy service for new code
    $ionicDeploy.watch($rootScope.updateOptions).then(function() {}, function() {}, function(hasUpdate) {
      $rootScope.lastChecked = new Date();
      console.log('WATCH RESULT', hasUpdate);
    });
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html",
    controller: 'TabsCtrl'
  })

  // Each tab has its own nav history stack:

  // Welcome tab
  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'HomeCtrl'
      }
    }
  })
  .state('tab.info',{
    url: '/info',
    views: {
      'tab-home': {
        templateUrl: 'templates/info.html',
        controller: 'InfoCtrl'
      }
    }
  })
  .state('tab.detail',{
    url: '/detail',
    views: {
      'tab-home': {
        templateUrl: 'templates/detail.html',
        controller: 'InfoCtrl'
      }
    }
  })
  // Ionic User tab
  .state('tab.user', {
    url: '/user',
    views: {
      'tab-user': {
        templateUrl: 'templates/tab-user.html',
        controller: 'UserCtrl'
      }
    }
  })

  // Ionic Settings tab
  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })
  .state('tab.credits', {
    url: '/credits',
    views: {
      'tab-settings': {
        templateUrl: 'templates/credits.html'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');

});
