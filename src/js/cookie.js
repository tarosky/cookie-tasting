/**
 * Cookie tasting base utility.
 *
 * @package cookie
 */

/*global CookieTasting: true*/

CookieTasting = Object.assign( CookieTasting, {

  /**
   * Get cookie value
   * @param name
   * @returns {String|null}
   */
  get( name ) {
    let result = null;
    let cookieName = name + '=';
    let allCookies = document.cookie;
    let position = allCookies.indexOf( cookieName );
    if( position !== -1 ) {
      let startIndex = position + cookieName.length;
      let endIndex = allCookies.indexOf( ';', startIndex );
      if( endIndex === -1 ) {
        endIndex = allCookies.length;
      }
      result = decodeURIComponent( allCookies.substring( startIndex, endIndex ) );
    }
    return result;
  },

  isSSL(){
    return 'https:' === document.location.protocol;
  },

  /**
   * Set cookie data.
   *
   * @param {String} key
   * @param {String} value
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
    document.cookie =  'ctwp_' + key + '=' + option.join( '; ' );
  },

  /**
   * Get user name to display.
   *
   * @returns {Number}
   */
  lastUpdated() {
    const updated = this.get( this.updated );
    return updated ? parseInt( updated, 10 ) : 0;
  },

  /**
   * Get last updated timestamp.
   * @returns {String}
   */
  userName() {
    return this.get( this.name ) || this.guest;
  },

  /**
   * Interval to check.
   *
   * @returns {number}
   */
  getInterval() {
    return parseInt( this.interval );
  },

  isExpired() {
    const now = new Date();
    return ( this.getInterval() + this.lastUpdated() ) < ( now.getTime() / 1000 );
  },

  /**
   * Check if user is logged in.
   *
   * @returns {boolean}
   */
  isLoggedIn() {
    return 0 < this.lastUpdated();
  },

  /**
   * Get class name.
   *
   * @returns {string}
   */
  getClassName() {
    return ( 0 < this.lastUpdated() && ! this.isExpired() ) ? 'ct-logged-in' : 'ct-not-logged-in';
  },

  /**
   * Check if user cookie should test.
   *
   * @return {boolean}
   */
  shouldConfirm() {
    return 0 < this.lastUpdated() && this.isExpired();
  },

  /**
   * Set class name to html document.
   */
  setClassName() {
    const className = CookieTasting.getClassName();
    const html = document.getElementsByTagName( 'html' )[0];
    html.classList.remove( 'ct-logged-in', 'ct-not-logged-in' );
    html.classList.add( className );
  },

  /**
   * Generate UUID
   *
   * @returns {string}
   */
  generateUuid() {
    const chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split('');
    for ( let i = 0, len = chars.length; i < len; i++ ) {
      switch ( chars[ i ] ) {
        case "x":
          chars[ i ] = Math.floor( Math.random() * 16 ).toString( 16 );
          break;
        case "y":
          chars[ i ] = ( Math.floor( Math.random() * 4 ) + 8 ).toString( 16 );
          break;
      }
    }
    return chars.join( '' );
  }
});

// Set UUID.
if ( ! CookieTasting.get( 'uuid' ) ) {
  CookieTasting.set( 'uuid', CookieTasting.generateUuid() );
}

// Set html document class.
CookieTasting.setClassName();
