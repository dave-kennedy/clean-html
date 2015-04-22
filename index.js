var options = {};

function setup(opt) {
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
        'break-after-br': true,
        'close-empty-tags': false,
        'empty-tags': [
            'br',
            'hr',
            'img'
        ],
        'indent': '  ',
        'pretty': true,
        'remove-comments': false,
        'tags-to-remove': [
            'font'
        ]
    };

    if (!opt) {
        return;
    }

    options['attr-to-remove'] = opt['attr-to-remove'] || options['attr-to-remove'];
    options['block-tags'] = opt['block-tags'] || options['block-tags'];
    options['break-after-br'] = opt['break-after-br'] === false ? false : true;
    options['close-empty-tags'] = opt['close-empty-tags'] === true ? true : false;
    options['empty-tags'] = opt['empty-tags'] || options['empty-tags'];
    options['indent'] = opt['indent'] || options['indent'];
    options['pretty'] = opt['pretty'] === false ? false : true;
    options['remove-comments'] = opt['remove-comments'] === true ? true : false;
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

function closeEmptyTag(tag) {
    return tag.replace(/ ?\/?>/, '/>');
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
            if (options['close-empty-tags']) {
                tag = closeEmptyTag(tag);
            } else {
                tag = removeTrailingSlash(tag);
            }
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

        if (tagName == 'br' && options['break-after-br']) {
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
        indent += options['indent'];
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
                indentLevel--;
                line = indentLine(line, indentLevel);
            } else {
                line = indentLine(line, indentLevel);
                indentLevel++;
            }

            return line;
        }

        return indentLine(line, indentLevel);
    });
}

function clean(html, opt) {
    setup(opt);

    html = replaceWhiteSpace(html);
    html = removeExtraSpaces(html);
    html = cleanTags(html);

    if (options['remove-comments']) {
        html = removeComments(html);
    }

    if (options['pretty']) {
        html = addLineBreaks(html);
        html = removeBlankLines(html);
        html = indent(html);
    }

    return html.trim();
}

module.exports = {
    clean: clean
};
