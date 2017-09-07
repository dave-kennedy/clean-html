var htmlparser = require('htmlparser2'),
    unsupportedTags = [
        'script',
        'style'
    ],
    voidElements = [
        'area',
        'base',
        'basefont',
        'br',
        'col',
        'command',
        'embed',
        'frame',
        'hr',
        'img',
        'input',
        'isindex',
        'keygen',
        'link',
        'meta',
        'param',
        'source',
        'track',
        'wbr',

        // common self closing svg elements
        'circle',
        'ellipse',
        'line',
        'path',
        'polygon',
        'polyline',
        'rect',
        'stop',
        'use'
    ],
    options = {};

function setup(opt) {
    options = {
        'break-around-comments': true,
        'break-around-tags': [
            'blockquote',
            'body',
            'br',
            'div',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'head',
            'hr',
            'link',
            'meta',
            'p',
            'table',
            'td',
            'title',
            'tr'
        ],
        'indent': '  ',
        'remove-attributes': [
            'align',
            'bgcolor',
            'border',
            'cellpadding',
            'cellspacing',
            'color',
            'height',
            'target',
            'valign',
            'width'
        ],
        'remove-comments': false,
        'remove-empty-tags': [],
        'remove-tags': [
            'center',
            'font'
        ],
        'replace-nbsp': false,
        'wrap': 120
    };

    if (!opt) {
        return;
    }

    options['break-around-comments'] = opt['break-around-comments'] === false ? false : true;
    options['break-around-tags'] = opt['break-around-tags'] || options['break-around-tags'];
    options['indent'] = opt['indent'] || options['indent'];
    options['remove-attributes'] = opt['remove-attributes'] || options['remove-attributes'];
    options['remove-comments'] = opt['remove-comments'] === true ? true : false;
    options['remove-empty-tags'] = opt['remove-empty-tags'] || options['remove-empty-tags'];
    options['remove-tags'] = opt['remove-tags'] || options['remove-tags'];
    options['replace-nbsp'] = opt['replace-nbsp'] === true ? true : false;
    options['wrap'] = opt['wrap'] >= 0 ? opt['wrap'] : options['wrap'];

    if (opt['add-break-around-tags']) {
        options['break-around-tags'] = options['break-around-tags'].concat(opt['add-break-around-tags']);
    }

    if (opt['add-remove-attributes']) {
        options['remove-attributes'] = options['remove-attributes'].concat(opt['add-remove-attributes']);
    }

    if (opt['add-remove-tags']) {
        options['remove-tags'] = options['remove-tags'].concat(opt['add-remove-tags']);
    }
}

function breakAround(node) {
    if (shouldRemove(node)) {
        return false;
    }

    if (node.type == 'text') {
        return false;
    }

    if (node.type == 'comment') {
        return options['break-around-comments'];
    }

    if (options['break-around-tags'].indexOf(node.name) != -1) {
        return true;
    }

    return breakWithin(node);
}

function breakWithin(node) {
    if (shouldRemove(node)) {
        return false;
    }

    if (node.type != 'tag') {
        return false;
    }

    return node.children.some(breakAround) || node.children.some(breakWithin);
}

function isEmpty(node) {
    if (node.type == 'text') {
        if (options['replace-nbsp']) {
            !node.data.replace(/&nbsp;/g, ' ').trim();
        }

        return !node.data.trim();
    }

    if (node.type == 'comment') {
        return !node.data.trim();
    }

    return !node.children.length || node.children.every(isEmpty);
}

function removeExtraSpace(text) {
    return text.replace(/\s+/g, ' ');
}

function shouldRemove(node) {
    if (node.type == 'text') {
        return isEmpty(node);
    }

    if (node.type == 'comment') {
        return options['remove-comments'] || isEmpty(node);
    }

    if (isListedInOptions('remove-empty-tags', node.name)) {
        return isEmpty(node);
    }

    return isListedInOptions('remove-tags', node.name);
}

function isListedInOptions(optionsArrayName, name) {
    var matches = options[optionsArrayName].filter(function(option) {
        return option instanceof RegExp && option.test(name) || option === name;
    });

    return !!matches.length;
}

function renderText(node) {
    if (shouldRemove(node)) {
        return '';
    }

    var text = removeExtraSpace(node.data);

    if (options['replace-nbsp']) {
        text = text.replace(/&nbsp;/g, ' ');
    }

    if (!node.prev || breakAround(node.prev)) {
        text = text.trimLeft();
    }

    if (!node.next || breakAround(node.next)) {
        text = text.trimRight();
    }

    return text;
}

