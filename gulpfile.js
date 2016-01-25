// node:
var fs         = require('fs'),
// npm:
    gulp       = require('gulp'),
    mustache   = require('mustache'),
    myth       = require('myth'),
    commonmark = require('commonmark'),
// lib:
    sections   = require('./lib/sections.js');

function basename(filename) {
    var dot = filename.indexOf('.');
    if(dot !== -1 && dot !== 0) {
        return filename.substr(0,dot);
    }
    throw new Error("Cannot determine basename of "+filename);
}

// compile templates
gulp.task('tpl', function() {
    var partials = {};
    fs.readdirSync('tpl/_include').forEach(function(filename){
        if(/\.mustache$/.test(filename)) {
            var base = basename(filename);
            partials[base] = fs.readFileSync('tpl/_include/'+filename).toString(); 
        }
    });
    fs.readdirSync('tpl').forEach(function(filename){
        if(/\.mustache$/.test(filename)) {
            var base = basename(filename);
            var tpl = fs.readFileSync('tpl/'+filename).toString();
            var dat;
            try {
                var json = fs.readFileSync('cache/' + base + '.json');
                dat = JSON.parse(json.toString());
            } catch(e) {
                console.log('(no associated article for: "'+base+'")');
                dat = undefined;
            }
            var out = mustache.render(tpl, dat, partials);
            fs.writeFileSync('dist/'+base+'.html', out);
        }
    });
});

// compile css
gulp.task('css', function() {
    var css = '';
    fs.readdirSync('css').sort().forEach(function(filename){
        if(/\.css$/.test(filename)) {
            css += fs.readFileSync('css/'+filename).toString();
        }
    });
    var converted = myth(css);
    fs.writeFileSync('dist/style.css', converted);
});

// compile articles
gulp.task('articles', function() {
    var reader = new commonmark.Parser();
    var writer = new commonmark.HtmlRenderer();
    fs.readdirSync('articles').sort().forEach(function(filename) {
        if(/\.txt$/.test(filename)) {
            var txt = fs.readFileSync('articles/'+filename).toString();
            var txt_sections = sections(txt);
            var htm_sections = {};

            for(section in txt_sections) {
                if(section === 'metadata') {
                    var metadata = {};
                    txt_sections.metadata.split("\n").forEach(function(line) {
                        var parts = line.split(":");

                        if(parts.length !== 2) {
                            throw new Error("Unable to parse line: \""+line+"\"");
                        }

                        var field = parts[0].trim().toLowerCase();
                        var value = parts[1].trim();

                        if(field === 'tags') {
                            value = value.split(/\s+/);
                        }

                        metadata[field] = value;
                    });
                    txt_sections.metadata = metadata;
                    htm_sections.metadata = metadata;
                } else {
                    htm_sections[section] = writer.render(reader.parse(txt_sections[section]));
                }
            }

            fs.writeFileSync('cache/'+basename(filename)+'-txt.json', JSON.stringify(txt_sections, undefined, '  '));
            fs.writeFileSync('cache/'+basename(filename)+'.json', JSON.stringify(htm_sections, undefined,'  '));
        }
    });
});

// watchr
gulp.task('watch', function() {
    gulp.watch('tpl/*.mustache',          ['tpl']);
    gulp.watch('tpl/_include/*.mustache', ['tpl']);
    gulp.watch('css/*.css',               ['css']);
    gulp.watch('articles/*.txt',          ['articles', 'tpl']);
});

// move zig
gulp.task('default', ['tpl', 'css']);
