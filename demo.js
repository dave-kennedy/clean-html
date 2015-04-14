var cleaner = require('./index.js'),
    fs = require('fs'),
    file = process.argv[2];

if (!file) {
    return process.stderr.write('no file specified\n');
}

fs.readFile(file, 'utf-8', function (err, data) {
    if (err) {
        return process.stderr.write(err);
    }

    process.stdout.write(cleaner.clean(data) + '\n');
});
