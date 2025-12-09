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

export function fontAwesome() {
    return gulp.src([
        'node_modules/@fortawesome/fontawesome-free/webfonts/**'
    ]).pipe(copy('dist/assets/webfonts', { prefix: 4 }));
};

export function vazirmatnFont() {
    return gulp.src([
        'node_modules/vazirmatn/**',
    ]).pipe(
        copy('dist/assets/fonts/vazirmatn', { prefix: 4 })
    );
};

export function plugins() {
    return gulp.src([
        'node_modules/sortablejs/**',
    ], { base: './node_modules/' }).pipe(copy('dist/assets/plugins', { prefix: 1 }));
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

export function build() {
    gulp.series(
        html,
        cssApp,
        plugins,
        jsApp,
        fontAwesome,
        vazirmatnFont,
    );
}

export default gulp.series(
    html,
    cssApp,
    plugins,
    jsApp,
    fontAwesome,
    vazirmatnFont,
    gulp.parallel(watch, webserver)
);