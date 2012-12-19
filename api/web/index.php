<?php

require_once __DIR__ . "/../vendor/autoload.php";
//require_once __DIR__ . "/../Entity/User.php";
require_once __DIR__ . "/../Entity/Venture.php";

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\HttpFoundation\Session\Session;

use CHH\Silex\CacheServiceProvider;

use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\Tools\Setup;
use Doctrine\ORM\EntityManager;

$config = Yaml::parse( __DIR__ . "/../config/config.yml" );

// Entity manager dev mode
$isDevMode = true;

// Setup the EntityManager

$dbParams = array(
    'driver'   => 'pdo_mysql',
    'user'     => $config['database']['connections']['mysql']['user'],
    'password' => $config['database']['connections']['mysql']['pass'],
    'dbname'   => $config['database']['connections']['mysql']['db_name'],
);

$entityPaths = array( __DIR__ . '/Entity' );

// Get the annotation mapping info
$doctrineConfig = Setup::createAnnotationMetadataConfiguration( $entityPaths, $isDevMode );
$em             = EntityManager::create( $dbParams, $doctrineConfig );
$appDirectory   = $config["base_url"];

$app          = new Silex\Application();
$app['debug'] = $isDevMode;

// Register the logger
$app->register( new Silex\Provider\MonologServiceProvider(), array(
    'monolog.logfile' => __DIR__ . '/development.log',
) );

// Setup the filecache
$app->register( new \CHH\Silex\CacheServiceProvider(), array(
   'cache.options' => array('file' => array(
       "driver"    => 'filesystem',
       "directory" => rtrim(sys_get_temp_dir(), "/") . "/venture_challenge",
   )),
));

// Register swiftmailer
$app->register(new Silex\Provider\SwiftmailerServiceProvider());
$app['swiftmailer.options'] = $config['swiftmailer']['options'];

// Register the session service provider
$app->register(new Silex\Provider\SessionServiceProvider());
$app['session.storage.options'] = array(
    "cookie_lifetime" => 60*60*24,
);

/*
 * Convert any json request to an array before the request is handled
 */
$app->before( function (Request $request)
{
    if ( 0 === strpos( $request->headers->get( 'Content-Type' ), 'application/json' ) )
    {
        $data = json_decode( $request->getContent(), true );
        $request->request->replace( is_array( $data ) ? $data : array() );
    }
} );

// Test
$app->get($appDirectory . '/', function(Request $request) use ($app, $em) {

    if ( null === $user = $app['session']->get('user') )
    {
        $app['session']->set('user', array(1,2,3,4));
        var_dump("ACK NOT SET\n");
    }
    else
    {
        var_dump("USER SET\n", $user);
    }
    die;

    var_dump($_SERVER, $_COOKIE);die;

    $cache = $app['caches']['file'];

    if ( !$cache->fetch('12816347178') )
    {
        echo "Caching...<br>";
        $cache->save("12816347178", array("ventureId" => array(1,2)), 20);

    }
    else
    {
        echo "Exists already, sheesh<br>";
        //$cache->delete("12816347178");
    }
die;
    return $app->json(array('/'));
});

// Include the proposal routes
require_once __DIR__ . '/../Routes/AuthRoutes.php';
require_once __DIR__ . '/../Routes/AdminRoutes.php';
require_once __DIR__ . '/../Routes/RegisterRoutes.php';
//require_once __DIR__ . '/../Routes/ProposalRoutes.php';
require_once __DIR__ . '/../Routes/VentureRoutes.php';

$app->run();

/**
 * Returns a unique id that is based on the users ip address
 *
 * @param \Symfony\Component\HttpFoundation\Session\Session $session
 *
 * @return string
 */
function getRemoteId(Session $session)
{
    // Check if the user session object exists
    if ( null === $identifier = $session->get('identifier') )
    {
        // Create the identifier object using uniqid which creates a 13 character unique id based on the current time
        $identifier = uniqid();
        $session->set("identifier", $identifier);
    }

    return $identifier;
}