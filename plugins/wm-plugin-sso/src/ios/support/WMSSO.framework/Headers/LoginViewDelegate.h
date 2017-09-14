//
//  LoginViewDelegate.h
//  WMSSOProject
//
//  Created by Anthony Helms on 12/7/15.
//  Copyright © 2015 Anthony Helms. All rights reserved.
//

#ifndef LoginViewDelegate_h
#define LoginViewDelegate_h

#import "WMUser.h"

@protocol LoginViewDelegate <NSObject>
- (void) userLoginSuccess:(WMUser*) user;
- (BOOL) hasAUserLoggedIn;
- (WMUser*) getLastLoggedInUser;
@end

#endif /* LoginViewDelegate_h */
