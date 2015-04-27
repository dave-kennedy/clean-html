var htmlparser = require('htmlparser2'),
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
        'break-around-comments': true,
        'break-after-br': true,
        'empty-tags': [
            'br',
            'hr',
            'img'
        ],
        'indent': '  ',
        'remove-comments': false,
        'remove-empty-paras': false,
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
    options['break-around-comments'] = opt['break-around-comments'] === false ? false : true;
    options['break-after-br'] = opt['break-after-br'] === false ? false : true;
    options['empty-tags'] = opt['empty-tags'] || options['empty-tags'];
    options['indent'] = opt['indent'] || options['indent'];
    options['remove-comments'] = opt['remove-comments'] === true ? true : false;
    options['remove-empty-paras'] = opt['remove-empty-paras'] === true ? true : false;
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

function isEmpty(node) {
    if (node.type == 'text' || node.type == 'comment') {
        return !node.data.trim();
    }

    return !node.children.length || node.children.every(isEmpty);
}

function renderText(node) {
    return node.data.replace(/\s+/g, ' ');
}

function renderComment(node) {
    if (options['remove-comments']) {
        return '';
    }

    if (options['break-around-comments']) {
        return '\n' + '<!--' + node.data + '-->' + '\n';
    }

    return '<!--' + node.data + '-->';
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

    var openTag = '<' + node.name,
        closeTag;

    for (var attrib in node.attribs) {
        if (options['attr-to-remove'].indexOf(attrib) == -1) {
            openTag += ' ' + attrib + '="' + node.attribs[attrib] + '"';
        }
    }

    openTag += '>';

    if (options['empty-tags'].indexOf(node.name) > -1) {
        if (options['break-after-br'] && node.name == 'br') {
            return openTag + '\n';
        }

        return openTag;
    }

    closeTag = '</' + node.name + '>';

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
            if (tag.indexOf('</') == -1) {
                line = indentLine(line, indentLevel);
                indentLevel++;
            } else {
                indentLevel--;
                line = indentLine(line, indentLevel);
            }

            return line;
        }

        return indentLine(line, indentLevel);
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
