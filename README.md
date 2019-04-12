# Cookie Tasting

Contributors: tarosky,Takahashi_Fumiki  
Tags: cookie, membership, cache  
Requires at least: 5.0  
Tested up to: 5.1  
Stable tag: 1.0.7  
License: GPL 3.0 or later  
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Detect user login only with cookie. The best helper for cached WordPress sites.

<!-- only:github/ -->
[![Build Status](https://travis-ci.org/tarosky/cookie-tasting.svg?branch=master)](https://travis-ci.org/tarosky/cookie-tasting)
<!-- /only:github -->

## Description

This plugin sets user cookie when user is logged in.
You can use cookie as data store,
so you can use it as UI resource.

### Visibility

This plugin adds class to `html` element.

- `ct-logged-in` The current user is logged in.
- `ct-not-logged-in` The current user is anonymous.

You can control elements visibility with CSS.

```css
.some-element{
  display: none;
}
.ct-logged-in .some-element{
  display: block;
}
```

### From JavaScript

You can use Global Object `CookieTasting` for utility.

- `CookieTasting.userName()` Returns user name. If not logged in, returns 'Guest'.
- `CookieTasting.lastUpdated()` Returns timestamp of last log in check. If this equals 0, it means that user is anonymous.

Besides that, this plugin checks periodically log-in status.
You can handle it with jQuery.

```js
jQuery( document ).on( 'cookie.tasting', function( event, response ) {
  if ( response.login ) {
    // User is logged in.
    // If you use React...
    setAttributes({ name: CookieTasting.userName() })
  } else {
    // User is not logged in.
  }
} );
```

If you use react or something, updated the status with `setState()`.

### Check Before Action

If you manage cached WordPress and customizing your own theme,
It's a good idea to implement dynamic UI components with JavaScript.

You can check user's credential just before important actions.

```js
// Click action for button.
$('.read-more').click( function( e ) {
  e.preventDefault();
  // Check cookie before do something.
  CookieTasting.testBefore().then( function( response ) {
    // Now user has fresh information.
    // Load premium contents.
    loadPremiumContents();
  }).catch( function( response ) {
    // This user is not logged in.
    // Redirect them to login page.
    window.locaion.href = '/wp-login.php';
  } );
} );
```

Plese remember adding dependency for `cookie-tasting-heartbeat` to your script.

### Handle UUID

By default, this plugin set UUID for each user. This will be...

* Unique for each logged in user and will be saved as user_meta.
* Also kept for anonymous user.

So you can use it for Google Analytic's [User ID View](https://support.google.com/analytics/answer/3123662).

```js
const uuid = CookieTasting.get( 'uuid' );
// For Google Analytics.
ga( 'set', "userId", uid );
```

## Installation

* Download zip file and unpack it.
* Upload the directory to `wp-content/plugins`.
* Go to WordPress admin screen and activate this plugin.

**Recommendation:** Search on WordPress admin screen and install it.

## Frequently Asked Questions

### How to Contribute

This plugin is hosted on [Github](https://github.com/tarosky/cookie-tasting).
Please feel free to make issue or send pull requests.

## Changelog

### 1.0.7

* Fix UUID logic.
* Add automatic refresh for rewrite rules.

### 1.0.6

* Fix SSL bug.

### 1.0.5

* Fix fatal error. `vendor` directory was missing.

### 1.0.4

* Update nonce for [@wordpress/wp-api-featch](https://wordpress.org/gutenberg/handbook/designers-developers/developers/packages/packages-api-fetch/) and `wpApiSettings` of [wp-api](https://developer.wordpress.org/rest-api/using-the-rest-api/backbone-javascript-client/).
* Change REST API endpoit because it requires COOKIES properly set. The endpoint `wp-json/cookie/v1/nonce` is pseudo and it's not REST API actually, so you can refresh nonce with this endpoint. Normally, this refresh will be executed automatically, but if you get "rest_cookie_invalid_nonce", try updating permalink from "Setting > Permalink". Just click "Save" and that's it.
* UUID will be set for current user. It's userful for tracking.

### 1.0.3

* Add filter to cookie detection API.

### 1.0.2

* Bugfix: if home url is not SSL, cookie `$secure` flag is now false.
  But we sincerely recommend protecting your site under SSL.

### 1.0.0

* Initial release.