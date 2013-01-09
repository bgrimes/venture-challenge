<?php

require_once 'api/vendor/autoload.php';

use PHPImageWorkshop\ImageWorkshop;

// get: action, qqFile (filename)
//logger( json_encode( $_GET ) );
//logger(json_encode($_POST));
//logger(json_encode($_FILES));
//logger( "-------------------" );

function logger($msg)
{
    file_put_contents( "upload.log.txt", $msg . "\n", FILE_APPEND | LOCK_EX );
}

$allowedExtensions = array( 'jpeg', 'jpg', 'png' );
$sizeLimit         = 1024 * 1024; // 1 MB

$uploader = new ventureFileUploader();
$uploader->setAllowedExtensions( $allowedExtensions )
    ->setSizeLimit( $sizeLimit );

$upload_root = 'uploads';
$currentDate = date( "Ymd" );

// Ensure the main upload directory exists
if ( !is_dir( $upload_root . '/full/' . $currentDate ) )
{
    mkdir( $upload_root . '/full/' . $currentDate, 0777, true );
}
elseif ( !is_writable( $upload_root . '/full/' . $currentDate ) )
{
    echo htmlspecialchars( json_encode( array( 'success' => false, 'message' => $upload_root . " is not writable." ), ENT_QUOTES ) );

    return;
}

// Handleupload will receive the image, save it as a fullsize, mediumsize and thumbnail size image
// in the uploads directory with the given current date.
$result = $uploader->handleUpload( $upload_root, $currentDate );
//$result['filepath'] = $currentDate . '/' . $_GET['qqfile'];

echo htmlspecialchars( json_encode( $result ), ENT_NOQUOTES );

/****************************************
Example of how to use this uploader class...
You can uncomment the following lines (minus the require) to use these as your defaults.

// list of valid extensions, ex. array("jpeg", "xml", "bmp")
$allowedExtensions = array();
// max file size in bytes
$sizeLimit = 10 * 1024 * 1024;

require('valums-file-uploader/server/php.php');
$uploader = new qqFileUploader($allowedExtensions, $sizeLimit);

// Call handleUpload() with the name of the folder, relative to PHP's getcwd()
$result = $uploader->handleUpload('uploads/');

// to pass data through iframe you will need to encode all html tags
echo htmlspecialchars(json_encode($result), ENT_NOQUOTES);

/******************************************/


/**
 * Handle file uploads via XMLHttpRequest
 */
class qqUploadedFileXhr
{
    /**
     * Save the file to the specified path
     * @return boolean TRUE on success
     */
    public function save($path)
    {
        $input    = fopen( "php://input", "r" );
        $temp     = tmpfile();
        $realSize = stream_copy_to_stream( $input, $temp );
        fclose( $input );

        if ( $realSize != $this->getSize() )
        {
            return false;
        }

        $target = fopen( $path, "w" );
        fseek( $temp, 0, SEEK_SET );
        stream_copy_to_stream( $temp, $target );
        fclose( $target );

        return true;
    }

    /**
     * Get the original filename
     * @return string filename
     */
    public function getName()
    {
        return $_GET['qqfile'];
    }

    /**
     * Get the file size
     * @return integer file-size in byte
     */
    public function getSize()
    {
        if ( isset( $_SERVER["CONTENT_LENGTH"] ) )
        {
            return (int)$_SERVER["CONTENT_LENGTH"];
        }
        else
        {
            throw new Exception( 'Getting content length is not supported.' );
        }
    }
}

/**
 * Handle file uploads via regular form post (uses the $_FILES array)
 */
class qqUploadedFileForm
{

    /**
     * Save the file to the specified path
     * @return boolean TRUE on success
     */
    public function save($path)
    {
        return move_uploaded_file( $_FILES['qqfile']['tmp_name'], $path );
    }

    /**
     * Get the original filename
     * @return string filename
     */
    public function getName()
    {
        return $_FILES['qqfile']['name'];
    }

    /**
     * Get the file size
     * @return integer file-size in byte
     */
    public function getSize()
    {
        return $_FILES['qqfile']['size'];
    }
}

class ventureFileUploader
{
    /** @var array $allowedExtensions */
    private $allowedExtensions;

    /** @var int $sizeLimit */
    private $sizeLimit;

    /** @var mixed|qqUploadedFileForm|qqUploadedFileXhr $file */
    private $file;

    /** @var string $uploadName */
    private $uploadName;

    public function __construct()
    {
        $this
            ->setAllowedExtensions( array() )
            ->setSizeLimit( $this->toBytes( ini_get( 'upload_max_filesize' ) ) );

        $this->checkServerSettings();

        if ( !isset( $_SERVER['CONTENT_TYPE'] ) )
        {
            $this->file = false;
        }
        else
        {
            if ( strpos( strtolower( $_SERVER['CONTENT_TYPE'] ), 'multipart/' ) === 0 )
            {
                $this->file = new qqUploadedFileForm();
            }
            else
            {
                $this->file = new qqUploadedFileXhr();
            }
        }

        $this->uploadName = time();
    }


