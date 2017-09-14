//
//  WMAccountStore.h
//  WMSSOProject
//
//  Created by Anthony Helms on 12/7/15.
//  Copyright © 2015 Anthony Helms. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "WMUser.h"

@interface WMAccountStore: NSObject {
    @protected
    NSString* _tokenType;
}

@property (nonatomic, strong) NSString* _Nonnull tokenType;

- initWithTokenType:(NSString* _Nonnull) tokenType;

// abstract methods
- (void) saveUser:(WMUser* _Nullable) user;
- (WMUser* _Nullable) getUser;

@end