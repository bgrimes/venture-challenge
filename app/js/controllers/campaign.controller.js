

function CampaignCtrl($scope, $cookieStore, $routeParams) {
  $scope.campaigns = [
    {title: 'Campaign 1', synopsis:'La da doo dee da', team: 1, votes: 2},
    {title: 'Campaign 2', synopsis: 'Asdh ter qwerty do', team:2, votes: 4}
  ];
  $scope.activeCampaign = {};

  $scope.$on('$routeChangeSuccess', function(current, previous) {
    if ( typeof($routeParams.campaignId) == "undefined" )
    {
      return;
    }
    console.log('CAMPAIGN ' + $routeParams.campaignId);
    $scope.activeCampaign = $scope.campaigns[$routeParams.campaignId];
  });
}

//CampaignCtrl.$inject = [];
