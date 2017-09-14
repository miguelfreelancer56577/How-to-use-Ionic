//
//  WMAccountAuthenticationFactory.h
//  WMSSOProject
//
//  Created by Anthony Helms on 12/7/15.
//  Copyright © 2015 Anthony Helms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "WMAccountAuthentication.h"

@interface WMAccountAuthenticationFactory : NSObject
+ (id<WMAccountAuthentication>) getInstance;
@end
