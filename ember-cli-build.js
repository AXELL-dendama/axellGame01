'use strict';

const path = require('path');
const Funnel = require('broccoli-funnel');
const ConfigReplace = require('broccoli-config-replace');

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const { configReplacePatterns } = require('ember-cli/lib/utilities/ember-app-utils');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    // do not use <meta> tags
    storeConfigInMeta: false,

    // don't run app automatically, we are lazy loading it into another app
    autoRun: false
  });

  // add additional debug.html from `app/debug.html` to `dist/debug.html`
  const debugFilePath = 'debug.html';
  const pkgr = app._defaultPackager;
  const debugTree = new Funnel('app', {
    include: [debugFilePath],
    allowEmpty: true,
    annotation: 'Additional HTML file'
  });

  // replace {{rootURL}} and {{content-for}} in debug.html
  let patterns = configReplacePatterns({
    addons: pkgr.project.addons,
    autoRun: pkgr.autoRun,
    storeConfigInMeta: pkgr.storeConfigInMeta,
  });

  const processedDebugTree = new ConfigReplace(debugTree, pkgr.packageConfig(), {
    configPath: path.join(pkgr.name, 'config', 'environments', `${pkgr.env}.json`),
    files: [debugFilePath],
    patterns,
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  // merge `debug.html` tree with ember app
  return app.toTree(processedDebugTree);
};
