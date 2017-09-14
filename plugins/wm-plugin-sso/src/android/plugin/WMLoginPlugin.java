package com.walmart.sso.plugin;

import android.accounts.AccountManagerCallback;
import android.accounts.AccountManagerFuture;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.util.Log;


import com.walmart.store.wmsso.WMAccountHelper;
import com.walmart.store.wmsso.WMAccountManagerCallback;
import com.walmart.store.wmsso.WMAccountManagerServiceClient;
import com.walmart.store.wmsso.WMUser;
import com.walmart.store.wmsso.WMUserAdapter;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;

/**
 * Created by awhelms on 10/9/15.
 */
public class WMLoginPlugin extends CordovaPlugin {
    private static final String TAG = "WMLoginPlugin";

    private CallbackContext userChangedCallbackContext = null;
    private WMAccountHelper accountHelper;
    private WMUser currentUser;
    private WMAccountManagerServiceClient client;

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);

        accountHelper = new WMAccountHelper(cordova.getActivity());
        client = new WMAccountManagerServiceClient(cordova.getActivity());
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {

        if (action.equals("getUser")) {
            getUser(callbackContext);
            return true;
        } else if (action.equals("signOutUser")) {
            signOut(callbackContext);
            return true;
        }

        return false;
    }

    private void getUser(final CallbackContext callbackContext) {
        if (!isSingleSignOnInstalled()) {
            callbackContext.error("Single Sign On app not installed");
        } else {
            if (client.isServiceAvailable()) {
                // Preferred flow
                client.getUser(cordova.getActivity(), new WMAccountManagerCallback() {
                    @Override
                    public void onSuccess(WMUser user) {
                        callbackContext.success(WMUserAdapter.toJSON(user));
                    }

                    @Override
                    public void onError(Throwable t) {
                        callbackContext.error(t.getMessage());
                    }
                });
            } else {
                // Deprecated flow: Account Manager
                try {
                    accountHelper.getCurrentUser(this.cordova.getActivity(), new AccountManagerCallback<WMUser>() {
                        @Override
                        public void run(AccountManagerFuture<WMUser> future) {
                            try {
                                if (!future.isCancelled()) {
                                    currentUser = future.getResult();

                                    Log.d(TAG, "domain [" + currentUser.getDomain() + "]");
                                    Log.d(TAG, "subDomain [" + currentUser.getSubDomain() + "]");
                                    Log.d(TAG, "token validity duration [" + currentUser.getTokenValidity() + "]");
                                    Log.d(TAG, "site id [" + currentUser.getSiteId() + "]");
                                    Log.d(TAG, "country [" + currentUser.getCountryCode() + "]");
                                    Log.d(TAG, "refresh token [" + currentUser.getRefreshToken() + "]");

                                    callbackContext.success(WMUserAdapter.toJSON(currentUser));
                                } else {
                                    callbackContext.error("Error while getting current user");
                                }
                            } catch (Exception e) {
                                callbackContext.error("Error while getting current user");
                            }
                        }
                    });
                } catch (Exception e) {
                    callbackContext.error("Error while getting current user");
                }
            }
        }
    }

    private void signOut(final CallbackContext callbackContext) {
        if (isSingleSignOnInstalled()) {
            if (client.isServiceAvailable()) {
                // Preferred flow
                client.signOutUser(new WMAccountManagerCallback() {
                    @Override
                    public void onSuccess(WMUser user) {
                        callbackContext.success();
                    }

                    @Override
                    public void onError(Throwable t) {
                        callbackContext.error(t.getMessage());
                    }
                });
            } else {
                // Deprecated flow: Account Manager
                accountHelper.signOutUser(currentUser);
                callbackContext.success();
            }
        } else {
            callbackContext.error("Single Sign On app not installed");
        }
    }

    private boolean isSingleSignOnInstalled() {
        PackageManager pm = this.cordova.getActivity().getPackageManager();
        boolean installed = false;

        try {
            pm.getPackageInfo("com.walmart.sso.app", PackageManager.GET_ACTIVITIES);
            installed = true;
        } catch (PackageManager.NameNotFoundException e) {}

        return installed;
    }
}
