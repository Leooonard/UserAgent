var gulp = require("gulp")
,	babel = require("gulp-babel")
,	sourcemaps = require("gulp-sourcemaps")

gulp.task("default", function(){
	return gulp.src("src/**/*.js")
			.pipe(sourcemaps.init())
			.pipe(babel())
			.pipe(gulp.dest("dist"))
})