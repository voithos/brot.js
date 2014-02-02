(function() {
  'use strict';

  module.exports = function(grunt) {

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      jshint: {
        options: {
          newcap: false
        },
        all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
      },
      cafemocha: {
        all: {
          src: 'test/**/*.js',
          options: {
            ui: 'bdd',
            reporter: 'list'
          }
        }
      },
      browserify: {
        'build/brot.js': 'src/brot.js'
      },
      watch: {
        dev: {
          files: ['src/**/*.js', '!src/textbrot.js'],
          tasks: ['usetheforce_on', 'test', 'build', 'usetheforce_off'],
          options: {
            livereload: true
          }
        },
        test: {
          files: ['src/**/*.js', 'test/**/*.js', 'Gruntfile.js'],
          tasks: ['usetheforce_on', 'test', 'usetheforce_off']
        }
      },
      connect: {
        options: {
          port: 8008,
          hostname: 'localhost',
          base: '.'
        },
        dev: {
          options: {
            middleware: function(connect, options) {
              return [
                require('connect-livereload')(),
                connect.static(options.base)
              ];
            }
          }
        }
      },
      open: {
        dev: {
          path: 'http://localhost:8008/index.dev.html'
        }
      },
      uglify: {
        options: {
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> */\n'
        },
        nomin: {
          options: {
            mangle: false,
            compress: false,
            beautify: true
          },
          files: {
            'build/brot.js': ['build/brot.js']
          }
        },
        min: {
          files: {
            'build/brot.min.js': ['build/brot.js']
          }
        }
      }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-cafe-mocha');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Workaround to force continuation when encountering errors
    // during development cycle (for watch / livereload)
    grunt.registerTask('usetheforce_on', '// force the force option', function() {
      if (!grunt.option('force')) {
        grunt.config.set('usetheforce', true);
        grunt.option('force', true);
      }
    });
    grunt.registerTask('usetheforce_off', '// remove the force option', function() {
      if (grunt.config.get('usetheforce')) {
        grunt.option('force', false);
      }
    });

    grunt.registerTask('develop', 'Setup development server and watch files',
                       ['usetheforce_on', 'test', 'build',
                        'connect', 'open', 'watch:dev', 'usetheforce_off']);
    grunt.registerTask('test', 'Lint and test source files',
                       ['jshint', 'cafemocha']);
    grunt.registerTask('watchtest', 'Watch for changes and lint and test source files',
                       ['usetheforce_on', 'test', 'watch:test', 'usetheforce_off']);
    grunt.registerTask('build', 'Combine and compress source for the frontend',
                       ['browserify', 'uglify']);

    grunt.registerTask('default', ['develop']);

  };
})();
