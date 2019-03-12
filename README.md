# Cookie Tasting

Contributors: Takahshi_Fumiki, tarosky  
Tags: cookie, membership, cache  
Requires at least: 5.0  
Tested up to: 5.1    
Stable tag: 1.0.0  
License: GPLv3 or later

Detect user login only with cookie. The best helper for cached WordPress sites.

## Description

This plugin set user cookie.

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

- `CookieTasting.userName()` Returns user name. If not logged in, returns 'Geust'.
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

If you use react or something, updated the status.