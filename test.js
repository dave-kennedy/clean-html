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
assert.equal(cleaner.clean('<hr/>'), '<hr>');

// test that legacy attributes are removed
assert.equal(cleaner.clean('<foo color="red">'), '<foo>');

// test that comments are removed
assert.equal(cleaner.clean('foo<!-- bar -->', {'remove-comments': true}), 'foo');

// test that line breaks are added before and after block element tags
assert.equal(cleaner.clean('foo<div></div>foo'), 'foo\n<div>\n</div>\nfoo');

// test that line break is added after br element tag
assert.equal(cleaner.clean('foo<br>foo'), 'foo<br>\nfoo');

// test that nested tags are indented after block element tags
assert.equal(cleaner.clean('<div>\nbar</div>'), '<div>\n  bar\n</div>');

// test that output is trimmed
assert.equal(cleaner.clean(' Foo\n'), 'Foo');

process.stdout.write('all tests passed\n');
