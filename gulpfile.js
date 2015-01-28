var gulp = require('gulp');
var streamify = require('gulp-streamify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var through = require('through2');
var to5ify = require('6to5ify');

gulp.task('js', function() {
	return browserify({
		entries: './index.js',
		detectGlobals: false,
		standalone: 'glitch'
	})
	.transform(to5ify)
	.bundle()
	.pipe(source('glitch.js'))
	// .pipe(streamify(uglify()))
	.pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
	gulp.watch(['./index.js', './{lib,effects}/*.js'], ['js']);
});
