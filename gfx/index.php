<?php
switch($_SERVER['GEOIP_COUNTRY_CODE'])
{
    case 'SE' :
        include_once('se.inc.php');
    break;
    case 'EN' :
    default: 
        include_once('en.inc.php');
    break;
}
?>