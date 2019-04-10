/**
 * Cookie tasting.
 *
 * @package cookie
 */

/*global CookieTasting: true*/

CookieTasting = Object.assign( CookieTasting, {
  
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
    if ( this.get( 'force_update' ) ) {
      return true;
    }
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
  }
});

// Set html document class.
CookieTasting.setClassName();
