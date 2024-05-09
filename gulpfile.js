"use strict";

const gulp = require('gulp');
const sass = require('gulp-sass');
const fileinclude = require('gulp-file-include');
const connect = require('gulp-connect');
const imagemin = require('gulp-imagemin');
const spritesmith = require('gulp.spritesmith');
const shorthand = require('gulp-shorthand');
const autoprefixer = require('gulp-autoprefixer');
const minifyCSS = require('gulp-minify-css');
const sftp = require('gulp-sftp');


var scss_path = ['scss/*.scss', 'scss/*/*.scss'],
  inc_file = 'template/*.html',
  template_file = 'template/include/*.html',
  img_file = 'images/*',
  img_file_sprite = 'images/icon/*.*',
  forDeploy = ['*.html', 'js/*', 'css/*', 'scss/*', 'template/*', img_file];


gulp.task('deploy', function (done) {
  return gulp.src([
    '*/*/*', '*/*', '*', '!node_modules', '!*.zip', '!node_modules/**'
  ])
    .pipe(sftp({
      host: 'h6.netangels.ru',
      auth: 'keyMain',
      port: '22',
      remotePath: '/home/c7083/live66.ru/www/strana'
    }));

  done();
});

gulp.task('compress', function (done) {
  gulp.src(img_file)
    .pipe(imagemin(img_file_sprite))
    .pipe(gulp.dest('images/'));

  done();
});

gulp.task('sprite', function (done) {
  var spriteData =
    gulp.src(img_file_sprite)
      .pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: '_sprite.scss',
        padding: 5
      }));

  spriteData.img.pipe(gulp.dest('./images/'));
  spriteData.css.pipe(gulp.dest('./scss/'));

  done();
});


gulp.task('connect', function (done) {
  connect.server({
    port: 3000,
    root: '',
    livereload: true
  });

  done();
});

gulp.task('sass', function (done) {
  gulp.src(scss_path)
    .pipe(sass().on('error', sass.logError))
    .pipe(shorthand())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('css/'))
    .pipe(connect.reload());

  done();
});

gulp.task('include', function (done) {
  gulp.src([inc_file])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(connect.reload())
    .pipe(gulp.dest('./'));

  done();
});

gulp.task('js', function (done) {
  gulp.src('js/*.js') // path to your files
    .pipe(connect.reload());
  done();

});

gulp.task('watch', function (done) {
  connect.server({
    port: 3000,
    root: '',
    livereload: true
  });

  gulp.watch([inc_file, template_file], gulp.series('include'));
  gulp.watch(scss_path, gulp.series('sass'));
  gulp.watch([img_file_sprite], gulp.series('sprite'));
  gulp.watch(['js/*.js', 'js/libs/*.js'], gulp.series('js'));
  done();
});

gulp.task('default', gulp.series('watch'));


