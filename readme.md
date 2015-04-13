## HTML cleaner and beautifier

Do you have crappy HTML? I do!

```html
<table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td height="31"><b>Currently we have these articles available:</b>

        <!-- This is so ugly! -->
        <blockquote>
              <p><a href="foo.html">The History of Foo</a><br />    
                An <span color="red">informative</span> piece  of <FONT FACE="ARIAL">information</FONT>.</p>
              <p><a href="bar.html">A Horse Walked Into a Bar</a><br/> The bartender said
                "Why the long face?"</p>
	</blockquote>
          </td>
        </tr>
      </table>
```

Can you stand to look at it? Just look at those blank lines and random line breaks, trailing spaces, mixed tabs, deprecated tags... it's outrageous!

Let's clean it up...

```bash
$ npm install clean-html
```

```javascript
var cleaner = require('clean-html'),
    fs = require('fs'),
    file = process.argv[2],
    options = {'pretty': true};

fs.readFile(file, function (err, data) {
    process.stdout.write(cleaner.clean(data, options) + '\n');
});
```

Sanity restored!

```html
<table>
  <tr>
    <td>
      <b>Currently we have these articles available:</b>
      <blockquote>
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
