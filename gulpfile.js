var gulp = require('gulp');
var browser = require('browser-sync');
var panini = require('panini');
var port = process.env.SERVER_PORT || 8080;
var rimraf = require('rimraf').sync;
var postcss = require('gulp-postcss');


// Starts a BrowerSync instance
gulp.task('server', ['build'], function () {
  browser.init({ server: './_site/', port: port });
});

// Watch files for changes
gulp.task('watch', function () {
  gulp.watch('images/**/*', ['copy-images', browser.reload]);
  gulp.watch('html/pages/**/*', ['compile-html']);
  gulp.watch(['html/{layouts,includes,helpers,data}/**/*'], ['compile-html:reset', 'compile-html']);
  gulp.watch(['./src/{layouts,partials,helpers,data}/**/*'], [panini.refresh]);
});

// Erases the dist folder
gulp.task('reset', function () {
  rimraf('assets/css/*');
  rimraf('assets/fonts/*');
  rimraf('images/*');
});

// Erases the dist folder
gulp.task('clean', function () {
  rimraf('_site');
});

// Copy static assets
gulp.task('copy', function () {
  gulp.src(['assets/css/icons.min.css']).pipe(gulp.dest('_site/assets/css/'));
  gulp.src(['assets/css/*.css']).pipe(gulp.dest('_site/assets/css/'));
  gulp.src(['assets/images/*']).pipe(gulp.dest('_site/assets/images/'));
  gulp.src(['assets/webfonts/*']).pipe(gulp.dest('_site/assets/webfonts/'));
  //Copy other external font and data assets
  gulp.src(['assets/fonts/**/*']).pipe(gulp.dest('_site/assets/fonts/'));
});


// Compile Html
gulp.task('compile-html', function () {
  gulp.src('html/pages/**/*.html')
    .pipe(panini({
      root: 'html/pages/',
      layouts: 'html/layouts/',
      partials: 'html/includes/',
      helpers: 'html/helpers/',
      data: 'html/data/'
    }))
    .pipe(gulp.dest('_site'))
    .on('finish', browser.reload);
});

gulp.task('css', function () {

  return gulp.src('src/input.css')
    // ...
    .pipe(postcss([
      // ...
      require('tailwindcss'),
      require('autoprefixer'),
      // ...
    ]))
    // ...
    .pipe(gulp.dest('./_site/assets/css/ou.css'))
})

gulp.task('cssprod', function () {

  const purgecss = require('@fullhuman/postcss-purgecss')({

    // Specify the paths to all of the template files in your project 
    content: [
      './_site/*.html',
      // etc.
    ],

    // Include any special characters you're using in this regular expression
    defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
  })

  return gulp.src('assets/css/style.css')
    // ...
    .pipe(postcss([
      // ...
      require('tailwindcss'),
      require('autoprefixer'),
      purgecss
      // ...
    ]))
    // ...
    .pipe(gulp.dest('./_site/assets/css/'))
})

gulp.task('compile-html:reset', function (done) {
  panini.refresh();
  done();
});

//Copy images to production site
gulp.task('copy-images', function () {
  gulp.src('assets/images/**/*')
    .pipe(gulp.dest('./_site/assets/images/'));
});

gulp.task('build', ['clean', 'copy', 'compile-html', 'copy-images', 'cssprod']);
gulp.task('default', ['server', 'watch']);
