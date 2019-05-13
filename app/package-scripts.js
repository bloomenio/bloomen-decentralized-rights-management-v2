/**
 * Windows: Please do not use trailing comma as windows will fail with token error
 */

const { series, concurrent } = require('nps-utils');
const pkg = require('./package.json');

let versionNumber = pkg.version;

module.exports = {
  scripts: {
    default: {
      description: 'Display help',
      script: 'nps help',
    },

    release: {
      default: {
        description: 'Start a new release',
        script: 'standard-version'
      },
      initial: {
        description: 'Generate the first version and CHANGELOG.md',
        script: 'standard-version --first-release'
      },
      bump: series(
        `cordova-set-version -v ${versionNumber}`,
        runFast(`./config/commands/bump-pom.ts ${versionNumber}`)
      )
      // update: {
      //   description: 'Update CHANGELOG.md file with latest release information',
      //   script: 'standard-version'
      // }
    },

    /**
     * ngX scripts
     */
    translations: {
      extract: 'ngx-translate-extract --input ./src --output ./src/translations/template.json --format=json --clean -sort --marker extract'
    },
    cordova: {
      prepare: 'ngx-scripts cordova prepare',
      run: 'ngx-scripts cordova run',
      build: 'ngx-scripts cordova build --release --copy dist',
      clean: 'ngx-scripts clean',
      default: 'cordova'
    },

    ng: {
      serve: 'ng serve',
      build: 'ng build',
      lint: 'ng lint',
      test: 'ng test',
      e2e: 'ng e2e'
    },

    lint: {
      default: series.nps(
        'ng.lint',
        'lint.style',
        'lint.html'
      ),
      style: 'stylelint \"src/**/*.scss\"',
      html: 'htmlhint \"src\" --config .htmlhintrc'
    },
    test: {
      default: series(
        'nps env',
        'nps ng.test'
      ),
      ci: series(
        'nps env',
        'nps lint',
        'nps "ng.test --code-coverage --watch=false"'
      )
    },
    e2e: series(
      'nps env',
      'nps ng.e2e'
    ),

    env: {
      description: 'Prepare ngX-Rocket environment configuration',
      script: 'ngx-scripts env npm_package_version'
    },

    docs: {
      default: 'nps docs.serve',
      serve: {
        description: 'Display both internal and public documentations',
        script: concurrent.nps(
          'banner.docs',
          'docs.internal.serve',
          'docs.public.serve'
        )
      },
      internal: {
        generate: 'compodoc --config .compodocrc.json --silent',
        serve: 'compodoc --config .compodocrc.json --serve --open --silent'
      },
      public: {
        serve: 'hads ./docs -o'
      }
    },

    /**
     * RUN APPLICATION
     */
    start: {
      default: {
        script: 'nps start.web.local',
        hiddenFromHelp: true
      },

      /**
       * Web-related run scripts
       */
      web: {
        sw: {
          description: 'Serve with service workers',
          script: series(
            'nps banner.serve',
            'nps build.web.production',
            'npx http-server ./www -p 4200'
          )
        },
        local: {
          description: 'Start web application using local configuration',
          script: series(
            'nps banner.serve',
            'nps "ng.serve --proxy-config proxy.conf.js --open --configuration=local"'
          )
        },
        devel: {
          description: 'Start web application using development configuration',
          script: series(
            'nps banner.serve',
            'nps "ng.serve --proxy-config proxy.conf.js --open"'
          )
        },
        pre: {
          description: 'Start web application using preproduction configuration and optimized build',
          script: series(
            'nps banner.serve',
            'nps "ng.serve --proxy-config proxy.conf.js --open --configuration=pre"'
          )
        },
        prod: {
          description: 'Start web application using production configuration and optimized build',
          script: series(
            'nps banner.serve',
            'nps "ng.serve --proxy-config proxy.conf.js --open --prod"'
          )
        }
      },
      /**
       * Android-related run scripts
       */
      android: {
        local: {
          description: 'Start Android application using local configuration',
          script: 'nps "cordova.run android --dev"'
        },
        devel: {
          description: 'Start Android application using development configuration',
          script: 'nps "cordova.run android --env devel"'
        },
        pre: {
          description: 'Start Android application using preproduction configuration and optimized build',
          script: 'nps "cordova.run android --env pre"'
        },
        prod: {
          description: 'Start Android application using production configuration and optimized build',
          script: 'nps "cordova.run android --env prod"'
        }
      },
      /**
       * iOS-related run scripts
       */
      ios: {
        default: { script: 'echo "Not available. Run prepare.ios.* commands and build/run it using Xcode"' }
      }
    },

    /**
     * PREPARE APPLICATION
     */
    prepare: {
      default: {
        script: 'nps cordova.prepare',
        hiddenFromHelp: true
      },
      android: {
        local: {
          description: 'Prepare Android application using local configuration',
          script: 'nps "cordova.prepare android"'
        },
        devel: {
          description: 'Start Android application using development configuration',
          script: 'nps "cordova.prepare android --env devel"'
        },
        pre: {
          description: 'Start Android application using preproduction configuration and optimized build',
          script: 'nps "cordova.prepare android --env pre"'
        },
        prod: {
          description: 'Start Android application using production configuration and optimized build',
          script: 'nps "cordova.prepare android --env prod"'
        }
      },
      ios: {
        local: {
          description: 'Prepare iOS application using local configuration',
          script: 'nps "cordova.prepare ios"'
        },
        devel: {
          description: 'Start iOS application using development configuration',
          script: 'nps "cordova.prepare ios --env devel --dev"'
        },
        pre: {
          description: 'Start iOS application using preproduction configuration and optimized build',
          script: 'nps "cordova.prepare ios --env pre"'
        },
        prod: {
          description: 'Start iOS application using production configuration and optimized build',
          script: 'nps "cordova.prepare ios --env prod"'
        }
      }
    },

    /**
     * BUILD APPLICATION
     */
    build: {
      default: 'nps build.web.devel',
      /**
       * Web-related build scripts
       */
      web: {
        devel: series(
          'nps banner.build',
          'nps env',
          'nps ng.build'
        ),
        pre: series(
          'nps env',
          'nps "ng.build --configuration=pre"'),
        prod: series(
          'nps env',
          'nps "ng.build --base-href=/bloo-demo/ --prod"'
        )
      },
      /**
       * Android-related build scripts
       */
      android: {
        local: {
          description: 'Start Android application using local configuration',
          script: 'nps "cordova.build android"'
        },
        devel: {
          description: 'Start Android application using development configuration',
          script: 'nps "cordova.build android --env devel"'
        },
        pre: {
          description: 'Start Android application using preproduction configuration and optimized build',
          script: 'nps "cordova.build android --env pre"'
        },
        prod: {
          description: 'Start Android application using production configuration and optimized build',
          script: 'nps "cordova.build android --env prod"'
        }
      },
      /**
       * iOS-related build scripts
       */
      ios: {
        default: { script: 'echo "Not available. Run prepare.ios.* commands and build/run it using Xcode"' }
      }
    },

    /**
     * DEPLOY APPLICATION
     */
    deploy: {
      /**
       * Web-related build scripts
       */
      web: {
        devel: 'mvn install -Ddeploy=true -Denv=devel',
        pre: 'mvn install -Ddeploy=true -Denv=uat',
        prod: 'mvn install -Ddeploy=false -Denv=pro'
      }
    },


    /**
     * This creates pretty banner to the terminal
     */
    banner: {
      docs: banner('docs'),
      build: banner('build'),
      serve: banner('serve'),
      clean: banner('clean')
    }
  }
};

function banner(name) {
  return {
    hiddenFromHelp: true,
    silent: true,
    description: `Shows ${name} banners to the console`,
    script: runFast(`./config/commands/banner.ts ${name}`),
  };
}

function runFast(path) {
  return `ts-node --transpileOnly ${path}`;
}
