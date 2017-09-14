# Single Sign On - Cordova

## Installation
Set up your npm to use the internal registry.

```sh
cordova plugin add wm-plugin-sso
```

See additional notes for iOS and Android near the end of this document.

## Overview
The purpose of this plugin is to allow multiple applications on the same device to know what user is currently signed in.  It also provides a common login screen to be used across all applications.  The basic flow is:

- App calls getUser() *probably on startup*
	- If there is a user signed in
		- The success function will get called immediately with the user info.
	- If there is not a user signed in
		- A login prompt will be shown
		- The user enters their credentials
		- Once the user is authenticated, the success function is called with the user info

- User clicks a link/button to sign out
	- The app calls signOutUser()
	- The user's authentication token is invalidated on the device

The plugin will also listen for "resume" events from Cordova and call getUser() automatically.  If the user info changes for some reason, it will fire a "userChanged" event with a list of fields that changed.  This is meant to handle the scenario where:
 
- User 1 opens App A and signs in through SSO
- User 1 later opens App B which gets the user's info from SSO
- User 1 signs out of App B and leaves for the day
- User 2 picks up device and signs in to App B
- User 2 later opens App A
	- App A receives userChanged event with User 2 info and reacts accordingly

## API
Once cordova is ready, there will be an object in global scope (window) called wmSSO.  *NOTE: the API functions now support Promises!*

#### wmSSO
The JavaScript interface object for single sign on.

##### .getUser(success, error)
Gets the currently signed-in user or prompts for a login

* success(user) - callback function once the user is retrieved.
* error(msg) - callback function if unable to get the user.

The user object will have these properties.

* userId - the userid of the user
* siteId - the store/club/dc number the user entered on login (if applicable)
* domain - the domain the user entered on login
* subDomain - the sub domain the user entered on login (only applies to "dc" domain)
* countryCode - the country the user entered on login
* token - the token returned by the server.  This can be used with service calls on the mobile-services domain.
* changedFields - an array of the field names that changed since the last login.  may contain one or more of the above listed field names
* additional - an object containing additional data about the user
    * displayName - the display name (typically first & last) for the user (v1.2+).
    * mailId - the email address of the user (v1.2+).

```JavaScript
document.addEventListener("deviceready", function() {
    // cordova should be ready now

    if (window.wmSSO) {
        wmSSO.getUser(function(newUser) {
             console.log("User signed in!", newUser);
        }, function(msg) {
             console.error("Error getting user", msg);
        });
    }
});
```

Example using promises

```JavaScript
document.addEventListener("deviceready", function() {
    // cordova should be ready now

    if (window.wmSSO) {
    	wmSSO.getUser().then(function(newUser) {
    		console.log("User signed in!", newUser);
    	}, function(msg) {
    		console.error("error getting user", msg);
    	});
    }
});
```

##### .signOutUser(success, error)
Signs out the currently signed-in user.  This will not automatically prompt for a login upon completion.

* success - callback function when the user has been signed out
* error(msg) - callback function when an error occurred

```JavaScript
document.getElementById("signOutButton")
    .addEventListener("click", function() {
        wmSSO.signOutUser(function() {

           console.log("User signed out");

           // let's go ahead and prompt for a new user
           wmSSO.getUser(successFunc, errorFunc);

        }, function(msg) {
            console.error("Error signing out user", msg);
        });
    });
```

#### Events
The plugin will also check for a logged in user on app resume (when the app returns to the foreground).  If a user is logged in and has used two apps, then logs out of one, when the user resumes the second app, it will also prompt for login.

On resume, if the plugin detects that the user info has changed, it will fire an event on the document called "userChanged" with the new user info.  The user info will also contain the "changedFields" array with the list of field names in the user object that changed.  See getUser().

```JavaScript
document.addEventListener("userChanged", userChanged, false);

function userChanged(event) {
    console.log("user changed", event.newUser);
    restartApp();
}
```

## Project Setup and Deployment

### iOS
After you add the platform for iOS using cordova, you will have to open the project in Xcode and change some project settings.  Your app will have to be part of the Wal-Mart provisioning profile and include the entitlement for the app group.  If this is not done, your app will still function, but it will use its own sign on and token and not participate with other apps.

* Target
  * General
    * Identity
      * Team: Wal-Mart Stores, Inc.
    * Deployment Info
      * 8.0 or greater
    * Embedded Binaries
      * Add WMSSO.framework
  * Capabilities
    * App Groups (ON)
      * Checkmark group.com.walmart
  * Build Settings
    * Apple LLVM 7.0 - Language - Modules
      * Enable Modules - set to Yes

You should see a file suffixed ".entitlements" after you add the group.

### Android
Prior to deploying to a device, the Walmart Single Sign On android app must be installed on the device.  When building your app for production, you must sign the apk with the same key that is used to sign the Walmart Single Sign On app.  If this is not done, the single sign on plugin will not work, and your app may crash with an exception.

