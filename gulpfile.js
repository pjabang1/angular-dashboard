var gulp    = require('gulp'),
  less      = require('gulp-less'),
  usemin    = require('gulp-usemin'),
  wrap      = require('gulp-wrap'),
  connect   = require('gulp-connect'),
  watch     = require('gulp-watch');

var paths = {
  js: 'src/js/**/*.*',
  fonts: 'src/fonts/**.*',
  images: 'src/img/**/*.*',
  styles: 'src/less/**/*.less',
  // index: 'src/index.html',
  src: 'src/**/*.html',
  bower_fonts: 'src/bower_components/**/*.{ttf,woff,eof,svg}',
  bower_components: 'src/bower_components/**/*.*',
  bower_images : 'src/bower_components/**/img/**/*'
};


gulp.task('usemin', function() {
  return gulp.src(paths.src)
    .pipe(usemin({
      less: ['concat', less()],
      js: ['concat', wrap('(function(){ \n<%= contents %>\n})();')],
    }))
    .pipe(gulp.dest('dist/'));
});

/**
 * Copy assets
 */
gulp.task('copy-assets', ['copy-images', 'copy-fonts', 'copy-bower_fonts', 'copy-bower_images']);

gulp.task('copy-images', function(){
  return gulp.src(paths.images)
    .pipe(gulp.dest('dist/img'));
});

gulp.task('copy-fonts', function(){
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('copy-bower_fonts', function(){
  return gulp.src(paths.bower_fonts)
    .pipe(gulp.dest('dist/lib'));
});


// Copy all static images
gulp.task('copy-bower_images', function() {
  return gulp.src(paths.bower_images)
    // Pass in options to the task
    //.pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('dist/lib'));
});
/**
 * Watch src
 */
gulp.task('watch', function () {
  gulp.watch([paths.styles, paths.src, paths.js], ['usemin']);
  gulp.watch([paths.images], ['copy-images']);
  gulp.watch([paths.fonts], ['copy-fonts']);
  gulp.watch([paths.bower_fonts], ['copy-bower_fonts']);
  gulp.watch([paths.bower_images], ['copy-bower_images']);
});

gulp.task('webserver', function() {
  connect.server({
    root: 'dist',
    port: 8086,
    livereload: true
  });
});

gulp.task('livereload', function() {
  gulp.src(['dist/**/*.*'])
    .pipe(watch())
    .pipe(connect.reload());
});

/**
 * Compile less
 */
gulp.task('compile-less', function(){
  return gulp.src(paths.styles)
      .pipe(less())
      .pipe(gulp.dest('dist/css'));
});

gulp.task('build', ['usemin', 'copy-assets']);
gulp.task('default', ['build', 'webserver', 'livereload', 'watch']);
