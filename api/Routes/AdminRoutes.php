<?php

use Symfony\Component\HttpFoundation\Request;

/**
 * /ci-inet-student/Routes/VentureRoutes.php
 *
 * Requires Silex app ($app) and Doctrine entity manager ($em) to be set up.
 *
 * Available routes:
 *
 *  GET /admin/ventures
 *
 */

// GET - /register
//      Register the user
$app->get( $appDirectory . '/admin/ventures', function (Request $request) use ($app, $em)
{

    // Decode the json encoded venture info as an array
    //$ventureInfo = $request->get( 'venture' );

    $repo             = $em->getRepository( 'Venture' );
    $enabled_ventures = $repo->findAll();

    $ventures = array();
    foreach ( $enabled_ventures as $venture )
    {
        $ventures []= $venture->getInfoArray();
    }

    return $app->json($ventures);

    /* * /
    $message = \Swift_Message::newInstance();

    $message->setFrom("transcriptdb@gmail.com");
    $message->setTo(array("bgrimes@gmail.com"));
    $message->setBody("<h1>Hey</h1>", "text/html");
    $message->setSubject("Welcome");

    $app['mailer']->send($message);
    /* */
} );

/**
 * Route to approve a venture, must be post'd to with a post parameter of
 */
$app->post($appDirectory . '/admin/venture/approve', function(Request $request) use ($app, $em) {
    $id = $request->get('id');

    // @todo restrain to $_SERVER['HTTP_REFERER'] being the configured app root url

    // If the ID isn't set, return with an error
    if ( !$id )
    {
        return $app->json(array('success'=>false), 400);
    }

    // Get the venture repository
    $repo = $em->getRepository('Venture');

    // Attempt to find the venture by the ID
    $venture = $repo->findOneById($id);

    // If the vneture cannot be found by the ID
    if ( !$venture )
    {
        // Return with a 404 not found error
        return $app->json(array("message"=>"Could not find repo with specified ID: $id"), 404);
    }

    // Set the venture to 'enabled' (approved!)
    $venture->setEnabled(true);

    // Persist the venture (update it)
    $em->persist($venture);
    // Save the information to the database
    $em->flush();

    // Return success!
    return $app->json(array("success"=>true));
});
