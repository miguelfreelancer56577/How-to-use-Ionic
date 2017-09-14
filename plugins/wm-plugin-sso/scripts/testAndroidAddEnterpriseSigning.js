var script = require('./androidAddEnterpriseSigning');

var context = {
    opts : { 
        cordova : { 
            platforms : ['android']
        },
        projectRoot : '../../../SalesAppCDV',
        plugin : {
            dir : '../',
            platform : 'android'
        }
    },
    requireCordovaModule : require,
};

script(context);