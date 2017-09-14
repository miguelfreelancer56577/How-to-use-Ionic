//
//  WMLoginPlugin.h
//  WMSSOProject
//
//  Created by Anthony Helms on 12/9/15.
//  Copyright © 2015 Anthony Helms. All rights reserved.
//

#ifndef WMLoginPlugin_h
#define WMLoginPlugin_h

#import <Foundation/Foundation.h>
#import "Cordova/CDVPlugin.h"

@interface WMLoginPlugin : CDVPlugin

- (void) getUser:(CDVInvokedUrlCommand*)command;
- (void) signOutUser:(CDVInvokedUrlCommand*)command;
- (void) validateUserToken:(CDVInvokedUrlCommand*)command;

@end

#endif /* WMLoginPlugin_h */
