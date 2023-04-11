# HTML cleaner and beautifier

![npm](https://img.shields.io/npm/v/clean-html)
![npm](https://img.shields.io/npm/dw/clean-html)
![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/dave-kennedy/clean-html)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/dave-kennedy/clean-html)

## Usage

### In a script

```javascript
const cleaner = require('clean-html');
const fs = require('fs');

fs.readFile('foo.html', 'utf8', (err, input) => {
    cleaner.clean(input, output => console.log(output));
});
```

Options can be provided like so:

```
const options = {
    'break-around-comments': false,
    'decode-entities': true,
    'remove-tags': ['b', 'i', 'center', 'font'],
    'wrap': 80
};

cleaner.clean(input, options, output => {...});
```

### From the command line

If installed globally, just run `clean-html`. Otherwise, run `npx clean-html`.

Input can be piped from stdin:

```
$ echo '<h1>Hello, World!</h1>' | clean-html
$ cat foo.html | clean-html
```

Or you can provide a filename as the first argument:

```
$ clean-html foo.html
```

Output can be redirected to another file:

```
$ clean-html foo.html > bar.html
```

Or you can edit the file in place:

```
$ clean-html foo.html --in-place
```

Other options can be provided like so:

```
$ clean-html foo.html \
    --break-around-comments \
    --decode-entities false \
    --remove-tags b,i,center,font \
    --wrap 80
```

> Array type option values should be separated by commas. Boolean type options are disabled if
> followed by `false` and enabled if followed by `true` or nothing.

## Options

### allow-attributes-without-values

Allows attributes to be output without values. For example, `checked` instead of `checked=""`.

Please set to `true` for Angular components or for `<input>` elements.

Type: Boolean  
Default: `false`

### break-around-comments

Adds line breaks before and after comments.

Type: Boolean  
Default: `true`

### break-around-tags

Tags that should have line breaks added before and after.

Type: Array of strings  
Default: `['body', 'blockquote', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr',
'link', 'meta', 'p', 'table', 'title', 'td', 'tr']`

### decode-entities

Replaces HTML entities with their decoded equivalents. e.g., if `true` then `&nbsp;` will be
replaced by a space character.

Type: Boolean  
Default: `false`

### indent

The string to use for indentation. e.g., a tab character or one or more spaces.

Type: String  
Default: `'  '` (two spaces)

### lower-case-tags

Converts all tag names to lower case.

Please set to `false` for Angular components.

Type: Boolean  
Default: `true`

### lower-case-attribute-names

Converts all attribute names to lower case.

Please set to `false` for Angular components.

Type: Boolean  
Default: `true`

### preserve-tags

Tags that should be left alone. i.e., content inside these tags will not be formatted or indented.

Type: Array of strings  
Default: `['script', 'style']`

### remove-attributes

Attributes to remove from markup.

Type: Array of strings or regular expressions  
Default: `['align', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'color', 'height', 'target',
'valign', 'width']`

### remove-comments

Removes comments.

Type: Boolean  
Default: `false`

### remove-empty-tags

Tags to remove from markup if empty.

Type: Array of strings or regular expressions  
Default: `[]`

### remove-tags

Tags to always remove from markup. Nested content is preserved.

Type: Array of strings or regular expressions  
Default: `['center', 'font']`

### wrap

The column number where lines should wrap. Set to 0 to disable line wrapping.

Type: Integer  
Default: `120`

## Adding values to option lists

These options exist for your convenience.

### add-break-around-tags

Additional tags to include in `break-around-tags`.

Type: Array of strings  
Default: `null`

### add-remove-attributes

Additional attributes to include in `remove-attributes`.

Type: Array of strings  
Default: `null`

### add-remove-tags

Additional tags to include in `remove-tags`.

Type: Array of strings  
Default: `null`
