/* eslint-env node */
'use strict';

module.exports = function(deployTarget) {
  let ENV = {
    build: {},
    // include other plugin configuration that applies to all deploy targets here
    'rsync-assets': {
      destination: "pi@192.168.1.3:/home/pi/public_html/home.joanpiedra.com/dendama-01",
      ssh: true,
      excludeIndexHTML: false,
      flags: ['--delete']
    },
    // pipeline: {
    //   runOrder: {
    //     build: { before: 'rsync-assets' },
    //     'rsync-assets': { after: 'build' }
    //   }
    // }
  };

  if (deployTarget === 'development') {
    ENV.build.environment = 'development';
    // configure other plugins for development deploy target here
  }

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production';
    // configure other plugins for staging deploy target here
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    // configure other plugins for production deploy target here
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
