/**
 * https://github.com/keik/slickgrid-colfix-plugin
 * @version $VERSION
 * @author keik <k4t0.kei@gmail.com>
 * @license MIT
 */

// register namespace
$.extend(true, window, {
  Slick: {
    Plugins: {
      ColFix
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
  let _origGrid,
      _mainGrid,
      _mainContainerEl,
      _mainViewportEl,
      _mainGridUid,
      _fixedColGrid,
      _fixedColContainerEl,
      _fixedColViewportEl,
      _fixedColGridUid,
      _activeGrid,
      _partIndex,
      _wrapper,
      _innerWrapper,
      _scrollbarDim = measureScrollbar(),
      _containerBorderDim,
      _handler = new Slick.EventHandler(),
      _origEvents = {};

  let sharedHandlers = [],
      sharedPlugins = [];

  function init(grid) {
    _origGrid = grid;

    // share same handlers with each internal grids
    // if main grid were not initialize yet, handlers would be cached in `sharedHandlers` and set after initialization.
    // Object.keys(grid).filter(function(key) {
    //   return key.match(/^on/);
    // }).forEach(function(handlerName) {
    //   _origEvents[handlerName] = {subscribe: _origGrid[handlerName].subscribe};
    //   _origGrid[handlerName].subscribe = function(handler) {
    //     if (_mainGrid && _fixedColGrid) {
    //       _fixedColGrid[handlerName].subscribe(handler);
    //       _mainGrid[handlerName].subscribe(handler);
    //     } else {
    //       sharedHandlers.push({handlerName, handler});
    //     }
    //   };
    // });

    // Object.keys(grid).filter(function(key) {
    //   return key.match(/^on/);
    // }).forEach(function(handlerName) {
    //   _origGrid[handlerName].subscribe = (function(origFn) {
    //     _origEvents[handlerName] = {subscribe: origFn};
    //     return function(handler) {
    //       if (_mainGrid && _fixedColGrid) {
    //         _fixedColGrid[handlerName].subscribe(handler);
    //         _mainGrid[handlerName].subscribe(handler);
    //       } else {
    //         sharedHandlers.push({handlerName, handler});
    //       }
    //     }
    //   }(_origGrid[handlerName].subscribe));
    // });

    _origEvents['onActiveCellChanged'] = {subscribe: _origGrid['onActiveCellChanged'].subscribe};
    _origGrid.onActiveCellChanged.subscribe = function(handler) {
      console.log('su');
      if (_mainGrid && _fixedColGrid) {
        _fixedColGrid['onActiveCellChanged'].subscribe(handler);
        _mainGrid['onActiveCellChanged'].subscribe(handler);
      } else {
        sharedHandlers.push({'handlerName': 'onActiveCellChanged', handler: handler});
      }
    };

    // share same plugins with each internal grids
    // if main grid were not initialize yet, plugins would be cached in `sharedPlugins` and set after initialization.
    _origGrid.registerPlugin = function(plugin) {
      if (_mainGrid && _fixedColGrid) {
        _fixedColGrid.registerPlugin(plugin);
        _mainGrid.registerPlugin(plugin);
      } else {
        sharedPlugins.push(plugin);
      }
    };

    // depending on grid option `explicitInitialization`, change a timing of initialization.
    if (!_origGrid.getOptions()['explicitInitialization']) {
      initInternal(_origGrid);
    } else {
      _origGrid.init = (function(originalInit) {
        return function() {
          originalInit();
          initInternal(_origGrid);
        };
      }(_origGrid.init));
    }
  }

  function initInternal() {
    // separate grid internally
    let grids = separateGrid();
    _mainGrid = grids.mainGrid;
    _mainContainerEl = _mainGrid.getContainerNode();
    _mainViewportEl = _mainContainerEl.querySelector('.slick-viewport');
    _mainGridUid = _mainGrid.getContainerNode().className.match(/(?: |^)slickgrid_(\d+)(?!\w)/)[1];
    _fixedColGrid = grids.fixedColGrid;
    _fixedColContainerEl = _fixedColGrid.getContainerNode();
    _fixedColViewportEl = _fixedColContainerEl.querySelector('.slick-viewport');
    _fixedColGridUid = _fixedColGrid.getContainerNode().className.match(/(?: |^)slickgrid_(\d+)(?!\w)/)[1];
    _activeGrid = _mainGrid;

    // ---------------------
    // method overrides
    // ---------------------

    // no event fired when `autosizeColumns` called, so follow it by advicing below methods with column group resizing.
    ['invalidate', 'render', 'updateRowCount', 'invalidateRows'].forEach(function(fnName) {
      _origGrid[fnName] = function() {
        _fixedColGrid[fnName].apply(_fixedColGrid, arguments);
        _mainGrid[fnName].apply(_fixedColGrid, arguments);
      };
    });

    // _origGrid.destroy = function() {
    //   _fixedColGrid.destroy.apply(_fixedColGrid, arguments);
    //   _mainGrid.destroy.apply(_fixedColGrid, arguments);
    //
    //   // reproduce original DOM elements structure
    //   _mainContainerEl.style.width = _wrapper.style.width;
    //   _mainContainerEl.id = _wrapper.id;
    //   $(_wrapper).replaceWith(_mainContainerEl).remove();
    // }

    _origGrid.getCellFromEvent = function() {
      return _fixedColGrid.getCellFromEvent.apply(_fixedColGrid, arguments) ||
        _mainGrid.getCellFromEvent.apply(_fixedColGrid, arguments);
    };

    // _origGrid.getActiveCell = function() {
    //   let pos = _activeGrid.getActiveCell();
    //   if (_activeGrid === _mainGrid) {
    //     pos.cell += _partIndex;
    //   }
    //   return pos;
    // };

    // ['getActiveCellNode', 'getActiveCellPosition'].forEach(function(fnName) {
    //   _origGrid[fnName] = function() {
    //     return _activeGrid[fnName].apply(_activeGrid, arguments);
    //   }
    // });

    // _origGrid.setActiveCell = function(row, cell) {
    //   if (cell < _partIndex) {
    //     console.log(1);
    //     _activeGrid = _fixedColGrid;
    //     _fixedColGrid.setActiveCell(row, cell);
    //     _mainGrid.setActiveCell(row, 0);
    //     _mainGrid.getActiveCellNode().classList.remove('active');
    //   } else {
    //     console.log(2);
    //
    //     _activeGrid = _mainGrid;
    //     _fixedColGrid.setActiveCell(row, 0);
    //     _fixedColGrid.getActiveCellNode().classList.remove('active');
    //     _mainGrid.setActiveCell(row, cell - _partIndex);
    //   }
    // };

    // _origGrid.getCellNode = function(row, cell) {
    //   if (cell < _partIndex) {
    //     return _fixedColGrid.getCellNode(row, cell);
    //   }
    //   return _mainGrid.getCellNode(row, cell - _partIndex);
    // };
    //
    // _origGrid.getGridPosition = function() {
    //   let a = _fixedColGrid.getGridPosition(),
    //       b = _mainGrid.getGridPosition();
    //
    //   return {top: a.top, right: b.right, bottom: a.bottom, left: a.left, width: b.right - a.left, height: a.height, visible: a.visible};
    // };

    _origGrid.setColumns = setColumns;


    _origEvents.onActiveCellChanged.subscribe(function(e, args) {
      console.log('origEvents');
      let row = args.row,
          cell = args.cell;

      _mainGrid.onActiveCellChanged.unsubscribe(onActiveCellChanged);
      _mainGrid.setActiveCell(row, _activeGrid === _mainGrid ? cell - _partIndex : 0);
      _mainGrid.onActiveCellChanged.subscribe(onActiveCellChanged);
      _fixedColGrid.onActiveCellChanged.unsubscribe(onActiveCellChanged);
      _fixedColGrid.setActiveCell(row, _activeGrid === _fixedColGrid ? cell : 0);
      _fixedColGrid.onActiveCellChanged.subscribe(onActiveCellChanged);
      (_activeGrid === _mainGrid ? _fixedColGrid : _mainGrid).getActiveCellNode().classList.remove('active');
    });

    _handler
      .subscribe(_origGrid.onActiveCellChanged, function(e, args) {
        console.log('origGrid');
      })
      .subscribe(_mainGrid.onActiveCellChanged, onActiveCellChanged)
      .subscribe(_fixedColGrid.onActiveCellChanged, onActiveCellChanged);

    function onActiveCellChanged(e, args) {
      console.log(1);
      _activeGrid = args.grid;
      _origGrid.setActiveCell(args.row, _activeGrid === _mainGrid ? args.cell + _partIndex : args.cell);
    }

    // sticky scroll between each grid
    _mainGrid.onScroll.subscribe(function(e, args) {
      _fixedColViewportEl.scrollTop = args.scrollTop;
    });
    _fixedColGrid.onScroll.subscribe(function(e, args) {
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
    console.log('separate');
    /*
     * transform DOM structrure from:
     *
     *   <div/><!-- origContainerNode -->
     *
     * to:
     *
     *   <div><!--wrapper -->
     *    <div style="display: none"/><!-- origContainerNode -->
     *    <div><!-- innerWrapper -->
     *      <div/><!-- fixedColContainer -->
     *    </div>
     *    <div/><!-- mainContainerNode -->
     *    <div/><!-- clearfix -->
     *   </div>
     */
    let origContainerNode = _origGrid.getContainerNode(),
        mainContainerNode = document.createElement('div'),
        fixedColContainer = document.createElement('div'),
        clearfix = document.createElement('div');

    _wrapper = document.createElement('div'),
    _innerWrapper = document.createElement('div');

    // style
    let computed = window.getComputedStyle(origContainerNode);
    if (computed.boxSizing === 'border-box') {
      _containerBorderDim = {
        top:    parseInt(computed.borderTopWidth,    10),
        right:  parseInt(computed.borderRightWidth,  10),
        bottom: parseInt(computed.borderBottomWidth, 10),
        left:   parseInt(computed.borderLeftWidth,   10)
      };
    } else {
      _containerBorderDim = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      };
    }
    origContainerNode.style.display = 'none';
    origContainerNode.className = origContainerNode.className.replace(/slickgrid_\d+/, '');
    _wrapper.style.width = computed['width'];
    _wrapper.id = origContainerNode.id;
    origContainerNode.id = '';
    _innerWrapper.style.float = 'left';
    fixedColContainer.className += origContainerNode.className;
    mainContainerNode.className += origContainerNode.className;
    fixedColContainer.style.height = computed['height'];
    mainContainerNode.style.height = computed['height'];
    origContainerNode.style.width = null;
    // mainContainerNode.style.width = null;
    clearfix.style.clear = 'both';

    // structure DOM
    origContainerNode.parentNode.replaceChild(_wrapper, origContainerNode);
    _wrapper.appendChild(origContainerNode);
    _wrapper.appendChild(_innerWrapper);
    _innerWrapper.appendChild(fixedColContainer);
    _wrapper.appendChild(mainContainerNode);
    _wrapper.appendChild(clearfix);

    let fixedColGrid = new Slick.Grid(fixedColContainer, _origGrid.getData(), [], _origGrid.getOptions());
    // let mainGrid = new Slick.Grid(containerNode, _origGrid.getData(), [], _origGrid.getOptions());
    let mainGrid = new Slick.Grid(mainContainerNode, _origGrid.getData(), [], _origGrid.getOptions());

    console.log('share');
    [fixedColGrid, mainGrid].forEach(function(grid) {
      sharedHandlers.forEach(function(sharedHandler) {
        grid[sharedHandler.handlerName].subscribe(sharedHandler.handler);
      });
      sharedPlugins.forEach(function(plugin) {
        grid.registerPlugin(plugin);
      });
      grid.init();
    });

    return {fixedColGrid: fixedColGrid, mainGrid: mainGrid};
  }

  /**
   * Set columns defination.
   * A args `columnDef` would be separated and applied to each grids (main and fixed-grid).
   * @param {Array.<Object>} columnsDef columns definations
   */
  function setColumns(columnsDef) {
    let fixedColumns = [],
        unfixedColumns = [],
        i = 0,
        len = columnsDef.length;

    _partIndex = 0;

    for (; i < len; i++) {
      let col = columnsDef[i];
      if (col.id === fixedColId) {
        _partIndex = i + 1;
        break;
      }
    }

    fixedColumns = columnsDef.slice(0, _partIndex);
    unfixedColumns = columnsDef.slice(_partIndex);

    // update each grid columns defination
    _fixedColGrid.setColumns(fixedColumns);
    applyFixedColGridWidth();
    _mainGrid.setColumns(unfixedColumns);
  }

  /**
   * Apply width of fixed-columns grid.
   */
  function applyFixedColGridWidth() {
    let fixedColGridWidth = 0,
        // headers = _fixedColContainerEl.querySelectorAll('.slick-header-column');
        headersSelector = _fixedColGrid.getColumns().map(function(c) {
          return '#slickgrid_' + _fixedColGridUid + c.id;
        }).join(','),
        headers  = headersSelector ? _fixedColContainerEl.querySelectorAll(headersSelector) : [];

    for (let i = 0, len = headers.length; i < len; i++) {
      fixedColGridWidth += headers[i].offsetWidth;
    }

    let innerWrapper = _fixedColContainerEl.parentNode;
    innerWrapper.style.width = fixedColGridWidth + 'px';
    _fixedColContainerEl.style.width = fixedColGridWidth + _scrollbarDim.width + _containerBorderDim.left + _containerBorderDim.right + 'px';
  }

  /**
   * Measure scroll bar width and height. (Copied from original slick.grid.js)
   * @return {Object.<number, number>} width and height;
   */
  function measureScrollbar() {
    let $c = $('<div style="position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;"></div>').appendTo('body');
    let dim = {
      width: $c.width() - $c[0].clientWidth,
      height: $c.height() - $c[0].clientHeight
    };
    $c.remove();
    return dim;
  }

  $.extend(this, {
    init
  });
}
