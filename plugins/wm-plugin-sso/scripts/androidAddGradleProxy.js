'use strict';

module.exports = function(context) {
    if (context.opts.cordova.platforms.indexOf("android") < 0) {
        console.log('android platform not available; exiting hook script');
        return;
    }

    var fs = context.requireCordovaModule('fs');
    var path = context.requireCordovaModule('path');

    var proxyHost = 'gec-proxy-svr.homeoffice.wal-mart.com';
    var proxyPort = '8080';
    var gradleProxy = '\nsystemProp.http.proxyHost=' + proxyHost + '\n' +
        'systemProp.http.proxyPort=' + proxyPort + '\n' +
        'systemProp.https.proxyHost=' + proxyHost + '\n' +
        'systemProp.https.proxyPort=' + proxyPort + '\n\n';

    var gradleProperties = path.join(context.opts.projectRoot, 'platforms', 'android', 'gradle.properties');

    if (isProxyNeeded()) {
        writeProxy();
    }

    function isProxyNeeded() {
        if (fs.existsSync(gradleProperties)) {
            var fd = fs.openSync(gradleProperties, 'r');
            if (fd) {
                var contents = fs.readFileSync(fd, {
                    encoding : 'utf8'
                });

                if (contents && contents.indexOf(proxyHost) >= 0) {
                    console.log('gradle proxy already configured');
                    return false;
                }
            }
        }

        return true;
    }

    function writeProxy() {
        console.log('Writing gradle proxy settings for internal WM development');
        fs.writeFileSync(gradleProperties, gradleProxy, {
            encoding : 'utf8',
            flag : 'a'
        });
    }
}