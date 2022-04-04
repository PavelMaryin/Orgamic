let projectFolder = "dist"; //создаем папку для выгрузки проекта
// let projectFolder = require("path").basename(__dirname); //название итоговой папки с как название корневой папки
let sourceFolder = "src"; // создаем папку с исходниками

let fs = require('fs');     // подключение шрифтов


// пути к файлам и папкам
let path = {
  // куда выкидываются готовые файлы проекта
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/css/",
    js: projectFolder + "/js/",
    img: projectFolder + "/img/",
    fonts: projectFolder + "/fonts/",
  },

  // папки с исходниками
  src: {
    html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"], // тут создан массив, второй агрумент исключает файлы с подчеркиванием
    css: sourceFolder + "/scss/style.scss",
    js: sourceFolder + "/js/main.js",
    img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: sourceFolder + "/fonts/*.ttf",
  },

  // команда прослушивания изменений
  watch: {
    html: sourceFolder + "/**/*.html",
    css: sourceFolder + "/scss/**/*.scss",
    js: sourceFolder + "/js/**/*.js",
    img: sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  // команда удаляющая объекты
  clean: "./" + projectFolder + "/"
}

// команда, запускающая gulp
let { src, dest } = require('gulp'),
  gulp            = require('gulp'),
  browsersync     = require('browser-sync').create(),        // тут создал переменную
  fileinclude     = require('gulp-file-include'),            // делает вложенность в html
  del             = require('del'),                          // удаляет папку dist перед обновлением сборки
  scss            = require('gulp-sass')(require('sass')),
  autoprefixer    = require('gulp-autoprefixer'),
  groupmedia      = require('gulp-group-css-media-queries'), // собирает по css медиазапросы
  cleancss        = require('gulp-clean-css');               // чистит и собирает css на выходе
  rename          = require('gulp-rename'),                  // дополнительный css фаил не сжатый
  uglify          = require('gulp-uglify-es').default,       // минификатор js файлов
  imagemin        = require('gulp-imagemin'),                // сжатие картинок
  webp            = require('gulp-webp'),                    // сжатие картинок в webp
  webphtml        = require('gulp-webp-html'),               // для подстановки в финальный htmp два формата изображения
  webpcss         = require('gulp-webpcss'),                 // для подставновки в css два формата изображения. Что бы заработал, дополнительно нужно установить npm i --save-dev webp-converter@2.2.3
  svgSprite       = require('gulp-svg-sprite'),              // спрайты
  ttf2woff        = require('gulp-ttf2woff'),                // конвертация шрифтов ttf>woff
  ttf2woff2       = require('gulp-ttf2woff2'),               // конвертация шрифтов ttf>woff2
  fonter          = require('gulp-fonter');                  // конвертация шрифтовов otf


// создаю функцию для обновления страницы, название должно отличаться от переменной
function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + projectFolder + "/"
    },
    port: 3000,
    notify: false, //убрать сообщение об обновлении страницы
  })
}

function clean(params) {
  return del(path.clean);
}

// функция для работы с html файлами, создание html
function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}


function fonts() {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}


gulp.task('svgSprite', function () {                       // запускается по требованию командой gulp svgSprite 
  return gulp.src([sourceFolder + '/iconsprite/*.svg'])   // папка, из которой забираются svg
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../icon/icon.svg",   // название файла выгрузки
          example: true              // создается html фаил с примерами иконок
        }
      },
    }
    ))
    .pipe(dest(path.build.img))         // место создание файла  
})

gulp.task('otf2ttf', function () {
  return gulp.src([sourceFolder + '/fonts/*.otf'])
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest(sourceFolder + '/fonts/'));
})


function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70
      }))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3  // от 0 до 7
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}


function js() {
  return src(path.src.js)
    .pipe(fileinclude())              //  включение кода из других фалов
    .pipe(dest(path.build.js))        // выгрузка, не минифицированного
    .pipe(uglify())                   // минификатор js файлов
    .pipe(rename({                    // переименование файла
      extname: ".min.js"
    }))
    .pipe(dest(path.build.js))        // выгрузка, сохранение
    .pipe(browsersync.stream())
}


function css() {                      // эта функция работает последовательно, сверху вниз по порядку
  return src(path.src.css)            // тут функция получает исходники для обработки
    .pipe(                          // обратотка scss
      scss({
        outputStyle: "expanded"     // не минифицировать
      })
    )
    .pipe(groupmedia())             // группировка медиазапросы
    .pipe(                          // добавление префиксов
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    .pipe(webpcss())                 // интеграция изображений webp в итоговый фаил css 
    .pipe(dest(path.build.css))      // выгружаем/сохраняем несжатый css  
    .pipe(cleancss())                // минифицируем css
    .pipe(rename({                   // переменовываем css фаил
      extname: ".min.css"
    }))
    .pipe(dest(path.build.css))      // тут функция выбыриет место, куда будет сохранен обработанный фаил
    .pipe(browsersync.stream())      // browsersynk обновляет браузер с новыми совойствами
}

function fontsStyle(params) {

  let file_content = fs.readFileSync(sourceFolder + '/scss/fonts.scss');
  if (file_content == '') {
    fs.writeFile(sourceFolder + '/scss/fonts.scss', '', cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(sourceFolder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
          }
          c_fontname = fontname;
        }
      }
    })
  }
}

function cb() {   // функция callback

}

// функция слежения за файлами
function watchFiles(params) {
  gulp.watch([path.watch.html], html); //тут в скобках путь . слежение . фаил, за которым слежение
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}



let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle);   // сценарии выполнения series  - выполнение синхронно, т.е. последовательно
let watch = gulp.parallel(build, watchFiles, browserSync);  // сценарии выполнения, паралел - т.е. они выполняются асинхронно

exports.fontsStyle  = fontsStyle;
exports.fonts       = fonts;
exports.images      = images;
exports.js          = js;
exports.css         = css;
exports.html        = html;
exports.build       = build;
exports.watch       = watch;
exports.default     = watch;
exports.clean       = clean;