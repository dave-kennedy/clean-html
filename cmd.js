#!/usr/bin/env node

var cleaner = require('./index.js'),
    fs = require('fs'),
    parseArgs = require('minimist'),
    argv = parseArgs(process.argv.slice(2)),
    filename = argv['_'][0],
    inPlace = getOptAsBool(argv['in-place']),
    options = {
        'attr-to-remove': getOptAsArray(argv['attr-to-remove']),
        'block-tags': getOptAsArray(argv['block-tags']),
        'break-after-br': getOptAsBool(argv['break-after-br']),
        'break-around-comments': getOptAsBool(argv['break-around-comments']),
        'empty-tags': getOptAsArray(argv['empty-tags']),
        'indent': argv['indent'],
        'remove-comments': getOptAsBool(argv['remove-comments']),
        'remove-empty-paras': getOptAsBool(argv['remove-empty-paras']),
        'replace-nbsp': getOptAsBool(argv['replace-nbsp']),
        'tags-to-remove': getOptAsArray(argv['tags-to-remove']),
        'add-attr-to-remove': getOptAsArray(argv['add-attr-to-remove']),
        'add-block-tags': getOptAsArray(argv['add-block-tags']),
        'add-empty-tags': getOptAsArray(argv['add-empty-tags']),
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
