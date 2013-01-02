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
$app->put( $appDirectory . '/register', function (Request $request) use ($app, $em)
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

    return $app->json( array( 'success' => true ) );
} );

