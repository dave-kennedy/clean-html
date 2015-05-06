var cleaner = require('./index.js'),
    fs = require('fs'),
    inFile = process.argv[2],
    outFile = process.argv[3];

if (!inFile) {
    throw 'no file specified\n';
}

fs.readFile(inFile, 'utf-8', function (err, data) {
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
        if (outFile) {
            return fs.writeFile(outFile, html, function (err) {
                if (err) {
                    throw err;
                }
            });
        }

        console.log(html);
    });
});
