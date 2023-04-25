/**
 * Cookie tasting base utility.
 *
 * @package
 */

/*global CookieTasting: true*/

CookieTasting = Object.assign( CookieTasting, {
	/**
	 * Get cookie value
	 *
	 * @param {string} name Cookie name to get.
	 * @return {string | null} Cookie value.
	 */
	get( name ) {
		let result = null;
		const cookieName = name + '=';
		const allCookies = document.cookie;
		const position = allCookies.indexOf( cookieName );
		if ( -1 !== position ) {
			const startIndex = position + cookieName.length;
			let endIndex = allCookies.indexOf( ';', startIndex );
			if ( -1 === endIndex ) {
				endIndex = allCookies.length;
			}
			result = decodeURIComponent(
				allCookies.substring( startIndex, endIndex )
			);
		}
		return result;
	},

	isSSL() {
		return 'https:' === document.location.protocol;
	},

	/**
	 * Set cookie data.
	 *
	 * @param {string} key
	 * @param {string} value
	 */
	set( key, value ) {
		const option = [
			encodeURIComponent( value ),
			'path=/',
			'max-age=' + 60 * 60 * 24 * 365 * 2,
		];
		if ( CookieTasting.isSSL() ) {
			option.push( 'secure' );
		}
		document.cookie = 'ctwp_' + key + '=' + option.join( '; ' );
	},

	/**
	 * Get last updated timestamp.
	 *
	 * @return {number} Last updated timestamp.
	 */
	lastUpdated() {
		const updated = this.get( this.updated );
		return updated ? parseInt( updated, 10 ) : 0;
	},

	/**
	 * Get a username to display.
	 *
	 * @return {string} Last updated timestamp.
	 */
	userName() {
		return this.get( this.name ) || this.guest;
	},

	/**
	 * Interval to check.
	 *
	 * @return {number} Interval to check.
	 */
	getInterval() {
		return parseInt( this.interval );
	},

	isExpired() {
		const now = new Date();
		return this.getInterval() + this.lastUpdated() < now.getTime() / 1000;
	},

	/**
	 * Check if user is logged in.
	 *
	 * @return {boolean} True if user is logged in.
	 */
	isLoggedIn() {
		return 0 < this.lastUpdated();
	},

	/**
	 * Get class name.
	 *
	 * @return {string} Class name to html document.
	 */
	getClassName() {
		return 0 < this.lastUpdated() && ! this.isExpired()
			? 'ct-logged-in'
			: 'ct-not-logged-in';
	},

	/**
	 * Check if user cookie should test.
	 *
	 * @return {boolean} True if user cookie should test.
	 */
	shouldConfirm() {
		return 0 < this.lastUpdated() && this.isExpired();
	},

	/**
	 * Set class name to html document.
	 */
	setClassName() {
		const className = CookieTasting.getClassName();
		const html = document.getElementsByTagName( 'html' )[ 0 ];
		html.classList.remove( 'ct-logged-in', 'ct-not-logged-in' );
		html.classList.add( className );
	},

	/**
	 * Generate UUID
	 *
	 * @return {string} UUID of the user.
	 */
	generateUuid() {
		const chars = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split( '' );
		for ( let i = 0, len = chars.length; i < len; i++ ) {
			switch ( chars[ i ] ) {
				case 'x':
					chars[ i ] = Math.floor( Math.random() * 16 ).toString(
						16
					);
					break;
				case 'y':
					chars[ i ] = (
						Math.floor( Math.random() * 4 ) + 8
					).toString( 16 );
					break;
			}
		}
		return chars.join( '' );
	},

	/**
	 * Update REST API nonce.
	 */
	updateNonce() {
		// Refresh API nonce before checking.
		const nonce = CookieTasting.get( 'api' );
		if ( nonce ) {
			// Nonce updated.
			if ( window.wp && wp.apiFetch ) {
				wp.apiFetch.use( wp.apiFetch.createNonceMiddleware( nonce ) );
			}

			// If old nonce exists, update it.
			if ( window.wpApiSettings && window.wpApiSettings.nonce ) {
				window.wpApiSettings.nonce = nonce;
			}
		}
	},

	/**
	 * Display console log if debug mode is on.
	 *
	 * @return {void}
	 */
	log() {
		if ( !! CookieTasting.debug && window.console ) {
			// eslint-disable-next-line no-console
			console.log.apply( window.console, arguments );
		}
	},
} );

// Set UUID.
if ( ! CookieTasting.get( 'uuid' ) ) {
	CookieTasting.set( 'uuid', CookieTasting.generateUuid() );
}

// Update nonce if possible.
CookieTasting.updateNonce();

// Set html document class.
CookieTasting.setClassName();
