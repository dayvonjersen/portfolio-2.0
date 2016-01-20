//var input = "@@@metadata\nTitle: Something\nTags: one two three\n\n@@@one\n\nSection One\n\n@@@two\n\nSection Two";

module.exports = function(input) {
    var m;
    var regex = /^@@@(.+?)$/mg;
    var section_names = [];
    var i = 0;
    var str = input;
    while( m = regex.exec(str) ) {
        section_names[i++] = m[1];
        str = str.replace(m[0],'');
    }
    var section_contents = input.split(/^@@@.+?$/m);
    section_contents.shift();
    var output = {};
    for(var i = 0; i < section_contents.length; i++) {
        output[section_names[i]] = section_contents[i].trim();
    }
    return output;
};
