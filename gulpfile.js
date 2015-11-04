var gulp = require("gulp")
,	babel = require("gulp-babel")
,	sourcemaps = require("gulp-sourcemaps")

gulp.task("compile", function(){
	return gulp.src("src/**/*.js")
            .pipe(sourcemaps.init())
			.pipe(babel())
			.pipe(gulp.dest("dist"))
})

gulp.task("json", function(){
    return gulp.src("src/**/*.json")
            .pipe(gulp.dest("dist"))
})

gulp.task("watch", function(){
    gulp.watch("src/**/*.js", gulp.series("compile", "json"))
})