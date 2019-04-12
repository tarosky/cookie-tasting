<?php
/**
 * Functions for cookie tatsting
 *
 * @package cookie
 * @since 1.0.0
 */

/**
 * Should secure cookie?
 *
 * @return bool
 */
function cookie_tasting_should_be_secure() {
	return false !== strpos( get_option( 'siteurl' ), 'https://' );
}

/**
 * Update cookie
 *
 * @param int $user_id
 */
function cookie_tasting_record( $user_id ) {
	$data    = cookie_tasting_values( $user_id );
	foreach ( $data as $key => $value ) {
		cookie_tasting_write_cookie( $key, $value );
	}
}

/**
 * Get cookie.
 *
 * @param string $key
 * @return string
 */
function cookie_tasting_get( $key ) {
	$cookie_name = 'ctwp_' . $key;
	return isset( $_COOKIE[ $key ]  ) ? $_COOKIE[ $key ] : '';
}

/**
 * Save cookie
 *
 * @param string $key
 * @param string $value
 * @return bool
 */
function cookie_tasting_write_cookie( $key, $value ) {
	// 2 years.
	$expires = apply_filters( 'cookie_tasting_period', 60 * 60 * 24 * 365 * 2 );
	$expires += current_time( 'timestamp', true );
	$cookie_name = "ctwp_{$key}";
	// Check if home is SSL.
	$is_secure = cookie_tasting_should_be_secure();
	return setcookie( $cookie_name,  $value, $expires, COOKIEPATH, COOKIE_DOMAIN, $is_secure, false );
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
		'name'          => $user_id ? $user->display_name : cookie_tasting_guest_name(),
		'last_updated'  => $user_id ? current_time( 'timestamp', true ) : 0,
		'refresh_nonce' => '',
		'avatar'        => $user_id ? get_avatar_url( $user_id, apply_filters( 'cookie_tasting_avatar_args', [
			'size' => 60,
		], $user_id ) ) : '',
		'logout'        => $user_id ? wp_create_nonce( 'log-out' ) : '',
		'api'           => wp_create_nonce( 'wp_rest' ),
	];
	$current_uuid = cookie_tasting_get( 'uuid' );
	if ( $user_id ) {
		$saved_uuid = cookie_tasting_get_uuid( $user_id, true);
		if ( $saved_uuid ) {
			// Saved UUID exists, so use it.
			$uuid = $saved_uuid;
		} elseif ( ! $saved_uuid && $current_uuid ) {
			// Save current UUID.
			update_user_meta( $user_id, cookie_tasting_uuid_key(), preg_replace( '/[^a-z0-9\-]/u', '', (string) $current_uuid ) );
			$uuid = $current_uuid;
		} else {
			$uuid = cookie_tasting_get_uuid( $user_id );
		}
	} else {
		$uuid = $current_uuid ?: cookie_tasting_generate_uuid();
	}
	$values[ 'uuid' ] = $uuid;
	$values = apply_filters( 'cookie_tasting_values', $values, $user_id );
	return $values;
}

/**
 * Clear all cookie.
 */
function cookie_tasting_flush() {
	$secure = cookie_tasting_should_be_secure();
	foreach ( array_keys( cookie_tasting_values() ) as $key ) {
		if ( in_array( $key, cookie_tasting_protected_keys() ) ) {
			continue;
		}
		$cookie_name = "ctwp_{$key}";
		// Clear cookie.
		setcookie( $cookie_name, ' ', time() - YEAR_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN, $secure, false );
	}
}

/**
 * UUID key.
 *
 * @return string
 */
function cookie_tasting_uuid_key() {
	return (string) apply_filters( 'cookie_tasting_uuid_key', 'cookie_tasting_uuid' );
}

/**
 * Cookie key to protect from flushing.
 *
 * @return string[]
 */
function cookie_tasting_protected_keys() {
	return (array) apply_filters( 'cookie_tasting_protected_keys', [ 'uuid' ] );
}

/**
 * Generate unique ID.
 *
 * @return string
 */
function cookie_tasting_generate_uuid() {
	try {
		return \Ramsey\Uuid\Uuid::uuid4()->toString();
	} catch ( \Exception $e ) {
		return uniqid( 'ct-', true );
	}
}

/**
 * Detect if user has saved UUID.
 *
 * @param null|int $user_id
 * @return bool
 */
function cookie_tasting_uuid_exists( $user_id = null ) {
	if ( is_null( $user_id ) ) {
		$user_id = get_current_user_id();
	}
	return $user_id && get_user_meta( $user_id, cookie_tasting_uuid_key(), true );
}

/**
 * Get current_user's UUID.
 *
 * @param null|int $user_id
 * @param bool     $raw
 * @return string
 */
function cookie_tasting_get_uuid( $user_id = null, $raw = false ) {
	if ( is_null( $user_id ) ) {
		$user_id = get_current_user_id();
	}
	if ( ! $user_id ) {
		// User is not logged in.
		return $raw ? '' : cookie_tasting_generate_uuid();
	}
	if ( !$raw && !cookie_tasting_uuid_exists( $user_id ) ) {
		update_user_meta( $user_id, cookie_tasting_uuid_key(), cookie_tasting_generate_uuid() );
	}
	return get_user_meta( $user_id, cookie_tasting_uuid_key(), true );
}
