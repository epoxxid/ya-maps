const { dest } = require('gulp');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const rename = require('gulp-rename');
const sourceMaps = require('gulp-sourcemaps');

const config = {
    js: {
        inputFile: 'src/YaMap.js',
        outputName: 'map.js',
        outputDir: './dist/',
        mapsDir: './maps/'
    }
};

function bundle(bundler) {
    bundler.bundle()
        .pipe(source(config.js.inputFile))
        .pipe(buffer())
        .pipe(rename(config.js.outputName))
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(sourceMaps.write(config.js.mapsDir))
        .pipe(dest(config.js.outputDir));
}

function build(cb) {

    let bundler = browserify(config.js.inputFile)
        .transform(babelify);

    bundle(bundler);

    cb();
}


exports.build = build;