var iconv = require('iconv-lite'),
    options = {
        'attr-to-remove': [
            'align',
            'valign',
            'bgcolor',
            'color',
            'width',
            'height',
            'border',
            'cellpadding',
            'cellspacing'
        ],
        'block-tags': [
            'div',
            'p',
            'table',
            'tr',
            'td',
            'blockquote',
            'hr'
        ],
        'empty-tags': [
            'br',
            'hr',
            'img'
        ],
        'encoding': 'utf-8',
        'indent': false,
        'line-breaks': false,
        'pretty': false,
        'remove-comments': true,
        'tags-to-remove': [
            'font'
        ]
    };

function setup(opt) {
    if (!opt) {
        return;
    }

    options['attr-to-remove'] = opt['attr-to-remove'] || options['attr-to-remove'];
    options['block-tags'] = opt['block-tags'] || options['block-tags'];
    options['empty-tags'] = opt['empty-tags'] || options['empty-tags'];
    options['encoding'] = opt['encoding'] || options['encoding'];
    options['indent'] = opt['indent'] || options['indent'];
    options['line-breaks'] = opt['line-breaks'] || options['line-breaks'];
    options['pretty'] = opt['pretty'] || options['pretty'];
    options['remove-comments'] = opt['remove-comments'] || true;
    options['tags-to-remove'] = opt['tags-to-remove'] || options['tags-to-remove'];

    if (opt['add-attr-to-remove']) {
        options['attr-to-remove'] = options['attr-to-remove'].concat(opt['add-attr-to-remove']);
    }

    if (opt['add-block-tags']) {
        options['block-tags'] = options['block-tags'].concat(opt['add-block-tags']);
    }

    if (opt['add-empty-tags']) {
        options['empty-tags'] = options['empty-tags'].concat(opt['add-empty-tags']);
    }

    if (opt['add-tags-to-remove']) {
        options['tags-to-remove'] = options['tags-to-remove'].concat(opt['add-tags-to-remove']);
    }
}

function replaceWhiteSpace(html) {
    return html.replace(/\s/g, ' ');
}

function removeExtraSpaces(html) {
    return html.replace(/ {2,}/g, ' ');
}

function removeTrailingSlash(tag) {
    return tag.replace(/ ?\/>/, '>');
}

function cleanAttributes(tag) {
    return tag.replace(/ (\w+)=['"].+?['"]/g, function (attribute, attributeName) {
        if (options['attr-to-remove'].indexOf(attributeName) > -1) {
            return '';
        }

        return attribute;
    });
}

function cleanTags(html) {
    return html.replace(/<\/?(\w+).*?>/g, function (tag, tagName) {
        tag = tag.toLowerCase();
        tagName = tagName.toLowerCase();

        if (options['tags-to-remove'].indexOf(tagName) > -1) {
            return '';
        }

        if (options['empty-tags'].indexOf(tagName) > -1) {
            tag = removeTrailingSlash(tag);
        }

        tag = cleanAttributes(tag);

        return tag;
    });
}

function removeComments(html) {
    return html.replace(/<!--.*?-->/g, '');
}

function addLineBreaks(html) {
    return html.replace(/<\/?(\w+).*?>/g, function (tag, tagName) {
        if (options['block-tags'].indexOf(tagName) > -1) {
            return '\n' + tag + '\n';
        }

        if (tagName == 'br') {
            return tag + '\n';
        }

        return tag;
    });
}

function removeBlankLines(html) {
    return html.replace(/\s{2,}/g, '\n');
}

function indentLine(line, indentLevel) {
    var indent = '';

    for (var i = 0; i < indentLevel; i++) {
        indent += ' ';
    }

    return indent + line;
}

function indent(html) {
    var indentLevel = 0;

    return html.replace(/.*\n/g, function (line) {
        var match = line.match(/<\/?(\w+).*?>/);

        if (!match) {
            return indentLine(line, indentLevel);
        }

        var tag = match[0],
            tagName = match[1];

        if (options['block-tags'].indexOf(tagName) > -1) {
            if (tag.indexOf('</') === 0) {
                indentLevel -= 2;
                line = indentLine(line, indentLevel);
            } else {
                line = indentLine(line, indentLevel);
                indentLevel += 2;
            }

            return line;
        }

        return indentLine(line, indentLevel);
    });
}

function clean(data, opt) {
    if (!data instanceof Buffer) {
        return process.stderr.write('data must be a buffer\n');
    }

    setup(opt);

    if (options['encoding'] != 'utf-8') {
        html = iconv.decode(data, options['encoding']);
    } else {
        html = data.toString('utf-8');
    }

    html = replaceWhiteSpace(html);
    html = removeExtraSpaces(html);
    html = cleanTags(html);

    if (options['remove-comments']) {
        html = removeComments(html);
    }

    if (!options['line-breaks'] && !options['pretty']) {
        return html.trim();
    }

    html = addLineBreaks(html);
    html = removeBlankLines(html);

    if (!options['indent'] && !options['pretty']) {
        return html.trim();
    }

    html = indent(html);

    return html.trim();
}

module.exports = {
    clean: clean
};