    /**
     * Handle the uploaded file
     *
     * @param string $uploadDirectory
     * @param string $intermittentDir A director to prepend the filename
     * @param string $replaceOldFile  =true
     *
     * @returns array('success'=>true) or array('error'=>'error message')
     */
    function handleUpload($uploadDirectory, $intermittentDir = "", $replaceOldFile = false)
    {
        if ( !is_writable( $uploadDirectory ) )
        {
            return array( 'error' => "Server error. Upload directory isn't writable." );
        }

        if ( !$this->file )
        {
            return array( 'error' => 'No files were uploaded.' );
        }

        $size = $this->file->getSize();

        if ( $size == 0 )
        {
            return array( 'error' => 'File is empty' );
        }

        if ( $size > $this->sizeLimit )
        {
            return array( 'error' => 'File is too large' );
        }

        $pathinfo = pathinfo( $this->file->getName() );
        $filename = $pathinfo['filename'];
        $ext      = $pathinfo['extension'];

        if ( $this->allowedExtensions and !in_array( strtolower( $ext ), $this->allowedExtensions ) )
        {
            $these = implode( ', ', $this->allowedExtensions );

            return array( 'error' => 'File has an invalid extension, it should be one of ' . $these . '.' );
        }


        if ( !$replaceOldFile )
        {
            /// don't overwrite previous files that were uploaded
            while (file_exists( $uploadDirectory . '/full/' . $intermittentDir . '/' . $filename . "." . $ext ))
            {
                $filename .= rand( 10, 99 );
            }
        }

        $this->uploadName = $filename . "." . $ext;

        if ( $this->file->save( $uploadDirectory . '/full/' . $intermittentDir . '/' . $this->uploadName ) )
        {
            $mediumBasePath    = $uploadDirectory . '/medium/' . $intermittentDir . '/';
            $thumbnailBasePath = $uploadDirectory . '/thumbnail/' . $intermittentDir . '/';
            $createFolders     = true;
            $backgroundColor   = null;
            $imageQuality      = 95;

            // Attempt to save medium and thumbnails
            $baseLayer = ImageWorkshop::initFromPath( $uploadDirectory . '/full/' . $intermittentDir . '/' . $this->uploadName );
            $baseLayer->cropMaximumInPixel( 0, 0, "MM" );
            $baseLayer->resizeInPixel( 300, 170 );
            $baseLayer->save( $mediumBasePath, $this->uploadName, $createFolders, $backgroundColor, $imageQuality );

            // convert to smaller width
            $baseLayer->resizeInPixel( 170, 170 );
            $baseLayer->save( $thumbnailBasePath, $this->uploadName, $createFolders, $backgroundColor, $imageQuality );


            return array( 'success' => true, 'filepath' => $intermittentDir . '/' . $this->uploadName );
        }
        else
        {
            return array(
                'error' => 'Could not save uploaded file.' .
                    'The upload was cancelled, or server error encountered'
            );
        }

    }


    /**
     * Get the name of the uploaded file
     * @return string
     */
    public function getUploadName()
    {
        return $this->uploadName;
    }

    /**
     * Get the original filename
     * @return string filename
     */
    public function getName()
    {
        if ( $this->file )
        {
            return $this->file->getName();
        }

        return "";
    }

    /**
     * @param $sizeLimit
     *
     * @return ventureFileUploader
     */
    public function setSizeLimit($sizeLimit)
    {
        $this->sizeLimit = $sizeLimit;

        return $this;
    }

    /**
     * @param array $allowedExtensions
     *
     * @return ventureFileUploader
     */
    public function setAllowedExtensions(array $allowedExtensions)
    {
        $allowedExtensions = array_map( "strtolower", $allowedExtensions );

        $this->allowedExtensions = $allowedExtensions;

        return $this;
    }


    /**
     * Internal function that checks if server's may sizes match the
     * object's maximum size for uploads
     */
    private function checkServerSettings()
    {
        $postSize   = $this->toBytes( ini_get( 'post_max_size' ) );
        $uploadSize = $this->toBytes( ini_get( 'upload_max_filesize' ) );

        if ( $postSize < $this->sizeLimit || $uploadSize < $this->sizeLimit )
        {
            $size = max( 1, $this->sizeLimit / 1024 / 1024 ) . 'M';
            die( json_encode( array( 'error' => 'increase post_max_size and upload_max_filesize to ' . $size ) ) );
        }
    }

    /**
     * Convert a given size with units to bytes
     *
     * @param string $str
     */
    private function toBytes($str)
    {
        $val  = trim( $str );
        $last = strtolower( $str[strlen( $str ) - 1] );
        switch ($last)
        {
            case 'g':
                $val *= 1024;
            case 'm':
                $val *= 1024;
            case 'k':
                $val *= 1024;
        }

        return $val;
    }
}