function renderComment(node) {
    if (shouldRemove(node)) {
        return '';
    }

    var comment = '<!--' + removeExtraSpace(node.data) + '-->';

    if (breakAround(node)) {
        return '\n' + comment + '\n';
    }

    return comment;
}

function renderTag(node) {
    if (unsupportedTags.indexOf(node.name) != -1) {
        return '';
    }

    if (shouldRemove(node)) {
        if (isEmpty(node)) {
            return '';
        }

        return render(node.children);
    }

    var openTag = '<' + node.name;

    for (var attrib in node.attribs) {
        if (!isListedInOptions('remove-attributes', attrib)) {
            openTag += ' ' + attrib + '="' + removeExtraSpace(node.attribs[attrib]) + '"';
        }
    }

    openTag += '>';

    if (voidElements.indexOf(node.name) != -1) {
        if (breakAround(node)) {
            return '\n' + openTag + '\n';
        }

        return openTag;
    }

    var closeTag = '</' + node.name + '>';

    if (breakAround(node)) {
        openTag = '\n' + openTag;
        closeTag = closeTag + '\n';
    }

    if (breakWithin(node)) {
        openTag = openTag + '\n';
        closeTag = '\n' + closeTag;
    }

    return openTag + render(node.children) + closeTag;
}

function renderDirective(node) {
    return '<' + node.data + '>';
}

function render(nodes) {
    var html = '';

    nodes.forEach(function (node) {
        if (node.type == 'root') {
            html += render(node.children);
            return;
        }

        if (node.type == 'text') {
            html += renderText(node);
            return;
        }

        if (node.type == 'comment') {
            html += renderComment(node);
            return;
        }

        if (node.type == 'directive') {
            html += renderDirective(node)
            return;
        }

        html += renderTag(node);
    });

    // remove extra line breaks
    return html.replace(/\n+/g, '\n');
}

function getIndent(indentLevel) {
    var indent = '';

    for (var i = 0; i < indentLevel; i++) {
        indent += options['indent'];
    }

    return indent;
}

function wrap(line, indent) {
    // find the last space before the column limit
    var bound = line.lastIndexOf(' ', options['wrap']);

    if (bound == -1) {
        // there are no spaces before the colum limit
        // so find the first space after it
        bound = line.indexOf(' ', options['wrap']);

        if (bound == -1) {
            // there are no spaces in the line
            // so we can't wrap it
            return line;
        }
    }

    var line1 = line.substr(0, bound),
        line2 = indent + options['indent'].repeat(2) + line.substr(bound + 1);

    if (line1.trim().length == 0) {
        // there are no spaces in the line other than the indent
        // so we can't wrap it
        return line;
    }

    if (line2.length > options['wrap']) {
        line2 = wrap(line2, indent);
    }

    return line1 + '\n' + line2;
}

function indent(html) {
    var indentLevel = 0;

    return html.replace(/.*\n/g, function (line) {
        var openTags = [],
            result,
            tagRegEx = /<\/?(\w+).*?>/g,
            tag,
            tagName;

        while (result = tagRegEx.exec(line)) {
            // don't increase indent if tag is inside a comment
            if (line.lastIndexOf('<!--', result.index) < result.index
                    && line.indexOf('-->', result.index) > result.index) {
                continue;
            }

            tag = result[0];
            tagName = result[1];

            if (voidElements.indexOf(tagName) != -1) {
                continue;
            }

            if (tag.indexOf('</') == -1) {
                openTags.push(tag);
                indentLevel++;
            } else {
                openTags.pop();
                indentLevel--;
            }
        }

        var indent = getIndent(indentLevel - openTags.length);

        line = indent + line;

        if (options['wrap'] && line.length > options['wrap']) {
            line = wrap(line, indent);
        }

        return line;
    });
}

function clean(html, opt, callback) {
    if (typeof opt == 'function') {
        callback = opt;
        opt = null;
    }

    setup(opt);

    var handler = new htmlparser.DomHandler(function (err, dom) {
        if (err) {
            throw err;
        }

        var html = render(dom);
        html = indent(html).trim();

        callback(html);
    });

    var parser = new htmlparser.Parser(handler);
    parser.write(html);
    parser.done();
}

module.exports = {
    clean: clean
};
