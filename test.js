var assert = require('assert'),
    cleaner = require('./index.js');

// test that text is unchanged
cleaner.clean('Foo Bar', function (html) {
    assert.equal(html, 'Foo Bar');
});

// test that non-breaking space is replaced
cleaner.clean('Foo&nbsp;Bar', function (html) {
    assert.equal(html, 'Foo&nbsp;Bar');
});
cleaner.clean('Foo&nbsp;Bar', {'replace-nbsp': true}, function (html) {
    assert.equal(html, 'Foo Bar');
});

// test that extra whitespace is removed
cleaner.clean('Foo  Bar', function (html) {
    assert.equal(html, 'Foo Bar');
});
cleaner.clean('Foo\nBar', function (html) {
    assert.equal(html, 'Foo Bar');
});

// test that comments are removed
cleaner.clean('<!-- foo -->', function (html) {
    assert.equal(html, '<!-- foo -->');
});
cleaner.clean('<!-- foo -->', {'remove-comments': true}, function (html) {
    assert.equal(html, '');
});

// test that lines breaks are added before and after comments
cleaner.clean('foo<!-- bar -->qux', function (html) {
    assert.equal(html, 'foo\n<!-- bar -->\nqux');
});
cleaner.clean('foo<!-- bar -->qux', {'break-around-comments': false}, function (html) {
    assert.equal(html, 'foo<!-- bar -->qux');
});

// test that empty paragraph tags are removed
cleaner.clean('<p>\n</p>', function (html) {
    assert.equal(html, '<p>\n</p>');
});
cleaner.clean('<p>\n</p>', {'remove-empty-paras': true}, function (html) {
    assert.equal(html, '');
});

// test that deprecated tags are removed
cleaner.clean('<font face="arial">foo</font>', function (html) {
    assert.equal(html, 'foo');
});

// test that legacy attributes are removed
cleaner.clean('<span color="red">foo</span>', function (html) {
    assert.equal(html, '<span>foo</span>');
});

// test that line breaks are added before and after block element tags
cleaner.clean('foo<div></div>bar', function (html) {
    assert.equal(html, 'foo\n<div>\n</div>\nbar');
});

// test that nested tags are indented after block element tags
cleaner.clean('<div>foo</div>', function (html) {
    assert.equal(html, '<div>\n  foo\n</div>');
});
cleaner.clean('<div><div>foo</div></div>', function (html) {
    assert.equal(html, '<div>\n  <div>\n    foo\n  </div>\n</div>');
});
cleaner.clean('<div>foo</div>', {'indent': '	'}, function (html) {
    assert.equal(html, '<div>\n	foo\n</div>');
});

// test that output is trimmed
cleaner.clean(' foo\n', function (html) {
    assert.equal(html, 'foo');
});

console.log('all tests passed');
