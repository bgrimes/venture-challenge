<?php

require_once 'vendor/autoload.php';
//require_once 'Entity/User.php';
//require_once 'Entity/Proposal.php';
require_once 'Entity/Venture.php';

use Doctrine\DBAL\Tools\Console\Helper\ConnectionHelper;
use Doctrine\ORM\Tools\Console\Helper\EntityManagerHelper;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\Tools\Console\ConsoleRunner;
use Symfony\Component\Console\Helper\HelperSet;
use Doctrine\ORM\Tools\Setup;
use Symfony\Component\Yaml\Yaml;

$config = Yaml::parse( __DIR__ . '/config/config.yml' );
$isDevMode = true;

$dbParams = array(
    'driver'   => 'pdo_mysql',
    'user'     => $config['database']['connections']['mysql']['user'],
    'password' => $config['database']['connections']['mysql']['pass'],
    'dbname'   => $config['database']['connections']['mysql']['db_name'],
);

$entityPaths = array(__DIR__.'/Entity');

// Get the annotation mapping info
$doctrine_config = Setup::createAnnotationMetadataConfiguration($entityPaths, $isDevMode);

$em = EntityManager::create($dbParams, $doctrine_config);

$helperSet = new HelperSet( array(
    'db' => new ConnectionHelper( $em->getConnection() ),
    'em' => new EntityManagerHelper( $em )
) );

ConsoleRunner::run( $helperSet );

/* * /
$repo = $em->getRepository("User");
$user = new User();
$user->setEmail("bgrimes@gmail.com");
$user->setPassword('iamben!');
$user->setRoles(array('administrator'));

try {
    echo "persisting\n";
    $em->persist($user);
    $em->flush();
} catch ( \Exception $e )
{
    echo $e->getMessage() . "\n";
}

/* */
