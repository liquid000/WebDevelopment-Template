const gulp = require('gulp');
const sass = require('gulp-sass'); // -Sassコンパイル
const plumber = require('gulp-plumber'); // -エラー時の強制終了を防止
const notify = require('gulp-notify'); // -エラー発生時にデスクトップ通知する
const sassGlob = require('gulp-sass-glob'); // -@importの記述を簡潔にする
const browserSync = require('browser-sync'); // -ブラウザ反映
const postcss = require('gulp-postcss'); // -autoprefixerとセット
const cssdeclsort = require('css-declaration-sorter'); // -css並べ替え
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const rename = require('gulp-rename'); // -.ejsの拡張子を変更
const browserify = require('browserify'); // -requireを解決
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify'); // -jsをmin化
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');

// srcのindex.htmlを配布用のdistへ複製
gulp.task('duplicate-html', function () {
  return gulp.src(['src/*.html'])
    .pipe(gulp.dest('dist'));
})

// requireの解決、配布jsの作成
gulp.task('js-compile', function () {
  return browserify({
      basedir: '.',
      debug: true,
      entries: ['src/js/main.js'],
      cache: {},
      packageCache: {}
    }).bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/scripts'));
})

// scssのコンパイル
gulp.task('sass', function () {
  return gulp
    .src('./src/scss/*.scss')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>'),
    })) // -エラーチェック
    .pipe(sassGlob()) // -importの読み込みを簡潔にする
    .pipe(sass({
      outputStyle: 'expanded', // -expanded, nested, campact, compressedから選択
    }))
    .pipe(postcss([cssdeclsort({
      order: 'alphabetically',
    })])) // -プロパティをソートし直す(アルファベット順)
    .pipe(gulp.dest('./src/css')); // -コンパイル後の出力先
});

// 保存時のリロード
gulp.task('browser-sync', function (done) {
  browserSync.init({
    // -ローカル開発
    server: {
      baseDir: './dist/',
      index: 'index.html',
    },
  });
  done();
});

gulp.task('bs-reload', function (done) {
  browserSync.reload();
  done();
});

gulp.task('ejs', (done) => {
  gulp
    .src(['ejs/**/*.ejs', '!' + 'ejs/**/_*.ejs'])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>'),
    })) // -エラーチェック
    .pipe(rename({
      extname: '.html',
    })) // -拡張子をhtmlに
    .pipe(gulp.dest('./')); // -出力先
  done();
});

// -配布用コンパイルタスク
gulp.task('release', gulp.series(gulp.parallel('duplicate-html', 'js-compile')))

// 監視
gulp.task('watch', function () {
  gulp.watch('./src/scss/*.scss', gulp.task('sass')); // -sassが更新されたらgulp sassを実行
  gulp.watch('./src/scss/*.scss', gulp.task('bs-reload')); // -sassが更新されたらbs-reloadを実行
  gulp.watch('./src/js/*.js', gulp.task('release')); // -jsが更新されたらjsをrelease処理
  gulp.watch('./src/js/*.js', gulp.task('bs-reload')); // -jsが更新されたらbs-relaodを実行

  gulp.watch('./ejs/**/*.ejs', gulp.task('ejs')); // -ejsが更新されたらgulp-ejsを実行
  gulp.watch('./ejs/**/*.ejs', gulp.task('bs-reload')); // -ejsが更新されたらbs-reloadを実行

  gulp.watch('./src/index.html', gulp.task('release')); //-index.htmlが更新されたらjsをrelease処理
  gulp.watch('./src/index.html', gulp.task('bs-reload')); //-index.htmlが更新されたらbs-reloadを実行
});


// -defaultのタスク定義(実行コマンド=>gulp)
gulp.task('default', gulp.series(gulp.parallel('release', 'browser-sync', 'watch')));

// -圧縮率の定義
const imageminOption = [
  pngquant({
    quality: [70 - 85],
  }),
  mozjpeg({
    quality: 85,
  }),
  imagemin.gifsicle({
    interlaced: false,
    optimizationLevel: 1,
    colors: 256,
  }),
  imagemin.jpegtran(),
  imagemin.optipng(),
  imagemin.svgo(),
];
// -画像の圧縮
// -$ gulp imageminで./src/img/base/フォルダ内の画像を圧縮し./src/img/フォルダへ
// -.gifが入っているとエラーが出る
gulp.task('imagemin', function () {
  return gulp
    .src('./src/img/base/*.{png,jpg,gif,svg}')
    .pipe(imagemin(imageminOption))
    .pipe(gulp.dest('./src/img'));
});
