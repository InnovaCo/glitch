var path = require('path');
var gulp = require('gulp');
var streamify = require('gulp-streamify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var through = require('through2');
var to5ify = require('6to5ify');

function compileJS(src, dest) {
	return browserify({
		entries: src,
		detectGlobals: false,
		standalone: 'glitch'
	})
	.transform(to5ify)
	.bundle()
	.pipe(source( path.basename(dest) ))
	// .pipe(streamify(uglify()))
	.pipe(gulp.dest( path.dirname(dest) ));
}

gulp.task('js-main', function() {
	return compileJS('./index.js', './dist/glitch.js');
});

gulp.task('js-video', function() {
	return compileJS('./video-glitch.js', './dist/video-glitch.js');
});

gulp.task('widget', function() {
	return compileJS('./glitch-widget.js', './dist/glitch-widget.js');
});

gulp.task('watch', function() {
	gulp.watch(['./*.js', './{lib,effects}/*.js'], ['default']);
});

gulp.task('default', ['js-main', 'js-video', 'widget'])
