<?php

/**
 * @Entity
 * @Table(name="ventures")
 */
class Venture
{
    /**
     * @var int $id
     * @Id @Column(type="integer")
     * @GeneratedValue
     */
    protected $id;

    /**
     * @var string $email
     * @Column(type="string", unique=true)
     */
    protected $email;

    /**
     * @var string $password
     * @Column(type="string")
     */
    protected $password;

    /**
     * @var string $salt
     * @Column(type="string")
     */
    protected $salt;

    /**
     * @var array $roles
     * @Column(type="array")
     */
    protected $roles;


    /**
     * @var string $ventureInfo
     * @Column(type="text", nullable=true)
     */
    protected $ventureInfo;

    /**
     * @var int $votes
     * @Column(type="integer")
     */
    protected $votes;

    /**
     * This is used to
     *
     * @var bool $enabled
     * @Column(type="boolean")
     */
    protected $enabled;

    public function __construct()
    {
        $this->enabled = false;
        $this->votes   = 0;
        $this->salt    = base_convert( sha1( uniqid( mt_rand(), true ) ), 16, 36 );
        $this->roles   = array();
    }

    /**
     * @return string
     */
    public function getSalt()
    {
        return $this->salt;
    }

    /**
     * @param string $ventureInfo
     */
    public function setVentureInfo($ventureInfo)
    {
        if ( is_array( $ventureInfo ) )
        {
            $ventureInfo = json_encode( $ventureInfo, ENT_NOQUOTES );
        }
        $this->ventureInfo = $ventureInfo;
    }

    /**
     * @return string
     */
    public function getVentureInfo()
    {
        return json_decode( $this->ventureInfo, true );
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param string $email
     */
    public function setEmail($email)
    {
        $this->email = $email;
    }

    /**
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password = $this->encodePassword( $password );
    }

    /**
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    public function setRoles($roles)
    {
        $this->roles = $roles;
    }

    public function getRoles()
    {
        return $this->roles;
    }

    public function toArray()
    {
        return array(
            "email"       => $this->email,
            "roles"       => $this->roles, // Return the array of roles
            "role"        => $this->roles[0], // ...as well as the lead role (0-index)
            "ventureInfo" => $this->getVentureInfo(),
            "votes"       => $this->getVotes(),
        );
    }

    /**
     * Get the basic info from the object (to be returned to the view)
     *
     * @return array
     */
    public function getInfoArray()
    {
        return array(
            "id"              => $this->getId(),
            "votes"           => $this->getVotes(),
            "ventureInfo"     => $this->getVentureInfo(),
            "videoEmbedLink"  => $this->getEmbedableVideoLink(),
            "enabled"         => $this->getEnabled(),
            "voteable"        => true,
        );
    }

    /**
     * @param boolean $enabled
     *
     * @return Venture
     */
    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;
        return $this;
    }

    /**
     * @return boolean
     */
    public function getEnabled()
    {
        return $this->enabled;
    }



    /**
     * @return Venture
     */
    public function incrementVote()
    {
        $this->votes++;

        return $this;
    }

    /**
     * @return int
     */
    public function getVotes()
    {
        return $this->votes;
    }


    public function encodePassword($password)
    {
        return md5( $password . $this->salt );
    }

    public function getEmbedableVideoLink($height=150, $width=220)
    {
        // Get the venture info array from the attribute
        $ventureInfo = $this->getVentureInfo();

        // Check if the video link is set and non-empty
        if ( !isset( $ventureInfo['ventureVideoLink'] ) or empty( $ventureInfo['ventureVideoLink'] ) )
        {
            return false;
        }

        $videoLink = $ventureInfo['ventureVideoLink'];

        // Check if the video link is well-formed and we can parse out the service name and video ID
        if ( !preg_match('/^.*(?<service>vimeo|youtube).*\/(watch\?v=)?(?<videoId>[a-zA-Z0-9]+)/', $videoLink, $matches) )
        {
            return false;
        }

        $videoService = $matches['service'];
        $videoId      = $matches['videoId'];

        if ( $videoService == "youtube" )
        {
            $secureVideoLink = "https://www.youtube.com/embed/$videoId";
        }
        elseif ( $videoService == "vimeo" )
        {
            $secureVideoLink = "https://player.vimeo.com/video/$videoId";
        }
        else
        {
            // We don't know how to handle any other service
            return false;
        }

        return $secureVideoLink;

//        $embedCode = '<iframe src="'
//            . $secureVideoLink
//            . '" width="'  . $width
//            . '" height="' . $height
//            . '" frameborder="0"'
//            . ' webkitAllowFullScreen mozallowfullscreen allowFullScreen'
//            . '></iframe>'
//        ;

        return $embedCode;
        // Youtube
        // <iframe width="560" height="315" src="https://www.youtube.com/embed/7kShJL5WzhQ" frameborder="0" allowfullscreen></iframe>

        // Vimeo iframe
        // <iframe src="http://player.vimeo.com/video/VIDEO_ID" width="WIDTH" height="HEIGHT" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
    }
}