/**
 * Watch cookie taste.
 *
 * @package cookie
 */
/* global CookieTasting: true */


(function ($) {

  'use strict';

  CookieTasting.confirmed = false;

  /**
   * Update REST API nonce.
   */
  CookieTasting.updateNonce = () => {
    // Refresh API nonce before checking.
    const nonce = CookieTasting.get( 'api' );
    if ( nonce ) {
      // Nonce updated.
      wp.apiFetch.use( wp.apiFetch.createNonceMiddleware( nonce ) );
      // If old nonce exists, update it.
      if( window.wpApiSettings && window.wpApiSettings.nonce ) {
        window.wpApiSettings.nonce = nonce;
      }
    }
  };

  /**
   * Refresh nonce via API.
   *
   * @returns {Promise}
   */
  CookieTasting.refreshNonce = () => {
    return wp.apiFetch( {
      url: CookieTasting.nonce_ep,
    } ).then( response => {
      CookieTasting.updateNonce();
      if ( ! CookieTasting.confirmed ) {
        CookieTasting.confirmed = true;
        $( 'html' ).trigger( 'cookie.tasting.updated', [ response ] );
      }
      return response;
    });
  };

  /**
   * Check current status.
   */
  CookieTasting.confirm = ( shouldRefresh = false ) => {
    // Check if we should confirm cookies.
    const debugging = CookieTasting.debug && window.console;
    let now = new Date();
    // Do nothing if no need to check.
    if ( ! CookieTasting.shouldConfirm() ) {
      if ( debugging ) {
        console.log( 'No need to confirm: ' + now.toLocaleString(), CookieTasting.lastUpdated(), Math.floor(now.getTime() / 1000 ) );
      }
      if ( shouldRefresh ) {
        CookieTasting.refreshNonce().catch( err => {
          if ( debugging ) {
            console.log( err );
          }
        } );
      }
      return;
    }
    if ( debugging ) {
      console.log( 'Confirming: ' + now.toLocaleString(), CookieTasting.lastUpdated(), Math.floor( now.getTime() / 1000 ) );
    }
    // Fetch cookie test.
    CookieTasting.refreshNonce().then( ( response ) => {
      $( 'html' ).trigger( 'cookie.tasting.updated', [ response ] );
    } ).catch( ( response ) => {
      $( 'html' ).trigger( 'cookie.tasting.failed', [ response ] );
    } ).finally( () => {
      // Refresh class name.
      CookieTasting.setClassName();
      if ( debugging ) {
        let finished = new Date();
        console.log( 'Finished: ' + finished.toLocaleString(), CookieTasting.lastUpdated(), Math.floor( finished.getTime() / 1000 ) );
      }
    } );
  };

  /**
   * Test cookie before do something.
   *
   * @return {Promise}
   */
  CookieTasting.testBefore = () => {
    return CookieTasting.refreshNonce().then( response => {
        if (response.login) {
          return response;
        } else {
          throw new Error(response.message);
        }
    });
  };

  // Check periodically user is logged in.
  setInterval( function() {
    CookieTasting.confirm();
  }, CookieTasting.getInterval() * 1000 / 2 );

  // Check if timestamp is outdated.
  $( document ).ready( function() {
    CookieTasting.confirm( CookieTasting.get( 'refresh_nonce' ) );
  } );

})( jQuery );
