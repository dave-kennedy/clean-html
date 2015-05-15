var assert = require('assert'),
    cleaner = require('./index.js');

// test that text is unchanged
cleaner.clean('Foo Bar', function (html) {
    assert.equal(html, 'Foo Bar');
});

// test that extra whitespace is replaced by a single space
cleaner.clean('Foo  Bar', function (html) {
    assert.equal(html, 'Foo Bar');
});
cleaner.clean('Foo\nBar', function (html) {
    assert.equal(html, 'Foo Bar');
});

// test that output is trimmed
cleaner.clean(' foo\n', function (html) {
    assert.equal(html, 'foo');
});

// test that line breaks are not added around comments when break-around-comments is false
cleaner.clean('foo<!-- bar -->qux', {'break-around-comments': false}, function (html) {
    assert.equal(html, 'foo<!-- bar -->qux');
});
// test that line breaks are added around comments when break-around-comments is true
cleaner.clean('foo<!-- bar -->qux', {'break-around-comments': true}, function (html) {
    assert.equal(html, 'foo\n<!-- bar -->\nqux');
});

// test that line breaks are not added around tags when not included in break-around-tags
cleaner.clean('foo<div></div>bar', {'break-around-tags': []}, function (html) {
    assert.equal(html, 'foo<div></div>bar');
});
// test that line breaks are added around tags when included in break-around-tags
cleaner.clean('foo<div></div>bar', {'break-around-tags': ['div']}, function (html) {
    assert.equal(html, 'foo\n<div></div>\nbar');
});

// test that attributes are not removed when not included in remove-attributes
cleaner.clean('<span color="red">foo</span>', {'remove-attributes': []}, function (html) {
    assert.equal(html, '<span color="red">foo</span>');
});
// test that attributes are removed when included in remove-attributes
cleaner.clean('<span color="red">foo</span>', {'remove-attributes': ['color']}, function (html) {
    assert.equal(html, '<span>foo</span>');
});

// test that comments are not removed when remove-comments is false
cleaner.clean('<!-- foo -->', {'remove-comments': false}, function (html) {
    assert.equal(html, '<!-- foo -->');
});
// test that comments are removed when remove-comments is true
cleaner.clean('<!-- foo -->', {'remove-comments': true}, function (html) {
    assert.equal(html, '');
});

// test that empty tags are not removed when not included in remove-empty-tags
cleaner.clean('<p></p>', {'remove-empty-tags': []}, function (html) {
    assert.equal(html, '<p></p>');
});
// test that empty tags are removed when included in remove-empty-tags
cleaner.clean('<p></p>', {'remove-empty-tags': ['p']}, function (html) {
    assert.equal(html, '');
});

// test that tags are not removed when not included in remove-tags
cleaner.clean('<font face="arial">foo</font>', {'remove-tags': []}, function (html) {
    assert.equal(html, '<font face="arial">foo</font>');
});
// test that tags are removed when included in remove-tags
cleaner.clean('<font face="arial">foo</font>', {'remove-tags': ['font']}, function (html) {
    assert.equal(html, 'foo');
});

// test that non-breaking space is not replaced by a single space when replace-nbsp is false
cleaner.clean('Foo&nbsp;Bar', {'replace-nbsp': false}, function (html) {
    assert.equal(html, 'Foo&nbsp;Bar');
});
// test that non-breaking space is replaced by a single space when replace-nbsp is true
cleaner.clean('Foo&nbsp;Bar', {'replace-nbsp': true}, function (html) {
    assert.equal(html, 'Foo Bar');
});

// ----------
// indent tests
// ----------

// test indent when parent is not included in break-around-tags and...
// child is text - indent is not added
cleaner.clean('foo<span>bar</span>qux', {'indent': '  '}, function (html) {
    assert.equal(html, 'foo<span>bar</span>qux');
});
// child is comment and break-around-comments is false - indent is not added
cleaner.clean('foo<span><!-- bar --></span>qux', {'break-around-comments': false, 'indent': '  '}, function (html) {
    assert.equal(html, 'foo<span><!-- bar --></span>qux');
});
// child is comment and break-around-comments is true - indent is added
cleaner.clean('foo<span><!-- bar --></span>qux', {'break-around-comments': true, 'indent': '  '}, function (html) {
    assert.equal(html, 'foo\n<span>\n  <!-- bar -->\n</span>\nqux');
});
// child tag is not included in break-around-tags - indent is not added
cleaner.clean('foo<span><span>bar</span></span>qux', {'indent': '  '}, function (html) {
    assert.equal(html, 'foo<span><span>bar</span></span>qux');
});
// child tag is included in break-around-tags - indent is added
cleaner.clean('foo<span><div>bar</div></span>qux', {'break-around-tags': ['div'], 'indent': '  '}, function (html) {
    assert.equal(html, 'foo\n<span>\n  <div>bar</div>\n</span>\nqux');
});
// child tag is not included in break-around-tags but contains a tag that is
cleaner.clean('foo<span><span><div>bar</div></span></span>qux', {'break-around-tags': ['div'], 'indent': '  '}, function (html) {
    assert.equal(html, 'foo\n<span>\n  <span>\n    <div>bar</div>\n  </span>\n</span>\nqux');
});

// test indent when parent is included in break-around-tags and...
// child is text - indent is not added
cleaner.clean('foo<div>bar</div>qux', {'break-around-tags': ['div'], 'indent': '  '}, function (html) {
    assert.equal(html, 'foo\n<div>bar</div>\nqux');
});
// child is comment and break-around-comments is false - indent is not added
cleaner.clean('foo<div><!-- bar --></div>qux', {'break-around-comments': false, 'break-around-tags': ['div'], 'indent': '  '}, function (html) {
    assert.equal(html, 'foo\n<div><!-- bar --></div>\nqux');
});
// child is comment and break-around-comments is true - indent is added
cleaner.clean('foo<div><!-- bar --></div>qux', {'break-around-comments': true, 'break-around-tags': ['div'], 'indent': '  '}, function (html) {
    assert.equal(html, 'foo\n<div>\n  <!-- bar -->\n</div>\nqux');
});
// child tag is not included in break-around-tags - indent is not added
cleaner.clean('foo<div><span>bar</span></div>qux', {'break-around-tags': ['div'], 'indent': '  '}, function (html) {
    assert.equal(html, 'foo\n<div><span>bar</span></div>\nqux');
});
// child tag is included in break-around-tags - indent is added
cleaner.clean('foo<div><div>bar</div></div>qux', {'break-around-tags': ['div'], 'indent': '  '}, function (html) {
    assert.equal(html, 'foo\n<div>\n  <div>bar</div>\n</div>\nqux');
});
// child tag is not included in break-around-tags but contains a tag that is
cleaner.clean('foo<div><span><div>bar</div></span></div>qux', {'break-around-tags': ['div'], 'indent': '  '}, function (html) {
    assert.equal(html, 'foo\n<div>\n  <span>\n    <div>bar</div>\n  </span>\n</div>\nqux');
});

console.log('all tests passed');
