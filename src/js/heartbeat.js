/**
 * Watch cookie taste.
 *
 * @package cookie
 */
/* global CookieTasting: true */


(function ($) {

  'use strict';

  /**
   * Update REST API nonce.
   */
  CookieTasting.updateNonce = () => {
    // Refresh API nonce before checking.
    const nonce = CookieTasting.get( 'api' );
    if ( nonce ) {
      // Nonce updated.
      wp.apiFetch.use( wp.apiFetch.createNonceMiddleware( nonce ) );
    }
  };

  /**
   * Check current status.
   */
  CookieTasting.confirm = () => {
    CookieTasting.updateNonce();
    // Check if we should confirm cookies.
    const debugging = CookieTasting.debug && window.console;
    let now = new Date();
    // Do nothing if no need to check.
    if ( ! CookieTasting.shouldConfirm() ) {
      if ( debugging ) {
        console.log( 'No need to confirm: ' + now.toLocaleString(), CookieTasting.lastUpdated(), Math.floor(now.getTime() / 1000 ) );
      }
      return;
    }
    if ( debugging ) {
      console.log( 'Confirming: ' + now.toLocaleString(), CookieTasting.lastUpdated(), Math.floor( now.getTime() / 1000 ) );
    }
    // Fetch cookie test.
    wp.apiFetch( {
      path: 'cookie/v1/heartbeat',
      method: 'POST',
    } ).then( ( response ) => {
      $( 'html' ).trigger( 'cookie.tasting.updated', [ response ] );
    } ).catch( ( response ) => {
      $( 'html' ).trigger( 'cookie.tasting.failed', [ response ] );
    } ).finally( () => {
      // Refresh class name.
      CookieTasting.setClassName();
      // Update nonce
      CookieTasting.updateNonce();
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
    return wp.apiFetch( {
      path: 'cookie/v1/heartbeat',
      method: 'POST',
    } ).then( ( response ) => {
      if ( response.login ) {
        return response;
      } else {
        throw new Error( response.message );
      }
    } );
  };

  // Check periodically user is logged in.
  setInterval( function() {
    CookieTasting.confirm();
  }, CookieTasting.getInterval() * 1000 / 2 );

  // Check if timestamp is outdated.
  $( document ).ready( function() {
    if ( CookieTasting.get( 'refresh_nonce' ) ) {
      $.get( CookieTasting.nonce_ep ).done( ( response ) => {

      } ).fail( (err) => {

      } ).always( () => {
        CookieTasting.confirm();
      } );
    } else {
      CookieTasting.confirm();
    }
  } );

})( jQuery );
