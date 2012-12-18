<?php

use Symfony\Component\HttpFoundation\Request;

/**
 * /ci-inet-student/Routes/AuthRoutes.php
 *
 * Requires Silex app ($app) and Doctrine entity manager ($em) to be set up.
 *
 * Available routes:
 *
 *
 *
 *
 */

$app->post( $appDirectory . '/auth', function (Request $request) use ($app, $em)
{
    //$email = "bgrimes@gmail.com";
    //$pass  = "iamben!";

    $email = $request->get('email');
    $pass  = $request->get('pass');

    // Get the user repository from the entity manager
    $repo = $em->getRepository( 'Venture' );

    // Try to find the user by the given email
    $user = $repo->findOneBy( array( 'email' => $email ) );

    // If the user does not exist in the database
    if ( !$user )
    {
        // Return with an error
        return $app->json( array( 'success' => false, 'message' => "User not found." ), 403 );
    }

    // Get the hashed_password from the user object (the stored password is md5 hashed with the users unique salt
    $hashed_pass = $user->getPassword();

    // If the stored password does not equal the encoded passed password from the request
    if ( $hashed_pass !== $user->encodePassword( $pass ) )
    {
        // Return with an authentication error
        return $app->json( array( 'success' => false, 'message' => 'Incorrect password.' ), 403);
    }

    // Else success! return with the user object
    return $app->json( array( 'success' => true, 'user' => $user->toArray() ) );
} );


/* * /

    $message = \Swift_Message::newInstance();

    $message->setFrom("transcriptdb@gmail.com");
    $message->setTo(array("bgrimes@gmail.com"));
    $message->setBody("<h1>Hey</h1>", "text/html");
    $message->setSubject("Welcome");

    $app['mailer']->send($message);

/* */