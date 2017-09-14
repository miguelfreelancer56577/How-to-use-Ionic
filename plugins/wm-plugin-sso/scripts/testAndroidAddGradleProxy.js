var script = require('./androidAddGradleProxy');

var context = {
    opts : { 
        cordova : { 
            platforms : ['android']
        },
        projectRoot : '../../../SalesAppCDV'
    },
    requireCordovaModule : require,
};

script(context);