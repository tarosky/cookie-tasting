const gulp = require( 'gulp' ),
  $ = require( 'gulp-load-plugins' )(),
  webpack       = require( 'webpack-stream' ),
  webpackBundle = require( 'webpack' ),
  named         = require( 'vinyl-named' );


// Package js.
gulp.task( 'js', function() {
  const tmp = {};
  return gulp.src([ './src/js/**/*.js' ])
    .pipe( $.plumber({
      errorHandler: $.notify.onError( '<%= error.message %>' )
    }) )
    .pipe( named() )
    .pipe( $.rename( function( path ) {
      tmp[path.basename] = path.dirname;
    }) )
    .pipe( webpack({
      mode: 'production',
      devtool: 'source-map',
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    { 'useBuiltIns': 'usage' }
                  ]
                ],
                plugins: [ '@babel/plugin-transform-react-jsx' ]
              }
            }
          }
        ]
      }
    }, webpackBundle ) )
    .pipe( $.rename( function( path ) {
      if ( tmp[path.basename]) {
        path.dirname = tmp[path.basename];
      } else if ( '.map' === path.extname && tmp[path.basename.replace( /\.js$/, '' )]) {
        path.dirname = tmp[path.basename.replace( /\.js$/, '' )];
      }
      return path;
    }) )
    .pipe( gulp.dest( './assets/js' ) );
});


// ES Lint
gulp.task( 'eslint', function() {
  return gulp.src([ 'src/**/*.js' ])
    .pipe( $.eslint({ useEslintrc: true }) )
    .pipe( $.eslint.format() );
});

// watch
gulp.task( 'watch', function() {

  // Handle JS
  gulp.watch([ 'src/js/**/*.js' ], gulp.parallel( 'js', 'eslint' ) );
});

// Build
gulp.task( 'build', gulp.parallel( 'js', 'eslint' ) );

// Default Tasks
gulp.task( 'default', gulp.series( 'watch' ) );
