<?php

use Symfony\Component\HttpFoundation\Request;

/**
 * /ci-inet-student/Routes/RegisterRoutes.php
 *
 * Requires Silex app ($app) and Doctrine entity manager ($em) to be set up.
 *
 * Available routes:
 *
 *  PUT /register
 *
 *
 */

// PUT - /register
//      Register the user
$app->put( $appDirectory . '/register', function (Request $request) use ($app, $em, $config)
{
    $app['monolog']->addDebug( 'Register called', array( $request->get( 'venture' ) ) );

    // Decode the json encoded venture info as an array
    $ventureInfo = $request->get( 'venture' );

    $repo    = $em->getRepository( 'Venture' );
    $venture = $repo->findOneBy( array( 'email' => $ventureInfo['teamEmail'] ) );
    if ( $venture )
    {
        // The email is already registered to an existing venture
        // Throw a 409 Conflict error
        return $app->json( array( 'message' => 'The contact email you supplied is already being used.' ), 409 ); // Conflict
    }

    $venture = new Venture();
    $venture->setEmail( $ventureInfo['teamEmail'] );
    $venture->setPassword( $ventureInfo['teamPassword'] );
    $venture->setRoles( array( 'team' ) );

    unset($ventureInfo['teamPassword']);
    unset($ventureInfo['confirmPassword']);

    $venture->setVentureInfo( $ventureInfo );

    $em->persist( $venture );
    $em->flush();


    /* * /
    $message = \Swift_Message::newInstance();

    $message->setFrom("transcriptdb@gmail.com");
    $message->setTo(array("bgrimes@gmail.com"));
    $message->setBody("<h1>Hey</h1>", "text/html");
    $message->setSubject("Welcome");

    $app['mailer']->send($message);
    /* */

    $adminUsers = $config['admin_users'];
    $sendTo     = array();
    foreach ($adminUsers as $adminUser)
    {
        $sendTo [] = $adminUser['email'];
    }

    $app['monolog']->addInfo("Sending registration info for team: {$ventureInfo['teamEmail']}", array($sendTo));

    if ( !empty($sendTo) )
    {
        $message = $app['mailer']
            ->createMessage()
            ->setFrom( "transcriptdb@gmail.com" )
            ->setTo( $sendTo )
            ->setSubject( "Venture Challenge User Registration" )
            ->setBody( "<h1>A new team has registered!</h1>" .
                "<p><b>Team contact email:</b> {$ventureInfo['teamEmail']}</p>" .
                "<br><br><br><p>Please <a href='https://ci.uky.edu/inet/page/inet-venture-challenge-program#/login'>login</a> and review their submission</p>"
            , "text/html" );
        $app['mailer']->send( $message, $fails );
    }

    return $app->json( array( 'success' => true ) );
} );

