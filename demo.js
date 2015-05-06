var cleaner = require('./index.js'),
    fs = require('fs'),
    file = process.argv[2];

if (!file) {
    throw 'no file specified\n';
}

fs.readFile(file, 'utf-8', function (err, data) {
    if (err) {
        throw err;
    }

    var options = {
        'add-attr-to-remove': ['class'],
        'add-tags-to-remove': ['b', 'i', 'u'],
        'indent': '    ',
        'remove-comments': true,
        'remove-empty-paras': true,
        'replace-nbsp': true
    };

    cleaner.clean(data, options, function (html) {
        console.log(html);
    });
});
