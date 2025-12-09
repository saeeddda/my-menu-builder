import gulp from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import minifyCSS from 'gulp-clean-css';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import livereload from 'gulp-livereload';
import connect from 'gulp-connect';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import fileinclude from 'gulp-file-include';
import autoprefixer from 'gulp-autoprefixer';
import copy from 'gulp-copy';

const sass = gulpSass(dartSass);

export function html() {
    return gulp.src(['src/html/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
            rootPath: './'
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(livereload());
};

export function cssApp() {
    return gulp.src([
        'src/assets/scss/styles.scss'
    ])
        .pipe(sourcemaps.init())
        .pipe(sass({ includePaths: ['node_modules'] }).on('error', sass.logError))
        .pipe(concat('styles.min.css'))
        .pipe(autoprefixer())
        .pipe(minifyCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/assets/css/'))
        .pipe(livereload());
};

export function jsApp() {
    return gulp.src([
        'src/assets/js/menu-builder.js',
    ])
        .pipe(uglify())
        .pipe(rename('menu-builder.min.js'))
        .pipe(gulp.dest('dist/assets/js'))
        .pipe(livereload())
};

export function jsVendor() {
  return gulp.src([
			'node_modules/sortablejs/Sortable.min.js',
		])
		.pipe(sourcemaps.init())
		.pipe(concat('vendor.min.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/assets/js'))
		.pipe(livereload())
};

export function copyFontawesomeWebfonts() {
    return gulp.src([
        'node_modules/@fortawesome/fontawesome-free/webfonts/**',
    ]).pipe(copy('dist/assets/fonts/webfonts', { prefix: 4 }));
};

export function copyFontawesomeCssJs() {
    return gulp.src([
        'node_modules/@fortawesome/fontawesome-free/css/all.min.css',
        'node_modules/@fortawesome/fontawesome-free/js/all.min.js',
    ]).pipe(copy('dist/assets/fonts/fontawesome', { prefix: 4 }));
};

export function copyVazirmatnWebfonts() {
    return gulp.src([
        'node_modules/vazirmatn/fonts/webfonts/**',
    ]).pipe(
        copy('dist/assets/fonts/vazirmatn/fonts/webfonts', { prefix: 4 })
    );
};

export function copyVazirmatnCss() {
    return gulp.src([
        'node_modules/vazirmatn/Vazirmatn-font-face.css',
    ]).pipe(
        copy('dist/assets/fonts/vazirmatn', { prefix: 4 })
    );
};

export function watch() {
    livereload.listen();

    //Watch html files changes
    gulp.watch('src/html/*.html', gulp.series(html));
    gulp.watch('src/html/*/*.html', gulp.series(html));
    //Watch style files changes
    gulp.watch('src/assets/scss/*.scss', gulp.series(cssApp));
    gulp.watch('src/assets/scss/*/*.scss', gulp.series(cssApp));
    //Watch script files changes
    gulp.watch('src/assets/js/*.js', gulp.series(jsApp));
};

export function webserver() {
    connect.server({
        name: 'Menu Builder',
        root: ['./dist/'],
        port: 8585,
        livereload: true,
        fallback: 'index.html'
    });
};

export default gulp.series(
    html,
    cssApp,
    jsVendor,
    jsApp,
    copyFontawesomeWebfonts,
    copyFontawesomeCssJs,
    copyVazirmatnWebfonts,
    copyVazirmatnCss,
    gulp.parallel(watch, webserver)
);