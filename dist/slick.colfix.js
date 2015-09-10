(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * https://github.com/keik/slickgrid-colfix-plugin
 * @version v0.0.0
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
 * @param {String} fixedColId column id to make fixed column
 * @constructor
 */
function ColFix(fixedColId) {
  var _mainGrid = undefined,
      _mainContainerEl = undefined,
      _fixedColGrid = undefined,
      _fixedColContainerEl = undefined,
      _uid = undefined,
      _originalColumnsDef = undefined,
      _scrollbarDim = undefined,
      _handler = new Slick.EventHandler();

  function init(grid) {
    _mainGrid = grid;
    _mainContainerEl = grid.getContainerNode();
    _uid = _mainGrid.getContainerNode().className.match(/(?: |^)slickgrid_(\d+)(?!\w)/)[1];
    _originalColumnsDef = [].concat(grid.getColumns());

    var grids = separateGrid(grid);
    _mainGrid = grids.mainGrid;
    _fixedColGrid = grids.fixedColGrid;
    _fixedColContainerEl = _fixedColGrid.getContainerNode();

    setFixedColGridWidth();

    _handler.subscribe(_mainGrid['onActiveCellChanged'], function (e, args) {
      _fixedColGrid['onActiveCellChanged'].notify(args, e, _fixedColGrid);
    }).subscribe(_mainGrid.onActiveCellChanged, function (e, args) {
      console.log(this, e, args);
      // _fixedColGrid.get
      // _fixedColGrid.getCellNode(args.row, 0).parentNode.classList.add('active');
      _fixedColGrid.setActiveCell(args.row, 0);
    }).subscribe(_fixedColGrid.onActiveCellChanged, function (e, args) {
      console.log(this, e, args);
      _mainGrid.setActiveCell(args.row, 0);
    });

    // for (let k in grid) {
    //   if (k.match(/^on/)) {
    //     _handler.subscribe(grid[k], trigger.call(_fixedColGrid[k]));
    //   }
    // }
    //

    // sticky scroll between each grid
    var gridViewport = grid.getContainerNode().querySelector('.slick-viewport');
    var fixedColumnsGridViewport = _fixedColGrid.getContainerNode().querySelector('.slick-viewport');
    _mainGrid.onScroll.subscribe(function (e, args) {
      fixedColumnsGridViewport.scrollTop = args.scrollTop;
    });
    _fixedColGrid.onScroll.subscribe(function (e, args) {
      gridViewport.scrollTop = args.scrollTop;
    });
  }

  /**
   * Separate original grid to a grid which have fixed column, and a grid which have rest of columns.
   * @param {SlickGrid} grid Base SlickGrid object
   * @return {Object.<SlickGrid, SlickGRid>} fixed column grid and main grid
   */
  function separateGrid(grid) {

    /*
     * create DOM structrure such like:
     *
     *   <wrapper>
     *    <inner-wrapper>
     *      <grid-for-fixed-column/>
     *    </inner-wrapper>
     *    <grid-of-original/>
     *   </wrapper>
     */
    var containerNode = grid.getContainerNode(),
        wrapper = document.createElement('div'),
        innerWrapper = document.createElement('div'),
        fixedColContainer = document.createElement('div');

    // style
    innerWrapper.style.float = 'left';
    var computed = window.getComputedStyle(containerNode);
    fixedColContainer.style.border = computed['border'];
    fixedColContainer.style.height = computed['height'];
    fixedColContainer.style.background = computed['background'];

    // structure
    wrapper.appendChild(innerWrapper);
    innerWrapper.appendChild(fixedColContainer);
    containerNode.parentNode.replaceChild(wrapper, containerNode);
    wrapper.appendChild(containerNode);

    var originalColumns = grid.getColumns(),
        fixedColumns = [],
        unfixedColumns = [];

    var partIndex = 0;
    for (var len = originalColumns.length; partIndex < len; ++partIndex) {
      var col = originalColumns[partIndex];
      if (col.id === fixedColId) {
        partIndex++;
        break;
      }
    }
    fixedColumns = originalColumns.slice(0, partIndex);
    unfixedColumns = originalColumns.slice(partIndex);
    var fixedColGrid = new Slick.Grid(fixedColContainer, grid.getData(), fixedColumns, grid.getOptions());
    grid.setColumns(unfixedColumns);

    return { fixedColGrid: fixedColGrid, mainGrid: grid };
  }

  function setFixedColGridWidth() {
    var fixedColGridWidth = 0;
    var headers = _fixedColContainerEl.querySelectorAll('.slick-header-column');
    for (var i = 0, len = headers.length; i < len; i++) {
      fixedColGridWidth += headers[i].offsetWidth;
    }

    _scrollbarDim = _scrollbarDim || measureScrollbar();
    var innerWrapper = _fixedColContainerEl.parentNode;
    innerWrapper.style.width = fixedColGridWidth + 'px';
    _fixedColContainerEl.style.width = fixedColGridWidth + _scrollbarDim.width + 'px';
  }

  /**
   * Measure scroll bar width and height. (Copied from original slick.grid.js)
   * @return {Object.<number, number>} width and height;
   */
  function measureScrollbar() {
    var $c = $('<div style="position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;"></div>').appendTo('body');
    var dim = {
      width: $c.width() - $c[0].clientWidth,
      height: $c.height() - $c[0].clientHeight
    };
    $c.remove();
    return dim;
  }

  $.extend(this, {
    init: init
  });
}

},{}]},{},[1]);
