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
  let _mainGrid,
      _mainContainerEl,
      _fixedColGrid,
      _fixedColContainerEl,
      _uid,
      _originalColumnsDef,
      _scrollbarDim;

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

    // sticky scroll between each grid
    var gridViewport = grid.getContainerNode().querySelector('.slick-viewport');
    var fixedColumnsGridViewport = _fixedColGrid.getContainerNode().querySelector('.slick-viewport');
    _mainGrid.onScroll.subscribe(function(e, args) {
      fixedColumnsGridViewport.scrollTop = args.scrollTop;
    });
    _fixedColGrid.onScroll.subscribe(function(e, args) {
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
    let containerNode = grid.getContainerNode(),
        wrapper = document.createElement('div'),
        innerWrapper = document.createElement('div'),
        fixedColContainer = document.createElement('div');

    // style
    innerWrapper.style.float = 'left';
    let computed = window.getComputedStyle(containerNode);
    fixedColContainer.style.border = computed['border'];
    fixedColContainer.style.height = computed['height'];
    fixedColContainer.style.background = computed['background'];

    // structure
    wrapper.appendChild(innerWrapper);
    innerWrapper.appendChild(fixedColContainer);
    containerNode.parentNode.replaceChild(wrapper, containerNode);
    wrapper.appendChild(containerNode);

    let originalColumns = grid.getColumns(),
        fixedColumns = [],
        unfixedColumns = [];

    let partIndex = 0;
    for (let len = originalColumns.length; partIndex < len; ++partIndex) {
      let col = originalColumns[partIndex];
      if (col.id === fixedColId) {
        partIndex++;
        break;
      }
    }
    fixedColumns = originalColumns.slice(0, partIndex);
    unfixedColumns = originalColumns.slice(partIndex);
    let fixedColGrid = new Slick.Grid(fixedColContainer, grid.getData(), fixedColumns, grid.getOptions());
    grid.setColumns(unfixedColumns);

    return {fixedColGrid: fixedColGrid, mainGrid: grid};
  }

  function setFixedColGridWidth() {
    let fixedColGridWidth = 0;
    let headers = _fixedColContainerEl.querySelectorAll('.slick-header-column');
    for (let i = 0, len = headers.length; i < len; i++) {
      fixedColGridWidth += headers[i].offsetWidth;
    }

    _scrollbarDim = _scrollbarDim || measureScrollbar();
    let innerWrapper = _fixedColContainerEl.parentNode;
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
    init
  });
}
