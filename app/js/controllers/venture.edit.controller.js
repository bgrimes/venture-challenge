

/**
 * Venture edit controller
 *
 * @param $scope
 * @param $http
 * @param $location
 * @constructor
 */
function VentureEditCtrl($scope, $http, $location, User, api_url) {

  $scope.max_venture_images = 4;

  $scope.steps = [
    'Step 1: Team Info',
    'Step 2: Team Members',
    'Step 3: Campaign Info',
    'Step 4: Campaign Media'
  ];
  $scope.selection = $scope.steps[0];

  // Will manually disable the register button if true
  $scope.registerDisabled = false;

  $scope.registrationInfo = {
    teamName: null,
    teamEmail: null,
    teamPassword: null,
    teamMembers: [
      // {first: "", last: "", email:"", isUK:"", major: ""}
    ],
    ventureName: null,
    ventureType: null,
    confirmPassword: null,
    confirmEmail: null,
    teamPicture: null,
    ventureDescription: null,
    ventureImages: {"1":null,"2":null,"3":null,"4":null},
    ventureVideoLink: null
  };

  $scope.removeVentureImage = function(image_key) {

    var ventureImages = $scope.registrationInfo.ventureImages;

    // Check if image is not null/empty
    if ( ventureImages[image_key] == null || ventureImages[image_key] == "")
    {
      return false;
    }

    // @todo Send call to delete image from server

    // While image_key is less than max_venture_images
    while( image_key < $scope.max_venture_images )
    {
      // Get the next image key
      var next_image = image_key + 1;

      // If next image is not null/empty
      if ( ventureImages[next_image] == "undefined" || ventureImages[next_image] == null || ventureImages[next_image] == "" )
      {

        $("div.venture-image.image-" + image_key + " ul.qq-upload-list").empty();
        ventureImages[image_key] = null;
        // image_key = max_venture_images
        image_key = $scope.max_venture_images;
      }
      else
      {
        // Copy next image to image_key
        ventureImages[image_key] = ventureImages[next_image];

        var list_current = $("div.venture-image.image-" + image_key + " ul.qq-upload-list");
        var image_next   = $("div.venture-image.image-" + image_key);

        list_current.empty();
        $("div.venture-image.image-"+next_image+" ul.qq-upload-list li").appendTo(list_current);

        image_key = image_key + 1;
      }
    }
    return true;
  };



  $scope.getCurrentStepIndex = function(){
    // Get the index of the current step given selection
    return _.indexOf($scope.steps, $scope.selection);
  };

  // Go to a defined step index
  $scope.goToStep = function(index) {
    if ( !_.isUndefined($scope.steps[index]) )
    {
      $scope.selection = $scope.steps[index];
    }
  };

  $scope.hasNextStep = function(){
    var stepIndex = $scope.getCurrentStepIndex();
    var nextStep = stepIndex + 1;
    // Return true if there is a next step, false if not
    return !_.isUndefined($scope.steps[nextStep]);
  };

  $scope.hasPreviousStep = function(){
    var stepIndex = $scope.getCurrentStepIndex();
    var previousStep = stepIndex - 1;
    // Return true if there is a next step, false if not
    return !_.isUndefined($scope.steps[previousStep]);
  };

  $scope.incrementStep = function() {
    if ( $scope.hasNextStep() )
    {
      var stepIndex = $scope.getCurrentStepIndex();
      var nextStep = stepIndex + 1;
      $scope.selection = $scope.steps[nextStep];
    }
  };

  $scope.decrementStep = function() {
    if ( $scope.hasPreviousStep() )
    {
      var stepIndex = $scope.getCurrentStepIndex();
      var previousStep = stepIndex - 1;
      $scope.selection = $scope.steps[previousStep];
    }
  };

  $scope.validatePassword = function(){
    //console.log($scope.registrationInfo);
    return $scope.registrationInfo.teamPassword == $scope.registrationInfo.confirmPassword;
  };

  /**
   * This will check the entire registration form, returning a boolean of whether
   * or not the form is invalid. Checks if the required elements are set in the
   * registratioinInfo attribute
   *
   * @param form
   * @return {Boolean}
   */
  $scope.formInvalid = function(form){

    if ( $scope.registerDisabled )
    {
      // Form is disabled because registerDisabled is true
      return true;
    }

    //console.log($scope);
    var requiredInputs = [
      "teamName", "teamEmail", "teamPassword", "confirmEmail", "confirmPassword",
      "ventureName", "ventureType", "ventureDescription"
    ];

    var formInvalid = false;
    // For each required input, make sure it is defined and not null
    _.each(requiredInputs, function(fieldName) {
      if (_.isNull($scope.registrationInfo[fieldName]) || _.isUndefined($scope.registrationInfo[fieldName]) )
      {
        formInvalid = true;
      }
    });

    // Make sure there is at least one team member
    if ( $scope.registrationInfo.teamMembers.length == 0 )
    {
      // @todo Set an error variable to define where the form error is
      formInvalid = true;
    }

    return formInvalid;
  };

  /*
   * Checks if the confirm password matches the first password field
   */
  $scope.passwordMatch = function(confirmPassword) {
    return (confirmPassword == $scope.registrationInfo.teamPassword);
  };

  /*
   * Checks if the confirm email matches the first email field
   */
  $scope.emailMatch = function(confirmEmail) {
    return (confirmEmail == $scope.registrationInfo.teamEmail);
  };

  /*
   * Add a team member to the list of team members
   */
  $scope.addTeamMember = function() {
    $scope.registrationInfo.teamMembers.push({fullname: "", email:"", progression: "", major: "", editMode: true});
  };

  $scope.removeTeamMember = function (index) {
    if ( confirm("Are you sure you want to remove the team member?") )
    {
      $scope.registrationInfo.teamMembers.splice(index, 1);
    }
  };

  /*
   * Toggle edit mode for the team member with given index
   *
   * @todo Check the form for required values
   */
  $scope.toggleEditTeamMember = function ($index) {
    //console.log($scope.registrationInfo.teamMembers[$index]);
    //console.log($scope.registrationInfo);
    $scope.registrationInfo.teamMembers[$index].editMode = !$scope.registrationInfo.teamMembers[$index].editMode;
  };


  $scope.register = function(){
    //console.log($scope.registrationInfo);

    $scope.registerDisabled = true;

    $http.put(api_url + '/register', {venture: $scope.registrationInfo}).
      success(function(data, status, headers, config) {
        $scope.safeApply(function () {
          return $location.path('/login');
        });
      }).
      error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with status
        // code outside of the <200, 400) range
        $scope.registerDisabled = false;
        alert(data.message);
      });
  };


  // Redirect the user to the front page if they are not admin
  $scope.$on('$routeChangeSuccess', function(current, previous) {
    if ( !User.isAuthenticated() )
    {
      $scope.safeApply(function(){
        return $location.path('/');
      });
    }

    // If the venture info is already loaded, go ahead and return out of this function
    if ( $scope.registrationInfo.teamName != null )
    {
      return;
    }

    // Load the venture info
    var teamEmail = User.getEmail();

  });
}