

function VentureCtrl($scope, $routeParams, Venture) {
  $scope.ventures      = [];
  $scope.activeVenture = null;

  $scope.Venture = Venture;

  // Used to order the venture list in the view
  $scope.predicate = "-votes";

  $scope.$on('$routeChangeStart', function(next, current) {
    //console.log(["$routeChangeStart", next, current]);
  });

  $scope.$on('$routeChangeError', function(current, previous, rejection) {
    console.log(["$routeChangeError", current, previous, rejection]);
  });

  $scope.upvote = function(ventureId, $event) {
    console.log(["VentureCtrl.$scope.upvote", ventureId, $event]);

    $($event.currentTarget).addClass('disabled');

    var venture        = Venture.getVentureById(ventureId);
    var upvote_promise = Venture.upvote(ventureId);

    upvote_promise.then(function(votes){
      $($event.currentTarget).remove();
      venture.votes = votes;
    }, function(message){
      alert("Error: " + message);
    });
  };

  /**
   * On each success route change to any route using venturectrl as it's controller
   */
  $scope.$on('$routeChangeSuccess', function(current, previous) {

    // If the ventures haven't been loaded
    if ( Venture.self.ventures.length == 0 )
    {
      // Set up the promise object
      var venture_promise = Venture.getVentures();

      // When the promise becomes fulfilled:
      venture_promise.then(function(){
        // Set the local ventures to the passed
        $scope.ventures      = Venture.self.ventures;
        $scope.activeVenture = Venture.getVentureById($routeParams.ventureId);
      }, function(){
        // There was an error (the promise was rejected)
      });
      return;
    }
    else
    {
      $scope.ventures = Venture.self.ventures;
    }

    // Will set the active venture attribute if the id is set
    $scope.activeVenture = Venture.getVentureById($routeParams.ventureId);
    //console.log(['activeVenture', $scope.activeVenture]);

  });
}

//CampaignCtrl.$inject = [];
