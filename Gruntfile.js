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
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
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
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('test', ['jshint', 'cafemocha']);
  grunt.registerTask('build', ['browserify', 'uglify']);
  grunt.registerTask('default', ['test']);

};
