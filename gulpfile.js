'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var autoprefixer = require('gulp-autoprefixer');
var webpack = require('webpack-stream');
var babel = require("babel-core");
var cleanCSS = require('gulp-clean-css');
var imagemin = require('gulp-imagemin');

//локалхост+релоад
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
});

//js с вебпаком для импорта и babel для транспиляции
gulp.task('js', function() {
    return gulp.src('src/js/app.js')
        .pipe(webpack({
            output: {
                filename: 'app.js',
            },
            mode: 'development',
            devtool: 'source-map',
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /(node_modules)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest('public/js'));
});

//js на прод
gulp.task('js-prod', function() {
    return gulp.src('src/js/app.js')
        .pipe(webpack({
            output: {
                filename: 'app.js',
            },
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /(node_modules)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest('public/js'));
});

//css с soursemap
gulp.task('scss', function () {
    return gulp.src('src/scss/app.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/css'))
});

//css на прод с автопрефиксером и минификацией
gulp.task('scss-prod', function () {
    return gulp.src('src/scss/app.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(
            {
                browsers: ['last 7 versions'],
                cascade: false
            }
        ))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('public/css'))
});

//переносим html
gulp.task('html', function () {
    return gulp.src('src/template/**/*')
        .pipe(gulp.dest('public'))
});

//переносим шрифты
gulp.task('fonts', function () {
    return gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('public/fonts'))
});

//минификация картинок
gulp.task('img', function () {
    return gulp.src('src/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('public/img'))
});

//вочер для отслеживания изменений и лайврелоада
gulp.task('watch', function () {
    gulp.watch('src/scss/**/*.scss', gulp.series('scss'));
    gulp.watch('src/scss/**/*.scss').on('change', browserSync.reload);
    gulp.watch('src/template/**/*', gulp.series('html'));
    gulp.watch('src/template/**/*').on('change', browserSync.reload);
    gulp.watch('src/js/**/*.js', gulp.series('js'));
    gulp.watch('src/js/**/*.js').on('change', browserSync.reload);
    gulp.watch('src/img/**/*', gulp.series('img'));
    gulp.watch('src/img/**/*').on('change', browserSync.reload);
});

//таски для дева и прода
gulp.task('start', gulp.parallel('browser-sync', gulp.series('html', 'scss', 'js', 'img', 'fonts', 'watch')));
gulp.task('prod', gulp.series('html', 'scss-prod', 'img', 'fonts', 'js-prod'));