var cleaner = require('./index.js'),
    fs = require('fs'),
    file = process.argv[2],
    options = {
        'encoding': 'iso-8859-1',
        'pretty': true,
        'add-attr-to-remove': ['class'],
        'add-tags-to-remove': ['table', 'tr', 'td', 'blockquote'],
    };

if (!file) {
    return process.stderr.write('no file specified\n');
}

fs.readFile(file, function (err, data) {
    if (err) {
        return process.stderr.write(err);
    }

    process.stdout.write(cleaner.clean(data, options) + '\n');
});
