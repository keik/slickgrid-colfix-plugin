(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * https://github.com/keik/slickgrid-colfix-plugin
 * @version v0.0.1
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
  var _origGrid = undefined,
      _mainGrid = undefined,
      _mainContainerEl = undefined,
      _mainViewportEl = undefined,
      _mainGridUid = undefined,
      _fixedColGrid = undefined,
      _fixedColContainerEl = undefined,
      _fixedColViewportEl = undefined,
      _fixedColGridUid = undefined,
      _scrollbarDim = measureScrollbar(),
      _handler = new Slick.EventHandler();

  var sharedHandlers = [],
      sharedPlugins = [];

  function init(grid) {
    _origGrid = grid;

    // share same handlers with each internal grids
    // if main grid were not initialize yet, handlers would be cached in `sharedHandlers` and set after initialization.
    Object.keys(grid).filter(function (key) {
      return key.match(/^on/);
    }).forEach(function (handlerName) {
      _origGrid[handlerName].subscribe = function (handler) {
        if (_mainGrid && _fixedColGrid) {
          _fixedColGrid[handlerName].subscribe(handler);
          _mainGrid[handlerName].subscribe(handler);
        } else {
          sharedHandlers.push({ handlerName: handlerName, handler: handler });
        }
      };
    });

    // share same plugins with each internal grids
    // if main grid were not initialize yet, plugins would be cached in `sharedPlugins` and set after initialization.
    _origGrid.registerPlugin = function (plugin) {
      if (_mainGrid && _fixedColGrid) {
        _fixedColGrid.registerPlugin(new plugin.constructor());
        _mainGrid.registerPlugin(new plugin.constructor());
      } else {
        sharedPlugins.push(plugin);
      }
    };

    // depending on grid option `explicitInitialization`, change a timing of initialization.
    if (!_origGrid.getOptions()['explicitInitialization']) {
      initInternal(_origGrid);
    } else {
      _origGrid.init = (function (originalInit) {
        return function () {
          originalInit();
          initInternal(_origGrid);
        };
      })(_origGrid.init);
    }
  }

  function initInternal() {
    // separate grid internally
    var grids = separateGrid();
    _mainGrid = grids.mainGrid;
    _mainContainerEl = _mainGrid.getContainerNode();
    _mainViewportEl = _mainContainerEl.querySelector('.slick-viewport');
    _mainGridUid = _mainGrid.getContainerNode().className.match(/(?: |^)slickgrid_(\d+)(?!\w)/)[1];
    _fixedColGrid = grids.fixedColGrid;
    _fixedColContainerEl = _fixedColGrid.getContainerNode();
    _fixedColViewportEl = _fixedColContainerEl.querySelector('.slick-viewport');
    _fixedColGridUid = _fixedColGrid.getContainerNode().className.match(/(?: |^)slickgrid_(\d+)(?!\w)/)[1];

    // no event fired when `autosizeColumns` called, so follow it by advicing below methods with column group resizing.
    ['invalidate', 'render', 'updateRowCount', 'invalidateRows'].forEach(function (fnName) {
      _origGrid[fnName] = function () {
        _fixedColGrid[fnName].apply(_fixedColGrid, arguments);
        _mainGrid[fnName].apply(_fixedColGrid, arguments);
      };
    });

    _origGrid.getCellFromEvent = function () {
      return _fixedColGrid.getCellFromEvent.apply(_fixedColGrid, arguments) || _mainGrid.getCellFromEvent.apply(_fixedColGrid, arguments);
    };

    _origGrid.setColumns = setColumns;

    _handler
    // DEV unused snip
    // .subscribe(_mainGrid['onActiveCellChanged'], function(e, args) {
    //   _fixedColGrid['onActiveCellChanged'].notify(args, e, _fixedColGrid);
    // })
    .subscribe(_mainGrid.onClick, function (e, args) {
      _fixedColGrid.setActiveCell(args.row, 0);
      _fixedColGrid.getActiveCellNode().classList.remove('active');
    }).subscribe(_fixedColGrid.onClick, function (e, args) {
      _mainGrid.setActiveCell(args.row, 0);
      _mainGrid.getActiveCellNode().classList.remove('active');
    });

    // sticky scroll between each grid
    _mainGrid.onScroll.subscribe(function (e, args) {
      _fixedColViewportEl.scrollTop = args.scrollTop;
    });
    _fixedColGrid.onScroll.subscribe(function (e, args) {
      _mainViewportEl.scrollTop = args.scrollTop;
    });

    _origGrid.setColumns(_origGrid.getColumns());
  }

  /**
   * Separate original grid to a grid which have fixed column, and a grid which have rest of columns.
   * @param {SlickGrid} grid Base SlickGrid object
   * @return {Object.<SlickGrid, SlickGRid>} fixed column grid and main grid
   */
  function separateGrid() {

    /*
     * transform DOM structrure from:
     *
     *   <div/><!-- containerNode -->
     *
     * to:
     *
     *   <div><!--wrapper -->
     *    <div><!-- innerWrapper -->
     *      <div/><!-- fixedColContainer -->
     *    </div>
     *    <div/><!-- containerNode -->
     *   </div>
     */
    var containerNode = _origGrid.getContainerNode(),
        wrapper = document.createElement('div'),
        innerWrapper = document.createElement('div'),
        fixedColContainer = document.createElement('div');

    // style
    var computed = window.getComputedStyle(containerNode);
    wrapper.style.width = computed['width'];
    wrapper.id = containerNode.id;
    containerNode.id = '';
    containerNode.className = containerNode.className.replace(/slickgrid_\d+/, '');
    innerWrapper.style.float = 'left';
    fixedColContainer.className += containerNode.className;
    fixedColContainer.style.height = computed['height'];
    fixedColContainer.style.boxSizing = 'content-box'; // TODO fix conflicted style intelligently
    containerNode.style.width = null;

    // structure DOM
    wrapper.appendChild(innerWrapper);
    innerWrapper.appendChild(fixedColContainer);
    containerNode.parentNode.replaceChild(wrapper, containerNode);
    wrapper.appendChild(containerNode);

    var fixedColGrid = new Slick.Grid(fixedColContainer, _origGrid.getData(), [], _origGrid.getOptions());
    var mainGrid = new Slick.Grid(containerNode, _origGrid.getData(), [], _origGrid.getOptions());

    [fixedColGrid, mainGrid].forEach(function (grid) {
      sharedHandlers.forEach(function (sharedHandler) {
        grid[sharedHandler.handlerName].subscribe(sharedHandler.handler);
      });
      sharedPlugins.forEach(function (plugin) {
        grid.registerPlugin(new plugin.constructor());
      });
      grid.init();
    });

    return { fixedColGrid: fixedColGrid, mainGrid: mainGrid };
  }

  /**
   * Set columns defination.
   * A args `columnDef` would be separated and applied to each grids (main and fixed-grid).
   * @param {Array.<Object>} columnsDef columns definations
   */
  function setColumns(columnsDef) {
    var fixedColumns = [],
        unfixedColumns = [],
        i = 0,
        partIndex = 0,
        len = columnsDef.length;

    for (; i < len; i++) {
      var col = columnsDef[i];
      if (col.id === fixedColId) {
        partIndex = i + 1;
        break;
      }
    }

    fixedColumns = columnsDef.slice(0, partIndex);
    unfixedColumns = columnsDef.slice(partIndex);

    // update each grid columns defination
    _fixedColGrid.setColumns(fixedColumns);
    applyFixedColGridWidth();
    _mainGrid.setColumns(unfixedColumns);
  }

  /**
   * Apply width of fixed-columns grid.
   */
  function applyFixedColGridWidth() {
    var fixedColGridWidth = 0,

    // headers = _fixedColContainerEl.querySelectorAll('.slick-header-column');
    headersSelector = _fixedColGrid.getColumns().map(function (c) {
      return '#slickgrid_' + _fixedColGridUid + c.id;
    }).join(','),
        headers = headersSelector ? _fixedColContainerEl.querySelectorAll(headersSelector) : [];

    for (var i = 0, len = headers.length; i < len; i++) {
      fixedColGridWidth += headers[i].offsetWidth;
    }

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
