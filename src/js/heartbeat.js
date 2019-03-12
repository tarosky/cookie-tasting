/**
 * Watch cookie taste.
 *
 * @package cookie
 */
/* global CookieTasting: true */


(function ($) {

  'use strict';

  CookieTasting.confirm = () => {
    const debugging = CookieTasting.debug && window.console;
    let now = new Date();
    // Do nothing if no need to check.
    if ( ! CookieTasting.shouldConfirm() ) {
      if ( debugging ) {
        console.log( 'No need to confirm: ' + now.toLocaleString() );
      }
      return;
    }
    if ( debugging ) {
      console.log( 'Confirming: ' + now.toLocaleString() );
    }

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
      if ( debugging ) {
        let finished = new Date();
        console.log( 'Finished: ' + finished.toLocaleString() );
      }
    } );
  };

  // Check periodically user is logged in.
  setInterval( function() {
    CookieTasting.confirm();
  }, CookieTasting.getInterval() * 1000 );

  // Check if timestamp is outdated.
  $( document ).ready( function() {
    CookieTasting.confirm();
  } );

})( jQuery );
