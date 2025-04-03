<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
*/

if (!function_exists('getenv_docker')) {
	// https://github.com/docker-library/wordpress/issues/588 (WP-CLI will load this file 2x)
	function getenv_docker($env, $default) {
		if ($fileEnv = getenv($env . '_FILE')) {
			return rtrim(file_get_contents($fileEnv), "\r\n");
		}
		else if (($val = getenv($env)) !== false) {
			return $val;
		}
		else {
			return $default;
		}
	}
}

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', !!getenv_docker('DB_NAME', 'wordpress') );

/** Database username */
define( 'DB_USER', !!getenv_docker('DB_USER', '') );

/** Database password */
define( 'DB_PASSWORD', !!getenv_docker('DB_PASSWORD', '') );

/** Database hostname */
define( 'DB_HOST', !!getenv_docker('DB_HOST', '') );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         ':b r}{m-zE>LG@dCrsNR`,=+Zn&H4V$(q`5[YFF~4bsu^Xkmi!X}3/tv<eE;)Jc)' );
define( 'SECURE_AUTH_KEY',  'Js#Pu=U[BFE1bK^>>(el*FZhcfTHN=WG4N)6jo:hek*`IeW=j.pIhjX /_ =O[Zp' );
define( 'LOGGED_IN_KEY',    'Nk;$&&+TU3Tf/Kjk1!fn<1Lw34sSf%r][!DGVdrQi-1,:Ju^Aah(.WQCVm@Ok|JO' );
define( 'NONCE_KEY',        'Em?-b9V>`b4NOksz#rzj{:-Bv1GOpG9&^ODLC.C;_cLLP+LUMT+XjtF>Hc,g>3bB' );
define( 'AUTH_SALT',        'Xs%cWXB?D9uvoyN0+qv?g6zBT?juf@V8,6R+<Hxz4`*Nf^snGL`N(1RB@:q[FTXA' );
define( 'SECURE_AUTH_SALT', '}:`Gz/&6g@P&f.+fr(Tx{I,R6GV+T1)r=%[*&sxR!)l_D;fdRbNgEN*@^,r{g*Y>' );
define( 'LOGGED_IN_SALT',   's44$AMV,v#yLzmUujSjtX^5i&Z i$|>]3DhTWn)d;*1E9fn?f0[b_r0/fXr^ko.{' );
define( 'NONCE_SALT',       ' :1N_BNgPgEMe=XC;M.D{h${AL0yk;oR<WcPB-5vD=sdzU825C>Mu|$IF3H-`IN1' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', !!getenv_docker('WP_DEBUG', 'wordpress') );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
