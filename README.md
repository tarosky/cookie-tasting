# Cookie Tasting

Contributors: tarosky,Takahashi_Fumiki  
Tags: cookie, membership, cache  
Requires at least: 5.0  
Tested up to: 5.1  
Stable tag: 1.0.2  
License: GPL 3.0 or later  
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Detect user login only with cookie. The best helper for cached WordPress sites.

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

### 1.0.2

* Bugfix: if home url is not SSL, cookie `$secure` flag is now false.
  But we sincerely recommend protecte your site under SSL.

### 1.0.0

* Initial release.