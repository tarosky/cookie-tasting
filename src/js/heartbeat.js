/**
 * Watch cookie taste.
 *
 * @package cookie
 */
/* global CookieTasting: true */

const $ = jQuery;

CookieTasting.confirmed = false;

/**
 * Refresh nonce via API.
 *
 * @returns {Promise}
 */
CookieTasting.refreshNonce = () => {
  return wp.apiFetch({
    url: CookieTasting.nonce_ep
  }).then( response => {
    CookieTasting.updateNonce();
    if ( ! CookieTasting.confirmed ) {
      CookieTasting.confirmed = true;
      $( 'html' ).trigger( 'cookie.tasting.updated', [ response ]);
    }
    return response;
  });
};

/**
 * Check current status.
 *
 * @param {Boolean} shouldRefresh If true, nonce will be automatically refresh.
 */
CookieTasting.confirm = ( shouldRefresh = false ) => {

  // Check if we should confirm cookies.
  let now = new Date();

  // Do nothing if no need to check.
  if ( ! CookieTasting.shouldConfirm() ) {
    CookieTasting.log( 'No need to confirm: ' + now.toLocaleString(), CookieTasting.lastUpdated(), Math.floor( now.getTime() / 1000 ) );
    if ( shouldRefresh ) {
      CookieTasting.refreshNonce().catch( err => {
        CookieTasting.log( err );
      });
    }
    return;
  }
  CookieTasting.log( 'Confirming: ' + now.toLocaleString(), CookieTasting.lastUpdated(), Math.floor( now.getTime() / 1000 ) );

  // Fetch cookie test.
  CookieTasting.refreshNonce().then( ( response ) => {
    $( 'html' ).trigger( 'cookie.tasting.updated', [ response ]);
  }).catch( ( response ) => {
    $( 'html' ).trigger( 'cookie.tasting.failed', [ response ]);
  }).finally( () => {

    // Refresh class name.
    CookieTasting.setClassName();
    const finished = new Date();
    CookieTasting.log( 'Finished: ' + finished.toLocaleString(), CookieTasting.lastUpdated(), Math.floor( finished.getTime() / 1000 ) );
  });
};

/**
 * Test cookie before do something.
 *
 * @return {Promise}
 */
CookieTasting.testBefore = () => {
  return CookieTasting.refreshNonce().then( response => {
    if ( response.login ) {
      return response;
    } else {
      throw new Error( response.message );
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
});
