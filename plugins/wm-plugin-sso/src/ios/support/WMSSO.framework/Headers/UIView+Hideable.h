//
//  UIView+Hideable.h
//  WMSSOProject
//
//  Created by Anthony Helms on 12/7/15.
//  Copyright © 2015 Anthony Helms. All rights reserved.
//

#import <Foundation/Foundation.h>
@import UIKit;

@interface UIView (autolayout) 

@property (nonatomic, retain) NSMutableArray<NSLayoutConstraint *>* _parentConstraints;

- (void) hideView;
- (void) showView;

@end
