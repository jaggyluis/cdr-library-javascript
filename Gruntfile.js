module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			src: ['src/*.js'],
			options: {
			    jshintrc: '.jshintrc'
			}
		},
		smash: {
		    bundle: {
		      src: 'src/build.cdr.js',
		      dest: '.build/cdr.js'
		    },
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				//mangleProperties: true,
				//reserveDOMCache: true,
				mangle : true,
				compress : true,
			},
			build: {
				files: {
					'.build/cdr.min.js' : ['.build/cdr.js']
				}
			}
		}
	});
	// Load the plugins
	grunt.loadNpmTasks('grunt-contrib-jshint');
  	grunt.loadNpmTasks('grunt-contrib-uglify');
  	grunt.loadNpmTasks('grunt-smash');

  	// Default task(s).
  	grunt.registerTask('default', ['jshint', 'smash','uglify']);
}