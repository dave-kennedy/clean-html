const htmlparser = require('htmlparser2');

const unsupportedTags = [
    'script',
    'style'
];

const voidElements = [
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
];

let options = {};

function setup(opt) {
    options = {
        'allow-attributes-without-values': false,
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
        'decode-entities': false,
        'indent': '  ',
        'lower-case-tags': true,
        'lower-case-attribute-names': true,
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
        'wrap': 120
    };

    if (!opt) {
        return;
    }

    options['allow-attributes-without-values'] = opt['allow-attributes-without-values'] === true ? true : false;
    options['break-around-comments'] = opt['break-around-comments'] === false ? false : true;
    options['break-around-tags'] = opt['break-around-tags'] || options['break-around-tags'];
    options['decode-entities'] = opt['decode-entities'] === true ? true : false;
    options['indent'] = opt['indent'] || options['indent'];
    options['lower-case-tags'] = opt['lower-case-tags'] === false ? false : true;
    options['lower-case-attribute-names'] = opt['lower-case-attribute-names'] === false ? false : true;
    options['remove-attributes'] = opt['remove-attributes'] || options['remove-attributes'];
    options['remove-comments'] = opt['remove-comments'] === true ? true : false;
    options['remove-empty-tags'] = opt['remove-empty-tags'] || options['remove-empty-tags'];
    options['remove-tags'] = opt['remove-tags'] || options['remove-tags'];
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

    if (options['break-around-tags'].includes(node.name)) {
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
    return options[optionsArrayName].some(option => {
        return option instanceof RegExp && option.test(name) || option === name;
    });
}

function renderText(node) {
    if (shouldRemove(node)) {
        return '';
    }

    let text = removeExtraSpace(node.data);

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

    const comment = '<!--' + removeExtraSpace(node.data) + '-->';

    if (breakAround(node)) {
        return '\n' + comment + '\n';
    }

    return comment;
}

function renderTag(node) {
    if (unsupportedTags.includes(node.name)) {
        return '';
    }

    if (shouldRemove(node)) {
        if (isEmpty(node)) {
            return '';
        }

        return render(node.children);
    }

    let openTag = '<' + node.name;

    for (let attrib in node.attribs) {
        if (!isListedInOptions('remove-attributes', attrib)) {
            if (!node.attribs[attrib] && options['allow-attributes-without-values']) {
              openTag += ' ' + attrib;
            } else {
              openTag += ` ${attrib}="${removeExtraSpace(node.attribs[attrib])}"`;
            }
        }
    }

    openTag += '>';

    if (voidElements.includes(node.name)) {
        if (breakAround(node)) {
            return '\n' + openTag + '\n';
        }

        return openTag;
    }

    let closeTag = '</' + node.name + '>';

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
    let html = '';

    nodes.forEach(node => {
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
    let indent = '';

    for (let i = 0; i < indentLevel; i++) {
        indent += options['indent'];
    }

    return indent;
}

function wrap(line, indent) {
    // find the last space before the column limit
    let bound = line.lastIndexOf(' ', options['wrap']);

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

    const line1 = line.substr(0, bound);
    let line2 = indent + options['indent'].repeat(2) + line.substr(bound + 1);

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
    let indentLevel = 0;

    return html.replace(/.*\n/g, line => {
        let tagMatch = null;
        const tagRegEx = /<\/?(\w+).*?>/g;
        const openTags = [];

        while (tagMatch = tagRegEx.exec(line)) {
            // don't increase indent if tag is inside a comment
            if (line.lastIndexOf('<!--', tagMatch.index) < tagMatch.index
                    && line.indexOf('-->', tagMatch.index) > tagMatch.index) {
                continue;
            }

            const tag = tagMatch[0];
            const tagName = tagMatch[1];

            if (voidElements.includes(tagName)) {
                continue;
            }

            if (!tag.startsWith('</')) {
                openTags.push(tag);
                indentLevel++;
            } else {
                openTags.pop();
                indentLevel--;
            }
        }

        const indent = getIndent(indentLevel - openTags.length);

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

    const handler = new htmlparser.DomHandler((err, dom) => {
        if (err) {
            throw err;
        }

        callback(indent(render(dom)).trim());
    });

    const parser = new htmlparser.Parser(handler, {
        decodeEntities: options['decode-entities'],
        lowerCaseTags: options['lower-case-tags'],
        lowerCaseAttributeNames: options['lower-case-attribute-names'],
    });

    parser.write(html);
    parser.end();
}

module.exports = {clean};
