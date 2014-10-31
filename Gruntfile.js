module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			// You get to make the name
			// The paths tell JSHint which files to validate
			myFiles: ['public/js/**/*.js', '!public/js/libs/*.js', 'Gruntfile.js'],
			options: {
				curly: true,
				eqeqeq: true,
				eqnull: true,
				browser: true,
				forin: true,
				undef: true,
				unused: true,
				globals: {
					define: false,
					require: false,
					requirejs: true,
					module: true,
					guid: false,
					random: false,
					uneven: false,
					console: false
				},
				reporter: require('jshint-stylish')
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', [
		'jshint',
	]);
};