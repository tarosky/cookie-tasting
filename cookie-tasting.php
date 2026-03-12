<?php
/*
 * Plugin Name: Cookie Tasting
 * Plugin URI: https://wordpress.org/plugins/cookie-tasting/
 * Description: Detect user login only with cookie. The best helper for cached WordPress sites.
 * Author: Tarosky INC.
 * Version: nightly
 * Author URI: https://tarosky.co.jp
 * License: GPL3 or later
 * Text Domain: cookie
 * Domain Path: /languages/
 *
 * @package cookie
 */


defined( 'ABSPATH' ) || die();

/**
 * Get plugin version.
 *
 * @return string
 */
function cookie_tasting_version() {
	static $info = null;
	if ( is_null( $info ) ) {
		$info = get_file_data( __FILE__, [
			'version' => 'Version',
		] );
	}
	return $info['version'];
}

/**
 * Initialize Cookie setting.
 */
function cookie_tasting_init() {
	// Load autoloader
	require __DIR__ . '/vendor/autoload.php';
	// Includes all hooks.
	$include_dir = __DIR__ . '/includes';
	foreach ( scandir( $include_dir ) as $file ) {
		if ( preg_match( '#^[^._].*\.php$#u', $file ) ) {
			require $include_dir . '/' . $file;
		}
	}
}
add_action( 'plugins_loaded', 'cookie_tasting_init' );

/**
 * Register all assets from wp-dependencies.json.
 *
 * @return void
 */
function cookie_tasting_register_assets() {
	$json = __DIR__ . '/wp-dependencies.json';
	if ( ! file_exists( $json ) ) {
		return;
	}
	$dependencies = json_decode( file_get_contents( $json ), true );
	if ( empty( $dependencies ) ) {
		return;
	}
	$base = trailingslashit( plugin_dir_url( __FILE__ ) );
	foreach ( $dependencies as $dep ) {
		if ( empty( $dep['path'] ) ) {
			continue;
		}
		$url = $base . $dep['path'];
		switch ( $dep['ext'] ) {
			case 'css':
				wp_register_style( $dep['handle'], $url, $dep['deps'], $dep['hash'], $dep['media'] );
				break;
			case 'js':
				$footer = [ 'in_footer' => $dep['footer'] ];
				if ( in_array( $dep['strategy'], [ 'defer', 'async' ], true ) ) {
					$footer['strategy'] = $dep['strategy'];
				}
				wp_register_script( $dep['handle'], $url, $dep['deps'], $dep['hash'], $footer );
				if ( in_array( 'wp-i18n', $dep['deps'], true ) ) {
					wp_set_script_translations( $dep['handle'], 'cookie' );
				}
				break;
		}
	}
}
add_action( 'init', 'cookie_tasting_register_assets' );


/**
 * Flush rewrite rules on activation.
 */
function cookie_tasting_flush_rewrite_rules() {
	remove_filter( 'rewrite_rules_array', 'cookie_tasting_add_rewrite_rules', 9999 );
	flush_rewrite_rules();
	delete_option( 'cookie_tasting_rewrite_version' );
}
register_deactivation_hook( __FILE__, 'cookie_tasting_flush_rewrite_rules' );
