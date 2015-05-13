#!/usr/bin/env node

var cleaner = require('./index.js'),
    fs = require('fs'),
    parseArgs = require('minimist'),
    argv = parseArgs(process.argv.slice(2)),
    inFile = argv['_'][0],
    outFile = argv['_'][1],
    options = {
        'attr-to-remove': getOptAsArray(argv['attr-to-remove']),
        'block-tags': getOptAsArray(argv['block-tags']),
        'break-around-comments': getOptAsBool(argv['break-around-comments']),
        'break-after-br': getOptAsBool(argv['break-after-br']),
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

fs.readFile(inFile, 'utf-8', function (err, data) {
    if (err) {
        throw err;
    }

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
