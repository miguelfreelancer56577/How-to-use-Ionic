 var cordova = require("cordova"),
    exec = require("cordova/exec"),
	 Promise = require("wm-plugin-sso.Promise").Promise;

console.log("setting up WM-SSO js");

 var pluginName = "WM-SSO";

var WMSSO = function() {
    this.currentUser = {};
};

WMSSO.prototype.getUser = getUser;
WMSSO.prototype.signOutUser = signOutUser;

var wmSSO = new WMSSO();

document.addEventListener("deviceready", init, false);

module.exports = wmSSO;


function init() {
	document.addEventListener("resume", appResumeUserCheck, false);

	function appResumeUserCheck() {
		console.log("app resumed; checking user");
		wmSSO.getUser(function appResumeUserCheckSuccess(user) {
			if (user.changedFields.length > 0) {
				console.log("firing userChanged event", user);
				cordova.fireDocumentEvent("userChanged", { 
					newUser : user
				});
			}
		}, function appResumeUserCheckError(error) {
			console.log("error while getting user");
		});
	}
}

function setChangedFields(currentUser, newUser) {
	newUser.changedFields = [];
	["userId", "siteId", "token", "domain", "subDomain", "countryCode"].forEach(function(field) {
		if (currentUser[field] !== newUser[field]) {
			newUser.changedFields.push(field);
		}
	});
}


function getUser(success, error) {
    return callPlugin("getUser").then(function(user) {
        setChangedFields(wmSSO.currentUser, user);
        wmSSO.currentUser = user;

        if (success) {
            success(user);
        }

        return user;
    }, function(err) {
        if (error) {
            error(err);
        }

        return Promise.reject(err);
    });
}

function signOutUser(success, error) {
    return callPlugin("signOutUser", success, error);
}

function callPlugin(funcName, success, error, args) {
    if (typeof success != "function") {
        // omitted success and error; assuming Promise desired; first arg should be object
        // converting to array for now...
        args = [success];
        success = undefined;
        error = undefined;
    }

    return new Promise(function(resolve, reject) {
        exec(function localSuccess() {
            if (success) {
                success.apply(undefined, arguments);
            }
            resolve.apply(undefined, arguments);
        }, function localError(msg) {
            if (error) {
                error(msg);
            }
            reject(msg);
        }, pluginName, funcName, args || [])
    });
}