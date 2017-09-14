//
//  WMLoginPlugin.m
//  WMSSOProject
//
//  Created by Anthony Helms on 12/9/15.
//  Copyright © 2015 Anthony Helms. All rights reserved.
//

#import "WMLoginPlugin.h"
@import WMSSO;

@implementation WMLoginPlugin {
    WMAccountManager* acctMgr;
    WMUser* currentUser;
}

- (void)pluginInitialize {
    
    [super pluginInitialize];
    
    acctMgr = [[WMAccountManager alloc] init];
    acctMgr.authentication = [WMAccountAuthenticationFactory getInstance];
    acctMgr.store = [WMAccountStoreFactory getInstanceForTokenType:[acctMgr.authentication getTokenType]];
    
}

- (void) getUser:(CDVInvokedUrlCommand*)command {
    [self->acctMgr getUserForUseWithViewController:[self viewController] ThenDoThis:^(WMUser* user) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[WMUserAdapter toDictionary:user]];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
    
}

- (void) signOutUser:(CDVInvokedUrlCommand*)command {
    [self->acctMgr signOutUserThenDoThis:^{
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) validateUserToken:(CDVInvokedUrlCommand*)command {
    [self->acctMgr validateUserTokenThenDoThis:^(BOOL isValid) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:isValid];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

@end
