

function AuthCtrl($scope, $cookieStore, $routeParams) {
  $scope.user = {
    authenticated: true,
    email: "bgrimes@gmail.com"
  };

}

//AuthCtrl.$inject = [];
