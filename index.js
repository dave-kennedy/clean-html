var htmlparser = require('htmlparser2'),
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

        //common self closing svg elements
        'circle',
        'ellipse',
        'line',
        'path',
        'polygone',
        'polyline',
        'rect',
        'stop',
        'use'
    ],
    options = {};

function setup(opt) {
    options = {
        'attr-to-remove': [
            'align',
            'bgcolor',
            'border',
            'cellpadding',
            'cellspacing',
            'color',
            'disabled',
            'height',
            'target',
            'valign',
            'width'
        ],
        'block-tags': [
            'blockquote',
            'div',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'hr',
            'p',
            'table',
            'td',
            'tr'
        ],
        'break-after-br': true,
        'break-around-comments': true,
        'indent': '  ',
        'remove-comments': false,
        'remove-empty-paras': false,
        'replace-nbsp': false,
        'tags-to-remove': [
            'center',
            'font'
        ]
    };

    if (!opt) {
        return;
    }

    options['attr-to-remove'] = opt['attr-to-remove'] || options['attr-to-remove'];
    options['block-tags'] = opt['block-tags'] || options['block-tags'];
    options['break-after-br'] = opt['break-after-br'] === false ? false : true;
    options['break-around-comments'] = opt['break-around-comments'] === false ? false : true;
    options['indent'] = opt['indent'] || options['indent'];
    options['remove-comments'] = opt['remove-comments'] === true ? true : false;
    options['remove-empty-paras'] = opt['remove-empty-paras'] === true ? true : false;
    options['replace-nbsp'] = opt['replace-nbsp'] === true ? true : false;
    options['tags-to-remove'] = opt['tags-to-remove'] || options['tags-to-remove'];

    if (opt['add-attr-to-remove']) {
        options['attr-to-remove'] = options['attr-to-remove'].concat(opt['add-attr-to-remove']);
    }

    if (opt['add-block-tags']) {
        options['block-tags'] = options['block-tags'].concat(opt['add-block-tags']);
    }

    if (opt['add-tags-to-remove']) {
        options['tags-to-remove'] = options['tags-to-remove'].concat(opt['add-tags-to-remove']);
    }
}

function isEmpty(node) {
    if (node.type == 'text' || node.type == 'comment') {
        return !node.data.trim();
    }

    return !node.children.length || node.children.every(isEmpty);
}

function renderText(node) {
    var text = node.data;

    if (options['replace-nbsp']) {
        text = text.replace(/&nbsp;/g, ' ');
    }

    // replace all whitespace characters with a single space
    return text.replace(/\s+/g, ' ');
}

function renderComment(node) {
    if (options['remove-comments']) {
        return '';
    }

    var comment = '<!--' + node.data + '-->';

    if (options['break-around-comments']) {
        return '\n' + comment + '\n';
    }

    return comment;
}

function renderTag(node) {
    if (options['remove-empty-paras'] && node.name == 'p' && isEmpty(node)) {
        return '';
    }

    if (options['tags-to-remove'].indexOf(node.name) > -1) {
        if (!node.children.length) {
            return '';
        }

        return render(node.children);
    }

    var openTag = '<' + node.name;

    for (var attrib in node.attribs) {
        if (options['attr-to-remove'].indexOf(attrib) == -1) {
            openTag += ' ' + attrib + '="' + node.attribs[attrib] + '"';
        }
    }

    openTag += '>';

    if (voidElements.indexOf(node.name) > -1) {
        if (options['break-after-br'] && node.name == 'br') {
            return openTag + '\n';
        }

        return openTag;
    }

    var closeTag = '</' + node.name + '>';

    if (options['block-tags'].indexOf(node.name) > -1) {
        openTag = '\n' + openTag + '\n';
        closeTag = '\n' + closeTag + '\n';
    }

    if (!node.children.length) {
        return openTag + closeTag;
    }

    return openTag + render(node.children) + closeTag;
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

        html += renderTag(node);
    });

    // remove extra spaces left behind from tags that were removed
    html = html.replace(/ +/g, ' ');

    // remove spaces before br tags
    html = html.replace(/ <br>/g, '<br>');

    // remove trailing spaces, leading spaces and extra line breaks
    html = html.replace(/ *\n\s*/g, '\n');

    return html;
}

function getIndent(indentLevel) {
    var indent = '';

    for (var i = 0; i < indentLevel; i++) {
        indent += options['indent'];
    }

    return indent;
}

function indent(html) {
    var indentLevel = 0;

    return html.replace(/.*\n/g, function (line) {
        var openTags = [],
            tagRegEx = /<\/?(\w+).*?>/g,
            tag,
            tagName,
            result;

        while (result = tagRegEx.exec(line)) {
            tag = result[0];
            tagName = result[1];

            if (voidElements.indexOf(tagName) > -1) {
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

        if (openTags.length) {
            return getIndent(indentLevel - openTags.length)
                + line.replace(openTags[0] + ' ', openTags[0] + '\n' + getIndent(indentLevel));
        }

        return getIndent(indentLevel) + line;
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
