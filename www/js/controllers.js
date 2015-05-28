angular.module('starter.controllers', [])

.controller('HomeCtrl', function($http, $scope, $rootScope, $ionicPush, $ionicUser) {
  // Nothing to see here.
  //console.debug($ionicUser);
  
  var myFirebaseRef = new Firebase("https://postcardcloud.firebaseio.com/");
  $scope.items = [];
  $scope.start = 0;
  $scope.limit = 5;
  
  console.log("Identified user: ",$ionicUser.get());
  
  // Get the data on a post that has changed
  myFirebaseRef.child('cards').on("child_added", function(snapshot) {
    var item = snapshot.val();
    console.log("new like", item);
    var el=angular.element(document).find("a[data-id='"+item.id+"']");
    el.addClass("active");
    //collect nicks who liked this card
    if (item.likes != null && item.likes.length > 0) { 
      $scope.fillInUsersLikes(item.id, item.likes);  
    }
    else { 
      //Listen for changes on likes in this card. 
      var card = new Firebase("https://postcardcloud.firebaseio.com/cards/"+item.id+"/likes");
      card.on("child_added",function(likes) { 
        $scope.fillInUsersLikes(item.id, [likes.val()]);  
      });
    }
  });  
  
  $scope.loadMore = function() {
    console.log("loading json data");
    $http.get($ApiEndpoint.url+'?start='+$scope.start+'&limit='+$scope.limit).then(function(resp) {
        // For JSON responses, resp.data contains the result
        $scope.items = resp.data.images;
        $scope.limit += 5;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.loadLikedCards();
      }, function(err) {
        console.error('ERR', err);
        // err.status will contain the status code
        $scope.start=0;
      })
  };
  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });
  $scope.like = function( item ) { 
    var user = $ionicUser.get();
    if ( user.nick != null && user.nick.length>0 ) {
      console.log("User "+user.nick+" liked "+item.user+"\'s photo");
      myFirebaseRef.child('cards').child(item.id).update(item);  
      myFirebaseRef.child('cards').child(item.id).child('likes').child(user.user_id)
        .set({
              nick: user.nick,
              email: user.email
      });
    }
    else { 
      alert("Please complete your profile!");
    }
  };
  
  $scope.fillLikeInfoOnCard = function( key ) { 
    var el=angular.element(document).find("a[data-id='"+key+"']");
    el.addClass("active");
    //collect nicks who liked this card
    var card = new Firebase("https://postcardcloud.firebaseio.com/cards/"+key+"/likes");
    card.once("value",function(likes) { 
      console.log("This many users liked "+key,likes.val());
      $scope.fillInUsersLikes(key, likes.val());
    });
  };
  
  $scope.fillInUsersLikes = function(key, users) { 
      var nicks = [];
      $.each(users,function(v,k) {
        nicks.push(k.nick);
      });
      console.log(nicks.join(","));
      var likedby = angular.element(document).find("p[data-id='liked-by-"+key+"']");
      likedby.html(nicks.join(",")+(nicks.length>1?" like":" likes")+" this.");
  };
  
  $scope.loadLikedCards = function() { 
    console.log("collecting likes from firebase");
    myFirebaseRef.child('cards').once("value",function(data) {
      if (data.val() != null) { 
        for(key in data.val()) {
          $scope.fillLikeInfoOnCard(key);
        }
      }
    });
  };
  
})

.controller('UserCtrl', function($scope, $rootScope, $ionicUser) {
  /**
   * Identifies a new user with the Ionic User service (read the docs at http://docs.ionic.io/identify/). This should be
   * called before any other registrations take place.
   **/
  
  
  $scope.user = {
    nick: $ionicUser.get().nick,
    email: $ionicUser.get().email
  }
  
  $scope.identifyUser = function() {
    console.log('Ionic User: Identifying with Ionic User service');
    console.log("User form data received: ",$scope.user);
    var user = $ionicUser.get();
    if(!user.user_id) {
      // Set your user_id here, or generate a random one.
      user.user_id = $ionicUser.generateGUID()
    };

    // Add some metadata to your user object.
    angular.extend(user, {
      nick: $scope.user.nick,
      email: $scope.user.email
    });

    // Identify your user with the Ionic User Service
    $ionicUser.identify(user).then(function(){
      alert('Successfully identified user ' + user.nick + '\n ID ' + user.user_id);
    });
  };
})

.controller('SettingsCtrl', function($http, $scope, $rootScope, $ionicPush, $ionicApp) {
  // Put your private API key here to be able to send push notifications from within the app.
  // TODO: Add your private API key here if you want to push from your device.
  $scope.privateKey = '';

  // Write your own code here to handle new device tokens from push notification registration as they come in.
  $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
    alert("Successfully registered token " + data.token);
    console.log('Ionic Push: Got token ', data.token, data.platform);
    $scope.token = data.token;
  });

  /**
   * Registers the currently identified Ionic User for push notifications on the current device. This should either pass
   * a user object to identify or be called after $ionicUser.identify()
   * (read the docs at http://docs.ionic.io/push/installation/).
   **/
  $scope.pushRegister = function() {
    console.log('Ionic Push: Registering user');

    // Register with the Ionic Push service.  All parameters are optional.
    $ionicPush.register({
      canShowAlert: true, //Should new pushes show an alert on your screen?
      canSetBadge: true, //Should new pushes be allowed to update app icon badges?
      canPlaySound: true, //Should notifications be allowed to play a sound?
      canRunActionsOnWake: true, // Whether to run auto actions outside the app,
      onNotification: function(notification) {
        // Handle new push notifications here
        // console.log(notification);
        return true;
      }
    }).then(function(deviceToken) {
      //Save the device token, if necessary
    });
  };

  /**
   * If you've added your Private API Key, you can send a push notification directly fro the current device.  Since the
   * app iwll be open when this happens, you probably will not see the notification handled by the OS, but it should
   * still be handled by whatever function you define.
   **/
  $scope.sendPush = function() {
    if ($scope.privateKey) {
      alert('A notification will be sent to you 5 seconds after you close this alert.  They can take a few minutes to arrive.');
      var appId = $ionicApp.getApp().app_id;
      var auth = btoa($scope.privateKey + ':'); // Base64 encode your key
      var req = {
        method: 'POST',
        url: $ionicApp.getValue('push_api_server') + '/api/v1/push',
        headers: {
          'Content-Type': 'application/json',
          'X-Ionic-Application-Id': appId,
          'Authorization': 'basic ' + auth
        },
        data: {
          "tokens": [$scope.token],
          "notification": {
            "alert":"Hello World!"
          }
        }
      };

      setTimeout(function(){
        $http(req).success(function(resp){
            console.log("Ionic Push: Push success!");
          }).error(function(error){
            console.log("Ionic Push: Push error...");
          });
      }, 5000);
    } else {
      alert('Uh-oh!  To use this function, add your Private API Key to line 36 of controllers.js');
    }
  };
});
