#!/usr/bin/env node

var cleaner = require('./index.js'),
    fs = require('fs'),
    parseArgs = require('minimist'),
    argv = parseArgs(process.argv.slice(2)),
    filename = argv['_'][0],
    inPlace = getOptAsBool(argv['in-place']),
    options = {
        'attr-to-remove': getOptAsArray(argv['attr-to-remove']),
        'break-around-comments': getOptAsBool(argv['break-around-comments']),
        'break-around-tags': getOptAsArray(argv['break-around-tags']),
        'indent': argv['indent'],
        'remove-comments': getOptAsBool(argv['remove-comments']),
        'remove-empty-tags': getOptAsArray(argv['remove-empty-tags']),
        'replace-nbsp': getOptAsBool(argv['replace-nbsp']),
        'tags-to-remove': getOptAsArray(argv['tags-to-remove']),
        'add-attr-to-remove': getOptAsArray(argv['add-attr-to-remove']),
        'add-break-around-tags': getOptAsArray(argv['add-break-around-tags']),
        'add-tags-to-remove': getOptAsArray(argv['add-tags-to-remove'])
    };

function getOptAsArray(opt) {
    if (opt === undefined) {
        return undefined;
    }

    return opt.split(',');
}

function getOptAsBool(opt) {
    if (opt === undefined) {
        return undefined;
    }

    return opt === true || opt === 'true';
}

function read(filename, callback) {
    if (filename) {
        return fs.readFile(filename, function (err, data) {
            if (err) {
                throw err;
            }

            callback(data);
        });
    }

    process.stdin.on('data', function (data) {
        callback(data);
    });
}

function write(html, filename) {
    if (filename) {
        return fs.writeFile(filename, html, function (err) {
            if (err) {
                throw err;
            }
        });
    }

    process.stdout.write(html + '\n');
}

read(filename, function (data) {
    cleaner.clean(data, options, function (html) {
        if (filename && inPlace) {
            return write(html, filename);
        }

        write(html);
    });
});
