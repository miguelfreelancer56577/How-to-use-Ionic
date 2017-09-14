//
//  WMUserAdapter.h
//  WMSSOProject
//
//  Created by Anthony Helms on 12/7/15.
//  Copyright © 2015 Anthony Helms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "WMUser.h"

@interface WMUserAdapter : NSObject
+ (NSDictionary*) toDictionary:(WMUser*) user;
+ (WMUser*) fromDictionary:(NSDictionary*) dictionaryWithUserInfo;
@end
