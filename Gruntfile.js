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
					Class: false,
					module: true,
					guid: false,
					random: false,
					uneven: false,
					console: false
				},
				reporter: require('jshint-stylish')
			}
		},
		connect: {
			dev: {
				options: {
					port: 8080,
					base: 'public',
					keepalive: true,
					open: 'http://localhost:8080/'
				}
			}
		},
		shell: {
			styluswatch: {
				command: 'stylus -w -u nib stylus/game.styl -o public/css'
			},
			stylusgenerate: {
				command: 'stylus -u nib stylus/game.styl -o public/css'
			},
			server: {
				command: 'http-server -s ./public/'
			},
			cpcss: {
				command: 'cp ./public/css/* ../rogue_build/css/'
			},
			cpjs: {
				command: 'r.js.cmd -o ./build.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-connect');

	grunt.registerTask('default', [
		'jshint'
	]);
};