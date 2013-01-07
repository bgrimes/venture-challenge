'use strict';

/* Controllers */

function MainCtrl($scope, $route, $routeParams, $location, User, base_url, root_url) {
  $scope.root_url     = root_url;
  $scope.base_url     = base_url;
  $scope.$route       = $route;
  $scope.$location    = $location;
  $scope.$routeParams = $routeParams;

  $scope.User = User;


  // User Logout function
  $scope.logout = function () {
    User.logout(function (result) {
      if (!result) {
        return window.alert("There was a problem logging you out, sorry!");
      } else {
        $scope.safeApply(function () {
          return $location.path('/');
        });
      }
    });
  };

  // https://coderwall.com/p/ngisma
  $scope.safeApply = function (fn) {
    var phase = this.$root.$$phase;
    if (phase == '$apply' || phase == '$digest') {
      if (fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

}

function AdminCtrl($scope, $route, $routeParams, $location, $log, User, Admin)
{

  // Used to order the venture list in the view
  $scope.predicate = "enabled";

  /**
   * Approve a venture with a given id
   *
   * @param ventureId
   */
  $scope.approve = function(ventureId, $event) {

    // Disable the button
    $($event.currentTarget).addClass('disabled');

    $log.info([$event, $event.currentTarget]);

    var venture = Admin.getVenture(ventureId);
    // Attempt to find the venture by id from the admin ventures
    if ( typeof venture == "undefined" )
    {
      alert("There was an error processing your request (venture ID " + ventureId + " cannot be found).");
    }

    var promise = Admin.approveVenture(ventureId);
    promise.then(function(){
      venture.enabled = true;

      // Remove the button
      $($event.currentTarget).remove();
    }, function(){
      // Disable the button
      $($event.currentTarget).removeClass('disabled');
      alert("There was an error processing your request, please try again soon");
    });
  };


  // Redirect the user to the front page if they are not admin
  $scope.$on('$routeChangeSuccess', function(current, previous) {
    if ( !User.isAuthenticated() || !User.isAdmin() )
    {
      $scope.safeApply(function(){
        return $location.path('/');
      });
    }

    // If the ventures haven't been loaded
    if ( Admin.self.ventures.length == 0 )
    {
      // Set up the promise object
      var venture_promise = Admin.getVentures();

      // When the promise becomes fulfilled:
      venture_promise.then(function(){
        // Set the local ventures to the passed
        $scope.ventures      = Admin.self.ventures;
        // Set the local ventures to the passed
        $scope.ventures      = Admin.self.ventures;
        $scope.activeVenture = Admin.getVenture($routeParams.ventureId);
      }, function(){
        // There was an error (the promise was rejected)
      });
      return;
    }
    else
    {
      $scope.ventures = Admin.self.ventures;
    }

    // Will set the active venture attribute if the id is set
    $scope.activeVenture = Admin.getVenture($routeParams.ventureId);

    //$log.info(['admin routechange', $scope.ventures]);
  });


}


/**
 * Registration controller
 *
 * @param $scope
 * @param $http
 * @param $location
 * @constructor
 */
function RegisterCtrl($scope, $http, $location, api_url) {

  $scope.max_venture_images = 4;

  $scope.steps = [
    'Details',
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

  // https://coderwall.com/p/ngisma
  $scope.safeApply = function (fn) {
    var phase = this.$root.$$phase;
    if (phase == '$apply' || phase == '$digest') {
      if (fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };
}


/**
 * Login Controller
 *
 * @param $scope
 * @param $location
 * @param User
 * @constructor
 */
function LoginCtrl($scope, $location, User) {
  // Define the login function, called from the login form
  $scope.login = function () {

    var promise = User.login($scope.email, $scope.pass);
    promise.then(function(){
      // Return the user to the root path
      return $scope.safeApply(function () {
        return $location.path('/');
      });
    }, function(reason){
      window.alert("Login failed: " + reason);
    });
  };
}
