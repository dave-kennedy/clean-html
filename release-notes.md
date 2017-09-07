1.5.0
-----

Regular expressions are now supported in the remove-attributes,
remove-empty-tags and remove-tags options.

1.4.3
-----

Extra spaces are now removed from attribute values.

1.4.2
-----

Hanging indent is now applied to wrapped lines.

Multiline comments are now squashed into a single line, just like text. This
makes wrapping them easier and simplifies how conditional comments are handled.

1.4.1
-----

Maximum call stack error when trying to wrap lines without spaces has been
fixed.

Support for conditional comments has been added.

Trying to preserve CSS and JavaScript formatting is a pain, so style and
script tags are no longer supported in this release. They will simply be
removed from the output.

1.4.0
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

