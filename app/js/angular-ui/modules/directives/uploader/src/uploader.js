/**
 * Binds a FileUploader widget to an HTML element.
 * WORK IN PROGRESS. NEEDS CLEANING
 *
 * @requires http://valums.com/ajax-upload/
 * @param expression {object} options can contain the following keys:
 * 		url {string} path to where resources should be uploaded
 * 		allowedFileTypes {array[string]} an array of strings of allowed file types
 * @example <div ui-uploader="{ url : '../../action/resource?action=uploadCoverLetter', allowedFileTypes : ['gif','png','jpg'] }" ng-model="someData"></div>
 */
angular.module('ui.directives').directive('uiUploader', [function(){
  return function(scope, elm, attrs) {
    var expression = (attrs.uiUploader);
    var params = scope.$eval(expression);
    //scope.$parent.$root.file.showUploadPanel = true;
    var fileUploaded = false;
    var uploadResponse;
    var clickedElem = elm[0];
    $('.uploader-error').hide();
    $(clickedElem).show();
    if(!params.allowedFileTypes){
      params.allowedFileTypes  = [];
    }
    scope[attrs.ngModel] = {};
    //This is to flush out the fid incase you upload a resume and hit cancel and come over to attachments and upload a new attachment.
    //scope.$parent.$root.resourceInfo.fId = [];
    var url = params.url;
    var uploader = new qq.FileUploader({
      element: clickedElem,
      action: url,
      allowedExtensions: params.allowedFileTypes ,
      sizeLimit:100000000,
      multiple: false,
      i18n:i18n,
      debug:false,
      onSubmit: function(id, fileName){
        if($('.uploader-error').length!=0){
          $('.uploader-error').hide();
        }
        $(clickedElem).append('<progress max="100"><strong class="text_fallback"> </strong></progress><p class="percent"></p>');
        fileUploaded = false;
        $('.cancel-upload').live('click',function(){
          uploader._handler.cancel(id);
          $('.qq-upload-list > li:last-child').remove();
          $(clickedElem).children('progress').remove();
          //$(clickedElem).children('.cancel-upload').remove();
          $(clickedElem).children('.qq-uploader').fadeIn(200);
          return false;
        });
      },
      onDelete : function (id,fileName){
        if(uploadResponse == 200 && fileUploaded){
          $(clickedElem).children('progress').hide();
        }else{
          return false;
        }
      },
      onProgress: function(id, fileName, loaded, total){

        if(!fileUploaded){
          //$(clickedElem).children('.qq-uploader').hide();
          var percent = (loaded/total)*90;
          percent = Math.round(percent);
          if(percent == 90){
            fileUploaded = true;
          }
          $('.actn-delete').hide();
          $(clickedElem).children('progress').attr('value',percent);
          //In older browsers that dont support the progress bar tag this text will show up
          $(clickedElem).children('.text_fallback').text(percent+'%');
        }else{
          if(uploadResponse == 200 && fileUploaded){
            $(clickedElem).children('progress').attr('value',100);
            $(clickedElem).children('progress').remove();
            //$(clickedElem).children('.cancel-upload').remove();
            $(clickedElem).children('.qq-uploader').fadeIn(200);
            $('.actn-delete').show();
            uploadResponse = '';
          }
        }
      },
      onCancel: function (id,filename){
        $(clickedElem).children('progress').remove();
        $(clickedElem).children('.qq-uploader').fadeIn(200);
      },
      onComplete: function(id, fileName, responseJSON){
        uploadResponse = responseJSON.msgInfo;
        if(responseJSON.msgInfo == 200 && fileUploaded){
          scope.$apply(function(){
            scope[attrs.ngModel][responseJSON.resourceInfo.eid] = responseJSON;
          });
          fileUploaded = false;
        }
      },
      showMessage: function(message){
        if(message){
          $('.uploader-error').html(message).show();
        }
      }
    });
  };
}]);