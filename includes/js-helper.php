<?php
/**
 * Help JavaScript to access to Cookie
 *
 * @package cookie
 */

/**
 * Register scripts.
 */
add_action( 'init', function() {
	$asset_dir = plugin_dir_url( __DIR__ ) . 'assets';
	wp_register_script( 'cookie-tasting', $asset_dir . '/js/cookie.js', [], cookie_tasting_version(), false );
	wp_localize_script( 'cookie-tasting', 'CookieTasting', [
		'interval' => cookie_tasting_interval(),
		'name'     => apply_filters( 'cookie_tasting_name_key', 'name' ),
		'updated'  => apply_filters( 'cookie_tasting_updated_key', 'last_updated' ),
		'guest'    => cookie_tasting_guest_name(),
		'nonce_ep' => rest_url( 'cookie/v1/nonce' ),
		'debug'    => defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? 'true' : '',
	] );
	wp_register_script( 'cookie-tasting-heartbeat', $asset_dir . '/js/heartbeat.js', [ 'jquery', 'cookie-tasting', 'wp-api-fetch' ], cookie_tasting_version(), true );
} );

/**
 * Enqueue scripts.
 */
add_action( 'wp_enqueue_scripts', function() {
	wp_enqueue_script( 'cookie-tasting-heartbeat' );
}, 1 );


/**
 * Add Cookie endpoint.
 */
add_filter( 'query_vars', function( $vars ) {
	$vars[] = 'ct-endpoint';
	return $vars;
} );

/**
 * Add rewrite endpoint.
 *
 * @param array $rules
 * @return array
 */
function cookie_tasting_add_rewrite_rules( $rules ) {
	return array_merge( [
		'^wp-json/cookie/v1/nonce/?' => 'index.php?ct-endpoint=nonce',
	], $rules );
}
add_filter( 'rewrite_rules_array', 'cookie_tasting_add_rewrite_rules', 9999 );

/**
 * Update rewrite rules if option is old.
 */
add_action( 'init', function() {
	if ( version_compare( cookie_tasting_version(), get_option( 'cookie_tasting_rewrite_version', '0.0.0' ), '>' ) ) {
		flush_rewrite_rules();
		update_option( 'cookie_tasting_rewrite_version', cookie_tasting_version() );
	}
}, 1 );

/**
 * Hijack request.
 */
add_action( 'pre_get_posts', function( WP_Query &$wp_query ) {
	if ( $wp_query->is_main_query() ) {
		switch ( $wp_query->get( 'ct-endpoint' ) ) {
			case 'nonce':
				nocache_headers();
				/**
				 * cookie_tasting_is_user_logged_in
				 *
				 * @param bool $logged_in
				 * @return bool|WP_Error
				 */
				$logged_in = apply_filters( 'cookie_tasting_is_user_logged_in', is_user_logged_in() );
				if ( true === $logged_in ) {
					cookie_tasting_record( get_current_user_id() );
					wp_send_json( [
						'login'   => true,
						'success' => true,
						'message' => __( 'You are now logged in.', 'cookie' ),
						'code'    => 'logged_in',
					] );
				} else {
					$message = __( 'You are not logged in.', 'cookie' );
					$code    = 'not_logged_in';
					if ( is_wp_error( $logged_in ) ) {
						/** @var WP_Error $logged_in */
						$message = $logged_in->get_error_message();
						$code    = $logged_in->get_error_code();
					}
					cookie_tasting_flush();
					wp_send_json( [
						'login'   => false,
						'success' => true,
						'message' => $message,
						'code'    => $code,
					] );
				}
				exit;
		}
	}
} );
