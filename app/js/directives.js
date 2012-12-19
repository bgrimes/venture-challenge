'use strict';

/* Directives */


angular.module('ventureChallenge.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);

angular.module('ventureChallenge.directives').directive('ventureUploader', function($parse, root_url){
  return function(scope, elm, attrs, controller) {
    var expression = (attrs.ventureUploader);
    var options    = scope.$eval(expression);
    var ngModel    = $parse(attrs.ngModel);
    // Set the default params
    var params = {
      url     : root_url + '/' + options.upload_script,
      multiple: false,
      file_limit: 1,
      debug: false,
      buttonText: "Upload A Picture"
    };
    // Merge the passed options with the default params
    $.extend(params, options);

    //scope.$parent.$root.file.showUploadPanel = true;
    var clickedElem = elm[0];

    $('.uploader-error').hide();
    $(clickedElem).show();

    if(!params.allowedFileTypes){
      params.allowedFileTypes  = [];
    }

    scope[attrs.ngModel] = {};
    //This is to flush out the fid incase you upload a resume and hit cancel and come over to attachments and upload a new attachment.
    //scope.$parent.$root.resourceInfo.fId = [];
    var url        = params.url;
    var fileCount  = 0;
    var fileLimit  = params.file_limit;

    // Init the uploader object
    var uploader = new qq.FineUploader({
      element: clickedElem,
      request: {
        endpoint: url
      },
      text: {
        uploadButton: '<i class="icon-upload icon-white"></i> ' + params.buttonText
      },
      template: '<div class="qq-uploader span4">' +
                  '<pre class="qq-upload-drop-area span4"><span>{dragZoneText}</span></pre>' +
                  '<div class="qq-upload-button btn btn-success" style="width:auto;">{uploadButtonText}</div>' +
                  '<ul class="qq-upload-list" style="margin-top: 10px; text-align:center;"></ul>' +
                '</div>',
      classes: {
        success: 'alert alert-success',
        fail: 'alert alert-error'
      },
      validation: {
        allowedExtensions: params.allowedFileTypes,
        sizeLimit: 1048576 // 1 MB
      },
      multiple: params.multiple,
      debug:    params.debug,
      callbacks: {
        onSubmit: function(id, fileName) {
          // Incr the file count
          fileCount++;
          if ( fileCount > fileLimit && !confirm("This will replace the existing image, are you sure you want to do this?"))
          {
            //alert("Only " + fileLimit + " image(s) is/are allowed");
            return false;
          }
        },
        onCancel: function(id, fileName) {
          fileCount--;
          if ( fileCount <= fileLimit )
          {

          }
        },
        onComplete: function(id, fileName, responseJSON){
          if ( responseJSON.success )
          {
            //$(".qq-upload-list:visible").append('<img src="/ci-inet-student/'+responseJSON.filepath+'">');
            scope.$apply(function(scope){
              ngModel.assign(scope, responseJSON.filepath);
            });

          }
        } // oncomplete
      } // callbacks
    });
  };
});
