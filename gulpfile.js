var gulp = require("gulp")
,	babel = require("gulp-babel")

gulp.task("default", gulp.series(function(){
	return gulp.src("src/**/*.js")
			.pipe(babel())
			.pipe(gulp.dest("dist"))
}, 
function(){
	return gulp.src("index.js")
			.pipe(babel())
			.pipe(gulp.dest("dist"))
}))