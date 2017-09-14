//
//  LoginViewController.h
//  WMSSOProject
//
//  Created by Anthony Helms on 12/7/15.
//  Copyright © 2015 Anthony Helms. All rights reserved.
//

#import <Foundation/Foundation.h>
@import UIKit;
#import "WMAccountAuthentication.h"
#import "LoginViewDelegate.h"

@interface LoginViewController : UIViewController <UITextFieldDelegate>

@property id<WMAccountAuthentication> authentication;
@property id<LoginViewDelegate> delegate;

@end
