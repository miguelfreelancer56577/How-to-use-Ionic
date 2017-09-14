'use strict';

// original script provided by brenna@revunit
// changes by awhelms

var IOS_DEPLOYMENT_TARGET_KEY = 'IPHONEOS_DEPLOYMENT_TARGET';
var IOS_DEPLOYMENT_TARGET_VALUE = '8.0';

var BUILD_SETTING_OBJECT = 'buildSettings';
var CHECK_KEY = 'ALWAYS_SEARCH_USER_PATHS';

var LANGUAGE_MODULE_BUILD_SETTING_KEY = 'CLANG_ENABLE_MODULES';
var LANGUAGE_MODULE_BUILD_SETTING_VALUE = 'YES';


module.exports = function(context) {

  // only run if ios platform present
  // only run if the plugin being procesed is wm-plugin-sso
  if (context.opts.cordova.platforms.indexOf('ios') < 0 ||
      context.opts.plugin.id !== 'wm-plugin-sso') {
     console.log(context.opts.cordova.platforms, context.opts.plugin.id);
     console.log("exiting early");
     return;
  }

  var fs = context.requireCordovaModule('fs');
  var path = context.requireCordovaModule('path');
  var xcode = context.requireCordovaModule('xcode');

  var projectRoot = context.opts.projectRoot;

  var cordova_util = context.requireCordovaModule('cordova-lib/src/cordova/util'),
    projectRoot = cordova_util.isCordova(process.cwd());

  var projectName = getProjectName(projectRoot);
  var xcodeProjectName = projectName + '.xcodeproj';
  var xcodeProjectPath = path.join(projectRoot, 'platforms', 'ios', xcodeProjectName, 'project.pbxproj');

  console.log("xcodeProjectPath", xcodeProjectPath);

  var xcodeProject;

  var ssoFrameworkURL = 'platforms/ios/' + projectName + '/Plugins/wm-plugin-sso/WMSSO.framework';

  if (!fs.existsSync(xcodeProjectPath)) {
    console.log('Unable to find Xcode project for ' + projectName);
    return;
  }

  xcodeProject = xcode.project(xcodeProjectPath);
  xcodeProject.parse(function(err) {
    if (err) {
      console.log('An error occured during parsing of ' + xcodeProjectPath + '. Start weeping. Output: ' + JSON.stringify(err));
    } else {
      console.log('Adjusting iOS deployment target for ' + projectName + ' to: ' + IOS_DEPLOYMENT_TARGET_VALUE);
      updateBuildConfiguration(xcodeProject, xcodeProjectPath, IOS_DEPLOYMENT_TARGET_KEY, IOS_DEPLOYMENT_TARGET_VALUE);
      console.log(projectName + ' now has ' + IOS_DEPLOYMENT_TARGET_KEY + ' set as: ' + IOS_DEPLOYMENT_TARGET_VALUE);

      console.log('Adjusting module build settings for ' + projectName + ' to: [' + LANGUAGE_MODULE_BUILD_SETTING_VALUE + '] ...');
      updateBuildConfiguration(xcodeProject, xcodeProjectPath, LANGUAGE_MODULE_BUILD_SETTING_KEY, LANGUAGE_MODULE_BUILD_SETTING_VALUE);
      console.log(projectName + ' now has ' + LANGUAGE_MODULE_BUILD_SETTING_KEY + ' set as: ' + LANGUAGE_MODULE_BUILD_SETTING_VALUE);

      console.log('Adding WMSSO Framework to ' + projectName + '...');
      addWMSSOFramework(projectRoot, ssoFrameworkURL, xcodeProject);
      console.log('WMSSO Framework added to ' + projectName + '...');

      console.log('Embedding WMSSO Binary in ' + projectName + '...');
      embedBinary(projectName, xcodeProject, xcodeProjectPath);
      console.log('Embedded WMSSO Binary in ' + projectName + '...');
    }
  });

  function getProjectName(protoPath) {
    var packageJSONPath = path.join(protoPath, 'package.json');
    try {
      fs.statSync(packageJSONPath);
      var content = fs.readFileSync(packageJSONPath, 'utf-8');
      var json = JSON.parse(content);

      return json.name;
    } catch(err) {
      var ConfigParser; 
      try {
        // cordova 6+
        ConfigParser = context.requireCordovaModule('cordova-common/src/ConfigParser/ConfigParser')
      } catch(cfgErr) {
        // before cordova-common
        ConfigParser = context.requireCordovaMoudle('cordova-lib/src/configparser/ConfigParser');
      }

      var projectXml = cordova_util.projectConfig(projectRoot),
        projectCfg = new ConfigParser(projectXml);

      if (projectCfg) {
        return projectCfg.name();
      } else {
        throw(err);
      }
    }
  }


  function updateBuildConfiguration(xcodeProject, xcodeProjectPath, configKey, configValue) {
    var buildConfig = xcodeProject.pbxXCBuildConfigurationSection();
    replaceProperty(buildConfig, configKey, configValue);
    fs.writeFileSync(xcodeProjectPath, xcodeProject.writeSync(), 'utf-8');
  }


  function replaceProperty(passedObject, passedProperty, passedValue) {
    for (var property in passedObject) {
      if (Object.prototype.hasOwnProperty.call(passedObject, property)) {
        if (typeof passedObject[property] === 'object') {
          if (property === BUILD_SETTING_OBJECT && 
              passedProperty === LANGUAGE_MODULE_BUILD_SETTING_KEY && 
              Object.prototype.hasOwnProperty.call(passedObject[property], CHECK_KEY)) {
            passedObject[property][LANGUAGE_MODULE_BUILD_SETTING_KEY] = LANGUAGE_MODULE_BUILD_SETTING_VALUE;
          }
          replaceProperty(passedObject[property], passedProperty, passedValue);
        } else if (property === passedProperty) {
          passedObject[property] = passedValue;
        }
      }
    }
  }


  function addWMSSOFramework(projectRoot, ssoFrameworkURL, xcodeProject) {
    var ssoFrameworkPath = path.join(projectRoot, ssoFrameworkURL);
    var options = {
      customFramework: true,
      embed: true
    };

    xcodeProject.addFramework(ssoFrameworkPath, options);
  }


  function embedBinary(projectName, xcodeProject, xcodeProjectPath) {

    var groupName = 'Embed Frameworks ' + context.opts.plugin.id;
    var pluginPathInPlatformIosDir = projectName + '/Plugins/' + context.opts.plugin.id;

    addRunpathSearchBuildProperty(xcodeProject);

    process.chdir('./platforms/ios');
    var frameworkFilesToEmbed = fromDirectory(pluginPathInPlatformIosDir, '.framework', false, true);
    process.chdir('../../');

    if (!frameworkFilesToEmbed || !frameworkFilesToEmbed.length) {
      console.log('NO FRAMEWORK FILES TO EMBED');
      return;
    }

    console.log("frameworkFilesToEmbed", frameworkFilesToEmbed);

    xcodeProject.addBuildPhase(frameworkFilesToEmbed, 'PBXCopyFilesBuildPhase', groupName, xcodeProject.getFirstTarget().uuid, 'frameworks');

    for (var frameworkFileFullPath of frameworkFilesToEmbed) {
      var justFrameworkFile = path.basename(frameworkFileFullPath);
      var fileRef = getFileRefFromName(xcodeProject, justFrameworkFile);
      var fileId = getFileIdAndRemoveFromFrameworks(xcodeProject, justFrameworkFile);

      // Adding PBXBuildFile for embedded frameworks
      var file = {
        uuid: fileId,
        basename: justFrameworkFile,
        settings: {
          ATTRIBUTES: ['CodeSignOnCopy', 'RemoveHeadersOnCopy']
        },

        fileRef:fileRef,
        group:groupName
      };
      xcodeProject.addToPbxBuildFileSection(file);


      // Adding to Frameworks as well (separate PBXBuildFile)
      var newFrameworkFileEntry = {
        uuid: xcodeProject.generateUuid(),
        basename: justFrameworkFile,

        fileRef:fileRef,
        group: 'Frameworks'
      };
      xcodeProject.addToPbxBuildFileSection(newFrameworkFileEntry);
      xcodeProject.addToPbxFrameworksBuildPhase(newFrameworkFileEntry);
    }

    fs.writeFileSync(xcodeProjectPath, xcodeProject.writeSync());
  }


  function addRunpathSearchBuildProperty(xcodeProject) {
    var LD_RUNPATH_SEARCH_PATHS = xcodeProject.getBuildProperty('LD_RUNPATH_SEARCH_PATHS');
    if (!LD_RUNPATH_SEARCH_PATHS) {
      xcodeProject.addBuildProperty('LD_RUNPATH_SEARCH_PATHS', '\"$(inherited) @executable_path/Frameworks\"');
    } else if(LD_RUNPATH_SEARCH_PATHS.indexOf('@executable_path/Frameworks') === -1) {
      var newValue = LD_RUNPATH_SEARCH_PATHS.substr(0, LD_RUNPATH_SEARCH_PATHS.length - 1);
      newValue += ' @executable_path/Frameworks\"';
      xcodeProject.updateBuildProperty('LD_RUNPATH_SEARCH_PATHS', newValue);
    }
  }


  function fromDirectory(startPath, filter, rec, multiple) {
    if (!fs.existsSync(startPath)) {
      console.log('NO DIRECTORY: ', startPath);
      return;
    }

    var files = fs.readdirSync(startPath);
    var resultFiles = [];
    for (var i = 0; i < files.length; i++) {
      var filename = path.join(startPath, files[i]);
      var stat = fs.lstatSync(filename);
      if (stat.isDirectory() && rec) {
        fromDirectory(filename, filter); //recurse
      }

      if (filename.indexOf(filter) >= 0) {
        if (multiple) {
          resultFiles.push(filename);
        } else {
          return filename;
        }
      }
    }

    if (multiple) {
      return resultFiles;
    }
  }


  function getFileRefFromName(xcodeProject, fName) {
    var fileReferences = xcodeProject.hash.project.objects['PBXFileReference'];
    var fileRef = '';
    for(var ref in fileReferences) {
      if(ref.indexOf('_comment') === -1) {
        var tmpFileRef = fileReferences[ref];
        if(tmpFileRef.name && tmpFileRef.name.indexOf(fName) !== -1) {
          fileRef = ref;
          break;
        }
      }
    }
    return fileRef;
  }


  function getFileIdAndRemoveFromFrameworks(xcodeProject, fileBasename) {
    var fileId = '';
    var pbxFrameworksBuildPhaseObjFiles = xcodeProject.pbxFrameworksBuildPhaseObj(xcodeProject.getFirstTarget().uuid).files;
    for(var i = 0; i < pbxFrameworksBuildPhaseObjFiles.length; i++) {
      var frameworkBuildPhaseFile = pbxFrameworksBuildPhaseObjFiles[i];
      if (frameworkBuildPhaseFile.comment && frameworkBuildPhaseFile.comment.indexOf(fileBasename) !== -1) {
        fileId = frameworkBuildPhaseFile.value;
        pbxFrameworksBuildPhaseObjFiles.splice(i, 1); // MUST remove from frameworks build phase or else CodeSignOnCopy won't do anything.
        break;
      }
    }
    return fileId;
  }

};
