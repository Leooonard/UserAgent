var gulp = require("gulp")
,	babel = require("gulp-babel")
,	sourcemaps = require("gulp-sourcemaps")

gulp.task("compile", function(){
	return gulp.src("src/**/*.js")
            .pipe(sourcemaps.init())
			.pipe(babel())
			.pipe(gulp.dest("dist"))
})

gulp.task("mv", function(){
    return gulp.src([
                "src/**/*.json",
                "src/**/*.log",
            ])
            .pipe(gulp.dest("dist"))
})

gulp.task("watch", function(){
    gulp.watch("src/**/*.js", gulp.series("compile", "mv"))
})