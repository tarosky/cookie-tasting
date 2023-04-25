<?php
/**
 * Function test
 *
 * @package cookie-tasting
 */

/**
 * Sample test case.
 */
class Cookie_Tasting_Basic_Test extends WP_UnitTestCase {

	/**
	 * Test functions
	 */
	public function test_functions() {
		$this->assertIsBool( cookie_tasting_should_be_secure(), 'Should be SSL:' );
		$this->assertIsInt( cookie_tasting_interval(), 'Interval: ' );
		$this->assertNotEmpty( cookie_tasting_guest_name(), 'Guest Name: ' );
	}

	/**
	 * Test expiration.
	 */
	public function test_uuid() {
		$key = cookie_tasting_uuid_key();
		$this->assertEquals( 'cookie_tasting_uuid', $key, 'UUID key:' );
		$this->assertIsBool( cookie_tasting_uuid_exists(), 'UUID exists?' );
		$uuid = cookie_tasting_generate_uuid();
		$this->assertMatchesRegularExpression( '/^[a-z0-9\-]{36}$/u', $uuid, 'UUID format 36 letters:' );
	}
}
