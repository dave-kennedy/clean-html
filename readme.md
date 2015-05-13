## HTML cleaner and beautifier

[![NPM Stats](https://nodei.co/npm/clean-html.png?downloads=true&downloadRank=true)](https://npmjs.org/packages/clean-html/)

Do you have crappy HTML? I do!

```html
<table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td height="31"><b>Currently we have these articles available:</b>

        <blockquote>
            <!-- List articles -->
              <p><a href="foo.html">The History of Foo</a><br />    
                An <span color="red">informative</span> piece  of <FONT FACE="ARIAL">information</FONT>.</p>
              <p><a href="bar.html">A Horse Walked Into a Bar</a><br/> The bartender said
                "Why the long face?"</p>
	</blockquote>
          </td>
        </tr>
      </table>
```

Just look at those blank lines and random line breaks, trailing spaces, mixed tabs, deprecated tags - it's outrageous!

Let's clean it up...

```bash
$ npm install clean-html
```

```javascript
var cleaner = require('clean-html'),
    fs = require('fs'),
    file = process.argv[2];

fs.readFile(file, 'utf-8', function (err, data) {
    cleaner.clean(data, function (html) {
        console.log(html);
    });
});
```

Sanity restored!

```html
<table>
  <tr>
    <td>
      <b>Currently we have these articles available:</b>
      <blockquote>
        <!-- List articles -->
        <p>
          <a href="foo.html">The History of Foo</a><br>
          An <span>informative</span> piece of information.
        </p>
        <p>
          <a href="bar.html">A Horse Walked Into a Bar</a><br>
          The bartender said "Why the long face?"
        </p>
      </blockquote>
    </td>
  </tr>
</table>
```

## Options

### attr-to-remove

Attributes to remove from markup.

Type: Array  
Default: `['align', 'bgcolor', 'border', 'cellpadding', 'cellspacing', 'color', 'disabled', 'height', 'target', 'valign', 'width']`

### block-tags

Block level element tags. Line breaks are added before and after, and nested content is indented.

Type: Array  
Default: `['blockquote', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'p', 'table', 'td', 'tr']`

### break-around-comments

Adds line breaks before and after comments.

Type: Boolean  
Default: `true`

### break-after-br

Adds line breaks after br tags.

Type: Boolean  
Default: `true`

### empty-tags

Empty element tags.

Type: Array  
Default: `['br', 'hr', 'img']`

### indent

The string to use for indentation. e.g., a tab character or one or more spaces.

Type: String  
Default: `'  '` (two spaces)

### remove-comments

Removes comments.

Type: Boolean  
Default: `false`

### remove-empty-paras

Removes empty paragraph tags.

Type: Boolean  
Default: `false`

### replace-nbsp

Replaces non-breaking white space entities (`&nbsp;`) with regular spaces.

Type: Boolean  
Default: `false`

### tags-to-remove

Tags to remove from markup.

Type: Array  
Default: `['center', 'font']`

## Adding values to option lists

These options are added for your convenience.

### add-attr-to-remove

Additional attributes to remove from markup.

Type: Array  
Default: `null`

### add-block-tags

Additional block level element tags.

Type: Array  
Default: `null`

### add-empty-tags

Additional empty element tags.

Type: Array  
Default: `null`

### add-tags-to-remove

Additional tags to remove from markup.

Type: Array  
Default: `null`

## Global installation

All of the options above are available from the command line when the package is installed globally:

```bash
$ clean-html crappy.html clean.html
```

The first argument is the input file and the second is the output file. If no output file is specified, the output will be piped to STDOUT.

Array options should be separated by commas. These are equivalent:

```bash
$ clean-html crappy.html clean.html --add-tags-to-remove b,i,u
$ clean-html crappy.html clean.html --add-tags-to-remove 'b,i,u'
```

Boolean options are parsed as true if they aren't followed by anything. These are equivalent:

```bash
$ clean-html crappy.html clean.html --remove-comments
$ clean-html crappy.html clean.html --remove-comments true
$ clean-html crappy.html clean.html --remove-comments 'true'
```

So are these:

```bash
$ clean-html crappy.html clean.html --break-after-br false
$ clean-html crappy.html clean.html --break-after-br 'false'
```
