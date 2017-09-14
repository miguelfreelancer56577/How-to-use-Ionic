//
//  WMAccountAuthentication.h
//  WMSSOProject
//
//  Created by Anthony Helms on 12/7/15.
//  Copyright © 2015 Anthony Helms. All rights reserved.
//

#ifndef WMAccountAuthentication_h
#define WMAccountAuthentication_h

#import "WMUser.h"

@protocol WMAccountAuthentication <NSObject>

- (void) authenticateWithUser:(WMUser*)user 
                     AndPassword:(NSMutableString*) password 
                      ThenDoThis:(void (^)(WMUser*)) callback;

- (BOOL) isTokenValidForUser:(WMUser*)user;
- (NSString*) getTokenType;
- (void) validateTokenForUser:(WMUser*)user
                    ThenDoThis:(void (^)(BOOL)) callback;

@end

#endif /* WMAccountAuthentication_h */
