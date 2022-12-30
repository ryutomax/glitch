"use strict";

//----------------------------------------------------------------------
//  モジュール読み込み
//----------------------------------------------------------------------
const gulp = require("gulp");
const { src, dest, watch, series, parallel } = require("gulp");

const sassGlob = require("gulp-sass-glob-use-forward");
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqPacker = require('css-mqpacker');
const purgecss = require("gulp-purgecss");
const cleancss = require("gulp-clean-css");

const ejs = require('gulp-ejs');                       //EJS
const htmlBeautify = require("gulp-html-beautify");    //HTML生成後のコードを綺麗にする

const browserSync = require("browser-sync").create();  //変更を即座にブラウザへ反映
const uglify = require("gulp-uglifyes");               //jsファイル圧縮用 ES6でも可

const webpackStream = require("webpack-stream");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config");     // webpackの設定ファイルの読み込み

const plumber = require("gulp-plumber");
const notify = require("gulp-notify");                 //デスクトップ通知
const rename = require('gulp-rename');                 //ファイル出力時にファイル名を変える

// ========================================
// ** path
// ========================================
const srcPath = {
  'scss': './src/scss/**/*.scss',
  'img': './src/images/**/*',
  'js': './src/js/**/*.js',
  'ejs': './src/ejs/**/*.ejs',
  'Ejs': '!./src/ejs/include/*.ejs',

};
const distPath = {
  'css': './dist/assets/css',
  'html':'./dist/**/*.html',
  'img': './dist/assets/images',
  'js': './dist/assets/js/nonBundle',
  'item': './dist',
};



// ========================================
// ** webpack連携
// ========================================
const webpackTask = () => {
  return webpackStream(webpackConfig, webpack)
    .pipe(dest("./dist/assets/js/"));
}

// ========================================
// ** js copy
// ========================================
const jsFunc = () => {
  return src('./src/js/nonBundle/*.js')
    .pipe(uglify())
    .pipe(rename({
          extname: '-min.js'
    }))
    .pipe(dest(distPath.js))
}

// ========================================
// ** ejs
// ========================================

const ejsFunc = () => {
  return src([
    srcPath.ejs,
    srcPath.Ejs
  ])
    .pipe(ejs({}, {}, {ext: '.html'}))
    .pipe(htmlBeautify({
      "indent_size": 2,
      "indent_char": " ",
      "max_preserve_newlines": 0,
      "preserve_newlines": false,
      "extra_liners": [],
    }))
    // .pipe(ejsLint({}))
    .pipe(rename({
      // dirname: "", // ディレクトリ名
      basename: 'index', //ファイル名
      extname: '.html' //拡張子
    }))
    .pipe(notify({
    message: 'ejs compile completely!', //通知コメント
    onLast: true
  }))
    .pipe(dest('./dist'))
}
// ========================================
// ** Sass
// ========================================
const cssSass = () => {
  return src(srcPath.scss)
  .pipe( plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }) )                                  // watch中にエラーが発生してもwatchが止まらないようにする
  .pipe( sassGlob() )                                 // glob機能
  .pipe( sass({
    includePaths: ['./scss/']                         // sassコンパイル
  }))
  .pipe(postcss([
    autoprefixer({}),                                 //package.jsonにブラウザリスト記載
    mqPacker({ sort: true }),                         //メディアクエリまとめる
  ]))
  .pipe(purgecss({                                    //未使用のスタイルを削除
    content: [srcPath.js, srcPath.ejs, srcPath.Ejs],  //src()のファイルで使用される可能性のあるファイルを全て指定
    }))
  .pipe(cleancss())                                   //コード内の不要な改行やインデントを削除
  .pipe(rename({
    extname: '-min.css'
  }))
  .pipe(notify({
    message: 'Sass compile completely!',              //通知コメント
    onLast: true
  }))
  .pipe(dest("./dist/assets/css/"));
}

// ========================================
// img最適化
// ========================================

const imageMin = require("gulp-imagemin");              // npm i -D gulp-imagemin@7.1.0
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");
const changed = require("gulp-changed");

const imgMin = () => {
  return src(srcPath.img)
  .pipe(changed("./dist/assets/images/"))
  .pipe(
    imageMin([
      pngquant({
          quality: [0.6, 0.7],
          speed: 1,
      }),
      mozjpeg({ quality: 65 }),
      imageMin.svgo(),
      imageMin.optipng(),
      imageMin.gifsicle({ optimizationLevel: 3 }),
    ])
  )
  .pipe(notify({
    message: 'image minify completely!',
    onLast: true
  }))
  .pipe(dest(distPath.img));
}

// ========================================
// **ローカルサーバー起動
// ========================================
const buildServer = () => {
  browserSync.init({
    server: './dist/',
    port: 8080,
    ui: false,
  });
}

/* リロード */
const browserReload = (done) => {
  browserSync.reload();
  done();
}

// ========================================
// ** watch管理
// ========================================
const watchTask = () => {
  watch(srcPath.ejs, parallel(ejsFunc, browserReload));
  watch(srcPath.img, parallel(imgMin, browserReload));
  watch(srcPath.scss, series(cssSass, browserReload));
  watch(srcPath.js, parallel(jsFunc, browserReload));
  watch(srcPath.js, series(webpackTask, browserReload));

}

// =========================
// ** parallel：並列処理
// =========================
exports.w = parallel(watchTask);
exports.def = parallel(watchTask, buildServer);