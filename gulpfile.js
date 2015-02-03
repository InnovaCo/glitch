var path = require('path');
var gulp = require('gulp');
var streamify = require('gulp-streamify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var through = require('through2');
var notifier = require('node-notifier');
var extend = require('xtend');

var DEBUG = false;

function js(options) {
	return through.obj(function(file, enc, next) {
		file.contents = browserify(extend({
			entries: file.path,
			detectGlobals: false,
			debug: DEBUG
		}, options || {}))
		.transform('6to5ify')
		.bundle(function(err, content) {
			if (err) {
				notifier.notify({
					title: 'Error', 
					message: err,
					sound: true
				});
			} else {
				file.contents = content
			}
			next();
		});

		this.push(file);
	});
}

gulp.task('main', function() {
	return gulp.src(['./index.js', './apps/*.js'], {base: './'})
		.pipe(js({standalone: 'glitch'}))
		.pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
	DEBUG = true;
	gulp.watch(['./*.js', './{lib,effects,apps}/*.js'], ['default']);
});

gulp.task('default', ['main']);
