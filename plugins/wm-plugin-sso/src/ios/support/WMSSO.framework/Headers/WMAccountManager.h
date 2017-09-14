//
//  WMAccountManager.h
//  WMSSOProject
//
//  Created by Anthony Helms on 12/7/15.
//  Copyright © 2015 Anthony Helms. All rights reserved.
//

#import <Foundation/Foundation.h>
@import UIKit;
#import "LoginViewDelegate.h"
#import "WMAccountStore.h"
#import "WMAccountAuthentication.h"
#import "WMAccountStoreFactory.h"
#import "WMAccountAuthenticationFactory.h"

#define SSO_NOTIF_UserSignedIn @"SSO.UserSignedIn"
#define SSO_NOTIF_UserSignedOut @"SSO.UserSignedOut"
#define SSO_NOTIF_UserChanged @"SSO.UserChanged"

@interface WMAccountManager : NSObject <LoginViewDelegate>

@property WMAccountStore* store;
@property id<WMAccountAuthentication> authentication;

- (void) getUserForUseWithViewController:(UIViewController*) viewController ThenDoThis:(void (^)(WMUser*)) callback;
- (void) signOutUserThenDoThis:(void (^)()) callback;
- (void) validateUserTokenThenDoThis:(void (^)(BOOL)) callback;

@end
