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

/**
 * Add Cookie endpoint.
 */
add_filter( 'query_vars', function( $vars ) {
	$vars[] = 'ct-endpoint';
	return $vars;
} );

/**
 * Add rewrite endpoint.
 */
add_filter( 'rewrite_rules_array', function( $rules ) {
	return array_merge( [
		'^wp-json/cookie/v1/nonce/?' => 'index.php?ct-endpoint=nonce',
	], $rules );
}, 9999 );

/**
 * Hijack request.
 */
add_action( 'pre_get_posts', function( WP_Query &$wp_query ) {
	if ( $wp_query->is_main_query() ) {
		switch ( $wp_query->get( 'ct-endpoint' ) ) {
			case 'nonce':
				cookie_tasting_record( get_current_user_id() );
				nocache_headers();
				wp_send_json_success( [
					'message' => __( 'Nonce updated.', 'cookie' ),
				] );
				exit;
		}
	}
} );