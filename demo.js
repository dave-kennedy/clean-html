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

    cleaner.clean(data, function (html) {
        console.log(html);
    });
});
