var assert = require('assert'),
    cleaner = require('./index.js');

// test that text is unchanged
assert.equal(cleaner.clean('Foo Bar'), 'Foo Bar');

// test that extra whitespace is removed
assert.equal(cleaner.clean('Foo  Bar'), 'Foo Bar');
assert.equal(cleaner.clean('Foo\nBar'), 'Foo Bar');

// test that uppercase tags and attributes are lowercased
assert.equal(cleaner.clean('<FOO BAR="QUX">Bam</FOO>'), '<foo bar="qux">Bam</foo>');

// test that deprecated tags are removed
assert.equal(cleaner.clean('foo <font="arial">bar</font>'), 'foo bar');

// test that trailing slash is removed from empty element tag
assert.equal(cleaner.clean('<br />'), '<br>');
assert.equal(cleaner.clean('<br/>'), '<br>');
assert.equal(cleaner.clean('<br>'), '<br>');
assert.equal(cleaner.clean('<br />', {'close-empty-tags': true}), '<br/>');
assert.equal(cleaner.clean('<br/>', {'close-empty-tags': true}), '<br/>');
assert.equal(cleaner.clean('<br>', {'close-empty-tags': true}), '<br/>');

// test that legacy attributes are removed
assert.equal(cleaner.clean('<foo color="red">'), '<foo>');

// test that comments are removed
assert.equal(cleaner.clean('foo<!-- bar -->'), 'foo<!-- bar -->');
assert.equal(cleaner.clean('foo<!-- bar -->', {'remove-comments': true}), 'foo');

// test that line breaks are added before and after block element tags
assert.equal(cleaner.clean('foo<div></div>foo'), 'foo\n<div>\n</div>\nfoo');
assert.equal(cleaner.clean('foo<div></div>foo', {'pretty': false}), 'foo<div></div>foo');

// test that line break is added after br element tag
assert.equal(cleaner.clean('foo<br>foo'), 'foo<br>\nfoo');
assert.equal(cleaner.clean('foo<br>foo', {'break-after-br': false}), 'foo<br>foo');
assert.equal(cleaner.clean('foo<br>foo', {'pretty': false}), 'foo<br>foo');

// test that nested tags are indented after block element tags
assert.equal(cleaner.clean('<div>bar</div>'), '<div>\n  bar\n</div>');
assert.equal(cleaner.clean('<div><div>bar</div></div>'), '<div>\n  <div>\n    bar\n  </div>\n</div>');
assert.equal(cleaner.clean('<div>bar</div>', {'indent': '	'}), '<div>\n	bar\n</div>');
assert.equal(cleaner.clean('<div>bar</div>', {'pretty': false}), '<div>bar</div>');

// test that output is trimmed
assert.equal(cleaner.clean(' Foo\n'), 'Foo');

process.stdout.write('all tests passed\n');
