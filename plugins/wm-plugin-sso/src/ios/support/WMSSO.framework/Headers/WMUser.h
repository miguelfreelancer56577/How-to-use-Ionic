//
//  WMUser.h
//  WMSSOProject
//
//  Created by Anthony Helms on 12/7/15.
//  Copyright © 2015 Anthony Helms. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WMUser : NSObject
    @property NSString* userId;
    @property NSString* token;
    @property NSString* domain;
    @property NSString* subDomain;
    @property NSString* countryCode;
    @property NSInteger siteId;
    @property NSString* refreshToken;
    @property NSInteger tokenValidity;
    @property NSString* authenticationState;
    @property NSString* authenticationResultMsg;
    @property double tokenExpiresAt;
    @property NSDictionary* additional;
@end
