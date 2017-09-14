'use strict';

module.exports = function(context) {
    if (context.opts.cordova.platforms.indexOf("android") < 0) {
        console.log('android platform not available; exiting hook script');
        return;
    }

    var fs = context.requireCordovaModule('fs');
    var path = context.requireCordovaModule('path');

    var signAppPluginName = 'com.walmart.platform.mobile.android.SignAppPlugin';
    var signAppPluginConfig = path.join(context.opts.plugin.dir, 'scripts', 'signAppPlugin.cfg');
    var buildGradle = path.join(context.opts.projectRoot, 'platforms', 'android', 'build.gradle');

    if (isPluginNeeded()) {
        addGradlePlugin();
    }

    function isPluginNeeded() {
        if (fs.existsSync(buildGradle)) {
            var fd = fs.openSync(buildGradle, 'r');
            if (fd) {
                var contents = fs.readFileSync(fd, {
                    encoding : 'utf8'
                });

                if (contents && contents.indexOf(signAppPluginName) >= 0) {
                    console.log('WM enterprise signing appears to have already been configured.');
                    return false;
                }
            }
        }

        return true;
    }

    function addGradlePlugin() {
        console.log('Adding Android WM Enterprise signing to build');

        var contents = fs.readFileSync(signAppPluginConfig, {
            encoding : 'utf8'
        });
        if (contents) {
            fs.writeFileSync(buildGradle, contents, {
                encoding : 'utf8',
                flag : 'a'
            });
        }
    }
}