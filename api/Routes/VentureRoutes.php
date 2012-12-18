<?php

use Symfony\Component\HttpFoundation\Request;

/**
 * /ci-inet-student/Routes/VentureRoutes.php
 *
 * Requires Silex app ($app) and Doctrine entity manager ($em) to be set up.
 *
 * Available routes:
 *
 *  GET /venture
 *
 *  GET /venture/{id}
 *
 *  POST /venture/{id}/upvote
 *
 */

// GET - /register
//      Register the user
$app->get( $appDirectory . '/venture', function (Request $request) use ($app, $em)
{

    // Decode the json encoded venture info as an array
    //$ventureInfo = $request->get( 'venture' );

    $repo             = $em->getRepository( 'Venture' );
    $enabled_ventures = $repo->findBy( array( 'enabled' => true ));


    $ventures = array();
    foreach ( $enabled_ventures as $venture )
    {

        $ventures []= $venture->getInfoArray();
    }

    // Get the cache service and the users unique id
    $cache  = $app['caches']['file'];
    $userId = getRemoteId();
    $userCache = $cache->fetch($userId);
    // If the user has any cached votes
    if ( isset($userCache['ventureVotes']) )
    {
        foreach ( $ventures as $key => $venture )
        {
            // If the venture id is in the ventureVotes array, make it non-votable
            $ventures[$key]['voteable'] = !in_array($venture['id'], $userCache['ventureVotes']);
        }
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

$app->post($appDirectory . '/venture/upvote', function(Request $request) use ($app, $em) {
    // Get the venture ID from the request
    $id = $request->get("id");

    // If the id is not set
    if ( !$id )
    {
        // Return with an error
        return $app->json(array("message" => "'id' must be set."), 400);
    }

    $cache  = $app['caches']['file'];
    $userId = getRemoteId();

    $userCache = $cache->fetch($userId);

    if ( isset($userCache['ventureVotes']) and in_array($id, $userCache['ventureVotes']) )
    {
        return $app->json(array('message' => 'You have already voted for this venture.'), 400);
    }

    $repo = $em->getRepository('Venture');
    $venture = $repo->findOneById($id);

    // If the venture cannot be found
    if ( !$venture )
    {
        // Return with an error
        return $app->json(array("message" => "Could not find venture with ID '$id'"), 404);
    }

    // Increment the ventures vote count
    $venture->incrementVote();

    // Save the venture
    $em->persist($venture);
    $em->flush();

    // Update the cache
    if ( !isset($userCache['ventureVotes']) )
    {
        $userCache['ventureVotes'] = array($id);
    }
    else
    {
        // Else the array exists, so just append to it
        $userCache['ventureVotes'] []= $id;
    }

    $cache->save($userId, $userCache, 60*60*24); // Persist for one day

    return $app->json(array("votes" => $venture->getVotes()));


});

