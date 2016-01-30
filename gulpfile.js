var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

var replace = require('replace');
var replaceFiles = ['./www/js/app.js'];

gulp.task('add-proxy', function() {
  replace({
    regex: "http://sandbox.sun.bikeonet.hu/~spike/lifeoftbc/json.php",
    replacement: "http://localhost:8100/json.php",
    paths: replaceFiles,
    recursive: false,
    silent: false,
  });
  replace({
    regex: "http://sandbox.sun.bikeonet.hu/~spike/lifeoftbc/public.php",
    replacement: "http://localhost:8100/public.php",
    paths: replaceFiles,
    recursive: false,
    silent: false,
  });
  replace({
    regex: "http://sandbox.sun.bikeonet.hu/~spike/lifeoftbc/server.php",
    replacement: "http://localhost:8100/server.php",
    paths: replaceFiles,
    recursive: false,
    silent: false,
  });
  return replace({
    regex: "http://meztelen.hu/asset/exifinfo",
    replacement: "http://localhost:8100/exif.php",
    paths: replaceFiles,
    recursive: false,
    silent: false,
  });
});

gulp.task('remove-proxy', function() {
  replace({
    regex: "http://localhost:8100/json.php",
    replacement: "http://sandbox.sun.bikeonet.hu/~spike/lifeoftbc/json.php",
    paths: replaceFiles,
    recursive: false,
    silent: false,
  }); 
  replace({
    regex: "http://localhost:8100/public.php",
    replacement: "http://sandbox.sun.bikeonet.hu/~spike/lifeoftbc/public.php",
    paths: replaceFiles,
    recursive: false,
    silent: false,
  }); 
  replace({
    regex: "http://localhost:8100/server.php",
    replacement: "http://sandbox.sun.bikeonet.hu/~spike/lifeoftbc/server.php",
    paths: replaceFiles,
    recursive: false,
    silent: false,
  }); 
  return replace({
    regex: "http://localhost:8100/exif.php",
    replacement: "http://meztelen.hu/asset/exifinfo",
    paths: replaceFiles,
    recursive: false,
    silent: false,
  });
});

gulp.task('ioswidget', function() {
    gulp.src('./LifeOfTbc2Widget/**/*')
    .pipe(gulp.dest('./platforms/ios'));
});
