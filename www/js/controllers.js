angular.module('starter.controllers', [])
.controller('TabsCtrl', function($http, $scope, $rootScope, $ionicUser){
  $scope.hasProfile = $ionicUser.get().user_id != null ? true : false; 
})
.controller('HomeCtrl', function($http, $scope, $rootScope, $ionicPush, $ionicUser, $ionicModal, $ionicScrollDelegate, $location, $window ) {
  // Nothing to see here.
  //console.debug($ionicUser);
  var myFirebaseRef = new Firebase("https://postcardcloud.firebaseio.com/");
  var searchObject = $location.search();
  $scope.settings = {imageSize: $ionicUser.get().imageSize || 'auto' };
  $scope.items = [];
  $scope.start = 0;
  $scope.limit = 5;
  $scope.filterModal = null;
  $scope.filter = {
    isFilterDate: searchObject.date!=null?true:false,
    isFilterPlace: false,
    isFilterUser: searchObject.nick!=null?true:false,
    date: searchObject.date,
    user: searchObject.nick,
    city: null,
    cityRadius: null
  }
  $scope.isFilterModalLoaded = false;
  
  console.log("Identified user: ",$ionicUser.get());
  console.log("Window", $window);
  
  $ionicModal.fromTemplateUrl('templates/search.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.filterModal = modal;
    $scope.isFilterModalLoaded = true;
  }, function(modal){
    console.log("Modal rejected");
    console.debug(modal);
  }); 
  
  // Get the data on a post that has changed
  myFirebaseRef.child('cards').on("child_added", function(snapshot) {
    var item = snapshot.val();
    //console.log("new like", item);
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
    var filters = [];
    var filterParameters = "";
    if ( $scope.filter.isFilterDate && $scope.filter.date != null && $scope.filter.date.length > 0) { 
      filters.push("date="+$scope.filter.date);  
    }
    if ( $scope.filter.isFilterUser && $scope.filter.user != null && $scope.filter.user.length > 0) { 
      filters.push("nick="+$scope.filter.user);  
    }
    if (filters.length > 0) {
      filterParameters = "&"+filters.join("&");
      console.log("Filtering: ",filterParameters);
    }
    $http.get($ApiEndpoint.url($ionicUser.get())+'?start='+$scope.start+'&limit='+$scope.limit+filterParameters).then(function(resp) {
        // For JSON responses, resp.data contains the result
        console.log("Loaded "+resp.data.images.length+" records", resp.data);
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
  $scope.doRefresh = function() {
    $scope.items = [];
    $scope.start = 0;
    $scope.limit = 5;
    $scope.loadMore();
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
      //console.log("This many users liked "+key,likes.val());
      $scope.fillInUsersLikes(key, likes.val());
    });
  };
  
  $scope.fillInUsersLikes = function(key, users) { 
      var nicks = [];
      if (users != null) {
        $.each(users,function(v,k) {
          nicks.push(k.nick);
        });
        //console.log(nicks.join(","));
        var likedby = angular.element(document).find("p[data-id='liked-by-"+key+"']");
        likedby.html(nicks.join(",")+(nicks.length>1?" like":" likes")+" this.");
      }
  };
  
  $scope.loadLikedCards = function() { 
    //console.log("collecting likes from firebase");
    myFirebaseRef.child('cards').once("value",function(data) {
      if (data.val() != null) { 
        for(key in data.val()) {
          $scope.fillLikeInfoOnCard(key);
        }
      }
    });
  };
  $scope.search = function() {
    if ($scope.filterModal != null) {
      $scope.filterModal.show();
    }
    else {
      alert('Filter not available');
    }
  };
  
  $scope.$on('modal.removed', function() {
    alert('filter modal closed');
  });
  
  $scope.doFilter = function() { 
    console.log("Filter data received", $scope.filter);
    var filters = [];
    var filterParameters = "";
    if ( $scope.filter.isFilterDate && $scope.filter.date != null && $scope.filter.date.length > 0) { 
      filters.push("date="+$scope.filter.date);  
    }
    if ( $scope.filter.isFilterUser && $scope.filter.user != null && $scope.filter.user.length > 0) { 
      filters.push("nick="+$scope.filter.user);  
    }
    if (filters.length > 0) {
      filterParameters = filters.join("&");
      console.log("Filtering: ",filterParameters);
    }
    
    $scope.filterModal.hide();
    $ionicScrollDelegate.scrollTop();
    $location.search(filterParameters);    
    console.log($location.absUrl());
    $window.location.href=$location.absUrl();
    $window.location.reload();
  }
  $scope.doCancel = function() {
    $scope.filterModal.hide();
  }
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

.controller('SettingsCtrl', function($http, $scope, $rootScope, $ionicPush, $ionicApp, $ionicUser) {
  // Put your private API key here to be able to send push notifications from within the app.
  // TODO: Add your private API key here if you want to push from your device.
  var user = $ionicUser.get();
  //console.debug(user);
  $scope.settings = {
    imageSize: typeof user.imageSize == 'undefined'?false:(user.imageSize=='edge'),
    enablePush: user.enablePush
  };
  $scope.privateKey = '';

  console.debug($scope.settings);

  $scope.saveSettings = function() {
    $rootScope.settings = $scope.settings;
    angular.extend(user, {
      imageSize: $scope.settings.imageSize?'edge':'original',
      enablePush: $scope.settings.enablePush
    });    
    $ionicUser.identify(user).then(function(){
      var push = new Ionic.Push({
        "debug": false,
        "production": true
      });
      if (user.enablePush) {
        //register for push service
        push.register(function(pushToken) {
          console.log("Device token:",pushToken);
          $http.get($ApiEndpoint.pushRegistry+'?action=register&deviceid='+user.user_id+'&registrationid='+pushToken.token)
          .then(function(resp){
            console.log("Device registered with sandbox");
            angular.extend(user, {
              imageSize: $scope.settings.imageSize?'edge':'original',
              enablePush: $scope.settings.enablePush,
              pushToken: pushToken.token
            });    
            $ionicUser.identify(user);
          }, function(err){
            console.log("Device registration with sandbox failed");
          });
        });      
      }
      else {
        if (user.pushToken && user.pushToken.length > 0) {
          push.unregister();
          $http.get($ApiEndpoint.pushRegistry+'?action=unregister&deviceid='+user.user_id)
          .then(function(resp){
              console.log("Device unregistered with sandbox");
              angular.extend(user, {
                imageSize: $scope.settings.imageSize?'edge':'original',
                enablePush: $scope.settings.enablePush,
                pushToken: ''
              });            
              $ionicUser.identify(user);                
            }, function(err){
              console.log("Device unregistration with sandbox failed");
            });          
        }
      }
      alert("Settings saved. Please reload the page!");
    });
    
  };
  
})
.controller('InfoCtrl', function($http, $scope, $rootScope, $ionicUser, $location){
  var params = $location.search();
  $scope.id = params.id;
  $scope.filename = params.filename;
  $scope.url = params.url;
  $scope.exif = [];
  $scope.settings = {imageSize: params.imageSize};
  $scope.zoomHeight = $(window).height()-200;

  $http.get($ApiEndpoint.assetServer+'?filename='+$scope.filename).then(function(resp) {
        // For JSON responses, resp.data contains the result
        console.log("Loaded exif info "+resp.data.length+" records", resp.data);
        $scope.exif = resp.data;
        //get real image size from exif data 
        for(var i=0; i<resp.data.length; i++) {
          if (resp.data[i] && resp.data[i].indexOf("Image size") == 0) {
            var size = resp.data[i].substring(18).split(" x ");
            console.debug(size);
            $scope.imageWidth = size[0];
            $scope.imageHeight = size[1];            
          }
        }
      }, function(err) {
        console.error('ERR', err);        
      });
});
