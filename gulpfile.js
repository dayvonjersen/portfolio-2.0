// node:
var fs         = require('fs'),
// npm:
    gulp       = require('gulp'),
    mustache   = require('mustache'),
    myth       = require('myth'),
    commonmark = require('commonmark'),
// lib:
    sections   = require('./lib/sections.js');

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

gulp.task('article_test', function() {
    var txt = fs.readFileSync('articles/test.txt').toString();
    var txt_sections = sections(txt);
    fs.writeFileSync('cache/test-txt.json', JSON.stringify(txt_sections,undefined,'  '));

    var reader = new commonmark.Parser();
    var writer = new commonmark.HtmlRenderer();

    var htm_sections = {};
    for(section in txt_sections) {
        htm_sections[section] = writer.render(reader.parse(txt_sections[section]));
    }
    fs.writeFileSync('cache/test-htm.json', JSON.stringify(htm_sections,undefined,'  '));
});
