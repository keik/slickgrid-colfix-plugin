(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * https://github.com/keik/slickgrid-colfix-plugin
 * @version $VERSION
 * @author keik <k4t0.kei@gmail.com>
 * @license MIT
 */

// register namespace
'use strict';

$.extend(true, window, {
  Slick: {
    Plugins: {
      ColFix: ColFix
    }
  }
});

/**
 * A SlickGrid plugin to make fixed columns for horizontal scroll.
 *
 * USAGE:
 *
 * Register plugin, with one argument to specify a column ID which you want to make fixed:
 *
 *   grid.registerPlugin(new Slick.Plugins.ColFix(colId));
 *
 * @class Slick.Plugins.ColFix
 * @constructor
 */
function ColFix() {
  var _grid = undefined;

  function init(grid) {
    _grid = grid;

    console.log('aww');
  }

  $.extend(this, {
    init: init
  });
}

},{}]},{},[1]);
