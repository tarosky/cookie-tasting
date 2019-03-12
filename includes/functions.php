<?php
/**
 * Functions for cookie tatsting
 *
 * @package cookie
 * @since 1.0.0
 */

/**
 * Update cookie
 *
 * @param int $user_id
 */
function cookie_tasting_record( $user_id ) {
	$data    = cookie_tasting_values( $user_id );
	// 2 years.
	$expires = apply_filters( 'cookie_tasting_period', 60 * 60 * 24 * 365 * 2 );
	$expires += current_time( 'timestamp', true );
	foreach ( $data as $key => $value ) {
		$cookie_name = "ctwp_{$key}";
		setcookie( $cookie_name,  $value, $expires, COOKIEPATH, COOKIE_DOMAIN, true, false );
	}
}

/**
 * The interval period to check cookie is real.
 *
 * @return int
 */
function cookie_tasting_interval() {
	return (int) apply_filters( 'cookie_tasting_limit', 60 * 5 );
}

/**
 * Get user name.
 *
 * @return string
 */
function cookie_tasting_guest_name() {
	return (string) apply_filters( 'cookie_tasting_guest_name', __( 'Guest', 'cookie' ) );
}

/**
 * Get data to save.
 *
 * @param int $user_id
 * @return array
 */
function cookie_tasting_values( $user_id = 0 ) {
	$user   = get_userdata( $user_id );
	$values = [
		'name'         => $user ? $user->display_name : cookie_tasting_guest_name(),
		'last_updated' => $user ? current_time( 'timestamp' ) : 0,
	];
	$values = apply_filters( 'cookie_tasting_values', $values, $user_id );
	return $values;
}

/**
 * Clear all cookie.
 */
function cookie_tasting_flush() {
	foreach ( array_keys( cookie_tasting_values() ) as $key ) {
		$cookie_name = "ctwp_{$key}";
		// Clear cookie.
		setcookie( $cookie_name, ' ', time() - YEAR_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN, true, false );
	}
}
