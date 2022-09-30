'use strict';

const
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    clean = require('gulp-clean'),
    merge = require('merge-stream'),
    path = require('path'),
    run = require('gulp-run'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    tsify = require('tsify'),
    sourcemaps = require('gulp-sourcemaps'),
    jsonMinify = require('gulp-json-minify'),
    htmlmin = require('gulp-htmlmin'),
    sass = require('gulp-sass')(require('sass')),
    cleanCSS = require('gulp-clean-css')
;

const config = {
    srcBase: 'src',

    modules: [
        { src: "src/background.ts", bundle: "background.js" },
        { src: "src/popup/ui.ts", bundle: "popup/ui.js" }
    ],

    jsonGlob: 'src/**/*.json',
    imageGlob: 'src/icons/**/*',
    htmlGlob: 'src/popup/**/*.html',
    sassGlob: 'src/**/*.sass',

    buildDir: './build'
}

function js(watch) {
    return merge(config.modules.map((module => {
        let bundler = browserify({
            basedir: '.',
            debug: true,
            entries: module.src,
            cache: {},
            packageCache: {}
        });
    
        bundler.plugin(tsify);
    
        if (watch) {
            bundler.plugin(watchify, {
                delay: 100,
                ignoreWatch: ['**/note_mdoules/**'],
                poll: 250
            });
    
            watches.push(bundler);
        }
    
        bundler.on('update', function(){
            bundle(bundler, module);
        });
    
        bundler.on('log', function(msg) {
            gutil.log(msg);
        });
    
        return bundle(bundler, module);
    })));
}

function bundle(bundler, module) {
    return bundler
        .bundle()
        .pipe(source(module.bundle))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.buildDir));
}


let watches = [];


gulp.task('img', function () {
    return gulp
        .src(config.imageGlob, { base: config.srcBase })
        .pipe(gulp.dest(config.buildDir))
        .on('error', gutil.log);   
});
gulp.task('img:watch', function () {
    return watches.push(gulp.watch([config.imageGlob], gulp.parallel('img')));
});


gulp.task('js', function () { return js(false) });
gulp.task('js:watch', function () { return js(true) });


gulp.task('json', function() {
    return gulp
        .src(config.jsonGlob, { base: config.srcBase })
        .pipe(jsonMinify())
        .pipe(gulp.dest(config.buildDir))
        .on('error', gutil.log);
});
gulp.task('json:watch', function () {
    return watches.push(gulp.watch([config.jsonGlob], gulp.parallel('json')));
});


gulp.task('html', function () {
    return gulp
        .src(config.htmlGlob, { base: config.srcBase })
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true, caseSensitive: true }))
        .pipe(gulp.dest(config.buildDir));
});
gulp.task('html:watch', function () {
    return watches.push(gulp.watch(config.htmlGlob, gulp.parallel('html')));
});


gulp.task('style', function () {
    return gulp
        .src(config.sassGlob, { base: config.srcBase })
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS({compatibility: '*'}))
        .pipe(gulp.dest(config.buildDir));
});
gulp.task('style:watch', function () {
    return watches.push(gulp.watch(config.sassGlob, gulp.parallel('style')));
});


gulp.task('run', function (cb) {
    run('npm run start:firefox -- --bc -u file:///' + path.resolve('./test/dates.html')).exec(function () {
        for (let watch of watches) {
            watch.close();
        }
    
        cb();
    });
});


gulp.task('pack', function () { return run('npm run pack').exec() });
gulp.task('lint', function () { return run('npm run lint').exec() });
gulp.task('clean', function () {
    return gulp
        .src(config.buildDir, {read:false})
        .pipe(clean());
});
gulp.task('watch', gulp.parallel('js:watch', 'json:watch', 'img:watch', 'html:watch', 'style:watch', 'run'));
gulp.task('default', gulp.parallel('js', 'json', 'img', 'html', 'style'));
