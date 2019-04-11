<?php
/**
 * Set and remove login cookie.
 *
 * @package cookie
 * @since 1.0.0
 */

defined( 'ABSPATH' ) || die();

/**
 * Save cookie when user logged in.
 */
add_action( 'set_auth_cookie', function( $auth_cookie, $expire, $expiration, $user_id ) {
	add_filter( 'cookie_tasting_values', function( $values ) {
		$values['refresh_nonce'] = '1';
		return $values;
	} );
	cookie_tasting_record( $user_id );
}, 10, 4 );

/**
 * Clear cookie when user logged out.
 */
add_action( 'clear_auth_cookie', function() {
	// Clear global cookies.
	cookie_tasting_flush();
} );
