import gulp from 'gulp';
import rename from 'gulp-rename';
import del from 'del';
import browserSync from 'browser-sync';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import inlineSource from 'gulp-inline-source';
import inlineCss from 'gulp-inline-css';
import replace from 'gulp-replace';
import imagemin from 'gulp-imagemin';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import ftp from 'vinyl-ftp';
import mail from 'gulp-mail';
import zip from 'gulp-zip';

import { folderConf, emConf, ftpConf, smtpConf } from './config';

const server = browserSync.create();

const folder = folderConf.folder;

const paths = {
  buildDir: folderConf.folder + '/build/',
  srcDir: folderConf.folder + '/src/',
  distDir: folderConf.folder + '/dist/',
  srcHtml: folderConf.folder + '/src/index.html',
  distHtml: folderConf.folder + '/dist/index.html',
  srcImages: folderConf.folder + '/src/*.{jpg,jpeg,png,gif}',
  distImages: folderConf.folder + '/dist/*.{jpg,jpeg,png,gif}',
  srcStyles: [
    folderConf.folder + '/src/scss/**/*.scss',
    folderConf.folder + '/src/main.scss'
  ],
  distStyles: folderConf.folder + '/dist/main.css'
};

const email = {
  emailUrl: emConf.emailUrl,
  emailDir: emConf.emailDir,
  emailSender: emConf.emailSender,
  emailRecipient: emConf.emailRecipient,
  emailSubject: emConf.emailSubject
};

const conn = ftp.create({
  host: ftpConf.host,
  user: ftpConf.user,
  password: ftpConf.password,
  parallel: ftpConf.parallel
});

const smtp = {
  auth: smtpConf.auth,
  host: smtpConf.host,
  secureConnection: smtpConf.secureConnection,
  port: smtpConf.port
};

const compressFiles = [paths.distHtml, paths.distImages];

const onError = (err) => {
  notify.onError({
    title: folder,
    subtitle: 'Error!',
    message: '<%= error.message %>'
  })(err);
  this.emit('end');
};

// Delete App folder Task
export const clear = () => del([paths.distDir]);

// Styles Task
export function styles() {
  return gulp
    .src(paths.srcStyles)
    .pipe(
      plumber({
        errorHandler: onError
      })
    )
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.distDir))
    .pipe(gulp.dest(paths.srcDir));
}

// Compress Images Task
export function images() {
  return gulp
    .src(paths.srcImages, {
      since: gulp.lastRun(images)
    })
    .pipe(
      plumber({
        errorHandler: onError
      })
    )
    .pipe(
      imagemin({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true,
        svgoPlugins: [
          {
            removeViewBox: false
          }
        ]
      })
    )
    .pipe(gulp.dest(paths.distDir));
}

// Html inline style Task
export function htmlinline() {
  return gulp
    .src(paths.srcHtml)
    .pipe(
      plumber({
        errorHandler: onError
      })
    )
    .pipe(inlineSource())
    .pipe(
      inlineCss({
        preserveMediaQueries: true,
        distlyWidthAttributes: true
      })
    )
    .pipe(gulp.dest(paths.distDir));
}

// Html absolute url for test email Task
export function htmlreplace() {
  return gulp
    .src(paths.distHtml)
    .pipe(
      plumber({
        errorHandler: onError
      })
    )
    .pipe(replace('url("', 'url("' + email.emailUrl))
    .pipe(replace("url('", "url('" + email.emailUrl))
    .pipe(replace('src="', 'src="' + email.emailUrl))
    .pipe(replace('background="', 'background="' + email.emailUrl))
    .pipe(rename('mail.html'))
    .pipe(gulp.dest(paths.distDir));
}

// FTP Upload Task
export function upload() {
  return gulp
    .src(paths.distDir + '**', {
      buffer: false
    })
    .pipe(
      plumber({
        errorHandler: onError
      })
    )
    .pipe(conn.dest(email.emailDir));
}

// Sendmail Task
export function sendmail() {
  return gulp.src(paths.distDir + 'mail.html').pipe(
    mail({
      subject: email.emailSubject,
      to: [email.emailRecipient],
      from: email.emailSender,
      smtp: smtp
    })
  );
}

// Compress in zip Task
function compress() {
  return gulp
    .src(compressFiles)
    .pipe(
      plumber({
        errorHandler: onError
      })
    )
    .pipe(zip(folder + '.zip'))
    .pipe(gulp.dest(paths.buildDir));
}

// BrowserSync Reload Task
function reload(done) {
  server.reload();
  done();
}

// BrowserSync Serve Task
function serve(done) {
  server.init({
    server: {
      baseDir: paths.srcDir
    },
    open: false,
    notify: false
  });
  done();
}

// Watch Task
function watch() {
  gulp.watch(paths.srcStyles, gulp.series(styles, reload));
  gulp.watch(paths.srcImages, gulp.series(images, reload));
  gulp.watch(paths.srcHtml, gulp.series(htmlinline, htmlreplace, reload));
}

const dev = gulp.series(
  clear,
  styles,
  images,
  htmlinline,
  htmlreplace,
  serve,
  watch
);
gulp.task('dev', dev);

const build = gulp.series(styles, images, htmlinline, htmlreplace, compress);
gulp.task('build', build);

const deploy = gulp.series(styles, images, htmlinline, htmlreplace, upload);
gulp.task('deploy', deploy);

const send = gulp.series(
  styles,
  images,
  htmlinline,
  htmlreplace,
  upload,
  sendmail
);
gulp.task('send', send);

export default dev;
