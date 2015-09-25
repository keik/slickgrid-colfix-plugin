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
      _scrollbarDim = measureScrollbar(),
      _handler = new Slick.EventHandler();

  let sharedHandlers = [],
      sharedPlugins = [];

  function init(grid) {
    console.log('[colfix] init');
    _origGrid = grid;

    // share same handlers with each internal grids
    // handlers would be cached in `sharedHandlers` and set after initialization.
    // TODO abstraction - ex Object.keys(grid).filter(function(a) { return a.match(/^on/); }.forEach...)
    _origGrid.onHeaderRowCellRendered.subscribe = (function(origFn) {
      return function(handler) {
        origFn.apply(_origGrid, arguments);
        sharedHandlers.push({type: 'onHeaderRowCellRendered', fn: handler});
      };
    }(_origGrid.onHeaderRowCellRendered.subscribe));

    // share same plugins with each internal grids
    _origGrid.registerPlugin = function(plugin) {
      sharedPlugins.push(plugin);
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
    console.log('[colfix] initInternal');
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

    // DEV
    global.mainGrid = _mainGrid;
    global.fixedColGrid = _fixedColGrid;

    setColumns();

    // no event fired when `autosizeColumns` called, so follow it by advicing below methods with column group resizing.
    ['invalidate', 'render', 'updateRowCount', 'invalidateRows'].forEach(function(fnName) {
      _origGrid[fnName] = function() {
        _fixedColGrid[fnName].apply(_fixedColGrid, arguments);
        _mainGrid[fnName].apply(_fixedColGrid, arguments);
      };
    });

    _handler
    // DEV unused snip
    // .subscribe(_mainGrid['onActiveCellChanged'], function(e, args) {
    //   _fixedColGrid['onActiveCellChanged'].notify(args, e, _fixedColGrid);
    // })
      .subscribe(_mainGrid.onClick, function(e, args) {
        _fixedColGrid.setActiveCell(args.row, 0);
        _fixedColGrid.getActiveCellNode().classList.remove('active');
      })
      .subscribe(_fixedColGrid.onClick, function(e, args) {
        _mainGrid.setActiveCell(args.row, 0);
        _mainGrid.getActiveCellNode().classList.remove('active');
      });

    // sticky scroll between each grid
    _mainGrid.onScroll.subscribe(function(e, args) {
      _fixedColViewportEl.scrollTop = args.scrollTop;
    });
    _fixedColGrid.onScroll.subscribe(function(e, args) {
      _mainViewportEl.scrollTop = args.scrollTop;
    });
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
    let containerNode = _origGrid.getContainerNode(),
        wrapper = document.createElement('div'),
        innerWrapper = document.createElement('div'),
        fixedColContainer = document.createElement('div');

    // style
    let computed = window.getComputedStyle(containerNode);
    wrapper.style.width = computed['width'];
    wrapper.id = containerNode.id;
    containerNode.id = '';
    containerNode.classList.remove(containerNode.className.match(/slickgrid_\d+/)[0]);
    innerWrapper.style.float = 'left';
    fixedColContainer.style.border = computed['border'];
    fixedColContainer.style.height = computed['height'];
    fixedColContainer.style.background = computed['background'];
    fixedColContainer.style.boxSizing = 'content-box'; // TODO fix conflicted style intelligently
    containerNode.style.width = null;

    // structure DOM
    wrapper.appendChild(innerWrapper);
    innerWrapper.appendChild(fixedColContainer);
    containerNode.parentNode.replaceChild(wrapper, containerNode);
    wrapper.appendChild(containerNode);

    let fixedColGrid = new Slick.Grid(fixedColContainer, _origGrid.getData(), [], _origGrid.getOptions());
    let mainGrid = new Slick.Grid(containerNode, _origGrid.getData(), [], _origGrid.getOptions());

    [fixedColGrid, mainGrid].forEach(function(grid) {
      sharedHandlers.forEach(function(handler) {
        grid[handler.type].subscribe(handler.fn);
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
  function setColumns() {
    let columnsDef = _origGrid.getColumns(),
        fixedColumns = [],
        unfixedColumns = [],
        partIndex = 0,
        len = columnsDef.length;

    for (; partIndex < len; partIndex++) {
      let col = columnsDef[partIndex];
      if (col.id === fixedColId) {
        partIndex++;
        break;
      }
    }

    fixedColumns = columnsDef.slice(0, partIndex);
    unfixedColumns = columnsDef.slice(partIndex);

    // update each grid columns defination
    _fixedColGrid.setColumns(fixedColumns);
    _mainGrid.setColumns(unfixedColumns);

    applyFixedColGridWidth();
  }

  /**
   * Apply width of fixed-columns grid.
   */
  function applyFixedColGridWidth() {
    let fixedColGridWidth = 0,
        // headers = _fixedColContainerEl.querySelectorAll('.slick-header-column');
        headers  = _fixedColContainerEl.querySelectorAll(_fixedColGrid.getColumns().map(function(c) {
          return '#slickgrid_' + _fixedColGridUid + c.id;
        }).join(','));

    for (let i = 0, len = headers.length; i < len; i++) {
      fixedColGridWidth += headers[i].offsetWidth;
    }

    let innerWrapper = _fixedColContainerEl.parentNode;
    innerWrapper.style.width = fixedColGridWidth + 'px';
    _fixedColContainerEl.style.width = fixedColGridWidth + _scrollbarDim.width + 'px';
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
