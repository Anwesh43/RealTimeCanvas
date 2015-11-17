var gulp = require('gulp');
var gutil = require('gulp-util');
var spawn = require('child_process').exec;
gulp.task('logOnChange',function(data){
  gutil.log('hello world');
  gutil.log(data);
});
gulp.task('default',['watchFileAndBrowserify']);
gulp.task('watchFile',function(){
    gulp.watch('./dummyFile.js',['logOnChange']);
});
gulp.task('execBrowserify',function(){
    //var ps = spawn('browserify',['browserify_input.js','-o','public/bundle.js'],{stdio:[0,'pipe']});
    var ps = spawn('browserify browserify_input.js -o public/bundle.js',function(err,stdout,stderr){
        gutil.log(stderr);
        gutil.log('browserified');
    });


});
gulp.task('watchFileAndBrowserify',function(){
    gulp.watch('./browserify_input.js',['execBrowserify']);
});
