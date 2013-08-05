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
        tasks: ['build'],
        options: {
          livereload: true
        }
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
        path: 'http://localhost:8008'
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

  grunt.registerTask('develop', 'Setup development server and watch files',
                     ['build', 'connect', 'open', 'watch']);
  grunt.registerTask('test', 'Lint and test source files',
                     ['jshint', 'cafemocha']);
  grunt.registerTask('build', 'Combine and compress source for the frontend',
                     ['browserify', 'uglify']);

  grunt.registerTask('default', ['develop']);

};
