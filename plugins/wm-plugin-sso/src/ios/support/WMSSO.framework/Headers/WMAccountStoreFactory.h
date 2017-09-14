//
//  WMAccountStoreFactory.h
//  WMSSOProject
//
//  Created by Anthony Helms on 12/7/15.
//  Copyright © 2015 Anthony Helms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "WMAccountStore.h"

@interface WMAccountStoreFactory : NSObject
+ (WMAccountStore *) getInstanceForTokenType:(NSString*) tokenType;
@end
