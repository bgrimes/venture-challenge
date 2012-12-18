<?php

use Symfony\Component\HttpFoundation\Request;

/**
 * /ci-inet-student/Routes/ProposalRoutes.php
 *
 * Requires Silex app ($app) and Doctrine entity manager ($em) to be set up.
 *
 * Available routes:
 *
 *  GET - /proposals
 *      Returns a list of all proposals that are approved
 *
 *  GET - /proposal/{id}
 *      Returns all info for the proposal with the given id
 *
 *  POST - /proposal/{id}
 *      Updates the proposal with the given id
 *
 *
 */

$app->get( $appDirectory . '/proposals', function () use ($em)
{
    $repo          = $em->getRepository( 'Proposal' );
    $proposals     = $repo->findAll();
    $proposal_list = array();
    foreach ($proposals as $proposal)
    {
        $proposal_list [] = $proposal->toArray();
    }

    return json_encode( $proposal_list );
} );


$app->get( $appDirectory . '/proposal/{id}', function ($id) use ($app, $em)
{


    $repo     = $em->getRepository( 'Proposal' );
    $proposal = $repo->findOneBy( array( 'id' => $id ) );
    if ( !$proposal )
    {
        return $app->json( array(), 404 ); // Not found
    }
    // Load the proposal user
    $proposal_user     = $proposal->getUser();
    $proposal          = $proposal->toArray();
    $proposal['owner'] = $proposal_user->toArray();

    return $app->json( $proposal, 200 );
} );

/* * /

    $message = \Swift_Message::newInstance();

    $message->setFrom("transcriptdb@gmail.com");
    $message->setTo(array("bgrimes@gmail.com"));
    $message->setBody("<h1>Hey</h1>", "text/html");
    $message->setSubject("Welcome");

    $app['mailer']->send($message);

/* */