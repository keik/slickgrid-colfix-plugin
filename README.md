# slickgrid-colfix-plugin

[![travis-ci](https://img.shields.io/travis/keik/slickgrid-colfix-plugin.svg?style=flat-square)](https://travis-ci.org/keik/slickgrid-colfix-plugin)
[![npm-version](https://img.shields.io/npm/v/slickgrid-colfix-plugin.svg?style=flat-square)](https://npmjs.org/package/slickgrid-colfix-plugin)

A [SlickGrid](https://github.com/mleibman/SlickGrid) plugin to make fixed columns for horizontal scroll.

![](https://github.com/keik/slickgrid-colfix-plugin/raw/master/screenshots/screenshot.png)

[demo](http://keik.github.io/slickgrid-colfix-plugin/examples/)

## Usage

Register plugin, with one argument to specify a column ID which you want to make fixed:

```
grid.registerPlugin(new Slick.Plugins.Colfix(colId));
```

**ATTENTION**

This plugin must be registered earlier than any other plugins / event handlers registration.


## License

MIT (c) keik
