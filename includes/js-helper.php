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
		'debug'    => WP_DEBUG,
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
 * Add REST API for refresh cookie.
 */
add_action( 'rest_api_init', function() {
	register_rest_route( 'cookie/v1', 'heartbeat', [
		[
			'methods' => [ 'POST', 'GET' ],
			'args'    => [],
			'permission_callback' => function( WP_REST_Request $request ) {
				return true;
			},
			'callback' => function( WP_REST_Request $request ) {
				if ( ! is_user_logged_in() ) {
					cookie_tasting_flush();
					return new WP_REST_Response( [
						'login' => false,
						'success'   => true,
						'message'   => __( 'You are not logged in.', 'cookie' ),
					] );
				}
				cookie_tasting_record( get_current_user_id() );
				return new WP_REST_Response( [
					'login' => true,
					'success'   => true,
					'message'   => __( 'You are now logged in.', 'cookie' ),
				] );
			}
		],
	] );
} );
