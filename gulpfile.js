(function() {
  'use strict';

  var gulp     = require('gulp'),           // build system, task automation
      mocha    = require('gulp-mocha'),     // Node.js test runner
      jshint   = require('gulp-jshint'),    // JS Code Quality, detect errors
      stylish  = require('jshint-stylish'), // report for jshint
      jscs     = require('gulp-jscs'),      // JSCodeStyle, enforces style guide
      gulpUtil = require('gulp-util');      // useful gulp commands

  gulp.task('default', ['mocha', 'watch']);

  gulp.task('watch', function () {
    gulp.watch(['test/**/*.js', 'lib/**/*.js'], ['mocha']);
  });

  gulp.task('lint', function () {
    return gulp.src(['lib/**/*.js', 'test/**/*.js'])
               .pipe(jshint())
               .pipe(jshint.reporter('jshint-stylish'))
               .pipe(jscs({configPath: '.jscsrc'}));
  });

  // we specify jshint inside of the second param here rather
  // than in our default or watch tasks array in order to make sure
  // that jshint runs before mocha and not concurrently
  // which would frequently result in the jshint task finishing while
  // mocha was outputting test results and would therefore interrupt
  // mocha's output
  gulp.task('mocha', ['lint'], function () {
    return gulp.src(['lib/**/*.spec.js', 'test/**/*.js'], {read: false})
               .pipe(mocha({ reporter: 'spec' }))
               .on('error', gulpUtil.log);
  });
})();
