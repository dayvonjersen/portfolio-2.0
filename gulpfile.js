var gulp     = require('gulp'),
    mustache = require('mustache'),
    myth     = require('myth'),
    fs       = require('fs')

function basename(dot_mustache) {
    if(dot_mustache.indexOf('.mustache')!==-1) {
        return dot_mustache.substr(0,dot_mustache.indexOf('.'));
    }
    return false;
}

gulp.task('default', function() {
    var partials = {};
    fs.readdirSync('tpl/_include').forEach(function(filename){
        var base = basename(filename);
        if(!!base) {
            partials[base] = fs.readFileSync('tpl/_include/'+filename).toString(); 
        }
    });
    fs.readdirSync('tpl').forEach(function(filename){
        var base = basename(filename);
        if(!!base) {
            var tpl = fs.readFileSync('tpl/'+filename).toString();
            var out = mustache.render(tpl, undefined, partials);
            fs.writeFileSync('dist/'+base+'.html', out);
        }
    });
    var css = '';
    fs.readdirSync('css').sort().forEach(function(filename){
        if(filename.indexOf('.css')!==-1) {
            css += fs.readFileSync('css/'+filename).toString();
        }
    });
    var converted = myth(css);
    fs.writeFileSync('dist/style.css', converted);
});
