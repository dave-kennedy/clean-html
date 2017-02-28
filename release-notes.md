1.3.9
-----

The license has been switched from ISC to [Unlicense](http://unlicense.org).

1.3.8
-----

The htmlparser2 and minimist dependencies have been updated.

1.3.7
-----

Up until now, this thing really only supported cleaning fragments of HTML. If
you tried to feed it an entire HTML page (with doctype declaration, style
tags, script tags, etc.) it would blow up.

Thanks in part to Ronan Drouglazet, this embarassing oversight has been
addressed. However, I have no intention of turning this into a CSS or
JavaScript cleaner/formatter. Anything found within a style or script tag will
be output as is.

